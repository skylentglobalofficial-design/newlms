import type { LabWorkspace } from "./types.js"

export const NORTHWIND_SALES_FILE = "northwind_sales.csv"
export const DATA_ANALYTICS_COURSE = "data-analytics"
export const NORTHWIND_LAB = "northwind"

export const VALID_NET_REVENUE = "valid_net_revenue" as const

export const LAB_OPERATIONS = [
  {
    id: VALID_NET_REVENUE,
    label: "Calculate valid net revenue",
    summary:
      "Keep rows with positive units, positive price, and returned = no, then apply net_revenue = units × unit_price × (1 − discount_pct / 100).",
  },
] as const

export type LabOperationId = (typeof LAB_OPERATIONS)[number]["id"]

export const NORTHWIND_LAB_DEF = {
  courseSlug: DATA_ANALYTICS_COURSE,
  courseTitle: "Data Analytics",
  labSlug: NORTHWIND_LAB,
  labTitle: "Northwind Lab",
  dataset: NORTHWIND_SALES_FILE,
  disclaimer:
    "This is a fictional Northwind Retail extract written for the course. It is not real company data, not a certificate, and not a job credential.",
  operations: LAB_OPERATIONS,
} as const

export function findLab(courseSlug: string, labSlug: string) {
  if (courseSlug === NORTHWIND_LAB_DEF.courseSlug && labSlug === NORTHWIND_LAB_DEF.labSlug) {
    return NORTHWIND_LAB_DEF
  }
  return null
}

export function operationMeta(operation: string) {
  return LAB_OPERATIONS.find((item) => item.id === operation) ?? null
}

export function workspaceShell(lesson: LabWorkspace["lesson"]): Omit<LabWorkspace, "dataset"> {
  return {
    courseSlug: NORTHWIND_LAB_DEF.courseSlug,
    courseTitle: NORTHWIND_LAB_DEF.courseTitle,
    labSlug: NORTHWIND_LAB_DEF.labSlug,
    labTitle: NORTHWIND_LAB_DEF.labTitle,
    operations: [...NORTHWIND_LAB_DEF.operations],
    lesson,
    disclaimer: NORTHWIND_LAB_DEF.disclaimer,
  }
}
