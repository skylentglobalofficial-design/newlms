import { useEffect, useRef, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { fetchLearnerPracticeWorkspace, saveLearnerPracticeResponse, type LearnerPracticeWorkspace } from "../lib/practice-api"
import {
  buildPracticeWorkspaceDraftKey,
  clearLocalDraft,
  readLocalDraft,
  reconcilePracticeTextDraft,
  writeLocalDraft,
  type PracticeWorkspaceDraft,
} from "../lib/draft-storage"
import "./LabsWorkspace.css"

export default function PracticeWorkspacePage() {
  const { courseSlug = "" } = useParams()
  const [params] = useSearchParams()
  const lessonId = params.get("lesson") ?? ""
  const [workspace, setWorkspace] = useState<LearnerPracticeWorkspace | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [message, setMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)
  const editVersionRef = useRef(0)

  const draftKey = courseSlug && lessonId ? buildPracticeWorkspaceDraftKey(courseSlug, lessonId) : ""

  useEffect(() => {
    const controller = new AbortController()
    setStatus("loading")
    setMessage(null)
    setSaveError(null)
    const loadVersion = editVersionRef.current
    const localKey = courseSlug && lessonId ? buildPracticeWorkspaceDraftKey(courseSlug, lessonId) : ""
    fetchLearnerPracticeWorkspace(courseSlug, lessonId || undefined, controller.signal)
      .then((data) => {
        setWorkspace(data)
        const reconciled = reconcilePracticeTextDraft(
          data.savedBody,
          localKey ? readLocalDraft<PracticeWorkspaceDraft>(localKey) : null,
        )
        if (editVersionRef.current === loadVersion) {
          setDraft(reconciled.body)
          if (reconciled.restoredFromLocal) {
            setMessage("Unsaved local notes restored. Click Save to save them to your account.")
          } else if (localKey) {
            clearLocalDraft(localKey)
          }
        }
        setStatus("ready")
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setMessage(error instanceof Error ? error.message : "This workspace could not be opened.")
        setStatus("error")
      })
    return () => controller.abort()
  }, [courseSlug, lessonId])

  function onDraftChange(nextBody: string) {
    editVersionRef.current += 1
    setDraft(nextBody)
    if (!draftKey || !workspace) return
    const currentServerBody = workspace.savedBody ?? ""
    if (nextBody === currentServerBody) {
      clearLocalDraft(draftKey)
      return
    }
    writeLocalDraft<PracticeWorkspaceDraft>(draftKey, {
      baseServerBody: currentServerBody,
      body: nextBody,
      savedAt: new Date().toISOString(),
    })
  }

  async function onSave() {
    if (!workspace || !lessonId) return
    const saveStartVersion = editVersionRef.current
    const bodyToSave = draft
    setSaving(true)
    setMessage(null)
    setSaveError(null)
    try {
      await saveLearnerPracticeResponse(courseSlug, lessonId, bodyToSave)
      setWorkspace((current) => (current ? { ...current, savedBody: bodyToSave } : current))
      if (draftKey && editVersionRef.current === saveStartVersion) {
        clearLocalDraft(draftKey)
      }
      setMessage("Saved.")
    } catch (error) {
      if (draftKey) {
        writeLocalDraft<PracticeWorkspaceDraft>(draftKey, {
          baseServerBody: workspace.savedBody ?? "",
          body: bodyToSave,
          savedAt: new Date().toISOString(),
        })
      }
      setSaveError(error instanceof Error ? error.message : "The response could not be saved.")
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
              <textarea id="practice-response" value={draft} onChange={(event) => onDraftChange(event.target.value)} rows={6} maxLength={8000} style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }} />
              <button type="button" className="os-btn os-btn-primary" disabled={saving || draft.trim().length === 0} onClick={() => void onSave()}>
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          ) : (
            <p>Open this workspace from one of its lessons to save notes.</p>
          )}
          {saveError ? (
            <div className="lab-error" role="alert">
              <p>{saveError}</p>
            </div>
          ) : null}
          {message ? <p className="lab-note" role="status">{message}</p> : null}
        </section>
      </div>
    </div>
  )
}
