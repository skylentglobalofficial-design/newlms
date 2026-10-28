import { z } from "zod"
import { validateFile } from "./storage.js"

export const uploadBodySchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.string().trim().min(1).max(120),
  dataBase64: z.string().min(1).max(700_000),
})

export function decodeUpload(input: z.infer<typeof uploadBodySchema>, allowed: string[]) {
  if (/[/\\]|\.\./.test(input.fileName) || input.fileName.includes(":")) {
    return { error: "File name must not be a path" as const }
  }
  const data = Buffer.from(input.dataBase64, "base64")
  if (data.length === 0 || data.length > 350_000) {
    return { error: "File must be between 1 byte and 350 KB" as const }
  }
  const checked = validateFile(
    { size: data.length, mimeType: input.contentType, fileName: input.fileName },
    { maxSize: 350_000, allowedTypes: allowed },
  )
  if (!checked.valid) return { error: checked.error ?? "File was rejected" }
  return { data }
}

export const LESSON_MATERIAL_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
]
