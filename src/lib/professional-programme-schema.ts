/**
 * Reusable public content contract for Professional Programmes.
 *
 * This is intentionally content-first: the page template should remain stable while
 * programme authors change modules, lessons, projects, plans, FAQs, and media.
 *
 * The current catalogue still sources most fields from Program + Course records.
 * This contract is the target shape for future manual programme authoring.
 */

export type ProgrammeSectionKind =
  | "hero"
  | "overview"
  | "outcomes"
  | "journey"
  | "projects"
  | "curriculum"
  | "practice"
  | "tools"
  | "mentors"
  | "career_os"
  | "credential"
  | "plans"
  | "faq"
  | "enrol"

export type ProgrammeLesson = {
  title: string
  type: "lesson" | "check" | "assignment" | "lab"
  duration?: string
}

export type ProgrammeModule = {
  title: string
  summary?: string
  lessons: ProgrammeLesson[]
}

export type ProgrammeProject = {
  title: string
  description: string
  skills: string[]
  difficulty?: "Beginner" | "Intermediate" | "Advanced"
  image?: string
}

export type ProgrammePlan = {
  name: string
  price: number
  originalPrice?: number
  features: string[]
  highlight?: boolean
}

export type ProgrammeFAQ = {
  question: string
  answer: string
}

export type ProfessionalProgrammeContent = {
  slug: string
  title: string
  eyebrow?: string
  description: string
  decisionLine?: string
  duration: string
  level: string
  format: string
  projectCount?: number
  heroImage?: string
  modules: ProgrammeModule[]
  outcomes: string[]
  projects: ProgrammeProject[]
  tools?: string[]
  mentors?: Array<{
    name: string
    role: string
    image?: string
  }>
  careerOS?: {
    enabled: boolean
    description?: string
  }
  credential?: {
    label: string
    affiliatedWith?: string
  }
  plans?: ProgrammePlan[]
  faqs?: ProgrammeFAQ[]
}
