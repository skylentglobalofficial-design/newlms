import { useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
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
        <section className="cat-hero" style={{ paddingBottom: 24 }}>
          <div className="cat-rail">
            <div
              style={{
                background: "linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)",
                border: "1px solid rgba(196, 184, 255, 0.45)",
                borderRadius: 20,
                padding: "clamp(26px, 4vw, 38px)",
                color: "#ffffff",
                boxShadow: "0 20px 44px -16px rgba(59, 45, 150, 0.35)",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  color: "#e9d5ff",
                  font: "700 11.5px/1.4 var(--font-mono)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                WORKSHOPS &amp; TOPIC INTENSIVES · ₹99 LIVE SESSIONS = 99 ELIXIR COINS (100% COIN BACK)
              </p>
              <h1
                style={{
                  margin: "0 0 10px",
                  fontSize: "clamp(26px, 3.4vw, 40px)",
                  color: "#ffffff",
                  fontFamily: "var(--font-display)",
                  lineHeight: 1.12,
                }}
              >
                Focused single-skill topic briefs and campus sessions.
              </h1>
              <p
                style={{
                  margin: "0 0 20px",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 15.5,
                  lineHeight: 1.6,
                  maxWidth: 720,
                }}
              >
                Want to join our scheduled weekend ₹99 live builder sessions (with 100% Elixir Coin Back)? Open the Events &amp; Webinars calendar, or explore our standalone workshop syllabi below for campus cohorts and upcoming drops.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link
                  to="/events"
                  style={{
                    padding: "11px 20px",
                    borderRadius: 999,
                    background: "#ffffff",
                    color: "#5142b5",
                    fontWeight: 800,
                    fontSize: 13.5,
                    textDecoration: "none",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.16)",
                  }}
                >
                  Book Scheduled ₹99 Live Workshops (100% Elixir Coin Back) →
                </Link>
                <Link
                  to="/programmes"
                  style={{
                    padding: "11px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.34)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 13.5,
                    textDecoration: "none",
                  }}
                >
                  Browse All 6 Flagship Programmes
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="cat-section" aria-labelledby="ws-list-title">
          <div className="cat-rail">
            <h2 id="ws-list-title" style={{ marginBottom: 14 }}>
              {filtered.length} workshop topic syllabus{filtered.length === 1 ? "" : "es"}
            </h2>
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
              <ul
                style={{
                  listStyle: "none",
                  margin: "20px 0 0",
                  padding: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
                  gap: 18,
                }}
              >
                {filtered.map((workshop) => (
                  <li key={workshop.slug}>
                    <Link
                      to={`/workshops/${workshop.slug}`}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 14,
                        height: "100%",
                        padding: "22px 24px",
                        borderRadius: 16,
                        background: "linear-gradient(180deg, #f6f4ff 0%, #ffffff 100%)",
                        border: "1px solid #ddd6fe",
                        textDecoration: "none",
                        color: "#0f172a",
                        boxShadow: "0 10px 26px -14px rgba(81, 66, 181, 0.14)",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#5142b5", textTransform: "uppercase" }}>
                            {workshop.category} · {workshop.mode} ·{" "}
                            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                              Date not set
                            </span>
                            {workshop.duration}
                          </span>
                          <span style={{ padding: "3px 10px", borderRadius: 999, background: "#dcfce7", border: "1px solid #86efac", color: "#166534", fontSize: 11, fontWeight: 800 }}>
                            ★ +99 Elixir Eligible
                          </span>
                        </div>
                        <strong style={{ display: "block", fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                          {workshop.title}
                        </strong>
                        <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "#475569", lineHeight: 1.55 }}>
                          {workshop.desc}
                        </p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#5142b5" }}>
                        View workshop syllabus →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="cat-fine" style={{ marginTop: 22 }}>
              To book an upcoming weekend live slot with +99 Elixir Coins cashback, open the{" "}
              <Link to="/events">Events &amp; Bootcamps page →</Link>
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
