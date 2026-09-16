import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG, isAuthoredCourse } from '../lib/authored-courses'
import { getDaAssignment, type AssignmentBrief } from './data-analytics/assignments'
import { DA_CAREER_EVIDENCE } from './data-analytics/career-evidence'
import { DATA_ANALYTICS_DATASETS } from './data-analytics/datasets'
import { DA_LESSON_BODIES } from './data-analytics/lesson-bodies'
import { getDaLessonMeta, type WrittenLessonMeta } from './data-analytics/lessons'
import { getDaQuiz, type DaQuizBank } from './data-analytics/quizzes'
import { getPmAssignment } from './product-management/assignments'
import { PM_CAREER_EVIDENCE } from './product-management/career-evidence'
import { PM_LESSON_BODIES } from './product-management/lesson-bodies'
import { getPmLessonMeta } from './product-management/lessons'
import { getPmQuiz } from './product-management/quizzes'

export type LessonResource = {
  filename: string
  href: string
}

export type CourseQuizBank = DaQuizBank

export type CourseLessonContent = {
  slug: string
  meta: WrittenLessonMeta
  body: string
  assignment?: AssignmentBrief
  quiz?: CourseQuizBank
  datasets: LessonResource[]
}

const HARBOR_CASE: LessonResource = {
  filename: 'harbor-desk-case.md',
  href: '/content/product-management/harbor-desk-case.md',
}

export function getLessonMeta(courseSlug: string | undefined, lessonId: string | undefined): WrittenLessonMeta | undefined {
  if (!courseSlug || !lessonId) return undefined
  if (courseSlug === FLAGSHIP_COURSE_SLUG) return getDaLessonMeta(lessonId)
  if (courseSlug === PRODUCT_MANAGEMENT_SLUG) return getPmLessonMeta(lessonId)
  return undefined
}

export function getCourseQuiz(courseSlug: string | undefined, lessonId: string | undefined): CourseQuizBank | undefined {
  if (!courseSlug || !lessonId) return undefined
  if (courseSlug === FLAGSHIP_COURSE_SLUG) return getDaQuiz(lessonId)
  if (courseSlug === PRODUCT_MANAGEMENT_SLUG) return getPmQuiz(lessonId)
  return undefined
}

export function getCourseLessonContent(courseSlug: string | undefined, lessonId: string | undefined): CourseLessonContent | null {
  if (!courseSlug || !lessonId || !isAuthoredCourse(courseSlug)) return null
  const meta = getLessonMeta(courseSlug, lessonId)
  const body =
    courseSlug === FLAGSHIP_COURSE_SLUG
      ? DA_LESSON_BODIES[lessonId]
      : courseSlug === PRODUCT_MANAGEMENT_SLUG
        ? PM_LESSON_BODIES[lessonId]
        : undefined
  if (!meta || !body) return null

  if (courseSlug === FLAGSHIP_COURSE_SLUG) {
    return {
      slug: courseSlug,
      meta,
      body,
      assignment: getDaAssignment(lessonId),
      quiz: getDaQuiz(lessonId),
      datasets: DATA_ANALYTICS_DATASETS.filter((row) => row.usedIn.includes(lessonId)).map((row) => ({
        filename: row.filename,
        href: row.href,
      })),
    }
  }

  return {
    slug: courseSlug,
    meta,
    body,
    assignment: getPmAssignment(lessonId),
    quiz: getPmQuiz(lessonId),
    datasets: [HARBOR_CASE],
  }
}

export function getCareerEvidence(courseSlug: string | undefined, lessonId: string) {
  if (courseSlug === PRODUCT_MANAGEMENT_SLUG) {
    return PM_CAREER_EVIDENCE.find((row) => row.lessonId === lessonId)
  }
  if (courseSlug === FLAGSHIP_COURSE_SLUG || !courseSlug) {
    return DA_CAREER_EVIDENCE.find((row) => row.lessonId === lessonId)
  }
  return undefined
}

export function quizSeedKey(courseSlug: string, lessonId: string): string {
  return `${courseSlug}:${lessonId}`
}
