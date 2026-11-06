import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { AuthDashboardShell } from "../components/AuthDashboardShell"
import { LEARNER_NAV, LearnerNavIcon, type LearnerNavId } from "../components/learner/learner-nav"
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
  const navigate = useNavigate()
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

  function handleNavSelect(id: string) {
    const navId = id as LearnerNavId
    if (navId === "career") {
      navigate("/career-os")
      return
    }
    const map: Record<Exclude<LearnerNavId, "career">, string> = {
      overview: "/dashboard/student",
      courses: "/dashboard/student?tab=courses",
      projects: "/dashboard/student?tab=projects",
      explore: "/dashboard/student?tab=explore",
    }
    navigate(map[navId] ?? "/dashboard/student")
  }

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

  return (
    <AuthDashboardShell
      workspace="learner"
      title={workspace?.title ?? "Case Practice Studio"}
      subtitle={workspace?.courseTitle ?? "Interactive Case Notes"}
      navItems={LEARNER_NAV}
      activeNav="projects"
      onSelectNav={handleNavSelect}
      renderNavIcon={(id) => <LearnerNavIcon id={id as LearnerNavId} />}
    >
      {status === "loading" ? (
        <div className="lab-empty"><p>Opening the workspace…</p></div>
      ) : status === "error" || !workspace ? (
        <div className="lab-empty">
          <h1>This workspace is not available</h1>
          <p>{message}</p>
          <Link className="os-btn os-btn-primary" to={`/learn/${courseSlug}`}>Return to the course</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 18, maxWidth: 880 }}>
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Case Practice Studio · {workspace.courseTitle}
              </span>
              <h1 style={{ margin: "4px 0 4px", fontSize: 22, color: "#0f172a" }}>{workspace.caseTitle || workspace.title}</h1>
              <p style={{ margin: 0, fontSize: 13.5, color: "#475569" }}>{workspace.learnerNote}</p>
            </div>
            <Link className="os-btn os-btn-ghost" to={`/learn/${courseSlug}${lessonId ? `/${lessonId}` : ""}`}>
              ← Return to lesson
            </Link>
          </section>

          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "20px 24px",
              display: "grid",
              gap: 14,
            }}
          >
            <div className="harbor-note" style={{ whiteSpace: "pre-wrap", margin: 0 }}>{workspace.caseNotes}</div>
            {lessonId && workspace.lessonIds.includes(lessonId) ? (
              <>
                <label htmlFor="practice-response" style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  Your notes for this lesson
                </label>
                <textarea
                  id="practice-response"
                  value={draft}
                  onChange={(event) => onDraftChange(event.target.value)}
                  rows={6}
                  maxLength={8000}
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                  }}
                />
                <div>
                  <button
                    type="button"
                    className="os-btn os-btn-primary"
                    disabled={saving || draft.trim().length === 0}
                    onClick={() => void onSave()}
                  >
                    {saving ? "Saving…" : "Save Notes"}
                  </button>
                </div>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                Open this workspace from one of its lessons to save notes.
              </p>
            )}
            {saveError ? (
              <div className="lab-error" role="alert">
                <p>{saveError}</p>
              </div>
            ) : null}
            {message ? <p className="lab-note" role="status">{message}</p> : null}
          </section>
        </div>
      )}
    </AuthDashboardShell>
  )
}
