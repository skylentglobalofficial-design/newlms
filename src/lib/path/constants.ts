import type {
  AcademicBackground,
  CareerDirection,
  CurrentEducation,
  InterestArea,
  SkillLevel,
  TargetOutcome,
  TimelineConstraint,
} from "./types"

export type PathStageId =
  | "academic"
  | "interests"
  | "skills"
  | "direction"
  | "gaps"
  | "outcome"
  | "timeline"

export type PathStage = {
  id: PathStageId
  number: number
  title: string
  subtitle: string
}

export const PATH_STAGES: PathStage[] = [
  { id: "academic", number: 1, title: "Where are you academically?", subtitle: "Your current study or work context." },
  { id: "interests", number: 2, title: "What interests you?", subtitle: "Pick everything that pulls you — you can refine later." },
  { id: "skills", number: 3, title: "What can you already do?", subtitle: "Honest self-assessment; evidence comes later." },
  { id: "direction", number: 4, title: "Where do you want to go?", subtitle: "A role, field, exam, research area, or open question." },
  { id: "gaps", number: 5, title: "What are you currently missing?", subtitle: "Themes you feel in the way today." },
  { id: "outcome", number: 6, title: "What outcome are you targeting?", subtitle: "What would make the next months feel successful?" },
  { id: "timeline", number: 7, title: "What is your timeline?", subtitle: "Constraints help sequence the path — not rush it." },
]

export const ACADEMIC_OPTIONS: { value: AcademicBackground; label: string; hint: string }[] = [
  { value: "school", label: "School", hint: "Secondary or senior secondary" },
  { value: "college", label: "College", hint: "Undergraduate or diploma" },
  { value: "graduate", label: "Graduate", hint: "Master's, PhD, or equivalent" },
  { value: "working", label: "Working", hint: "Employed or freelancing" },
  { value: "career_change", label: "Changing direction", hint: "Pivoting field or role" },
]

export const EDUCATION_OPTIONS: { value: CurrentEducation; label: string }[] = [
  { value: "school_secondary", label: "Secondary school track" },
  { value: "undergraduate", label: "Undergraduate programme" },
  { value: "postgraduate", label: "Postgraduate programme" },
  { value: "self_taught", label: "Mostly self-taught" },
  { value: "working_no_degree", label: "Working without a degree focus" },
]

export const INTEREST_OPTIONS: { value: InterestArea; label: string }[] = [
  { value: "technology", label: "Technology" },
  { value: "data_analytics", label: "Data & analytics" },
  { value: "product", label: "Product" },
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "business", label: "Business" },
  { value: "research", label: "Research" },
  { value: "competitive_exams", label: "Competitive exams" },
  { value: "still_exploring", label: "Still exploring" },
]

export const SKILL_OPTIONS: { value: SkillLevel; label: string; hint: string }[] = [
  { value: "starting", label: "Starting out", hint: "Need foundations" },
  { value: "some_exposure", label: "Some exposure", hint: "Courses or tutorials" },
  { value: "project_ready", label: "Project-ready", hint: "Guided projects OK" },
  { value: "work_ready", label: "Work-ready", hint: "Used in real contexts" },
]

export const DIRECTION_OPTIONS: { value: CareerDirection; label: string }[] = [
  { value: "professional_role", label: "Professional role" },
  { value: "technical_specialist", label: "Technical depth" },
  { value: "research_academic", label: "Research / academic" },
  { value: "build_company", label: "Product or company" },
  { value: "exam_path", label: "Exam or admissions" },
  { value: "clarify_direction", label: "Clarity first" },
]

export const GAP_OPTIONS: string[] = [
  "Core foundations",
  "Applied practice",
  "Visible evidence",
  "Communication",
  "Direction clarity",
  "Network & opportunities",
  "Time & consistency",
]

export const OUTCOME_OPTIONS: { value: TargetOutcome; label: string }[] = [
  { value: "land_first_role", label: "First credible role" },
  { value: "move_up_or_switch", label: "Move up or switch" },
  { value: "credible_portfolio", label: "Portfolio others can judge" },
  { value: "complete_degree", label: "Degree progress" },
  { value: "pass_exam", label: "Exam readiness" },
  { value: "decide_next_step", label: "Decide next step" },
]

export const TIMELINE_OPTIONS: { value: TimelineConstraint; label: string }[] = [
  { value: "three_months", label: "About 3 months" },
  { value: "six_months", label: "About 6 months" },
  { value: "twelve_months", label: "About 12 months" },
  { value: "flexible", label: "Flexible pace" },
  { value: "intensive_part_time", label: "Intensive + other commitments" },
]
