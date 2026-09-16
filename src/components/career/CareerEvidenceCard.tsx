import { Link } from "react-router-dom"
import { C, T } from "../../tokens"
import { getDomainAccent } from "../../aurora-themes"
import type { CareerEvidenceSummary } from "../../lib/career-api"

const accent = getDomainAccent("career")

export default function CareerEvidenceCard({ project }: { project: CareerEvidenceSummary }) {
  return (
    <article
      style={{
        padding: "18px 18px 16px",
        borderRadius: T.rCard,
        border: `1px solid ${T.lineDark}`,
        background: C.white,
        minWidth: 0,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 650,
          color: C.ink,
          letterSpacing: "-0.03em",
          overflowWrap: "anywhere",
        }}
      >
        {project.title}
      </h3>
      <p style={{ margin: "6px 0 0", color: C.slate, fontSize: 13 }}>{project.context || "Learner project"}</p>
      {project.skills.length > 0 ? (
        <p style={{ margin: "12px 0 0", color: C.ink, fontSize: 13, lineHeight: 1.5 }}>
          {project.skills.join(" · ")}
        </p>
      ) : null}
      <p style={{ margin: "10px 0 0", color: C.slate, fontSize: 13 }}>
        {project.evidenceCount} evidence item{project.evidenceCount === 1 ? "" : "s"}
      </p>
      {project.incompleteMessage ? (
        <p style={{ margin: "10px 0 0", color: C.danger, fontSize: 13, lineHeight: 1.5 }}>
          {project.incompleteMessage}
        </p>
      ) : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        <Link
          to={project.href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 14px",
            borderRadius: T.rControl,
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
    </article>
  )
}
