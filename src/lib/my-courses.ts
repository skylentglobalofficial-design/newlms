import type { ApiEnrollmentSummary } from "./lms-api"

export type MyCourseRow = {
  key: string
  enrolmentId: string
  title: string
  slug: string | null
  programmeName: string | null
  status: string
  progressPct: number | null
  completedCount: number | null
  totalLessons: number | null
  createdAt: string
}

/** One row per course the learner can open. A programme enrolment expands to each linked course. */
export function myCourseRows(enrollments: readonly ApiEnrollmentSummary[]): MyCourseRow[] {
  const rows: MyCourseRow[] = []
  const seen = new Set<string>()
  for (const item of enrollments) {
    const courses = item.courses ?? []
    if (courses.length === 0) {
      const slug = item.courseSlug
      const key = slug ? `course:${slug}` : `enrolment:${item.id}`
      if (seen.has(key)) continue
      seen.add(key)
      rows.push({
        key,
        enrolmentId: item.id,
        title: item.courseTitle ?? item.programName ?? "Enrolment",
        slug,
        programmeName: item.programName,
        status: item.status,
        progressPct: null,
        completedCount: null,
        totalLessons: null,
        createdAt: item.createdAt,
      })
      continue
    }
    for (const course of courses) {
      const key = `course:${course.slug}`
      if (seen.has(key)) continue
      seen.add(key)
      rows.push({
        key,
        enrolmentId: item.id,
        title: course.title,
        slug: course.slug,
        programmeName: item.programName,
        status: item.status,
        progressPct: course.progress.progressPct,
        completedCount: course.progress.completedCount,
        totalLessons: course.progress.totalLessons,
        createdAt: item.createdAt,
      })
    }
  }
  return rows
}
