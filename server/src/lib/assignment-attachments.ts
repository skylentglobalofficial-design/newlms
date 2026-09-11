import crypto from "node:crypto"
import { PENDING_STORAGE_PROVIDER, LOCAL_STORAGE_PROVIDER } from "./artifact-storage.js"

export { PENDING_STORAGE_PROVIDER, LOCAL_STORAGE_PROVIDER }

export function sanitizeAttachmentFileName(fileName: string): string {
  const trimmed = fileName.trim()
  const sanitized = trimmed.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200)
  return sanitized || "attachment"
}

/** Metadata-only placeholder for non-project assignment nodes (legacy path). */
export function buildPendingAttachmentRecord(
  assignmentProgressId: string,
  file: { fileName: string; mimeType: string; byteSize: number },
) {
  const safeName = sanitizeAttachmentFileName(file.fileName)
  const token = crypto.randomUUID()

  return {
    fileName: safeName,
    mimeType: file.mimeType,
    byteSize: file.byteSize,
    storageProvider: PENDING_STORAGE_PROVIDER,
    storageKey: `${PENDING_STORAGE_PROVIDER}/${assignmentProgressId}/${token}/${safeName}`,
  }
}

export function formatAttachmentApiRecord(
  file: {
    id: string
    fileName: string
    mimeType: string
    byteSize: number
    storageProvider: string
  },
  options?: {
    slug?: string
    lessonKey?: string
  },
) {
  const stored = file.storageProvider === LOCAL_STORAGE_PROVIDER
  return {
    id: file.id,
    fileName: file.fileName,
    mimeType: file.mimeType,
    byteSize: file.byteSize,
    storageProvider: file.storageProvider,
    stored,
    downloadPath:
      stored && options?.slug && options?.lessonKey
        ? `/api/v1/lms/courses/${encodeURIComponent(options.slug)}/lessons/${encodeURIComponent(options.lessonKey)}/assignment/attachments/${encodeURIComponent(file.id)}`
        : null,
  }
}
