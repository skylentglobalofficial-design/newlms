import {
  FLAGSHIP_COURSE_SLUG,
  PRODUCT_MANAGEMENT_SLUG,
  PYTHON_PROGRAMMING_SLUG,
  DATA_SCIENCE_SLUG,
  GENERATIVE_AI_SLUG,
  FULL_STACK_WEB_SLUG,
  isAuthoredCourse,
} from "../lib/authored-courses"
import { getDaAssignment, type AssignmentBrief } from "./data-analytics/assignments"
import { DATA_ANALYTICS_DATASETS } from "./data-analytics/datasets"
import { DA_LESSON_BODIES } from "./data-analytics/lesson-bodies"
import { getPmAssignment } from "./product-management/assignments"
import { PM_LESSON_BODIES } from "./product-management/lesson-bodies"
import { getPythonAssignment } from "./python-programming/assignments"
import { PYTHON_LESSON_BODIES } from "./python-programming/lesson-bodies"
import { getDsAssignment } from "./data-science-ai/assignments"
import { DS_LESSON_BODIES } from "./data-science-ai/lesson-bodies"
import { getGenAiAssignment } from "./generative-ai/assignments"
import { GENAI_LESSON_BODIES } from "./generative-ai/lesson-bodies"
import { getFswAssignment } from "./full-stack-web/assignments"
import { FSW_LESSON_BODIES } from "./full-stack-web/lesson-bodies"
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

const PYTHON_WORKSPACE_RESOURCE: LessonResource = {
  filename: "python-starter-suite.py",
  href: "/content/python-programming/python-starter-suite.py",
}

const DS_WORKSPACE_RESOURCE: LessonResource = {
  filename: "credit_risk_dataset.csv",
  href: "/content/data-analytics/northwind_sales.csv",
}

const GENAI_WORKSPACE_RESOURCE: LessonResource = {
  filename: "rag_knowledge_base.md",
  href: "/content/product-management/harbor-desk-case.md",
}

const FSW_WORKSPACE_RESOURCE: LessonResource = {
  filename: "schema.sql",
  href: "/content/python-programming/python-starter-suite.py",
}

export function getCourseLessonContent(courseSlug: string | undefined, lessonId: string | undefined): CourseLessonContent | null {
  if (!courseSlug || !lessonId || !isAuthoredCourse(courseSlug)) return null
  const meta = getLessonMeta(courseSlug, lessonId)
  let body: string | undefined
  let assignment: AssignmentBrief | undefined
  let datasets: LessonResource[] = []

  if (courseSlug === FLAGSHIP_COURSE_SLUG) {
    body = DA_LESSON_BODIES[lessonId]
    assignment = getDaAssignment(lessonId)
    datasets = DATA_ANALYTICS_DATASETS.filter((row) => row.usedIn.includes(lessonId)).map((row) => ({
      filename: row.filename,
      href: row.href,
    }))
  } else if (courseSlug === PRODUCT_MANAGEMENT_SLUG) {
    body = PM_LESSON_BODIES[lessonId]
    assignment = getPmAssignment(lessonId)
    datasets = [HARBOR_CASE]
  } else if (courseSlug === PYTHON_PROGRAMMING_SLUG) {
    body = PYTHON_LESSON_BODIES[lessonId]
    assignment = getPythonAssignment(lessonId)
    datasets = [PYTHON_WORKSPACE_RESOURCE]
  } else if (courseSlug === DATA_SCIENCE_SLUG) {
    body = DS_LESSON_BODIES[lessonId]
    assignment = getDsAssignment(lessonId)
    datasets = [DS_WORKSPACE_RESOURCE]
  } else if (courseSlug === GENERATIVE_AI_SLUG) {
    body = GENAI_LESSON_BODIES[lessonId]
    assignment = getGenAiAssignment(lessonId)
    datasets = [GENAI_WORKSPACE_RESOURCE]
  } else if (courseSlug === FULL_STACK_WEB_SLUG) {
    body = FSW_LESSON_BODIES[lessonId]
    assignment = getFswAssignment(lessonId)
    datasets = [FSW_WORKSPACE_RESOURCE]
  }

  if (!meta || !body) return null

  return {
    slug: courseSlug,
    meta,
    body,
    assignment,
    datasets,
  }
}
