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

export type ProgrammeArtefactId = "northwind" | "harbor-desk" | "data-science" | "full-stack" | "genai-rag" | "data-science" | "full-stack" | "genai-rag"

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
      "Completed capstone work is evaluated against our 5-dimension competency rubric (15% Knowledge · 30% Execution · 20% Judgement · 15% Oral Defence · 20% V1→V2 Revision) and links directly to your Career OS portfolio and verified credential record.",
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
  artefact: "data-science",
  cardLine: "Master both SQL revenue analysis and Python automation pipelines to build and validate customer retention models.",
  capstoneTitle: "Customer Retention & Revenue Leakage Audit (SQL + Python)",
  hero: {
    headline: "Go from raw tables to building SQL and Python pipelines that predict customer retention.",
    signal: "predict customer retention.",
    summary: dataAnalyticsModuleSummary,
    figure: "SQL + Python Cohort Validation Workbench",
    figureNote: "Dual-track pathway combining Data Analytics (15 lessons) and Python Programming & Automation (15 lessons)",
  },
  specSheet: {
    material: {
      label: "Datasets",
      value: "Northwind & Retention Cohorts",
      note: "180 retail orders + 1,240 customer accounts",
    },
    tools: { label: "You work in" },
  },
  project: {
    label: "The capstone",
    heading: "Two core skills, six clear steps, one complete portfolio project.",
    intro:
      "You do not need prior machine-learning experience. You start by cleaning sales tables in SQL, automate data checks in Python, and step-by-step build a customer retention model you can explain in any interview.",
    disclaimer:
      "Completed work is graded against our 5-dimension competency rubric (15% Knowledge · 30% Execution · 20% Judgement · 15% Oral Defence · 20% V1→V2 Revision) and saved directly to your verifiable Career OS portfolio.",
    steps: [
      {
        number: "01",
        title: "Clean the raw order data in SQL",
        summary: "Spot and remove cancelled orders, negative quantities, and duplicate rows so your numbers are 100% accurate.",
        worked: true,
        note: { kind: "fact", text: `valid_rows = ${NORTHWIND.validRows} of ${NORTHWIND.rows}` },
      },
      {
        number: "02",
        title: "Group customers into monthly cohorts",
        summary: "Track how many customers come back in Month 2 and Month 3 across each product category.",
        worked: true,
        note: { kind: "fact", text: `${NORTHWIND.categories.length} categories, ${NORTHWIND.netRevenueLabel}` },
      },
      {
        number: "03",
        title: "Automate data checks in Python",
        summary: "Write a clean Python script that catches bad records automatically before they reach your report.",
        worked: true,
        note: { kind: "trend" },
      },
      {
        number: "04",
        title: "Separate past training data from future test data",
        summary: "Learn how to test a churn prediction fairly without accidentally peeking at future dates.",
        worked: false,
        note: { kind: "own" },
      },
      {
        number: "05",
        title: "Find where revenue is leaking",
        summary: "Pinpoint which discount tier causes customers to churn after their first purchase.",
        worked: false,
        note: { kind: "own" },
      },
      {
        number: "06",
        title: "Write your 1-page business recommendation",
        summary: "Turn your SQL and Python findings into a clear action plan a hiring manager can read in two minutes.",
        worked: false,
        note: { kind: "own" },
      },
    ],
  },
  curriculum: {
    note: "This dual pathway includes all 10 modules (30 lessons): Modules 1–5 cover SQL & Commercial Analytics, and Modules 6–10 cover Python Programming & Automation.",
    openModuleId: "m1",
  },
  practice: {
    heading: "You practise in the browser SQL Lab and Python Sandbox.",
    intro:
      "No local installation needed. You run real SQL queries and Python validation scripts right inside Skylent OS and save your outputs for your final portfolio.",
    rows: [
      { label: "Datasets included", value: "northwind_sales.csv · customer_cohorts.json", mono: true },
      { label: "Core skills built", value: "SQL joins & aggregations, Python 3 ETL scripts, pytest checks, and cohort retention analysis." },
      { label: "Support when stuck", value: "Instant Hinglish guided study hints inside every lesson + 20-minute human Faculty TA help." },
      { label: "What you walk away with", value: "Saved SQL queries, a working Python validator, and a verified Dual-Track Capstone dossier." },
    ],
    disclaimer:
      "Every query and Python check you complete attaches directly to your verifiable Career OS profile.",
    link: { label: "Explore interactive labs", to: "/labs" },
  },
  evidence: {
    heading: "Four real deliverables you can show in interviews.",
    lede: "Instead of just listing 'SQL and Python' on your resume, you graduate with four concrete pieces of work that recruiters can inspect.",
    record: {
      title: "Customer Retention & Revenue Leakage Audit",
      context: "Dual-Track Capstone · SQL + Python · your own work",
      workShown: "SQL data cleaning, cohort retention tables, Python automated schema checks, and an executive retention memo",
      skills: ["SQL", "Python 3", "Cohort analysis", "Data storytelling"],
      reflection: "What the data showed, how you verified it, and what the business should do next.",
      footnote: "Verifiable at skylent.live/verify · Backed by your saved SQL queries and Python validation runs.",
    },
    rows: DATA_ANALYTICS.evidence.rows,
  },
  closing: { line: "Begin with one question: which customers actually stay?" },
}

