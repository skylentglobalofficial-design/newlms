/**
 * The product manifest: one ordered list of what each Skylent product area contains, in the
 * words the product itself uses. Public pages (homepage, /career-os signed out) and the signed-in
 * product (Career OS overview and nav) read their feature names, order, summaries and status from
 * here, so the website and the product cannot describe two different things.
 *
 * Rules
 * - Status is never written here. Each feature names a capability and its status is read from
 *   src/lib/truth.ts (truthOf), which is the only place a state is decided.
 * - Only features with publicSafe: true are drawn on public pages.
 * - A specimen holds labels and example states only. Never learner data, and never a percentage,
 *   score, match, salary, opening or readiness value.
 * - Every route is a real route in src/App.tsx, or null. scripts/test-product-manifest.ts checks it.
 *
 * Pure data and types: no React.
 */
import type { TruthState } from "../components/skylent/primitives"
import { truthOf, type Capability } from "./truth"

/** The four product states a feature can be in. "illustrative" is a plate caption, never a feature state. */
export type ProductStatus = Exclude<TruthState, "illustrative">

/** A public-safe representative state. Labels only; drawn with an "Example" mark. */
export type FeatureSpecimen = {
  /** Example value shown on public plates, only for a live feature. Labels, never a number about a learner. */
  example?: string
  /** What the signed-in product shows when the learner has nothing here yet. */
  empty: string
  /** Where the specimen draws the feature: the lead (target role), the action box, or a cell. */
  slot?: "lead" | "action" | "cell"
  /** Label for the action box's button. */
  action?: string
}

export type ProductFeature = {
  id: string
  /** The user-facing name, exactly as the product shows it. */
  label: string
  /** One plain sentence. */
  summary: string
  /** A route in src/App.tsx (may contain :params), or null when the feature has no page of its own. */
  route: string | null
  /** The truth.ts capability this feature's status comes from. */
  capability: Capability
  /** Read from truth.ts. Do not set by hand. */
  status: ProductStatus
  /** Only true features appear on public pages. */
  publicSafe: boolean
  /** One short line for a product cell that has no data because the feature is not live. */
  pending?: string
  specimen?: FeatureSpecimen
}

export type ProductNavItem = { id: string; label: string; short: string; route: string; summary: string; empty: string }

export type ProductArea = {
  id: string
  label: string
  summary: string
  route: string
  features: readonly ProductFeature[]
}

type FeatureDef = Omit<ProductFeature, "status">

function statusOf(capability: Capability): ProductStatus {
  const state = truthOf(capability)
  if (state === "illustrative") throw new Error(`truth.ts: ${capability} cannot be "illustrative"`)
  return state
}

function feature(def: FeatureDef): ProductFeature {
  return { ...def, status: statusOf(def.capability) }
}

/* ── Career OS ─────────────────────────────────────────────────────────────── */

/**
 * Order: Profile → Skills → (Gaps) → Learning → Practice → Projects → Evidence → Certificates →
 * (Readiness) → Opportunities → Next step. Verified against the backend:
 * - /career/profile (target role, education, experience, links, self-entered skills): live.
 * - Required skills per role, gaps, readiness: no model or endpoint exists.
 * - /lms/* and the Northwind lab: live in the flagship course.
 * - /projects and /career/projects (learner projects and the records added to Career OS): exist,
 *   not released as a finished evidence product.
 * - /certificates/issue, /mine, /verify/:code: exist, not yet checked in production.
 * - /career/jobs: exists, no openings published.
 */
