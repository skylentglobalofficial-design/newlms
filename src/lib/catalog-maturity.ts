import { courses, programs, type Course, type CourseLesson, type Program } from "../data"
import type { CatalogCourseSummary } from "./catalog-api"
import { AUTHORED_COURSE_SLUG, isAuthoredCourse } from "./authored-courses"
import { courseProductProfile } from "./course-product"
import { countStaticCourseLessons } from "./curriculum-counts"

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
  if (lesson.type === "assignment") {
    if (/capstone/i.test(lesson.title)) return "Capstone"
    return "Assignment"
  }
  if (lesson.type === "notes") return "Written"
  if (authored) return "Lesson"
  return "Outline"
}

export type PracticeGroups = {
  learning: CourseLesson[]
  practice: CourseLesson[]
  assignments: CourseLesson[]
  capstone: CourseLesson[]
}

export function coursePracticeGroups(course: Course): PracticeGroups {
  const lessons = course.modules.flatMap((module) => module.lessons)
  return {
    learning: lessons.filter((lesson) => lesson.type === "notes" || lesson.type === "video"),
    practice: lessons.filter((lesson) => lesson.type === "quiz"),
    assignments: lessons.filter((lesson) => lesson.type === "assignment" && !/capstone/i.test(lesson.title)),
    capstone: lessons.filter((lesson) => /capstone/i.test(lesson.title)),
  }
}

export type ModulePublicCard = {
  id: string
  index: number
  title: string
  activityCount: number
  workLine: string
  countsLabel: string
}

export function courseModuleCards(course: Course, authored: boolean): ModulePublicCard[] {
  return course.modules.map((module, index) => {
    const written = module.lessons.filter((lesson) => lesson.type === "notes").length
    const quizzes = module.lessons.filter((lesson) => lesson.type === "quiz").length
    const assignments = module.lessons.filter((lesson) => lesson.type === "assignment" && !/capstone/i.test(lesson.title)).length
    const capstone = module.lessons.filter((lesson) => /capstone/i.test(lesson.title)).length
    const parts: string[] = []
    if (written) parts.push(`${written} written`)
    if (quizzes) parts.push(`${quizzes} ${quizzes === 1 ? "quiz" : "quizzes"}`)
    if (assignments) parts.push(`${assignments} ${assignments === 1 ? "assignment" : "assignments"}`)
    if (capstone) parts.push(`${capstone} capstone`)
    const capstoneLesson = module.lessons.find((lesson) => /capstone/i.test(lesson.title))
    const assignment = module.lessons.find((lesson) => lesson.type === "assignment" && !/capstone/i.test(lesson.title))
    const quiz = module.lessons.find((lesson) => lesson.type === "quiz")
    let workLine = "Outline titles only — not a finished teaching path."
    if (authored) {
      if (capstoneLesson && assignment) workLine = `${assignment.title}. Then ${capstoneLesson.title}.`
      else if (capstoneLesson) workLine = capstoneLesson.title
      else if (assignment) workLine = `Practical work: ${assignment.title}.`
      else if (quiz) workLine = `Written lessons and ${quiz.title}.`
      else workLine = `You work through ${parts.join(", ") || "written lessons"}.`
    }
    return {
      id: module.id,
      index: index + 1,
      title: module.title,
      activityCount: module.lessons.length,
      workLine,
      countsLabel: `${module.lessons.length} ${module.lessons.length === 1 ? "activity" : "activities"}${parts.length ? ` · ${parts.join(" · ")}` : ""}`,
    }
  })
}

const flagshipProfile = courseProductProfile(AUTHORED_COURSE_SLUG)!

/** Data Analytics product copy. Prefer courseProductProfile(slug) for authored courses. */
export const AUTHORED_TOOLS = flagshipProfile.tools
export const AUTHORED_PREREQUISITE = flagshipProfile.prerequisite
export const AUTHORED_DATASETS = flagshipProfile.datasets
export const AUTHORED_LEARNING_STEPS = flagshipProfile.learningSteps
export const AUTHORED_FAQ = flagshipProfile.faq

