export type AcademicBackground =
  | "school"
  | "college"
  | "graduate"
  | "working"
  | "career_change"

export type CurrentEducation =
  | "school_secondary"
  | "undergraduate"
  | "postgraduate"
  | "self_taught"
  | "working_no_degree"

export type InterestArea =
  | "technology"
  | "data_analytics"
  | "product"
  | "design"
  | "engineering"
  | "business"
  | "research"
  | "competitive_exams"
  | "still_exploring"

export type SkillLevel =
  | "starting"
  | "some_exposure"
  | "project_ready"
  | "work_ready"

export type CareerDirection =
  | "professional_role"
  | "technical_specialist"
  | "research_academic"
  | "build_company"
  | "exam_path"
  | "clarify_direction"

export type TargetOutcome =
  | "land_first_role"
  | "move_up_or_switch"
  | "credible_portfolio"
  | "complete_degree"
  | "pass_exam"
  | "decide_next_step"

export type TimelineConstraint =
  | "three_months"
  | "six_months"
  | "twelve_months"
  | "flexible"
  | "intensive_part_time"

/** Answers collected across the seven-stage Skylent Path diagnostic. */
export type PathDiagnosis = {
  academicBackground: AcademicBackground
  currentEducation: CurrentEducation
  interests: InterestArea[]
  existingSkills: SkillLevel
  careerDirection: CareerDirection
  /** Free-text strengths the learner already has. */
  strengths: string
  /** Selected gap themes plus optional detail in `gapDetail`. */
  gaps: string[]
  gapDetail: string
  /** Where they want to go — role, field, exam, or question. */
  directionDetail: string
  targetOutcome: TargetOutcome
  timeline: TimelineConstraint
  completedAt: string
}

export type RoadmapPhase = {
  title: string
  summary: string
  actions: string[]
}

export type PersonalRoadmap = {
  currentPosition: string
  target: string
  gaps: string[]
  foundation: RoadmapPhase
  skills: RoadmapPhase
  practice: RoadmapPhase
  build: RoadmapPhase
  proof: RoadmapPhase
  opportunity: RoadmapPhase
  nextAction: string
  /** Slugs from the real programme catalogue — never invented programmes. */
  suggestedProgrammeSlugs: string[]
  generatedAt: string
}

export type PathFlowDraft = Partial<
  Omit<PathDiagnosis, "completedAt" | "interests" | "gaps"> & {
    interests: InterestArea[]
    gaps: string[]
  }
>

export type PathStoredState = {
  version: 1
  diagnosis: PathDiagnosis | null
  roadmap: PersonalRoadmap | null
  flowStep: number
  draft: PathFlowDraft
}

export interface PathRecommendationService {
  buildRoadmap(diagnosis: PathDiagnosis): PersonalRoadmap
}
