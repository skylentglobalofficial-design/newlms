/**
 * Create a disposable LOCAL September 2026 schema and stop.
 *
 * This file does not apply October migrations, does not edit migration history
 * by hand, and does not drop the database it creates.
 *
 *   SKYLENT_SEPTEMBER_TEST_DATABASE_URL='postgresql://127.0.0.1:5432/postgres' \
 *     npx tsx scripts/create-september-schema-fixture.ts --confirm-local-test-db
 *
 * Peer authentication over the local Unix socket, with no TCP password:
 *
 *   sudo -u postgres npx tsx scripts/create-september-schema-fixture.ts \
 *     --confirm-local-test-db --local-socket
 *
 * The dedicated URL is only a local maintenance connection (usually the
 * `postgres` database). Socket mode does not read it. The script creates a
 * new uniquely named database and migrates that database alone.
 * DATABASE_URL and DIRECT_URL are never read.
 */
import { spawnSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs"
import { tmpdir, userInfo } from "node:os"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { Prisma, PrismaClient } from "@prisma/client"

import { redactConnectionSecrets } from "../server/src/lib/database-target.ts"
import { listLocalMigrations, repoRoot } from "../server/src/lib/migration-history.ts"

export const CONFIRM_FLAG = "--confirm-local-test-db"
export const SOCKET_FLAG = "--local-socket"
export const DEDICATED_URL_ENV = "SKYLENT_SEPTEMBER_TEST_DATABASE_URL"
export const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"])
/** Cluster 16/main listens here. A directory, not a hostname. */
export const LOCAL_SOCKET_DIR = "/var/run/postgresql"
export const LOCAL_SOCKET_FILE = "/var/run/postgresql/.s.PGSQL.5432"
export const SOCKET_ROLE = "postgres"
export const SOCKET_MAINTENANCE_DB = "postgres"

/** The eight September folders shipped in prisma/migrations. October is absent on purpose. */
export const SEPTEMBER_RELEASE_MIGRATIONS = [
  "20260905120000_init",
  "20260906120000_phase5_lms_persistence",
  "20260906140000_phase6_production_lms_core",
  "20260906160000_career_os_backend_foundation",
  "20260906180000_google_oauth_identity",
  "20260916100000_skylent_labs_work",
  "20260916120000_learner_projects",
  "20260916140000_career_project_learner_source",
] as const

/**
 * Applied on the historical production database and kept out of prisma/migrations.
 * Required so the fixture matches that September schema, including LessonMaterial.
 */
export const SEPTEMBER_FIXTURE_MIGRATIONS = [
  "20260906190000_lesson_materials",
  "20260907100000_lesson_material_upload_status",
  "20260907120000_curriculum_node_notes_body",
  "20260907140000_assignment_attachment_upload_status",
] as const

export const OCTOBER_TABLES = [
  "SkylentCertificate",
  "SkylentEnquiry",
  "PolicyAcceptance",
  "EmployerMembership",
  "PracticeWorkspace",
  "PracticeWorkspaceRevision",
  "PracticeWorkspaceResponse",
  "Event",
  "EventRegistration",
  "PasswordResetToken",
  "Institution",
  "Degree",
  "ElixirAccount",
  "ElixirTransaction",
  "ElixirRewardRule",
  "VerifiedPayment",
  "LearningResource",
  "LearningResourceEntitlement",
  "AdminAuditLog",
  "CareerOsAccess",
  "CareerRiseEnrolment",
  "FacultyCourseAssignment",
  "College",
  "CollegeMembership",
] as const

const REJECTED_MAINTENANCE_NAMES = new Set(["production", "prod", "template0", "template1"])
const FIXTURE_NAME = /^skylent_september_[a-f0-9]{16}$/

export type SeptemberTestTarget = {
  host: string
  port: string
  database: string
}

export type UrlRejection = { ok: false; reason: string }
export type UrlAcceptance = { ok: true; target: SeptemberTestTarget }

/**
 * Synthetic catalogue rows only. No accounts, passwords, or migration-history writes.
 * Column lists match the September tables, including notesBody from the lesson-material fixtures.
 */
export const SEPTEMBER_SAMPLE_SQL = [
  `INSERT INTO "Program" (id, slug, name, duration, "moduleCount", "projectCount", format, cert, outcome, "desc", "upcomingBatch", "programType", level, "enrollmentStatus", "updatedAt")
   SELECT gen_random_uuid(), s, s, '1', 1, 1, 'online', 'c', 'o', 'd', 'b', 'PROFESSIONAL', 'beginner', 'OPEN', now()
     FROM unnest(ARRAY['data-analytics-pro', 'product-management']) s`,
  `INSERT INTO "Course" (id, slug, title, category, level, duration, mode, "lessonCount", "projectCount", rating, reviews, price, "originalPrice", "desc", "longDesc", "updatedAt")
   SELECT gen_random_uuid(), s, s, 'c', 'beginner', '1', 'online', 1, 1, 0, 0, 0, 0, 'd', 'l', now()
     FROM unnest(ARRAY['data-analytics', 'product-management']) s`,
  `INSERT INTO "CurriculumModule" (id, "courseId", title, "order")
   SELECT gen_random_uuid(), id, 'm', 1 FROM "Course" WHERE slug = 'data-analytics'`,
  `INSERT INTO "CurriculumNode" (id, "sourceId", "order", title, "nodeType", "moduleId", "notesBody")
   SELECT gen_random_uuid(), 'l1', 1, 'n', 'ASSIGNMENT', id, 'legacy notes' FROM "CurriculumModule"`,
  `INSERT INTO "LessonMaterial" (id, "nodeId", "fileName", "mimeType", "byteSize", "storageProvider", "storageKey", "updatedAt")
   SELECT gen_random_uuid(), id, 'a.pdf', 'application/pdf', 1, 'r2', 'k', now() FROM "CurriculumNode"`,
] as const

export function refusalBeforeConnect(input: {
  argv: readonly string[]
  dedicatedUrl: string | undefined
  nodeEnv: string | undefined
  osUser?: string
}): string | null {
  if (!input.argv.includes(CONFIRM_FLAG)) {
    return "Refusing to create a database without --confirm-local-test-db. No database was contacted."
  }
  if (input.nodeEnv === "production") {
    return "Refusing to create a test database when NODE_ENV is production. No database was contacted."
  }
  if (input.argv.includes(SOCKET_FLAG)) {
    if (input.dedicatedUrl?.trim()) {
      return `Socket mode does not accept ${DEDICATED_URL_ENV}. Unset it so a TCP URL cannot be selected. No database was contacted.`
    }
    if (input.osUser !== SOCKET_ROLE) {
      return "Socket mode must run as the OS user postgres, for example sudo -u postgres. No database was contacted."
    }
    return null
  }
  const raw = input.dedicatedUrl?.trim() ?? ""
  if (!raw) {
    return `Set ${DEDICATED_URL_ENV} to a localhost PostgreSQL URL. The application database variables are not used. No database was contacted.`
  }
  const parsed = validateSeptemberTestUrl(raw)
  if (!parsed.ok) return `${parsed.reason} No database was contacted.`
  return null
}

/**
 * URL shape consumed by Prisma 6.19.3's Quaint parser.
 *
 * Quaint uses the `host` query parameter when it is set, and passes that
 * single value to tokio-postgres. A value that starts with `/` is a Unix
 * socket directory, not a TCP address. `localhost` is only a placeholder so
 * the URL has a user name; it is not added as a second host. No port is set,
 * so the engine uses 5432 and opens `.s.PGSQL.5432` in that directory.
 */
export function localSocketUrl(database: string): string {
  if (database !== SOCKET_MAINTENANCE_DB && !FIXTURE_NAME.test(database)) {
    throw new Error("Refusing to build a socket URL for this database name.")
  }
  const url = `postgresql://${SOCKET_ROLE}@localhost/${database}?host=${LOCAL_SOCKET_DIR}&sslmode=disable`
  assertLocalSocketUrl(url, database)
  return url
}

export function assertLocalSocketUrl(raw: string, database: string): void {
  if (/supabase|pooler\.supabase|hostinger|127\.0\.0\.1|\[::1\]/i.test(raw)) {
    throw new Error("Socket URL contains a TCP or remote target.")
  }
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error("Socket URL could not be parsed.")
  }
  if (parsed.protocol !== "postgresql:") throw new Error("Socket URL must use the postgresql scheme.")
  if (parsed.username !== SOCKET_ROLE) throw new Error("Socket URL must use the peer role postgres.")
  if (parsed.password) throw new Error("Socket URL must not contain a password.")
  if (parsed.hostname !== "localhost") throw new Error("Socket URL must not name a TCP host.")
  if (parsed.port !== "") throw new Error("Socket URL must not include a TCP port.")
  if (parsed.pathname !== `/${database}`) throw new Error("Socket URL database does not match.")
  if (parsed.searchParams.get("host") !== LOCAL_SOCKET_DIR) {
    throw new Error("Socket URL must set host to the local socket directory.")
  }
  if (!parsed.searchParams.get("host")?.startsWith("/")) {
    throw new Error("Socket host must be a directory path, not a hostname.")
  }
  if (parsed.searchParams.get("sslmode") !== "disable") {
    throw new Error("Socket URL must disable TLS so the connection stays on the socket.")
  }
  const keys = [...parsed.searchParams.keys()].sort().join(",")
  if (keys !== "host,sslmode") throw new Error("Socket URL has unexpected query parameters.")
}

