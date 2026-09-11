const API_BASE = "/api/v1"

export type FacultySubmissionAttachment = {
  id: string
  fileName: string
  mimeType: string
  byteSize: number
}

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
  attachments: FacultySubmissionAttachment[]
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
  const data = await response.json()
  if (!response.ok) {
    const message = typeof data === "object" && data && "error" in data
      ? String((data as { error: string }).error)
      : "Request failed"
    throw new Error(message)
  }
  return data as T
}

export async function fetchFacultyDashboard(): Promise<FacultyDashboard> {
  const response = await fetch(`${API_BASE}/faculty/dashboard`, { credentials: "include" })
  const result = await parseJson<{ data: FacultyDashboard }>(response)
  return result.data
}

export async function downloadFacultyAttachment(attachmentId: string, fileName: string) {
  const response = await fetch(`${API_BASE}/faculty/attachments/${attachmentId}`, { credentials: "include" })
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
