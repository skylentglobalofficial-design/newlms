import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { workshops } from "../data"
import "./Catalog.css"

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
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <p className="cat-label">Workshops · coming soon</p>
            <h1>Short sessions. Planned subjects. Registration not open.</h1>
            <p className="cat-lead">
              Workshops are event-shaped: a date, a duration, and a single skill. None of these sessions are
              scheduled for delivery yet, and nothing on this page can be booked.
            </p>
            <p className="cat-honesty">
              Workshops are not scheduled. Attendance, payment, and certificates are not built.
            </p>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="ws-list-title">
          <div className="cat-rail">
            <h2 id="ws-list-title">{filtered.length} planned workshop{filtered.length === 1 ? "" : "s"}</h2>
            <div className="cat-filters" role="group" aria-label="Workshop filters">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={category === item ? "cat-chip is-on" : "cat-chip"}
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
                  className={mode === item ? "cat-chip is-on" : "cat-chip"}
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
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="cat-fine">Registration is not open. Payment is not collected.</p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
