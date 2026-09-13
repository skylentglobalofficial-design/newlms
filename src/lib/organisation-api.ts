import { parseApiJson } from "./http"

const API_BASE = "/api/v1"

export type OrganisationDashboard = {
  organisation: {
    slug: string
    name: string
  }
  programs: Array<{
    slug: string
    name: string
    duration: string
    format: string
    enrollmentStatus: string | null
    enrollmentCount: number
  }>
  courses: Array<{
    slug: string
    title: string
    category: string
    level: string
  }>
  totals: {
    programCount: number
    courseCount: number
    enrollmentCount: number
    memberCount: number
  }
  batches: unknown[]
  batchModelRequired: string
  catalogScopeMessage?: string | null
  cohortAnalyticsAvailable: boolean
}

async function parseJson<T>(response: Response): Promise<T> {
  return parseApiJson<T>(response)
}

export async function fetchOrganisationDashboard(): Promise<OrganisationDashboard> {
  const response = await fetch(`${API_BASE}/organisation/dashboard`, { credentials: "include" })
  const result = await parseJson<{ data: OrganisationDashboard }>(response)
  return result.data
}
