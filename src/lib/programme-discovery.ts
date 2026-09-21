/**
 * Public /programs discovery data.
 *
 * Every field resolves from the authored course content, the static catalogue, or
 * the product profile. Nothing here is a marketing estimate: brochure counts and
 * taught counts are kept separate on purpose so the page can show both honestly.
 */
import { courses, programs, type Course } from "../data"
import { isAuthoredCourse } from "./authored-courses"
import { courseProductProfile } from "./course-product"
import {
  courseLessonStats,
  courseModuleCards,
  linkedCourseSlugsForProgram,
  programmePublicView,
  type ModulePublicCard,
} from "./catalog-maturity"

/** Programme slugs opened by the /programs discovery page, in display order. */
const DISCOVERY_PROGRAMME_SLUGS = ["data-analytics-pro", "product-management"] as const

export type ProgrammeDiscoveryCard = {
  slug: string
  href: string
  title: string
  /** What the learner decides with — derived from the authored capstone, not a slogan. */
  decisionLine: string
  level: string
  format: string
  /** Advertised programme length from the catalogue. */
  brochureDuration: string
  /** Brochure module count — shown only alongside the taught count. */
  brochureModules: number
  taughtModules: number
  taughtLessons: number
  taughtWritten: number
  taughtQuizzes: number
  taughtAssignments: number
  modules: ModulePublicCard[]
  /** Real capstone lesson title from the authored course. */
  capstone: string | null
  /** Real dataset / case file the work is produced against. */
  material: string
  materialDetail: string
  courseTitle: string
  courseHref: string
  visual: "northwind" | "harbor-desk"
  honesty: string
  enrollOpen: boolean
}

function capstoneTitle(course: Course): string | null {
  const lesson = course.modules
    .flatMap((module) => module.lessons)
    .find((row) => /capstone/i.test(row.title))
  if (!lesson) return null
  return lesson.title.replace(/^capstone\s*[—–-]\s*/i, "")
}

/**
 * The decision a learner is actually trained to make, taken from the authored
 * capstone rather than invented positioning copy.
 */
function decisionLineFor(slug: string): string {
  if (slug === "product-management") {
    return "Decide what to build when engineering time is limited, and write the specification for it."
  }
  return "Turn a raw commercial extract into a defensible read on what the numbers mean."
}

export function programmeDiscoveryCards(): ProgrammeDiscoveryCard[] {
  return DISCOVERY_PROGRAMME_SLUGS.flatMap((slug) => {
    const program = programs.find((row) => row.slug === slug)
    if (!program) return []

    const courseSlug = linkedCourseSlugsForProgram(slug).find((row) => isAuthoredCourse(row))
    if (!courseSlug) return []

    const course = courses.find((row) => row.slug === courseSlug)
    const profile = courseProductProfile(courseSlug)
    if (!course || !profile) return []

    const view = programmePublicView(program)
    const stats = courseLessonStats(course)
    const dataset = profile.datasets[0]

    return [{
      slug,
      href: `/programs/${slug}`,
      title: program.name,
      decisionLine: decisionLineFor(slug),
      level: program.level ?? course.level,
      format: program.format,
      brochureDuration: program.duration,
      brochureModules: program.modules,
      taughtModules: stats.moduleCount,
      taughtLessons: stats.lessonCount,
      taughtWritten: stats.writtenCount,
      taughtQuizzes: stats.quizCount,
      taughtAssignments: stats.assignmentCount,
      modules: courseModuleCards(course, true),
      capstone: capstoneTitle(course),
      material: dataset?.filename ?? "",
      materialDetail: dataset?.detail ?? "",
      courseTitle: course.title,
      courseHref: `/courses/${courseSlug}`,
      visual: profile.visual,
      honesty: view.honesty,
      enrollOpen: view.enrollOpen,
    }]
  })
}

export function programmeDiscoveryFor(slug: string | undefined): ProgrammeDiscoveryCard | null {
  if (!slug) return null
  return programmeDiscoveryCards().find((row) => row.slug === slug) ?? null
}

/**
 * Where programme work is produced. Each entry points at a route that exists in
 * the router; `learnerOnly` marks the surfaces behind a student sign-in.
 */
export const PROGRAMME_WORK_SURFACES = [
  {
    id: "lessons",
    label: "Written lessons",
    detail: "Self-paced written teaching in the enrolled course. No video stream and no live classroom.",
    learnerOnly: true,
  },
  {
    id: "practice",
    label: "Checks and assignments",
    detail: "Short checks after a block of lessons, then applied assignments on the course material.",
    learnerOnly: true,
  },
  {
    id: "lab",
    label: "Northwind Lab",
    detail: "A real in-browser SQL workspace for Data Analytics. Product Management does not use it.",
    learnerOnly: true,
  },
  {
    id: "project",
    label: "Project workspace",
    detail: "Where the capstone is assembled into the work sample you keep.",
    learnerOnly: true,
  },
] as const

/** Enrolment behaviour, stated exactly as the product implements it today. */
export const PROGRAMME_ENROLMENT_FACTS = [
  "Enrolment opens the linked authored course in Skylent OS. It does not create a separate taught programme, cohort, or batch.",
  "Payment is not collected.",
  "Certificates are not issued yet.",
  "Work you produce can be added to Career OS as evidence on your profile.",
] as const
