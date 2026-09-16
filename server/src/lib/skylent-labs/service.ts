import { prisma } from "../prisma.js"
import { findCourseBySlug, findNodeByLessonKey, resolveCourseEnrollment } from "../lms.js"
import { DA_AI_META } from "../skylent-ai/authored.js"
import { findLab, NORTHWIND_SALES_FILE, operationMeta, sqlWorkspaceMeta, workspaceShell } from "./catalog.js"
import { buildDatasetPreview, runLabOperation } from "./engine.js"
import { runNorthwindSql, sqlPreview } from "./sql/engine.js"
import { learnerSqlMessage, NorthwindSqlError } from "./sql/errors.js"
import { SQL_OPERATION } from "./sql/limits.js"
import type {
  LabGuidedRunResult,
  LabLessonContext,
  LabRunResult,
  LabSqlRunResult,
  SavedLabWork,
  SavedLabWorkSummary,
} from "./types.js"

export class LabServiceError extends Error {
  constructor(
    readonly code: "not_found" | "forbidden" | "invalid_operation" | "invalid_request" | "query_error" | "query_expensive",
    message: string,
  ) {
    super(message)
    this.name = "LabServiceError"
  }
}

async function requireLabAccess(userId: string, courseSlug: string, labSlug: string) {
  const lab = findLab(courseSlug, labSlug)
  if (!lab) throw new LabServiceError("not_found", "Lab not found")
  const course = await findCourseBySlug(courseSlug)
  if (!course) throw new LabServiceError("not_found", "Course not found")
  const enrollment = await resolveCourseEnrollment(userId, course.id)
  if (!enrollment) throw new LabServiceError("forbidden", "Enrolment required")
  return { lab, course, enrollment }
}

async function resolveLessonContext(
  course: Awaited<ReturnType<typeof findCourseBySlug>>,
  lessonKey?: string,
): Promise<LabLessonContext> {
  if (!course || !lessonKey) return null
  const located = await findNodeByLessonKey(course, lessonKey)
  if (located) {
    return {
      lessonKey,
      lessonTitle: located.node.title,
      moduleTitle: located.module.title,
    }
  }
  const authored = DA_AI_META.find((row) => row.id === lessonKey)
  if (!authored) return null
  return {
    lessonKey,
    lessonTitle: authored.title,
    moduleTitle: null,
  }
}

function asGuidedResult(value: unknown): LabGuidedRunResult | null {
  if (!value || typeof value !== "object") return null
  const row = value as Partial<LabGuidedRunResult>
  if (row.operation !== "valid_net_revenue") return null
  if (typeof row.validRows !== "number" || typeof row.netRevenue !== "number") return null
  return row as LabGuidedRunResult
}

function asSqlResult(value: unknown): LabSqlRunResult | null {
  if (!value || typeof value !== "object") return null
  const row = value as Partial<LabSqlRunResult>
  if (row.operation !== "sql") return null
  if (typeof row.query !== "string") return null
  if (!Array.isArray(row.columns) || !Array.isArray(row.rows)) return null
  return row as LabSqlRunResult
}

function asRunResult(value: unknown): LabRunResult | null {
  return asGuidedResult(value) ?? asSqlResult(value)
}

function queryFromInput(input: unknown, result: LabRunResult | null): string | null {
  if (input && typeof input === "object" && "query" in input && typeof input.query === "string") {
    return input.query
  }
  if (result && result.operation === "sql") return result.query
  return null
}

