import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SKILLS_EVIDENCE_ITEMS,
  SKILLS_EVIDENCE_STAGES,
  type SkillsEvidenceDomainId,
  type SkillsEvidenceStageId,
} from './skills-evidence-data'

export default function SkillsEvidencePreview() {
  const baseId = useId()
  const [domainId, setDomainId] = useState<SkillsEvidenceDomainId>('data-ai')
  const [stageId, setStageId] = useState<SkillsEvidenceStageId>('work')

  const item =
    SKILLS_EVIDENCE_ITEMS.find(entry => entry.id === domainId)
    ?? SKILLS_EVIDENCE_ITEMS[0]

  useEffect(() => {
    setStageId('work')
  }, [domainId])

  const stage = item.stages.find(entry => entry.id === stageId) ?? item.stages[0]
  const domainIndex = SKILLS_EVIDENCE_ITEMS.findIndex(entry => entry.id === domainId)
  const stageIndex = SKILLS_EVIDENCE_STAGES.indexOf(stageId)

  const onDomainKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = (domainIndex + 1) % SKILLS_EVIDENCE_ITEMS.length
      setDomainId(SKILLS_EVIDENCE_ITEMS[next].id)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = (domainIndex - 1 + SKILLS_EVIDENCE_ITEMS.length) % SKILLS_EVIDENCE_ITEMS.length
      setDomainId(SKILLS_EVIDENCE_ITEMS[next].id)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setDomainId(SKILLS_EVIDENCE_ITEMS[0].id)
    } else if (event.key === 'End') {
      event.preventDefault()
      setDomainId(SKILLS_EVIDENCE_ITEMS[SKILLS_EVIDENCE_ITEMS.length - 1].id)
    }
  }, [domainIndex])

  const onStageKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = (stageIndex + 1) % SKILLS_EVIDENCE_STAGES.length
      setStageId(SKILLS_EVIDENCE_STAGES[next])
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = (stageIndex - 1 + SKILLS_EVIDENCE_STAGES.length) % SKILLS_EVIDENCE_STAGES.length
      setStageId(SKILLS_EVIDENCE_STAGES[next])
    } else if (event.key === 'Home') {
      event.preventDefault()
      setStageId(SKILLS_EVIDENCE_STAGES[0])
    } else if (event.key === 'End') {
      event.preventDefault()
      setStageId(SKILLS_EVIDENCE_STAGES[SKILLS_EVIDENCE_STAGES.length - 1])
    }
  }, [stageIndex])

  return (
    <section className="skills-scroll5" aria-labelledby={`${baseId}-heading`}>
      <div className="skills-scroll5-inner">
        <header className="skills-scroll5-copy">
          <div className="home-section-label"><span />Prove</div>
          <h2 id={`${baseId}-heading`}>
            Make the work <em>count.</em>
          </h2>
          <p>
            Keep the work, the reasoning behind it, and the decisions you made — so your progress becomes evidence of what you can actually do.
          </p>
        </header>

        <div
          className="skills-scroll5-domains"
          role="tablist"
          aria-label="Evidence domains"
          onKeyDown={onDomainKeyDown}
        >
          {SKILLS_EVIDENCE_ITEMS.map(entry => {
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
          className="skills-scroll5-panel"
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-domain-${item.id}`}
        >
          <div className="skills-scroll5-context">
            <span>{item.capability}</span>
            <strong>{item.projectTitle}</strong>
          </div>

          <div
            className="skills-scroll5-stages"
            role="tablist"
            aria-label="Evidence stages"
            onKeyDown={onStageKeyDown}
          >
            {item.stages.map((entry, index) => {
              const selected = entry.id === stageId
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  id={`${baseId}-stage-${entry.id}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-object`}
                  tabIndex={selected ? 0 : -1}
                  className={selected ? 'is-active' : ''}
                  onClick={() => setStageId(entry.id)}
                >
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{entry.label}</strong>
                  <em>{entry.question}</em>
                </button>
              )
            })}
          </div>

          <article
            className={`skills-scroll5-object skills-scroll5-object--${stage.surface}`}
            role="tabpanel"
            id={`${baseId}-object`}
            aria-labelledby={`${baseId}-stage-${stage.id}`}
            aria-live="polite"
          >
            <header className="skills-scroll5-object-head">
              <div>
                <span className="skills-scroll5-kicker">{stage.kicker}</span>
                <h3>{stage.title}</h3>
              </div>
              <p className="skills-scroll5-path" aria-hidden="true">
                Work → Reasoning → Evidence
              </p>
            </header>

            {stage.surface === 'record' && stage.fields ? (
              <dl className="skills-scroll5-record">
                {stage.fields.map(field => (
                  <div key={field.label}>
                    <dt>{field.label}</dt>
                    <dd>{field.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <ul className={`skills-scroll5-lines${stage.surface === 'annotation' ? ' skills-scroll5-lines--annotate' : ''}`}>
                {stage.lines.map(line => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}

            {stage.note && <p className="skills-scroll5-note">{stage.note}</p>}

            <footer className="skills-scroll5-object-foot">
              <p>Illustrative evidence preview · shows how work can be structured as evidence</p>
            </footer>
          </article>

          <div className="skills-scroll5-cta">
            <div>
              <span>{item.catalogueKind}</span>
              <strong>{item.catalogueTitle}</strong>
            </div>
            <Link className="home-primary-button" to={item.to}>
              {item.cta} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
