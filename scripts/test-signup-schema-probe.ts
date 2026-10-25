/**
 * Signup must fail closed when policy storage cannot be checked or is missing.
 * DATABASE_URL points at an unreachable port so a real capability probe cannot connect.
 * User creation is counted and must stay at zero.
 */
process.env.DATABASE_URL = "postgresql://unused:unused@127.0.0.1:1/unused"
process.env.DIRECT_URL = process.env.DATABASE_URL
process.env.SESSION_SECRET = "test-only-session-secret-0123456789abcdef"
process.env.FRONTEND_URL = "http://127.0.0.1:8443"
process.env.NODE_ENV = "test"

import type { AddressInfo } from "node:net"
import express from "express"
import { TEST_CONSENT } from "./test-consent-payload.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function main() {
  const { prisma } = await import("../server/src/lib/prisma.ts")
  const { authRouter } = await import("../server/src/routes/auth.ts")
  const { clearSchemaCapabilityCache } = await import("../server/src/lib/schema-capabilities.ts")

  let transactions = 0
  const originalTransaction = prisma.$transaction.bind(prisma)
  ;(prisma as unknown as { $transaction: typeof prisma.$transaction }).$transaction = ((...args: unknown[]) => {
    transactions += 1
    return originalTransaction(...(args as Parameters<typeof prisma.$transaction>))
  }) as typeof prisma.$transaction
  ;(prisma.user.findUnique as unknown as (args: unknown) => Promise<unknown>) = async () => null

  const originalQueryRaw = prisma.$queryRaw.bind(prisma)
  let capabilityQuery: "missing-table" | "real" = "missing-table"
  ;(prisma as unknown as { $queryRaw: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown> }).$queryRaw =
    (strings, ...values) => {
      if (capabilityQuery === "real") return originalQueryRaw(strings, ...values)
      return Promise.resolve([{ table_name: "User", column_name: "id" }])
    }

  const app = express()
  app.use(express.json())
  app.use("/auth", authRouter)
  const server = app.listen(0, "127.0.0.1")
  await new Promise<void>((resolve) => server.once("listening", resolve))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

  async function signup() {
    const response = await fetch(`${base}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": "probe-token",
        Cookie: "csrf=probe-token",
      },
      body: JSON.stringify({
        displayName: "Probe User",
        email: `probe-${Date.now()}@example.com`,
        password: "test-password-123",
        consent: TEST_CONSENT,
      }),
    })
    const text = await response.text()
    return {
      status: response.status,
      type: response.headers.get("content-type") ?? "",
      body: text ? JSON.parse(text) as Record<string, unknown> : {},
    }
  }

  try {
    console.log("1. Missing PolicyAcceptance table is 503 and creates nothing")
    clearSchemaCapabilityCache()
    capabilityQuery = "missing-table"
    transactions = 0
    const missing = await signup()
    assert(missing.status === 503 && missing.type.includes("application/json") && missing.body.code === "unavailable", `missing table should be 503, got ${missing.status}`)
    assert(transactions === 0 && missing.body.csrfToken === undefined, "a missing policy table must not create a user or session")

    console.log("2. An unreachable policy probe is 503 JSON and creates nothing")
    clearSchemaCapabilityCache()
    capabilityQuery = "real"
    transactions = 0
    const unreachable = await signup()
    const leaked = JSON.stringify(unreachable.body)
    assert(unreachable.status === 503 && unreachable.type.includes("application/json") && unreachable.body.code === "unavailable", `unreachable probe should be 503, got ${unreachable.status}`)
    assert(transactions === 0 && unreachable.body.csrfToken === undefined, "a failed probe must not create a user or session")
    assert(!/127\.0\.0\.1|unused|password|PolicyAcceptance|Can't reach|prisma/i.test(leaked), "the probe error must not be sent to the client")

    console.log("Signup schema-probe checks passed")
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
