import { createHash, createHmac, randomBytes } from "node:crypto"
import { createReadStream, createWriteStream } from "node:fs"
import { mkdir, rm, stat } from "node:fs/promises"
import path from "node:path"
import { pipeline } from "node:stream/promises"
import { Readable } from "node:stream"

export const STORAGE_KEY_PATTERN = /^[a-f0-9]{64}$/

export type ArtifactPutMeta = {
  mimeType: string
  byteSize: number
}

export type ArtifactObject = {
  bytes: Buffer
  mimeType?: string
}

export interface ArtifactStorage {
  readonly provider: string
  put(key: string, bytes: Buffer, meta: ArtifactPutMeta): Promise<void>
  get(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
}

export class StorageError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = "StorageError"
    this.status = status
  }
}

export function newOpaqueStorageKey(): string {
  return randomBytes(32).toString("hex")
}

function assertKey(key: string) {
  if (!STORAGE_KEY_PATTERN.test(key)) {
    throw new StorageError("Invalid storage key", 400)
  }
}

function localRoot(): string {
  const configured = process.env.ARTIFACT_STORAGE_ROOT?.trim()
  return path.resolve(configured && configured.length > 0 ? configured : "storage/lms-artifacts")
}

function localObjectPath(root: string, key: string): string {
  assertKey(key)
  const full = path.resolve(root, key.slice(0, 2), key.slice(2, 4), key)
  const relative = path.relative(root, full)
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new StorageError("Invalid storage key", 400)
  }
  return full
}

export class LocalArtifactStorage implements ArtifactStorage {
  readonly provider = "local"

  async put(key: string, bytes: Buffer, _meta: ArtifactPutMeta): Promise<void> {
    const root = localRoot()
    const full = localObjectPath(root, key)
    await mkdir(path.dirname(full), { recursive: true })
    await pipeline(Readable.from(bytes), createWriteStream(full, { flags: "wx" }))
  }

  async get(key: string): Promise<Buffer> {
    const full = localObjectPath(localRoot(), key)
    try {
      await stat(full)
    } catch {
      throw new StorageError("Artifact not found", 404)
    }
    const chunks: Buffer[] = []
    const stream = createReadStream(full)
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    return Buffer.concat(chunks)
  }

  async delete(key: string): Promise<void> {
    const full = localObjectPath(localRoot(), key)
    await rm(full, { force: true })
  }
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest()
}

function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex")
}

function amzDate(now = new Date()): { amz: string; date: string } {
  const iso = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")
  return { amz: iso, date: iso.slice(0, 8) }
}

export class S3ArtifactStorage implements ArtifactStorage {
  readonly provider = "s3"
  private readonly bucket: string
  private readonly region: string
  private readonly endpoint: string
  private readonly accessKey: string
  private readonly secretKey: string
  private readonly prefix: string

  constructor() {
    const bucket = process.env.ARTIFACT_S3_BUCKET?.trim()
    const accessKey = process.env.AWS_ACCESS_KEY_ID?.trim() ?? process.env.ARTIFACT_S3_ACCESS_KEY?.trim()
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? process.env.ARTIFACT_S3_SECRET_KEY?.trim()
    if (!bucket || !accessKey || !secretKey) {
      throw new Error(
        "ARTIFACT_STORAGE_PROVIDER=s3 requires ARTIFACT_S3_BUCKET and AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY",
      )
    }
    this.bucket = bucket
    this.region = process.env.ARTIFACT_S3_REGION?.trim() || "auto"
    this.endpoint = (process.env.ARTIFACT_S3_ENDPOINT?.trim() || `https://s3.${this.region}.amazonaws.com`).replace(
      /\/$/,
      "",
    )
    this.accessKey = accessKey
    this.secretKey = secretKey
    this.prefix = (process.env.ARTIFACT_S3_PREFIX?.trim() || "lms-artifacts").replace(/^\/+|\/+$/g, "")
  }

  private objectPath(key: string): string {
    assertKey(key)
    return `${this.prefix}/${key}`
  }

  private async signedFetch(method: "PUT" | "GET" | "DELETE", key: string, body?: Buffer, mimeType?: string) {
    const objectPath = this.objectPath(key)
    const url = new URL(`${this.endpoint}/${this.bucket}/${objectPath}`)
    const { amz, date } = amzDate()
    const payloadHash = sha256Hex(body ?? Buffer.alloc(0))
    const headers: Record<string, string> = {
      host: url.host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amz,
    }
    if (mimeType && method === "PUT") headers["content-type"] = mimeType
    if (body) headers["content-length"] = String(body.length)

    const signedHeaderNames = Object.keys(headers).sort()
    const canonicalHeaders = signedHeaderNames.map((name) => `${name}:${headers[name]}\n`).join("")
    const signedHeaders = signedHeaderNames.join(";")
    const canonicalRequest = [
      method,
      url.pathname,
      url.searchParams.toString(),
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n")

    const scope = `${date}/${this.region}/s3/aws4_request`
    const stringToSign = ["AWS4-HMAC-SHA256", amz, scope, sha256Hex(canonicalRequest)].join("\n")
    const kDate = hmac(`AWS4${this.secretKey}`, date)
    const kRegion = hmac(kDate, this.region)
    const kService = hmac(kRegion, "s3")
    const kSigning = hmac(kService, "aws4_request")
    const signature = createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex")
    headers.authorization = `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    const response = await fetch(url, { method, headers, body: body && method === "PUT" ? new Uint8Array(body) : undefined })
    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      throw new StorageError(`Object storage ${method} failed (${response.status}) ${detail.slice(0, 180)}`, 502)
    }
    return response
  }

  async put(key: string, bytes: Buffer, meta: ArtifactPutMeta): Promise<void> {
    await this.signedFetch("PUT", key, bytes, meta.mimeType)
  }

  async get(key: string): Promise<Buffer> {
    const response = await this.signedFetch("GET", key)
    const buffer = Buffer.from(await response.arrayBuffer())
    return buffer
  }

  async delete(key: string): Promise<void> {
    try {
      await this.signedFetch("DELETE", key)
    } catch (error) {
      if (error instanceof StorageError && error.status === 502) return
      throw error
    }
  }
}

let cached: ArtifactStorage | null = null

export function getArtifactStorage(): ArtifactStorage {
  if (cached) return cached
  const provider = (process.env.ARTIFACT_STORAGE_PROVIDER ?? "local").trim().toLowerCase()
  if (provider === "s3") cached = new S3ArtifactStorage()
  else if (provider === "local" || provider === "") cached = new LocalArtifactStorage()
  else throw new Error(`Unknown ARTIFACT_STORAGE_PROVIDER "${provider}". Use local or s3.`)
  return cached
}

export function resetArtifactStorageForTests() {
  cached = null
}
