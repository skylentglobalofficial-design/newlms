import { z } from "zod"
import { validateFile } from "./storage.js"

export const MAX_UPLOAD_BYTES = 32 * 1024 * 1024

export const uploadBodySchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.string().trim().min(1).max(120),
  dataBase64: z.string().min(1).max(45_000_000),
})

export function decodeUpload(input: z.infer<typeof uploadBodySchema>, allowed: string[]) {
  if (/[/\\]|\.\./.test(input.fileName) || input.fileName.includes(":")) {
    return { error: "File name must not be a path" as const }
  }
  const data = Buffer.from(input.dataBase64, "base64")
  if (data.length === 0 || data.length > MAX_UPLOAD_BYTES) {
    return { error: "File must be between 1 byte and 32 MB" as const }
  }
  const checked = validateFile(
    { size: data.length, mimeType: input.contentType, fileName: input.fileName },
    { maxSize: MAX_UPLOAD_BYTES, allowedTypes: allowed },
  )
  if (!checked.valid) return { error: checked.error ?? "File was rejected" }
  return { data }
}

export const LESSON_MATERIAL_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/zip",
  "application/x-zip-compressed",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
  "audio/mpeg",
  "audio/wav",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/octet-stream",
]
