import { useEffect, useState } from "react"
import { listCareerEvidenceProjects, type CareerEvidenceSummary } from "../../lib/career-api"
import { workspaceErrorMessage } from "../../lib/http"
import CareerEvidenceCard from "../../components/career/CareerEvidenceCard"
import { FeedbackBanner, LoadingBlock } from "../../components/career/section-ui"
import { C } from "../../tokens"

export default function CareerOSProjectsPage() {
  const [projects, setProjects] = useState<CareerEvidenceSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void listCareerEvidenceProjects(controller.signal)
      .then((data) => {
        setProjects(data)
        setError(null)
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(workspaceErrorMessage(err) || "Could not load projects.")
      })
    return () => controller.abort()
  }, [])

  if (!projects && !error) {
    return <LoadingBlock label="Loading your projects…" />
  }

  if (error) {
    return <FeedbackBanner tone="error" message={error} />
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", minWidth: 0 }}>
      <h1
        style={{
          margin: "0 0 8px",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(26px, 3vw, 34px)",
          fontWeight: 700,
          color: C.ink,
        }}
      >
        Projects
      </h1>
      <p style={{ margin: "0 0 22px", color: C.slate, fontSize: 14, lineHeight: 1.6 }}>
        Learner work you chose to keep as Career OS evidence.
      </p>
      {projects && projects.length === 0 ? (
        <p style={{ margin: 0, color: C.slate, fontSize: 14, lineHeight: 1.6, maxWidth: 420 }}>
          Your projects will appear here as you turn learning into evidence.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {projects?.map((project) => (
            <CareerEvidenceCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
