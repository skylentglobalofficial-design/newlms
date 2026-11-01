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
            <p className="cat-label">Focused Skill Sessions · Live Weekend Bootcamps on /events</p>
            <h1 className="cat-h1--display">
              Focused single-topic workshop outlines.
            </h1>
            <p className="cat-lead">
              Browse our single-topic workshop curriculum below. Looking to book a scheduled weekend live session with 99 Elixir Coins (100% learning credit)? Open the live events calendar.
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/events">
                Book Scheduled ₹99 Live Bootcamps →
              </Link>
              <Link className="cat-btn cat-btn-ghost" to="/programmes">
                Browse programmes
              </Link>
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="ws-list-title">
          <div className="cat-rail">
            <h2 id="ws-list-title">
              {filtered.length} workshop topic{filtered.length === 1 ? "" : "s"}
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
                    <Link className="ws-row" to={`/workshops/${workshop.slug}`}>
                      <span className="ws-date">Date not set</span>
                      <span className="ws-body">
                        <strong>{workshop.title}</strong>
                        <em>{workshop.category}</em>
                      </span>
                      <span className="ws-meta">{workshop.mode}</span>
                      <span className="ws-meta">{workshop.duration}</span>
                      <span className="ws-state">Topic outline →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="cat-fine">
              Scheduled weekend sessions open for registration on the <Link to="/events">Events &amp; Bootcamps</Link> page.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
