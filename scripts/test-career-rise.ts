import "dotenv/config"
import crypto from "node:crypto"
import { PrismaClient, CurriculumNodeType } from "@prisma/client"
import { careerRiseCompletion } from "../server/src/lib/career-rise.ts"
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
  const email = `career-rise-${label}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}@example.com`
  const created = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName: `Rise ${label}`, email, password: "test-password-123" },
  })
  assert(created.response.status === 201, `signup failed ${created.response.status}`)
  return { jar, userId: created.data.user.id as string }
}

async function buildCourse(moduleCount: number) {
  const suffix = crypto.randomBytes(3).toString("hex")
  const course = await prisma.course.create({
    data: {
      slug: `rise-${suffix}`,
      title: `Career Rise fixture ${suffix}`,
      category: "Test",
      level: "Test",
      duration: "Test",
      mode: "Test",
      lessonCount: moduleCount,
      projectCount: 0,
      rating: 0,
      reviews: 0,
      price: 0,
      originalPrice: 0,
      desc: "Test curriculum",
      longDesc: "Test curriculum",
      outcomes: [],
      forWhom: [],
      publicationStatus: "PUBLISHED",
      authoredInApp: true,
      curriculum: {
        create: Array.from({ length: moduleCount }, (_, index) => ({
          order: index,
          title: `Module ${index + 1}`,
          sourceId: `mod-${suffix}-${index}`,
          topics: [],
          nodes: {
            create: [{
              order: 0,
              title: `Lesson ${index + 1}`,
              nodeType: CurriculumNodeType.NOTES,
              sourceId: `lec-${suffix}-${index}`,
            }],
          },
        })),
      },
    },
    include: { curriculum: { include: { nodes: true } } },
  })
  return course
}

async function completeModules(enrollmentId: string, course: Awaited<ReturnType<typeof buildCourse>>, count: number) {
  const modules = course.curriculum.slice(0, count)
  for (const module of modules) {
    await prisma.lessonProgress.upsert({
      where: { enrollmentId_nodeId: { enrollmentId, nodeId: module.nodes[0].id } },
      update: { completedAt: new Date() },
      create: { enrollmentId, nodeId: module.nodes[0].id, completedAt: new Date() },
    })
  }
}

