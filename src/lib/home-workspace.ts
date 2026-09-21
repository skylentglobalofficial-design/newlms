import { authoredCourseList, courseProductProfile } from "./course-product"
import { coursePublicView } from "./catalog-maturity"
import { getCareerEvidence, getCourseQuiz, getLessonMeta } from "../content/course-lookups"

export function authoredWorkspace(slug: string) {
  const course = authoredCourseList().find((item) => item.slug === slug)
  if (!course) return null
  const profile = courseProductProfile(course.slug)
  const view = coursePublicView(course)
  const lessons = course.modules.flatMap((module) => module.lessons)
  const firstLesson = course.modules[0]?.lessons[0]
  const firstQuiz = lessons.find((lesson) => lesson.type === "quiz")
  const capstone = lessons.find((lesson) => /capstone|product case/i.test(lesson.title))
  const quiz = getCourseQuiz(course.slug, firstQuiz?.id)
  const lessonMeta = firstLesson ? getLessonMeta(course.slug, firstLesson.id) : undefined
  const evidence = capstone ? getCareerEvidence(course.slug, capstone.id) : undefined
  return {
    slug: course.slug,
    title: course.title,
    href: `/courses/${course.slug}`,
    modules: course.modules.map((module) => module.title),
    path: course.modules.slice(0, 3).map((module, index) => ({
      id: module.id,
      title: module.title,
      state: index < 2 ? "done" : "now",
    })),
    lessonTitle: firstLesson?.title ?? "Open the first lesson",
    lessonObjective: lessonMeta?.objective ?? null,
    practiceTitle: firstQuiz?.title ?? "Practice",
    practicePrompt: quiz?.questions[0]?.prompt ?? null,
    workTitle: profile?.project?.note?.split(" — ")[0] ?? capstone?.title ?? "Capstone",
    workNote: profile?.project?.note ?? null,
    material: profile?.datasets[0]?.filename ?? null,
    visual: profile?.visual ?? "northwind",
    lessonCount: view.stats.lessonCount,
    quizCount: view.stats.quizCount,
    assignmentCount: view.stats.assignmentCount,
    evidenceTitle: evidence?.artifact ?? capstone?.title ?? "Work sample you keep",
  }
}

export type AuthoredWorkspace = NonNullable<ReturnType<typeof authoredWorkspace>>
