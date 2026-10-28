/**
 * Replays the documented production migration history on a throwaway local database, then deploys this release.
 *
 * Production state being reproduced: the September migrations, the four lesson-material migrations in
 * scripts/fixtures/production-only-migrations (applied in production, absent from this tree), one rolled-back
 * init attempt and one rolled-back phase7a migration.
 *
 * Refuses any database that is not on localhost. Creates and drops its own database.
 */
import { spawnSync } from "node:child_process"
import { cpSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { PrismaClient } from "@prisma/client"

import { KNOWN_PRODUCTION_ONLY_MIGRATIONS, listLocalMigrations, repoRoot } from "../server/src/lib/migration-history.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const baseUrl = process.env.DATABASE_URL
assert(baseUrl, "DATABASE_URL must point at a local throwaway Postgres")
const base = new URL(baseUrl)
assert(["localhost", "127.0.0.1", "::1"].includes(base.hostname), `refusing non-local database host ${base.hostname}`)

const replayDb = `skylent_prod_replay_${process.pid}`
const replay = new URL(baseUrl)
replay.pathname = `/${replayDb}`
replay.search = ""
const replayUrl = replay.toString()

const root = repoRoot()
const releaseMigrations = join(root, "prisma", "migrations")
const fixtures = join(root, "scripts", "fixtures", "production-only-migrations")
const prismaCli = join(root, "node_modules", "prisma", "build", "index.js")

function run(args: string[], schema?: string) {
  const result = spawnSync(process.execPath, [prismaCli, ...args, ...(schema ? ["--schema", schema] : [])], {
    cwd: root,
    env: { ...process.env, DATABASE_URL: replayUrl, DIRECT_URL: replayUrl },
    encoding: "utf8",
  })
  return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

function preflight(...extra: string[]) {
  const result = spawnSync(process.execPath, ["--import", "tsx", join(root, "scripts", "check-migration-history.ts"), ...extra], {
    cwd: root,
    env: { ...process.env, DATABASE_URL: replayUrl, DIRECT_URL: replayUrl },
    encoding: "utf8",
  })
  return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

const admin = new PrismaClient({ datasources: { db: { url: baseUrl } } })
const work = mkdtempSync(join(tmpdir(), "skylent-replay-"))

async function main() {
  await admin.$executeRawUnsafe(`CREATE DATABASE "${replayDb}"`)

  const historyDir = join(work, "prisma", "migrations")
  mkdirSync(historyDir, { recursive: true })
  cpSync(join(releaseMigrations, "migration_lock.toml"), join(historyDir, "migration_lock.toml"))
  cpSync(join(root, "prisma", "schema.prisma"), join(work, "prisma", "schema.prisma"))
  for (const name of listLocalMigrations().filter((n) => n < "20261000000000")) {
    cpSync(join(releaseMigrations, name), join(historyDir, name), { recursive: true })
  }
  for (const name of readdirSync(fixtures)) cpSync(join(fixtures, name), join(historyDir, name), { recursive: true })

  const history = run(["migrate", "deploy"], join(work, "prisma", "schema.prisma"))
  assert(history.status === 0, `replaying production history failed:\n${history.output}`)

  const db = new PrismaClient({ datasources: { db: { url: replayUrl } } })
  try {
    await db.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (gen_random_uuid()::text, 'replay', NULL, '20260905120000_init', 'replayed failed attempt', now(), now(), 0),
             (gen_random_uuid()::text, 'replay', NULL, '20260905122322_phase7a_foundation', 'replayed', now(), now(), 0)`)
    await db.$executeRawUnsafe(`
      INSERT INTO "Program" (id, slug, name, duration, "moduleCount", "projectCount", format, cert, outcome, "desc", "upcomingBatch", "programType", level, "enrollmentStatus", "updatedAt")
      SELECT gen_random_uuid(), s, s, '1', 1, 1, 'online', 'c', 'o', 'd', 'b', 'PROFESSIONAL', 'beginner', 'OPEN', now()
        FROM unnest(ARRAY['data-analytics-pro', 'product-management']) s`)
    await db.$executeRawUnsafe(`
      INSERT INTO "Course" (id, slug, title, category, level, duration, mode, "lessonCount", "projectCount", rating, reviews, price, "originalPrice", "desc", "longDesc", "updatedAt")
      SELECT gen_random_uuid(), s, s, 'c', 'beginner', '1', 'online', 1, 1, 0, 0, 0, 0, 'd', 'l', now()
        FROM unnest(ARRAY['data-analytics', 'product-management']) s`)
    await db.$executeRawUnsafe(`
      INSERT INTO "CurriculumModule" (id, "courseId", title, "order") SELECT gen_random_uuid(), id, 'm', 1 FROM "Course" WHERE slug = 'data-analytics'`)
    await db.$executeRawUnsafe(`
      INSERT INTO "CurriculumNode" (id, "sourceId", "order", title, "nodeType", "moduleId", "notesBody")
      SELECT gen_random_uuid(), 'l1', 1, 'n', 'ASSIGNMENT', id, 'legacy notes' FROM "CurriculumModule"`)
    await db.$executeRawUnsafe(`
      INSERT INTO "LessonMaterial" (id, "nodeId", "fileName", "mimeType", "byteSize", "storageProvider", "storageKey", "updatedAt")
      SELECT gen_random_uuid(), id, 'a.pdf', 'application/pdf', 1, 'r2', 'k', now() FROM "CurriculumNode"`)
  } finally {
    await db.$disconnect()
  }

  const before = preflight()
  assert(before.status === 0, `preflight must allow the deploy:\n${before.output}`)
  for (const name of KNOWN_PRODUCTION_ONLY_MIGRATIONS) assert(before.output.includes(`production-only, expected  ${name}`), `preflight must report ${name}`)
  const releasePending = listLocalMigrations().filter((name) => name >= "20261000000000")
  assert(before.output.includes(`pending: ${releasePending.length}`), `historical baseline must leave every 202610 migration pending:\n${before.output}`)
  assert(preflight("--expect-none").status === 1, "--expect-none must fail while migrations are pending")

  const deploy = run(["migrate", "deploy"])
  assert(deploy.status === 0, `release migrate deploy failed against production history:\n${deploy.output}`)
  for (const name of listLocalMigrations().filter((n) => n > "20261000000000")) {
    assert(deploy.output.includes(`Applying migration \`${name}\``), `${name} was not applied`)
  }

  const again = run(["migrate", "deploy"])
  assert(again.status === 0 && again.output.includes("No pending migrations"), `second deploy must be a no-op:\n${again.output}`)

  const after = preflight("--expect-none")
  assert(after.status === 0, `preflight must pass after deploy:\n${after.output}`)

  const check = new PrismaClient({ datasources: { db: { url: replayUrl } } })
  try {
    const [materials] = await check.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM "LessonMaterial"`
    assert(Number(materials.n) === 1, "production-only LessonMaterial rows must survive the deploy")
    const [notes] = await check.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM "CurriculumNode" WHERE "notesBody" IS NOT NULL`
    assert(Number(notes.n) === 1, "production-only notesBody values must survive the deploy")
    const links = await check.$queryRaw<{ program: string; course: string }[]>`
      SELECT p.slug AS program, c.slug AS course FROM "ProgramCourse" pc
        JOIN "Program" p ON p.id = pc."programId" JOIN "Course" c ON c.id = pc."courseId" ORDER BY 1`
    assert(links.length === 2, `backfill must link the authored programmes, got ${JSON.stringify(links)}`)

    // Release code writes against the production-only columns: AssignmentAttachment.uploadStatus is NOT NULL with a default.
    const user = await check.user.create({ data: { email: `replay-${process.pid}@example.invalid` } })
    const course = await check.course.findUniqueOrThrow({ where: { slug: "data-analytics" } })
    const node = await check.curriculumNode.findFirstOrThrow()
    const enrollment = await check.userEnrollment.create({ data: { userId: user.id, courseId: course.id } })
    const progress = await check.assignmentProgress.create({ data: { userId: user.id, enrollmentId: enrollment.id, nodeId: node.id } })
    await check.assignmentAttachment.create({
      data: { assignmentProgressId: progress.id, fileName: "a.txt", mimeType: "text/plain", byteSize: 1, storageProvider: "pending", storageKey: "pending/a" },
    })
    await check.policyAcceptance.create({ data: { context: "signup", policyVersion: "replay", userId: user.id } })
    await check.skylentEnquiry.create({ data: { name: "n", email: "e@example.invalid" } })
    const [status] = await check.$queryRaw<{ status: string }[]>`SELECT "uploadStatus"::text AS status FROM "AssignmentAttachment" LIMIT 1`
    assert(status.status === "PENDING", "production-only uploadStatus default must apply to release inserts")
  } finally {
    await check.$disconnect()
  }

  console.log("production-migration-replay ok")
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${replayDb}" WITH (FORCE)`).catch(() => {})
    await admin.$disconnect()
    rmSync(work, { recursive: true, force: true })
  })
