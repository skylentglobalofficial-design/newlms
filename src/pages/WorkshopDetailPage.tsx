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
              ← Workshops Topic Catalogue
            </Link>
            <p className="cat-label">Workshop Topic Syllabus · Live Weekend &amp; Institutional Track</p>
            <h1>{workshop.title}</h1>
            <p className="cat-lead">{workshop.desc}</p>

            <dl className="pd-facts">
              <div>
                <dt>Schedule</dt>
                <dd>Weekend Cohort (/events) or Custom Institutional Date</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{workshop.duration}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{workshop.mode}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>₹99 Weekend Bootcamp (+99 Elixir Coins) or Cohort Request</dd>
              </div>
            </dl>

            <p className="cat-honesty">
              Looking for a confirmed weekend slot you can book immediately? Open our scheduled ₹99 Weekend Bootcamps (with +99 Elixir Coins 100% credit), or request this topic for your college or team cohort.
            </p>
            <div className="cat-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="cat-btn cat-btn-primary" to="/events">
                Book Scheduled ₹99 Live Bootcamp →
              </Link>
              <Link className="cat-btn cat-btn-ghost" to="/contact?for=institution">
                Request Custom Cohort Session
              </Link>
            </div>
          </div>
        </section>

        {outline.length > 0 ? (
          <section className="cat-section" aria-labelledby="ws-outline-title">
            <div className="cat-rail">
              <p className="cat-label">Session Syllabus</p>
              <h2 id="ws-outline-title">What this workshop covers</h2>
              <p className="cat-fine">Structured hands-on exercises and practical frameworks covered during the session.</p>
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
