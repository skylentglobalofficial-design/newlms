import { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { fetchLearnerPracticeWorkspace, saveLearnerPracticeResponse, type LearnerPracticeWorkspace } from "../lib/practice-api"
import "./LabsWorkspace.css"

export default function PracticeWorkspacePage() {
  const { courseSlug = "" } = useParams()
  const [params] = useSearchParams()
  const lessonId = params.get("lesson") ?? ""
  const [workspace, setWorkspace] = useState<LearnerPracticeWorkspace | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [message, setMessage] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setStatus("loading")
    fetchLearnerPracticeWorkspace(courseSlug, lessonId || undefined, controller.signal)
      .then((data) => {
        setWorkspace(data)
        setDraft(data.savedBody ?? "")
        setStatus("ready")
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setMessage(error instanceof Error ? error.message : "This workspace could not be opened.")
        setStatus("error")
      })
    return () => controller.abort()
  }, [courseSlug, lessonId])

  async function onSave() {
    if (!workspace || !lessonId) return
    setSaving(true)
    setMessage(null)
    try {
      await saveLearnerPracticeResponse(courseSlug, lessonId, draft)
      setMessage("Saved.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The response could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="lab-shell">
        <div className="lab-empty"><p>Opening the workspace…</p></div>
      </div>
    )
  }

  if (status === "error" || !workspace) {
    return (
      <div className="lab-shell">
        <div className="lab-empty">
          <h1>This workspace is not available</h1>
          <p>{message}</p>
          <Link className="os-btn os-btn-primary" to={`/learn/${courseSlug}`}>Return to the course</Link>
        </div>
      </div>
    )
  }

  const lessonAllowed = lessonId && workspace.lessonIds.includes(lessonId)

  return (
    <div className="lab-shell">
      <header className="lab-top">
        <div className="lab-brand">
          <strong>{workspace.title}</strong>
          <span>{workspace.courseTitle}</span>
        </div>
        <div className="lab-top-actions">
          <Link className="os-btn os-btn-ghost" to={`/learn/${courseSlug}${lessonId ? `/${lessonId}` : ""}`}>Return to lesson</Link>
        </div>
      </header>
      <div className="lab-body">
        <section className="lab-workspace" style={{ maxWidth: 820, minWidth: 0 }}>
          <p className="os-eyebrow">Practice</p>
          <h1>{workspace.caseTitle || workspace.title}</h1>
          <p>{workspace.learnerNote}</p>
          <div className="harbor-note" style={{ whiteSpace: "pre-wrap" }}>{workspace.caseNotes}</div>
          {lessonAllowed ? (
            <>
              <label htmlFor="practice-response">Your notes for this lesson</label>
              <textarea id="practice-response" value={draft} onChange={(event) => setDraft(event.target.value)} rows={6} maxLength={8000} style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }} />
              <button type="button" className="os-btn os-btn-primary" disabled={saving || draft.trim().length === 0} onClick={() => void onSave()}>
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <p>Open this workspace from one of its lessons to save notes.</p>
          )}
          {message ? <p className="lab-note">{message}</p> : null}
        </section>
      </div>
    </div>
  )
}
