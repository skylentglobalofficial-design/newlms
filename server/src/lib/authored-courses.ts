/** Keep in lockstep with src/lib/authored-courses.ts */
export const FLAGSHIP_COURSE_SLUG = "data-analytics"
export const PRODUCT_MANAGEMENT_SLUG = "product-management"

export const AUTHORED_COURSE_SLUGS = [FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG] as const

export function isAuthoredCourse(slug: string): boolean {
  return (AUTHORED_COURSE_SLUGS as readonly string[]).includes(slug)
}
