import SqlParser from "node-sql-parser"
import {
  EMPTY_SQL_MESSAGE,
  EXPENSIVE_QUERY_MESSAGE,
  MAX_SQL_QUERY_CHARS,
  MAX_SQL_RESULT_ROWS,
  NORTHWIND_SQL_TABLE,
  UNSUPPORTED_SQL_MESSAGE,
} from "./limits.js"
import { NorthwindSqlError } from "./errors.js"

const { Parser } = SqlParser
const parser = new Parser()
const PARSER_OPT = { database: "Sqlite" as const }

const FORBIDDEN_LEADING = new Set([
  "INSERT",
  "UPDATE",
  "DELETE",
  "DROP",
  "ALTER",
  "CREATE",
  "TRUNCATE",
  "GRANT",
  "REVOKE",
  "COPY",
  "CALL",
  "EXEC",
  "EXECUTE",
  "ATTACH",
  "DETACH",
  "PRAGMA",
  "LOAD",
  "REPLACE",
  "VACUUM",
  "ANALYZE",
  "REINDEX",
  "MERGE",
  "EXPLAIN",
  "WITH",
  "BEGIN",
  "COMMIT",
  "ROLLBACK",
  "SAVEPOINT",
  "RELEASE",
  "USE",
  "SET",
  "SHOW",
  "DESC",
  "DESCRIBE",
  "DO",
  "DECLARE",
  "INTO",
])

const FORBIDDEN_NODE_TYPES = new Set([
  "insert",
  "replace",
  "update",
  "delete",
  "drop",
  "alter",
  "create",
  "truncate",
  "grant",
  "revoke",
  "copy",
  "call",
  "exec",
  "execute",
  "attach",
  "detach",
  "pragma",
  "load",
  "use",
  "show",
  "lock",
  "commit",
  "rollback",
  "transaction",
  "vacuum",
  "analyze",
  "reindex",
  "savepoint",
  "release",
  "set",
  "declare",
  "do",
  "merge",
  "command",
])

const ALLOWED_AGGR = new Set(["SUM", "COUNT", "AVG", "MIN", "MAX", "TOTAL"])

const ALLOWED_FUNCS = new Set([
  "abs",
  "round",
  "lower",
  "upper",
  "trim",
  "ltrim",
  "rtrim",
  "length",
  "substr",
  "substring",
  "coalesce",
  "nullif",
  "ifnull",
  "replace",
  "instr",
  "cast",
  "typeof",
  "min",
  "max",
  "nullif",
])

const ALLOWED_OPS = new Set([
  "=",
  "!=",
  "<>",
  ">",
  ">=",
  "<",
  "<=",
  "AND",
  "OR",
  "IN",
  "NOT IN",
  "IS",
  "IS NOT",
  "LIKE",
  "NOT LIKE",
  "BETWEEN",
  "NOT BETWEEN",
  "+",
  "-",
  "*",
  "/",
  "%",
  "||",
  "NOT",
])

const ALLOWED_CAST_TYPES = new Set([
  "INTEGER",
  "INT",
  "REAL",
  "NUMERIC",
  "DECIMAL",
  "FLOAT",
  "DOUBLE",
  "TEXT",
  "CHAR",
  "VARCHAR",
  "DATE",
  "DATETIME",
  "BOOLEAN",
  "BOOL",
])

function stripLeadingTrivia(sql: string): string {
  let i = 0
  const s = sql
  while (i < s.length) {
    const ch = s[i]
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i += 1
      continue
    }
    if (ch === "-" && s[i + 1] === "-") {
      while (i < s.length && s[i] !== "\n") i += 1
      continue
    }
    if (ch === "/" && s[i + 1] === "*") {
      const end = s.indexOf("*/", i + 2)
      if (end === -1) return ""
      i = end + 2
      continue
    }
    break
  }
  return s.slice(i)
}

export function leadingSqlKeyword(sql: string): string | null {
  const rest = stripLeadingTrivia(sql)
  const match = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/)
  return match ? match[0].toUpperCase() : null
}

