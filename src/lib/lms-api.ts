import { ensureCsrfToken } from "./auth-api"
import type { LmsCourseView } from "../components/lms/lms-utils"

export type { LmsCourseView }

const API_BASE = "/api/v1"

type ApiError = { error: string }

export type ApiLessonState = {
  started: boolean
  complete: boolean
  locked: boolean
  requiredLessonKey?: string | null
  videoWatched: boolean
  quizPassed: boolean
  assignmentSubmitted: boolean
  startedAt?: string
  completedAt?: string
  lastAccessedAt?: string
}

export type ApiCourseLesson = {
  id: string
  title: string
  type: string | null
  duration?: string
  media?: { provider: "mux" | "unavailable"; playbackId?: string }
}

export type ApiCourseModule = {
  id: string
  title: string
  lessons: ApiCourseLesson[]
}

export type ApiResume = {
  lessonId: string
  lessonTitle: string
  moduleId: string
  moduleTitle: string
  moduleIndex: number
  moduleTotal: number
  nextLessonId: string | null
  nextLessonTitle: string | null
}

export type ApiCourseWorkspace = {
  enrollment: {
    id: string
    status: string
    courseSlug: string
    courseTitle: string
    certificateEligible: boolean
    certificateStatus: string
  }
  course: {
    slug: string
    title: string
    modules: ApiCourseModule[]
  }
  lessonStates: Record<string, ApiLessonState>
  progress: {
    completedCount: number
    totalLessons: number
    progressPct: number
    allComplete: boolean
  }
  resume: ApiResume
}

export type ApiCourseAccess = {
  authenticated: boolean
  enrolled: boolean
  canAccess: boolean
  reason?: "login_required" | "not_enrolled"
  courseSlug?: string
  courseTitle?: string
  enrollmentId?: string
}

export type ApiQuizQuestion = {
  id: string
  q: string
  options: string[]
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

async function lmsGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { credentials: "include" })
  return parseJson<T>(response)
}

async function lmsMutate<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: JSON.stringify(body),
  })
  return parseJson<T>(response)
}

export async function fetchLmsDashboard(): Promise<ApiCourseWorkspace | null> {
  const result = await lmsGet<{ data: ApiCourseWorkspace | null }>("/lms/dashboard")
  return result.data
}

export async function fetchCourseAccess(slug: string): Promise<ApiCourseAccess> {
  const result = await lmsGet<{ data: ApiCourseAccess }>(`/lms/courses/${slug}/access`)
  return result.data
}

export async function fetchCourseWorkspace(slug: string): Promise<ApiCourseWorkspace> {
  const result = await lmsGet<{ data: ApiCourseWorkspace }>(`/lms/courses/${slug}`)
  return result.data
}

export async function enrollInCourse(courseSlug: string): Promise<ApiCourseWorkspace> {
  const result = await lmsMutate<{ data: ApiCourseWorkspace }>("/lms/enrollments", { courseSlug })
  return result.data
}

export async function enrollInProgram(programSlug: string): Promise<ApiCourseWorkspace> {
  const result = await lmsMutate<{ data: ApiCourseWorkspace }>("/lms/enrollments", { programSlug })
  return result.data
}

export async function fetchLessonMedia(slug: string, lessonKey: string) {
  const result = await lmsGet<{
    data: {
      lessonKey: string
      title: string
      duration?: string | null
      media: { provider: "mux" | "unavailable"; playbackId?: string }
    }
  }>(`/lms/courses/${slug}/lessons/${lessonKey}/media`)
  return result.data
}

export async function markLessonAccess(slug: string, lessonKey: string) {
  return lmsMutate<{ data: { lessonKey: string; state: ApiLessonState } }>(
    `/lms/courses/${slug}/lessons/${lessonKey}/progress`,
    { action: "access" },
  )
}

export async function markLessonComplete(slug: string, lessonKey: string) {
  return lmsMutate<{ data: { lessonKey: string; state: ApiLessonState } }>(
    `/lms/courses/${slug}/lessons/${lessonKey}/progress`,
    { action: "complete" },
  )
}

export async function fetchQuizQuestions(slug: string, lessonKey: string) {
  const result = await lmsGet<{ data: { lessonKey: string; questions: ApiQuizQuestion[] } }>(
    `/lms/courses/${slug}/lessons/${lessonKey}/quiz`,
  )
  return result.data.questions
}