export function validateSeptemberTestUrl(raw: string): UrlRejection | UrlAcceptance {
  const text = raw.trim()
  if (!text) return { ok: false, reason: "The dedicated database URL is empty." }
  if (/supabase|pooler\.supabase|hostinger/i.test(text)) {
    return { ok: false, reason: "The dedicated URL is not a local database." }
  }
  let parsed: URL
  try {
    parsed = new URL(text)
  } catch {
    return { ok: false, reason: "The dedicated database URL could not be parsed." }
  }
  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    return { ok: false, reason: "The dedicated URL must use the postgresql scheme." }
  }
  // postgresql: is not a special URL scheme, so Node keeps the IPv6 brackets.
  const host = parsed.hostname === "[::1]" ? "::1" : parsed.hostname
  if (!LOCAL_HOSTS.has(host)) {
    return { ok: false, reason: "The host must be localhost, 127.0.0.1, or ::1." }
  }
  if (parsed.username.includes(".")) {
    return { ok: false, reason: "The database user is not a local maintenance login." }
  }
  const database = parsed.pathname.replace(/^\//, "")
  if (!database || database.includes("/")) {
    return { ok: false, reason: "The dedicated URL must name exactly one maintenance database." }
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(database)) {
    return { ok: false, reason: "The maintenance database name is ambiguous." }
  }
  if (REJECTED_MAINTENANCE_NAMES.has(database) || database.startsWith("skylent_september_")) {
    return { ok: false, reason: "The maintenance database name is not allowed for this utility." }
  }
  const keys = [...parsed.searchParams.keys()]
  if (keys.length > 1 || (keys.length === 1 && (keys[0] !== "schema" || parsed.searchParams.get("schema") !== "public"))) {
    return { ok: false, reason: "The dedicated URL has query parameters this utility does not accept." }
  }
  return {
    ok: true,
    target: {
      host,
      port: parsed.port || "5432",
      database,
    },
  }
}

