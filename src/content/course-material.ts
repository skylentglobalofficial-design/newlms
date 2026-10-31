import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG, isAuthoredCourse } from "../lib/authored-courses"
import { getDaAssignment, type AssignmentBrief } from "./data-analytics/assignments"
import { DATA_ANALYTICS_DATASETS } from "./data-analytics/datasets"
import { DA_LESSON_BODIES } from "./data-analytics/lesson-bodies"
import {
  getMultiTrackAssignment,
  getMultiTrackDataset,
  getMultiTrackLessonBody,
  isMultiTrackAuthoredCourse,
} from "./multi-track-packs"
import { getPmAssignment } from "./product-management/assignments"
import { PM_LESSON_BODIES } from "./product-management/lesson-bodies"
import { getCareerEvidence, getLessonMeta, type WrittenLessonMeta } from "./course-lookups"

export type LessonResource = {
  filename: string
  href: string
}

export type { AssignmentBrief, WrittenLessonMeta }
export { getCareerEvidence, getLessonMeta }

export type CourseLessonContent = {
  slug: string
  meta: WrittenLessonMeta
  body: string
  assignment?: AssignmentBrief
  datasets: LessonResource[]
}

const HARBOR_CASE: LessonResource = {
  filename: "harbor-desk-case.md",
  href: "/content/product-management/harbor-desk-case.md",
}

export function getCourseLessonContent(courseSlug: string | undefined, lessonId: string | undefined): CourseLessonContent | null {
  if (!courseSlug || !lessonId) return null
  if (!isAuthoredCourse(courseSlug) && !isMultiTrackAuthoredCourse(courseSlug)) return null
  const meta = getLessonMeta(courseSlug, lessonId)
  const body =
    courseSlug === FLAGSHIP_COURSE_SLUG
      ? DA_LESSON_BODIES[lessonId]
      : courseSlug === PRODUCT_MANAGEMENT_SLUG
        ? PM_LESSON_BODIES[lessonId]
        : isMultiTrackAuthoredCourse(courseSlug)
          ? getMultiTrackLessonBody(courseSlug, lessonId)
          : undefined
  if (!meta || !body) return null

  if (courseSlug === FLAGSHIP_COURSE_SLUG) {
    return {
      slug: courseSlug,
      meta,
      body,
      assignment: getDaAssignment(lessonId),
      datasets: DATA_ANALYTICS_DATASETS.filter((row) => row.usedIn.includes(lessonId)).map((row) => ({
        filename: row.filename,
        href: row.href,
      })),
    }
  }

  if (courseSlug === PRODUCT_MANAGEMENT_SLUG) {
    return {
      slug: courseSlug,
      meta,
      body,
      assignment: getPmAssignment(lessonId),
      datasets: [HARBOR_CASE],
    }
  }

  return {
    slug: courseSlug,
    meta,
    body,
    assignment: getMultiTrackAssignment(courseSlug, lessonId),
    datasets: getMultiTrackDataset(courseSlug),
  }
}
