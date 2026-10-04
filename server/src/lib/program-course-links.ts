import { prisma } from "./prisma.js"

/** Catalogue links the public site and enrolment already expect. Idempotent. */
const PROGRAM_COURSE_LINKS: { programSlug: string; courseSlug: string; sortOrder: number }[] = [
  { programSlug: "data-analytics-pro", courseSlug: "data-analytics", sortOrder: 0 },
  { programSlug: "data-science-ai", courseSlug: "data-analytics", sortOrder: 0 },
  { programSlug: "data-science-ai", courseSlug: "python-programming", sortOrder: 1 },
  { programSlug: "full-stack", courseSlug: "full-stack-web", sortOrder: 0 },
  { programSlug: "generative-ai-program", courseSlug: "generative-ai", sortOrder: 0 },
  { programSlug: "product-management", courseSlug: "product-management", sortOrder: 0 },
]

let linksReady = false

export async function ensureProgramCourseLinks(): Promise<void> {
  if (linksReady) return

  for (const link of PROGRAM_COURSE_LINKS) {
    const program = await prisma.program.findUnique({
      where: { slug: link.programSlug },
      select: { id: true },
    })
    const course = await prisma.course.findUnique({
      where: { slug: link.courseSlug },
      select: { id: true },
    })
    if (!program || !course) continue

    await prisma.programCourse.upsert({
      where: { programId_courseId: { programId: program.id, courseId: course.id } },
      update: { sortOrder: link.sortOrder },
      create: { programId: program.id, courseId: course.id, sortOrder: link.sortOrder },
    })
  }

  linksReady = true
}
