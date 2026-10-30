import "dotenv/config"
import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { Prisma, PrismaClient } from "@prisma/client"
import { TEST_CONSENT } from "./test-consent-payload.ts"
import {
  assignmentProgressSelect,
  capabilitiesFromColumns,
  courseCurriculumInclude,
  curriculumNodeSelect,
  isMissingSchemaError,
  jobApplicationSelect,
  quizQuestionSelect,
  UNAVAILABLE_MESSAGES,
  unavailableBody,
  userCredentialSelect,
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
assert(legacy.practiceWorkspaces === false, "missing practice tables stay off")
assert(legacy.policyAcceptance === false, "missing policy table stays off")
assert(legacy.userMustChangePassword === false, "missing password-change column stays off")
assert(legacy.coursePublication === false, "missing publication column stays off")
assert(legacy.curriculumNodeNotes === false, "missing lesson note columns stay off")
assert(legacy.passwordReset === false, "missing password reset table stays off")
assert(legacy.skylentEnquiries === false, "missing enquiry table stays off")
assert(legacy.employerMembership === false, "missing employer membership table stays off")
assert(legacy.collegeMembership === false, "missing college tables stay off")
assert(legacy.platformAdminRole === false && legacy.collegeAdminRole === false, "missing role labels stay off")
assert(legacy.programmeCertificates === false, "missing ProgrammeCertificate table stays off")
assert(legacy.facultyDoubtTickets === false, "missing FacultyDoubtTicket table stays off")
assert(!("mustChangePassword" in userCredentialSelect(false)) && "passwordHash" in userCredentialSelect(false), "login select omits mustChangePassword before that column exists")
assert("mustChangePassword" in userCredentialSelect(true), "login select keeps mustChangePassword after the column exists")
assert(capabilitiesFromColumns([
  { table_name: "PracticeWorkspace", column_name: "id" },
  { table_name: "PracticeWorkspaceRevision", column_name: "id" },
]).practiceWorkspaces === false, "practice stays unavailable until every practice table exists")

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
  { table_name: "PracticeWorkspace", column_name: "id" },
  { table_name: "PracticeWorkspaceRevision", column_name: "id" },
  { table_name: "PracticeWorkspaceResponse", column_name: "id" },
  { table_name: "PolicyAcceptance", column_name: "id" },
  { table_name: "User", column_name: "mustChangePassword" },
  { table_name: "Course", column_name: "publicationStatus" },
  { table_name: "CurriculumNode", column_name: "summary" },
  { table_name: "CurriculumNode", column_name: "referenceUrl" },
  { table_name: "PasswordResetToken", column_name: "id" },
  { table_name: "SkylentEnquiry", column_name: "id" },
  { table_name: "EmployerMembership", column_name: "id" },
  { table_name: "College", column_name: "id" },
  { table_name: "CollegeMembership", column_name: "id" },
  { table_name: "ProgrammeCertificate", column_name: "id" },
  { table_name: "FacultyDoubtTicket", column_name: "id" },
], ["PLATFORM_ADMIN", "COLLEGE_ADMIN"])
assert(Object.values(current).every(Boolean), "a fully migrated schema enables every capability")
assert(current.practiceWorkspaces && current.policyAcceptance, "practice and policy storage are enabled together")

const missingTable = new Prisma.PrismaClientKnownRequestError("missing", { code: "P2021", clientVersion: "test" })
const missingColumn = new Prisma.PrismaClientKnownRequestError("missing", { code: "P2022", clientVersion: "test" })
assert(isMissingSchemaError(missingTable) && isMissingSchemaError(missingColumn), "missing relations are schema errors")
assert(!isMissingSchemaError(new Error("Failed to enroll")), "ordinary failures are not schema errors")
for (const message of Object.values(UNAVAILABLE_MESSAGES)) {
  const body = unavailableBody(message)
  assert(body.code === "unavailable" && body.error === message && !("data" in body), "unavailable responses name the gap and do not invent an empty list")
}

const employerRoute = readFileSync(new URL("../server/src/routes/career/employer-jobs.ts", import.meta.url), "utf8")
assert(employerRoute.includes("UNAVAILABLE_MESSAGES.employerApplications"), "employer applications name the missing share column")
assert(employerRoute.includes("res.status(503).json(unavailableBody(UNAVAILABLE_MESSAGES.employerApplications))"), "employer applications return 503 when sharing is unavailable")
assert(!employerRoute.includes("res.json({ data: [] })"), "a missing share column must not look like zero applicants")

const degreeRoute = readFileSync(new URL("../server/src/routes/degrees.ts", import.meta.url), "utf8")
assert(degreeRoute.includes("unavailableBody(UNAVAILABLE_MESSAGES.degrees)"), "degree routes share one unavailable response")
assert(!degreeRoute.includes('req.path === "/setup-status"'), "a missing Degree table must not be reported as an empty catalogue")

const mediaRoute = readFileSync(new URL("../server/src/routes/admin-media.ts", import.meta.url), "utf8")
assert(mediaRoute.includes("select: curriculumNodeSelect(quizLimits)"), "lesson media updates select only columns that exist")
assert(!("maxAttempts" in curriculumNodeSelect(false)), "that select omits grading columns before the quiz migration")

