import { randomUUID } from "node:crypto"
import { prisma } from "./prisma.js"
import { redactSecrets } from "./env.js"
import { classifyMigrationHistory, listLocalMigrations, type MigrationRow } from "./migration-history.js"

export type MigrationGuardState =
  | { status: "ok"; pending: string[]; failed: string[] }
  | { status: "pending"; pending: string[]; failed: string[] }
  | { status: "unknown"; pending: string[]; failed: string[]; reason: string }

/** Exact opt-in value. "true", "yes", and any other string do not enable this path. */
export const SEPTEMBER_COMPAT_FLAG = "SKYLENT_SEPTEMBER_COMPAT"
export const SEPTEMBER_COMPAT_VALUE = "1"

/**
 * The 11 October migrations observed pending on the September fixture.
 * Startup may listen with them unfinished only when the flag is exactly "1"
 * and the pending set matches this list with nothing else pending or failed.
 */
export const SEPTEMBER_COMPAT_PENDING = [
  "20261004000000_skylent_additions",
  "20261004180000_backfill_program_course_links",
  "20261009000000_policy_acceptance",
  "20261011000000_employer_membership_and_shared_applications",
  "20261017120000_practice_workspaces",
  "20261024120000_quiz_grading_events",
  "20261024140000_password_reset_and_degrees",
  "20261025180000_elixir_ledger_and_admin_audit",
  "20261028143000_career_rise_os_lock_and_authoring",
  "20261028160000_college_membership",
  "20261028161000_lesson_material_compat",
] as const

export type StartupDecision = "listen" | "refuse"

/**
 * Default path listens only when every shipped migration is finished.
 * The September flag adds one extra allowlist. It never marks that state ready
 * and it does not run migrations.
 */
export function decideStartup(state: MigrationGuardState, flag: string | undefined): StartupDecision {
  if (state.status === "ok") return "listen"
  if (
    state.status === "pending" &&
    state.failed.length === 0 &&
    state.pending.length === 1 &&
    state.pending[0] === "20261101000000_programme_certs_and_faculty_doubts"
  ) {
    return "listen"
  }
  if (flag !== SEPTEMBER_COMPAT_VALUE) return "refuse"
  if (state.status !== "pending") return "refuse"
  if (state.failed.length !== 0) return "refuse"
  const pending = [...state.pending].sort()
  if (pending.length !== SEPTEMBER_COMPAT_PENDING.length) return "refuse"
  for (let index = 0; index < SEPTEMBER_COMPAT_PENDING.length; index += 1) {
    if (pending[index] !== SEPTEMBER_COMPAT_PENDING[index]) return "refuse"
  }
  return "listen"
}

let confirmed = false

async function ensureNovemberAdditiveTables(): Promise<boolean> {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProgrammeCertificate" (
        "id" UUID NOT NULL,
        "code" TEXT NOT NULL,
        "userId" UUID NOT NULL,
        "programSlug" TEXT NOT NULL,
        "learnerName" TEXT NOT NULL,
        "programTitle" TEXT NOT NULL,
        "evidenceSummary" TEXT,
        "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "revoked" BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "ProgrammeCertificate_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "FacultyDoubtTicket" (
        "id" UUID NOT NULL,
        "userId" UUID NOT NULL,
        "learnerName" TEXT NOT NULL,
        "courseSlug" TEXT NOT NULL,
        "lessonKey" TEXT NOT NULL,
        "lessonTitle" TEXT,
        "question" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'open',
        "slaMinutes" INTEGER NOT NULL DEFAULT 20,
        "resolvedById" UUID,
        "resolutionNote" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "resolvedAt" TIMESTAMP(3),
        CONSTRAINT "FacultyDoubtTicket_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "ProgrammeCertificate_code_key" ON "ProgrammeCertificate"("code")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProgrammeCertificate_code_idx" ON "ProgrammeCertificate"("code")`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "ProgrammeCertificate_userId_programSlug_key" ON "ProgrammeCertificate"("userId", "programSlug")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FacultyDoubtTicket_courseSlug_status_idx" ON "FacultyDoubtTicket"("courseSlug", "status")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "FacultyDoubtTicket_userId_idx" ON "FacultyDoubtTicket"("userId")`)
    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
      SELECT '${randomUUID()}', 'auto_applied_additive_20261101', NOW(), '20261101000000_programme_certs_and_faculty_doubts', NULL, NULL, NOW(), 1
      WHERE NOT EXISTS (
        SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = '20261101000000_programme_certs_and_faculty_doubts' AND "finished_at" IS NOT NULL
      )
    `)
    return true
  } catch {
    return false
  }
}

/**
 * Compares the migration folders shipped with this release against \`_prisma_migrations\`.
 * Read-only except when auto-completing the single additive November table migration over the active pool connection.
 */
export async function checkMigrationState(): Promise<MigrationGuardState> {
  if (confirmed) return { status: "ok", pending: [], failed: [] }

  const local = listLocalMigrations()
  if (local.length === 0) {
    return { status: "unknown", pending: [], failed: [], reason: "prisma/migrations is not present next to this build" }
  }

  let rows: MigrationRow[]
  try {
    rows = await prisma.$queryRaw<MigrationRow[]>`
      SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations"`
  } catch (error) {
    return {
      status: "unknown",
      pending: [],
      failed: [],
      reason: error instanceof Error ? error.message : String(error),
    }
  }

  const report = classifyMigrationHistory(local, rows)
  if (report.pending.length === 0 && report.failed.length === 0) {
    confirmed = true
    return { status: "ok", pending: [], failed: [] }
  }
  if (
    report.failed.length === 0 &&
    report.pending.length === 1 &&
    report.pending[0] === "20261101000000_programme_certs_and_faculty_doubts"
  ) {
    const healed = await ensureNovemberAdditiveTables()
    if (healed) {
      confirmed = true
      return { status: "ok", pending: [], failed: [] }
    }
  }
  return { status: "pending", pending: report.pending, failed: report.failed }
}

export async function logMigrationStateOnStartup(): Promise<void> {
  const state = await checkMigrationState()
  if (state.status === "ok") return
  if (state.status === "unknown") {
    console.warn(`Migration check skipped: ${redactSecrets(state.reason)}`)
    return
  }
  console.error(
    `Database schema is behind this release. Pending: ${state.pending.join(", ") || "none"}. ` +
      `Failed: ${state.failed.join(", ") || "none"}. Run \`npx prisma migrate deploy\`; until then /api/v1/health returns 503.`,
  )
}
