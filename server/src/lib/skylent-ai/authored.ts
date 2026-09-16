import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import type { LessonAiContext } from "./types.js"

/** Keep in lockstep with src/lib/northwind-preview.ts — tests assert equality. */
export const NORTHWIND_FACTS = {
  filename: "northwind_sales.csv",
  rows: 180,
  validRows: 166,
  excludedRows: 14,
  netRevenue: 812020,
  netRevenueLabel: "₹812,020",
  window: "Jan–Jun 2026",
  topCategory: "Electronics",
  weakestMonth: "April",
  sql: "SELECT ROUND(SUM(units * unit_price * (1.0 - discount_pct / 100.0)), 0) AS net_revenue\nFROM sales\nWHERE units > 0 AND unit_price > 0 AND returned = 'no';",
} as const

type AuthoredMeta = {
  id: string
  moduleId: string
  title: string
  kind: string
  objective: string
  whyItMatters: string
  concepts: string[]
  practicalOutput: string
  assessment: string
}

/** Compact copy of src/content/data-analytics/lessons.ts for server-side context. */
export const DA_AI_META: AuthoredMeta[] = [
  {
    id: "l1",
    moduleId: "m1",
    title: "What is Data Analytics?",
    kind: "notes",
    objective: "Distinguish descriptive work from speculation and compute defensible net revenue from a dirty sales extract.",
    whyItMatters: "If you cannot say what was measured, you cannot brief a decision-maker.",
    concepts: ["descriptive vs diagnostic vs forecast", "net revenue formula", "valid-row rule", "quality issues"],
    practicalOutput: "Formula, valid-row rule, and a one-sentence Northwind total with the rule stated.",
    assessment: "Knowledge check in the lesson; foundations quiz on l3.",
  },
  {
    id: "l2",
    moduleId: "m1",
    title: "Asking a question the data can answer",
    kind: "notes",
    objective: "Rewrite a vague ask into metric, window, segment, and limitation.",
    whyItMatters: "Dashboards fail when the question does not fit the columns.",
    concepts: ["question template", "what Northwind can and cannot answer"],
    practicalOutput: "Four rewritten requests, including one refusal.",
    assessment: "Knowledge check; l3 quiz.",
  },
  {
    id: "l3",
    moduleId: "m1",
    title: "Foundations check",
    kind: "quiz",
    objective: "Prove you can choose a measurable question and the Northwind revenue formula.",
    whyItMatters: "Later briefs assume this vocabulary.",
    concepts: ["scenario questions on lessons 1–2"],
    practicalOutput: "Quiz attempt (all five correct).",
    assessment: "5 MCQs, all required.",
  },
  {
    id: "l4",
    moduleId: "m2",
    title: "Spreadsheet tables, types, and filters",
    kind: "notes",
    objective: "Import the CSV, add helper columns, and reach 166 valid rows without editing raw data.",
    whyItMatters: "Wrong types and silent filters poison every later total.",
    concepts: ["types", "helper columns", "filters vs deletes"],
    practicalOutput: "Working tab with category_std, valid_flag, net_revenue ≈ 812020.",
    assessment: "Knowledge check; assignment l6.",
  },
  {
    id: "l5",
    moduleId: "m2",
    title: "Pivots, charts, and month-over-month",
    kind: "notes",
    objective: "Build category and month pivots, compute MoM with January as n/a, chart one question.",
    whyItMatters: "Executives remember one comparison, not 180 rows.",
    concepts: ["pivot", "MoM", "chart titled as a question"],
    practicalOutput: "Two pivots, MoM column, one titled chart.",
    assessment: "Knowledge check; assignment l6.",
  },
  {
    id: "l6",
    moduleId: "m2",
    title: "Spreadsheet analysis — Northwind Q1–Q2",
    kind: "assignment",
    objective: "Clean the sales extract and answer three commercial questions in a spreadsheet.",
    whyItMatters: "This is the first work sample: cleaning log + tables + recommendations.",
    concepts: ["cleaning log", "category and region summaries", "recommendations tied to numbers"],
    practicalOutput: "Pasted cleaning log, summaries, three recommendations.",
    assessment: "Rubric in the brief. No faculty grading in this pilot.",
  },
  {
    id: "l7",
    moduleId: "m3",
    title: "SQL SELECT, WHERE, and aggregates",
    kind: "notes",
    objective: "Reproduce spreadsheet totals with SELECT, WHERE, and GROUP BY in SQLite.",
    whyItMatters: "Finance re-runs a query; they cannot re-run a screenshot.",
    concepts: ["SELECT", "WHERE vs HAVING", "GROUP BY", "net revenue SQL"],
    practicalOutput: "northwind_l7.sql matching ~812k valid revenue and category rank.",
    assessment: "Knowledge check; l9 quiz; assignment l13.",
  },
  {
    id: "l8",
    moduleId: "m3",
    title: "SQL joins and data-quality checks",
    kind: "notes",
    objective: "Detect duplicates, label Unknown region, LEFT JOIN a calendar including empty July.",
    whyItMatters: "INNER JOIN and WHERE-on-right drop the rows you meant to keep.",
    concepts: ["LEFT JOIN", "ON vs WHERE", "duplicate keys", "do not join HR as a cause"],
    practicalOutput: "Quality log IDs + seven-month calendar query with July = 0.",
    assessment: "Knowledge check; l9 quiz.",
  },
  {
    id: "l9",
    moduleId: "m3",
    title: "SQL check",
    kind: "quiz",
    objective: "Prove SQL reasoning on aggregates, duplicates, and joins.",
    whyItMatters: "Assignment l13 assumes you can choose the right clause.",
    concepts: ["scenario SQL questions"],
    practicalOutput: "Quiz attempt (all five correct).",
    assessment: "5 MCQs, all required.",
  },
  {
    id: "l10",
    moduleId: "m4",
    title: "Dashboards that answer one question",
    kind: "notes",
    objective: "Pass the sixty-second stand-up test: question, KPI, comparison, trend, filter.",
    whyItMatters: "A gallery of charts is not a decision surface.",
    concepts: ["one-question dashboard", "stand-up test", "notes for quality issues"],
    practicalOutput: "One-screen dashboard draft titled as a question.",
    assessment: "Knowledge check; assignment l12.",
  },
  {
    id: "l11",
    moduleId: "m4",
    title: "Measures, dimensions, and calculated fields",
    kind: "notes",
    objective: "Define net revenue, COGS, margin, and returned units without averaging percentages.",
    whyItMatters: "Wrong field types make a dashboard lie even when the chart is pretty.",
    concepts: ["dimension vs measure", "weighted margin %", "returns as a separate measure"],
    practicalOutput: "Documented measure list used on the dashboard.",
    assessment: "Knowledge check; assignment l12.",
  },
  {
    id: "l12",
    moduleId: "m4",
    title: "Dashboard — one question Northwind can act on",
    kind: "assignment",
    objective: "Submit a one-screen dashboard with insight box and visible cleaning rules.",
    whyItMatters: "Portfolio screenshot a hiring manager can read without a walkthrough.",
    concepts: ["KPI", "comparison", "trend", "filter", "insight box"],
    practicalOutput: "Layout write-up or public sheet/pbix link.",
    assessment: "Rubric in the brief. No faculty grading in this pilot.",
  },
  {
    id: "l13",
    moduleId: "m5",
    title: "SQL analysis — Northwind sales",
    kind: "assignment",
    objective: "Answer four sales questions with re-runnable SQL and commercial interpretation.",
    whyItMatters: "Reproducible queries are the analyst artifact, not a pivot screenshot.",
    concepts: ["COUNT vs COUNT DISTINCT", "CASE maps", "Unknown region", "monthly trend"],
    practicalOutput: "Four queries + result tables + interpretation.",
    assessment: "Rubric in the brief. No faculty grading in this pilot.",
  },
  {
    id: "l14",
    moduleId: "m5",
    title: "Capstone — Northwind commercial review",
    kind: "assignment",
    objective: "Produce an end-to-end memo a hiring manager could read: clean, analyse, visualise, recommend.",
    whyItMatters: "Progress percent is not competence. This memo is the work sample.",
    concepts: ["sales + HR quality", "consistent valid-row rule", "actionable recommendations"],
    practicalOutput: "Memo + dashboard + SQL/spreadsheet appendix.",
    assessment: "Capstone rubric. Not a certificate or placement.",
  },
  {
    id: "l15",
    moduleId: "m5",
    title: "Final check",
    kind: "quiz",
    objective: "Check dashboard judgement, formulas, HR quality, and honesty about progress vs evidence.",
    whyItMatters: "The last quiz should not be trivia.",
    concepts: ["scenario questions across the course"],
    practicalOutput: "Quiz attempt (all five correct).",
    assessment: "5 MCQs, all required.",
  },
]

