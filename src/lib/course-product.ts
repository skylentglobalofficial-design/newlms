import { courses } from "../data"
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG, PYTHON_PROGRAMMING_SLUG, DATA_SCIENCE_SLUG, GENERATIVE_AI_SLUG, FULL_STACK_WEB_SLUG, isAuthoredCourse } from "./authored-courses"

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
  tools: ["Python 3.11+", "A text editor or IDE", "The Python Starter Suite in this course"],
  prerequisite: "None. You do not need prior programming experience.",
  datasets: [
    {
      filename: "python-starter-suite.py",
      href: "/content/python-programming/python-starter-suite.py",
      detail: "Starter automation scripts, log stream models, and generator pipelines.",
    },
  ],
  learningSteps: [
    { label: "Learning", detail: "Written lessons in Skylent OS. Self-paced. No video stream and no live classroom." },
    { label: "Practice", detail: "Syntax and architecture checks after a block of lessons." },
    { label: "Assignment", detail: "Applied stream parsing, batch ETL automation, and modular utility design." },
    { label: "Capstone", detail: "A complete production CLI automation package with pytest test suite." },
  ],
  faq: [
    {
      q: "Are there videos or live classes?",
      a: "No. Python Programming is written lessons, quizzes, and hands-on coding assignments in Skylent OS. You work at your own pace.",
    },
    SHARED_FAQ_PAYMENT,
    SHARED_FAQ_CERT,
    {
      q: "What do I actually work on?",
      a: "Real-world engineering scripts: CPython bytecode inspection, constant-memory stream processors, immutable dataclasses, batch file ETL pipelines, and a production CLI utility.",
    },
  ],
  practiceIntro: "Practice uses real-world automation scripts and stream parsing. There is no live classroom and no video stream.",
  visual: "northwind",
  lab: null,
  project: null,
  labOmission: "This course focuses on backend Python automation scripts and test suites.",
  afterEnrol: "Skylent OS opens Python Programming & Automation at the first lesson.",
  ctaTitle: "Start Python Programming",
}

const DATA_SCIENCE_PROFILE: CourseProductProfile = {
  slug: DATA_SCIENCE_SLUG,
  tools: ["Python 3.11+", "scikit-learn", "NumPy & pandas", "XGBoost"],
  prerequisite: "Python fundamentals or basic data manipulation experience.",
  datasets: [
    {
      filename: "credit_risk_dataset.csv",
      href: "/content/data-analytics/northwind_sales.csv",
      detail: "Tabular consumer records for feature engineering and churn modeling.",
    },
  ],
  learningSteps: [
    { label: "Learning", detail: "Written lessons in Skylent OS. Self-paced. No video stream." },
    { label: "Practice", detail: "Mathematical and leakage prevention checks." },
    { label: "Assignment", detail: "Feature engineering pipelines and gradient boosted ensembles." },
    { label: "Capstone", detail: "End-to-end predictive machine learning pipeline with threshold tuning." },
  ],
  faq: [
    { q: "Are there videos or live classes?", a: "No. Data Science & AI is written lessons, quizzes, and scikit-learn coding assignments in Skylent OS." },
    SHARED_FAQ_PAYMENT,
    SHARED_FAQ_CERT,
    { q: "What do I actually work on?", a: "Leakage-free preprocessing pipelines, logistic regression regularization, XGBoost ensembles, and business threshold optimization." },
  ],
  practiceIntro: "Practice uses real tabular data and scikit-learn pipelines with zero data leakage.",
  visual: "northwind",
  lab: null,
  project: null,
  labOmission: "This course focuses on scikit-learn pipelines, cross-validation, and ensemble modeling.",
  afterEnrol: "Skylent OS opens Data Science & AI at the first lesson.",
  ctaTitle: "Start Data Science & AI",
}

