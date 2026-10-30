/**
 * Full quiz banks for seed and server-side tooling only.
 * Do not import this module from client-facing UI code.
 */
import {
  FLAGSHIP_COURSE_SLUG,
  PRODUCT_MANAGEMENT_SLUG,
  PYTHON_PROGRAMMING_SLUG,
  DATA_SCIENCE_SLUG,
  GENERATIVE_AI_SLUG,
  FULL_STACK_WEB_SLUG,
} from "../lib/authored-courses"
import { getDaQuiz, type DaQuizBank } from "./data-analytics/quizzes"
import { getPmQuiz } from "./product-management/quizzes"
import { getPythonQuiz } from "./python-programming/quizzes"
import { getDsQuiz } from "./data-science-ai/quizzes"
import { getGenAiQuiz } from "./generative-ai/quizzes"
import { getFswQuiz } from "./full-stack-web/quizzes"

export type CourseQuizBank = DaQuizBank

export function getCourseQuiz(courseSlug: string | undefined, lessonId: string | undefined): CourseQuizBank | undefined {
  if (!courseSlug || !lessonId) return undefined
  if (courseSlug === FLAGSHIP_COURSE_SLUG) return getDaQuiz(lessonId)
  if (courseSlug === PRODUCT_MANAGEMENT_SLUG) return getPmQuiz(lessonId)
  if (courseSlug === PYTHON_PROGRAMMING_SLUG) return getPythonQuiz(lessonId)
  if (courseSlug === DATA_SCIENCE_SLUG) return getDsQuiz(lessonId)
  if (courseSlug === GENERATIVE_AI_SLUG) return getGenAiQuiz(lessonId)
  if (courseSlug === FULL_STACK_WEB_SLUG) return getFswQuiz(lessonId)
  return undefined
}

export function quizSeedKey(courseSlug: string, lessonId: string): string {
  return `${courseSlug}:${lessonId}`
}
