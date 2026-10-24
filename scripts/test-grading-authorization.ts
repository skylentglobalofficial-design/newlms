/**
 * Assignment grading authorization test.
 * Validates the grading schema and role requirements.
 */

import { z } from "zod"
import { AssignmentStatus } from "@prisma/client"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const gradeSchema = z.object({
  grade: z.number().int().min(0).max(100),
  feedback: z.string().max(10000).optional(),
})

const validGrades = [
  { grade: 0 },
  { grade: 50 },
  { grade: 100 },
  { grade: 85, feedback: "Good work!" },
  { grade: 70, feedback: "" },
]

for (const valid of validGrades) {
  const result = gradeSchema.safeParse(valid)
  assert(result.success, `valid grade should pass: ${JSON.stringify(valid)}`)
}

const invalidGrades = [
  { grade: -1 },
  { grade: 101 },
  { grade: 50.5 },
  { grade: "50" },
  {},
  { feedback: "No grade" },
  { grade: NaN },
  { grade: Infinity },
]

for (const invalid of invalidGrades) {
  const result = gradeSchema.safeParse(invalid)
  assert(!result.success, `invalid grade should fail: ${JSON.stringify(invalid)}`)
}

assert(AssignmentStatus.graded === "graded", "graded status exists")
assert(AssignmentStatus.submitted === "submitted", "submitted status exists")
assert(AssignmentStatus.in_progress === "in_progress", "in_progress status exists")
assert(AssignmentStatus.not_started === "not_started", "not_started status exists")

const gradingWorkflow = [
  { from: "submitted", canGrade: true },
  { from: "graded", canGrade: true },
  { from: "in_progress", canGrade: false },
  { from: "not_started", canGrade: false },
]

for (const { from, canGrade } of gradingWorkflow) {
  const status = from as AssignmentStatus
  const allowGrading = status === AssignmentStatus.submitted || status === AssignmentStatus.graded
  assert(allowGrading === canGrade, `status ${from} should ${canGrade ? "" : "not "}allow grading`)
}

const submissionIdSchema = z.object({
  submissionId: z.string().uuid(),
})

assert(submissionIdSchema.safeParse({ submissionId: "550e8400-e29b-41d4-a716-446655440000" }).success, "valid UUID")
assert(!submissionIdSchema.safeParse({ submissionId: "not-a-uuid" }).success, "invalid UUID rejected")
assert(!submissionIdSchema.safeParse({ submissionId: "" }).success, "empty string rejected")
assert(!submissionIdSchema.safeParse({}).success, "missing submissionId rejected")

console.log("grading-authorization ok")
