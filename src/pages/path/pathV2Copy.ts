import type { PathStageId } from "../../lib/path/constants"

/** Editorial layer only — domain stage ids unchanged. */
export const PATH_V2_STAGE_HEADLINE: Record<
  PathStageId,
  { lines: string[]; lede: string; journeyLabel: string }
> = {
  academic: {
    journeyLabel: "Where you are",
    lines: ["WHERE", "ARE YOU", "NOW?"],
    lede: "Your current position is the starting point we measure from — not a label we sell courses against.",
  },
  interests: {
    journeyLabel: "What pulls you",
    lines: ["WHAT", "DRAWS", "YOU?"],
    lede: "Interests narrow the field. You can refine direction later — honesty beats performance.",
  },
  skills: {
    journeyLabel: "What you know",
    lines: ["WHAT", "CAN YOU", "ALREADY DO?"],
    lede: "Capability today — not aspiration. Evidence on Skylent comes later; this is your self-assessment.",
  },
  direction: {
    journeyLabel: "Where you're headed",
    lines: ["WHERE DO", "YOU WANT", "TO GO?"],
    lede: "A role, field, exam, research thread, or open question. Specific words beat generic ambition.",
  },
  gaps: {
    journeyLabel: "What's missing",
    lines: ["WHAT'S", "IN THE", "WAY?"],
    lede: "Gaps are the distance between today and the direction you named — not a shopping list.",
  },
  outcome: {
    journeyLabel: "What success means",
    lines: ["WHAT WOULD", "SUCCESS", "LOOK LIKE?"],
    lede: "A outcome you could test in months — not a hiring promise.",
  },
  timeline: {
    journeyLabel: "Your pace",
    lines: ["HOW FAST", "CAN YOU", "MOVE?"],
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
