export type LabColumnPreview = {
  name: string
  type: "text" | "number" | "date"
}

export type LabSampleRow = Record<string, string>

export type LabCategoryTotal = {
  name: string
  validRows: number
  netRevenue: number
  netRevenueLabel: string
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
  categories: LabCategoryTotal[]
  explanation: string
}

export type LabSqlCell = string | number | null

export type LabSqlStoredPreview = {
  columns: string[]
  rows: LabSqlCell[][]
  previewRowCount: number
}

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
}

export type LabRunResult = LabGuidedRunResult | LabSqlRunResult

export type LabDatasetPreview = {
  filename: string
  description: string
  totalRows: number
  columns: LabColumnPreview[]
  sampleRows: LabSampleRow[]
  validRowRule: string[]
  qualityNotes: string[]
}

export type LabSqlWorkspace = {
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

export type LabLessonContext = {
  lessonKey: string
  lessonTitle: string
  moduleTitle: string | null
} | null

export type LabWorkspace = {
  courseSlug: string
  courseTitle: string
  labSlug: string
  labTitle: string
  dataset: LabDatasetPreview
  operations: Array<{ id: "valid_net_revenue"; label: string; summary: string }>
  sql: LabSqlWorkspace
  lesson: LabLessonContext
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

/** Reserved for a later Lesson → Lab → Skylent AI loop. Not exposed to learners in this phase. */
export type FutureLabAiIntent =
  | "explain_result"
  | "hint"
  | "debug_reasoning"
  | "improve_analysis"
  | "explain_query"
  | "explain_sql_error"

/** Shape a future Skylent AI feature can consume. Not returned to the Lab UI in this phase. */
export type FutureLabAiContext = {
  intent: FutureLabAiIntent
  dataset: string
  query?: string
  result?: {
    operation: string
    rowCount?: number
    truncated?: boolean
    netRevenue?: number
  }
  error?: string
}
