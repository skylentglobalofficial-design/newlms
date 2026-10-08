/**
 * Approved public degree routes from the frozen homepage.
 * These are sample areas only. University names and degree titles are not published.
 */

export type DegreeLevel = "UG" | "PG"
export type StudyMode = "online" | "offline"
export type DegreeStatus = "coming-soon"

export type DegreeRoute = {
  id: string
  slug: string
  title: string
  level: DegreeLevel
  field: string
  studyMode: StudyMode
  status: DegreeStatus
  sample: true
}

export const DEGREE_ROUTES: DegreeRoute[] = [
  {
    id: "sample-ug-1",
    slug: "sample-ug-technology",
    title: "Undergraduate degree in Technology",
    level: "UG",
    field: "Technology",
    studyMode: "offline",
    status: "coming-soon",
    sample: true,
  },
  {
    id: "sample-ug-2",
    slug: "sample-ug-business",
    title: "Undergraduate degree in Business",
    level: "UG",
    field: "Business",
    studyMode: "online",
    status: "coming-soon",
    sample: true,
  },
  {
    id: "sample-pg-1",
    slug: "sample-pg-management",
    title: "Postgraduate degree in Management",
    level: "PG",
    field: "Management",
    studyMode: "online",
    status: "coming-soon",
    sample: true,
  },
  {
    id: "sample-pg-2",
    slug: "sample-pg-computing",
    title: "Postgraduate degree in Computing",
    level: "PG",
    field: "Computing",
    studyMode: "online",
    status: "coming-soon",
    sample: true,
  },
]

export const DEGREE_SAMPLE_NOTE =
  "Sample listings by degree area — partner confirmation pending; university names and degree titles are not yet published. The degree is always awarded by the partner institution."

export function degreeLevelLabel(level: DegreeLevel): string {
  return level === "UG" ? "Undergraduate" : "Postgraduate"
}

export function degreeBySlug(slug: string | undefined): DegreeRoute | null {
  if (!slug) return null
  return DEGREE_ROUTES.find((route) => route.slug === slug) ?? null
}
