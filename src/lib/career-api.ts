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

export type JobListing = {
  id: string
  employerId: string
  title: string
  slug: string
  description: string
  employmentType: CareerEmploymentType | null
  workMode: CareerWorkMode | null
  location: string | null
  skills: string[]
  category: string | null
  status: JobStatus
  saved?: boolean
}

export type JobApplication = {
  id: string
  jobId: string | null
  employerId: string | null
  roleTitle: string | null
  status: JobApplicationStatus
  appliedAt: string | null
  notes: string | null
  source: string | null
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

export async function listJobs(params?: Record<string, string>): Promise<JobListing[]> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : ""
  const result = await careerGet<{ data: JobListing[] }>(`/career/jobs${query}`)
  return result.data
}

export async function listApplications(): Promise<JobApplication[]> {
  const result = await careerGet<{ data: JobApplication[] }>("/career/applications")
  return result.data
}

export async function createApplication(input: {
  jobId?: string
  employerId?: string
  roleTitle?: string
  source?: string
}): Promise<JobApplication> {
  const result = await careerMutate<{ data: JobApplication }>("/career/applications", "POST", input)
  return result.data
}
