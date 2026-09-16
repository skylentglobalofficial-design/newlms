import { ensureCsrfToken } from "./auth-api"
import { parseApiJson } from "./http"
import type { LabChartSpec } from "./labs-api"

const API_BASE = "/api/v1"

export const NORTHWIND_PROJECT_TYPE = "northwind-commercial-review"

export type ProjectStatus = "not_started" | "in_progress" | "saved" | "ready_to_review"
export type ProjectTaskStatus = "open" | "complete"
export type ProjectTool = "analysis" | "sql" | "evidence" | "reflection"

export type ProjectReflection = {
  finding: string
  whyItMatters: string
  recommendation: string
}

export type ProjectEvidence = {
  labWorkId: string
  title: string
  dataset: string
  operation: string
  operationLabel: string
  source: string
  rowCount: number | null
  chartable: boolean
  chartType: "bar" | "line" | "scatter" | null
  validRows: number | null
  netRevenueLabel: string | null
  createdAt: string
  viewHref: string
  chart: LabChartSpec | null
}

export type ProjectLabWorkOption = {
  id: string
  title: string
  operation: string
  operationLabel: string
  rowCount: number | null
  chartable: boolean
  chartType: "bar" | "line" | "scatter" | null
  createdAt: string
}

export type ProjectTaskView = {
  key: string
  number: string
  title: string
  summary: string
  tool: ProjectTool
  toolLabel: string
  completion: "explicit" | "lab_work" | "reflection"
  reflectionField?: "finding" | "whyItMatters" | "recommendation"
  status: ProjectTaskStatus
  completedAt: string | null
  openLabHref: string | null
  evidence: ProjectEvidence | null
  evidenceHint: string
}

export type ProjectWorkspace = {
  id: string
  projectType: string
  courseSlug: string
  title: string
  goal: string
  dataset: string
  context: string
  brief: string[]
  disclaimer: string
  courseTitle: string
  labEnabled: boolean
  caseHref: string | null
  reflectionLabels: { finding: string; whyItMatters: string; recommendation: string }
  reflectionHints: { finding: string; whyItMatters: string; recommendation: string }
  status: ProjectStatus
  progress: { complete: number; total: number }
  tasks: ProjectTaskView[]
  reflection: ProjectReflection
  availableWork: ProjectLabWorkOption[]
  createdAt: string
  updatedAt: string
  savedAt: string | null
}

export type ProjectSummary = {
  id: string
  projectType: string
  courseSlug: string
  title: string
  status: ProjectStatus
  progress: { complete: number; total: number }
  updatedAt: string
}

export function northwindProjectPath() {
  return "/os/projects/data-analytics/northwind-commercial-review"
}

export function harborDeskProjectPath() {
  return "/os/projects/product-management/harbor-desk-case"
}

export function learnerProjectPath(courseSlug: string, projectType: string) {
  return `/os/projects/${courseSlug}/${projectType}`
}

export function projectStatusLabel(status: ProjectStatus) {
  if (status === "ready_to_review") return "Ready to review"
  if (status === "saved") return "Saved"
  if (status === "in_progress") return "In progress"
  return "Not started"
}

async function readProject(response: Response) {
  const parsed = await parseApiJson<{ data: ProjectWorkspace }>(response)
  return parsed.data
}

export async function listLearnerProjects(signal?: AbortSignal): Promise<ProjectSummary[]> {
  const response = await fetch(`${API_BASE}/lms/projects`, { credentials: "include", signal })
  const parsed = await parseApiJson<{ data: ProjectSummary[] }>(response)
  return parsed.data
}

export async function ensureLearnerProject(projectType: string, signal?: AbortSignal): Promise<ProjectWorkspace> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/lms/projects`, {
    method: "POST",
    credentials: "include",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: JSON.stringify({ projectType }),
  })
  return readProject(response)
}

export async function ensureNorthwindProject(signal?: AbortSignal): Promise<ProjectWorkspace> {
  return ensureLearnerProject(NORTHWIND_PROJECT_TYPE, signal)
}

export async function fetchLearnerProject(projectId: string, signal?: AbortSignal): Promise<ProjectWorkspace> {
  const response = await fetch(`${API_BASE}/lms/projects/${encodeURIComponent(projectId)}`, {
    credentials: "include",
    signal,
  })
  return readProject(response)
}

export async function completeProjectTask(projectId: string, taskKey: string): Promise<ProjectWorkspace> {
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/lms/projects/${encodeURIComponent(projectId)}/tasks/${encodeURIComponent(taskKey)}/complete`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token,
      },
      body: "{}",
    },
  )
  return readProject(response)
}

export async function attachProjectEvidence(
  projectId: string,
  taskKey: string,
  labWorkId: string,
): Promise<ProjectWorkspace> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/lms/projects/${encodeURIComponent(projectId)}/evidence`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: JSON.stringify({ taskKey, labWorkId }),
  })
  return readProject(response)
}

export async function saveProject(
  projectId: string,
  reflection: ProjectReflection,
): Promise<ProjectWorkspace> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/lms/projects/${encodeURIComponent(projectId)}/save`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: JSON.stringify(reflection),
  })
  return readProject(response)
}
