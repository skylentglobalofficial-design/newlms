import { prisma } from "./prisma.js"
import { classifyMigrationHistory, listLocalMigrations, type MigrationRow } from "./migration-history.js"

export type MigrationGuardState =
  | { status: "ok"; pending: string[]; failed: string[] }
  | { status: "pending"; pending: string[]; failed: string[] }
  | { status: "unknown"; pending: string[]; failed: string[]; reason: string }

let confirmed = false

/**
 * Compares the migration folders shipped with this release against `_prisma_migrations`.
 * Read-only. Once every shipped migration is applied the result is cached for the process lifetime.
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
  return { status: "pending", pending: report.pending, failed: report.failed }
}

export async function logMigrationStateOnStartup(): Promise<void> {
  const state = await checkMigrationState()
  if (state.status === "ok") return
  if (state.status === "unknown") {
    console.warn(`Migration check skipped: ${state.reason}`)
    return
  }
  console.error(
    `Database schema is behind this release. Pending: ${state.pending.join(", ") || "none"}. ` +
      `Failed: ${state.failed.join(", ") || "none"}. Run \`npx prisma migrate deploy\`; until then /api/v1/health returns 503.`,
  )
}
