import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { workspaceErrorMessage } from "../lib/http"
import {
  attachProjectEvidence,
  completeProjectTask,
  ensureNorthwindProject,
  northwindProjectPath,
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
import LabSqlChart from "../components/labs/LabSqlChart"
import "./LearnWorkspace.css"
import "./LabsWorkspace.css"
import "./ProjectWorkspace.css"

function firstOpenTask(project: ProjectWorkspace) {
  return project.tasks.find((task) => task.status === "open") ?? project.tasks[0] ?? null
}

export default function NorthwindProjectPage() {
  const [project, setProject] = useState<ProjectWorkspace | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [finding, setFinding] = useState("")
  const [whyItMatters, setWhyItMatters] = useState("")
  const [recommendation, setRecommendation] = useState("")
  const [attachId, setAttachId] = useState("")
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "forbidden">("loading")
  const [busy, setBusy] = useState<"save" | "task" | "attach" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [careerLink, setCareerLink] = useState<CareerProjectLink | null>(null)
  const [careerBusy, setCareerBusy] = useState(false)
  const [careerNotice, setCareerNotice] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setStatus("loading")
    setError(null)
    void ensureNorthwindProject(controller.signal)
      .then((next) => {
        setProject(next)
        setFinding(next.reflection.finding)
        setWhyItMatters(next.reflection.whyItMatters)
        setRecommendation(next.reflection.recommendation)
        setSelectedKey(firstOpenTask(next)?.key ?? next.tasks[0]?.key ?? null)
        setStatus("ready")
        void fetchCareerLinkForLearnerProject(next.id, controller.signal)
          .then(setCareerLink)
          .catch(() => {
            if (!controller.signal.aborted) setCareerLink(null)
          })
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        const message = workspaceErrorMessage(err)
        if (/enrol/i.test(message) || /403/.test(message)) {
          setStatus("forbidden")
          setError("Enrol in Data Analytics to work on this project.")
          return
        }
        setStatus("error")
        setError(message || "Could not open this project.")
      })
    return () => controller.abort()
  }, [])

  const selected = useMemo(
    () => project?.tasks.find((task) => task.key === selectedKey) ?? project?.tasks[0] ?? null,
    [project, selectedKey],
  )

  function applyProject(next: ProjectWorkspace, syncReflection = false) {
    setProject(next)
    if (syncReflection) {
      setFinding(next.reflection.finding)
      setWhyItMatters(next.reflection.whyItMatters)
      setRecommendation(next.reflection.recommendation)
    }
  }

  async function onMarkComplete(task: ProjectTaskView) {
    if (!project) return
    setBusy("task")
    setError(null)
    setNotice(null)
    try {
      applyProject(await completeProjectTask(project.id, task.key))
      setNotice("Task marked complete.")
    } catch (err) {
      setError(workspaceErrorMessage(err) || "Could not complete that task.")
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
      setError(workspaceErrorMessage(err) || "Could not attach that work.")
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
      setCareerNotice(workspaceErrorMessage(err) || "Finish the project before adding it to Career OS.")
    } finally {
      setCareerBusy(false)
    }
  }

  async function onSave() {
    if (!project) return
    setBusy("save")
    setError(null)
    setNotice(null)
    try {
      applyProject(await saveProject(project.id, { finding, whyItMatters, recommendation }), true)
      setNotice("Project saved.")
    } catch (err) {
      setError(workspaceErrorMessage(err) || "Could not save this project.")
    } finally {
      setBusy(null)
    }
  }

  if (status === "loading") {
    return (
      <div className="lab-shell">
        <div className="lab-empty">
          <p className="os-eyebrow">Project</p>
          <p>Loading Northwind Commercial Review…</p>
        </div>
      </div>
    )
  }

  if (status === "forbidden" || status === "error" || !project) {
    return (
      <div className="lab-shell">
        <div className="lab-empty">
          <p className="os-eyebrow">Project</p>
          <h1>{status === "forbidden" ? "Practice this from Data Analytics." : "This project could not load."}</h1>
          <p>{error}</p>
          <div className="os-actions">
            <Link className="os-btn os-btn-primary" to="/learn/data-analytics">
              Open Data Analytics
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lab-shell proj-shell">
      <header className="lab-top">
        <Link className="lab-brand" to={northwindProjectPath()}>
          <strong>Skylent Labs</strong>
          <span>Project</span>
        </Link>
        <p className="lab-top-course">Data Analytics</p>
        <div className="lab-top-actions">
          <Link className="os-btn os-btn-ghost" to="/learn/data-analytics">
            Return to course
          </Link>
          {careerLink ? (
            <Link className="os-btn os-btn-primary" to={careerLink.href}>
              View in Career OS
            </Link>
          ) : null}
        </div>
      </header>

      <div className="lab-context">
        <p>
          Dataset: <strong>{project.dataset}</strong>
        </p>
        <p>
          Status: <strong>{projectStatusLabel(project.status)}</strong>
        </p>
        <p>
          Progress:{" "}
          <strong>
            {project.progress.complete} / {project.progress.total} tasks
          </strong>
        </p>
      </div>

      <div className="proj-career">
        <p className="os-eyebrow">Career OS</p>
        {careerLink ? (
          <>
            <p>Added to Career OS</p>
            <Link className="os-btn os-btn-primary" to={careerLink.href}>
              View in Career OS
            </Link>
          </>
        ) : project.progress.complete === project.progress.total ? (
          <button
            type="button"
            className="os-btn os-btn-primary"
            disabled={careerBusy}
            onClick={() => void onAddToCareer()}
          >
            {careerBusy ? "Adding…" : "Add to Career OS"}
          </button>
        ) : (
          <p>Finish the project before adding it to Career OS.</p>
        )}
        {careerNotice && !careerLink ? <p>{careerNotice}</p> : null}
      </div>

      <div className="lab-body">
        <div className="proj-grid">
          <aside className="lab-rail">
            <p className="os-eyebrow">Project</p>
            <h1>{project.title}</h1>
            <p className="proj-goal">
              <strong>Goal</strong>
              {project.goal}
            </p>
            <p>{project.context}</p>
            <ol className="proj-brief">
              {project.brief.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <p className="os-eyebrow">Tasks</p>
            <ol className="proj-tasks">
              {project.tasks.map((task) => (
                <li key={task.key}>
                  <button
                    type="button"
                    className={task.key === selected?.key ? "is-active" : undefined}
                    onClick={() => setSelectedKey(task.key)}
                  >
                    <span>{task.number}</span>
                    <strong>{task.title}</strong>
                    <em>{task.status === "complete" ? "Complete" : "Open"}</em>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <section className="lab-workspace">
            {selected ? (
              <>
                <p className="os-eyebrow">
                  {selected.number} · {selected.toolLabel}
                </p>
                <h2>{selected.title}</h2>
                <p>{selected.summary}</p>
                <p className="lab-note">{selected.evidenceHint}</p>
                <div className="proj-actions">
                {selected.openLabHref ? (
                  <Link className="os-btn os-btn-primary" to={selected.openLabHref}>
                    Open in Lab
                  </Link>
                ) : null}
                {selected.completion === "explicit" ? (
                  <button
                    type="button"
                    className="os-btn os-btn-ghost"
                    disabled={busy !== null || selected.status === "complete"}
                    onClick={() => void onMarkComplete(selected)}
                  >
                    {selected.status === "complete" ? "Complete" : busy === "task" ? "Saving…" : "Mark complete"}
                  </button>
                ) : null}
                </div>

                {selected.completion === "lab_work" || selected.key === "validate_data" ? (
                  <div className="proj-attach">
                    <p className="os-eyebrow">Attach saved lab work</p>
                    {project.availableWork.length === 0 ? (
                      <p>Save work in the Northwind Lab, then attach it here.</p>
                    ) : (
                      <>
                        <label className="lab-sr" htmlFor="proj-work">
                          Saved lab work
                        </label>
                        <select
                          id="proj-work"
                          value={attachId}
                          onChange={(event) => setAttachId(event.target.value)}
                          disabled={busy !== null}
                        >
                          <option value="">Choose saved work</option>
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
                          disabled={!attachId || busy !== null}
                          onClick={() => void onAttach(selected)}
                        >
                          {busy === "attach" ? "Attaching…" : "Attach"}
                        </button>
                      </>
                    )}
                  </div>
                ) : null}

                <div className="proj-evidence">
                  <p className="os-eyebrow">Evidence</p>
                  {selected.evidence ? (
                    <article className="proj-evidence-card">
                      <h3>{selected.evidence.title}</h3>
                      <p>Source: {selected.evidence.source}</p>
                      {selected.evidence.rowCount != null ? <p>Rows returned: {selected.evidence.rowCount}</p> : null}
                      {selected.evidence.validRows != null ? (
                        <p>
                          Valid rows: {selected.evidence.validRows}
                          {selected.evidence.netRevenueLabel ? ` · ${selected.evidence.netRevenueLabel}` : ""}
                        </p>
                      ) : null}
                      <p>Chart: {selected.evidence.chartable ? "yes" : "no"}</p>
                      {selected.evidence.chart ? <LabSqlChart chart={selected.evidence.chart} /> : null}
                      <Link className="os-link" to={selected.evidence.viewHref}>
                        View
                      </Link>
                    </article>
                  ) : (
                    <p>No lab work attached to this task yet.</p>
                  )}
                </div>
              </>
            ) : null}
          </section>

          <section className="lab-results">
            <p className="os-eyebrow">Your analysis</p>
            <h2>Write from the evidence</h2>
            <label htmlFor="proj-finding">Finding</label>
            <p className="lab-note">What did the data show?</p>
            <textarea
              id="proj-finding"
              value={finding}
              onChange={(event) => setFinding(event.target.value)}
              maxLength={1500}
              rows={4}
              disabled={busy !== null}
            />
            <label htmlFor="proj-why">Why it matters</label>
            <p className="lab-note">Why should someone care?</p>
            <textarea
              id="proj-why"
              value={whyItMatters}
              onChange={(event) => setWhyItMatters(event.target.value)}
              maxLength={1500}
              rows={4}
              disabled={busy !== null}
            />
            <label htmlFor="proj-rec">Recommendation</label>
            <p className="lab-note">What action would you suggest based on the evidence?</p>
            <textarea
              id="proj-rec"
              value={recommendation}
              onChange={(event) => setRecommendation(event.target.value)}
              maxLength={1500}
              rows={4}
              disabled={busy !== null}
            />
            {error ? (
              <div className="lab-error" role="alert">
                <p>{error}</p>
              </div>
            ) : null}
            {notice ? <p className="lab-note">{notice}</p> : null}
            <button type="button" className="os-btn os-btn-primary" onClick={() => void onSave()} disabled={busy !== null}>
              {busy === "save" ? "Saving…" : "Save project"}
            </button>
          </section>
        </div>
        <p className="lab-disclaimer">{project.disclaimer}</p>
      </div>
    </div>
  )
}
