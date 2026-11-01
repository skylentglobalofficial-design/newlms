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
  { name: "NEET", note: "Planned biology, chemistry, and physics diagnostic track — register interest for cohort updates." },
  { name: "CUET / CLAT / GATE", note: "Planned undergraduate and postgraduate entrance tracks on the Skylent roadmap." },
]

const EXAM_SCENES: {
  visualId: ProductVisualId
  themeId: AuroraThemeId
  name: string
  full: string
  note: string
  wide?: boolean
  subjects?: { name: string; topics: string }[]
  sections?: { abbr: string; label: string; color: string }[]
}[] = [
  {
    visualId: "jee-exam",
    themeId: "jee",
    name: "JEE",
    full: "Joint Entrance Examination",
    note: "Structured subject map covering Physics, Chemistry, and Mathematics problem sets.",
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
    note: "Structured syllabus taxonomy for Biology, Chemistry, and Physics preparation.",
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
    note: "Three-section management entrance architecture across VARC, DILR, and Quantitative Aptitude.",
    sections: [
      { abbr: "VARC", label: "Verbal Ability & Reading Comprehension", color: "hsl(var(--site-navy))" },
      { abbr: "DILR", label: "Data Interpretation & Logical Reasoning", color: "hsl(var(--site-deep))" },
      { abbr: "QA", label: "Quantitative Aptitude", color: "hsl(var(--site-data-rest))" },
    ],
  },
]

export default function ExamsPage() {
  return (
    <AcademicPageShell current="exams">
      <LinePageHeader
        kicker="Education · Competitive Exams"
        maturity="coming_soon"
        title="Structured exam preparation architecture."
        lead="Competitive exam tracks on Skylent combine topic-level diagnostics, timed practice sets, and error-log reviews. Register interest below to be notified when JEE and CAT cohorts open."
      />
      <UpcomingBanner
        title="Register interest for upcoming JEE & CAT preparation cohorts"
        body="JEE Advanced and CAT tracks are currently in curriculum preparation. Explore the syllabus architecture below or start an open Skylent skill programme today."
      />
      <section className="arch-section exam-scenes" aria-labelledby="exam-scenes-title">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 12 }}>
          Syllabus &amp; section architecture
        </div>
        <h2 id="exam-scenes-title" className="skylent-display-sm" style={{ color: C.ink, margin: "0 0 10px" }}>
          Subject and section maps across JEE, NEET, and CAT.
        </h2>
        <p className="exam-scenes-lead">
          Each exam pathway breaks preparation into topic-level foundations, timed section practice, and structured mistake review.
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
                        <div key={section.abbr} style={{ flex: 1, background: section.color, opacity: 0.75 }} />
                      ))}
                    </div>
                    {scene.sections.map((section) => (
                      <div key={section.abbr} className="exam-cat-row">
                        <div>
                          <b>{section.abbr}</b>
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
        <PathwayModel title="Preparation workflow" steps={EXAM_PATHWAY} />
      </section>
      <section className="arch-section">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 16 }}>In the catalogue · Register interest</div>
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
              <span style={{ color: C.indigo, fontSize: 13, fontWeight: 600 }}>View syllabus &amp; register interest →</span>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <div className="skylent-label" style={{ color: C.slate, marginBottom: 12 }}>Additional roadmap tracks</div>
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
