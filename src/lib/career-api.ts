import { ensureCsrfToken } from "./auth-api"

const API_BASE = "/api/v1"

type ApiError = { error: string }

export type CareerWorkMode = "REMOTE" | "HYBRID" | "ONSITE" | "FLEXIBLE"
export type CareerProfileVisibility = "PRIVATE" | "NETWORK" | "PUBLIC"
export type CareerEmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE" | "OTHER"
export type CareerLinkType = "LINKEDIN" | "GITHUB" | "PORTFOLIO" | "OTHER"
export type CareerSkillProficiency = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
export type JobApplicationStatus = "SAVED" | "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "REJECTED" | "WITHDRAWN"
export type JobStatus = "DRAFT" | "OPEN" | "CLOSED" | "EXPIRED"

export type CareerCompleteness = {
  percent: number
  completed: string[]
  missing: string[]
  nextRecommended: string | null
  items: Array<{ key: string; label: string; section: string; complete: boolean; weight: number }>
}

export type CareerEducation = {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string | null
  startDate: string | null
  endDate: string | null
  currentlyStudying: boolean
  grade: string | null
  sortOrder: number
}

export type CareerExperience = {
  id: string
  company: string
  role: string
  employmentType: CareerEmploymentType | null
  location: string | null
  startDate: string | null
  endDate: string | null
  currentlyWorking: boolean
  description: string | null
  sortOrder: number
}

export type CareerSkill = {
  id: string
  name: string
  category: string | null
  proficiency: CareerSkillProficiency | null
  sortOrder: number
}

export type CareerProject = {
  id: string
  title: string
  description: string | null
  technologies: string[]
  projectUrl: string | null
  repositoryUrl: string | null
  outcome: string | null
  sortOrder: number
  sourceKind?: string | null
  sourceCourseSlug?: string | null
  sourceLessonKey?: string | null
  artifactFileName?: string | null
  sourceCompletedAt?: string | null
}

export type CareerLink = {
  id: string
  type: CareerLinkType
  label: string | null
  url: string
  sortOrder: number
}

