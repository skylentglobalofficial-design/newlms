import "dotenv/config"
import crypto from "node:crypto"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://localhost:3001/api/v1"

type CookieJar = Map<string, string>

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

function cookieHeader(jar: CookieJar): string {
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ")
}

async function request(
  jar: CookieJar,
  path: string,
  options: { method?: string; body?: unknown; csrf?: boolean; csrfToken?: string } = {},
) {
  const headers: Record<string, string> = {}
  const cookie = cookieHeader(jar)
  if (cookie) headers.Cookie = cookie
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) {
    headers["X-CSRF-Token"] = options.csrfToken ?? jar.get("csrf") ?? ""
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const setCookie = response.headers.getSetCookie?.() ?? []
  parseSetCookie(setCookie, jar)

  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  return { response, data }
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

async function signupUser(jar: CookieJar, label: string) {
  const email = `lms-test-${label}-${Date.now()}@example.com`
  const password = "test-password-123"
  await request(jar, "/auth/csrf")
  const signup = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName: `LMS ${label}`, email, password },
  })
  assert(signup.response.status === 201, `Signup failed for ${label}`)
  return { email, password }
}

async function main() {
  const courseSlug = "data-analytics"
  const userAJar: CookieJar = new Map()
  const userBJar: CookieJar = new Map()
  const anonJar: CookieJar = new Map()

  console.log("1. Unauthenticated user cannot access protected course workspace")
  const anonCourse = await request(anonJar, `/lms/courses/${courseSlug}`)
  assert(anonCourse.response.status === 401, "Unauthenticated course access should be rejected")

  const anonAccess = await request(anonJar, `/lms/courses/${courseSlug}/access`)
  assert(anonAccess.response.ok, "Access check should be public")
  assert(anonAccess.data.data.authenticated === false, "Anonymous access should report unauthenticated")
  assert(anonAccess.data.data.canAccess === false, "Anonymous user should not have access")

  console.log("2. Authenticated user can enroll and access course")
  await signupUser(userAJar, "a")
  const enroll = await request(userAJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug },
  })
  assert(enroll.response.status === 201 || enroll.response.ok, "Enrollment should succeed")
  assert(enroll.data.data?.course.slug === courseSlug, "Enrollment should return course workspace")

  const workspace = await request(userAJar, `/lms/courses/${courseSlug}`)
  assert(workspace.response.ok, "Enrolled user should access course workspace")
  assert(workspace.data.data.enrollment.courseSlug === courseSlug, "Workspace course slug mismatch")

  console.log("3. Non-enrolled user cannot access enrolled content")
  await signupUser(userBJar, "b")
  const blocked = await request(userBJar, `/lms/courses/${courseSlug}`)
  assert(blocked.response.status === 403, "Non-enrolled user should be blocked from course workspace")

  const blockedAccess = await request(userBJar, `/lms/courses/${courseSlug}/access`)
  assert(blockedAccess.response.ok, "Access endpoint should respond")
  assert(blockedAccess.data.data.enrolled === false, "User B should not be enrolled")

  console.log("4. User can mark own lesson complete")
  const complete = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l4/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(complete.response.ok, "Lesson completion should succeed")
  assert(complete.data.data.state.complete === true, "Lesson should be marked complete")

  console.log("5. User cannot access another user's progress via protected routes")
  const crossUser = await request(userBJar, `/lms/courses/${courseSlug}/lessons/l4/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(crossUser.response.status === 403, "Non-enrolled user cannot modify lesson progress")

  console.log("6. Resume lesson returns correct lesson")
  const resume = await request(userAJar, `/lms/courses/${courseSlug}/resume`)
  assert(resume.response.ok, "Resume endpoint should succeed")
  assert(resume.data.data.lessonId, "Resume should include lesson id")
  assert(typeof resume.data.data.moduleTitle === "string", "Resume should include module title")

  console.log("7. Quiz attempt persists")
  const quiz = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l3/quiz`)
  assert(quiz.response.ok, "Quiz questions should load for enrolled user")
  const questions = quiz.data.data.questions
  assert(Array.isArray(questions) && questions.length > 0, "Quiz should have questions")

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } })
  assert(course, "Course should exist in database")

  const quizNode = await prisma.curriculumNode.findFirst({
    where: {
      externalKey: "l3",
      module: { courseId: course.id },
    },
  })
  assert(quizNode, "Quiz node l3 should exist for course")

  const dbQuestions = await prisma.quizQuestion.findMany({
    where: { nodeId: quizNode.id },
    orderBy: { sortOrder: "asc" },
  })
  const answers = dbQuestions.map((q) => q.correctIndex)
  const attempt = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l3/quiz/attempts`, {
    method: "POST",
    csrf: true,
    body: { answers },
  })
  assert(attempt.response.status === 201, "Quiz attempt should persist")
  assert(attempt.data.data.passed === true, "Correct answers should pass quiz")

  const attemptCount = await prisma.quizAttempt.count({
    where: { nodeId: quizNode.id },
  })
  assert(attemptCount >= 1, "Quiz attempt should exist in database")

  console.log("8. Assignment state persists")
  const assignmentSubmit = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l6/assignment`, {
    method: "POST",
    csrf: true,
    body: { action: "submit", responseText: "My Excel analysis submission." },
  })
  assert(assignmentSubmit.response.ok, "Assignment submit should succeed")
  assert(assignmentSubmit.data.data.status === "submitted", "Assignment should be submitted")

  const assignmentRow = await prisma.assignmentProgress.findFirst({
    where: {
      node: { externalKey: "l6", module: { courseId: course.id } },
      status: "submitted",
    },
  })
  assert(assignmentRow, "Assignment progress should exist in database")

  console.log("All LMS integration checks passed.")
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
