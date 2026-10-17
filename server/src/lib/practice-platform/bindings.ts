import type { PublishedBinding } from "./types.js"

const HARBOR_TASK_BY_LESSON: Record<string, string> = {
  l4: "read_case",
  l5: "read_case",
  l6: "read_case",
  l7: "frame_problem",
  l8: "frame_problem",
  l10: "one_bet",
  l11: "one_bet",
  l12: "one_bet",
  l13: "recommendation",
  l14: "recommendation",
}

/**
 * Courses whose workspace has been reviewed and may be opened by an enrolled learner.
 * Adding a course here is the publication step. Classification alone does not publish.
 */
export const PUBLISHED_BINDINGS: readonly PublishedBinding[] = [
  {
    courseSlug: "data-analytics",
    programmeSlug: "data-analytics-pro",
    adapterId: "sql-lab",
    title: "Northwind Lab",
    tools: ["SQL editor", "northwind_sales.csv", "Result table", "Chart"],
    lessonIds: ["l7", "l8", "l9", "l13", "l14"],
    href: "/os/labs/data-analytics/northwind",
    datasetId: "northwind_sales",
    caseId: null,
    statusLabel: "Runs in the browser",
    summary: "Read-only SELECT against the Data Analytics extract. The table and chart are the query result.",
    honesty: "Not PostgreSQL, and not the application database. Spreadsheet and dashboard lessons do not open this editor.",
    learnerLabel: "Open Northwind Lab",
    learnerNote: "Read-only SQL on northwind_sales. The result is computed from that file.",
    lessonQuery(lessonId) {
      return `lesson=${encodeURIComponent(lessonId)}&mode=sql`
    },
  },
  {
    courseSlug: "product-management",
    programmeSlug: "product-management",
    adapterId: "case-studio",
    title: "Harbor Desk case",
    tools: ["Interview notes", "Exception log", "Constraint", "Written product case"],
    lessonIds: Object.keys(HARBOR_TASK_BY_LESSON),
    href: "/os/projects/product-management/harbor-desk-case",
    datasetId: null,
    caseId: "harbor-desk",
    statusLabel: "Written workspace",
    summary: "You read the Harbor Retail case and write the problem, the job, and one bet. Your text is saved with the project.",
    honesty: "Nothing is executed. There is no SQL lab, no code runner, and no revenue result on this programme.",
    learnerLabel: "Open Harbor Desk",
    learnerNote: "Case notes for this lesson. Your writing is saved. Nothing is executed.",
    lessonQuery(lessonId) {
      const task = HARBOR_TASK_BY_LESSON[lessonId]
      return task ? `task=${encodeURIComponent(task)}` : null
    },
  },
]

export function publishedBindingFor(courseSlug: string): PublishedBinding | null {
  return PUBLISHED_BINDINGS.find((row) => row.courseSlug === courseSlug) ?? null
}

export function publishedBindingForProgramme(programmeSlug: string): PublishedBinding | null {
  return PUBLISHED_BINDINGS.find((row) => row.programmeSlug === programmeSlug) ?? null
}
