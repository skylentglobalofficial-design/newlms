import "dotenv/config"
import crypto from "node:crypto"
import { PrismaClient, RoleName } from "@prisma/client"
import { isObjectStorageConfigured } from "../server/src/lib/object-storage.js"

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

async function grantRole(email: string, role: "faculty" | "organisation" | "admin", organisationSlug = "apex-college") {
  const user = await prisma.user.findUnique({ where: { email } })
  assert(user, `User ${email} not found`)
  const roleName =
    role === "faculty"
      ? RoleName.FACULTY
      : role === "organisation"
        ? RoleName.ORGANISATION_ADMIN
        : RoleName.ADMIN
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
  const storageConfigured = isObjectStorageConfigured()
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

  console.log("13. Assignment state persists with R2 attachment upload flow")
  await completeLesson(userAJar, courseSlug, "l5")
  let readyAttachmentId: string | null = null
  const attachmentCreate = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments`, {
    method: "POST",
    csrf: true,
    body: {
      fileName: "analysis.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      byteSize: 2048,
    },
  })
  if (storageConfigured) {
    assert(attachmentCreate.response.status === 201, "Attachment upload metadata should be created")
    assert(attachmentCreate.data.data.uploadUrl, "Presigned upload URL should be returned")
    assert(attachmentCreate.data.data.attachment.uploadStatus === "PENDING", "New attachments should start pending")
    readyAttachmentId = attachmentCreate.data.data.attachment.id as string
    const attachmentRow = await prisma.assignmentAttachment.findUnique({ where: { id: readyAttachmentId } })
    assert(attachmentRow, "Attachment row should exist")
    assert(attachmentRow.storageProvider === "r2", "Storage provider must be server-controlled")
    assert(attachmentRow.storageKey.startsWith(`assignment-attachments/${courseSlug}/`), "Storage key must be server-generated")
    assert(!attachmentRow.storageKey.includes("data-analytics/l6"), "Client must not choose storage key")

    const putResponse = await fetch(attachmentCreate.data.data.uploadUrl as string, {
      method: attachmentCreate.data.data.uploadMethod as string,
      headers: attachmentCreate.data.data.uploadHeaders as Record<string, string>,
      body: Buffer.alloc(2048),
    })
    assert(putResponse.ok, "Presigned PUT upload should succeed when storage is configured")

    const completeUpload = await request(
      userAJar,
      `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments/${readyAttachmentId}/complete-upload`,
      { method: "POST", csrf: true, body: {} },
    )
    assert(completeUpload.response.ok, "Complete-upload should succeed after storage PUT")
    assert(completeUpload.data.data.uploadStatus === "READY", "Attachment should be ready after verified upload")
  } else {
    assert(attachmentCreate.response.status === 503, "Missing storage config should return 503")
  }

  const assignmentSubmit = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l6/assignment`, {
    method: "POST",
    csrf: true,
    body: {
      action: "submit",
      responseText: "My Excel analysis submission.",
      attachmentIds: readyAttachmentId ? [readyAttachmentId] : undefined,
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
  if (storageConfigured && readyAttachmentId) {
    assert(assignmentRow.attachments.length === 1, "Ready attachment should remain linked after submit")
    assert(assignmentRow.attachments[0].uploadStatus === "READY", "Submitted attachment should remain ready")
    assert(assignmentRow.attachments[0].storageProvider === "r2", "Storage provider should be r2")
    assert(assignmentRow.attachments[0].storageKey.startsWith(`assignment-attachments/${courseSlug}/`), "Storage key should remain server-generated")
  }

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
  const maliciousAttachment = await request(attachmentJar, `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments`, {
    method: "POST",
    csrf: true,
    body: {
      fileName: "report.pdf",
      mimeType: "application/pdf",
      byteSize: 1024,
      storageProvider: "r2",
      storageKey: "attacker/owned/object-key",
    },
  })
  if (storageConfigured) {
    assert(maliciousAttachment.response.status === 201, "Attachment create with extra fields should succeed using server-owned storage metadata")
    const attachmentId = maliciousAttachment.data.data.attachment.id as string
    const maliciousRow = await prisma.assignmentAttachment.findUnique({ where: { id: attachmentId } })
    assert(maliciousRow, "Attachment metadata should be stored")
    assert(maliciousRow.storageProvider === "r2", "Client cannot set storage provider")
    assert(maliciousRow.storageKey.startsWith(`assignment-attachments/${courseSlug}/`), "Storage key must be server-generated")
    assert(!maliciousRow.storageKey.includes("attacker/owned"), "Client cannot inject storage key")
  } else {
    assert(maliciousAttachment.response.status === 503, "Missing storage config should return 503")
  }

  console.log("20. Unauthorized upload rejected for lesson materials")
  const studentJar: CookieJar = new Map()
  const studentUser = await signupUser(studentJar, "material-student")
  await request(studentJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug },
  })
  const studentUpload = await request(studentJar, `/faculty/courses/${courseSlug}/lessons/l2/materials`, {
    method: "POST",
    csrf: true,
    body: { fileName: "slides.pdf", mimeType: "application/pdf", byteSize: 1024 },
  })
  assert(studentUpload.response.status === 403, "Students must not upload lesson materials")

  console.log("21. Instructor upload authorization and server-owned metadata")
  const instructorJar: CookieJar = new Map()
  const instructorUser = await signupUser(instructorJar, "material-instructor")
  await grantRole(instructorUser.email, "admin")
  const uploadAttempt = await request(instructorJar, `/faculty/courses/${courseSlug}/lessons/l2/materials`, {
    method: "POST",
    csrf: true,
    body: {
      fileName: "lecture.pdf",
      mimeType: "application/pdf",
      byteSize: 2048,
      storageProvider: "r2",
      storageKey: "attacker/owned/material.pdf",
    },
  })
  assert(storageConfigured === (uploadAttempt.response.status === 201), "Storage availability should match configured state")
  let publishedMaterialId: string | null = null
  if (storageConfigured) {
    assert(uploadAttempt.data.data.material.fileName === "lecture.pdf", "Material filename should be stored")
    assert(uploadAttempt.data.data.uploadUrl, "Upload URL should be returned when storage is configured")
    assert(uploadAttempt.data.data.material.uploadStatus === "PENDING", "New materials should start pending")
    const materialId = uploadAttempt.data.data.material.id as string
    publishedMaterialId = materialId
    const materialRow = await prisma.lessonMaterial.findUnique({ where: { id: materialId } })
    assert(materialRow, "Material row should exist")
    assert(materialRow.storageProvider === "r2", "Storage provider must be server-controlled")
    assert(materialRow.storageKey.startsWith(`lesson-materials/${courseSlug}/`), "Storage key must be server-generated")
    assert(!materialRow.storageKey.includes("attacker/owned"), "Client cannot inject storage key")

    const prematurePublish = await request(
      instructorJar,
      `/faculty/courses/${courseSlug}/lessons/l2/materials/${materialId}/publish`,
      { method: "POST", csrf: true, body: {} },
    )
    assert(prematurePublish.response.status === 409, "Publish without verified upload must be rejected")

    const incompleteComplete = await request(
      instructorJar,
      `/faculty/courses/${courseSlug}/lessons/l2/materials/${materialId}/complete-upload`,
      { method: "POST", csrf: true, body: {} },
    )
    assert(incompleteComplete.response.status === 409, "Complete-upload without storage object must be rejected")

    const putResponse = await fetch(uploadAttempt.data.data.uploadUrl as string, {
      method: uploadAttempt.data.data.uploadMethod as string,
      headers: uploadAttempt.data.data.uploadHeaders as Record<string, string>,
      body: Buffer.alloc(2048),
    })
    assert(putResponse.ok, "Presigned PUT upload should succeed when storage is configured")

    const completeUpload = await request(
      instructorJar,
      `/faculty/courses/${courseSlug}/lessons/l2/materials/${materialId}/complete-upload`,
      { method: "POST", csrf: true, body: {} },
    )
    assert(completeUpload.response.ok, "Complete-upload should succeed after storage PUT")
    assert(completeUpload.data.data.uploadStatus === "READY", "Material should be ready after verified upload")

    const publish = await request(
      instructorJar,
      `/faculty/courses/${courseSlug}/lessons/l2/materials/${materialId}/publish`,
      { method: "POST", csrf: true, body: {} },
    )
    assert(publish.response.ok, "Instructor should be able to publish verified material")
    assert(publish.data.data.published === true, "Published flag should be true")
  } else {
    assert(uploadAttempt.response.status === 503, "Missing storage config should return 503, not accept client metadata")
  }

  console.log("22. Unsupported lesson material file type rejected")
  const badType = await request(instructorJar, `/faculty/courses/${courseSlug}/lessons/l2/materials`, {
    method: "POST",
    csrf: true,
    body: { fileName: "virus.exe", mimeType: "application/x-msdownload", byteSize: 1024 },
  })
  assert(badType.response.status === 400, "Unsupported file type must be rejected")

  console.log("23. Locked lesson materials forbidden for enrolled learner")
  const lockedMaterials = await request(studentJar, `/lms/courses/${courseSlug}/lessons/l2/materials`)
  assert(lockedMaterials.response.status === 403, "Locked lesson materials must be forbidden")
  assert(lockedMaterials.data.error === "Lesson locked", "Locked lesson should return structured error")

  console.log("24. Unlocked lesson materials allowed after prerequisite completion")
  await completeLesson(studentJar, courseSlug, "l1")
  const enrolledMaterials = await request(studentJar, `/lms/courses/${courseSlug}/lessons/l2/materials`)
  assert(enrolledMaterials.response.ok, "Enrolled student should list lesson materials after unlock")
  if (storageConfigured && publishedMaterialId) {
    assert(Array.isArray(enrolledMaterials.data.data), "Materials list should be an array")
    const lecture = enrolledMaterials.data.data.find((item: { fileName?: string }) => item.fileName === "lecture.pdf")
    assert(lecture, "Published material should be visible to enrolled student")
    assert(lecture.downloadUrl, "Verified published material should include download URL when storage is configured")
  } else {
    assert(Array.isArray(enrolledMaterials.data.data), "Materials list should be an array")
  }

  console.log("25. Non-enrolled student cannot access private lesson materials")
  const materialOutsiderJar: CookieJar = new Map()
  await signupUser(materialOutsiderJar, "material-outsider")
  const outsiderMaterials = await request(materialOutsiderJar, `/lms/courses/${courseSlug}/lessons/l2/materials`)
  assert(outsiderMaterials.response.status === 403, "Non-enrolled user must not access lesson materials")

  console.log("26. Faculty without teaching scope cannot manage lesson materials")
  const materialScopedFacultyJar: CookieJar = new Map()
  const materialScopedFaculty = await signupUser(materialScopedFacultyJar, "scoped-faculty")
  await grantRole(materialScopedFaculty.email, "faculty")
  const scopedUpload = await request(materialScopedFacultyJar, `/faculty/courses/${courseSlug}/lessons/l2/materials`, {
    method: "POST",
    csrf: true,
    body: { fileName: "scoped.pdf", mimeType: "application/pdf", byteSize: 1024 },
  })
  assert(scopedUpload.response.status === 403, "Faculty without demo teaching scope must not manage materials")

  console.log("27. Learner only sees published materials")
  if (storageConfigured && publishedMaterialId) {
    await prisma.lessonMaterial.update({
      where: { id: publishedMaterialId },
      data: { published: false },
    })
    const hiddenMaterials = await request(studentJar, `/lms/courses/${courseSlug}/lessons/l2/materials`)
    assert(hiddenMaterials.response.ok, "Materials endpoint should succeed")
    assert(
      !hiddenMaterials.data.data.some((item: { fileName?: string }) => item.fileName === "lecture.pdf"),
      "Unpublished materials must not appear for learners",
    )
    await prisma.lessonMaterial.update({
      where: { id: publishedMaterialId },
      data: { published: true },
    })
  }

  console.log("28. Faculty lessons API returns curriculum lessons")
  const facultyLessons = await request(instructorJar, `/faculty/courses/${courseSlug}/lessons`)
  assert(facultyLessons.response.ok, "Faculty should list course lessons")
  assert(
    facultyLessons.data.data.some((lesson: { lessonKey?: string }) => lesson.lessonKey === "l2"),
    "Faculty lessons API should include l2",
  )

  console.log("29. Faculty can update lesson notes")
  const facultyNotesUpdate = await request(
    instructorJar,
    `/faculty/courses/${courseSlug}/lessons/l2/notes`,
    { method: "PATCH", csrf: true, body: { notesBody: "Analytics mindset notes from integration test." } },
  )
  assert(facultyNotesUpdate.response.ok, "Faculty should update lesson notes")
  assert(
    facultyNotesUpdate.data.data.notesBody.includes("Analytics mindset"),
    "Updated notes should be returned",
  )

  console.log("30. Learner cannot update lesson notes")
  const learnerNotesUpdate = await request(
    studentJar,
    `/faculty/courses/${courseSlug}/lessons/l2/notes`,
    { method: "PATCH", csrf: true, body: { notesBody: "Learner tamper attempt" } },
  )
  assert(learnerNotesUpdate.response.status === 403, "Learner must not update lesson notes")

  console.log("31. Unauthorized faculty cannot update lesson notes")
  const scopedNotesUpdate = await request(
    materialScopedFacultyJar,
    `/faculty/courses/${courseSlug}/lessons/l2/notes`,
    { method: "PATCH", csrf: true, body: { notesBody: "Scoped faculty tamper attempt" } },
  )
  assert(scopedNotesUpdate.response.status === 403, "Scoped faculty must not update lesson notes")

  console.log("32. DB-backed notes returned to enrolled learner after unlock")
  const workspaceAfterNotes = await request(studentJar, `/lms/courses/${courseSlug}`)
  assert(workspaceAfterNotes.response.ok, "Workspace should load for enrolled learner")
  const l2Lesson = workspaceAfterNotes.data.data.course.modules
    .flatMap((module: { lessons: Array<{ id: string; notesBody?: string | null }> }) => module.lessons)
    .find((lesson: { id: string }) => lesson.id === "l2")
  assert(l2Lesson?.notesBody, "Unlocked learner should receive DB-backed notes in workspace")

  console.log("33. Locked lesson notes withheld from workspace")
  const lockedWorkspace = await request(userBJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug },
  })
  assert(lockedWorkspace.response.status === 201 || lockedWorkspace.response.ok, "Second user should enroll")
  const lockedWorkspaceView = await request(userBJar, `/lms/courses/${courseSlug}`)
  const lockedL2 = lockedWorkspaceView.data.data.course.modules
    .flatMap((module: { lessons: Array<{ id: string; notesBody?: string | null }> }) => module.lessons)
    .find((lesson: { id: string }) => lesson.id === "l2")
  assert(!lockedL2?.notesBody, "Locked lesson notes must not be exposed in workspace")

  console.log("34. Assignment attachments do not claim fake download availability")
  const assignmentLesson = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l6/assignment`)
  if (assignmentLesson.response.ok && assignmentLesson.data.data.attachments?.length) {
    const attachment = assignmentLesson.data.data.attachments[0]
    if (storageConfigured && readyAttachmentId) {
      assert(attachment.storageStatus === "ready", "Verified attachment should report ready storage status")
      assert(attachment.downloadUrl, "Ready attachment with storage object should include download URL")
      assert(attachment.downloadAvailable === true, "Ready attachment should report download availability")
    } else {
      assert(attachment.downloadAvailable === false, "Pending attachment must not claim download availability")
      assert(attachment.storageStatus === "pending", "Pending attachment should report pending storage status")
      assert(!attachment.downloadUrl, "Pending attachment must not include download URL")
    }
  }

  console.log("35. Certificate download requires eligibility")
  const certificateBlocked = await request(studentJar, `/lms/courses/${courseSlug}/certificate/download`)
  assert(certificateBlocked.response.status === 409, "Ineligible learner must not download certificate")

  console.log("36. Material MIME type can be inferred from file extension")
  const extensionMime = await request(instructorJar, `/faculty/courses/${courseSlug}/lessons/l2/materials`, {
    method: "POST",
    csrf: true,
    body: { fileName: "slides.pptx", mimeType: "application/octet-stream", byteSize: 1024 },
  })
  if (storageConfigured) {
    assert(extensionMime.response.status === 201, "Extension-based MIME inference should allow upload creation")
    assert(
      extensionMime.data.data.material.mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "PPTX MIME should be inferred from file extension",
    )
  } else {
    assert(extensionMime.response.status === 503, "Unconfigured storage should return 503")
  }

  console.log("37. Published material without storage object has no download URL")
  const facultyL8Materials = await request(instructorJar, `/faculty/courses/${courseSlug}/lessons/l8/materials`)
  if (facultyL8Materials.response.ok) {
    const seededItem = facultyL8Materials.data.data.find(
      (entry: { fileName?: string }) => entry.fileName === "sql-reference-sheet.pdf",
    )
    if (seededItem) {
      assert(!seededItem.downloadUrl, "Metadata-only published material must not expose a download URL")
      assert(seededItem.uploadStatus === "PENDING", "Seeded demo material should remain pending without R2 object")
    }
  }

  console.log("38. Unsupported assignment attachment file type rejected")
  const badAttachmentType = await request(attachmentJar, `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments`, {
    method: "POST",
    csrf: true,
    body: { fileName: "virus.exe", mimeType: "application/x-msdownload", byteSize: 1024 },
  })
  assert(badAttachmentType.response.status === 400, "Unsupported attachment file type must be rejected")

  console.log("39. Unauthorized assignment attachment creation rejected")
  const outsiderAttachmentJar: CookieJar = new Map()
  await signupUser(outsiderAttachmentJar, "attachment-outsider")
  const outsiderAttachment = await request(outsiderAttachmentJar, `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments`, {
    method: "POST",
    csrf: true,
    body: { fileName: "report.pdf", mimeType: "application/pdf", byteSize: 1024 },
  })
  assert(outsiderAttachment.response.status === 403, "Non-enrolled user must not create assignment attachments")

  console.log("40. Complete-upload missing object rejected")
  if (storageConfigured) {
    const pendingCreate = await request(attachmentJar, `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments`, {
      method: "POST",
      csrf: true,
      body: { fileName: "pending-only.pdf", mimeType: "application/pdf", byteSize: 512 },
    })
    assert(pendingCreate.response.status === 201, "Pending attachment metadata should be created")
    const pendingId = pendingCreate.data.data.attachment.id as string
    const incompleteComplete = await request(
      attachmentJar,
      `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments/${pendingId}/complete-upload`,
      { method: "POST", csrf: true, body: {} },
    )
    assert(incompleteComplete.response.status === 409, "Complete-upload without storage object must be rejected")
  }

  console.log("41. Inaccessible assignment attachment routes blocked")
  const lockedAttachment = await request(userBJar, `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments`, {
    method: "POST",
    csrf: true,
    body: { fileName: "locked.pdf", mimeType: "application/pdf", byteSize: 1024 },
  })
  assert(lockedAttachment.response.status === 403, "Locked assignment attachment upload must be forbidden")

  console.log("42. Student cannot perform faculty-only material mutation")
  const studentMaterialUpload = await request(studentJar, `/faculty/courses/${courseSlug}/lessons/l2/materials`, {
    method: "POST",
    csrf: true,
    body: { fileName: "slides.pdf", mimeType: "application/pdf", byteSize: 1024 },
  })
  assert(studentMaterialUpload.response.status === 403, "Students must not upload lesson materials")

  console.log("43. Assignment attachment create returns 503 when R2 unavailable")
  if (!storageConfigured) {
    const unavailableCreate = await request(attachmentJar, `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments`, {
      method: "POST",
      csrf: true,
      body: { fileName: "offline.pdf", mimeType: "application/pdf", byteSize: 1024 },
    })
    assert(unavailableCreate.response.status === 503, "Unconfigured storage should return 503 for attachment create")
  }

  console.log("44. Submit rejects non-ready attachment IDs")
  const submitJar: CookieJar = new Map()
  const submitUser = await signupUser(submitJar, "attachment-submit")
  await request(submitJar, "/lms/enrollments", { method: "POST", csrf: true, body: { courseSlug } })
  for (const lessonKey of ["l1", "l2", "l3", "l4", "l5"]) {
    await completeLesson(submitJar, courseSlug, lessonKey)
  }
  if (storageConfigured) {
    const pendingOnly = await request(submitJar, `/lms/courses/${courseSlug}/lessons/l6/assignment/attachments`, {
      method: "POST",
      csrf: true,
      body: { fileName: "not-ready.pdf", mimeType: "application/pdf", byteSize: 256 },
    })
    assert(pendingOnly.response.status === 201, "Pending attachment should be created")
    const pendingOnlyId = pendingOnly.data.data.attachment.id as string
    const rejectedSubmit = await request(submitJar, `/lms/courses/${courseSlug}/lessons/l6/assignment`, {
      method: "POST",
      csrf: true,
      body: { action: "submit", attachmentIds: [pendingOnlyId] },
    })
    assert(rejectedSubmit.response.status === 400, "Submit must reject non-ready attachment IDs")
  }

  console.log("45. Faculty can review authorized submission with attachments")
  assert(assignmentRow, "Submitted assignment row should exist for faculty review tests")
  const facultyReview = await request(instructorJar, `/faculty/submissions/${assignmentRow.id}`)
  assert(facultyReview.response.ok, "Authorized faculty should load submission detail")
  assert(facultyReview.data.data.id === assignmentRow.id, "Submission detail should match requested id")
  assert(
    typeof facultyReview.data.data.responseText === "string",
    "Faculty submission detail should include learner response text",
  )
  if (storageConfigured && readyAttachmentId) {
    assert(facultyReview.data.data.attachments.length >= 1, "Faculty should see submission attachments")
    const reviewedAttachment = facultyReview.data.data.attachments.find(
      (entry: { id?: string }) => entry.id === readyAttachmentId,
    )
    assert(reviewedAttachment, "Faculty should see the ready learner attachment")
    assert(reviewedAttachment.downloadUrl, "Ready attachment with storage object should include presigned GET")
    assert(reviewedAttachment.downloadAvailable === true, "Ready attachment should report download availability")
  }

  console.log("46. Unauthorized faculty cannot access submission review")
  const scopedFacultyReview = await request(
    materialScopedFacultyJar,
    `/faculty/submissions/${assignmentRow.id}`,
  )
  assert(scopedFacultyReview.response.status === 403, "Faculty without teaching scope must not review submissions")

  console.log("47. Learner cannot use faculty submission review route")
  const learnerFacultyReview = await request(studentJar, `/faculty/submissions/${assignmentRow.id}`)
  assert(learnerFacultyReview.response.status === 403, "Learner must not access faculty submission review")

  console.log("48. READY attachment without storage object has no download URL")
  const ghostAttachment = await prisma.assignmentAttachment.create({
    data: {
      assignmentProgressId: assignmentRow.id,
      fileName: "ghost-ready.pdf",
      mimeType: "application/pdf",
      byteSize: 1024,
      storageProvider: "r2",
      storageKey: `assignment-attachments/${courseSlug}/${assignmentRow.id}/ghost/${crypto.randomUUID()}/ghost-ready.pdf`,
      uploadStatus: "READY",
    },
  })
  const ghostReview = await request(instructorJar, `/faculty/submissions/${assignmentRow.id}`)
  assert(ghostReview.response.ok, "Faculty submission detail should load with ghost attachment metadata")
  const ghostItem = ghostReview.data.data.attachments.find(
    (entry: { id?: string }) => entry.id === ghostAttachment.id,
  )
  assert(ghostItem, "Ghost attachment should be listed")
  assert(!ghostItem.downloadUrl, "READY metadata without storage object must not expose download URL")
  assert(ghostItem.downloadAvailable === false, "Ghost attachment must report download unavailable")

  console.log("49. Pending attachment has no download URL in faculty review")
  const pendingReviewAttachment = await prisma.assignmentAttachment.create({
    data: {
      assignmentProgressId: assignmentRow.id,
      fileName: "pending-review.pdf",
      mimeType: "application/pdf",
      byteSize: 512,
      storageProvider: "r2",
      storageKey: `assignment-attachments/${courseSlug}/${assignmentRow.id}/pending/${crypto.randomUUID()}/pending-review.pdf`,
      uploadStatus: "PENDING",
    },
  })
  const pendingFacultyReview = await request(instructorJar, `/faculty/submissions/${assignmentRow.id}`)
  const pendingItem = pendingFacultyReview.data.data.attachments.find(
    (entry: { id?: string }) => entry.id === pendingReviewAttachment.id,
  )
  assert(pendingItem, "Pending attachment should be listed for faculty review")
  assert(!pendingItem.downloadUrl, "Pending attachment must not include download URL")
  assert(pendingItem.downloadAvailable === false, "Pending attachment must not claim download availability")

  console.log("50. Faculty submission review reports honest storage availability")
  assert(
    facultyReview.data.data.objectStorageConfigured === storageConfigured,
    "Faculty submission detail should report real object storage configuration",
  )

  console.log("51. Superadmin can access submission review")
  const superadminReview = await request(instructorJar, `/faculty/submissions/${assignmentRow.id}`)
  assert(superadminReview.response.ok, "Superadmin should access submission review")

  console.log("52. Submission review rejects unknown submission id")
  const missingReview = await request(
    instructorJar,
    `/faculty/submissions/${crypto.randomUUID()}`,
  )
  assert(missingReview.response.status === 404, "Unknown submission id should return 404")

  console.log("53. Faculty submission attachments are scoped to the requested submission")
  const submitUserRow = await prisma.user.findUnique({ where: { email: submitUser.email } })
  assert(submitUserRow, "Submit test user should exist")
  const secondSubmission = await request(submitJar, `/lms/courses/${courseSlug}/lessons/l6/assignment`, {
    method: "POST",
    csrf: true,
    body: { action: "submit", responseText: "Another learner submission for scope test." },
  })
  assert(secondSubmission.response.ok, "Second learner submission should succeed")
  const secondAssignmentRow = await prisma.assignmentProgress.findFirst({
    where: { userId: submitUserRow.id, status: "submitted" },
    orderBy: { updatedAt: "desc" },
  })
  assert(secondAssignmentRow, "Second assignment row should exist")
  const scopedReview = await request(instructorJar, `/faculty/submissions/${secondAssignmentRow.id}`)
  assert(scopedReview.response.ok, "Faculty should load second submission")
  const crossAttachment = scopedReview.data.data.attachments.find(
    (entry: { id?: string }) => entry.id === readyAttachmentId,
  )
  assert(!crossAttachment, "Submission review must not expose attachments from another learner submission")

  console.log("54. Lesson media returns mux playback when configured")
  const l1Node = await prisma.curriculumNode.findFirst({
    where: { sourceId: "l1", module: { course: { slug: courseSlug } } },
    select: { id: true, muxPlaybackId: true },
  })
  assert(l1Node, "data-analytics/l1 should exist")
  const originalPlaybackId = l1Node.muxPlaybackId
  const qaPlaybackId = process.env.MUX_DEMO_PLAYBACK_ID?.trim() || "mux-qa-playback-contract"
  await prisma.curriculumNode.update({
    where: { id: l1Node.id },
    data: { muxPlaybackId: qaPlaybackId },
  })

  const muxMedia = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l1/media`)
  assert(muxMedia.response.ok, "Unlocked video lesson media should load")
  assert(muxMedia.data.data.media.provider === "mux", "Configured lesson should report mux provider")
  assert(muxMedia.data.data.media.playbackId === qaPlaybackId, "Playback ID should round-trip")

  console.log("55. Lesson media unavailable without playback ID")
  await prisma.curriculumNode.update({
    where: { id: l1Node.id },
    data: { muxPlaybackId: null },
  })
  const unavailableMedia = await request(userAJar, `/lms/courses/${courseSlug}/lessons/l1/media`)
  assert(unavailableMedia.response.ok, "Media endpoint should succeed without playback ID")
  assert(
    unavailableMedia.data.data.media.provider === "unavailable",
    "Missing playback ID should report unavailable media",
  )

  await prisma.curriculumNode.update({
    where: { id: l1Node.id },
    data: { muxPlaybackId: originalPlaybackId },
  })

  console.log("56. Locked lesson video media forbidden")
  const lockedMuxJar: CookieJar = new Map()
  await signupUser(lockedMuxJar, "locked-mux")
  const lockedMuxEnroll = await request(lockedMuxJar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug },
  })
  assert(lockedMuxEnroll.response.status === 201 || lockedMuxEnroll.response.ok, "Locked mux enroll should succeed")
  const lockedMuxMedia = await request(lockedMuxJar, `/lms/courses/${courseSlug}/lessons/l4/media`)
  assert(lockedMuxMedia.response.status === 403, "Locked video lesson media must be forbidden")
  assert(lockedMuxMedia.data.error === "Lesson locked", "Locked media should return lesson locked error")

  console.log("57. Lesson init key stays stable across repeated renders")
  const { buildLessonInitKey } = await import("../src/components/lms/lesson-init-key.js")
  const unlockedKey = buildLessonInitKey({
    slug: courseSlug,
    lessonId: "l1",
    locked: false,
    lessonType: "video",
  })
  const duplicateKey = buildLessonInitKey({
    slug: courseSlug,
    lessonId: "l1",
    locked: false,
    lessonType: "video",
  })
  const lockedKey = buildLessonInitKey({
    slug: courseSlug,
    lessonId: "l4",
    locked: true,
    lessonType: "video",
  })
  assert(unlockedKey === `${courseSlug}:l1:video`, "Unlocked video lessons should use type-specific init key")
  assert(duplicateKey === unlockedKey, "Lesson init key should be stable for the same lesson context")
  assert(lockedKey === `${courseSlug}:l4:locked`, "Locked lessons should use locked init key")

  console.log("58. Lesson initialization guard suppresses repeated init for same key")
  const { shouldRunLessonInitialization } = await import("../src/components/lms/lesson-init-key.js")
  let completedInitKey: string | null = null
  let initRuns = 0
  for (const _attempt of Array.from({ length: 20 })) {
    if (shouldRunLessonInitialization(completedInitKey, unlockedKey)) {
      initRuns += 1
      completedInitKey = unlockedKey
    }
  }
  assert(initRuns === 1, "Repeated effect invocations with the same init key should initialize once")
  assert(
    shouldRunLessonInitialization(completedInitKey, lockedKey),
    "A changed init key should allow initialization again",
  )

  console.log("59. Learn page lesson init does not loop in browser (smoke)")
  const learnSmokeBase = process.env.LEARN_SMOKE_BASE ?? "http://localhost:5173"
  const chromePath = process.env.CHROME_PATH ?? "/usr/bin/google-chrome-stable"
  const viteReachable = await fetch(learnSmokeBase).then((response) => response.ok).catch(() => false)
  if (!viteReachable) {
    console.log(`   SKIP: Vite dev server not reachable at ${learnSmokeBase}`)
  } else {
    const { default: puppeteer } = await import("puppeteer-core")
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    const page = await browser.newPage()
    const mediaRequests: string[] = []
    const progressRequests: string[] = []
    page.on("request", (request) => {
      const url = request.url()
      if (url.includes("/lessons/l1/media")) mediaRequests.push(url)
      if (url.includes("/lessons/l1/progress")) progressRequests.push(url)
    })

    await page.goto(`${learnSmokeBase}/login`, { waitUntil: "domcontentloaded", timeout: 30000 })
    await page.waitForSelector("#si-email", { timeout: 15000 })
    await page.type("#si-email", "learner@demo.skylent.dev", { delay: 5 })
    await page.type("#si-password", process.env.DEMO_USER_PASSWORD ?? "DemoSkylent2026!", { delay: 5 })
    await page.click('button[type="submit"]')
    await page.waitForFunction(
      () => window.location.pathname.includes("/dashboard/"),
      { timeout: 20000 },
    )

    await page.goto(`${learnSmokeBase}/learn/data-analytics/l1`, { waitUntil: "domcontentloaded", timeout: 45000 })
    await page.waitForSelector(".lms-lesson-panel", { timeout: 20000 })
    const startMedia = mediaRequests.length
    const startProgress = progressRequests.length
    await new Promise((resolve) => setTimeout(resolve, 6000))
    const muxReady = await page.evaluate(() => ({
      hasMuxPlayer: Boolean(document.querySelector("mux-player")),
      materialsLoading: document.body.textContent?.includes("Loading materials…") ?? false,
    }))
    await browser.close()

    assert(mediaRequests.length - startMedia <= 1, `Media requests looped during observe window (${mediaRequests.length} total)`)
    assert(progressRequests.length - startProgress <= 1, `Progress requests looped during observe window (${progressRequests.length} total)`)
    assert(mediaRequests.length <= 4, `Too many media requests during lesson load (${mediaRequests.length})`)
    assert(progressRequests.length <= 4, `Too many progress requests during lesson load (${progressRequests.length})`)
    assert(muxReady.hasMuxPlayer, "Mux player should render on unlocked demo lesson")
    assert(!muxReady.materialsLoading, "Materials should finish loading when requests are finite")
    console.log(
      `   PASS: media=${mediaRequests.length}, progress=${progressRequests.length}, mux=${muxReady.hasMuxPlayer}`,
    )
  }

  console.log("All LMS integration checks passed.")
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
