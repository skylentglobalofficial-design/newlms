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
assert(JSON.stringify(report.pending) === JSON.stringify(OCTOBER), `pending must be exactly the seven October migrations, got ${report.pending.join(",")}`)
assert(report.failed.length === 0, "a rolled-back attempt superseded by a finished one is not a failure")
assert(report.dbOnlyKnown.length === 4, "the four lesson-material migrations are reported as expected production-only")
assert(report.dbOnlyUnknown.length === 0, "rolled-back phase7a must not count as an unknown applied migration")
assert(JSON.stringify(report.rolledBack) === JSON.stringify(["20260905122322_phase7a_foundation"]), "rolled-back phase7a is reported")

const afterDeploy = classifyMigrationHistory(local, [
  ...productionRows,
  ...OCTOBER.map((migration_name) => ({ migration_name, finished_at: at, rolled_back_at: null })),
])
assert(afterDeploy.pending.length === 0, "nothing pending after the October migrations finish")

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

console.log("migration-history ok")
