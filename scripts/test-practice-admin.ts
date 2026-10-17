/**
 * Admin practice provisioning. Uses the local API and the local database.
 * Run: npx tsx scripts/test-practice-admin.ts
 */
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { TEST_CONSENT } from "./test-consent-payload.ts"

const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:3000/api/v1"
const prisma = new PrismaClient()
const slug = `store-ops-${Date.now().toString(36)}`

type Jar = Map<string, string>

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function cookieHeader(jar: Jar) {
  return Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join("; ")
}

function storeCookies(response: Response, jar: Jar) {
  for (const header of response.headers.getSetCookie?.() ?? []) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index === -1) continue
    const name = pair.slice(0, index).trim()
    const value = pair.slice(index + 1).trim()
    if (value) jar.set(name, value)
  }
}

async function request(jar: Jar, path: string, options: { method?: string; body?: unknown; csrf?: boolean } = {}) {
  const headers: Record<string, string> = {}
  const cookie = cookieHeader(jar)
  if (cookie) headers.Cookie = cookie
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) headers["X-CSRF-Token"] = jar.get("csrf") ?? ""
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  storeCookies(response, jar)
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  return { response, data }
}

async function signup(jar: Jar, label: string) {
  const email = `practice-admin-${label}-${Date.now()}@example.com`
  await request(jar, "/auth/csrf")
  const result = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName: label, email, password: "test-password-123" },
  })
  assert(result.response.status === 201, `Signup failed for ${label}: ${JSON.stringify(result.data)}`)
  const me = await request(jar, "/auth/me")
  return me.data.user.id as string
}

const notes = "Weekend deliveries fail because the store has no written place to record them. This case belongs only to this course."

async function main() {
  const adminJar: Jar = new Map()
  const studentJar: Jar = new Map()
  const outsiderJar: Jar = new Map()
  const adminId = await signup(adminJar, "admin")
  const studentId = await signup(studentJar, "student")
  await signup(outsiderJar, "outsider")
  const role = await prisma.role.findUnique({ where: { name: "ADMIN" } })
  assert(role, "ADMIN role is missing")
  await prisma.userRole.create({ data: { userId: adminId, roleId: role.id } })

  const course = await prisma.course.create({
    data: {
      slug,
      title: "Store operations brief",
      category: "Business",
      level: "Beginner",
      duration: "1 week",
      mode: "Self-paced",
      lessonCount: 1,
      projectCount: 0,
      rating: 0,
      reviews: 0,
      price: 0,
      originalPrice: 0,
      desc: "Provisioning test course.",
      longDesc: "Provisioning test course. Not a public programme.",
      outcomes: ["Frame one operations problem"],
      forWhom: ["Test"],
      curriculum: {
        create: {
          sourceId: "m1",
          order: 0,
          title: "Case",
          nodes: { create: { sourceId: "l1", order: 0, title: "Read the store notes", nodeType: "NOTES" } },
        },
      },
    },
  })
  await prisma.userEnrollment.create({ data: { userId: studentId, courseId: course.id, status: "active" } })

  const forbidden = await request(studentJar, "/admin/practice-workspaces", {
    method: "POST",
    csrf: true,
    body: { courseSlug: slug, title: "Store operations brief", outcomes: [], tools: ["case notes"], lessons: [{ id: "l1", title: "Read", type: "notes", exercise: "case" }] },
  })
  assert(forbidden.response.status === 403, `A student cannot create a workspace (${forbidden.response.status} ${JSON.stringify(forbidden.data)})`)

  const created = await request(adminJar, "/admin/practice-workspaces", {
    method: "POST",
    csrf: true,
    body: {
      courseSlug: slug,
      title: "Store operations brief",
      outcomes: ["Frame one operations problem"],
      tools: ["case notes"],
      lessons: [{ id: "l1", title: "Read the store notes", type: "notes", exercise: "case" }],
    },
  })
  assert(created.response.status === 201, `Create failed: ${JSON.stringify(created.data)}`)
  assert(created.data.data.status === "needs_review", "A new case course starts in review")
  assert(created.data.data.manifest.href == null, "A recommendation does not publish a route")
  const id = created.data.data.id as string

  const stolen = await request(adminJar, `/admin/practice-workspaces/${id}`, {
    method: "PATCH",
    csrf: true,
    body: { datasetId: "northwind_sales", adapterId: "sql-lab", lessonIds: ["l1"] },
  })
  assert(stolen.response.status === 200, "Isolation update should be stored as review, not rejected as a crash")
  assert(stolen.data.data.status === "needs_review", "Northwind dataset is not attached to the new course")
  assert(stolen.data.data.manifest.href == null, "Isolation does not publish")

  const configured = await request(adminJar, `/admin/practice-workspaces/${id}`, {
    method: "PATCH",
    csrf: true,
    body: { adapterId: "case-studio", lessonIds: ["l1"], caseTitle: "Store operations brief", caseNotes: notes, datasetId: null },
  })
  assert(configured.response.status === 200 && configured.data.data.status === "ready", `Configuration should be ready: ${JSON.stringify(configured.data)}`)

  const early = await request(adminJar, `/admin/practice-workspaces/${id}/publish`, { method: "POST", csrf: true, body: {} })
  assert(early.response.status === 409, "Publish before approval is refused")

  const approved = await request(adminJar, `/admin/practice-workspaces/${id}/approve`, { method: "POST", csrf: true, body: {} })
  assert(approved.response.status === 200 && approved.data.data.approvedAt, "Approval is recorded")

  const published = await request(adminJar, `/admin/practice-workspaces/${id}/publish`, { method: "POST", csrf: true, body: {} })
  assert(published.response.status === 200 && published.data.data.status === "published", `Publish failed: ${JSON.stringify(published.data)}`)
  assert(published.data.data.manifest.href === `/os/practice/${slug}`, "Published route is course-specific")

  const hidden = await request(outsiderJar, `/practice/workspaces/${slug}`)
  assert(hidden.response.status === 403, "A learner who is not enrolled cannot open the workspace")

  const visible = await request(studentJar, `/practice/workspaces/${slug}`)
  assert(visible.response.status === 200, `Enrolled learner should see the workspace: ${JSON.stringify(visible.data)}`)
  assert(visible.data.data.caseNotes === notes, "The learner sees this course's notes")
  assert(!JSON.stringify(visible.data).includes("northwind"), "The learner payload does not include Northwind")

  const saved = await request(studentJar, `/practice/workspaces/${slug}/responses/l1`, {
    method: "PUT",
    csrf: true,
    body: { body: "The store needs a written owner for weekend delivery failures." },
  })
  assert(saved.response.status === 200, `Saving the written response failed: ${JSON.stringify(saved.data)}`)

  const replaced = await request(adminJar, "/admin/practice-workspaces", {
    method: "POST",
    csrf: true,
    body: {
      courseSlug: "data-analytics",
      title: "Data Analytics",
      outcomes: ["Write SQL"],
      tools: ["SQL"],
      lessons: [{ id: "l7", title: "SQL", type: "notes", exercise: "sql" }],
    },
  })
  assert(replaced.response.status === 409, "Data Analytics cannot be replaced by a new recommendation")

  console.log("practice admin: ok")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    const row = await prisma.practiceWorkspace.findUnique({ where: { courseSlug: slug } })
    if (row) await prisma.practiceWorkspace.delete({ where: { id: row.id } })
    const course = await prisma.course.findUnique({ where: { slug } })
    if (course) await prisma.course.delete({ where: { id: course.id } })
    await prisma.$disconnect()
  })
