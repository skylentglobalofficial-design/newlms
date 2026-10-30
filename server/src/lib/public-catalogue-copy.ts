/**
 * Public catalogue fields served even when the database still holds older brochure text.
 *
 * Lockstep with src/data.ts for the authored courses and for
 * data-analytics-pro, product-management, and sql-certificate.
 * scripts/test-public-catalogue-copy.ts fails if these strings drift.
 * Enrolment status, prices, and course links are not rewritten here.
 */
import { isAuthoredCourse } from "./authored-courses.js"

type CourseCopy = {
  desc: string
  longDesc: string
  outcomes: string[]
  forWhom: string[]
  mode: string
}

type ProgrammeCopy = {
  desc: string
  format: string
  taughtModuleCount?: number
}

export const PUBLIC_COURSE_COPY: Record<string, CourseCopy> = {
  "data-analytics": {
    desc: "Learn spreadsheet analysis, SQL, data cleaning, dashboards, and business interpretation on a synthetic Northwind dataset.",
    longDesc:
      "A written, practice-first Data Analytics course. You analyse a synthetic Northwind Retail extract in spreadsheets and SQL, clean known quality issues, build a one-question dashboard, and finish with a commercial-review capstone you can show as a work sample. There is no video stream, no live classroom, no Python or machine learning, and no job or placement claim. Enrollment in this environment does not collect payment.",
    outcomes: [
      "Build and analyse structured datasets in spreadsheets",
      "Write practical SQL queries against business tables",
      "Clean dirty data and document quality issues",
      "Create dashboards that answer one business question",
      "Interpret trends and present evidence-based recommendations",
    ],
    forWhom: [
      "Commerce or non-technical graduates starting analytics",
      "Professionals who already work in spreadsheets",
      "Business analysts who need SQL and dashboard practice",
      "Anyone who wants a portfolio work sample, not a certificate",
    ],
    mode: "Self-paced",
  },
  "product-management": {
    desc: "Learn product thinking, user evidence, problem framing, prioritisation, and specification on a fictional Harbor Retail operations case.",
    longDesc:
      "A written, practice-first Product Management course. You work a fictional Harbor Retail operations problem — messy store communication, missed exceptions, and a proposed shared inbox called Harbor Desk. You interview from case notes, frame a testable problem, choose one bet under constraints, and finish with a product-case recommendation. There is no video stream, no live classroom, no coding lab, no SQL, and no job or placement claim. Enrollment in this environment does not collect payment.",
    outcomes: [
      "Frame a product problem with evidence, not opinions",
      "Turn user interviews into jobs, constraints, and non-goals",
      "Prioritise one bet when engineering time is limited",
      "Write a specification someone could implement",
      "Produce a product-case recommendation you can keep as a work sample",
    ],
    forWhom: [
      "Engineers who need to decide what is worth building",
      "Analysts who currently report numbers and now have to recommend a product change",
      "Anyone who has to choose one problem under a real constraint, without a research team",
    ],
    mode: "Self-paced",
  },
  "python-programming": {
    desc: "Learn core Python syntax, idiomatic data structures, object-oriented design, workflow automation, and production testing on real-world engineering scripts.",
    longDesc:
      "A hands-on, practice-first Python Programming course. You build from the Python execution model and memory layout to robust stream processing, automated CLI utilities, and pytest-driven engineering packages. There is no hand-waving theory and no passive video watching. You write and test real code with concrete error handling and type hints.",
    outcomes: [
      "Write idiomatic, PEP 8-compliant Python code with strong typing",
      "Master data structures, generator pipelines, and memory efficiency",
      "Architect clean object-oriented systems with dataclasses and protocols",
      "Automate file I/O, tabular stream processing, and CLI utilities",
      "Ship production-ready Python modules with pytest unit test suites",
    ],
    forWhom: [
      "Engineers and analysts transitioning to professional Python software development",
      "Data professionals who need clean scripting, automation, and ETL pipelines",
      "Learners who want verified proof-of-work code samples rather than generic certificate claims",
    ],
    mode: "Self-paced",
  },
  "generative-ai": {
    desc: "Master prompt engineering, vector embeddings, grounded RAG pipelines, autonomous ReAct agents, and RAGAS benchmark evaluations.",
    longDesc:
      "A hands-on, practice-first Generative AI course. You build from token probability dynamics and prompt injection defense to dense vector search, hybrid re-ranking, function-calling agents, and quantitative faithfulness metrics. There is no passive video watching. You write and test real AI pipelines with strict grounding.",
    outcomes: [
      "Write hardened system prompts with injection boundaries and few-shot exemplars",
      "Generate dense vector embeddings and index them with HNSW metadata filtering",
      "Architect two-stage hybrid RAG pipelines with cross-encoder re-ranking",
      "Build autonomous ReAct agent loops with deterministic tool calling",
      "Quantify hallucination rates and answer relevance using automated RAGAS metrics",
    ],
    forWhom: [
      "Software engineers and developers building LLM-powered applications",
      "Product managers and architects deploying enterprise AI assistants",
      "Data practitioners transitioning into generative AI engineering",
    ],
    mode: "Self-paced",
  },
  "full-stack-web": {
    desc: "Learn HTTP/REST protocols, backend API architecture, relational database persistence, modern component state, and security hardening on production web services.",
    longDesc:
      "A thorough full-stack engineering course. You build from the HTTP request/response lifecycle and RESTful API design to relational PostgreSQL migrations, optimistic UI updates, and web security defenses (CSRF, XSS, HttpOnly auth). There is no hand-waving theory and no passive video watching. You build real full-stack services.",
    outcomes: [
      "Design RESTful resource hierarchies with idempotent verbs and normalized error envelopes",
      "Enforce strict input validation using schema guards before database mutations",
      "Model relational entity schemas with foreign keys, composite constraints, and connection pooling",
      "Architect responsive frontend interfaces with optimistic updates and error rollback",
      "Implement production web security defenses including HttpOnly cookies and CSRF safeguards",
    ],
    forWhom: [
      "Software engineers transitioning into professional full-stack web development",
      "Backend developers looking to master frontend component architecture and state",
      "Frontend developers wanting robust backend API design, SQL persistence, and security skills",
    ],
    mode: "Self-paced",
  },
}

