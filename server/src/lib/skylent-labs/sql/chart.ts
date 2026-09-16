import type { LabChartDecision, LabChartPoint, LabChartSpec, LabChartType, LabSqlCell } from "../types.js"

export const MAX_CHART_ROWS = 24
export const MIN_CHART_ROWS = 2

const DATE_VALUE = /^\d{4}-\d{2}(-\d{2})?$/
const NUMERIC_TEXT = /^-?\d+(\.\d+)?$/
const CATEGORY_KEY = /category|channel|region|city|product|segment/i
const TIME_KEY = /month|date|week|year|order_date|period/i
const CURRENCY_KEY = /revenue|amount|price|cost|total/i

function humanize(name: string): string {
  const cleaned = name.replace(/_/g, " ").trim()
  if (!cleaned) return name
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

function groupNoun(labelKey: string, type: LabChartType): string {
  if (type === "scatter") return "points"
  const key = labelKey.toLowerCase()
  if (key.includes("categor")) return "categories"
  if (key.includes("month")) return "months"
  if (key.includes("channel")) return "channels"
  if (key.includes("region")) return "regions"
  if (key.includes("city")) return "cities"
  if (key.includes("product")) return "products"
  if (key.includes("date")) return "dates"
  return "groups"
}

export function asChartNumber(value: LabSqlCell): number | null {
  if (value == null || value === "") return null
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  const trimmed = String(value).trim()
  if (!NUMERIC_TEXT.test(trimmed)) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

function isDateLike(value: LabSqlCell): boolean {
  if (value == null || value === "") return false
  return DATE_VALUE.test(String(value).trim())
}

type ColumnKind = "numeric" | "date" | "label" | "empty"

function classifyColumn(values: LabSqlCell[]): ColumnKind {
  const filled = values.filter((value) => value != null && value !== "")
  if (!filled.length) return "empty"
  if (filled.every((value) => asChartNumber(value) != null)) return "numeric"
  if (filled.every((value) => isDateLike(value))) return "date"
  return "label"
}

export function formatChartNumber(value: number, currency: boolean): string {
  const rounded = Number.isInteger(value) ? value : Math.round(value * 100) / 100
  const formatted = Number.isInteger(rounded)
    ? rounded.toLocaleString("en-US")
    : rounded.toLocaleString("en-US", { maximumFractionDigits: 2 })
  return currency ? `₹${formatted}` : formatted
}

export function niceAxisMax(value: number): number {
  if (value <= 0) return 1
  const exp = 10 ** Math.floor(Math.log10(value))
  const fraction = value / exp
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10]
  const nice = steps.find((step) => fraction <= step) ?? 10
  return nice * exp
}

export function formatAxisNumber(value: number, currency: boolean): string {
  const prefix = currency ? "₹" : ""
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    const scaled = value / 1_000_000
    return `${prefix}${Number.isInteger(scaled) ? scaled : scaled.toFixed(1)}M`
  }
  if (abs >= 1000) {
    const scaled = value / 1000
    return `${prefix}${Number.isInteger(scaled) ? scaled : scaled.toFixed(0)}k`
  }
  return `${prefix}${value.toLocaleString("en-US")}`
}

function columnValues(rows: LabSqlCell[][], index: number): LabSqlCell[] {
  return rows.map((row) => row[index] ?? null)
}

function chooseType(labelKey: string, labelKind: ColumnKind): LabChartType {
  if (labelKind === "date" || TIME_KEY.test(labelKey)) return "line"
  if (CATEGORY_KEY.test(labelKey)) return "bar"
  return "bar"
}

