import { ensureCsrfToken } from "./auth-api"
import { parseApiJson } from "./http"

import { apiV1 } from "./api-base"

const API_BASE = apiV1()

export type FacultySubmission = {
  id: string
  studentName: string
  studentEmail: string
  lessonTitle: string
  lessonKey: string
  courseSlug: string | null
  courseTitle: string | null
  programName: string | null
  submittedAt: string | null
  attachmentCount: number
  status?: string
  grade?: number | null
  gradedAt?: string | null
}

export type FacultySubmissionDetail = {
  id: string
  status: string
  responseText: string | null
  submittedAt: string | null
  grade: number | null
  feedback: string | null
  gradedAt: string | null
  student: { id: string; name: string; email: string }
  lesson: { id: string; title: string; key: string | null; moduleTitle: string }
  course: { slug: string; title: string } | null
  program: { slug: string; name: string } | null
  attachments: Array<{ id: string; fileName: string; mimeType: string; byteSize: number; storageProvider: string }>
}

export type FacultyCourseModule = {
  id: string
  position: number
  title: string
  lessonCount: number
  lectures: Array<{
    id: string
    position: number
    title: string
    nodeType: string
    summary?: string | null
    referenceUrl?: string | null
    materials?: Array<{ id: string; fileName: string; mimeType: string; byteSize: number }>
  }>
}

export type FacultyDashboard = {
  programs: Array<{
    slug: string
    name: string
    duration: string
    format: string
    programType: string
  }>
  courses: Array<{
    id?: string
    slug: string
    title: string
    moduleCount: number
    lessonCount: number
    modules?: FacultyCourseModule[]
  }>
  submissions: FacultySubmission[]
  pendingReviewCount: number
  curriculumSummary: Array<{ label: string; detail: string; status: string }>
  teachingScopeAvailable: boolean
  teachingScopeMessage?: string | null
  cohortAnalyticsAvailable: boolean
}

async function parseJson<T>(response: Response): Promise<T> {
  return parseApiJson<T>(response)
}

export async function fetchFacultyDashboard(): Promise<FacultyDashboard> {
  const response = await fetch(`${API_BASE}/faculty/dashboard`, { credentials: "include" })
  const result = await parseJson<{ data: FacultyDashboard }>(response)
  return result.data
}

export type FacultyDoubtItem = {
  id: string
  userId: string
  learnerName: string
  courseSlug: string
  lessonKey: string
  lessonTitle: string
  question: string
  status: "open" | "resolved"
  slaMinutes: number
  createdAt: string
  resolvedAt: string | null
  resolvedById: string | null
  resolutionNote: string | null
}

export async function fetchFacultyDoubts(): Promise<FacultyDoubtItem[]> {
  const response = await fetch(`${API_BASE}/faculty/doubts`, { credentials: "include" })
  const result = await parseJson<{ data: FacultyDoubtItem[] }>(response)
  return result.data ?? []
}

export async function resolveFacultyDoubt(id: string, resolutionNote?: string): Promise<FacultyDoubtItem> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/faculty/doubts/${encodeURIComponent(id)}/resolve`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
    body: JSON.stringify({ resolutionNote }),
  })
  const result = await parseJson<{ data: FacultyDoubtItem }>(response)
  return result.data
}

export async function fetchFacultySubmissionDetail(submissionId: string): Promise<FacultySubmissionDetail> {
  const response = await fetch(`${API_BASE}/faculty/submissions/${encodeURIComponent(submissionId)}`, {
    credentials: "include",
  })
  const result = await parseJson<{ data: FacultySubmissionDetail }>(response)
  return result.data
}

export async function gradeFacultySubmission(
  submissionId: string,
  input: { grade: number; feedback?: string },
): Promise<{ id: string; status: string; grade: number | null; feedback: string | null; gradedAt: string | null }> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/faculty/submissions/${encodeURIComponent(submissionId)}/grade`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
    body: JSON.stringify(input),
  })
  const result = await parseJson<{
    data: { id: string; status: string; grade: number | null; feedback: string | null; gradedAt: string | null }
  }>(response)
  return result.data
}

export async function createFacultyLecture(
  courseId: string,
  input: { moduleId: string; title: string; summary?: string; referenceUrl?: string; nodeType?: "NOTES" | "VIDEO" | "LAB" | "ASSIGNMENT" | "PROJECT" },
): Promise<{ id: string; moduleId: string; title: string; nodeType: string }> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/faculty/courses/${encodeURIComponent(courseId)}/lectures`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
    body: JSON.stringify(input),
  })
  const result = await parseJson<{ data: { id: string; moduleId: string; title: string; nodeType: string } }>(response)
  return result.data
}

export async function uploadFacultyLessonMaterial(
  courseId: string,
  lectureId: string,
  input: { fileName: string; contentType: string; dataBase64: string },
): Promise<{ id: string; fileName: string; byteSize: number }> {
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/faculty/courses/${encodeURIComponent(courseId)}/lectures/${encodeURIComponent(lectureId)}/materials`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      body: JSON.stringify(input),
    },
  )
  const result = await parseJson<{ data: { id: string; fileName: string; byteSize: number } }>(response)
  return result.data
}


export async function claimDefaultFacultyCourses(courseSlug?: string): Promise<{ assignedCount: number }> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/faculty/claim-default-courses`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
    body: JSON.stringify(courseSlug ? { courseSlug } : {}),
  })
  const result = await parseJson<{ data: { assignedCount: number } }>(response)
  return result.data
}

export async function createFacultyModule(
  courseId: string,
  input: { title: string; description?: string },
): Promise<{ id: string; title: string; position: number }> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/faculty/courses/${encodeURIComponent(courseId)}/modules`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
    body: JSON.stringify(input),
  })
  const result = await parseJson<{ data: { id: string; title: string; position: number } }>(response)
  return result.data
}

export async function updateFacultyModule(
  courseId: string,
  moduleId: string,
  input: { title?: string; description?: string | null },
): Promise<{ id: string; title: string }> {
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/faculty/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      body: JSON.stringify(input),
    },
  )
  const result = await parseJson<{ data: { id: string; title: string } }>(response)
  return result.data
}

export async function updateFacultyLecture(
  courseId: string,
  lectureId: string,
  input: { title?: string; summary?: string | null; referenceUrl?: string | null; nodeType?: string },
): Promise<{ id: string; title: string; nodeType: string; summary?: string | null; referenceUrl?: string | null }> {
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/faculty/courses/${encodeURIComponent(courseId)}/lectures/${encodeURIComponent(lectureId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      body: JSON.stringify(input),
    },
  )
  const result = await parseJson<{
    data: { id: string; title: string; nodeType: string; summary?: string | null; referenceUrl?: string | null }
  }>(response)
  return result.data
}

export async function deleteFacultyLecture(courseId: string, lectureId: string): Promise<{ deleted: boolean }> {
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/faculty/courses/${encodeURIComponent(courseId)}/lectures/${encodeURIComponent(lectureId)}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: { "X-CSRF-Token": token },
    },
  )
  const result = await parseJson<{ data: { deleted: boolean } }>(response)
  return result.data
}

export async function deleteFacultyMaterial(courseId: string, materialId: string): Promise<{ deleted: boolean }> {
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/faculty/courses/${encodeURIComponent(courseId)}/materials/${encodeURIComponent(materialId)}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: { "X-CSRF-Token": token },
    },
  )
  const result = await parseJson<{ data: { deleted: boolean } }>(response)
  return result.data
}
