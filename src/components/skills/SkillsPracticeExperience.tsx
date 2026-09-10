import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SKILLS_PRACTICE_ACTIVITIES,
  type SkillsPracticeDomainId,
} from './skills-practice-data'

export default function SkillsPracticeExperience() {
  const baseId = useId()
  const [domainId, setDomainId] = useState<SkillsPracticeDomainId>('data-ai')
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  const activity =
    SKILLS_PRACTICE_ACTIVITIES.find(item => item.id === domainId)
    ?? SKILLS_PRACTICE_ACTIVITIES[0]

  useEffect(() => {
    setSelectedOptionId(null)
  }, [domainId])

  const domainIndex = SKILLS_PRACTICE_ACTIVITIES.findIndex(item => item.id === domainId)
  const selected = activity.options.find(option => option.id === selectedOptionId) ?? null
  const answered = selected !== null
  const contextIsCode = activity.interaction === 'debug'

  const onDomainKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = (domainIndex + 1) % SKILLS_PRACTICE_ACTIVITIES.length
      setDomainId(SKILLS_PRACTICE_ACTIVITIES[next].id)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = (domainIndex - 1 + SKILLS_PRACTICE_ACTIVITIES.length) % SKILLS_PRACTICE_ACTIVITIES.length
      setDomainId(SKILLS_PRACTICE_ACTIVITIES[next].id)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setDomainId(SKILLS_PRACTICE_ACTIVITIES[0].id)
    } else if (event.key === 'End') {
      event.preventDefault()
      setDomainId(SKILLS_PRACTICE_ACTIVITIES[SKILLS_PRACTICE_ACTIVITIES.length - 1].id)
    }
  }, [domainIndex])

  const retry = () => setSelectedOptionId(null)

  return (
    <section className="skills-scroll3" aria-labelledby={`${baseId}-heading`}>
      <div className="skills-scroll3-inner">
        <header className="skills-scroll3-copy">
          <div className="home-section-label"><span />Practice</div>
          <h2 id={`${baseId}-heading`}>
            Try a piece of the <em>work.</em>
          </h2>
          <p>
            One short scenario per domain. Make a call, read the reasoning, then open the programme that builds it.
          </p>
        </header>

        <div
          className="skills-scroll3-domains"
          role="tablist"
          aria-label="Practice domains"
          onKeyDown={onDomainKeyDown}
        >
          {SKILLS_PRACTICE_ACTIVITIES.map(item => {
            const isActive = item.id === domainId
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`${baseId}-domain-${item.id}`}
                aria-selected={isActive}
                aria-controls={`${baseId}-board`}
                tabIndex={isActive ? 0 : -1}
                className={isActive ? 'is-active' : ''}
                onClick={() => setDomainId(item.id)}
              >
                <span aria-hidden="true">{item.index}</span>
                {item.label}
              </button>
            )
          })}
        </div>

        <div
          className="skills-scroll3-board"
          role="tabpanel"
          id={`${baseId}-board`}
          aria-labelledby={`${baseId}-domain-${activity.id}`}
        >
          <div className="skills-scroll3-meta">
            <span>{activity.capability}</span>
            <em>{activity.interaction}</em>
          </div>

          <div className={`skills-scroll3-workspace${answered ? ' is-answered' : ''}`}>
            <div className="skills-scroll3-context">
              <span className="skills-scroll3-kicker">{activity.contextKicker}</span>
              <h3>{activity.contextTitle}</h3>
              <ul className={contextIsCode ? 'skills-scroll3-code' : undefined}>
                {activity.contextLines.map(line => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p className="skills-scroll3-disclaimer">
                Illustrative practice · not an exam item or real client dataset
              </p>
            </div>

            <div className="skills-scroll3-action">
              <p id={`${baseId}-task`} className="skills-scroll3-task">{activity.task}</p>
              <div
                className="skills-scroll3-options"
                role="radiogroup"
                aria-labelledby={`${baseId}-task`}
                aria-disabled={answered}
              >
                {activity.options.map(option => {
                  const isSelected = selectedOptionId === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={answered}
                      className={[
                        isSelected ? 'is-selected' : '',
                        answered && option.preferred ? 'is-preferred' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => setSelectedOptionId(option.id)}
                    >
                      <span className="skills-scroll3-radio" aria-hidden="true" />
                      {option.label}
                    </button>
                  )
                })}
              </div>

              {selected && (
                <div className="skills-scroll3-result" role="status" aria-live="polite">
                  <span className="skills-scroll3-kicker">
                    {selected.preferred ? 'Strong first move' : 'Useful angle'}
                  </span>
                  <p>{selected.feedback}</p>
                  <div className="skills-scroll3-result-actions">
                    <Link className="home-primary-button" to={activity.to}>
                      {activity.cta} <span aria-hidden="true">↗</span>
                    </Link>
                    <button type="button" className="skills-scroll3-retry" onClick={retry}>
                      Try again
                    </button>
                  </div>
                  <p className="skills-scroll3-source">
                    <span>{activity.catalogueKind}</span>
                    <strong>{activity.catalogueTitle}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