export function newSeptemberDatabaseName(randomHex: string): string {
  if (!/^[a-f0-9]{16}$/.test(randomHex)) {
    throw new Error("Internal random source was not 16 hex characters.")
  }
  return `skylent_september_${randomHex}`
}

export function withDatabaseName(rawUrl: string, database: string): string {
  if (!FIXTURE_NAME.test(database)) {
    throw new Error("Refusing to point Prisma at a database this utility did not generate.")
  }
  const parsed = validateSeptemberTestUrl(rawUrl)
  if (!parsed.ok) throw new Error(parsed.reason)
  const url = new URL(rawUrl)
  url.pathname = `/${database}`
  url.search = ""
  url.hash = ""
  return url.toString()
}

export function selectSeptemberMigrations(releaseNames: readonly string[], fixtureNames: readonly string[]): string[] {
  const release = new Set(releaseNames)
  const fixtures = new Set(fixtureNames)
  const missingRelease = SEPTEMBER_RELEASE_MIGRATIONS.filter((name) => !release.has(name))
  if (missingRelease.length > 0) {
    throw new Error(`September migration is missing from prisma/migrations: ${missingRelease.join(", ")}`)
  }
  const unexpectedRelease = releaseNames.filter(
    (name) => name < "20261000000000" && !SEPTEMBER_RELEASE_MIGRATIONS.includes(name as (typeof SEPTEMBER_RELEASE_MIGRATIONS)[number]),
  )
  if (unexpectedRelease.length > 0) {
    throw new Error(`Unexpected pre-October migration is not in the allowlist: ${unexpectedRelease.join(", ")}`)
  }
  const missingFixtures = SEPTEMBER_FIXTURE_MIGRATIONS.filter((name) => !fixtures.has(name))
  if (missingFixtures.length > 0) {
    throw new Error(`Lesson-material fixture is missing: ${missingFixtures.join(", ")}`)
  }
  const unexpectedFixtures = fixtureNames.filter(
    (name) => !SEPTEMBER_FIXTURE_MIGRATIONS.includes(name as (typeof SEPTEMBER_FIXTURE_MIGRATIONS)[number]),
  )
  if (unexpectedFixtures.length > 0) {
    throw new Error(`Unexpected fixture migration is not in the allowlist: ${unexpectedFixtures.join(", ")}`)
  }
  const selected = [...SEPTEMBER_RELEASE_MIGRATIONS, ...SEPTEMBER_FIXTURE_MIGRATIONS].sort()
  assertNoOctoberMigrations(selected)
  return selected
}

