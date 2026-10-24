import {
  DegreeDeliveryMode,
  DegreeLevel,
  DegreeStatus,
  type Prisma,
} from "@prisma/client"

/**
 * Public catalogue filters. Status from the client is intentionally ignored —
 * unpublished degrees (DRAFT, ARCHIVED, COMING_SOON) are never listed publicly.
 */
export type PublicDegreeListFilters = {
  level?: DegreeLevel | string
  deliveryMode?: DegreeDeliveryMode | string
  discipline?: string
  institutionSlug?: string
  sample?: boolean
  /** Ignored for public queries — always PUBLISHED. */
  status?: string
}

export function buildPublicDegreeWhere(
  filters: PublicDegreeListFilters,
): Prisma.DegreeWhereInput {
  const where: Prisma.DegreeWhereInput = {
    status: DegreeStatus.PUBLISHED,
  }

  if (filters.level) where.level = filters.level as DegreeLevel
  if (filters.deliveryMode) where.deliveryMode = filters.deliveryMode as DegreeDeliveryMode
  if (filters.discipline) {
    where.discipline = { contains: filters.discipline, mode: "insensitive" }
  }
  if (filters.institutionSlug) {
    where.institution = { slug: filters.institutionSlug }
  }
  if (filters.sample !== undefined) where.sample = filters.sample

  return where
}

export function isPubliclyVisibleDegreeStatus(status: DegreeStatus): boolean {
  return status === DegreeStatus.PUBLISHED
}

export const PUBLIC_DEGREE_STATUSES = [DegreeStatus.PUBLISHED] as const