function normalizeQuery(sql: string): string {
  return sql.replace(/;+\s*$/u, "").trim()
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function functionName(node: Record<string, unknown>): string {
  if (typeof node.name === "string") return node.name
  const wrapped = asRecord(node.name)
  const parts = wrapped?.name
  if (Array.isArray(parts)) {
    return parts
      .map((part) => {
        const row = asRecord(part)
        return typeof row?.value === "string" ? row.value : ""
      })
      .filter(Boolean)
      .join(".")
  }
  return ""
}

function tableName(node: Record<string, unknown>): string | null {
  if (typeof node.table !== "string" || !node.table) return null
  return node.table.replace(/^[`"[]|[`"\]]$/g, "")
}

function collectLimitValues(limit: unknown): number[] {
  const row = asRecord(limit)
  if (!row || !Array.isArray(row.value)) return []
  const values: number[] = []
  for (const item of row.value) {
    const cell = asRecord(item)
    if (cell && typeof cell.value === "number") values.push(cell.value)
    else if (typeof item === "number") values.push(item)
  }
  return values
}

function isAllowedCast(node: Record<string, unknown>): boolean {
  const target = node.target
  const list = Array.isArray(target) ? target : target ? [target] : []
  if (!list.length) return true
  return list.every((item) => {
    const row = asRecord(item)
    const dataType = typeof row?.dataType === "string" ? row.dataType.toUpperCase() : ""
    return ALLOWED_CAST_TYPES.has(dataType)
  })
}

function walk(node: unknown, ctx: { selectCount: number }): void {
  if (node == null) return
  if (Array.isArray(node)) {
    for (const item of node) walk(item, ctx)
    return
  }
  const row = asRecord(node)
  if (!row) return

  const type = typeof row.type === "string" ? row.type.toLowerCase() : ""

  if (type && FORBIDDEN_NODE_TYPES.has(type)) {
    throw new NorthwindSqlError("unsupported", "That statement is not allowed in Northwind SQL.")
  }

  if (type === "select") {
    ctx.selectCount += 1
    if (row.with != null) {
      throw new NorthwindSqlError("unsupported", "WITH queries are not available in Northwind SQL.")
    }
    if (typeof row.set_op === "string" && row.set_op) {
      throw new NorthwindSqlError("unsupported", "UNION and set operators are not available in Northwind SQL.")
    }
    if (row._next) {
      throw new NorthwindSqlError("unsupported", "UNION and set operators are not available in Northwind SQL.")
    }
    if (row.window) {
      throw new NorthwindSqlError("unsupported", "Window functions are not available in Northwind SQL.")
    }
    if (row.for_update) {
      throw new NorthwindSqlError("unsupported", UNSUPPORTED_SQL_MESSAGE)
    }
    if (row.into) {
      throw new NorthwindSqlError("unsupported", "That statement is not allowed in Northwind SQL.")
    }

    const from = row.from
    if (from == null) {
      throw new NorthwindSqlError("unsupported", "Northwind SQL queries must SELECT FROM northwind_sales.")
    }
    const fromList = Array.isArray(from) ? from : [from]
    if (fromList.length !== 1) {
      throw new NorthwindSqlError("unsupported", "Joins are not available in Northwind SQL.")
    }
    const fromRow = asRecord(fromList[0])
    if (!fromRow) {
      throw new NorthwindSqlError("unsupported", UNSUPPORTED_SQL_MESSAGE)
    }
    if (fromRow.join || fromRow.type === "dual") {
      throw new NorthwindSqlError("unsupported", "Joins are not available in Northwind SQL.")
    }
    if (fromRow.db) {
      throw new NorthwindSqlError("unsupported", "This lab only queries northwind_sales.")
    }
    const table = tableName(fromRow)
    const derived = asRecord(fromRow.expr)?.ast
    if (table) {
      if (table.toLowerCase() !== NORTHWIND_SQL_TABLE) {
        throw new NorthwindSqlError("unsupported", "This lab only queries northwind_sales.")
      }
    } else if (!derived) {
      throw new NorthwindSqlError("unsupported", "Northwind SQL queries must SELECT FROM northwind_sales.")
    }

    const limits = collectLimitValues(row.limit)
    if (limits.some((value) => value > MAX_SQL_RESULT_ROWS)) {
      throw new NorthwindSqlError("expensive", EXPENSIVE_QUERY_MESSAGE)
    }
  }

  if (type === "function" || type === "aggr_func") {
    const name = functionName(row)
    const upper = name.toUpperCase()
    const lower = name.toLowerCase()
    if (name.includes(".") || name.includes("::")) {
      throw new NorthwindSqlError("unsupported", "That function is not available in Northwind SQL.")
    }
    const allowed = type === "aggr_func" ? ALLOWED_AGGR.has(upper) : ALLOWED_FUNCS.has(lower) || ALLOWED_AGGR.has(upper)
    if (!allowed) {
      throw new NorthwindSqlError("unsupported", "That function is not available in Northwind SQL.")
    }
    if (row.over != null) {
      throw new NorthwindSqlError("unsupported", "Window functions are not available in Northwind SQL.")
    }
  }

  if (type === "cast" && !isAllowedCast(row)) {
    throw new NorthwindSqlError("unsupported", "That type conversion is not available in Northwind SQL.")
  }

  if (typeof row.operator === "string") {
    const op = row.operator.toUpperCase()
    const allowed = ALLOWED_OPS.has(row.operator) || ALLOWED_OPS.has(op)
    if (!allowed) {
      throw new NorthwindSqlError("unsupported", UNSUPPORTED_SQL_MESSAGE)
    }
  }

  if (typeof row.table === "string" && row.table) {
    const table = tableName(row)
    if (table && table.toLowerCase() !== NORTHWIND_SQL_TABLE) {
      const looksPhysical =
        table.toLowerCase().startsWith("sqlite_") ||
        table.includes(".") ||
        table.includes("/") ||
        table.includes("\\")
      if (looksPhysical) {
        throw new NorthwindSqlError("unsupported", "This lab only queries northwind_sales.")
      }
    }
  }

  if (typeof row.db === "string" && row.db) {
    throw new NorthwindSqlError("unsupported", "This lab only queries northwind_sales.")
  }

  for (const [key, value] of Object.entries(row)) {
    if (key === "loc") continue
    walk(value, ctx)
  }
}

function assertOnlyNorthwindTables(node: unknown): void {
  const tables: string[] = []

  function visit(value: unknown): void {
    if (value == null) return
    if (Array.isArray(value)) {
      for (const item of value) visit(item)
      return
    }
    const row = asRecord(value)
    if (!row) return
    if (typeof row.table === "string" && row.table && row.type !== "column_ref") {
      const fromRow = row
      const derived = asRecord(fromRow.expr)?.ast
      if (!derived) {
        const table = tableName(fromRow)
        if (table) tables.push(table.toLowerCase())
      }
    }
    for (const [key, nested] of Object.entries(row)) {
      if (key === "loc") continue
      visit(nested)
    }
  }

  visit(node)
  if (!tables.length) {
    throw new NorthwindSqlError("unsupported", "Northwind SQL queries must SELECT FROM northwind_sales.")
  }
  for (const table of tables) {
    if (table !== NORTHWIND_SQL_TABLE) {
      throw new NorthwindSqlError("unsupported", "This lab only queries northwind_sales.")
    }
  }
}

export function validateNorthwindSql(input: string): string {
  if (typeof input !== "string") {
    throw new NorthwindSqlError("invalid", EMPTY_SQL_MESSAGE)
  }
  if (input.length > MAX_SQL_QUERY_CHARS) {
    throw new NorthwindSqlError("expensive", EXPENSIVE_QUERY_MESSAGE)
  }
  const sql = normalizeQuery(input)
  if (!sql) {
    throw new NorthwindSqlError("invalid", EMPTY_SQL_MESSAGE)
  }

  const keyword = leadingSqlKeyword(sql)
  if (!keyword) {
    throw new NorthwindSqlError("invalid", EMPTY_SQL_MESSAGE)
  }
  if (keyword !== "SELECT") {
    if (FORBIDDEN_LEADING.has(keyword)) {
      throw new NorthwindSqlError("unsupported", "That statement is not allowed in Northwind SQL.")
    }
    throw new NorthwindSqlError("unsupported", UNSUPPORTED_SQL_MESSAGE)
  }

  let ast: unknown
  try {
    ast = parser.astify(sql, PARSER_OPT)
  } catch {
    throw new NorthwindSqlError("unsupported", UNSUPPORTED_SQL_MESSAGE)
  }

  if (Array.isArray(ast)) {
    if (ast.length !== 1) {
      throw new NorthwindSqlError("unsupported", "Run one SELECT statement at a time.")
    }
    ast = ast[0]
  }

  const root = asRecord(ast)
  if (!root || root.type !== "select") {
    throw new NorthwindSqlError("unsupported", "That statement is not allowed in Northwind SQL.")
  }

  const ctx = { selectCount: 0 }
  walk(ast, ctx)
  assertOnlyNorthwindTables(ast)
  if (ctx.selectCount < 1) {
    throw new NorthwindSqlError("unsupported", UNSUPPORTED_SQL_MESSAGE)
  }

  return sql
}
