/**
 * /programs catalogue rows.
 *
 * Authored rows reuse authored discovery facts. The public catalogue index is
 * reconciled against the Prisma-backed catalogue API so programme presence and
 * enrollment state are not driven by stale static rows.
 */
import { programs } from "../data"
import { programmePublicView } from "./catalog-maturity"
import { programmeDiscoveryFor, type ProgrammeDiscoveryCard } from "./programme-discovery"
import type { CatalogProgramSummary } from "./catalog-api"

/** Authored programmes, in the order the catalogue should present them. */
export const LIVE_PROGRAMME_SLUGS = ["product-management", "data-analytics-pro"] as const

export type LaterProgrammeRow = {
  slug: string
  href: string
  title: string
  summary: string
  statusLabel: string
  honesty: string
}

export function liveProgrammeCatalogue(
  catalogue: CatalogProgramSummary[] = [],
): ProgrammeDiscoveryCard[] {
  const bySlug = new Map(catalogue.map((program) => [program.slug, program]))
  return LIVE_PROGRAMME_SLUGS.flatMap((slug) => {
    const apiProgram = bySlug.get(slug)
    if (!apiProgram || apiProgram.enrollmentStatus !== "open" || apiProgram.linkedCourseSlugs.length === 0) {
      return []
    }
    const row = programmeDiscoveryFor(slug)
    return row ? [row] : []
  })
}

export function laterProgrammeCatalogue(
  catalogue: CatalogProgramSummary[] = [],
): LaterProgrammeRow[] {
  const live = new Set<string>(LIVE_PROGRAMME_SLUGS)
  const staticBySlug = new Map(programs.map((program) => [program.slug, program]))

  return catalogue.flatMap((apiProgram) => {
    if (live.has(apiProgram.slug)) return []
    const program = staticBySlug.get(apiProgram.slug)
    if (!program) {
      return [{
        slug: apiProgram.slug,
        href: `/programs/${apiProgram.slug}`,
        title: apiProgram.name,
        summary: "Catalogue listing. The public programme record exists, but its authored teaching path is not published here yet.",
        statusLabel: apiProgram.enrollmentStatus === "coming_soon" ? "Coming later" : "Catalogue listing",
        honesty: apiProgram.linkedCourseSlugs.length
          ? "Linked learning content is not represented as an authored programme on this public catalogue yet."
          : "There is no linked LMS course behind this programme yet.",
      }]
    }

    if (program.programType !== "PROFESSIONAL" && program.programType !== "CERTIFICATE") return []

    const view = programmePublicView(program)
    const statusLabel =
      apiProgram.enrollmentStatus === "coming_soon" || apiProgram.enrollmentStatus === "waitlist"
        ? "Coming later"
        : view.maturityLabel

    return [{
      slug: program.slug,
      href: `/programs/${program.slug}`,
      title: apiProgram.name || program.name,
      summary: program.desc,
      statusLabel,
      honesty: view.honesty,
    }]
  })
}

export function programmeBuildLine(row: ProgrammeDiscoveryCard): string {
  if (row.visual === "northwind") {
    return row.capstone ? `Northwind Lab, then ${row.capstone}` : "Northwind Lab"
  }
  return row.capstone ?? "A written product case"
}
