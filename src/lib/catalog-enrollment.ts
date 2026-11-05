import { enrollInCourse, enrollInProgram, type ApiCourseWorkspace } from "./lms-api"

export type CatalogEnrollTarget =
  | { kind: "course"; slug: string }
  | { kind: "program"; slug: string }

export type LoginRedirectState = {
  returnTo?: string
  enrollTarget?: CatalogEnrollTarget
}

const PROGRAMME_LINKED_COURSES: Record<string, readonly string[]> = {
  "data-science-ai": ["data-analytics", "python-programming"],
  "full-stack": ["full-stack-web"],
  "generative-ai-program": ["generative-ai"],
  "sql-certificate": ["data-analytics"],
}

const AUTHORED_PROGRAMME_FALLBACK_COURSE: Record<string, string> = {
  "data-analytics-pro": "data-analytics",
  "product-management": "product-management",
}

export function learnPathForWorkspace(workspace: ApiCourseWorkspace): string {
  const courseSlug = workspace.program?.resume.courseSlug ?? workspace.enrollment.courseSlug
  const lessonId = workspace.program?.resume.lessonId ?? workspace.resume.lessonId
  if (courseSlug && lessonId) return `/learn/${courseSlug}/${lessonId}`
  return `/learn/${courseSlug}`
}

export async function fulfillCatalogEnrollment(
  target: CatalogEnrollTarget,
  acceptedTerms: boolean,
): Promise<ApiCourseWorkspace> {
  if (target.kind === "course") {
    return enrollInCourse(target.slug, acceptedTerms)
  }
  const fallbackCourses = PROGRAMME_LINKED_COURSES[target.slug]
  if (fallbackCourses && fallbackCourses.length > 0) {
    const primary = await enrollInCourse(fallbackCourses[0], acceptedTerms)
    for (const extraSlug of fallbackCourses.slice(1)) {
      await enrollInCourse(extraSlug, acceptedTerms).catch(() => undefined)
    }
    return primary
  }
  try {
    return await enrollInProgram(target.slug, acceptedTerms)
  } catch (error) {
    const directFallback = AUTHORED_PROGRAMME_FALLBACK_COURSE[target.slug]
    if (directFallback) {
      return enrollInCourse(directFallback, acceptedTerms)
    }
    throw error
  }
}

/** Where a learner goes to accept the terms and enrol when that was not done before signing in. */
export function cataloguePathForTarget(target: CatalogEnrollTarget): string {
  return target.kind === "course" ? `/courses/${target.slug}` : `/programmes/${target.slug}`
}
