import type { LabWorkspace } from "./types.js"
import { NORTHWIND_SQL_EXAMPLES, NORTHWIND_SQL_PROMPTS } from "./sql/examples.js"
import {
  MAX_SQL_QUERY_CHARS,
  MAX_SQL_RESULT_ROWS,
  NORTHWIND_SQL_DIALECT,
  NORTHWIND_SQL_TABLE,
  SQL_OPERATION,
  SQL_TIMEOUT_MS,
} from "./sql/limits.js"

export const NORTHWIND_SALES_FILE = "northwind_sales.csv"
export const DATA_ANALYTICS_COURSE = "data-analytics"
export const NORTHWIND_LAB = "northwind"

export const VALID_NET_REVENUE = "valid_net_revenue" as const
export { SQL_OPERATION }

export const LAB_OPERATIONS = [
  {
    id: VALID_NET_REVENUE,
    label: "Calculate valid net revenue",
    summary:
      "Keep rows with positive units, positive price, and returned = no, then apply net_revenue = units × unit_price × (1 − discount_pct / 100).",
  },
] as const

export type LabOperationId = (typeof LAB_OPERATIONS)[number]["id"] | typeof SQL_OPERATION

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
  if (operation === SQL_OPERATION) {
    return { id: SQL_OPERATION, label: NORTHWIND_SQL_DIALECT, summary: "Write a read-only SELECT against northwind_sales." }
  }
  return LAB_OPERATIONS.find((item) => item.id === operation) ?? null
}

export function sqlWorkspaceMeta(): LabWorkspace["sql"] {
  return {
    dialect: NORTHWIND_SQL_DIALECT,
    table: NORTHWIND_SQL_TABLE,
    columns: [],
    examples: NORTHWIND_SQL_EXAMPLES.map((example) => ({ ...example })),
    prompts: [...NORTHWIND_SQL_PROMPTS],
    limits: {
      maxQueryChars: MAX_SQL_QUERY_CHARS,
      maxResultRows: MAX_SQL_RESULT_ROWS,
      timeoutMs: SQL_TIMEOUT_MS,
    },
    supported: [
      "SELECT",
      "FROM",
      "WHERE",
      "GROUP BY",
      "HAVING",
      "ORDER BY",
      "LIMIT",
      "AS",
      "DISTINCT",
      "SUM",
      "COUNT",
      "AVG",
      "MIN",
      "MAX",
      "CASE",
    ],
  }
}

export function workspaceShell(lesson: LabWorkspace["lesson"]): Omit<LabWorkspace, "dataset" | "sql"> {
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
