import crypto from "node:crypto"
import type { LessonMaterialUploadStatus } from "@prisma/client"
import {
  OBJECT_STORAGE_PROVIDER,
  MAX_MATERIAL_BYTE_SIZE,
  createPresignedDownloadUrl,
  createPresignedUploadUrl,
  isObjectStorageConfigured,
  objectExists,
} from "./object-storage.js"

export const MAX_ASSIGNMENT_ATTACHMENTS = 5

export type AssignmentAttachmentStorageStatus = "pending" | "ready" | "failed"

const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "application/zip",
])

const MIME_EXTENSION: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-excel": ".xls",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "text/csv": ".csv",
  "application/zip": ".zip",
}

export function sanitizeAttachmentFileName(fileName: string): string {
  const trimmed = fileName.trim()
  const sanitized = trimmed.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200)
  return sanitized || "attachment"
}

export function validateAttachmentMimeType(mimeType: string): boolean {
  return ALLOWED_ATTACHMENT_MIME_TYPES.has(mimeType.trim().toLowerCase())
}

export function validateAttachmentByteSize(byteSize: number): boolean {
  return Number.isInteger(byteSize) && byteSize > 0 && byteSize <= MAX_MATERIAL_BYTE_SIZE
}

export function inferAttachmentMimeType(fileName: string, declaredMimeType: string): string | null {
  const normalized = declaredMimeType.trim().toLowerCase()
  if (validateAttachmentMimeType(normalized)) return normalized

  const extension = fileName.trim().toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]
  const byExtension: Record<string, string> = {
    pdf: "application/pdf",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    csv: "text/csv",
    zip: "application/zip",
  }
  const inferred = extension ? byExtension[extension] : undefined
  return inferred && validateAttachmentMimeType(inferred) ? inferred : null
}

export function buildAssignmentAttachmentStorageKey(input: {
  courseSlug: string
  assignmentProgressId: string
  attachmentId: string
  fileName: string
}): string {
  const safeName = sanitizeAttachmentFileName(input.fileName)
  const token = crypto.randomUUID()
  return `assignment-attachments/${input.courseSlug}/${input.assignmentProgressId}/${input.attachmentId}/${token}/${safeName}`
}

export function toPublicAttachmentUploadStatus(
  uploadStatus: LessonMaterialUploadStatus,
): AssignmentAttachmentStorageStatus {
  if (uploadStatus === "READY") return "ready"
  if (uploadStatus === "FAILED") return "failed"
  return "pending"
}

export async function resolveAttachmentDownloadUrl(attachment: {
  storageKey: string
  uploadStatus: LessonMaterialUploadStatus
}): Promise<string | null> {
  if (!isObjectStorageConfigured()) return null
  if (attachment.uploadStatus !== "READY") return null

  const exists = await objectExists(attachment.storageKey)
  if (!exists) return null

  return createPresignedDownloadUrl(attachment.storageKey)
}

export async function formatAttachmentForApi(file: {
  id: string
  fileName: string
  mimeType: string
  byteSize: number
  uploadStatus: LessonMaterialUploadStatus
  storageKey: string
}) {
  const storageStatus = toPublicAttachmentUploadStatus(file.uploadStatus)
  const downloadUrl = await resolveAttachmentDownloadUrl({
    storageKey: file.storageKey,
    uploadStatus: file.uploadStatus,
  })
  const downloadAvailable = downloadUrl !== null

  return {
    id: file.id,
    fileName: file.fileName,
    mimeType: file.mimeType,
    byteSize: file.byteSize,
    uploadStatus: file.uploadStatus,
    storageStatus,
    downloadAvailable,
    downloadUrl,
  }
}

export function toPublicAttachment(input: {
  id: string
  fileName: string
  mimeType: string
  byteSize: number
  uploadStatus: LessonMaterialUploadStatus
  createdAt: Date
}) {
  return {
    id: input.id,
    fileName: input.fileName,
    mimeType: input.mimeType,
    byteSize: input.byteSize,
    uploadStatus: input.uploadStatus,
    storageStatus: toPublicAttachmentUploadStatus(input.uploadStatus),
    createdAt: input.createdAt.toISOString(),
  }
}

export async function createAttachmentPresignedUpload(input: {
  storageKey: string
  mimeType: string
  byteSize: number
}): Promise<string> {
  return createPresignedUploadUrl(input)
}

export { OBJECT_STORAGE_PROVIDER }
