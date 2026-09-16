/**
 * Authored-course registry.
 *
 * Architecture audit (Phase 9)
 *
 * Already reusable: Course / Module / CurriculumNode, enrolment, sequential
 * lesson lock, quiz and assignment progress, dashboard resume via primary
 * enrolment, LearnerProject unique on (userId, projectType), Career OS
 * evidence FK, intent matching on catalogue rows.
 *
 * Data Analytics-specific (keep): Northwind Lab, SQL engine, chart adapter,
 * northwind CSVs, DA lesson text, Northwind Commercial Review lab-backed
 * tasks, DA AI Northwind facts.
 *
 * Extracted here: which courses have authored teaching content. Product copy,
 * lab/project entry points, and lesson bodies live in per-course packs.
 *
 * Remain DA-specific: Lab runtime and Northwind evidence rules.
 *
 * Minimum proof of reuse: Product Management runs through the same LMS
 * without a second LMS implementation and without a Lab.
 */

export const FLAGSHIP_COURSE_SLUG = "data-analytics"
export const PRODUCT_MANAGEMENT_SLUG = "product-management"

export const AUTHORED_COURSE_SLUGS = [FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG] as const

export type AuthoredCourseSlug = (typeof AUTHORED_COURSE_SLUGS)[number]

/** Data Analytics remains the homepage flagship. Prefer isAuthoredCourse for “is this teachable?”. */
export const AUTHORED_COURSE_SLUG = FLAGSHIP_COURSE_SLUG

export function isAuthoredCourse(slug: string): boolean {
  return (AUTHORED_COURSE_SLUGS as readonly string[]).includes(slug)
}

export function isAuthoredCourseSlug(slug: string): slug is AuthoredCourseSlug {
  return isAuthoredCourse(slug)
}
