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

  /**
   * Workshop delivery is not built, so outline entries that promise a delivery
   * mechanism — a certificate, a recording, a live coach — are not shown. What
   * remains is the intended subject matter.
   */
  const outline = workshop.whatYouGet.filter(
    (item) => !/certificate|recording|live\b|coach|practitioner|q&a/i.test(item),
  )

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail ws-detail">
            <Link className="cat-back" to="/workshops">
              ← Workshops
            </Link>
            <p className="cat-label">Workshop · coming soon</p>
            <h1>{workshop.title}</h1>
            <p className="cat-lead">{workshop.desc}</p>

            <dl className="pd-facts">
              <div>
                <dt>Planned date</dt>
                <dd>{workshop.date}</dd>
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
                <dt>Registration</dt>
                <dd>Not open</dd>
              </div>
            </dl>

            <p className="cat-honesty">
              Indicative price ₹{workshop.price.toLocaleString("en-IN")}. Payment is not collected. This is not a
              scheduled session you can book.
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-ghost" to="/contact">
                Contact us about workshops
              </Link>
            </div>
          </div>
        </section>

        {outline.length > 0 ? (
          <section className="cat-section" aria-labelledby="ws-outline-title">
            <div className="cat-rail">
              <p className="cat-label">Intended outline</p>
              <h2 id="ws-outline-title">What the session is intended to cover</h2>
              <p className="cat-fine">Planned subject matter. Nothing here is scheduled or delivered yet.</p>
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
