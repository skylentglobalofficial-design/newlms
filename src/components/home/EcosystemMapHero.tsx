import { useCallback, useRef, useState } from "react"
import { Eyebrow, Heading, Section, T } from "../ui"
import {
  ECOSYSTEM_FLOW_LABELS,
  getDefaultEcosystemPillarId,
  getEcosystemPillarById,
  getEcosystemPillars,
  type EcosystemPillarId,
} from "../../lib/ecosystem-map"
import EcosystemMapPanel from "./EcosystemMapPanel"

const pillars = getEcosystemPillars()
const PANEL_ID = "ecosystem-map-panel"

export default function EcosystemMapHero() {
  const [activeId, setActiveId] = useState<EcosystemPillarId>(getDefaultEcosystemPillarId())
  const listRef = useRef<HTMLDivElement>(null)
  const active = getEcosystemPillarById(activeId)

  const selectPillar = useCallback((id: EcosystemPillarId) => {
    setActiveId(id)
  }, [])

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = pillars.findIndex((pillar) => pillar.id === activeId)
      if (currentIndex < 0) return

      let nextIndex = currentIndex
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault()
        nextIndex = (currentIndex + 1) % pillars.length
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault()
        nextIndex = (currentIndex - 1 + pillars.length) % pillars.length
      } else if (event.key === "Home") {
        event.preventDefault()
        nextIndex = 0
      } else if (event.key === "End") {
        event.preventDefault()
        nextIndex = pillars.length - 1
      } else {
        return
      }

      const next = pillars[nextIndex]
      selectPillar(next.id)
      const button = listRef.current?.querySelector<HTMLButtonElement>(`[data-pillar-id="${next.id}"]`)
      button?.focus()
    },
    [activeId, selectPillar],
  )

  return (
    <Section tone="canvas" style={{ paddingTop: "clamp(88px, 12vw, 120px)", paddingBottom: T.sectionTight }}>
      <div className="ecosystem-map-hero">
        <header className="ecosystem-map-intro">
          <Eyebrow tone="dark">Skylent ecosystem</Eyebrow>
          <Heading tone="dark" size="lg" style={{ margin: "16px 0 12px", maxWidth: 720 }}>
            One platform from education to employability.
          </Heading>
          <p className="skills-explorer-intro-copy">
            Skylent connects academic learning, credentialed skills, career workflows, and institutional delivery. Select a pillar to see what you can do and which path fits you.
          </p>
        </header>

        <div className="ecosystem-map-flow-banner" aria-hidden>
          {ECOSYSTEM_FLOW_LABELS.map((label, index) => (
            <span key={label} className="ecosystem-map-flow-banner-item">
              <span className={`ecosystem-map-flow-banner-label${pillars[index]?.id === activeId ? " is-active" : ""}`}>
                {label}
              </span>
              {index < ECOSYSTEM_FLOW_LABELS.length - 1 && (
                <span className="ecosystem-map-flow-banner-arrow">↓</span>
              )}
            </span>
          ))}
        </div>

        <div className="pathway-explorer ecosystem-map-explorer">
          <nav className="pathway-explorer-nav ecosystem-map-nav" aria-label="Ecosystem map navigation">
            <div className="pathway-explorer-mobile">
              <label htmlFor="ecosystem-pillar-select" className="skylent-label skills-explorer-mobile-label">
                Ecosystem pillar
              </label>
              <select
                id="ecosystem-pillar-select"
                className="pathway-explorer-select"
                value={activeId}
                onChange={(event) => selectPillar(event.target.value as EcosystemPillarId)}
              >
                {pillars.map((pillar) => (
                  <option key={pillar.id} value={pillar.id}>
                    {pillar.label} — {pillar.sub}
                  </option>
                ))}
              </select>
            </div>

            <div
              ref={listRef}
              className="pathway-explorer-list ecosystem-map-flow-list"
              role="tablist"
              aria-label="Skylent ecosystem pillars"
              aria-orientation="vertical"
              onKeyDown={handleListKeyDown}
            >
              <p className="skylent-label skills-explorer-list-label">Product map</p>
              {pillars.map((pillar, index) => {
                const selected = pillar.id === activeId
                return (
                  <div key={pillar.id} className="ecosystem-map-flow-item">
                    <button
                      type="button"
                      role="tab"
                      data-pillar-id={pillar.id}
                      id={`ecosystem-tab-${pillar.id}`}
                      aria-selected={selected}
                      aria-controls={PANEL_ID}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => selectPillar(pillar.id)}
                      className={`pathway-explorer-tab ecosystem-map-pillar-tab${selected ? " is-selected" : ""}`}
                      style={{
                        borderLeftColor: selected ? pillar.theme.primary : "transparent",
                        background: selected ? pillar.theme.subtle : "transparent",
                      }}
                    >
                      <span className="ecosystem-map-pillar-step" aria-hidden>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="pathway-explorer-tab-label">{pillar.label}</span>
                        <span className="pathway-explorer-tab-meta">{pillar.sub}</span>
                      </span>
                    </button>
                    {index < pillars.length - 1 && (
                      <div className="ecosystem-map-flow-connector" aria-hidden>↓</div>
                    )}
                  </div>
                )
              })}
            </div>
          </nav>

          <EcosystemMapPanel
            pillar={active}
            panelId={PANEL_ID}
            labelledBy={`ecosystem-tab-${activeId}`}
          />
        </div>
      </div>
    </Section>
  )
}