async function main() {
  const zero = careerRiseCompletion([{ nodeCount: 10, completedNodeCount: 0 }])
  assert(zero.percent === 0 && zero.eligible === false, "0% must be ineligible")
  const fiftyNine = careerRiseCompletion(Array.from({ length: 100 }, (_, index) => ({
    nodeCount: 1,
    completedNodeCount: index < 59 ? 1 : 0,
  })))
  assert(fiftyNine.percent === 59 && fiftyNine.eligible === false, `59% must be ineligible, got ${fiftyNine.percent}`)
  const sixty = careerRiseCompletion(Array.from({ length: 10 }, (_, index) => ({
    nodeCount: 1,
    completedNodeCount: index < 6 ? 1 : 0,
  })))
  assert(sixty.percent === 60 && sixty.eligible === true, "60% must be eligible")
  const above = careerRiseCompletion(Array.from({ length: 10 }, (_, index) => ({
    nodeCount: 1,
    completedNodeCount: index < 7 ? 1 : 0,
  })))
  assert(above.percent === 70 && above.eligible === true, "Above 60% must stay eligible")
  const opened = careerRiseCompletion([{ nodeCount: 2, completedNodeCount: 0 }])
  assert(opened.eligible === false, "Opening lessons without completion must not count")
  console.log("PASS calculation 0 / 59 / 60 / above")

  const learner = await signup("learner")
  const other = await signup("other")
  const course = await buildCourse(10)
  const enrollment = await prisma.userEnrollment.create({
    data: { userId: learner.userId, courseId: course.id, status: "active" },
  })

  const atZero = await request(learner.jar, "/career-rise/enrolments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: course.slug },
  })
  assert(atZero.response.status === 403, `0% enrolment must be refused, got ${atZero.response.status}`)

  await prisma.lessonProgress.create({
    data: { enrollmentId: enrollment.id, nodeId: course.curriculum[0].nodes[0].id },
  })
  const openedOnly = await request(learner.jar, "/career-rise/enrolments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: course.slug },
  })
  assert(openedOnly.response.status === 403, "A started lesson must not unlock Career Rise")

  await completeModules(enrollment.id, course, 5)
  const atFifty = await request(learner.jar, "/career-rise/enrolments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: course.slug },
  })
  assert(atFifty.response.status === 403, "50% must stay ineligible")

  await completeModules(enrollment.id, course, 6)
  const atSixty = await request(learner.jar, "/career-rise/enrolments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: course.slug },
  })
  assert(atSixty.response.status === 201, `60% enrolment failed ${atSixty.response.status} ${JSON.stringify(atSixty.data)}`)
  const duplicate = await request(learner.jar, "/career-rise/enrolments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: course.slug },
  })
  assert(duplicate.response.status === 200 && duplicate.data.data.duplicate === true, "Duplicate enrolment must not create another row")
  const rows = await prisma.careerRiseEnrolment.count({ where: { userId: learner.userId, courseId: course.id } })
  assert(rows === 1, `Expected one Career Rise row, found ${rows}`)

  const stolen = await request(other.jar, "/career-rise/enrolments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: course.slug },
  })
  assert(stolen.response.status === 403, "Another learner must not enrol from someone else's progress")
  const outsiderRows = await prisma.careerRiseEnrolment.count({ where: { userId: other.userId } })
  assert(outsiderRows === 0, "A refused enrolment must not create a row")
  const osGrants = await prisma.careerOsAccess.count({ where: { userId: { in: [learner.userId, other.userId] } } })
  assert(osGrants === 0, "Career Rise enrolment must not grant Career OS access")

  const outsider = await request(other.jar, `/career-rise/workspace?courseSlug=${course.slug}`)
  assert(outsider.response.status === 403, "Another learner must not open the Career Rise workspace")
  const workspace = await request(learner.jar, `/career-rise/workspace?courseSlug=${course.slug}`)
  assert(workspace.response.status === 200 && workspace.data.data.enrolled === true, "Enrolled learner can open the workspace")
  assert(workspace.data.data.coaching == null && workspace.data.data.placements == null, "Workspace must not invent coaching or placements")

  const wide = await buildCourse(100)
  const wideEnrollment = await prisma.userEnrollment.create({
    data: { userId: learner.userId, courseId: wide.id, status: "active" },
  })
  await completeModules(wideEnrollment.id, wide, 59)
  const atFiftyNine = await request(learner.jar, "/career-rise/enrolments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: wide.slug },
  })
  assert(atFiftyNine.response.status === 403 && atFiftyNine.data.percent === 59, `59% API must refuse, got ${JSON.stringify(atFiftyNine.data)}`)
  await completeModules(wideEnrollment.id, wide, 60)
  const [firstEnrol, secondEnrol] = await Promise.all([
    request(learner.jar, "/career-rise/enrolments", {
      method: "POST",
      csrf: true,
      body: { courseSlug: wide.slug },
    }),
    request(learner.jar, "/career-rise/enrolments", {
      method: "POST",
      csrf: true,
      body: { courseSlug: wide.slug },
    }),
  ])
  const pair = [firstEnrol, secondEnrol]
  assert(pair.every((result) => result.data?.data?.enrolled === true), "Both Career Rise responses must say enrolled")
  const created = pair.filter((result) => result.response.status === 201)
  const repeated = pair.filter((result) => result.response.status === 200 && result.data?.data?.duplicate === true)
  assert(created.length === 1 && repeated.length === 1, `Concurrent enrolment must create one row, got ${pair.map((result) => result.response.status).join(",")}`)
  const wideRows = await prisma.careerRiseEnrolment.count({ where: { userId: learner.userId, courseId: wide.id } })
  assert(wideRows === 1, `Concurrent enrolment stored ${wideRows} rows`)

  console.log("PASS Career Rise eligibility, explicit enrol, duplicate prevention, and workspace lock")
  await prisma.course.deleteMany({ where: { id: { in: [course.id, wide.id] } } })
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error)
    await prisma.$disconnect()
    process.exit(1)
  })