const practiceRoute = readFileSync(new URL("../server/src/routes/practice.ts", import.meta.url), "utf8")
const practiceAdminRoute = readFileSync(new URL("../server/src/routes/practice-admin.ts", import.meta.url), "utf8")
assert(practiceRoute.includes("unavailableBody(UNAVAILABLE_MESSAGES.practice)"), "learner practice is unavailable without its tables")
assert(practiceAdminRoute.includes('"/practice-workspaces"') && practiceAdminRoute.includes("unavailableBody(UNAVAILABLE_MESSAGES.practice)"), "admin practice is gated without catching other admin routes")

const authRoute = readFileSync(new URL("../server/src/routes/auth.ts", import.meta.url), "utf8")
const lmsRoute = readFileSync(new URL("../server/src/routes/lms.ts", import.meta.url), "utf8")
const signupAt = authRoute.indexOf("readSchemaCapabilities()).policyAcceptance")
const createUserAt = authRoute.indexOf("tx.user.create")
assert(signupAt > 0 && createUserAt > signupAt, "signup checks policy storage before creating a user")
assert(authRoute.includes("Signup blocked: policy storage could not be checked"), "a failed policy probe is caught before signup continues")
assert(authRoute.includes("recordPolicyAcceptance"), "signup still records acceptance inside the account transaction")
assert(lmsRoute.includes("UNAVAILABLE_MESSAGES.enrolment"), "new enrolment stops when policy storage is missing")
assert(lmsRoute.includes("recordPolicyAcceptance"), "enrolment still records acceptance in the same transaction")

const nodeSelect = curriculumNodeSelect(false)
assert(!("maxAttempts" in nodeSelect) && !("passingScore" in nodeSelect), "legacy node select omits quiz limits")
assert(!("summary" in nodeSelect) && !("referenceUrl" in nodeSelect), "legacy node select omits summary and referenceUrl")
assert("summary" in curriculumNodeSelect(false, true) && "referenceUrl" in curriculumNodeSelect(false, true), "note columns stay available once the migration exists")
const lmsLib = readFileSync(new URL("../server/src/lib/lms.ts", import.meta.url), "utf8")
const programRead = lmsLib.slice(lmsLib.indexOf("export async function findProgramBySlug"))
const programReadBody = programRead.slice(0, programRead.indexOf("\nexport ", 10))
assert(!programReadBody.includes("ensureProgramCourseLinks"), "reading a programme must not insert programme-course links")
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
  if (!process.argv.includes("--http")) {
    console.log("schema-capabilities mapping ok")
    console.log("HTTP section skipped. Pass --http only when a fully migrated local API is already running. The September fixture is not that API.")
    return
  }
  console.log(`HTTP section using API_BASE=${API_BASE}. This script does not start that server.`)
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

  const prisma = new PrismaClient()
  try {
    const created = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    assert(created, "signup must persist the account when policy storage exists")
    const acceptances = await prisma.policyAcceptance.count({ where: { userId: created.id, context: "signup" } })
    const enrolmentRows = await prisma.userEnrollment.count({ where: { userId: created.id } })
    assert(acceptances === 1, "signup must record one policy acceptance and not skip it")
    assert(enrolmentRows === 0, "signup must not create an enrolment")
  } finally {
    await prisma.$disconnect()
  }

  const setup = await request(new Map(), "/degrees/setup-status")
  assert(setup.response.status === 200, `setup-status on a migrated database failed: ${setup.response.status}`)
  assert(setup.data?.unavailable !== true, "an existing Degree table must not be described as unavailable")
  assert(typeof setup.data?.isEmpty === "boolean", "setup-status reports emptiness only after the table can be read")

  const practice = await request(new Map(), "/practice/workspaces/data-analytics")
  assert(practice.response.status === 401, `practice with its tables present must ask for sign-in, got ${practice.response.status}`)
  assert(practice.data?.code !== "unavailable", "practice must not claim the tables are missing when they exist")

  const events = await request(jar, "/events")
  assert(events.response.ok, `events list failed on a migrated database: ${events.response.status} ${JSON.stringify(events.data)}`)
  assert(Array.isArray(events.data?.data), "events list must return data, not an error object")

  const degrees = await request(jar, "/degrees")
  assert(degrees.response.ok, `degrees list failed on a migrated database: ${degrees.response.status} ${JSON.stringify(degrees.data)}`)
  assert(Array.isArray(degrees.data?.data), "degrees list must return data when the table exists")

  const probe = spawnSync(process.execPath, ["--import", "tsx", new URL("./test-signup-schema-probe.ts", import.meta.url).pathname], {
    cwd: new URL("..", import.meta.url).pathname,
    encoding: "utf8",
  })
  if (probe.stdout) process.stdout.write(probe.stdout)
  if (probe.status !== 0) {
    if (probe.stderr) process.stderr.write(probe.stderr)
    throw new Error(`signup schema probe failed with status ${probe.status}`)
  }

  console.log("schema-capabilities ok")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
