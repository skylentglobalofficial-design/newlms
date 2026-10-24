import { prisma } from "./prisma.js"

/**
 * Columns and tables added by the October 2026 migrations.
 * Production can be running this release before `prisma migrate deploy`.
 * Reads must keep working on the previous schema; features that need the new
 * columns stay unavailable until those migrations are applied.
 */
export type SchemaCapabilities = {
  curriculumNodeQuizLimits: boolean
  assignmentGrading: boolean
  quizExplanations: boolean
  skylentCertificates: boolean
  events: boolean
  degrees: boolean
  jobApplicationSharing: boolean
}

const REQUIRED: Record<keyof SchemaCapabilities, { table: string; columns: string[] }> = {
  curriculumNodeQuizLimits: { table: "CurriculumNode", columns: ["maxAttempts", "passingScore"] },
  assignmentGrading: { table: "AssignmentProgress", columns: ["grade", "feedback", "gradedById", "gradedAt"] },
  quizExplanations: { table: "QuizQuestion", columns: ["explanation"] },
  skylentCertificates: { table: "SkylentCertificate", columns: ["id"] },
  events: { table: "Event", columns: ["id"] },
  degrees: { table: "Degree", columns: ["id"] },
  jobApplicationSharing: { table: "JobApplication", columns: ["sharedWithEmployer"] },
}

type ColumnRow = { table_name: string; column_name: string }

/** Pure mapping so tests can prove a missing column disables only that feature. */
export function capabilitiesFromColumns(rows: readonly ColumnRow[]): SchemaCapabilities {
  const present = new Set(rows.map((row) => `${row.table_name.toLowerCase()}.${row.column_name.toLowerCase()}`))
  const has = (table: string, column: string) => present.has(`${table.toLowerCase()}.${column.toLowerCase()}`)
  return {
    curriculumNodeQuizLimits: REQUIRED.curriculumNodeQuizLimits.columns.every((column) => has("CurriculumNode", column)),
    assignmentGrading: REQUIRED.assignmentGrading.columns.every((column) => has("AssignmentProgress", column)),
    quizExplanations: has("QuizQuestion", "explanation"),
    skylentCertificates: has("SkylentCertificate", "id"),
    events: has("Event", "id"),
    degrees: has("Degree", "id"),
    jobApplicationSharing: has("JobApplication", "sharedWithEmployer"),
  }
}

const CACHE_MS = 20_000
let cached: { at: number; value: SchemaCapabilities } | null = null

export function clearSchemaCapabilityCache() {
  cached = null
}

export async function readSchemaCapabilities(): Promise<SchemaCapabilities> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value
  const rows = await prisma.$queryRaw<ColumnRow[]>`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND lower(table_name) IN (
        'curriculumnode',
        'assignmentprogress',
        'quizquestion',
        'skylentcertificate',
        'event',
        'degree',
        'jobapplication'
      )
  `
  const value = capabilitiesFromColumns(rows)
  cached = { at: Date.now(), value }
  return value
}

export function curriculumNodeSelect(quizLimits: boolean) {
  return {
    id: true,
    sourceId: true,
    order: true,
    title: true,
    nodeType: true,
    duration: true,
    completed: true,
    muxPlaybackId: true,
    moduleId: true,
    ...(quizLimits ? { maxAttempts: true, passingScore: true } : {}),
  }
}

export function courseCurriculumInclude(quizLimits: boolean) {
  return {
    curriculum: {
      orderBy: { order: "asc" as const },
      include: {
        nodes: {
          orderBy: { order: "asc" as const },
          select: curriculumNodeSelect(quizLimits),
        },
      },
    },
  }
}

/** Fields that exist on AssignmentProgress before the grading migration. */
export function assignmentProgressSelect(grading: boolean) {
  return {
    id: true,
    userId: true,
    enrollmentId: true,
    nodeId: true,
    status: true,
    responseText: true,
    submittedAt: true,
    createdAt: true,
    updatedAt: true,
    ...(grading
      ? {
          grade: true,
          feedback: true,
          gradedById: true,
          gradedAt: true,
        }
      : {}),
  }
}

export function quizQuestionSelect(explanations: boolean) {
  return {
    id: true,
    nodeId: true,
    sortOrder: true,
    question: true,
    options: true,
    correctIndex: true,
    ...(explanations ? { explanation: true } : {}),
  }
}

export function jobApplicationSelect(sharing: boolean) {
  return {
    id: true,
    userId: true,
    jobId: true,
    employerId: true,
    roleTitle: true,
    status: true,
    appliedAt: true,
    nextActionAt: true,
    notes: true,
    source: true,
    createdAt: true,
    updatedAt: true,
    ...(sharing ? { sharedWithEmployer: true } : {}),
  }
}
