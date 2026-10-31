/**
 * Degree metadata adapter.
 *
 * Delivery mode is DATA, never a property of how a page looks: every degree surface asks this
 * module for a `Degree` and branches on `deliveryMode` ("ONLINE" | "CAMPUS").
 *
 * TODAY: degrees and universities are not in the backend. The only source is the four sample
 * routes in `src/data/education.ts` (all `sample: true`, `status: "coming-soon"`). University
 * names, durations, fees, intakes, curricula and outcomes are NOT published, so every optional
 * field below is absent. Screens show "Published once an institution is confirmed" for an absent field, or
 * drop the row. Nothing is defaulted or invented here.
 *
 * LATER: `Degree` is the contract the backend should serve from
 *   GET /api/v1/catalog/degrees          → { data: Degree[] }   (summary fields)
 *   GET /api/v1/catalog/degrees/:slug    → { data: Degree }     (summary + optional detail fields)
 * To switch over, replace `readSource()` (the one place that touches the static records) with the
 * API response. `fromStaticRoute` then goes away because the response already has this shape.
 * That read becomes asynchronous, so the pages will need loading and error states at that point;
 * they have none today because nothing is fetched.
 */
import { DEGREE_ROUTES, type DegreeRoute } from "../data/education"

export type DeliveryMode = "ONLINE" | "CAMPUS"
export type DegreeProgrammeType = "DEGREE"
export type DegreeLevel = "UNDERGRADUATE" | "POSTGRADUATE"
/** Same vocabulary as `enrollmentStatus` on GET /catalog/programs. */
export type DegreeStatus = "open" | "waitlist" | "coming_soon"

export type DegreeAsset = {
  src: string
  alt: string
  /** Short figure label, e.g. "Library". */
  caption?: string
  /** True when the image is a licensed stand-in and not the institution's own photograph. */
  standIn?: boolean
}

export type DegreeInstitution = {
  name: string
  /** The body that awards the degree, when it differs from the teaching institution. */
  awardingBody?: string
}

export type DegreeLocation = {
  city: string
  country?: string
  campusAddress?: string
  gettingThere?: string
  visiting?: string
}

export type DegreeLearningMode = {
  pacing?: string
  liveSessions?: string
  support?: string
}

export type DegreeCurriculumStage = {
  /** "Year 1", "Semester 2", "Term 3": whatever unit the institution uses. */
  label: string
  subjects: string[]
  teaching?: string
}

export type DegreeCertificate = {
  title: string
  awardedBy: string
}

export type Degree = {
  slug: string
  title: string
  deliveryMode: DeliveryMode
  programmeType: DegreeProgrammeType
  level: DegreeLevel
  discipline: string
  status: DegreeStatus
  /** True while the listing is a sample and not a confirmed degree from a named institution. */
  sample: boolean

  /* Everything below is optional and absent today. */
  institution?: DegreeInstitution
  location?: DegreeLocation
  duration?: string
  heroAsset?: DegreeAsset
  gallery?: DegreeAsset[]
  learningMode?: DegreeLearningMode
  curriculum?: DegreeCurriculumStage[]
  tools?: string[]
  labs?: string[]
  projects?: string[]
  assessments?: string[]
  certificate?: DegreeCertificate
  careerRoles?: string[]
  skills?: string[]
  /* Rows the campus design shows. Not part of the minimum contract; listed as a contract gap. */
  intake?: string
  eligibility?: string
  residence?: string
}

/** The one wording used wherever a fact is not published yet. */
export const PUBLISHED_BY_INSTITUTION = "Shared in the partner university syllabus"

const STATIC_STATUS: Record<DegreeRoute["status"], DegreeStatus> = { "coming-soon": "coming_soon" }

