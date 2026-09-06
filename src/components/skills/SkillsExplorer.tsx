import { useCallback, useRef, useState } from "react"
import { Eyebrow, Heading, Section, T } from "../ui"
import {
  getDefaultSkillDomainId,
  getSkillDomainById,
  getSkillDomains,
  type SkillDomainId,
} from "../../lib/skills-domains"
import SkillsDomainPanel from "./SkillsDomainPanel"

const domains = getSkillDomains()
const PANEL_ID = "skills-domain-panel"

export default function SkillsExplorer() {
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

  return (
    <Section tone="canvas" style={{ paddingTop: "clamp(88px, 12vw, 120px)", paddingBottom: T.sectionTight }}>
      <div className="skills-explorer-section">
        <header className="skills-explorer-intro">
          <Eyebrow tone="dark">Skills</Eyebrow>
          <Heading tone="dark" size="lg" style={{ margin: "16px 0 12px" }}>
            Explore skill domains.
          </Heading>
          <p className="skills-explorer-intro-copy">
            Select a domain to inspect programs, courses, and learning areas from the Skylent catalog.
          </p>
        </header>

        <div className="skills-explorer">
          <nav className="skills-explorer-nav" aria-label="Skill domain navigation">
            <div className="skills-explorer-mobile">
              <label htmlFor="skills-domain-select" className="skylent-label skills-explorer-mobile-label">
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
                    {!domain.hasCatalog ? " — Coming soon" : ` (${domain.catalogItems.length})`}
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
              <p className="skylent-label skills-explorer-list-label">Explore skills</p>
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
                    aria-controls={PANEL_ID}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectDomain(domain.id)}
                    className={`skills-explorer-tab${selected ? " is-selected" : ""}`}
                  >
                    <span className="skills-explorer-tab-row">
                      <span className="skills-explorer-tab-label">{domain.label}</span>
                      {domain.hasCatalog ? (
                        <span className="skills-explorer-tab-count" aria-label={`${domain.catalogItems.length} catalog items`}>
                          {domain.catalogItems.length}
                        </span>
                      ) : (
                        <span className="skills-explorer-tab-meta">Coming soon</span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </nav>

          <SkillsDomainPanel
            domain={active}
            panelId={PANEL_ID}
            labelledBy={`skills-tab-${activeId}`}
          />
        </div>
      </div>
    </Section>
  )
}
