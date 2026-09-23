import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from "../lib/authored-courses"
import { DA_CAREER_EVIDENCE } from "./data-analytics/career-evidence"
import { getDaLessonMeta, type WrittenLessonMeta } from "./data-analytics/lessons"
import { PM_CAREER_EVIDENCE } from "./product-management/career-evidence"
import { getPmLessonMeta } from "./product-management/lessons"

export type { WrittenLessonMeta }

export function getLessonMeta(courseSlug: string | undefined, lessonId: string | undefined): WrittenLessonMeta | undefined {
  if (!courseSlug || !lessonId) return undefined
  if (courseSlug === FLAGSHIP_COURSE_SLUG) return getDaLessonMeta(lessonId)
  if (courseSlug === PRODUCT_MANAGEMENT_SLUG) return getPmLessonMeta(lessonId)
  return undefined
}

export function getCareerEvidence(courseSlug: string | undefined, lessonId: string) {
  if (courseSlug === PRODUCT_MANAGEMENT_SLUG) {
    return PM_CAREER_EVIDENCE.find((row) => row.lessonId === lessonId)
  }
  if (courseSlug === FLAGSHIP_COURSE_SLUG) {
    return DA_CAREER_EVIDENCE.find((row) => row.lessonId === lessonId)
  }
  return undefined
}