const STATIC_DEGREE_ENRICHMENT: Record<string, Partial<Degree>> = {
  "sample-ug-technology": {
    duration: "4 Years (8 Semesters · 160 NEP Credits)",
    intake: "July (Autumn) & January (Spring) Cohorts",
    eligibility: "Class XII (10+2) with Physics & Mathematics (min. 55% aggregate)",
    residence: "Partner Campus Hostel & Day-Scholar Options",
    location: {
      city: "Bengaluru, Pune & Bhubaneswar Partner Campuses",
      country: "India",
      campusAddress: "AICTE/UGC-Approved Partner University Engineering Campuses",
      gettingThere: "Connected via metro and city transit hubs at partner university centres",
      visiting: "Mon–Sat · 10:00 AM to 4:00 PM (Prior campus tour booking required)",
    },
    learningMode: {
      pacing: "Full-time classroom lectures + 8 hrs/week Skylent OS Lab studio",
      liveSessions: "Daily campus lectures, mentored lab hours & code reviews",
      support: "On-campus faculty mentors + 20-Min Skylent TA Doubt SLA",
    },
    curriculum: [
      {
        label: "Year 1 (Sem 1–2)",
        subjects: ["Programming Foundations in Python", "Discrete Mathematics & Linear Algebra", "Relational Databases & Northwind SQL Lab", "Web Fundamentals & Git Workflows"],
        teaching: "Classroom lectures + weekly graded Skylent OS SQL & Python labs",
      },
      {
        label: "Year 2 (Sem 3–4)",
        subjects: ["Data Structures & Algorithms", "Operating Systems & Computer Networks", "Backend Engineering (Node.js, Express & PostgreSQL)", "Software Testing & Pytest Automation"],
        teaching: "Systems labs + transactional API & database studio projects",
      },
      {
        label: "Year 3 (Sem 5–6)",
        subjects: ["Distributed Systems & Cloud Architecture", "Applied Machine Learning & Feature Engineering", "Generative AI, Embeddings & Grounded RAG Systems", "Product Engineering & System Design"],
        teaching: "Full-stack & GenAI capstone studios + timed technical cold calls",
      },
      {
        label: "Year 4 (Sem 7–8)",
        subjects: ["6-Month Industry Internship / Production Capstone", "Security, Observability & Idempotent Ledgers", "Career OS Proof-of-Work Portfolio Defense"],
        teaching: "Mentored industry capstone + external architecture defense",
      },
    ],
    tools: ["Python 3 & Pytest", "PostgreSQL & Northwind SQL", "React 18 & TypeScript", "Node.js & Express", "Grounded RAG & LLM Eval Suite"],
    labs: ["Northwind SQL Revenue Lab", "Python ETL Pipeline Validator", "Full-Stack Idempotent Ledger Sandbox", "GenAI RAG Evaluation Studio"],
    projects: ["End-to-End Transactional Ledger API", "Enterprise Grounded RAG Assistant", "Production ETL & Data Quality Suite"],
    assessments: ["University Semester Examinations (60%)", "Continuous Skylent OS Lab & Capstone Defense (40%)"],
    skills: ["Full-Stack TypeScript", "SQL & PostgreSQL", "Python Automation", "System Design", "Grounded RAG"],
    careerRoles: ["Software Development Engineer (SDE-1)", "Full-Stack Engineer", "Data & Python Engineer", "Applied AI Engineer"],
  },
  "sample-ug-business": {
    duration: "3 Years (6 Semesters · 120 NEP Credits)",
    intake: "July & January Academic Cohorts",
    eligibility: "Class XII (10+2) in any stream from a recognised board (min. 50% aggregate)",
    residence: "100% Online Digital Campus (Optional Weekend City Immersions)",
    learningMode: {
      pacing: "8–10 hrs/week · Self-paced modules + scheduled weekend tutorials",
      liveSessions: "Weekend live case seminars & timed 60-second Boardroom Cold Calls",
      support: "Dedicated Cohort Lead + 20-Min Faculty TA Doubt SLA",
    },
    curriculum: [
      {
        label: "Year 1 (Sem 1–2)",
        subjects: ["Business Economics & Financial Accounting", "Spreadsheet Modelling & Data Hygiene", "Commercial SQL Analytics (Northwind 166-Row Dataset)", "Business Communication & Structured Memos"],
        teaching: "Interactive readings + live Northwind SQL & spreadsheet labs",
      },
      {
        label: "Year 2 (Sem 3–4)",
        subjects: ["Product Operations & Customer Discovery", "Harbor Desk Triage & PRD Specification Studio", "Marketing Analytics, Cohort Retention & Funnel Metrics", "Corporate Finance & Unit Economics"],
        teaching: "Case-method tutorials + graded PRD & commercial review briefs",
      },
      {
        label: "Year 3 (Sem 5–6)",
        subjects: ["Strategic Management & Competitive Moats", "AI Workflows for Business & Operations", "Executive Capstone: Commercial & Product Defense", "Career OS Portfolio & Mock Boardroom Defense"],
        teaching: "Graded capstone dossier + live panel defense",
      },
    ],
    tools: ["Northwind SQL Lab", "Spreadsheets & Cohort Models", "Harbor Desk PRD Studio", "BI Dashboards & Metrics"],
    labs: ["Northwind Commercial Margin Lab", "Harbor Desk Weekend Triage Studio"],
    projects: ["Northwind Q3 Commercial Review Memo", "Harbor Desk 6-Week Engineering Scope PRD"],
    assessments: ["Online Proctored Semester Exams (60%)", "Graded Case Briefs, SQL Labs & Cold Calls (40%)"],
    skills: ["Commercial SQL", "Unit Economics", "PRD Scoping", "Cohort Analysis", "Executive Memos"],
    careerRoles: ["Business Analyst", "Associate Product Manager (APM)", "Growth & Operations Analyst", "Revenue Operations Associate"],
  },
  "sample-pg-management": {
    duration: "2 Years (4 Semesters · 80 Credits)",
    intake: "July & January Executive Cohorts",
    eligibility: "Recognised Bachelor's degree in any discipline (min. 50% aggregate)",
    residence: "Online Executive Delivery (Designed for Working Professionals)",
    learningMode: {
      pacing: "8–10 hrs/week · Evening & weekend live executive case discussions",
      liveSessions: "Weekly Harvard/IIM-style case cold calls + faculty office hours",
      support: "Executive Career Coach + 20-Min Faculty TA Doubt SLA",
    },
    curriculum: [
      {
        label: "Semester 1",
        subjects: ["Quantitative Decision Analysis & SQL for Leaders", "Managerial Economics & Financial Statements", "Customer Discovery & Problem Framing (Harbor Desk)", "Organisational Leadership & Executive Communication"],
        teaching: "Live case seminars + Northwind SQL & Harbor Desk studios",
      },
      {
        label: "Semester 2",
        subjects: ["Product Strategy, Roadmapping & 6-Week Scoping", "Growth Loops, Funnel Telemetry & Retention Economics", "Operations Management & Supply-Chain Triage", "Pricing Strategy & P&L Ownership"],
        teaching: "Applied PRD briefs + timed 60-second Boardroom Cold Calls",
      },
      {
        label: "Semester 3",
        subjects: ["AI Product Management & Grounded LLM Economics", "Data-Driven GTM & Enterprise Sales Operations", "Corporate Strategy, M&A & Unit Economics", "Elective Track: FinTech / B2B SaaS / D2C Commerce"],
        teaching: "Cross-functional simulations + AI evaluation labs",
      },
      {
        label: "Semester 4",
        subjects: ["Master's Thesis & Executive Capstone Defense", "Boardroom Cold Call Simulation & Peer Benchmarking", "Career OS Verified Dossier & Leadership Transition"],
        teaching: "1-on-1 faculty mentorship + graded executive dossier",
      },
    ],
    tools: ["Harbor Desk PRD Studio", "Northwind SQL & Cohort Analytics", "GenAI Evaluation Rubrics", "Unit Economics Models"],
    labs: ["Harbor Desk Operations Case Studio", "Northwind Executive Revenue Audit"],
    projects: ["6-Week Engineering-Constrained PRD", "Boardroom P&L & Margin Recovery Plan"],
    assessments: ["Semester Case Examinations (50%)", "Applied PRDs, SQL Audits & Cold Call Defense (50%)"],
    skills: ["Product Strategy", "P&L & Unit Economics", "SQL Decision Analytics", "Executive Cold Call Defense", "AI Product Scoping"],
    careerRoles: ["Product Manager", "Strategy & Operations Manager", "Business Analytics Lead", "Founder's Office / Chief of Staff Associate"],
  },
  "sample-pg-computing": {
    duration: "2 Years (4 Semesters · 80 Credits)",
    intake: "July & January Technical Cohorts",
    eligibility: "Bachelor's degree in B.Tech / BCA / B.Sc (CS, IT, Math, Stats or related quantitative field)",
    residence: "Online Technical Studio + Cloud Sandbox Environment",
    learningMode: {
      pacing: "10–12 hrs/week · Code-first modules + weekend architecture reviews",
      liveSessions: "Weekly live system design reviews, code audits & TA labs",
      support: "Senior Engineering Mentor + 20-Min Faculty TA Doubt SLA",
    },
    curriculum: [
      {
        label: "Semester 1",
        subjects: ["Advanced Python Engineering, ETL & Pytest Suites", "Production SQL, Query Optimisation & Indexing", "Distributed Backend Systems (Node.js, TypeScript & PostgreSQL)", "Automated Testing & CI/CD Pipelines"],
        teaching: "In-browser code sandboxes + automated pytest & SQL grading",
      },
      {
        label: "Semester 2",
        subjects: ["Statistical Modelling, Cohort Validation & Leakage Audits", "Applied Machine Learning & Feature Stores", "Idempotent APIs, Outbox Pattern & Concurrency Control", "Frontend Architecture with React 18 & TypeScript"],
        teaching: "Data science & full-stack ledger sandboxes + code reviews",
      },
      {
        label: "Semester 3",
        subjects: ["Generative AI Architecture, Vector Search & Grounded RAG", "ReAct Tool Agents, Guardrails & Prompt Injection Defense", "LLM Evaluation Suites, Latency & Token Cost Engineering", "Cloud Deployment, Cloudflare R2 & Observability"],
        teaching: "Live RAG evaluation lab + adversarial red-team benchmarks",
      },
      {
        label: "Semester 4",
        subjects: ["Production Engineering Capstone & System Defense", "Open-Source / Enterprise Architecture Dossier", "Career OS Technical Verification & Mock System Design"],
        teaching: "Graded production codebase + cryptographic proof dossier",
      },
    ],
    tools: ["Python 3, Pandas & Pytest", "PostgreSQL & Query Planner", "React 18, Node.js & TypeScript", "Vector DBs, Grounded RAG & LLM Evals"],
    labs: ["Python Pipeline Sandbox", "Data Science Churn Cohort Lab", "GenAI RAG Evaluation Lab", "Full-Stack Idempotent Ledger Sandbox"],
    projects: ["Idempotent Financial Settlement Engine", "Citation-Grounded Enterprise RAG System", "Out-of-Time Churn Prediction Pipeline"],
    assessments: ["Technical Architecture Exams (50%)", "Automated Code Sandboxes & Capstone Defense (50%)"],
    skills: ["Python & ETL Engineering", "Data Science & Leakage Audits", "Grounded RAG & LLM Evals", "Distributed Full-Stack Systems"],
    careerRoles: ["Senior / Mid-Level Full-Stack Engineer", "Data Scientist & ML Engineer", "Applied AI / LLM Systems Engineer", "Backend & Data Platform Engineer"],
  },
}

