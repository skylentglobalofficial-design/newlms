import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  fetchCareerEvidenceProject,
  removeCareerEvidenceProject,
  type CareerEvidenceProject,
} from "../../lib/career-api"
import { workspaceErrorMessage } from "../../lib/http"
import { FeedbackBanner, LoadingBlock, primaryButtonStyle, secondaryButtonStyle } from "../../components/career/section-ui"
import { C } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import { CourseProductVisual, evidenceVisualFor } from "../../components/product/ProductLanguage"

const accent = getDomainAccent("career")

function ReflectionBlock({ label, value }: { label: string; value: string }) {
  return (
    <section className="cos-panel">
      <h2>{label}</h2>
      <p
        style={{
          margin: 0,
          color: value.trim() ? C.ink : C.slate,
          fontSize: 14,
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {value.trim() ? value : "Not written yet."}
      </p>
    </section>
  )
}

export default function CareerOSProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<CareerEvidenceProject | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    setError(null)
    void fetchCareerEvidenceProject(id, controller.signal)
      .then(setProject)
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(workspaceErrorMessage(err) || "Could not load this project.")
      })
    return () => controller.abort()
  }, [id])

  async function onRemove() {
    if (!project) return
    setBusy(true)
    setError(null)
    try {
      await removeCareerEvidenceProject(project.id)
      navigate("/career-os/projects")
    } catch (err) {
      setError(workspaceErrorMessage(err) || "Could not remove this project from Career OS.")
      setBusy(false)
    }
  }

  if (!project && !error) {
    return <LoadingBlock label="Loading project evidence…" />
  }

  if (error && !project) {
    return (
      <div className="cos-page">
        <FeedbackBanner tone="error" message={error} />
        <Link to="/career-os/projects" style={{ color: accent.text, fontSize: 13, textDecoration: "none" }}>
          Back to projects
        </Link>
      </div>
    )
  }

  if (!project) return null

  const visual = evidenceVisualFor(project.title, project.context)

  return (
    <div className="cos-page">
      <Link
        to="/career-os/projects"
        style={{ display: "inline-block", marginBottom: 16, color: accent.text, fontSize: 13, textDecoration: "none" }}
      >
        ← Projects
      </Link>
      <div className="cos-project">
        <div>
          {visual ? <CourseProductVisual visual={visual} compact /> : null}
        </div>
        <div>
          <p className="cos-kicker">{project.context}</p>
          <h1>{project.title}</h1>
          <p className="cos-lead">{project.summary}</p>
          {project.dataset ? (
            <p className="cos-artifact-meta" style={{ marginBottom: 18 }}>Dataset: {project.dataset}</p>
          ) : null}

          {project.incompleteMessage ? (
            <div className="cos-panel" style={{ marginBottom: 16 }}>
              {project.incompleteMessage}
            </div>
          ) : null}

          {error ? <FeedbackBanner tone="error" message={error} /> : null}

          {project.workDemonstrated.length > 0 ? (
            <section className="cos-panel">
              <h2>Work demonstrated</h2>
              <ul style={{ margin: 0, paddingLeft: 18, color: C.slate, fontSize: 14, lineHeight: 1.7 }}>
                {project.workDemonstrated.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="cos-panel">
            <h2>Evidence</h2>
            {project.evidence.length === 0 ? (
              <p style={{ margin: 0, color: C.slate, fontSize: 14 }}>No lab analysis is attached yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {project.evidence.map((item) => (
                  <article key={item.key}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 650, color: C.ink }}>{item.title}</h3>
                    <p className="cos-artifact-meta">Source: {item.source}</p>
                    <Link
                      to={item.viewHref}
                      style={{
                        display: "inline-flex",
                        marginTop: 8,
                        padding: "7px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(21,23,26,0.10)",
                        color: accent.text,
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      View analysis
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>

          <ReflectionBlock label={project.reflectionLabels?.finding ?? "What I found"} value={project.reflection.finding} />
          <ReflectionBlock label={project.reflectionLabels?.whyItMatters ?? "Why it matters"} value={project.reflection.whyItMatters} />
          <ReflectionBlock label={project.reflectionLabels?.recommendation ?? "Recommendation"} value={project.reflection.recommendation} />

          <section className="cos-panel">
            <h2>Skills demonstrated</h2>
            {project.skills.length === 0 ? (
              <p style={{ margin: 0, color: C.slate, fontSize: 14 }}>
                Skills appear here when the source project is complete.
              </p>
            ) : (
              <p style={{ margin: 0, color: C.ink, fontSize: 14, lineHeight: 1.6 }}>{project.skills.join(" · ")}</p>
            )}
          </section>

          <section className="cos-panel">
            <p style={{ margin: "0 0 10px", color: C.slate, fontSize: 13, lineHeight: 1.55 }}>
              Source: {project.title}. Removing this from Career OS does not delete your project or lab work.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {project.projectHref ? (
                <Link
                  to={project.projectHref}
                  style={{ ...primaryButtonStyle, display: "inline-flex", alignItems: "center", textDecoration: "none" }}
                >
                  View project
                </Link>
              ) : null}
              {!confirmRemove ? (
                <button type="button" onClick={() => setConfirmRemove(true)} style={{ ...secondaryButtonStyle, marginTop: 0 }}>
                  Remove from Career OS
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => void onRemove()} disabled={busy} style={{ ...secondaryButtonStyle, marginTop: 0 }}>
                    {busy ? "Removing…" : "Confirm remove"}
                  </button>
                  <button type="button" onClick={() => setConfirmRemove(false)} disabled={busy} style={{ ...secondaryButtonStyle, marginTop: 0 }}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
