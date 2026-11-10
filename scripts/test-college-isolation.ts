import "dotenv/config"
import crypto from "node:crypto"
import { PrismaClient, RoleName } from "@prisma/client"
import { ensureRole } from "../server/src/lib/auth.ts"
import { TEST_CONSENT } from "./test-consent-payload.ts"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:3021/api/v1"

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
    const name = pair.slice(0, index).trim()
    const value = pair.slice(index + 1).trim()
    if (value) jar.set(name, value)
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
  const email = `college-${label}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}@example.com`
  const created = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName: label, email, password: "test-password-123" },
  })
  assert(created.response.status === 201, `signup failed ${created.response.status}`)
  return { jar, userId: created.data.user.id as string, email }
}

async function asRole(userId: string, email: string, role: RoleName, collegeId?: string) {
  const row = await ensureRole(role)
  await prisma.userRole.deleteMany({ where: { userId } })
  await prisma.userRole.create({ data: { userId, roleId: row.id } })
  if (collegeId) {
    await prisma.collegeMembership.create({ data: { userId, collegeId } })
  }
  const jar: CookieJar = new Map()
  await request(jar, "/auth/csrf")
  const login = await request(jar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email, password: "test-password-123" },
  })
  assert(login.response.ok, `login failed for ${role}`)
  return jar
}

async function main() {
  const suffix = crypto.randomBytes(3).toString("hex")
  const collegeA = await prisma.college.create({ data: { slug: `college-a-${suffix}`, name: `College A ${suffix}` } })
  const collegeB = await prisma.college.create({ data: { slug: `college-b-${suffix}`, name: `College B ${suffix}` } })
  const a = await signup("a")
  const b = await signup("b")
  const student = await signup("student")
  const admin = await signup("admin")
  const jarA = await asRole(a.userId, a.email, RoleName.COLLEGE_ADMIN, collegeA.id)
  const jarB = await asRole(b.userId, b.email, RoleName.COLLEGE_ADMIN, collegeB.id)
  await asRole(admin.userId, admin.email, RoleName.PLATFORM_ADMIN)

  const own = await request(jarA, "/college/dashboard")
  assert(own.response.ok, `own college dashboard failed ${own.response.status}`)
  assert(own.data.data.college.id === collegeA.id, "college A must see only its college")
  assert(own.data.data.members.some((member: { id: string }) => member.id === a.userId), "membership must be visible")
  assert(!JSON.stringify(own.data).includes(collegeB.id), "college A response must not include college B")

  const cross = await request(jarA, `/college/dashboard?collegeId=${collegeB.id}`)
  assert(cross.response.status === 403, "college A must not open college B")

  const studentJar = student.jar
  const studentView = await request(studentJar, "/college/dashboard")
  assert(studentView.response.status === 403, "a student must not open a college dashboard")

  const adminJar: CookieJar = new Map()
  await request(adminJar, "/auth/csrf")
  const adminLogin = await request(adminJar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email: admin.email, password: "test-password-123" },
  })
  assert(adminLogin.response.ok && adminLogin.data.role === "admin", "platform admin login")
  const adminView = await request(adminJar, "/college/dashboard")
  assert(adminView.response.status === 403, "platform admin must not receive college access automatically")
  const adminUsers = await request(adminJar, "/admin/colleges", { method: "POST", csrf: true, body: { name: "Nope", slug: `nope-${suffix}` } })
  assert(adminUsers.response.status === 403, "platform admin must not create colleges")

  const otherMember = await request(jarB, "/college/dashboard")
  assert(otherMember.response.ok && otherMember.data.data.college.id === collegeB.id, "college B sees itself")
  assert(!JSON.stringify(otherMember.data).includes(collegeA.name), "college B must not see college A")

  console.log("PASS college isolation")
  await prisma.college.deleteMany({ where: { id: { in: [collegeA.id, collegeB.id] } } })
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error)
    await prisma.$disconnect()
    process.exit(1)
  })
