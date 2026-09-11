/** Canonical live programme → LMS course links. Keep seed and integrity checks in lockstep. */
export const LIVE_PROGRAM_COURSE_LINKS = [
  { programSlug: "data-analytics-pro", courseSlug: "data-analytics", sortOrder: 0 },
  { programSlug: "data-science-ai", courseSlug: "data-analytics", sortOrder: 0 },
  { programSlug: "data-science-ai", courseSlug: "python-programming", sortOrder: 1 },
  { programSlug: "full-stack", courseSlug: "full-stack-web", sortOrder: 0 },
  { programSlug: "generative-ai-program", courseSlug: "generative-ai", sortOrder: 0 },
  { programSlug: "product-management", courseSlug: "product-management", sortOrder: 0 },
] as const

export function expectedCourseSlugsForProgram(programSlug: string): string[] {
  return LIVE_PROGRAM_COURSE_LINKS.filter((link) => link.programSlug === programSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((link) => link.courseSlug)
}