export type CareerResumeVersion = {
  id: string
  label: string
  version: number
  fileName: string | null
  mimeType: string | null
  byteSize: number | null
  storageProvider: string | null
  storageKey: string | null
  notes: string | null
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export type CareerProfile = {
  id: string
  userId: string
  displayName: string | null
  headline: string | null
  summary: string | null
  location: string | null
  phone: string | null
  preferredRole: string | null
  preferredWorkMode: CareerWorkMode | null
  visibility: CareerProfileVisibility
  education: CareerEducation[]
  experience: CareerExperience[]
  skills: CareerSkill[]
  projects: CareerProject[]
  links: CareerLink[]
  resumeVersions: CareerResumeVersion[]
  completeness: CareerCompleteness
  createdAt: string
  updatedAt: string
}

export type EmployerSummary = {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  logoRef: string | null
  location: string | null
  verificationStatus: string
}

export type JobListing = {
  id: string
  employerId: string
  employer?: EmployerSummary
  title: string
  slug: string
  description: string
  employmentType: CareerEmploymentType | null
  workMode: CareerWorkMode | null
  location: string | null
  experienceMin: number | null
  experienceMax: number | null
  salaryMin: number | null
  salaryMax: number | null
  skills: string[]
  category: string | null
  status: JobStatus
  applicationUrl: string | null
  postedAt: string | null
  expiresAt: string | null
  saved?: boolean
  createdAt: string
  updatedAt: string
}

export type JobListParams = {
  status?: JobStatus
  category?: string
  workMode?: CareerWorkMode
  location?: string
  employerId?: string
  employmentType?: CareerEmploymentType
  q?: string
  limit?: string
  offset?: string
}

export type JobListResult = {
  jobs: JobListing[]
  meta: { total: number; limit: number; offset: number }
}

export type SavedJobEntry = {
  id: string
  jobId: string
  createdAt: string
  job: JobListing
}

export type JobApplication = {
  id: string
  jobId: string | null
  employerId: string | null
  roleTitle: string | null
  status: JobApplicationStatus
  appliedAt: string | null
  nextActionAt: string | null
  notes: string | null
  source: string | null
  job: JobListing | null
  employer: EmployerSummary | null
  createdAt: string
  updatedAt: string
}

export type ApplicationEvent = {
  id: string
  applicationId: string
  type: string
  title: string
  description: string | null
  occurredAt: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export type InterviewRoundType = "TECHNICAL" | "HR" | "MANAGERIAL" | "OTHER"
export type InterviewRoundStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "PENDING"
export type InterviewQuestionDifficulty = "EASY" | "MEDIUM" | "HARD"

export type InterviewRound = {
  id: string
  applicationId: string | null
  type: InterviewRoundType
  title: string
  scheduledAt: string | null
  status: InterviewRoundStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type InterviewQuestion = {
  id: string
  category: string
  question: string
  difficulty: InterviewQuestionDifficulty
  roleTag: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type InterviewPractice = {
  id: string
  questionId: string | null
  interviewRoundId: string | null
  answer: string | null
  score: number | null
  practicedAt: string
  feedback: string | null
  createdAt: string
  updatedAt: string
}

export type InterviewQuestionListParams = {
  category?: string
  difficulty?: InterviewQuestionDifficulty
  roleTag?: string
  active?: "true" | "false"
  limit?: string
  offset?: string
}

export type InterviewQuestionListResult = {
  questions: InterviewQuestion[]
  meta: { total: number; limit: number; offset: number }
}

export type CareerSupportRequestType = "RESUME_REVIEW" | "INTERVIEW_PREP" | "JOB_SEARCH" | "GENERAL"
export type CareerSupportRequestStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
export type CareerSupportPriority = "LOW" | "MEDIUM" | "HIGH"
export type CareerSupportTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export type CareerSupportTask = {
  id: string
  requestId: string
  title: string
  description: string | null
  status: CareerSupportTaskStatus
  dueAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CareerSupportRequest = {
  id: string
  type: CareerSupportRequestType
  subject: string
  description: string
  status: CareerSupportRequestStatus
  priority: CareerSupportPriority
  assignedTo: string | null
  tasks: CareerSupportTask[]
  createdAt: string
  updatedAt: string
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

async function careerGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { credentials: "include" })
  return parseJson<T>(response)
}

async function careerMutate<T>(path: string, method: string, body?: Record<string, unknown>): Promise<T> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return parseJson<T>(response)
}

export async function fetchCareerProfile(): Promise<CareerProfile> {
  const result = await careerGet<{ data: CareerProfile }>("/career/profile")
  return result.data
}

export async function fetchProfileCompleteness(): Promise<CareerCompleteness> {
  const result = await careerGet<{ data: CareerCompleteness }>("/career/profile/completeness")
  return result.data
}

export async function updateCareerProfile(input: Partial<{
  headline: string | null
  summary: string | null
  location: string | null
  phone: string | null
  preferredRole: string | null
  preferredWorkMode: CareerWorkMode | null
  visibility: CareerProfileVisibility
}>): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>("/career/profile", "PATCH", input)
  return result.data
}

export async function searchJobs(params?: JobListParams): Promise<JobListResult> {
  const query = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "") as [string, string][]).toString()}` : ""
  const result = await careerGet<{ data: JobListing[]; meta: { total: number; limit: number; offset: number } }>(`/career/jobs${query}`)
  return { jobs: result.data, meta: result.meta }
}

export async function fetchJob(idOrSlug: string): Promise<JobListing> {
  const result = await careerGet<{ data: JobListing }>(`/career/jobs/${encodeURIComponent(idOrSlug)}`)
  return result.data
}

/** @deprecated Use searchJobs for pagination meta */
export async function listJobs(params?: Record<string, string>): Promise<JobListing[]> {
  const result = await searchJobs(params as JobListParams)
  return result.jobs
}

export async function listSavedJobs(): Promise<SavedJobEntry[]> {
  const result = await careerGet<{ data: SavedJobEntry[] }>("/career/saved-jobs")
  return result.data
}

export async function saveJob(jobId: string): Promise<SavedJobEntry> {
  const result = await careerMutate<{ data: SavedJobEntry }>("/career/saved-jobs", "POST", { jobId })
  return result.data
}

export async function unsaveJob(jobId: string): Promise<void> {
  await careerMutate<{ data: { removed: boolean } }>(`/career/saved-jobs/${jobId}`, "DELETE")
}

export async function listApplications(status?: JobApplicationStatus): Promise<JobApplication[]> {
  const query = status ? `?status=${status}` : ""
  const result = await careerGet<{ data: JobApplication[] }>(`/career/applications${query}`)
  return result.data
}

export async function fetchApplication(id: string): Promise<JobApplication> {
  const result = await careerGet<{ data: JobApplication }>(`/career/applications/${id}`)
  return result.data
}

export async function updateApplication(
  id: string,
  input: Partial<{
    status: JobApplicationStatus
    roleTitle: string
    appliedAt: string | null
    nextActionAt: string | null
    notes: string | null
    source: string | null
  }>,
): Promise<JobApplication> {
  const result = await careerMutate<{ data: JobApplication }>(`/career/applications/${id}`, "PATCH", input)
  return result.data
}

export async function deleteApplication(id: string): Promise<void> {
  await careerMutate<{ data: { deleted: boolean } }>(`/career/applications/${id}`, "DELETE")
}

export async function listApplicationEvents(applicationId: string): Promise<ApplicationEvent[]> {
  const result = await careerGet<{ data: ApplicationEvent[] }>(`/career/applications/${applicationId}/events`)
  return result.data
}

export async function createApplicationEvent(
  applicationId: string,
  input: {
    type: string
    title: string
    description?: string | null
    occurredAt: string
    metadata?: Record<string, unknown> | null
  },
): Promise<ApplicationEvent> {
  const result = await careerMutate<{ data: ApplicationEvent }>(
    `/career/applications/${applicationId}/events`,
    "POST",
    input,
  )
  return result.data
}

export async function createApplication(input: {
  jobId?: string
  employerId?: string
  roleTitle?: string
  status?: JobApplicationStatus
  appliedAt?: string
  nextActionAt?: string | null
  notes?: string | null
  source?: string | null
}): Promise<JobApplication> {
  const result = await careerMutate<{ data: JobApplication }>("/career/applications", "POST", input)
  return result.data
}

export async function listInterviewRounds(): Promise<InterviewRound[]> {
  const result = await careerGet<{ data: InterviewRound[] }>("/career/interviews")
  return result.data
}

export async function createInterviewRound(input: {
  applicationId?: string | null
  type: InterviewRoundType
  title: string
  scheduledAt?: string | null
  status?: InterviewRoundStatus
  notes?: string | null
}): Promise<InterviewRound> {
  const result = await careerMutate<{ data: InterviewRound }>("/career/interviews", "POST", input)
  return result.data
}

export async function updateInterviewRound(
  id: string,
  input: Partial<{
    applicationId: string | null
    type: InterviewRoundType
    title: string
    scheduledAt: string | null
    status: InterviewRoundStatus
    notes: string | null
  }>,
): Promise<InterviewRound> {
  const result = await careerMutate<{ data: InterviewRound }>(`/career/interviews/${id}`, "PATCH", input)
  return result.data
}

export async function deleteInterviewRound(id: string): Promise<void> {
  await careerMutate<{ data: { deleted: boolean } }>(`/career/interviews/${id}`, "DELETE")
}

export async function listInterviewQuestions(params?: InterviewQuestionListParams): Promise<InterviewQuestionListResult> {
  const query = params
    ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "") as [string, string][]).toString()}`
    : ""
  const result = await careerGet<{ data: InterviewQuestion[]; meta: { total: number; limit: number; offset: number } }>(
    `/career/questions${query}`,
  )
  return { questions: result.data, meta: result.meta }
}

