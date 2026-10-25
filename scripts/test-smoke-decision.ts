import { decideSmoke } from "./smoke-decision.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const ready = decideSmoke({
  healthStatus: 200,
  healthBody: { status: "ok", db: "ok", migrations: "ok", ai: "not_configured", release: "abc1234" },
  homeStatus: 200,
  asset: "/assets/index-abc.js",
  elixirStatus: 401,
  elixirBody: { error: "Unauthorized" },
  adminAiStatus: 401,
})
assert(ready.decision === "PASS", "a migrated site with AI off still passes liveness")

const pending = decideSmoke({
  healthStatus: 503,
  healthBody: { status: "error", db: "ok", migrations: "pending", pendingMigrations: 8, failedMigrations: 0 },
  homeStatus: 200,
  asset: "/assets/index-abc.js",
  elixirStatus: 503,
  elixirBody: { code: "unavailable" },
  adminAiStatus: 401,
})
assert(pending.decision === "BLOCKED", "pending migrations block the smoke check")
assert(pending.reasons.some((reason) => reason.includes("Elixir")), "missing Elixir tables are named")

const wrongSha = decideSmoke({
  healthStatus: 200,
  healthBody: { status: "ok", db: "ok", migrations: "ok", release: "unknown" },
  homeStatus: 200,
  asset: "/assets/index-abc.js",
  elixirStatus: 401,
  elixirBody: null,
  adminAiStatus: 401,
}, "209f43b5b12b5fd383aa4eca72f80b0f6fb2674f")
assert(wrongSha.decision === "BLOCKED", "an unknown release does not match an expected SHA")

const leaked = decideSmoke({
  healthStatus: 200,
  healthBody: { status: "ok", db: "ok", migrations: "ok" },
  homeStatus: 200,
  asset: "/assets/index-abc.js",
  elixirStatus: 401,
  elixirBody: null,
  adminAiStatus: 200,
})
assert(leaked.decision === "BLOCKED", "admin AI must not answer without a session")

console.log("smoke-decision ok")