function toSummary(row: {
  id: string
  title: string
  dataset: string
  operation: string
  createdAt: Date
  result: unknown
}): SavedLabWorkSummary {
  const result = asRunResult(row.result)
  const sql = result && result.operation === "sql" ? result : null
  const guided = result && result.operation === "valid_net_revenue" ? result : null
  return {
    id: row.id,
    title: row.title,
    dataset: row.dataset,
    operation: row.operation,
    operationLabel: result?.operationLabel ?? operationMeta(row.operation)?.label ?? row.operation,
    validRows: guided?.validRows ?? null,
    netRevenueLabel: guided?.netRevenueLabel ?? null,
    rowCount: sql?.rowCount ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

function throwSqlServiceError(error: unknown): never {
  if (error instanceof LabServiceError) throw error
  const mapped = learnerSqlMessage(error)
  if (mapped.code === "expensive") {
    throw new LabServiceError("query_expensive", mapped.message)
  }
  throw new LabServiceError("query_error", mapped.message)
}

function compactSqlResult(result: LabSqlRunResult): LabSqlRunResult {
  return {
    ...result,
    rows: sqlPreview(result).rows,
  }
}

export async function getLabWorkspace(options: {
  userId: string
  courseSlug: string
  labSlug: string
  lessonKey?: string
}) {
  const { course } = await requireLabAccess(options.userId, options.courseSlug, options.labSlug)
  const lesson = await resolveLessonContext(course, options.lessonKey)
  const dataset = buildDatasetPreview()
  return {
    ...workspaceShell(lesson),
    dataset,
    sql: {
      ...sqlWorkspaceMeta(),
      columns: dataset.columns,
    },
  }
}

export async function executeLabOperation(options: {
  userId: string
  courseSlug: string
  labSlug: string
  operation: string
}) {
  await requireLabAccess(options.userId, options.courseSlug, options.labSlug)
  try {
    return runLabOperation(options.operation)
  } catch (error) {
    if (error instanceof Error && error.message === "invalid_operation") {
      throw new LabServiceError("invalid_operation", "Invalid operation")
    }
    throw error
  }
}

export async function executeNorthwindSql(options: {
  userId: string
  courseSlug: string
  labSlug: string
  query: string
}) {
  await requireLabAccess(options.userId, options.courseSlug, options.labSlug)
  try {
    return await runNorthwindSql(options.query)
  } catch (error) {
    throwSqlServiceError(error)
  }
}

export async function saveLabWork(options: {
  userId: string
  courseSlug: string
  labSlug: string
  operation: string
  lessonKey?: string
  query?: string
}) {
  await requireLabAccess(options.userId, options.courseSlug, options.labSlug)

  if (options.operation === SQL_OPERATION) {
    let result: LabSqlRunResult
    try {
      result = await runNorthwindSql(options.query ?? "")
    } catch (error) {
      throwSqlServiceError(error)
    }
    const stored = compactSqlResult(result)
    const created = await prisma.labWork.create({
      data: {
        userId: options.userId,
        courseSlug: options.courseSlug,
        labSlug: options.labSlug,
        dataset: NORTHWIND_SALES_FILE,
        operation: SQL_OPERATION,
        title: "Northwind SQL",
        lessonKey: options.lessonKey || null,
        input: {
          operation: SQL_OPERATION,
          lessonKey: options.lessonKey || null,
          dataset: NORTHWIND_SALES_FILE,
          query: result.query,
          table: result.table,
        },
        result: {
          ...stored,
          preview: sqlPreview(result),
        },
      },
    })
    return {
      ...toSummary({ ...created, result: stored }),
      courseSlug: created.courseSlug,
      labSlug: created.labSlug,
      lessonKey: created.lessonKey,
      query: result.query,
      result,
    } satisfies SavedLabWork
  }

  const result = await executeLabOperation(options)
  const meta = operationMeta(options.operation)
  const title = "Northwind revenue check"
  const created = await prisma.labWork.create({
    data: {
      userId: options.userId,
      courseSlug: options.courseSlug,
      labSlug: options.labSlug,
      dataset: NORTHWIND_SALES_FILE,
      operation: options.operation,
      title,
      lessonKey: options.lessonKey || null,
      input: {
        operation: options.operation,
        lessonKey: options.lessonKey || null,
        dataset: NORTHWIND_SALES_FILE,
      },
      result,
    },
  })
  return {
    id: created.id,
    title: created.title,
    dataset: created.dataset,
    operation: created.operation,
    operationLabel: meta?.label ?? result.operationLabel,
    validRows: result.validRows,
    netRevenueLabel: result.netRevenueLabel,
    rowCount: null,
    createdAt: created.createdAt.toISOString(),
    courseSlug: created.courseSlug,
    labSlug: created.labSlug,
    lessonKey: created.lessonKey,
    query: null,
    result,
  } satisfies SavedLabWork
}

export async function listLabWork(options: { userId: string; courseSlug: string; labSlug: string }) {
  await requireLabAccess(options.userId, options.courseSlug, options.labSlug)
  const rows = await prisma.labWork.findMany({
    where: {
      userId: options.userId,
      courseSlug: options.courseSlug,
      labSlug: options.labSlug,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
  return rows.map(toSummary)
}

export async function getSavedLabWork(options: {
  userId: string
  courseSlug: string
  labSlug: string
  workId: string
}) {
  await requireLabAccess(options.userId, options.courseSlug, options.labSlug)
  const row = await prisma.labWork.findFirst({
    where: {
      id: options.workId,
      userId: options.userId,
      courseSlug: options.courseSlug,
      labSlug: options.labSlug,
    },
  })
  if (!row) throw new LabServiceError("not_found", "Saved work not found")

  if (row.operation === SQL_OPERATION) {
    const stored = asSqlResult(row.result)
    const query = queryFromInput(row.input, stored)
    if (!query) throw new LabServiceError("not_found", "Saved work not found")
    let result: LabSqlRunResult
    try {
      result = await runNorthwindSql(query)
    } catch {
      if (!stored) throw new LabServiceError("not_found", "Saved work not found")
      result = stored
    }
    return {
      ...toSummary({ ...row, result }),
      courseSlug: row.courseSlug,
      labSlug: row.labSlug,
      lessonKey: row.lessonKey,
      query,
      result,
    } satisfies SavedLabWork
  }

  const result = asGuidedResult(row.result)
  if (!result) throw new LabServiceError("not_found", "Saved work not found")
  return {
    ...toSummary(row),
    courseSlug: row.courseSlug,
    labSlug: row.labSlug,
    lessonKey: row.lessonKey,
    query: null,
    result,
  } satisfies SavedLabWork
}
