import "dotenv/config"
import crypto from "node:crypto"
import { PrismaClient, RoleName } from "@prisma/client"
import { ensureRole } from "../server/src/lib/auth.ts"
import { TEST_CONSENT } from "./test-consent-payload.ts"

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
  const email = `builder-${label}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}@example.com`
  const created = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName: label, email, password: "test-password-123" },
  })
  assert(created.response.status === 201, "signup failed")
  return { jar, userId: created.data.user.id as string }
}

async function main() {
  const admin = await signup("admin")
  const student = await signup("student")
  const teacher = await signup("teacher")
  const role = await ensureRole(RoleName.PLATFORM_ADMIN)
  await prisma.userRole.deleteMany({ where: { userId: admin.userId } })
  await prisma.userRole.create({ data: { userId: admin.userId, roleId: role.id } })
  const faculty = await ensureRole(RoleName.FACULTY)
  await prisma.userRole.deleteMany({ where: { userId: teacher.userId } })
  await prisma.userRole.create({ data: { userId: teacher.userId, roleId: faculty.id } })

  const adminJar: CookieJar = new Map()
  await request(adminJar, "/auth/csrf")
  const login = await request(adminJar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email: (await prisma.user.findUniqueOrThrow({ where: { id: admin.userId } })).email, password: "test-password-123" },
  })
  assert(login.response.ok && login.data.role === "admin", "Platform admin login must not be superadmin")
  const deniedUsers = await request(adminJar, "/admin/users")
  assert(deniedUsers.response.status === 403, "Platform admin must not manage users")

  const suffix = crypto.randomBytes(3).toString("hex")
  const created = await request(adminJar, "/admin/curriculum/courses", {
    method: "POST",
    csrf: true,
    body: {
      title: `Builder course ${suffix}`,
      slug: `builder-${suffix}`,
      description: "A draft created through the curriculum API.",
      category: "Test",
    },
  })
  assert(created.response.status === 201, `create course failed ${created.response.status} ${JSON.stringify(created.data)}`)
  assert(created.data.data.publicationStatus === "DRAFT", "New courses must stay draft")
  const courseId = created.data.data.id as string
  const hidden = await fetch(`${API_BASE}/catalog/courses/${created.data.data.slug}`)
  assert(hidden.status === 404, "Draft courses must stay off the public catalogue")

  const withModule = await request(adminJar, `/admin/curriculum/courses/${courseId}/modules`, {
    method: "POST",
    csrf: true,
    body: { title: "Second", position: 1 },
  })
  assert(withModule.response.status === 201, "module create failed")
  const second = await request(adminJar, `/admin/curriculum/courses/${courseId}/modules`, {
    method: "POST",
    csrf: true,
    body: { title: "First", position: 1 },
  })
  assert(second.response.status === 201, "positioned module failed")
  assert(second.data.data.modules[0].title === "First", "New module must take the requested position")
  const moduleId = second.data.data.modules[1].id as string
  const lectured = await request(adminJar, `/admin/curriculum/modules/${moduleId}/lectures`, {
    method: "POST",
    csrf: true,
    body: { title: "Lecture A", nodeType: "NOTES", summary: "Notes for the lecture." },
  })
  assert(lectured.response.status === 201, "lecture create failed")
  const reloaded = await request(adminJar, `/admin/curriculum/courses/${courseId}`)
  const savedLecture = reloaded.data.data.modules.find((module: { id: string }) => module.id === moduleId)
  assert(savedLecture.lectures.some((lecture: { title: string }) => lecture.title === "Lecture A"), "Lecture must persist on the selected module")

  const studentCreate = await request(student.jar, "/admin/curriculum/courses", {
    method: "POST",
    csrf: true,
    body: { title: "Nope", slug: `nope-${suffix}`, description: "no", category: "no" },
  })
  assert(studentCreate.response.status === 403, "Students cannot create courses")

  const teacherJar: CookieJar = new Map()
  await request(teacherJar, "/auth/csrf")
  const teacherLogin = await request(teacherJar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email: (await prisma.user.findUniqueOrThrow({ where: { id: teacher.userId } })).email, password: "test-password-123" },
  })
  assert(teacherLogin.response.ok, "teacher login")
  const teacherCourse = await request(teacherJar, "/faculty/courses", { method: "POST", csrf: true, body: {} })
  assert(teacherCourse.response.status === 403, "Teachers cannot create courses")
  const teacherModuleDelete = await request(teacherJar, `/faculty/courses/${courseId}/modules/${moduleId}`, { method: "DELETE", csrf: true, body: {} })
  assert(teacherModuleDelete.response.status === 403, "Teachers cannot delete modules")
  const unassignedLecture = await request(teacherJar, `/faculty/courses/${courseId}/lectures`, {
    method: "POST",
    csrf: true,
    body: { moduleId, title: "Not mine" },
  })
  assert(unassignedLecture.response.status === 403, "Unassigned teachers cannot add lectures")

  await prisma.facultyCourseAssignment.create({ data: { userId: teacher.userId, courseId } })
  const assignedLecture = await request(teacherJar, `/faculty/courses/${courseId}/lectures`, {
    method: "POST",
    csrf: true,
    body: { moduleId, title: "Teacher lecture" },
  })
  assert(assignedLecture.response.status === 201, `Assigned teacher lecture failed ${assignedLecture.response.status}`)

  const published = await request(adminJar, `/admin/curriculum/courses/${courseId}/publish`, { method: "POST", csrf: true, body: {} })
  assert(published.response.status === 200 && published.data.data.publicationStatus === "PUBLISHED", "publish failed")
  const visible = await fetch(`${API_BASE}/catalog/courses/${created.data.data.slug}`)
  assert(visible.status === 200, "Published course must appear in the catalogue")

  console.log("PASS course builder: draft, module order, lecture parent, publish, and teacher boundary")
  await prisma.course.delete({ where: { id: courseId } }).catch(() => undefined)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error)
    await prisma.$disconnect()
    process.exit(1)
  })
