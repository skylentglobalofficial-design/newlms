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

export type LabRunResult = {
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

export type LabDatasetPreview = {
  filename: string
  description: string
  totalRows: number
  columns: LabColumnPreview[]
  sampleRows: LabSampleRow[]
  validRowRule: string[]
  qualityNotes: string[]
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
  createdAt: string
}

export type SavedLabWork = SavedLabWorkSummary & {
  courseSlug: string
  labSlug: string
  lessonKey: string | null
  result: LabRunResult
}

/** Reserved for a later Lesson → Lab → Skylent AI loop. Not exposed to learners in this phase. */
export type FutureLabAiIntent = "explain_result" | "hint" | "debug_reasoning" | "improve_analysis"
