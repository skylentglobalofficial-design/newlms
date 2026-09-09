/**
 * Programs that can create LMS enrollment via POST /lms/enrollments { programSlug }.
 * Keep in sync with prisma/seed.ts (seedProgramCourses imports this list).
 */
export type ProgramLmsCourseLink = {
  programSlug: string
  courseSlug: string
  sortOrder: number
}

export const PROGRAM_LMS_COURSE_LINKS: ProgramLmsCourseLink[] = [
  { programSlug: "data-analytics-pro", courseSlug: "data-analytics", sortOrder: 0 },
  { programSlug: "data-science-ai", courseSlug: "data-analytics", sortOrder: 0 },
  { programSlug: "data-science-ai", courseSlug: "python-programming", sortOrder: 1 },
  { programSlug: "full-stack", courseSlug: "full-stack-web", sortOrder: 0 },
  { programSlug: "generative-ai-program", courseSlug: "generative-ai", sortOrder: 0 },
  { programSlug: "product-management", courseSlug: "product-management", sortOrder: 0 },
]

const ENROLLABLE_PROGRAM_SLUGS = new Set(
  PROGRAM_LMS_COURSE_LINKS.map((link) => link.programSlug),
)

export function isProgramLmsEnrollable(programSlug: string): boolean {
  return ENROLLABLE_PROGRAM_SLUGS.has(programSlug)
}

export function primaryLmsCourseSlugForProgram(programSlug: string): string | null {
  const links = PROGRAM_LMS_COURSE_LINKS
    .filter((link) => link.programSlug === programSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  return links[0]?.courseSlug ?? null
}
