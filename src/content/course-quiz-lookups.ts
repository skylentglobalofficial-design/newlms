/**
 * Full quiz banks for seed and server-side tooling only.
 * Do not import this module from client-facing UI code.
 */
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from "../lib/authored-courses"
import { getDaQuiz, type DaQuizBank } from "./data-analytics/quizzes"
import { getPmQuiz } from "./product-management/quizzes"

export type CourseQuizBank = DaQuizBank

export function getCourseQuiz(courseSlug: string | undefined, lessonId: string | undefined): CourseQuizBank | undefined {
  if (!courseSlug || !lessonId) return undefined
  if (courseSlug === FLAGSHIP_COURSE_SLUG) return getDaQuiz(lessonId)
  if (courseSlug === PRODUCT_MANAGEMENT_SLUG) return getPmQuiz(lessonId)
  return undefined
}

export function quizSeedKey(courseSlug: string, lessonId: string): string {
  return `${courseSlug}:${lessonId}`
}
