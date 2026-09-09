import { ensureCsrfToken } from "./auth-api"

const API_BASE = "/api/v1"

export type AssignmentAttachmentUploadStatus = "PENDING" | "READY" | "FAILED"
export type AssignmentAttachmentStorageStatus = "pending" | "ready" | "failed"

export type AssignmentAttachment = {
  id: string
  fileName: string
  mimeType: string
  byteSize: number
  uploadStatus?: AssignmentAttachmentUploadStatus
  storageStatus: AssignmentAttachmentStorageStatus
  downloadAvailable: boolean
  downloadUrl?: string | null
  createdAt?: string
}

type ApiError = { error: string; code?: string }

const MIME_BY_EXTENSION: Record<string, string> = {
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

export function resolveAttachmentMimeType(file: File): string {
  const declared = file.type.trim().toLowerCase()
  if (declared && declared !== "application/octet-stream") return declared

  const extension = file.name.trim().toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]
  return extension ? (MIME_BY_EXTENSION[extension] ?? declared) : declared
}

function storageUploadErrorMessage(status: number): string {
  if (status === 403) {
    return "Storage upload blocked. Check R2 bucket CORS allows PUT from this app origin."
  }
  if (status === 400 || status === 412) {
    return "Storage rejected the upload. Content-Type and file size must match the declared metadata."
  }
  return `Storage upload failed (${status})`
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | ApiError
  if (!response.ok) {
    const message = typeof data === "object" && data && "error" in data
      ? String((data as ApiError).error)
      : "Request failed"
    throw new Error(message)
  }
  return data as T
}

export async function fetchAssignmentAttachments(
  courseSlug: string,
  lessonKey: string,
): Promise<AssignmentAttachment[]> {
  const response = await fetch(
    `${API_BASE}/lms/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonKey)}/assignment`,
    { credentials: "include" },
  )
  const result = await parseJson<{ data: { attachments: AssignmentAttachment[] } }>(response)
  return result.data.attachments
}

export async function completeAssignmentAttachmentUpload(input: {
  courseSlug: string
  lessonKey: string
  attachmentId: string
}): Promise<AssignmentAttachment> {
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/lms/courses/${encodeURIComponent(input.courseSlug)}/lessons/${encodeURIComponent(input.lessonKey)}/assignment/attachments/${input.attachmentId}/complete-upload`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token,
      },
      body: JSON.stringify({}),
    },
  )
  const result = await parseJson<{ data: AssignmentAttachment }>(response)
  return result.data
}

export async function requestAssignmentAttachmentUpload(input: {
  courseSlug: string
  lessonKey: string
  file: File
  onPhaseChange?: (phase: "creating" | "uploading" | "verifying") => void
}): Promise<AssignmentAttachment> {
  const mimeType = resolveAttachmentMimeType(input.file)
  if (!mimeType) {
    throw new Error("Unsupported file type. Use PDF, Office documents, CSV, or ZIP.")
  }

  input.onPhaseChange?.("creating")
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/lms/courses/${encodeURIComponent(input.courseSlug)}/lessons/${encodeURIComponent(input.lessonKey)}/assignment/attachments`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token,
      },
      body: JSON.stringify({
        fileName: input.file.name,
        mimeType,
        byteSize: input.file.size,
      }),
    },
  )

  const result = await parseJson<{
    data: {
      attachment: AssignmentAttachment
      uploadUrl: string
      uploadMethod: "PUT"
      uploadHeaders: Record<string, string>
    }
  }>(response)

  input.onPhaseChange?.("uploading")
  const uploadResponse = await fetch(result.data.uploadUrl, {
    method: result.data.uploadMethod,
    headers: result.data.uploadHeaders,
    body: input.file,
  })
  if (!uploadResponse.ok) {
    throw new Error(storageUploadErrorMessage(uploadResponse.status))
  }

  input.onPhaseChange?.("verifying")
  const completed = await completeAssignmentAttachmentUpload({
    courseSlug: input.courseSlug,
    lessonKey: input.lessonKey,
    attachmentId: result.data.attachment.id,
  })

  return {
    ...result.data.attachment,
    ...completed,
    storageStatus: "ready",
    downloadAvailable: false,
    downloadUrl: null,
  }
}

export async function downloadAssignmentAttachment(attachment: AssignmentAttachment): Promise<void> {
  if (!attachment.downloadUrl) {
    throw new Error("Download is not available for this attachment")
  }

  const response = await fetch(attachment.downloadUrl)
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = objectUrl
  link.download = attachment.fileName
  link.rel = "noopener"
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}
