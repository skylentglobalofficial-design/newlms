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
  if (!response.ok) {
    throw new Error(`Catalog request failed (${response.status})`)
  }
  return response.json() as Promise<T>
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
  return "Sign in to enroll and access the learning workspace. No payment is required in this environment."
}

export function courseEnrollmentMessage(): string {
  return "Sign in to enroll and access the learning workspace. No payment is required in this environment."
}

export async function fetchCatalogCourses(): Promise<CatalogCourseSummary[]> {
  const result = await catalogFetch<{ data: CatalogCourseSummary[] }>("/courses")
  return result.data
}

export async function fetchCatalogCourse(slug: string): Promise<CatalogCourseSummary | null> {
  try {
    const result = await catalogFetch<{ data: CatalogCourseSummary }>(`/courses/${slug}`)
    return {
      slug: result.data.slug,
      title: result.data.title,
      category: result.data.category,
      level: result.data.level,
      duration: result.data.duration,
      mode: result.data.mode,
      price: result.data.price,
      originalPrice: result.data.originalPrice,
      moduleCount: result.data.moduleCount,
      lessonCount: result.data.lessonCount,
      projectCount: result.data.projectCount,
    }
  } catch {
    return null
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
