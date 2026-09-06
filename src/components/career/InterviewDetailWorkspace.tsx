import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { GlassSurface } from "../foundation"
import type { InterviewRound, InterviewRoundStatus } from "../../lib/career-api"
import {
  deleteInterviewRound,
  listApplications,
  listInterviewQuestions,
  listInterviewRounds,
  listPracticeRecords,
  updateInterviewRound,
  type InterviewPractice,
  type InterviewQuestion,
  type JobApplication,
} from "../../lib/career-api"
import InterviewPracticeSurface from "./InterviewPracticeSurface"
import InterviewQuestionSurface from "./InterviewQuestionSurface"
import {
  formatInterviewDateTime,
  formatRoundStatus,
  formatRoundType,
  ROUND_STATUS_LABELS,
} from "./interview-utils"
import { FeedbackBanner, Field, dangerButtonStyle, fieldInputStyle, primaryButtonStyle, secondaryButtonStyle } from "./section-ui"
import { applicationRoleTitle } from "./application-utils"

const accent = getDomainAccent("career")
const ALL_STATUSES = Object.keys(ROUND_STATUS_LABELS) as InterviewRoundStatus[]

type Props = {
  roundId: string
}

export default function InterviewDetailWorkspace({ roundId }: Props) {
  const navigate = useNavigate()
  const [round, setRound] = useState<InterviewRound | null>(null)
  const [application, setApplication] = useState<JobApplication | null>(null)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [practice, setPractice] = useState<InterviewPractice[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null)
  const [statusPending, setStatusPending] = useState(false)
  const [deletePending, setDeletePending] = useState(false)
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD">("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [rounds, questionResult, practiceData] = await Promise.all([
        listInterviewRounds(),
        listInterviewQuestions({ limit: "50" }),
        listPracticeRecords(),
      ])
      const found = rounds.find(r => r.id === roundId) ?? null
      if (!found) {
        setError("Interview round not found")
        setRound(null)
        return
      }
      setRound(found)
      setNotes(found.notes ?? "")
      setScheduledAt(found.scheduledAt ? found.scheduledAt.slice(0, 16) : "")
      setQuestions(questionResult.questions)
      setCategories(Array.from(new Set(questionResult.questions.map(q => q.category))).sort())
      setPractice(practiceData)

      if (found.applicationId) {
        const apps = await listApplications()
        setApplication(apps.find(a => a.id === found.applicationId) ?? null)
      } else {
        setApplication(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interview round")
      setRound(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [roundId])

  const filteredQuestions = questions.filter(q => {
    if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) return false
    if (categoryFilter !== "ALL" && q.category !== categoryFilter) return false
    return true
  })

  async function handleStatusChange(status: InterviewRoundStatus) {
    if (!round) return
    setStatusPending(true)
    setFeedback(null)
    try {
      const updated = await updateInterviewRound(round.id, { status })
      setRound(updated)
      setFeedback({ tone: "success", message: `Status updated to ${formatRoundStatus(status)}.` })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to update status" })
    } finally {
      setStatusPending(false)
    }
  }

  async function handleSaveNotes() {
    if (!round) return
    setStatusPending(true)
    setFeedback(null)
    try {
      const updated = await updateInterviewRound(round.id, {
        notes: notes.trim() || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      })
      setRound(updated)
      setEditing(false)
      setFeedback({ tone: "success", message: "Round updated." })
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to update round" })
    } finally {
      setStatusPending(false)
    }
  }

  async function handleDelete() {
    if (!round || !window.confirm("Delete this interview round?")) return
    setDeletePending(true)
    try {
      await deleteInterviewRound(round.id)
      navigate("/career-os/app/interviews")
    } catch (err) {
      setFeedback({ tone: "error", message: err instanceof Error ? err.message : "Failed to delete round" })
      setDeletePending(false)
    }
  }

  if (loading) {
    return <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>Loading interview round…</p>
  }

  if (error || !round) {
    return (
      <div style={{ maxWidth: 520 }}>
        <FeedbackBanner tone="error" message={error ?? "Interview round not found"} />
        <Link to="/career-os/app/interviews" style={{ display: "inline-block", marginTop: 12, color: accent.text, fontSize: 13, textDecoration: "none" }}>
          ← Back to interview prep
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", minWidth: 0, overflowX: "hidden" }}>
      <Link to="/career-os/app/interviews" style={{ display: "inline-block", marginBottom: 16, color: accent.text, fontSize: 13, textDecoration: "none" }}>
        ← Interview prep
      </Link>

      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      <GlassSurface level={2} padding="22px" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, color: C.white, wordBreak: "break-word" }}>
              {round.title}
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
              {formatRoundType(round.type)} · {formatRoundStatus(round.status)}
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
            {formatRoundStatus(round.status)}
          </span>
        </div>

        {application && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: T.rControl, border: `1px solid ${T.lineDark}`, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 11, color: accent.text, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Linked application</div>
            <Link to={`/career-os/app/applications/${application.id}`} style={{ color: C.white, fontSize: 14, fontWeight: 600, textDecoration: "none", wordBreak: "break-word" }}>
              {applicationRoleTitle(application)}
            </Link>
          </div>
        )}

        <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: 14, margin: "18px 0 0" }}>
          {round.scheduledAt && (
            <div>
              <dt style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Scheduled</dt>
              <dd style={{ margin: 0, color: C.white, fontSize: 13.5 }}>{formatInterviewDateTime(round.scheduledAt)}</dd>
            </div>
          )}
          <div>
            <dt style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Updated</dt>
            <dd style={{ margin: 0, color: C.white, fontSize: 13.5 }}>{formatInterviewDateTime(round.updatedAt)}</dd>
          </div>
        </dl>
      </GlassSurface>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>Update status</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ALL_STATUSES.filter(s => s !== round.status).map(status => (
            <button
              key={status}
              type="button"
              disabled={statusPending}
              onClick={() => void handleStatusChange(status)}
              style={{
                padding: "8px 12px",
                borderRadius: T.rControl,
                border: `1px solid ${T.lineDark}`,
                background: "transparent",
                color: accent.text,
                fontSize: 12.5,
                cursor: statusPending ? "wait" : "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Mark {formatRoundStatus(status)}
            </button>
          ))}
        </div>
      </div>

      <GlassSurface level={2} padding="20px" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.white }}>Round notes</h2>
          {!editing && <button type="button" onClick={() => setEditing(true)} style={{ ...secondaryButtonStyle, marginTop: 0 }}>Edit</button>}
        </div>
        {editing ? (
          <>
            <Field label="Scheduled time">
              <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} style={fieldInputStyle} />
            </Field>
            <Field label="Notes">
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{ ...fieldInputStyle, marginTop: 12, resize: "vertical" }} maxLength={4000} />
            </Field>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button type="button" onClick={() => void handleSaveNotes()} disabled={statusPending} style={primaryButtonStyle}>
                {statusPending ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setEditing(false)} style={secondaryButtonStyle}>Cancel</button>
            </div>
          </>
        ) : (
          <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {round.notes || "No notes yet."}
          </p>
        )}
      </GlassSurface>

      <GlassSurface level={2} padding="20px" style={{ marginBottom: 20 }}>
        <InterviewQuestionSurface
          questions={filteredQuestions}
          categories={categories}
          difficultyFilter={difficultyFilter}
          categoryFilter={categoryFilter}
          onDifficultyChange={setDifficultyFilter}
          onCategoryChange={setCategoryFilter}
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={setSelectedQuestionId}
        />
      </GlassSurface>

      <GlassSurface level={2} padding="20px" style={{ marginBottom: 20 }}>
        <InterviewPracticeSurface
          practice={practice}
          questions={questions}
          selectedQuestionId={selectedQuestionId}
          selectedRoundId={round.id}
          onPracticeAdded={record => setPractice(prev => [record, ...prev])}
        />
      </GlassSurface>

      <button type="button" onClick={() => void handleDelete()} disabled={deletePending} style={dangerButtonStyle}>
        {deletePending ? "Deleting…" : "Delete interview round"}
      </button>
    </div>
  )
}
