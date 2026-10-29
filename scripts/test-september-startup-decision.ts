/**
 * Pure startup decisions. No database and no migration command.
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import {
  SEPTEMBER_COMPAT_PENDING,
  decideStartup,
  type MigrationGuardState,
} from "../server/src/lib/migration-guard.ts"
import { repoRoot } from "../server/src/lib/migration-history.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const expected = [...SEPTEMBER_COMPAT_PENDING]
const pendingState = (pending: string[], failed: string[] = []): MigrationGuardState => ({
  status: "pending",
  pending,
  failed,
})

const folders = readdirSync(join(repoRoot(), "prisma", "migrations"))
  .filter((name) => name.startsWith("202610"))
  .sort()
assert(JSON.stringify(folders) === JSON.stringify(expected), "the allowlist is not the October migration folders")

assert(decideStartup(pendingState(expected), undefined) === "refuse", "flag absent must refuse the pending set")
assert(decideStartup(pendingState(expected), "1") === "listen", "exact pending set may listen")
assert(decideStartup(pendingState([...expected, "20261029000000_extra"]), "1") === "refuse", "an extra pending migration must refuse")
assert(decideStartup(pendingState(expected.slice(1)), "1") === "refuse", "a missing expected migration must refuse")
assert(decideStartup(pendingState(expected, ["20261004000000_skylent_additions"]), "1") === "refuse", "a failed migration must refuse")
assert(
  decideStartup({ status: "unknown", pending: [], failed: [], reason: "database unreachable" }, "1") === "refuse",
  "an unknown state must refuse",
)
for (const flag of ["", "true", "yes", "0", " 1", "1\n", "01"]) {
  assert(decideStartup(pendingState(expected), flag) === "refuse", `flag ${JSON.stringify(flag)} must refuse`)
}
assert(decideStartup({ status: "ok", pending: [], failed: [] }, undefined) === "listen", "a finished schema still listens without the flag")
assert(decideStartup({ status: "ok", pending: [], failed: [] }, "1") === "listen", "a finished schema still listens with the flag")

const source = readFileSync(new URL("../server/src/lib/migration-guard.ts", import.meta.url), "utf8")
const start = source.indexOf("export function decideStartup")
const end = source.indexOf("let confirmed")
const decision = source.slice(start, end)
assert(!/prisma|spawn|migrate deploy|migrate resolve|db push/i.test(decision), "the startup decision must not run migrations")

console.log("september-startup-decision ok")
