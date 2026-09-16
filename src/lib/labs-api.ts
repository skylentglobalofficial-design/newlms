import { ensureCsrfToken } from "./auth-api"
import { parseApiJson } from "./http"

const API_BASE = "/api/v1"

export type LabColumnPreview = {
  name: string
  type: "text" | "number" | "date"
}

export type LabGuidedRunResult = {
  operation: "valid_net_revenue"
  operationLabel: string
  dataset: string
  totalRows: number
  validRows: number
  excludedRows: number
  netRevenue: number
  netRevenueLabel: string
  topCategory: string
  topCategoryRevenue: number
  topCategoryRevenueLabel: string
  validRowRule: string[]
  formula: string
  categoryMapping: Array<{ from: string; to: string; reason: string }>
  categories: Array<{
    name: string
    validRows: number
    netRevenue: number
    netRevenueLabel: string
  }>
  explanation: string
}

export type LabSqlCell = string | number | null

export type LabChartType = "bar" | "line" | "scatter"

export type LabChartPoint = {
  label: string
  x: number
  y: number
  formatted: string
}

export type LabChartSpec = {
  chartable: true
  type: LabChartType
  xKey: string
  yKey: string
  labelKey: string
  title: string
  groupNoun: string
  highestLabel: string
  highestFormatted: string
  yIsCurrency: boolean
  maxValue: number
  axisMax: number
  xAxisMax: number
  series: LabChartPoint[]
}

export type LabChartDecision = LabChartSpec | { chartable: false }

export type LabSqlRunResult = {
  operation: "sql"
  operationLabel: string
  dataset: string
  dialect: string
  table: string
  query: string
  columns: string[]
  rows: LabSqlCell[][]
  rowCount: number
  truncated: boolean
  durationMs: number
  chart: LabChartDecision
}

export type LabRunResult = LabGuidedRunResult | LabSqlRunResult

export type LabWorkspace = {
  courseSlug: string
  courseTitle: string
  labSlug: string
  labTitle: string
  dataset: {
    filename: string
    description: string
    totalRows: number
    columns: LabColumnPreview[]
    sampleRows: Record<string, string>[]
    validRowRule: string[]
    qualityNotes: string[]
  }
  operations: Array<{ id: "valid_net_revenue"; label: string; summary: string }>
  sql: {
    dialect: string
    table: string
    columns: LabColumnPreview[]
    examples: Array<{ id: string; label: string; summary: string; sql: string }>
    prompts: string[]
    limits: {
      maxQueryChars: number
      maxResultRows: number
      timeoutMs: number
    }
    supported: string[]
  }
  lesson: {
    lessonKey: string
    lessonTitle: string
    moduleTitle: string | null
  } | null
  disclaimer: string
}

export type SavedLabWorkSummary = {
  id: string
  title: string
  dataset: string
  operation: string
  operationLabel: string
  validRows: number | null
  netRevenueLabel: string | null
  rowCount: number | null
  createdAt: string
}

export type SavedLabWork = SavedLabWorkSummary & {
  courseSlug: string
  labSlug: string
  lessonKey: string | null
  query: string | null
  result: LabRunResult
}

export function isSqlRunResult(result: LabRunResult | null | undefined): result is LabSqlRunResult {
  return result?.operation === "sql"
}

export function isGuidedRunResult(result: LabRunResult | null | undefined): result is LabGuidedRunResult {
  return result?.operation === "valid_net_revenue"
}

export function northwindLabPath(lessonKey?: string | null, workId?: string | null, mode?: "sql" | "analysis" | null) {
  const params = new URLSearchParams()
  if (lessonKey) params.set("lesson", lessonKey)
  if (workId) params.set("work", workId)
  if (mode === "sql") params.set("mode", "sql")
  const query = params.toString()
  return `/os/labs/data-analytics/northwind${query ? `?${query}` : ""}`
}

export async function fetchNorthwindLab(lessonKey?: string | null, signal?: AbortSignal): Promise<LabWorkspace> {
  const params = new URLSearchParams()
  if (lessonKey) params.set("lesson", lessonKey)
  const query = params.toString()
  const response = await fetch(
    `${API_BASE}/labs/data-analytics/northwind${query ? `?${query}` : ""}`,
    { credentials: "include", signal },
  )
  const parsed = await parseApiJson<{ data: LabWorkspace }>(response)
  return parsed.data
}

export async function runNorthwindLab(input: {
  operation: "valid_net_revenue"
  lessonKey?: string | null
  signal?: AbortSignal
}): Promise<LabGuidedRunResult> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/labs/data-analytics/northwind/run`, {
    method: "POST",
    credentials: "include",
    signal: input.signal,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: JSON.stringify({
      operation: input.operation,
      lessonKey: input.lessonKey || undefined,
    }),
  })
  const parsed = await parseApiJson<{ data: LabGuidedRunResult }>(response)
  return parsed.data
}

export async function runNorthwindSql(input: {
  query: string
  lessonKey?: string | null
  signal?: AbortSignal
}): Promise<LabSqlRunResult> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/labs/data-analytics/northwind/sql/run`, {
    method: "POST",
    credentials: "include",
    signal: input.signal,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: JSON.stringify({
      query: input.query,
      lessonKey: input.lessonKey || undefined,
    }),
  })
  const parsed = await parseApiJson<{ data: LabSqlRunResult }>(response)
  return parsed.data
}

export async function saveNorthwindLabWork(input: {
  operation: "valid_net_revenue" | "sql"
  lessonKey?: string | null
  query?: string
  signal?: AbortSignal
}): Promise<SavedLabWork> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/labs/data-analytics/northwind/work`, {
    method: "POST",
    credentials: "include",
    signal: input.signal,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: JSON.stringify(
      input.operation === "sql"
        ? {
            operation: "sql",
            query: input.query,
            lessonKey: input.lessonKey || undefined,
          }
        : {
            operation: input.operation,
            lessonKey: input.lessonKey || undefined,
          },
    ),
  })
  const parsed = await parseApiJson<{ data: SavedLabWork }>(response)
  return parsed.data
}

export async function listNorthwindLabWork(signal?: AbortSignal): Promise<SavedLabWorkSummary[]> {
  const response = await fetch(`${API_BASE}/labs/data-analytics/northwind/work`, {
    credentials: "include",
    signal,
  })
  const parsed = await parseApiJson<{ data: SavedLabWorkSummary[] }>(response)
  return parsed.data
}

export async function fetchNorthwindLabWork(workId: string, signal?: AbortSignal): Promise<SavedLabWork> {
  const response = await fetch(`${API_BASE}/labs/data-analytics/northwind/work/${encodeURIComponent(workId)}`, {
    credentials: "include",
    signal,
  })
  const parsed = await parseApiJson<{ data: SavedLabWork }>(response)
  return parsed.data
}
