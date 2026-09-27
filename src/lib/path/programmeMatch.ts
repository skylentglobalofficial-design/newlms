import type { PathDiagnosis } from "./types"
import { classifyPathTrack, type PathTrack } from "./classifyTrack"

/** Real programme slugs only — see programme-discovery DISCOVERY_PROGRAMME_SLUGS. */
const CATALOGUE_PROGRAMME_SLUGS = ["data-analytics-pro", "product-management"] as const

function interestIncludes(diagnosis: PathDiagnosis, slug: (typeof CATALOGUE_PROGRAMME_SLUGS)[number]): boolean {
  if (slug === "data-analytics-pro") {
    return (
      diagnosis.interests.includes("data_analytics") ||
      diagnosis.interests.includes("technology") ||
      diagnosis.careerDirection === "technical_specialist"
    )
  }
  if (slug === "product-management") {
    return (
      diagnosis.interests.includes("product") ||
      diagnosis.interests.includes("business") ||
      diagnosis.careerDirection === "build_company"
    )
  }
  return false
}

/**
 * Programmes are optional execution paths — never default PM for every learner.
 */
export function suggestProgrammeSlugs(diagnosis: PathDiagnosis, track: PathTrack): string[] {
  const slugs: string[] = []

  if (track === "data_analytics" && interestIncludes(diagnosis, "data-analytics-pro")) {
    slugs.push("data-analytics-pro")
  }

  if (track === "product_business" && interestIncludes(diagnosis, "product-management")) {
    slugs.push("product-management")
  }

  if (
    track === "technology_professional" &&
    diagnosis.interests.includes("data_analytics") &&
    !slugs.includes("data-analytics-pro")
  ) {
    slugs.push("data-analytics-pro")
  }

  return slugs.filter((slug) => CATALOGUE_PROGRAMME_SLUGS.includes(slug as (typeof CATALOGUE_PROGRAMME_SLUGS)[number]))
}

export function nonProgrammeExecutionSteps(track: PathTrack, diagnosis: PathDiagnosis): string[] {
  const steps: string[] = []

  if (track === "competitive_exams") {
    steps.push("Open /education/exams to map the exam model Skylent specifies (not a live engine yet).")
    steps.push("Build a topic checklist from the official syllabus — do not buy a course until the checklist exists.")
    return steps
  }

  if (track === "design_creative") {
    steps.push("Use /skills to name the capability you are building toward (no design programme is required).")
    steps.push("Publish work on a portfolio surface you control; Skylent does not host a design catalogue yet.")
    return steps
  }

  if (track === "general_undecided") {
    steps.push("Run two small experiments in different directions before enrolling anywhere.")
    steps.push("Browse /skills and /labs to test fit without committing to a full programme.")
    return steps
  }

  if (suggestProgrammeSlugs(diagnosis, track).length === 0) {
    steps.push("Explore /labs for hands-on practice if structured coursework is not the next gap.")
    steps.push("Browse /courses for focused units — enrol only when a gap maps to a specific course.")
  }

  if (track === "technology_professional" && diagnosis.targetOutcome === "land_first_role") {
    steps.push("When evidence exists, use Career OS (/career-os) to organise proof — it does not guarantee hiring.")
  }

  return steps
}
