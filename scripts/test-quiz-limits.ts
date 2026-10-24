/**
 * Quiz attempt limits logic test.
 * Tests the scoring and limit checking functions without database.
 */

import {
  scoreAnswers,
  answersInOptionRange,
  optionCount,
  QuizMaxAttemptsExceeded,
} from "../server/src/lib/quiz-attempts.js"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const questions = [
  { id: "q1", options: ["A", "B", "C", "D"], correctIndex: 2 },
  { id: "q2", options: ["True", "False"], correctIndex: 0 },
  { id: "q3", options: ["Option 1", "Option 2", "Option 3"], correctIndex: 1 },
]

assert(optionCount(["A", "B", "C"]) === 3, "option count for array")
assert(optionCount(null) === 0, "option count for null")
assert(optionCount("not an array") === 0, "option count for non-array")

assert(answersInOptionRange([0, 0, 0], questions), "all zeros in range")
assert(answersInOptionRange([3, 1, 2], questions), "max indices in range")
assert(!answersInOptionRange([4, 0, 0], questions), "4 out of range for q1")
assert(!answersInOptionRange([-1, 0, 0], questions), "negative out of range")
assert(!answersInOptionRange([0, 0], questions), "wrong answer count")
assert(!answersInOptionRange([0, 0, 0, 0], questions), "too many answers")

assert(scoreAnswers([2, 0, 1], questions) === 3, "all correct")
assert(scoreAnswers([0, 0, 0], questions) === 1, "one correct (q2)")
assert(scoreAnswers([0, 1, 0], questions) === 0, "none correct")

const error = new QuizMaxAttemptsExceeded(3, 3)
assert(error.maxAttempts === 3, "error has maxAttempts")
assert(error.currentAttempts === 3, "error has currentAttempts")
assert(error.message.includes("3"), "error message includes limit")

console.log("quiz-limits ok")
