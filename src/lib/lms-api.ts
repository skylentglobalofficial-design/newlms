import { ensureCsrfToken } from "./auth-api"
import type { LmsCourseView } from "../components/lms/lms-utils"

export type { LmsCourseView }

const API_BASE = "/api/v1"

type ApiError = { error: string }

export class LmsHttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "LmsHttpError"
    this.status = status
  }
}

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
  hasPractice?: boolean
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

export type ApiLessonPracticeOption = {
  id: string
  label: string
  teachingFeedback: string
}

export type ApiLessonPractice = {
  lessonKey: string
  lessonTitle: string
  moduleId: string
  moduleTitle: string
  courseSlug: string
  courseTitle: string
  interactionType: "choose"
  context: string
  task: string
  preferredOptionKey: string
  options: ApiLessonPracticeOption[]
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | ApiError
  if (!response.ok) {
    const message = typeof data === "object" && data && "error" in data
      ? String((data as ApiError).error)
      : "Request failed"
    throw new LmsHttpError(response.status, message)
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

/** Deduplicate concurrent identical LMS GETs (StrictMode / remount races). */
const inflightWorkspace = new Map<string, Promise<ApiCourseWorkspace>>()
let inflightDashboard: Promise<ApiCourseWorkspace | null> | null = null

export async function fetchLmsDashboard(): Promise<ApiCourseWorkspace | null> {
  const existing = inflightDashboard
  if (existing) return existing
  const request = lmsGet<{ data: ApiCourseWorkspace | null }>("/lms/dashboard")
    .then((result) => result.data)
    .finally(() => {
      if (inflightDashboard === request) inflightDashboard = null
    })
  inflightDashboard = request
  return request
}

export async function fetchCourseAccess(slug: string): Promise<ApiCourseAccess> {
  const result = await lmsGet<{ data: ApiCourseAccess }>(`/lms/courses/${slug}/access`)
  return result.data
}

export async function fetchCourseWorkspace(slug: string): Promise<ApiCourseWorkspace> {
  const existing = inflightWorkspace.get(slug)
  if (existing) return existing
  const request = lmsGet<{ data: ApiCourseWorkspace }>(`/lms/courses/${slug}`)
    .then((result) => result.data)
    .finally(() => {
      if (inflightWorkspace.get(slug) === request) inflightWorkspace.delete(slug)
    })
  inflightWorkspace.set(slug, request)
  return request
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

export async function fetchLessonPractice(slug: string, lessonKey: string) {
  const result = await lmsGet<{ data: ApiLessonPractice }>(
    `/lms/courses/${slug}/lessons/${lessonKey}/practice`,
  )
  return result.data
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

export type AssignmentAttachmentMeta = {
  id?: string
  fileName: string
  mimeType: string
  byteSize: number
  storageProvider?: string
  stored?: boolean
  downloadPath?: string | null
}

export type AssignmentBriefPayload = {
  title: string
  kicker: string | null
  content: AssignmentBriefContent | unknown
  dataset: {
    available: boolean
    name: string | null
    fileName: string | null
    mimeType: string | null
    disclaimer: string | null
    downloadPath: string | null
  } | null
  artifactUpload: {
    required: boolean
    maxBytes: number
    allowedExtensions: string[]
    uploadPath: string
    storageProvider: "local"
    honesty: string
  } | null
}

export type AssignmentBriefContent = {
  objective?: string
  learningObjectives?: string[]
  scenario?: {
    caseName?: string
    framing?: string
    narrative?: string
  }
  businessProblem?: {
    primaryQuestion?: string
    decisionSupported?: string
    gradingNote?: string
  }
  learnerTask?: string[]
  requiredAnalysis?: Array<{ id: string; text: string }>
  optionalAnalysis?: Array<{ id: string; text: string }>
  dashboardRequirements?: Array<{
    id: string
    view: string
    questionAnswered: string
    metric: string
    acceptableVisualForm: string
    interpretationExpectation: string
  }>
  deliverables?: {
    analyticalArtifact?: {
      required?: boolean
      paths?: Array<{ id: string; label: string; description: string }>
      chooseOne?: boolean
    }
    writtenAnalysis?: {
      required?: boolean
      wordCount?: string
      mustInclude?: string[]
    }
    optional?: string[]
  }
  constraints?: string[]
  milestones?: Array<{ id: string; label: string; purpose: string; evidenceBeforeNext?: string }>
  rubric?: Array<{
    criterion: string
    meets: string
    partial: string
    doesNotMeet: string
  }>
  submissionExpectations?: {
    requiredArtifacts?: string[]
    naming?: string
    completeWhen?: string
    incompleteIf?: string[]
    attachmentNote?: string
  }
  prerequisites?: {
    sourceDerivedPath?: string
    statement?: string
  }
  completionRule?: string
  dataset?: {
    name?: string
    analysisWindow?: { start: string; end: string; asOfDate?: string }
    currency?: string
    netRevenueFormula?: string
    honesty?: string
  }
}

export type AssignmentStatePayload = {
  lessonKey: string
  title?: string
  status: string
  submittedAt: string | null
  responseText?: string | null
  attachments: AssignmentAttachmentMeta[]
  brief: AssignmentBriefPayload | null
}

export async function fetchAssignmentState(slug: string, lessonKey: string) {
  const result = await lmsGet<{ data: AssignmentStatePayload }>(
    `/lms/courses/${slug}/lessons/${lessonKey}/assignment`,
  )
  return result.data
}

export async function updateAssignment(
  slug: string,
  lessonKey: string,
  action: "start" | "submit",
  responseText?: string,
  attachments?: Array<{ fileName: string; mimeType: string; byteSize: number }>,
) {
  const result = await lmsMutate<{ data: AssignmentStatePayload }>(
    `/lms/courses/${slug}/lessons/${lessonKey}/assignment`,
    { action, responseText, attachments },
  )
  return result.data
}

/** Upload a real analytical artifact binary for project assignments (multipart). */
export async function uploadAssignmentArtifact(slug: string, lessonKey: string, file: File) {
  const token = await ensureCsrfToken()
  const form = new FormData()
  form.append("artifact", file, file.name)
  const response = await fetch(`${API_BASE}/lms/courses/${slug}/lessons/${lessonKey}/assignment/artifact`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRF-Token": token,
    },
    body: form,
  })
  const payload = (await response.json().catch(() => null)) as
    | { data: { lessonKey: string; status: string; attachment: AssignmentAttachmentMeta }; error?: string }
    | { error: string }
    | null
  if (!response.ok) {
    throw new LmsHttpError(response.status, (payload as { error?: string } | null)?.error ?? "Artifact upload failed")
  }
  return (payload as { data: { lessonKey: string; status: string; attachment: AssignmentAttachmentMeta } }).data
}

/** Submit project written analysis after a stored artifact upload exists. */
export async function submitProjectAssignment(slug: string, lessonKey: string, responseText: string) {
  const result = await lmsMutate<{ data: AssignmentStatePayload }>(
    `/lms/courses/${slug}/lessons/${lessonKey}/assignment`,
    { action: "submit", responseText },
  )
  return result.data
}

export async function fetchCertificateState(slug: string) {
  const result = await lmsGet<{
    data: {
      certificateEligible: boolean
      certificateStatus: string
      allComplete: boolean
      requirements: Array<{ lessonKey: string; title: string; complete: boolean }>
    }
  }>(`/lms/courses/${slug}/certificate`)
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
        hasPractice: Boolean(lesson.hasPractice),
        media: lesson.media,
      })),
    })),
  }
}
