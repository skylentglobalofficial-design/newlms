/** Keep in lockstep with src/lib/authored-courses.ts */
export const FLAGSHIP_COURSE_SLUG = "data-analytics"
export const PRODUCT_MANAGEMENT_SLUG = "product-management"
export const PYTHON_PROGRAMMING_SLUG = "python-programming"
export const DATA_SCIENCE_SLUG = "data-science-ai"
export const GENERATIVE_AI_SLUG = "generative-ai"
export const FULL_STACK_WEB_SLUG = "full-stack-web"

export const AUTHORED_COURSE_SLUGS = [
  FLAGSHIP_COURSE_SLUG,
  PRODUCT_MANAGEMENT_SLUG,
  PYTHON_PROGRAMMING_SLUG,
  DATA_SCIENCE_SLUG,
  GENERATIVE_AI_SLUG,
  FULL_STACK_WEB_SLUG,
] as const

export const AUTHORED_PROGRAM_SLUGS = [
  "data-analytics-pro",
  "product-management",
  "data-science-ai",
  "full-stack",
  "generative-ai-program",
] as const

export function isAuthoredCourse(slug: string): boolean {
  return (AUTHORED_COURSE_SLUGS as readonly string[]).includes(slug)
}

export function isAuthoredProgramme(slug: string): boolean {
  return (AUTHORED_PROGRAM_SLUGS as readonly string[]).includes(slug)
}
