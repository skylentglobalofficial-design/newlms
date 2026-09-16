import type { LabChartSpec } from "../skylent-labs/types.js"
import type { ProjectStatus, ProjectTaskKey, ProjectTaskStatus, ProjectTool, ReflectionField } from "./catalog.js"

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
  key: ProjectTaskKey
  number: string
  title: string
  summary: string
  tool: ProjectTool
  toolLabel: string
  completion: "explicit" | "lab_work" | "reflection"
  reflectionField?: ReflectionField
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

export type StoredProjectTask = {
  key: ProjectTaskKey
  status: ProjectTaskStatus
  labWorkId: string | null
  completedAt: string | null
}
