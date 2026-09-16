import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { NORTHWIND_SALES_FILE } from "./catalog.js"

function csvCandidates(): string[] {
  const here = dirname(fileURLToPath(import.meta.url))
  return [
    join(process.cwd(), "public/content/data-analytics", NORTHWIND_SALES_FILE),
    join(here, "../../../../public/content/data-analytics", NORTHWIND_SALES_FILE),
    join(process.cwd(), "dist/content/data-analytics", NORTHWIND_SALES_FILE),
  ]
}

export function resolveNorthwindSalesPath(): string {
  for (const candidate of csvCandidates()) {
    if (existsSync(candidate)) return candidate
  }
  throw new Error("dataset_unavailable")
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false
  const src = text.replace(/^\uFEFF/, "")
  for (let i = 0; i < src.length; i += 1) {
    const char = src[i]
    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      row.push(field)
      field = ""
    } else if (char === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else if (char !== "\r") {
      field += char
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((item) => item.some((cell) => cell.trim() !== ""))
}

export type SalesRow = Record<string, string>

export function loadSalesRows(): { headers: string[]; rows: SalesRow[] } {
  const raw = readFileSync(resolveNorthwindSalesPath(), "utf8")
  const table = parseCsv(raw)
  const headers = (table[0] ?? []).map((cell) => cell.trim())
  const rows = table.slice(1).map((cells) => {
    const row: SalesRow = {}
    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").trim()
    })
    return row
  })
  return { headers, rows }
}

export function inferColumnType(values: string[]): "text" | "number" | "date" {
  const filled = values.filter((value) => value !== "")
  if (!filled.length) return "text"
  if (filled.every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))) return "date"
  if (filled.every((value) => /^-?\d+(\.\d+)?$/.test(value))) return "number"
  return "text"
}
