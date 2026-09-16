import { NORTHWIND_SALES_FILE, VALID_NET_REVENUE, operationMeta } from "./catalog.js"
import { inferColumnType, loadSalesRows, type SalesRow } from "./dataset.js"
import type { LabCategoryTotal, LabDatasetPreview, LabRunResult } from "./types.js"

export const VALID_ROW_RULE = ["units > 0", "unit_price > 0", "returned = no"] as const

export const NET_REVENUE_FORMULA = "net_revenue = units × unit_price × (1 − discount_pct / 100)"

const CATEGORY_ALIASES: Record<string, string> = {
  "elec.": "Electronics",
  electronics: "Electronics",
}

export function formatInr(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-US")}`
}

export function parseNumber(value: string): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : Number.NaN
}

export function isValidSalesRow(row: SalesRow): boolean {
  const units = parseNumber(row.units ?? "")
  const price = parseNumber(row.unit_price ?? "")
  const returned = (row.returned ?? "").trim().toLowerCase()
  return units > 0 && price > 0 && returned === "no"
}

export function rowNetRevenue(row: SalesRow): number {
  const units = parseNumber(row.units ?? "")
  const price = parseNumber(row.unit_price ?? "")
  const discount = parseNumber(row.discount_pct ?? "")
  const safeDiscount = Number.isFinite(discount) ? discount : 0
  return units * price * (1 - safeDiscount / 100)
}

export function mapCategory(raw: string): { mapped: string; aliased: boolean } {
  const trimmed = raw.trim()
  const mapped = CATEGORY_ALIASES[trimmed.toLowerCase()]
  if (mapped && mapped !== trimmed) return { mapped, aliased: true }
  return { mapped: trimmed || "Unknown", aliased: false }
}

export function buildDatasetPreview(): LabDatasetPreview {
  const { headers, rows } = loadSalesRows()
  return {
    filename: NORTHWIND_SALES_FILE,
    description:
      "180 order lines for fictional Northwind Retail, January–June 2026. Totals in this lab are calculated from the file, not typed into the page.",
    totalRows: rows.length,
    columns: headers.map((name) => ({
      name,
      type: inferColumnType(rows.map((row) => row[name] ?? "")),
    })),
    sampleRows: rows.slice(0, 8).map((row) => {
      const sample: Record<string, string> = {}
      for (const header of headers) sample[header] = row[header] ?? ""
      return sample
    }),
    validRowRule: [...VALID_ROW_RULE],
    qualityNotes: [
      "Blank region on some rows is kept, not dropped.",
      "Elec. and electronics are category aliases for Electronics.",
      "Negative units and zero price are invalid sales in this course.",
    ],
  }
}

export function calculateValidNetRevenue(): LabRunResult {
  const { rows } = loadSalesRows()
  const valid = rows.filter(isValidSalesRow)
  const netRevenue = Math.round(valid.reduce((sum, row) => sum + rowNetRevenue(row), 0))

  const grouped = new Map<string, { validRows: number; netRevenue: number }>()
  const aliasHits = new Map<string, string>()
  for (const row of valid) {
    const raw = row.category ?? ""
    const { mapped, aliased } = mapCategory(raw)
    if (aliased) aliasHits.set(raw, mapped)
    const current = grouped.get(mapped) ?? { validRows: 0, netRevenue: 0 }
    current.validRows += 1
    current.netRevenue += rowNetRevenue(row)
    grouped.set(mapped, current)
  }

  const categories: LabCategoryTotal[] = [...grouped.entries()]
    .map(([name, stats]) => ({
      name,
      validRows: stats.validRows,
      netRevenue: Math.round(stats.netRevenue),
      netRevenueLabel: formatInr(stats.netRevenue),
    }))
    .sort((a, b) => b.netRevenue - a.netRevenue || a.name.localeCompare(b.name))

  const top = categories[0]

  return {
    operation: VALID_NET_REVENUE,
    operationLabel: operationMeta(VALID_NET_REVENUE)?.label ?? "Calculate valid net revenue",
    dataset: NORTHWIND_SALES_FILE,
    totalRows: rows.length,
    validRows: valid.length,
    excludedRows: rows.length - valid.length,
    netRevenue,
    netRevenueLabel: formatInr(netRevenue),
    topCategory: top?.name ?? "",
    topCategoryRevenue: top?.netRevenue ?? 0,
    topCategoryRevenueLabel: top ? formatInr(top.netRevenue) : formatInr(0),
    validRowRule: [...VALID_ROW_RULE],
    formula: NET_REVENUE_FORMULA,
    categoryMapping: [...aliasHits.entries()].map(([from, to]) => ({
      from,
      to,
      reason: "Course mapping: treat spelling variants as one category and log the change.",
    })),
    categories,
    explanation:
      "Valid net revenue uses only rows that pass the valid-row rule, then applies the course formula. Category aliases are mapped to Electronics so the rank matches the lesson, not three separate spellings.",
  }
}

export function runLabOperation(operation: string): LabRunResult {
  if (operation === VALID_NET_REVENUE) return calculateValidNetRevenue()
  throw new Error("invalid_operation")
}
