import { courses } from "../data"
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG, isAuthoredCourse } from "./authored-courses"

const PYTHON_PROGRAMMING_SLUG = "python-programming"
const DATA_SCIENCE_AI_SLUG = "data-science-ai"
const GENERATIVE_AI_SLUG = "generative-ai"
const FULL_STACK_WEB_SLUG = "full-stack-web"

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
  a: "When every lesson in the course is complete, you can claim a certificate from My learning. It carries a code anyone can check on the Verify page. It confirms course completion, not a job outcome, and the feature is still being checked before launch.",
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
  labOmission: "This course does not use Northwind Lab. Practice is the Harbor Desk case: interview notes, an exception log, and a written product case saved in the project workspace.",
  afterEnrol: "Skylent OS opens Product Management at the first lesson.",
  ctaTitle: "Start Product Management",
}

const PYTHON_PROGRAMMING_PROFILE: CourseProductProfile = {
  slug: PYTHON_PROGRAMMING_SLUG,
  tools: ["Python 3.11+", "pytest", "A code or text editor"],
  prerequisite: "Basic familiarity with files and command-line navigation.",
  datasets: [
    {
      filename: "settlement_feed_2026_q2.jsonl",
      detail: "Synthetic multi-gateway settlement feed with duplicate webhook retries and malformed currency rows.",
    },
  ],
  learningSteps: [
    { label: "Learning", detail: "15 authored engineering lessons in Skylent OS covering data structures, ETL validation, and CLI packaging." },
    { label: "Practice", detail: "Checkpoint quizzes and Socratic cold-call trade-off scenarios." },
    { label: "Assignment", detail: "Idempotent ingestion, dead-letter quarantine, and pytest test suites." },
    { label: "Capstone", detail: "Python Transaction Pipeline & Anomaly Audit saved in your project studio." },
  ],
  faq: [
    SHARED_FAQ_PAYMENT,
    SHARED_FAQ_CERT,
    {
      q: "What do I build in the Capstone Project Studio?",
      a: "You specify and verify an idempotent settlement ingestion pipeline (`python-pipeline-audit`) with composite deduplication keys, quarantine logging, and pytest coverage.",
    },
  ],
  practiceIntro: "Practice centres on production Python ETL reliability, schema validation, and automated testing.",
  visual: "northwind",
  lab: null,
  project: {
    label: "Open project studio",
    href: "/os/projects/python-programming/python-pipeline-audit",
    note: "Python Transaction Pipeline & Anomaly Audit — 6-task engineering project studio.",
  },
  labOmission: null,
  afterEnrol: "Skylent OS opens Python Programming & Automation at the first lesson.",
  ctaTitle: "Start Python Programming",
}

const DATA_SCIENCE_AI_PROFILE: CourseProductProfile = {
  slug: DATA_SCIENCE_AI_SLUG,
  tools: ["Python / scikit-learn", "SQL & tabular cohorts", "Model evaluation notebooks"],
  prerequisite: "Foundational SQL or Python data manipulation.",
  datasets: [
    {
      filename: "subscription_cohorts_2026.csv",
      detail: "Point-in-time B2B SaaS subscription cohorts with temporal cutoff windows and retention outreach constraints.",
    },
  ],
  learningSteps: [
    { label: "Learning", detail: "15 authored lessons covering EDA, point-in-time feature engineering, and model calibration." },
    { label: "Practice", detail: "Leakage audits, Precision@K calculations, and case cold-calls." },
    { label: "Assignment", detail: "Out-of-time validation splits, threshold economics, and PSI drift playbooks." },
    { label: "Capstone", detail: "Customer Churn Cohort & Out-of-Time Validation Case in the project studio." },
  ],
  faq: [
    SHARED_FAQ_PAYMENT,
    SHARED_FAQ_CERT,
    {
      q: "What do I build in the Capstone Project Studio?",
      a: "You complete the Customer Churn Cohort & Out-of-Time Validation Case (`churn-cohort-validation`), eliminating target leakage and aligning Precision@Top-500 with retention ROI.",
    },
  ],
  practiceIntro: "Practice focuses on leakage-free temporal validation, calibrated probabilities, and decision economics.",
  visual: "northwind",
  lab: null,
  project: {
    label: "Open project studio",
    href: "/os/projects/data-science-ai/churn-cohort-validation",
    note: "Customer Churn Cohort & Out-of-Time Validation Case — 6-task ML validation studio.",
  },
  labOmission: null,
  afterEnrol: "Skylent OS opens Data Science & AI at the first lesson.",
  ctaTitle: "Start Data Science & AI",
}

