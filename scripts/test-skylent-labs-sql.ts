import "dotenv/config"
import { NORTHWIND_PREVIEW } from "../src/lib/northwind-preview.ts"
import { SQL_OPERATION, VALID_NET_REVENUE } from "../server/src/lib/skylent-labs/catalog.ts"
import { loadSalesRows } from "../server/src/lib/skylent-labs/dataset.ts"
import { calculateValidNetRevenue, isValidSalesRow, mapCategory, rowNetRevenue } from "../server/src/lib/skylent-labs/engine.ts"
import { NORTHWIND_SQL_EXAMPLES } from "../server/src/lib/skylent-labs/sql/examples.ts"
import { EXPENSIVE_QUERY_MESSAGE, MAX_SQL_QUERY_CHARS } from "../server/src/lib/skylent-labs/sql/limits.ts"
import { validateNorthwindSql } from "../server/src/lib/skylent-labs/sql/validate.ts"
import { runNorthwindSql } from "../server/src/lib/skylent-labs/sql/engine.ts"
import { NorthwindSqlError } from "../server/src/lib/skylent-labs/sql/errors.ts"

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
  const email = `labs-sql-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`
  await request(jar, "/auth/csrf")
  const signupResult = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName: `Labs SQL ${label}`, email, password: "test-password-123" },
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

function expectRejected(sql: string, label: string) {
  let failed = false
  try {
    validateNorthwindSql(sql)
  } catch (error) {
    failed = error instanceof NorthwindSqlError
    assert(failed, `${label} should raise NorthwindSqlError, got ${String(error)}`)
    const message = error instanceof Error ? error.message : ""
    assert(!/prisma|postgres|\/workspace|stack|ECONN|sql\.js|wasm/i.test(message), `${label} leaked internals`)
  }
  assert(failed, `${label} should be rejected: ${sql}`)
}

