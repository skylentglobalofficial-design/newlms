import "dotenv/config"
import crypto from "node:crypto"
import { Prisma, PrismaClient, RoleName } from "@prisma/client"
import { ensureRole } from "../server/src/lib/auth.ts"
import { TEST_CONSENT } from "./test-consent-payload.ts"
import { promises as fs } from "node:fs"
import { disconnectDemoProvisioning, provisionDemoAccounts } from "./provision-demo-accounts.ts"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:3000/api/v1"

type CookieJar = Map<string, string>

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function parseSetCookie(headers: string[] | undefined, jar: CookieJar) {
  if (!headers) return
  for (const header of headers) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index === -1) continue
    jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
  }
}

async function request(jar: CookieJar, path: string, options: { method?: string; body?: unknown; csrf?: boolean } = {}) {
  const headers: Record<string, string> = {}
  if (jar.size) headers.Cookie = Array.from(jar.entries()).map(([key, value]) => `${key}=${value}`).join("; ")
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) headers["X-CSRF-Token"] = jar.get("csrf") ?? ""
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  parseSetCookie(response.headers.getSetCookie?.() ?? [], jar)
  const text = await response.text()
  return { response, data: text ? JSON.parse(text) : null }
}

async function signup(label: string) {
  const jar: CookieJar = new Map()
  await request(jar, "/auth/csrf")
  const email = `os-lock-${label}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}@example.com`
  const created = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName: label, email, password: "test-password-123" },
  })
  assert(created.response.status === 201, `signup failed for ${label}`)
  return { jar, userId: created.data.user.id as string, email }
}

async function replaceRole(userId: string, role: RoleName) {
  const row = await ensureRole(role)
  await prisma.userRole.deleteMany({ where: { userId } })
  await prisma.userRole.create({ data: { userId, roleId: row.id } })
}

async function expectLocked(jar: CookieJar, label: string) {
  const access = await request(jar, "/career/access")
  assert(access.response.status === 200 && access.data.data.locked === true && access.data.data.entitled === false, `${label} access must be locked`)
  const profile = await request(jar, "/career/profile")
  assert(profile.response.status === 403 && profile.data.code === "CAREER_OS_LOCKED", `${label} profile must be locked`)
  const projects = await request(jar, "/career/projects")
  assert(projects.response.status === 403, `${label} projects must be locked`)
}

async function assertAccessStates() {
  const { prisma: appPrisma } = await import("../server/src/lib/prisma.ts")
  const { readCareerOsAccess } = await import("../server/src/lib/career-os-access.ts")
  const original = appPrisma.careerOsAccess.findUnique
  try {
    appPrisma.careerOsAccess.findUnique = (async () => {
      throw new Prisma.PrismaClientKnownRequestError("missing table", { code: "P2021", clientVersion: "test" })
    }) as typeof original
    assert(await readCareerOsAccess("missing-table") === "unavailable", "A missing Career OS table must not be reported as an entitlement or a lock decision")

    appPrisma.careerOsAccess.findUnique = (async () => {
      throw new Prisma.PrismaClientInitializationError("database unreachable", "test", "P1001")
    }) as typeof original
    assert(await readCareerOsAccess("database-down") === "unavailable", "A database failure must not be reported as locked or entitled")

    appPrisma.careerOsAccess.findUnique = (async () => null) as typeof original
    assert(await readCareerOsAccess("no-row") === "locked", "A missing entitlement row stays locked")

    appPrisma.careerOsAccess.findUnique = (async () => ({ id: "row" })) as typeof original
    assert(await readCareerOsAccess("has-row") === "entitled", "An explicit row is the only entitled state")
  } finally {
    appPrisma.careerOsAccess.findUnique = original
  }
  console.log("PASS Career OS check distinguishes entitled, locked, and unavailable")
}

async function main() {
  await assertAccessStates()
  const student = await signup("student")
  const teacher = await signup("teacher")
  const organisation = await signup("organisation")
  const admin = await signup("admin")
  const superadmin = await signup("superadmin")
  await replaceRole(teacher.userId, RoleName.FACULTY)
  await replaceRole(organisation.userId, RoleName.ORGANISATION_ADMIN)
  await replaceRole(admin.userId, RoleName.PLATFORM_ADMIN)
  await replaceRole(superadmin.userId, RoleName.ADMIN)

  for (const account of [student, teacher, organisation, admin, superadmin]) {
    const fresh: CookieJar = new Map()
    await request(fresh, "/auth/csrf")
    const login = await request(fresh, "/auth/login", {
      method: "POST",
      csrf: true,
      body: { email: account.email, password: "test-password-123" },
    })
    assert(login.response.ok, `login failed for ${account.email}`)
    await expectLocked(fresh, account.email)
  }

  const anon = await fetch(`${API_BASE}/career/profile`)
  assert(anon.status === 401, "Anonymous Career OS access must be unauthorised")

  const ids = [student.userId, teacher.userId, organisation.userId, admin.userId, superadmin.userId]
  const grants = await prisma.careerOsAccess.count({ where: { userId: { in: ids } } })
  assert(grants === 0, "Role assignment must not create Career OS access")

  const demos = await provisionDemoAccounts()
  const demoIds = demos.accounts.map((account) => account.id)
  const demoGrants = await prisma.careerOsAccess.count({ where: { userId: { in: demoIds } } })
  assert(demoGrants === 0, "Demo provisioning must not unlock Career OS")
  const riseRows = await prisma.careerRiseEnrolment.count({ where: { userId: { in: demoIds } } })
  assert(riseRows === 0, "Demo provisioning must not enrol Career Rise")
  const credentialText = await fs.readFile(demos.file, "utf8")
  const password = credentialText.match(/^password=(.+)$/m)?.[1]
  assert(password && password.length >= 12, "Demo credential file must contain a password")
  const demoJar: CookieJar = new Map()
  await request(demoJar, "/auth/csrf")
  const demoLogin = await request(demoJar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email: "demo-student@skylent.invalid", password },
  })
  assert(demoLogin.response.ok && demoLogin.data.role === "student", "Demo student must be able to sign in")
  await expectLocked(demoJar, "demo-student")
  const demoAdminJar: CookieJar = new Map()
  await request(demoAdminJar, "/auth/csrf")
  const demoAdminLogin = await request(demoAdminJar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email: "demo-admin@skylent.invalid", password },
  })
  assert(demoAdminLogin.response.ok && demoAdminLogin.data.role === "admin", "Demo admin must be a platform admin, not Super Admin")
  const demoAdminUsers = await request(demoAdminJar, "/admin/users")
  assert(demoAdminUsers.response.status === 403, "Demo admin must not manage users")
  await fs.unlink(demos.file).catch(() => undefined)
  console.log("PASS Career OS stays locked for every role, including Super Admin and demo accounts")
}

main()
  .then(async () => {
    await disconnectDemoProvisioning()
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error)
    await disconnectDemoProvisioning().catch(() => undefined)
    await prisma.$disconnect()
    process.exit(1)
  })
