import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import "./Catalog.css"

/** Thin public stub — replaces the old linked-course catalogue landing at /programs. */
export default function ProgramsPage() {
  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <p className="cat-label">Programs · Professional Certificate Programs</p>
            <h1>The Professional Certificate Programs landing is being rebuilt.</h1>
            <p className="cat-lead">
              Skylent Programs are structured pathways in Skylent OS — written lessons, practice, projects, and evidence you keep. They are not a grid of courses linked together.
            </p>
            <p className="cat-fine">
              The previous catalogue page (“programmes built from courses you can open”) no longer represents this product. A new landing will explain the model first, then the programs that exist.
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/programs/data-analytics-pro">Data Analytics program</Link>
              <Link className="cat-btn cat-btn-ghost" to="/programs/product-management">Product Management program</Link>
            </div>
            <div className="cat-actions" style={{ marginTop: 12 }}>
              <Link className="cat-btn cat-btn-ghost" to="/workshops">Workshops</Link>
              <Link className="cat-btn cat-btn-ghost" to="/">Back to Skylent</Link>
            </div>
            <p className="cat-honesty">
              Only Data Analytics and Product Management have authored teaching today. No open-listings grid, ratings, or placement claims appear here.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
