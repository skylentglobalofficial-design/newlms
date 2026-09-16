import { prisma } from "../prisma.js"
import { findCourseBySlug, resolveCourseEnrollment } from "../lms.js"
import { getSavedLabWork, LabServiceError, listLabWork } from "../skylent-labs/service.js"
import { SQL_OPERATION } from "../skylent-labs/catalog.js"
import type { LabSqlRunResult } from "../skylent-labs/types.js"
import {
  findProjectDefinition,
  findProjectTask,
  isProjectTaskKey,
  NORTHWIND_PROJECT_TYPE,
  PROJECT_REFLECTION_MAX,
  PROJECT_REFLECTION_MIN,
  type ProjectStatus,
  type ProjectTaskDefinition,
  type ProjectTaskKey,
  type ReflectionField,
} from "./catalog.js"
import type {
  ProjectEvidence,
  ProjectLabWorkOption,
  ProjectReflection,
  ProjectSummary,
  ProjectTaskView,
  ProjectWorkspace,
  StoredProjectTask,
} from "./types.js"

export class ProjectServiceError extends Error {
  constructor(
    readonly code: "not_found" | "forbidden" | "invalid_request",
    message: string,
  ) {
    super(message)
    this.name = "ProjectServiceError"
  }
}

function emptyReflection(): ProjectReflection {
  return { finding: "", whyItMatters: "", recommendation: "" }
}

function seedTasks(definition: NonNullable<ReturnType<typeof findProjectDefinition>>): StoredProjectTask[] {
  return definition.tasks.map((task) => ({
    key: task.key,
    status: "open" as const,
    labWorkId: null,
    completedAt: null,
  }))
}

function asReflection(value: unknown): ProjectReflection {
  if (!value || typeof value !== "object") return emptyReflection()
  const row = value as Partial<ProjectReflection>
  return {
    finding: typeof row.finding === "string" ? row.finding : "",
    whyItMatters: typeof row.whyItMatters === "string" ? row.whyItMatters : "",
    recommendation: typeof row.recommendation === "string" ? row.recommendation : "",
  }
}

function asStoredTasks(
  value: unknown,
  definition: NonNullable<ReturnType<typeof findProjectDefinition>>,
): StoredProjectTask[] {
  const rows = Array.isArray(value) ? value : []
  return definition.tasks.map((task) => {
    const match = rows.find((row) => row && typeof row === "object" && (row as StoredProjectTask).key === task.key) as
      | StoredProjectTask
      | undefined
    const labWorkId = typeof match?.labWorkId === "string" ? match.labWorkId : null
    const completedAt = typeof match?.completedAt === "string" ? match.completedAt : null
    const status = match?.status === "complete" ? "complete" : "open"
    return { key: task.key, status, labWorkId, completedAt }
  })
}

function reflectionLengthOk(value: string) {
  const trimmed = value.trim()
  return trimmed.length >= PROJECT_REFLECTION_MIN && trimmed.length <= PROJECT_REFLECTION_MAX
}

function validateReflectionField(label: string, value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== "string") throw new ProjectServiceError("invalid_request", `${label} must be text.`)
  if (value.length > PROJECT_REFLECTION_MAX) {
    throw new ProjectServiceError("invalid_request", `${label} is too long.`)
  }
  const trimmed = value.trim()
  if (trimmed.length > 0 && trimmed.length < PROJECT_REFLECTION_MIN) {
    throw new ProjectServiceError("invalid_request", `Write a little more for ${label.toLowerCase()}, or leave it blank.`)
  }
  return value
}

function completeCount(tasks: StoredProjectTask[]) {
  return tasks.filter((task) => task.status === "complete").length
}

function deriveStatus(tasks: StoredProjectTask[], savedAt: Date | null): ProjectStatus {
  const complete = completeCount(tasks)
  if (savedAt && complete === tasks.length) return "ready_to_review"
  if (savedAt) return "saved"
  if (complete > 0) return "in_progress"
  return "not_started"
}

function labHref(task: ProjectTaskDefinition) {
  if (!task.labMode) return null
  const params = new URLSearchParams()
  params.set("project", NORTHWIND_PROJECT_TYPE)
  if (task.labMode === "sql") params.set("mode", "sql")
  if (task.exampleId) params.set("example", task.exampleId)
  return `/os/labs/data-analytics/northwind?${params.toString()}`
}