export const CAREER_OS_FEATURES: readonly ProductFeature[] = [
  feature({
    id: "profile",
    label: "Target role",
    summary: "Free text from your career profile, beside your education, experience and links.",
    route: "/career-os/profile",
    capability: "careerProfile",
    publicSafe: true,
    specimen: { example: "Data analyst", empty: "No target role set", slot: "lead" },
  }),
  feature({
    id: "skills",
    label: "Your skills",
    summary: "Skills you enter yourself, with a proficiency you choose. Not assessed by Skylent.",
    route: "/career-os/profile",
    capability: "careerProfile",
    publicSafe: true,
    specimen: { example: "SQL · Spreadsheets · Dashboards", empty: "None entered" },
  }),
  feature({
    id: "gaps",
    label: "Gaps",
    summary: "Career OS holds no required skills per role, so it cannot compare your skills with a role yet.",
    route: null,
    capability: "skillGaps",
    publicSafe: true,
    pending: "Needs required skills per role",
  }),
  feature({
    id: "learning",
    label: "Learning",
    summary: "Lessons and progress from the programme you are enrolled in.",
    route: "/dashboard/student",
    capability: "lessons",
    publicSafe: true,
    specimen: { example: "Your current lesson", empty: "Not enrolled" },
  }),
  feature({
    id: "practice",
    label: "Practice",
    summary: "Work you save in the lab that belongs to your course.",
    route: "/labs",
    capability: "lessons",
    publicSafe: true,
    specimen: { example: "Saved lab work", empty: "Nothing saved" },
  }),
  feature({
    id: "projects",
    label: "Projects",
    summary: "Capstone projects from the courses you take, with their task progress.",
    route: "/career-os/projects",
    capability: "projectsAndEvidence",
    publicSafe: true,
    pending: "Opens inside a course",
    specimen: { empty: "Not started" },
  }),
  feature({
    id: "evidence",
    label: "Evidence",
    summary: "Your own work on a project, kept with the project behind it. Records you can share are not released yet.",
    route: null,
    capability: "projectsAndEvidence",
    publicSafe: true,
    pending: "Records not released",
    specimen: { empty: "Nothing yet" },
  }),
  feature({
    id: "certificates",
    label: "Certificates",
    summary: "Issued when every lesson of a course is complete, with an ID anyone can check.",
    route: "/verify",
    capability: "certificates",
    publicSafe: true,
    pending: "Issued on course completion",
    specimen: { empty: "None issued" },
  }),
  feature({
    id: "readiness",
    label: "Readiness",
    summary: "No readiness score is calculated.",
    route: null,
    capability: "readiness",
    // Shown inside the product as "in development"; kept off public pages so no score is implied.
    publicSafe: false,
    pending: "No score is calculated",
  }),
  feature({
    id: "opportunities",
    label: "Opportunities",
    summary: "Published roles you can save and apply to. None are published yet.",
    route: "/career-os/jobs",
    capability: "openings",
    publicSafe: true,
    pending: "No openings published",
    specimen: { empty: "No openings published" },
  }),
  feature({
    id: "next-step",
    label: "Next step",
    summary: "One action, read from your learning and your profile. It is never a score.",
    route: "/career-os",
    capability: "careerNextStep",
    publicSafe: true,
    specimen: { example: "Continue your current lesson", empty: "Browse programmes", slot: "action", action: "Continue learning" },
  }),
]

/** The Career OS workspace areas, in the order of the signed-in navigation. */
export const CAREER_OS_NAV: readonly ProductNavItem[] = [
  { id: "overview", label: "Overview", short: "Home", route: "/career-os", summary: "Target role, skills, evidence and the next step", empty: "Yours starts empty" },
  { id: "projects", label: "Projects", short: "Work", route: "/career-os/projects", summary: "Learner work kept as evidence", empty: "Filled from your finished work" },
  { id: "profile", label: "Profile", short: "Profile", route: "/career-os/profile", summary: "Identity, skills, evidence", empty: "Yours to write" },
  { id: "jobs", label: "Opportunities", short: "Roles", route: "/career-os/jobs", summary: "Job board when roles are published", empty: "Empty until roles are published" },
  { id: "applications", label: "Applications", short: "Apps", route: "/career-os/applications", summary: "Track what you submitted", empty: "Filled from what you submit" },
  { id: "interviews", label: "Interviews", short: "Prep", route: "/career-os/interviews", summary: "Rounds and practice", empty: "Filled from scheduled rounds" },
  { id: "support", label: "Support", short: "Help", route: "/career-os/support", summary: "Help on the career workflow", empty: "Request help on the workflow" },
]

/* ── Learning workspace (student home) ─────────────────────────────────────── */

export const LEARNING_FEATURES: readonly ProductFeature[] = [
  feature({
    id: "lessons",
    label: "My learning",
    summary: "Your enrolments, the lesson to resume and your progress through each course.",
    route: "/dashboard/student",
    capability: "lessons",
    publicSafe: true,
  }),
  feature({
    id: "lesson-player",
    label: "Lessons",
    summary: "Notes, checks and assignments in the order the course sets.",
    route: "/learn/:slug",
    capability: "lessons",
    publicSafe: true,
  }),
  feature({
    id: "lab",
    label: "Northwind Lab",
    summary: "The Data Analytics lab: run queries on the course dataset and save your work.",
    route: "/os/labs/data-analytics/northwind",
    capability: "lessons",
    publicSafe: true,
  }),
  feature({
    id: "project",
    label: "Project workspace",
    summary: "The capstone, task by task, inside the course.",
    route: "/os/projects/:courseSlug/:projectType",
    capability: "projectsAndEvidence",
    publicSafe: true,
  }),
  feature({
    id: "certificate",
    label: "Certificates",
    summary: "Issued when every lesson of a course is complete, with an ID anyone can check.",
    route: "/verify",
    capability: "certificates",
    publicSafe: true,
  }),
]

