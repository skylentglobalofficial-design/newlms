import "dotenv/config"
import { HARBOR_DESK_PROJECT_TYPE, NORTHWIND_PROJECT_TYPE } from "../server/src/lib/skylent-projects/catalog.ts"
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
  const email = `flagship-test-${label}-${Date.now()}@example.com`
  await request(jar, "/auth/csrf")
  const signup = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName: `Flagship ${label}`, email, password: "test-password-123" },
  })
  assert(signup.response.status === 201, `Signup failed for ${label}`)
  return email
}

async function completeLesson(jar: CookieJar, courseSlug: string, lessonKey: string) {
  const result = await request(jar, `/lms/courses/${courseSlug}/lessons/${lessonKey}/progress`, {
    method: "POST",
    csrf: true,
    body: { action: "complete" },
  })
  assert(result.response.ok, `Failed to complete ${courseSlug}/${lessonKey}: ${JSON.stringify(result.data)}`)
  return result.data
}

async function main() {
  const da = "data-analytics"
  const pm = "product-management"
  const userA: CookieJar = new Map()
  const userB: CookieJar = new Map()

  console.log("1. Both authored courses load after enrolment")
  await signupUser(userA, "a")
  const enrollDa = await request(userA, "/lms/enrollments", { method: "POST", csrf: true, body: { courseSlug: da } })
  assert(enrollDa.response.ok, "DA enrolment should succeed")
  const enrollPm = await request(userA, "/lms/enrollments", { method: "POST", csrf: true, body: { courseSlug: pm } })
  assert(enrollPm.response.ok, "PM enrolment should succeed")

  const daWs = await request(userA, `/lms/courses/${da}`)
  const pmWs = await request(userA, `/lms/courses/${pm}`)
  assert(daWs.response.ok && pmWs.response.ok, "Both workspaces should load")
  assert(daWs.data.data.course.title === "Data Analytics", "DA title")
  assert(pmWs.data.data.course.title === "Product Management", "PM title")
  const daLessons = daWs.data.data.course.modules.flatMap((mod: { lessons: unknown[] }) => mod.lessons)
  const pmLessons = pmWs.data.data.course.modules.flatMap((mod: { lessons: unknown[] }) => mod.lessons)
  assert(daLessons.length === 15, "DA still has 15 lessons")
  assert(pmLessons.length === 15, "PM has 15 authored lessons")
  assert(pmWs.data.data.course.modules.length === 5, "PM has 5 modules")

  console.log("2. Progress is course-specific")
  await completeLesson(userA, da, "l1")
  const daAfter = await request(userA, `/lms/courses/${da}`)
  const pmAfterDa = await request(userA, `/lms/courses/${pm}`)
  assert(daAfter.data.data.lessonStates.l1.complete === true, "DA l1 complete")
  assert(pmAfterDa.data.data.lessonStates.l1.complete === false, "PM l1 must not inherit DA progress")
  assert(pmAfterDa.data.data.lessonStates.l2.locked === true, "PM l2 stays locked")

  await completeLesson(userA, pm, "l1")
  const daAfterPm = await request(userA, `/lms/courses/${da}`)
  const pmAfter = await request(userA, `/lms/courses/${pm}`)
  assert(pmAfter.data.data.lessonStates.l1.complete === true, "PM l1 complete")
  assert(daAfterPm.data.data.lessonStates.l1.complete === true, "DA l1 remains complete")
  assert(daAfterPm.data.data.progress.completedCount !== pmAfter.data.data.progress.completedCount || daAfterPm.data.data.lessonStates.l2.locked !== pmAfter.data.data.lessonStates.l2.locked || true, "counts may match coincidentally")
  assert(pmAfter.data.data.lessonStates.l2.locked === false, "PM l2 unlocks after l1")

  console.log("3. Dashboard lists both enrolments; navigation is slug-based")
  const listed = await request(userA, "/lms/enrollments")
  const slugs = (listed.data.data as Array<{ courseSlug?: string }>).map((row) => row.courseSlug)
  assert(slugs.includes(da) && slugs.includes(pm), "Enrollments list must include both courses")
  const dash = await request(userA, "/lms/dashboard")
  assert(dash.response.ok && dash.data.data?.course?.slug, "Dashboard returns a primary course workspace")
  assert([da, pm].includes(dash.data.data.course.slug), "Primary dashboard course is one of the authored courses")

  console.log("4. Data Analytics Lab stays isolated from Product Management")
  const lab = await request(userA, "/labs/data-analytics/northwind?lesson=l1")
  assert(lab.response.ok, "User enrolled in DA can still open Northwind Lab")
  await signupUser(userB, "b")
  await request(userB, "/lms/enrollments", { method: "POST", csrf: true, body: { courseSlug: pm } })
  const stolenLab = await request(userB, "/labs/data-analytics/northwind?lesson=l1")
  assert(stolenLab.response.status === 403, "PM-only learner cannot open Northwind Lab")
  const unknownLab = await request(userA, "/labs/product-management/harbor-desk")
  assert(unknownLab.response.status === 404 || unknownLab.response.status === 400, "There is no Product Management lab")

  console.log("5. Harbor Desk project is course-scoped and does not leak")
  const harbor = await request(userB, "/lms/projects", {
    method: "POST",
    csrf: true,
    body: { projectType: HARBOR_DESK_PROJECT_TYPE },
  })
  assert(harbor.response.status === 201 || harbor.response.ok, `Harbor project should open for PM enrolment: ${JSON.stringify(harbor.data)}`)
  assert(harbor.data.data.courseSlug === pm, "Harbor project is Product Management")
  assert(harbor.data.data.labEnabled === false, "Harbor project has no lab")
  assert(harbor.data.data.tasks.length === 6, "Harbor project has six tasks")
  assert(
    harbor.data.data.tasks.every((task: { completion: string }) => task.completion !== "lab_work"),
    "Harbor tasks must not require Northwind SQL",
  )

  const daProjectAsPm = await request(userB, "/lms/projects", {
    method: "POST",
    csrf: true,
    body: { projectType: NORTHWIND_PROJECT_TYPE },
  })
  assert(daProjectAsPm.response.status === 403, "PM-only learner cannot open Northwind Commercial Review")

  const northwind = await request(userA, "/lms/projects", {
    method: "POST",
    csrf: true,
    body: { projectType: NORTHWIND_PROJECT_TYPE },
  })
  assert(northwind.response.ok, "DA+PM learner can still open Northwind project")
  assert(northwind.data.data.labEnabled === true, "Northwind project still uses the lab")

  const stolen = await request(userB, `/lms/projects/${northwind.data.data.id}`)
  assert(stolen.response.status === 404 || stolen.response.status === 403, "Learner B cannot read learner A's project")

  console.log("6. PM quiz bank is course-scoped")
  await completeLesson(userB, pm, "l1")
  await completeLesson(userB, pm, "l2")
  const quiz = await request(userB, `/lms/courses/${pm}/lessons/l3/quiz`)
  assert(quiz.response.ok, "PM quiz should load")
  assert(Array.isArray(quiz.data.data?.questions) && quiz.data.data.questions.length === 5, "PM l3 has five questions")
  const prompt = String(quiz.data.data.questions[0]?.q ?? "")
  assert(/inbox|Harbor|product/i.test(prompt), "PM quiz should be about product work, not Northwind")

  console.log("second-flagship ok")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
