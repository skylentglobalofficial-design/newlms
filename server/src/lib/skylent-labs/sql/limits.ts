export const NORTHWIND_SQL_TABLE = "northwind_sales"
export const NORTHWIND_SQL_DIALECT = "Northwind SQL"
export const SQL_OPERATION = "sql" as const

export const MAX_SQL_QUERY_CHARS = 10_000
export const MAX_SQL_RESULT_ROWS = 500
export const MAX_SQL_RESULT_COLS = 24
export const SQL_TIMEOUT_MS = 4_000
export const SQL_HEAP_LIMIT_BYTES = 16 * 1024 * 1024
export const MAX_SQL_STORED_PREVIEW_ROWS = 12

export const EXPENSIVE_QUERY_MESSAGE =
  "That query is too large or expensive to run. Try a smaller query."

export const UNSUPPORTED_SQL_MESSAGE =
  "This Northwind SQL query is not supported. Use a SELECT against northwind_sales."

export const EMPTY_SQL_MESSAGE = "Write a SELECT query against northwind_sales."
