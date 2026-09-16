import { Link } from "react-router-dom"
import { C } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { CareerEvidenceSummary } from "../../lib/career-api"
import { CourseThumb, evidenceVisualFor } from "../product/ProductLanguage"

const accent = getDomainAccent("career")

export default function CareerEvidenceCard({ project }: { project: CareerEvidenceSummary }) {
  const visual = evidenceVisualFor(project.title, project.context)

  return (
    <article className="cos-artifact">
      <div className="cos-artifact-stage" aria-hidden="true">
        <CourseThumb authored={Boolean(visual)} visual={visual ?? "northwind"} />
      </div>
      <div className="cos-artifact-body">
        <h3>{project.title}</h3>
        <p className="cos-artifact-meta">{project.context || "Learner project"}</p>
        {project.skills.length > 0 ? (
          <p className="cos-artifact-skills">{project.skills.join(" · ")}</p>
        ) : null}
        <p className="cos-artifact-meta">
          {project.evidenceCount} evidence item{project.evidenceCount === 1 ? "" : "s"}
        </p>
        {project.incompleteMessage ? (
          <p className="cos-artifact-meta" style={{ color: C.danger }}>
            {project.incompleteMessage}
          </p>
        ) : null}
        <div className="cos-artifact-actions">
          <Link
            to={project.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 14px",
              borderRadius: 8,
              background: accent.primary,
              color: C.white,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View project
          </Link>
        </div>
      </div>
    </article>
  )
}