const GENERATIVE_AI_PROFILE: CourseProductProfile = {
  slug: GENERATIVE_AI_SLUG,
  tools: ["Structured JSON prompts", "Hybrid BM25 + Vector RAG", "LLM evaluation harnesses"],
  prerequisite: "Working knowledge of APIs and JSON schemas.",
  datasets: [
    {
      filename: "enterprise_policy_corpus_v2.json",
      detail: "Synthetic enterprise SOP and refund policy corpus for testing section-aware chunking and citation grounding.",
    },
  ],
  learningSteps: [
    { label: "Learning", detail: "15 authored lessons on prompt contracts, hybrid RAG, evaluation harnesses, and token FinOps." },
    { label: "Practice", detail: "Citation verification checks, prompt-injection audits, and architecture cold-calls." },
    { label: "Assignment", detail: "Golden 100-query evaluation rubrics, abstention rules, and latency/cost budgets." },
    { label: "Capstone", detail: "Enterprise Policy RAG Grounding & Citation Audit in the project studio." },
  ],
  faq: [
    SHARED_FAQ_PAYMENT,
    SHARED_FAQ_CERT,
    {
      q: "What do I build in the Capstone Project Studio?",
      a: "You complete the Enterprise Policy RAG Grounding & Citation Audit (`enterprise-rag-evaluation`) with hybrid retrieval, citation verification, and FinOps guardrails.",
    },
  ],
  practiceIntro: "Practice focuses on grounded retrieval, citation verification, prompt security, and token unit economics.",
  visual: "harbor-desk",
  lab: null,
  project: {
    label: "Open project studio",
    href: "/os/projects/generative-ai/enterprise-rag-evaluation",
    note: "Enterprise Policy RAG Grounding & Citation Audit — 6-task AI systems studio.",
  },
  labOmission: null,
  afterEnrol: "Skylent OS opens Generative AI & LLM Systems at the first lesson.",
  ctaTitle: "Start Generative AI & LLM Systems",
}

const FULL_STACK_WEB_PROFILE: CourseProductProfile = {
  slug: FULL_STACK_WEB_SLUG,
  tools: ["React 19 + TypeScript", "Express + Zod", "PostgreSQL + Prisma"],
  prerequisite: "Foundational JavaScript/TypeScript and HTML/CSS.",
  datasets: [
    {
      filename: "wallet_ledger_spec_v1.sql",
      detail: "Transactional wallet ledger schema and concurrent payment webhook test vectors.",
    },
  ],
  learningSteps: [
    { label: "Learning", detail: "15 authored lessons covering relational schemas, typed REST APIs, RBAC/CSRF, and React state resilience." },
    { label: "Practice", detail: "Concurrency debugging, IDOR security checks, and architecture cold-calls." },
    { label: "Assignment", detail: "Idempotent webhook handlers, Zod boundary contracts, and accessible UI state flows." },
    { label: "Capstone", detail: "Full-Stack Idempotent Wallet & Webhook Spec in the project studio." },
  ],
  faq: [
    SHARED_FAQ_PAYMENT,
    SHARED_FAQ_CERT,
    {
      q: "What do I build in the Capstone Project Studio?",
      a: "You complete the Full-Stack Idempotent Wallet & Webhook Spec (`idempotent-ledger-architecture`) spanning atomic Prisma transactions, Zod validation, and resilient React UI states.",
    },
  ],
  practiceIntro: "Practice centres on end-to-end type safety, transactional database invariants, and production security.",
  visual: "harbor-desk",
  lab: null,
  project: {
    label: "Open project studio",
    href: "/os/projects/full-stack-web/idempotent-ledger-architecture",
    note: "Full-Stack Idempotent Wallet & Webhook Spec — 6-task system architecture studio.",
  },
  labOmission: null,
  afterEnrol: "Skylent OS opens Full Stack Web Engineering at the first lesson.",
  ctaTitle: "Start Full Stack Web Engineering",
}

const PROFILES: Record<string, CourseProductProfile> = {
  [FLAGSHIP_COURSE_SLUG]: DATA_ANALYTICS_PROFILE,
  [PRODUCT_MANAGEMENT_SLUG]: PRODUCT_MANAGEMENT_PROFILE,
  [PYTHON_PROGRAMMING_SLUG]: PYTHON_PROGRAMMING_PROFILE,
  [DATA_SCIENCE_AI_SLUG]: DATA_SCIENCE_AI_PROFILE,
  [GENERATIVE_AI_SLUG]: GENERATIVE_AI_PROFILE,
  [FULL_STACK_WEB_SLUG]: FULL_STACK_WEB_PROFILE,
}

export function courseProductProfile(slug: string): CourseProductProfile | null {
  return PROFILES[slug] ?? null
}

export function authoredCourseList() {
  return courses.filter((course) => isAuthoredCourse(course.slug))
}

export { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG }
