import "dotenv/config"
import { TEST_CONSENT } from "./test-consent-payload.ts"
import {
  assignmentProgressSelect,
  capabilitiesFromColumns,
  courseCurriculumInclude,
  curriculumNodeSelect,
  jobApplicationSelect,
  quizQuestionSelect,
} from "../server/src/lib/schema-capabilities.ts"

const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function columnsOf(select: object): string[] {
  return Object.entries(select)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name)
}

const legacy = capabilitiesFromColumns([
  { table_name: "CurriculumNode", column_name: "id" },
  { table_name: "AssignmentProgress", column_name: "id" },
  { table_name: "QuizQuestion", column_name: "id" },
  { table_name: "JobApplication", column_name: "id" },
])
assert(legacy.curriculumNodeQuizLimits === false, "missing quiz-limit columns stay off")
assert(legacy.assignmentGrading === false, "missing grading columns stay off")
assert(legacy.quizExplanations === false, "missing explanations stay off")
assert(legacy.events === false, "missing Event table stays off")
assert(legacy.degrees === false, "missing Degree table stays off")
assert(legacy.skylentCertificates === false, "missing certificate table stays off")
assert(legacy.jobApplicationSharing === false, "missing share column stays off")

const current = capabilitiesFromColumns([
  { table_name: "CurriculumNode", column_name: "maxAttempts" },
  { table_name: "CurriculumNode", column_name: "passingScore" },
  { table_name: "AssignmentProgress", column_name: "grade" },
  { table_name: "AssignmentProgress", column_name: "feedback" },
  { table_name: "AssignmentProgress", column_name: "gradedById" },
  { table_name: "AssignmentProgress", column_name: "gradedAt" },
  { table_name: "QuizQuestion", column_name: "explanation" },
  { table_name: "Event", column_name: "id" },
  { table_name: "Degree", column_name: "id" },
  { table_name: "SkylentCertificate", column_name: "id" },
  { table_name: "JobApplication", column_name: "sharedWithEmployer" },
])
assert(Object.values(current).every(Boolean), "a fully migrated schema enables every capability")

const nodeSelect = curriculumNodeSelect(false)
assert(!("maxAttempts" in nodeSelect) && !("passingScore" in nodeSelect), "legacy node select omits quiz limits")
assert("title" in curriculumNodeSelect(false) && "muxPlaybackId" in curriculumNodeSelect(false), "legacy node select keeps lesson fields")
assert("maxAttempts" in curriculumNodeSelect(true), "current node select keeps quiz limits")

const legacyAssignment = assignmentProgressSelect(false)
assert(!("grade" in legacyAssignment) && "status" in legacyAssignment, "legacy assignment select omits grading columns")
assert("grade" in assignmentProgressSelect(true), "current assignment select keeps grade")
assert(!("explanation" in quizQuestionSelect(false)) && "correctIndex" in quizQuestionSelect(false), "legacy quiz select omits explanation")
assert(!("sharedWithEmployer" in jobApplicationSelect(false)), "legacy application select omits the share column")

const include = courseCurriculumInclude(false)
const selected = include.curriculum.include.nodes.select
assert(selected && !("maxAttempts" in selected), "course curriculum include follows the legacy node select")
void columnsOf

type CookieJar = Map<string, string>

function cookieHeader(jar: CookieJar): string {
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ")
}

async function request(jar: CookieJar, path: string, options: { method?: string; body?: unknown; csrf?: boolean } = {}) {
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
  const setCookie = response.headers.getSetCookie?.() ?? []
  for (const header of setCookie) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index === -1) continue
    jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
  }
  const text = await response.text()
  return { response, data: text ? JSON.parse(text) : null }
}

async function main() {
  const anon = await request(new Map(), "/lms/dashboard")
  assert(anon.response.status === 401, `signed-out dashboard must be 401, got ${anon.response.status}`)
  assert(anon.data?.error === "Unauthorized", "signed-out dashboard must not leak a server error")

  const jar = new Map<string, string>()
  const email = `schema-dash-${Date.now()}@example.com`
  await request(jar, "/auth/csrf")
  const signup = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName: "Schema Dash", email, password: "test-password-123" },
  })
  assert(signup.response.status === 201, `signup failed: ${signup.response.status} ${JSON.stringify(signup.data)}`)

  const dashboard = await request(jar, "/lms/dashboard")
  assert(dashboard.response.status === 200, `empty learner dashboard failed: ${dashboard.response.status} ${JSON.stringify(dashboard.data)}`)
  assert(dashboard.data?.data === null, "a new account must get an empty dashboard, not invented learning data")

  const enrollments = await request(jar, "/lms/enrollments")
  assert(enrollments.response.status === 200, `enrollments failed: ${enrollments.response.status}`)
  assert(Array.isArray(enrollments.data?.data) && enrollments.data.data.length === 0, "a new account must have zero enrolments")

  const events = await request(jar, "/events")
  assert(events.response.ok, `events list failed on a migrated database: ${events.response.status} ${JSON.stringify(events.data)}`)
  assert(Array.isArray(events.data?.data), "events list must return data, not an error object")

  const degrees = await request(jar, "/degrees")
  assert(degrees.response.ok, `degrees list failed on a migrated database: ${degrees.response.status} ${JSON.stringify(degrees.data)}`)
  assert(Array.isArray(degrees.data?.data), "degrees list must return data when the table exists")

  console.log("schema-capabilities ok")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
