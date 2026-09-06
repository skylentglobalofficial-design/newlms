import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { GlassSurface } from "../foundation"
import { useCareerSupport } from "../../hooks/useCareerSupport"
import {
  createSupportRequest,
  type CareerSupportPriority,
  type CareerSupportRequestType,
} from "../../lib/career-api"
import CareerSupportRequestList from "./CareerSupportRequestList"
import CareerSupportTaskList from "./CareerSupportTaskList"
import {
  countOpenTasks,
  formatPriority,
  formatRequestStatus,
  formatRequestType,
  formatSupportDateTime,
  getNextOpenTask,
  isActiveRequest,
  REQUEST_TYPE_LABELS,
} from "./support-utils"
import { FeedbackBanner, Field, fieldInputStyle, LoadingBlock, primaryButtonStyle, secondaryButtonStyle } from "./section-ui"

const accent = getDomainAccent("career")
const REQUEST_TYPES = Object.keys(REQUEST_TYPE_LABELS) as CareerSupportRequestType[]
const PRIORITIES: CareerSupportPriority[] = ["LOW", "MEDIUM", "HIGH"]

export default function CareerSupportWorkspace() {
  const board = useCareerSupport()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<CareerSupportRequestType>("GENERAL")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<CareerSupportPriority>("MEDIUM")
  const [submitting, setSubmitting] = useState(false)
  const [formFeedback, setFormFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    const active = board.requests.filter(isActiveRequest)
    if (active.length && !selectedId) {
      setSelectedId(active[0].id)
    } else if (board.requests.length && !selectedId) {
      setSelectedId(board.requests[0].id)
    }
  }, [board.requests, selectedId])

  const selected = board.requests.find(r => r.id === selectedId) ?? null
  const activeCount = board.requests.filter(isActiveRequest).length
  const openTaskCount = countOpenTasks(board.requests.filter(isActiveRequest))
  const nextTask = getNextOpenTask(board.requests)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return
    setSubmitting(true)
    setFormFeedback(null)
    try {
      const created = await createSupportRequest({
        type,
        subject: subject.trim(),
        description: description.trim(),
        priority,
      })
      board.setRequests(prev => [created, ...prev])
      setSelectedId(created.id)
      setSubject("")
      setDescription("")
      setType("GENERAL")
      setPriority("MEDIUM")
      setShowForm(false)
      setFormFeedback({ tone: "success", message: "Support request submitted." })
    } catch (err) {
      setFormFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to submit request" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="support-workspace" style={{ maxWidth: 1100, margin: "0 auto", minWidth: 0, overflowX: "hidden" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 700, color: C.white }}>
          Career support
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.48)", fontSize: 14, lineHeight: 1.6 }}>
          See your support requests, track assigned tasks, and request help when you need it.
        </p>
      </div>

      {board.error && (
        <div style={{ marginBottom: 16 }}>
          <FeedbackBanner tone="error" message={board.error} />
          <button type="button" onClick={() => void board.reload()} style={{ marginTop: 10, padding: "9px 16px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: "transparent", color: accent.text, fontSize: 13, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      )}

      {formFeedback && <FeedbackBanner tone={formFeedback.tone} message={formFeedback.message} />}

      {board.loading ? (
        <LoadingBlock label="Loading career support…" />
      ) : (
        <>
          <GlassSurface level={2} padding="18px 20px" style={{ marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 12 }}>
              <SummaryStat label="Active requests" value={activeCount} />
              <SummaryStat label="Open tasks" value={openTaskCount} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Next action</div>
                <div style={{ color: C.white, fontSize: 14, fontWeight: 500, wordBreak: "break-word" }}>
                  {nextTask ? nextTask.title : activeCount > 0 ? "Waiting on support team" : "Submit a support request"}
                </div>
              </div>
            </div>
          </GlassSurface>

          <div className="support-workspace-layout" style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr)",
            gap: "clamp(16px, 2vw, 24px)",
            alignItems: "start",
          }}>
            <aside style={{ minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: accent.text, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>Requests</div>
                <button type="button" onClick={() => setShowForm(v => !v)} style={{ ...secondaryButtonStyle, marginTop: 0, padding: "6px 10px", fontSize: 12 }}>
                  {showForm ? "Cancel" : "Request support"}
                </button>
              </div>
              <CareerSupportRequestList
                requests={board.requests}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </aside>

            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
              {showForm && (
                <GlassSurface level={2} padding="18px 20px">
                  <h2 style={{ margin: "0 0 14px", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.white }}>
                    Request support
                  </h2>
                  <form onSubmit={e => void handleCreate(e)}>
                    <Field label="Type">
                      <select value={type} onChange={e => setType(e.target.value as CareerSupportRequestType)} style={fieldInputStyle}>
                        {REQUEST_TYPES.map(t => <option key={t} value={t}>{formatRequestType(t)}</option>)}
                      </select>
                    </Field>
                    <Field label="Priority">
                      <select value={priority} onChange={e => setPriority(e.target.value as CareerSupportPriority)} style={{ ...fieldInputStyle, marginTop: 12 }}>
                        {PRIORITIES.map(p => <option key={p} value={p}>{formatPriority(p)}</option>)}
                      </select>
                    </Field>
                    <Field label="Subject">
                      <input value={subject} onChange={e => setSubject(e.target.value)} style={{ ...fieldInputStyle, marginTop: 12 }} maxLength={200} required />
                    </Field>
                    <Field label="Description">
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={5}
                        style={{ ...fieldInputStyle, marginTop: 12, resize: "vertical" }}
                        maxLength={8000}
                        required
                        placeholder="Describe what you need help with"
                      />
                    </Field>
                    <button type="submit" disabled={submitting || !subject.trim() || !description.trim()} style={{ ...primaryButtonStyle, marginTop: 14 }}>
                      {submitting ? "Submitting…" : "Submit request"}
                    </button>
                  </form>
                </GlassSurface>
              )}

              {selected ? (
                <>
                  <GlassSurface level={2} padding="18px 20px">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                      <div style={{ minWidth: 0 }}>
                        <h2 style={{ margin: "0 0 6px", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: C.white, wordBreak: "break-word" }}>
                          {selected.subject}
                        </h2>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 13.5 }}>
                          {formatRequestType(selected.type)} · {formatRequestStatus(selected.status)} · {formatPriority(selected.priority)}
                        </p>
                        <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.38)", fontSize: 12 }}>
                          Created {formatSupportDateTime(selected.createdAt)} · Updated {formatSupportDateTime(selected.updatedAt)}
                        </p>
                        {selected.assignedTo && (
                          <p style={{ margin: "6px 0 0", color: accent.text, fontSize: 12.5 }}>Assigned to support</p>
                        )}
                      </div>
                      <Link to={`/career-os/app/support/${selected.id}`} style={{ color: accent.text, fontSize: 13, textDecoration: "none", fontWeight: 600, flexShrink: 0 }}>
                        Open request →
                      </Link>
                    </div>
                    <p style={{ margin: "14px 0 0", color: "rgba(255,255,255,0.62)", fontSize: 14, lineHeight: 1.7, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                      {selected.description}
                    </p>
                  </GlassSurface>

                  <GlassSurface level={2} padding="18px 20px">
                    <h2 style={{ margin: "0 0 14px", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.white }}>
                      Tasks
                    </h2>
                    <CareerSupportTaskList
                      tasks={selected.tasks}
                      requestSubject={selected.subject}
                      requestId={selected.id}
                      emptyMessage="No tasks assigned to this request yet."
                    />
                  </GlassSurface>
                </>
              ) : board.requests.length === 0 && !showForm ? (
                <GlassSurface level={2} padding="18px 20px">
                  <p style={{ margin: "0 0 12px", color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6 }}>
                    Submit a support request for resume feedback, interview preparation, or job search guidance.
                  </p>
                  <button type="button" onClick={() => setShowForm(true)} style={primaryButtonStyle}>
                    Request support
                  </button>
                </GlassSurface>
              ) : null}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 900px) {
          .support-workspace-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C.white, fontFamily: "var(--font-display)" }}>{value}</div>
    </div>
  )
}
