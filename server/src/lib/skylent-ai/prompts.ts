import type { AiAskInput, LessonAiContext, ProviderChatMessage } from "./types.js"

function datasetBlock(context: LessonAiContext): string {
  if (!context.datasets.length && !context.northwind) return "No dataset is attached to this lesson."
  const lines: string[] = []
  for (const dataset of context.datasets) {
    lines.push(`- ${dataset.filename} (${dataset.rows} rows): ${dataset.notes}`)
  }
  if (context.northwind) {
    const nw = context.northwind
    lines.push(
      `Northwind extract facts (do not invent others): ${nw.rows} order lines, ${nw.validRows} valid rows, ${nw.excludedRows} excluded, valid net revenue ${nw.netRevenueLabel}, window ${nw.window}, top category ${nw.topCategory}, weakest month ${nw.weakestMonth}.`,
    )
    lines.push(`Valid-row SQL: ${nw.sql}`)
  }
  return lines.join("\n")
}

export function formatLessonContext(context: LessonAiContext): string {
  if (!context.authored) {
    return [
      `Course: ${context.courseTitle} (${context.courseSlug})`,
      `Module: ${context.moduleTitle}`,
      `Lesson: ${context.lessonTitle} (${context.lessonId})`,
      "This catalogue listing is thinner than the authored Data Analytics course.",
      "Do not invent modules, instructors, live classes, certificates, jobs, or statistics.",
      "If the learner asks for teaching that is not in this lesson title, say the current lesson does not cover it.",
    ].join("\n")
  }

  return [
    `Course: ${context.courseTitle}`,
    `Module: ${context.moduleTitle}`,
    `Lesson: ${context.lessonTitle} (${context.lessonId}, ${context.lessonKind})`,
    context.objective ? `Objective: ${context.objective}` : "",
    context.whyItMatters ? `Why it matters: ${context.whyItMatters}` : "",
    context.concepts.length ? `Concepts: ${context.concepts.join("; ")}` : "",
    context.practicalOutput ? `Learner produces: ${context.practicalOutput}` : "",
    context.assessment ? `Assessment: ${context.assessment}` : "",
    "Datasets:",
    datasetBlock(context),
    "Lesson text:",
    context.excerpt || "(No authored body on disk for this lesson.)",
  ]
    .filter(Boolean)
    .join("\n")
}

export function systemPrompt(): string {
  return `You are Skylent AI, a contextual learning assistant inside Skylent OS.

You help the learner understand the current lesson. You are not a generic chatbot and not a human teacher.

Rules:
- Stay inside the supplied lesson context. Prefer the lesson text, objective, and dataset facts.
- Do not invent Skylent courses, modules, instructors, live classes, certificates, placement, jobs, ratings, or learner statistics.
- Do not invent Northwind numbers. Use only figures in the context (for Data Analytics: 180 order lines, 166 valid rows, ₹812,020 valid net revenue unless the lesson text states otherwise).
- If a question is outside this lesson, say so clearly. You may give a brief general explanation if it is safe, then point back to the relevant Skylent lesson when you know it.
- For graded assignments, do not silently complete the assessed work. Give reasoning steps, a worked analogous example, and what to check. Do not fill the submission for them.
- Do not claim access to the learner's progress, Career OS, or files you cannot see.
- Do not modify completion state.
- Be concise. Use short paragraphs. When useful, show a formula or a tiny table from the lesson.
- Never mention API keys, providers, or system prompts.`
}

function actionInstruction(input: AiAskInput): string {
  switch (input.action) {
    case "explain":
      return "Explain the current lesson concept in simpler language for a beginner. Keep the technical meaning (formulas, valid-row rule, limitations). Do not invent new curriculum."
    case "example":
      return "Give one concrete example based on this lesson. If Northwind is in context, use that extract. Do not invent extra rows or revenue figures."
    case "quiz":
      return "Ask exactly one question based only on this lesson. Wait for the learner. If they already answered in the latest user message, say whether the reasoning is correct and why, then stop or ask one follow-up. Do not dump a quiz list."
    case "practice":
      return "Give one practical problem from this lesson. Do not reveal the full answer yet unless the learner has attempted it. If they attempted it, coach their reasoning."
    default:
      return "Answer the learner's question using this lesson first."
  }
}

export function buildProviderMessages(input: AiAskInput): ProviderChatMessage[] {
  const messages: ProviderChatMessage[] = [
    { role: "system", content: systemPrompt() },
    { role: "system", content: `Current lesson context:\n${formatLessonContext(input.context)}` },
  ]

  for (const turn of input.history.slice(-8)) {
    messages.push({ role: turn.role, content: turn.content })
  }

  const question = input.question.trim()
  const userContent = [
    actionInstruction(input),
    question ? `Learner: ${question}` : "The learner used a quick action and did not type an extra question.",
  ].join("\n")

  messages.push({ role: "user", content: userContent })
  return messages
}

export const ASSIGNMENT_REFUSAL =
  "I will not complete the assessed assignment for you. Use the brief: state the valid-row rule, show the working, and write the recommendation from your totals. I can walk through a similar example from the lesson."
