import { enrollInCourse, enrollInProgram, type ApiCourseWorkspace } from "./lms-api"

export type CatalogEnrollTarget =
  | { kind: "course"; slug: string }
  | { kind: "program"; slug: string }

export type LoginRedirectState = {
  returnTo?: string
  enrollTarget?: CatalogEnrollTarget
}

export function enrollReturnPath(target: CatalogEnrollTarget): string {
  return target.kind === "program" ? `/programs/${target.slug}` : `/courses/${target.slug}`
}

export function learnPathForWorkspace(workspace: ApiCourseWorkspace): string {
  return `/learn/${workspace.enrollment.courseSlug}`
}

export async function fulfillCatalogEnrollment(target: CatalogEnrollTarget): Promise<ApiCourseWorkspace> {
  if (target.kind === "course") {
    return enrollInCourse(target.slug)
  }
  return enrollInProgram(target.slug)
}
