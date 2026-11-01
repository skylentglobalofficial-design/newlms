import AcademicPageShell from "./AcademicPageShell"
import { LinePageHeader, PathwayModel, UpcomingBanner } from "../../components/product/Architecture"
import { SCHOOLING_PATHWAY } from "../../lib/product-architecture"
import { C, T } from "../../tokens"

const bands = [
  { band: "Primary", grades: "1–5", subjects: "Mathematics, science, language, and foundational logic" },
  { band: "Middle", grades: "6–8", subjects: "Mathematics, sciences, structured writing, and computing basics" },
  { band: "Secondary", grades: "9–10", subjects: "Board-aligned core subjects plus applied data & IT" },
  { band: "Senior", grades: "11–12", subjects: "Stream subjects, electives, and practical lab portfolios" },
]

export default function SchoolingPage() {
  return (
    <AcademicPageShell current="schooling">
      <LinePageHeader
        kicker="Education · Schooling (Grades 1–12)"
        maturity="coming_soon"
        title="Structured K–12 academic progression for partner schools."
        lead="Schooling on Skylent is designed as a grade-and-subject progression for partner schools and academic cohorts—focused on concept mastery, structured practice, and clear academic foundations."
      />
      <UpcomingBanner
        title="Partner school & institutional cohort track"
        body="Grade bands below outline our K–12 curriculum architecture for school partnerships. Contact our partnerships team to discuss a school pilot."
      />
      <section className="arch-section">
        <PathwayModel title="Schooling progression model" steps={SCHOOLING_PATHWAY} />
      </section>
      <section className="arch-section">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 16 }}>Grade bands · Curriculum architecture</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 0 }} className="arch-grade-grid">
          {bands.map((row, i) => (
            <div key={row.band} style={{ padding: "16px 16px 16px 0", borderTop: `1px solid ${T.lineDark}`, borderBottom: `1px solid ${T.lineDark}`, borderRight: i < 3 ? `1px solid ${T.lineDark}` : "none", minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.ink }}>{row.band}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: C.indigo, margin: "6px 0 8px" }}>Grade {row.grades}</div>
              <div style={{ color: C.slate, fontSize: 13, lineHeight: 1.5 }}>{row.subjects}</div>
            </div>
          ))}
        </div>
        <style>{`@media (max-width: 768px) { .arch-grade-grid { grid-template-columns: 1fr 1fr !important; } .arch-grade-grid > div { border-right: none !important; } }`}</style>
      </section>
    </AcademicPageShell>
  )
}
