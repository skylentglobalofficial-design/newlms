import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { classifyDatabaseTarget, redactConnectionSecrets } from "../server/src/lib/database-target.ts"
import {
  KNOWN_PRODUCTION_ONLY_MIGRATIONS,
  classifyMigrationHistory,
  createdObjects,
  destructiveStatements,
  listLocalMigrations,
  readMigrationSql,
} from "../server/src/lib/migration-history.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const OCTOBER = [
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
  "20261101000000_programme_certs_and_faculty_doubts",
]

const local = listLocalMigrations()
for (const name of OCTOBER) assert(local.includes(name), `release must ship ${name}`)
for (const name of KNOWN_PRODUCTION_ONLY_MIGRATIONS) {
  assert(!local.includes(name), `${name} must stay out of prisma/migrations; production already applied it`)
}
assert(JSON.stringify(local) === JSON.stringify([...local].sort()), "migration folders must sort in apply order")

for (const name of local) {
  const destructive = destructiveStatements(readMigrationSql(name))
  assert(destructive.length === 0, `${name} contains destructive SQL: ${destructive.join(" | ")}`)
}

const at = new Date("2026-09-20T00:00:00Z")
const september = local.filter((name) => name < "20261000000000")
const productionRows = [
  ...september.map((migration_name) => ({ migration_name, finished_at: at, rolled_back_at: null })),
  ...KNOWN_PRODUCTION_ONLY_MIGRATIONS.map((migration_name) => ({ migration_name, finished_at: at, rolled_back_at: null })),
  { migration_name: "20260905120000_init", finished_at: null, rolled_back_at: at },
  { migration_name: "20260905122322_phase7a_foundation", finished_at: null, rolled_back_at: at },
]

const report = classifyMigrationHistory(local, productionRows)
assert(JSON.stringify(report.pending) === JSON.stringify(OCTOBER), `pending must be exactly the unapplied release migrations, got ${report.pending.join(",")}`)
assert(report.failed.length === 0, "a rolled-back attempt superseded by a finished one is not a failure")
assert(report.dbOnlyKnown.length === 4, "the four lesson-material migrations are reported as expected production-only")
assert(report.dbOnlyUnknown.length === 0, "rolled-back phase7a must not count as an unknown applied migration")
assert(JSON.stringify(report.rolledBack) === JSON.stringify(["20260905122322_phase7a_foundation"]), "rolled-back phase7a is reported")

const afterDeploy = classifyMigrationHistory(local, [
  ...productionRows,
  ...OCTOBER.map((migration_name) => ({ migration_name, finished_at: at, rolled_back_at: null })),
])
assert(afterDeploy.pending.length === 0, "nothing pending after the release migrations finish")

const stuck = classifyMigrationHistory(local, [
  ...productionRows,
  { migration_name: OCTOBER[0], finished_at: null, rolled_back_at: null },
])
assert(stuck.failed.includes(OCTOBER[0]), "a started-but-unfinished migration must be reported as failed")

const stuckBesideFinished = classifyMigrationHistory(local, [
  ...productionRows,
  { migration_name: september[0], finished_at: null, rolled_back_at: null },
])
assert(stuckBesideFinished.failed.includes(september[0]), "an unfinished row blocks deploy (P3009) even if the same name also finished")

const stray = classifyMigrationHistory(local, [...productionRows, { migration_name: "20261001000000_manual", finished_at: at, rolled_back_at: null }])
assert(stray.dbOnlyUnknown.includes("20261001000000_manual"), "an unexpected applied migration must be flagged")

const objects = createdObjects(readMigrationSql("20261017120000_practice_workspaces"))
assert(objects.some((o) => o.kind === "type" && o.name === "PracticeWorkspaceStatus"), "enum creation is detected")
assert(objects.filter((o) => o.kind === "table").length === 3, "all practice tables are detected")
assert(createdObjects('CREATE TABLE IF NOT EXISTS "X" ()').length === 0, "IF NOT EXISTS cannot collide")

assert(destructiveStatements('-- To undo: DROP TABLE "X";').length === 0, "commented undo hints are not destructive")
assert(destructiveStatements('ALTER TABLE "X" DROP COLUMN "y";').length === 1, "column drops are destructive")
assert(destructiveStatements('DELETE FROM "X";').length === 1, "deletes are destructive")
assert(destructiveStatements('ALTER TABLE "X" ADD CONSTRAINT "f" FOREIGN KEY ("a") REFERENCES "Y"("id") ON DELETE CASCADE ON UPDATE CASCADE;').length === 0, "FK actions are not destructive")

const session = classifyDatabaseTarget("postgresql://postgres.abc:secret@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres")
assert(session.sessionPooler && session.class === "session-pooler" && session.port === "5432", "session pooler is the production target")
assert(!session.host.includes("secret") && session.database === "postgres", "classification omits the password")
const transaction = classifyDatabaseTarget("postgresql://postgres.abc:secret@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres")
assert(transaction.class === "transaction-pooler" && !transaction.sessionPooler, "port 6543 is not the session pooler")
const direct = classifyDatabaseTarget("postgresql://postgres:secret@db.abcdref.supabase.co:5432/postgres")
assert(direct.class === "direct-supabase", "the IPv6 direct host is identified")
const localTarget = classifyDatabaseTarget("postgresql://skylent:secret@127.0.0.1:5432/skylent_agent_tmp")
assert(localTarget.class === "local" && !localTarget.sessionPooler, "localhost is not production")

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
assert(databaseUrl, "DATABASE_URL is required to prove the configured test database is local")
const configured = classifyDatabaseTarget(databaseUrl)
assert(configured.class === "local", `refusing to run the local preflight check against ${configured.class}`)

const encodedUrl = "postgresql://operator:p%40ss%2Fword@127.0.0.1:5432/appdb"
const decodedPassword = "p@ss/word"
const encodedUserinfo = "operator:p%40ss%2Fword"
const leaked = `host ${encodedUrl} password ${decodedPassword} userinfo ${encodedUserinfo}`
const redacted = redactConnectionSecrets(leaked, encodedUrl)
assert(!redacted.includes(encodedUrl), "redaction removes the full connection string")
assert(!redacted.includes(decodedPassword), "redaction removes the decoded password")
assert(!redacted.includes(encodedUserinfo), "redaction removes the encoded userinfo")
assert(!redacted.includes("p%40ss%2Fword"), "redaction removes the encoded password")

const refused = spawnSync("npx", ["tsx", "scripts/check-migration-history.ts", "--production"], {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  env: { ...process.env, DIRECT_URL: encodedUrl },
  encoding: "utf8",
})
const refusedOutput = `${refused.stdout ?? ""}\n${refused.stderr ?? ""}`
assert(refused.status === 1, `--production must block a local database, got ${refused.status}: ${refusedOutput}`)
assert(refusedOutput.includes("DECISION: BLOCKED"), "local production preflight must say BLOCKED")
assert(refusedOutput.includes("session pooler"), "the refusal must name the required target")
assert(refusedOutput.includes("database: appdb"), "the database name is still reported")
assert(!refusedOutput.includes("postgresql://"), "preflight output must not contain a connection string")
assert(!refusedOutput.includes(decodedPassword), "preflight output must not contain the decoded password")
assert(!refusedOutput.includes(encodedUserinfo), "preflight output must not contain the encoded userinfo")
assert(!refusedOutput.includes("p%40ss%2Fword"), "preflight output must not contain the encoded password")

console.log("migration-history ok")
