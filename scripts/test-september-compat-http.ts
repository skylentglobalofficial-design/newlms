/**
 * HTTP checks for September-schema compatibility.
 * DATABASE_URL is an unreachable local address. Capability probes are stubbed.
 * No migration is run and no real database is contacted.
 */
process.env.DATABASE_URL = "postgresql://unused:unused@127.0.0.1:1/unused"
process.env.DIRECT_URL = process.env.DATABASE_URL
process.env.SESSION_SECRET = "test-only-session-secret-0123456789abcdef"
process.env.FRONTEND_URL = "http://127.0.0.1:8443"
process.env.NODE_ENV = "test"

import type { AddressInfo } from "node:net"
import express from "express"
import bcrypt from "bcrypt"
import { TEST_CONSENT } from "./test-consent-payload.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

type Mode = "september" | "current"

async function main() {
  const { prisma } = await import("../server/src/lib/prisma.ts")
  const { authRouter } = await import("../server/src/routes/auth.ts")
  const { skylentEnquiriesRouter } = await import("../server/src/routes/skylent/enquiries.ts")
  const { lmsRouter } = await import("../server/src/routes/lms.ts")
  const { collegeRouter } = await import("../server/src/routes/college.ts")
  const { employerJobsRouter } = await import("../server/src/routes/career/employer-jobs.ts")
  const { adminCurriculumRouter } = await import("../server/src/routes/admin-curriculum.ts")
  const { clearSchemaCapabilityCache, UNAVAILABLE_MESSAGES } = await import("../server/src/lib/schema-capabilities.ts")

  let mode: Mode = "september"
  const passwordHash = await bcrypt.hash("test-password-123", 4)
  const seenPasswordUpdate: { data: Record<string, unknown> | null } = { data: null }
  let resetCreateCalls = 0
  let enquiryTransactions = 0

  ;(prisma as unknown as { $queryRaw: (strings: TemplateStringsArray) => Promise<unknown> }).$queryRaw = (strings) => {
    const sql = strings.join(" ")
    if (sql.includes("pg_enum")) {
      return Promise.resolve(mode === "current" ? [{ enumlabel: "PLATFORM_ADMIN" }, { enumlabel: "COLLEGE_ADMIN" }] : [])
    }
    if (mode === "september") return Promise.resolve([{ table_name: "User", column_name: "id" }])
    return Promise.resolve([
      { table_name: "PasswordResetToken", column_name: "id" },
      { table_name: "User", column_name: "mustChangePassword" },
      { table_name: "SkylentEnquiry", column_name: "id" },
      { table_name: "PolicyAcceptance", column_name: "id" },
      { table_name: "SkylentCertificate", column_name: "id" },
      { table_name: "EmployerMembership", column_name: "id" },
      { table_name: "College", column_name: "id" },
      { table_name: "CollegeMembership", column_name: "id" },
      { table_name: "Course", column_name: "publicationStatus" },
      { table_name: "CurriculumNode", column_name: "summary" },
      { table_name: "CurriculumNode", column_name: "referenceUrl" },
    ])
  }
  ;(prisma.session.findUnique as unknown as (args: unknown) => Promise<unknown>) = async () => ({
    id: "session-1",
    expiresAt: new Date(Date.now() + 60_000),
    user: {
      id: "user-1",
      email: "learner@example.com",
      passwordHash,
      displayName: "Learner",
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ role: { id: "role-1", name: "STUDENT", createdAt: new Date() } }],
    },
  })
  ;(prisma.user.update as unknown as (args: { data: Record<string, unknown> }) => Promise<unknown>) = async (args) => {
    seenPasswordUpdate.data = args.data
    return {
      id: "user-1",
      email: "learner@example.com",
      displayName: args.data.displayName ?? "Learner",
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ role: { id: "role-1", name: "STUDENT", createdAt: new Date() } }],
    }
  }
  ;(prisma.user.findUnique as unknown as (args: unknown) => Promise<unknown>) = async () => null
  ;(prisma.passwordResetToken.findUnique as unknown as (args: unknown) => Promise<unknown>) = async () => {
    resetCreateCalls += 0
    return null
  }
  ;(prisma.passwordResetToken.create as unknown as (args: unknown) => Promise<unknown>) = async () => {
    resetCreateCalls += 1
    return { id: "token-1" }
  }
  ;(prisma.$transaction as unknown as (fn: unknown) => Promise<unknown>) = async () => {
    enquiryTransactions += 1
    return { id: "enquiry-1" }
  }

  const app = express()
  app.use(express.json())
  app.use("/api/v1/auth", authRouter)
  app.use("/api/v1/enquiries", skylentEnquiriesRouter)
  app.use("/api/v1/lms", lmsRouter)
  app.use("/api/v1/college", collegeRouter)
  app.use("/api/v1/career/employer", employerJobsRouter)
  app.use("/api/v1/admin/curriculum", adminCurriculumRouter)
  const server = app.listen(0, "127.0.0.1")
  await new Promise<void>((resolve) => server.once("listening", resolve))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

  async function call(path: string, options: { method?: string; body?: unknown; cookie?: string } = {}) {
    const headers: Record<string, string> = { "X-CSRF-Token": "probe-token" }
    if (options.body !== undefined) headers["Content-Type"] = "application/json"
    if (options.cookie) headers.Cookie = options.cookie
    const response = await fetch(`${base}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
    const text = await response.text()
    return { status: response.status, body: text ? JSON.parse(text) as Record<string, unknown> : {} }
  }

  const authCookie = "csrf=probe-token; sid=probe-session"
  const token = "a".repeat(64)

  try {
    console.log("1. September schema: password reset is 503, not a success and not 400")
    clearSchemaCapabilityCache()
    mode = "september"
    resetCreateCalls = 0
    const requestReset = await call("/api/v1/auth/password-reset/request", {
      method: "POST",
      body: { email: "learner@example.com" },
    })
    assert(requestReset.status === 503 && requestReset.body.code === "unavailable", `reset request ${requestReset.status}`)
    assert(requestReset.body.error === UNAVAILABLE_MESSAGES.passwordReset, "reset request body")
    assert(requestReset.body.message === undefined && resetCreateCalls === 0, "reset request must not pretend an email was sent")

    const verifyReset = await call("/api/v1/auth/password-reset/verify", { method: "POST", body: { token } })
    assert(verifyReset.status === 503 && verifyReset.body.code === "unavailable" && verifyReset.body.valid === undefined, `reset verify ${verifyReset.status}`)

    const completeReset = await call("/api/v1/auth/password-reset/complete", {
      method: "POST",
      body: { token, password: "replacement-password-123" },
    })
    assert(completeReset.status === 503 && completeReset.body.code === "unavailable" && completeReset.body.success === undefined, `reset complete ${completeReset.status}`)

    console.log("2. Current schema: unknown account still gets the generic reset response, and a bad token is 400")
    clearSchemaCapabilityCache()
    mode = "current"
    const generic = await call("/api/v1/auth/password-reset/request", {
      method: "POST",
      body: { email: "missing@example.com" },
    })
    assert(generic.status === 200 && typeof generic.body.message === "string" && generic.body.code === undefined, `generic reset ${generic.status}`)
    const invalid = await call("/api/v1/auth/password-reset/verify", { method: "POST", body: { token } })
    assert(invalid.status === 400 && invalid.body.code === "INVALID_TOKEN" && invalid.body.valid === false, `invalid token ${invalid.status}`)

    console.log("3. Password change omits the October column on the September schema and clears it when present")
    clearSchemaCapabilityCache()
    mode = "september"
    seenPasswordUpdate.data = null
    const changed = await call("/api/v1/auth/change-password", {
      method: "POST",
      cookie: authCookie,
      body: { currentPassword: "test-password-123", newPassword: "replacement-password-123" },
    })
    assert(changed.status === 200 && changed.body.ok === true && changed.body.mustChangePassword === false, `september password change ${changed.status}`)
    assert(seenPasswordUpdate.data?.passwordHash !== undefined && !("mustChangePassword" in seenPasswordUpdate.data), "September update must not write mustChangePassword")

    clearSchemaCapabilityCache()
    mode = "current"
    seenPasswordUpdate.data = null
    const changedCurrent = await call("/api/v1/auth/change-password", {
      method: "POST",
      cookie: authCookie,
      body: { currentPassword: "test-password-123", newPassword: "another-password-12345" },
    })
    assert(changedCurrent.status === 200 && seenPasswordUpdate.data?.mustChangePassword === false, "current schema still clears mustChangePassword")

    console.log("4. Enquiries, certificates, college, employer jobs, and authoring fail closed")
    clearSchemaCapabilityCache()
    mode = "september"
    enquiryTransactions = 0
    const enquiry = await call("/api/v1/enquiries", {
      method: "POST",
      body: { name: "Ada", email: "ada@example.com", consent: TEST_CONSENT },
    })
    assert(enquiry.status === 503 && enquiry.body.error === UNAVAILABLE_MESSAGES.enquiries && enquiryTransactions === 0, `enquiry ${enquiry.status}`)

    const certificate = await call("/api/v1/lms/courses/data-analytics/certificate", { cookie: authCookie })
    assert(certificate.status === 503 && certificate.body.error === UNAVAILABLE_MESSAGES.certificates, `certificate ${certificate.status}`)

    ;(prisma.session.findUnique as unknown as (args: unknown) => Promise<unknown>) = async () => ({
      id: "session-2",
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: "admin-1",
        email: "admin@example.com",
        passwordHash,
        displayName: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [{ role: { id: "role-admin", name: "ADMIN", createdAt: new Date() } }],
      },
    })
    clearSchemaCapabilityCache()
    const college = await call("/api/v1/college/dashboard", { cookie: authCookie })
    assert(college.status === 503 && college.body.error === UNAVAILABLE_MESSAGES.college, `college ${college.status}`)

    ;(prisma.session.findUnique as unknown as (args: unknown) => Promise<unknown>) = async () => ({
      id: "session-3",
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: "recruiter-1",
        email: "recruiter@example.com",
        passwordHash,
        displayName: "Recruiter",
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [{ role: { id: "role-recruiter", name: "RECRUITER", createdAt: new Date() } }],
      },
    })
    clearSchemaCapabilityCache()
    const employerJobs = await call("/api/v1/career/employer/jobs", { cookie: authCookie })
    assert(employerJobs.status === 503 && employerJobs.body.error === UNAVAILABLE_MESSAGES.employerMembership, `employer jobs ${employerJobs.status}`)

    ;(prisma.session.findUnique as unknown as (args: unknown) => Promise<unknown>) = async () => ({
      id: "session-4",
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: "super-1",
        email: "super@example.com",
        passwordHash,
        displayName: "Super",
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [{ role: { id: "role-super", name: "ADMIN", createdAt: new Date() } }],
      },
    })
    clearSchemaCapabilityCache()
    const authoring = await call("/api/v1/admin/curriculum/courses", {
      method: "POST",
      cookie: authCookie,
      body: {
        title: "Draft",
        slug: "draft-course",
        description: "A draft",
        category: "Data",
      },
    })
    assert(authoring.status === 503 && authoring.body.error === UNAVAILABLE_MESSAGES.authoring, `authoring ${authoring.status}`)

    console.log("5. A signed-out college request stays 401")
    const signedOut = await call("/api/v1/college/dashboard")
    assert(signedOut.status === 401 && signedOut.body.error === "Unauthorized", `signed-out college ${signedOut.status}`)

    console.log("September compatibility HTTP checks passed")
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
