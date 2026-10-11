import "dotenv/config"
import crypto from "node:crypto"
import { CurriculumNodeType, PrismaClient, RoleName } from "@prisma/client"
import { ensureRole } from "../server/src/lib/auth.js"
import { isMuxPlaybackId } from "../server/src/lib/media/playback-id.ts"
import { TEST_CONSENT } from "./test-consent-payload.ts"

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://127.0.0.1:3000/api/v1"
const PASSWORD = "test-password-123"
const COURSE_SLUG = "python-programming"
const PROGRAM_SLUG = "data-science-ai"
const VALID_PLAYBACK_ID = "AbcdEfgh12345678"

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
  return Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join("; ")
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
  const data = text ? JSON.parse(text) : null
  return { response, data }
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

async function setRoleDirectly(userId: string, roleName: RoleName) {
  const role = await ensureRole(roleName)
  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId, roleId: { not: role.id } } })
    await tx.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    })
  })
}

async function signup(label: string) {
  const email = `media-${label}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}@example.com`
  const jar: CookieJar = new Map()
  await request(jar, "/auth/csrf")
  const result = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { consent: TEST_CONSENT, displayName: `Media ${label}`, email, password: PASSWORD },
  })
  assert(result.response.status === 201, `Signup failed for ${label}`)
  return { jar, userId: result.data.user.id as string, email }
}

async function login(email: string) {
  const jar: CookieJar = new Map()
  await request(jar, "/auth/csrf")
  const result = await request(jar, "/auth/login", {
    method: "POST",
    csrf: true,
    body: { email, password: PASSWORD },
  })
  assert(result.response.ok, `Login failed for ${email}`)
  return jar
}

type LessonRef = { id: string; type: string }

function lessonsFromWorkspace(data: { data?: { course?: { modules?: Array<{ lessons: LessonRef[] }> } } }): LessonRef[] {
  return data.data?.course?.modules?.flatMap((module) => module.lessons) ?? []
}

