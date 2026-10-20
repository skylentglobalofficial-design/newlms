/**
 * Learner-facing practice environments.
 *
 * Published routes come from the practice platform bindings. A course that has
 * not been approved stays off this list, even if a workspace type would fit it.
 */
import { publishedBindingFor, publishedBindingForProgramme, PUBLISHED_BINDINGS } from "./practice-platform"

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

export const PRACTICE_ENVIRONMENTS: readonly PracticeEnvironment[] = PUBLISHED_BINDINGS.map((binding) => ({
  id: binding.adapterId === "sql-lab" ? "northwind-sql" : "harbor-desk",
  programmeSlug: binding.programmeSlug,
  courseSlug: binding.courseSlug,
  title: binding.title,
  tools: binding.tools,
  status: binding.adapterId === "sql-lab" ? "runs" : "written",
  statusLabel: binding.statusLabel,
  summary: binding.summary,
  honesty: binding.honesty,
  href: binding.href,
}))

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

export function practiceEnvironmentForCourse(courseSlug: string): PracticeEnvironment | null {
  return PRACTICE_ENVIRONMENTS.find((row) => row.courseSlug === courseSlug) ?? null
}

export function practiceEnvironmentForProgramme(programmeSlug: string): PracticeEnvironment | null {
  return PRACTICE_ENVIRONMENTS.find((row) => row.programmeSlug === programmeSlug) ?? null
}

export function practiceNoteForProgramme(programmeSlug: string): string {
  const built = practiceEnvironmentForProgramme(programmeSlug) ?? (publishedBindingForProgramme(programmeSlug) ? practiceEnvironmentForCourse(publishedBindingForProgramme(programmeSlug)!.courseSlug) : null)
  if (built) return `${built.statusLabel}. ${built.honesty}`
  const unbuilt = UNBUILT_PRACTICE.find((row) => row.slug === programmeSlug)
  if (unbuilt) return unbuilt.note
  return "This programme does not have its own practical environment, and it does not use another programme's lab."
}

/**
 * Dashboard link into the running SQL lab.
 * Spreadsheet, dashboard, and other non-SQL lessons do not get the lab root.
 */
export function dashboardSqlLabHref(courseSlug: string, lessonId: string | null | undefined): string | null {
  if (!lessonId) return null
  if (practiceEnvironmentForCourse(courseSlug)?.status !== "runs") return null
  const link = lessonPracticeLink(courseSlug, lessonId)
  return link?.status === "runs" ? link.href : null
}

export function lessonPracticeLink(courseSlug: string, lessonId: string): LessonPracticeLink | null {
  const binding = publishedBindingFor(courseSlug)
  if (!binding || !binding.lessonIds.includes(lessonId)) return null
  const query = binding.lessonQuery(lessonId)
  if (!query) return null
  return {
    label: binding.learnerLabel,
    href: `${binding.href}?${query}`,
    note: binding.learnerNote,
    status: binding.adapterId === "sql-lab" ? "runs" : "written",
  }
}