export function assertNoOctoberMigrations(names: readonly string[]): void {
  const october = names.filter((name) => name.startsWith("202610"))
  if (october.length > 0) {
    throw new Error(`Refusing to include October migrations: ${october.join(", ")}`)
  }
}

export function quotedOctoberObjectsInSql(sql: string): string[] {
  return OCTOBER_TABLES.filter((name) => sql.includes(`"${name}"`))
}

function fixtureNames(fixturesDir: string): string[] {
  if (!existsSync(fixturesDir)) return []
  return readdirSync(fixturesDir)
    .filter((name) => statSync(join(fixturesDir, name)).isDirectory())
    .filter((name) => existsSync(join(fixturesDir, name, "migration.sql")))
    .sort()
}

function safeError(error: unknown, secretUrl: string): string {
  const message = error instanceof Error ? error.message : "database command failed"
  return redactConnectionSecrets(message, secretUrl).replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted]")
}

function cleanupCommand(target: SeptemberTestTarget, database: string, socketMode: boolean): string {
  const user = socketMode ? ` --username=${SOCKET_ROLE}` : ""
  return `dropdb --host='${target.host}' --port=${target.port}${user} ${database}`
}

function isDirectExecution(): boolean {
  const entry = process.argv[1]
  if (!entry) return false
  return fileURLToPath(import.meta.url) === resolve(entry)
}

