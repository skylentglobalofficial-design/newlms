import type { CareerDirection, InterestArea, PathDiagnosis, TargetOutcome } from "./types"

/** Broad recommendation track — deterministic, transparent, no LLM. */
export type PathTrack =
  | "data_analytics"
  | "product_business"
  | "competitive_exams"
  | "design_creative"
  | "technology_professional"
  | "general_undecided"

const EXAM_SIGNALS = (d: PathDiagnosis): boolean =>
  d.careerDirection === "exam_path" ||
  d.interests.includes("competitive_exams") ||
  d.targetOutcome === "pass_exam"

const hasInterest = (d: PathDiagnosis, area: InterestArea): boolean => d.interests.includes(area)

/**
 * Resolve the primary track for phase templates. First match wins (exam beats product beats data, etc.).
 */
export function classifyPathTrack(diagnosis: PathDiagnosis): PathTrack {
  if (EXAM_SIGNALS(diagnosis)) return "competitive_exams"

  if (
    hasInterest(diagnosis, "data_analytics") ||
    (diagnosis.careerDirection === "technical_specialist" &&
      (hasInterest(diagnosis, "technology") || hasInterest(diagnosis, "engineering")))
  ) {
    return "data_analytics"
  }

  if (
    hasInterest(diagnosis, "product") ||
    hasInterest(diagnosis, "business") ||
    diagnosis.careerDirection === "build_company"
  ) {
    return "product_business"
  }

  if (hasInterest(diagnosis, "design")) return "design_creative"

  if (
    hasInterest(diagnosis, "technology") ||
    hasInterest(diagnosis, "engineering") ||
    diagnosis.careerDirection === "professional_role" ||
    diagnosis.careerDirection === "technical_specialist" ||
    hasInterest(diagnosis, "research") ||
    diagnosis.careerDirection === "research_academic"
  ) {
    return "technology_professional"
  }

  return "general_undecided"
}

export function trackLabel(track: PathTrack): string {
  switch (track) {
    case "data_analytics":
      return "Data & analytics"
    case "product_business":
      return "Product & business"
    case "competitive_exams":
      return "Competitive exams"
    case "design_creative":
      return "Design & creative work"
    case "technology_professional":
      return "Technology & professional roles"
    case "general_undecided":
      return "Direction discovery"
  }
}

export type PathRecommendationContext = {
  diagnosis: PathDiagnosis
  track: PathTrack
  gaps: string[]
  focus: string
  timelineLabel: string
  weeklyCadence: string
}

export function buildRecommendationContext(
  diagnosis: PathDiagnosis,
  gaps: string[],
  focus: string,
  timelineLabel: string,
): PathRecommendationContext {
  const weeklyCadence =
    diagnosis.timeline === "three_months" || diagnosis.timeline === "intensive_part_time"
      ? "two practice blocks per week"
      : diagnosis.timeline === "flexible"
        ? "one deliberate practice block every 10–14 days"
        : "one practice block per week"

  return {
    diagnosis,
    track: classifyPathTrack(diagnosis),
    gaps,
    focus,
    timelineLabel,
    weeklyCadence,
  }
}
