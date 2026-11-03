import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { LearnPillarSubnav } from "../components/product/Architecture"
import { workshops } from "../data"
import "./Catalog.css"

export default function WorkshopsPage() {
  const [category, setCategory] = useState("All")
  const [mode, setMode] = useState("Any mode")

  const categories = [
    "All",
    ...Array.from(new Set(workshops.map((workshop) => workshop.category))),
  ]
  const modes = ["Any mode", "Online", "Offline", "Hybrid"]

  const filtered = workshops.filter((workshop) => {
    const matchCat = category === "All" || workshop.category === category
    const matchMode = mode === "Any mode" || workshop.mode.includes(mode)
    return matchCat && matchMode
  })

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <div className="cat-pillar-bar">
          <div className="cat-rail">
            <LearnPillarSubnav current="workshops" />
          </div>
        </div>
        <section className="cat-hero">
          <div className="cat-rail">
            <p className="cat-label">Workshops &amp; Topic Intensives · ₹99 Live Sessions = 99 Elixir Coins</p>
            <h1 className="cat-h1--display">
              Focused single-skill topic briefs and campus sessions.
            </h1>
            <p className="cat-lead">
              Want to join our scheduled weekend ₹99 live builder sessions (with 100% Elixir Coin Back)? Open the Events &amp; Webinars calendar, or explore our standalone workshop syllabi below for campus cohorts and upcoming drops.
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/events">
                Book Scheduled ₹99 Live Workshops (100% Elixir Coin Back) →
              </Link>
              <Link className="cat-btn cat-btn-ghost" to="/programmes">
                Browse All 6 Flagship Programmes
              </Link>
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="ws-list-title">
          <div className="cat-rail">
            <h2 id="ws-list-title">
              {filtered.length} workshop topic syllabus{filtered.length === 1 ? "" : "es"}
            </h2>
            <div
              className="cat-filters"
              role="group"
              aria-label="Workshop filters"
            >
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
            <div
              className="cat-filters"
              role="group"
              aria-label="Delivery mode"
            >
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
                    <Link className="ws-row ws-row--track" to={`/workshops/${workshop.slug}`}>
                      <span className="ws-date">
                        Cohort &amp; Campus · <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Date not set</span>{workshop.duration}
                      </span>
                      <span className="ws-body">
                        <strong>{workshop.title}</strong>
                        <em>{workshop.category} · {workshop.mode}</em>
                      </span>
                      <span className="ws-meta">+99 Elixir Eligible</span>
                      <span className="ws-state">View syllabus →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="cat-fine">
              To book an upcoming weekend live slot with +99 Elixir Coins cashback, open the{" "}
              <Link to="/events">Events &amp; Bootcamps page →</Link>
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
