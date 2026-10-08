import type { AcademicPolicy, ChatTurn, LessonAiContext } from "./types.js"
import { assignmentRefusalFor } from "./prompts.js"

const QUIZ_SOLUTION =
  /\b(correct option|correct answer|answer key|hidden solution|current answer|which option|option [a-d]|solve (this|the) (current )?(question|quiz)|what should i (pick|select|choose)|tell me the answer|the right (answer|option))\b/i

const SUBMISSION_READY =
  /\b(submission-ready|final assignment|hidden solution|write (my|the) (final )?(assignment|memo|submission|capstone|research note)|complete (my|the) assignment|do (my|the) assignment|paste[- ]ready|here is (the|your) (full |final )?(answer|submission|memo))\b/i

export function deriveAcademicPolicy(input: {
  lessonKind: string
  complete: boolean
  quizPassed: boolean
  assignmentSubmitted: boolean
}): AcademicPolicy {
  const kind = input.lessonKind.toLowerCase()
  if (kind === "quiz") {
    return input.quizPassed || input.complete ? "post_assessment" : "open_quiz"
  }
  if (kind === "assignment") {
    return input.assignmentSubmitted || input.complete ? "post_assessment" : "open_assignment"
  }
  return "lesson"
}

export function combinedLearnerText(question: string, history: ChatTurn[]): string {
  const prior = history
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.content)
    .join(" ")
  return `${question} ${prior}`.trim()
}

/**
 * Server-owned refusal. Returns null when the provider may be called.
 * Client history is only scanned for the learner's own words.
 */
export function academicIntegrityRefusal(
  policy: AcademicPolicy,
  question: string,
  history: ChatTurn[],
  context: LessonAiContext,
  quizGuard?: { question: string; options: string[] }[],
): string | null {
  const text = combinedLearnerText(question, history)
  if (policy === "open_quiz" && quizGuard && looksLikePastedQuizQuestion(text, quizGuard)) {
    return OPEN_QUIZ_REFUSAL
  }
  if (policy === "open_quiz" && QUIZ_SOLUTION.test(text)) {
    return "I will not give the current quiz answer, the correct option, or the answer key. Explain the concept in your own words, then try the question."
  }
  if (policy === "open_assignment" && (SUBMISSION_READY.test(text) || /\b(exact answer|answer to (this|my|the) assignment)\b/i.test(text))) {
    return assignmentRefusalFor(context)
  }
  if ((policy === "open_quiz" || policy === "post_assessment") && /\b(answer key|correctindex|hidden solution)\b/i.test(text)) {
    return "I will not reveal graded answer keys. I can review the concept, a similar practice question, or what to study next."
  }
  return null
}

/** Drop grading secrets and withheld lab results before any provider prompt is built. */
export function redactPrivilegedAssessmentContext(
  context: LessonAiContext,
  policy: AcademicPolicy,
): LessonAiContext {
  if (policy !== "open_quiz" && policy !== "open_assignment") return context
  if (!context.northwind) return context
  return {
    ...context,
    northwind: {
      ...context.northwind,
      sql: "",
      withheld: true,
    },
  }
}

export const OPEN_QUIZ_REFUSAL =
  "This quiz is still open, so I will not answer its questions or say which option is correct. I can explain the concept behind it or give you a similar practice question."

function tokens(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9% ]+/g, " ").split(/\s+/).filter((word) => word.length > 2)
}

/**
 * True when the learner's text repeats an open quiz question (most of its words) or lists
 * two or more of one question's options. The quiz rows are used for matching only.
 */
export function looksLikePastedQuizQuestion(
  text: string,
  quiz: { question: string; options: string[] }[],
): boolean {
  const said = new Set(tokens(text))
  if (said.size === 0) return false
  const lower = ` ${text.toLowerCase().replace(/\s+/g, " ")} `
  for (const row of quiz) {
    const words = [...new Set(tokens(row.question))]
    if (words.length >= 4) {
      const hit = words.filter((word) => said.has(word)).length
      if (hit / words.length >= 0.6) return true
    }
    const optionHits = row.options.filter((option) => {
      const clean = option.toLowerCase().replace(/\s+/g, " ").trim()
      return clean.length >= 4 && lower.includes(clean)
    }).length
    if (optionHits >= 2) return true
  }
  return false
}

/** In an open assessment only the learner's own turns are forwarded; assistant turns from the client are dropped. */
export function historyForPolicy(history: ChatTurn[], policy: AcademicPolicy): ChatTurn[] {
  if (policy !== "open_quiz" && policy !== "open_assignment") return history
  return history.filter((turn) => turn.role === "user").slice(-4)
}

/** True when an answer written during an open assessment states a withheld Northwind result. */
export function answerLeaksWithheldResult(answer: string, original: LessonAiContext, policy: AcademicPolicy): boolean {
  if (policy !== "open_quiz" && policy !== "open_assignment") return false
  const nw = original.northwind
  if (!nw) return false
  const flat = answer.replace(/[\s,]/g, "").toLowerCase()
  const revenueDigits = nw.netRevenueLabel.replace(/[^0-9]/g, "")
  if (revenueDigits.length >= 4 && flat.includes(revenueDigits)) return true
  if (new RegExp(`\\b${nw.validRows}\\s+(valid|rows)`, "i").test(answer)) return true
  if (nw.sql && answer.replace(/\s+/g, " ").includes(nw.sql.replace(/\s+/g, " ").slice(0, 60))) return true
  return false
}
