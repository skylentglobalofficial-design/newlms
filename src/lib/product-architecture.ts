/** Product maturity and information architecture for public Skylent. */

export type ProductMaturity = "live" | "coming_soon" | "direction" | "demo"

export const MATURITY_LABEL: Record<ProductMaturity, string> = {
  live: "Live",
  coming_soon: "Coming soon",
  direction: "Product direction",
  demo: "Local demo",
}

export const LIVE_CORE = [
  { label: "Courses", to: "/courses", note: "Focused skills units" },
  { label: "Programmes", to: "/programs", note: "Professional pathways" },
  { label: "LMS", to: "/login", note: "Enrolled learning workspace" },
  { label: "Career OS", to: "/career-os", note: "Profile, jobs, interviews" },
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
  to: string
  tagline: string
  items: MegaNavItem[]
}

/** Global nav: live product first, academic lines marked upcoming. */
export const MEGA_NAV: MegaNavGroup[] = [
  {
    label: "Learn",
    to: "/skills",
    tagline: "The live operating core",
    items: [
      { label: "Courses", sub: "Focused skills units", to: "/courses", mark: "live" },
      { label: "Programmes", sub: "Professional pathways", to: "/programs", mark: "live" },
      { label: "Skills discovery", sub: "What are you trying to become?", to: "/skills", mark: "live" },
      { label: "Workshops", sub: "Listings only · registration not live", to: "/workshops", mark: "coming_soon" },
      { label: "Labs", sub: "Browser experiments", to: "/labs", mark: "demo" },
    ],
  },
  {
    label: "Education",
    to: "/education",
    tagline: "Academic lines in development",
    items: [
      { label: "Schooling", sub: "Grade to progression", to: "/education/schooling", mark: "coming_soon" },
      { label: "Undergraduate", sub: "Degree-aligned pathway", to: "/education/undergraduate", mark: "coming_soon" },
      { label: "Postgraduate", sub: "Term, specialisation, case", to: "/education/postgraduate", mark: "coming_soon" },
      { label: "Exams", sub: "JEE · NEET · CAT direction", to: "/education/exams", mark: "coming_soon" },
    ],
  },
  {
    label: "Career",
    to: "/career-os",
    tagline: "Professional workspace",
    items: [
      { label: "Career OS", sub: "How the workspace works", to: "/career-os", mark: "live" },
      { label: "Profile", sub: "Identity and evidence", to: "/career-os/profile", mark: "live" },
      { label: "Opportunities", sub: "Job board when roles exist", to: "/career-os/jobs", mark: "live" },
      { label: "Interviews", sub: "Practice and rounds", to: "/career-os/interviews", mark: "live" },
    ],
  },
  {
    label: "Institutions",
    to: "/institutions",
    tagline: "B2B operating layer",
    items: [
      { label: "Institution OS", sub: "Programmes to reporting", to: "/institutions", mark: "direction" },
      { label: "Universities", sub: "Illustrative delivery model", to: "/universities", mark: "direction" },
    ],
  },
]

export const FOOTER_COLS = [
  {
    heading: "Learn",
    links: [
      ["Courses", "/courses"],
      ["Programmes", "/programs"],
      ["Skills", "/skills"],
      ["Workshops", "/workshops"],
      ["Labs", "/labs"],
    ],
  },
  {
    heading: "Education",
    links: [
      ["Overview", "/education"],
      ["Schooling", "/education/schooling"],
      ["Undergraduate", "/education/undergraduate"],
      ["Postgraduate", "/education/postgraduate"],
      ["Exams", "/education/exams"],
    ],
  },
  {
    heading: "Career",
    links: [
      ["Career OS", "/career-os"],
      ["Profile", "/career-os/profile"],
      ["Opportunities", "/career-os/jobs"],
      ["Interviews", "/career-os/interviews"],
    ],
  },
  {
    heading: "Company",
    links: [
      ["About", "/about"],
      ["Institutions", "/institutions"],
      ["Stories", "/stories"],
      ["Blog", "/blog"],
      ["Contact", "/contact"],
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
