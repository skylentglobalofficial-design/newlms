import type {
  CareerDirection,
  InterestArea,
  PathDiagnosis,
  PersonalRoadmap,
  RoadmapPhase,
  SkillLevel,
  TargetOutcome,
} from "./types"

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

const INTEREST_LABEL: Record<InterestArea, string> = {
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

const DIRECTION_LABEL: Record<CareerDirection, string> = {
  professional_role: "A professional role",
  technical_specialist: "Deep technical specialist",
  research_academic: "Research or academic depth",
  build_company: "Building a product or company",
  exam_path: "An exam or admissions path",
  clarify_direction: "Clarity on direction first",
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

function phase(title: string, summary: string, actions: string[]): RoadmapPhase {
  return { title, summary, actions }
}

function interestThemes(interests: InterestArea[]): string {
  if (!interests.length || interests.includes("still_exploring")) {
    return "direction you are still testing"
  }
  return interests.map((row) => INTEREST_LABEL[row]).join(", ")
}

function suggestedProgrammes(interests: InterestArea[], direction: CareerDirection): string[] {
  const slugs: string[] = []
  if (
    interests.includes("data_analytics") ||
    interests.includes("technology") ||
    direction === "technical_specialist"
  ) {
    slugs.push("data-analytics-pro")
  }
  if (
    interests.includes("product") ||
    interests.includes("business") ||
    direction === "build_company" ||
    direction === "professional_role"
  ) {
    slugs.push("product-management")
  }
  return [...new Set(slugs)]
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

function nextActionFor(diagnosis: PathDiagnosis, gaps: string[]): string {
  const timeline = TIMELINE_LABEL[diagnosis.timeline]
  const focus = diagnosis.directionDetail.trim() || interestThemes(diagnosis.interests)

  if (diagnosis.careerDirection === "clarify_direction" || diagnosis.targetOutcome === "decide_next_step") {
    return `Within ${timeline.toLowerCase()}, run one small real task in ${focus}, capture what you learned, and choose whether to go deeper or pivot.`
  }

  if (gaps[0]?.toLowerCase().includes("foundation")) {
    return `Within ${timeline.toLowerCase()}, close the highest-value foundation gap for ${focus}, then schedule one practice session that produces saved work.`
  }

  return `Within ${timeline.toLowerCase()}, pick one gap (${gaps[0] ?? "applied practice"}) for ${focus}, complete a bounded exercise, and add the output to your evidence trail.`
}

/**
 * Deterministic roadmap builder — no network, no LLM. Same inputs always yield the same roadmap.
 */
export function buildRoadmap(diagnosis: PathDiagnosis): PersonalRoadmap {
  const gaps = defaultGaps(diagnosis)
  const focus = diagnosis.directionDetail.trim() || interestThemes(diagnosis.interests)
  const direction = DIRECTION_LABEL[diagnosis.careerDirection]
  const timeline = TIMELINE_LABEL[diagnosis.timeline]

  const foundation = phase(
    "Foundation",
    `Establish what ${focus} requires before you optimise for speed.`,
    [
      `Name the outcome: ${OUTCOME_LABEL[diagnosis.targetOutcome]}.`,
      `Map what you already bring: ${SKILL_LABEL[diagnosis.existingSkills]}.`,
      diagnosis.strengths.trim()
        ? `Keep using: ${diagnosis.strengths.trim()}.`
        : "Write down two things you can already do — even informally.",
      gaps.includes("Core foundations")
        ? "List the concepts you would need to explain to a peer."
        : "Confirm vocabulary and context for your target direction.",
    ],
  )

  const skills = phase(
    "Skills",
    `Learn only what is missing for ${direction.toLowerCase()} — not everything in the catalogue.`,
    [
      `Prioritise gaps: ${gaps.join(", ")}.`,
      `Choose one learning unit aligned to ${focus}.`,
      "Stop when you can apply the idea — not when the syllabus ends.",
      diagnosis.gapDetail.trim() ? `Your note: ${diagnosis.gapDetail.trim()}` : "Revisit gaps weekly; drop what no longer matters.",
    ],
  )

  const practice = phase(
    "Practice",
    "Deliberate application beats passive consumption.",
    [
      "Set a bounded exercise with a clear finish line.",
      "Use realistic constraints (time, data, stakeholder).",
      "Compare your output to what the target role or exam expects.",
      `Cadence for ${timeline.toLowerCase()}: one practice block per week minimum.`,
    ],
  )

  const build = phase(
    "Build",
    "Turn practice into work someone else can inspect.",
    [
      `Ship one artifact that demonstrates ${focus}.`,
      diagnosis.careerDirection === "build_company"
        ? "Document decisions, trade-offs, and what you would do next."
        : "Tie the artifact to a decision, analysis, or specification.",
      "Keep source files, notes, and drafts — evidence is the product.",
    ],
  )

  const proof = phase(
    "Proof",
    "Make capability legible outside your head.",
    [
      "Publish a concise case note: problem, approach, result.",
      "Add the artifact to Career OS or your portfolio surface.",
      "Ask for one specific critique — not generic praise.",
    ],
  )

  const opportunity = phase(
    "Opportunity",
    "Use evidence to choose the next door — programme, role, exam, or experiment.",
    [
      diagnosis.careerDirection === "exam_path"
        ? "Align mocks and study plan to the exam calendar."
        : "Shortlist roles, programmes, or collaborators that match your evidence.",
      "Apply or enrol only when the gap list is honestly smaller than when you started.",
      "Keep the path alive: revisit diagnosis when your situation changes.",
    ],
  )

  return {
    currentPosition: buildCurrentPosition(diagnosis),
    target: buildTarget(diagnosis),
    gaps,
    foundation,
    skills,
    practice,
    build,
    proof,
    opportunity,
    nextAction: nextActionFor(diagnosis, gaps),
    suggestedProgrammeSlugs: suggestedProgrammes(diagnosis.interests, diagnosis.careerDirection),
    generatedAt: new Date().toISOString(),
  }
}
