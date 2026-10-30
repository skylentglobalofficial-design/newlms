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
    slug: string
    title: string
    moduleCount: number
    lessonCount: number
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
