import { EXPENSIVE_QUERY_MESSAGE, UNSUPPORTED_SQL_MESSAGE } from "./limits.js"

export class NorthwindSqlError extends Error {
  constructor(
    readonly code: "invalid" | "unsupported" | "expensive" | "query",
    message: string,
  ) {
    super(message)
    this.name = "NorthwindSqlError"
  }
}

function tidyIdent(value: string): string {
  return value.replace(/[`"'\\]/g, "").slice(0, 64)
}

export function learnerSqlMessage(error: unknown): { code: NorthwindSqlError["code"]; message: string } {
  if (error instanceof NorthwindSqlError) {
    return { code: error.code, message: error.message }
  }

  const raw = error instanceof Error ? error.message : ""
  const lowered = raw.toLowerCase()

  if (
    /too large|too expensive|timeout|interrupted|out of memory|no more room|database or disk is full|heap/i.test(
      raw,
    )
  ) {
    return { code: "expensive", message: EXPENSIVE_QUERY_MESSAGE }
  }

  const missingCol = raw.match(/no such column:\s*([^\s(]+)/i)
  if (missingCol?.[1]) {
    return { code: "query", message: `Check the column name \`${tidyIdent(missingCol[1])}\`.` }
  }

  if (/no such table/i.test(raw)) {
    return { code: "query", message: "This lab only queries northwind_sales." }
  }

  if (/misuse of aggregate|aggregate function/i.test(raw)) {
    return { code: "query", message: "That aggregation is not valid in this query." }
  }

  if (/readonly|attempt to write/i.test(raw)) {
    return { code: "unsupported", message: "Northwind SQL is read-only." }
  }

  if (/parser|syntax|expected |incomplete input|unrecognized/i.test(lowered)) {
    return { code: "unsupported", message: UNSUPPORTED_SQL_MESSAGE }
  }

  return { code: "query", message: "That query could not be run. Check the SQL and column names." }
}
