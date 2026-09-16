import { prisma } from "../prisma.js"
import { findCourseBySlug, findNodeByLessonKey, resolveCourseEnrollment } from "../lms.js"
import { DA_AI_META } from "../skylent-ai/authored.js"
import { findLab, NORTHWIND_SALES_FILE, operationMeta, workspaceShell } from "./catalog.js"
import { buildDatasetPreview, runLabOperation } from "./engine.js"
import type { LabLessonContext, LabRunResult, SavedLabWork, SavedLabWorkSummary } from "./types.js"

export class LabServiceError extends Error {
  constructor(
    readonly code: "not_found" | "forbidden" | "invalid_operation" | "invalid_request",
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

function asRunResult(value: unknown): LabRunResult | null {
  if (!value || typeof value !== "object") return null
  const row = value as Partial<LabRunResult>
  if (row.operation !== "valid_net_revenue") return null
  if (typeof row.validRows !== "number" || typeof row.netRevenue !== "number") return null
  return row as LabRunResult
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
  return {
    id: row.id,
    title: row.title,
    dataset: row.dataset,
    operation: row.operation,
    operationLabel: result?.operationLabel ?? operationMeta(row.operation)?.label ?? row.operation,
    validRows: result?.validRows ?? null,
    netRevenueLabel: result?.netRevenueLabel ?? null,
    createdAt: row.createdAt.toISOString(),
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
  return {
    ...workspaceShell(lesson),
    dataset: buildDatasetPreview(),
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

export async function saveLabWork(options: {
  userId: string
  courseSlug: string
  labSlug: string
  operation: string
  lessonKey?: string
}) {
  await requireLabAccess(options.userId, options.courseSlug, options.labSlug)
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
    createdAt: created.createdAt.toISOString(),
    courseSlug: created.courseSlug,
    labSlug: created.labSlug,
    lessonKey: created.lessonKey,
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
  const result = asRunResult(row.result)
  if (!result) throw new LabServiceError("not_found", "Saved work not found")
  return {
    ...toSummary(row),
    courseSlug: row.courseSlug,
    labSlug: row.labSlug,
    lessonKey: row.lessonKey,
    result,
  } satisfies SavedLabWork
}
