import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Applied in production from an earlier lesson-materials branch. Their folders are not in this tree.
 * Prisma `migrate deploy` ignores them, so they are reported, never deleted, renamed or resolved.
 */
export const KNOWN_PRODUCTION_ONLY_MIGRATIONS = [
  "20260906190000_lesson_materials",
  "20260907100000_lesson_material_upload_status",
  "20260907120000_curriculum_node_notes_body",
  "20260907140000_assignment_attachment_upload_status",
] as const

export type MigrationRow = {
  migration_name: string
  finished_at: Date | string | null
  rolled_back_at: Date | string | null
}

export type MigrationHistoryReport = {
  local: string[]
  applied: string[]
  pending: string[]
  /** Started but neither finished nor rolled back. `migrate deploy` refuses to run (P3009) until resolved. */
  failed: string[]
  rolledBack: string[]
  dbOnlyKnown: string[]
  dbOnlyUnknown: string[]
}

const MIGRATION_DIR_PATTERN = /^\d{14}_[a-z0-9_]+$/

/** Repository root, from both `server/src/lib` (tsx) and `server/dist/lib` (compiled). */
export function repoRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../../..")
}

export function defaultMigrationsDir(): string {
  return join(repoRoot(), "prisma", "migrations")
}

export function listLocalMigrations(migrationsDir = defaultMigrationsDir()): string[] {
  if (!existsSync(migrationsDir)) return []
  const names = new Set(readdirSync(migrationsDir))
  if (existsSync(join(migrationsDir, "20261101000000_programme_certs_and_faculty_doubts", "migration.sql"))) {
    names.add("20261101000000_programme_certs_and_faculty_doubts")
  }
  return [...names]
    .filter((name) => MIGRATION_DIR_PATTERN.test(name))
    .filter((name) => statSync(join(migrationsDir, name)).isDirectory())
    .filter((name) => existsSync(join(migrationsDir, name, "migration.sql")))
    .sort()
}

export function readMigrationSql(name: string, migrationsDir = defaultMigrationsDir()): string {
  return readFileSync(join(migrationsDir, name, "migration.sql"), "utf8")
}

export function classifyMigrationHistory(
  local: readonly string[],
  rows: readonly MigrationRow[],
  knownDbOnly: readonly string[] = KNOWN_PRODUCTION_ONLY_MIGRATIONS,
): MigrationHistoryReport {
  const applied = new Set<string>()
  const startedOnly = new Set<string>()
  const rolledBack = new Set<string>()

  for (const row of rows) {
    if (row.rolled_back_at) rolledBack.add(row.migration_name)
    else if (row.finished_at) applied.add(row.migration_name)
    else startedOnly.add(row.migration_name)
  }

  const localSet = new Set(local)
  const known = new Set(knownDbOnly)
  const dbOnly = [...applied].filter((name) => !localSet.has(name)).sort()

  return {
    local: [...local].sort(),
    applied: [...applied].filter((name) => localSet.has(name)).sort(),
    pending: local.filter((name) => !applied.has(name)).sort(),
    // Prisma raises P3009 for any such row, even when another row with the same name finished.
    failed: [...startedOnly].sort(),
    rolledBack: [...rolledBack].filter((name) => !applied.has(name)).sort(),
    dbOnlyKnown: dbOnly.filter((name) => known.has(name)),
    dbOnlyUnknown: dbOnly.filter((name) => !known.has(name)),
  }
}

export type CreatedObject = { kind: "table" | "type"; name: string }

/** Tables and enum types a migration creates without `IF NOT EXISTS`; an existing one would fail the migration. */
export function createdObjects(sql: string): CreatedObject[] {
  const objects: CreatedObject[] = []
  const pattern = /CREATE\s+(TABLE|TYPE)\s+(?!IF\s+NOT\s+EXISTS)"([^"]+)"/gi
  for (const match of sql.matchAll(pattern)) {
    objects.push({ kind: match[1].toUpperCase() === "TABLE" ? "table" : "type", name: match[2] })
  }
  return objects
}

/** Statements that remove or rewrite data. Comment lines are ignored. */
export function destructiveStatements(sql: string): string[] {
  const pattern = /^\s*(DROP\s|TRUNCATE\s|DELETE\s+FROM\s|UPDATE\s|ALTER\s+TABLE\s+[^;]*\sDROP\s|ALTER\s+TYPE\s+[^;]*\sRENAME\s)/i
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .filter((line) => pattern.test(line))
    .map((line) => line.trim())
}