const FULL_STACK: AuthoredProgrammeContent = {
  programmeSlug: "full-stack",
  courseSlug: "full-stack-web",
  artefact: "full-stack",
  cardLine: "Build complete web applications from scratch using React, TypeScript, Node/Express APIs, and PostgreSQL databases.",
  capstoneTitle: "Production Payment & Order Ledger Web App",
  hero: {
    headline: "Go from basic components to shipping a complete React, Node, and PostgreSQL web application.",
    signal: "shipping a complete React, Node, and PostgreSQL web application.",
    summary: dataAnalyticsModuleSummary,
    figure: "Full-Stack API & PostgreSQL Workbench",
    figureNote: "15-lesson Full Stack Web Engineering track covering React, TypeScript, Node/Express, and PostgreSQL",
  },
  specSheet: {
    material: {
      label: "Capstone App",
      value: "Order & Payment Ledger",
      note: "React UI + Express API + PostgreSQL",
    },
    tools: { label: "You work in" },
  },
  project: {
    label: "The capstone",
    heading: "One real web application, built step by step across six stages.",
    intro:
      "Instead of building another toy to-do list, you will build a real-world order and payment web app—learning how the React screen, the Node.js server, and the PostgreSQL database work together safely.",
    disclaimer:
      "Your completed architecture and code checks link directly to your verifiable Career OS portfolio.",
    steps: [
      {
        number: "01",
        title: "Design the PostgreSQL database tables",
        summary: "Create clean tables for users, orders, and payments so every transaction is stored safely.",
        worked: true,
        note: { kind: "fact", text: "Normalized PostgreSQL schema" },
      },
      {
        number: "02",
        title: "Build the Node & Express REST API",
        summary: "Write clear API endpoints that validate user input and return clean JSON responses.",
        worked: true,
        note: { kind: "fact", text: "Type-safe Express routes" },
      },
      {
        number: "03",
        title: "Prevent duplicate payment charges",
        summary: "Learn the simple database technique real fintech apps use so clicking 'Pay' twice never charges a user twice.",
        worked: true,
        note: { kind: "fact", text: "Zero double-charges" },
      },
      {
        number: "04",
        title: "Secure login and user permissions",
        summary: "Protect your API routes so a logged-in user can only view and edit their own orders.",
        worked: false,
        note: { kind: "own" },
      },
      {
        number: "05",
        title: "Connect the React & TypeScript interface",
        summary: "Build a responsive dashboard with clean loading states, error messages, and instant updates.",
        worked: false,
        note: { kind: "own" },
      },
      {
        number: "06",
        title: "Package your project for technical interviews",
        summary: "Write a clear architecture walkthrough explaining how your frontend, API, and database handle real traffic.",
        worked: false,
        note: { kind: "own" },
      },
    ],
  },
  curriculum: {
    note: "Each module takes you one layer deeper—from React UI components to Express APIs, PostgreSQL tables, security, and the final capstone app.",
    openModuleId: "m1",
  },
  practice: {
    heading: "You practise in the Full-Stack Browser Sandbox.",
    intro:
      "Test your API routes, database queries, and payment safety checks right in your browser—with step-by-step guidance whenever you get stuck.",
    rows: [
      { label: "Stack covered", value: "React 18 · TypeScript · Node.js & Express · PostgreSQL", mono: true },
      { label: "What you build", value: "Interactive UI forms, validated REST endpoints, and safe database transactions." },
      { label: "Support when stuck", value: "Instant Hinglish guided study hints + 20-minute human Faculty TA help." },
      { label: "What you keep", value: "A complete Full-Stack Architecture Dossier and verifiable SKL credential." },
    ],
    disclaimer:
      "Every completed engineering check and architecture write-up is saved to your Career OS profile.",
    link: { label: "Explore the Full-Stack Sandbox", to: "/labs" },
  },
  evidence: {
    heading: "Three engineering deliverables you can show employers.",
    lede: "Software teams hire developers who understand how the UI, API, and database fit together. You graduate with three reviewable engineering artifacts.",
    record: {
      title: "Production Payment & Order Ledger Web App",
      context: "Capstone · Full Stack Web Engineering · your own work",
      workShown: "React & TypeScript state flow, Express API validation, PostgreSQL schema design, and duplicate-payment prevention",
      skills: ["React & TypeScript", "Node & Express", "PostgreSQL", "API security"],
      reflection: "How your app is structured, how it prevents bad data, and how you tested it.",
      footnote: "Verifiable at skylent.live/verify · Backed by your completed Full-Stack Sandbox checks and architecture brief.",
    },
    rows: [
      {
        lessonId: "l6",
        produce: "React UI state & API contract specification",
        reviewer: "How your frontend handles forms, loading states, and server errors cleanly",
      },
      {
        lessonId: "l12",
        produce: "PostgreSQL database schema & query plan",
        reviewer: "Well-structured tables, keys, and safe transaction handling",
      },
      {
        lessonId: "l14",
        produce: "Complete Payment Ledger Web App Architecture Dossier",
        reviewer: "An end-to-end full-stack project ready to walk through in SDE interviews.",
        capstone: true,
      },
    ],
  },
  closing: { line: "Begin with one question: how does data travel from a button click to the database?" },
}