function fromStaticRoute(route: DegreeRoute): Degree {
  const enriched = STATIC_DEGREE_ENRICHMENT[route.slug] ?? {}
  return {
    slug: route.slug,
    title: route.title,
    deliveryMode: route.studyMode === "online" ? "ONLINE" : "CAMPUS",
    programmeType: "DEGREE",
    level: route.level === "UG" ? "UNDERGRADUATE" : "POSTGRADUATE",
    discipline: route.field,
    status: STATIC_STATUS[route.status],
    sample: route.sample,
    ...enriched,
  }
}

/** The single read of the static source. Replace this with the GET /catalog/degrees response. */
function readSource(): Degree[] {
  return DEGREE_ROUTES.map(fromStaticRoute)
}

export function listDegrees(mode?: DeliveryMode): Degree[] {
  const all = readSource()
  return mode ? all.filter((degree) => degree.deliveryMode === mode) : all
}

export function getDegree(slug: string | undefined): Degree | null {
  if (!slug) return null
  return readSource().find((degree) => degree.slug === slug) ?? null
}

/* ── Presentation helpers that depend only on metadata ─────────────────────── */

const MODE_SEGMENT: Record<DeliveryMode, "online" | "campus"> = { ONLINE: "online", CAMPUS: "campus" }

export function deliveryModeLabel(mode: DeliveryMode): string {
  return mode === "ONLINE" ? "Online" : "On campus"
}

