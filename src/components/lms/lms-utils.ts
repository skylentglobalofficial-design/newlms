import type { CourseLesson, CourseModule } from '../../data'
import type { LessonState } from '../../demo/types'

export type LmsCourseView = {
  slug: string
  title: string
  modules: CourseModule[]
}

export type LessonNav = { lesson: CourseLesson; module: CourseModule; moduleIndex: number }

export function flattenLessons(course: LmsCourseView): LessonNav[] {
  return course.modules.flatMap((mod, mi) =>
    mod.lessons.map(lesson => ({ lesson, module: mod, moduleIndex: mi + 1 })),
  )
}

export function isLessonUnlocked(
  lessonId: string,
  allLessons: CourseLesson[],
  lessonStates: Record<string, LessonState>,
): boolean {
  const idx = allLessons.findIndex(l => l.id === lessonId)
  if (idx <= 0) return true
  const prev = allLessons[idx - 1]
  return prev ? (lessonStates[prev.id]?.complete ?? false) : false
}

export function computeCourseProgress(
  allLessons: CourseLesson[],
  lessonStates: Record<string, LessonState>,
) {
  const completedCount = allLessons.filter(l => lessonStates[l.id]?.complete).length
  const totalLessons = allLessons.length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  return { completedCount, totalLessons, progressPct, allComplete: totalLessons > 0 && completedCount === totalLessons }
}

export function computeModuleProgress(
  module: CourseModule,
  lessonStates: Record<string, LessonState>,
) {
  const completed = module.lessons.filter(l => lessonStates[l.id]?.complete).length
  const total = module.lessons.length
  return {
    completed,
    total,
    pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    complete: total > 0 && completed === total,
    current: module.lessons.find(l => !lessonStates[l.id]?.complete) ?? null,
  }
}

export function getAdjacentLessons(allLessons: CourseLesson[], lessonId: string) {
  const idx = allLessons.findIndex(l => l.id === lessonId)
  return {
    prev: idx > 0 ? allLessons[idx - 1] : null,
    next: idx >= 0 && idx < allLessons.length - 1 ? allLessons[idx + 1] : null,
    index: idx,
  }
}

export function defaultTabForLesson(lesson: CourseLesson): 'video' | 'notes' | 'quiz' | 'assignment' {
  if (lesson.type === 'notes') return 'notes'
  if (lesson.type === 'quiz') return 'quiz'
  if (lesson.type === 'assignment') return 'assignment'
  return 'video'
}

export function lessonTypeLabel(type: CourseLesson['type']) {
  switch (type) {
    case 'video': return 'Video lesson'
    case 'notes': return 'Reading'
    case 'quiz': return 'Practice quiz'
    case 'assignment': return 'Assignment'
  }
}

export type PendingTask = {
  id: string
  kind: 'lesson' | 'quiz' | 'assignment'
  title: string
  courseSlug: string
  courseTitle: string
  lessonId: string
  moduleTitle: string
}

export function getPendingTasks(course: LmsCourseView, lessonStates: Record<string, LessonState>): PendingTask[] {
  const tasks: PendingTask[] = []
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (!isLessonUnlocked(lesson.id, course.modules.flatMap(m => m.lessons), lessonStates)) continue
      const state = lessonStates[lesson.id]
      if (state?.complete) continue
      tasks.push({
        id: `${course.slug}-${lesson.id}`,
        kind: lesson.type === 'quiz' ? 'quiz' : lesson.type === 'assignment' ? 'assignment' : 'lesson',
        title: lesson.title,
        courseSlug: course.slug,
        courseTitle: course.title,
        lessonId: lesson.id,
        moduleTitle: mod.title,
      })
      if (tasks.length >= 4) return tasks
    }
  }
  return tasks
}

export type RecentActivity = {
  id: string
  label: string
  detail: string
  courseSlug: string
  lessonId?: string
}

export function getRecentActivity(
  courses: LmsCourseView[],
  getLessonStates: (slug: string) => Record<string, LessonState>,
): RecentActivity[] {
  const items: RecentActivity[] = []
  for (const course of courses) {
    const states = getLessonStates(course.slug)
    const lessons = course.modules.flatMap(m => m.lessons)
    for (const lesson of [...lessons].reverse()) {
      if (states[lesson.id]?.complete) {
        items.push({
          id: `${course.slug}-${lesson.id}`,
          label: `Completed · ${lesson.title}`,
          detail: course.title,
          courseSlug: course.slug,
          lessonId: lesson.id,
        })
        if (items.length >= 5) return items
      }
    }
  }
  return items
}
