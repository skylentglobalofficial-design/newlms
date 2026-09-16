import { courses } from "../data"
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG, isAuthoredCourse } from "./authored-courses"

export type CourseDataset = {
  filename: string
  href?: string
  detail: string
}

export type CourseFaq = { q: string; a: string }

export type CourseLearningStep = { label: string; detail: string }

export type CourseLabLink = {
  label: string
  href: (lessonId: string) => string
  note: string
}

export type CourseProjectLink = {
  label: string
  href: string
  note: string
}

export type CourseProductProfile = {
  slug: string
  tools: string[]
  prerequisite: string
  datasets: CourseDataset[]
  learningSteps: readonly CourseLearningStep[]
  faq: readonly CourseFaq[]
  practiceIntro: string
  visual: "northwind" | "harbor-desk"
  lab: CourseLabLink | null
  project: CourseProjectLink | null
  labOmission: string | null
  afterEnrol: string
  ctaTitle: string
}

const SHARED_FAQ_PAYMENT: CourseFaq = {
  q: "Do I pay when I click Enrol?",
  a: "No. A listed price is shown, but payment is not collected in this environment. Enrolment opens the course workspace.",
}

const SHARED_FAQ_CERT: CourseFaq = {
  q: "Is a certificate issued?",
  a: "Not in this pilot.",
}

const DATA_ANALYTICS_PROFILE: CourseProductProfile = {
  slug: FLAGSHIP_COURSE_SLUG,
  tools: ["Google Sheets or Excel", "SQL as specified in the briefs", "A text editor"],
  prerequisite: "None. A spreadsheet or a text editor is enough.",
  datasets: [
    { filename: "northwind_sales.csv", href: "/content/data-analytics/northwind_sales.csv", detail: "180 order lines for fictional Northwind Retail, January–June 2026." },
    { filename: "northwind_hr.csv", href: "/content/data-analytics/northwind_hr.csv", detail: "56 staff rows used where the briefs ask for a companion HR extract." },
  ],
  learningSteps: [
    { label: "Learning", detail: "Written lessons in Skylent OS. Self-paced. No video stream and no live classroom." },
    { label: "Practice", detail: "Short checks after a block of lessons." },
    { label: "Assignment", detail: "Applied spreadsheet, SQL, and dashboard work on Northwind." },
    { label: "Capstone", detail: "A commercial review you keep as a work sample." },
  ],
  faq: [
    {
      q: "Are there videos or live classes?",
      a: "No. Data Analytics is written lessons, quizzes, and assignments in Skylent OS. You work at your own pace.",
    },
    SHARED_FAQ_PAYMENT,
    SHARED_FAQ_CERT,
    {
      q: "What do I actually work on?",
      a: "A synthetic Northwind Retail dataset: spreadsheet analysis, SQL, data cleaning, a one-question dashboard, and a commercial-review capstone.",
    },
  ],
  practiceIntro: "Practice uses a synthetic Northwind Retail dataset. There is no live classroom and no video stream.",
  visual: "northwind",
  lab: {
    label: "Open Lab",
    href: (lessonId) => `/os/labs/data-analytics/northwind${lessonId ? `?lesson=${encodeURIComponent(lessonId)}` : ""}`,
    note: "Practice this here with northwind_sales.csv.",
  },
  project: {
    label: "Open project",
    href: "/os/projects/data-analytics/northwind-commercial-review",
    note: "Northwind Commercial Review — use lab work to write a commercial summary.",
  },
  labOmission: null,
  afterEnrol: "Skylent OS opens Data Analytics at the first lesson.",
  ctaTitle: "Start Data Analytics",
}

const PRODUCT_MANAGEMENT_PROFILE: CourseProductProfile = {
  slug: PRODUCT_MANAGEMENT_SLUG,
  tools: ["A text editor", "The Harbor Desk case notes in this course"],
  prerequisite: "None. You do not need a research team, a design tool, or engineering access.",
  datasets: [
    {
      filename: "harbor-desk-case.md",
      href: "/content/product-management/harbor-desk-case.md",
      detail: "Fictional Harbor Retail operations case: interview notes, exception log, and constraints. Not a sales dataset and not Northwind.",
    },
  ],
  learningSteps: [
    { label: "Learning", detail: "Written lessons in Skylent OS. Self-paced. No video stream and no live classroom." },
    { label: "Practice", detail: "Short checks after a block of lessons." },
    { label: "Assignment", detail: "Research notes, a priority memo, and a product-case recommendation on Harbor Desk." },
    { label: "Capstone", detail: "A product case you can keep as a work sample." },
  ],
  faq: [
    {
      q: "Are there videos or live classes?",
      a: "No. Product Management is written lessons, quizzes, and written briefs in Skylent OS. You work at your own pace.",
    },
    SHARED_FAQ_PAYMENT,
    SHARED_FAQ_CERT,
    {
      q: "Is there a coding lab?",
      a: "No. This course is problem framing, evidence, prioritisation, and specification. Northwind Lab belongs to Data Analytics. There is no Python or browser sandbox here.",
    },
    {
      q: "What do I actually work on?",
      a: "Harbor Desk — a fictional shared inbox for Harbor Retail store operations. You write a research note, a priority memo, and a product-case recommendation. There is no SQL and no dashboard assignment.",
    },
  ],
  practiceIntro: "Practice uses a fictional Harbor Retail operations case. There is no live classroom, no video stream, and no analytics lab.",
  visual: "harbor-desk",
  lab: null,
  project: {
    label: "Open product case",
    href: "/os/projects/product-management/harbor-desk-case",
    note: "Harbor Desk product case — a written recommendation, not a SQL lab.",
  },
  labOmission: "This course does not use Northwind Lab. Product work here is research notes, framing, and a written specification — not query execution.",
  afterEnrol: "Skylent OS opens Product Management at the first lesson.",
  ctaTitle: "Start Product Management",
}

const PROFILES: Record<string, CourseProductProfile> = {
  [FLAGSHIP_COURSE_SLUG]: DATA_ANALYTICS_PROFILE,
  [PRODUCT_MANAGEMENT_SLUG]: PRODUCT_MANAGEMENT_PROFILE,
}

export function courseProductProfile(slug: string): CourseProductProfile | null {
  return PROFILES[slug] ?? null
}

export function authoredCourseList() {
  return courses.filter((course) => isAuthoredCourse(course.slug))
}

export { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG }
