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
  { name: "NEET", note: "Biology, Chemistry & Physics domain blueprint mapped for upcoming cohort intakes." },
  { name: "CUET / CLAT / GATE", note: "Undergraduate and postgraduate national entrance tracks scheduled for Phase 2 academic expansion." },
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
    full: "Joint Entrance Examination (Engineering)",
    note: "Subject-wise conceptual architecture across Physics, Chemistry, and Mathematics.",
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
    note: "Core syllabus blueprint across Botany, Zoology, Chemistry, and Physics.",
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
    full: "Common Admission Test (Management)",
    wide: true,
    note: "Three-section aptitude & analytical reasoning blueprint for postgraduate management pathways.",
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
        kicker="Education · Entrance & Diagnostic Pathways"
        maturity="coming_soon"
        title="Entrance syllabus architecture & live skill diagnostics."
        lead="Explore our structured domain blueprints for engineering (JEE), medical (NEET), and management (CAT) entrance tracks — or take our live 90-Second Technical & Analytical Skill Diagnostic right now."
      />

      {/* Live 90-Second Diagnostic Banner in Deep Product Navy + Brand Violet */}
      <section
        id="exam-live-diagnostic"
        aria-label="Live 90-Second Skill Diagnostic"
        style={{
          margin: "20px 0 28px",
          padding: "24px 28px",
          borderRadius: 18,
          background: "linear-gradient(145deg, #11152c 0%, #1e1b4b 100%)",
          border: "1px solid rgba(196, 184, 255, 0.35)",
          color: "#ffffff",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          boxShadow: "0 16px 36px -16px rgba(16, 38, 61, 0.28)",
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <span style={{ display: "inline-block", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C4B8FF", marginBottom: 6 }}>
            LIVE NOW · ZERO SIGN-IN REQUIRED · 3 SCENARIO CHECKS
          </span>
          <h2 style={{ margin: "0 0 6px", fontSize: "clamp(20px, 2.3vw, 26px)", fontWeight: 700, color: "#ffffff" }}>
            Take the Live 90-Second Technical &amp; Analytical Diagnostic
          </h2>
          <p style={{ margin: 0, fontSize: 14.5, color: "rgba(255,255,255,0.84)", lineHeight: 1.55 }}>
            Test your real-world problem-solving across SQL Data Grain, Product Triage, and AI Grounding to receive your instant percentile benchmark and recommended career pathway.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link to="/path" className="sk-btn sk-btn-primary" style={{ background: "#5142B5", color: "#ffffff", border: "1px solid #C4B8FF" }}>
            Start 90-Second Diagnostic →
          </Link>
          <Link to="/programmes" className="sk-btn sk-btn-secondary" style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", borderColor: "rgba(255,255,255,0.24)" }}>
            Explore 6 Live Tracks
          </Link>
        </div>
      </section>

      <UpcomingBanner
        title="National Entrance Prep Tracks (JEE · NEET · CAT)"
        body="Explore the subject and section weightage maps for JEE, NEET, and CAT below, or register cohort interest for upcoming academic intakes."
      />
      <section className="arch-section exam-scenes" aria-labelledby="exam-scenes-title">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 12 }}>
          Syllabus &amp; section weightage
        </div>
        <h2 id="exam-scenes-title" className="skylent-display-sm" style={{ color: C.ink, margin: "0 0 10px" }}>
          Core subject and section architecture.
        </h2>
        <p className="exam-scenes-lead">
          Each entrance track is organised around foundational subject pillars, sectional weightages, and structured problem-solving progressions.
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
        <PathwayModel title="Entrance preparation progression" steps={EXAM_PATHWAY} />
      </section>
      <section className="arch-section">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 16 }}>Planned entrance pathways</div>
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
              <span style={{ color: C.indigo, fontSize: 13, fontWeight: 600 }}>View pathway →</span>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <div className="skylent-label" style={{ color: C.slate, marginBottom: 12 }}>Additional entrance tracks in roadmap</div>
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
