/** Product maturity and information architecture for public Skylent. */

export type ProductMaturity = "live" | "coming_soon" | "direction" | "demo"

export const MATURITY_LABEL: Record<ProductMaturity, string> = {
  live: "Live",
  coming_soon: "Coming soon",
  direction: "Product direction",
  demo: "Local demo",
}

export const LIVE_CORE = [
  { label: "Courses", to: "/courses", note: "Focused learning units" },
  { label: "Programmes", to: "/programs", note: "Structured learning pathways" },
  { label: "Skills", to: "/skills", note: "Choose what you want to be able to do" },
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

export type MegaNavSection = {
  heading: string
  items: MegaNavItem[]
}

export type MegaNavGroup = {
  label: string
  /** Omit to keep the label as a dropdown only (no hub landing). */
  to?: string
  tagline: string
  items: MegaNavItem[]
  sections?: MegaNavSection[]
}

export const COURSES_NAV: MegaNavGroup = {
  label: "Courses",
  to: "/courses",
  tagline: "Focused courses you can start",
  items: [
    { label: "All courses", sub: "Ready courses and catalogue listings.", to: "/courses" },
    { label: "Data Analytics", sub: "SQL, spreadsheets, and a dashboard you keep.", to: "/courses/data-analytics" },
    { label: "Product Management", sub: "Evidence → spec on a live case.", to: "/courses/product-management" },
    { label: "Skills", sub: "Not sure where to start? Pick a skill.", to: "/skills" },
  ],
}

export const PROGRAMS_NAV: MegaNavGroup = {
  label: "Programs",
  tagline: "Professional learning and short sessions",
  items: [
    { label: "Professional Certificate Programs", sub: "Structured professional learning", to: "/programs" },
    { label: "Workshops", sub: "Short, focused live sessions", to: "/workshops" },
  ],
}

export const EDUCATION_NAV: MegaNavGroup = {
  label: "Education",
  to: "/education",
  tagline: "Academic pathways for school and degrees",
  items: [
    { label: "Schooling", sub: "Grade, subject, practice, assessment.", to: "/education/schooling", mark: "coming_soon" },
    { label: "Undergraduate", sub: "Degree, semester, modules, projects.", to: "/education/undergraduate", mark: "coming_soon" },
    { label: "Postgraduate", sub: "Programme, specialisation, case, project.", to: "/education/postgraduate", mark: "coming_soon" },
  ],
}

export const EXAMS_NAV: MegaNavGroup = {
  label: "Competitive Exams",
  to: "/education/exams",
  tagline: "UG, PG, and government exam paths",
  sections: [
    {
      heading: "UG",
      items: [
        { label: "JEE", sub: "Catalogue outline — not a live engine.", to: "/programs/jee-advanced-prep", mark: "coming_soon" },
        { label: "NEET", sub: "Specified path — not built yet.", to: "/exams/neet", mark: "coming_soon" },
      ],
    },
    {
      heading: "PG",
      items: [
        { label: "IIT JAM", sub: "Specified path — not built yet.", to: "/exams/iit-jam", mark: "coming_soon" },
        { label: "GATE", sub: "Specified path — not built yet.", to: "/exams/gate", mark: "coming_soon" },
        { label: "CAT", sub: "Catalogue outline — not a live engine.", to: "/programs/cat-prep", mark: "coming_soon" },
      ],
    },
    {
      heading: "Government",
      items: [
        { label: "SSC", sub: "Specified path — not built yet.", to: "/exams/ssc", mark: "coming_soon" },
        { label: "UPSC", sub: "Specified path — not built yet.", to: "/exams/upsc", mark: "coming_soon" },
      ],
    },
  ],
  items: [
    { label: "JEE", sub: "Catalogue outline — not a live engine.", to: "/programs/jee-advanced-prep", mark: "coming_soon" },
    { label: "NEET", sub: "Specified path — not built yet.", to: "/exams/neet", mark: "coming_soon" },
    { label: "IIT JAM", sub: "Specified path — not built yet.", to: "/exams/iit-jam", mark: "coming_soon" },
    { label: "GATE", sub: "Specified path — not built yet.", to: "/exams/gate", mark: "coming_soon" },
    { label: "CAT", sub: "Catalogue outline — not a live engine.", to: "/programs/cat-prep", mark: "coming_soon" },
    { label: "SSC", sub: "Specified path — not built yet.", to: "/exams/ssc", mark: "coming_soon" },
    { label: "UPSC", sub: "Specified path — not built yet.", to: "/exams/upsc", mark: "coming_soon" },
  ],
}

export const EXAM_STUBS: Record<string, { title: string; group: string; summary: string }> = {
  neet: {
    title: "NEET",
    group: "UG",
    summary: "NEET is a named undergraduate medical entrance path on Skylent. There is no live question bank, mock engine, or classroom behind this page yet.",
  },
  "iit-jam": {
    title: "IIT JAM",
    group: "PG",
    summary: "IIT JAM is a named postgraduate science entrance path on Skylent. Diagnostics, topic practice, and mocks are not built yet.",
  },
  gate: {
    title: "GATE",
    group: "PG",
    summary: "GATE is a named postgraduate engineering entrance path on Skylent. There is no live GATE engine on this product today.",
  },
  ssc: {
    title: "SSC",
    group: "Government",
    summary: "SSC is a named government exam path on Skylent. It is specified in the information architecture, not as a live prep product.",
  },
  upsc: {
    title: "UPSC",
    group: "Government",
    summary: "UPSC is a named government exam path on Skylent. It is specified in the information architecture, not as a live prep product.",
  },
}

/** @deprecated Use COURSES_NAV. Kept so older imports keep compiling. */
export const LEARN_NAV: MegaNavGroup = COURSES_NAV

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

export function buildPrimaryNav(_session?: { signedIn: boolean; isStudent: boolean }): MegaNavGroup[] {
  return [PROGRAMS_NAV, EDUCATION_NAV, EXAMS_NAV]
}

/** Locked public destinations. Study/Career stay off the first row. */
export const MEGA_NAV: MegaNavGroup[] = [PROGRAMS_NAV, EDUCATION_NAV, EXAMS_NAV]

/** Future / secondary destinations — footer and mobile More only. Not first-row nav. */
export const MORE_NAV: MegaNavItem[] = [
  { label: "Skills", sub: "What do you want to be able to do?", to: "/skills" },
  { label: "Courses", sub: "Focused units inside professional programmes", to: "/courses" },
  { label: "Institutions", sub: "Institution tools — not the student product", to: "/institutions", mark: "direction" },
]

export const FOOTER_COLS = [
  {
    heading: "Courses",
    links: [
      ["All courses", "/courses"],
      ["Skills", "/skills"],
      ["Programmes", "/programs"],
    ],
  },
  {
    heading: "Workspace",
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
  { label: "Projects", to: "/career-os/projects", sub: "Learner work kept as evidence" },
  { label: "Profile", to: "/career-os/profile", sub: "Identity, skills, evidence" },
  { label: "Opportunities", to: "/career-os/jobs", sub: "Job board when roles are published" },
  { label: "Applications", to: "/career-os/applications", sub: "Track what you submitted" },
  { label: "Interviews", to: "/career-os/interviews", sub: "Rounds and practice" },
  { label: "Support", to: "/career-os/support", sub: "Help on the career workflow" },
] as const