export async function listPracticeRecords(): Promise<InterviewPractice[]> {
  const result = await careerGet<{ data: InterviewPractice[] }>("/career/practice")
  return result.data
}

export async function createPracticeRecord(input: {
  questionId?: string | null
  interviewRoundId?: string | null
  answer?: string | null
  score?: number | null
  practicedAt?: string
  feedback?: string | null
}): Promise<InterviewPractice> {
  const result = await careerMutate<{ data: InterviewPractice }>("/career/practice", "POST", input)
  return result.data
}

export async function listSupportRequests(): Promise<CareerSupportRequest[]> {
  const result = await careerGet<{ data: CareerSupportRequest[] }>("/career/support")
  return result.data
}

export async function fetchSupportRequest(id: string): Promise<CareerSupportRequest> {
  const result = await careerGet<{ data: CareerSupportRequest }>(`/career/support/${id}`)
  return result.data
}

export async function createSupportRequest(input: {
  type: CareerSupportRequestType
  subject: string
  description: string
  priority?: CareerSupportPriority
}): Promise<CareerSupportRequest> {
  const result = await careerMutate<{ data: CareerSupportRequest }>("/career/support", "POST", input)
  return result.data
}

export async function updateSupportRequest(
  id: string,
  input: Partial<{
    subject: string
    description: string
    status: CareerSupportRequestStatus
    priority: CareerSupportPriority
  }>,
): Promise<CareerSupportRequest> {
  const result = await careerMutate<{ data: CareerSupportRequest }>(`/career/support/${id}`, "PATCH", input)
  return result.data
}

