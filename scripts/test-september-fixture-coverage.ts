/**
 * HTTP coverage against the named local September fixture.
 * Run as the OS user postgres. Routers are mounted directly because the
 * production startup guard still refuses to listen. No migration is run.
 */
import { generateKeyPairSync, sign } from "node:crypto"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { userInfo } from "node:os"
import express from "express"
import bcrypt from "bcrypt"
import { localSocketUrl } from "./create-september-schema-fixture.ts"

const fixture = "skylent_september_33e64235d6accf31"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

if (userInfo().username !== "postgres") {
  console.error("This fixture coverage test must run as the OS user postgres. No database was contacted.")
  process.exit(1)
}

process.env.DATABASE_URL = localSocketUrl(fixture)
process.env.DIRECT_URL = process.env.DATABASE_URL
process.env.SESSION_SECRET = "test-only-session-secret-0123456789abcdef"
process.env.FRONTEND_URL = "http://127.0.0.1:8443"
process.env.NODE_ENV = "test"
process.env.GOOGLE_CLIENT_ID = "sept-fixture-client"
process.env.GOOGLE_CLIENT_SECRET = "sept-fixture-secret"
delete process.env.SKYLENT_SEPTEMBER_TEST_DATABASE_URL

function marker(label: string) {
  return `sept-fixture-${label}-${process.pid}@example.invalid`
}

