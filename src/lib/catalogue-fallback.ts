/**
 * The published programme list, used only when GET /catalog/programs cannot be reached.
 *
 * These are the same records prisma/seed.ts writes into the catalogue (src/data.ts plus the
 * programme-to-course links in catalog-maturity.ts), mapped to the API's summary shape. They are
 * not sample rows: they are what the API returns when it is up. Enrolment still goes through
 * the API, so nothing here can enrol anyone on its own.
 */
import { courses, programs } from "../data"
import {
  normalizeEnrollmentStatus,
  type CatalogCourseDetail,
  type CatalogCourseSummary,
  type CatalogProgramDetail,
  type CatalogProgramSummary,
} from "./catalog-api"
import { linkedCourseSlugsForProgram } from "./catalog-maturity"

/**
 * Mirrors withProgramFacts() in server/src/routes/catalog.ts: the modules of the linked courses,
 * or, when no course is linked, the programme's own curriculum modules. Never the brochure figure.
 */
function apiModuleCount(program: (typeof programs)[number]): number {
  const fromCourses = linkedCourseSlugsForProgram(program.slug).reduce(
    (sum, slug) => sum + (courses.find((course) => course.slug === slug)?.modules.length ?? 0),
    0,
  )
  return fromCourses || (program.curriculumDetail?.length ?? 0)
}

export function publishedProgrammeSummaries(): CatalogProgramSummary[] {
  return programs.map((program) => ({
    slug: program.slug,
    name: program.name,
    enrollmentStatus: normalizeEnrollmentStatus(program.enrollmentStatus ?? null),
    duration: program.duration,
    format: program.format,
    level: program.level,
    desc: program.desc,
    programType: program.programType,
    moduleCount: apiModuleCount(program),
    projectCount: program.projects,
    linkedCourseSlugs: linkedCourseSlugsForProgram(program.slug),
    pricing: program.pricing.map((tier) => ({
      name: tier.name,
      price: tier.price,
      originalPrice: tier.originalPrice,
      features: [...tier.features],
      highlight: Boolean(tier.highlight),
    })),
  }))
}

/** One programme from the published list, or null when the slug is not published. */
export function publishedProgrammeDetail(slug: string): CatalogProgramDetail | null {
  return publishedProgrammeSummaries().find((program) => program.slug === slug) ?? null
}

/** Course rows in the shape GET /catalog/courses returns (seeded from src/data.ts `courses`). */
export function publishedCourseSummaries(): CatalogCourseSummary[] {
  return courses.map((course) => {
    const lessonCount = course.modules.reduce((sum, module) => sum + module.lessons.length, 0)
    return {
      slug: course.slug,
      title: course.title,
      category: course.category,
      level: course.level,
      duration: course.duration,
      mode: course.mode,
      price: course.price,
      originalPrice: course.originalPrice,
      moduleCount: course.modules.length,
      lessonCount,
      projectCount: course.projects,
    }
  })
}

/** One course in the shape GET /catalog/courses/:slug returns, or null when not published. */
export function publishedCourseDetail(slug: string): CatalogCourseDetail | null {
  const course = courses.find((item) => item.slug === slug)
  const summary = publishedCourseSummaries().find((item) => item.slug === slug)
  if (!course || !summary) return null
  return {
    ...summary,
    desc: course.desc,
    longDesc: course.longDesc,
    outcomes: [...course.outcomes],
    forWhom: [...course.forWhom],
    curriculum: course.modules.map((module, order) => ({
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
    })),
  }
}