export type CreateEducationInput = {
  institution: string
  degree: string
  fieldOfStudy?: string | null
  startDate?: string | null
  endDate?: string | null
  currentlyStudying?: boolean
  grade?: string | null
  sortOrder?: number
}

export type CreateExperienceInput = {
  company: string
  role: string
  employmentType?: CareerEmploymentType | null
  location?: string | null
  startDate?: string | null
  endDate?: string | null
  currentlyWorking?: boolean
  description?: string | null
  sortOrder?: number
}

export type CreateSkillInput = {
  name: string
  category?: string | null
  proficiency?: CareerSkillProficiency | null
  sortOrder?: number
}

export type CreateProjectInput = {
  title: string
  description?: string | null
  technologies?: string[]
  projectUrl?: string | null
  repositoryUrl?: string | null
  outcome?: string | null
  sortOrder?: number
}

export type CreateLinkInput = {
  type: CareerLinkType
  label?: string | null
  url: string
  sortOrder?: number
}

export type CreateResumeInput = {
  label: string
  version?: number
  fileName?: string | null
  mimeType?: string | null
  byteSize?: number | null
  notes?: string | null
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED"
  isPrimary?: boolean
}

export async function createEducation(input: CreateEducationInput): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerEducation; profile: CareerProfile }>("/career/profile/education", "POST", input)
  return result.profile
}

export async function updateEducation(id: string, input: Partial<CreateEducationInput>): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>(`/career/profile/education/${id}`, "PATCH", input)
  return result.data
}

export async function deleteEducation(id: string): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>(`/career/profile/education/${id}`, "DELETE")
  return result.data
}

export async function createExperience(input: CreateExperienceInput): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>("/career/profile/experience", "POST", input)
  return result.data
}

export async function updateExperience(id: string, input: Partial<CreateExperienceInput>): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>(`/career/profile/experience/${id}`, "PATCH", input)
  return result.data
}

export async function deleteExperience(id: string): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>(`/career/profile/experience/${id}`, "DELETE")
  return result.data
}

export async function createSkill(input: CreateSkillInput): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>("/career/profile/skills", "POST", input)
  return result.data
}

export async function updateSkill(id: string, input: Partial<CreateSkillInput>): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>(`/career/profile/skills/${id}`, "PATCH", input)
  return result.data
}

export async function deleteSkill(id: string): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>(`/career/profile/skills/${id}`, "DELETE")
  return result.data
}

export async function createProject(input: CreateProjectInput): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>("/career/profile/projects", "POST", input)
  return result.data
}

export async function updateProject(id: string, input: Partial<CreateProjectInput>): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>(`/career/profile/projects/${id}`, "PATCH", input)
  return result.data
}

export async function deleteProject(id: string): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>(`/career/profile/projects/${id}`, "DELETE")
  return result.data
}

export async function createLink(input: CreateLinkInput): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>("/career/profile/links", "POST", input)
  return result.data
}

export async function updateLink(id: string, input: Partial<CreateLinkInput>): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>(`/career/profile/links/${id}`, "PATCH", input)
  return result.data
}

export async function deleteLink(id: string): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>(`/career/profile/links/${id}`, "DELETE")
  return result.data
}

export async function listResumes(): Promise<CareerResumeVersion[]> {
  const result = await careerGet<{ data: CareerResumeVersion[] }>("/career/profile/resumes")
  return result.data
}

export async function createResume(input: CreateResumeInput): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerResumeVersion; profile: CareerProfile }>("/career/profile/resumes", "POST", input)
  return result.profile
}

export async function deleteResume(id: string): Promise<CareerProfile> {
  const result = await careerMutate<{ data: CareerProfile }>(`/career/profile/resumes/${id}`, "DELETE")
  return result.data
}
