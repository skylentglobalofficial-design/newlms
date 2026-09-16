import "dotenv/config"
import { NORTHWIND_PROJECT_TYPE, PROJECT_REFLECTION_MAX } from "../server/src/lib/skylent-projects/catalog.ts"
import { NORTHWIND_SQL_EXAMPLES as SQL_EXAMPLES } from "../server/src/lib/skylent-labs/sql/examples.ts"

const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"

type CookieJar = Map<string, string>

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
  const data = text ? JSON.parse(text) : null
  return { response, data }
}

async function signup(jar: CookieJar, label: string) {
  const email = `labs-project-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`
  await request(jar, "/auth/csrf")
  const signupResult = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName: `Labs Project ${label}`, email, password: "test-password-123" },
  })
  assert(signupResult.response.status === 201, `Signup failed: ${JSON.stringify(signupResult.data)}`)
}

async function enrollDataAnalytics(jar: CookieJar) {
  const enroll = await request(jar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: "data-analytics" },
  })
  assert(enroll.response.status === 201 || enroll.response.ok, `Enrol failed: ${JSON.stringify(enroll.data)}`)
}

async function saveSql(jar: CookieJar, sql: string) {
  const save = await request(jar, "/labs/data-analytics/northwind/work", {
    method: "POST",
    csrf: true,
    body: { operation: "sql", query: sql, lessonKey: "l1" },
  })
  assert(save.response.status === 201, `save SQL failed ${JSON.stringify(save.data)}`)
  return save.data.data as { id: string; result: { chart?: { chartable?: boolean; series?: Array<{ y: number }> } } }
}

function task(project: { tasks: Array<{ key: string; status: string; evidence: unknown }> }, key: string) {
  const match = project.tasks.find((item) => item.key === key)
  assert(match, `missing task ${key}`)
  return match
}

