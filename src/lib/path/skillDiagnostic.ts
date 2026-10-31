/**
 * Phase P12: 90-Second Adaptive Skill Diagnostic & Percentile Benchmark (/path).
 * Evaluates practical reasoning across SQL/Data, Product Scoping, and Python/GenAI Systems
 * before enrolment (inspired by CodeSignal / DataCamp Signal).
 */

export type DiagnosticQuestion = {
  id: string
  domain: "data" | "product" | "ai_engineering"
  domainLabel: string
  prompt: string
  codeOrContext: string
  options: ReadonlyArray<{
    id: string
    label: string
    isCorrect: boolean
    feedback: string
  }>
}

export const SKILL_DIAGNOSTIC_QUESTIONS: readonly DiagnosticQuestion[] = [
  {
    id: "q-sql-grain",
    domain: "data",
    domainLabel: "Data Analytics & SQL",
    prompt: "You run a LEFT JOIN from `orders` (166 valid rows) to `refund_events` (where 1 order can have 2 partial refund rows). `SUM(orders.net_revenue)` jumps by 18%. Why?",
    codeOrContext: "SELECT SUM(o.net_revenue) FROM orders o LEFT JOIN refund_events r ON o.order_id = r.order_id;",
    options: [
      {
        id: "fanout",
        label: "One-to-many join fan-out duplicated parent order rows before aggregation",
        isCorrect: true,
        feedback: "Exact match: pre-aggregating `refund_events` by `order_id` in a CTE preserves the 1-row-per-order grain.",
      },
      {
        id: "nulls",
        label: "LEFT JOIN converts NULL refund amounts into positive revenue",
        isCorrect: false,
        feedback: "NULLs on the right table do not increase `o.net_revenue`; row multiplication from 1:N joins does.",
      },
      {
        id: "index",
        label: "Missing primary key index on `refund_events` caused duplicate table scans",
        isCorrect: false,
        feedback: "Indexes affect query speed, not the mathematical result of `SUM(o.net_revenue)`.",
      },
    ],
  },
  {
    id: "q-pm-triage",
    domain: "product",
    domainLabel: "Product Management & Scoping",
    prompt: "Harbor Retail has 9 weekend delivery exceptions per week across 12 stores, and 3 go unlogged in WhatsApp threads. You have 2 engineers for 6 weeks and cannot replace their ERP. What is your highest-leverage bet?",
    codeOrContext: "Constraint: 2 engineers · 6 weeks · No ERP replacement · Goal: Eliminate unlogged weekend exceptions",
    options: [
      {
        id: "erp",
        label: "Build a full custom warehouse & inventory ERP with automated vendor EDI",
        isCorrect: false,
        feedback: "Violates the 2-engineer, 6-week constraint and attempts an ERP rewrite.",
      },
      {
        id: "triage-queue",
        label: "Ship a mobile-first Weekend Exception Triage Queue with mandatory photo/SKU logging & 4-hour SLA alerts",
        isCorrect: true,
        feedback: "Exact match: solves the 3 unlogged exceptions within the 2-engineer, 6-week constraint without touching the ERP.",
      },
      {
        id: "survey",
        label: "Run a 6-week NPS survey across all 12 store managers before writing any spec",
        isCorrect: false,
        feedback: "Spends the entire 6-week engineering window on surveys when observational data already exists.",
      },
    ],
  },
  {
    id: "q-ai-rag",
    domain: "ai_engineering",
    domainLabel: "Python, Data Science & GenAI Systems",
    prompt: "Your enterprise RAG assistant answers refund policy questions with 94% fluency, but fabricates a '30-day unconditional refund' rule when retrieving outdated 2023 chunks. What fixes the root cause?",
    codeOrContext: "Pipeline: Hybrid Retriever (top_k=8) → LLM Generator → Customer Response",
    options: [
      {
        id: "temperature",
        label: "Increase LLM temperature from 0.1 to 0.9 so it considers more policy interpretations",
        isCorrect: false,
        feedback: "Higher temperature increases hallucination variance; it does not filter stale chunks.",
      },
      {
        id: "metadata-citation",
        label: "Enforce `effective_date` metadata filtering in retrieval + mandatory `[doc_id]` citation verification gate",
        isCorrect: true,
        feedback: "Exact match: filtering deprecated chunks at retrieval and verifying inline citations blocks ungrounded policy claims.",
      },
      {
        id: "prompt-length",
        label: "Remove system prompt constraints so the model replies faster",
        isCorrect: false,
        feedback: "Removing citation guardrails worsens ungrounded policy fabrication.",
      },
    ],
  },
] as const

