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
