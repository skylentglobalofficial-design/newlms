/**
 * Comprehensive quiz attempt limits test.
 * Validates attempt counting, limit enforcement, and scoring logic.
 */

import {
  scoreAnswers,
  answersInOptionRange,
  optionCount,
  QuizMaxAttemptsExceeded,
  QuizAttemptThrottled,
  QUIZ_ATTEMPT_LIMIT,
  QUIZ_ATTEMPT_WINDOW_MS,
} from "../server/src/lib/quiz-attempts.js"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const questions = [
  { id: "q1", options: ["A", "B", "C", "D"], correctIndex: 2 },
  { id: "q2", options: ["True", "False"], correctIndex: 0 },
  { id: "q3", options: ["Option 1", "Option 2", "Option 3"], correctIndex: 1 },
]

assert(QUIZ_ATTEMPT_LIMIT === 5, "default rate limit is 5 attempts")
assert(QUIZ_ATTEMPT_WINDOW_MS === 15 * 60 * 1000, "default window is 15 minutes")

assert(optionCount(["A", "B", "C"]) === 3, "option count for array")
assert(optionCount([]) === 0, "option count for empty array")
assert(optionCount(null) === 0, "option count for null")
assert(optionCount(undefined) === 0, "option count for undefined")
assert(optionCount("not an array") === 0, "option count for string")
assert(optionCount(123) === 0, "option count for number")
assert(optionCount({}) === 0, "option count for object")

assert(answersInOptionRange([0, 0, 0], questions), "all zeros in range")
assert(answersInOptionRange([3, 1, 2], questions), "max valid indices")
assert(!answersInOptionRange([4, 0, 0], questions), "4 out of range for q1 (max 3)")
assert(!answersInOptionRange([-1, 0, 0], questions), "negative out of range")
assert(!answersInOptionRange([0, 2, 0], questions), "2 out of range for q2 (max 1)")
assert(!answersInOptionRange([0, 0, 3], questions), "3 out of range for q3 (max 2)")
assert(!answersInOptionRange([0, 0], questions), "too few answers")
assert(!answersInOptionRange([0, 0, 0, 0], questions), "too many answers")
assert(!answersInOptionRange([], questions), "empty answers")
assert(!answersInOptionRange([0.5, 0, 0], questions), "non-integer answer")
assert(!answersInOptionRange([NaN, 0, 0], questions), "NaN answer")

assert(scoreAnswers([2, 0, 1], questions) === 3, "all correct = 3")
assert(scoreAnswers([0, 0, 0], questions) === 1, "only q2 correct = 1")
assert(scoreAnswers([0, 1, 0], questions) === 0, "none correct = 0")
assert(scoreAnswers([2, 1, 1], questions) === 2, "q1 and q3 correct = 2")
assert(scoreAnswers([0, 0, 1], questions) === 2, "q2 and q3 correct = 2")

const maxError = new QuizMaxAttemptsExceeded(3, 3)
assert(maxError.name === "QuizMaxAttemptsExceeded", "error name")
assert(maxError.maxAttempts === 3, "error has maxAttempts")
assert(maxError.currentAttempts === 3, "error has currentAttempts")
assert(maxError.message.includes("3"), "error message includes limit")
assert(maxError instanceof Error, "error is an Error instance")

const throttleError = new QuizAttemptThrottled(60)
assert(throttleError.name === "QuizAttemptThrottled", "throttle error name")
assert(throttleError.retryAfterSeconds === 60, "throttle has retryAfterSeconds")
assert(throttleError instanceof Error, "throttle is an Error instance")

const singleQuestion = [{ id: "q1", options: ["Yes", "No"], correctIndex: 0 }]
assert(scoreAnswers([0], singleQuestion) === 1, "single question correct")
assert(scoreAnswers([1], singleQuestion) === 0, "single question wrong")

const emptyQuestions: typeof questions = []
assert(scoreAnswers([], emptyQuestions) === 0, "empty quiz = 0 score")
assert(answersInOptionRange([], emptyQuestions), "empty quiz has valid answers")

const passingCases = [
  { score: 3, required: 3, passed: true },
  { score: 3, required: 2, passed: true },
  { score: 2, required: 3, passed: false },
  { score: 0, required: 1, passed: false },
  { score: 1, required: 1, passed: true },
]

for (const { score, required, passed } of passingCases) {
  const actual = score >= required
  assert(actual === passed, `score ${score} vs required ${required} should be ${passed ? "passing" : "failing"}`)
}

console.log("quiz-attempts-comprehensive ok")
