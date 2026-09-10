import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SKILLS_MOVE_DIRECTIONS,
  SKILLS_MOVE_ITEMS,
  type SkillsMoveDirectionId,
  type SkillsMoveDomainId,
} from './skills-move-data'

export default function SkillsNextStepPreview() {
  const baseId = useId()
  const [domainId, setDomainId] = useState<SkillsMoveDomainId>('data-ai')
  const [directionId, setDirectionId] = useState<SkillsMoveDirectionId>('deepen')

  const item =
    SKILLS_MOVE_ITEMS.find(entry => entry.id === domainId)
    ?? SKILLS_MOVE_ITEMS[0]

  useEffect(() => {
    setDirectionId('deepen')
  }, [domainId])

  const direction =
    item.directions.find(entry => entry.id === directionId)
    ?? item.directions[0]

  const domainIndex = SKILLS_MOVE_ITEMS.findIndex(entry => entry.id === domainId)
  const directionIndex = SKILLS_MOVE_DIRECTIONS.indexOf(directionId)

  const onDomainKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = (domainIndex + 1) % SKILLS_MOVE_ITEMS.length
      setDomainId(SKILLS_MOVE_ITEMS[next].id)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = (domainIndex - 1 + SKILLS_MOVE_ITEMS.length) % SKILLS_MOVE_ITEMS.length
      setDomainId(SKILLS_MOVE_ITEMS[next].id)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setDomainId(SKILLS_MOVE_ITEMS[0].id)
    } else if (event.key === 'End') {
      event.preventDefault()
      setDomainId(SKILLS_MOVE_ITEMS[SKILLS_MOVE_ITEMS.length - 1].id)
    }
  }, [domainIndex])

  const onDirectionKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = (directionIndex + 1) % SKILLS_MOVE_DIRECTIONS.length
      setDirectionId(SKILLS_MOVE_DIRECTIONS[next])
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = (directionIndex - 1 + SKILLS_MOVE_DIRECTIONS.length) % SKILLS_MOVE_DIRECTIONS.length
      setDirectionId(SKILLS_MOVE_DIRECTIONS[next])
    } else if (event.key === 'Home') {
      event.preventDefault()
      setDirectionId(SKILLS_MOVE_DIRECTIONS[0])
    } else if (event.key === 'End') {
      event.preventDefault()
      setDirectionId(SKILLS_MOVE_DIRECTIONS[SKILLS_MOVE_DIRECTIONS.length - 1])
    }
  }, [directionIndex])

  return (
    <section id="job-assistance" className="skills-scroll6" aria-labelledby={`${baseId}-heading`}>
      <div className="skills-scroll6-inner">
        <header className="skills-scroll6-copy">
          <div className="home-section-label"><span />Move</div>
          <h2 id={`${baseId}-heading`}>
            Know what to do <em>next.</em>
          </h2>
          <p>
            Once you can show the work, the next step is clearer — deepen the capability, take on harder work, or use what you've built toward your next goal.
          </p>
        </header>

        <div
          className="skills-scroll6-domains"
          role="tablist"
          aria-label="Next-step domains"
          onKeyDown={onDomainKeyDown}
        >
          {SKILLS_MOVE_ITEMS.map(entry => {
            const selected = entry.id === domainId
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                id={`${baseId}-domain-${entry.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                className={selected ? 'is-active' : ''}
                onClick={() => setDomainId(entry.id)}
              >
                <span aria-hidden="true">{entry.index}</span>
                {entry.label}
              </button>
            )
          })}
        </div>

        <div
          className="skills-scroll6-panel"
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-domain-${item.id}`}
        >
          <article className="skills-scroll6-object" aria-live="polite">
            <div className="skills-scroll6-summary">
              <div>
                <span className="skills-scroll6-kicker">Current evidence</span>
                <h3>{item.capability}</h3>
                <p className="skills-scroll6-project">{item.projectTitle}</p>
                <p>{item.evidenceSummary}</p>
              </div>
              <div>
                <span className="skills-scroll6-kicker">What this shows</span>
                <p>{item.shows}</p>
              </div>
            </div>

            <div className="skills-scroll6-next">
              <span className="skills-scroll6-kicker">What you can do next</span>
              <div
                className="skills-scroll6-directions"
                role="tablist"
                aria-label="Next-step directions"
                onKeyDown={onDirectionKeyDown}
              >
                {item.directions.map((entry, index) => {
                  const selected = entry.id === directionId
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      role="tab"
                      id={`${baseId}-direction-${entry.id}`}
                      aria-selected={selected}
                      aria-controls={`${baseId}-direction-panel`}
                      tabIndex={selected ? 0 : -1}
                      className={selected ? 'is-active' : ''}
                      onClick={() => setDirectionId(entry.id)}
                    >
                      <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                      <strong>{entry.label}</strong>
                      <em>{entry.question}</em>
                    </button>
                  )
                })}
              </div>

              <div
                className="skills-scroll6-direction-panel"
                role="tabpanel"
                id={`${baseId}-direction-panel`}
                aria-labelledby={`${baseId}-direction-${direction.id}`}
              >
                <h4>{direction.title}</h4>
                <p>{direction.body}</p>
                {direction.relatedWork && (
                  <p className="skills-scroll6-related">
                    <span>Catalogue project</span>
                    <strong>{direction.relatedWork}</strong>
                  </p>
                )}
                <div className="skills-scroll6-cta">
                  <div>
                    <span>{item.catalogueKind}</span>
                    <strong>{item.catalogueTitle}</strong>
                  </div>
                  <Link className="home-primary-button" to={direction.to}>
                    {direction.cta} <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            </div>

            <footer className="skills-scroll6-foot">
              <p>
                Illustrative next-step preview · actual pathways depend on the programme and learner's goals
              </p>
            </footer>
          </article>
        </div>
      </div>
    </section>
  )
}
