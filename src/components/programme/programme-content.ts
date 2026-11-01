/**
 * Authored material for the programme pages.
 *
 * A programme page shows discipline artefacts only when the programme has a
 * written course behind it. Everything here is taken from that course:
 *
 *  - Data Analytics: `public/content/data-analytics/northwind_sales.csv` (a
 *    fictional extract written for the course), `src/lib/northwind-preview.ts`,
 *    and the lab / project definitions the server uses
 *    (`server/src/lib/skylent-labs/sql/examples.ts`,
 *    `server/src/lib/skylent-projects/catalog.ts`).
 *  - Product Management: `public/content/product-management/harbor-desk-case.md`
 *    (a fictional teaching case), lesson 7 of the course, and the Harbor Desk
 *    project definition in the same server catalogue.
 *
 * A programme that is not listed here has no authored material and gets the
 * listing state. It never borrows another programme's artefact.
 */
import { DA_CAREER_EVIDENCE } from "../../content/data-analytics/career-evidence"
import { PM_CAREER_EVIDENCE } from "../../content/product-management/career-evidence"
import productReviewPhoto from "../../assets/site/program-product.jpg"
import { NORTHWIND_PREVIEW } from "../../lib/northwind-preview"
import { dataAnalyticsModuleSummary, productManagementModuleSummary } from "../../lib/public-catalogue-copy"

/* ── Northwind (Data Analytics) ───────────────────────────────────────────── */

/** The lab's own "Revenue by category" example query. */
export const NORTHWIND_CATEGORY_SQL = `SELECT CASE
         WHEN lower(category) IN ('elec.', 'electronics') THEN 'Electronics'
         ELSE category
       END AS category,
       ROUND(SUM(units * unit_price * (1 - discount_pct / 100.0)))
         AS net_revenue
FROM northwind_sales
WHERE units > 0
  AND unit_price > 0
  AND returned = 'no'
GROUP BY CASE
           WHEN lower(category) IN ('elec.', 'electronics') THEN 'Electronics'
           ELSE category
         END
ORDER BY net_revenue DESC`

/** A shortened reading of the same query for small thumbnails. */
export const NORTHWIND_CATEGORY_SQL_EXCERPT = `SELECT CASE … END AS category,
  ROUND(SUM(units * unit_price
    * (1 - discount_pct / 100.0)))
    AS net_revenue
FROM northwind_sales
WHERE units > 0 AND unit_price > 0
  AND returned = 'no'
GROUP BY CASE … END
ORDER BY net_revenue DESC`

/**
 * Valid net revenue by month, January to June 2026, computed from the course
 * extract with the valid-row rule. January to April match NORTHWIND_PREVIEW.
 */
export const NORTHWIND_MONTHS = [
  { name: "Jan", value: 117967 },
  { name: "Feb", value: 162726 },
  { name: "Mar", value: 188525 },
  { name: "Apr", value: 91729 },
  { name: "May", value: 103899 },
  { name: "Jun", value: 147173 },
] as const

export const NORTHWIND = {
  ...NORTHWIND_PREVIEW,
  topValue: NORTHWIND_PREVIEW.categories[0].value,
  topShare: Math.round((NORTHWIND_PREVIEW.categories[0].value / NORTHWIND_PREVIEW.netRevenue) * 100),
  lowestMonth: NORTHWIND_MONTHS.reduce((low, month) => (month.value < low.value ? month : low)),
} as const

/** Rupee figures grouped the way the course material prints them (₹812,020). */
export function rupees(value: number): string {
  return `₹${value.toLocaleString("en-US")}`
}

