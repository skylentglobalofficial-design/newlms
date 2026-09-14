import { getDaAssignment, type AssignmentBrief } from './data-analytics/assignments'
import { DA_CAREER_EVIDENCE } from './data-analytics/career-evidence'
import { DATA_ANALYTICS_DATASETS } from './data-analytics/datasets'
import { DA_LESSON_BODIES } from './data-analytics/lesson-bodies'
import { getDaLessonMeta, type WrittenLessonMeta } from './data-analytics/lessons'
import { getDaQuiz, type DaQuizBank } from './data-analytics/quizzes'

export type CourseLessonContent = {
  slug: string
  meta: WrittenLessonMeta
  body: string
  assignment?: AssignmentBrief
  quiz?: DaQuizBank
  datasets: typeof DATA_ANALYTICS_DATASETS
}

export function getCourseLessonContent(courseSlug: string | undefined, lessonId: string | undefined): CourseLessonContent | null {
  if (courseSlug !== 'data-analytics' || !lessonId) return null
  const meta = getDaLessonMeta(lessonId)
  const body = DA_LESSON_BODIES[lessonId]
  if (!meta || !body) return null
  return {
    slug: courseSlug,
    meta,
    body,
    assignment: getDaAssignment(lessonId),
    quiz: getDaQuiz(lessonId),
    datasets: DATA_ANALYTICS_DATASETS.filter((row) => row.usedIn.includes(lessonId)),
  }
}

export function getCareerEvidence(lessonId: string) {
  return DA_CAREER_EVIDENCE.find((row) => row.lessonId === lessonId)
}
