import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { AuthDashboardShell } from "../components/AuthDashboardShell"
import { LEARNER_NAV, LearnerNavIcon } from "../components/learner/learner-nav"
import { useAuth } from "../context/AuthContext"
import { workspaceErrorMessage } from "../lib/http"
import { isSignInError, learnerErrorMessage } from "../components/lms/lms-utils"
import {
  attachProjectEvidence,
  completeProjectTask,
  ensureLearnerProject,
  getCachedProjectWorkspace,
  learnerProjectPath,
  projectStatusLabel,
  saveProject,
  type ProjectTaskView,
  type ProjectWorkspace,
} from "../lib/projects-api"
import {
  addLearnerProjectToCareer,
  fetchCareerLinkForLearnerProject,
  type CareerProjectLink,
} from "../lib/career-api"
import {
  buildProjectReflectionDraftKey,
  clearLocalDraft,
  readLocalDraft,
  reconcileProjectReflectionDraft,
  writeLocalDraft,
  type ProjectReflectionDraft,
} from "../lib/draft-storage"
import HarborDeskStudio from "../components/labs/HarborDeskStudio"
import TrackInteractiveSandbox from "../components/labs/TrackInteractiveSandbox"
import LabSqlChart from "../components/labs/LabSqlChart"
import "./LearnWorkspace.css"
import "./LabsWorkspace.css"
import "./ProjectWorkspace.css"

function firstOpenTask(project: ProjectWorkspace) {
  return project.tasks.find((task) => task.status === "open") ?? project.tasks[0] ?? null
}

