/**
 * Assessment ownership, lesson completion, and programme-to-direct progress.
 * Does not issue a certificate. The course is left incomplete on purpose.
 */
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { TEST_CONSENT } from "./test-consent-payload.ts"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:3215/api/v1"
const COURSE = "data-analytics"
const PROGRAM = "data-analytics-pro"
const SECRET = "Learner A private assignment note"
const OTHER_DRAFT = "Learner B private draft note"

type CookieJar = Map<string, string>
type LessonRef = { id: string; type: string }

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
  let data: { error?: string; data?: Record<string, unknown> } | null = null
  if (text) data = JSON.parse(text) as { error?: string; data?: Record<string, unknown> }
  return { response, data }
}

async function signup(jar: CookieJar, displayName: string) {
  const email = `assessment-${displayName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}@example.com`
  await request(jar, "/auth/csrf")
  const created = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName, email, password: "test-password-123" },
  })
  assert(created.response.status === 201, `signup failed for ${displayName}: ${created.response.status}`)
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  assert(user, `user row missing for ${displayName}`)
  return user
}

function lessonList(payload: { data?: Record<string, unknown> } | null): LessonRef[] {
  const modules = payload?.data?.course as { modules?: Array<{ lessons?: LessonRef[] }> } | undefined
  const nested = (payload?.data as { course?: { modules?: Array<{ lessons?: LessonRef[] }> } } | undefined)?.course
  const source = modules?.modules ?? nested?.modules ?? []
  return source.flatMap((module) => module.lessons ?? [])
}

async function workspace(jar: CookieJar) {
  const result = await request(jar, `/lms/courses/${COURSE}`)
  assert(result.response.ok, `workspace failed: ${result.response.status}`)
  return result
}

