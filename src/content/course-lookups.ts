import {
  FLAGSHIP_COURSE_SLUG,
  PRODUCT_MANAGEMENT_SLUG,
  PYTHON_PROGRAMMING_SLUG,
  DATA_SCIENCE_SLUG,
  GENERATIVE_AI_SLUG,
  FULL_STACK_WEB_SLUG,
} from "../lib/authored-courses"
import { DA_CAREER_EVIDENCE } from "./data-analytics/career-evidence"
import { getDaLessonMeta, type WrittenLessonMeta } from "./data-analytics/lessons"
import { PM_CAREER_EVIDENCE } from "./product-management/career-evidence"
import { getPmLessonMeta } from "./product-management/lessons"
import { PYTHON_CAREER_EVIDENCE } from "./python-programming/career-evidence"
import { getPythonLessonMeta } from "./python-programming/lessons"
import { DS_CAREER_EVIDENCE } from "./data-science-ai/career-evidence"
import { getDsLessonMeta } from "./data-science-ai/lessons"
import { GENAI_CAREER_EVIDENCE } from "./generative-ai/career-evidence"
import { getGenAiLessonMeta } from "./generative-ai/lessons"
import { FSW_CAREER_EVIDENCE } from "./full-stack-web/career-evidence"
import { getFswLessonMeta } from "./full-stack-web/lessons"

export type { WrittenLessonMeta }

export function getLessonMeta(courseSlug: string | undefined, lessonId: string | undefined): WrittenLessonMeta | undefined {
  if (!courseSlug || !lessonId) return undefined
  if (courseSlug === FLAGSHIP_COURSE_SLUG) return getDaLessonMeta(lessonId)
  if (courseSlug === PRODUCT_MANAGEMENT_SLUG) return getPmLessonMeta(lessonId)
  if (courseSlug === PYTHON_PROGRAMMING_SLUG) return getPythonLessonMeta(lessonId)
  if (courseSlug === DATA_SCIENCE_SLUG) return getDsLessonMeta(lessonId)
  if (courseSlug === GENERATIVE_AI_SLUG) return getGenAiLessonMeta(lessonId)
  if (courseSlug === FULL_STACK_WEB_SLUG) return getFswLessonMeta(lessonId)
  return undefined
}

export function getCareerEvidence(courseSlug: string | undefined, lessonId: string) {
  if (courseSlug === PRODUCT_MANAGEMENT_SLUG) {
    return PM_CAREER_EVIDENCE.find((row) => row.lessonId === lessonId)
  }
  if (courseSlug === FLAGSHIP_COURSE_SLUG) {
    return DA_CAREER_EVIDENCE.find((row) => row.lessonId === lessonId)
  }
  if (courseSlug === PYTHON_PROGRAMMING_SLUG) {
    return PYTHON_CAREER_EVIDENCE.find((row) => row.lessonId === lessonId)
  }
  if (courseSlug === DATA_SCIENCE_SLUG) {
    return DS_CAREER_EVIDENCE.find((row) => row.lessonId === lessonId)
  }
  if (courseSlug === GENERATIVE_AI_SLUG) {
    return GENAI_CAREER_EVIDENCE.find((row) => row.lessonId === lessonId)
  }
  if (courseSlug === FULL_STACK_WEB_SLUG) {
    return FSW_CAREER_EVIDENCE.find((row) => row.lessonId === lessonId)
  }
  return undefined
}