function viewHref(labWorkId: string, operation: string) {
  const params = new URLSearchParams()
  params.set("project", NORTHWIND_PROJECT_TYPE)
  params.set("work", labWorkId)
  if (operation === SQL_OPERATION) params.set("mode", "sql")
  return `/os/labs/data-analytics/northwind?${params.toString()}`
}

function isCategorySql(result: LabSqlRunResult) {
  if (!result.chart.chartable) return false
  return /categor/i.test(result.chart.labelKey)
}

function isMonthlySql(result: LabSqlRunResult) {
  if (!result.chart.chartable) return false
  return result.chart.type === "line" || /month|date|week|year|period/i.test(result.chart.labelKey)
}

async function requireProjectCourseAccess(userId: string, courseSlug: string) {
  const course = await findCourseBySlug(courseSlug)
  if (!course) throw new ProjectServiceError("not_found", "Course not found")
  const enrollment = await resolveCourseEnrollment(userId, course.id)
  if (!enrollment) throw new ProjectServiceError("forbidden", "Enrol in Data Analytics to open this project.")
  return { course, enrollment }
}

async function loadOwnedProject(userId: string, projectId: string) {
  const row = await prisma.learnerProject.findFirst({
    where: { id: projectId, userId },
  })
  if (!row) throw new ProjectServiceError("not_found", "Project not found")
  return row
}

function toOption(row: {
  id: string
  title: string
  operation: string
  operationLabel: string
  rowCount: number | null
  createdAt: string
}): ProjectLabWorkOption {
  return {
    id: row.id,
    title: row.title,
    operation: row.operation,
    operationLabel: row.operationLabel,
    rowCount: row.rowCount,
    chartable: false,
    chartType: null,
    createdAt: row.createdAt,
  }
}

async function hydrateEvidence(
  userId: string,
  courseSlug: string,
  labSlug: string,
  labWorkId: string | null,
): Promise<ProjectEvidence | null> {
  if (!labWorkId) return null
  try {
    const work = await getSavedLabWork({ userId, courseSlug, labSlug, workId: labWorkId })
    const sql = work.result.operation === "sql" ? work.result : null
    const guided = work.result.operation === "valid_net_revenue" ? work.result : null
    return {
      labWorkId: work.id,
      title: work.title,
      dataset: work.dataset,
      operation: work.operation,
      operationLabel: work.operationLabel,
      source: work.operation === SQL_OPERATION ? "Northwind SQL Lab Work" : "Northwind Lab Work",
      rowCount: sql?.rowCount ?? null,
      chartable: Boolean(sql?.chart.chartable),
      chartType: sql?.chart.chartable ? sql.chart.type : null,
      validRows: guided?.validRows ?? null,
      netRevenueLabel: guided?.netRevenueLabel ?? null,
      createdAt: work.createdAt,
      viewHref: viewHref(work.id, work.operation),
      chart: sql?.chart.chartable ? sql.chart : null,
    }
  } catch (error) {
    if (error instanceof LabServiceError && (error.code === "not_found" || error.code === "forbidden")) {
      return null
    }
    throw error
  }
}

async function toWorkspace(row: {
  id: string
  userId: string
  projectType: string
  courseSlug: string
  title: string
  status: string
  tasks: unknown
  reflection: unknown
  savedAt: Date | null
  createdAt: Date
  updatedAt: Date
}): Promise<ProjectWorkspace> {
  const definition = findProjectDefinition(row.projectType)
  if (!definition) throw new ProjectServiceError("not_found", "Project not found")
  const tasks = asStoredTasks(row.tasks, definition)
  const reflection = asReflection(row.reflection)
  const [availableWork, evidenceList] = await Promise.all([
    listLabWork({ userId: row.userId, courseSlug: definition.courseSlug, labSlug: definition.labSlug }),
    Promise.all(tasks.map((task) => hydrateEvidence(row.userId, definition.courseSlug, definition.labSlug, task.labWorkId))),
  ])

  const views: ProjectTaskView[] = definition.tasks.map((task, index) => {
    const stored = tasks[index]!
    return {
      key: task.key,
      number: task.number,
      title: task.title,
      summary: task.summary,
      tool: task.tool,
      toolLabel: task.toolLabel,
      completion: task.completion,
      reflectionField: task.reflectionField,
      status: stored.status,
      completedAt: stored.completedAt,
      openLabHref: labHref(task),
      evidence: evidenceList[index] ?? null,
      evidenceHint: task.evidenceHint,
    }
  })

  return {
    id: row.id,
    projectType: row.projectType,
    courseSlug: row.courseSlug,
    title: row.title,
    goal: definition.goal,
    dataset: definition.dataset,
    context: definition.context,
    brief: [...definition.brief],
    disclaimer: definition.disclaimer,
    status: deriveStatus(tasks, row.savedAt),
    progress: { complete: completeCount(tasks), total: tasks.length },
    tasks: views,
    reflection,
    availableWork: availableWork.map(toOption),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    savedAt: row.savedAt?.toISOString() ?? null,
  }
}

