/**
 * Homepage view of the live programme catalogue.
 *
 * The rows come from GET /catalog/programs (useLivePrograms). This file only decides how a
 * row is presented: which truth chip it earns and which domain artefact is drawn for it.
 * It never adds a programme the API did not return.
 */
import type { LiveProgram } from "@/hooks/useLivePrograms"
import type { TruthState } from "@/components/skylent/primitives"
import { PRODUCT_MANAGEMENT_SLUG } from "@/lib/authored-courses"
import {
  AUTHORED_COURSE_SLUG,
  courseBySlug,
  isAuthoredCourse,
  linkedCourseSlugsForProgram,
} from "@/lib/catalog-maturity"

export type ArtefactKind = "northwind" | "harbor-desk" | "markup" | "workflow" | "facts"

export type HomeProgramme = LiveProgram & {
  /** True only when enrolment is open and every linked course has authored lessons. */
  enrollable: boolean
  chip: { state: TruthState; label?: string } | null
  artefact: ArtefactKind
  /** Titles of the authored courses that enrolment opens. */
  opens: string[]
  kindLabel: string
  facts: string[]
}

function chipFor(program: LiveProgram, enrollable: boolean): HomeProgramme["chip"] {
  if (enrollable) return { state: "live" }
  if (program.status === "coming_soon") return { state: "soon" }
  if (program.status === "waitlist") return { state: "soon", label: "Waitlist" }
  // Enrolment is marked open, but the linked course has no authored lessons yet.
  if (program.status === "open") return { state: "development" }
  return null
}

function artefactFor(slug: string, linked: string[], enrollable: boolean): ArtefactKind {
  if (enrollable && linked.includes(AUTHORED_COURSE_SLUG)) return "northwind"
  if (enrollable && linked.includes(PRODUCT_MANAGEMENT_SLUG)) return "harbor-desk"
  const key = [slug, ...linked].join(" ")
  if (/full-stack|web-dev/.test(key)) return "markup"
  if (/generative-ai|prompt/.test(key)) return "workflow"
  return "facts"
}

export function toHomeProgramme(program: LiveProgram): HomeProgramme {
  const linked = linkedCourseSlugsForProgram(program.slug)
  const enrollable = program.status === "open" && linked.length > 0 && linked.every(isAuthoredCourse)
  const opens = enrollable
    ? linked.flatMap((slug) => {
        const course = courseBySlug(slug)
        return course ? [course.title] : []
      })
    : []
  const facts = [
    program.modules > 0 ? `${program.modules} ${program.modules === 1 ? "module" : "modules"}` : "",
    program.deliveryMode,
    program.level,
  ].filter(Boolean)
  return {
    ...program,
    enrollable,
    chip: chipFor(program, enrollable),
    artefact: artefactFor(program.slug, linked, enrollable),
    opens,
    kindLabel: `${program.category} programme`,
    facts,
  }
}

/** Enrolable programmes first, the Data Analytics flagship leading; the API order is kept otherwise. */
export function orderForHome(programmes: LiveProgram[]): HomeProgramme[] {
  const rank = (p: HomeProgramme) => (p.artefact === "northwind" ? 0 : p.enrollable ? 1 : 2)
  return programmes
    .map(toHomeProgramme)
    .map((p, index) => ({ p, index }))
    .sort((a, b) => rank(a.p) - rank(b.p) || a.index - b.index)
    .map(({ p }) => p)
}

const COUNT_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]

export function countWord(n: number): string {
  return COUNT_WORDS[n] ?? String(n)
}

/** "A, B and 3 more" — names only, in the order given. */
export function nameList(names: string[], show = 2): string {
  if (names.length <= show) return names.join(", ")
  const rest = names.length - show
  return `${names.slice(0, show).join(", ")} and ${countWord(rest).toLowerCase()} more`
}
