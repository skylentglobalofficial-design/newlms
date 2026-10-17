/**
 * Practical environment for each programme.
 *
 * A running lab executes learner input and returns a real result.
 * A written workspace saves the learner's own text against authored case material.
 * Anything else is not built. It must not borrow another programme's lab.
 */

export type PracticeStatus = "runs" | "written" | "not-built"

export type PracticeEnvironment = {
  id: string
  programmeSlug: string
  courseSlug: string
  title: string
  tools: readonly string[]
  status: PracticeStatus
  statusLabel: string
  summary: string
  honesty: string
  href: string
}

export type UnbuiltPractice = {
  slug: string
  title: string
  note: string
}

export type LessonPracticeLink = {
  label: string
  href: string
  note: string
  status: Exclude<PracticeStatus, "not-built">
}

export const PRACTICE_ENVIRONMENTS: readonly PracticeEnvironment[] = [
  {
    id: "northwind-sql",
    programmeSlug: "data-analytics-pro",
    courseSlug: "data-analytics",
    title: "Northwind Lab",
    tools: ["SQL editor", "northwind_sales.csv", "Result table", "Chart"],
    status: "runs",
    statusLabel: "Runs in the browser",
    summary: "Read-only SELECT against the Data Analytics extract. The table and chart are the query result.",
    honesty: "Not PostgreSQL, and not the application database. Spreadsheet and dashboard lessons do not open this editor.",
    href: "/os/labs/data-analytics/northwind",
  },
  {
    id: "harbor-desk",
    programmeSlug: "product-management",
    courseSlug: "product-management",
    title: "Harbor Desk case",
    tools: ["Interview notes", "Exception log", "Constraint", "Written product case"],
    status: "written",
    statusLabel: "Written workspace",
    summary: "You read the Harbor Retail case and write the problem, the job, and one bet. Your text is saved with the project.",
    honesty: "Nothing is executed. There is no SQL lab, no code runner, and no revenue result on this programme.",
    href: "/os/projects/product-management/harbor-desk-case",
  },
]

/** Catalogue programmes with no authored workbench. Notes describe the absence, not a future product. */
export const UNBUILT_PRACTICE: readonly UnbuiltPractice[] = [
  {
    slug: "data-science-ai",
    title: "Data Science & AI",
    note: "No notebook, dataset runner, or model trainer is attached to this programme.",
  },
  {
    slug: "full-stack",
    title: "Full Stack Development",
    note: "No HTML, CSS, or JavaScript playground, and no API runner, is attached to this programme.",
  },
  {
    slug: "generative-ai-program",
    title: "Generative AI",
    note: "No model runner or experiment workspace is attached to this programme.",
  },
  {
    slug: "sql-certificate",
    title: "SQL for Business Analytics",
    note: "No SQL lab is attached to this certificate. Northwind Lab belongs to Data Analytics.",
  },
]

const DATA_ANALYTICS_SQL_LESSONS = new Set(["l7", "l8", "l9", "l13", "l14"])

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

export function practiceEnvironmentForCourse(courseSlug: string): PracticeEnvironment | null {
  return PRACTICE_ENVIRONMENTS.find((row) => row.courseSlug === courseSlug) ?? null
}

export function practiceEnvironmentForProgramme(programmeSlug: string): PracticeEnvironment | null {
  return PRACTICE_ENVIRONMENTS.find((row) => row.programmeSlug === programmeSlug) ?? null
}

export function practiceNoteForProgramme(programmeSlug: string): string {
  const built = practiceEnvironmentForProgramme(programmeSlug)
  if (built) return `${built.statusLabel}. ${built.honesty}`
  const unbuilt = UNBUILT_PRACTICE.find((row) => row.slug === programmeSlug)
  if (unbuilt) return unbuilt.note
  return "This programme does not have its own practical environment, and it does not use another programme's lab."
}

export function lessonPracticeLink(courseSlug: string, lessonId: string): LessonPracticeLink | null {
  if (courseSlug === "data-analytics" && DATA_ANALYTICS_SQL_LESSONS.has(lessonId)) {
    const params = new URLSearchParams({ lesson: lessonId, mode: "sql" })
    return {
      label: "Open Northwind Lab",
      href: `/os/labs/data-analytics/northwind?${params.toString()}`,
      note: "Read-only SQL on northwind_sales. The result is computed from that file.",
      status: "runs",
    }
  }
  const task = courseSlug === "product-management" ? HARBOR_TASK_BY_LESSON[lessonId] : undefined
  if (task) {
    const params = new URLSearchParams({ task })
    return {
      label: "Open Harbor Desk",
      href: `/os/projects/product-management/harbor-desk-case?${params.toString()}`,
      note: "Case notes for this lesson. Your writing is saved. Nothing is executed.",
      status: "written",
    }
  }
  return null
}
