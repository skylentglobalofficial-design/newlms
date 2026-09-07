import { ensureCsrfToken } from "./auth-api"

const API_BASE = "/api/v1"

export type LessonMaterial = {
  id: string
  fileName: string
  mimeType: string
  byteSize: number
  published: boolean
  createdAt: string
  updatedAt: string
  downloadUrl?: string | null
}

type ApiError = { error: string }

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

export async function requestLessonMaterialUpload(input: {
  courseSlug: string
  lessonKey: string
  file: File
}): Promise<LessonMaterial> {
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
        mimeType: input.file.type,
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

  const uploadResponse = await fetch(result.data.uploadUrl, {
    method: result.data.uploadMethod,
    headers: result.data.uploadHeaders,
    body: input.file,
  })
  if (!uploadResponse.ok) {
    throw new Error("Material upload to storage failed")
  }

  return result.data.material
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
