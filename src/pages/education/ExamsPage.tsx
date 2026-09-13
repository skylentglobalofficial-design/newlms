import { Link } from "react-router-dom"
import AcademicPageShell from "./AcademicPageShell"
import { LinePageHeader, PathwayModel, UpcomingBanner, MaturityMark } from "../../components/product/Architecture"
import { EXAM_PATHWAY } from "../../lib/product-architecture"
import { programs } from "../../data"
import { C, T } from "../../tokens"

const examPrograms = programs.filter((p) => p.programType === "EXAM_PREP")

const directionExams = [
  { name: "NEET", note: "No Skylent NEET programme is in the catalogue yet." },
  { name: "CUET / CLAT / others", note: "Named as future coverage, not as live prep engines." },
]

export default function ExamsPage() {
  return (
    <AcademicPageShell current="exams">
      <LinePageHeader
        kicker="Education · Exams"
        maturity="coming_soon"
        title="A preparation system — when it ships."
        lead="Exam prep on Skylent is meant to be diagnostic, practice, mocks, and readiness analytics. It is not a live question bank or a fake mock-test engine today."
      />
      <UpcomingBanner
        title="No exam engine is running"
        body="JEE Advanced and CAT exist as coming-soon programmes you can register interest in. There are no live diagnostics, mocks, or score predictors."
      />
      <section className="arch-section">
        <PathwayModel title="Intended exam product" steps={EXAM_PATHWAY} />
      </section>
      <section className="arch-section">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 16 }}>In the catalogue · coming soon</div>
        <div>
          {examPrograms.map((program) => (
            <Link
              key={program.slug}
              to={`/programs/${program.slug}`}
              style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) auto auto", gap: 16, alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${T.lineDark}`, textDecoration: "none", minWidth: 0 }}
              className="arch-exam-row"
            >
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: C.ink }}>{program.name}</div>
                <div style={{ color: C.slate, fontSize: 13, marginTop: 4 }}>{program.outcome}</div>
              </div>
              <MaturityMark maturity="coming_soon" compact />
              <span style={{ color: C.indigo, fontSize: 13, fontWeight: 600 }}>View programme →</span>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <div className="skylent-label" style={{ color: C.slate, marginBottom: 12 }}>Named, not built</div>
          {directionExams.map((exam) => (
            <div key={exam.name} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: `1px solid ${T.lineDark}`, flexWrap: "wrap" }}>
              <strong style={{ color: C.ink, minWidth: 160 }}>{exam.name}</strong>
              <span style={{ color: C.slate, fontSize: 13.5 }}>{exam.note}</span>
            </div>
          ))}
        </div>
        <style>{`@media (max-width: 640px) { .arch-exam-row { grid-template-columns: 1fr !important; } }`}</style>
      </section>
    </AcademicPageShell>
  )
}
