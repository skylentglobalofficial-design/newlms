import { useState } from "react"
import { Link } from "react-router-dom"
import {
  assignmentLearnerView,
  formatAssignmentGrade,
  formatAssignmentTimestamp,
} from "../../lib/assignment-flow"

export type AssignmentRecord = {
  status: string
  responseText: string
  grade: number | null
  feedback: string | null
  gradedAt: string | null
  submittedAt: string | null
}

export function AssignmentResponse({
  record,
  subtitle,
  completionNote,
  onDraft,
  onSubmit,
}: {
  record: AssignmentRecord | null
  subtitle: string
  completionNote: string
  onDraft?: (text: string) => void
  onSubmit: (text: string) => Promise<boolean>
}) {
  const [revising, setRevising] = useState(false)

  if (!record) {
    return (
      <div className="lx-submitted" role="status" aria-live="polite">
        <p className="lx-assignment-status">Loading</p>
        <p className="dash-empty-copy">Loading this assignment.</p>
      </div>
    )
  }

  const view = assignmentLearnerView(record.status, revising)
  const gradeLabel = view.showGrade ? formatAssignmentGrade(record.grade) : null
  const feedback = view.showGrade ? record.feedback?.trim() ?? "" : ""
  const gradedWhen = view.showGrade ? formatAssignmentTimestamp(record.gradedAt) : null
  const submittedWhen = formatAssignmentTimestamp(record.submittedAt)

  if (view.showEditor) {
    return (
      <AssignmentEditor
        statusLabel={view.statusLabel}
        subtitle={
          view.allowResubmit
            ? "Revise the work below, then submit it. A draft is not saved. The current grade is cleared when the revision is submitted."
            : subtitle
        }
        initialText={record.responseText}
        allowDraft={view.allowDraftSave}
        submitLabel={view.allowResubmit ? "Submit revision" : "Submit assignment"}
        gradeLabel={gradeLabel}
        feedback={feedback}
        onDraft={onDraft}
        onCancel={view.allowResubmit ? () => setRevising(false) : undefined}
        onSubmit={async (text) => {
          const saved = await onSubmit(text)
          if (saved) setRevising(false)
          return saved
        }}
      />
    )
  }

  return (
    <div className="lx-submitted" aria-live="polite">
      <p className="lx-assignment-status" role="status">{view.statusLabel}</p>
      <h2>{summaryHeading(view.summary)}</h2>
      {gradeLabel ? <p className="lx-assignment-grade">Grade: {gradeLabel}</p> : null}
      {feedback ? <p className="lx-assignment-feedback">{feedback}</p> : null}
      {gradedWhen ? <p className="as-fine">Graded {gradedWhen} IST</p> : null}
      {view.summary === "graded" ? (
        <p className="dash-empty-copy">
          You can revise this submission. The current grade is cleared when the new submission is saved.
        </p>
      ) : null}
      {view.summary === "unavailable" ? (
        <p className="dash-empty-copy">
          The assignment status could not be loaded. Refresh this page before changing the submission.
        </p>
      ) : null}
      {view.summary === "recorded" ? <p className="dash-empty-copy">{completionNote}</p> : null}
      {view.summary === "recorded" && submittedWhen ? (
        <p className="as-fine">Submitted {submittedWhen} IST</p>
      ) : null}
      <h3 className="lx-assignment-response-label">Your submission</h3>
      <div className="lx-assignment-response">
        {record.responseText.trim() ? record.responseText : "No written response is stored."}
      </div>
      {view.allowResubmit ? (
        <div className="lx-assignment-actions">
          <button type="button" className="os-btn os-btn-primary" onClick={() => setRevising(true)}>
            Revise and resubmit
          </button>
        </div>
      ) : view.summary === "recorded" ? (
        <Link className="os-link" to="/career-os/projects">
          Open Career OS Projects
        </Link>
      ) : null}
    </div>
  )
}

function summaryHeading(summary: "recorded" | "graded" | "unavailable" | "editor") {
  if (summary === "graded") return "This submission has a grade"
  if (summary === "unavailable") return "Assignment status could not be loaded"
  return "Submission recorded"
}

function AssignmentEditor({
  statusLabel,
  subtitle,
  initialText,
  allowDraft,
  submitLabel,
  gradeLabel,
  feedback,
  onDraft,
  onCancel,
  onSubmit,
}: {
  statusLabel: string
  subtitle: string
  initialText: string
  allowDraft: boolean
  submitLabel: string
  gradeLabel: string | null
  feedback: string
  onDraft?: (text: string) => void
  onCancel?: () => void
  onSubmit: (text: string) => Promise<boolean>
}) {
  const [text, setText] = useState(initialText)
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="lms-assignment-workspace as-block">
      <p className="lx-assignment-status" role="status">{statusLabel}</p>
      {gradeLabel ? <p className="lx-assignment-grade">Current grade: {gradeLabel}</p> : null}
      {feedback ? <p className="lx-assignment-feedback">{feedback}</p> : null}
      <p className="dash-empty-copy">{subtitle}</p>
      {allowDraft ? (
        <p className="dash-empty-copy" style={{ marginTop: 8 }}>
          Document your approach, include queries or calculations, and explain assumptions.
        </p>
      ) : null}
      <h3>Your submission</h3>
      <label className="sr-only" htmlFor="assignment-response">Assignment response</label>
      <textarea
        id="assignment-response"
        value={text}
        onChange={(event) => {
          const next = event.target.value
          setText(next)
          if (allowDraft) onDraft?.(next)
        }}
        placeholder="Paste your work here"
      />
      <div className="lx-assignment-actions">
        <button
          type="button"
          className="os-btn os-btn-primary"
          disabled={!text.trim() || submitting}
          onClick={() => {
            if (!text.trim() || submitting) return
            setSubmitting(true)
            void onSubmit(text).finally(() => setSubmitting(false))
          }}
        >
          {submitting ? "Submitting…" : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="os-btn os-btn-ghost" onClick={onCancel} disabled={submitting}>
            Keep the graded submission
          </button>
        ) : null}
      </div>
    </div>
  )
}
