type LessonList = { lessons?: unknown[] }
type ModuleList = { modules?: LessonList[] }

export function countStaticCourseLessons(course: ModuleList): number {
  return (course.modules ?? []).reduce((sum, module) => sum + (module.lessons?.length ?? 0), 0)
}

/** Prefer catalog CurriculumNode counts; otherwise count static module lessons. Never use marketing totals. */
export function displayLessonCount(
  catalogLessonCount: number | null | undefined,
  course: ModuleList,
): string {
  const fromCatalog = typeof catalogLessonCount === "number" && catalogLessonCount > 0 ? catalogLessonCount : 0
  const fromModules = countStaticCourseLessons(course)
  const count = fromCatalog || fromModules
  if (count > 0) return String(count)
  return "Curriculum available inside the course"
}

export function displayLessonStat(countLabel: string): string {
  if (/^\d+$/.test(countLabel)) return `${countLabel} lessons`
  return countLabel
}

export function displayProgramModuleCount(
  catalogModuleCount: number | null | undefined,
  curriculumDetailLength: number,
): number {
  if (typeof catalogModuleCount === "number" && catalogModuleCount > 0) return catalogModuleCount
  if (curriculumDetailLength > 0) return curriculumDetailLength
  return 0
}

export function formatModuleCount(count: number): string {
  return count > 0 ? String(count) : "Curriculum available inside the course"
}
