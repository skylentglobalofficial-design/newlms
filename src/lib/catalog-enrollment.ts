import { enrollInCourse, enrollInProgram, type ApiCourseWorkspace } from "./lms-api"

export type CatalogEnrollTarget =
  | { kind: "course"; slug: string }
  | { kind: "program"; slug: string }

export type LoginRedirectState = {
  returnTo?: string
  enrollTarget?: CatalogEnrollTarget
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
  return enrollInProgram(target.slug, acceptedTerms)
}

/** Where a learner goes to accept the terms and enrol when that was not done before signing in. */
export function cataloguePathForTarget(target: CatalogEnrollTarget): string {
  return target.kind === "course" ? `/courses/${target.slug}` : `/programmes/${target.slug}`
}
