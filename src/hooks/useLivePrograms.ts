import { useMemo } from "react"
import { useCatalogPrograms } from "./useCatalog"
import type { CatalogEnrollmentStatus, CatalogProgramSummary } from "../lib/catalog-api"

export type LiveProgramStatus = CatalogEnrollmentStatus | "unknown"

export type LiveProgram = {
  slug: string
  title: string
  description: string
  category: string
  level: string
  duration: string
  deliveryMode: string
  modules: number
  projects: number
  status: LiveProgramStatus
}

function categoryLabel(programType: string): string {
  const cleaned = programType.replace(/_/g, " ").trim()
  if (!cleaned) return "Skill program"
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
}

function mapProgram(program: CatalogProgramSummary): LiveProgram {
  return {
    slug: program.slug,
    title: program.name,
    description: program.desc,
    category: categoryLabel(program.programType),
    level: program.level,
    duration: program.duration,
    deliveryMode: program.format,
    modules: program.moduleCount,
    projects: program.projectCount,
    status: program.enrollmentStatus ?? "unknown",
  }
}

/**
 * Public homepage catalogue. Reads the Hostinger/newlms programmes API.
 * An empty or failed response stays empty — sample listings are not substituted.
 */
export function useLivePrograms() {
  const { data, loading, error, reload } = useCatalogPrograms()

  const programs = useMemo(() => {
    const rows = data ?? []
    return [...rows]
      .sort((a, b) => {
        const rank = (row: CatalogProgramSummary) => (row.enrollmentStatus === "open" ? 0 : 1)
        return rank(a) - rank(b) || b.moduleCount - a.moduleCount || a.name.localeCompare(b.name)
      })
      .map(mapProgram)
  }, [data])

  return {
    programs: loading ? [] : programs,
    isLoading: loading,
    isLive: !loading && !error && programs.length > 0,
    isUnavailable: !loading && (Boolean(error) || programs.length === 0),
    retry: reload,
  }
}