export const PUBLIC_PROGRAMME_COPY: Record<string, ProgrammeCopy> = {
  "data-analytics-pro": {
    desc: "Advertised as an 8-month analytics pathway with Gen AI. The live LMS today is the Data Analytics course (spreadsheets, SQL, dashboards, Northwind capstone). Python and Gen AI modules are not teachable here yet.",
    format: "Self-paced",
    taughtModuleCount: 5,
  },
  "product-management": {
    desc: "Advertised as a 5-month Product Management pathway. Enrolment today opens the authored Product Management course. Brochure modules beyond that course are not teachable here yet. There is no live classroom.",
    format: "Self-paced",
    taughtModuleCount: 5,
  },
  "sql-certificate": {
    desc: "SQL certificate outline — not open yet. There is no linked LMS course for this programme.",
    format: "Self-paced",
  },
}

type CourseRow = {
  slug: string
  desc: string
  longDesc: string
  outcomes: string[]
  forWhom: string[]
  mode: string
}

type ProgrammeRow = {
  slug: string
  desc: string
  format: string
  moduleCount: number
  linkedCourseSlugs: string[]
}

export function overlayPublicCourse<T extends CourseRow>(course: T): T {
  const copy = PUBLIC_COURSE_COPY[course.slug]
  if (!copy) return course
  return {
    ...course,
    desc: copy.desc,
    longDesc: copy.longDesc,
    outcomes: [...copy.outcomes],
    forWhom: [...copy.forWhom],
    mode: copy.mode,
  }
}

export function overlayPublicProgramme<T extends ProgrammeRow>(program: T): T {
  const copy = PUBLIC_PROGRAMME_COPY[program.slug]
  const links = program.linkedCourseSlugs
  let moduleCount = links.length === 0 ? 0 : program.moduleCount
  if (
    links.length > 0 &&
    copy?.taughtModuleCount != null &&
    links.every((slug) => isAuthoredCourse(slug))
  ) {
    moduleCount = copy.taughtModuleCount
  }
  if (!copy) return { ...program, moduleCount }
  return {
    ...program,
    desc: copy.desc,
    format: copy.format,
    moduleCount,
  }
}
