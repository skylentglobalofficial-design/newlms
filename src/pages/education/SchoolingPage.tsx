import { Link } from "react-router-dom"
import AcademicPageShell from "./AcademicPageShell"
import { LinePageHeader, PathwayModel } from "../../components/product/Architecture"
import { SCHOOLING_PATHWAY } from "../../lib/product-architecture"
import { C, T } from "../../tokens"

const bands = [
  {
    band: "Foundation Stage",
    grades: "Grades 6–8",
    focus: "Computational Thinking & Data Literacy",
    subjects: "Logical problem decomposition, spreadsheet modelling, foundational Python blocks, and quantitative reasoning.",
  },
  {
    band: "Secondary Stage",
    grades: "Grades 9–10",
    focus: "Structured Programming & Relational Data",
    subjects: "CBSE/ICSE-aligned Computer Applications, Python scripting, relational SQL tables, and structured project documentation.",
  },
  {
    band: "Senior Secondary (STEM)",
    grades: "Grades 11–12",
    focus: "Computer Science, SQL & Applied AI",
    subjects: "Python data pipelines, PostgreSQL queries, API fundamentals, and ethical AI literacy aligned with NEP 2020.",
  },
  {
    band: "Senior Secondary (Commerce & Arts)",
    grades: "Grades 11–12",
    focus: "Business Analytics & Product Thinking",
    subjects: "Commercial spreadsheet analysis, business metrics, case problem framing, and digital portfolio building.",
  },
]

export default function SchoolingPage() {
  return (
    <AcademicPageShell current="schooling">
      <LinePageHeader
        kicker="Education · K–12 Institutional Foundation (NEP 2020 Aligned)"
        maturity="coming_soon"
        title="Computational thinking and data literacy for schools."
        lead="Structured Grades 6–12 curriculum tracks designed for partner schools to integrate browser-based Python, SQL, and analytical case labs alongside board academics."
      />
      <section className="arch-section" style={{ marginTop: 12 }}>
        <div
          style={{
            padding: "20px 24px",
            borderRadius: 14,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ maxWidth: "46em" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5142B5", marginBottom: 4 }}>
              Partner School Deployment · Zero Lab Hardware Overhead
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>
              Schools deploy Skylent OS directly in existing computer labs via browser — no local database or Python installation required.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/contact?for=institution" className="sk-btn sk-btn-primary" style={{ fontSize: 13 }}>
              Partner as a School →
            </Link>
            <Link to="/programmes" className="sk-btn sk-btn-secondary" style={{ fontSize: 13 }}>
              Explore Live Tracks
            </Link>
          </div>
        </div>
      </section>
      <section className="arch-section">
        <PathwayModel title="K–12 progression model" steps={SCHOOLING_PATHWAY} />
      </section>
      <section className="arch-section">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 16 }}>NEP 2020 Grade Bands &amp; Lab Modules</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }} className="arch-grade-grid">
          {bands.map((row) => (
            <div
              key={row.band}
              style={{
                padding: "18px",
                borderRadius: 12,
                background: "#ffffff",
                border: `1px solid ${T.lineDark}`,
                minWidth: 0,
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#5142B5", textTransform: "uppercase" }}>
                {row.grades}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: C.ink, margin: "4px 0" }}>
                {row.band}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#334155", marginBottom: 8 }}>
                {row.focus}
              </div>
              <div style={{ color: C.slate, fontSize: 13, lineHeight: 1.5 }}>{row.subjects}</div>
            </div>
          ))}
        </div>
        <style>{`@media (max-width: 900px) { .arch-grade-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 560px) { .arch-grade-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>
    </AcademicPageShell>
  )
}
