import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { GlassSurface } from "../foundation"
import type { CareerSupportPriority, CareerSupportRequestStatus } from "../../lib/career-api"
import {
  fetchSupportRequest,
  updateSupportRequest,
} from "../../lib/career-api"
import CareerSupportTaskList from "./CareerSupportTaskList"
import {
  formatPriority,
  formatRequestStatus,
  formatRequestType,
  formatSupportDateTime,
  REQUEST_STATUS_LABELS,
} from "./support-utils"
import { FeedbackBanner, Field, fieldInputStyle, primaryButtonStyle, secondaryButtonStyle } from "./section-ui"

const accent = getDomainAccent("career")
const ALL_STATUSES = Object.keys(REQUEST_STATUS_LABELS) as CareerSupportRequestStatus[]
const PRIORITIES: CareerSupportPriority[] = ["LOW", "MEDIUM", "HIGH"]

type Props = {
  requestId: string
}

export default function CareerSupportDetailWorkspace({ requestId }: Props) {
  const [request, setRequest] = useState<Awaited<ReturnType<typeof fetchSupportRequest>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)
  const [pending, setPending] = useState(false)
  const [editing, setEditing] = useState(false)
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<CareerSupportPriority>("MEDIUM")

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSupportRequest(requestId)
      setRequest(data)
      setSubject(data.subject)
      setDescription(data.description)
      setPriority(data.priority)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load support request")
      setRequest(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [requestId])

  async function handleStatusChange(status: CareerSupportRequestStatus) {
    if (!request) return
    setPending(true)
    setFeedback(null)
    try {
      const updated = await updateSupportRequest(request.id, { status })
      setRequest(updated)
      setFeedback({ tone: "success", message: `Status updated to ${formatRequestStatus(status)}.` })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to update status" })
    } finally {
      setPending(false)
    }
  }

  async function handleSave() {
    if (!request) return
    setPending(true)
    setFeedback(null)
    try {
      const updated = await updateSupportRequest(request.id, {
        subject: subject.trim(),
        description: description.trim(),
        priority,
      })
      setRequest(updated)
      setEditing(false)
      setFeedback({ tone: "success", message: "Request updated." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to update request" })
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>Loading support request…</p>
  }

  if (error || !request) {
    return (
      <div style={{ maxWidth: 520 }}>
        <FeedbackBanner tone="error" message={error ?? "Support request not found"} />
        <Link to="/career-os/support" style={{ display: "inline-block", marginTop: 12, color: accent.text, fontSize: 13, textDecoration: "none" }}>
          ← Back to career support
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", minWidth: 0, overflowX: "hidden" }}>
      <Link to="/career-os/support" style={{ display: "inline-block", marginBottom: 16, color: accent.text, fontSize: 13, textDecoration: "none" }}>
        ← Career support
      </Link>

      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      <GlassSurface level={2} padding="22px" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, color: C.white, wordBreak: "break-word" }}>
              {request.subject}
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
              {formatRequestType(request.type)} · {formatRequestStatus(request.status)}
            </p>
          </div>
          <span style={{
            padding: "6px 12px",
            borderRadius: 100,
            border: `1px solid ${accent.border}`,
            background: accent.subtle,
            color: accent.text,
            fontSize: 12,
            fontWeight: 600,
          }}>
            {formatPriority(request.priority)}
          </span>
        </div>

        <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 14, margin: "18px 0 0" }}>
          <div>
            <dt style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Created</dt>
            <dd style={{ margin: 0, color: C.white, fontSize: 13.5 }}>{formatSupportDateTime(request.createdAt)}</dd>
          </div>
          <div>
            <dt style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Updated</dt>
            <dd style={{ margin: 0, color: C.white, fontSize: 13.5 }}>{formatSupportDateTime(request.updatedAt)}</dd>
          </div>
          {request.assignedTo && (
            <div>
              <dt style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Assigned</dt>
              <dd style={{ margin: 0, color: C.white, fontSize: 13.5 }}>Support team</dd>
            </div>
          )}
        </dl>
      </GlassSurface>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>Update status</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ALL_STATUSES.filter(s => s !== request.status).map(status => (
            <button
              key={status}
              type="button"
              disabled={pending}
              onClick={() => void handleStatusChange(status)}
              style={{
                padding: "8px 12px",
                borderRadius: T.rControl,
                border: `1px solid ${T.lineDark}`,
                background: "transparent",
                color: accent.text,
                fontSize: 12.5,
                cursor: pending ? "wait" : "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Mark {formatRequestStatus(status)}
            </button>
          ))}
        </div>
      </div>

      <GlassSurface level={2} padding="20px" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.white }}>Request details</h2>
          {!editing && <button type="button" onClick={() => setEditing(true)} style={{ ...secondaryButtonStyle, marginTop: 0 }}>Edit</button>}
        </div>
        {editing ? (
          <>
            <Field label="Subject">
              <input value={subject} onChange={e => setSubject(e.target.value)} style={fieldInputStyle} maxLength={200} />
            </Field>
            <Field label="Priority">
              <select value={priority} onChange={e => setPriority(e.target.value as CareerSupportPriority)} style={{ ...fieldInputStyle, marginTop: 12 }}>
                {PRIORITIES.map(p => <option key={p} value={p}>{formatPriority(p)}</option>)}
              </select>
            </Field>
            <Field label="Description">
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} style={{ ...fieldInputStyle, marginTop: 12, resize: "vertical" }} maxLength={8000} />
            </Field>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button type="button" onClick={() => void handleSave()} disabled={pending} style={primaryButtonStyle}>
                {pending ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setEditing(false)} style={secondaryButtonStyle}>Cancel</button>
            </div>
          </>
        ) : (
          <p style={{ margin: 0, color: "rgba(255,255,255,0.62)", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {request.description}
          </p>
        )}
      </GlassSurface>

      <GlassSurface level={2} padding="20px" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 14px", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.white }}>Tasks</h2>
        <CareerSupportTaskList
          tasks={request.tasks}
          requestSubject={request.subject}
          requestId={request.id}
          emptyMessage="No tasks assigned to this request yet."
        />
      </GlassSurface>
    </div>
  )
}
