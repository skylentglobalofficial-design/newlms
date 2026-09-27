import type { PathStageId } from "../../lib/path/constants"

/** Editorial layer only — domain stage ids unchanged. */
export const PATH_V2_STAGE_HEADLINE: Record<
  PathStageId,
  { lines: string[]; lede: string; journeyLabel: string; eyebrow: string }
> = {
  academic: {
    eyebrow: "Stage 01 · Context",
    journeyLabel: "Where you are",
    lines: ["Where are", "you now?"],
    lede: "Your current position is the starting point we measure from — not a label we sell courses against.",
  },
  interests: {
    eyebrow: "Stage 02 · Interests",
    journeyLabel: "What pulls you",
    lines: ["What", "draws you?"],
    lede: "Interests narrow the field. You can refine direction later — honesty beats performance.",
  },
  skills: {
    eyebrow: "Stage 03 · Capability",
    journeyLabel: "What you know",
    lines: ["What can you", "already do?"],
    lede: "Capability today — not aspiration. Evidence on Skylent comes later; this is your self-assessment.",
  },
  direction: {
    eyebrow: "Stage 04 · Direction",
    journeyLabel: "Where you're headed",
    lines: ["Where do you", "want to go?"],
    lede: "A role, field, exam, research thread, or open question. Specific words beat generic ambition.",
  },
  gaps: {
    eyebrow: "Stage 05 · Distance",
    journeyLabel: "What's missing",
    lines: ["What's in", "the way?"],
    lede: "Gaps are the distance between today and the direction you named — not a shopping list.",
  },
  outcome: {
    eyebrow: "Stage 06 · Outcome",
    journeyLabel: "What success means",
    lines: ["What would", "success look like?"],
    lede: "An outcome you could test in months — not a hiring promise.",
  },
  timeline: {
    eyebrow: "Stage 07 · Pace",
    journeyLabel: "Your pace",
    lines: ["How fast can", "you move?"],
    lede: "Timeline sequences the path. Quality still beats speed when the constraint is real.",
  },
}

export const PATH_V2_JOURNEY_NODES = [
  "Start",
  "Context",
  "Interests",
  "Skills",
  "Direction",
  "Gaps",
  "Outcome",
  "Pace",
] as const

export const PATH_V2_INTRO = {
  secondaryLede:
    "First understand your position. Diagnose the gap. Only then learn, practise, build, prove, and move toward the next opportunity.",
  note: "No enrolment required. The path diagnostic runs in your browser and saves locally.",
} as const

export const PATH_V2_SPECIMEN = {
  prompt: "What should you do next?",
  quote:
    "I could take another course — but I still don't know if it's the right move.",
  footerTitle: "Skylent Path",
  footerNote: "Diagnose before you buy.",
} as const

export const PATH_V2_CONCEPT_INDEX: {
  id: string
  label: string
  stages: PathStageId[]
}[] = [
  { id: "here", label: "Where I am", stages: ["academic", "interests", "skills"] },
  { id: "going", label: "Where I'm going", stages: ["direction"] },
  { id: "missing", label: "What's missing", stages: ["gaps"] },
  { id: "next", label: "Next action", stages: ["outcome", "timeline"] },
]
