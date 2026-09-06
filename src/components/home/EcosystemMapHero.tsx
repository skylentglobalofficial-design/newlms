import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { C, FadeIn } from "../shared"
import { Button, Eyebrow, Heading, Section, T } from "../ui"
import { Aurora, GlassSurface } from "../foundation"
import { getDomainAccent } from "../../aurora-themes"

const accent = getDomainAccent("general")

type PillarId = "education" | "skills" | "career" | "institutions"

const PILLARS: Array<{
  id: PillarId
  label: string
  sub: string
  desc: string
  to: string
  theme: ReturnType<typeof getDomainAccent>
}> = [
  {
    id: "education",
    label: "Education",
    sub: "School · UG · PG · Exams",
    desc: "Academic pathways from schooling through entrance exams.",
    to: "/education",
    theme: getDomainAccent("schooling"),
  },
  {
    id: "skills",
    label: "Skills",
    sub: "Webinars · Certificates · Pro Programs",
    desc: "Credentialed upskilling with project-based learning.",
    to: "/skills",
    theme: getDomainAccent("professional"),
  },
  {
    id: "career",
    label: "Career OS",
    sub: "Profile · Jobs · Applications",
    desc: "Career workspace activated through qualifying programs.",
    to: "/career-os",
    theme: getDomainAccent("career"),
  },
  {
    id: "institutions",
    label: "Institutions",
    sub: "Schools · Colleges · Universities",
    desc: "B2B delivery for education and skills at scale.",
    to: "/institutions",
    theme: getDomainAccent("institution"),
  },
]

export default function EcosystemMapHero() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState<PillarId>("education")
  const active = PILLARS.find((pillar) => pillar.id === activeId) ?? PILLARS[0]

  return (
    <Section tone="canvas" style={{ paddingTop: "clamp(96px, 14vh, 132px)", paddingBottom: T.sectionTight }}>
      <div className="ecosystem-map-hero">
      <Aurora themeId="general" />
      <FadeIn>
        <div className="ecosystem-map-grid">
          <div>
            <Eyebrow tone="dark">Skylent</Eyebrow>
            <Heading tone="dark" size="xl" style={{ margin: "16px 0 14px" }}>
              Learn. Build skills.<br />
              <span style={{ color: accent.text }}>Build a career.</span>
            </Heading>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--type-body-lg)", lineHeight: 1.75, margin: "0 0 28px", maxWidth: 520 }}>
              One ecosystem — education, skills, career, and institutions. Select a pillar to see where to go next.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Button variant="primary" size="lg" onClick={() => navigate(active.to)}>
                Go to {active.label}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate("/programs")}>
                Explore programs
              </Button>
            </div>
          </div>

          <div className="ecosystem-map-panel">
            <div className="skylent-label" style={{ color: "rgba(255,255,255,0.28)", marginBottom: 16 }}>Ecosystem map</div>
            <div className="ecosystem-map-flow" aria-hidden>
              {PILLARS.map((pillar, index) => (
                <span key={pillar.id} className={`ecosystem-map-node${pillar.id === activeId ? " is-active" : ""}`}>
                  {pillar.label}
                  {index < PILLARS.length - 1 && <span className="ecosystem-map-arrow">→</span>}
                </span>
              ))}
            </div>

            <div className="ecosystem-map-pillars" role="tablist" aria-label="Skylent pillars">
              {PILLARS.map((pillar) => {
                const selected = pillar.id === activeId
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className={`ecosystem-map-pillar${selected ? " is-selected" : ""}`}
                    onClick={() => setActiveId(pillar.id)}
                    style={{
                      borderColor: selected ? pillar.theme.border : T.lineDark,
                      background: selected ? pillar.theme.subtle : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: C.white }}>{pillar.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 4 }}>{pillar.sub}</div>
                  </button>
                )
              })}
            </div>

            <GlassSurface level={2} padding="20px 22px" style={{ marginTop: 20 }}>
              <div className="skylent-label" style={{ color: active.theme.text, marginBottom: 8 }}>What is Skylent?</div>
              <p style={{ color: "rgba(255,255,255,0.58)", fontSize: 14, lineHeight: 1.7, margin: "0 0 14px" }}>{active.desc}</p>
              <Link to={active.to} style={{ color: active.theme.text, fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
                Explore {active.label} →
              </Link>
            </GlassSurface>
          </div>
        </div>
      </FadeIn>
      </div>
    </Section>
  )
}