export function buildLabChart(columns: string[], rows: LabSqlCell[][]): LabChartDecision {
  if (!Array.isArray(columns) || !Array.isArray(rows)) return { chartable: false }
  if (rows.length < MIN_CHART_ROWS || rows.length > MAX_CHART_ROWS) return { chartable: false }
  if (columns.length !== 2) return { chartable: false }

  const kinds = columns.map((_, index) => classifyColumn(columnValues(rows, index)))
  if (kinds.includes("empty")) return { chartable: false }

  const numericIndexes = kinds
    .map((kind, index) => (kind === "numeric" ? index : -1))
    .filter((index) => index >= 0)
  const labelIndexes = kinds
    .map((kind, index) => (kind === "label" || kind === "date" ? index : -1))
    .filter((index) => index >= 0)

  if (numericIndexes.length === 2 && labelIndexes.length === 0) {
    return buildScatter(columns, rows)
  }

  if (numericIndexes.length !== 1 || labelIndexes.length !== 1) return { chartable: false }

  const labelIndex = labelIndexes[0]
  const valueIndex = numericIndexes[0]
  const labelKey = columns[labelIndex] ?? ""
  const yKey = columns[valueIndex] ?? ""
  const labelKind = kinds[labelIndex] ?? "label"
  const yIsCurrency = CURRENCY_KEY.test(yKey)
  const series: LabChartPoint[] = []

  for (let i = 0; i < rows.length; i += 1) {
    const labelRaw = rows[i]?.[labelIndex]
    const y = asChartNumber(rows[i]?.[valueIndex] ?? null)
    if (y == null) return { chartable: false }
    const label = labelRaw == null || labelRaw === "" ? "—" : String(labelRaw)
    series.push({
      label,
      x: i,
      y,
      formatted: formatChartNumber(y, yIsCurrency),
    })
  }

  if (series.length < MIN_CHART_ROWS) return { chartable: false }

  const type = chooseType(labelKey, labelKind)
  const highest = series.reduce((best, point) => (point.y > best.y ? point : best), series[0]!)
  const maxValue = Math.max(...series.map((point) => point.y))
  const title = `${humanize(yKey)} by ${humanize(labelKey)}`

  return {
    chartable: true,
    type,
    xKey: labelKey,
    yKey,
    labelKey,
    title,
    groupNoun: groupNoun(labelKey, type),
    highestLabel: highest.label,
    highestFormatted: highest.formatted,
    yIsCurrency,
    maxValue,
    axisMax: niceAxisMax(maxValue),
    xAxisMax: Math.max(series.length - 1, 1),
    series,
  }
}

function buildScatter(columns: string[], rows: LabSqlCell[][]): LabChartDecision {
  const xKey = columns[0] ?? ""
  const yKey = columns[1] ?? ""
  const yIsCurrency = CURRENCY_KEY.test(yKey)
  const series: LabChartPoint[] = []

  for (let i = 0; i < rows.length; i += 1) {
    const x = asChartNumber(rows[i]?.[0] ?? null)
    const y = asChartNumber(rows[i]?.[1] ?? null)
    if (x == null || y == null) return { chartable: false }
    series.push({
      label: `${formatChartNumber(x, CURRENCY_KEY.test(xKey))}, ${formatChartNumber(y, yIsCurrency)}`,
      x,
      y,
      formatted: formatChartNumber(y, yIsCurrency),
    })
  }

  if (series.length < MIN_CHART_ROWS) return { chartable: false }

  const highest = series.reduce((best, point) => (point.y > best.y ? point : best), series[0]!)
  const maxY = Math.max(...series.map((point) => point.y))
  const maxX = Math.max(...series.map((point) => point.x))

  return {
    chartable: true,
    type: "scatter",
    xKey,
    yKey,
    labelKey: xKey,
    title: `${humanize(yKey)} vs ${humanize(xKey)}`,
    groupNoun: "points",
    highestLabel: highest.label,
    highestFormatted: highest.formatted,
    yIsCurrency,
    maxValue: maxY,
    axisMax: niceAxisMax(Math.max(maxY, 0)),
    xAxisMax: niceAxisMax(Math.max(maxX, 0)),
    series,
  }
}

export function compactChart(chart: LabChartDecision): Pick<LabChartSpec, "chartable" | "type" | "xKey" | "yKey" | "labelKey"> | { chartable: false } {
  if (!chart.chartable) return { chartable: false }
  return {
    chartable: true,
    type: chart.type,
    xKey: chart.xKey,
    yKey: chart.yKey,
    labelKey: chart.labelKey,
  }
}