export const DA_DATASETS: Array<{
  filename: string
  rows: number
  notes: string
  usedIn: readonly string[]
}> = [
  {
    filename: "northwind_sales.csv",
    rows: 180,
    notes: "180 order lines for fictional Northwind Retail, January–June 2026. Default valid-row rule: units > 0, unit_price > 0, returned = no → 166 valid rows, ₹812,020 valid net revenue.",
    usedIn: ["l1", "l2", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11", "l12", "l13", "l14", "l15"],
  },
  {
    filename: "northwind_hr.csv",
    rows: 56,
    notes: "56 staff rows used where briefs ask for a companion HR extract. Not a cause of sales movement.",
    usedIn: ["l2", "l8", "l14"],
  },
]

const EXCERPT_LIMIT = 7000

function repoRoot(): string {
  const fromHere = join(dirname(fileURLToPath(import.meta.url)), "../../../..")
  if (existsSync(join(fromHere, "src/content/data-analytics/lesson-text/l1.md"))) return fromHere
  return process.cwd()
}

export function readDaLessonBody(lessonId: string): string {
  const file = join(repoRoot(), "src/content/data-analytics/lesson-text", `${lessonId}.md`)
  if (!existsSync(file)) return ""
  return readFileSync(file, "utf8")
}

export function getDaAiMeta(lessonId: string): AuthoredMeta | undefined {
  return DA_AI_META.find((row) => row.id === lessonId)
}

export function buildLessonAiContext(input: {
  courseSlug: string
  courseTitle: string
  moduleTitle: string
  lessonId: string
  lessonTitle: string
  lessonKind: string
}): LessonAiContext {
  const authored = input.courseSlug === "data-analytics"
  const meta = authored ? getDaAiMeta(input.lessonId) : undefined
  const body = authored ? readDaLessonBody(input.lessonId) : ""
  const excerpt = body.length > EXCERPT_LIMIT ? `${body.slice(0, EXCERPT_LIMIT)}\n\n[Lesson text truncated for context.]` : body

  return {
    courseSlug: input.courseSlug,
    courseTitle: input.courseTitle,
    moduleTitle: input.moduleTitle,
    lessonId: input.lessonId,
    lessonTitle: meta?.title ?? input.lessonTitle,
    lessonKind: meta?.kind ?? input.lessonKind,
    authored,
    objective: meta?.objective ?? "",
    whyItMatters: meta?.whyItMatters ?? "",
    concepts: meta?.concepts ?? [],
    practicalOutput: meta?.practicalOutput ?? "",
    assessment: meta?.assessment ?? "",
    datasets: authored
      ? DA_DATASETS.filter((item) => item.usedIn.includes(input.lessonId)).map((item) => ({
          filename: item.filename,
          rows: item.rows,
          notes: item.notes,
        }))
      : [],
    northwind: authored
      ? {
          filename: NORTHWIND_FACTS.filename,
          rows: NORTHWIND_FACTS.rows,
          validRows: NORTHWIND_FACTS.validRows,
          excludedRows: NORTHWIND_FACTS.excludedRows,
          netRevenueLabel: NORTHWIND_FACTS.netRevenueLabel,
          window: NORTHWIND_FACTS.window,
          topCategory: NORTHWIND_FACTS.topCategory,
          weakestMonth: NORTHWIND_FACTS.weakestMonth,
          sql: NORTHWIND_FACTS.sql,
        }
      : null,
    excerpt,
  }
}
