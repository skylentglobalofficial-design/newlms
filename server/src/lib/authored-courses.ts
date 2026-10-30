/** Keep in lockstep with src/lib/authored-courses.ts */
export const FLAGSHIP_COURSE_SLUG = "data-analytics"
export const PRODUCT_MANAGEMENT_SLUG = "product-management"
export const PYTHON_PROGRAMMING_SLUG = "python-programming"

export const AUTHORED_COURSE_SLUGS = [FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG, PYTHON_PROGRAMMING_SLUG] as const

/** Programmes a new learner can enter. Same list as src/lib/authored-courses.ts. */
export const AUTHORED_PROGRAM_SLUGS = ["data-analytics-pro", "product-management"] as const

export function isAuthoredCourse(slug: string): boolean {
  return (AUTHORED_COURSE_SLUGS as readonly string[]).includes(slug)
}

export function isAuthoredProgramme(slug: string): boolean {
  return (AUTHORED_PROGRAM_SLUGS as readonly string[]).includes(slug)
}
