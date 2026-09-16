import { useEffect, useState } from "react"
import { listCareerEvidenceProjects, type CareerEvidenceSummary } from "../../lib/career-api"
import { workspaceErrorMessage } from "../../lib/http"
import CareerEvidenceCard from "../../components/career/CareerEvidenceCard"
import { FeedbackBanner, LoadingBlock } from "../../components/career/section-ui"

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
    <div className="cos-page">
      <h1>Projects</h1>
      <p className="cos-lead">Learner work you chose to keep as Career OS evidence.</p>
      {projects && projects.length === 0 ? (
        <p className="cos-lead">Your projects will appear here as you turn learning into evidence.</p>
      ) : (
        <div className="cos-grid">
          {projects?.map((project) => (
            <CareerEvidenceCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
