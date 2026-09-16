import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  fetchCareerEvidenceProject,
  removeCareerEvidenceProject,
  type CareerEvidenceProject,
} from "../../lib/career-api"
import { workspaceErrorMessage } from "../../lib/http"
import { FeedbackBanner, LoadingBlock, primaryButtonStyle, secondaryButtonStyle } from "../../components/career/section-ui"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"

const accent = getDomainAccent("career")

function ReflectionBlock({ label, value }: { label: string; value: string }) {
  return (
    <section style={{ minWidth: 0 }}>
      <h2
        style={{
          margin: "0 0 8px",
          fontFamily: "var(--font-display)",
          fontSize: 16,
          fontWeight: 650,
          color: C.ink,
        }}
      >
        {label}
      </h2>
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
      <div style={{ maxWidth: 640 }}>
        <FeedbackBanner tone="error" message={error} />
        <Link to="/career-os/projects" style={{ color: accent.text, fontSize: 13, textDecoration: "none" }}>
          Back to projects
        </Link>
      </div>
    )
  }

  if (!project) return null

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", minWidth: 0 }}>
      <Link
        to="/career-os/projects"
        style={{ display: "inline-block", marginBottom: 16, color: accent.text, fontSize: 13, textDecoration: "none" }}
      >
        ← Projects
      </Link>
      <p
        style={{
          margin: "0 0 6px",
          color: accent.text,
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "var(--font-mono)",
        }}
      >
        {project.context}
      </p>
      <h1
        style={{
          margin: "0 0 10px",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(26px, 3vw, 34px)",
          fontWeight: 700,
          color: C.ink,
          letterSpacing: "-0.03em",
          overflowWrap: "anywhere",
        }}
      >
        {project.title}
      </h1>
      <p style={{ margin: "0 0 8px", color: C.slate, fontSize: 14, lineHeight: 1.6 }}>{project.summary}</p>
      {project.dataset ? (
        <p style={{ margin: "0 0 18px", color: C.slate, fontSize: 13 }}>Dataset: {project.dataset}</p>
      ) : null}

      {project.incompleteMessage ? (
        <div
          style={{
            marginBottom: 20,
            padding: "12px 14px",
            borderRadius: T.rControl,
            border: `1px solid ${T.lineDark}`,
            background: C.cream,
            color: C.ink,
            fontSize: 13.5,
            lineHeight: 1.55,
          }}
        >
          {project.incompleteMessage}
        </div>
      ) : null}

      {error ? <FeedbackBanner tone="error" message={error} /> : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {project.workDemonstrated.length > 0 ? (
          <section>
            <h2 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 650, color: C.ink }}>
              Work demonstrated
            </h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: C.slate, fontSize: 14, lineHeight: 1.7 }}>
              {project.workDemonstrated.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 style={{ margin: "0 0 10px", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 650, color: C.ink }}>
            Evidence
          </h2>
          {project.evidence.length === 0 ? (
            <p style={{ margin: 0, color: C.slate, fontSize: 14 }}>No lab analysis is attached yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {project.evidence.map((item) => (
                <article
                  key={item.key}
                  style={{
                    padding: "14px 16px",
                    borderRadius: T.rControl,
                    border: `1px solid ${T.lineDark}`,
                    background: C.white,
                    minWidth: 0,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 650, color: C.ink }}>{item.title}</h3>
                  <p style={{ margin: "6px 0 10px", color: C.slate, fontSize: 13 }}>Source: {item.source}</p>
                  <Link
                    to={item.viewHref}
                    style={{
                      display: "inline-flex",
                      padding: "7px 12px",
                      borderRadius: T.rControl,
                      border: `1px solid ${T.lineDark}`,
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

        <section>
          <h2 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 650, color: C.ink }}>
            Skills demonstrated
          </h2>
          {project.skills.length === 0 ? (
            <p style={{ margin: 0, color: C.slate, fontSize: 14 }}>
              Skills appear here when the source project is complete.
            </p>
          ) : (
            <p style={{ margin: 0, color: C.ink, fontSize: 14, lineHeight: 1.6 }}>{project.skills.join(" · ")}</p>
          )}
        </section>

        <section>
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
  )
}
