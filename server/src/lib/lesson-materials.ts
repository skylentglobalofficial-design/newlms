import type { AuthenticatedRequest } from "./auth.js"
import { hasApiRole } from "./roles.js"
import { findCourseBySlug, findNodeByLessonKey } from "./lms.js"

export async function loadCourseLessonNode(courseSlug: string, lessonKey: string) {
  const course = await findCourseBySlug(courseSlug)
  if (!course) return { error: "course_not_found" as const }
  const located = await findNodeByLessonKey(course, lessonKey)
  if (!located) return { error: "lesson_not_found" as const, course }
  return { course, node: located.node }
}

export function canManageLessonMaterials(req: AuthenticatedRequest, _courseSlug: string): boolean {
  if (hasApiRole(req, "superadmin")) return true
  if (hasApiRole(req, "faculty")) return true
  return false
}