export async function listLearnerProjects(userId: string): Promise<ProjectSummary[]> {
  const rows = await prisma.learnerProject.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  })
  return rows.flatMap((row) => {
    const definition = findProjectDefinition(row.projectType)
    if (!definition) return []
    const tasks = asStoredTasks(row.tasks, definition)
    return [
      {
        id: row.id,
        projectType: row.projectType,
        courseSlug: row.courseSlug,
        title: row.title,
        status: deriveStatus(tasks, row.savedAt),
        progress: { complete: completeCount(tasks), total: tasks.length },
        updatedAt: row.updatedAt.toISOString(),
      },
    ]
  })
}

export async function ensureLearnerProject(userId: string, projectType: string): Promise<ProjectWorkspace> {
  const definition = findProjectDefinition(projectType)
  if (!definition) throw new ProjectServiceError("not_found", "Project not found")
  await requireProjectCourseAccess(userId, definition.courseSlug)

  const row = await prisma.learnerProject.upsert({
    where: { userId_projectType: { userId, projectType: definition.projectType } },
    create: {
      userId,
      projectType: definition.projectType,
      courseSlug: definition.courseSlug,
      title: definition.title,
      status: "not_started",
      tasks: seedTasks(definition),
      reflection: emptyReflection(),
    },
    update: {},
  })
  return toWorkspace(row)
}

export async function getLearnerProject(userId: string, projectId: string): Promise<ProjectWorkspace> {
  const row = await loadOwnedProject(userId, projectId)
  const definition = findProjectDefinition(row.projectType)
  if (!definition) throw new ProjectServiceError("not_found", "Project not found")
  await requireProjectCourseAccess(userId, definition.courseSlug)
  return toWorkspace(row)
}

function applyReflectionCompletion(tasks: StoredProjectTask[], reflection: ProjectReflection) {
  const now = new Date().toISOString()
  const fieldByKey: Record<Extract<ProjectTaskKey, "finding" | "why_it_matters" | "recommendation">, ReflectionField> = {
    finding: "finding",
    why_it_matters: "whyItMatters",
    recommendation: "recommendation",
  }
  return tasks.map((task) => {
    const field = fieldByKey[task.key as keyof typeof fieldByKey]
    if (!field) return task
    const ok = reflectionLengthOk(reflection[field])
    if (ok) {
      return { ...task, status: "complete" as const, completedAt: task.completedAt ?? now }
    }
    return { ...task, status: "open" as const, completedAt: null }
  })
}

async function persistProject(
  row: Awaited<ReturnType<typeof loadOwnedProject>>,
  tasks: StoredProjectTask[],
  reflection: ProjectReflection,
  savedAt: Date | null,
) {
  const status = deriveStatus(tasks, savedAt)
  const updated = await prisma.learnerProject.update({
    where: { id: row.id },
    data: {
      tasks,
      reflection,
      status,
      savedAt,
    },
  })
  return toWorkspace(updated)
}

export async function completeProjectTask(options: {
  userId: string
  projectId: string
  taskKey: string
}) {
  if (!isProjectTaskKey(options.taskKey)) throw new ProjectServiceError("invalid_request", "Unknown task.")
  const row = await loadOwnedProject(options.userId, options.projectId)
  const definition = findProjectDefinition(row.projectType)
  if (!definition) throw new ProjectServiceError("not_found", "Project not found")
  await requireProjectCourseAccess(options.userId, definition.courseSlug)
  const taskDef = findProjectTask(row.projectType, options.taskKey)
  if (!taskDef) throw new ProjectServiceError("invalid_request", "Unknown task.")
  if (taskDef.completion !== "explicit") {
    throw new ProjectServiceError(
      "invalid_request",
      taskDef.completion === "lab_work"
        ? "Complete this task by attaching saved lab work."
        : "Complete this task by writing your analysis.",
    )
  }

  const tasks = asStoredTasks(row.tasks, definition).map((task) =>
    task.key === options.taskKey
      ? { ...task, status: "complete" as const, completedAt: task.completedAt ?? new Date().toISOString() }
      : task,
  )
  return persistProject(row, tasks, asReflection(row.reflection), row.savedAt)
}

