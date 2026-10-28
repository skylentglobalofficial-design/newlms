import { CoursePublicationStatus, type Course } from "@prisma/client"
import { isAuthoredCourse } from "./authored-courses.js"

type EnrolmentCourse = Pick<Course, "slug" | "publicationStatus" | "authoredInApp">

/**
 * Existing catalogue courses stay behind the authored-slug allowlist.
 * A course created in the application can be enrolled only after it is published.
 */
export function courseIsEnrolable(course: EnrolmentCourse): boolean {
  if (course.publicationStatus !== CoursePublicationStatus.PUBLISHED) return false
  return isAuthoredCourse(course.slug) || course.authoredInApp
}
