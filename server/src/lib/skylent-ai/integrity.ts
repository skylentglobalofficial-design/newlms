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
): string | null {
  const text = combinedLearnerText(question, history)
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
    },
  }
}