export async function attachProjectEvidence(options: {
  userId: string
  projectId: string
  taskKey: string
  labWorkId: string
}) {
  if (!isProjectTaskKey(options.taskKey)) throw new ProjectServiceError("invalid_request", "Unknown task.")
  const row = await loadOwnedProject(options.userId, options.projectId)
  const definition = findProjectDefinition(row.projectType)
  if (!definition) throw new ProjectServiceError("not_found", "Project not found")
  await requireProjectCourseAccess(options.userId, definition.courseSlug)
  const taskDef = findProjectTask(row.projectType, options.taskKey)
  if (!taskDef) throw new ProjectServiceError("invalid_request", "Unknown task.")
  if (taskDef.completion === "reflection") {
    throw new ProjectServiceError("invalid_request", "This task is completed by writing, not by attaching lab work.")
  }

  let work
  try {
    work = await getSavedLabWork({
      userId: options.userId,
      courseSlug: definition.courseSlug,
      labSlug: definition.labSlug,
      workId: options.labWorkId,
    })
  } catch (error) {
    if (error instanceof LabServiceError && (error.code === "not_found" || error.code === "forbidden")) {
      throw new ProjectServiceError("not_found", "Saved work not found")
    }
    throw error
  }

  if (work.courseSlug !== definition.courseSlug || work.labSlug !== definition.labSlug) {
    throw new ProjectServiceError("invalid_request", "That saved work does not belong to this lab.")
  }

  if (taskDef.key === "category_revenue") {
    if (work.result.operation !== "sql" || !isCategorySql(work.result)) {
      throw new ProjectServiceError("invalid_request", "Attach saved SQL work that shows revenue by category.")
    }
  }
  if (taskDef.key === "monthly_trend") {
    if (work.result.operation !== "sql" || !isMonthlySql(work.result)) {
      throw new ProjectServiceError("invalid_request", "Attach saved SQL work that shows a monthly or date trend.")
    }
  }
  if (taskDef.key === "validate_data") {
    const sql = work.result.operation === "sql" ? work.result : null
    const guided = work.result.operation === "valid_net_revenue" ? work.result : null
    const countOnly = Boolean(sql && sql.columns.length === 1 && sql.rowCount === 1)
    if (!guided && !countOnly) {
      throw new ProjectServiceError("invalid_request", "Attach the valid-row check or the Quick analysis result.")
    }
  }

  const now = new Date().toISOString()
  const tasks = asStoredTasks(row.tasks, definition).map((task) => {
    if (task.key !== options.taskKey) return task
    if (taskDef.completion === "lab_work") {
      return { ...task, labWorkId: work.id, status: "complete" as const, completedAt: now }
    }
    return { ...task, labWorkId: work.id }
  })
  return persistProject(row, tasks, asReflection(row.reflection), row.savedAt)
}

export async function updateProjectReflection(options: {
  userId: string
  projectId: string
  finding?: string
  whyItMatters?: string
  recommendation?: string
  save?: boolean
}) {
  const row = await loadOwnedProject(options.userId, options.projectId)
  const definition = findProjectDefinition(row.projectType)
  if (!definition) throw new ProjectServiceError("not_found", "Project not found")
  await requireProjectCourseAccess(options.userId, definition.courseSlug)

  const current = asReflection(row.reflection)
  const reflection: ProjectReflection = {
    finding: validateReflectionField("Finding", options.finding) ?? current.finding,
    whyItMatters: validateReflectionField("Why it matters", options.whyItMatters) ?? current.whyItMatters,
    recommendation: validateReflectionField("Recommendation", options.recommendation) ?? current.recommendation,
  }
  const tasks = applyReflectionCompletion(asStoredTasks(row.tasks, definition), reflection)
  const savedAt = options.save ? new Date() : row.savedAt
  return persistProject(row, tasks, reflection, savedAt)
}
