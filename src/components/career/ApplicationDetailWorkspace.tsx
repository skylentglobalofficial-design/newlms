import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { GlassSurface } from "../foundation"
import type { ApplicationEvent, InterviewRound, JobApplication, JobApplicationStatus } from "../../lib/career-api"
import {
  deleteApplication,
  fetchApplication,
  listApplicationEvents,
  listInterviewRounds,
  updateApplication,
} from "../../lib/career-api"
import ApplicationTimeline from "./ApplicationTimeline"
import {
  applicationEmployerName,
  applicationLocation,
  applicationRoleTitle,
  applicationWorkMode,
  formatApplicationDate,
  formatApplicationDateTime,
  formatStatusLabel,
  getNextStatuses,
} from "./application-utils"
import { formatWorkMode } from "./job-utils"
import { formatInterviewDateTime, formatRoundStatus, formatRoundType } from "./interview-utils"
import {
  FeedbackBanner,
  Field,
  dangerButtonStyle,
  fieldInputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "./section-ui"

const accent = getDomainAccent("career")

type Props = {
  applicationId: string
}

export default function ApplicationDetailWorkspace({ applicationId }: Props) {
  const navigate = useNavigate()
  const [application, setApplication] = useState<JobApplication | null>(null)
  const [events, setEvents] = useState<ApplicationEvent[]>([])
  const [interviewRounds, setInterviewRounds] = useState<InterviewRound[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusPending, setStatusPending] = useState(false)
  const [savePending, setSavePending] = useState(false)
  const [deletePending, setDeletePending] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState("")
  const [nextActionAt, setNextActionAt] = useState("")
  const [source, setSource] = useState("")

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [app, evts, rounds] = await Promise.all([
        fetchApplication(applicationId),
        listApplicationEvents(applicationId),
        listInterviewRounds(),
      ])
      setApplication(app)
      setEvents(evts)
      setInterviewRounds(rounds.filter(r => r.applicationId === applicationId))
      setNotes(app.notes ?? "")
      setSource(app.source ?? "")
      setNextActionAt(app.nextActionAt ? app.nextActionAt.slice(0, 16) : "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load application")
      setApplication(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [applicationId])

  async function handleStatusChange(next: JobApplicationStatus) {
    if (!application) return
    setStatusPending(true)
    setFeedback(null)
    try {
      const updated = await updateApplication(application.id, { status: next })
      setApplication(updated)
      setFeedback({ tone: "success", message: `Status updated to ${formatStatusLabel(next)}.` })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Status update rejected" })
    } finally {
      setStatusPending(false)
    }
  }

  async function handleSaveFields() {
    if (!application) return
    setSavePending(true)
    setFeedback(null)
    try {
      const updated = await updateApplication(application.id, {
        notes: notes.trim() || null,
        source: source.trim() || null,
        nextActionAt: nextActionAt ? new Date(nextActionAt).toISOString() : null,
      })
      setApplication(updated)
      setEditing(false)
      setFeedback({ tone: "success", message: "Application updated." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to update application" })
    } finally {
      setSavePending(false)
    }
  }

  async function handleDelete() {
    if (!application || !window.confirm("Delete this application? This cannot be undone.")) return
    setDeletePending(true)
    setFeedback(null)
    try {
      await deleteApplication(application.id)
      navigate("/career-os/applications")
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to delete application" })
      setDeletePending(false)
    }
  }

  if (loading) {
    return <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>Loading application…</p>
  }

  if (error || !application) {
    return (
      <div style={{ maxWidth: 520 }}>
        <FeedbackBanner tone="error" message={error ?? "Application not found"} />
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <button type="button" onClick={() => void load()} style={secondaryButtonStyle}>Retry</button>
          <Link to="/career-os/applications" style={{ color: accent.text, fontSize: 13, textDecoration: "none", alignSelf: "center" }}>
            Back to applications
          </Link>
        </div>
      </div>
    )
  }

  const role = applicationRoleTitle(application)
  const employer = applicationEmployerName(application)
  const location = applicationLocation(application)
  const workMode = applicationWorkMode(application)
  const nextStatuses = getNextStatuses(application.status)

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", minWidth: 0 }}>
      <Link to="/career-os/applications" style={{ display: "inline-block", marginBottom: 16, color: accent.text, fontSize: 13, textDecoration: "none" }}>
        ← Applications
      </Link>

      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      <GlassSurface level={2} padding="22px" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, color: C.white, wordBreak: "break-word" }}>
              {role}
            </h1>
            {employer && (
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, wordBreak: "break-word" }}>{employer}</div>
            )}
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 6, wordBreak: "break-word" }}>
              {[location, workMode, application.job?.employmentType?.replace("_", " ")].filter(Boolean).join(" · ")}
            </div>
          </div>
          <span style={{
            padding: "6px 12px",
            borderRadius: 100,
            border: `1px solid ${accent.border}`,
            background: accent.subtle,
            color: accent.text,
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {formatStatusLabel(application.status)}
          </span>
        </div>

        <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 14, margin: "20px 0 0" }}>
          {formatApplicationDate(application.appliedAt) && (
            <div>
              <dt style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Applied</dt>
              <dd style={{ margin: 0, color: C.white, fontSize: 13.5 }}>{formatApplicationDate(application.appliedAt)}</dd>
            </div>
          )}
          {formatApplicationDate(application.nextActionAt) && (
            <div>
              <dt style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Next action</dt>
              <dd style={{ margin: 0, color: C.white, fontSize: 13.5 }}>{formatApplicationDateTime(application.nextActionAt)}</dd>
            </div>
          )}
          {application.source && (
            <div>
              <dt style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Source</dt>
              <dd style={{ margin: 0, color: C.white, fontSize: 13.5, wordBreak: "break-word" }}>{application.source}</dd>
            </div>
          )}
          <div>
            <dt style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Updated</dt>
            <dd style={{ margin: 0, color: C.white, fontSize: 13.5 }}>{formatApplicationDateTime(application.updatedAt)}</dd>
          </div>
        </dl>

        {application.job && (
          <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 11, color: accent.text, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>Linked job</div>
            <div style={{ color: C.white, fontWeight: 600, fontSize: 14 }}>{application.job.title}</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 4 }}>
              {[application.job.location, formatWorkMode(application.job.workMode)].filter(Boolean).join(" · ")}
            </div>
            <Link to="/career-os/jobs" style={{ display: "inline-block", marginTop: 8, color: accent.text, fontSize: 12.5, textDecoration: "none" }}>
              View job board →
            </Link>
          </div>
        )}
      </GlassSurface>

      {nextStatuses.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>Move to next status</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {nextStatuses.map(status => (
              <button
                key={status}
                type="button"
                disabled={statusPending}
                onClick={() => void handleStatusChange(status)}
                style={{
                  padding: "9px 14px",
                  borderRadius: T.rControl,
                  border: `1px solid ${accent.border}`,
                  background: accent.subtle,
                  color: accent.text,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: statusPending ? "wait" : "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                {formatStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      )}

      <GlassSurface level={2} padding="20px" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.white }}>Notes & follow-up</h2>
          {!editing && (
            <button type="button" onClick={() => setEditing(true)} style={{ ...secondaryButtonStyle, marginTop: 0 }}>Edit</button>
          )}
        </div>
        {editing ? (
          <>
            <Field label="Notes">
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{ ...fieldInputStyle, resize: "vertical" }} maxLength={4000} />
            </Field>
            <Field label="Source">
              <input value={source} onChange={e => setSource(e.target.value)} style={{ ...fieldInputStyle, marginTop: 12 }} maxLength={120} />
            </Field>
            <Field label="Next action date">
              <input type="datetime-local" value={nextActionAt} onChange={e => setNextActionAt(e.target.value)} style={{ ...fieldInputStyle, marginTop: 12 }} />
            </Field>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button type="button" onClick={() => void handleSaveFields()} disabled={savePending} style={primaryButtonStyle}>
                {savePending ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setEditing(false)} disabled={savePending} style={secondaryButtonStyle}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 12px", color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {application.notes || "No notes yet."}
            </p>
          </>
        )}
      </GlassSurface>

      <GlassSurface level={2} padding="20px" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 12px", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.white }}>
          Interview rounds
        </h2>
        {interviewRounds.length === 0 ? (
          <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
            No interview rounds yet.
          </p>
        ) : (
          interviewRounds.map(round => (
            <Link
              key={round.id}
              to={`/career-os/interviews/${round.id}`}
              style={{
                display: "block",
                textDecoration: "none",
                padding: "12px 14px",
                marginBottom: 8,
                borderRadius: T.rControl,
                border: `1px solid ${T.lineDark}`,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ color: C.white, fontWeight: 600, fontSize: 14, wordBreak: "break-word" }}>{round.title}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12.5, marginTop: 4 }}>
                {formatRoundType(round.type)} · {formatRoundStatus(round.status)}
                {round.scheduledAt ? ` · ${formatInterviewDateTime(round.scheduledAt)}` : ""}
              </div>
            </Link>
          ))
        )}
        <Link to="/career-os/interviews" style={{ display: "inline-block", marginTop: 8, color: accent.text, fontSize: 13, textDecoration: "none" }}>
          Open interview prep →
        </Link>
      </GlassSurface>

      <GlassSurface level={2} padding="20px" style={{ marginBottom: 20 }}>
        <ApplicationTimeline
          applicationId={application.id}
          events={events}
          onEventAdded={event => setEvents(prev => [event, ...prev])}
        />
      </GlassSurface>

      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={deletePending}
        style={dangerButtonStyle}
      >
        {deletePending ? "Deleting…" : "Delete application"}
      </button>
    </div>
  )
}
