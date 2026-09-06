import { useCallback, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { C, FadeIn } from "../shared"
import { Button, Eyebrow, FlowStrip, Heading, Section, T } from "../ui"
import { GlassSurface, MediaImage } from "../foundation"
import { getDomainAccent } from "../../aurora-themes"
import { programs } from "../../data"
import { PHOTO, PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO } from "../../media"

const accent = getDomainAccent("schooling")

export type EducationPathwayId = "schooling" | "undergraduate" | "postgraduate" | "competitive-exams"

type PathwayDef = {
  id: EducationPathwayId
  label: string
  sub: string
  tagline: string
  description: string
  photo: string
  formats: string[]
  levels: string[]
  workflow: string[]
  programSlugs: string[]
  exams?: string[]
}

const EXAM_PROGRAMS = programs.filter((program) => program.programType === "EXAM_PREP")

const PATHWAYS: PathwayDef[] = [
  {
    id: "schooling",
    label: "Schooling",
    sub: "Grades 1–12",
    tagline: "Learning that builds confidence from primary through senior secondary.",
    description:
      "For school students and parents. Curriculum-aligned delivery with lesson rhythm, activities, assessments, and visible progress across grade bands.",
    photo: PHOTO.classroomWarm,
    formats: ["Live + Self-paced", "School-aligned curriculum"],
    levels: ["Primary", "Middle", "Secondary", "Senior Secondary"],
    workflow: ["Grade", "Subject", "Chapter", "Lesson", "Activity", "Assessment", "Progress"],
    programSlugs: [],
  },
  {
    id: "undergraduate",
    label: "Undergraduate",
    sub: "Degree-aligned",
    tagline: "Degree study paired with skills, projects, and career direction.",
    description:
      "Undergraduate learners get structured programs beside their degree — professional skills, project portfolios, and a path into Career OS where supported.",
    photo: PHOTO.collab,
    formats: ["Live + Self-paced", "Cohort-based"],
    levels: ["Foundation", "Intermediate", "Advanced"],
    workflow: ["Program", "Modules", "Projects", "Assessments", "Career readiness"],
    programSlugs: ["full-stack", "data-analytics-pro"],
  },
  {
    id: "postgraduate",
    label: "Postgraduate",
    sub: "Specialisation",
    tagline: "Specialisation tracks with cases, projects, and professional outcomes.",
    description:
      "Postgraduate pathways focus on depth — advanced modules, applied projects, and career support for learners moving into specialist roles.",
    photo: PHOTO.university,
    formats: ["Live + Self-paced", "Specialist tracks"],
    levels: ["Advanced", "Professional"],
    workflow: ["Specialisation", "Cases", "Projects", "Assessment", "Career support"],
    programSlugs: ["data-science-ai", "product-management"],
  },
  {
    id: "competitive-exams",
    label: "Competitive / Entrance Exams",
    sub: "JEE · NEET · CAT",
    tagline: "Exam preparation with structured practice, mocks, and analytics.",
    description:
      "Entrance exam products for JEE, NEET, CAT, and related exams — question banks, sectional practice, mock tests, and performance visibility.",
    photo: PHOTO.assessment,
    formats: ["Live + Self-paced", "Exam-pattern aligned"],
    levels: ["Exam prep"],
    workflow: ["Syllabus", "Practice", "Mocks", "Analytics", "Revision"],
    programSlugs: ["jee-advanced-prep", "cat-prep"],
    exams: ["JEE", "NEET", "CAT", "CUET", "CLAT", "GMAT", "GRE"],
  },
]

function resolvePrograms(slugs: string[]) {
  const map = new Map(programs.map((program) => [program.slug, program]))
  return slugs.map((slug) => map.get(slug)).filter((program): program is (typeof programs)[number] => Boolean(program))
}

export default function EducationPathwayExplorer() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState<EducationPathwayId>("schooling")
  const listRef = useRef<HTMLDivElement>(null)
  const active = PATHWAYS.find((pathway) => pathway.id === activeId) ?? PATHWAYS[0]
  const activePrograms = resolvePrograms(active.programSlugs)

  const selectPathway = useCallback((id: EducationPathwayId) => {
    setActiveId(id)
  }, [])

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = PATHWAYS.findIndex((pathway) => pathway.id === activeId)
      if (currentIndex < 0) return

      let nextIndex = currentIndex
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault()
        nextIndex = (currentIndex + 1) % PATHWAYS.length
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault()
        nextIndex = (currentIndex - 1 + PATHWAYS.length) % PATHWAYS.length
      } else if (event.key === "Home") {
        event.preventDefault()
        nextIndex = 0
      } else if (event.key === "End") {
        event.preventDefault()
        nextIndex = PATHWAYS.length - 1
      } else {
        return
      }

      const next = PATHWAYS[nextIndex]
      selectPathway(next.id)
      const button = listRef.current?.querySelector<HTMLButtonElement>(`[data-pathway-id="${next.id}"]`)
      button?.focus()
    },
    [activeId, selectPathway],
  )

  return (
    <Section tone="canvas" style={{ paddingTop: "clamp(88px, 12vw, 120px)", paddingBottom: T.sectionTight }}>
      <div className="education-pathway-section">
      <FadeIn>
        <div style={{ marginBottom: 40, maxWidth: 720 }}>
          <Eyebrow tone="dark">Education</Eyebrow>
          <Heading tone="dark" size="lg" style={{ margin: "16px 0 12px" }}>
            Choose your education pathway.
          </Heading>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.75, margin: 0 }}>
            Schooling, undergraduate, postgraduate, and entrance exams are different products. Select a pathway to see formats, levels, and catalog offerings.
          </p>
        </div>
      </FadeIn>

      <div className="pathway-explorer education-pathway-explorer">
        <div className="pathway-explorer-nav">
          <div className="pathway-explorer-mobile">
            <label htmlFor="education-pathway-select" className="skylent-label" style={{ color: "rgba(255,255,255,0.35)", marginBottom: 8, display: "block" }}>
              Education pathways
            </label>
            <select
              id="education-pathway-select"
              className="pathway-explorer-select"
              value={activeId}
              onChange={(event) => selectPathway(event.target.value as EducationPathwayId)}
            >
              {PATHWAYS.map((pathway) => (
                <option key={pathway.id} value={pathway.id}>{pathway.label}</option>
              ))}
            </select>
          </div>

          <div
            ref={listRef}
            className="pathway-explorer-list"
            role="tablist"
            aria-label="Education pathways"
            aria-orientation="vertical"
            onKeyDown={handleListKeyDown}
          >
            <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 12, padding: "0 16px" }}>
              Pathways
            </div>
            {PATHWAYS.map((pathway) => {
              const selected = pathway.id === activeId
              return (
                <button
                  key={pathway.id}
                  type="button"
                  role="tab"
                  data-pathway-id={pathway.id}
                  id={`education-tab-${pathway.id}`}
                  aria-selected={selected}
                  aria-controls="education-pathway-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectPathway(pathway.id)}
                  className={`pathway-explorer-tab${selected ? " is-selected" : ""}`}
                >
                  <span className="pathway-explorer-tab-label">{pathway.label}</span>
                  <span className="pathway-explorer-tab-meta">{pathway.sub}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div id="education-pathway-panel" role="tabpanel" aria-labelledby={`education-tab-${activeId}`} className="pathway-explorer-panel">
          <FadeIn key={activeId}>
            <div className="pathway-explorer-panel-inner">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "clamp(24px, 4vw, 40px)", alignItems: "start" }} className="education-pathway-detail-grid">
                <MediaImage src={active.photo} alt={active.label} aspect="4/3" overlay="full" />
                <div>
                  <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{active.sub}</div>
                  <h2 className="skylent-display-sm" style={{ color: C.white, margin: "0 0 10px" }}>{active.label}</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, margin: "0 0 16px" }}>{active.tagline}</p>
                  <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>{active.description}</p>

                  <div style={{ marginBottom: 24 }}>
                    <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 12 }}>Workflow</div>
                    <FlowStrip tone="dark" steps={active.workflow.map((step) => ({ label: step }))} />
                  </div>

                  <div className="education-pathway-meta-grid">
                    <div>
                      <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 6 }}>Formats</div>
                      <div style={{ color: C.white, fontSize: 14 }}>{active.formats.join(" · ")}</div>
                    </div>
                    <div>
                      <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 6 }}>Levels</div>
                      <div style={{ color: C.white, fontSize: 14 }}>{active.levels.join(" · ")}</div>
                    </div>
                  </div>
                </div>
              </div>

              {active.exams && active.exams.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 12 }}>Exams supported</div>
                  <div className="skills-explorer-chips">
                    {active.exams.map((exam) => (
                      <span key={exam} className="skills-explorer-chip">{exam}</span>
                    ))}
                  </div>
                </div>
              )}

              {activePrograms.length > 0 ? (
                <div style={{ marginTop: 32 }}>
                  <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 12 }}>Catalog programs</div>
                  <div className="skills-explorer-catalog">
                    {activePrograms.map((program) => (
                      <Link key={program.slug} to={`/programs/${program.slug}`} className="skills-explorer-catalog-item">
                        <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 14, alignItems: "center" }}>
                          <div style={{ borderRadius: 8, overflow: "hidden" }}>
                            <MediaImage src={PROGRAM_PHOTO[program.slug] ?? DEFAULT_PROGRAM_PHOTO} alt="" aspect="4/3" radius={8} />
                          </div>
                          <div>
                            <div className="skills-explorer-catalog-type">Exam preparation</div>
                            <div className="skills-explorer-catalog-title">{program.name}</div>
                            <div className="skills-explorer-catalog-meta">
                              {program.duration} · {program.level}
                            </div>
                          </div>
                        </div>
                        <span aria-hidden>→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <GlassSurface level={2} padding="20px 22px" style={{ marginTop: 32 }}>
                  <p style={{ color: "rgba(255,255,255,0.52)", fontSize: 14, lineHeight: 1.65, margin: "0 0 16px" }}>
                    Schooling and degree pathways are delivered through institutional partnerships. Explore institution models or contact Skylent to map your program.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <Button variant="secondary" onClick={() => navigate("/institutions")}>For institutions</Button>
                    <Button variant="secondary" onClick={() => navigate("/contact")}>Get in touch</Button>
                  </div>
                </GlassSurface>
              )}

              {activePrograms[0] && (
                <div style={{ marginTop: 24 }}>
                  <Button variant="primary" onClick={() => navigate(`/programs/${activePrograms[0].slug}`)}>
                    View {activePrograms[0].name} →
                  </Button>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
      </div>
    </Section>
  )
}
