/**
 * /programs catalogue rows.
 *
 * Live rows reuse authored discovery facts. Later rows use the static programme
 * listings as they exist in the catalogue — no brochure curriculum, prices, or
 * placement claims are invented here.
 */
import { programs } from "../data"
import { programmePublicView } from "./catalog-maturity"
import { programmeDiscoveryFor, type ProgrammeDiscoveryCard } from "./programme-discovery"

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

export function programmeBuildLine(row: ProgrammeDiscoveryCard): string {
  if (row.visual === "northwind") {
    return row.capstone ? `Northwind Lab, then ${row.capstone}` : "Northwind Lab"
  }
  return row.capstone ?? "A written product case"
}
