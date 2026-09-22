import "dotenv/config"
import { PrismaClient, RoleName } from "@prisma/client"
import { hasAuthoredProgrammePath } from "../src/lib/programme-discovery.ts"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"

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

async function completeLesson(jar: CookieJar, courseSlug: string, lessonKey: string) {
  const workspace = await request(jar, `/lms/courses/${courseSlug}`)
  assert(workspace.response.ok, `Failed to load ${courseSlug} before completing ${lessonKey}`)
  const lesson = (workspace.data.data.course.modules as Array<{ lessons: Array<{ id: string; type: string }> }>)
    .flatMap((module) => module.lessons)
    .find((entry) => entry.id === lessonKey)
  assert(lesson, `Lesson ${lessonKey} must exist in ${courseSlug}`)

  if (lesson.type === "quiz") {
    const course = await prisma.course.findUnique({ where: { slug: courseSlug } })
    assert(course, `Course ${courseSlug} must exist in database`)
    const node = await prisma.curriculumNode.findFirst({
      where: { sourceId: lessonKey, module: { courseId: course.id } },
      include: { quizQuestions: { orderBy: { sortOrder: "asc" } } },
    })
    assert(node && node.quizQuestions.length > 0, `Quiz ${lessonKey} must have questions`)
    const result = await request(jar, `/lms/courses/${courseSlug}/lessons/${lessonKey}/quiz/attempts`, {
      method: "POST",
      csrf: true,
      body: { answers: node.quizQuestions.map((question) => question.correctIndex) },
    })
    assert(result.response.status === 201, `Failed to pass quiz ${lessonKey}: ${JSON.stringify(result.data)}`)
    assert(result.data.data.passed === true, `Quiz ${lessonKey} should pass with stored correct answers`)
    return result.data
  }

  if (lesson.type === "assignment") {
    const result = await request(jar, `/lms/courses/${courseSlug}/lessons/${lessonKey}/assignment`, {
      method: "POST",
      csrf: true,
      body: { action: "submit", responseText: `Test submission for ${lessonKey}` },
    })
    assert(result.response.ok, `Failed to submit assignment ${lessonKey}: ${JSON.stringify(result.data)}`)
    assert(result.data.data.status === "submitted", `Assignment ${lessonKey} should be submitted`)
    return result.data
  }

  const result = await request(jar, `/lms/courses/${courseSlug}/lessons/${lessonKey}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(result.response.ok, `Failed to complete lesson ${lessonKey}: ${JSON.stringify(result.data)}`)
  return result.data
}

async function completeAllCourseLessons(jar: CookieJar, courseSlug: string) {
  const workspace = await request(jar, `/lms/courses/${courseSlug}`)
  assert(workspace.response.ok, `Failed to load ${courseSlug} before completing lessons: ${JSON.stringify(workspace.data)}`)
  const lessonKeys = (workspace.data.data.course.modules as Array<{ lessons: Array<{ id: string }> }>)
    .flatMap((module) => module.lessons.map((lesson) => lesson.id))
  assert(lessonKeys.length > 0, `${courseSlug} must have lessons to complete`)
  for (const lessonKey of lessonKeys) {
    await completeLesson(jar, courseSlug, lessonKey)
  }
  return lessonKeys
}

async function seedProgramEnrollment(email: string, programSlug: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  const program = await prisma.program.findUnique({ where: { slug: programSlug } })
  assert(user, `User ${email} should exist`)
  assert(program, `Program ${programSlug} should exist`)
  return prisma.userEnrollment.create({
    data: { userId: user.id, programId: program.id, status: "active" },
  })
}

async function grantRole(email: string, role: "faculty" | "organisation", organisationSlug = "apex-college") {
  const user = await prisma.user.findUnique({ where: { email } })
  assert(user, `User ${email} not found`)
  const roleName = role === "faculty" ? RoleName.FACULTY : RoleName.ORGANISATION_ADMIN
  const roleRecord = await prisma.role.upsert({
    where: { name: roleName },
    update: {},
    create: { name: roleName },
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: roleRecord.id } },
    update: {},
    create: { userId: user.id, roleId: roleRecord.id },
  })
  if (role === "organisation") {
    const org = await prisma.organisation.upsert({
      where: { slug: organisationSlug },
      update: {},
      create: { slug: organisationSlug, name: organisationSlug },
    })
    await prisma.organisationMembership.upsert({
      where: { organisationId_userId: { organisationId: org.id, userId: user.id } },
      update: {},
      create: { userId: user.id, organisationId: org.id },
    })
  }
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
  const userA = await signupUser(userAJar, "a")
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

  console.log("2b. Enrollments list returns the enrolled course")
  const listed = await request(userAJar, "/lms/enrollments")
  assert(listed.response.ok, "Enrollments list should succeed")
  assert(
    Array.isArray(listed.data.data) && listed.data.data.some((row: { courseSlug?: string }) => row.courseSlug === courseSlug),
    "Enrollments list should include the enrolled course",
  )

  console.log("3. Non-enrolled user cannot access enrolled content")
  await signupUser(userBJar, "b")
  const blocked = await request(userBJar, `/lms/courses/${courseSlug}`)
  assert(blocked.response.status === 403, "Non-enrolled user should be blocked from course workspace")

  const blockedAccess = await request(userBJar, `/lms/courses/${courseSlug}/access`)
  assert(blockedAccess.response.ok, "Access endpoint should respond")
  assert(blockedAccess.data.data.enrolled === false, "User B should not be enrolled")

  console.log("4. First lesson is accessible; later lessons are locked")
  const states = workspace.data.data.lessonStates
  assert(states.l1?.locked === false, "First lesson should be unlocked")
  assert(states.l2?.locked === true, "Second lesson should be locked initially")
  assert(states.l4?.locked === true, "Later lesson l4 should be locked initially")

  console.log("5. Direct API attempt to bypass unlock fails")
  const bypass = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l4/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(bypass.response.status === 403, "Locked lesson completion should be rejected")
  assert(bypass.data.error === "Lesson locked", "Locked response should include lesson locked error")

  console.log("6. Quiz cannot be accessed while lesson is locked")
  const lockedQuiz = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l3/quiz`)
  assert(lockedQuiz.response.status === 403, "Locked quiz should be rejected")

  console.log("7. Assignment cannot be modified while lesson is locked")
  const lockedAssignment = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l6/assignment`, {
    method: "POST",
    csrf: true,
    body: { action: "submit", responseText: "Should fail" },
  })
  assert(lockedAssignment.response.status === 403, "Locked assignment submit should be rejected")

  console.log("7b. Unlocked quiz and assignment cannot be completed through generic progress")
  await completeLesson(userAJar, courseSlug, "l1")
  await completeLesson(userAJar, courseSlug, "l2")

  const quizBypass = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l3/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(quizBypass.response.status === 400, "Quiz must not be completed through generic progress")
  assert(quizBypass.data.error === "Quiz must be passed before it can be completed", "Quiz completion guard should explain the required passed attempt")

  const assignmentLockedByOrder = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l6/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(assignmentLockedByOrder.response.status === 403, "Assignment completion must still respect curriculum locking")

  console.log("8. Completing previous lesson unlocks next lesson")
  const afterL2 = await request(userAJar, `/lms/courses/${courseSlug}`)
  assert(afterL2.data.data.lessonStates.l2?.locked === false, "l2 should already be unlocked after l1 completion")
  assert(afterL2.data.data.lessonStates.l3?.locked === false, "l3 should unlock after l2 completion")

  console.log("9. User can complete lessons in order and persist progress")
  await completeLesson(userAJar, courseSlug, "l2")
  await completeLesson(userAJar, courseSlug, "l3")
  await completeLesson(userAJar, courseSlug, "l4")

  const complete = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l4/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(complete.response.ok, "Previously unlocked lesson completion should succeed")
  assert(complete.data.data.state.complete === true, "Lesson l4 should be marked complete")

  console.log("10. User cannot access another user's progress via protected routes")
  const crossUser = await request(userBJar, `/lms/courses/${courseSlug}/lessons/l4/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(crossUser.response.status === 403, "Non-enrolled user cannot modify lesson progress")

  console.log("11. Resume lesson returns correct lesson")
  const resume = await request(userAJar, `/lms/courses/${courseSlug}/resume`)
  assert(resume.response.ok, "Resume endpoint should succeed")
  assert(resume.data.data.lessonId, "Resume should include lesson id")
  assert(typeof resume.data.data.moduleTitle === "string", "Resume should include module title")

  console.log("12. Quiz attempt persists after unlock")
  const quiz = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l3/quiz`)
  assert(quiz.response.ok, "Quiz questions should load for unlocked lesson")
  const questions = quiz.data.data.questions
  assert(Array.isArray(questions) && questions.length > 0, "Quiz should have questions")
  assert(questions.length === 5, "Data Analytics foundations quiz should have five course-specific questions")
  assert(
    questions.some((row: { q?: string }) => /northwind|measurable|net revenue|alias/i.test(row.q ?? "")),
    "Data Analytics quiz must be specific to this course",
  )
  assert(
    questions.every((row: { q?: string }) => !/what does sql stand for|primary goal of data analytics/i.test(row.q ?? "")),
    "Data Analytics quiz must not use the old shared trivia bank",
  )

  const pythonCourse = await prisma.course.findUnique({ where: { slug: "python-programming" } })
  assert(pythonCourse, "Python course should exist")
  const pythonQuizNode = await prisma.curriculumNode.findFirst({
    where: { sourceId: "l3", module: { courseId: pythonCourse.id } },
    include: { quizQuestions: true },
  })
  assert(pythonQuizNode && pythonQuizNode.quizQuestions.length > 0, "Python l3 should keep its own quiz bank")
  assert(
    pythonQuizNode.quizQuestions.every((row) => !/northwind/i.test(row.question)),
    "Python quiz must not receive Data Analytics questions",
  )

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } })
  assert(course, "Course should exist in database")

  const quizNode = await prisma.curriculumNode.findFirst({
    where: {
      sourceId: "l3",
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

  console.log("13. Assignment state persists with optional attachment metadata")
  await completeLesson(userAJar, courseSlug, "l5")
  const assignmentSubmit = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l6/assignment`, {
    method: "POST",
    csrf: true,
    body: {
      action: "submit",
      responseText: "My Excel analysis submission.",
      attachments: [
        {
          fileName: "analysis.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          byteSize: 2048,
        },
      ],
    },
  })
  assert(assignmentSubmit.response.ok, "Assignment submit should succeed")
  assert(assignmentSubmit.data.data.status === "submitted", "Assignment should be submitted")

  const userARow = await prisma.user.findUnique({ where: { email: userA.email } })
  assert(userARow, "User A should exist")
  const assignmentRow = await prisma.assignmentProgress.findFirst({
    where: {
      userId: userARow.id,
      node: { sourceId: "l6", module: { courseId: course.id } },
      status: "submitted",
    },
    include: { attachments: true },
  })
  assert(assignmentRow, "Assignment progress should exist in database")
  assert(assignmentRow.attachments.length === 1, "Attachment metadata should be stored")
  assert(assignmentRow.attachments[0].storageProvider === "pending", "Storage provider should be server-controlled pending")
  assert(assignmentRow.attachments[0].storageKey.startsWith("pending/"), "Storage key should be server-generated")
  assert(!assignmentRow.attachments[0].storageKey.includes("data-analytics/l6"), "Client must not choose storage key")

  console.log("14. Authored OPEN programme enrollment succeeds")
  const authoredProgramSlug = "data-analytics-pro"
  assert(hasAuthoredProgrammePath(authoredProgramSlug), "data-analytics-pro must remain an authored programme path")
  assert(hasAuthoredProgrammePath("product-management"), "product-management must remain an authored programme path")
  assert(!hasAuthoredProgrammePath("data-science-ai"), "data-science-ai must not have an authored programme path")
  assert(!hasAuthoredProgrammePath("full-stack"), "full-stack must not have an authored programme path")

  const programJar: CookieJar = new Map()
  await signupUser(programJar, "program")
  const programEnroll = await request(programJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { programSlug: authoredProgramSlug },
  })
  assert(programEnroll.response.ok, "Authored OPEN programme enrollment should succeed")
  assert(programEnroll.data.data.course.slug === courseSlug, "Program enrollment should resolve primary course workspace")

  const programCourseAccess = await request(programJar, `/lms/courses/${courseSlug}`)
  assert(programCourseAccess.response.ok, "Program-enrolled user should access linked course")
  assert(programCourseAccess.data.data.lessonStates.l1?.locked === false, "Program enrollment should include unlock rules")

  const programListed = await request(programJar, "/lms/enrollments")
  assert(programListed.response.ok, "Program enrollments list should succeed")
  assert(
    Array.isArray(programListed.data.data) &&
      programListed.data.data.some(
        (row: { programSlug?: string; courseSlug?: string | null }) =>
          row.programSlug === authoredProgramSlug && row.courseSlug === courseSlug,
      ),
    "Programme enrollment must expose the linked LMS course so Resume/evidence can open it",
  )

  const programReenroll = await request(programJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { programSlug: authoredProgramSlug },
  })
  assert(programReenroll.response.ok, "Re-enrolling an authored programme should return the existing workspace")
  assert(programReenroll.response.status === 200, "Existing authored programme enrollment should be 200, not a new create")

  console.log("14b. Coming-soon program enrollment is rejected")
  const comingSoon = await request(programJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { programSlug: "sql-certificate" },
  })
  assert(comingSoon.response.status === 400, `Coming-soon enrollment should be 400, got ${comingSoon.response.status}`)

  const jeeSoon = await request(programJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { programSlug: "jee-advanced-prep" },
  })
  assert(jeeSoon.response.status === 400, `JEE coming-soon enrollment should be 400, got ${jeeSoon.response.status}`)

  console.log("14c. OPEN program without linked courses is rejected")
  const unlinkedSlug = `phase1-open-unlinked-${Date.now()}`
  await prisma.program.create({
    data: {
      slug: unlinkedSlug,
      name: "Temp Open Unlinked",
      duration: "1 month",
      moduleCount: 0,
      projectCount: 0,
      format: "Self-paced",
      cert: "None",
      outcome: "Test",
      desc: "Temporary program for enrollment enforcement",
      upcomingBatch: "N/A",
      programType: "CERTIFICATE",
      level: "Beginner",
      whoIsItFor: [],
      whatYouWillLearn: [],
      learningExperience: [],
      enrollmentStatus: "OPEN",
    },
  })
  try {
    const unlinked = await request(programJar, "/lms/enrollments", {
      method: "POST",
      csrf: true,
      body: { programSlug: unlinkedSlug },
    })
    assert(unlinked.response.status === 400, `OPEN + unlinked enrollment should be 400, got ${unlinked.response.status}`)
    assert(
      /no linked courses/i.test(String(unlinked.data?.error ?? "")),
      "OPEN + unlinked rejection should mention missing linked courses",
    )
  } finally {
    await prisma.program.delete({ where: { slug: unlinkedSlug } })
  }

  console.log("14d. OPEN programme with linked courses but no authored path cannot enroll")
  const listingProgramSlug = "data-science-ai"
  const noAuthoredPath = await request(programJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { programSlug: listingProgramSlug },
  })
  assert(
    noAuthoredPath.response.status === 400,
    `OPEN + linked + no authored path should be 400, got ${noAuthoredPath.response.status}`,
  )
  assert(
    /authored teaching path/i.test(String(noAuthoredPath.data?.error ?? "")),
    `OPEN listing programme must return a clear authored-path error, got ${JSON.stringify(noAuthoredPath.data)}`,
  )

  const fullStackListing = await request(programJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { programSlug: "full-stack" },
  })
  assert(
    fullStackListing.response.status === 400,
    `OPEN full-stack listing should be 400, got ${fullStackListing.response.status}`,
  )

  const missingProgram = await request(programJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { programSlug: "not-a-real-programme" },
  })
  assert(missingProgram.response.status === 404, `Unknown programme should be 404, got ${missingProgram.response.status}`)

  console.log("14e. Programme workspace aggregates linked-course progress and resume")
  const programSlug = "data-science-ai"
  const secondCourseSlug = "python-programming"
  const aggregateJar: CookieJar = new Map()
  const aggregateUser = await signupUser(aggregateJar, "program-aggregate")
  await seedProgramEnrollment(aggregateUser.email, programSlug)
  const programAccessAnon = await request(anonJar, `/lms/programs/${programSlug}/access`)
  assert(programAccessAnon.data.data.authenticated === false, "Anonymous programme access should be unauthenticated")
  assert(programAccessAnon.data.data.canAccess === false, "Anonymous visitor cannot access programme workspace")

  const programBlocked = await request(userBJar, `/lms/programs/${programSlug}`)
  assert(programBlocked.response.status === 403, "Non-enrolled learner cannot read programme aggregation")

  const programWorkspace = await request(aggregateJar, `/lms/programs/${programSlug}`)
  assert(programWorkspace.response.ok, "Programme-enrolled learner should load programme workspace")
  assert(programWorkspace.data.data.slug === programSlug, "Programme workspace slug mismatch")
  const linkedSlugs = (programWorkspace.data.data.courses as Array<{ slug: string }>).map((row) => row.slug)
  assert(linkedSlugs.includes(courseSlug), "Programme must include Data Analytics")
  assert(linkedSlugs.includes(secondCourseSlug), "Programme must include Python")
  assert(programWorkspace.data.data.progress.totalCourses === linkedSlugs.length, "totalCourses must match linked courses")
  assert(programWorkspace.data.data.progress.progressPct === 0, "New programme enrollment must start at 0%")
  assert(programWorkspace.data.data.resume.courseSlug === courseSlug, "Resume should start on the first incomplete course")

  const pythonViaProgram = await request(aggregateJar, `/lms/courses/${secondCourseSlug}`)
  assert(pythonViaProgram.response.ok, "Programme enrollment must unlock the second linked course")

  const daWorkspace = await request(aggregateJar, `/lms/courses/${courseSlug}`)
  assert(daWorkspace.response.ok, "Programme learner should still access Data Analytics")
  await completeAllCourseLessons(aggregateJar, courseSlug)

  const afterFirstCourse = await request(aggregateJar, `/lms/programs/${programSlug}`)
  assert(afterFirstCourse.response.ok, "Programme workspace should reload after course progress")
  const daRow = afterFirstCourse.data.data.courses.find((row: { slug: string }) => row.slug === courseSlug)
  const pyRow = afterFirstCourse.data.data.courses.find((row: { slug: string }) => row.slug === secondCourseSlug)
  assert(daRow?.progress.allComplete === true, "Completed first course must report allComplete from stored lesson progress")
  assert(pyRow?.progress.allComplete === false, "Second course must remain incomplete")
  assert(afterFirstCourse.data.data.progress.completedCourses === 1, "Aggregate completedCourses must be 1")
  assert(afterFirstCourse.data.data.resume.courseSlug === secondCourseSlug, "Resume must move to the next incomplete course")
  assert(afterFirstCourse.data.data.progress.progressPct > 0, "Aggregate progressPct must come from completed lessons")
  assert(afterFirstCourse.data.data.progress.progressPct < 100, "Programme must not be 100% until every linked course is complete")

  const dashboardAfter = await request(aggregateJar, "/lms/dashboard")
  assert(dashboardAfter.response.ok, "Dashboard should load after programme progress")
  assert(dashboardAfter.data.data.course.slug === secondCourseSlug, "Dashboard primary course should be the resume course")
  assert(dashboardAfter.data.data.program?.slug === programSlug, "Dashboard must include programme aggregation")
  assert(
    dashboardAfter.data.data.program.courses.some((row: { slug: string }) => row.slug === secondCourseSlug),
    "Dashboard programme payload must list every linked course",
  )

  const listedLinks = await request(aggregateJar, "/lms/enrollments")
  const programRow = listedLinks.data.data.find((row: { programSlug?: string }) => row.programSlug === programSlug)
  assert(Array.isArray(programRow?.linkedCourses) && programRow.linkedCourses.length >= 2, "Enrolments list should expose every linked course")

  const catalogCourse = await request(anonJar, `/catalog/courses/${courseSlug}`)
  assert(catalogCourse.response.ok, "Public catalog course should load")
  const catalogJson = JSON.stringify(catalogCourse.data)
  assert(!/muxPlaybackId/.test(catalogJson), "Public catalog must not expose Mux playback ids")

  console.log("14f. Direct course enrollment must not override programme resume")
  const mixedJar: CookieJar = new Map()
  const mixedUser = await signupUser(mixedJar, "mixed-resume")
  await seedProgramEnrollment(mixedUser.email, programSlug)

  const mixedDirectEnroll = await request(mixedJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug },
  })
  assert(mixedDirectEnroll.response.ok, "Mixed-resume learner should also enroll directly in Data Analytics")
  assert(mixedDirectEnroll.data.data.course.slug === courseSlug, "Direct enrollment workspace should be Data Analytics")

  await completeAllCourseLessons(mixedJar, courseSlug)

  const mixedProgram = await request(mixedJar, `/lms/programs/${programSlug}`)
  assert(mixedProgram.response.ok, "Programme workspace should load with mixed enrollments")
  assert(
    mixedProgram.data.data.resume.courseSlug === secondCourseSlug,
    `Programme resume must be ${secondCourseSlug} after Data Analytics is complete, got ${mixedProgram.data.data.resume.courseSlug}`,
  )

  const mixedDashboard = await request(mixedJar, "/lms/dashboard")
  assert(mixedDashboard.response.ok, "Dashboard should load with mixed enrollments")
  assert(
    mixedDashboard.data.data.course.slug === secondCourseSlug,
    `Dashboard must follow programme resume (${secondCourseSlug}), not the direct Data Analytics enrollment, got ${mixedDashboard.data.data.course.slug}`,
  )
  assert(
    mixedDashboard.data.data.program?.resume?.courseSlug === secondCourseSlug,
    "Dashboard programme payload must keep the calculated programme resume course",
  )

  console.log("14g. Completing every linked course marks the programme complete")
  await completeAllCourseLessons(aggregateJar, secondCourseSlug)

  const completedProgram = await request(aggregateJar, `/lms/programs/${programSlug}`)
  assert(completedProgram.response.ok, "Programme workspace should load after every linked course is complete")
  const completedProgress = completedProgram.data.data.progress
  const completedCourses = completedProgram.data.data.courses as Array<{
    slug: string
    progress: { allComplete: boolean; completedCount: number; totalLessons: number }
  }>
  assert(completedProgress.totalLessons > 0, "Programme must have lessons before asserting 100% aggregate")
  assert(
    completedCourses.every((row) => row.progress.allComplete && row.progress.completedCount === row.progress.totalLessons),
    "Every linked course must be complete from stored lesson progress",
  )
  assert(
    completedProgress.completedCourses === completedProgress.totalCourses,
    "completedCourses must equal totalCourses when every linked course is complete",
  )
  assert(
    completedProgress.completedCount === completedProgress.totalLessons,
    "Aggregate completedCount must equal totalLessons when the programme is complete",
  )
  assert(completedProgress.allComplete === true, "Programme allComplete must be true after every linked course is complete")
  assert(completedProgress.progressPct === 100, "Programme aggregate must be 100% after every linked course is complete")
  assert(completedProgram.data.data.certificateEligible === true, "Programme workspace must be certificate eligible")
  assert(completedProgram.data.data.certificateStatus === "eligible", "Programme workspace certificateStatus must be eligible")

  const completedListed = await request(aggregateJar, "/lms/enrollments")
  const completedRow = completedListed.data.data.find((row: { programSlug?: string }) => row.programSlug === programSlug)
  assert(completedRow, "Completed programme enrollment must still appear in the enrollments list")
  assert(completedRow.status === "completed", `Programme enrollment status must be completed, got ${completedRow.status}`)
  assert(completedRow.certificateEligible === true, "Stored programme enrollment must be certificateEligible")
  assert(completedRow.certificateStatus === "eligible", "Stored programme certificateStatus must be eligible")

  console.log("15. Faculty and organisation routes enforce authorization")
  const studentFaculty = await request(userAJar, "/faculty/dashboard")
  assert(studentFaculty.response.status === 403, "Student should not access faculty dashboard")

  const studentOrg = await request(userAJar, "/organisation/dashboard")
  assert(studentOrg.response.status === 403, "Student should not access organisation dashboard")

  await grantRole(userA.email, "faculty")
  const facultyDashboard = await request(userAJar, "/faculty/dashboard")
  assert(facultyDashboard.response.ok, "Faculty role should access faculty dashboard")
  assert(facultyDashboard.data.data.teachingScopeAvailable === false, "Faculty without assignment scope must not receive teaching data")
  assert(facultyDashboard.data.data.submissions.length === 0, "Faculty must not receive global assignment submissions")

  const orgUser = await signupUser(userBJar, "org-admin")
  await grantRole(orgUser.email, "organisation")
  const orgDashboard = await request(userBJar, "/organisation/dashboard")
  assert(orgDashboard.response.ok, "Organisation role with membership should access organisation dashboard")
  assert(orgDashboard.data.data.organisation.slug === "apex-college", "Organisation dashboard should return membership org")

  console.log("16. Faculty without teaching scope cannot see unrelated learner submissions")
  const facultyOnlyJar: CookieJar = new Map()
  const facultyOnly = await signupUser(facultyOnlyJar, "faculty-only")
  await grantRole(facultyOnly.email, "faculty")
  const scopedFaculty = await request(facultyOnlyJar, "/faculty/dashboard")
  assert(scopedFaculty.response.ok, "Faculty endpoint should remain accessible to faculty role")
  assert(scopedFaculty.data.data.submissions.length === 0, "Faculty without scope must not see global submissions")
  assert(scopedFaculty.data.data.programs.length === 0, "Faculty without scope must not see global programs")
  assert(scopedFaculty.data.data.courses.length === 0, "Faculty without scope must not see global courses")

  console.log("17. Organisation totals only include member enrollments")
  const orgLearnerJar: CookieJar = new Map()
  const orgAAdminJar: CookieJar = new Map()
  const orgBAdminJar: CookieJar = new Map()
  const orgLearner = await signupUser(orgLearnerJar, "org-learner")
  await request(orgLearnerJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug },
  })
  await grantRole(orgLearner.email, "organisation", "apex-college")
  const orgAAdmin = await signupUser(orgAAdminJar, "org-a-admin")
  await grantRole(orgAAdmin.email, "organisation", "apex-college")
  const orgBAdmin = await signupUser(orgBAdminJar, "org-b-admin")
  await grantRole(orgBAdmin.email, "organisation", "org-b-college")

  const apexDashboard = await request(orgAAdminJar, "/organisation/dashboard")
  assert(apexDashboard.response.ok, "Organisation A admin should access dashboard")
  assert(apexDashboard.data.data.totals.enrollmentCount >= 1, "Organisation A should count member enrollments only")

  const orgBDashboard = await request(orgBAdminJar, "/organisation/dashboard")
  assert(orgBDashboard.response.ok, "Organisation B admin should access dashboard")
  assert(orgBDashboard.data.data.totals.enrollmentCount === 0, "Organisation B must not count unrelated enrollments")
  assert(orgBDashboard.data.data.programs.length === 0, "Organisation B must not see unrelated program enrollment data")

  console.log("18. Non-member cannot access organisation dashboard")
  const outsiderJar: CookieJar = new Map()
  await signupUser(outsiderJar, "outsider")
  const outsiderOrg = await request(outsiderJar, "/organisation/dashboard")
  assert(outsiderOrg.response.status === 403, "Non-member must not access organisation dashboard")

  console.log("19. Attachment storage provider/key are server-owned")
  const attachmentJar: CookieJar = new Map()
  const attachmentUser = await signupUser(attachmentJar, "attachment")
  await request(attachmentJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug },
  })
  for (const lessonKey of ["l1", "l2", "l3", "l4", "l5"]) {
    await completeLesson(attachmentJar, courseSlug, lessonKey)
  }
  const maliciousAttachment = await request(attachmentJar, `/lms/courses/${courseSlug}/lessons/l6/assignment`, {
    method: "POST",
    csrf: true,
    body: {
      action: "submit",
      responseText: "Attachment metadata only.",
      attachments: [
        {
          fileName: "report.pdf",
          mimeType: "application/pdf",
          byteSize: 1024,
          storageProvider: "r2",
          storageKey: "attacker/owned/object-key",
        },
      ],
    },
  })
  assert(maliciousAttachment.response.ok, "Attachment submit with extra fields should still succeed using server-owned storage metadata")

  const attachmentUserRow = await prisma.user.findUnique({ where: { email: attachmentUser.email } })
  assert(attachmentUserRow, "Attachment test user should exist")
  const maliciousRow = await prisma.assignmentProgress.findFirst({
    where: { userId: attachmentUserRow.id, status: "submitted" },
    include: { attachments: true },
    orderBy: { updatedAt: "desc" },
  })
  assert(maliciousRow, "Malicious attachment submission should persist")
  assert(maliciousRow.attachments.length === 1, "Attachment metadata should be stored")
  assert(maliciousRow.attachments[0].storageProvider === "pending", "Client cannot set storage provider")
  assert(maliciousRow.attachments[0].storageKey.startsWith("pending/"), "Storage key must be server-generated")
  assert(!maliciousRow.attachments[0].storageKey.includes("attacker/owned"), "Client cannot inject storage key")

  console.log("All LMS integration checks passed.")
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
