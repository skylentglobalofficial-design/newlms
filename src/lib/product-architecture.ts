/** Product maturity and information architecture for public Skylent. */

export type ProductMaturity = "live" | "coming_soon" | "direction" | "demo"

export const MATURITY_LABEL: Record<ProductMaturity, string> = {
  live: "Live",
  coming_soon: "Coming soon",
  direction: "Product direction",
  demo: "Local demo",
}

export const LIVE_CORE = [
  { label: "Learn", to: "/skills", note: "Discover skills, courses, and programmes" },
  { label: "Courses", to: "/courses", note: "Focused learning units" },
  { label: "Programmes", to: "/programs", note: "Structured learning pathways" },
  { label: "Skylent OS", to: "/os", note: "Your learning workspace" },
  { label: "Career OS", to: "/career-os", note: "Profile and learning evidence" },
] as const

export const ACADEMIC_LINES = [
  {
    id: "schooling",
    label: "Schooling",
    to: "/education/schooling",
    maturity: "coming_soon" as const,
    job: "Grade → subject → practice → assessment",
    audience: "Schools and families",
  },
  {
    id: "undergraduate",
    label: "Undergraduate",
    to: "/education/undergraduate",
    maturity: "coming_soon" as const,
    job: "Degree → semester → modules → projects",
    audience: "Colleges and degree students",
  },
  {
    id: "postgraduate",
    label: "Postgraduate",
    to: "/education/postgraduate",
    maturity: "coming_soon" as const,
    job: "Programme → term → specialisation → case → project",
    audience: "Universities and working professionals",
  },
  {
    id: "exams",
    label: "Exams",
    to: "/education/exams",
    maturity: "coming_soon" as const,
    job: "Diagnostic → mastery → practice → mocks",
    audience: "JEE, NEET, CAT and related prep",
  },
] as const

export const EDUCATION_HASH_REDIRECTS: Record<string, string> = {
  schooling: "/education/schooling",
  undergraduate: "/education/undergraduate",
  postgraduate: "/education/postgraduate",
  "competitive-exams": "/education/exams",
}

export const PG_PATHWAY = [
  { label: "Programme", sub: "The postgraduate offering" },
  { label: "Term", sub: "Time-boxed academic unit" },
  { label: "Specialisation", sub: "Chosen depth, not a second degree" },
  { label: "Module", sub: "Taught body of knowledge" },
  { label: "Case study", sub: "Decision under constraint" },
  { label: "Project", sub: "Evidence of independent work" },
  { label: "Assessment", sub: "Judged against the specialisation" },
  { label: "Career outcome", sub: "Readiness — not a placement promise" },
] as const

export const UG_PATHWAY = [
  { label: "Degree", sub: "B.Tech · B.Sc · BCA · BBA and peers" },
  { label: "Semester", sub: "Aligned to the academic calendar" },
  { label: "Subject", sub: "Core and elective units" },
  { label: "Module", sub: "Taught topics inside a subject" },
  { label: "Project", sub: "Portfolio evidence" },
  { label: "Internship", sub: "Where institutions offer it" },
  { label: "Progression", sub: "Skills and Career OS when qualifying" },
] as const

export const SCHOOLING_PATHWAY = [
  { label: "Grade / year", sub: "Primary through senior secondary" },
  { label: "Subject", sub: "Curriculum-aligned" },
  { label: "Chapter", sub: "Scoped unit of study" },
  { label: "Practice", sub: "Guided activity" },
  { label: "Labs", sub: "Where the subject needs a workbench" },
  { label: "Assessment", sub: "Check for mastery" },
  { label: "Progression", sub: "Visible to student, teacher, parent" },
] as const

export const EXAM_PATHWAY = [
  { label: "Exam", sub: "The target paper" },
  { label: "Diagnostic", sub: "Where you actually stand" },
  { label: "Study plan", sub: "What to cover next" },
  { label: "Topic mastery", sub: "Subject and section depth" },
  { label: "Practice", sub: "Item-level work" },
  { label: "Mock tests", sub: "Timed full papers" },
  { label: "Analytics", sub: "Weakness, pace, readiness" },
] as const

export const INSTITUTION_OS_LAYERS = [
  { label: "Institution", status: "direction" as const, note: "Organisation accounts exist; no full OS yet" },
  { label: "Programmes", status: "live" as const, note: "Professional catalogue can be offered to learners" },
  { label: "Cohorts / batches", status: "coming_soon" as const, note: "Not in the database schema" },
  { label: "Learners", status: "live" as const, note: "Enrollment and LMS progress for open programmes" },
  { label: "Faculty", status: "coming_soon" as const, note: "Role exists; assignment is not modeled" },
  { label: "Assessments", status: "live" as const, note: "Quizzes and assignments inside enrolled courses" },
  { label: "Progress", status: "live" as const, note: "Lesson progress in the LMS" },
  { label: "Reporting", status: "coming_soon" as const, note: "Institution analytics are not shipping" },
] as const

