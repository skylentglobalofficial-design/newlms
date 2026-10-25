/**
 * Read-only migration preflight. Run before and after `prisma migrate deploy`.
 *
 *   npm run db:preflight                 # before: exit 0 when pending migrations can be applied safely
 *   npm run db:preflight -- --expect-none  # after: exit 0 only when nothing is pending
 *   npm run db:preflight -- --production   # refuse any target except the session pooler on port 5432
 *
 * Uses DIRECT_URL (falls back to DATABASE_URL) inside a READ ONLY transaction.
 * Prints the database host only, never credentials. Never resolves, deletes or edits migration history.
 */
import "dotenv/config"
import { PrismaClient } from "@prisma/client"

import { classifyDatabaseTarget } from "../server/src/lib/database-target.ts"
import {
  classifyMigrationHistory,
  createdObjects,
  destructiveStatements,
  listLocalMigrations,
  readMigrationSql,
  type MigrationRow,
} from "../server/src/lib/migration-history.ts"

const expectNone = process.argv.includes("--expect-none")
const requireProduction = process.argv.includes("--production")
const approveBackfill = process.argv.includes("--approve-backfill")
const BACKFILL = "20261004180000_backfill_program_course_links"
const url = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim()
if (!url) {
  console.error("Set DIRECT_URL or DATABASE_URL to the database to inspect.")
  console.log("\nDECISION: BLOCKED")
  process.exit(2)
}

const target = classifyDatabaseTarget(url)
const host = target.host
const database = target.database
if (requireProduction && !target.sessionPooler) {
  console.log(`Database host: ${host}  database: ${database}`)
  console.log(`Target: ${target.class}  port: ${target.port}`)
  console.log("\nBLOCKED:")
  console.log("  - Production preflight requires the Supabase session pooler on port 5432.")
  console.log("\nDECISION: BLOCKED")
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })

type ExistingObject = { kind: "table" | "type"; name: string }

async function main() {
  const local = listLocalMigrations()
  if (local.length === 0) throw new Error("No migrations found in prisma/migrations")

  const { rows, existing } = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY")
    const tableExists = await tx.$queryRaw<{ present: boolean }[]>`
      SELECT to_regclass('"_prisma_migrations"') IS NOT NULL AS present`
    const rows = tableExists[0]?.present
      ? await tx.$queryRaw<MigrationRow[]>`
          SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY migration_name, started_at`
      : []
    const existing = await tx.$queryRaw<ExistingObject[]>`
      SELECT 'table' AS kind, c.relname AS name
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = current_schema() AND c.relkind IN ('r', 'p', 'v', 'm')
      UNION ALL
      SELECT 'type' AS kind, t.typname AS name
        FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
       WHERE n.nspname = current_schema() AND t.typtype = 'e'`
    return { rows, existing }
  })

  const report = classifyMigrationHistory(local, rows)
  const existingKeys = new Set(existing.map((o) => `${o.kind}:${o.name}`))
  const blockers: string[] = []

  console.log(`Database host: ${host}  database: ${database}`)
  console.log(`Target: ${target.class}  port: ${target.port}`)
  console.log(`Release migrations: ${report.local.length}  applied: ${report.applied.length}  pending: ${report.pending.length}`)
  for (const name of report.applied) console.log(`  applied  ${name}`)

  if (rows.length === 0) blockers.push('"_prisma_migrations" is missing or empty. This is not the production database, or it was never migrated.')

  for (const name of report.pending) {
    const sql = readMigrationSql(name)
    const collisions = createdObjects(sql).filter((o) => existingKeys.has(`${o.kind}:${o.name}`))
    const destructive = destructiveStatements(sql)
    console.log(`  pending  ${name}`)
    for (const o of collisions) blockers.push(`${name} creates ${o.kind} "${o.name}", which already exists.`)
    for (const statement of destructive) blockers.push(`${name} contains a destructive statement: ${statement.slice(0, 120)}`)
  }
  for (const name of report.failed) {
    console.log(`  FAILED   ${name}`)
    blockers.push(`${name} started but never finished (P3009). Investigate before deploying; do not mark it resolved blindly.`)
  }
  for (const name of report.rolledBack) console.log(`  rolled back (ignored by Prisma)  ${name}`)
  for (const name of report.dbOnlyKnown) console.log(`  production-only, expected  ${name}`)
  for (const name of report.dbOnlyUnknown) {
    console.log(`  production-only, UNKNOWN  ${name}`)
    blockers.push(`${name} is applied in the database but is neither in this release nor in the known production-only list.`)
  }

  if (expectNone && report.pending.length > 0) blockers.push(`${report.pending.length} migration(s) still pending after deploy.`)
  if (report.pending.includes(BACKFILL)) {
    const review = `${BACKFILL} inserts ProgramCourse rows and can widen access for existing programme enrolments.`
    if (requireProduction && !approveBackfill) blockers.push(`${review} Re-run with --approve-backfill only after a person accepts that.`)
    else console.log(`  REVIEW   ${review} PASS does not approve it.`)
  }

  if (blockers.length > 0) {
    console.log("\nBLOCKED:")
    for (const b of blockers) console.log(`  - ${b}`)
    console.log("\nDECISION: BLOCKED")
    process.exitCode = 1
    return
  }
  console.log(
    report.pending.length === 0
      ? "\nOK: database schema matches this release."
      : `\nREADY: ${report.pending.length} additive migration(s) can be applied with \`npx prisma migrate deploy\`.`,
  )
  console.log("\nDECISION: PASS")
}

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Preflight failed against host ${host}: ${message.split(url).join("<DATABASE_URL>")}`)
    console.log("\nDECISION: BLOCKED")
    process.exitCode = 2
  })
  .finally(() => prisma.$disconnect())