async function main() {
  console.log("1. Auth, enrolment, create, retrieve")
  const anon = await fetch(`${API_BASE}/lms/projects`)
  assert(anon.status === 401, "projects require auth")

  const unenrolled = new Map<string, string>()
  await signup(unenrolled, "open")
  const blocked = await request(unenrolled, "/lms/projects", {
    method: "POST",
    csrf: true,
    body: { projectType: NORTHWIND_PROJECT_TYPE },
  })
  assert(blocked.response.status === 403, "unenrolled learner cannot open project")

  const jar = new Map<string, string>()
  await signup(jar, "a")
  await enrollDataAnalytics(jar)

  const noCsrf = await request(jar, "/lms/projects", {
    method: "POST",
    body: { projectType: NORTHWIND_PROJECT_TYPE },
  })
  assert(noCsrf.response.status === 403, "create requires CSRF")

  const created = await request(jar, "/lms/projects", {
    method: "POST",
    csrf: true,
    body: { projectType: NORTHWIND_PROJECT_TYPE },
  })
  assert(created.response.status === 201, `create failed ${JSON.stringify(created.data)}`)
  const project = created.data.data
  assert(project.title === "Northwind Commercial Review", "title")
  assert(project.status === "not_started", "fresh status")
  assert(project.progress.complete === 0 && project.progress.total === 6, "task count")
  assert(!JSON.stringify(project.brief).includes("347,072"), "brief must not contain the answer")
  assert(!JSON.stringify(project.brief).includes("Electronics"), "brief must not name the finding")
  const projectId = project.id as string

  const listed = await request(jar, "/lms/projects")
  assert(listed.response.ok && listed.data.data.some((row: { id: string }) => row.id === projectId), "list includes project")

  const loaded = await request(jar, `/lms/projects/${projectId}`)
  assert(loaded.response.ok, "get by id")
  assert(loaded.data.data.id === projectId, "same project")

  const again = await request(jar, "/lms/projects", {
    method: "POST",
    csrf: true,
    body: { projectType: NORTHWIND_PROJECT_TYPE },
  })
  assert(again.data.data.id === projectId, "ensure is idempotent")

  console.log("2. Task completion, evidence, reflection")
  const before = await request(jar, "/lms/courses/data-analytics")
  const completeBefore = before.data.data.lessonStates.l1?.complete === true
  const careerBefore = await request(jar, "/career/profile")
  const workBefore = await request(jar, "/labs/data-analytics/northwind/work")
  const workCountBefore = (workBefore.data.data as unknown[]).length

  const skipComplete = await request(jar, `/lms/projects/${projectId}/tasks/category_revenue/complete`, {
    method: "POST",
    csrf: true,
    body: {},
  })
  assert(skipComplete.response.status === 400, "category task cannot be marked complete without evidence")

  const marked = await request(jar, `/lms/projects/${projectId}/tasks/validate_data/complete`, {
    method: "POST",
    csrf: true,
    body: {},
  })
  assert(marked.response.ok, `mark complete failed ${JSON.stringify(marked.data)}`)
  assert(task(marked.data.data, "validate_data").status === "complete", "task 1 complete")
  assert(marked.data.data.progress.complete === 1, "1/6 after explicit complete")

  const categorySql = SQL_EXAMPLES.find((item) => item.id === "revenue_by_category")
  const monthlySql = SQL_EXAMPLES.find((item) => item.id === "monthly_revenue")
  const countSql = SQL_EXAMPLES.find((item) => item.id === "valid_rows")
  assert(categorySql && monthlySql && countSql, "examples present")

  const countWork = await saveSql(jar, countSql.sql)
  const categoryWork = await saveSql(jar, categorySql.sql)
  const monthlyWork = await saveSql(jar, monthlySql.sql)
  assert(categoryWork.result.chart?.chartable === true, "category work is chartable")
  assert(categoryWork.result.chart?.series?.[0]?.y === 347072, "category chart from SQL")

  const wrongAttach = await request(jar, `/lms/projects/${projectId}/evidence`, {
    method: "POST",
    csrf: true,
    body: { taskKey: "category_revenue", labWorkId: countWork.id, netRevenue: 999999, chartType: "bar" },
  })
  assert(wrongAttach.response.status === 400, "count result cannot complete category task")

  const fakeId = "00000000-0000-4000-8000-000000000000"
  const missingWork = await request(jar, `/lms/projects/${projectId}/evidence`, {
    method: "POST",
    csrf: true,
    body: { taskKey: "category_revenue", labWorkId: fakeId },
  })
  assert(missingWork.response.status === 404, "unknown lab work rejected")

  const attached = await request(jar, `/lms/projects/${projectId}/evidence`, {
    method: "POST",
    csrf: true,
    body: { taskKey: "category_revenue", labWorkId: categoryWork.id },
  })
  assert(attached.response.ok, `attach category failed ${JSON.stringify(attached.data)}`)
  const categoryTask = task(attached.data.data, "category_revenue")
  assert(categoryTask.status === "complete", "category task complete after attach")
  assert(categoryTask.evidence?.rowCount === 4, "attached row count from live SQL")
  assert(categoryTask.evidence?.chartable === true, "attached chart yes")
  assert(categoryTask.evidence?.chart?.series?.[0]?.y === 347072, "evidence chart from server rerun")

  const monthly = await request(jar, `/lms/projects/${projectId}/evidence`, {
    method: "POST",
    csrf: true,
    body: { taskKey: "monthly_trend", labWorkId: monthlyWork.id },
  })
  assert(monthly.response.ok, "attach monthly")
  assert(task(monthly.data.data, "monthly_trend").status === "complete", "monthly task complete")
  assert(task(monthly.data.data, "monthly_trend").evidence?.chartable === true, "monthly chartable")

  const short = await request(jar, `/lms/projects/${projectId}/reflection`, {
    method: "PATCH",
    csrf: true,
    body: { finding: "x" },
  })
  assert(short.response.status === 400, "tiny finding rejected")

  const tooLong = await request(jar, `/lms/projects/${projectId}/reflection`, {
    method: "PATCH",
    csrf: true,
    body: { finding: "a".repeat(PROJECT_REFLECTION_MAX + 1) },
  })
  assert(tooLong.response.status === 400, "overlong finding rejected")

  const saved = await request(jar, `/lms/projects/${projectId}/save`, {
    method: "POST",
    csrf: true,
    body: {
      finding: "Electronics is the largest valid category by net revenue in this extract.",
      whyItMatters: "A commercial lead should know where valid sales actually concentrate before changing mix.",
      recommendation: "Review Electronics availability and discounting next, using the same valid-row rule.",
    },
  })
  assert(saved.response.ok, `save failed ${JSON.stringify(saved.data)}`)
  assert(saved.data.data.status === "ready_to_review" || saved.data.data.status === "saved", "saved status")
  assert(saved.data.data.progress.complete === 6, "all tasks complete")
  assert(task(saved.data.data, "finding").status === "complete", "finding complete")
  assert(task(saved.data.data, "why_it_matters").status === "complete", "why complete")
  assert(task(saved.data.data, "recommendation").status === "complete", "recommendation complete")

  const reopened = await request(jar, `/lms/projects/${projectId}`)
  assert(reopened.data.data.reflection.finding.includes("Electronics"), "reflection persisted")
  assert(task(reopened.data.data, "category_revenue").evidence?.labWorkId === categoryWork.id, "evidence persisted")
  assert(reopened.data.data.progress.complete === 6, "reopen keeps completion")

  console.log("3. Ownership, LMS, lab, Career OS isolation")
  const other = new Map<string, string>()
  await signup(other, "b")
  await enrollDataAnalytics(other)
  const stolenProject = await request(other, `/lms/projects/${projectId}`)
  assert(stolenProject.response.status === 404, "cannot read another user's project")
  const stolenAttach = await request(other, `/lms/projects/${projectId}/evidence`, {
    method: "POST",
    csrf: true,
    body: { taskKey: "category_revenue", labWorkId: categoryWork.id },
  })
  assert(stolenAttach.response.status === 404, "cannot attach into another user's project")

  const otherProject = await request(other, "/lms/projects", {
    method: "POST",
    csrf: true,
    body: { projectType: NORTHWIND_PROJECT_TYPE },
  })
  const otherAttach = await request(other, `/lms/projects/${otherProject.data.data.id}/evidence`, {
    method: "POST",
    csrf: true,
    body: { taskKey: "category_revenue", labWorkId: categoryWork.id },
  })
  assert(otherAttach.response.status === 404, "cannot attach another user's lab work")

  const after = await request(jar, "/lms/courses/data-analytics")
  assert(after.data.data.lessonStates.l1?.complete === completeBefore, "project must not complete the lesson")
  assert(after.data.data.lessonStates.l2?.locked === true, "project must not unlock later lessons")

  const workAfter = await request(jar, "/labs/data-analytics/northwind/work")
  assert((workAfter.data.data as unknown[]).length === workCountBefore + 3, "attach does not rewrite lab work")

  const careerAfter = await request(jar, "/career/profile")
  assert(JSON.stringify(careerAfter.data.data.projects) === JSON.stringify(careerBefore.data.data.projects), "Career OS unchanged")

  const unknownType = await request(jar, "/lms/projects", {
    method: "POST",
    csrf: true,
    body: { projectType: "secret-osint" },
  })
  assert(unknownType.response.status === 404, "unknown project type")

  console.log("Skylent Labs project tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
