import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
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

  const head = (
    <header className="cos-head">
      <span className="cos-eyebrow">Career OS · Projects</span>
      <h1>Projects</h1>
      <p>Learner work you chose to keep as Career OS evidence.</p>
    </header>
  )

  if (error) {
    return (
      <div className="cos-page">
        {head}
        <div className="cos-state">
          <FeedbackBanner tone="error" message={error} />
          <Link to="/career-os">Back to Career OS overview</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cos-page">
      {head}
      {projects && projects.length === 0 ? (
        <div>
          <section className="cos-keep" aria-labelledby="cos-keep-title">
            <div className="cos-keep__head">
              <h2 id="cos-keep-title">Nothing kept yet</h2>
              <span className="cos-eyebrow" style={{ margin: 0 }}>0 kept</span>
            </div>
            <ul className="cos-keep__list">
              <li>
                <strong>Data Analytics</strong>
                <span>Northwind commercial review — kept from the capstone when you add it.</span>
              </li>
              <li>
                <strong>Product Management</strong>
                <span>Harbor Desk product case — kept from the product case when you add it.</span>
              </li>
            </ul>
            <p className="cos-keep__note">Work samples from Data Analytics and Product Management appear here when you add them from a completed project. Nothing is invented.</p>
          </section>
          <Link className="cos-empty-cta" to="/dashboard/student">Open learner dashboard</Link>
        </div>
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
