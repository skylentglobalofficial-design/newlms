import { CoursePublicationStatus, type Course } from "@prisma/client"
import { isAuthoredCourse } from "./authored-courses.js"

type EnrolmentCourse = Pick<Course, "slug" | "publicationStatus" | "authoredInApp">

/**
 * Only the currently open learner-facing courses accept new direct enrolments.
 * Other authored tracks remain available to existing learners and can be opened
 * for new enrolment when their programme and operational readiness are approved.
 * A course created in the application can be enrolled only after it is published.
 */
export function courseIsEnrolable(course: EnrolmentCourse): boolean {
  if (course.publicationStatus !== CoursePublicationStatus.PUBLISHED) return false
  // Python is a linked learning track, not an independently open direct-enrolment product.
  if (course.slug === "python-programming") return false
  return isAuthoredCourse(course.slug) || course.authoredInApp
}
