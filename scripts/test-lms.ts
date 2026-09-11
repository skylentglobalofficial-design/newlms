import "dotenv/config"
import { PrismaClient, RoleName } from "@prisma/client"
import { LocalArtifactStorage, StorageError } from "../server/src/lib/object-storage.js"

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

async function requestMultipart(
  jar: CookieJar,
  path: string,
  file: { name: string; type: string; bytes: Buffer },
) {
  const boundary = `----skylent${Date.now()}${Math.random().toString(16).slice(2)}`
  const prefix = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file.name}"\r\nContent-Type: ${file.type}\r\n\r\n`,
  )
  const suffix = Buffer.from(`\r\n--${boundary}--\r\n`)
  const body = Buffer.concat([prefix, file.bytes, suffix])
  const headers: Record<string, string> = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    "X-CSRF-Token": jar.get("csrf") ?? "",
  }
  const cookie = cookieHeader(jar)
  if (cookie) headers.Cookie = cookie

  const response = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body })
  parseSetCookie(response.headers.getSetCookie?.() ?? [], jar)
  const text = await response.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { response, data }
}

function pdfFixture() {
  return Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n")
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

async function grantRole(email: string, role: "faculty" | "organisation" | "admin", organisationSlug = "apex-college") {
  const user = await prisma.user.findUnique({ where: { email } })
  assert(user, `User ${email} not found`)
  const roleName = role === "faculty" ? RoleName.FACULTY : role === "admin" ? RoleName.ADMIN : RoleName.ORGANISATION_ADMIN
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

  console.log("13. Assignment text submit persists without fake attachment metadata")
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
  assert(assignmentRow.attachments.length === 0, "JSON attachment metadata must not create stored files")

  const evidence = await prisma.careerProject.findFirst({
    where: { sourceRef: `lms_assignment:${assignmentRow.enrollmentId}:l6` },
  })
  assert(evidence, "LMS assignment should create Career OS evidence")
  assert(evidence.sourceKind === "lms_assignment", "Evidence source should be lms_assignment")
  assert(/not employer-verified/i.test(evidence.description ?? ""), "Evidence should state it is not employer-verified")
  assert(/does not mean the learner is placed or job-ready/i.test(evidence.description ?? ""), "Evidence should refuse placement and job-ready claims")

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

  console.log("19. JSON cannot inject storage keys; real uploads persist and are owner-only")
  const attachmentJar: CookieJar = new Map()
  const attachmentUser = await signupUser(attachmentJar, "attachment")
  await request(attachmentJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug },
  })
  for (const lessonKey of ["l1", "l2", "l3", "l4", "l5"]) {
    if (lessonKey === "l3") {
      const quizNode = await prisma.curriculumNode.findFirst({
        where: { sourceId: "l3", module: { courseId: course.id } },
      })
      assert(quizNode, "Quiz node l3 should exist")
      const questions = await prisma.quizQuestion.findMany({
        where: { nodeId: quizNode.id },
        orderBy: { sortOrder: "asc" },
      })
      await request(attachmentJar, `/lms/courses/${courseSlug}/lessons/l3/quiz/attempts`, {
        method: "POST",
        csrf: true,
        body: { answers: questions.map((q) => q.correctIndex) },
      })
    } else {
      await completeLesson(attachmentJar, courseSlug, lessonKey)
    }
  }

  const jsonInjection = await request(attachmentJar, `/lms/courses/${courseSlug}/lessons/l6/assignment`, {
    method: "POST",
    csrf: true,
    body: {
      action: "submit",
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
  assert(jsonInjection.response.status === 400, "Submit without stored file or text should fail")

  const upload = await requestMultipart(
    attachmentJar,
    `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments`,
    { name: "report.pdf", type: "application/pdf", bytes: pdfFixture() },
  )
  assert(upload.response.status === 201, `Upload should succeed: ${JSON.stringify(upload.data)}`)
  const attachmentId = (upload.data as { data?: { attachment?: { id?: string } } }).data?.attachment?.id
  assert(attachmentId, "Upload should return attachment id")
  assert(!JSON.stringify(upload.data).includes("storageKey"), "Upload JSON must not expose storageKey")
  const storageKey = (await prisma.assignmentAttachment.findUnique({ where: { id: attachmentId } }))?.storageKey
  assert(storageKey && /^[a-f0-9]{64}$/.test(storageKey), "Storage key must be an opaque hex id")
  assert(!storageKey.includes("report.pdf"), "Storage key must not include the filename")

  try {
    await new LocalArtifactStorage().get("../etc/passwd")
    assert(false, "Path-like storage keys must be rejected")
  } catch (error) {
    assert(error instanceof StorageError, "Invalid storage keys should raise StorageError")
  }

  const htmlMime = await requestMultipart(
    attachmentJar,
    `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments`,
    { name: "report.pdf", type: "text/html", bytes: pdfFixture() },
  )
  assert(htmlMime.response.status === 400, "text/html declared MIME must be rejected")

  const exeUpload = await requestMultipart(
    attachmentJar,
    `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments`,
    { name: "payload.exe", type: "application/octet-stream", bytes: Buffer.from("MZ this is not an artifact") },
  )
  assert(exeUpload.response.status === 400, "Executables must be rejected")

  const submitted = await request(attachmentJar, `/lms/courses/${courseSlug}/lessons/l6/assignment`, {
    method: "POST",
    csrf: true,
    body: { action: "submit", responseText: "Workbook attached." },
  })
  assert(submitted.response.ok, "Submit after real upload should succeed")

  const download = await fetch(
    `${API_BASE}/lms/courses/${courseSlug}/lessons/l6/assignment/attachments/${attachmentId}`,
    { headers: { Cookie: cookieHeader(attachmentJar) } },
  )
  assert(download.ok, "Owner should download their artifact")
  assert(download.headers.get("content-type")?.includes("pdf"), "Download should use stored MIME")
  const downloaded = Buffer.from(await download.arrayBuffer())
  assert(downloaded.subarray(0, 4).toString() === "%PDF", "Downloaded bytes should match the stored PDF")

  const outsiderDownload = await fetch(
    `${API_BASE}/lms/courses/${courseSlug}/lessons/l6/assignment/attachments/${attachmentId}`,
    { headers: { Cookie: cookieHeader(userBJar) } },
  )
  assert(outsiderDownload.status === 404 || outsiderDownload.status === 403, "Non-owner must not download another learner artifact")

  const learnerFacultyDownload = await fetch(`${API_BASE}/faculty/attachments/${attachmentId}`, {
    headers: { Cookie: cookieHeader(attachmentJar) },
  })
  assert(learnerFacultyDownload.status === 403, "Learners must not use the faculty attachment route")

  const facultyJar: CookieJar = new Map()
  const facultyUser = await signupUser(facultyJar, "faculty-review")
  await grantRole(facultyUser.email, "faculty")
  const facultyDownload = await fetch(`${API_BASE}/faculty/attachments/${attachmentId}`, {
    headers: { Cookie: cookieHeader(facultyJar) },
  })
  assert(facultyDownload.status === 403, "Faculty without teaching scope must not download artifacts")

  const adminJar: CookieJar = new Map()
  const adminUser = await signupUser(adminJar, "admin-review")
  await grantRole(adminUser.email, "admin")
  const adminDash = await request(adminJar, "/faculty/dashboard")
  assert(adminDash.response.ok, "Superadmin faculty dashboard should load")
  assert(!JSON.stringify(adminDash.data).includes("storageKey"), "Faculty dashboard must not expose storageKey")
  const adminDownload = await fetch(`${API_BASE}/faculty/attachments/${attachmentId}`, {
    headers: { Cookie: cookieHeader(adminJar) },
  })
  assert(adminDownload.ok, "Superadmin should download a stored artifact for review")
  const adminBytes = Buffer.from(await adminDownload.arrayBuffer())
  assert(adminBytes.subarray(0, 4).toString() === "%PDF", "Faculty download should return the stored PDF")

  console.log("20. Coming-soon programmes cannot enroll into a missing LMS")
  const soonJar: CookieJar = new Map()
  await signupUser(soonJar, "soon")
  const soonEnroll = await request(soonJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { programSlug: "sql-certificate" },
  })
  assert(soonEnroll.response.status === 400, "sql-certificate enrollment must be rejected")

  await request(soonJar, "/auth/csrf")
  const interest = await request(soonJar, "/catalog/programs/sql-certificate/interest", {
    method: "POST",
    csrf: true,
    body: { email: `interest-${Date.now()}@example.com`, name: "SQL waiter" },
  })
  assert(interest.response.status === 201 || interest.response.ok, `Interest registration should persist: ${JSON.stringify(interest.data)}`)

  const contact = await request(soonJar, "/catalog/contact", {
    method: "POST",
    csrf: true,
    body: { name: "SQL waiter", email: `contact-${Date.now()}@example.com`, message: "When does SQL certificate launch?" },
  })
  assert(contact.response.status === 201 || contact.response.ok, `Contact should persist: ${JSON.stringify(contact.data)}`)
  assert(typeof (contact.data as { data?: { id?: string } }).data?.id === "string", "Contact should return an id")

  console.log("21. Completing a course issues a certificate with ownership checks")
  const certJar: CookieJar = new Map()
  const certUser = await signupUser(certJar, "cert")
  await request(certJar, "/lms/enrollments", { method: "POST", csrf: true, body: { courseSlug } })

  const nodes = await prisma.curriculumNode.findMany({
    where: { module: { courseId: course.id } },
    include: { module: true, quizQuestions: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
  })
  for (const node of nodes) {
    const key = node.sourceId
    if (!key) continue
    if (node.nodeType === "QUIZ") {
      const attempt = await request(certJar, `/lms/courses/${courseSlug}/lessons/${key}/quiz/attempts`, {
        method: "POST",
        csrf: true,
        body: { answers: node.quizQuestions.map((q) => q.correctIndex) },
      })
      assert(attempt.response.status === 201 || attempt.response.ok, `Quiz ${key} should pass: ${JSON.stringify(attempt.data)}`)
    } else if (node.nodeType === "ASSIGNMENT") {
      const result = await request(certJar, `/lms/courses/${courseSlug}/lessons/${key}/assignment`, {
        method: "POST",
        csrf: true,
        body: { action: "submit", responseText: `Submission for ${key}` },
      })
      assert(result.response.ok, `Assignment ${key} should submit: ${JSON.stringify(result.data)}`)
    } else {
      await completeLesson(certJar, courseSlug, key)
    }
  }

  const certState = await request(certJar, `/lms/courses/${courseSlug}/certificate`)
  assert(certState.response.ok, "Certificate state should load")
  assert(certState.data.data.certificate?.publicId, "Completed course should issue a certificate record")
  const publicId = certState.data.data.certificate.publicId as string
  assert(/^SKY-[A-F0-9]{24}$/.test(publicId), "Certificate public id format")

  const pdf = await fetch(`${API_BASE}/lms/courses/${courseSlug}/certificate/file`, {
    headers: { Cookie: cookieHeader(certJar) },
  })
  assert(pdf.ok, "Owner should download the certificate PDF")
  const pdfBytes = Buffer.from(await pdf.arrayBuffer())
  assert(pdfBytes.subarray(0, 4).toString() === "%PDF", "Certificate download should be a PDF")

  const stolen = await fetch(`${API_BASE}/lms/courses/${courseSlug}/certificate/file`, {
    headers: { Cookie: cookieHeader(userBJar) },
  })
  assert(stolen.status === 403 || stolen.status === 404, "Non-owner must not download another learner certificate")

  const verify = await request(anonJar, `/lms/certificates/${publicId}`)
  assert(verify.response.ok, "Public verification should work with the certificate id")
  assert(verify.data.data.publicId === publicId, "Verified certificate id should match")
  assert(!JSON.stringify(verify.data).includes(certUser.email), "Public verification must not leak email")

  const certRow = await prisma.courseCertificate.findUnique({ where: { publicId } })
  assert(certRow, "Certificate row should exist")
  const courseEvidence = await prisma.careerProject.findFirst({
    where: { sourceRef: `lms_course:${certRow.enrollmentId}` },
  })
  assert(courseEvidence, "Course completion should create Career OS evidence")

  console.log("All LMS integration checks passed.")
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