const GENERATIVE_AI_PROFILE: CourseProductProfile = {
  slug: GENERATIVE_AI_SLUG,
  tools: ["Python 3.11+", "OpenAI API / Local LLMs", "Vector Embeddings & Chroma/FAISS", "RAGAS"],
  prerequisite: "Python programming and basic API experience.",
  datasets: [
    {
      filename: "rag_knowledge_base.md",
      href: "/content/product-management/harbor-desk-case.md",
      detail: "Enterprise documentation and architecture records for RAG indexing.",
    },
  ],
  learningSteps: [
    { label: "Learning", detail: "Written lessons in Skylent OS. Self-paced. No video stream." },
    { label: "Practice", detail: "Prompt engineering, sampling parameter, and RAG architecture checks." },
    { label: "Assignment", detail: "Semantic search engines and autonomous ReAct tool-calling agents." },
    { label: "Capstone", detail: "Grounded enterprise RAG assistant with quantitative RAGAS evaluation." },
  ],
  faq: [
    { q: "Are there videos or live classes?", a: "No. Generative AI is written lessons, quizzes, and LLM application coding in Skylent OS." },
    SHARED_FAQ_PAYMENT,
    SHARED_FAQ_CERT,
    { q: "What do I actually work on?", a: "Prompt injection defense, HNSW vector search, hybrid re-ranking, autonomous ReAct loops, and automated faithfulness evaluations." },
  ],
  practiceIntro: "Practice uses live vector embeddings, two-stage re-ranking, and grounded RAG pipelines.",
  visual: "harbor-desk",
  lab: null,
  project: null,
  labOmission: "This course focuses on RAG pipelines, agent function calling, and automated evaluations.",
  afterEnrol: "Skylent OS opens Generative AI & LLM Systems at the first lesson.",
  ctaTitle: "Start Generative AI",
}

const FULL_STACK_WEB_PROFILE: CourseProductProfile = {
  slug: FULL_STACK_WEB_SLUG,
  tools: ["TypeScript & Node.js", "Express / Fastify", "PostgreSQL & Prisma", "React"],
  prerequisite: "Basic programming concepts and HTML/CSS familiarity.",
  datasets: [
    {
      filename: "schema.sql",
      href: "/content/python-programming/python-starter-suite.py",
      detail: "Relational database migration schemas and REST API test suites.",
    },
  ],
  learningSteps: [
    { label: "Learning", detail: "Written lessons in Skylent OS. Self-paced. No video stream." },
    { label: "Practice", detail: "HTTP protocol, SQL constraint, and state architecture checks." },
    { label: "Assignment", detail: "Validated RESTful backend APIs and optimistic UI dashboards." },
    { label: "Capstone", detail: "Full-stack web application with relational persistence and security." },
  ],
  faq: [
    { q: "Are there videos or live classes?", a: "No. Full Stack Web is written lessons, quizzes, and software engineering assignments in Skylent OS." },
    SHARED_FAQ_PAYMENT,
    SHARED_FAQ_CERT,
    { q: "What do I actually work on?", a: "REST API lifecycle, Zod schema validation, PostgreSQL indexing, optimistic React UI updates, and CSRF/XSS security hardening." },
  ],
  practiceIntro: "Practice uses real relational database schemas, REST APIs, and modern component state.",
  visual: "northwind",
  lab: null,
  project: null,
  labOmission: "This course focuses on full-stack web applications, relational databases, and security.",
  afterEnrol: "Skylent OS opens Full Stack Web Engineering at the first lesson.",
  ctaTitle: "Start Full Stack Web",
}

const PROFILES: Record<string, CourseProductProfile> = {
  [FLAGSHIP_COURSE_SLUG]: DATA_ANALYTICS_PROFILE,
  [PRODUCT_MANAGEMENT_SLUG]: PRODUCT_MANAGEMENT_PROFILE,
  [PYTHON_PROGRAMMING_SLUG]: PYTHON_PROGRAMMING_PROFILE,
  [DATA_SCIENCE_SLUG]: DATA_SCIENCE_PROFILE,
  [GENERATIVE_AI_SLUG]: GENERATIVE_AI_PROFILE,
  [FULL_STACK_WEB_SLUG]: FULL_STACK_WEB_PROFILE,
}

export function courseProductProfile(slug: string): CourseProductProfile | null {
  return PROFILES[slug] ?? null
}

export function authoredCourseList() {
  return courses.filter((course) => isAuthoredCourse(course.slug))
}

export { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG, PYTHON_PROGRAMMING_SLUG, DATA_SCIENCE_SLUG, GENERATIVE_AI_SLUG, FULL_STACK_WEB_SLUG }