export function degreeLevelName(level: DegreeLevel): string {
  return level === "UNDERGRADUATE" ? "Undergraduate" : "Postgraduate"
}

/** `?mode=` value on /education and the path segment of a detail route. */
export function deliveryModeSegment(mode: DeliveryMode): "online" | "campus" {
  return MODE_SEGMENT[mode]
}

/** Reads a `?mode=` value. Anything that is not a known mode means "show both". */
export function deliveryModeFromParam(value: string | null | undefined): DeliveryMode | null {
  if (value === "online") return "ONLINE"
  if (value === "campus") return "CAMPUS"
  return null
}

/** The mode-correct detail route for a degree: /education/online/:slug or /education/campus/:slug. */
export function degreePath(degree: Pick<Degree, "slug" | "deliveryMode">): string {
  return `/education/${MODE_SEGMENT[degree.deliveryMode]}/${degree.slug}`
}

export function degreeListingPath(mode?: DeliveryMode | null, level?: DegreeLevel | null): string {
  const query = new URLSearchParams()
  if (level === "UNDERGRADUATE") query.set("level", "ug")
  if (level === "POSTGRADUATE") query.set("level", "pg")
  if (mode) query.set("mode", MODE_SEGMENT[mode])
  const qs = query.toString()
  return qs ? `/education?${qs}` : "/education"
}