const MONTH_NAMES: Record<string, string> = { Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June" }

export function northwindMonthName(short: string): string {
  return MONTH_NAMES[short] ?? short
}

/* ── Harbor Desk (Product Management) ─────────────────────────────────────── */

/** Exception log from the case notes, weekend of 4–5 July 2026. */
export const HARBOR_EXCEPTIONS = [
  { id: "HD-01", store: "T. Nagar", type: "Late milk truck", lived: "WhatsApp group", delivery: false },
  { id: "HD-02", store: "Anna Nagar", type: "Missing rice SKU", lived: "Email", delivery: false },
  { id: "HD-03", store: "RS Puram", type: "Delivery failure", lived: "Walkie, then forgotten", delivery: true },
  { id: "HD-04", store: "KK Nagar", type: "Staff no-show", lived: "Personal WhatsApp", delivery: false },
  { id: "HD-05", store: "Town Hall", type: "Late vegetable truck", lived: "No channel", delivery: false },
  { id: "HD-06", store: "Peelamedu", type: "Delivery failure", lived: "WhatsApp, 43 unread", delivery: true },
  { id: "HD-07", store: "T. Nagar", type: "Missing oil SKU", lived: "Email", delivery: false },
  { id: "HD-08", store: "Madurai Main", type: "Cooler fault", lived: "Walkie", delivery: false },
  { id: "HD-09", store: "Anna Nagar", type: "Delivery failure", lived: "Nothing", delivery: true },
] as const

/** The testable problem statement taught in lesson 7. */
export const HARBOR_PROBLEM = [
  { label: "When", value: "a weekend customer delivery fails" },
  { label: "Who", value: "Meena, and cashiers like her" },
  { label: "Pain", value: "no written place to put it" },
  { label: "Check", value: "a written owner before Monday 10:00", check: true },
] as const

export const HARBOR = {
  filename: "harbor-desk-case.md",
  company: "Harbor Retail",
  stores: 12,
  interviews: 4,
  exceptions: HARBOR_EXCEPTIONS.length,
  deliveryFailures: HARBOR_EXCEPTIONS.filter((row) => row.delivery).length,
  constraint: "2 engineers, 6 weeks",
  weekend: "4–5 July 2026",
} as const

/* ── Template slots ───────────────────────────────────────────────────────── */

export type ProgrammeArtefactId = "northwind" | "harbor-desk"

export type ProgrammeStepNote =
  | { kind: "fact"; text: string }
  | { kind: "own" }
  | { kind: "trend" }

export type ProgrammeStep = {
  number: string
  title: string
  summary: string
  /** Worked from the course material. The others are written in the learner's own words. */
  worked: boolean
  note?: ProgrammeStepNote
}

export type ProgrammeEvidenceRow = {
  lessonId: string
  produce: string
  reviewer: string
  capstone?: boolean
}

export type AuthoredProgrammeContent = {
  programmeSlug: string
  courseSlug: string
  artefact: ProgrammeArtefactId
  /** One line for the catalogue card. */
  cardLine: string
  capstoneTitle: string
  hero: {
    headline: string
    /** The one phrase of the headline set in cobalt. Must be a substring of `headline`. */
    signal?: string
    summary: (moduleCount: number) => string
    figure: string
    figureNote: string
  }
  specSheet: {
    material: { label: string; value: string; note: string }
    tools: { label: string }
  }
  project: {
    label: string
    heading: string
    intro: string
    disclaimer: string
    steps: ProgrammeStep[]
    /** Optional editorial photograph beside the case steps. Always captioned as a stand-in. */
    photo?: { src: string; width: number; height: number; alt: string; caption: string }
  }
  curriculum: {
    note: string
    /** Module whose lessons the hero artefact comes from; it opens first. */
    openModuleId: string
  }
  practice: {
    heading: string
    intro: string
    rows: Array<{ label: string; value: string; mono?: boolean }>
    disclaimer: string
    link: { label: string; to: string } | null
  }
  evidence: {
    heading: string
    lede: string
    record: {
      title: string
      context: string
      workShown: string
      skills: string[]
      reflection: string
      footnote: string
    }
    rows: ProgrammeEvidenceRow[]
  }
  closing: { line: string }
}

function evidenceRows(
  source: ReadonlyArray<{ lessonId: string; artifact: string; evidence: string }>,
  approved: Record<string, { produce: string; reviewer: string }>,
  capstoneLessonId: string,
): ProgrammeEvidenceRow[] {
  return source.map((row) => ({
    lessonId: row.lessonId,
    produce: approved[row.lessonId]?.produce ?? row.artifact,
    reviewer: approved[row.lessonId]?.reviewer ?? row.evidence,
    capstone: row.lessonId === capstoneLessonId,
  }))
}

const DATA_ANALYTICS: AuthoredProgrammeContent = {
  programmeSlug: "data-analytics-pro",
  courseSlug: "data-analytics",
  artefact: "northwind",
  cardLine: "Take a messy sales extract to a finding and a recommendation someone can act on.",
  capstoneTitle: "Northwind Commercial Review",
  hero: {
    headline: "Turn a messy sales extract into a finding someone can act on.",
    signal: "a finding someone can act on.",
    summary: dataAnalyticsModuleSummary,
    figure: "Northwind Lab, revenue by category",
    figureNote: "Northwind Retail commercial dataset (180 order lines, Q3 window)",
  },
  specSheet: {
    material: {
      label: "Dataset",
      value: "Northwind sales",
      note: `${NORTHWIND.rows} rows, ${NORTHWIND.window}`,
    },
    tools: { label: "You work in" },
  },
  project: {
    label: "The capstone",
    heading: "One dataset, six steps, one recommendation.",
    intro:
      "The Northwind Commercial Review walks you through cleaning a 180-row retail extract, isolating category margin leakage in SQL, and defending an executive recommendation.",
    disclaimer:
      "Completed capstone work is evaluated against our 4-criterion rubric and links directly to your Career OS portfolio and verified credential record.",
    steps: [
      {
        number: "01",
        title: "Validate the data",
        summary: "Keep rows with positive units, positive price and no return. Say which rows you dropped and why.",
        worked: true,
        note: { kind: "fact", text: `valid_rows = ${NORTHWIND.validRows} of ${NORTHWIND.rows}` },
      },
      {
        number: "02",
        title: "Analyse revenue by category",
        summary: "Group valid net revenue by category, after fixing the labels that mean the same thing.",
        worked: true,
        note: { kind: "fact", text: `${NORTHWIND.categories.length} categories, ${NORTHWIND.netRevenueLabel}` },
      },
      {
        number: "03",
        title: "Analyse monthly trend",
        summary: "Total the same measure by month and find where the pattern breaks.",
        worked: true,
        note: { kind: "trend" },
      },
      { number: "04", title: "Identify a finding", summary: "What did the data show?", worked: false, note: { kind: "own" } },
      { number: "05", title: "Explain why it matters", summary: "Why should someone care?", worked: false, note: { kind: "own" } },
      {
        number: "06",
        title: "Write a recommendation",
        summary: "What action would you suggest based on the evidence?",
        worked: false,
        note: { kind: "own" },
      },
    ],
  },
  curriculum: {
    note: "Each module ends in a check or an assignment. The last module holds the SQL analysis, the capstone and a final check.",
    openModuleId: "m3",
  },
  practice: {
    heading: "You practise in the Northwind Lab.",
    intro:
      "The lab is a workspace inside Skylent OS where you run read-only SQL against the course extract and keep the work you want to use in the capstone. You open it from a lesson after you enrol.",
    rows: [
      { label: "Dataset", value: `${NORTHWIND.filename} · ${NORTHWIND.rows} order lines · ${NORTHWIND.window}`, mono: true },
      { label: "Valid-row rule", value: "units > 0, unit_price > 0, returned = 'no'", mono: true },
      { label: "What you write", value: "Read-only SELECT, GROUP BY, and aggregate queries executed directly in your browser against northwind_sales." },
      { label: "What you keep", value: "Saved queries and their result tables, which you attach to the capstone." },
    ],
    disclaimer:
      "Every saved SQL query and chart in the Northwind Lab can be attached as verifiable evidence to your final commercial review.",
    link: { label: "How labs fit the path", to: "/labs" },
  },
  evidence: {
    heading: "Four pieces of work a reviewer can check.",
    lede: "Hiring teams evaluate how you clean data, structure queries, and defend trade-offs. Each module produces a concrete, reviewable deliverable.",
    record: {
      title: "Northwind Commercial Review",
      context: "Capstone · Data Analytics · your own work",
      workShown:
        "Data validation, SQL analysis, category revenue analysis, monthly trend analysis, chart interpretation, evidence-based recommendation",
      skills: ["SQL", "Data analysis", "Data interpretation", "Business communication"],
      reflection: "Finding, why it matters, recommendation. Written by you.",
      footnote: "Verified capstone record · Backed by saved Northwind SQL queries, data validation logs, and executive recommendations.",
    },
    rows: evidenceRows(
      DA_CAREER_EVIDENCE,
      {
        l6: {
          produce: "Cleaning log, category and region tables, three recommendations",
          reviewer: "How dirty rows were treated and what you advised",
        },
        l12: {
          produce: "Dashboard file or layout write-up, with an insight box",
          reviewer: "One screen that answers a stated business question",
        },
        l13: {
          produce: "Your queries, their result tables and your interpretation",
          reviewer: "Queries they can re-run on the same file",
        },
        l14: {
          produce: "Memo, dashboard, and a SQL or spreadsheet appendix",
          reviewer: "A complete, end-to-end deliverable ready for technical and hiring-manager walkthroughs.",
        },
      },
      "l14",
    ),
  },
  closing: { line: "Begin with one question: what was actually measured?" },
}

const PRODUCT_MANAGEMENT: AuthoredProgrammeContent = {
  programmeSlug: "product-management",
  courseSlug: "product-management",
  artefact: "harbor-desk",
  cardLine: "Frame one retail operations problem and recommend a single constrained bet.",
  capstoneTitle: "Harbor Desk product case",
  hero: {
    headline: "Decide what to build when engineering time is limited, and write the specification for it.",
    signal: "write the specification for it.",
    summary: productManagementModuleSummary,
    figure: "Harbor Desk case, weekend exception log",
    figureNote: "Harbor Desk operations case studio (18 interviews, 34 exception logs)",
  },
  specSheet: {
    material: {
      label: "Case",
      value: "Harbor Desk",
      note: `${HARBOR.interviews} interviews, ${HARBOR.exceptions} logged exceptions`,
    },
    tools: { label: "You work in" },
  },
  project: {
    label: "The capstone",
    heading: "One case, six steps, one bet.",
    intro:
      "The Harbor Desk product case challenges you to diagnose weekend delivery failures across 12 retail stores and scope a shippable 6-week engineering specification.",
    disclaimer:
      "Completed Harbor Desk specifications are evaluated against our product rubric and link directly to your Career OS portfolio.",
    photo: {
      src: productReviewPhoto,
      width: 1600,
      height: 1068,
      alt: "Seen from above, a team around a wooden table with laptops, notebooks and phones, working through a review together.",
      caption: "A product review session",
    },
    steps: [
      {
        number: "01",
        title: "Read the case",
        summary: "Synthesise the 4 store-manager interviews and 9 weekend delivery exception logs.",
        worked: true,
        note: { kind: "fact", text: `${HARBOR.interviews} interviews, ${HARBOR.exceptions} exceptions` },
      },
      {
        number: "02",
        title: "Frame the problem",
        summary: "Distinguish the underlying store workflow breakdown from surface-level feature requests.",
        worked: true,
        note: { kind: "fact", text: "store jobs, not Gmail" },
      },
      {
        number: "03",
        title: "Write the problem and evidence",
        summary: "What did the notes and exception log actually show?",
        worked: false,
        note: { kind: "own" },
      },
      {
        number: "04",
        title: "Name the job and outcome",
        summary: "Whose work gets easier, and how would you know?",
        worked: false,
        note: { kind: "own" },
      },
      {
        number: "05",
        title: "Choose one bet",
        summary: "Pick one option under two engineers and six weeks.",
        worked: false,
        note: { kind: "fact", text: HARBOR.constraint },
      },
      {
        number: "06",
        title: "Write the recommendation",
        summary: "What should Harbor Retail do next, and what is out of scope?",
        worked: false,
        note: { kind: "own" },
      },
    ],
  },
  curriculum: {
    note: "Each module ends in a check or an assignment. The last module holds the specification lesson, the capstone and a final check.",
    openModuleId: "m3",
  },
  practice: {
    heading: "You practise on the Harbor Desk case.",
    intro:
      "Practice uses the Harbor Retail operations case studio. You synthesise 18 stakeholder interviews, audit 34 weekend exceptions, and author a constrained product specification.",
    rows: [
      { label: "Case file", value: HARBOR.filename, mono: true },
      { label: "What is in it", value: `Notes from ${HARBOR.interviews} interviews, a log of ${HARBOR.exceptions} weekend exceptions and a stated constraint.` },
      { label: "Constraint", value: "2 engineers, 6 weeks, no new warehouse system, no ERP replacement.", mono: true },
      { label: "What you write", value: "A research note, a priority memo and a product-case recommendation." },
    ],
    disclaimer:
      "Every research note, priority memo, and specification in the Harbor Desk studio can be attached directly to your Career OS evidence record.",
    link: null,
  },
  evidence: {
    heading: "Three pieces of work a reviewer can check.",
    lede: "Hiring teams evaluate how you clean data, structure queries, and defend trade-offs. Each module produces a concrete, reviewable deliverable.",
    record: {
      title: "Harbor Desk product case",
      context: "Capstone · Product Management · your own work",
      workShown:
        "Interview synthesis, problem framing, prioritisation under a constraint, thin specification, evidence-based recommendation",
      skills: ["Product discovery", "Problem framing", "Prioritisation", "Business communication"],
      reflection: "Problem and evidence, user job and outcome, the bet. Written by you.",
      footnote: "Verified capstone record · Backed by Harbor Desk interview synthesis, problem framing, and a 6-week engineering specification.",
    },
    rows: evidenceRows(
      PM_CAREER_EVIDENCE,
      {
        l6: {
          produce: "Research note with quotes, jobs and unknowns",
          reviewer: "What you heard versus what you inferred",
        },
        l12: {
          produce: "Priority memo with one bet and named non-goals",
          reviewer: "A one-page decision a lead could accept or reject",
        },
        l14: {
          produce: "Product-case memo, a thin spec and a four-week check",
          reviewer: "A complete, end-to-end deliverable ready for technical and hiring-manager walkthroughs.",
        },
      },
      "l14",
    ),
  },
  closing: { line: "Begin with one question: whose problem are you choosing?" },
}


const DATA_SCIENCE_AI: AuthoredProgrammeContent = {
  programmeSlug: "data-science-ai",
  courseSlug: "data-analytics",
  artefact: "northwind",
  cardLine: "Combine SQL commercial analytics and Python data pipelines with cohort validation and churn modelling.",
  capstoneTitle: "Cohort Retention & Revenue Leakage Audit",
  hero: {
    headline: "Combine SQL analytics and Python pipelines to validate real commercial cohorts.",
    signal: "validate real commercial cohorts.",
    summary: dataAnalyticsModuleSummary,
    figure: "Northwind SQL & Cohort Validation Lab",
    figureNote: "Dual-track pathway linking Data Analytics (SQL) and Python Programming & Automation",
  },
  specSheet: {
    material: {
      label: "Datasets",
      value: "Northwind & Churn Cohorts",
      note: "180 retail rows + retention cohorts",
    },
    tools: { label: "You work in" },
  },
  project: {
    label: "The capstone",
    heading: "Two linked tracks, six steps, one defensible model brief.",
    intro:
      "You combine SQL commercial aggregation on Northwind with Python pipeline validation and out-of-time cohort evaluation to isolate retention and margin drivers.",
    disclaimer:
      "Completed capstone work is evaluated against our 4-criterion rubric and links directly to your Career OS portfolio and verified credential record.",
    steps: [
      {
        number: "01",
        title: "Audit raw transaction grain",
        summary: "Filter invalid returns and duplicate order rows across the commercial extract.",
        worked: true,
        note: { kind: "fact", text: `valid_rows = ${NORTHWIND.validRows} of ${NORTHWIND.rows}` },
      },
      {
        number: "02",
        title: "Build cohort retention matrices",
        summary: "Group customer repeat behaviour and category margin by acquisition window.",
        worked: true,
        note: { kind: "fact", text: `${NORTHWIND.categories.length} categories, ${NORTHWIND.netRevenueLabel}` },
      },
      {
        number: "03",
        title: "Check temporal feature leakage",
        summary: "Enforce strict out-of-time train/validation splits before scoring churn risk.",
        worked: true,
        note: { kind: "trend" },
      },
      { number: "04", title: "Quantify precision-recall lift", summary: "Evaluate model calibration against baseline heuristics.", worked: false, note: { kind: "own" } },
      { number: "05", title: "Translate to commercial impact", summary: "Estimate net revenue retained under targeted intervention.", worked: false, note: { kind: "own" } },
      { number: "06", title: "Author the executive memo", summary: "Present your SQL queries, validation checks, and deployment recommendation.", worked: false, note: { kind: "own" } },
    ],
  },
  curriculum: {
    note: "This pathway links both Data Analytics (15 lessons) and Python Programming & Automation (15 lessons) in Skylent OS.",
    openModuleId: "m3",
  },
  practice: {
    heading: "You practise in the SQL Lab and Python Cohort Sandbox.",
    intro:
      "Execute read-only SQL queries on Northwind and run automated cohort leakage checks in the interactive Data Science sandbox.",
    rows: [
      { label: "Primary datasets", value: "northwind_sales.csv · churn_cohort_splits.json", mono: true },
      { label: "Validation rule", value: "Out-of-time split · Zero post-event feature leakage", mono: true },
      { label: "What you write", value: "SQL cohort aggregations, Python schema validators, and calibration diagnostics." },
      { label: "What you keep", value: "Verified query outputs, cohort evaluation metrics, and an executive decision brief." },
    ],
    disclaimer:
      "Every saved SQL query and cohort validation report attaches directly to your Career OS portfolio.",
    link: { label: "Explore interactive sandboxes", to: "/labs" },
  },
  evidence: {
    heading: "Four pieces of work a reviewer can check.",
    lede: "Hiring teams evaluate how you clean data, prevent feature leakage, and defend commercial trade-offs.",
    record: {
      title: "Cohort Retention & Revenue Leakage Audit",
      context: "Capstone · Data Science & AI · your own work",
      workShown: "SQL data hygiene, Python ETL validation, out-of-time cohort splitting, precision-recall evaluation, executive memo",
      skills: ["SQL", "Python", "Cohort validation", "Commercial analytics"],
      reflection: "Finding, validation proof, business recommendation. Written by you.",
      footnote: "Verified capstone record · Backed by Northwind SQL queries and Python cohort validation checks.",
    },
    rows: DATA_ANALYTICS.evidence.rows,
  },
  closing: { line: "Begin with one question: is your validation split truly out-of-time?" },
}

const FULL_STACK: AuthoredProgrammeContent = {
  programmeSlug: "full-stack",
  courseSlug: "full-stack-web",
  artefact: "northwind",
  cardLine: "Ship transactional REST APIs, PostgreSQL schemas, idempotent ledgers, and React interfaces.",
  capstoneTitle: "Idempotent Payment Ledger & Full-Stack Studio",
  hero: {
    headline: "Build transactional APIs, resilient database schemas, and production web interfaces.",
    signal: "production web interfaces.",
    summary: dataAnalyticsModuleSummary,
    figure: "Full-Stack Architecture & Ledger Workspace",
    figureNote: "15-lesson Full Stack Web Engineering curriculum with React, Node, and PostgreSQL",
  },
  specSheet: {
    material: {
      label: "Architecture",
      value: "Payment Ledger & REST API",
      note: "6-task capstone studio",
    },
    tools: { label: "You work in" },
  },
  project: {
    label: "The capstone",
    heading: "One transactional system, six steps, zero double-spends.",
    intro:
      "You architect an idempotent payment settlement service with React state boundaries, Express REST endpoints, and PostgreSQL row-level locking.",
    disclaimer:
      "Completed architecture specs and sandbox verification logs link directly to your Career OS portfolio and verified credential record.",
    steps: [
      {
        number: "01",
        title: "Model the relational schema",
        summary: "Define normalized PostgreSQL tables with strict foreign keys and composite unique constraints.",
        worked: true,
        note: { kind: "fact", text: "ACID + unique (gateway_tx_id, epoch)" },
      },
      {
        number: "02",
        title: "Enforce API idempotency",
        summary: "Handle concurrent webhook retries safely without double-crediting merchant balances.",
        worked: true,
        note: { kind: "fact", text: "SELECT ... FOR UPDATE SKIP LOCKED" },
      },
      {
        number: "03",
        title: "Wire transactional outbox",
        summary: "Guarantee atomic state transitions between ledger entries and downstream events.",
        worked: true,
        note: { kind: "fact", text: "Zero lost settlement events" },
      },
      { number: "04", title: "Harden auth & RBAC boundaries", summary: "Prevent horizontal privilege escalation across tenant routes.", worked: false, note: { kind: "own" } },
      { number: "05", title: "Build resilient React UI states", summary: "Handle optimistic updates, loading skeletons, and retry states cleanly.", worked: false, note: { kind: "own" } },
      { number: "06", title: "Defend the system architecture", summary: "Document failure modes, latency budgets, and rollback procedures.", worked: false, note: { kind: "own" } },
    ],
  },
  curriculum: {
    note: "Each module ends in a concept check or engineering assignment, culminating in the 6-task Idempotent Ledger Capstone.",
    openModuleId: "m3",
  },
  practice: {
    heading: "You practise in the Full-Stack Ledger Sandbox.",
    intro:
      "Test your idempotency keys, row-level locking strategy, and transactional outbox design against concurrent webhook retry vectors in the browser.",
    rows: [
      { label: "Sandbox preset", value: "idempotent-ledger-architecture · 15 lessons", mono: true },
      { label: "Concurrency check", value: "Composite idempotency key + row-level lock verification", mono: true },
      { label: "What you write", value: "API route contracts, PostgreSQL transaction guards, and architecture decision records." },
      { label: "What you keep", value: "Verified architecture dossier and cryptographic completion credential." },
    ],
    disclaimer:
      "Every verified sandbox check and architecture brief can be attached directly to your Career OS portfolio.",
    link: { label: "Try the Full-Stack Sandbox", to: "/labs" },
  },
  evidence: {
    heading: "Three engineering deliverables a reviewer can check.",
    lede: "Engineering leads evaluate how you handle race conditions, schema constraints, and API security boundaries.",
    record: {
      title: "Idempotent Payment Ledger Architecture",
      context: "Capstone · Full Stack Web Engineering · your own work",
      workShown: "Relational schema design, idempotent API handlers, transactional outbox pattern, RBAC security audit",
      skills: ["React & TypeScript", "Node & Express", "PostgreSQL", "System design"],
      reflection: "Failure mode analysis, concurrency guarantees, production trade-offs. Written by you.",
      footnote: "Verified capstone record · Backed by Full-Stack Ledger Sandbox verification and architecture memo.",
    },
    rows: [
      {
        lessonId: "l6",
        produce: "Component state & API contract specification",
        reviewer: "How client state, validation errors, and network retries are isolated",
      },
      {
        lessonId: "l12",
        produce: "PostgreSQL schema & indexing migration plan",
        reviewer: "Composite keys, foreign-key integrity, and query execution bounds",
      },
      {
        lessonId: "l14",
        produce: "Idempotent Payment Ledger & Outbox Architecture Dossier",
        reviewer: "A complete, end-to-end engineering specification ready for technical interview walkthroughs.",
        capstone: true,
      },
    ],
  },
  closing: { line: "Begin with one question: what happens when the same webhook arrives twice?" },
}

const GENERATIVE_AI: AuthoredProgrammeContent = {
  programmeSlug: "generative-ai-program",
  courseSlug: "generative-ai",
  artefact: "harbor-desk",
  cardLine: "Design grounded RAG retrieval pipelines, citation guardrails, ReAct tool agents, and LLM evaluations.",
  capstoneTitle: "Enterprise Grounded RAG & Citation Evaluation Suite",
  hero: {
    headline: "Architect grounded LLM systems with deterministic citations and refusal guardrails.",
    signal: "deterministic citations and refusal guardrails.",
    summary: productManagementModuleSummary,
    figure: "Grounded RAG & Citation Guardrail Studio",
    figureNote: "15-lesson Generative AI & LLM Systems curriculum with RAG and evaluation harnesses",
  },
  specSheet: {
    material: {
      label: "Evaluation Suite",
      value: "Enterprise RAG Corpus",
      note: "Citation & refusal guardrails",
    },
    tools: { label: "You work in" },
  },
  project: {
    label: "The capstone",
    heading: "One RAG pipeline, six steps, zero ungrounded claims.",
    intro:
      "You design an enterprise retrieval-augmented generation pipeline with hybrid chunking, metadata citation enforcement, and adversarial prompt-injection refusal guardrails.",
    disclaimer:
      "Completed RAG evaluation harnesses and architecture specs link directly to your Career OS portfolio and verified credential record.",
    photo: PRODUCT_MANAGEMENT.project.photo,
    steps: [
      {
        number: "01",
        title: "Audit retrieval chunk boundaries",
        summary: "Configure semantic + token-window chunking so policy clauses never split mid-condition.",
        worked: true,
        note: { kind: "fact", text: "Hybrid BM25 + dense retrieval" },
      },
      {
        number: "02",
        title: "Enforce deterministic citations",
        summary: "Require every generated claim to cite an exact source chunk ID from the retrieved context.",
        worked: true,
        note: { kind: "fact", text: "100% citation attribution" },
      },
      {
        number: "03",
        title: "Configure refusal thresholds",
        summary: "Abstain cleanly when retrieval similarity falls below the confidence floor.",
        worked: false,
        note: { kind: "own" },
      },
      {
        number: "04",
        title: "Harden against prompt injection",
        summary: "Isolate untrusted document text from system instructions and tool-call schemas.",
        worked: false,
        note: { kind: "own" },
      },
      {
        number: "05",
        title: "Benchmark latency & token cost",
        summary: "Balance reranker depth against p95 response latency budgets.",
        worked: false,
        note: { kind: "fact", text: "p95 < 1,800 ms budget" },
      },
      {
        number: "06",
        title: "Write the production deployment spec",
        summary: "Document evaluation metrics, fallback routing, and monitoring alerts.",
        worked: false,
        note: { kind: "own" },
      },
    ],
  },
  curriculum: {
    note: "Each module ends in a check or applied AI assignment, culminating in the Enterprise Grounded RAG Capstone.",
    openModuleId: "m3",
  },
  practice: {
    heading: "You practise in the GenAI RAG Evaluation Lab.",
    intro:
      "Test chunking strategies, citation grounding rules, and adversarial refusal thresholds directly in the browser evaluator.",
    rows: [
      { label: "Sandbox preset", value: "enterprise-rag-evaluation · 15 lessons", mono: true },
      { label: "Guardrail policy", value: "Mandatory [chunk_id] citation + low-confidence abstention", mono: true },
      { label: "What you write", value: "System prompts, retrieval evaluation rubrics, and agent tool-calling schemas." },
      { label: "What you keep", value: "Verified RAG evaluation dossier and cryptographic completion credential." },
    ],
    disclaimer:
      "Every RAG evaluation report and guardrail specification attaches directly to your Career OS evidence record.",
    link: { label: "Try the GenAI RAG Sandbox", to: "/labs" },
  },
  evidence: {
    heading: "Three AI engineering deliverables a reviewer can check.",
    lede: "AI engineering teams evaluate how you measure hallucinations, enforce citations, and bound latency and cost.",
    record: {
      title: "Enterprise Grounded RAG Evaluation Suite",
      context: "Capstone · Generative AI & LLM Systems · your own work",
      workShown: "Hybrid retrieval design, citation enforcement, prompt-injection defense, golden-dataset evaluation",
      skills: ["Grounded RAG", "LLM evaluation", "Prompt architecture", "Agent guardrails"],
      reflection: "Grounding metrics, refusal trade-offs, production rollout plan. Written by you.",
      footnote: "Verified capstone record · Backed by GenAI RAG Sandbox evaluation metrics and system specification.",
    },
    rows: [
      {
        lessonId: "l6",
        produce: "Structured JSON schema & prompt evaluation harness",
        reviewer: "Deterministic output parsing and edge-case refusal handling",
      },
      {
        lessonId: "l12",
        produce: "Hybrid RAG retrieval & reranking benchmark",
        reviewer: "Recall@K lift and citation faithfulness across adversarial queries",
      },
      {
        lessonId: "l14",
        produce: "Enterprise Grounded RAG & Guardrail Production Spec",
        reviewer: "A complete, end-to-end AI system specification ready for technical interview walkthroughs.",
        capstone: true,
      },
    ],
  },
  closing: { line: "Begin with one question: how do you prove the model did not hallucinate?" },
}

const AUTHORED: Record<string, AuthoredProgrammeContent> = {
  [DATA_ANALYTICS.programmeSlug]: DATA_ANALYTICS,
  [PRODUCT_MANAGEMENT.programmeSlug]: PRODUCT_MANAGEMENT,
  [DATA_SCIENCE_AI.programmeSlug]: DATA_SCIENCE_AI,
  [FULL_STACK.programmeSlug]: FULL_STACK,
  [GENERATIVE_AI.programmeSlug]: GENERATIVE_AI,
}

export function authoredProgrammeContent(slug: string | undefined): AuthoredProgrammeContent | null {
  return slug ? AUTHORED[slug] ?? null : null
}
