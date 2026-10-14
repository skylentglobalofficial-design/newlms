/**
 * Public copy the catalogue pages are allowed to show.
 *
 * Authored courses and the three programmes below keep the verified text in
 * src/data.ts. A stale catalogue row (Python, Power BI, live classes, a
 * brochure module count) must not replace it. Other programmes keep the API
 * text. Prices, enrolment status, and course links are not touched.
 */
import type { Course } from "../data"
import { programs } from "../data"
import { numberWord } from "../components/programme/programme-truth"
import type { CatalogCurriculumModule, CatalogProgramSummary } from "./catalog-api"
import { courseBySlug, courseLessonStats, isAuthoredCourse } from "./catalog-maturity"

/** Spelled count plus a singular noun when the count is one: "One module", "Five modules". */
export function modulePhrase(count: number): string {
  return `${numberWord(count, true)} ${count === 1 ? "module" : "modules"}`
}

/** Lowercase, for a heading that already started with a capitalised module phrase. */
export function lessonPhrase(count: number): string {
  return `${numberWord(count)} ${count === 1 ? "lesson" : "lessons"}`
}

/** Curriculum heading. One of either noun stays singular. */
export function curriculumHeading(moduleCount: number, lessonCount: number): string {
  return `${modulePhrase(moduleCount)}, ${lessonPhrase(lessonCount)}.`
}

export function dataAnalyticsModuleSummary(moduleCount: number): string {
  const verb = moduleCount === 1 ? "takes" : "take"
  return `${modulePhrase(moduleCount)} ${verb} you from a first question to a commercial review. Spreadsheets, SQL and dashboards, all on one dataset you get to know properly.`
}

export function productManagementModuleSummary(moduleCount: number): string {
  return `${modulePhrase(moduleCount)} on one fictional retail operations case. You read the notes, frame a problem that can be tested, choose one bet under a stated constraint and specify it.`
}

const HONEST_PROGRAMME_SLUGS = ["data-analytics-pro", "product-management", "sql-certificate"] as const

const LIVE_FORMAT = /live classes|live \+/i

export type PublicCourseFields = {
  slug: string
  desc: string
  longDesc: string
  outcomes: string[]
  forWhom: string[]
  mode: string
}

export type PublicProgrammeFields = {
  desc: string
  format: string
  /** Modules the public page may call taught. Zero when nothing is linked. */
  taughtModuleCount: number
}

/** Authored courses use the static course record. Other courses keep the API fields. */
export function effectiveAuthoredCourseCopy<T extends PublicCourseFields>(course: T): T {
  if (!isAuthoredCourse(course.slug)) return course
  const source = courseBySlug(course.slug)
  if (!source) return course
  return {
    ...course,
    desc: source.desc,
    longDesc: source.longDesc,
    outcomes: [...source.outcomes],
    forWhom: [...source.forWhom],
    mode: source.mode,
  }
}

/**
 * Taught modules are the linked authored course's modules.
 * A programme with no linked course contributes none — brochure curriculum is not teaching.
 * A programme that also links a non-authored course keeps the API count, which is the
 * linked-course total and not the brochure.
 */
export function effectiveProgrammePublicFacts(
  program: Pick<CatalogProgramSummary, "slug" | "desc" | "format" | "moduleCount" | "linkedCourseSlugs">,
): PublicProgrammeFields {
  const source = programs.find((item) => item.slug === program.slug)
  const links = program.linkedCourseSlugs
  const authoredLinks = links.filter((slug) => isAuthoredCourse(slug))
  const fullyAuthored = links.length > 0 && authoredLinks.length === links.length
  const taughtModuleCount = fullyAuthored
    ? authoredLinks.reduce((sum, slug) => {
        const course = courseBySlug(slug)
        return sum + (course ? courseLessonStats(course).moduleCount : 0)
      }, 0)
    : links.length === 0
      ? 0
      : program.moduleCount

  const replaceCopy = Boolean(source && (HONEST_PROGRAMME_SLUGS as readonly string[]).includes(program.slug))
  const staticFormatIsHonest = Boolean(source && !LIVE_FORMAT.test(source.format))
  const format =
    source && (replaceCopy || (LIVE_FORMAT.test(program.format) && staticFormatIsHonest))
      ? source.format
      : program.format
  const desc = replaceCopy && source ? source.desc : program.desc

  return { desc, format, taughtModuleCount }
}

/** The outline the programme page prints for an authored course. Not the API curriculum. */
export function authoredCourseCurriculum(course: Course): CatalogCurriculumModule[] {
  return course.modules.map((module, order) => ({
    sourceId: module.id,
    order,
    title: module.title,
    nodes: module.lessons.map((lesson, lessonOrder) => ({
      sourceId: lesson.id,
      order: lessonOrder,
      title: lesson.title,
      nodeType: lesson.type.toUpperCase(),
      duration: lesson.duration ?? null,
    })),
  }))
}
