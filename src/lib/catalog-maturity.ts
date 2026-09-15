import { courses, programs, type Course, type CourseLesson, type Program } from "../data"
import { countStaticCourseLessons } from "./curriculum-counts"
import { AUTHORED_COURSE_SLUG, isAuthoredCourse } from "./live-intents"

export { AUTHORED_COURSE_SLUG, isAuthoredCourse }

export type PublicMaturity = "ready" | "listing" | "coming_later"

export type ProgramCourseLink = {
  programSlug: string
  courseSlug: string
  sortOrder: number
}

/** Single source of truth for programme → LMS course links. Used by seed and the public catalogue. */
export const PROGRAM_COURSE_LINKS: ProgramCourseLink[] = [
  { programSlug: "data-analytics-pro", courseSlug: "data-analytics", sortOrder: 0 },
  { programSlug: "data-science-ai", courseSlug: "data-analytics", sortOrder: 0 },
  { programSlug: "data-science-ai", courseSlug: "python-programming", sortOrder: 1 },
  { programSlug: "full-stack", courseSlug: "full-stack-web", sortOrder: 0 },
  { programSlug: "generative-ai-program", courseSlug: "generative-ai", sortOrder: 0 },
  { programSlug: "product-management", courseSlug: "product-management", sortOrder: 0 },
]

export function linkedCourseSlugsForProgram(programSlug: string): string[] {
  return PROGRAM_COURSE_LINKS.filter((link) => link.programSlug === programSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((link) => link.courseSlug)
}

export function maturityLabel(maturity: PublicMaturity): string {
  if (maturity === "ready") return "Ready to start"
  if (maturity === "coming_later") return "Coming later"
  return "Catalogue listing"
}

export function courseLessonStats(course: Course) {
  const lessons = course.modules.flatMap((module) => module.lessons)
  return {
    moduleCount: course.modules.length,
    lessonCount: countStaticCourseLessons(course),
    quizCount: lessons.filter((lesson) => lesson.type === "quiz").length,
    assignmentCount: lessons.filter((lesson) => lesson.type === "assignment").length,
    writtenCount: lessons.filter((lesson) => lesson.type === "notes").length,
  }
}

export function publicLessonKind(lesson: CourseLesson, authored: boolean): string {
  if (lesson.type === "quiz") return "Quiz"
  if (lesson.type === "assignment") return "Assignment"
  if (lesson.type === "notes") return "Written"
  if (authored) return "Lesson"
  return "Outline"
}

export type CoursePublicView = {
  course: Course
  slug: string
  title: string
  summary: string
  maturity: PublicMaturity
  maturityLabel: string
  delivery: string
  duration: string
  stats: ReturnType<typeof courseLessonStats>
  outcomes: string[]
  forWhom: string[]
  listedPrice: number
  ctaLabel: string
  honesty: string | null
  showLiveCurriculum: boolean
}

function listingSummary(course: Course): string {
  return `${course.title} is a catalogue listing. The LMS has an outline, not a finished course like Data Analytics.`
}

export function coursePublicView(course: Course): CoursePublicView {
  const authored = isAuthoredCourse(course.slug)
  const stats = courseLessonStats(course)
  return {
    course,
    slug: course.slug,
    title: course.title,
    summary: authored ? course.desc : listingSummary(course),
    maturity: authored ? "ready" : "listing",
    maturityLabel: authored ? "Ready to start" : "Catalogue listing",
    delivery: authored ? "Written lessons + practice" : "Catalogue listing",
    duration: course.duration,
    stats,
    outcomes: course.outcomes,
    forWhom: authored ? course.forWhom : [],
    listedPrice: course.price,
    ctaLabel: authored ? "Start this course" : "View listing",
    honesty: authored
      ? null
      : "Catalogue listing — thinner than Data Analytics. You can open the workspace; full teaching content is being built.",
    showLiveCurriculum: authored,
  }
}

export function courseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug)
}

export type LinkedLearning = {
  slug: string
  title: string
  to: string
  authored: boolean
  maturityLabel: string
}

export type ProgrammePublicView = {
  program: Program
  slug: string
  title: string
  summary: string
  maturity: PublicMaturity
  maturityLabel: string
  linked: LinkedLearning[]
  taughtOutcomes: string[]
  enrollOpen: boolean
  listedPrice: number
  honesty: string
  ctaLabel: string
}

function programmeHonesty(program: Program, linked: LinkedLearning[]): string {
  const authored = linked.filter((item) => item.authored)
  if (program.enrollmentStatus === "coming_soon") {
    return "This programme is not open yet. There is no live classroom or batch behind the listing."
  }
  if (authored.length && linked.length === authored.length) {
    return `Enrolment opens the ${authored[0].title} course — the authored learning path. Brochure modules beyond that course are not teachable here yet.`
  }
  if (authored.length) {
    return `Live teaching today is ${authored.map((item) => item.title).join(" and ")}. Other linked listings are thinner than Data Analytics. Brochure topics such as machine learning or live classes are not taught yet.`
  }
  if (linked.length) {
    return "This programme enrols you into a thinner catalogue course. It is not as complete as Data Analytics."
  }
  return "There is no linked LMS course for this programme yet."
}

export function programmePublicView(program: Program): ProgrammePublicView {
  const comingLater = program.enrollmentStatus === "coming_soon" || program.enrollmentStatus === "waitlist"
  const slugs = linkedCourseSlugsForProgram(program.slug)
  const linked: LinkedLearning[] = slugs.flatMap((slug) => {
    const course = courseBySlug(slug)
    if (!course) return []
    const authored = isAuthoredCourse(slug)
    return [{
      slug,
      title: course.title,
      to: `/courses/${slug}`,
      authored,
      maturityLabel: authored ? "Ready to start" : "Catalogue listing",
    }]
  })
  const authoredCourses = linked.filter((item) => item.authored).map((item) => courseBySlug(item.slug)).filter(Boolean) as Course[]
  const fallbackCourses = linked.map((item) => courseBySlug(item.slug)).filter(Boolean) as Course[]
  const outcomeSource = authoredCourses.length ? authoredCourses : fallbackCourses.slice(0, 1)
  const taughtOutcomes = unique(outcomeSource.flatMap((course) => course.outcomes)).slice(0, 5)
  const listedPrice = program.pricing?.length ? Math.min(...program.pricing.map((tier) => tier.price)) : 0
  const enrollOpen = program.enrollmentStatus === "open" && linked.length > 0

  return {
    program,
    slug: program.slug,
    title: program.name,
    summary: program.desc,
    maturity: comingLater ? "coming_later" : "listing",
    maturityLabel: comingLater ? "Coming later" : "Catalogue listing",
    linked,
    taughtOutcomes,
    enrollOpen,
    listedPrice,
    honesty: programmeHonesty(program, linked),
    ctaLabel: comingLater ? "Coming later" : enrollOpen ? "Enrol" : "View programme",
  }
}

function unique(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const key = value.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(value)
  }
  return out
}

export const READY_COURSE_SLUGS = courses.filter((course) => isAuthoredCourse(course.slug)).map((course) => course.slug)

export function assertNoPublicSocialProof(course: Course): boolean {
  return course.rating === 0 && course.reviews === 0
}
