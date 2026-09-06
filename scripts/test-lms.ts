import "dotenv/config"
import { PrismaClient, RoleName } from "@prisma/client"

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
  const result = await request(jar, `/lms/courses/${courseSlug}/lessons/${lessonKey}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(result.response.ok, `Failed to complete lesson ${lessonKey}: ${JSON.stringify(result.data)}`)
  return result.data
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

  console.log("8. Completing previous lesson unlocks next lesson")
  await completeLesson(userAJar, courseSlug, "l1")
  const afterL1 = await request(userAJar, `/lms/courses/${courseSlug}`)
  assert(afterL1.data.data.lessonStates.l2?.locked === false, "l2 should unlock after l1 completion")
  assert(afterL1.data.data.lessonStates.l3?.locked === true, "l3 should remain locked until l2 completes")

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

  console.log("14. Program enrollment resolves course access correctly")
  const programJar: CookieJar = new Map()
  await signupUser(programJar, "program")
  const programEnroll = await request(programJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { programSlug: "data-science-ai" },
  })
  assert(programEnroll.response.ok, "Program enrollment should succeed")
  assert(programEnroll.data.data.course.slug === courseSlug, "Program enrollment should resolve primary course workspace")

  const programCourseAccess = await request(programJar, `/lms/courses/${courseSlug}`)
  assert(programCourseAccess.response.ok, "Program-enrolled user should access linked course")
  assert(programCourseAccess.data.data.lessonStates.l1?.locked === false, "Program enrollment should include unlock rules")

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
