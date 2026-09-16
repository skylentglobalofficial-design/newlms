import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import initSqlJs from "sql.js"
import { NORTHWIND_SALES_FILE } from "../catalog.js"
import { inferColumnType, loadSalesRows } from "../dataset.js"
import { EXPENSIVE_QUERY_MESSAGE, MAX_SQL_RESULT_COLS, MAX_SQL_RESULT_ROWS, MAX_SQL_STORED_PREVIEW_ROWS, NORTHWIND_SQL_DIALECT, NORTHWIND_SQL_TABLE, SQL_HEAP_LIMIT_BYTES, SQL_OPERATION, SQL_TIMEOUT_MS } from "./limits.js"
import { learnerSqlMessage, NorthwindSqlError } from "./errors.js"
import { validateNorthwindSql } from "./validate.js"
import { buildLabChart } from "./chart.js"
import type { LabSqlRunResult, LabSqlStoredPreview } from "../types.js"

type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>
type Database = InstanceType<SqlJsStatic["Database"]>
type SqlValue = number | string | Uint8Array | null

const require = createRequire(import.meta.url)

let sqlJsPromise: Promise<SqlJsStatic> | null = null
let seedBytes: Uint8Array | null = null

function loadSqlJs() {
  if (!sqlJsPromise) {
    const wasmDir = dirname(require.resolve("sql.js"))
    sqlJsPromise = initSqlJs({
      locateFile(file: string) {
        return join(wasmDir, file)
      },
    })
  }
  return sqlJsPromise
}

function sqliteType(type: "text" | "number" | "date"): "TEXT" | "REAL" {
  return type === "number" ? "REAL" : "TEXT"
}

function cellValue(raw: string, type: "text" | "number" | "date"): SqlValue {
  if (raw === "") return null
  if (type === "number") {
    const n = Number(raw)
    return Number.isFinite(n) ? n : raw
  }
  return raw
}

async function getSeed(): Promise<Uint8Array> {
  if (seedBytes) return seedBytes
  const SQL = await loadSqlJs()
  const { headers, rows } = loadSalesRows()
  const types = headers.map((name) => inferColumnType(rows.map((row) => row[name] ?? "")))
  const db = new SQL.Database()
  try {
    const columnSql = headers
      .map((name, index) => `"${name.replace(/"/g, '""')}" ${sqliteType(types[index] ?? "text")}`)
      .join(", ")
    db.run(`CREATE TABLE ${NORTHWIND_SQL_TABLE} (${columnSql})`)
    const placeholders = headers.map(() => "?").join(", ")
    const insert = db.prepare(`INSERT INTO ${NORTHWIND_SQL_TABLE} VALUES (${placeholders})`)
    for (const row of rows) {
      insert.run(headers.map((name, index) => cellValue(row[name] ?? "", types[index] ?? "text")))
    }
    insert.free()
    seedBytes = db.export()
    return seedBytes
  } finally {
    db.close()
  }
}

function applyReadOnlyGuards(db: Database) {
  db.run("PRAGMA query_only = ON")
  try {
    db.run(`PRAGMA hard_heap_limit = ${SQL_HEAP_LIMIT_BYTES}`)
  } catch {
    // sql.js builds may omit this pragma.
  }
}

function serializeValue(value: SqlValue): string | number | null {
  if (value == null) return null
  if (value instanceof Uint8Array) {
    throw new NorthwindSqlError("unsupported", "Binary results are not available in Northwind SQL.")
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null
    return value
  }
  return String(value)
}

function expensive(): never {
  throw new NorthwindSqlError("expensive", EXPENSIVE_QUERY_MESSAGE)
}

function runOnDatabase(db: Database, sql: string): Pick<LabSqlRunResult, "columns" | "rows" | "rowCount" | "truncated" | "durationMs"> {
  applyReadOnlyGuards(db)
  const started = Date.now()
  let stmt: ReturnType<Database["prepare"]> | null = null
  try {
    stmt = db.prepare(sql)
    const columns = stmt.getColumnNames()
    if (columns.length > MAX_SQL_RESULT_COLS) expensive()
    const rows: Array<Array<string | number | null>> = []
    let truncated = false
    while (stmt.step()) {
      if (Date.now() - started > SQL_TIMEOUT_MS) expensive()
      if (rows.length >= MAX_SQL_RESULT_ROWS) {
        truncated = true
        break
      }
      rows.push(stmt.get().map(serializeValue))
    }
    return {
      columns,
      rows,
      rowCount: rows.length,
      truncated,
      durationMs: Date.now() - started,
    }
  } catch (error) {
    if (error instanceof NorthwindSqlError) throw error
    const mapped = learnerSqlMessage(error)
    throw new NorthwindSqlError(mapped.code, mapped.message)
  } finally {
    stmt?.free()
  }
}

export function sqlPreview(result: { columns: string[]; rows: Array<Array<string | number | null>> }): LabSqlStoredPreview {
  return {
    columns: result.columns,
    rows: result.rows.slice(0, MAX_SQL_STORED_PREVIEW_ROWS),
    previewRowCount: Math.min(result.rows.length, MAX_SQL_STORED_PREVIEW_ROWS),
  }
}

export async function runNorthwindSql(input: string): Promise<LabSqlRunResult> {
  const sql = validateNorthwindSql(input)
  const SQL = await loadSqlJs()
  const seed = await getSeed()
  const db = new SQL.Database(new Uint8Array(seed))
  try {
    const executed = runOnDatabase(db, sql)
    return {
      operation: SQL_OPERATION,
      operationLabel: NORTHWIND_SQL_DIALECT,
      dataset: NORTHWIND_SALES_FILE,
      dialect: NORTHWIND_SQL_DIALECT,
      table: NORTHWIND_SQL_TABLE,
      query: sql,
      ...executed,
      chart: buildLabChart(executed.columns, executed.rows),
    }
  } finally {
    db.close()
  }
}

export function northwindSqlSchema() {
  const { headers, rows } = loadSalesRows()
  return {
    dialect: NORTHWIND_SQL_DIALECT,
    table: NORTHWIND_SQL_TABLE,
    columns: headers.map((name) => ({
      name,
      type: inferColumnType(rows.map((row) => row[name] ?? "")),
    })),
  }
}
