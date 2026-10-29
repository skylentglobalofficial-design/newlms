/**
 * HTTP requests against the named local September fixture over its Unix socket.
 * Run as the OS user postgres. This does not migrate and does not enable degraded startup.
 */
import type { AddressInfo } from "node:net"
import { userInfo } from "node:os"
import express from "express"
import { localSocketUrl } from "./create-september-schema-fixture.ts"

const fixture = "skylent_september_33e64235d6accf31"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

if (userInfo().username !== "postgres") {
  console.error("This fixture HTTP test must run as the OS user postgres. No database was contacted.")
  process.exit(1)
}

process.env.DATABASE_URL = localSocketUrl(fixture)
process.env.DIRECT_URL = process.env.DATABASE_URL
process.env.SESSION_SECRET = "test-only-session-secret-0123456789abcdef"
process.env.FRONTEND_URL = "http://127.0.0.1:8443"
process.env.NODE_ENV = "test"
delete process.env.SKYLENT_SEPTEMBER_TEST_DATABASE_URL

async function main() {
  const { prisma } = await import("../server/src/lib/prisma.ts")
  const { authRouter } = await import("../server/src/routes/auth.ts")
  const { skylentEnquiriesRouter } = await import("../server/src/routes/skylent/enquiries.ts")
  const { UNAVAILABLE_MESSAGES } = await import("../server/src/lib/schema-capabilities.ts")
  const { TEST_CONSENT } = await import("./test-consent-payload.ts")

  const [before] = await prisma.$queryRaw<{ current: string; rows: number; october: number; users: number }[]>`
    SELECT current_database() AS current,
           (SELECT count(*)::int FROM "_prisma_migrations") AS rows,
           (SELECT count(*)::int FROM "_prisma_migrations" WHERE migration_name LIKE '202610%') AS october,
           (SELECT count(*)::int FROM "User") AS users`
  assert(before?.current === fixture && before.rows === 12 && before.october === 0, "refusing to call routes: database is not the September fixture")

  const app = express()
  app.use(express.json())
  app.use("/api/v1/auth", authRouter)
  app.use("/api/v1/enquiries", skylentEnquiriesRouter)
  const server = app.listen(0, "127.0.0.1")
  await new Promise<void>((resolve) => server.once("listening", resolve))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

  async function post(path: string, body: unknown) {
    const response = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const text = await response.text()
    return { status: response.status, body: text ? JSON.parse(text) as Record<string, unknown> : {} }
  }

  try {
    const token = "b".repeat(64)
    const reset = await post("/api/v1/auth/password-reset/request", { email: "nobody@example.com" })
    assert(reset.status === 503 && reset.body.code === "unavailable" && reset.body.error === UNAVAILABLE_MESSAGES.passwordReset, `fixture reset request ${reset.status}`)
    const verify = await post("/api/v1/auth/password-reset/verify", { token })
    assert(verify.status === 503 && verify.body.code === "unavailable" && verify.body.valid === undefined, `fixture reset verify ${verify.status}`)
    const complete = await post("/api/v1/auth/password-reset/complete", { token, password: "replacement-password-123" })
    assert(complete.status === 503 && complete.body.code === "unavailable" && complete.body.success === undefined, `fixture reset complete ${complete.status}`)
    const enquiry = await post("/api/v1/enquiries", { name: "Ada", email: "ada@example.com", consent: TEST_CONSENT })
    assert(enquiry.status === 503 && enquiry.body.error === UNAVAILABLE_MESSAGES.enquiries, `fixture enquiry ${enquiry.status}`)

    const [after] = await prisma.$queryRaw<{ rows: number; october: number; users: number }[]>`
      SELECT (SELECT count(*)::int FROM "_prisma_migrations") AS rows,
             (SELECT count(*)::int FROM "_prisma_migrations" WHERE migration_name LIKE '202610%') AS october,
             (SELECT count(*)::int FROM "User") AS users`
    assert(after?.rows === 12 && after.october === 0 && after.users === before.users, "fixture routes changed migration history or created a user")
    console.log("September fixture route checks passed")
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.name : "fixture route test failed")
  process.exitCode = 1
})
