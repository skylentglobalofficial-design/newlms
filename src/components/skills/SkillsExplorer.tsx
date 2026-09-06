import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { C, FadeIn } from "../shared"
import { Button, Eyebrow, Heading, Section, T } from "../ui"
import { GlassSurface } from "../foundation"
import { getDomainAccent } from "../../aurora-themes"
import {
  getDefaultSkillDomainId,
  getSkillDomainById,
  getSkillDomains,
  type SkillDomainId,
} from "../../lib/skills-domains"

const accent = getDomainAccent("professional")
const domains = getSkillDomains()

function domainCtaPath(domain: ReturnType<typeof getSkillDomainById>): string {
  if (domain.programs[0]) return `/programs/${domain.programs[0].slug}`
  if (domain.courses[0]) return `/courses/${domain.courses[0].slug}`
  if (domain.workshops[0]) return `/workshops/${domain.workshops[0].slug}`
  return "/programs"
}

function domainCtaLabel(domain: ReturnType<typeof getSkillDomainById>): string {
  if (domain.programs[0]) return `Explore ${domain.label}`
  if (domain.courses[0]) return `View ${domain.courses[0].title}`
  if (domain.workshops[0]) return `View ${domain.workshops[0].title}`
  return "Browse programs"
}

export default function SkillsExplorer() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState<SkillDomainId>(getDefaultSkillDomainId())
  const listRef = useRef<HTMLDivElement>(null)
  const active = getSkillDomainById(activeId)

  const selectDomain = useCallback((id: SkillDomainId) => {
    setActiveId(id)
  }, [])

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = domains.findIndex((domain) => domain.id === activeId)
      if (currentIndex < 0) return

      let nextIndex = currentIndex
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault()
        nextIndex = (currentIndex + 1) % domains.length
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault()
        nextIndex = (currentIndex - 1 + domains.length) % domains.length
      } else if (event.key === "Home") {
        event.preventDefault()
        nextIndex = 0
      } else if (event.key === "End") {
        event.preventDefault()
        nextIndex = domains.length - 1
      } else {
        return
      }

      const next = domains[nextIndex]
      selectDomain(next.id)
      const button = listRef.current?.querySelector<HTMLButtonElement>(`[data-domain-id="${next.id}"]`)
      button?.focus()
    },
    [activeId, selectDomain],
  )

  useEffect(() => {
    const panel = document.getElementById("skills-domain-panel")
    if (panel && typeof panel.focus === "function") {
      panel.setAttribute("tabindex", "-1")
    }
  }, [activeId])

  return (
    <Section tone="canvas" style={{ paddingTop: "clamp(88px, 12vw, 120px)", paddingBottom: T.sectionTight }}>
      <div className="skills-explorer-section">
      <FadeIn>
        <div style={{ marginBottom: 40, maxWidth: 720 }}>
          <Eyebrow tone="dark">Skills</Eyebrow>
          <Heading tone="dark" size="lg" style={{ margin: "16px 0 12px" }}>
            Explore skill domains.
          </Heading>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.75, margin: 0 }}>
            Select a domain to see programs, courses, and learning areas from the Skylent catalog.
          </p>
        </div>
      </FadeIn>

      <div className="skills-explorer">
        <div className="skills-explorer-nav">
          <div className="skills-explorer-mobile">
            <label htmlFor="skills-domain-select" className="skylent-label" style={{ color: "rgba(255,255,255,0.35)", marginBottom: 8, display: "block" }}>
              Explore skills
            </label>
            <select
              id="skills-domain-select"
              className="skills-explorer-select"
              value={activeId}
              onChange={(event) => selectDomain(event.target.value as SkillDomainId)}
            >
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.label}
                  {!domain.hasCatalog ? " (coming soon)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div
            ref={listRef}
            className="skills-explorer-list"
            role="tablist"
            aria-label="Skill domains"
            aria-orientation="vertical"
            onKeyDown={handleListKeyDown}
          >
            <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 12, padding: "0 16px" }}>
              Explore skills
            </div>
            {domains.map((domain) => {
              const selected = domain.id === activeId
              return (
                <button
                  key={domain.id}
                  type="button"
                  role="tab"
                  data-domain-id={domain.id}
                  id={`skills-tab-${domain.id}`}
                  aria-selected={selected}
                  aria-controls="skills-domain-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectDomain(domain.id)}
                  className={`skills-explorer-tab${selected ? " is-selected" : ""}`}
                >
                  <span className="skills-explorer-tab-label">{domain.label}</span>
                  {!domain.hasCatalog && (
                    <span className="skills-explorer-tab-meta">Catalog preview</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div
          id="skills-domain-panel"
          role="tabpanel"
          aria-labelledby={`skills-tab-${activeId}`}
          className="skills-explorer-panel"
        >
          <FadeIn key={activeId}>
            <div className="skills-explorer-panel-inner">
              <div className="skylent-label" style={{ color: accent.text, marginBottom: 10 }}>
                {String(domains.findIndex((d) => d.id === activeId) + 1).padStart(2, "0")} · Skill domain
              </div>
              <h2 className="skylent-display-sm" style={{ color: C.white, margin: "0 0 10px" }}>
                {active.label}
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, margin: "0 0 28px", maxWidth: 560 }}>
                {active.tagline}
              </p>

              {!active.hasCatalog ? (
                <GlassSurface level={2} padding="24px">
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, margin: "0 0 16px" }}>
                    No published catalog items match this domain yet. Browse available programs and courses, or check back as the catalog grows.
                  </p>
                  <Button variant="secondary" onClick={() => navigate("/programs")}>
                    Browse programs
                  </Button>
                </GlassSurface>
              ) : (
                <>
                  {(active.programs.length > 0 || active.courses.length > 0 || active.workshops.length > 0) && (
                    <div className="skills-explorer-block">
                      <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 12 }}>
                        Programs & courses
                      </div>
                      <div className="skills-explorer-catalog">
                        {active.programs.map((program) => (
                          <Link key={program.slug} to={`/programs/${program.slug}`} className="skills-explorer-catalog-item">
                            <div>
                              <div className="skills-explorer-catalog-type">Professional / Certificate</div>
                              <div className="skills-explorer-catalog-title">{program.name}</div>
                              <div className="skills-explorer-catalog-meta">
                                {program.duration} · {program.outcome}
                              </div>
                            </div>
                            <span aria-hidden>→</span>
                          </Link>
                        ))}
                        {active.courses.map((course) => (
                          <Link key={course.slug} to={`/courses/${course.slug}`} className="skills-explorer-catalog-item">
                            <div>
                              <div className="skills-explorer-catalog-type">Course</div>
                              <div className="skills-explorer-catalog-title">{course.title}</div>
                              <div className="skills-explorer-catalog-meta">
                                {course.duration} · {course.level}
                              </div>
                            </div>
                            <span aria-hidden>→</span>
                          </Link>
                        ))}
                        {active.workshops.map((workshop) => (
                          <Link key={workshop.slug} to={`/workshops/${workshop.slug}`} className="skills-explorer-catalog-item">
                            <div>
                              <div className="skills-explorer-catalog-type">Webinar</div>
                              <div className="skills-explorer-catalog-title">{workshop.title}</div>
                              <div className="skills-explorer-catalog-meta">
                                {workshop.duration} · {workshop.mode}
                              </div>
                            </div>
                            <span aria-hidden>→</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {active.learnTopics.length > 0 && (
                    <div className="skills-explorer-block">
                      <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 12 }}>
                        Learn
                      </div>
                      <div className="skills-explorer-chips">
                        {active.learnTopics.map((topic) => (
                          <span key={topic} className="skills-explorer-chip">{topic}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="skills-explorer-meta-grid">
                    {active.projectBased && (
                      <div>
                        <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 6 }}>Build</div>
                        <div style={{ color: C.white, fontSize: 14 }}>Project-based learning</div>
                      </div>
                    )}
                    {active.formatSummary && (
                      <div>
                        <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 6 }}>Format</div>
                        <div style={{ color: C.white, fontSize: 14 }}>{active.formatSummary}</div>
                      </div>
                    )}
                    {active.levelSummary && (
                      <div>
                        <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 6 }}>Level</div>
                        <div style={{ color: C.white, fontSize: 14 }}>{active.levelSummary}</div>
                      </div>
                    )}
                    {active.certificateSummary && (
                      <div>
                        <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 6 }}>Certificate</div>
                        <div style={{ color: C.white, fontSize: 14 }}>{active.certificateSummary}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 28 }}>
                    <Button variant="primary" onClick={() => navigate(domainCtaPath(active))}>
                      {domainCtaLabel(active)} →
                    </Button>
                  </div>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
      </div>
    </Section>
  )
}
