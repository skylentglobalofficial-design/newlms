/**
 * Degree metadata adapter.
 *
 * Delivery mode is DATA, never a property of how a page looks: every degree surface asks this
 * module for a `Degree` and branches on `deliveryMode` ("ONLINE" | "CAMPUS").
 *
 * TODAY: degrees and universities are not in the backend. The only source is the four sample
 * routes in `src/data/education.ts` (all `sample: true`, `status: "coming-soon"`). University
 * names, durations, fees, intakes, curricula and outcomes are NOT published, so every optional
 * field below is absent. Screens show "Published by the institution" for an absent field, or
 * drop the row. Nothing is defaulted or invented here.
 *
 * LATER: `Degree` is the contract the backend should serve from
 *   GET /api/v1/catalog/degrees          → { data: Degree[] }   (summary fields)
 *   GET /api/v1/catalog/degrees/:slug    → { data: Degree }     (summary + optional detail fields)
 * To switch over, replace `readSource()` (the one place that touches the static records) with the
 * API response. `fromStaticRoute` then goes away because the response already has this shape.
 * That read becomes asynchronous, so the pages will need loading and error states at that point;
 * they have none today because nothing is fetched.
 */
import { DEGREE_ROUTES, type DegreeRoute } from "../data/education"

export type DeliveryMode = "ONLINE" | "CAMPUS"
export type DegreeProgrammeType = "DEGREE"
export type DegreeLevel = "UNDERGRADUATE" | "POSTGRADUATE"
/** Same vocabulary as `enrollmentStatus` on GET /catalog/programs. */
export type DegreeStatus = "open" | "waitlist" | "coming_soon"

export type DegreeAsset = {
  src: string
  alt: string
  /** Short figure label, e.g. "Library". */
  caption?: string
  /** True when the image is a licensed stand-in and not the institution's own photograph. */
  standIn?: boolean
}

export type DegreeInstitution = {
  name: string
  /** The body that awards the degree, when it differs from the teaching institution. */
  awardingBody?: string
}

export type DegreeLocation = {
  city: string
  country?: string
  campusAddress?: string
  gettingThere?: string
  visiting?: string
}

export type DegreeLearningMode = {
  pacing?: string
  liveSessions?: string
  support?: string
}

export type DegreeCurriculumStage = {
  /** "Year 1", "Semester 2", "Term 3": whatever unit the institution uses. */
  label: string
  subjects: string[]
  teaching?: string
}

export type DegreeCertificate = {
  title: string
  awardedBy: string
}

export type Degree = {
  slug: string
  title: string
  deliveryMode: DeliveryMode
  programmeType: DegreeProgrammeType
  level: DegreeLevel
  discipline: string
  status: DegreeStatus
  /** True while the listing is a sample and not a confirmed degree from a named institution. */
  sample: boolean

  /* Everything below is optional and absent today. */
  institution?: DegreeInstitution
  location?: DegreeLocation
  duration?: string
  heroAsset?: DegreeAsset
  gallery?: DegreeAsset[]
  learningMode?: DegreeLearningMode
  curriculum?: DegreeCurriculumStage[]
  tools?: string[]
  labs?: string[]
  projects?: string[]
  assessments?: string[]
  certificate?: DegreeCertificate
  careerRoles?: string[]
  skills?: string[]
  /* Rows the campus design shows. Not part of the minimum contract; listed as a contract gap. */
  intake?: string
  eligibility?: string
  residence?: string
}

/** The one wording used wherever a fact is not published yet. */
export const PUBLISHED_BY_INSTITUTION = "Shared once an institution is confirmed"

const STATIC_STATUS: Record<DegreeRoute["status"], DegreeStatus> = { "coming-soon": "coming_soon" }

function fromStaticRoute(route: DegreeRoute): Degree {
  return {
    slug: route.slug,
    title: route.title,
    deliveryMode: route.studyMode === "online" ? "ONLINE" : "CAMPUS",
    programmeType: "DEGREE",
    level: route.level === "UG" ? "UNDERGRADUATE" : "POSTGRADUATE",
    discipline: route.field,
    status: STATIC_STATUS[route.status],
    sample: route.sample,
  }
}

/** The single read of the static source. Replace this with the GET /catalog/degrees response. */
function readSource(): Degree[] {
  return DEGREE_ROUTES.map(fromStaticRoute)
}

export function listDegrees(mode?: DeliveryMode): Degree[] {
  const all = readSource()
  return mode ? all.filter((degree) => degree.deliveryMode === mode) : all
}

export function getDegree(slug: string | undefined): Degree | null {
  if (!slug) return null
  return readSource().find((degree) => degree.slug === slug) ?? null
}

/* ── Presentation helpers that depend only on metadata ─────────────────────── */

const MODE_SEGMENT: Record<DeliveryMode, "online" | "campus"> = { ONLINE: "online", CAMPUS: "campus" }

export function deliveryModeLabel(mode: DeliveryMode): string {
  return mode === "ONLINE" ? "Online" : "On campus"
}

export function degreeLevelName(level: DegreeLevel): string {
  return level === "UNDERGRADUATE" ? "Undergraduate" : "Postgraduate"
}

/** `?mode=` value on /education and the path segment of a detail route. */
export function deliveryModeSegment(mode: DeliveryMode): "online" | "campus" {
  return MODE_SEGMENT[mode]
}

/** Reads a `?mode=` value. Anything that is not a known mode means "show both". */
export function deliveryModeFromParam(value: string | null | undefined): DeliveryMode | null {
  if (value === "online") return "ONLINE"
  if (value === "campus") return "CAMPUS"
  return null
}

/** The mode-correct detail route for a degree: /education/online/:slug or /education/campus/:slug. */
export function degreePath(degree: Pick<Degree, "slug" | "deliveryMode">): string {
  return `/education/${MODE_SEGMENT[degree.deliveryMode]}/${degree.slug}`
}

export function degreeListingPath(mode?: DeliveryMode | null): string {
  return mode ? `/education?mode=${MODE_SEGMENT[mode]}` : "/education"
}
