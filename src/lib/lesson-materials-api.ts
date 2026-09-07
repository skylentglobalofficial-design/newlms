import { ensureCsrfToken } from "./auth-api"

const API_BASE = "/api/v1"

export type LessonMaterialUploadStatus = "PENDING" | "READY" | "FAILED"

export type LessonMaterial = {
  id: string
  fileName: string
  mimeType: string
  byteSize: number
  uploadStatus: LessonMaterialUploadStatus
  published: boolean
  createdAt: string
  updatedAt: string
  downloadUrl?: string | null
}

type ApiError = { error: string; code?: string }

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}

export function resolveMaterialMimeType(file: File): string {
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

export async function fetchLessonMaterials(courseSlug: string, lessonKey: string): Promise<LessonMaterial[]> {
  const response = await fetch(
    `${API_BASE}/lms/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonKey)}/materials`,
    { credentials: "include" },
  )
  const result = await parseJson<{ data: LessonMaterial[] }>(response)
  return result.data
}

export async function fetchFacultyLessonMaterials(courseSlug: string, lessonKey: string): Promise<LessonMaterial[]> {
  const response = await fetch(
    `${API_BASE}/faculty/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonKey)}/materials`,
    { credentials: "include" },
  )
  const result = await parseJson<{ data: LessonMaterial[] }>(response)
  return result.data
}

export async function completeLessonMaterialUpload(input: {
  courseSlug: string
  lessonKey: string
  materialId: string
}): Promise<LessonMaterial> {
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/faculty/courses/${encodeURIComponent(input.courseSlug)}/lessons/${encodeURIComponent(input.lessonKey)}/materials/${input.materialId}/complete-upload`,
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
  const result = await parseJson<{ data: LessonMaterial }>(response)
  return result.data
}

export async function requestLessonMaterialUpload(input: {
  courseSlug: string
  lessonKey: string
  file: File
  onPhaseChange?: (phase: "creating" | "uploading" | "verifying") => void
}): Promise<LessonMaterial> {
  const mimeType = resolveMaterialMimeType(input.file)
  if (!mimeType) {
    throw new Error("Unsupported file type. Use PDF, PPT, or PPTX.")
  }

  input.onPhaseChange?.("creating")
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/faculty/courses/${encodeURIComponent(input.courseSlug)}/lessons/${encodeURIComponent(input.lessonKey)}/materials`,
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
      material: LessonMaterial
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
  return completeLessonMaterialUpload({
    courseSlug: input.courseSlug,
    lessonKey: input.lessonKey,
    materialId: result.data.material.id,
  })
}

export async function downloadLessonMaterial(material: LessonMaterial): Promise<void> {
  if (!material.downloadUrl) {
    throw new Error("Download is not available for this material")
  }

  const response = await fetch(material.downloadUrl)
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = objectUrl
  link.download = material.fileName
  link.rel = "noopener"
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

export async function publishLessonMaterial(input: {
  courseSlug: string
  lessonKey: string
  materialId: string
}): Promise<LessonMaterial> {
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/faculty/courses/${encodeURIComponent(input.courseSlug)}/lessons/${encodeURIComponent(input.lessonKey)}/materials/${input.materialId}/publish`,
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
  const result = await parseJson<{ data: LessonMaterial }>(response)
  return result.data
}

export async function createLessonMaterialUpload(input: {
  courseSlug: string
  lessonKey: string
  file: File
}): Promise<LessonMaterial> {
  const material = await requestLessonMaterialUpload(input)
  return publishLessonMaterial({
    courseSlug: input.courseSlug,
    lessonKey: input.lessonKey,
    materialId: material.id,
  })
}
