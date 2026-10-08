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
    summary: (moduleWord: string) => string
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
    summary: (moduleWord) =>
      `${moduleWord} modules take you from a first question to a commercial review. Spreadsheets, SQL and dashboards, all on one dataset you get to know properly.`,
    figure: "Northwind Lab, revenue by category",
    figureNote: "Fictional retail extract written for the course",
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
      "The Northwind Commercial Review asks you to review the sales extract and produce a concise, evidence-based commercial summary. The brief does not contain the answer.",
    disclaimer:
      "This is learner work on a fictional Northwind Retail extract. It is not a certificate, not employer-validated, and not published.",
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
      { label: "What you write", value: "Read-only SELECT queries against northwind_sales. It is not PostgreSQL and not a production database." },
      { label: "What you keep", value: "Saved queries and their result tables, which you attach to the capstone." },
    ],
    disclaimer:
      "This is a fictional Northwind Retail extract written for the course. It is not real company data, not a certificate, and not a job credential.",
    link: { label: "How labs fit the path", to: "/labs" },
  },
  evidence: {
    heading: "Four pieces of work a reviewer can check.",
    lede: "A certificate, project evidence and an employment outcome are three different things. This programme produces the second.",
    record: {
      title: "Northwind Commercial Review",
      context: "Capstone · Data Analytics · your own work",
      workShown:
        "Data validation, SQL analysis, category revenue analysis, monthly trend analysis, chart interpretation, evidence-based recommendation",
      skills: ["SQL", "Data analysis", "Data interpretation", "Business communication"],
      reflection: "Finding, why it matters, recommendation. Written by you.",
      footnote: "Learner work on a fictional Northwind Retail extract. Not a certificate and not employer-validated.",
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
          reviewer: "A work sample. Not a certificate and not a placement.",
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
    summary: (moduleWord) =>
      `${moduleWord} modules on one fictional retail operations case. You read the notes, frame a problem that can be tested, choose one bet under a stated constraint and specify it.`,
    figure: "Harbor Desk case, weekend exception log",
    figureNote: "Fictional teaching case written for the course",
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
      "The Harbor Desk product case asks you to frame the Harbor Retail operations problem and recommend one constrained product bet, with a spec someone could implement. The brief does not contain the answer.",
    disclaimer:
      "This is learner work on a fictional Harbor Retail operations case. It is not a certificate, not employer-validated, and not published.",
    photo: {
      src: productReviewPhoto,
      width: 1600,
      height: 1068,
      alt: "Seen from above, a team around a wooden table with laptops, notebooks and phones, working through a review together.",
      caption: "Stand-in photograph · a product review session",
    },
    steps: [
      {
        number: "01",
        title: "Read the case",
        summary: "Open the Harbor Desk notes. Do not invent interviews.",
        worked: true,
        note: { kind: "fact", text: `${HARBOR.interviews} interviews, ${HARBOR.exceptions} exceptions` },
      },
      {
        number: "02",
        title: "Frame the problem",
        summary: "Separate store jobs from the requested Gmail solution.",
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
      "Practice uses a fictional Harbor Retail operations case. Product work here is research notes, framing and a written specification. There is no coding lab and no query to run.",
    rows: [
      { label: "Case file", value: HARBOR.filename, mono: true },
      { label: "What is in it", value: `Notes from ${HARBOR.interviews} interviews, a log of ${HARBOR.exceptions} weekend exceptions and a stated constraint.` },
      { label: "Constraint", value: "2 engineers, 6 weeks, no new warehouse system, no ERP replacement.", mono: true },
      { label: "What you write", value: "A research note, a priority memo and a product-case recommendation." },
    ],
    disclaimer:
      "Harbor Retail and Harbor Desk are fictional. This course does not use the Northwind Lab, and the case cannot support a revenue claim.",
    link: null,
  },
  evidence: {
    heading: "Three pieces of work a reviewer can check.",
    lede: "A certificate, project evidence and an employment outcome are three different things. This programme produces the second.",
    record: {
      title: "Harbor Desk product case",
      context: "Capstone · Product Management · your own work",
      workShown:
        "Interview synthesis, problem framing, prioritisation under a constraint, thin specification, evidence-based recommendation",
      skills: ["Product discovery", "Problem framing", "Prioritisation", "Business communication"],
      reflection: "Problem and evidence, user job and outcome, the bet. Written by you.",
      footnote: "Learner work on a fictional Harbor Retail operations case. Not a certificate and not employer-validated.",
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
          reviewer: "A work sample. Not a certificate and not a placement.",
        },
      },
      "l14",
    ),
  },
  closing: { line: "Begin with one question: whose problem are you choosing?" },
}

const AUTHORED: Record<string, AuthoredProgrammeContent> = {
  [DATA_ANALYTICS.programmeSlug]: DATA_ANALYTICS,
  [PRODUCT_MANAGEMENT.programmeSlug]: PRODUCT_MANAGEMENT,
}

export function authoredProgrammeContent(slug: string | undefined): AuthoredProgrammeContent | null {
  return slug ? AUTHORED[slug] ?? null : null
}
