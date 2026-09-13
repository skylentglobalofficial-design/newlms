import AcademicPageShell from "./AcademicPageShell"
import { LinePageHeader, PathwayModel, UpcomingBanner } from "../../components/product/Architecture"
import { SCHOOLING_PATHWAY } from "../../lib/product-architecture"
import { C, T } from "../../tokens"

const bands = [
  { band: "Primary", grades: "1–5", subjects: "Mathematics, science, language, socials" },
  { band: "Middle", grades: "6–8", subjects: "Mathematics, sciences, language" },
  { band: "Secondary", grades: "9–10", subjects: "Board-aligned core plus IT" },
  { band: "Senior", grades: "11–12", subjects: "Stream subjects, electives, practicals" },
]

export default function SchoolingPage() {
  return (
    <AcademicPageShell current="schooling">
      <LinePageHeader
        kicker="Education · Schooling"
        maturity="coming_soon"
        title="Academic progression, not a kids' course shop."
        lead="Schooling on Skylent is a grade-and-subject pathway for schools and families. There is no live schooling catalogue to browse or buy."
      />
      <UpcomingBanner
        title="No schooling courses are published"
        body="Grade bands and subjects below describe the intended product. They are not enrollable SKUs, class timetables, or teacher assignments."
      />
      <section className="arch-section">
        <PathwayModel title="Intended schooling model" steps={SCHOOLING_PATHWAY} />
      </section>
      <section className="arch-section">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 16 }}>Grade bands · direction</div>
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
