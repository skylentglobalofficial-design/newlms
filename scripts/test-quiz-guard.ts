import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { TEST_CONSENT } from "./test-consent-payload.ts"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:3099/api/v1"

type CookieJar = Map<string, string>

function assert(condition: unknown, message: string): asserts condition {
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

function cookieHeader(jar: CookieJar): string {
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ")
}

async function request(
  jar: CookieJar,
  path: string,
  options: { method?: string; body?: unknown; csrf?: boolean } = {},
) {
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
  parseSetCookie(response.headers.getSetCookie?.() ?? [], jar)
  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }
  }
  return { response, data: data as { error?: string; data?: Record<string, unknown> & { questions?: unknown[]; retryAfterSeconds?: number; passed?: boolean; lessonStates?: Record<string, { locked?: boolean; complete?: boolean }> } } }
}

async function signup(jar: CookieJar, displayName: string) {
  const email = `quiz-guard-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`
  await request(jar, "/auth/csrf")
  const created = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName, email, password: "test-password-123" },
  })
  assert(created.response.status === 201, `signup failed ${created.response.status} ${JSON.stringify(created.data)}`)
  return { email, password: "test-password-123" }
}

async function enroll(jar: CookieJar, body: { courseSlug?: string; programSlug?: string }) {
  const result = await request(jar, "/lms/enrollments", { method: "POST", csrf: true, body: { consent: TEST_CONSENT, ...body } })
  assert(result.response.status === 201 || result.response.ok, `enrol failed ${JSON.stringify(result.data)}`)
}

