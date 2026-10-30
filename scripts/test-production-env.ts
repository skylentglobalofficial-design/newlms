import { missingProductionEnv, productionEnvWarnings } from "../server/src/lib/env.ts"

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

const safe = productionEnvWarnings({
  NODE_ENV: "production",
  FRONTEND_URL: "https://skylent.live",
  DATABASE_URL: "postgresql://u:p@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  DIRECT_URL: "postgresql://u:p@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres",
})
assert(safe.length === 0, `expected no warnings for pooler + https, got ${safe.join(" | ")}`)

const unsafe = productionEnvWarnings({
  NODE_ENV: "production",
  COOKIE_SECURE: "false",
  FRONTEND_URL: "http://skylent.live",
  DIRECT_URL: "postgresql://u:secret-value@db.abcdref.supabase.co:5432/postgres",
})
assert(unsafe.some((w) => w.startsWith("COOKIE_SECURE=false")), "COOKIE_SECURE=false must warn in production")
assert(unsafe.some((w) => w.startsWith("FRONTEND_URL")), "http FRONTEND_URL must warn")
assert(unsafe.some((w) => w.startsWith("DIRECT_URL uses the Supabase direct host")), "IPv6-only direct host must warn")
assert(!unsafe.join(" ").includes("secret-value"), "warnings must never echo credentials")

const transactionDirect = productionEnvWarnings({
  NODE_ENV: "production",
  FRONTEND_URL: "https://skylent.live",
  DIRECT_URL: "postgresql://u:p@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres",
})
assert(transactionDirect.some((w) => w.includes("port 6543")), "DIRECT_URL on the transaction pooler must warn")
assert(!transactionDirect.join(" ").includes("postgresql://"), "port warning must not echo the URL")

assert(productionEnvWarnings({ NODE_ENV: "test", COOKIE_SECURE: "false" }).length === 0, "warnings are production-only")

const invalidCompat = productionEnvWarnings({
  NODE_ENV: "production",
  FRONTEND_URL: "https://skylent.live",
  SKYLENT_SEPTEMBER_COMPAT: "true",
})
assert(invalidCompat.some((w) => w.startsWith("SKYLENT_SEPTEMBER_COMPAT")), "non-1 SKYLENT_SEPTEMBER_COMPAT must warn")

const validCompat = productionEnvWarnings({
  NODE_ENV: "production",
  FRONTEND_URL: "https://skylent.live",
  SKYLENT_SEPTEMBER_COMPAT: "1",
})
assert(validCompat.length === 0, "SKYLENT_SEPTEMBER_COMPAT=1 must not warn")

console.log("production-env ok")