export type DiagnosticEvaluation = {
  answeredCount: number
  correctCount: number
  scorePercent: number
  percentileEstimate: number
  readinessTier: "Foundation Builder" | "Execution Ready" | "Fast-Track Capstone"
  strongestDomain: string
  gapSummary: string
  recommendedCourse: {
    slug: string
    title: string
    startModule: string
    href: string
  }
}

export function evaluateSkillDiagnostic(answers: Record<string, string>): DiagnosticEvaluation {
  let answeredCount = 0
  let correctCount = 0
  const domainCorrect: Record<"data" | "product" | "ai_engineering", boolean> = {
    data: false,
    product: false,
    ai_engineering: false,
  }

  for (const q of SKILL_DIAGNOSTIC_QUESTIONS) {
    const chosenId = answers[q.id]
    if (!chosenId) continue
    answeredCount += 1
    const opt = q.options.find((o) => o.id === chosenId)
    if (opt?.isCorrect) {
      correctCount += 1
      domainCorrect[q.domain] = true
    }
  }

  const scorePercent = Math.round((correctCount / SKILL_DIAGNOSTIC_QUESTIONS.length) * 100)
  const percentileEstimate =
    correctCount === 3 ? 92 : correctCount === 2 ? 74 : correctCount === 1 ? 45 : 22
  const readinessTier =
    correctCount === 3
      ? "Fast-Track Capstone"
      : correctCount === 2
        ? "Execution Ready"
        : "Foundation Builder"

  if (!domainCorrect.data) {
    return {
      answeredCount,
      correctCount,
      scorePercent,
      percentileEstimate,
      readinessTier,
      strongestDomain: domainCorrect.product
        ? "Product Scoping"
        : domainCorrect.ai_engineering
          ? "Python & GenAI Systems"
          : " analytical foundations",
      gapSummary:
        "Join grain & commercial SQL validation gap detected — start with Data Analytics (Module 3: SQL Joins & Data-Quality Checks).",
      recommendedCourse: {
        slug: "data-analytics",
        title: "Data Analytics (Northwind SQL Lab)",
        startModule: "Module 3 · SQL Joins, CTEs & Grain Audits",
        href: "/courses/data-analytics",
      },
    }
  }

  if (!domainCorrect.product) {
    return {
      answeredCount,
      correctCount,
      scorePercent,
      percentileEstimate,
      readinessTier,
      strongestDomain: "Data Analytics & SQL",
      gapSummary:
        "Constrained product scoping & PRD trade-off gap detected — start with Product Management (Harbor Desk Case).",
      recommendedCourse: {
        slug: "product-management",
        title: "Product Management (Harbor Desk Case)",
        startModule: "Module 4 · Choosing One Bet Under Constraints",
        href: "/courses/product-management",
      },
    }
  }

  if (!domainCorrect.ai_engineering) {
    return {
      answeredCount,
      correctCount,
      scorePercent,
      percentileEstimate,
      readinessTier,
      strongestDomain: "Data & Product Execution",
      gapSummary:
        "Grounded RAG retrieval & citation verification gap detected — start with Generative AI & LLM Systems.",
      recommendedCourse: {
        slug: "generative-ai",
        title: "Generative AI & LLM Systems",
        startModule: "Module 2 · Grounded RAG & Citation Verification",
        href: "/courses/generative-ai",
      },
    }
  }

  return {
    answeredCount,
    correctCount,
    scorePercent,
    percentileEstimate,
    readinessTier,
    strongestDomain: "Full-Spectrum Data, Product & AI",
    gapSummary:
      "3/3 benchmark passed (Top 8% cohort readiness) — you are ready to tackle our advanced Capstone Studios & AI Systems tracks.",
    recommendedCourse: {
      slug: "generative-ai",
      title: "Generative AI & LLM Systems",
      startModule: "Module 5 · Enterprise RAG & Agent Capstone Studio",
      href: "/courses/generative-ai",
    },
  }
}
