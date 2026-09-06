import crypto from "node:crypto"

const PENDING_STORAGE_PROVIDER = "pending"

export function sanitizeAttachmentFileName(fileName: string): string {
  const trimmed = fileName.trim()
  const sanitized = trimmed.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200)
  return sanitized || "attachment"
}

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
