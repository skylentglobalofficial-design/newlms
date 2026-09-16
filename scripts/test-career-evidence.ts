import "dotenv/config"
import { NORTHWIND_PROJECT_TYPE } from "../server/src/lib/skylent-projects/catalog.ts"
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
  const email = `career-evidence-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`
  await request(jar, "/auth/csrf")
  const signupResult = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName: `Career Evidence ${label}`, email, password: "test-password-123" },
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
  return save.data.data as { id: string }
}

async function openProject(jar: CookieJar) {
  const created = await request(jar, "/lms/projects", {
    method: "POST",
    csrf: true,
    body: { projectType: NORTHWIND_PROJECT_TYPE },
  })
  assert(created.response.status === 201, `create failed ${JSON.stringify(created.data)}`)
  return created.data.data as { id: string; progress: { complete: number; total: number } }
}

const FINDING = "Electronics is the largest valid category by net revenue in this extract."
const WHY = "A commercial lead should know where valid sales actually concentrate before changing mix."
const REC = "Review Electronics availability and discounting next, using the same valid-row rule."

async function completeNorthwindProject(jar: CookieJar, projectId: string) {
  const marked = await request(jar, `/lms/projects/${projectId}/tasks/validate_data/complete`, {
    method: "POST",
    csrf: true,
    body: {},
  })
  assert(marked.response.ok, `validate failed ${JSON.stringify(marked.data)}`)

  const categorySql = SQL_EXAMPLES.find((item) => item.id === "revenue_by_category")
  const monthlySql = SQL_EXAMPLES.find((item) => item.id === "monthly_revenue")
  assert(categorySql && monthlySql, "examples present")
  const categoryWork = await saveSql(jar, categorySql.sql)
  const monthlyWork = await saveSql(jar, monthlySql.sql)

  const attached = await request(jar, `/lms/projects/${projectId}/evidence`, {
    method: "POST",
    csrf: true,
    body: { taskKey: "category_revenue", labWorkId: categoryWork.id },
  })
  assert(attached.response.ok, `attach category failed ${JSON.stringify(attached.data)}`)
  const monthly = await request(jar, `/lms/projects/${projectId}/evidence`, {
    method: "POST",
    csrf: true,
    body: { taskKey: "monthly_trend", labWorkId: monthlyWork.id },
  })
  assert(monthly.response.ok, `attach monthly failed ${JSON.stringify(monthly.data)}`)

  const saved = await request(jar, `/lms/projects/${projectId}/save`, {
    method: "POST",
    csrf: true,
    body: { finding: FINDING, whyItMatters: WHY, recommendation: REC },
  })
  assert(saved.response.ok, `save failed ${JSON.stringify(saved.data)}`)
  assert(saved.data.data.progress.complete === 6, "project must be complete")
  return { categoryWork, monthlyWork, project: saved.data.data }
}

