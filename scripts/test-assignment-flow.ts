import {
  assignmentLearnerView,
  formatAssignmentGrade,
  formatAssignmentTimestamp,
} from "../src/lib/assignment-flow.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const open = assignmentLearnerView("not_started", false)
assert(open.statusLabel === "Not started", "A new assignment is not started")
assert(open.showEditor && open.allowDraftSave && !open.allowResubmit, "A new assignment can be drafted")

const drafting = assignmentLearnerView("in_progress", false)
assert(drafting.statusLabel === "In progress", "An open assignment is in progress")
assert(drafting.showEditor && drafting.allowDraftSave && !drafting.allowResubmit, "An open assignment can be drafted")

const submitted = assignmentLearnerView("submitted", false)
assert(submitted.statusLabel === "Submitted", "A submitted assignment says submitted")
assert(!submitted.showEditor && !submitted.allowDraftSave && !submitted.allowResubmit, "A submitted assignment has no editor and no draft")
assert(submitted.summary === "recorded", "A submitted assignment keeps the recorded summary")

const submittedWhileRevisingFlag = assignmentLearnerView("submitted", true)
assert(
  !submittedWhileRevisingFlag.showEditor && !submittedWhileRevisingFlag.allowDraftSave,
  "A revising flag must not reopen a submitted assignment",
)

const graded = assignmentLearnerView("graded", false)
assert(graded.statusLabel === "Graded", "A graded assignment says graded")
assert(!graded.showEditor && !graded.allowDraftSave && graded.allowResubmit && graded.showGrade, "A graded assignment can be resubmitted without a draft")
assert(graded.summary === "graded", "A graded assignment shows the grade summary")

const revising = assignmentLearnerView("graded", true)
assert(revising.showEditor && !revising.allowDraftSave && revising.allowResubmit && revising.showGrade, "Revising a grade does not send a draft")
assert(revising.statusLabel === "Graded", "A revision still shows the graded status until it is submitted")

const missing = assignmentLearnerView("unavailable", false)
assert(missing.summary === "unavailable" && !missing.showEditor && !missing.allowDraftSave && !missing.allowResubmit, "An unknown status does not open the editor")

assert(formatAssignmentGrade(80) === "80 out of 100", "A grade is shown out of 100")
assert(formatAssignmentGrade(0) === "0 out of 100", "A zero grade is shown")
assert(formatAssignmentGrade(null) === null, "A missing grade is omitted")
assert(formatAssignmentGrade(80.5) === null, "A fractional grade is omitted")

const gradedAt = formatAssignmentTimestamp("2026-10-26T06:30:00.000Z")
assert(gradedAt === "26 Oct 2026, 12:00 pm", `Expected 26 Oct 2026, 12:00 pm IST, got ${gradedAt}`)
assert(formatAssignmentTimestamp(null) === null, "A missing time is omitted")
assert(formatAssignmentTimestamp("not-a-date") === null, "An invalid time is omitted")

console.log("Assignment learner flow checks passed.")
