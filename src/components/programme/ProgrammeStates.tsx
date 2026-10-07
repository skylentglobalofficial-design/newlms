/** Loading, not-found and error states for the programme detail page. */
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import "./ProfessionalProgrammeTemplate.css"

function Crumb() {
  return (
    <nav className="sky-label pp-crumb" aria-label="Breadcrumb">
      <Link to="/programmes">Programmes</Link>
    </nav>
  )
}

/** Skeleton in the shape of the hero and the spec strip. */
export function ProgrammeSkeleton() {
  return (
    <div className="pp-page" aria-busy="true">
      <section className="sky-container pp-hero">
        <div className="pp-hero__copy">
          <Crumb />
          <h1 className="pp-sr">Loading this programme</h1>
          <div className="pp-skel" aria-hidden="true">
            <span className="sky-skeleton pp-skel-h" />
            <span className="sky-skeleton pp-skel-h" style={{ width: "72%" }} />
            <span className="sky-skeleton" style={{ width: "92%", marginTop: 18 }} />
            <span className="sky-skeleton" style={{ width: "64%" }} />
            <span className="sky-skeleton pp-skel-btn" />
          </div>
        </div>
        <div className="sky-mat pp-hero__plate" aria-hidden="true">
          <div className="sky-plate">
            <div className="sky-plate__inner pp-skel-plate" />
          </div>
        </div>
      </section>
    </div>
  )
}

/** A plain sentence and one way out. Used for an unknown slug and for a failed request. */
export function ProgrammeMessage({
  title,
  children,
  actions,
  alert = false,
}: {
  title: string
  children: ReactNode
  actions: ReactNode
  alert?: boolean
}) {
  return (
    <div className="pp-page">
      <section className="sky-container pp-message" role={alert ? "alert" : undefined}>
        <Crumb />
        <h1 className="pp-h1">{title}</h1>
        <p className="pp-lede">{children}</p>
        <div className="pp-actions">{actions}</div>
      </section>
    </div>
  )
}