export default function LearnerProjectPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { courseSlug, projectType } = useParams<{ courseSlug: string; projectType: string }>()
  const [searchParams] = useSearchParams()
  const requestedTask = searchParams.get("task")
  const [project, setProject] = useState<ProjectWorkspace | null>(() => (projectType ? getCachedProjectWorkspace(projectType) : null))
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [finding, setFinding] = useState("")
  const [whyItMatters, setWhyItMatters] = useState("")
  const [recommendation, setRecommendation] = useState("")
  const [attachId, setAttachId] = useState("")
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "forbidden" | "signin">(() => (projectType && getCachedProjectWorkspace(projectType) ? "ready" : "loading"))
  const [studioTab, setStudioTab] = useState<"lab" | "milestones" | "submit">("lab")
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState<"save" | "task" | "attach" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [careerLink, setCareerLink] = useState<CareerProjectLink | null>(null)
  const [careerLinkStatus, setCareerLinkStatus] = useState<"loading" | "ready" | "error" | "locked">("loading")
  const [careerBusy, setCareerBusy] = useState(false)
  const [careerNotice, setCareerNotice] = useState<string | null>(null)
  const [showCaseData, setShowCaseData] = useState(true)
  const workbenchRef = useRef<HTMLElement>(null)
  const editVersionRef = useRef(0)

  const draftKey = projectType ? buildProjectReflectionDraftKey(projectType, project?.id) : ""
  const fallbackTypeKey = projectType ? buildProjectReflectionDraftKey(projectType) : ""

  useEffect(() => {
    const controller = new AbortController()
    const cached = projectType ? getCachedProjectWorkspace(projectType) : null
    if (!cached) setStatus("loading")
    setError(null)
    if (!courseSlug || !projectType) {
      setStatus("error")
      setError("This project could not be opened.")
      return () => controller.abort()
    }
    const loadVersion = editVersionRef.current
    void ensureLearnerProject(projectType, controller.signal)
      .then((next) => {
        if (next.courseSlug !== courseSlug) {
          throw new Error("This project does not belong to that course.")
        }
        setProject(next)
        const scopedKey = buildProjectReflectionDraftKey(projectType, next.id)
        const legacyKey = buildProjectReflectionDraftKey(projectType)
        const storedDraft =
          readLocalDraft<ProjectReflectionDraft>(scopedKey) ??
          readLocalDraft<ProjectReflectionDraft>(legacyKey)
        const reconciled = reconcileProjectReflectionDraft(next.reflection, storedDraft, next.id)
        if (editVersionRef.current === loadVersion) {
          setFinding(reconciled.finding)
          setWhyItMatters(reconciled.whyItMatters)
          setRecommendation(reconciled.recommendation)
          if (reconciled.restoredFromLocal) {
            setNotice("Unsaved local draft restored. Click Save Capstone Deliverable to save to your account.")
          } else {
            clearLocalDraft(scopedKey)
            clearLocalDraft(legacyKey)
          }
        }
        const requested = requestedTask && next.tasks.some((task) => task.key === requestedTask) ? requestedTask : null
        setSelectedKey(requested ?? firstOpenTask(next)?.key ?? next.tasks[0]?.key ?? null)
        setStatus("ready")
        setCareerLinkStatus("loading")
        void fetchCareerLinkForLearnerProject(next.id, controller.signal)
          .then((link) => {
            setCareerLink(link)
            setCareerLinkStatus("ready")
          })
          .catch((err: unknown) => {
            if (!controller.signal.aborted) {
              setCareerLink(null)
              const message = err instanceof Error ? err.message : ""
              setCareerLinkStatus(/locked/i.test(message) ? "locked" : "error")
            }
          })
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        if (isSignInError(err)) {
          setStatus("signin")
          return
        }
        const message = workspaceErrorMessage(err)
        if (/enrol/i.test(message) || /403/.test(message)) {
          setStatus("forbidden")
          setError(learnerErrorMessage(err, "Enrol in this course to work on this project."))
          return
        }
        setStatus("error")
        setError(learnerErrorMessage(err))
      })
    return () => controller.abort()
  }, [courseSlug, projectType, attempt, requestedTask])

  const selected = useMemo(
    () => project?.tasks.find((task) => task.key === selectedKey) ?? project?.tasks[0] ?? null,
    [project, selectedKey],
  )

  function persistLocalReflection(nextFinding: string, nextWhy: string, nextRec: string) {
    if (!draftKey || !project) return
    if (
      nextFinding === project.reflection.finding &&
      nextWhy === project.reflection.whyItMatters &&
      nextRec === project.reflection.recommendation
    ) {
      clearLocalDraft(draftKey)
      if (fallbackTypeKey) clearLocalDraft(fallbackTypeKey)
      return
    }
    writeLocalDraft<ProjectReflectionDraft>(draftKey, {
      projectId: project.id,
      baseUpdatedAt: project.reflection.updatedAt,
      finding: nextFinding,
      whyItMatters: nextWhy,
      recommendation: nextRec,
      savedAt: new Date().toISOString(),
    })
  }

  function applyProject(next: ProjectWorkspace, syncReflection = false, saveStartVersion?: number) {
    setProject(next)
    if (syncReflection && (saveStartVersion === undefined || editVersionRef.current === saveStartVersion)) {
      setFinding(next.reflection.finding)
      setWhyItMatters(next.reflection.whyItMatters)
      setRecommendation(next.reflection.recommendation)
      if (draftKey) clearLocalDraft(draftKey)
      if (fallbackTypeKey) clearLocalDraft(fallbackTypeKey)
    }
  }

  async function onMarkComplete(task: ProjectTaskView) {
    if (!project) return
    setBusy("task")
    setError(null)
    setNotice(null)
    try {
      applyProject(await completeProjectTask(project.id, task.key))
      setNotice(`Milestone ${task.number} marked complete.`)
    } catch (err) {
      setError(learnerErrorMessage(err, "That step could not be marked complete. Try again in a moment."))
    } finally {
      setBusy(null)
    }
  }

  async function onAttach(task: ProjectTaskView) {
    if (!project || !attachId) return
    setBusy("attach")
    setError(null)
    setNotice(null)
    try {
      applyProject(await attachProjectEvidence(project.id, task.key, attachId))
      setNotice("Saved lab work attached.")
      setAttachId("")
    } catch (err) {
      setError(learnerErrorMessage(err, "That work could not be attached. Try again in a moment."))
    } finally {
      setBusy(null)
    }
  }

  async function onAddToCareer() {
    if (!project) return
    setCareerBusy(true)
    setCareerNotice(null)
    setError(null)
    try {
      const linked = await addLearnerProjectToCareer(project.id)
      setCareerLink({ id: linked.id, href: `/career-os/projects/${linked.id}` })
      setCareerNotice(null)
    } catch (err) {
      setCareerNotice(learnerErrorMessage(err, "The project could not be added to Career OS right now. Try again in a moment."))
    } finally {
      setCareerBusy(false)
    }
  }

  async function onSave() {
    if (!project) return
    const saveStartVersion = editVersionRef.current
    const payload = { finding, whyItMatters, recommendation }
    setBusy("save")
    setError(null)
    setNotice(null)
    try {
      applyProject(await saveProject(project.id, payload), true, saveStartVersion)
      setNotice("Project deliverable saved to your account.")
    } catch (err) {
      persistLocalReflection(payload.finding, payload.whyItMatters, payload.recommendation)
      setError(learnerErrorMessage(err, "Your project could not be saved. Your text is still here. Try again."))
    } finally {
      setBusy(null)
    }
  }

  const shellProps = {
    themeId: "data-science" as const,
    workspace: "learning" as const,
    workspaceLabel: "My Courses",
    roleLabel: user?.role === "superadmin" ? "Superadmin" : user?.role === "admin" ? "Admin" : "Learner",
    navItems: LEARNER_NAV,
    bottomNavItems: LEARNER_NAV,
    activeNav: "projects",
    onNavChange: (id: string) => {
      const found = LEARNER_NAV.find((n) => n.id === id)
      if (found?.href) navigate(found.href)
    },
    renderNavIcon: (id: string) => <LearnerNavIcon id={id} />,
    bar: (
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Link to="/dashboard/student#student-projects" style={{ fontSize: 13.5, fontWeight: 600, color: "#64748b", textDecoration: "none" }}>
          Projects
        </Link>
        <span style={{ color: "#cbd5e1" }}>/</span>
        <strong style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
          {project ? `${project.title} (${project.courseTitle})` : "Capstone Project Workspace"}
        </strong>
      </div>
    ),
  }

  if (status === "loading") {
    return (
      <AuthDashboardShell {...shellProps}>
        <div className="sh">
          <div className="os-state-skeleton" role="status" aria-label="Loading the project">
            <span className="os-skeleton" style={{ width: "30%" }} />
            <span className="os-skeleton" style={{ height: 28, width: "70%" }} />
            <span className="os-skeleton" style={{ height: 180 }} />
          </div>
        </div>
      </AuthDashboardShell>
    )
  }

  if (status === "signin") {
    return (
      <div className="lab-shell">
        <div className="lab-empty">
          <p className="os-eyebrow">Project</p>
          <h1>Sign in to open your project</h1>
          <p>Your project is saved to your account. Sign in to continue where you left off.</p>
          <div className="os-actions">
            <Link
              className="os-btn os-btn-primary"
              to="/login"
              state={{ returnTo: courseSlug && projectType ? learnerProjectPath(courseSlug, projectType) : "/dashboard/student" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === "forbidden" || status === "error" || !project) {
    const courseHref = courseSlug ? `/learn/${courseSlug}` : "/dashboard/student"
    return (
      <AuthDashboardShell {...shellProps}>
        <div className="sh">
          <div className="sh-card" style={{ padding: 28 }}>
            <p className="os-eyebrow">Capstone Project Workspace</p>
            <h1 style={{ margin: "6px 0 10px", fontSize: 24 }}>
              {status === "forbidden" ? "Enrol in this course to open the project" : "This project could not be opened"}
            </h1>
            <p style={{ color: "#475569", marginBottom: 18 }}>{error}</p>
            <div className="os-actions">
              {status === "error" ? (
                <button type="button" className="os-btn os-btn-primary" onClick={() => setAttempt((value) => value + 1)}>
                  Try again
                </button>
              ) : null}
              <Link className={status === "error" ? "os-btn os-btn-ghost" : "os-btn os-btn-primary"} to={courseHref}>
                {courseSlug ? "Open course" : "Open dashboard"}
              </Link>
            </div>
          </div>
        </div>
      </AuthDashboardShell>
    )
  }

  const pct = project.progress.total > 0 ? Math.round((project.progress.complete / project.progress.total) * 100) : 0

  return (
    <AuthDashboardShell {...shellProps}>
      <div className="sh" style={{ display: "grid", gap: 20 }}>
        {/* Clean Capstone Overview Header Card */}
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
            flexWrap: "wrap",
            boxShadow: "0 8px 24px -14px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "#f5f3ff",
                  color: "#5142b5",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Unified Project Studio · {project.courseTitle}
              </span>
              <span
                className={
                  project.status === "ready_to_review"
                    ? "os-status is-done"
                    : project.status === "not_started"
                      ? "os-status is-idle"
                      : "os-status"
                }
              >
                {projectStatusLabel(project.status)} ({project.progress.complete}/{project.progress.total} Milestones)
              </span>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(20px, 2.4vw, 25px)", color: "#0f172a", fontFamily: "var(--font-display)" }}>
              {project.title}
            </h1>
            <p style={{ margin: "0 0 12px", fontSize: 13.5, color: "#475569" }}>
              {project.goal}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="os-btn os-btn-ghost" to={`/learn/${project.courseSlug}`} style={{ minHeight: 38, fontSize: 13 }}>
                ← Return to {project.courseTitle}
              </Link>
              <button
                type="button"
                className="os-btn os-btn-ghost"
                style={{ minHeight: 38, fontSize: 13 }}
                onClick={() => setShowCaseData((v) => !v)}
              >
                {showCaseData ? "Hide Interactive Workbench" : "Show Interactive Workbench"}
              </button>
              {careerLink ? (
                <Link className="os-btn os-btn-primary" to={careerLink.href} style={{ minHeight: 38, fontSize: 13 }}>
                  ✓ Published in Career OS →
                </Link>
              ) : project.progress.complete === project.progress.total && careerLinkStatus !== "locked" ? (
                <button
                  type="button"
                  className="os-btn os-btn-primary"
                  style={{ minHeight: 38, fontSize: 13 }}
                  disabled={careerBusy}
                  onClick={() => void onAddToCareer()}
                >
                  {careerBusy ? "Adding…" : "Publish Project to Career OS →"}
                </button>
              ) : null}
            </div>
            {careerNotice && !careerLink ? (
              <p style={{ margin: "8px 0 0", fontSize: 12.5, color: "#64748b" }}>{careerNotice}</p>
            ) : null}
          </div>

          <div
            style={{
              minWidth: 210,
              padding: "14px 16px",
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
              <span>Studio Progress</span>
              <span style={{ color: "#5142b5" }}>{pct}%</span>
            </div>
            <div className="os-progress-bar" style={{ height: 7, marginBottom: 8 }}>
              <span style={{ width: `${pct}%` }} />
            </div>
            <span style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>
              {project.progress.complete} of {project.progress.total} milestones done
            </span>
          </div>
        </section>

        {/* Static 3-Tab Studio Switcher (Zero Vertical Clutter on Mobile & Desktop) */}
        <div
          role="tablist"
          aria-label="Project Studio Workspace Tabs"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 6,
            padding: 5,
            borderRadius: 12,
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
          }}
        >
          {[
            { id: "lab" as const, label: "1. Case Brief & Lab" },
            { id: "milestones" as const, label: `2. Milestones (${project.progress.complete}/${project.progress.total})` },
            { id: "submit" as const, label: "3. Submit Capstone" },
          ].map((tab) => {
            const active = studioTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStudioTab(tab.id)}
                style={{
                  padding: "9px 8px",
                  borderRadius: 8,
                  border: active ? "1px solid #cbd5e1" : "none",
                  background: active ? "#ffffff" : "transparent",
                  color: active ? "#5142b5" : "#475569",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: active ? "0 1px 3px rgba(15,23,42,0.08)" : "none",
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab 1: Embedded Interactive Case Data / SQL / Code Workbench */}
        {studioTab === "lab" && showCaseData ? (
          <section
            ref={workbenchRef}
            id="project-studio-workbench"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "18px 20px",
            }}
          >
            {project.projectType === "harbor-desk-case" ? (
              <HarborDeskStudio />
            ) : (
              <TrackInteractiveSandbox projectType={project.projectType} />
            )}
          </section>
        ) : null}

        {/* Tab 2 & Tab 3 Focused Views */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Tab 2: 6 Project Milestones + Active Milestone Detail */}
          <div style={{ display: studioTab === "milestones" ? "grid" : "none", gap: 16 }}>
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: "20px 22px",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Step 1 · Project Milestones
              </div>
              <h2 style={{ margin: "0 0 12px", fontSize: 18, color: "#0f172a" }}>
                Complete the 6 Capstone Checkpoints
              </h2>
              <ol className="proj-tasks" style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                {project.tasks.map((task) => {
                  const active = task.key === selected?.key
                  const done = task.status === "complete"
                  return (
                    <li key={task.key}>
                      <button
                        type="button"
                        onClick={() => setSelectedKey(task.key)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "11px 14px",
                          borderRadius: 10,
                          border: active ? "1.5px solid #5142b5" : "1px solid #e2e8f0",
                          background: active ? "#f5f3ff" : "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 999,
                              background: done ? "#059669" : active ? "#5142b5" : "#e2e8f0",
                              color: done || active ? "#ffffff" : "#475569",
                              fontSize: 11.5,
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {done ? "✓" : task.number}
                          </span>
                          <strong style={{ fontSize: 13.5, color: "#0f172a" }}>{task.title}</strong>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: done ? "#dcfce7" : "#f1f5f9",
                            color: done ? "#166534" : "#475569",
                          }}
                        >
                          {done ? "Done" : "Open"}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </section>

            {selected ? (
              <section
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: "20px 22px",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  Milestone {selected.number} · {selected.toolLabel}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, color: "#0f172a" }}>{selected.title}</h3>
                <p style={{ margin: "0 0 10px", fontSize: 14, color: "#334155", lineHeight: 1.55 }}>{selected.summary}</p>
                <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#64748b", background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <strong>Goal:</strong> {selected.evidenceHint}
                </p>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                  {selected.completion !== "reflection" ? (
                    <button
                      type="button"
                      className={selected.status === "complete" ? "os-btn os-btn-ghost" : "os-btn os-btn-primary"}
                      style={{ minHeight: 38, fontSize: 13 }}
                      disabled={busy !== null || selected.status === "complete"}
                      onClick={() => void onMarkComplete(selected)}
                    >
                      {selected.status === "complete" ? "✓ Milestone Completed" : busy === "task" ? "Saving…" : "Mark Milestone Complete ✓"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="os-btn os-btn-ghost"
                    style={{ minHeight: 38, fontSize: 13 }}
                    onClick={() => {
                      setStudioTab("lab")
                      setShowCaseData(true)
                      window.setTimeout(() => {
                        workbenchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                      }, 50)
                    }}
                  >
                    ↑ Run in Studio Workbench
                  </button>
                  {selected.openLabHref ? (
                    <Link className="os-btn os-btn-ghost" to={selected.openLabHref} style={{ minHeight: 38, fontSize: 13 }}>
                      Full-Screen SQL Runner →
                    </Link>
                  ) : null}
                </div>

                {(selected.completion === "lab_work" || (project.labEnabled && selected.key === "validate_data")) && project.availableWork.length > 0 ? (
                  <div style={{ paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                    <label htmlFor="proj-work" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                      Or attach saved query from Full-Screen SQL Runner
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <select
                        id="proj-work"
                        value={attachId}
                        onChange={(event) => setAttachId(event.target.value)}
                        disabled={busy !== null}
                        style={{ flex: 1, minWidth: 200, padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                      >
                        <option value="">Choose saved lab query…</option>
                        {project.availableWork.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.operationLabel}
                            {item.rowCount != null ? ` · ${item.rowCount} rows` : ""} ·{" "}
                            {new Date(item.createdAt).toLocaleString("en-GB", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="os-btn os-btn-ghost"
                        style={{ minHeight: 38, fontSize: 13 }}
                        disabled={!attachId || busy !== null}
                        onClick={() => void onAttach(selected)}
                      >
                        {busy === "attach" ? "Attaching…" : "Attach"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {selected.evidence ? (
                  <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>Attached Evidence: {selected.evidence.title}</strong>
                    <span style={{ fontSize: 12, color: "#64748b", display: "block", marginTop: 2 }}>
                      Source: {selected.evidence.source}
                      {selected.evidence.validRows != null ? ` · Valid rows: ${selected.evidence.validRows}` : ""}
                      {selected.evidence.netRevenueLabel ? ` · ${selected.evidence.netRevenueLabel}` : ""}
                    </span>
                    {selected.evidence.chart ? <LabSqlChart chart={selected.evidence.chart} /> : null}
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>

          {/* Tab 3: Deliverable Executive Write-Up Form */}
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "20px 22px",
              display: studioTab === "submit" ? "grid" : "none",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Step 2 · Final Capstone Submission
              </div>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, color: "#0f172a" }}>
                {project.labEnabled ? "Executive Summary & Recommendation" : "Product Strategy & PRD Summary"}
              </h2>
            </div>

            <div>
              <label htmlFor="proj-finding" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>
                1. {project.reflectionLabels.finding}
              </label>
              <span style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                {project.reflectionHints.finding}
              </span>
              <textarea
                id="proj-finding"
                value={finding}
                onChange={(event) => {
                  editVersionRef.current += 1
                  const nextFinding = event.target.value
                  setFinding(nextFinding)
                  persistLocalReflection(nextFinding, whyItMatters, recommendation)
                }}
                maxLength={1500}
                rows={4}
                disabled={busy !== null}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>

            <div>
              <label htmlFor="proj-why" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>
                2. {project.reflectionLabels.whyItMatters}
              </label>
              <span style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                {project.reflectionHints.whyItMatters}
              </span>
              <textarea
                id="proj-why"
                value={whyItMatters}
                onChange={(event) => {
                  editVersionRef.current += 1
                  const nextWhy = event.target.value
                  setWhyItMatters(nextWhy)
                  persistLocalReflection(finding, nextWhy, recommendation)
                }}
                maxLength={1500}
                rows={4}
                disabled={busy !== null}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>

            <div>
              <label htmlFor="proj-rec" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>
                3. {project.reflectionLabels.recommendation}
              </label>
              <span style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                {project.reflectionHints.recommendation}
              </span>
              <textarea
                id="proj-rec"
                value={recommendation}
                onChange={(event) => {
                  editVersionRef.current += 1
                  const nextRec = event.target.value
                  setRecommendation(nextRec)
                  persistLocalReflection(finding, whyItMatters, nextRec)
                }}
                maxLength={1500}
                rows={4}
                disabled={busy !== null}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>

            {error ? (
              <div className="lab-error" role="alert" style={{ margin: 0 }}>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            ) : null}
            {notice ? (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#047857" }}>✓ {notice}</p>
            ) : null}

            <button
              type="button"
              className="os-btn os-btn-primary"
              onClick={() => void onSave()}
              disabled={busy !== null}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {busy === "save" ? "Saving Deliverable…" : "Save Capstone Deliverable →"}
            </button>
          </section>
        </div>
      </div>
    </AuthDashboardShell>
  )
}