export async function submitQuizAttempt(slug: string, lessonKey: string, answers: number[]) {
  const result = await lmsMutate<{
    data: {
      attemptId: string
      attemptNumber: number
      score: number
      totalQuestions: number
      passed: boolean
      submittedAt: string
    }
  }>(`/lms/courses/${slug}/lessons/${lessonKey}/quiz/attempts`, { answers })
  return result.data
}

export async function fetchAssignmentState(slug: string, lessonKey: string) {
  const result = await lmsGet<{
    data: {
      lessonKey: string
      status: string
      submittedAt: string | null
      attachments: Array<{ id: string; fileName: string; mimeType: string; byteSize: number; downloadable: boolean }>
    }
  }>(`/lms/courses/${slug}/lessons/${lessonKey}/assignment`)
  return result.data
}

export async function updateAssignment(slug: string, lessonKey: string, action: "start" | "submit", responseText?: string) {
  const result = await lmsMutate<{
    data: {
      lessonKey: string
      status: string
      submittedAt: string | null
      attachments?: Array<{ id: string; fileName: string; mimeType: string; byteSize: number; downloadable: boolean }>
    }
  }>(
    `/lms/courses/${slug}/lessons/${lessonKey}/assignment`,
    { action, responseText },
  )
  return result.data
}

export async function uploadAssignmentAttachment(slug: string, lessonKey: string, file: File) {
  const token = await ensureCsrfToken()
  const body = new FormData()
  body.append("file", file, file.name)
  const response = await fetch(`${API_BASE}/lms/courses/${slug}/lessons/${lessonKey}/assignment/attachments`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Token": token },
    body,
  })
  return parseJson<{ data: { lessonKey: string; attachment: { id: string; fileName: string; mimeType: string; byteSize: number; downloadable: boolean } } }>(response)
}

export async function downloadAssignmentAttachment(slug: string, lessonKey: string, attachmentId: string, fileName: string) {
  const response = await fetch(
    `${API_BASE}/lms/courses/${slug}/lessons/${lessonKey}/assignment/attachments/${attachmentId}`,
    { credentials: "include" },
  )
  if (!response.ok) throw new Error("Download failed")
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export type ApiCertificate = {
  publicId: string
  learnerName: string
  courseTitle: string
  courseSlug: string
  issuerName: string
  issuedAt: string
  disclaimer: string
}

export async function fetchCertificateState(slug: string) {
  const result = await lmsGet<{
    data: {
      certificateEligible: boolean
      certificateStatus: string
      issuerName: string | null
      disclaimer: string
      certificate: ApiCertificate | null
      allComplete: boolean
      requirements: Array<{ lessonKey: string; title: string; complete: boolean }>
    }
  }>(`/lms/courses/${slug}/certificate`)
  return result.data
}

export async function issueCertificate(slug: string) {
  const result = await lmsMutate<{ data: ApiCertificate }>(`/lms/courses/${slug}/certificate/issue`, {})
  return result.data
}

export async function downloadCourseCertificate(slug: string) {
  const response = await fetch(`${API_BASE}/lms/courses/${slug}/certificate/file`, { credentials: "include" })
  if (!response.ok) throw new Error("Certificate download failed")
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `certificate-${slug}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function fetchPublicCertificate(publicId: string) {
  const result = await lmsGet<{ data: ApiCertificate }>(`/lms/certificates/${encodeURIComponent(publicId)}`)
  return result.data
}

export function apiLessonStateToUi(state: ApiLessonState) {
  return {
    videoWatched: state.videoWatched,
    quizPassed: state.quizPassed,
    assignmentSubmitted: state.assignmentSubmitted,
    complete: state.complete,
    locked: state.locked,
    requiredLessonKey: state.requiredLessonKey ?? null,
  }
}

export function workspaceToCourse(workspace: ApiCourseWorkspace): LmsCourseView {
  return {
    slug: workspace.course.slug,
    title: workspace.course.title,
    modules: workspace.course.modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      lessons: mod.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        type: (lesson.type ?? "video") as "video" | "notes" | "quiz" | "assignment",
        duration: lesson.duration,
        completed: workspace.lessonStates[lesson.id]?.complete ?? false,
        locked: workspace.lessonStates[lesson.id]?.locked ?? false,
        media: lesson.media,
      })),
    })),
  }
}