export const PROGRAMME_INTENDED_STEPS = [
  "Programme",
  "Term",
  "Specialisation",
  "Module",
  "Case study",
  "Project",
  "Assessment",
  "Career outcome",
]

export function coursePrimaryCta(view: { showLiveCurriculum: boolean; maturity: PublicMaturity }): string {
  if (view.showLiveCurriculum) return "Start this course"
  return "Open the outline"
}

export function courseAfterEnrolSteps(authored: boolean, courseTitle?: string): string[] {
  const profile = courseTitle ? courses.find((row) => row.title === courseTitle) : undefined
  const afterEnrol = profile ? courseProductProfile(profile.slug)?.afterEnrol : undefined
  return [
    "If you are not signed in, you will be asked to sign in or create an account.",
    "Enrolment grants access to the learning workspace. Payment is not collected.",
    authored
      ? afterEnrol ?? (courseTitle ? `Skylent OS opens ${courseTitle} at the first lesson.` : "Skylent OS opens the course at the first lesson.")
      : "Skylent OS opens the course outline. Full teaching content is still being built.",
  ]
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
  primaryCta: string
  honesty: string | null
  showLiveCurriculum: boolean
}

function listingSummary(course: Course): string {
  return `${course.title} is a catalogue listing. The LMS has an outline, not a finished course like Data Analytics or Product Management.`
}

export type CatalogCourseListView = {
  course: CatalogCourseSummary
  slug: string
  title: string
  maturity: PublicMaturity
  maturityLabel: string
  duration: string
  lessonLabel: string
  ctaLabel: string
}

/** List-row view for API course summaries — readiness from the authored registry. */
export function catalogCourseListView(course: CatalogCourseSummary): CatalogCourseListView {
  const authored = isAuthoredCourse(course.slug)
  return {
    course,
    slug: course.slug,
    title: course.title,
    maturity: authored ? "ready" : "listing",
    maturityLabel: authored ? "Ready to start" : "Catalogue listing",
    duration: authored ? course.duration : "Duration TBA",
    lessonLabel: authored ? `${course.lessonCount} lessons` : `${course.lessonCount} outline items`,
    ctaLabel: authored ? "Start this course" : "View listing",
  }
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
    delivery: authored ? "Written lessons + practice" : "LMS outline",
    duration: course.duration,
    stats,
    outcomes: course.outcomes,
    forWhom: authored ? course.forWhom : [],
    listedPrice: course.price,
    ctaLabel: authored ? "Start this course" : "View listing",
    primaryCta: coursePrimaryCta({ showLiveCurriculum: authored, maturity: authored ? "ready" : "listing" }),
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

export function programmeAfterEnrolCopy(view: {
  maturity: PublicMaturity
  linked: LinkedLearning[]
}): string {
  const authored = view.linked.find((item) => item.authored)
  if (view.maturity === "coming_later") return "Enrolment is not open on this listing."
  if (authored) {
    return `Enrolment opens ${authored.title} in Skylent OS. It does not create a separate taught programme. Payment is not collected.`
  }
  if (view.linked[0]) {
    return `Enrolment opens the ${view.linked[0].title} outline in Skylent OS. Payment is not collected.`
  }
  return "There is no linked course to open yet."
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
    return "This programme is not open yet. There is no classroom session or batch behind the listing."
  }
  if (authored.length && linked.length === authored.length) {
    return `Enrolment opens the ${authored[0].title} course — the authored learning path. Brochure modules beyond that course are not teachable here yet.`
  }
  if (authored.length) {
    return `What you can study today is ${authored.map((item) => item.title).join(" and ")}. Other linked listings are thinner than Data Analytics. Brochure topics such as machine learning are not taught yet.`
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
    ctaLabel: comingLater
      ? "Coming later"
      : enrollOpen
        ? authoredCourses.length > 0 && authoredCourses.length === linked.length
          ? "Start this programme"
          : "Open linked course"
        : "Enrolment unavailable",
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
