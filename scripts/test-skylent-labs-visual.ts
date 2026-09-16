import "dotenv/config"
import { NORTHWIND_SQL_EXAMPLES } from "../server/src/lib/skylent-labs/sql/examples.ts"
import { buildLabChart, MAX_CHART_ROWS } from "../server/src/lib/skylent-labs/sql/chart.ts"
import { runNorthwindSql } from "../server/src/lib/skylent-labs/sql/engine.ts"
import { SQL_OPERATION, VALID_NET_REVENUE } from "../server/src/lib/skylent-labs/catalog.ts"

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
  const email = `labs-visual-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`
  await request(jar, "/auth/csrf")
  const signupResult = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName: `Labs Visual ${label}`, email, password: "test-password-123" },
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

async function main() {
  console.log("1. Chart adapter")
  const category = buildLabChart(
    ["category", "net_revenue"],
    [
      ["Electronics", 347072],
      ["Apparel", 179739],
      ["Home", 155457],
      ["Grocery", 129752],
    ],
  )
  assert(category.chartable, "category + numeric should be chartable")
  assert(category.type === "bar", `expected bar, got ${category.type}`)
  assert(category.labelKey === "category", "labelKey")
  assert(category.yKey === "net_revenue", "yKey")
  assert(category.highestLabel === "Electronics", "highest")
  assert(category.highestFormatted === "₹347,072", category.highestFormatted)
  assert(category.series[0]?.y === 347072, "series derived from rows, not hardcoded")
  assert(category.axisMax === 350000, `axisMax ${category.axisMax}`)

  const labeled = buildLabChart(
    ["channel", "units"],
    [
      ["store", 12],
      ["online", 9],
    ],
  )
  assert(labeled.chartable && labeled.type === "bar", "label + numeric")

  const monthly = buildLabChart(
    ["month", "net_revenue"],
    [
      ["2026-01", 117967],
      ["2026-02", 162726],
      ["2026-03", 188525],
    ],
  )
  assert(monthly.chartable && monthly.type === "line", "month + numeric → line")

  const dated = buildLabChart(
    ["order_date", "revenue"],
    [
      ["2026-01-05", 2199],
      ["2026-01-06", 449],
      ["2026-02-01", 1299],
    ],
  )
  assert(dated.chartable && dated.type === "line", "date + numeric → line")

  const scatter = buildLabChart(
    ["units", "net_revenue"],
    [
      [1, 2199],
      [5, 7495],
      [3, 3900],
    ],
  )
  assert(scatter.chartable && scatter.type === "scatter", "two numeric → scatter")

  assert(!buildLabChart(["units", "revenue"], []).chartable, "empty result")
  assert(!buildLabChart(["valid_rows"], [[166]]).chartable, "single aggregate")
  assert(!buildLabChart(["category", "net_revenue"], [["Electronics", 347072]]).chartable, "one row")
  assert(
    !buildLabChart(
      ["category", "net_revenue"],
      Array.from({ length: MAX_CHART_ROWS + 1 }, (_, i) => [`c${i}`, i + 1]),
    ).chartable,
    "too many rows",
  )
  assert(!buildLabChart(["category", "note"], [["Home", "ok"], ["Apparel", "no"]]).chartable, "non-numeric")
  assert(!buildLabChart(["category", "rows", "net_revenue"], [["Home", 1, 10], ["Apparel", 2, 20]]).chartable, "three columns")
  assert(!buildLabChart(["category", "net_revenue"], null as unknown as never).chartable, "malformed")
  assert(!buildLabChart(["a", "b"], [["x", "y"], ["1", "2"]]).chartable, "mixed non-numeric")

  console.log("2. Live SQL examples produce matching charts")
  const validRows = await runNorthwindSql(NORTHWIND_SQL_EXAMPLES[0].sql)
  assert(!validRows.chart.chartable, "valid rows count is not chartable")

  const revenue = await runNorthwindSql(NORTHWIND_SQL_EXAMPLES[1].sql)
  assert(revenue.chart.chartable, "revenue by category is chartable")
  if (!revenue.chart.chartable) return
  assert(revenue.chart.type === "bar", "category chart is a bar")
  assert(revenue.chart.series[0]?.label === "Electronics", "electronics first")
  assert(revenue.chart.series[0]?.y === 347072, `electronics ${revenue.chart.series[0]?.y}`)
  assert(revenue.chart.series.map((row) => row.y).join(",") === "347072,179739,155457,129752", "chart series matches query rows")

  const months = await runNorthwindSql(NORTHWIND_SQL_EXAMPLES[2].sql)
  assert(months.chart.chartable && months.chart.type === "line", "monthly example is a line")
  assert(months.chart.series.length >= 2, "monthly series")
  assert(months.chart.series.every((point, index) => point.y === Number(months.rows[index]?.[1])), "monthly chart uses query values")

  console.log("3. HTTP: chart is server-authored, save/reopen, ownership, progress")
  const jar = new Map<string, string>()
  await signup(jar, "a")
  await enrollDataAnalytics(jar)

  const before = await request(jar, "/lms/courses/data-analytics")
  const completeBefore = before.data.data.lessonStates.l1?.complete === true

  const blocked = await request(jar, "/labs/data-analytics/northwind/sql/run", {
    method: "POST",
    csrf: true,
    body: { query: "INSERT INTO northwind_sales VALUES (1)", chart: { type: "bar" } },
  })
  assert(blocked.response.status === 400, "chart payload cannot bypass SQL validation")

  const run = await request(jar, "/labs/data-analytics/northwind/sql/run", {
    method: "POST",
    csrf: true,
    body: { query: NORTHWIND_SQL_EXAMPLES[1].sql, lessonKey: "l1" },
  })
  assert(run.response.ok, `run failed ${JSON.stringify(run.data)}`)
  assert(run.data.data.chart.chartable === true, "HTTP chartable")
  assert(run.data.data.chart.type === "bar", "HTTP bar")
  assert(run.data.data.chart.series[0].y === 347072, "HTTP series from SQL")

  const save = await request(jar, "/labs/data-analytics/northwind/work", {
    method: "POST",
    csrf: true,
    body: {
      operation: SQL_OPERATION,
      lessonKey: "l1",
      query: NORTHWIND_SQL_EXAMPLES[1].sql,
      chart: { type: "scatter", xKey: "hack", yKey: "hack", series: [{ label: "Fake", y: 1 }] },
      result: { rows: [["Fake", 1]] },
    },
  })
  assert(save.response.status === 201, `save failed ${JSON.stringify(save.data)}`)
  assert(save.data.data.result.chart.type === "bar", "client chart type ignored")
  assert(save.data.data.result.chart.series[0].y === 347072, "client series ignored")
  const savedId = save.data.data.id as string

  const opened = await request(jar, `/labs/data-analytics/northwind/work/${savedId}`)
  assert(opened.response.ok, "reopen")
  assert(opened.data.data.result.chart.chartable === true, "reopened chart regenerated")
  assert(opened.data.data.result.chart.type === "bar", "reopened type from query")
  assert(opened.data.data.result.chart.series[0].y === 347072, "reopened series from rerun")

  const after = await request(jar, "/lms/courses/data-analytics")
  assert(after.data.data.lessonStates.l1?.complete === completeBefore, "visual lab must not complete the lesson")
  assert(after.data.data.lessonStates.l2?.locked === true, "visual lab must not unlock later lessons")

  const guided = await request(jar, "/labs/data-analytics/northwind/run", {
    method: "POST",
    csrf: true,
    body: { operation: VALID_NET_REVENUE },
  })
  assert(guided.data.data.netRevenue === 812020, "guided analysis still works")

  const other = new Map<string, string>()
  await signup(other, "b")
  await enrollDataAnalytics(other)
  const stolen = await request(other, `/labs/data-analytics/northwind/work/${savedId}`)
  assert(stolen.response.status === 404, "visual saved work is owner-scoped")

  console.log("Skylent Labs visual tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
