import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { workshops } from "../data"
import "./Catalog.css"
import "./WorkshopsPage.css"

export default function WorkshopsPage() {
  const [category, setCategory] = useState("All")
  const [mode, setMode] = useState("Any mode")

  const categories = ["All", ...Array.from(new Set(workshops.map((workshop) => workshop.category)))]
  const modes = ["Any mode", "Online", "Offline", "Hybrid"]

  const filtered = workshops.filter((workshop) => {
    const matchCat = category === "All" || workshop.category === category
    const matchMode = mode === "Any mode" || workshop.mode.includes(mode)
    return matchCat && matchMode
  })

  return (
    <PageShell aurora={false}>
      <div className="cat-page workshops-editorial">
        <section className="cat-hero workshops-hero">
          <div className="cat-rail workshops-hero-grid">
            <div>
              <p className="workshops-eyebrow"><i aria-hidden="true" /> Workshops</p>
              <h1>Short sessions.<br />One focused skill.</h1>
            <p className="cat-lead">
              Workshops are event-shaped: a date, a duration, and a single skill. None of these sessions are
              scheduled for delivery yet, and nothing on this page can be booked.
            </p>
            <p className="cat-honesty">
              Dates and prices are indicative planning information. Attendance, payment, and certificates are not
              built.
            </p>
            </div>
            <div className="workshops-hero-note">
              <span>Coming soon</span>
              <strong>Event-shaped learning, without pretending an event is live.</strong>
              <p>Each listing has a subject, duration and delivery mode. Registration remains closed until delivery is actually scheduled.</p>
            </div>
          </div>
        </section>

        <section className="cat-section workshops-list-section" aria-labelledby="ws-list-title">
          <div className="cat-rail">
            <div className="workshops-section-head"><div><p className="workshops-label">Planned catalogue</p><h2 id="ws-list-title">{filtered.length} planned workshop{filtered.length === 1 ? "" : "s"}</h2></div><p>Filter the programme shape, not an imaginary booking inventory.</p></div>
            <div className="workshops-filters" role="group" aria-label="Workshop filters">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={category === item ? "is-on" : ""}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="cat-filters" role="group" aria-label="Delivery mode">
              {modes.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={mode === item ? "is-on" : ""}
                  aria-pressed={mode === item}
                  onClick={() => setMode(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="cat-empty">No workshops match these filters.</p>
            ) : (
              <ul className="ws-list">
                {filtered.map((workshop) => (
                  <li key={workshop.slug}>
                    <Link className="ws-row" to={`/workshops/${workshop.slug}`}>
                      <span className="ws-date">{workshop.date}</span>
                      <span className="ws-body">
                        <strong>{workshop.title}</strong>
                        <em>{workshop.category}</em>
                      </span>
                      <span className="ws-meta">{workshop.mode}</span>
                      <span className="ws-meta">{workshop.duration}</span>
                      <span className="ws-state">Not open</span>
                      <span className="ws-price">₹{workshop.price.toLocaleString("en-IN")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="workshops-fine">Indicative prices. Payment is not collected.</p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
