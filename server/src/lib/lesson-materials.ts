import type { AuthenticatedRequest } from "./auth.js"
import { hasApiRole } from "./roles.js"
import { findCourseBySlug, findNodeByLessonKey } from "./lms.js"

/** Demo teaching course slug — faculty demo accounts may manage materials only for this course. */
export const DEMO_TEACHING_COURSE_SLUG = "data-analytics"

export async function loadCourseLessonNode(courseSlug: string, lessonKey: string) {
  const course = await findCourseBySlug(courseSlug)
  if (!course) return { error: "course_not_found" as const }
  const located = await findNodeByLessonKey(course, lessonKey)
  if (!located) return { error: "lesson_not_found" as const, course }
  return { course, node: located.node }
}

function isDemoFacultyAccount(email: string | null | undefined): boolean {
  return email?.endsWith("@demo.skylent.dev") ?? false
}

/**
 * Faculty material management scope:
 * - superadmin: any course
 * - demo faculty (@demo.skylent.dev): demo teaching course only
 * - other faculty: denied until course assignment is modeled in the schema
 *
 * Remaining limitation: there is no per-faculty course assignment table yet.
 */
export function canManageLessonMaterials(req: AuthenticatedRequest, courseSlug: string): boolean {
  if (hasApiRole(req, "superadmin")) return true
  if (hasApiRole(req, "faculty") && isDemoFacultyAccount(req.auth?.user.email)) {
    return courseSlug === DEMO_TEACHING_COURSE_SLUG
  }
  return false
}
