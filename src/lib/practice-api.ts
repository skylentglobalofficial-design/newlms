import { apiV1 } from "./api-base"
import { ensureCsrfToken } from "./auth-api"
import { parseApiJson } from "./http"

const API_BASE = apiV1()

export type LearnerPracticeWorkspace = {
  courseSlug: string
  courseTitle: string
  adapterId: string | null
  title: string
  learnerNote: string
  lessonIds: string[]
  href: string | null
  caseTitle: string
  caseNotes: string
  savedBody: string | null
}

export async function fetchLearnerPracticeWorkspace(courseSlug: string, lessonId?: string, signal?: AbortSignal): Promise<LearnerPracticeWorkspace> {
  const params = new URLSearchParams()
  if (lessonId) params.set("lesson", lessonId)
  const query = params.toString()
  const response = await fetch(`${API_BASE}/practice/workspaces/${courseSlug}${query ? `?${query}` : ""}`, { credentials: "include", signal })
  const parsed = await parseApiJson<{ data: LearnerPracticeWorkspace }>(response)
  return parsed.data
}

export async function saveLearnerPracticeResponse(courseSlug: string, lessonId: string, body: string): Promise<void> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/practice/workspaces/${courseSlug}/responses/${lessonId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
    body: JSON.stringify({ body }),
  })
  await parseApiJson(response)
}