async function completeLesson(jar: CookieJar, lesson: LessonRef) {
  if (lesson.type === "quiz") {
    const course = await prisma.course.findUnique({ where: { slug: COURSE }, select: { id: true } })
    assert(course, "course row")
    const node = await prisma.curriculumNode.findFirst({
      where: { sourceId: lesson.id, module: { courseId: course.id } },
      include: { quizQuestions: { orderBy: { sortOrder: "asc" } } },
    })
    assert(node && node.quizQuestions.length > 0, `quiz ${lesson.id} has no questions`)
    const result = await request(jar, `/lms/courses/${COURSE}/lessons/${lesson.id}/quiz/attempts`, {
      method: "POST",
      csrf: true,
      body: { answers: node.quizQuestions.map((question) => question.correctIndex) },
    })
    assert(result.response.status === 201, `quiz ${lesson.id} failed: ${result.response.status} ${result.data?.error ?? ""}`)
    assert(result.data?.data?.passed === true, `quiz ${lesson.id} did not pass`)
    return
  }
  if (lesson.type === "assignment") {
    throw new Error(`completeLesson was asked to submit assignment ${lesson.id}`)
  }
  const result = await request(jar, `/lms/courses/${COURSE}/lessons/${lesson.id}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(result.response.ok, `complete ${lesson.id} failed: ${result.response.status} ${result.data?.error ?? ""}`)
}

async function refuseCertificate(jar: CookieJar, label: string) {
  const result = await request(jar, "/certificates/issue", {
    method: "POST",
    csrf: true,
    body: { courseSlug: COURSE },
  })
  assert(result.response.status === 403, `${label} certificate issue returned ${result.response.status}`)
  assert(result.data?.error === "Complete every lesson first.", `${label} certificate refusal text`)
}

async function main() {
  const linksBefore = await prisma.programCourse.count()
  const learnerAJar: CookieJar = new Map()
  const learnerBJar: CookieJar = new Map()
  const anonJar: CookieJar = new Map()

  console.log("1. Anonymous certificate issue is rejected")
  await request(anonJar, "/auth/csrf")
  const anonIssue = await request(anonJar, "/certificates/issue", {
    method: "POST",
    csrf: true,
    body: { courseSlug: COURSE },
  })
  assert(anonIssue.response.status === 401, `anonymous issue returned ${anonIssue.response.status}`)

  console.log("2. Programme enrolment, opening a lesson, and explicit completion")
  const learnerA = await signup(learnerAJar, "Learner One")
  const programEnroll = await request(learnerAJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, programSlug: PROGRAM },
  })
  assert(programEnroll.response.status === 201, `programme enrol returned ${programEnroll.response.status}`)
  const programEnrollment = await prisma.userEnrollment.findFirst({
    where: { userId: learnerA.id, program: { slug: PROGRAM } },
    select: { id: true },
  })
  assert(programEnrollment, "programme enrolment row")

  const openedWorkspace = await workspace(learnerAJar)
  const lessons = lessonList(openedWorkspace.data)
  assert(lessons.length > 1, "course must have more than one lesson")
  const first = lessons[0]
  assert(first?.type === "notes" || first?.type === "video" || first?.type === "topic", `first lesson is ${first?.type}`)
  const assignmentIndex = lessons.findIndex((lesson) => lesson.type === "assignment")
  assert(assignmentIndex > 0, "course must have an assignment after earlier lessons")
  const assignment = lessons[assignmentIndex]
  assert(assignmentIndex < lessons.length - 1, "assignment must not be the final lesson, so this test can avoid issuing a certificate")

  const opened = await request(learnerAJar, `/lms/courses/${COURSE}/lessons/${first.id}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "access" },
  })
  assert(opened.response.ok, `access failed: ${opened.response.status}`)
  assert(opened.data?.data?.state && (opened.data.data.state as { complete?: boolean }).complete !== true, "opening a lesson marked it complete")
  const openedRow = await prisma.lessonProgress.findFirst({
    where: { enrollmentId: programEnrollment.id, node: { sourceId: first.id, module: { course: { slug: COURSE } } } },
    select: { id: true, completedAt: true },
  })
  assert(openedRow && openedRow.completedAt === null, "access wrote completedAt")

  const completed = await request(learnerAJar, `/lms/courses/${COURSE}/lessons/${first.id}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(completed.response.ok, "explicit completion failed")
  assert((completed.data?.data?.state as { complete?: boolean } | undefined)?.complete === true, "explicit completion did not persist")
  const completedRow = await prisma.lessonProgress.findUnique({ where: { id: openedRow.id }, select: { completedAt: true } })
  assert(completedRow?.completedAt, "completedAt was not stored")
  const completedAt = completedRow.completedAt

  const reopened = await request(learnerAJar, `/lms/courses/${COURSE}/lessons/${first.id}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "access" },
  })
  assert(reopened.response.ok, "reopen failed")
  assert((reopened.data?.data?.state as { complete?: boolean } | undefined)?.complete === true, "reopening cleared completion")
  const reopenedRow = await prisma.lessonProgress.findUnique({ where: { id: openedRow.id }, select: { completedAt: true } })
  assert(reopenedRow?.completedAt?.getTime() === completedAt.getTime(), "reopening changed completedAt")
  const duplicateCount = await prisma.lessonProgress.count({ where: { enrollmentId: programEnrollment.id, nodeId: (await prisma.lessonProgress.findUnique({ where: { id: openedRow.id }, select: { nodeId: true } }))!.nodeId } })
  assert(duplicateCount === 1, "reopening created a second progress row")

  const repeated = await request(learnerAJar, `/lms/courses/${COURSE}/lessons/${first.id}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(repeated.response.ok, "repeated completion failed")
  const afterRepeat = await prisma.lessonProgress.count({
    where: { enrollmentId: programEnrollment.id, node: { sourceId: first.id, module: { course: { slug: COURSE } } } },
  })
  assert(afterRepeat === 1, "repeated completion created a second progress row")
  const stableRow = await prisma.lessonProgress.findUnique({ where: { id: openedRow.id }, select: { completedAt: true, nodeId: true } })
  assert(stableRow?.completedAt, "repeated completion cleared completedAt")

  console.log("3. Quiz and assignment stay on the learner who submitted them")
  for (const lesson of lessons.slice(1, assignmentIndex)) {
    await completeLesson(learnerAJar, lesson)
  }
  const quizLessons = lessons.slice(0, assignmentIndex).filter((lesson) => lesson.type === "quiz")
  assert(quizLessons.length > 0, "expected a quiz before the assignment")
  const quizKey = quizLessons[0].id
  const attemptsBefore = await prisma.quizAttempt.findMany({
    where: { userId: learnerA.id, node: { sourceId: quizKey, module: { course: { slug: COURSE } } } },
    select: { id: true, enrollmentId: true, userId: true },
  })
  assert(attemptsBefore.length > 0, "quiz attempt was not stored")
  assert(attemptsBefore.every((attempt) => attempt.userId === learnerA.id && attempt.enrollmentId === programEnrollment.id), "quiz attempt was stored on the wrong learner or enrolment")

  const submitted = await request(learnerAJar, `/lms/courses/${COURSE}/lessons/${assignment.id}/assignment`, {
    method: "POST",
    csrf: true,
    body: { action: "submit", responseText: SECRET },
  })
  assert(submitted.response.ok, `assignment submit failed: ${submitted.response.status} ${submitted.data?.error ?? ""}`)
  assert(submitted.data?.data?.status === "submitted", "assignment status was not stored as submitted")
  const assignmentRow = await prisma.assignmentProgress.findFirst({
    where: { userId: learnerA.id, node: { sourceId: assignment.id, module: { course: { slug: COURSE } } } },
    select: { id: true, enrollmentId: true, userId: true, responseText: true, status: true, submittedAt: true },
  })
  assert(assignmentRow?.responseText === SECRET, "submitted text was not stored")
  assert(assignmentRow.enrollmentId === programEnrollment.id && assignmentRow.userId === learnerA.id, "assignment was stored on the wrong enrolment")
  const courseAfterSubmit = await workspace(learnerAJar)
  assert(courseAfterSubmit.data?.data?.progress && (courseAfterSubmit.data.data.progress as { allComplete?: boolean }).allComplete === false, "the course was fully completed; refusing to continue so no certificate is issued")

  console.log("4. A second enrolled learner cannot read or grade the private submission")
  const learnerB = await signup(learnerBJar, "Learner Two")
  const learnerBEnroll = await request(learnerBJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, courseSlug: COURSE },
  })
  assert(learnerBEnroll.response.status === 201, `second learner enrol returned ${learnerBEnroll.response.status}`)
  await refuseCertificate(learnerBJar, "incomplete learner")

  const lockedAssignment = await request(learnerBJar, `/lms/courses/${COURSE}/lessons/${assignment.id}/assignment`)
  assert(lockedAssignment.response.status === 403, `locked assignment read returned ${lockedAssignment.response.status}`)
  assert(!JSON.stringify(lockedAssignment.data).includes(SECRET), "locked assignment read included the other learner's text")
  const lockedQuiz = await request(learnerBJar, `/lms/courses/${COURSE}/lessons/${quizKey}/quiz/attempts`, {
    method: "POST",
    csrf: true,
    body: { answers: [0] },
  })
  assert(lockedQuiz.response.status === 403, `locked quiz submit returned ${lockedQuiz.response.status}`)
  const learnerBAttempts = await prisma.quizAttempt.count({ where: { userId: learnerB.id } })
  assert(learnerBAttempts === 0, "locked quiz submit stored an attempt")
  const facultyRead = await request(learnerBJar, `/faculty/submissions/${assignmentRow.id}`)
  assert(facultyRead.response.status === 403, `learner faculty read returned ${facultyRead.response.status}`)
  assert(!JSON.stringify(facultyRead.data).includes(SECRET), "faculty route returned the submission to a learner")

  console.log("5. Direct course enrolment keeps the programme progress already recorded")
  const directEnroll = await request(learnerAJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, courseSlug: COURSE },
  })
  assert(directEnroll.response.status === 201, `direct enrol returned ${directEnroll.response.status}`)
  const directEnrollment = await prisma.userEnrollment.findFirst({
    where: { userId: learnerA.id, course: { slug: COURSE } },
    select: { id: true },
  })
  assert(directEnrollment && directEnrollment.id !== programEnrollment.id, "direct enrolment did not create its own row")

  const movedLesson = await prisma.lessonProgress.findUnique({
    where: { id: openedRow.id },
    select: { enrollmentId: true, completedAt: true },
  })
  assert(movedLesson?.enrollmentId === directEnrollment.id, "lesson progress was not kept on the learner's direct enrolment")
  assert(movedLesson.completedAt?.getTime() === stableRow.completedAt.getTime(), "moving progress changed completedAt")
  const lessonRowsForNode = await prisma.lessonProgress.count({
    where: { nodeId: stableRow.nodeId, enrollment: { userId: learnerA.id } },
  })
  assert(lessonRowsForNode === 1, "direct enrolment duplicated the lesson progress row")
  const leftBehind = await prisma.lessonProgress.count({
    where: { enrollmentId: programEnrollment.id, node: { module: { course: { slug: COURSE } } } },
  })
  assert(leftBehind === 0, "programme enrolment still holds this course's lesson progress")

  const movedAttempts = await prisma.quizAttempt.findMany({
    where: { id: { in: attemptsBefore.map((attempt) => attempt.id) } },
    select: { id: true, userId: true, enrollmentId: true },
  })
  assert(movedAttempts.length === attemptsBefore.length, "quiz attempts were dropped")
  assert(movedAttempts.every((attempt) => attempt.userId === learnerA.id && attempt.enrollmentId === directEnrollment.id), "quiz attempts moved to the wrong learner or enrolment")

  const movedAssignment = await prisma.assignmentProgress.findUnique({
    where: { id: assignmentRow.id },
    select: { enrollmentId: true, userId: true, responseText: true, status: true, submittedAt: true },
  })
  assert(movedAssignment?.enrollmentId === directEnrollment.id, "assignment stayed on the programme enrolment")
  assert(movedAssignment.userId === learnerA.id && movedAssignment.responseText === SECRET && movedAssignment.status === "submitted", "assignment text or status changed")
  assert(movedAssignment.submittedAt?.getTime() === assignmentRow.submittedAt?.getTime(), "assignment submittedAt changed")

  const ownedView = await request(learnerAJar, `/lms/courses/${COURSE}/lessons/${assignment.id}/assignment`)
  assert(ownedView.response.ok, "owner assignment read failed after direct enrolment")
  assert(ownedView.data?.data?.responseText === SECRET, "owner no longer sees their submission")
  assert(ownedView.data?.data?.status === "submitted", "owner assignment status changed")
  const ownedQuiz = await request(learnerAJar, `/lms/courses/${COURSE}/lessons/${quizKey}/quiz`)
  assert(ownedQuiz.response.ok, "owner quiz read failed")
  assert((ownedQuiz.data?.data?.attemptCount as number) === attemptsBefore.length, "owner quiz attempt count changed")
  const ownedCourse = await workspace(learnerAJar)
  const ownedLessons = ownedCourse.data?.data?.lessonStates as Record<string, { complete?: boolean }> | undefined
  assert(ownedLessons?.[first.id]?.complete === true, "completed lesson was lost after direct enrolment")
  assert((ownedCourse.data?.data?.progress as { allComplete?: boolean } | undefined)?.allComplete === false, "direct enrolment marked the unfinished course complete")

  const programWorkspace = await request(learnerAJar, `/lms/programs/${PROGRAM}`)
  assert(programWorkspace.response.ok, "programme workspace failed after direct enrolment")
  const programProgress = programWorkspace.data?.data?.progress as { allComplete?: boolean; progressPct?: number } | undefined
  assert(programProgress?.allComplete === false, "unfinished programme was marked complete")
  assert((programProgress?.progressPct ?? 100) < 100, "unfinished programme reported 100%")
  const programCourse = (programWorkspace.data?.data?.courses as Array<{ slug: string; progress?: { allComplete?: boolean } }> | undefined)?.find((course) => course.slug === COURSE)
  assert(programCourse?.progress?.allComplete === false, "unfinished linked course was marked complete")

  const reopenedAfterMove = await request(learnerAJar, `/lms/courses/${COURSE}/lessons/${first.id}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "access" },
  })
  assert(reopenedAfterMove.response.ok, "reopen after direct enrolment failed")
  assert((reopenedAfterMove.data?.data?.state as { complete?: boolean } | undefined)?.complete === true, "reopen after direct enrolment cleared completion")
  const afterMoveAccess = await prisma.lessonProgress.findUnique({ where: { id: openedRow.id }, select: { completedAt: true } })
  assert(afterMoveAccess?.completedAt?.getTime() === stableRow.completedAt.getTime(), "reopen after the move changed completedAt")

  console.log("6. The other learner still has a separate submission")
  const learnerBLessons = lessonList((await workspace(learnerBJar)).data)
  for (const lesson of learnerBLessons.slice(0, assignmentIndex)) {
    await completeLesson(learnerBJar, lesson)
  }
  const learnerBQuiz = await request(learnerBJar, `/lms/courses/${COURSE}/lessons/${quizKey}/quiz`)
  assert(learnerBQuiz.response.ok, "second learner quiz read failed")
  const learnerBQuizBody = JSON.stringify(learnerBQuiz.data)
  assert(!/correctIndex|explanation/i.test(learnerBQuizBody), "quiz read included answer fields")
  assert((learnerBQuiz.data?.data?.attemptCount as number) >= 1, "second learner quiz attempt was not their own")
  const learnerBAttemptOwners = await prisma.quizAttempt.findMany({
    where: { node: { sourceId: quizKey, module: { course: { slug: COURSE } } } },
    select: { userId: true },
  })
  assert(learnerBAttemptOwners.some((attempt) => attempt.userId === learnerB.id), "second learner has no quiz attempt")
  assert(learnerBAttemptOwners.filter((attempt) => attempt.userId === learnerA.id).length === attemptsBefore.length, "first learner quiz attempts changed")

  const learnerBAssignment = await request(learnerBJar, `/lms/courses/${COURSE}/lessons/${assignment.id}/assignment`)
  assert(learnerBAssignment.response.ok, "second learner assignment read failed")
  assert(learnerBAssignment.data?.data?.status === "not_started", "second learner saw a submission they did not make")
  assert(learnerBAssignment.data?.data?.responseText == null, "second learner received someone else's assignment text")
  assert(!JSON.stringify(learnerBAssignment.data).includes(SECRET), "second learner assignment payload included the private note")

  const learnerBDraft = await request(learnerBJar, `/lms/courses/${COURSE}/lessons/${assignment.id}/assignment`, {
    method: "POST",
    csrf: true,
    body: { action: "start", responseText: OTHER_DRAFT },
  })
  assert(learnerBDraft.response.ok, "second learner draft failed")
  const separated = await prisma.assignmentProgress.findMany({
    where: { node: { sourceId: assignment.id, module: { course: { slug: COURSE } } }, userId: { in: [learnerA.id, learnerB.id] } },
    select: { userId: true, responseText: true, status: true, enrollmentId: true },
  })
  assert(separated.length === 2, `expected two assignment rows, found ${separated.length}`)
  const rowA = separated.find((row) => row.userId === learnerA.id)
  const rowB = separated.find((row) => row.userId === learnerB.id)
  assert(rowA?.responseText === SECRET && rowA.status === "submitted" && rowA.enrollmentId === directEnrollment.id, "first learner assignment was modified")
  assert(rowB?.responseText === OTHER_DRAFT && rowB.status === "in_progress" && rowB.enrollmentId !== directEnrollment.id, "second learner draft was stored on the wrong enrolment")
  const draftProgress = await prisma.lessonProgress.findFirst({
    where: { enrollmentId: rowB.enrollmentId, node: { sourceId: assignment.id, module: { course: { slug: COURSE } } } },
    select: { completedAt: true },
  })
  assert(draftProgress?.completedAt == null, "saving an assignment draft marked the lesson complete")

  const stillOwned = await request(learnerAJar, `/lms/courses/${COURSE}/lessons/${assignment.id}/assignment`)
  assert(stillOwned.data?.data?.responseText === SECRET, "first learner submission changed after the other draft")

  console.log("7. An incomplete course cannot be issued, and no certificate row is created")
  await refuseCertificate(learnerAJar, "programme learner")
  await refuseCertificate(learnerBJar, "direct learner")
  const certificates = await prisma.skylentCertificate.count({ where: { userId: { in: [learnerA.id, learnerB.id] } } })
  assert(certificates === 0, "a certificate row was created")
  const linksAfter = await prisma.programCourse.count()
  assert(linksAfter === linksBefore, "programme-course mappings changed")

  console.log("Assessment ownership checks passed")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