async function main() {
  const { prisma } = await import("../server/src/lib/prisma.ts")
  const { createSession } = await import("../server/src/lib/auth.ts")
  const healthRouter = (await import("../server/src/routes/health.ts")).default
  const catalogRouter = (await import("../server/src/routes/catalog.ts")).default
  const { authRouter } = await import("../server/src/routes/auth.ts")
  const { facultyRouter } = await import("../server/src/routes/faculty.ts")
  const { adminRouter } = await import("../server/src/routes/admin.ts")
  const { resolveGoogleAccount, seedGoogleCertificateCache, verifyGoogleIdToken } = await import("../server/src/lib/google-oauth.ts")

  const [before] = await prisma.$queryRaw<{ current: string; rows: number; october: number }[]>`
    SELECT current_database() AS current,
           (SELECT count(*)::int FROM "_prisma_migrations") AS rows,
           (SELECT count(*)::int FROM "_prisma_migrations" WHERE migration_name LIKE '202610%') AS october`
  assert(before?.current === fixture && before.rows === 12 && before.october === 0, "refusing to write: database is not the September fixture")

  const learnerEmail = marker("learner")
  const adminEmail = marker("admin")
  const passwordHash = await bcrypt.hash("fixture-password-123", 4)
  const createdIds: string[] = []

  async function insertUser(email: string, displayName: string, role: "STUDENT" | "ADMIN") {
    const [user] = await prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO "User" (id, email, "passwordHash", "displayName", "updatedAt")
      VALUES (gen_random_uuid(), ${email}, ${passwordHash}, ${displayName}, now())
      RETURNING id::text AS id`
    createdIds.push(user.id)
    await prisma.$executeRaw`
      INSERT INTO "Role" (id, name, "createdAt")
      VALUES (gen_random_uuid(), CAST(${role} AS "RoleName"), now())
      ON CONFLICT (name) DO NOTHING`
    await prisma.$executeRaw`
      INSERT INTO "UserRole" ("userId", "roleId")
      SELECT CAST(${user.id} AS uuid), id FROM "Role" WHERE name = CAST(${role} AS "RoleName")`
    return user.id
  }

  const originalFetch = globalThis.fetch
  let googleCalled = false
  let server: Server | undefined
  let learnerId = ""
  let adminId = ""
  try {
  learnerId = await insertUser(learnerEmail, "Fixture Learner", "STUDENT")
  adminId = await insertUser(adminEmail, "Fixture Admin", "ADMIN")
  const googleSubject = `sept-fixture-sub-${process.pid}`
  await prisma.$executeRaw`
    INSERT INTO "UserIdentity" (id, "userId", provider, "providerAccountId", "updatedAt")
    VALUES (gen_random_uuid(), CAST(${learnerId} AS uuid), 'GOOGLE', ${googleSubject}, now())`

  const learnerSession = await createSession(learnerId)
  const adminSession = await createSession(adminId)

  const app = express()
  app.use(express.json())
  app.use("/api/v1/health", healthRouter)
  app.use("/api/v1/catalog", catalogRouter)
  app.use("/api/v1/auth", authRouter)
  app.use("/api/v1/faculty", facultyRouter)
  app.use("/api/v1/admin", adminRouter)
  server = app.listen(0, "127.0.0.1")
  await new Promise<void>((resolve) => server.once("listening", resolve))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

  async function call(path: string, options: { method?: string; body?: unknown; token?: string; csrf?: string } = {}) {
    const headers: Record<string, string> = {}
    if (options.body !== undefined) headers["Content-Type"] = "application/json"
    if (options.token && options.csrf) {
      headers.Cookie = `sid=${options.token}; csrf=${options.csrf}`
      headers["X-CSRF-Token"] = options.csrf
    } else if (options.token) {
      headers.Cookie = `sid=${options.token}`
    }
    const response = await fetch(`${base}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
    const text = await response.text()
    return { status: response.status, body: text ? JSON.parse(text) as Record<string, unknown> : {} }
  }

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const target = String(input)
    if (target.includes("googleapis.com") || target.includes("accounts.google.com")) {
      googleCalled = true
      throw new Error("external Google request")
    }
    return originalFetch(input, init)
  }) as typeof fetch

    console.log("1. Health reports the database up and the eleven October migrations pending")
    const health = await call("/api/v1/health")
    assert(health.status === 503 && health.body.db === "ok" && health.body.migrations === "pending", `health ${health.status}`)
    assert(health.body.pendingMigrations === 11 && health.body.failedMigrations === 0, "health pending count")

    console.log("2. Catalogue reads the fixture programmes and courses")
    const programs = await call("/api/v1/catalog/programs")
    const programRows = programs.body.data as Array<{ slug: string }>
    assert(programs.status === 200 && Array.isArray(programRows), `programs ${programs.status}`)
    const programSlugs = programRows.map((row) => row.slug).sort()
    assert(programSlugs.includes("data-analytics-pro") && programSlugs.includes("product-management"), "fixture programme slugs")

    const courses = await call("/api/v1/catalog/courses")
    const courseRows = courses.body.data as Array<{ slug: string }>
    assert(courses.status === 200 && Array.isArray(courseRows), `courses ${courses.status}`)
    const courseSlugs = courseRows.map((row) => row.slug).sort()
    assert(courseSlugs.includes("data-analytics") && courseSlugs.includes("product-management"), "fixture course slugs")

    console.log("3. Profile update writes only the September display name")
    const profile = await call("/api/v1/auth/me", {
      method: "PATCH",
      token: learnerSession.sessionToken,
      csrf: learnerSession.csrfToken,
      body: { displayName: "Fixture Learner Updated" },
    })
    assert(profile.status === 200 && profile.body.mustChangePassword === false, `profile ${profile.status} ${JSON.stringify(profile.body)}`)
    const profileUser = profile.body.user as { displayName?: string }
    assert(profileUser.displayName === "Fixture Learner Updated", "profile display name")
    const [stored] = await prisma.$queryRaw<{ displayName: string }[]>`
      SELECT "displayName" FROM "User" WHERE id = CAST(${learnerId} AS uuid)`
    assert(stored?.displayName === "Fixture Learner Updated", "profile was not stored")

    console.log("4. Faculty dashboard and admin user list succeed for a September superadmin")
    const faculty = await call("/api/v1/faculty/dashboard", { token: adminSession.sessionToken })
    const facultyData = faculty.body.data as { courses?: Array<{ slug: string }> }
    assert(faculty.status === 200 && Array.isArray(facultyData.courses), `faculty ${faculty.status}`)
    assert(facultyData.courses.some((course) => course.slug === "data-analytics"), "faculty dashboard omitted the fixture course")

    const users = await call("/api/v1/admin/users", { token: adminSession.sessionToken })
    const userRows = users.body.data as Array<{ email?: string }>
    assert(users.status === 200 && Array.isArray(userRows), `admin users ${users.status} ${JSON.stringify(users.body)}`)
    assert(userRows.some((user) => user.email === learnerEmail), "admin list omitted the fixture learner")

    console.log("5. Existing Google account sign-in does not select October user columns or call Google")
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 })
    const pem = publicKey.export({ type: "spki", format: "pem" }).toString()
    seedGoogleCertificateCache({ "sept-fixture-kid": pem })
    const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url")
    const header = encode({ alg: "RS256", kid: "sept-fixture-kid" })
    const payload = encode({
      sub: googleSubject,
      email: learnerEmail,
      email_verified: true,
      name: "Fixture Learner Updated",
      iss: "https://accounts.google.com",
      aud: "sept-fixture-client",
      exp: Math.floor(Date.now() / 1000) + 600,
    })
    const signed = `${header}.${payload}`
    const signature = sign("RSA-SHA256", Buffer.from(signed), privateKey).toString("base64url")
    const claims = await verifyGoogleIdToken(`${signed}.${signature}`)
    const identity = prisma.userIdentity
    const originalFind = identity.findUnique.bind(identity)
    let selected: string[] = []
    identity.findUnique = (async (args: { include?: { user?: { select?: Record<string, unknown> } } }) => {
      selected = Object.keys(args.include?.user?.select ?? {})
      return originalFind(args as never)
    }) as typeof identity.findUnique
    const account = await resolveGoogleAccount(claims)
    identity.findUnique = originalFind
    assert(account.id === learnerId, "Google sign-in did not return the existing fixture user")
    assert(selected.includes("email") && selected.includes("passwordHash") && !selected.includes("mustChangePassword"), `Google select keys: ${selected.join(",")}`)
    assert(googleCalled === false, "the test called Google")

    const [after] = await prisma.$queryRaw<{ rows: number; october: number }[]>`
      SELECT (SELECT count(*)::int FROM "_prisma_migrations") AS rows,
             (SELECT count(*)::int FROM "_prisma_migrations" WHERE migration_name LIKE '202610%') AS october`
    assert(after?.rows === 12 && after.october === 0, "coverage changed migration history")
    console.log("September fixture coverage checks passed")
  } finally {
    globalThis.fetch = originalFetch
    for (const id of createdIds) {
      await prisma.$executeRaw`DELETE FROM "Session" WHERE "userId" = CAST(${id} AS uuid)`.catch(() => undefined)
      await prisma.$executeRaw`DELETE FROM "UserIdentity" WHERE "userId" = CAST(${id} AS uuid)`.catch(() => undefined)
      await prisma.$executeRaw`DELETE FROM "UserRole" WHERE "userId" = CAST(${id} AS uuid)`.catch(() => undefined)
      await prisma.$executeRaw`DELETE FROM "User" WHERE id = CAST(${id} AS uuid)`.catch(() => undefined)
    }
    if (server) await new Promise<void>((resolve) => server?.close(() => resolve()))
    await prisma.$disconnect().catch(() => undefined)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "fixture coverage failed")
  process.exitCode = 1
})