async function main() {
  const jar = new Map<string, string>()
  const other = new Map<string, string>()
  await signup(jar, "a")
  await enrollDataAnalytics(jar)
  await signup(other, "b")
  await enrollDataAnalytics(other)

  const project = await openProject(jar)
  const projectId = project.id
  const otherProject = await openProject(other)

  const lmsBefore = await request(jar, "/lms/courses/data-analytics")
  const l1Before = lmsBefore.data.data.lessonStates.l1?.complete === true
  const l2LockedBefore = lmsBefore.data.data.lessonStates.l2?.locked === true
  const workBefore = await request(jar, "/labs/data-analytics/northwind/work")
  const workCountBefore = (workBefore.data.data as unknown[]).length
  const aiBefore = await request(jar, "/lms/ai/status")

  console.log("1. Incomplete project rejected")
  const incomplete = await request(jar, "/career/projects/from-learner-project", {
    method: "POST",
    csrf: true,
    body: { learnerProjectId: projectId, status: "Saved", skills: ["Python"] },
  })
  assert(incomplete.response.status === 400, "incomplete must be rejected")
  assert(incomplete.data.error === "Finish the project before adding it to Career OS.", "incomplete message")

  console.log("2. Saved but incomplete still rejected")
  const marked = await request(jar, `/lms/projects/${projectId}/tasks/validate_data/complete`, {
    method: "POST",
    csrf: true,
    body: {},
  })
  assert(marked.response.ok, "validate complete")
  const savedIncomplete = await request(jar, `/lms/projects/${projectId}/save`, {
    method: "POST",
    csrf: true,
    body: { finding: "", whyItMatters: "", recommendation: "" },
  })
  assert(savedIncomplete.response.ok, "save incomplete project")
  assert(savedIncomplete.data.data.status === "saved", "status can be saved while incomplete")
  const rejectedSaved = await request(jar, "/career/projects/from-learner-project", {
    method: "POST",
    csrf: true,
    body: { learnerProjectId: projectId },
  })
  assert(rejectedSaved.response.status === 400, "saved incomplete rejected")
  assert(rejectedSaved.data.error === "Finish the project before adding it to Career OS.", "saved incomplete message")

  console.log("3. Complete project can be added")
  const completed = await completeNorthwindProject(jar, projectId)
  const linked = await request(jar, "/career/projects/from-learner-project", {
    method: "POST",
    csrf: true,
    body: {
      learnerProjectId: projectId,
      title: "Certified Data Analyst",
      skills: ["Python", "Machine learning"],
      finding: "AI rewrite",
    },
  })
  assert(linked.response.status === 201, `link failed ${JSON.stringify(linked.data)}`)
  const careerId = linked.data.data.id as string
  assert(linked.data.data.title === "Northwind Commercial Review", "title from source")
  assert(linked.data.data.reflection.finding === FINDING, "reflection from source, not client")
  assert(!linked.data.data.skills.includes("Python"), "no inflated skills")
  assert(
    JSON.stringify(linked.data.data.skills) ===
      JSON.stringify(["SQL", "Data analysis", "Data interpretation", "Business communication"]),
    "skills mapping",
  )

  console.log("4. Duplicate association prevented")
  const again = await request(jar, "/career/projects/from-learner-project", {
    method: "POST",
    csrf: true,
    body: { learnerProjectId: projectId },
  })
  assert(again.response.status === 200, "duplicate returns existing")
  assert(again.data.data.id === careerId, "same career project id")
  const listed = await request(jar, "/career/projects")
  assert(listed.response.ok, "list ok")
  assert(listed.data.data.length === 1, "one career project")
  assert(listed.data.data[0].id === careerId, "listed id")
  assert(listed.data.data[0].evidenceCount === 3, "two analyses plus reflection")

  console.log("5. Career OS project retrieval hydrates source")
  const detail = await request(jar, `/career/projects/${careerId}`)
  assert(detail.response.ok, "detail ok")
  assert(detail.data.data.dataset === "northwind_sales.csv", "dataset from source")
  assert(detail.data.data.context === "Data Analytics", "context")
  assert(detail.data.data.reflection.whyItMatters === WHY, "why exact")
  assert(detail.data.data.reflection.recommendation === REC, "recommendation exact")
  assert(
    detail.data.data.evidence.some((item: { title: string }) => item.title === "Revenue by category"),
    "category evidence",
  )
  assert(
    detail.data.data.evidence.some((item: { title: string }) => item.title === "Monthly revenue"),
    "monthly evidence",
  )
  assert(
    detail.data.data.evidence.every((item: { source: string }) => item.source.includes("Northwind")),
    "evidence has source",
  )
  const payload = JSON.stringify(detail.data.data)
  assert(!payload.includes('"rows"'), "must not dump SQL rows")
  assert(!payload.includes("labWorkId"), "must not expose lab work ids")
  assert(!payload.includes("Certified"), "no certification language")
  assert(!payload.includes("job ready"), "no fake metrics")

  console.log("6. Ownership: cannot add another user's project")
  const stealAdd = await request(jar, "/career/projects/from-learner-project", {
    method: "POST",
    csrf: true,
    body: { learnerProjectId: otherProject.id },
  })
  assert(stealAdd.response.status === 404, "cannot add another user's learner project")
  const otherAddOwn = await request(other, "/career/projects/from-learner-project", {
    method: "POST",
    csrf: true,
    body: { learnerProjectId: projectId },
  })
  assert(otherAddOwn.response.status === 404, "user B cannot add user A's project")

  console.log("7. Ownership: cannot read or modify another user's Career OS project")
  const stealGet = await request(other, `/career/projects/${careerId}`)
  assert(stealGet.response.status === 404, "cannot read another career project")
  const stealDelete = await request(other, `/career/projects/${careerId}`, { method: "DELETE", csrf: true })
  assert(stealDelete.response.status === 404, "cannot unlink another career project")
  const otherList = await request(other, "/career/projects")
  assert(otherList.data.data.length === 0, "user B list stays empty")

  console.log("8. LabWork ownership stays with source hydration")
  const otherAttach = await request(other, `/lms/projects/${otherProject.id}/evidence`, {
    method: "POST",
    csrf: true,
    body: { taskKey: "category_revenue", labWorkId: completed.categoryWork.id },
  })
  assert(otherAttach.response.status === 404, "cannot attach another user's lab work")

  console.log("9. Reflection synchronization")
  const updatedFinding = "Category mix is uneven across valid Northwind sales."
  const updated = await request(jar, `/lms/projects/${projectId}/save`, {
    method: "POST",
    csrf: true,
    body: { finding: updatedFinding, whyItMatters: WHY, recommendation: REC },
  })
  assert(updated.response.ok, "project reflection updated")
  const synced = await request(jar, `/career/projects/${careerId}`)
  assert(synced.data.data.reflection.finding === updatedFinding, "career OS shows latest reflection")
  assert(synced.data.data.reflection.finding !== FINDING, "stale reflection not kept")
  assert(synced.data.data.eligible === true, "still complete")

  console.log("10. Incomplete after link is not presented as complete evidence")
  const opened = await request(jar, `/lms/projects/${projectId}/reflection`, {
    method: "PATCH",
    csrf: true,
    body: { finding: "" },
  })
  assert(opened.response.ok, "cleared finding")
  const incompleteLinked = await request(jar, `/career/projects/${careerId}`)
  assert(incompleteLinked.data.data.eligible === false, "no longer eligible")
  assert(
    incompleteLinked.data.data.incompleteMessage ===
      "This project is no longer complete. Finish the project to present it as evidence.",
    "incomplete linked message",
  )
  assert(incompleteLinked.data.data.skills.length === 0, "do not claim skills when incomplete")
  assert(incompleteLinked.data.data.reflection.finding === "", "empty finding shown exactly")

  const restored = await request(jar, `/lms/projects/${projectId}/save`, {
    method: "POST",
    csrf: true,
    body: { finding: updatedFinding, whyItMatters: WHY, recommendation: REC },
  })
  assert(restored.data.data.progress.complete === 6, "restored complete")

  console.log("11. Linked CareerProject cannot be overwritten via profile CRUD")
  const profilePatch = await request(jar, `/career/profile/projects/${careerId}`, {
    method: "PATCH",
    csrf: true,
    body: { title: "Employer-approved project", technologies: ["Python"] },
  })
  assert(profilePatch.response.status === 409, "cannot patch linked evidence project")

  console.log("12. Remove/unlink does not delete source work")
  const unlinked = await request(jar, `/career/projects/${careerId}`, { method: "DELETE", csrf: true })
  assert(unlinked.response.ok && unlinked.data.data.unlinked === true, "unlinked")
  const missing = await request(jar, `/career/projects/${careerId}`)
  assert(missing.response.status === 404, "career project gone")
  const emptyList = await request(jar, "/career/projects")
  assert(emptyList.data.data.length === 0, "list empty after unlink")
  const stillProject = await request(jar, `/lms/projects/${projectId}`)
  assert(stillProject.response.ok, "learner project remains")
  assert(stillProject.data.data.reflection.finding === updatedFinding, "project reflection remains")
  const workAfter = await request(jar, "/labs/data-analytics/northwind/work")
  assert((workAfter.data.data as unknown[]).length === workCountBefore + 2, "lab work unchanged by unlink")

  console.log("13. LMS progress unchanged")
  const lmsAfter = await request(jar, "/lms/courses/data-analytics")
  assert(lmsAfter.data.data.lessonStates.l1?.complete === l1Before, "l1 unchanged")
  assert(lmsAfter.data.data.lessonStates.l2?.locked === l2LockedBefore, "l2 remains locked")

  console.log("14. AI unchanged")
  const aiAfter = await request(jar, "/lms/ai/status")
  assert(aiAfter.data.data.available === aiBefore.data.data.available, "AI status unchanged")

  const lookupGone = await request(jar, `/career/projects/by-learner-project/${projectId}`)
  assert(lookupGone.data.data === null, "link lookup empty after unlink")

  console.log("Career OS evidence tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
