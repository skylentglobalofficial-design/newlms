/**
 * /programs catalogue rows.
 *
 * Public presence comes from the live catalogue API. Authored discovery is an
 * overlay: it never decides whether a programme exists, and API OPEN / links /
 * counts never make a row "ready to start" on their own.
 *
 * liveProgrammeCatalogue() remains for other product surfaces that still read
 * the static authored set. /programs must use partitionCatalogPrograms().
 */
import type { CatalogProgramSummary } from "./catalog-api"
import { programs } from "../data"
import { programmePublicView } from "./catalog-maturity"
import {
  hasAuthoredProgrammePath,
  programmeDiscoveryFor,
  type ProgrammeDiscoveryCard,
} from "./programme-discovery"

/** Display order for authored rows. Not a public existence list. */
export const LIVE_PROGRAMME_SLUGS = ["product-management", "data-analytics-pro"] as const

export type LaterProgrammeRow = {
  slug: string
  href: string
  title: string
  summary: string
  statusLabel: string
  honesty: string
}

export function liveProgrammeCatalogue(): ProgrammeDiscoveryCard[] {
  return LIVE_PROGRAMME_SLUGS.flatMap((slug) => {
    const row = programmeDiscoveryFor(slug)
    return row ? [row] : []
  })
}

export function laterProgrammeCatalogue(): LaterProgrammeRow[] {
  const live = new Set<string>(LIVE_PROGRAMME_SLUGS)
  return programs.flatMap((program) => {
    if (live.has(program.slug)) return []
    if (program.programType !== "PROFESSIONAL" && program.programType !== "CERTIFICATE") return []
    const view = programmePublicView(program)
    return [
      {
        slug: program.slug,
        href: `/programs/${program.slug}`,
        title: program.name,
        summary: program.desc,
        statusLabel: view.maturityLabel,
        honesty: view.honesty,
      },
    ]
  })
}

export function isPublicProgrammeIndexRow(program: Pick<CatalogProgramSummary, "programType">): boolean {
  const type = program.programType.toUpperCase()
  if (!type) return true
  return type === "PROFESSIONAL" || type === "CERTIFICATE"
}

function laterHonesty(program: CatalogProgramSummary): string {
  if (program.enrollmentStatus === "coming_soon" || program.enrollmentStatus === "waitlist") {
    return "This programme is not open yet. There is no classroom session or batch behind the listing."
  }
  return "Catalogue listing — not a finished authored programme. Opening the page does not start a taught pathway."
}

function laterStatusLabel(program: CatalogProgramSummary): string {
  if (program.enrollmentStatus === "coming_soon" || program.enrollmentStatus === "waitlist") {
    return "Coming later"
  }
  return "Catalogue listing"
}

function liveSortIndex(slug: string): number {
  const index = (LIVE_PROGRAMME_SLUGS as readonly string[]).indexOf(slug)
  return index === -1 ? LIVE_PROGRAMME_SLUGS.length : index
}

export function partitionCatalogPrograms(catalogue: CatalogProgramSummary[]): {
  live: ProgrammeDiscoveryCard[]
  later: LaterProgrammeRow[]
} {
  const live: ProgrammeDiscoveryCard[] = []
  const later: LaterProgrammeRow[] = []

  for (const program of catalogue) {
    if (!isPublicProgrammeIndexRow(program)) continue

    const discovery = programmeDiscoveryFor(program.slug)
    if (discovery && hasAuthoredProgrammePath(program.slug)) {
      live.push({
        ...discovery,
        href: `/programs/${program.slug}`,
        title: program.name || discovery.title,
        level: program.level || discovery.level,
        format: program.format || discovery.format,
      })
      continue
    }

    later.push({
      slug: program.slug,
      href: `/programs/${program.slug}`,
      title: program.name,
      summary: program.desc,
      statusLabel: laterStatusLabel(program),
      honesty: laterHonesty(program),
    })
  }

  live.sort((a, b) => liveSortIndex(a.slug) - liveSortIndex(b.slug))
  return { live, later }
}

export function programmeBuildLine(row: ProgrammeDiscoveryCard): string {
  if (row.visual === "northwind") {
    return row.capstone ? `Northwind Lab, then ${row.capstone}` : "Northwind Lab"
  }
  return row.capstone ?? "A written product case"
}
