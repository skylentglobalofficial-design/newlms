/**
 * The published programme list, used only when GET /catalog/programs cannot be reached.
 *
 * These are the same records prisma/seed.ts writes into the catalogue (src/data.ts plus the
 * programme-to-course links in catalog-maturity.ts), mapped to the API's summary shape. They are
 * not sample rows: they are what the API returns when it is up. Enrolment still goes through
 * the API, so nothing here can enrol anyone on its own.
 */
import { programs } from "../data"
import { normalizeEnrollmentStatus, type CatalogProgramSummary } from "./catalog-api"
import { linkedCourseSlugsForProgram } from "./catalog-maturity"

export function publishedProgrammeSummaries(): CatalogProgramSummary[] {
  return programs.map((program) => ({
    slug: program.slug,
    name: program.name,
    enrollmentStatus: normalizeEnrollmentStatus(program.enrollmentStatus ?? null),
    duration: program.duration,
    format: program.format,
    level: program.level,
    desc: program.desc,
    programType: program.programType,
    moduleCount: program.modules,
    projectCount: program.projects,
    linkedCourseSlugs: linkedCourseSlugsForProgram(program.slug),
    pricing: program.pricing.map((tier) => ({
      name: tier.name,
      price: tier.price,
      originalPrice: tier.originalPrice,
      features: [...tier.features],
      highlight: Boolean(tier.highlight),
    })),
  }))
}
