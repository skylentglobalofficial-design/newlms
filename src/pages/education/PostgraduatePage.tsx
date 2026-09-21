import AcademicPageShell from "./AcademicPageShell"
import { LinePageHeader, PathwayModel, UpcomingBanner, CompareTable } from "../../components/product/Architecture"
import { PG_PATHWAY } from "../../lib/product-architecture"
import { C, T } from "../../tokens"

const specialisations = [
  { name: "Technology & systems", role: "Depth in applied systems, not a bootcamp syllabus." },
  { name: "Data & decision", role: "Analytics and judgement under incomplete information." },
  { name: "Business & leadership", role: "Cases, trade-offs, and operating decisions." },
  { name: "Research", role: "Thesis-shaped inquiry with faculty-defined assessment — when an institution runs it." },
]

export default function PostgraduatePage() {
  return (
    <AcademicPageShell current="postgraduate">
      <LinePageHeader
        kicker="Education · Postgraduate"
        maturity="coming_soon"
        title="Specialisation with a term structure — not UG rewritten."
        lead="A postgraduate programme on Skylent is organised as term, specialisation, module, case, project, and assessment. There is no PG catalogue to enroll in yet."
      />
      <UpcomingBanner
        title="No postgraduate programmes are published"
        body="Tracks below are conceptual domains for the product, not enrolable specialisations or faculty lists."
      />
      <section className="arch-section">
        <PathwayModel title="Intended postgraduate model" steps={PG_PATHWAY} />
      </section>
      <section className="arch-section">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 16 }}>Why this is not undergraduate</div>
        <CompareTable
          leftTitle="Undergraduate"
          rightTitle="Postgraduate"
          rows={[
            { aspect: "Question", left: "What is the degree made of?", right: "What will you specialise in, and prove?" },
            { aspect: "Spine", left: "Degree → semester → subject", right: "Programme → term → specialisation" },
            { aspect: "Work", left: "Taught modules and projects", right: "Cases, a substantial project, assessed judgement" },
            { aspect: "Outcome language", left: "Progression and portfolio", right: "Evidence in the specialisation" },
          ]}
        />
      </section>
      <section className="arch-section">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 8 }}>Specialisation domains · not enrollable</div>
        <p style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.6, maxWidth: 560, margin: "0 0 18px" }}>
          These names describe how a university might cut a PG programme on Skylent. They are not courses you can start today.
        </p>
        <div>
          {specialisations.map((item, i) => (
            <div key={item.name} style={{ display: "grid", gridTemplateColumns: "48px minmax(0, 1fr)", gap: 16, padding: "16px 0", borderBottom: `1px solid ${T.lineDark}` }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: C.indigo }}>{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.ink }}>{item.name}</div>
                <div style={{ color: C.slate, fontSize: 14, marginTop: 4, lineHeight: 1.55 }}>{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AcademicPageShell>
  )
}
