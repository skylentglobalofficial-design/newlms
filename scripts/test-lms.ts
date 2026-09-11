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

  console.log("12b. Lesson practice content loads for Foundations mindset lesson")
  const practice = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l2/practice`)
  assert(practice.response.ok, `Practice should load for unlocked l2: ${JSON.stringify(practice.data)}`)
  assert(practice.data.data.interactionType === "choose", "Practice interaction must be choose")
  assert(practice.data.data.lessonKey === "l2", "Practice lessonKey must be l2")
  assert(practice.data.data.moduleTitle === "Foundations of Data", "Practice must keep module context")
  assert(Array.isArray(practice.data.data.options) && practice.data.data.options.length === 3, "Practice must include three options")
  assert(
    practice.data.data.options.every((o: { teachingFeedback?: string }) => typeof o.teachingFeedback === "string" && o.teachingFeedback.length > 20),
    "Every option must include teaching feedback",
  )
  assert(practice.data.data.preferredOptionKey === "clarify-question", "Preferred option must match seeded key")
  assert(!/Correct!|Wrong!|Good job!/i.test(JSON.stringify(practice.data.data)), "Feedback must not be Correct/Wrong theatre")

  const missingPractice = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l1/practice`)
  assert(missingPractice.response.status === 404, "Lessons without Practice content return 404")

  const workspaceFlags = await request(userAJar, `/lms/courses/${courseSlug}`)
  const l2Lesson = workspaceFlags.data.data.course.modules
    .flatMap((m: { lessons: Array<{ id: string; hasPractice?: boolean }> }) => m.lessons)
    .find((l: { id: string }) => l.id === "l2")
  assert(l2Lesson?.hasPractice === true, "Workspace lesson l2 should advertise hasPractice")
  const l1Lesson = workspaceFlags.data.data.course.modules
    .flatMap((m: { lessons: Array<{ id: string; hasPractice?: boolean }> }) => m.lessons)
    .find((l: { id: string }) => l.id === "l1")
  assert(l1Lesson?.hasPractice === false, "Workspace lesson l1 should not claim Practice")

  const anonPractice = await request(anonJar, `/lms/courses/${courseSlug}/lessons/l2/practice`)
  assert(anonPractice.response.status === 401, "Unauthenticated practice access must be rejected")

  const blockedPractice = await request(userBJar, `/lms/courses/${courseSlug}/lessons/l2/practice`)
  assert(blockedPractice.response.status === 403, "Non-enrolled user cannot load Practice")

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

  console.log("20. Sales Analysis project brief (l13) loads for enrolled unlocked learner")
  const projectJar: CookieJar = new Map()
  await signupUser(projectJar, "project-l13")
  await request(projectJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug },
  })

  const lockedBrief = await request(projectJar, `/lms/courses/${courseSlug}/lessons/l13/assignment`)
  assert(lockedBrief.response.status === 403, "Locked l13 assignment should be rejected")

  for (const lessonKey of ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11", "l12"]) {
    await completeLesson(projectJar, courseSlug, lessonKey)
  }

  const anonL13 = await request(anonJar, `/lms/courses/${courseSlug}/lessons/l13/assignment`)
  assert(anonL13.response.status === 401, "Unauthenticated l13 assignment access must be rejected")

  const blockedL13 = await request(userBJar, `/lms/courses/${courseSlug}/lessons/l13/assignment`)
  assert(blockedL13.response.status === 403, "Unenrolled learner cannot load l13 brief")

  const l13Get = await request(projectJar, `/lms/courses/${courseSlug}/lessons/l13/assignment`)
  assert(l13Get.response.ok, "Enrolled unlocked learner should load l13 assignment")
  assert(l13Get.data.data.brief, "l13 should include project brief")
  assert(l13Get.data.data.brief.title === "Project 1: Sales Analysis", "l13 brief title should match authored content")
  assert(l13Get.data.data.brief.kicker === "PROJECT 1", "l13 brief kicker should be PROJECT 1")
  assert(l13Get.data.data.brief.content?.objective, "l13 brief should include objective")
  assert(
    Array.isArray(l13Get.data.data.brief.content?.requiredAnalysis) &&
      l13Get.data.data.brief.content.requiredAnalysis.length === 6,
    "l13 brief should include R1–R6",
  )
  assert(l13Get.data.data.brief.dataset?.available === true, "l13 dataset should be available")
  assert(
    l13Get.data.data.brief.dataset?.name === "skylent_aether_home_goods_sales_v1",
    "l13 dataset name should match Phase 10 contract",
  )
  assert(
    String(l13Get.data.data.brief.dataset?.disclaimer ?? "").toLowerCase().includes("synthetic"),
    "Dataset disclaimer must identify synthetic curriculum data",
  )
  assert(
    String(l13Get.data.data.brief.content?.scenario?.framing ?? "")
      .toLowerCase()
      .includes("fictional"),
    "Scenario framing must identify fictional case",
  )

  console.log("21. Dataset download is gated and returns xlsx bytes")
  const anonDataset = await request(anonJar, `/lms/courses/${courseSlug}/lessons/l13/assignment/dataset`)
  assert(anonDataset.response.status === 401, "Unauthenticated dataset download must be rejected")
  const blockedDataset = await request(userBJar, `/lms/courses/${courseSlug}/lessons/l13/assignment/dataset`)
  assert(blockedDataset.response.status === 403, "Unenrolled dataset download must be rejected")

  const datasetRes = await fetch(
    `${API_BASE}/lms/courses/${courseSlug}/lessons/l13/assignment/dataset`,
    { headers: { Cookie: cookieHeader(projectJar) } },
  )
  assert(datasetRes.ok, "Enrolled unlocked learner should download dataset")
  const datasetBuf = Buffer.from(await datasetRes.arrayBuffer())
  assert(datasetBuf.byteLength > 10_000, "Dataset download should return substantial xlsx bytes")
  assert(
    (datasetRes.headers.get("content-type") ?? "").includes("spreadsheetml") ||
      (datasetRes.headers.get("content-type") ?? "").includes("octet-stream"),
    "Dataset content-type should be spreadsheet-compatible",
  )

  console.log("22. Project artifact upload + submission integrity")
  assert(l13Get.data.data.brief.artifactUpload?.required === true, "l13 brief should advertise required artifact upload")
  assert(
    Array.isArray(l13Get.data.data.brief.artifactUpload?.allowedExtensions),
    "l13 brief should list allowed artifact extensions",
  )

  const analysisText =
    "Filters: exclude Cancelled and Returned from net revenue. R1: total net revenue and order count from Completed lines. R2–R5 covered in workbook pivots. R6 priorities: (1) investigate softer H2 category performance with evidence from monthly category views; (2) review West region order mix and return share. Limitations: fictional Aether Home Goods curriculum data; correlation only."

  const textOnly = await request(projectJar, `/lms/courses/${courseSlug}/lessons/l13/assignment`, {
    method: "POST",
    csrf: true,
    body: { action: "submit", responseText: analysisText },
  })
  assert(textOnly.response.status === 400, "Project submit without stored artifact should fail")

  const metadataOnly = await request(projectJar, `/lms/courses/${courseSlug}/lessons/l13/assignment`, {
    method: "POST",
    csrf: true,
    body: {
      action: "submit",
      responseText: analysisText,
      attachments: [
        {
          fileName: "DA_l13_SalesAnalysis_test.xlsx",
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          byteSize: 4096,
        },
      ],
    },
  })
  assert(metadataOnly.response.status === 400, "Project submit with metadata-only attachments should fail")

  async function uploadArtifact(jar: CookieJar, fileName: string, bytes: Buffer, mimeType: string) {
    const form = new FormData()
    form.append("artifact", new Blob([new Uint8Array(bytes)], { type: mimeType }), fileName)
    const response = await fetch(`${API_BASE}/lms/courses/${courseSlug}/lessons/l13/assignment/artifact`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader(jar),
        "X-CSRF-Token": jar.get("csrf") ?? "",
      },
      body: form,
    })
    const setCookie = response.headers.getSetCookie?.() ?? []
    parseSetCookie(setCookie, jar)
    const text = await response.text()
    let data: any = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = { error: text }
    }
    return { response, data }
  }

  const pdfBytes = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n")
  const zipBytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
  const exeBytes = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00])
  const sqlBytes = Buffer.from("-- verification query\nSELECT 1;\n")

  const lockedJar: CookieJar = new Map()
  await signupUser(lockedJar, "artifact-locked")
  await request(lockedJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug },
  })
  const lockedUpload = await uploadArtifact(
    lockedJar,
    "early.xlsx",
    zipBytes,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  assert(lockedUpload.response.status === 403, "Locked assignment artifact upload must be rejected")

  const anonUpload = await uploadArtifact(
    anonJar,
    "probe.xlsx",
    zipBytes,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  assert(anonUpload.response.status === 401, "Unauthenticated artifact upload must be rejected")

  const blockedUpload = await uploadArtifact(
    userBJar,
    "probe.xlsx",
    zipBytes,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  assert(blockedUpload.response.status === 403, "Unenrolled artifact upload must be rejected")

  const exeUpload = await uploadArtifact(projectJar, "malware.xlsx", exeBytes, "application/octet-stream")
  assert(exeUpload.response.status === 400, "Executable signature disguised as xlsx must be rejected")

  const badExt = await uploadArtifact(projectJar, "notes.html", Buffer.from("<html></html>"), "text/html")
  assert(badExt.response.status === 400, "Disallowed extension must be rejected")

  const huge = Buffer.alloc(26 * 1024 * 1024, 0x41)
  huge[0] = 0x50
  huge[1] = 0x4b
  huge[2] = 0x03
  huge[3] = 0x04
  const oversize = await uploadArtifact(
    projectJar,
    "too-big.xlsx",
    huge,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  assert(oversize.response.status === 400, "Oversized artifact must be rejected")

  const xlsxUpload = await uploadArtifact(
    projectJar,
    "DA_l13_SalesAnalysis_test.xlsx",
    zipBytes,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  assert(xlsxUpload.response.ok, `Valid xlsx upload should succeed: ${JSON.stringify(xlsxUpload.data)}`)
  assert(xlsxUpload.data.data.attachment?.stored === true, "Uploaded xlsx should be marked stored")
  assert(xlsxUpload.data.data.attachment?.storageProvider === "local", "Uploaded xlsx provider should be local")

  const artifactOnly = await request(projectJar, `/lms/courses/${courseSlug}/lessons/l13/assignment`, {
    method: "POST",
    csrf: true,
    body: { action: "submit" },
  })
  assert(artifactOnly.response.status === 400, "Artifact without written analysis should not complete")

  const pdfUpload = await uploadArtifact(projectJar, "DA_l13_SalesAnalysis_export.pdf", pdfBytes, "application/pdf")
  assert(pdfUpload.response.ok, "Valid PDF upload should succeed")
  assert(pdfUpload.data.data.attachment?.stored === true, "Uploaded PDF should be marked stored")

  const sqlUpload = await uploadArtifact(projectJar, "verify_r1.sql", sqlBytes, "text/plain")
  assert(sqlUpload.response.ok, "Optional SQL upload should succeed per policy")

  const finalUpload = await uploadArtifact(
    projectJar,
    "DA_l13_SalesAnalysis_final.xlsx",
    zipBytes,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  assert(finalUpload.response.ok, "Final xlsx upload should succeed")
  const finalAttachmentId = finalUpload.data.data.attachment.id as string

  const ownerDownload = await fetch(
    `${API_BASE}/lms/courses/${courseSlug}/lessons/l13/assignment/attachments/${finalAttachmentId}`,
    { headers: { Cookie: cookieHeader(projectJar) } },
  )
  assert(ownerDownload.ok, "Owner should download their stored artifact")
  const ownerBytes = Buffer.from(await ownerDownload.arrayBuffer())
  assert(ownerBytes.byteLength === zipBytes.byteLength, "Downloaded artifact bytes should match upload")

  const anonDownload = await fetch(
    `${API_BASE}/lms/courses/${courseSlug}/lessons/l13/assignment/attachments/${finalAttachmentId}`,
  )
  assert(anonDownload.status === 401, "Unauthenticated artifact download must be rejected")

  const otherDownload = await fetch(
    `${API_BASE}/lms/courses/${courseSlug}/lessons/l13/assignment/attachments/${finalAttachmentId}`,
    { headers: { Cookie: cookieHeader(userBJar) } },
  )
  assert(otherDownload.status === 403, "Other learner must not download this artifact")

  const thiefJar: CookieJar = new Map()
  await signupUser(thiefJar, "artifact-thief")
  await request(thiefJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug },
  })
  for (const lessonKey of ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11", "l12"]) {
    await completeLesson(thiefJar, courseSlug, lessonKey)
  }
  const thiefDownload = await fetch(
    `${API_BASE}/lms/courses/${courseSlug}/lessons/l13/assignment/attachments/${finalAttachmentId}`,
    { headers: { Cookie: cookieHeader(thiefJar) } },
  )
  assert(thiefDownload.status === 403, "Changing attachment id must not grant another learner access")

  const missingDownload = await fetch(
    `${API_BASE}/lms/courses/${courseSlug}/lessons/l13/assignment/attachments/00000000-0000-4000-8000-000000000000`,
    { headers: { Cookie: cookieHeader(projectJar) } },
  )
  assert(missingDownload.status === 404, "Missing attachment id should fail safely")

  const projectSubmit = await request(projectJar, `/lms/courses/${courseSlug}/lessons/l13/assignment`, {
    method: "POST",
    csrf: true,
    body: {
      action: "submit",
      responseText: analysisText,
    },
  })
  assert(projectSubmit.response.ok, `Valid project submit should succeed: ${JSON.stringify(projectSubmit.data)}`)
  assert(projectSubmit.data.data.status === "submitted", "Project should be submitted")
  assert(
    projectSubmit.data.data.attachments?.some((a: { stored?: boolean }) => a.stored === true),
    "Submitted project should retain stored artifact metadata",
  )

  const afterL13 = await request(projectJar, `/lms/courses/${courseSlug}`)
  assert(afterL13.data.data.lessonStates.l13?.complete === true, "l13 lesson progress should be complete")
  assert(afterL13.data.data.lessonStates.l14?.locked === false, "l14 should unlock after l13 completion")

  console.log("23. Other title-only assignment nodes remain without authored briefs")
  const l6Brief = await request(projectJar, `/lms/courses/${courseSlug}/lessons/l6/assignment`)
  assert(l6Brief.response.ok, "l6 assignment GET should still work")
  assert(l6Brief.data.data.brief === null, "l6 must remain title-only (no brief)")

  const l12Brief = await request(projectJar, `/lms/courses/${courseSlug}/lessons/l12/assignment`)
  assert(l12Brief.response.ok, "l12 assignment GET should still work")
  assert(l12Brief.data.data.brief === null, "l12 must remain title-only (no brief)")

  // l14 is unlocked after l13 submit above
  const l14Brief = await request(projectJar, `/lms/courses/${courseSlug}/lessons/l14/assignment`)
  assert(l14Brief.response.ok, "l14 assignment GET should work when unlocked")
  assert(l14Brief.data.data.brief === null, "l14 must remain title-only (no brief)")

  for (const other of [
    { slug: "python-programming", lesson: "l6" },
    { slug: "generative-ai", lesson: "l6" },
    { slug: "full-stack-web", lesson: "l6" },
  ]) {
    const otherJar: CookieJar = new Map()
    await signupUser(otherJar, `other-${other.slug}`)
    const enrollOther = await request(otherJar, "/lms/enrollments", {
      method: "POST",
      csrf: true,
      body: { courseSlug: other.slug },
    })
    if (!enrollOther.response.ok) continue
    // Unlock through prior lessons when present
    const ws = await request(otherJar, `/lms/courses/${other.slug}`)
    const lessons: string[] = (ws.data.data.course.modules ?? []).flatMap(
      (m: { lessons: Array<{ id: string }> }) => m.lessons.map((l) => l.id),
    )
    for (const key of lessons) {
      if (key === other.lesson) break
      await completeLesson(otherJar, other.slug, key)
    }
    const otherAssign = await request(otherJar, `/lms/courses/${other.slug}/lessons/${other.lesson}/assignment`)
    assert(otherAssign.response.ok, `${other.slug}/${other.lesson} assignment GET should work`)
    assert(otherAssign.data.data.brief === null, `${other.slug}/${other.lesson} must remain title-only`)
  }

  console.log("All LMS integration checks passed.")
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
