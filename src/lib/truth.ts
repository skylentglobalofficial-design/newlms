/**
 * One place that states what is real today. Screens read from here instead of hard-coding "Live".
 *
 * Rule: a capability is "live" only when the backend supports it AND it has been checked in production.
 * Anything not yet checked in production stays "development" and is flipped here, in one line, after the check.
 * Never mark something live because a design shows it.
 */
import type { TruthState } from "../components/skylent/primitives"

export type Capability =
  | "careerProfile"
  | "projectsAndEvidence"
  | "certificates"
  | "openings"
  | "findMyPath"
  | "lessonAi"
  | "siteAi"
  | "careerAi"
  | "degrees"
  | "enquiries"

export const TRUTH: Record<Capability, { state: TruthState; note: string }> = {
  careerProfile: { state: "live", note: "Career profile endpoints exist and are used by Career OS." },
  projectsAndEvidence: { state: "development", note: "Learner projects exist; evidence records are not released as a finished product." },
  // Backend: POST /certificates/issue, GET /certificates/mine, GET /certificates/verify/:code are on main.
  // Flip to "live" once issue + verify have been checked on https://api.skylent.live.
  certificates: { state: "development", note: "Issue and verify endpoints exist; not yet checked in production from this build." },
  openings: { state: "soon", note: "Job models exist; no openings are published." },
  findMyPath: { state: "live", note: "Runs in the browser on the learner's answers; it is rule-based, not AI." },
  lessonAi: { state: "live", note: "Available inside lessons when the server has an AI key configured; the panel reports when it is not." },
  // Backend: POST /reva/chat (legacy internal name). Flip to "live" after a production check.
  siteAi: { state: "development", note: "Site-wide assistant endpoint exists; scope is the public site and the learner's own enrolments." },
  careerAi: { state: "development", note: "No AI endpoint has career context yet." },
  degrees: { state: "sample", note: "No degree data in the backend. Degree routes are sample listings." },
  enquiries: { state: "development", note: "POST /enquiries exists on main; flip to live after a production check." },
}

export function truthOf(capability: Capability): TruthState {
  return TRUTH[capability].state
}
