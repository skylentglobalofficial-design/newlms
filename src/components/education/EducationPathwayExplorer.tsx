import { useCallback, useRef, useState } from "react"
import { Eyebrow, Heading, Section, T } from "../ui"
import {
  getDefaultEducationPathwayId,
  getEducationPathwayById,
  getEducationPathways,
  type EducationPathwayId,
} from "../../lib/education-pathways"
import EducationPathwayPanel from "./EducationPathwayPanel"

const pathways = getEducationPathways()
const PANEL_ID = "education-pathway-panel"

export default function EducationPathwayExplorer() {
  const [activeId, setActiveId] = useState<EducationPathwayId>(getDefaultEducationPathwayId())
  const listRef = useRef<HTMLDivElement>(null)
  const active = getEducationPathwayById(activeId)

  const selectPathway = useCallback((id: EducationPathwayId) => {
    setActiveId(id)
  }, [])

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = pathways.findIndex((pathway) => pathway.id === activeId)
      if (currentIndex < 0) return

      let nextIndex = currentIndex
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault()
        nextIndex = (currentIndex + 1) % pathways.length
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault()
        nextIndex = (currentIndex - 1 + pathways.length) % pathways.length
      } else if (event.key === "Home") {
        event.preventDefault()
        nextIndex = 0
      } else if (event.key === "End") {
        event.preventDefault()
        nextIndex = pathways.length - 1
      } else {
        return
      }

      const next = pathways[nextIndex]
      selectPathway(next.id)
      const button = listRef.current?.querySelector<HTMLButtonElement>(`[data-pathway-id="${next.id}"]`)
      button?.focus()
    },
    [activeId, selectPathway],
  )

  return (
    <Section tone="canvas" style={{ paddingTop: "clamp(88px, 12vw, 120px)", paddingBottom: T.sectionTight }}>
      <div className="education-pathway-section">
        <header className="skills-explorer-intro">
          <Eyebrow tone="dark">Education</Eyebrow>
          <Heading tone="dark" size="lg" style={{ margin: "16px 0 12px" }}>
            What can I study with Skylent?
          </Heading>
          <p className="skills-explorer-intro-copy">
            Schooling, undergraduate, postgraduate, and entrance exams are different pathways. Select one to see formats, preparation structure, and catalog offerings.
          </p>
        </header>

        <div className="pathway-explorer education-pathway-explorer">
          <nav className="pathway-explorer-nav" aria-label="Education pathway navigation">
            <div className="pathway-explorer-mobile">
              <label htmlFor="education-pathway-select" className="skylent-label skills-explorer-mobile-label">
                Education pathways
              </label>
              <select
                id="education-pathway-select"
                className="pathway-explorer-select"
                value={activeId}
                onChange={(event) => selectPathway(event.target.value as EducationPathwayId)}
              >
                {pathways.map((pathway) => (
                  <option key={pathway.id} value={pathway.id}>
                    {pathway.label}
                    {!pathway.hasCatalog ? " — Coming soon" : ` (${pathway.catalogItems.length})`}
                  </option>
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
              <p className="skylent-label skills-explorer-list-label">Pathways</p>
              {pathways.map((pathway) => {
                const selected = pathway.id === activeId
                return (
                  <button
                    key={pathway.id}
                    type="button"
                    role="tab"
                    data-pathway-id={pathway.id}
                    id={`education-tab-${pathway.id}`}
                    aria-selected={selected}
                    aria-controls={PANEL_ID}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectPathway(pathway.id)}
                    className={`pathway-explorer-tab${selected ? " is-selected" : ""}`}
                  >
                    <span className="skills-explorer-tab-row">
                      <span>
                        <span className="pathway-explorer-tab-label">{pathway.label}</span>
                        <span className="pathway-explorer-tab-meta">{pathway.sub}</span>
                      </span>
                      {pathway.hasCatalog ? (
                        <span className="skills-explorer-tab-count" aria-label={`${pathway.catalogItems.length} programs`}>
                          {pathway.catalogItems.length}
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

          <EducationPathwayPanel
            pathway={active}
            panelId={PANEL_ID}
            labelledBy={`education-tab-${activeId}`}
          />
        </div>
      </div>
    </Section>
  )
}
