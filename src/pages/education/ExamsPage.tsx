import { Link } from "react-router-dom"
import AcademicPageShell from "./AcademicPageShell"
import { LinePageHeader, PathwayModel, UpcomingBanner, MaturityMark } from "../../components/product/Architecture"
import { ProductVisual, type ProductVisualId } from "../../components/product/ProductVisuals"
import { EXAM_PATHWAY } from "../../lib/product-architecture"
import { programs } from "../../data"
import { C, T } from "../../tokens"
import type { AuroraThemeId } from "../../aurora-themes"
import "./ExamsPage.css"

const examPrograms = programs.filter((p) => p.programType === "EXAM_PREP")

const directionExams = [
  { name: "NEET", note: "No Skylent NEET programme is in the catalogue yet." },
  { name: "CUET / CLAT / others", note: "Named as future coverage, not as live prep engines." },
]

const EXAM_SCENES: {
  visualId: ProductVisualId
  themeId: AuroraThemeId
  name: string
  full: string
  note: string
  wide?: boolean
  subjects?: { name: string; topics: string }[]
  sections?: { abbr: string; label: string; weight: string; color: string }[]
}[] = [
  {
    visualId: "jee-exam",
    themeId: "jee",
    name: "JEE",
    full: "Joint Entrance Examination",
    note: "Intended subject map for engineering prep. No live question bank or mock engine.",
    subjects: [
      { name: "Physics", topics: "Mechanics · Electromagnetism · Optics · Modern Physics" },
      { name: "Chemistry", topics: "Organic · Inorganic · Physical Chemistry" },
      { name: "Mathematics", topics: "Calculus · Algebra · Coordinate Geometry · Trigonometry" },
    ],
  },
  {
    visualId: "neet-exam",
    themeId: "neet",
    name: "NEET",
    full: "National Eligibility cum Entrance Test",
    note: "Named coverage, not a built programme. No live NEET engine or diagnostics.",
    subjects: [
      { name: "Biology", topics: "Botany · Zoology · Genetics · Ecology" },
      { name: "Chemistry", topics: "Organic · Inorganic · Physical Chemistry" },
      { name: "Physics", topics: "Mechanics · Electromagnetism · Optics" },
    ],
  },
  {
    visualId: "cat-exam",
    themeId: "cat",
    name: "CAT",
    full: "Common Admission Test",
    wide: true,
    note: "Intended paper structure for MBA entrance. No live mocks, sectional timers, or score predictor.",
    sections: [
      { abbr: "VARC", label: "Verbal Ability & Reading Comprehension", weight: "34%", color: "#4F46E5" },
      { abbr: "DILR", label: "Data Interpretation & Logical Reasoning", weight: "33%", color: "#2563EB" },
      { abbr: "QA", label: "Quantitative Aptitude", weight: "33%", color: "#4F46E5" },
    ],
  },
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
      <section className="arch-section exam-scenes" aria-labelledby="exam-scenes-title">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 12 }}>
          Intended exam interfaces
        </div>
        <h2 id="exam-scenes-title" className="skylent-display-sm" style={{ color: C.ink, margin: "0 0 10px" }}>
          Subject and section maps — not a running engine.
        </h2>
        <p className="exam-scenes-lead">
          These ProductVisual scenes show how JEE, NEET, and CAT prep is meant to look. They are taxonomy, not live
          practice, analytics, or admissions tools.
        </p>
        <div className="exam-scene-grid">
          {EXAM_SCENES.map((scene) => (
            <article key={scene.visualId} className={scene.wide ? "exam-scene is-wide" : "exam-scene"}>
              <header className="exam-scene-head">
                <h3>{scene.name}</h3>
                <MaturityMark maturity="coming_soon" compact />
              </header>
              <p className="exam-scene-full">{scene.full}</p>
              <p className="exam-scene-note">{scene.note}</p>
              {scene.wide && scene.sections ? (
                <div className="exam-cat-layout">
                  <div>
                    <div className="exam-scene-visual">
                      <ProductVisual id={scene.visualId} themeId={scene.themeId} style={{ minHeight: 220 }} />
                    </div>
                  </div>
                  <div>
                    <div className="exam-cat-weights" aria-hidden="true">
                      {scene.sections.map((section) => (
                        <div
                          key={section.abbr}
                          style={{ flex: parseFloat(section.weight), background: section.color, opacity: 0.75 }}
                        />
                      ))}
                    </div>
                    {scene.sections.map((section) => (
                      <div key={section.abbr} className="exam-cat-row">
                        <div>
                          <b>{section.abbr}</b>
                          <em>{section.weight}</em>
                        </div>
                        <span>{section.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="exam-scene-visual">
                    <ProductVisual id={scene.visualId} themeId={scene.themeId} style={{ minHeight: 220 }} />
                  </div>
                  {scene.subjects ? (
                    <div className="exam-scene-subjects">
                      {scene.subjects.map((subject) => (
                        <div key={subject.name}>
                          <strong>{subject.name}</strong>
                          <span>{subject.topics}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </article>
          ))}
        </div>
      </section>
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
