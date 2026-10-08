/**
 * What a programme row from the catalogue API can honestly claim.
 *
 * The enrolment decision is the one ProgramPage has always made: the API says
 * OPEN, a course is linked, and at least one linked course has authored
 * teaching (the server refuses the enrolment otherwise). LIVE additionally needs
 * an authored programme path, because OPEN plus a link does not make the
 * advertised programme taught.
 */
import { isProgramEnrollable, type CatalogProgramSummary } from "../../lib/catalog-api"
import { courseBySlug, isAuthoredCourse, type LinkedLearning } from "../../lib/catalog-maturity"
import { hasAuthoredProgrammePath } from "../../lib/programme-discovery"
import type { TruthState } from "../skylent/primitives"

export type ProgrammeTruth = {
  /** The chip shown beside the programme. */
  state: Extract<TruthState, "live" | "development" | "soon">
  /** Enrolment as the API states it, in words. Empty when the API has no status. */
  enrolment: string
  /** The API marks the programme as not open yet. */
  comingLater: boolean
  /** The existing enrol action can be honoured by the backend. */
  enrollable: boolean
  /** The programme has an authored course and its own material. */
  authored: boolean
  linked: LinkedLearning[]
}

export function linkedLearningFromApi(slugs: string[]): LinkedLearning[] {
  return slugs.map((courseSlug) => {
    const course = courseBySlug(courseSlug)
    const authored = isAuthoredCourse(courseSlug)
    return {
      slug: courseSlug,
      title: course?.title ?? courseSlug,
      to: `/courses/${courseSlug}`,
      authored,
      maturityLabel: authored ? "Ready to start" : "Catalogue listing",
    }
  })
}

export function programmeTruth(
  program: Pick<CatalogProgramSummary, "slug" | "enrollmentStatus" | "linkedCourseSlugs">,
): ProgrammeTruth {
  const linked = linkedLearningFromApi(program.linkedCourseSlugs)
  const hasTaughtPath = linked.some((item) => item.authored)
  const comingLater = program.enrollmentStatus === "coming_soon" || program.enrollmentStatus === "waitlist"
  const enrollable = isProgramEnrollable(program) && hasTaughtPath
  const authored = hasAuthoredProgrammePath(program.slug)

  const enrolment =
    program.enrollmentStatus === "open"
      ? "Open"
      : program.enrollmentStatus === "waitlist"
        ? "Waitlist"
        : program.enrollmentStatus === "coming_soon"
          ? "Coming soon"
          : ""

  return {
    state: comingLater ? "soon" : authored && enrollable ? "live" : "development",
    enrolment,
    comingLater,
    enrollable,
    authored,
    linked,
  }
}

/** Spelled-out small counts for headings ("Five modules, fifteen lessons."). */
const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
]

export function numberWord(value: number, capitalise = false): string {
  const word = NUMBER_WORDS[value] ?? String(value)
  return capitalise ? word.charAt(0).toUpperCase() + word.slice(1) : word
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}
