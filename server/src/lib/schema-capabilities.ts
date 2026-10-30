import { Prisma } from "@prisma/client"
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
  practiceWorkspaces: boolean
  policyAcceptance: boolean
  /** User.mustChangePassword from 20261028143000. Absent on the pre-October schema. */
  userMustChangePassword: boolean
  /** Course.publicationStatus from 20261028143000. Absent on the pre-October schema. */
  coursePublication: boolean
  /** CurriculumNode.summary and referenceUrl from 20261028143000. */
  curriculumNodeNotes: boolean
  /** PasswordResetToken from 20261024140000. */
  passwordReset: boolean
  /** SkylentEnquiry from 20261004000000. */
  skylentEnquiries: boolean
  /** EmployerMembership from 20261011000000. */
  employerMembership: boolean
  /** College and CollegeMembership from 20261028160000. */
  collegeMembership: boolean
  /** RoleName.PLATFORM_ADMIN from 20261028143000. */
  platformAdminRole: boolean
  /** RoleName.COLLEGE_ADMIN from 20261028160000. */
  collegeAdminRole: boolean
  /** ProgrammeCertificate from 20261101000000. */
  programmeCertificates: boolean
  /** FacultyDoubtTicket from 20261101000000. */
  facultyDoubtTickets: boolean
}

const REQUIRED: {
  curriculumNodeQuizLimits: { table: string; columns: string[] }
  assignmentGrading: { table: string; columns: string[] }
} = {
  curriculumNodeQuizLimits: { table: "CurriculumNode", columns: ["maxAttempts", "passingScore"] },
  assignmentGrading: { table: "AssignmentProgress", columns: ["grade", "feedback", "gradedById", "gradedAt"] },
}

export const UNAVAILABLE_MESSAGES = {
  degrees: "Degree programmes are not available yet.",
  employerApplications: "Sharing applications with employers is not available yet.",
  practice: "Practice workspaces are not available yet.",
  accounts: "Accounts cannot be created until the database update is applied.",
  enrolment: "Enrolment is not available until the database update is applied.",
  passwordReset: "Password reset is not available until the database update is applied.",
  enquiries: "Enquiries are not available until the database update is applied.",
  college: "College administration is not available until the database update is applied.",
  employerMembership: "Employer membership is not available until the database update is applied.",
  authoring: "Course authoring is not available until the database update is applied.",
  role: "That role is not available until the database update is applied.",
  certificates: "Certificate check is unavailable right now. Try again later.",
} as const

export function unavailableBody(error: string) {
  return { error, code: "unavailable" as const }
}

/** Prisma reports a missing table as P2021 and a missing column as P2022. */
export function isMissingSchemaError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2021" || error.code === "P2022")
}

/** The capability probe could not reach Postgres. This is not a rejected enrolment. */
export function isDatabaseUnavailableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true
  return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P1001" || error.code === "P1017")
}

export class PolicyStorageUnavailableError extends Error {
  constructor() {
    super(UNAVAILABLE_MESSAGES.accounts)
    this.name = "PolicyStorageUnavailableError"
  }
}

type ColumnRow = { table_name: string; column_name: string }

/** Pure mapping so tests can prove a missing column disables only that feature. */
export function capabilitiesFromColumns(
  rows: readonly ColumnRow[],
  enumLabels: readonly string[] = [],
): SchemaCapabilities {
  const present = new Set(rows.map((row) => `${row.table_name.toLowerCase()}.${row.column_name.toLowerCase()}`))
  const has = (table: string, column: string) => present.has(`${table.toLowerCase()}.${column.toLowerCase()}`)
  const labels = new Set(enumLabels.map((label) => label.toUpperCase()))
  return {
    curriculumNodeQuizLimits: REQUIRED.curriculumNodeQuizLimits.columns.every((column) => has("CurriculumNode", column)),
    assignmentGrading: REQUIRED.assignmentGrading.columns.every((column) => has("AssignmentProgress", column)),
    quizExplanations: has("QuizQuestion", "explanation"),
    skylentCertificates: has("SkylentCertificate", "id"),
    events: has("Event", "id"),
    degrees: has("Degree", "id"),
    jobApplicationSharing: has("JobApplication", "sharedWithEmployer"),
    practiceWorkspaces:
      has("PracticeWorkspace", "id") &&
      has("PracticeWorkspaceRevision", "id") &&
      has("PracticeWorkspaceResponse", "id"),
    policyAcceptance: has("PolicyAcceptance", "id"),
    userMustChangePassword: has("User", "mustChangePassword"),
    coursePublication: has("Course", "publicationStatus"),
    curriculumNodeNotes: has("CurriculumNode", "summary") && has("CurriculumNode", "referenceUrl"),
    passwordReset: has("PasswordResetToken", "id"),
    skylentEnquiries: has("SkylentEnquiry", "id"),
    employerMembership: has("EmployerMembership", "id"),
    collegeMembership: has("College", "id") && has("CollegeMembership", "id"),
    platformAdminRole: labels.has("PLATFORM_ADMIN"),
    collegeAdminRole: labels.has("COLLEGE_ADMIN"),
    programmeCertificates: has("ProgrammeCertificate", "id"),
    facultyDoubtTickets: has("FacultyDoubtTicket", "id"),
  }
}

/** Missing storage and a failed probe are both unavailable. Callers answer HTTP 503. */
export async function capabilityAvailable(key: keyof SchemaCapabilities): Promise<boolean> {
  try {
    return (await readSchemaCapabilities())[key]
  } catch (error) {
    console.error("Schema capability check failed:", error instanceof Error ? error.name : "unknown")
    return false
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
        'jobapplication',
        'practiceworkspace',
        'practiceworkspacerevision',
        'practiceworkspaceresponse',
        'policyacceptance',
        'user',
        'course',
        'passwordresettoken',
        'skylentenquiry',
        'employermembership',
        'college',
        'collegemembership',
        'programmecertificate',
        'facultydoubtticket'
      )
  `
  const enumRows = await prisma.$queryRaw<{ enumlabel: string }[]>`
    SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
     WHERE t.typname = 'RoleName'
       AND e.enumlabel IN ('PLATFORM_ADMIN', 'COLLEGE_ADMIN')`
  const value = capabilitiesFromColumns(
    rows,
    enumRows.map((row) => row.enumlabel).filter((label): label is string => typeof label === "string"),
  )
  cached = { at: Date.now(), value }
  return value
}

/** Credential fields that exist before User.mustChangePassword. */
export function userCredentialSelect(mustChangePassword: boolean) {
  return {
    id: true,
    email: true,
    passwordHash: true,
    displayName: true,
    createdAt: true,
    updatedAt: true,
    ...(mustChangePassword ? { mustChangePassword: true as const } : {}),
  }
}

export function curriculumNodeSelect(quizLimits: boolean, notes = false) {
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
    ...(notes ? { summary: true as const, referenceUrl: true as const } : {}),
    ...(quizLimits ? { maxAttempts: true, passingScore: true } : {}),
  }
}

export function courseCurriculumInclude(quizLimits: boolean, notes = false) {
  return {
    curriculum: {
      orderBy: { order: "asc" as const },
      include: {
        nodes: {
          orderBy: { order: "asc" as const },
          select: curriculumNodeSelect(quizLimits, notes),
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
