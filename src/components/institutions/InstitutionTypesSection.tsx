import { useCallback, useRef, useState } from "react"
import { Eyebrow, Heading, Section, T } from "../ui"
import {
  getDefaultInstitutionTypeId,
  getInstitutionTypeById,
  getInstitutionTypes,
  type InstitutionTypeId,
} from "../../lib/institution-types"
import InstitutionTypePanel from "./InstitutionTypePanel"

const institutionTypes = getInstitutionTypes()
const PANEL_ID = "institution-type-panel"

export default function InstitutionTypesSection() {
  const [activeId, setActiveId] = useState<InstitutionTypeId>(getDefaultInstitutionTypeId())
  const listRef = useRef<HTMLDivElement>(null)
  const active = getInstitutionTypeById(activeId)

  const selectType = useCallback((id: InstitutionTypeId) => {
    setActiveId(id)
  }, [])

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = institutionTypes.findIndex((type) => type.id === activeId)
      if (currentIndex < 0) return

      let nextIndex = currentIndex
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault()
        nextIndex = (currentIndex + 1) % institutionTypes.length
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault()
        nextIndex = (currentIndex - 1 + institutionTypes.length) % institutionTypes.length
      } else if (event.key === "Home") {
        event.preventDefault()
        nextIndex = 0
      } else if (event.key === "End") {
        event.preventDefault()
        nextIndex = institutionTypes.length - 1
      } else {
        return
      }

      const next = institutionTypes[nextIndex]
      selectType(next.id)
      const button = listRef.current?.querySelector<HTMLButtonElement>(`[data-institution-id="${next.id}"]`)
      button?.focus()
    },
    [activeId, selectType],
  )

  return (
    <Section
      id="institution-types"
      tone="canvas"
      style={{ paddingTop: "clamp(88px, 12vw, 120px)", paddingBottom: T.sectionTight }}
    >
      <div className="institution-types-section">
        <header className="skills-explorer-intro">
          <Eyebrow tone="dark">For Institutions</Eyebrow>
          <Heading tone="dark" size="lg" style={{ margin: "16px 0 12px" }}>
            What does Skylent provide to an institution?
          </Heading>
          <p className="skills-explorer-intro-copy">
            Select your institution type to see education, skills, programs, assessments, learner development, career workflows, and analytics — with clear availability status.
          </p>
        </header>

        <div className="pathway-explorer institution-type-explorer">
          <nav className="pathway-explorer-nav" aria-label="Institution type navigation">
            <div className="pathway-explorer-mobile">
              <label htmlFor="institution-type-select" className="skylent-label skills-explorer-mobile-label">
                Institution type
              </label>
              <select
                id="institution-type-select"
                className="pathway-explorer-select"
                value={activeId}
                onChange={(event) => selectType(event.target.value as InstitutionTypeId)}
              >
                {institutionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label} — {type.sub}
                  </option>
                ))}
              </select>
            </div>

            <div
              ref={listRef}
              className="pathway-explorer-list"
              role="tablist"
              aria-label="Institution types"
              aria-orientation="vertical"
              onKeyDown={handleListKeyDown}
            >
              <p className="skylent-label skills-explorer-list-label">Institution types</p>
              {institutionTypes.map((type) => {
                const selected = type.id === activeId
                const availableCount = type.availableCapabilities.length
                return (
                  <button
                    key={type.id}
                    type="button"
                    role="tab"
                    data-institution-id={type.id}
                    id={`institution-tab-${type.id}`}
                    aria-selected={selected}
                    aria-controls={PANEL_ID}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectType(type.id)}
                    className={`pathway-explorer-tab${selected ? " is-selected" : ""}`}
                  >
                    <span className="skills-explorer-tab-row">
                      <span>
                        <span className="pathway-explorer-tab-label">{type.label}</span>
                        <span className="pathway-explorer-tab-meta">{type.sub}</span>
                      </span>
                      {availableCount > 0 ? (
                        <span className="skills-explorer-tab-count" aria-label={`${availableCount} available capabilities`}>
                          {availableCount}
                        </span>
                      ) : (
                        <span className="skills-explorer-tab-meta">Inquiry</span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </nav>

          <InstitutionTypePanel
            institution={active}
            panelId={PANEL_ID}
            labelledBy={`institution-tab-${activeId}`}
          />
        </div>
      </div>
    </Section>
  )
}
