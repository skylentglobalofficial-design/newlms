import type { Request } from "express"

export type MultipartFile = {
  fieldName: string
  fileName: string
  mimeType: string
  bytes: Buffer
}

export class MultipartError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = "MultipartError"
    this.status = status
  }
}

function parseBoundary(contentType: string | undefined): string {
  if (!contentType) throw new MultipartError("Missing Content-Type")
  const match = /multipart\/form-data;\s*boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType)
  const boundary = match?.[1] ?? match?.[2]
  if (!boundary) throw new MultipartError("Expected multipart/form-data with boundary")
  return boundary
}

function headerValue(headers: string, name: string): string | undefined {
  const match = new RegExp(`^${name}:\\s*(.+)$`, "im").exec(headers)
  return match?.[1]?.trim()
}

function dispositionParam(disposition: string | undefined, name: string): string | undefined {
  if (!disposition) return undefined
  const starred = new RegExp(`(?:^|;)\\s*${name}\\*=(?:UTF-8'')([^;]+)`, "i").exec(disposition)
  if (starred?.[1]) {
    try {
      return decodeURIComponent(starred[1].trim())
    } catch {
      return starred[1].trim()
    }
  }
  const plain = new RegExp(`(?:^|;)\\s*${name}="([^"]+)"`, "i").exec(disposition)
    ?? new RegExp(`(?:^|;)\\s*${name}=([^;]+)`, "i").exec(disposition)
  return plain?.[1]?.trim()
}

export async function readRequestBuffer(req: Request, maxBytes: number): Promise<Buffer> {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buffer.length
    if (total > maxBytes) {
      throw new MultipartError("File too large", 413)
    }
    chunks.push(buffer)
  }
  return Buffer.concat(chunks, total)
}

export async function readMultipartFile(
  req: Request,
  options: { maxBytes: number; fieldName?: string },
): Promise<{ file: MultipartFile; fields: Record<string, string> }> {
  const boundary = parseBoundary(req.headers["content-type"])
  const overhead = 16 * 1024
  const raw = await readRequestBuffer(req, options.maxBytes + overhead)
  const delimiter = Buffer.from(`--${boundary}`)
  const fields: Record<string, string> = {}
  let file: MultipartFile | null = null

  let cursor = 0
  while (cursor < raw.length) {
    const start = raw.indexOf(delimiter, cursor)
    if (start === -1) break
    cursor = start + delimiter.length
    if (raw[cursor] === 0x2d && raw[cursor + 1] === 0x2d) break
    if (raw[cursor] === 0x0d) cursor += 1
    if (raw[cursor] === 0x0a) cursor += 1

    const headerEnd = raw.indexOf("\r\n\r\n", cursor)
    if (headerEnd === -1) break
    const headers = raw.subarray(cursor, headerEnd).toString("utf8")
    const bodyStart = headerEnd + 4
    const next = raw.indexOf(delimiter, bodyStart)
    if (next === -1) break
    let bodyEnd = next
    if (raw[bodyEnd - 2] === 0x0d && raw[bodyEnd - 1] === 0x0a) bodyEnd -= 2
    const body = raw.subarray(bodyStart, bodyEnd)

    const disposition = headerValue(headers, "Content-Disposition")
    const fieldName = dispositionParam(disposition, "name") ?? "file"
    const fileName = dispositionParam(disposition, "filename")
    if (fileName) {
      if (options.fieldName && fieldName !== options.fieldName) {
        cursor = next
        continue
      }
      if (file) throw new MultipartError("Only one file may be uploaded at a time")
      if (body.length > options.maxBytes) throw new MultipartError("File too large", 413)
      file = {
        fieldName,
        fileName,
        mimeType: headerValue(headers, "Content-Type") ?? "application/octet-stream",
        bytes: Buffer.from(body),
      }
    } else if (body.length < 16_384) {
      fields[fieldName] = body.toString("utf8")
    }
    cursor = next
  }

  if (!file) throw new MultipartError("A file is required")
  return { file, fields }
}