async function main(): Promise<void> {
  const socketMode = process.argv.includes(SOCKET_FLAG)
  const refusal = refusalBeforeConnect({
    argv: process.argv,
    dedicatedUrl: process.env[DEDICATED_URL_ENV],
    nodeEnv: process.env.NODE_ENV,
    osUser: socketMode ? userInfo().username : undefined,
  })
  if (refusal) {
    console.error(refusal)
    process.exitCode = 1
    return
  }

  let dedicatedUrl = ""
  let cleanupTarget: SeptemberTestTarget | null = null
  if (socketMode) {
    if (!existsSync(LOCAL_SOCKET_FILE)) {
      console.error("The local PostgreSQL Unix socket is not present. No database was contacted.")
      process.exitCode = 1
      return
    }
    dedicatedUrl = localSocketUrl(SOCKET_MAINTENANCE_DB)
    cleanupTarget = { host: LOCAL_SOCKET_DIR, port: "5432", database: SOCKET_MAINTENANCE_DB }
  } else {
    dedicatedUrl = process.env[DEDICATED_URL_ENV]?.trim() ?? ""
    const parsed = validateSeptemberTestUrl(dedicatedUrl)
    if (!parsed.ok) {
      console.error(`${parsed.reason} No database was contacted.`)
      process.exitCode = 1
      return
    }
    cleanupTarget = parsed.target
  }
  if (!cleanupTarget) {
    console.error("No local target was selected. No database was contacted.")
    process.exitCode = 1
    return
  }

  const root = repoRoot()
  const releaseDir = join(root, "prisma", "migrations")
  const fixturesDir = join(root, "scripts", "fixtures", "production-only-migrations")
  const selected = selectSeptemberMigrations(listLocalMigrations(releaseDir), fixtureNames(fixturesDir))
  const combinedSql = selected
    .map((name) => {
      const base = SEPTEMBER_RELEASE_MIGRATIONS.includes(name as (typeof SEPTEMBER_RELEASE_MIGRATIONS)[number])
        ? releaseDir
        : fixturesDir
      return readFileSync(join(base, name, "migration.sql"), "utf8")
    })
    .join("\n")
  const octoberInSql = quotedOctoberObjectsInSql(combinedSql)
  if (octoberInSql.length > 0) {
    console.error(`September SQL names an October table (${octoberInSql.join(", ")}). No database was contacted.`)
    process.exitCode = 1
    return
  }
  if (SEPTEMBER_SAMPLE_SQL.some((sql) => /202610|_prisma_migrations|password/i.test(sql))) {
    console.error("Sample SQL failed its local safety check. No database was contacted.")
    process.exitCode = 1
    return
  }

  const prismaCli = join(root, "node_modules", "prisma", "build", "index.js")
  if (!existsSync(prismaCli)) {
    console.error("Prisma CLI is not installed. No database was contacted.")
    process.exitCode = 1
    return
  }

  const work = mkdtempSync(join(tmpdir(), "skylent-september-"))
  const historyDir = join(work, "prisma", "migrations")
  mkdirSync(historyDir, { recursive: true })
  let created = ""
  try {
    cpSync(join(releaseDir, "migration_lock.toml"), join(historyDir, "migration_lock.toml"))
    cpSync(join(root, "prisma", "schema.prisma"), join(work, "prisma", "schema.prisma"))
    for (const name of selected) {
      const base = SEPTEMBER_RELEASE_MIGRATIONS.includes(name as (typeof SEPTEMBER_RELEASE_MIGRATIONS)[number])
        ? releaseDir
        : fixturesDir
      cpSync(join(base, name), join(historyDir, name), { recursive: true })
    }
    const copied = readdirSync(historyDir)
      .filter((name) => name !== "migration_lock.toml")
      .sort()
    if (copied.join("\n") !== selected.join("\n")) {
      throw new Error("Temporary migration directory does not match the September allowlist.")
    }
    assertNoOctoberMigrations(copied)

    const admin = new PrismaClient({ datasources: { db: { url: dedicatedUrl } } })
    try {
      const role = await admin.$queryRaw<{ can_create: boolean }[]>`
        SELECT (rolcreatedb OR rolsuper) AS can_create FROM pg_roles WHERE rolname = current_user`
      if (!role[0]?.can_create) {
        console.error("The PostgreSQL login cannot create databases. CREATEDB or superuser is required. No database was created.")
        process.exitCode = 1
        return
      }

      let name = ""
      for (let attempt = 0; attempt < 5 && !name; attempt += 1) {
        const candidate = newSeptemberDatabaseName(randomBytes(8).toString("hex"))
        const existing = await admin.$queryRaw<{ datname: string }[]>`
          SELECT datname FROM pg_database WHERE datname = ${candidate}`
        if (existing.length === 0) name = candidate
      }
      if (!name) {
        console.error("Could not allocate a unique local database name. No database was created or dropped.")
        process.exitCode = 1
        return
      }

      await admin.$executeRawUnsafe(`CREATE DATABASE "${name}"`)
      created = name
    } catch (error) {
      console.error(`Local PostgreSQL setup failed: ${safeError(error, dedicatedUrl)}`)
      if (!created) console.error("No database was created.")
      process.exitCode = 1
      return
    } finally {
      await admin.$disconnect()
    }

    if (!created) return

    const migratedUrl = socketMode ? localSocketUrl(created) : withDatabaseName(dedicatedUrl, created)
    const childEnv: NodeJS.ProcessEnv = { ...process.env }
    delete childEnv.DATABASE_URL
    delete childEnv.DIRECT_URL
    childEnv.DATABASE_URL = migratedUrl
    childEnv.DIRECT_URL = migratedUrl
    const deploy = spawnSync(process.execPath, [prismaCli, "migrate", "deploy", "--schema", join(work, "prisma", "schema.prisma")], {
      cwd: root,
      env: childEnv,
      encoding: "utf8",
    })
    if (deploy.status !== 0) {
      console.error("September migrate failed. October migrations were not part of this command.")
      console.error(safeError(new Error(`${deploy.stdout ?? ""}\n${deploy.stderr ?? ""}`), migratedUrl))
      console.error(`Database left in place: ${created}`)
      console.error(`Cleanup: ${cleanupCommand(cleanupTarget, created, socketMode)}`)
      process.exitCode = 1
      return
    }

    const fixture = new PrismaClient({ datasources: { db: { url: migratedUrl } } })
    try {
      const rows = await fixture.$queryRaw<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }[]>`
        SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY migration_name`
      const names = rows.map((row) => row.migration_name)
      assertNoOctoberMigrations(names)
      const unfinished = rows.filter((row) => !row.finished_at || row.rolled_back_at)
      const missing = selected.filter((name) => !names.includes(name))
      const extra = names.filter((name) => !selected.includes(name))
      if (unfinished.length > 0 || missing.length > 0 || extra.length > 0 || names.length !== selected.length) {
        throw new Error("Migration history does not match the September allowlist.")
      }

      const tables = await fixture.$queryRaw<{ relname: string }[]>`
        SELECT c.relname
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public' AND c.relkind = 'r'
           AND c.relname IN (${Prisma.join([...OCTOBER_TABLES])})`
      const columns = await fixture.$queryRaw<{ table_name: string; column_name: string }[]>`
        SELECT table_name, column_name
          FROM information_schema.columns
         WHERE table_schema = 'public'
           AND (
             (table_name = 'User' AND column_name IN ('mustChangePassword'))
             OR (table_name = 'Course' AND column_name IN ('publicationStatus', 'authoredInApp'))
             OR (table_name = 'QuizQuestion' AND column_name = 'explanation')
             OR (table_name = 'JobApplication' AND column_name = 'sharedWithEmployer')
             OR (table_name = 'CurriculumNode' AND column_name IN ('maxAttempts', 'passingScore', 'summary', 'referenceUrl'))
             OR (table_name = 'AssignmentProgress' AND column_name IN ('grade', 'feedback', 'gradedById', 'gradedAt'))
           )`
      const enums = await fixture.$queryRaw<{ enumlabel: string }[]>`
        SELECT e.enumlabel
          FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
         WHERE t.typname = 'RoleName' AND e.enumlabel IN ('PLATFORM_ADMIN', 'COLLEGE_ADMIN')`
      if (tables.length > 0 || columns.length > 0 || enums.length > 0) {
        throw new Error("October schema objects are present after the September migrate.")
      }

      for (const statement of SEPTEMBER_SAMPLE_SQL) {
        await fixture.$executeRawUnsafe(statement)
      }
      const [counts] = await fixture.$queryRaw<{ programs: number; courses: number; materials: number }[]>`
        SELECT
          (SELECT count(*) FROM "Program")::int AS programs,
          (SELECT count(*) FROM "Course")::int AS courses,
          (SELECT count(*) FROM "LessonMaterial")::int AS materials`
      if (!counts || counts.programs !== 2 || counts.courses !== 2 || counts.materials !== 1) {
        throw new Error("Sample catalogue counts did not match the September fixture.")
      }

      console.log("September fixture ready.")
      console.log(socketMode ? "Transport: unix-socket" : "Transport: tcp")
      console.log(`Database: ${created}`)
      console.log(`Migrations applied: ${names.length}`)
      console.log("October migration rows: 0")
      console.log("October objects present: 0")
      console.log(`Sample catalogue: ${counts.programs} programmes, ${counts.courses} courses, ${counts.materials} lesson material`)
      console.log(`Cleanup: ${cleanupCommand(cleanupTarget, created, socketMode)}`)
    } catch (error) {
      console.error(`September verification failed: ${safeError(error, migratedUrl)}`)
      console.error(`Database left in place: ${created}`)
      console.error(`Cleanup: ${cleanupCommand(cleanupTarget, created, socketMode)}`)
      process.exitCode = 1
    } finally {
      await fixture.$disconnect()
    }
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}

if (isDirectExecution()) {
  main().catch((error) => {
    const secret = process.env[DEDICATED_URL_ENV] ?? ""
    console.error(safeError(error, secret))
    process.exitCode = 1
  })
}
