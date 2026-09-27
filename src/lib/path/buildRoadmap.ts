import { buildRecommendationContext, classifyPathTrack, trackLabel } from "./classifyTrack"
import { buildPhasesForTrack } from "./phaseBuilders"
import { suggestProgrammeSlugs } from "./programmeMatch"
import type {
  CareerDirection,
  PathDiagnosis,
  PersonalRoadmap,
  SkillLevel,
  TargetOutcome,
} from "./types"

export { classifyPathTrack, trackLabel } from "./classifyTrack"

const BACKGROUND_LABEL: Record<PathDiagnosis["academicBackground"], string> = {
  school: "School learner",
  college: "College / undergraduate",
  graduate: "Graduate student",
  working: "Working professional",
  career_change: "Changing direction",
}

const EDUCATION_LABEL: Record<PathDiagnosis["currentEducation"], string> = {
  school_secondary: "Secondary school",
  undergraduate: "Undergraduate programme",
  postgraduate: "Postgraduate programme",
  self_taught: "Self-directed learning",
  working_no_degree: "Working without a formal degree track",
}

const INTEREST_LABEL: Record<PathDiagnosis["interests"][number], string> = {
  technology: "Technology",
  data_analytics: "Data & analytics",
  product: "Product",
  design: "Design",
  engineering: "Engineering",
  business: "Business & strategy",
  research: "Research",
  competitive_exams: "Competitive exams",
  still_exploring: "Still exploring",
}

const SKILL_LABEL: Record<SkillLevel, string> = {
  starting: "Building foundations",
  some_exposure: "Some exposure, limited evidence",
  project_ready: "Can complete guided projects",
  work_ready: "Can apply skills in real contexts",
}

const OUTCOME_LABEL: Record<TargetOutcome, string> = {
  land_first_role: "Land a first credible role",
  move_up_or_switch: "Move up or switch roles",
  credible_portfolio: "A portfolio others can evaluate",
  complete_degree: "Progress through a degree path",
  pass_exam: "Pass a target exam",
  decide_next_step: "Decide the next step with evidence",
}

const TIMELINE_LABEL: Record<PathDiagnosis["timeline"], string> = {
  three_months: "Roughly three months",
  six_months: "Roughly six months",
  twelve_months: "Roughly twelve months",
  flexible: "Flexible — quality over speed",
  intensive_part_time: "Intensive alongside other commitments",
}

function interestThemes(interests: PathDiagnosis["interests"]): string {
  if (!interests.length || interests.includes("still_exploring")) {
    return "direction you are still testing"
  }
  return interests.map((row) => INTEREST_LABEL[row]).join(", ")
}

function defaultGaps(diagnosis: PathDiagnosis): string[] {
  const fromSelection = diagnosis.gaps.filter(Boolean)
  if (fromSelection.length) return fromSelection

  const inferred: string[] = []
  if (diagnosis.existingSkills === "starting") inferred.push("Core foundations")
  if (diagnosis.existingSkills !== "work_ready") inferred.push("Applied practice")
  if (!diagnosis.strengths.trim()) inferred.push("Visible evidence")
  if (diagnosis.careerDirection === "clarify_direction") inferred.push("Direction clarity")
  return inferred.length ? inferred : ["Applied practice", "Evidence you can show"]
}

function buildTarget(diagnosis: PathDiagnosis): string {
  const detail = diagnosis.directionDetail.trim()
  const theme = interestThemes(diagnosis.interests)
  const outcome = OUTCOME_LABEL[diagnosis.targetOutcome]
  if (detail) {
    return `${outcome} toward ${detail}`
  }
  return `${outcome} in ${theme}`
}

function buildCurrentPosition(diagnosis: PathDiagnosis): string {
  const parts = [
    BACKGROUND_LABEL[diagnosis.academicBackground],
    EDUCATION_LABEL[diagnosis.currentEducation],
    SKILL_LABEL[diagnosis.existingSkills],
  ]
  const strength = diagnosis.strengths.trim()
  if (strength) parts.push(`Strength: ${strength}`)
  return parts.join(" · ")
}

function nextActionFor(
  diagnosis: PathDiagnosis,
  gaps: string[],
  track: ReturnType<typeof classifyPathTrack>,
  focus: string,
  timelineLabel: string,
): string {
  const t = timelineLabel.toLowerCase()

  if (track === "competitive_exams") {
    return `Within ${t}, complete one syllabus section diagnostic and log errors by topic before adding new material.`
  }
  if (track === "design_creative") {
    return `Within ${t}, finish one constrained design iteration with a written rationale you can show in a portfolio.`
  }
  if (track === "data_analytics") {
    return `Within ${t}, answer one business question with a reproducible table/chart and a short recommendation memo.`
  }
  if (track === "product_business") {
    return `Within ${t}, write one decision spec under a stated constraint (time, scope, or risk).`
  }
  if (track === "general_undecided") {
    return `Within ${t}, run one small experiment in ${focus}, document what you learned, and decide whether to go deeper or pivot.`
  }
  if (gaps[0]?.toLowerCase().includes("foundation")) {
    return `Within ${t}, close the highest-value foundation gap for ${focus}, then ship a small technical artifact.`
  }
  return `Within ${t}, address "${gaps[0] ?? "applied practice"}" for ${focus} with a saved output you can show someone.`
}

/**
 * Deterministic roadmap builder — no network, no LLM. Same inputs always yield the same roadmap.
 */
export function buildRoadmap(diagnosis: PathDiagnosis): PersonalRoadmap {
  const gaps = defaultGaps(diagnosis)
  const focus = diagnosis.directionDetail.trim() || interestThemes(diagnosis.interests)
  const timelineLabel = TIMELINE_LABEL[diagnosis.timeline]
  const track = classifyPathTrack(diagnosis)
  const ctx = buildRecommendationContext(diagnosis, gaps, focus, timelineLabel)
  const phases = buildPhasesForTrack(ctx)

  return {
    currentPosition: buildCurrentPosition(diagnosis),
    target: buildTarget(diagnosis),
    gaps,
    ...phases,
    nextAction: nextActionFor(diagnosis, gaps, track, focus, timelineLabel),
    suggestedProgrammeSlugs: suggestProgrammeSlugs(diagnosis, track),
    generatedAt: new Date().toISOString(),
  }
}