export const LAB_PATHWAY = [
  { label: "Lab", sub: "Subject workbench" },
  { label: "Experiment", sub: "A bounded task" },
  { label: "Workspace", sub: "Editor, notebook, or simulation" },
  { label: "Run", sub: "Execute locally in the browser" },
  { label: "Result", sub: "Output for this session" },
  { label: "Takeaway", sub: "What the experiment was for" },
] as const

export type NavMark = ProductMaturity

export type MegaNavItem = {
  label: string
  sub: string
  to: string
  mark?: NavMark
}

export type MegaNavGroup = {
  label: string
  /** Omit to keep the label as a dropdown only (no hub landing). */
  to?: string
  tagline: string
  items: MegaNavItem[]
}

export const LEARN_NAV: MegaNavGroup = {
  label: "Learn",
  to: "/skills",
  tagline: "Discover and choose what to learn",
  items: [
    { label: "Skills", sub: "What do you want to be able to do?", to: "/skills" },
    { label: "Courses", sub: "Focused learning units.", to: "/courses" },
    { label: "Programmes", sub: "Longer structured learning pathways.", to: "/programs" },
  ],
}

export const CAREER_NAV: MegaNavGroup = {
  label: "Career",
  to: "/career-os",
  tagline: "Keep track of the work and evidence you build while learning.",
  items: [
    { label: "Career OS", sub: "Keep your profile and learning evidence in one place.", to: "/career-os" },
  ],
}

export function studyNavGroup(session: { signedIn: boolean; isStudent: boolean }): MegaNavGroup {
  if (session.isStudent) {
    return {
      label: "Study",
      to: "/dashboard/student",
      tagline: "Continue what you are learning",
      items: [
        {
          label: "Your learning workspace",
          sub: "Student dashboard — Skylent OS",
          to: "/dashboard/student",
        },
      ],
    }
  }

  if (session.signedIn) {
    return {
      label: "Study",
      to: "/courses",
      tagline: "The learner workspace for enrolled courses",
      items: [
        { label: "Browse courses", sub: "Find a course to study", to: "/courses" },
        { label: "Skylent OS", sub: "How the learning workspace works", to: "/os" },
      ],
    }
  }

  return {
    label: "Study",
    tagline: "Continue what you are learning",
    items: [
      { label: "Sign in", sub: "Continue your enrolled courses", to: "/login" },
      { label: "Start learning", sub: "Browse courses", to: "/courses" },
    ],
  }
}

export function buildPrimaryNav(session: { signedIn: boolean; isStudent: boolean }): MegaNavGroup[] {
  return [LEARN_NAV, studyNavGroup(session), CAREER_NAV]
}

/** Primary student destinations. Study is assembled per session via buildPrimaryNav. */
export const MEGA_NAV: MegaNavGroup[] = [LEARN_NAV, CAREER_NAV]

/** Future / secondary destinations — footer and mobile More only. Not first-row nav. */
export const MORE_NAV: MegaNavItem[] = [
  { label: "Education", sub: "Schooling, degrees, and exams — future", to: "/education", mark: "coming_soon" },
  { label: "Institutions", sub: "Institution tools — not the student product", to: "/institutions", mark: "direction" },
]

export const FOOTER_COLS = [
  {
    heading: "Learn",
    links: [
      ["Skills", "/skills"],
      ["Courses", "/courses"],
      ["Programmes", "/programs"],
    ],
  },
  {
    heading: "Study",
    links: [
      ["Student dashboard", "/dashboard/student"],
      ["Skylent OS", "/os"],
    ],
  },
  {
    heading: "Career",
    links: [
      ["Career OS", "/career-os"],
    ],
  },
  {
    heading: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Blog", "/blog"],
      ["Stories", "/stories"],
    ],
  },
  {
    heading: "Future",
    links: [
      ["Education", "/education"],
      ["Institutions", "/institutions"],
    ],
  },
] as const

export const CAREER_OS_IA = [
  { label: "Profile", to: "/career-os/profile", sub: "Identity, skills, evidence" },
  { label: "Opportunities", to: "/career-os/jobs", sub: "Job board when roles are published" },
  { label: "Applications", to: "/career-os/applications", sub: "Track what you submitted" },
  { label: "Interviews", to: "/career-os/interviews", sub: "Rounds and practice" },
  { label: "Support", to: "/career-os/support", sub: "Help on the career workflow" },
] as const
