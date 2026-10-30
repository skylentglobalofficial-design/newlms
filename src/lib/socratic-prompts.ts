import type { SkylentAiAction } from "./skylent-ai-api"

/** The four real modes of POST /lms/ai/ask (plus the free question, mode "ask"). Nothing else exists. */
export const QUICK: Array<{ action: SkylentAiAction; label: string }> = [
  { action: "explain", label: "Explain simpler" },
  { action: "example", label: "Give an example" },
  { action: "quiz", label: "Quiz me" },
  { action: "practice", label: "Practice question" },
]

export const TRACK_SOCRATIC_PROMPTS: Record<string, { label: string; question: string }> = {
  "data-analytics": {
    label: "Debug my SQL logic",
    question: "How should I verify my SQL join and aggregation logic on this lesson without giving me the final query?",
  },
  "product-management": {
    label: "Pressure-test my PRD scope",
    question: "What trade-offs or edge cases should I check in my product scope for this lesson without writing the memo for me?",
  },
  "python-programming": {
    label: "Check my Python edge cases",
    question: "What data-type or boundary edge cases should I test in my Python logic for this lesson without giving me the code?",
  },
  "data-science-ai": {
    label: "Check for data leakage",
    question: "How do I verify my feature engineering and validation split on this lesson to avoid data leakage?",
  },
  "generative-ai": {
    label: "Verify RAG grounding",
    question: "How should I evaluate retrieval grounding and citation accuracy for this lesson step?",
  },
  "full-stack-web": {
    label: "Audit API idempotency",
    question: "What request validation and idempotency checks should I verify for this backend/frontend step?",
  },
}

export function socraticQuickPromptsFor(
  courseSlug: string,
  lessonKind?: string | null,
  assessmentOpen = false,
): Array<{ action: SkylentAiAction; label: string; question?: string }> {
  const base: Array<{ action: SkylentAiAction; label: string; question?: string }> = QUICK.filter(
    (item) => !(assessmentOpen && item.action === "quiz"),
  )
  if (lessonKind === "assignment") {
    return [
      ...base,
      {
        action: "ask",
        label: "Check rubric criteria",
        question: "What are the key criteria my response should cover for this lesson, without writing the answer for me?",
      },
    ]
  }
  const trackPrompt = TRACK_SOCRATIC_PROMPTS[courseSlug]
  if (trackPrompt) {
    return [
      ...base,
      {
        action: "ask",
        label: trackPrompt.label,
        question: trackPrompt.question,
      },
    ]
  }
  return base
}
