import "dotenv/config"
import { NORTHWIND_PREVIEW } from "../src/lib/northwind-preview.ts"
import { VALID_NET_REVENUE } from "../server/src/lib/skylent-labs/catalog.ts"
import { resolveNorthwindSalesPath } from "../server/src/lib/skylent-labs/dataset.ts"
import {
  calculateValidNetRevenue,
  isValidSalesRow,
  runLabOperation,
} from "../server/src/lib/skylent-labs/engine.ts"

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
  const email = `labs-test-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`
  await request(jar, "/auth/csrf")
  const signupResult = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName: `Labs ${label}`, email, password: "test-password-123" },
  })
  assert(signupResult.response.status === 201, `Signup failed: ${JSON.stringify(signupResult.data)}`)
  return email
}

async function enrollDataAnalytics(jar: CookieJar) {
  const enroll = await request(jar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: "data-analytics" },
  })
  assert(enroll.response.status === 201 || enroll.response.ok, `Enrol failed: ${JSON.stringify(enroll.data)}`)
}

async function main() {
  console.log("1. Dataset engine matches authored Northwind totals")
  const salesPath = resolveNorthwindSalesPath()
  assert(salesPath.endsWith("northwind_sales.csv"), "resolved path should end with the public filename")
  assert(!salesPath.includes(".."), "preview APIs must not require traversal")
  const calculated = calculateValidNetRevenue()
  assert(calculated.validRows === 166, `valid rows ${calculated.validRows}`)
  assert(calculated.excludedRows === 14, `excluded ${calculated.excludedRows}`)
  assert(calculated.totalRows === 180, `rows ${calculated.totalRows}`)
  assert(calculated.netRevenue === 812020, `net revenue ${calculated.netRevenue}`)
  assert(calculated.netRevenueLabel === "₹812,020", `label ${calculated.netRevenueLabel}`)
  assert(calculated.validRows === NORTHWIND_PREVIEW.validRows, "valid rows drifted from course preview")
  assert(calculated.netRevenue === NORTHWIND_PREVIEW.netRevenue, "net revenue drifted from course preview")
  assert(calculated.topCategory === "Electronics", `top category ${calculated.topCategory}`)
  assert(calculated.topCategoryRevenue === 347072, `electronics total ${calculated.topCategoryRevenue}`)
  assert(calculated.dataset === "northwind_sales.csv", "dataset filename")
  assert(!JSON.stringify(calculated).includes("/workspace"), "result must not include filesystem paths")
  assert(!JSON.stringify(calculated).includes("public/content"), "result must not include public path")

  let invalidOp = ""
  try {
    runLabOperation("shell")
  } catch (error) {
    invalidOp = error instanceof Error ? error.message : ""
  }
  assert(invalidOp === "invalid_operation", "unknown operations must be rejected")
  assert(!isValidSalesRow({ units: "-2", unit_price: "1299", returned: "no" }), "negative units invalid")
  assert(!isValidSalesRow({ units: "1", unit_price: "0", returned: "no" }), "zero price invalid")
  assert(!isValidSalesRow({ units: "1", unit_price: "2199", returned: "yes" }), "returns invalid")

  console.log("2. HTTP: auth, enrolment, dataset, run, save, ownership")
  const anon = new Map<string, string>()
  const anonGet = await request(anon, "/labs/data-analytics/northwind")
  assert(anonGet.response.status === 401, "lab workspace requires auth")

  const jar = new Map<string, string>()
  await signup(jar, "a")
  const unenrolled = await request(jar, "/labs/data-analytics/northwind?lesson=l1")
  assert(unenrolled.response.status === 403, `unenrolled should be 403, got ${unenrolled.response.status}`)
  assert(unenrolled.data.error === "Enrolment required", "enrolment copy")

  await enrollDataAnalytics(jar)
  const workspace = await request(jar, "/labs/data-analytics/northwind?lesson=l1")
  assert(workspace.response.ok, `workspace failed: ${JSON.stringify(workspace.data)}`)
  const preview = workspace.data.data
  assert(preview.dataset.filename === "northwind_sales.csv", "workspace filename")
  assert(preview.dataset.totalRows === 180, "workspace row count")
  assert(preview.lesson?.lessonTitle === "What is Data Analytics?", "lesson context")
  assert(preview.disclaimer.includes("fictional"), "honesty copy")
  assert(!JSON.stringify(preview).includes("/workspace"), "workspace must not leak paths")
  assert(preview.operations.some((row: { id: string }) => row.id === VALID_NET_REVENUE), "operation listed")

  const before = await request(jar, "/lms/courses/data-analytics")
  assert(before.response.ok, "course workspace before lab")
  const completeBefore = before.data.data.lessonStates.l1?.complete === true

  const noCsrf = await request(jar, "/labs/data-analytics/northwind/run", {
    method: "POST",
    body: { operation: VALID_NET_REVENUE },
  })
  assert(noCsrf.response.status === 403, "run requires CSRF")

  const badOp = await request(jar, "/labs/data-analytics/northwind/run", {
    method: "POST",
    csrf: true,
    body: { operation: "rm -rf /" },
  })
  assert(badOp.response.status === 400, "invalid operation rejected")
  assert(!/rm -rf|stack|ECONN|prisma/i.test(JSON.stringify(badOp.data)), "invalid op must not leak internals")

  const malformed = await request(jar, "/labs/data-analytics/northwind/run", {
    method: "POST",
    csrf: true,
    body: { operation: VALID_NET_REVENUE, lessonKey: "L1" },
  })
  assert(malformed.response.status === 400, "malformed lesson key rejected")

  const unknownLab = await request(jar, "/labs/data-analytics/python-runtime")
  assert(unknownLab.response.status === 404, "unknown lab")

  const run = await request(jar, "/labs/data-analytics/northwind/run", {
    method: "POST",
    csrf: true,
    body: { operation: VALID_NET_REVENUE, lessonKey: "l1" },
  })
  assert(run.response.ok, `run failed: ${JSON.stringify(run.data)}`)
  assert(run.data.data.validRows === 166, "run valid rows")
  assert(run.data.data.netRevenue === 812020, "run net revenue")
  assert(run.data.data.netRevenueLabel === "₹812,020", "run label")
  assert(run.data.data.topCategory === "Electronics", "run top category")

  const fakeSave = await request(jar, "/labs/data-analytics/northwind/work", {
    method: "POST",
    csrf: true,
    body: {
      operation: VALID_NET_REVENUE,
      lessonKey: "l1",
      result: { validRows: 999, netRevenue: 1, netRevenueLabel: "₹1" },
    },
  })
  assert(fakeSave.response.status === 201, `save failed: ${JSON.stringify(fakeSave.data)}`)
  assert(fakeSave.data.data.result.validRows === 166, "save must ignore client totals")
  assert(fakeSave.data.data.result.netRevenue === 812020, "save must recalculate net revenue")
  const savedId = fakeSave.data.data.id as string

  const list = await request(jar, "/labs/data-analytics/northwind/work")
  assert(list.response.ok, "list saved work")
  assert(list.data.data.some((row: { id: string }) => row.id === savedId), "saved work listed")

  const opened = await request(jar, `/labs/data-analytics/northwind/work/${savedId}`)
  assert(opened.response.ok, "reopen saved work")
  assert(opened.data.data.result.validRows === 166, "reopened totals")

  const after = await request(jar, "/lms/courses/data-analytics")
  assert(after.data.data.lessonStates.l1?.complete === completeBefore, "lab save must not complete the lesson")
  assert(after.data.data.lessonStates.l2?.locked === true, "lab must not unlock later lessons")

  const other = new Map<string, string>()
  await signup(other, "b")
  await enrollDataAnalytics(other)
  const stolen = await request(other, `/labs/data-analytics/northwind/work/${savedId}`)
  assert(stolen.response.status === 404, "saved work is owner-scoped")

  const anonSave = await request(new Map(), "/labs/data-analytics/northwind/work", {
    method: "POST",
    csrf: true,
    body: { operation: VALID_NET_REVENUE },
  })
  assert(anonSave.response.status === 401, "unauthenticated save rejected")

  console.log("Skylent Labs tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
