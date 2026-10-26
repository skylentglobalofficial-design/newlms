/**
 * What the learner sees for an assignment.
 * A draft save is allowed only while the work is still open.
 * After a grade, the learner can revise and submit again, and that
 * revision does not send a draft save.
 */
export type AssignmentLearnerView = {
  statusLabel: string
  showEditor: boolean
  allowDraftSave: boolean
  allowResubmit: boolean
  showGrade: boolean
  summary: "editor" | "recorded" | "graded" | "unavailable"
}

export function assignmentLearnerView(status: string, revising: boolean): AssignmentLearnerView {
  if (status === "graded" && revising) {
    return {
      statusLabel: "Graded",
      showEditor: true,
      allowDraftSave: false,
      allowResubmit: true,
      showGrade: true,
      summary: "editor",
    }
  }
  if (status === "graded") {
    return {
      statusLabel: "Graded",
      showEditor: false,
      allowDraftSave: false,
      allowResubmit: true,
      showGrade: true,
      summary: "graded",
    }
  }
  if (status === "submitted") {
    return {
      statusLabel: "Submitted",
      showEditor: false,
      allowDraftSave: false,
      allowResubmit: false,
      showGrade: false,
      summary: "recorded",
    }
  }
  if (status === "in_progress" || status === "not_started") {
    return {
      statusLabel: status === "in_progress" ? "In progress" : "Not started",
      showEditor: true,
      allowDraftSave: true,
      allowResubmit: false,
      showGrade: false,
      summary: "editor",
    }
  }
  return {
    statusLabel: "Status unavailable",
    showEditor: false,
    allowDraftSave: false,
    allowResubmit: false,
    showGrade: false,
    summary: "unavailable",
  }
}

const assignmentTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})

export function formatAssignmentTimestamp(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return assignmentTime.format(date)
}

export function formatAssignmentGrade(grade: number | null): string | null {
  if (typeof grade !== "number" || !Number.isInteger(grade)) return null
  return `${grade} out of 100`
}
