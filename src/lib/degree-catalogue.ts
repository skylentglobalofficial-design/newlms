import type { Degree, DegreeLevel, DegreeStatus, DeliveryMode } from "./degrees"
import { listDegrees } from "./degrees"

/**
 * Public catalogue rows from GET /api/v1/degrees.
 * Only published rows with the fields the page already understands are kept.
 * An empty or unreadable response leaves the sample listings in place.
 */
export type PublicDegreePayload = {
  data?: unknown
}

const LEVELS = new Set<DegreeLevel>(["UNDERGRADUATE", "POSTGRADUATE"])
const MODES = new Set<DeliveryMode>(["ONLINE", "CAMPUS"])

export function degreesFromPublicPayload(payload: unknown): Degree[] {
  if (!payload || typeof payload !== "object" || !("data" in payload)) return []
  const data = (payload as PublicDegreePayload).data
  if (!Array.isArray(data)) return []
  return data.flatMap((row) => {
    const degree = degreeFromPublicRow(row)
    return degree ? [degree] : []
  })
}

export function mergeDegreeCatalogues(samples: readonly Degree[], published: readonly Degree[]): Degree[] {
  if (!published.length) return [...samples]
  const bySlug = new Map(published.map((degree) => [degree.slug, degree]))
  const merged = samples.map((degree) => bySlug.get(degree.slug) ?? degree)
  const seen = new Set(samples.map((degree) => degree.slug))
  for (const degree of published) {
    if (!seen.has(degree.slug)) merged.push(degree)
  }
  return merged
}

function degreeFromPublicRow(row: unknown): Degree | null {
  if (!row || typeof row !== "object") return null
  const record = row as Record<string, unknown>
  if (record.status !== "PUBLISHED") return null
  if (typeof record.slug !== "string" || typeof record.title !== "string") return null
  if (typeof record.discipline !== "string" || typeof record.sample !== "boolean") return null
  if (!LEVELS.has(record.level as DegreeLevel) || !MODES.has(record.deliveryMode as DeliveryMode)) return null

  const degree: Degree = {
    slug: record.slug,
    title: record.title,
    deliveryMode: record.deliveryMode as DeliveryMode,
    programmeType: "DEGREE",
    level: record.level as DegreeLevel,
    discipline: record.discipline,
    status: "open" satisfies DegreeStatus,
    sample: record.sample,
  }
  const institution = institutionFrom(record.institution)
  if (institution) degree.institution = institution
  if (typeof record.duration === "string" && record.duration.trim()) degree.duration = record.duration
  if (typeof record.intake === "string" && record.intake.trim()) degree.intake = record.intake
  const skills = stringList(record.skills)
  if (skills.length) degree.skills = skills
  const roles = stringList(record.careerRoles)
  if (roles.length) degree.careerRoles = roles
  return degree
}

function institutionFrom(value: unknown): Degree["institution"] | null {
  if (!value || typeof value !== "object") return null
  const name = (value as { name?: unknown }).name
  if (typeof name !== "string" || !name.trim()) return null
  return { name }
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
}

export function catalogueOrSamples(published: readonly Degree[]): Degree[] {
  return mergeDegreeCatalogues(listDegrees(), published)
}
