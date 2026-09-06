export type CareerWorkflowStepId =
  | "profile"
  | "skills"
  | "opportunities"
  | "applications"
  | "interviews"
  | "support"

export type CareerWorkflowStepDef = {
  id: CareerWorkflowStepId
  label: string
  sub: string
  tagline: string
  description: string
}

export const CAREER_WORKFLOW_STEPS: CareerWorkflowStepDef[] = [
  {
    id: "profile",
    label: "Profile",
    sub: "Identity & resume",
    tagline: "Structured professional identity built from program work.",
    description:
      "Headline, summary, education, experience, and links — with profile completeness guidance and resume export when you are ready.",
  },
  {
    id: "skills",
    label: "Skills",
    sub: "Proof & portfolio",
    tagline: "Skills and projects that back up your profile.",
    description:
      "Program-linked skills, portfolio projects, and credentials feed your career profile — not a separate skills list disconnected from your learning.",
  },
  {
    id: "opportunities",
    label: "Opportunities",
    sub: "Job board",
    tagline: "Roles you can inspect, save, and apply to.",
    description:
      "Search and filter open roles, review requirements, and move from browsing to application without leaving the workspace.",
  },
  {
    id: "applications",
    label: "Applications",
    sub: "Pipeline tracking",
    tagline: "Submit and track every application in one place.",
    description:
      "Saved, applied, screening, interview, and offer stages — with status history and next actions on each submission.",
  },
  {
    id: "interviews",
    label: "Interviews",
    sub: "Prep & rounds",
    tagline: "Interview rounds with practice and scheduling.",
    description:
      "Technical, HR, and managerial prep plus round tracking tied to your applications — mocks and coaching live here.",
  },
  {
    id: "support",
    label: "Support",
    sub: "Career guidance",
    tagline: "Guidance requests and tasks through the process.",
    description:
      "Profile review, resume help, interview prep, and application guidance — structured as support requests with trackable tasks.",
  },
]

export function getCareerWorkflowStepById(id: CareerWorkflowStepId): CareerWorkflowStepDef {
  return CAREER_WORKFLOW_STEPS.find((step) => step.id === id) ?? CAREER_WORKFLOW_STEPS[0]
}

export const CAREER_WORKFLOW_FLOW = CAREER_WORKFLOW_STEPS.map((step) => step.label)

/** Structural preview fields — labeled demo UI only, not user outcomes. */
export const CAREER_PREVIEW_PROFILE = {
  completeness: 62,
  headline: "Data analyst · program graduate",
  sections: [
    { label: "Education", value: "—" },
    { label: "Experience", value: "—" },
    { label: "Skills", value: "—" },
    { label: "Projects", value: "—" },
    { label: "Links", value: "—" },
  ],
  nextAction: "Add education and experience to strengthen your profile",
}

export const CAREER_PREVIEW_SKILLS = {
  areas: ["SQL", "Python", "Data visualization", "Statistics"],
  proof: ["Program projects", "Assessments", "Portfolio links"],
}

export const CAREER_PREVIEW_OPPORTUNITY = {
  filters: ["Remote", "Full-time", "Data & analytics"],
  rows: [
    { role: "Analyst role", meta: "Location · work mode", skills: ["SQL", "Python"] },
    { role: "Engineering role", meta: "Location · work mode", skills: ["JavaScript", "APIs"] },
  ],
}

export const CAREER_PREVIEW_APPLICATION_STATUSES = [
  "Saved",
  "Applied",
  "Screening",
  "Interview",
  "Offer",
] as const

export const CAREER_PREVIEW_INTERVIEW_ROUNDS = [
  { type: "Technical", status: "Scheduled" },
  { type: "HR", status: "Prep" },
] as const

export const CAREER_PREVIEW_SUPPORT_TYPES = [
  "Profile review",
  "Resume build",
  "Interview prep",
  "Application guidance",
] as const
