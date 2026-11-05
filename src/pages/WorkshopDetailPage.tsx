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
        <section className="cat-hero" style={{ paddingBottom: 24 }}>
          <div className="cat-rail ws-detail">
            <Link className="cat-back" to="/workshops">
              ← All Workshops
            </Link>
            <div
              style={{
                marginTop: 12,
                background: "linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)",
                border: "1px solid rgba(196, 184, 255, 0.45)",
                borderRadius: 20,
                padding: "clamp(26px, 4vw, 36px)",
                color: "#ffffff",
                boxShadow: "0 20px 44px -16px rgba(59, 45, 150, 0.35)",
              }}
            >
              <p style={{ margin: "0 0 8px", color: "#e9d5ff", font: "700 11.5px/1.4 var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                WORKSHOP TOPIC SYLLABUS · LIVE WEEKEND &amp; INSTITUTIONAL TRACK
              </p>
              <h1 style={{ margin: "0 0 10px", fontSize: "clamp(26px, 3.2vw, 38px)", color: "#ffffff", fontFamily: "var(--font-display)" }}>
                {workshop.title}
              </h1>
              <p style={{ margin: "0 0 20px", color: "rgba(255,255,255,0.9)", fontSize: 15.5, lineHeight: 1.6, maxWidth: 720 }}>
                {workshop.desc}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {[
                  ["Schedule", "Weekend Cohort (/events) or Custom Campus Date"],
                  ["Duration", workshop.duration],
                  ["Mode", workshop.mode],
                  ["Access", "₹99 Live Bootcamp (+99 Elixir Coins)"],
                ].map(([dt, dd]) => (
                  <div
                    key={dt}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "rgba(15, 23, 42, 0.32)",
                      border: "1px solid rgba(255,255,255,0.18)",
                    }}
                  >
                    <span style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "#e9d5ff", textTransform: "uppercase" }}>
                      {dt}
                    </span>
                    <strong style={{ display: "block", fontSize: 13.5, color: "#ffffff", marginTop: 3 }}>{dd}</strong>
                  </div>
                ))}
              </div>

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
                  Book Scheduled ₹99 Live Workshop →
                </Link>
                <Link
                  to="/contact?for=institution"
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
                  Request for Campus Cohort
                </Link>
              </div>
            </div>
          </div>
        </section>

        {outline.length > 0 ? (
          <section className="cat-section" aria-labelledby="ws-outline-title">
            <div className="cat-rail">
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderTop: "4px solid #5142b5",
                  borderRadius: 16,
                  padding: "24px 26px",
                  boxShadow: "0 10px 28px -12px rgba(15, 23, 42, 0.08)",
                }}
              >
                <p className="cat-label" style={{ color: "#5142b5", margin: 0 }}>Session syllabus</p>
                <h2 id="ws-outline-title" style={{ margin: "4px 0 6px" }}>Core topics covered in this module</h2>
                <p className="cat-fine" style={{ marginBottom: 16 }}>Structured topic breakdown for cohort and campus sessions.</p>
                <ul className="pd-outcomes">
                  {outline.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </PageShell>
  )
}
