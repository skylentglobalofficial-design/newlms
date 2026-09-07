import crypto from "node:crypto"

const PENDING_STORAGE_PROVIDER = "pending"

export type AssignmentAttachmentStorageStatus = "pending" | "ready" | "failed"

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

export function resolveAttachmentStorageStatus(storageProvider: string): AssignmentAttachmentStorageStatus {
  if (storageProvider === PENDING_STORAGE_PROVIDER) return "pending"
  if (storageProvider === "failed") return "failed"
  return "ready"
}

/** Assignment attachment binary storage remains pending R2 integration. */
export function formatAttachmentForApi(file: {
  id: string
  fileName: string
  mimeType: string
  byteSize: number
  storageProvider: string
}) {
  const storageStatus = resolveAttachmentStorageStatus(file.storageProvider)
  const downloadAvailable = storageStatus === "ready" && file.storageProvider !== PENDING_STORAGE_PROVIDER

  return {
    id: file.id,
    fileName: file.fileName,
    mimeType: file.mimeType,
    byteSize: file.byteSize,
    storageStatus,
    downloadAvailable,
    downloadUrl: null as string | null,
  }
}
