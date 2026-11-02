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
              <p className="cat-lead">This exam path is not in Skylent yet.</p>
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
            <p className="cat-label">Competitive Exams · {exam.group}</p>
            <h1>{exam.title}</h1>
            <p className="cat-lead">{exam.summary}</p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/education/exams">See all exam paths</Link>
              <Link className="cat-btn cat-btn-ghost" to="/">Back to Skylent</Link>
            </div>
            <p className="cat-honesty">
              No faculty, mock tests, score predictors, or placement claims are shown here because they are not built.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
