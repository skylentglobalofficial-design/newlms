import { missingProductionEnv } from "../server/src/lib/env.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const missing = missingProductionEnv({
  NODE_ENV: "production",
})
assert(missing.includes("DATABASE_URL"), "DATABASE_URL must be required")
assert(missing.includes("SESSION_SECRET"), "SESSION_SECRET must be required")
assert(missing.includes("FRONTEND_URL"), "FRONTEND_URL must be required")

const ok = missingProductionEnv({
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://user:pass@db:5432/skylent",
  SESSION_SECRET: "a-production-session-secret-32chars",
  FRONTEND_URL: "https://example.invalid",
})
assert(ok.length === 0, `expected no missing keys, got ${ok.join(",")}`)

const shortSecret = missingProductionEnv({
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://user:pass@db:5432/skylent",
  SESSION_SECRET: "too-short",
  FRONTEND_URL: "https://example.invalid",
})
assert(shortSecret.includes("SESSION_SECRET"), "short SESSION_SECRET must fail")

console.log("production-env ok")
