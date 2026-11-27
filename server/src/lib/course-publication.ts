import { CoursePublicationStatus, type Course } from "@prisma/client"
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from "./authored-courses.js"

type EnrolmentCourse = Pick<Course, "slug" | "publicationStatus" | "authoredInApp">

/**
 * Only the currently open learner-facing courses accept new direct enrolments.
 * Other authored tracks remain available to existing learners and can be opened
 * for new enrolment when their programme and operational readiness are approved.
 * A course created in the application can be enrolled only after it is published.
 */
export function courseIsEnrolable(course: EnrolmentCourse): boolean {
  if (course.publicationStatus !== CoursePublicationStatus.PUBLISHED) return false
  return course.slug === FLAGSHIP_COURSE_SLUG || course.slug === PRODUCT_MANAGEMENT_SLUG || course.authoredInApp
}
