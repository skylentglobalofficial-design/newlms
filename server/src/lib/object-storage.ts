import crypto from "node:crypto"
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type { LessonMaterialUploadStatus } from "@prisma/client"

export const OBJECT_STORAGE_PROVIDER = "r2"
export const MAX_MATERIAL_BYTE_SIZE = 50_000_000
export const UPLOAD_URL_TTL_SECONDS = 900
export const DOWNLOAD_URL_TTL_SECONDS = 300

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
])

const MIME_EXTENSION: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
}

type ObjectStorageConfig = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  endpoint: string
}

let cachedClient: S3Client | null = null
let cachedConfig: ObjectStorageConfig | null = null

function readEnv(name: string): string | undefined {
  const value = process.env[name]
  if (value == null) return undefined
  const normalized = value.replace(/\uFEFF/g, "").replace(/\r/g, "").trim()
  return normalized || undefined
}

export function isObjectStorageConfigured(): boolean {
  return getObjectStorageConfig() !== null
}

export function getObjectStorageConfig(): ObjectStorageConfig | null {
  if (cachedConfig) return cachedConfig

  const accountId = readEnv("R2_ACCOUNT_ID")
  const accessKeyId = readEnv("R2_ACCESS_KEY_ID")
  const secretAccessKey = readEnv("R2_SECRET_ACCESS_KEY")
  const bucketName = readEnv("R2_BUCKET_NAME")
  const endpoint = readEnv("R2_ENDPOINT") ?? (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined)

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
    return null
  }

  cachedConfig = { accountId, accessKeyId, secretAccessKey, bucketName, endpoint }
  return cachedConfig
}

function getClient(): S3Client {
  const config = getObjectStorageConfig()
  if (!config) {
    throw new Error("Object storage is not configured")
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }
  return cachedClient
}

function isObjectNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const record = error as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number } }
  const status = record.$metadata?.httpStatusCode
  return (
    record.name === "NotFound" ||
    record.Code === "NotFound" ||
    record.Code === "NoSuchKey" ||
    status === 404
  )
}

export async function objectExists(storageKey: string): Promise<boolean> {
  const config = getObjectStorageConfig()
  if (!config) return false

  try {
    await getClient().send(
      new HeadObjectCommand({
        Bucket: config.bucketName,
        Key: storageKey,
      }),
    )
    return true
  } catch (error) {
    if (isObjectNotFoundError(error)) return false
    throw error
  }
}

export function sanitizeMaterialFileName(fileName: string): string {
  const trimmed = fileName.trim()
  const sanitized = trimmed.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200)
  return sanitized || "material"
}

export function validateMaterialMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType.trim().toLowerCase())
}

export function validateMaterialByteSize(byteSize: number): boolean {
  return Number.isInteger(byteSize) && byteSize > 0 && byteSize <= MAX_MATERIAL_BYTE_SIZE
}

export function extensionForMimeType(mimeType: string): string | null {
  return MIME_EXTENSION[mimeType.trim().toLowerCase()] ?? null
}

export function buildLessonMaterialStorageKey(input: {
  courseSlug: string
  nodeId: string
  materialId: string
  fileName: string
}): string {
  const safeName = sanitizeMaterialFileName(input.fileName)
  const token = crypto.randomUUID()
  return `lesson-materials/${input.courseSlug}/${input.nodeId}/${input.materialId}/${token}/${safeName}`
}

export async function createPresignedUploadUrl(input: {
  storageKey: string
  mimeType: string
  byteSize: number
}): Promise<string> {
  const config = getObjectStorageConfig()
  if (!config) throw new Error("Object storage is not configured")

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: input.storageKey,
    ContentType: input.mimeType,
    ContentLength: input.byteSize,
  })

  return getSignedUrl(getClient(), command, { expiresIn: UPLOAD_URL_TTL_SECONDS })
}

export async function createPresignedDownloadUrl(storageKey: string): Promise<string> {
  const config = getObjectStorageConfig()
  if (!config) throw new Error("Object storage is not configured")

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: storageKey,
  })

  return getSignedUrl(getClient(), command, { expiresIn: DOWNLOAD_URL_TTL_SECONDS })
}

export async function resolveMaterialDownloadUrl(material: {
  storageKey: string
  uploadStatus: LessonMaterialUploadStatus
  published?: boolean
  requirePublished?: boolean
}): Promise<string | null> {
  if (!isObjectStorageConfigured()) return null
  if (material.uploadStatus !== "READY") return null
  if (material.requirePublished && !material.published) return null

  const exists = await objectExists(material.storageKey)
  if (!exists) return null

  return createPresignedDownloadUrl(material.storageKey)
}

export function toPublicMaterial(input: {
  id: string
  fileName: string
  mimeType: string
  byteSize: number
  uploadStatus: LessonMaterialUploadStatus
  published: boolean
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: input.id,
    fileName: input.fileName,
    mimeType: input.mimeType,
    byteSize: input.byteSize,
    uploadStatus: input.uploadStatus,
    published: input.published,
    createdAt: input.createdAt.toISOString(),
    updatedAt: input.updatedAt.toISOString(),
  }
}