/* ── Skylent AI ────────────────────────────────────────────────────────────── */

/** Where Skylent AI works. Status of each scope comes from truth.ts. */
export const SKYLENT_AI_FEATURES: readonly ProductFeature[] = [
  feature({
    id: "lesson-assistant",
    label: "In lessons",
    summary: "Answers from the lesson you have open: its text, its concepts and the case facts attached to the course.",
    route: "/learn/:slug",
    capability: "lessonAi",
    publicSafe: true,
  }),
  feature({
    id: "site-assistant",
    label: "Across the site",
    summary: "Answers about the public site and the catalogue, and your own enrolments when you are signed in.",
    route: null,
    capability: "siteAi",
    publicSafe: true,
  }),
  feature({
    id: "career-context",
    label: "With your career context",
    summary: "No Skylent AI endpoint can read your skills, projects, evidence or career profile.",
    route: null,
    capability: "careerAi",
    publicSafe: true,
  }),
]

/**
 * The lesson assistant, as the server builds it (server/src/lib/skylent-ai/authored.ts, prompts.ts,
 * integrity.ts, service.ts) and as the lesson panel draws it (src/components/lms/SkylentAI.tsx).
 */
export const LESSON_AI = {
  /** What buildLessonAiContext() attaches to every request. */
  receives: [
    { label: "Course, module and lesson", detail: "Titles and the lesson type." },
    { label: "Lesson objective and concepts", detail: "From the authored course." },
    { label: "Lesson text", detail: "The body of the lesson you have open." },
    { label: "Case facts", detail: "The fictional case attached to the course: Northwind for Data Analytics, Harbor Desk for Product Management." },
  ],
  /** Context the server never attaches. */
  notReceived: ["Your progress", "Your projects and evidence", "Your career profile"],
  /** The modes POST /lms/ai/ask accepts (AiAction), with the labels the lesson panel uses. */
  modes: [
    { id: "ask", label: "Ask a question", detail: "Your own question about this lesson." },
    { id: "explain", label: "Explain simpler", detail: "The lesson's idea in plainer words." },
    { id: "example", label: "Give an example", detail: "One example from the lesson's own case." },
    { id: "quiz", label: "Quiz me", detail: "One question on this lesson, then it waits for you." },
    { id: "practice", label: "Practice question", detail: "One problem to try before any answer." },
  ],
  /** The response fields the server returns (AiAskResult) and the panel shows, in order. */
  answerShape: [
    { label: "Context", detail: "The lesson the answer is based on." },
    { label: "Answer", detail: "Written from the lesson context above." },
    { label: "Related", detail: "The lesson concept closest to your question." },
  ],
  /** Decided on the server from the lesson type and your state; the browser cannot change it. */
  integrity: [
    "During an open quiz it will not give the answer, the correct option or the answer key.",
    "During an open assignment it will not write the submission for you.",
    "While an assessment is open, the case's computed results are withheld from it.",
  ],
} as const

/* ── Areas ─────────────────────────────────────────────────────────────────── */

export const PRODUCT_AREAS: readonly ProductArea[] = [
  {
    id: "learning",
    label: "My learning",
    summary: "The signed-in learning workspace.",
    route: "/dashboard/student",
    features: LEARNING_FEATURES,
  },
  {
    id: "career-os",
    label: "Career OS",
    summary: "The signed-in workspace that reads your career profile and your learning.",
    route: "/career-os",
    features: CAREER_OS_FEATURES,
  },
  {
    id: "skylent-ai",
    label: "Skylent AI",
    summary: "The assistant inside lessons and across the site.",
    route: "/",
    features: SKYLENT_AI_FEATURES,
  },
]

/* ── Lookups ───────────────────────────────────────────────────────────────── */

export function publicFeatures(features: readonly ProductFeature[]): ProductFeature[] {
  return features.filter((item) => item.publicSafe)
}

export function careerFeature(id: string): ProductFeature {
  const found = CAREER_OS_FEATURES.find((item) => item.id === id)
  if (!found) throw new Error(`product-manifest: no Career OS feature "${id}"`)
  return found
}

export function aiFeature(id: string): ProductFeature {
  const found = SKYLENT_AI_FEATURES.find((item) => item.id === id)
  if (!found) throw new Error(`product-manifest: no Skylent AI feature "${id}"`)
  return found
}