async function completeLesson(jar: CookieJar, lessonKey: string, type: string) {
  if (type === "quiz") {
    const course = await prisma.course.findUnique({ where: { slug: COURSE_SLUG } })
    assert(course, "Course missing")
    const node = await prisma.curriculumNode.findFirst({
      where: { sourceId: lessonKey, module: { courseId: course.id } },
      include: { quizQuestions: { orderBy: { sortOrder: "asc" } } },
    })
    assert(node && node.quizQuestions.length > 0, `Quiz ${lessonKey} has no stored questions`)
    const result = await request(jar, `/lms/courses/${COURSE_SLUG}/lessons/${lessonKey}/quiz/attempts`, {
      method: "POST",
      csrf: true,
      body: { answers: node.quizQuestions.map((question) => question.correctIndex) },
    })
    assert(result.response.status === 201 && result.data.data.passed === true, `Could not pass ${lessonKey}`)
    return
  }
  if (type === "assignment") {
    const result = await request(jar, `/lms/courses/${COURSE_SLUG}/lessons/${lessonKey}/assignment`, {
      method: "POST",
      csrf: true,
      body: { action: "submit", responseText: `Media unlock for ${lessonKey}` },
    })
    assert(result.response.ok, `Could not submit ${lessonKey}`)
    return
  }
  const result = await request(jar, `/lms/courses/${COURSE_SLUG}/lessons/${lessonKey}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(result.response.ok, `Could not complete ${lessonKey}`)
}

async function main() {
  assert(isMuxPlaybackId(VALID_PLAYBACK_ID), "Fixture playback id should match the public id rule")
  assert(!isMuxPlaybackId("https://stream.mux.com/abc"), "URLs are not playback ids")
  assert(!isMuxPlaybackId("short-id"), "Short ids are rejected")

  const course = await prisma.course.findUnique({
    where: { slug: COURSE_SLUG },
    include: { curriculum: { orderBy: { order: "asc" }, include: { nodes: { orderBy: { order: "asc" } } } } },
  })
  assert(course, `${COURSE_SLUG} must exist in the local database`)
  const flat = course.curriculum.flatMap((module) => module.nodes)
  const video = flat.find((node) => node.nodeType === CurriculumNodeType.VIDEO)
  assert(video, `${COURSE_SLUG} must include a video lesson`)
  const videoKey = video.sourceId ?? `l${video.order + 1}`
  const originalPlaybackId = video.muxPlaybackId
  const nonVideo = flat.find((node) => node.nodeType !== CurriculumNodeType.VIDEO)
  assert(nonVideo, "A non-video lesson is required")
  const nonVideoKey = nonVideo.sourceId ?? `l${nonVideo.order + 1}`

  const learner = await signup("learner")
  const stranger = await signup("stranger")
  const adminSignup = await signup("admin")
  await setRoleDirectly(adminSignup.userId, RoleName.ADMIN)
  const adminJar = await login(adminSignup.email)
  let foreignVideo: { id: string; original: string | null } | null = null

  try {
    console.log("1. Reject invalid playback ids and non-admin writes")
    const studentWrite = await request(learner.jar, `/admin/courses/${COURSE_SLUG}/lessons/${videoKey}/media`, {
      method: "PATCH",
      csrf: true,
      body: { muxPlaybackId: VALID_PLAYBACK_ID },
    })
    assert(studentWrite.response.status === 403, `Student media write should be 403, got ${studentWrite.response.status}`)
    const badId = await request(adminJar, `/admin/courses/${COURSE_SLUG}/lessons/${videoKey}/media`, {
      method: "PATCH",
      csrf: true,
      body: { muxPlaybackId: "https://stream.mux.com/not-a-playback-id" },
    })
    assert(badId.response.status === 400, `URL playback id should be 400, got ${badId.response.status}`)
    const nonVideoWrite = await request(adminJar, `/admin/courses/${COURSE_SLUG}/lessons/${nonVideoKey}/media`, {
      method: "PATCH",
      csrf: true,
      body: { muxPlaybackId: VALID_PLAYBACK_ID },
    })
    assert(nonVideoWrite.response.status === 404, `Non-video media write should be 404, got ${nonVideoWrite.response.status}`)

    console.log("2. Admin can attach a public playback id")
    const saved = await request(adminJar, `/admin/courses/${COURSE_SLUG}/lessons/${videoKey}/media`, {
      method: "PATCH",
      csrf: true,
      body: { muxPlaybackId: VALID_PLAYBACK_ID },
    })
    assert(saved.response.ok, `Media save failed: ${JSON.stringify(saved.data)}`)
    assert(saved.data.data.media.provider === "mux" && saved.data.data.media.playbackId === VALID_PLAYBACK_ID, "Saved media should echo the playback id")

    const enroll = await request(learner.jar, "/lms/enrollments", {
      method: "POST",
      csrf: true,
      body: { consent: TEST_CONSENT, programSlug: PROGRAM_SLUG },
    })
    assert(enroll.response.ok, `Enrollment failed: ${JSON.stringify(enroll.data)}`)
    const workspace = await request(learner.jar, `/lms/courses/${COURSE_SLUG}`)
    assert(workspace.response.ok, "Workspace failed")
    const lessons = lessonsFromWorkspace(workspace.data)
    const videoIndex = lessons.findIndex((lesson) => lesson.id === videoKey)
    assert(videoIndex >= 0, "Video lesson missing from workspace")

    const laterVideo = lessons.slice(videoIndex + 2).find((lesson) => lesson.type === "video")
    if (laterVideo) {
      const locked = await request(learner.jar, `/lms/courses/${COURSE_SLUG}/lessons/${laterVideo.id}/media`)
      assert(locked.response.status === 403, `Locked video media should be 403, got ${locked.response.status}`)
    } else {
      console.log("   (no later locked video lesson in this course; lock check skipped)")
    }

    const otherCourse = await prisma.course.findFirst({
      where: {
        slug: { not: COURSE_SLUG },
        programCourses: { none: { program: { slug: PROGRAM_SLUG } } },
        curriculum: { some: { nodes: { some: { nodeType: CurriculumNodeType.VIDEO } } } },
      },
      include: { curriculum: { include: { nodes: { where: { nodeType: CurriculumNodeType.VIDEO }, take: 1 } } } },
    })
    if (otherCourse) {
      const otherVideo = otherCourse.curriculum.flatMap((module) => module.nodes)[0]
      foreignVideo = { id: otherVideo.id, original: otherVideo.muxPlaybackId }
      await prisma.curriculumNode.update({ where: { id: otherVideo.id }, data: { muxPlaybackId: VALID_PLAYBACK_ID } })
      const otherKey = otherVideo.sourceId ?? `l${otherVideo.order + 1}`
      const crossCourse = await request(learner.jar, `/lms/courses/${otherCourse.slug}/lessons/${otherKey}/media`)
      assert(crossCourse.response.status === 403, `Media for a course outside the enrolment should be 403, got ${crossCourse.response.status}`)
      assert(!JSON.stringify(crossCourse.data).includes(VALID_PLAYBACK_ID), "Cross-course media leaked the playback id")
    } else {
      console.log("   (no video course outside the programme; cross-course check skipped)")
    }

    for (const lesson of lessons.slice(0, videoIndex)) {
      await completeLesson(learner.jar, lesson.id, lesson.type)
    }

    const media = await request(learner.jar, `/lms/courses/${COURSE_SLUG}/lessons/${videoKey}/media`)
    assert(media.response.ok, `Enrolled media failed: ${JSON.stringify(media.data)}`)
    assert(media.data.data.media.provider === "mux" && media.data.data.media.playbackId === VALID_PLAYBACK_ID, "Enrolled learner should receive the playback id")

    const blocked = await request(stranger.jar, `/lms/courses/${COURSE_SLUG}/lessons/${videoKey}/media`)
    assert(blocked.response.status === 403, `Unenrolled media should be 403, got ${blocked.response.status}`)

    const catalog = await request(new Map(), `/catalog/courses/${COURSE_SLUG}`)
    assert(catalog.response.ok, "Public catalog failed")
    const catalogJson = JSON.stringify(catalog.data)
    assert(!catalogJson.includes("muxPlaybackId") && !catalogJson.includes(VALID_PLAYBACK_ID), "Public catalog must not expose the playback id")

    console.log("3. Opening a video does not complete it, and completion records video progress")
    const opened = await request(learner.jar, `/lms/courses/${COURSE_SLUG}/lessons/${videoKey}/progress`, {
      method: "POST",
      csrf: true,
      body: { action: "access" },
    })
    assert(opened.response.ok, `Access update failed: ${JSON.stringify(opened.data)}`)
    assert(opened.data.data.state.complete !== true, "Opening a video must not complete it")
    assert(opened.data.data.state.videoWatched !== true, "Opening a video must not set videoWatched")
    const afterOpen = await request(learner.jar, `/lms/courses/${COURSE_SLUG}`)
    assert(afterOpen.data.data.lessonStates[videoKey]?.complete !== true, "Media fetch and access must not complete the lesson")

    const progress = await request(learner.jar, `/lms/courses/${COURSE_SLUG}/lessons/${videoKey}/progress`, {
      method: "POST",
      csrf: true,
      body: { action: "complete" },
    })
    assert(progress.response.ok, `Progress update failed: ${JSON.stringify(progress.data)}`)
    assert(progress.data.data.state.complete === true, "Completing a video lesson should mark it complete")
    assert(progress.data.data.state.videoWatched === true, "Video completion should set videoWatched")

    console.log("4. Invalid stored ids are treated as unavailable, and clearing removes playback")
    await prisma.curriculumNode.update({ where: { id: video.id }, data: { muxPlaybackId: "not a playback id" } })
    const invalidStored = await request(learner.jar, `/lms/courses/${COURSE_SLUG}/lessons/${videoKey}/media`)
    assert(invalidStored.response.ok && invalidStored.data.data.media.provider === "unavailable", "Invalid stored ids must not reach the player")
    assert(!JSON.stringify(invalidStored.data).includes("not a playback id"), "Invalid stored id leaked")
    const afterUnavailable = await request(learner.jar, `/lms/courses/${COURSE_SLUG}`)
    assert(afterUnavailable.data.data.lessonStates[videoKey]?.complete === true, "An unavailable video must not reset recorded progress")

    const cleared = await request(adminJar, `/admin/courses/${COURSE_SLUG}/lessons/${videoKey}/media`, {
      method: "PATCH",
      csrf: true,
      body: { muxPlaybackId: null },
    })
    assert(cleared.response.ok && cleared.data.data.media.provider === "unavailable", "Clearing the id should make media unavailable")

    console.log("Lesson media tests passed")
  } finally {
    await prisma.curriculumNode.update({ where: { id: video.id }, data: { muxPlaybackId: originalPlaybackId } })
    if (foreignVideo) {
      await prisma.curriculumNode.update({ where: { id: foreignVideo.id }, data: { muxPlaybackId: foreignVideo.original } })
    }
    await prisma.user.deleteMany({ where: { id: { in: [learner.userId, stranger.userId, adminSignup.userId] } } }).catch(() => undefined)
    await prisma.$disconnect()
  }
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
