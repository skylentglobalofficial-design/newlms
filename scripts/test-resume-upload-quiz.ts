import "dotenv/config"
import crypto from "node:crypto"
import { promises as fs } from "node:fs"
import { PrismaClient, RoleName } from "@prisma/client"
import { ensureRole } from "../server/src/lib/auth.ts"
import { TEST_CONSENT } from "./test-consent-payload.ts"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:3011/api/v1"
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

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
    else jar.delete(name)
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
  const email = `resume-${label}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}@example.com`
  const created = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName: label, email, password: "test-password-123" },
  })
  assert(created.response.status === 201, `signup failed ${created.response.status} ${JSON.stringify(created.data)}`)
  return { jar, userId: created.data.user.id as string, email }
}

async function main() {
  let courseId: string | null = null
  try {
    courseId = await run()
  } finally {
    if (courseId) await prisma.course.delete({ where: { id: courseId } }).catch(() => undefined)
  }
}

async function run(): Promise<string> {
  const admin = await signup("admin")
  const student = await signup("student")
  const role = await ensureRole(RoleName.PLATFORM_ADMIN)
  await prisma.userRole.deleteMany({ where: { userId: admin.userId } })
  await prisma.userRole.create({ data: { userId: admin.userId, roleId: role.id } })

  const adminJar: CookieJar = new Map()
  await request(adminJar, "/auth/csrf")
  const login = await request(adminJar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email: admin.email, password: "test-password-123" },
  })
  assert(login.response.ok && login.data.role === "admin", "platform admin login")

  const suffix = crypto.randomBytes(3).toString("hex")
  const created = await request(adminJar, "/admin/curriculum/courses", {
    method: "POST",
    csrf: true,
    body: {
      title: `Resume course ${suffix}`,
      slug: `resume-${suffix}`,
      description: "Local verification course.",
      category: "Test",
    },
  })
  assert(created.response.status === 201, "course create failed")
  const courseId = created.data.data.id as string
  const withModule = await request(adminJar, `/admin/curriculum/courses/${courseId}/modules`, {
    method: "POST",
    csrf: true,
    body: { title: "Module 1", position: 1 },
  })
  const moduleId = withModule.data.data.modules[0].id as string
  const notes = await request(adminJar, `/admin/curriculum/modules/${moduleId}/lectures`, {
    method: "POST",
    csrf: true,
    body: { title: "Opening notes", nodeType: "NOTES", summary: "Read this." },
  })
  assert(notes.response.status === 201, "notes lecture failed")
  const quiz = await request(adminJar, `/admin/curriculum/modules/${moduleId}/lectures`, {
    method: "POST",
    csrf: true,
    body: {
      title: "Check",
      nodeType: "QUIZ",
      questions: [{
        question: "Which value is one?",
        options: ["One", "Two"],
        correctIndex: 0,
      }],
    },
  })
  assert(quiz.response.status === 201, `quiz lecture failed ${quiz.response.status} ${JSON.stringify(quiz.data)}`)
  const badQuiz = await request(adminJar, `/admin/curriculum/modules/${moduleId}/lectures`, {
    method: "POST",
    csrf: true,
    body: {
      title: "Bad check",
      nodeType: "QUIZ",
      questions: [{ question: "Nope", options: ["A", "B"], correctIndex: 5 }],
    },
  })
  assert(badQuiz.response.status === 400, "quiz answer outside the options must be refused")
  const quizCount = await prisma.quizQuestion.count({
    where: { node: { moduleId, title: "Check" } },
  })
  assert(quizCount === 1, `expected one persisted quiz question, got ${quizCount}`)

  const pathName = await request(adminJar, `/admin/curriculum/courses/${courseId}/cover`, {
    method: "POST",
    csrf: true,
    body: { fileName: "../cover.png", contentType: "image/png", dataBase64: PNG },
  })
  assert(pathName.response.status === 400, "a path-like file name must be refused")
  const cover = await request(adminJar, `/admin/curriculum/courses/${courseId}/cover`, {
    method: "POST",
    csrf: true,
    body: { fileName: "cover.png", contentType: "image/png", dataBase64: PNG },
  })
  assert(cover.response.status === 200, `cover upload failed ${cover.response.status} ${JSON.stringify(cover.data)}`)
  assert(cover.data.data.coverFileName === "cover.png", "cover file name must be stored")
  const stored = await prisma.course.findUnique({ where: { id: courseId }, select: { coverStorageKey: true } })
  assert(stored?.coverStorageKey && !stored.coverStorageKey.includes(".."), "cover key must be a storage key")
  const uploadRoot = process.env.STORAGE_LOCAL_PATH
  const bucket = process.env.STORAGE_BUCKET
  assert(uploadRoot && bucket, "STORAGE_LOCAL_PATH and STORAGE_BUCKET must be set for this test")
  const saved = await fs.readFile(`${uploadRoot}/${bucket}/${stored.coverStorageKey}`)
  assert(saved.length > 0, "cover bytes must exist on the configured local storage")

  const lecture = await prisma.curriculumNode.findFirst({ where: { moduleId, title: "Opening notes" }, select: { id: true } })
  const pdf = Buffer.from("%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n").toString("base64")
  const material = await request(adminJar, `/admin/curriculum/lectures/${lecture!.id}/materials`, {
    method: "POST",
    csrf: true,
    body: { fileName: "notes.pdf", contentType: "application/pdf", dataBase64: pdf },
  })
  assert(material.response.status === 201, `material upload failed ${material.response.status} ${JSON.stringify(material.data)}`)
  const materialRow = await prisma.lessonMaterial.findFirst({ where: { nodeId: lecture!.id }, select: { storageKey: true, fileName: true } })
  assert(materialRow?.fileName === "notes.pdf" && materialRow.storageKey, "material row must point at storage")

  const published = await request(adminJar, `/admin/curriculum/courses/${courseId}/publish`, {
    method: "POST",
    csrf: true,
    body: {},
  })
  assert(published.response.status === 200, "publish failed")

  const enrolled = await request(student.jar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: `resume-${suffix}`, consent: TEST_CONSENT },
  })
  assert(enrolled.response.status === 201, `enrol failed ${enrolled.response.status} ${JSON.stringify(enrolled.data)}`)
  const workspace = await request(student.jar, `/lms/courses/resume-${suffix}`)
  assert(workspace.response.ok, "workspace failed")
  const lessonKey = workspace.data.data.course.modules[0].lessons[0].id as string
  const opened = await request(student.jar, `/lms/courses/resume-${suffix}/lessons/${lessonKey}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "access" },
  })
  assert(opened.response.ok, `access failed ${opened.response.status} ${JSON.stringify(opened.data)}`)
  const progress = await prisma.lessonProgress.findFirst({
    where: { enrollment: { userId: student.userId }, node: { title: "Opening notes" } },
    select: { completedAt: true },
  })
  assert(progress && progress.completedAt == null, "opening a lesson must not mark it complete")

  const loggedOut = await request(student.jar, "/auth/logout", { method: "POST", csrf: true, body: {} })
  assert(loggedOut.response.ok, "logout failed")
  const afterLogout = await request(student.jar, "/auth/me")
  assert(afterLogout.response.status === 401, "signed-out session must be rejected")

  const fresh: CookieJar = new Map()
  await request(fresh, "/auth/csrf")
  const again = await request(fresh, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email: student.email, password: "test-password-123" },
  })
  assert(again.response.ok, "second login failed")
  const resume = await request(fresh, `/lms/courses/resume-${suffix}/resume`)
  assert(resume.response.ok, "resume failed")
  assert(resume.data.data.lessonId === lessonKey, `resume must return the opened lesson, got ${resume.data.data.lessonId}`)
  assert(resume.data.data.lessonTitle === "Opening notes", "resume title must match the opened lesson")

  console.log("PASS quiz authoring, local file upload, sign-out, and resume")
  return courseId
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error)
    await prisma.$disconnect()
    process.exit(1)
  })