async function main() {
  console.log("1. Validator rejects unsafe and unsupported SQL")
  const blocked = [
    ["INSERT INTO northwind_sales VALUES (1)", "INSERT"],
    ["UPDATE northwind_sales SET units = 0", "UPDATE"],
    ["DELETE FROM northwind_sales", "DELETE"],
    ["DROP TABLE northwind_sales", "DROP"],
    ["ALTER TABLE northwind_sales ADD COLUMN x INT", "ALTER"],
    ["CREATE TABLE x (a int)", "CREATE"],
    ["TRUNCATE TABLE northwind_sales", "TRUNCATE"],
    ["COPY northwind_sales TO '/tmp/out.csv'", "COPY"],
    ["PRAGMA table_info(northwind_sales)", "PRAGMA"],
    ["ATTACH DATABASE ':memory:' AS other", "ATTACH"],
    ["DETACH DATABASE other", "DETACH"],
    ["GRANT SELECT ON northwind_sales TO public", "GRANT"],
    ["REVOKE SELECT ON northwind_sales FROM public", "REVOKE"],
    ["SELECT load_extension('x')", "load_extension"],
    ["SELECT sqlite_version()", "sqlite_version"],
    ["SELECT * FROM sqlite_master", "sqlite_master"],
    ["SELECT * FROM sqlite_schema", "sqlite_schema"],
    ["SELECT * FROM users", "users table"],
    ["SELECT * FROM pg_catalog.pg_tables", "pg_catalog"],
    ["SELECT * FROM northwind_sales; DROP TABLE northwind_sales", "multi-statement"],
    ["SELECT * FROM northwind_sales a JOIN northwind_sales b ON a.order_id = b.order_id", "JOIN"],
    ["SELECT * FROM northwind_sales a, northwind_sales b", "cartesian"],
    ["WITH x AS (SELECT * FROM northwind_sales) SELECT * FROM x", "WITH"],
    ["SELECT * FROM northwind_sales UNION SELECT * FROM northwind_sales", "UNION"],
    ["SELECT COUNT(*) OVER (PARTITION BY category) FROM northwind_sales", "window"],
    ["SELECT readfile('/etc/passwd')", "readfile"],
    ["SELECT writefile('/tmp/x', 'x')", "writefile"],
    ["SELECT * FROM '/etc/passwd'", "filesystem table"],
    ["", "empty"],
    ["   \n\t  ", "whitespace"],
    ["not sql at all", "malformed"],
    ["SELECT * FROM northwind_sales LIMIT 1000000", "giant LIMIT"],
  ] as const

  for (const [sql, label] of blocked) {
    expectRejected(sql, label)
  }

  const giant = `SELECT * FROM northwind_sales WHERE category = '${"x".repeat(MAX_SQL_QUERY_CHARS)}'`
  expectRejected(giant, "giant query")

  validateNorthwindSql("SELECT * FROM northwind_sales WHERE product = 'DROP TABLE x'")

  console.log("2. Engine calculates from the actual dataset")
  const { rows } = loadSalesRows()
  const valid = rows.filter(isValidSalesRow)
  const jsNet = Math.round(valid.reduce((sum, row) => sum + rowNetRevenue(row), 0))
  const guided = calculateValidNetRevenue()

  const rowCount = await runNorthwindSql("SELECT COUNT(*) AS n FROM northwind_sales")
  assert(Number(rowCount.rows[0]?.[0]) === 180, `row count ${rowCount.rows[0]?.[0]}`)
  assert(Number(rowCount.rows[0]?.[0]) === rows.length, "SQL row count must match CSV loader")

  const validCount = await runNorthwindSql(
    "SELECT COUNT(*) AS valid_rows FROM northwind_sales WHERE units > 0 AND unit_price > 0 AND returned = 'no'",
  )
  assert(Number(validCount.rows[0]?.[0]) === 166, `valid rows ${validCount.rows[0]?.[0]}`)
  assert(Number(validCount.rows[0]?.[0]) === valid.length, "SQL valid rows must match engine")
  assert(Number(validCount.rows[0]?.[0]) === NORTHWIND_PREVIEW.validRows, "valid rows drifted from course preview")

  const returnedNo = await runNorthwindSql("SELECT COUNT(*) AS n FROM northwind_sales WHERE returned = 'no'")
  const returnedYes = await runNorthwindSql("SELECT COUNT(*) AS n FROM northwind_sales WHERE returned = 'yes'")
  assert(Number(returnedNo.rows[0]?.[0]) + Number(returnedYes.rows[0]?.[0]) === 180, "returned filter partitions the file")
  assert(Number(returnedNo.rows[0]?.[0]) > Number(validCount.rows[0]?.[0]), "returned = no is broader than the valid-row rule")

  const net = await runNorthwindSql(`SELECT ROUND(SUM(units * unit_price * (1 - discount_pct / 100.0))) AS net_revenue
FROM northwind_sales
WHERE units > 0 AND unit_price > 0 AND returned = 'no'`)
  assert(Number(net.rows[0]?.[0]) === 812020, `net revenue ${net.rows[0]?.[0]}`)
  assert(Number(net.rows[0]?.[0]) === jsNet, "SQL net revenue must match JS calculation")
  assert(Number(net.rows[0]?.[0]) === guided.netRevenue, "SQL net revenue must match guided analysis")

  const byCategory = await runNorthwindSql(NORTHWIND_SQL_EXAMPLES[1].sql)
  const expectedCategories = new Map<string, number>()
  for (const row of valid) {
    const name = mapCategory(row.category ?? "").mapped
    expectedCategories.set(name, (expectedCategories.get(name) ?? 0) + rowNetRevenue(row))
  }
  const expectedSorted = [...expectedCategories.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
  assert(byCategory.rows.length === expectedSorted.length, "category row count")
  for (let i = 0; i < expectedSorted.length; i += 1) {
    assert(byCategory.rows[i]?.[0] === expectedSorted[i]?.name, `category name ${String(byCategory.rows[i]?.[0])}`)
    assert(Number(byCategory.rows[i]?.[1]) === expectedSorted[i]?.value, `category ${expectedSorted[i]?.name} ${String(byCategory.rows[i]?.[1])}`)
  }
  assert(byCategory.rows[0]?.[0] === "Electronics" && Number(byCategory.rows[0]?.[1]) === 347072, "Electronics")
  assert(byCategory.rows[1]?.[0] === "Apparel" && Number(byCategory.rows[1]?.[1]) === 179739, "Apparel")
  assert(byCategory.rows[2]?.[0] === "Home" && Number(byCategory.rows[2]?.[1]) === 155457, "Home")
  assert(byCategory.rows[3]?.[0] === "Grocery" && Number(byCategory.rows[3]?.[1]) === 129752, "Grocery")

  const monthly = await runNorthwindSql(NORTHWIND_SQL_EXAMPLES[2].sql)
  const expectedMonths = new Map<string, number>()
  for (const row of valid) {
    const month = (row.order_date ?? "").slice(0, 7)
    expectedMonths.set(month, (expectedMonths.get(month) ?? 0) + rowNetRevenue(row))
  }
  const monthRows = [...expectedMonths.entries()].sort(([a], [b]) => a.localeCompare(b))
  assert(monthly.rows.length === monthRows.length, "month row count")
  for (let i = 0; i < monthRows.length; i += 1) {
    assert(monthly.rows[i]?.[0] === monthRows[i]?.[0], `month ${String(monthly.rows[i]?.[0])}`)
    assert(Number(monthly.rows[i]?.[1]) === Math.round(monthRows[i]?.[1] ?? 0), `month total ${String(monthly.rows[i]?.[0])}`)
  }

  const exampleValid = await runNorthwindSql(NORTHWIND_SQL_EXAMPLES[0].sql)
  assert(Number(exampleValid.rows[0]?.[0]) === 166, "example 1 valid rows")

  let unknownCol = ""
  try {
    await runNorthwindSql("SELECT unit_prize FROM northwind_sales")
  } catch (error) {
    unknownCol = error instanceof Error ? error.message : ""
  }
  assert(unknownCol.includes("unit_prize"), `unknown column message: ${unknownCol}`)
  assert(!/no such column|sqlite|\/workspace/i.test(unknownCol), "unknown column must be learner-facing")

  let expensive = ""
  try {
    await runNorthwindSql("SELECT * FROM northwind_sales LIMIT 9999")
  } catch (error) {
    expensive = error instanceof Error ? error.message : ""
  }
  assert(expensive === EXPENSIVE_QUERY_MESSAGE, `expensive message ${expensive}`)

  let invalidAgg = ""
  try {
    await runNorthwindSql("SELECT COUNT(SUM(units)) FROM northwind_sales")
  } catch (error) {
    invalidAgg = error instanceof Error ? error.message : ""
  }
  assert(invalidAgg.length > 0, "invalid aggregation must fail")
  assert(!/stack|sqlite|Error:/i.test(invalidAgg), "invalid aggregation must not leak internals")

  console.log("3. HTTP: auth, CSRF, SQL run, save, ownership, progress unchanged")
  const anon = new Map<string, string>()
  const anonRun = await request(anon, "/labs/data-analytics/northwind/sql/run", {
    method: "POST",
    csrf: true,
    body: { query: "SELECT COUNT(*) FROM northwind_sales" },
  })
  assert(anonRun.response.status === 401, "SQL run requires auth")

  const jar = new Map<string, string>()
  await signup(jar, "a")
  await enrollDataAnalytics(jar)

  const workspace = await request(jar, "/labs/data-analytics/northwind?lesson=l1")
  assert(workspace.response.ok, `workspace failed: ${JSON.stringify(workspace.data)}`)
  assert(workspace.data.data.sql.dialect === "Northwind SQL", "dialect")
  assert(workspace.data.data.sql.table === "northwind_sales", "table")
  assert(workspace.data.data.operations.some((row: { id: string }) => row.id === VALID_NET_REVENUE), "guided operation remains")

  const before = await request(jar, "/lms/courses/data-analytics")
  const completeBefore = before.data.data.lessonStates.l1?.complete === true

  const noCsrf = await request(jar, "/labs/data-analytics/northwind/sql/run", {
    method: "POST",
    body: { query: "SELECT COUNT(*) FROM northwind_sales" },
  })
  assert(noCsrf.response.status === 403, "SQL run requires CSRF")

  const blockedHttp = await request(jar, "/labs/data-analytics/northwind/sql/run", {
    method: "POST",
    csrf: true,
    body: { query: "INSERT INTO northwind_sales VALUES (1)" },
  })
  assert(blockedHttp.response.status === 400, "HTTP INSERT rejected")
  assert(!/prisma|postgres|\/workspace|sql\.js/i.test(JSON.stringify(blockedHttp.data)), "HTTP reject must not leak internals")

  const run = await request(jar, "/labs/data-analytics/northwind/sql/run", {
    method: "POST",
    csrf: true,
    body: {
      query: NORTHWIND_SQL_EXAMPLES[0].sql,
      lessonKey: "l1",
    },
  })
  assert(run.response.ok, `SQL run failed: ${JSON.stringify(run.data)}`)
  assert(Number(run.data.data.rows[0][0]) === 166, "HTTP valid rows")
  assert(run.data.data.operation === SQL_OPERATION, "SQL operation id")

  const fakeSave = await request(jar, "/labs/data-analytics/northwind/work", {
    method: "POST",
    csrf: true,
    body: {
      operation: SQL_OPERATION,
      lessonKey: "l1",
      query: NORTHWIND_SQL_EXAMPLES[0].sql,
      result: { rows: [[999]] },
    },
  })
  assert(fakeSave.response.status === 201, `SQL save failed: ${JSON.stringify(fakeSave.data)}`)
  assert(Number(fakeSave.data.data.result.rows[0][0]) === 166, "save must ignore client SQL rows")
  const savedId = fakeSave.data.data.id as string

  const opened = await request(jar, `/labs/data-analytics/northwind/work/${savedId}`)
  assert(opened.response.ok, "reopen SQL work")
  assert(opened.data.data.query.includes("northwind_sales"), "reopened query")
  assert(Number(opened.data.data.result.rows[0][0]) === 166, "reopened SQL result recomputed")

  const after = await request(jar, "/lms/courses/data-analytics")
  assert(after.data.data.lessonStates.l1?.complete === completeBefore, "SQL lab must not complete the lesson")
  assert(after.data.data.lessonStates.l2?.locked === true, "SQL lab must not unlock later lessons")

  const guidedStillWorks = await request(jar, "/labs/data-analytics/northwind/run", {
    method: "POST",
    csrf: true,
    body: { operation: VALID_NET_REVENUE },
  })
  assert(guidedStillWorks.response.ok, "guided analysis still works")
  assert(guidedStillWorks.data.data.validRows === 166, "guided valid rows")
  assert(guidedStillWorks.data.data.netRevenue === 812020, "guided net revenue")

  const other = new Map<string, string>()
  await signup(other, "b")
  await enrollDataAnalytics(other)
  const stolen = await request(other, `/labs/data-analytics/northwind/work/${savedId}`)
  assert(stolen.response.status === 404, "SQL saved work is owner-scoped")

  console.log("Skylent Labs SQL tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
