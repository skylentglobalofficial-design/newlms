import AcademicPageShell from "./AcademicPageShell"
import { LinePageHeader, PathwayModel, UpcomingBanner, CompareTable } from "../../components/product/Architecture"
import { PG_PATHWAY } from "../../lib/product-architecture"
import { C, T } from "../../tokens"

const specialisations = [
  { name: "Technology & systems", role: "Depth in applied software architecture, data systems, and cloud engineering." },
  { name: "Data & decision science", role: "Statistical modelling, SQL analytics, and commercial judgement under uncertainty." },
  { name: "Business & product leadership", role: "Case briefs, product trade-offs, and operating decisions." },
  { name: "Applied research", role: "Thesis-shaped inquiry with faculty-defined assessment and reproducible artefacts." },
]

export default function PostgraduatePage() {
  return (
    <AcademicPageShell current="postgraduate">
      <LinePageHeader
        kicker="Education · Postgraduate"
        maturity="coming_soon"
        title="Specialisation with a term structure and capstone depth."
        lead="Postgraduate pathways on Skylent are organised around terms, domain specialisations, case studios, and graded capstone defenses in partnership with degree-granting universities."
      />
      <UpcomingBanner
        title="Academic partner postgraduate tracks — Register interest"
        body="Explore our planned postgraduate specialisation domains below, or register interest on the Education page for upcoming partner university intakes."
      />
      <section className="arch-section">
        <PathwayModel title="Postgraduate academic model" steps={PG_PATHWAY} />
      </section>
      <section className="arch-section">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 16 }}>Undergraduate vs. Postgraduate structure</div>
        <CompareTable
          leftTitle="Undergraduate"
          rightTitle="Postgraduate"
          rows={[
            { aspect: "Core question", left: "What are the foundational disciplines?", right: "What will you specialise in, build, and defend?" },
            { aspect: "Academic spine", left: "Degree → semester → core subject", right: "Programme → term → domain specialisation" },
            { aspect: "Studio work", left: "Foundational labs and guided projects", right: "Industry cases, thesis-grade capstone, assessed judgement" },
            { aspect: "Graduate proof", left: "Academic progression and skill portfolio", right: "Verifiable domain capstone dossier in Career OS" },
          ]}
        />
      </section>
      <section className="arch-section">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 8 }}>Specialisation domains · Academic partner roadmap</div>
        <p style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.6, maxWidth: 560, margin: "0 0 18px" }}>
          Core postgraduate domains designed for co-delivery with partner universities, combining academic seminars with Skylent OS practical studios.
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
