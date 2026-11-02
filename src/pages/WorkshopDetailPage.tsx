import { Link, useParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { workshops } from "../data"
import "./Catalog.css"

export default function WorkshopDetailPage() {
  const { slug } = useParams()
  const workshop = workshops.find((item) => item.slug === slug)

  if (!workshop) {
    return (
      <PageShell aurora={false}>
        <div className="cat-page">
          <section className="cat-hero">
            <div className="cat-rail">
              <h1>Workshop not found</h1>
              <Link className="cat-btn cat-btn-ghost" to="/workshops">
                Back to workshops
              </Link>
            </div>
          </section>
        </div>
      </PageShell>
    )
  }

  const outline = workshop.whatYouGet

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail ws-detail">
            <Link className="cat-back" to="/workshops">
              ← Workshops
            </Link>
            <p className="cat-label">Workshop Topic Syllabus · Live Weekend &amp; Institutional Track</p>
            <h1>{workshop.title}</h1>
            <p className="cat-lead">{workshop.desc}</p>

            <dl className="pd-facts">
              <div>
                <dt>Schedule</dt>
                <dd>Weekend Cohort (/events) or Custom Campus Date</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{workshop.duration}</dd>
              </div>
              <div>
                <dt>Mode</dt>
                <dd>{workshop.mode}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>₹99 Live Bootcamp (+99 Elixir Coins) or Cohort Request</dd>
              </div>
            </dl>

            <p className="cat-honesty">
              To join an active ₹99 live weekend workshop track (with 100% Elixir Coin cashback), visit our scheduled Events page, or contact our team to request this topic for your campus cohort.
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/events">
                Book Scheduled ₹99 Live Workshop →
              </Link>
              <Link className="cat-btn cat-btn-ghost" to="/contact?for=institution">
                Request for Campus Cohort
              </Link>
            </div>
          </div>
        </section>

        {outline.length > 0 ? (
          <section className="cat-section" aria-labelledby="ws-outline-title">
            <div className="cat-rail">
              <p className="cat-label">Session syllabus</p>
              <h2 id="ws-outline-title">Core topics covered in this module</h2>
              <p className="cat-fine">Structured topic breakdown for cohort and campus sessions.</p>
              <ul className="pd-outcomes">
                {outline.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </PageShell>
  )
}