const GENERATIVE_AI: AuthoredProgrammeContent = {
  programmeSlug: "generative-ai-program",
  courseSlug: "generative-ai",
  artefact: "genai-rag",
  cardLine: "Build reliable AI assistants that search real company documents, cite their sources, and refuse to hallucinate.",
  capstoneTitle: "Citation-Backed Enterprise AI Assistant (RAG)",
  hero: {
    headline: "Go from basic prompts to building an AI assistant that cites real documents and never makes things up.",
    signal: "cites real documents and never makes things up.",
    summary: productManagementModuleSummary,
    figure: "Grounded RAG & Citation Testing Workbench",
    figureNote: "15-lesson Generative AI & LLM Systems track covering Prompt Engineering, RAG, AI Agents, and Evaluation",
  },
  specSheet: {
    material: {
      label: "AI Project",
      value: "Document Q&A Assistant",
      note: "Search + Citations + Safety Guardrails",
    },
    tools: { label: "You work in" },
  },
  project: {
    label: "The capstone",
    heading: "One reliable AI system, built in six clear steps.",
    intro:
      "Anyone can call a basic chatbot API—companies hire AI engineers who can make AI trustworthy. You will build step-by-step an AI assistant that searches real company policy documents, attaches exact page citations, and safely says 'I don't know' when an answer isn't in the docs.",
    disclaimer:
      "Your completed AI evaluation report and system design link directly to your verifiable Career OS portfolio.",
    steps: [
      {
        number: "01",
        title: "Structure prompts for reliable JSON outputs",
        summary: "Learn how to make an LLM return clean, predictable structured data instead of random paragraphs.",
        worked: true,
        note: { kind: "fact", text: "Deterministic schema output" },
      },
      {
        number: "02",
        title: "Prepare and split company documents for search (RAG)",
        summary: "Break long policy documents into smart searchable chunks so important rules never get cut in half.",
        worked: true,
        note: { kind: "fact", text: "Clean document chunking" },
      },
      {
        number: "03",
        title: "Force the AI to cite its exact source",
        summary: "Require every answer to include the exact document ID ([doc_id]) it came from—eliminating fake claims.",
        worked: true,
        note: { kind: "fact", text: "100% source citation" },
      },
      {
        number: "04",
        title: "Teach the AI when to say 'I don’t know'",
        summary: "Set a clear confidence rule so the assistant abstains cleanly instead of guessing on unfamiliar questions.",
        worked: false,
        note: { kind: "own" },
      },
      {
        number: "05",
        title: "Block prompt-injection tricks",
        summary: "Protect your AI assistant so users cannot trick it into ignoring company rules.",
        worked: false,
        note: { kind: "own" },
      },
      {
        number: "06",
        title: "Publish your AI evaluation scorecard",
        summary: "Test your assistant against 120 tricky questions and present your accuracy, speed, and cost results.",
        worked: false,
        note: { kind: "own" },
      },
    ],
  },
  curriculum: {
    note: "Each module builds your capability step by step: structured prompting, document search (RAG), tool-using agents, safety guardrails, and your final AI capstone.",
    openModuleId: "m1",
  },
  practice: {
    heading: "You practise in the GenAI RAG Sandbox.",
    intro:
      "Test document chunking, source citations, and safety rules interactively in your browser—and see immediately how each change improves accuracy.",
    rows: [
      { label: "Skills you build", value: "Structured Prompting · Document Search (RAG) · AI Agents · Hallucination Testing", mono: true },
      { label: "Safety standard", value: "Every claim must cite a verified [chunk_id] or cleanly abstain." },
      { label: "Support when stuck", value: "Instant Hinglish guided study hints + 20-minute human Faculty TA help." },
      { label: "What you keep", value: "A verified AI Evaluation Dossier and cryptographic SKL credential." },
    ],
    disclaimer:
      "Every evaluation run and system specification you complete is saved to your Career OS profile.",
    link: { label: "Explore the GenAI Sandbox", to: "/labs" },
  },
  evidence: {
    heading: "Three AI engineering deliverables you can show employers.",
    lede: "Hiring managers want to see that you can build AI that works reliably in production. You graduate with three concrete deliverables.",
    record: {
      title: "Citation-Backed Enterprise AI Assistant (RAG)",
      context: "Capstone · Generative AI & LLM Systems · your own work",
      workShown: "Structured prompt schemas, document search pipeline, mandatory citation checks, and prompt-injection defense",
      skills: ["Prompt engineering", "Grounded RAG", "AI evaluation", "LLM safety"],
      reflection: "How you eliminated hallucinations, measured accuracy, and kept response speed fast.",
      footnote: "Verifiable at skylent.live/verify · Backed by your GenAI Sandbox evaluation scorecard and system spec.",
    },
    rows: [
      {
        lessonId: "l6",
        produce: "Structured JSON prompt & validation harness",
        reviewer: "How you guarantee clean, machine-readable outputs from an LLM",
      },
      {
        lessonId: "l12",
        produce: "Document search (RAG) & citation benchmark",
        reviewer: "How your retrieval pipeline finds the right policy and attaches exact citations",
      },
      {
        lessonId: "l14",
        produce: "Complete Enterprise RAG Assistant & Evaluation Dossier",
        reviewer: "An end-to-end AI engineering project ready to demonstrate in technical interviews.",
        capstone: true,
      },
    ],
  },
  closing: { line: "Begin with one question: can you trust the answer your AI just gave?" },
}

const SQL_CERTIFICATE: AuthoredProgrammeContent = {
  ...DATA_ANALYTICS,
  programmeSlug: "sql-certificate",
  courseSlug: "data-analytics",
  artefact: "northwind",
  cardLine: "Learn to filter, join, and aggregate multi-table retail data directly in the browser SQL workbench.",
  capstoneTitle: "Northwind SQL Commercial Query Portfolio",
}

const AUTHORED: Record<string, AuthoredProgrammeContent> = {
  [DATA_ANALYTICS.programmeSlug]: DATA_ANALYTICS,
  [PRODUCT_MANAGEMENT.programmeSlug]: PRODUCT_MANAGEMENT,
  [DATA_SCIENCE_AI.programmeSlug]: DATA_SCIENCE_AI,
  [FULL_STACK.programmeSlug]: FULL_STACK,
  [GENERATIVE_AI.programmeSlug]: GENERATIVE_AI,
  [SQL_CERTIFICATE.programmeSlug]: SQL_CERTIFICATE,
}

export function authoredProgrammeContent(slug: string | undefined): AuthoredProgrammeContent | null {
  return slug ? AUTHORED[slug] ?? null : null
}