async function completeNotes(jar: CookieJar, lessonKey: string) {
  const result = await request(jar, `/lms/courses/data-analytics/lessons/${lessonKey}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(result.response.ok, `complete ${lessonKey} failed ${JSON.stringify(result.data)}`)
}

const UNSAFE = /correctIndex|explanation|answer key|hidden solution/i

async function main() {
  console.log("1. GET quiz exposes only safe fields")
  const jar = new Map<string, string>()
  const account = await signup(jar, "Quiz Guard Learner")
  await enroll(jar, { courseSlug: "data-analytics" })
  await completeNotes(jar, "l1")
  await completeNotes(jar, "l2")

  const lockedNext = await request(jar, "/lms/courses/data-analytics")
  assert(lockedNext.data.data?.lessonStates?.l3?.locked === false, "l3 should unlock after l1 and l2")
  assert(lockedNext.data.data?.lessonStates?.l4?.locked === true, "l4 stays locked before the quiz is passed")

  const quiz = await request(jar, "/lms/courses/data-analytics/lessons/l3/quiz")
  assert(quiz.response.status === 200, `quiz GET ${quiz.response.status}`)
  const bodyText = JSON.stringify(quiz.data)
  assert(!UNSAFE.test(bodyText), `quiz GET leaked unsafe fields: ${bodyText.slice(0, 400)}`)
  const questions = quiz.data.data?.questions as Array<{ q: string; options: string[]; correctIndex?: number }>
  assert(questions?.length === 5, "expected 5 questions")
  assert(questions.every((question) => question.correctIndex === undefined && Array.isArray(question.options)), "questions are prompt and options only")

  const course = await prisma.course.findUnique({ where: { slug: "data-analytics" } })
  assert(course, "course row")
  const node = await prisma.curriculumNode.findFirst({
    where: { sourceId: "l3", module: { courseId: course.id } },
    include: { quizQuestions: { orderBy: { sortOrder: "asc" } } },
  })
  assert(node && node.quizQuestions.length === 5, "db questions")
  const user = await prisma.user.findUnique({ where: { email: account.email } })
  assert(user, "user row")
  const before = await prisma.quizAttempt.count({ where: { userId: user.id, nodeId: node.id } })

  console.log("2. Malformed submissions are 400 and store nothing")
  const cases: Array<{ label: string; body: unknown }> = [
    { label: "too few", body: { answers: [0] } },
    { label: "too many", body: { answers: [0, 0, 0, 0, 0, 0] } },
    { label: "non-integer", body: { answers: [0.5, 0, 0, 0, 0] } },
    { label: "negative", body: { answers: [-1, 0, 0, 0, 0] } },
    { label: "out of range", body: { answers: [0, 0, 0, 0, 99] } },
    { label: "malformed", body: { answers: "nope" } },
    { label: "missing", body: {} },
  ]
  for (const item of cases) {
    const result = await request(jar, "/lms/courses/data-analytics/lessons/l3/quiz/attempts", {
      method: "POST",
      csrf: true,
      body: item.body,
    })
    assert(result.response.status === 400, `${item.label} expected 400, got ${result.response.status} ${JSON.stringify(result.data)}`)
    assert(!UNSAFE.test(JSON.stringify(result.data)), `${item.label} leaked unsafe text`)
  }
  const afterInvalid = await prisma.quizAttempt.count({ where: { userId: user.id, nodeId: node.id } })
  assert(afterInvalid === before, "invalid submissions must not be stored")

  console.log("3. Failed attempt does not unlock the next lesson")
  const wrong = node.quizQuestions.map((question) => (question.correctIndex === 0 ? 1 : 0))
  const failed = await request(jar, "/lms/courses/data-analytics/lessons/l3/quiz/attempts", {
    method: "POST",
    csrf: true,
    body: { answers: wrong },
  })
  assert(failed.response.status === 201, `failed attempt ${failed.response.status} ${JSON.stringify(failed.data)}`)
  assert(failed.data.data?.passed === false, "wrong answers must not pass")
  const stillLocked = await request(jar, "/lms/courses/data-analytics")
  assert(stillLocked.data.data?.lessonStates?.l3?.complete !== true, "failed quiz is not complete")
  assert(stillLocked.data.data?.lessonStates?.l4?.locked === true, "failed quiz must not unlock l4")

  console.log("4. Advisory lock throttles the sixth scored attempt")
  for (let index = 0; index < 4; index += 1) {
    const again = await request(jar, "/lms/courses/data-analytics/lessons/l3/quiz/attempts", {
      method: "POST",
      csrf: true,
      body: { answers: wrong },
    })
    assert(again.response.status === 201, `attempt ${index + 2} expected 201, got ${again.response.status} ${JSON.stringify(again.data)}`)
  }
  const limited = await request(jar, "/lms/courses/data-analytics/lessons/l3/quiz/attempts", {
    method: "POST",
    csrf: true,
    body: { answers: node.quizQuestions.map((question) => question.correctIndex) },
  })
  assert(limited.response.status === 429, `sixth attempt expected 429, got ${limited.response.status} ${JSON.stringify(limited.data)}`)
  assert(typeof limited.data.data?.retryAfterSeconds === "number" || typeof (limited.data as { retryAfterSeconds?: number }).retryAfterSeconds === "number", "429 includes retry information")
  const retryHeader = limited.response.headers.get("retry-after")
  assert(retryHeader && Number(retryHeader) > 0, "Retry-After header")
  const stored = await prisma.quizAttempt.count({ where: { userId: user.id, nodeId: node.id } })
  assert(stored === 5, `expected 5 stored attempts, got ${stored}`)
  const still = await request(jar, "/lms/courses/data-analytics")
  assert(still.data.data?.lessonStates?.l4?.locked === true, "throttled correct submit must not unlock l4")

  console.log("5. A passed quiz unlocks the next lesson")
  const passer = new Map<string, string>()
  await signup(passer, "Quiz Pass Learner")
  await enroll(passer, { courseSlug: "data-analytics" })
  await completeNotes(passer, "l1")
  await completeNotes(passer, "l2")
  const passed = await request(passer, "/lms/courses/data-analytics/lessons/l3/quiz/attempts", {
    method: "POST",
    csrf: true,
    body: { answers: node.quizQuestions.map((question) => question.correctIndex) },
  })
  assert(passed.response.status === 201, `pass ${passed.response.status} ${JSON.stringify(passed.data)}`)
  assert(passed.data.data?.passed === true, "correct answers pass")
  const unlocked = await request(passer, "/lms/courses/data-analytics")
  assert(unlocked.data.data?.lessonStates?.l3?.complete === true, "passed quiz is complete")
  assert(unlocked.data.data?.lessonStates?.l4?.locked === false, "passed quiz unlocks l4")
  const forced = await request(jar, "/lms/courses/data-analytics/lessons/l3/progress", {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(forced.response.status === 400, "client cannot mark a failed quiz complete")

  console.log("Quiz guard checks passed")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
