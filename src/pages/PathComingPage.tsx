import { Link, useParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { EXAM_STUBS } from "../lib/product-architecture"
import "./Catalog.css"

export default function PathComingPage() {
  const { slug } = useParams()
  const exam = slug ? EXAM_STUBS[slug] : undefined

  if (!exam) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <p className="cat-label">Competitive Exams</p>
              <h1>Path not found</h1>
              <p className="cat-lead">This exam path is not in the catalogue yet.</p>
              <Link className="cat-btn cat-btn-ghost" to="/education/exams">Back to competitive exams</Link>
            </div>
          </section>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <p className="cat-label">Competitive Exams · {exam.group} · Roadmap Track</p>
            <h1>{exam.title}</h1>
            <p className="cat-lead">{exam.summary}</p>
            <p className="cat-honesty">
              This competitive exam track is on the Skylent curriculum roadmap. Register your interest via our contact page for cohort updates, or explore our open professional programmes today.
            </p>
            <div className="cat-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="cat-btn cat-btn-primary" to="/contact">Register Interest →</Link>
              <Link className="cat-btn cat-btn-ghost" to="/education/exams">See all exam paths</Link>
              <Link className="cat-btn cat-btn-ghost" to="/programmes">Explore open programmes</Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
