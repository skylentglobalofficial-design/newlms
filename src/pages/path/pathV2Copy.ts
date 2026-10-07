import type { PathStageId } from "../../lib/path/constants"

/** Editorial layer only — domain stage ids unchanged. */
export const PATH_V2_STAGE_HEADLINE: Record<
  PathStageId,
  { lines: string[]; lede: string; journeyLabel: string; eyebrow: string; short: string }
> = {
  academic: {
    eyebrow: "Stage 01 · Context",
    short: "Context",
    journeyLabel: "Where you are",
    lines: ["Where are", "you now?"],
    lede: "Your current position is the starting point we measure from — not a label we sell courses against.",
  },
  interests: {
    eyebrow: "Stage 02 · Interests",
    short: "Interests",
    journeyLabel: "What pulls you",
    lines: ["What", "draws you?"],
    lede: "Interests narrow the field. You can refine direction later — honesty beats performance.",
  },
  skills: {
    eyebrow: "Stage 03 · Capability",
    short: "Skills",
    journeyLabel: "What you know",
    lines: ["What can you", "already do?"],
    lede: "Capability today — not aspiration. Evidence on Skylent comes later; this is your self-assessment.",
  },
  direction: {
    eyebrow: "Stage 04 · Direction",
    short: "Direction",
    journeyLabel: "Where you're headed",
    lines: ["Where do you", "want to go?"],
    lede: "A role, field, exam, research thread, or open question. Specific words beat generic ambition.",
  },
  gaps: {
    eyebrow: "Stage 05 · Distance",
    short: "Gaps",
    journeyLabel: "What's missing",
    lines: ["What's in", "the way?"],
    lede: "Gaps are the distance between today and the direction you named — not a shopping list.",
  },
  outcome: {
    eyebrow: "Stage 06 · Outcome",
    short: "Outcome",
    journeyLabel: "What success means",
    lines: ["What would", "success look like?"],
    lede: "An outcome you could test in months — not a hiring promise.",
  },
  timeline: {
    eyebrow: "Stage 07 · Pace",
    short: "Pace",
    journeyLabel: "Your pace",
    lines: ["How fast can", "you move?"],
    lede: "Timeline sequences the path. Quality still beats speed when the constraint is real.",
  },
}

export const PATH_V2_INTRO = {
  note: "No enrolment or sign-in needed. Your answers are saved in this browser.",
} as const

/** The honest label shown near the top of both Find My Path pages. */
export const PATH_V2_TRUTH_LINE =
  "Rule-based. It runs in your browser on your answers. It is not AI and it does not predict outcomes."

/** What the tool does, in three steps. Used by the empty result state. */
export const PATH_V2_HOW_IT_WORKS: { title: string; body: string }[] = [
  {
    title: "Answer seven short stages",
    body: "Where you are, what interests you, what you can do, where you want to go, what is missing, the outcome you want and your timeline.",
  },
  {
    title: "Fixed rules sort your answers",
    body: "The same answers always give the same path. Nothing is generated, scored or predicted.",
  },
  {
    title: "Get a six-phase path and one next action",
    body: "Foundation, skills, practice, build, proof and opportunity, with the step to take first.",
  },
]

/** Closing band links. Real routes only. */
export const PATH_V2_CLOSING_LINKS: { label: string; to: string }[] = [
  { label: "Explore programmes", to: "/programmes" },
  { label: "See degree routes", to: "/education" },
  { label: "Open Career OS", to: "/career-os" },
]
