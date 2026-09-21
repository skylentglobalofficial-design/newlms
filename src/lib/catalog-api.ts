import { parseApiJson } from "./http"

export type CatalogEnrollmentStatus = "open" | "waitlist" | "coming_soon"

export type CatalogCourseSummary = {
  slug: string
  title: string
  category: string
  level: string
  duration: string
  mode: string
  price: number
  originalPrice: number
  moduleCount: number
  lessonCount: number
  projectCount: number
}

export type CatalogCurriculumNode = {
  sourceId: string | null
  order: number
  title: string
  nodeType: string
  duration: string | null
}

export type CatalogCurriculumModule = {
  sourceId: string | null
  order: number
  title: string
  nodes: CatalogCurriculumNode[]
}

export type CatalogCourseDetail = CatalogCourseSummary & {
  desc: string
  longDesc: string
  outcomes: string[]
  forWhom: string[]
  curriculum: CatalogCurriculumModule[]
}

export type CatalogPricingTier = {
  name: string
  price: number
  originalPrice: number
  features: string[]
  highlight: boolean
}

export type CatalogProgramSummary = {
  slug: string
  name: string
  enrollmentStatus: CatalogEnrollmentStatus | null
  moduleCount: number
  projectCount: number
  linkedCourseSlugs: string[]
  pricing: CatalogPricingTier[]
}

const API_BASE = "/api/v1/catalog"

async function catalogFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  return parseApiJson<T>(response)
}

export function normalizeEnrollmentStatus(
  value: string | null | undefined,
): CatalogEnrollmentStatus | null {
  if (!value) return null
  switch (value.toUpperCase()) {
    case "OPEN":
      return "open"
    case "WAITLIST":
      return "waitlist"
    case "COMING_SOON":
      return "coming_soon"
    default:
      return null
  }
}

export function isProgramEnrollable(program: Pick<CatalogProgramSummary, "enrollmentStatus" | "linkedCourseSlugs">): boolean {
  return program.enrollmentStatus === "open" && program.linkedCourseSlugs.length > 0
}

export function programEnrollmentMessage(
  program: Pick<CatalogProgramSummary, "enrollmentStatus" | "linkedCourseSlugs">,
): string {
  if (program.enrollmentStatus === "coming_soon") {
    return "Enrollment is not open yet. Register your interest and we will notify you when this program launches."
  }
  if (program.enrollmentStatus === "waitlist") {
    return "This program is on waitlist. Join the waitlist and we will contact you when a seat opens."
  }
  if (program.linkedCourseSlugs.length === 0) {
    return "Enrollment is not available yet. Learning content for this program is still being prepared."
  }
  return "If you are signed in, enrolment opens the linked course in Skylent OS. If you are not, you will be asked to sign in first. Payment is not collected."
}

export function courseEnrollmentMessage(): string {
  return "If you are signed in, enrolment opens Skylent OS at the first lesson. If you are not, you will be asked to sign in first. Payment is not collected."
}

export async function fetchCatalogCourses(): Promise<CatalogCourseSummary[]> {
  const result = await catalogFetch<{ data: CatalogCourseSummary[] }>("/courses")
  return result.data
}

export async function fetchCatalogCourse(slug: string): Promise<CatalogCourseDetail | null> {
  const response = await fetch(`${API_BASE}/courses/${slug}`)
  if (response.status === 404) return null
  const result = await parseApiJson<{ data: Record<string, unknown> }>(response)
  const payload = asRecord(result.data)
  if (!payload) {
    throw new Error("Unable to load this course.")
  }
  return mapCatalogCourseDetail(payload)
}

export function mapCatalogCourseDetail(course: Record<string, unknown>): CatalogCourseDetail {
  return {
    slug: asString(course.slug),
    title: asString(course.title),
    category: asString(course.category),
    level: asString(course.level),
    duration: asString(course.duration),
    mode: asString(course.mode),
    price: asNumber(course.price),
    originalPrice: asNumber(course.originalPrice),
    moduleCount: asNumber(course.moduleCount),
    lessonCount: asNumber(course.lessonCount),
    projectCount: asNumber(course.projectCount),
    desc: asString(course.desc),
    longDesc: asString(course.longDesc),
    outcomes: asStringArray(course.outcomes),
    forWhom: asStringArray(course.forWhom),
    curriculum: mapCurriculum(course.curriculum),
  }
}

export async function fetchCatalogPrograms(): Promise<CatalogProgramSummary[]> {
  const result = await catalogFetch<{ data: Array<Record<string, unknown>> }>("/programs")
  return result.data.map(mapProgramSummary)
}

export async function fetchCatalogProgram(slug: string): Promise<CatalogProgramSummary | null> {
  try {
    const result = await catalogFetch<{ data: Record<string, unknown> }>(`/programs/${slug}`)
    return mapProgramSummary(result.data)
  } catch {
    return null
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function mapCurriculum(value: unknown): CatalogCurriculumModule[] {
  if (!Array.isArray(value)) return []
  return value.map((row, index) => {
    const module = asRecord(row) ?? {}
    const nodes = Array.isArray(module.nodes)
      ? module.nodes.map((node, nodeIndex) => mapCurriculumNode(node, nodeIndex))
      : []
    return {
      sourceId: typeof module.sourceId === "string" ? module.sourceId : null,
      order: typeof module.order === "number" ? module.order : index,
      title: asString(module.title),
      nodes,
    }
  })
}

function mapCurriculumNode(value: unknown, index: number): CatalogCurriculumNode {
  const node = asRecord(value) ?? {}
  return {
    sourceId: typeof node.sourceId === "string" ? node.sourceId : null,
    order: typeof node.order === "number" ? node.order : index,
    title: asString(node.title),
    nodeType: asString(node.nodeType),
    duration: typeof node.duration === "string" ? node.duration : null,
  }
}

function mapProgramSummary(program: Record<string, unknown>): CatalogProgramSummary {
  const pricing = Array.isArray(program.pricing) ? program.pricing : []
  const linkedCourseSlugs = Array.isArray(program.linkedCourseSlugs)
    ? program.linkedCourseSlugs.filter((slug): slug is string => typeof slug === "string")
    : []

  return {
    slug: String(program.slug),
    name: String(program.name),
    enrollmentStatus: normalizeEnrollmentStatus(
      typeof program.enrollmentStatus === "string" ? program.enrollmentStatus : null,
    ),
    moduleCount: typeof program.moduleCount === "number" ? program.moduleCount : 0,
    projectCount: typeof program.projectCount === "number" ? program.projectCount : 0,
    linkedCourseSlugs,
    pricing: pricing.map((tier) => {
      const row = tier as Record<string, unknown>
      return {
        name: String(row.name),
        price: Number(row.price),
        originalPrice: Number(row.originalPrice),
        features: Array.isArray(row.features) ? row.features.map(String) : [],
        highlight: Boolean(row.highlight),
      }
    }),
  }
}

export function catalogCourseBySlug(
  courses: CatalogCourseSummary[] | null | undefined,
  slug: string,
): CatalogCourseSummary | null {
  return courses?.find((course) => course.slug === slug) ?? null
}

export function catalogProgramBySlug(
  programs: CatalogProgramSummary[] | null | undefined,
  slug: string,
): CatalogProgramSummary | null {
  return programs?.find((program) => program.slug === slug) ?? null
}

export function lowestProgramPrice(program: CatalogProgramSummary): number | null {
  if (!program.pricing.length) return null
  return Math.min(...program.pricing.map((tier) => tier.price))
}
