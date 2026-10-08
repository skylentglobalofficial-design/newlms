/**
 * Facts about the authored Data Analytics course, read from the course data so the
 * product plates on the homepage never state a count or a title of their own.
 */
import { AUTHORED_COURSE_SLUG, courseBySlug, courseLessonStats } from "@/lib/catalog-maturity"

/** The lesson every homepage plate is "open on". */
export const PLATE_LESSON_ID = "l7"
/** The capstone assignment used as the project in Build, Prove and Career OS. */
const CAPSTONE_LESSON_ID = "l14"

export type PlateLesson = { id: string; label: string; title: string; kind: string; duration: string }
export type PlateModule = {
  id: string
  label: string
  title: string
  lessons: PlateLesson[]
  done: number
  state: "complete" | "current" | "ahead"
}

export type CourseFacts = {
  slug: string
  title: string
  modules: PlateModule[]
  currentModule: PlateModule
  currentModuleNumber: number
  current: PlateLesson
  lessonNumber: number
  done: number
  total: number
  percent: number
  capstoneTitle: string
  capstoneModuleNumber: number
  stats: { modules: number; lessons: number; assignments: number; checks: number }
}

function kindOf(type: string): string {
  return type === "notes" ? "Notes" : type === "quiz" ? "Check" : "Assignment"
}

/** A learner part-way through: every lesson before lesson 7 complete, lesson 7 open. */
export function courseFacts(): CourseFacts | null {
  const course = courseBySlug(AUTHORED_COURSE_SLUG)
  if (!course) return null
  const all = course.modules.flatMap((module) => module.lessons)
  const position = all.findIndex((lesson) => lesson.id === PLATE_LESSON_ID)
  if (position < 0) return null
  const toPlate = (lesson: (typeof all)[number]): PlateLesson => ({
    id: lesson.id,
    label: `L${all.indexOf(lesson) + 1}`,
    title: lesson.title,
    kind: kindOf(lesson.type),
    duration: lesson.duration ?? "",
  })
  const currentModuleIndex = course.modules.findIndex((module) => module.lessons.some((lesson) => lesson.id === PLATE_LESSON_ID))
  const modules: PlateModule[] = course.modules.map((module, index) => {
    const done = module.lessons.filter((lesson) => all.indexOf(lesson) < position).length
    return {
      id: module.id,
      label: `M${index + 1}`,
      title: module.title,
      lessons: module.lessons.map(toPlate),
      done,
      state: index < currentModuleIndex ? "complete" : index === currentModuleIndex ? "current" : "ahead",
    }
  })
  const capstoneModuleIndex = course.modules.findIndex((module) => module.lessons.some((lesson) => lesson.id === CAPSTONE_LESSON_ID))
  const capstone = all.find((lesson) => lesson.id === CAPSTONE_LESSON_ID)
  const stats = courseLessonStats(course)
  return {
    slug: course.slug,
    title: course.title,
    modules,
    currentModule: modules[currentModuleIndex],
    currentModuleNumber: currentModuleIndex + 1,
    current: toPlate(all[position]),
    lessonNumber: position + 1,
    done: position,
    total: all.length,
    percent: Math.round((position / all.length) * 100),
    capstoneTitle: capstone?.title ?? "",
    capstoneModuleNumber: capstoneModuleIndex + 1,
    stats: {
      modules: stats.moduleCount,
      lessons: stats.lessonCount,
      assignments: stats.assignmentCount,
      checks: stats.quizCount,
    },
  }
}
