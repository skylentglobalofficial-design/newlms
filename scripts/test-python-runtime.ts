/**
 * Python runtime stays closed until an isolated service exists.
 * Run: API_BASE=http://127.0.0.1:3000/api/v1 npx tsx scripts/test-python-runtime.ts
 */
import "dotenv/config"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { PrismaClient } from "@prisma/client"
import { TEST_CONSENT } from "./test-consent-payload.ts"
import { provisionCourse } from "../src/lib/practice-platform/index.ts"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const source = readFileSync(resolve("server/src/lib/practice-runtime/python.ts"), "utf8")
assert(!/child_process|spawn\(|execFile|exec\(/.test(source), "The Python runtime module must not spawn a local process")
const routeSource = readFileSync(resolve("server/src/routes/practice.ts"), "utf8")
assert(!/child_process|spawn\(|execFile|exec\(/.test(routeSource), "The practice route must not spawn a local process")
const authorizeAt = routeSource.indexOf("authorizePythonExecution")
const probeAt = routeSource.indexOf("pythonRuntime.probe")
assert(authorizeAt > 0 && probeAt > authorizeAt, "Authorization must run before the runtime provider is called")

const notebook = provisionCourse({
  courseSlug: "data-science-ai",
  programmeSlug: "data-science-ai",
  title: "Data Science & AI",
  outcomes: ["Explore a dataset"],
  tools: ["Python", "pandas"],
  lessons: [{ id: "l1", title: "Clean the extract", type: "assignment", exercise: "notebook" }],
})
assert(notebook.status === "pending_infrastructure", "Notebook courses stay unpublished")
assert(notebook.href === null, "Notebook courses have no learner route")
assert(notebook.missing.some((row) => /isolated Python runtime/i.test(row)), "The missing runtime is named")

const prisma = new PrismaClient()
const slug = `py-auth-${Date.now().toString(36)}`
const secret = `print('learner-secret-marker-${Date.now().toString(36)}')`
const temporaryEnrollmentIds: string[] = []
let temporaryProgramId: string | null = null

async function completeLessonsBefore(enrollmentId: string, courseSlug: string, lessonId: string) {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: { curriculum: { orderBy: { order: "asc" }, include: { nodes: { orderBy: { order: "asc" } } } } },
  })
  assert(course, `${courseSlug} must exist in this database`)
  const nodes = course.curriculum.flatMap((module) => module.nodes)
  const index = nodes.findIndex((node) => node.sourceId === lessonId)
  assert(index > 0, `${courseSlug} lesson ${lessonId} was not found after earlier lessons`)
  const now = new Date()
  for (const node of nodes.slice(0, index)) {
    await prisma.lessonProgress.upsert({
      where: { enrollmentId_nodeId: { enrollmentId, nodeId: node.id } },
      create: { enrollmentId, nodeId: node.id, completedAt: now, lastAccessedAt: now },
      update: { completedAt: now },
    })
  }
}

function manifest(adapterId: string, status: "pending_infrastructure" | "published") {
  return {
    version: 1,
    courseSlug: slug,
    programmeSlug: slug,
    adapterId,
    status,
    title: "Notebook fixture",
    tools: ["Python"],
    lessonIds: ["l1", "l2"],
    href: null,
    datasetId: null,
    caseId: null,
    reasons: ["Disposable authorization fixture"],
    missing: status === "published" ? [] : ["No isolated Python runtime is configured."],
    learnerNote: "Nothing is executed.",
  }
}

async function main() {
  const API = process.env.PRACTICE_API_BASE ?? process.env.API_BASE ?? "http://127.0.0.1:3000/api/v1"
  type Jar = Map<string, string>
  function store(jar: Jar, response: Response) {
    for (const header of response.headers.getSetCookie?.() ?? []) {
      const [pair] = header.split(";")
      const index = pair.indexOf("=")
      if (index > 0) jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
    }
  }
  async function call(jar: Jar, path: string, options: { method?: string; body?: unknown; csrf?: boolean | string } = {}) {
    const headers: Record<string, string> = {}
    const cookie = Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join("; ")
    if (cookie) headers.Cookie = cookie
    if (options.body !== undefined) headers["Content-Type"] = "application/json"
    if (options.csrf === true) headers["X-CSRF-Token"] = jar.get("csrf") ?? ""
    if (typeof options.csrf === "string") headers["X-CSRF-Token"] = options.csrf
    const response = await fetch(`${API}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
    store(jar, response)
    const text = await response.text()
    return { status: response.status, body: text, data: text ? JSON.parse(text) : null }
  }
  function refuse(result: { status: number; body: string; data: { code?: string; error?: string } | null }, status: number, label: string) {
    assert(result.status === status, `${label} expected ${status}, got ${result.status} ${result.body}`)
    assert(!result.body.includes("learner-secret-marker"), `${label} echoed learner source`)
    assert(!/"stdout"/.test(result.body), `${label} invented execution output`)
    assert(result.data?.code !== "runtime_unavailable", `${label} reached the runtime`)
  }
  async function signup(jar: Jar, label: string) {
    await call(jar, "/auth/csrf")
    const created = await call(jar, "/auth/signup", {
      method: "POST",
      csrf: true,
      body: { consent: TEST_CONSENT, displayName: label, email: `runtime-${label}-${Date.now()}@example.com`, password: "test-password-123" },
    })
    assert(created.status === 201, `Signup failed for ${label}: ${created.body}`)
    const me = await call(jar, "/auth/me")
    return me.data.user.id as string
  }
  const execute = (jar: Jar, courseSlug: string, lessonId: string, csrf: boolean | string = true) =>
    call(jar, "/practice/runtimes/python/execute", {
      method: "POST",
      csrf,
      body: { courseSlug, lessonId, source: secret, enrolled: true, published: true },
    })

  const anon = await execute(new Map(), "data-science-ai", "l1", false)
  refuse(anon, 401, "Anonymous execution")

  const learner: Jar = new Map()
  const outsider: Jar = new Map()
  const learnerId = await signup(learner, "learner")
  await signup(outsider, "outsider")
  const missingCsrf = await execute(learner, slug, "l1", false)
  refuse(missingCsrf, 403, "Missing CSRF")
  assert(missingCsrf.data?.error === "Invalid CSRF token", "Missing CSRF uses the CSRF error")
  const badCsrf = await execute(learner, slug, "l1", "not-the-cookie")
  refuse(badCsrf, 403, "Invalid CSRF")
  assert(badCsrf.data?.error === "Invalid CSRF token", "Invalid CSRF uses the CSRF error")

  const course = await prisma.course.create({
    data: {
      slug,
      title: "Python authorization fixture",
      category: "Technology",
      level: "Beginner",
      duration: "1 week",
      mode: "Self-paced",
      lessonCount: 2,
      projectCount: 0,
      rating: 0,
      reviews: 0,
      price: 0,
      originalPrice: 0,
      desc: "Disposable authorization fixture.",
      longDesc: "Disposable authorization fixture. Not a public programme.",
      outcomes: ["Keep the runtime closed"],
      forWhom: ["Test"],
      curriculum: {
        create: {
          sourceId: "m1",
          order: 0,
          title: "Notebook",
          nodes: {
            create: [
              { sourceId: "l1", order: 0, title: "First cell", nodeType: "NOTES" },
              { sourceId: "l2", order: 1, title: "Second cell", nodeType: "NOTES" },
            ],
          },
        },
      },
    },
  })
  const enrollment = await prisma.userEnrollment.create({ data: { userId: learnerId, courseId: course.id, status: "active" } })

  const unenrolled = await execute(outsider, slug, "l1")
  refuse(unenrolled, 403, "Unenrolled learner")
  assert(unenrolled.data?.error === "Enrol in this course to open its workspace.", "Unenrolled learner uses the enrolment error")

  const unknownCourse = await execute(learner, "missing-course-slug", "l1")
  refuse(unknownCourse, 404, "Unknown course")
  assert(unknownCourse.data?.error === "Course not found", "Unknown course uses the course error")

  const unknownLesson = await execute(learner, slug, "l99")
  refuse(unknownLesson, 404, "Unknown lesson")
  assert(unknownLesson.data?.error === "Lesson not found", "Unknown lesson uses the lesson error")

  const malformed = await execute(learner, "Not A Course", "l1")
  refuse(malformed, 400, "Malformed course slug")
  assert(malformed.data?.error === "Validation failed", "Malformed input stays a validation error")

  const unpublished = await execute(learner, slug, "l1")
  refuse(unpublished, 404, "Course without a workspace")
  assert(unpublished.data?.error === "This course has no published workspace.", "A missing workspace stays unpublished")

  const workspace = await prisma.practiceWorkspace.create({
    data: {
      courseSlug: slug,
      programmeSlug: slug,
      syllabus: { courseSlug: slug, title: "Notebook fixture", outcomes: [], tools: ["Python"], lessons: [] },
      manifest: manifest("python-notebook", "pending_infrastructure"),
      config: { adapterId: "python-notebook", lessonIds: ["l1", "l2"], datasetId: null, caseId: null, caseTitle: "", caseNotes: "", tools: ["Python"] },
      status: "pending_infrastructure",
      adapterId: "python-notebook",
    },
  })
  const pending = await execute(learner, slug, "l1")
  refuse(pending, 404, "Unpublished notebook")
  assert(pending.data?.error === "This course has no published workspace.", "A pending notebook is not executable")

  await prisma.practiceWorkspace.update({
    where: { id: workspace.id },
    data: { status: "published", adapterId: "case-studio", manifest: manifest("case-studio", "published"), publishedAt: new Date() },
  })
  const unsupported = await execute(learner, slug, "l1")
  refuse(unsupported, 403, "Published non-Python workspace")
  assert(unsupported.data?.error === "This workspace does not run Python.", "Another workspace type cannot execute Python")

  await prisma.practiceWorkspace.update({
    where: { id: workspace.id },
    data: { status: "published", adapterId: "python-notebook", manifest: manifest("python-notebook", "published") },
  })
  const locked = await execute(learner, slug, "l2")
  refuse(locked, 403, "Locked lesson")
  assert(locked.data?.error === "Lesson locked", "A locked lesson uses the lesson-lock error")

  await prisma.userEnrollment.update({ where: { id: enrollment.id }, data: { status: "withdrawn" } })
  const withdrawn = await execute(learner, slug, "l1")
  refuse(withdrawn, 403, "Withdrawn enrolment")
  await prisma.userEnrollment.update({ where: { id: enrollment.id }, data: { status: "active" } })

  const closed = await execute(learner, slug, "l1")
  assert(closed.status === 503, `Eligible learner must still receive 503, got ${closed.status} ${closed.body}`)
  assert(closed.data?.code === "runtime_unavailable", "Closed runtime uses runtime_unavailable")
  assert(!closed.body.includes("learner-secret-marker"), "The closed runtime echoed learner source")
  assert(!/"stdout"|stderr|durationMs/.test(closed.body), "The closed runtime invented execution output")

  await prisma.practiceWorkspace.update({
    where: { id: workspace.id },
    data: {
      status: "published",
      adapterId: "python-notebook",
      manifest: manifest("case-studio", "published"),
    },
  })
  const mismatched = await execute(learner, slug, "l1")
  refuse(mismatched, 403, "Mismatched notebook manifest")
  assert(mismatched.data?.error === "This workspace does not run Python.", "A python-notebook column cannot override a different manifest adapter")

  const analytics = await prisma.course.findUnique({ where: { slug: "data-analytics" }, select: { id: true } })
  assert(analytics, "Data Analytics must exist in this database")
  const product = await prisma.course.findUnique({ where: { slug: "product-management" }, select: { id: true } })
  assert(product, "Product Management must exist in this database")

  const analyticsJar: Jar = new Map()
  const analyticsId = await signup(analyticsJar, "analytics")
  const analyticsEnrollment = await prisma.userEnrollment.create({ data: { userId: analyticsId, courseId: analytics.id, status: "active" } })
  temporaryEnrollmentIds.push(analyticsEnrollment.id)
  await completeLessonsBefore(analyticsEnrollment.id, "data-analytics", "l7")
  const analyticsPython = await execute(analyticsJar, "data-analytics", "l7")
  refuse(analyticsPython, 403, "Unlocked Data Analytics l7")
  assert(analyticsPython.data?.error === "This workspace does not run Python.", "Northwind SQL is not a Python workspace")

  const harborJar: Jar = new Map()
  const harborId = await signup(harborJar, "harbor")
  const harborEnrollment = await prisma.userEnrollment.create({ data: { userId: harborId, courseId: product.id, status: "active" } })
  temporaryEnrollmentIds.push(harborEnrollment.id)
  await completeLessonsBefore(harborEnrollment.id, "product-management", "l6")
  const harborPython = await execute(harborJar, "product-management", "l6")
  refuse(harborPython, 403, "Unlocked Harbor Desk l6")
  assert(harborPython.data?.error === "This workspace does not run Python.", "Harbor Desk is not a Python workspace")

  const programmeJar: Jar = new Map()
  const programmeUserId = await signup(programmeJar, "programme")
  const program = await prisma.program.create({
    data: {
      slug: `${slug}-program`,
      name: "Unlinked programme",
      duration: "1 week",
      moduleCount: 0,
      projectCount: 0,
      format: "Self-paced",
      cert: "None",
      outcome: "Test only",
      desc: "Disposable programme. It does not link Data Analytics.",
      upcomingBatch: "None",
      programType: "PROFESSIONAL",
      level: "Beginner",
      whoIsItFor: ["Test"],
      whatYouWillLearn: ["Nothing"],
      learningExperience: ["Test"],
      programCourses: { create: { courseId: course.id, sortOrder: 0 } },
    },
  })
  temporaryProgramId = program.id
  await prisma.userEnrollment.create({ data: { userId: programmeUserId, programId: program.id, status: "active" } })
  const unlinked = await execute(programmeJar, "data-analytics", "l1")
  refuse(unlinked, 403, "Programme enrolment without the requested course")
  assert(unlinked.data?.error === "Enrol in this course to open its workspace.", "An unlinked programme enrolment does not open another course")

  console.log("python runtime: closed")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    if (temporaryProgramId) await prisma.program.delete({ where: { id: temporaryProgramId } }).catch(() => undefined)
    if (temporaryEnrollmentIds.length) await prisma.userEnrollment.deleteMany({ where: { id: { in: temporaryEnrollmentIds } } })
    const row = await prisma.practiceWorkspace.findUnique({ where: { courseSlug: slug } })
    if (row) await prisma.practiceWorkspace.delete({ where: { id: row.id } })
    const course = await prisma.course.findUnique({ where: { slug } })
    if (course) await prisma.course.delete({ where: { id: course.id } })
    await prisma.$disconnect()
  })
