import { apiV1 } from "./api-base"
import { ensureCsrfToken } from "./auth-api"
import { parseApiJson } from "./http"

const API_BASE = apiV1()

export type AdminRole = "student" | "faculty" | "organisation" | "recruiter" | "superadmin"

export type AdminUser = {
  id: string
  email: string
  displayName: string
  name: string
  avatar: string
  createdAt: string
  roles: AdminRole[]
  role: AdminRole
  hasPassword: boolean
  organisations: Array<{ id: string; slug: string; name: string }>
}

export type AdminOrganisation = {
  id: string
  slug: string
  name: string
  memberCount: number
}

export type AdminEnquiry = {
  id: string
  kind: string
  name: string
  email: string
  phone: string | null
  programSlug: string | null
  message: string | null
  status: string
  createdAt: string
}

async function adminGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { credentials: "include" })
  return parseApiJson<T>(response)
}

async function adminMutate<T>(path: string, method: "POST" | "PATCH" | "DELETE", body?: Record<string, unknown>): Promise<T> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return parseApiJson<T>(response)
}

export async function listAdminUsers(query: string) {
  const params = new URLSearchParams({ limit: "50" })
  if (query.trim()) params.set("query", query.trim())
  return adminGet<{ data: AdminUser[]; pagination: { total: number; limit: number; offset: number } }>(`/admin/users?${params}`)
}

export async function assignAdminUserRole(userId: string, role: AdminRole, organisationId?: string) {
  return adminMutate<{ data: AdminUser }>(`/admin/users/${userId}/role`, "PATCH", {
    role,
    ...(organisationId ? { organisationId } : {}),
  })
}

export async function resetAdminUserToStudent(userId: string) {
  return adminMutate<{ data: AdminUser }>(`/admin/users/${userId}/role`, "DELETE")
}

export async function listAdminOrganisations() {
  return adminGet<{ data: AdminOrganisation[] }>("/admin/organisations")
}

export async function createAdminOrganisation(name: string, slug: string) {
  return adminMutate<{ data: AdminOrganisation }>("/admin/organisations", "POST", { name, slug })
}

export async function listAdminEnquiries() {
  return adminGet<{ data: AdminEnquiry[] }>("/enquiries")
}

export type AdminEmployer = {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  location: string | null
  verificationStatus: string
  memberCount: number
  jobCount: number
}

export async function listAdminEmployers() {
  return adminGet<{ data: AdminEmployer[] }>("/admin/employers")
}

export async function createAdminEmployer(input: {
  name: string
  slug: string
  description?: string
  website?: string
  location?: string
}) {
  return adminMutate<{ data: AdminEmployer }>("/admin/employers", "POST", input)
}

export async function linkAdminEmployerMember(employerId: string, userId: string) {
  return adminMutate<{ data: { id: string; userId: string; employerId: string } }>(
    `/admin/employers/${employerId}/members`,
    "POST",
    { userId },
  )
}

export type AdminEmployerMember = {
  userId: string
  email: string
  displayName: string | null
  linkedAt: string
}

export async function listAdminEmployerMembers(employerId: string) {
  return adminGet<{ data: AdminEmployerMember[] }>(`/admin/employers/${employerId}/members`)
}

export async function removeAdminEmployerMember(employerId: string, userId: string) {
  return adminMutate<{ data: { removed: boolean } }>(`/admin/employers/${employerId}/members/${userId}`, "DELETE")
}

export type AdminPracticeWorkspace = {
  id: string
  courseSlug: string
  status: string
  adapterId: string | null
  revision: number
  manifest: { learnerNote: string; reasons: string[]; missing: string[]; lessonIds: string[] }
  config: { caseTitle: string; caseNotes: string; lessonIds: string[]; datasetId: string | null }
  scores: Array<{ id: string; label: string; score: number }>
  approvedAt: string | null
  publishedAt: string | null
}

export async function listAdminPracticeWorkspaces() {
  return adminGet<{ data: AdminPracticeWorkspace[] }>("/admin/practice-workspaces")
}

export async function createAdminPracticeWorkspace(syllabus: Record<string, unknown>) {
  return adminMutate<{ data: AdminPracticeWorkspace }>("/admin/practice-workspaces", "POST", syllabus)
}

export async function configureAdminPracticeWorkspace(id: string, config: Record<string, unknown>) {
  return adminMutate<{ data: AdminPracticeWorkspace }>(`/admin/practice-workspaces/${id}`, "PATCH", config)
}

export async function actOnAdminPracticeWorkspace(id: string, action: "test" | "approve" | "publish" | "reject" | "unpublish" | "revalidate", body?: Record<string, unknown>) {
  return adminMutate<{ data: AdminPracticeWorkspace | { ok: boolean; detail: string } }>(`/admin/practice-workspaces/${id}/${action}`, "POST", body)
}

export type ElixirRule = {
  id: string
  activity: string
  amount: number
  enabled: boolean
  quizScorePercent: number | null
  cooldownSeconds: number
}

export function listElixirRules() {
  return adminGet<{ data: ElixirRule[] }>("/admin/elixir/rules")
}

export function updateElixirRule(activity: string, body: { amount: number; enabled: boolean; quizScorePercent: number | null; cooldownSeconds: number }) {
  return adminMutate<{ data: ElixirRule }>(`/admin/elixir/rules/${activity}`, "PATCH", body)
}

export function recordVerifiedPayment(body: { userId: string; externalRef: string; eligibleNetRupees: number; status: string }) {
  return adminMutate<{ data: { id: string; elixirAwarded: number; duplicate: boolean; status: string } }>("/admin/payments", "POST", body)
}

export function refundVerifiedPayment(id: string) {
  return adminMutate<{ data: { status: string; reversed: number; unrecovered: number; duplicate: boolean } }>(`/admin/payments/${id}/refund`, "POST", {})
}

export function adjustLearnerElixir(body: { userId: string; amount: number; reason: string; idempotencyKey: string }) {
  return adminMutate<{ data: { amount: number; duplicate: boolean; balance: number | null } }>("/admin/elixir/adjustments", "POST", body)
}

export function createLearningResource(body: { slug: string; kind: "notes" | "case_study"; title: string; elixirPrice: number; published: boolean; summary?: string; courseSlug?: string; lessonKey?: string }) {
  return adminMutate<{ data: { slug: string } }>("/admin/resources", "POST", body)
}

export function fetchAdminReports() {
  return adminGet<{ data: { users: number; enrolments: number; elixir: { issued: number; spent: number; unrecovered: number } | null } }>("/admin/reports")
}

export function fetchAdminAi() {
  return adminGet<{ data: { configured: boolean; provider: string; keyPresent: boolean; lastFailure: { at: string; code: string } | null } }>("/admin/ai")
}

export function fetchAdminAudit() {
  return adminGet<{ data: Array<{ id: string; action: string; summary: string; createdAt: string; actor: { email: string } | null }> }>("/admin/audit")
}

export function fetchAdminCatalogue() {
  return adminGet<{ data: { enrolmentCount: number; courses: Array<{ slug: string; title: string; enrolments: number }>; programs: Array<{ slug: string; name: string; enrolments: number; linkedCourses: number }> } }>("/admin/catalogue")
}

export async function updateLessonPlayback(courseSlug: string, lessonKey: string, muxPlaybackId: string | null) {
  return adminMutate<{ data: { lessonKey: string; media: { provider: string; playbackId?: string } | null } }>(
    `/admin/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonKey)}/media`,
    "PATCH",
    { muxPlaybackId },
  )
}
