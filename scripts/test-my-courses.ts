import "dotenv/config"
import crypto from "node:crypto"
import { PrismaClient } from "@prisma/client"
import { myCourseRows } from "../src/lib/my-courses.ts"
import type { ApiEnrollmentSummary } from "../src/lib/lms-api.ts"
import { TEST_CONSENT } from "./test-consent-payload.ts"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:3000/api/v1"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function row(partial: Partial<ApiEnrollmentSummary> & Pick<ApiEnrollmentSummary, "id">): ApiEnrollmentSummary {
  return {
    status: "active",
    courseSlug: null,
    courseTitle: null,
    programSlug: null,
    programName: null,
    certificateEligible: false,
    certificateStatus: "locked",
    createdAt: "2026-10-28T00:00:00.000Z",
    updatedAt: "2026-10-28T00:00:00.000Z",
    ...partial,
  }
}

function progress(completedCount: number, totalLessons: number) {
  return {
    completedCount,
    totalLessons,
    progressPct: totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100),
    allComplete: totalLessons > 0 && completedCount === totalLessons,
  }
}

const none = myCourseRows([])
assert(none.length === 0, "Zero enrolments must be an empty course list")
const one = myCourseRows([row({ id: "1", courseSlug: "data-analytics", courseTitle: "Data Analytics", courses: [{ slug: "data-analytics", title: "Data Analytics", progress: progress(1, 4), openAssessments: [] }] })])
assert(one.length === 1 && one[0].slug === "data-analytics", "One enrolment must show one course")
const programme = myCourseRows([row({
  id: "2",
  programSlug: "sample",
  programName: "Sample programme",
  courses: [
    { slug: "alpha", title: "Alpha", progress: progress(0, 2), openAssessments: [] },
    { slug: "beta", title: "Beta", progress: progress(1, 2), openAssessments: [] },
  ],
})])
assert(programme.length === 2, "One programme enrolment with two courses must show both courses")
const many = myCourseRows([
  row({ id: "3", courses: [{ slug: "alpha", title: "Alpha", progress: progress(0, 1), openAssessments: [] }] }),
  row({ id: "4", courses: [{ slug: "beta", title: "Beta", progress: progress(0, 1), openAssessments: [] }, { slug: "gamma", title: "Gamma", progress: progress(0, 1), openAssessments: [] }] }),
])
assert(many.length === 3, "Multiple enrolments must show every distinct course")
console.log("PASS My Courses row expansion for 0, 1, 2, and many")

type CookieJar = Map<string, string>
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

async function main() {
  const jar: CookieJar = new Map()
  await request(jar, "/auth/csrf")
  const email = `my-courses-${Date.now()}@example.com`
  const signup = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName: "My Courses", email, password: "test-password-123" },
  })
  assert(signup.response.status === 201, "signup failed")
  const empty = await request(jar, "/lms/enrollments")
  assert(empty.response.ok && empty.data.data.length === 0, "API must return zero enrolments")
  const suffix = crypto.randomBytes(3).toString("hex")
  const first = await prisma.course.create({
    data: {
      slug: `mine-a-${suffix}`, title: "Mine A", category: "Test", level: "Test", duration: "Test", mode: "Test",
      lessonCount: 0, projectCount: 0, rating: 0, reviews: 0, price: 0, originalPrice: 0,
      desc: "Test", longDesc: "Test", outcomes: [], forWhom: [], publicationStatus: "PUBLISHED", authoredInApp: true,
    },
  })
  const second = await prisma.course.create({
    data: {
      slug: `mine-b-${suffix}`, title: "Mine B", category: "Test", level: "Test", duration: "Test", mode: "Test",
      lessonCount: 0, projectCount: 0, rating: 0, reviews: 0, price: 0, originalPrice: 0,
      desc: "Test", longDesc: "Test", outcomes: [], forWhom: [], publicationStatus: "PUBLISHED", authoredInApp: true,
    },
  })
  await prisma.userEnrollment.create({ data: { userId: signup.data.user.id, courseId: first.id } })
  const single = await request(jar, "/lms/enrollments")
  assert(single.data.data.length === 1, "One enrolment must be returned")
  await prisma.userEnrollment.create({ data: { userId: signup.data.user.id, courseId: second.id } })
  const both = await request(jar, "/lms/enrollments")
  assert(both.data.data.length === 2, `Two enrolments must both be returned, got ${both.data.data.length}`)
  const program = await prisma.program.create({
    data: {
      slug: `mine-program-${suffix}`,
      name: "Mine programme",
      duration: "Test",
      moduleCount: 0,
      projectCount: 0,
      format: "Test",
      cert: "None",
      outcome: "Test",
      desc: "Test",
      upcomingBatch: "None",
      programType: "PROFESSIONAL",
      level: "Test",
      whoIsItFor: [],
      whatYouWillLearn: [],
      learningExperience: [],
      programCourses: {
        create: [
          { courseId: first.id, sortOrder: 0 },
          { courseId: second.id, sortOrder: 1 },
        ],
      },
    },
  })
  await prisma.userEnrollment.create({ data: { userId: signup.data.user.id, programId: program.id } })
  const expanded = await request(jar, "/lms/enrollments")
  const programmeRow = expanded.data.data.find((item: { programSlug: string | null }) => item.programSlug === program.slug)
  assert(programmeRow.courses.length === 2, "Programme enrolment must include both linked courses")
  console.log("PASS enrolment API returns every enrolment and every linked course")
  await prisma.program.delete({ where: { id: program.id } })
  await prisma.course.deleteMany({ where: { id: { in: [first.id, second.id] } } })
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error)
    await prisma.$disconnect()
    process.exit(1)
  })
