import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { workspaceErrorMessage } from "../lib/http"
import { isSignInError, learnerErrorMessage } from "../components/lms/lms-utils"
import {
  attachProjectEvidence,
  completeProjectTask,
  ensureLearnerProject,
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
import LabSqlChart from "../components/labs/LabSqlChart"
import { ProductSlice } from "../components/skylent/primitives"
import "./LearnWorkspace.css"
import "./LabsWorkspace.css"
import "./ProjectWorkspace.css"

function firstOpenTask(project: ProjectWorkspace) {
  return project.tasks.find((task) => task.status === "open") ?? project.tasks[0] ?? null
}

export default function LearnerProjectPage() {
  const { courseSlug, projectType } = useParams<{ courseSlug: string; projectType: string }>()
  const [project, setProject] = useState<ProjectWorkspace | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [finding, setFinding] = useState("")
  const [whyItMatters, setWhyItMatters] = useState("")
  const [recommendation, setRecommendation] = useState("")
  const [attachId, setAttachId] = useState("")
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "forbidden" | "signin">("loading")
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState<"save" | "task" | "attach" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [careerLink, setCareerLink] = useState<CareerProjectLink | null>(null)
  const [careerLinkStatus, setCareerLinkStatus] = useState<"loading" | "ready" | "error">("loading")
  const [careerBusy, setCareerBusy] = useState(false)
  const [careerNotice, setCareerNotice] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setStatus("loading")
    setError(null)
    if (!courseSlug || !projectType) {
      setStatus("error")
      setError("This project could not be opened.")
      return () => controller.abort()
    }
    void ensureLearnerProject(projectType, controller.signal)
      .then((next) => {
        if (next.courseSlug !== courseSlug) {
          throw new Error("This project does not belong to that course.")
        }
        setProject(next)
        setFinding(next.reflection.finding)
        setWhyItMatters(next.reflection.whyItMatters)
        setRecommendation(next.reflection.recommendation)
        setSelectedKey(firstOpenTask(next)?.key ?? next.tasks[0]?.key ?? null)
        setStatus("ready")
        setCareerLinkStatus("loading")
        void fetchCareerLinkForLearnerProject(next.id, controller.signal)
          .then((link) => {
            setCareerLink(link)
            setCareerLinkStatus("ready")
          })
          .catch(() => {
            // Unknown, not "not added": the page must not offer to add it again on a failed check.
            if (!controller.signal.aborted) {
              setCareerLink(null)
              setCareerLinkStatus("error")
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
  }, [courseSlug, projectType, attempt])

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
      setError(learnerErrorMessage(err, "That task could not be marked complete. Try again in a moment."))
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
    setBusy("save")
    setError(null)
    setNotice(null)
    try {
      applyProject(await saveProject(project.id, { finding, whyItMatters, recommendation }), true)
      setNotice("Project saved.")
    } catch (err) {
      setError(learnerErrorMessage(err, "Your project could not be saved. Your text is still here. Try again."))
    } finally {
      setBusy(null)
    }
  }

  if (status === "loading") {
    return (
      <div className="lab-shell">
        <div className="lab-empty">
          <div className="os-state-skeleton" role="status" aria-label="Loading the project">
            <span className="os-skeleton" style={{ width: "30%" }} />
            <span className="os-skeleton" style={{ height: 28, width: "70%" }} />
            <span className="os-skeleton" />
          </div>
        </div>
      </div>
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
      <div className="lab-shell">
        <div className="lab-empty">
          <p className="os-eyebrow">Project</p>
          <h1>{status === "forbidden" ? "Enrol in this course to open the project" : "This project could not be opened"}</h1>
          <p>{error}</p>
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
    )
  }

  return (
    <div className="lab-shell proj-shell">
      <header className="lab-top">
        <Link className="lab-brand" to={learnerProjectPath(project.courseSlug, project.projectType)}>
          <strong>{project.title}</strong>
          <span>Project · {project.courseTitle}</span>
        </Link>
        <div className="sky-on-navy lab-slice">
          <ProductSlice steps={["Learn", "Practice", "Build", "Prove"]} current="Build" label="Where this project sits" />
        </div>
        <div className="lab-top-actions">
          <Link className="os-btn os-btn-ghost" to={`/learn/${project.courseSlug}`}>
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
          {project.labEnabled ? "Dataset" : "Case"}: <strong>{project.dataset}</strong>
          {project.caseHref ? (
            <>
              {" "}
              <a className="os-link" href={project.caseHref} download>
                Open
              </a>
            </>
          ) : null}
        </p>
        <p>
          Status:{" "}
          <span className={project.status === "ready_to_review" ? "os-status is-done" : project.status === "not_started" ? "os-status is-idle" : "os-status"}>
            {projectStatusLabel(project.status)}
          </span>
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
        ) : careerLinkStatus === "loading" ? (
          <p>Checking Career OS…</p>
        ) : careerLinkStatus === "error" ? (
          <p>Career OS could not be checked for this project. Reload the page to try again.</p>
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

                {selected.completion === "lab_work" || (project.labEnabled && selected.key === "validate_data") ? (
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
                    <p>{project.labEnabled ? "No lab work attached to this task yet." : "This project is written work. There is no lab attachment."}</p>
                  )}
                </div>
              </>
            ) : null}
          </section>

          <section className="lab-results">
            <p className="os-eyebrow">Your analysis</p>
            <h2>{project.labEnabled ? "Write from the evidence" : "Write the product case"}</h2>
            <label htmlFor="proj-finding">{project.reflectionLabels.finding}</label>
            <p className="lab-note">{project.reflectionHints.finding}</p>
            <textarea
              id="proj-finding"
              value={finding}
              onChange={(event) => setFinding(event.target.value)}
              maxLength={1500}
              rows={4}
              disabled={busy !== null}
            />
            <label htmlFor="proj-why">{project.reflectionLabels.whyItMatters}</label>
            <p className="lab-note">{project.reflectionHints.whyItMatters}</p>
            <textarea
              id="proj-why"
              value={whyItMatters}
              onChange={(event) => setWhyItMatters(event.target.value)}
              maxLength={1500}
              rows={4}
              disabled={busy !== null}
            />
            <label htmlFor="proj-rec">{project.reflectionLabels.recommendation}</label>
            <p className="lab-note">{project.reflectionHints.recommendation}</p>
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
