export type DiagnosticQuestion = {
  id: string
  track: "data" | "product" | "ai"
  title: string
  scenario: string
  options: Array<{
    id: string
    label: string
    isOptimal: boolean
    explanation: string
  }>
}

export const SKILL_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "q-sql-grain",
    track: "data",
    title: "SQL & Data Pipeline Diagnostic",
    scenario: "You join an orders table (1,000 rows) with an order_items table (3,500 rows) on order_id. The raw sum of order_total in the joined result is 3x higher than expected. What is the fundamental issue?",
    options: [
      {
        id: "opt-fanout",
        label: "1:N Join Fan-Out: Order header totals are duplicated across multiple item rows",
        isOptimal: true,
        explanation: "Correct. A 1:N join duplicates parent header columns for every child row. You must aggregate order_items at the order level first or calculate item-level line totals.",
      },
      {
        id: "opt-inner",
        label: "INNER JOIN was used instead of LEFT JOIN",
        isOptimal: false,
        explanation: "Incorrect. An INNER JOIN filters unmatched rows; it does not inflate totals by duplicating parent rows.",
      },
      {
        id: "opt-index",
        label: "Missing database primary key index on order_id",
        isOptimal: false,
        explanation: "Incorrect. Indexing impacts query execution speed, not the numerical result of row duplication.",
      },
    ],
  },
  {
    id: "q-pm-triage",
    track: "product",
    title: "Product Scoping & Triage Diagnostic",
    scenario: "Harbor Retail store managers complain that weekend order exceptions get lost. Leadership demands 'Build an AI assistant for store managers'. You have 2 engineers and 6 weeks. What is the correct PRD first step?",
    options: [
      {
        id: "opt-triage",
        label: "Map the exact exception owner and handoff SLA before proposing any AI or software UI",
        isOptimal: true,
        explanation: "Correct. 'AI assistant' is an unvalidated solution. You must isolate who struggles, why weekend handoffs fail, and establish the operational owner first.",
      },
      {
        id: "opt-build-llm",
        label: "Fine-tune an open-source LLM on previous customer support tickets immediately",
        isOptimal: false,
        explanation: "Incorrect. This violates the 6-week constraint and solves for a solution rather than understanding the root cause.",
      },
      {
        id: "opt-whatsapp",
        label: "Create a shared WhatsApp group for all 12 store managers",
        isOptimal: false,
        explanation: "Incorrect. WhatsApp groups lack accountability, audit trails, and create worse operational confusion.",
      },
    ],
  },
  {
    id: "q-ai-rag",
    track: "ai",
    title: "Python & GenAI Systems Diagnostic",
    scenario: "In an enterprise RAG system, your LLM answers questions using obsolete internal policies not found in retrieved chunks. What architectural guardrail resolves this?",
    options: [
      {
        id: "opt-grounding",
        label: "Enforce strict citation grounding and refuse answers without verified source chunk attribution",
        isOptimal: true,
        explanation: "Correct. An attribution citation gate ensures the generator is bound to retrieved evidence and triggers an honest refusal when chunks lack the required facts.",
      },
      {
        id: "opt-temperature",
        label: "Set model temperature to 0.0 without changing prompt or retrieval pipeline",
        isOptimal: false,
        explanation: "Incorrect. Lowering temperature makes generation deterministic but does not prevent the model from retrieving internal parametric memory.",
      },
      {
        id: "opt-bigger-model",
        label: "Switch to a 10x larger model checkpoint",
        isOptimal: false,
        explanation: "Incorrect. Larger models still hallucinate ungrounded facts if the retrieval-citation contract is missing.",
      },
    ],
  },
]

export type DiagnosticResult = {
  scorePercent: number
  percentile: string
  readinessTier: "Industry Ready (Top 8%)" | "Strong Practical Foundation" | "Foundational (Recommended: Module 1)"
  correctCount: number
  totalQuestions: number
  recommendedCourseSlug: string
  recommendedCourseTitle: string
  recommendedModule: string
  gapsIdentified: string[]
}

export function evaluateSkillDiagnostic(answers: Record<string, string>): DiagnosticResult {
  let optimal = 0
  const gaps: string[] = []

  for (const q of SKILL_DIAGNOSTIC_QUESTIONS) {
    const selected = answers[q.id]
    const opt = q.options.find((o) => o.id === selected)
    if (opt?.isOptimal) {
      optimal += 1
    } else {
      gaps.push(q.title.replace(" Diagnostic", ""))
    }
  }

  const scorePercent = Math.round((optimal / SKILL_DIAGNOSTIC_QUESTIONS.length) * 100)

  if (scorePercent === 100) {
    return {
      scorePercent,
      percentile: "92nd Percentile (Top 8%)",
      readinessTier: "Industry Ready (Top 8%)",
      correctCount: optimal,
      totalQuestions: SKILL_DIAGNOSTIC_QUESTIONS.length,
      recommendedCourseSlug: "data-analytics",
      recommendedCourseTitle: "Data Analytics with Gen AI",
      recommendedModule: "Module 3 · Multi-Table Joins & Commercial Modeling",
      gapsIdentified: gaps,
    }
  }

  if (scorePercent >= 66) {
    return {
      scorePercent,
      percentile: "74th Percentile",
      readinessTier: "Strong Practical Foundation",
      correctCount: optimal,
      totalQuestions: SKILL_DIAGNOSTIC_QUESTIONS.length,
      recommendedCourseSlug: gaps.some(g => g.includes("Product Scoping")) ? "product-management" : "data-analytics",
      recommendedCourseTitle: gaps.some(g => g.includes("Product Scoping")) ? "Product Management" : "Data Analytics",
      recommendedModule: "Module 2 · Triage, Clean Datasets & Metrics",
      gapsIdentified: gaps,
    }
  }

  return {
    scorePercent,
    percentile: "45th Percentile",
    readinessTier: "Foundational (Recommended: Module 1)",
    correctCount: optimal,
    totalQuestions: SKILL_DIAGNOSTIC_QUESTIONS.length,
    recommendedCourseSlug: "data-analytics",
    recommendedCourseTitle: "Data Analytics Foundations",
    recommendedModule: "Module 1 · Foundations, Net Revenue & Problem Framing",
    gapsIdentified: gaps.length ? gaps : ["Core Analytical Framing"],
  }
}
