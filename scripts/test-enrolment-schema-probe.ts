/**
 * New enrolment must fail closed when the policy-storage probe cannot reach Postgres.
 * DATABASE_URL points at an unreachable port. The enrolment transaction must not start.
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
  const { lmsRouter } = await import("../server/src/routes/lms.ts")
  const { clearSchemaCapabilityCache } = await import("../server/src/lib/schema-capabilities.ts")

  let transactions = 0
  const originalTransaction = prisma.$transaction.bind(prisma)
  ;(prisma as unknown as { $transaction: typeof prisma.$transaction }).$transaction = ((...args: unknown[]) => {
    transactions += 1
    return originalTransaction(...(args as Parameters<typeof prisma.$transaction>))
  }) as typeof prisma.$transaction

  ;(prisma.session.findUnique as unknown as (args: unknown) => Promise<unknown>) = async () => ({
    id: "session-1",
    expiresAt: new Date(Date.now() + 60_000),
    user: {
      id: "user-1",
      email: "learner@example.com",
      displayName: "Learner",
      roles: [{ role: { id: "role-1", name: "STUDENT" } }],
    },
  })
  ;(prisma.userEnrollment.findUnique as unknown as (args: unknown) => Promise<unknown>) = async () => null
  ;(prisma.course.findUnique as unknown as (args: unknown) => Promise<unknown>) = async () => ({
    id: "course-1",
    slug: "data-analytics",
    title: "Data Analytics",
    curriculum: [],
  })

  const originalQueryRaw = prisma.$queryRaw.bind(prisma)
  let capabilityQuery: "missing-table" | "real" = "real"
  ;(prisma as unknown as { $queryRaw: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown> }).$queryRaw =
    (strings, ...values) => {
      if (capabilityQuery === "real") return originalQueryRaw(strings, ...values)
      return Promise.resolve([{ table_name: "User", column_name: "id" }])
    }

  const app = express()
  app.use(express.json())
  app.use("/lms", lmsRouter)
  const server = app.listen(0, "127.0.0.1")
  await new Promise<void>((resolve) => server.once("listening", resolve))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

  async function enroll() {
    const response = await fetch(`${base}/lms/enrollments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": "probe-token",
        Cookie: "csrf=probe-token; sid=probe-session",
      },
      body: JSON.stringify({ courseSlug: "data-analytics", consent: TEST_CONSENT }),
    })
    const text = await response.text()
    return {
      status: response.status,
      type: response.headers.get("content-type") ?? "",
      body: text ? JSON.parse(text) as Record<string, unknown> : {},
    }
  }

  try {
    console.log("1. An unreachable enrolment policy probe is 503 JSON and creates nothing")
    clearSchemaCapabilityCache()
    capabilityQuery = "real"
    transactions = 0
    const unreachable = await enroll()
    const leaked = JSON.stringify(unreachable.body)
    assert(unreachable.status === 503 && unreachable.type.includes("application/json") && unreachable.body.code === "unavailable", `unreachable probe should be 503, got ${unreachable.status} ${leaked}`)
    assert(unreachable.body.error !== "Failed to enroll", "a failed probe must not be the generic enrolment failure")
    assert(transactions === 0, "a failed probe must not start the enrolment transaction")
    assert(!/127\.0\.0\.1|unused|password|PolicyAcceptance|Can't reach|prisma/i.test(leaked), "the probe error must not be sent to the client")

    console.log("2. Missing PolicyAcceptance storage is 503 and creates nothing")
    clearSchemaCapabilityCache()
    capabilityQuery = "missing-table"
    transactions = 0
    const missing = await enroll()
    assert(missing.status === 503 && missing.body.code === "unavailable", `missing table should be 503, got ${missing.status}`)
    assert(transactions === 0, "a missing policy table must not start the enrolment transaction")

    console.log("Enrolment schema-probe checks passed")
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
