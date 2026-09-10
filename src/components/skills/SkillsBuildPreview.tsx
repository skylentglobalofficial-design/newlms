import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SKILLS_BUILD_ARTIFACTS,
  SKILLS_BUILD_STAGES,
  type SkillsBuildDomainId,
  type SkillsBuildStageId,
} from './skills-build-data'

export default function SkillsBuildPreview() {
  const baseId = useId()
  const [domainId, setDomainId] = useState<SkillsBuildDomainId>('data-ai')
  const [stageId, setStageId] = useState<SkillsBuildStageId>('brief')

  const artifact =
    SKILLS_BUILD_ARTIFACTS.find(item => item.id === domainId)
    ?? SKILLS_BUILD_ARTIFACTS[0]

  useEffect(() => {
    setStageId('brief')
  }, [domainId])

  const stage = artifact.stages.find(item => item.id === stageId) ?? artifact.stages[0]
  const domainIndex = SKILLS_BUILD_ARTIFACTS.findIndex(item => item.id === domainId)
  const stageIndex = SKILLS_BUILD_STAGES.indexOf(stageId)

  const onDomainKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = (domainIndex + 1) % SKILLS_BUILD_ARTIFACTS.length
      setDomainId(SKILLS_BUILD_ARTIFACTS[next].id)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = (domainIndex - 1 + SKILLS_BUILD_ARTIFACTS.length) % SKILLS_BUILD_ARTIFACTS.length
      setDomainId(SKILLS_BUILD_ARTIFACTS[next].id)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setDomainId(SKILLS_BUILD_ARTIFACTS[0].id)
    } else if (event.key === 'End') {
      event.preventDefault()
      setDomainId(SKILLS_BUILD_ARTIFACTS[SKILLS_BUILD_ARTIFACTS.length - 1].id)
    }
  }, [domainIndex])

  const onStageKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = (stageIndex + 1) % SKILLS_BUILD_STAGES.length
      setStageId(SKILLS_BUILD_STAGES[next])
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = (stageIndex - 1 + SKILLS_BUILD_STAGES.length) % SKILLS_BUILD_STAGES.length
      setStageId(SKILLS_BUILD_STAGES[next])
    } else if (event.key === 'Home') {
      event.preventDefault()
      setStageId(SKILLS_BUILD_STAGES[0])
    } else if (event.key === 'End') {
      event.preventDefault()
      setStageId(SKILLS_BUILD_STAGES[SKILLS_BUILD_STAGES.length - 1])
    }
  }, [stageIndex])

  return (
    <section className="skills-scroll4" aria-labelledby={`${baseId}-heading`}>
      <div className="skills-scroll4-inner">
        <div className="skills-scroll4-intro">
          <header className="skills-scroll4-copy">
            <div className="home-section-label"><span />Build</div>
            <h2 id={`${baseId}-heading`}>
              Build something you can <em>show.</em>
            </h2>
            <p>
              Practice becomes capability when you can turn it into a piece of work — something you can inspect, explain, and build on.
            </p>
          </header>

          <div
            className="skills-scroll4-domains"
            role="tablist"
            aria-label="Build domains"
            onKeyDown={onDomainKeyDown}
          >
            {SKILLS_BUILD_ARTIFACTS.map(item => {
              const selected = item.id === domainId
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`${baseId}-domain-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  className={selected ? 'is-active' : ''}
                  onClick={() => setDomainId(item.id)}
                >
                  <span aria-hidden="true">{item.index}</span>
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="skills-scroll4-meta">
            <span>{artifact.capability}</span>
            <strong>{artifact.projectTitle}</strong>
          </div>
        </div>

        <div
          className="skills-scroll4-panel"
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-domain-${artifact.id}`}
        >
          <div
            className="skills-scroll4-stages"
            role="tablist"
            aria-label="Build stages"
            onKeyDown={onStageKeyDown}
          >
            {artifact.stages.map((item, index) => {
              const selected = item.id === stageId
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`${baseId}-stage-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-artifact`}
                  tabIndex={selected ? 0 : -1}
                  className={selected ? 'is-active' : ''}
                  onClick={() => setStageId(item.id)}
                >
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item.label}</strong>
                  <em>{item.question}</em>
                </button>
              )
            })}
          </div>

          <article
            className={`skills-scroll4-artifact skills-scroll4-artifact--${stage.surface}`}
            role="tabpanel"
            id={`${baseId}-artifact`}
            aria-labelledby={`${baseId}-stage-${stage.id}`}
            aria-live="polite"
          >
            <header className="skills-scroll4-artifact-head">
              <span>{stage.kicker}</span>
              <h3>{stage.title}</h3>
            </header>

            {stage.surface === 'code' ? (
              <pre className="skills-scroll4-code"><code>{stage.lines.join('\n')}</code></pre>
            ) : (
              <ul className={`skills-scroll4-lines${stage.surface === 'memo' ? ' skills-scroll4-lines--memo' : ''}`}>
                {stage.lines.map(line => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}

            {stage.callout && (
              <p className="skills-scroll4-callout">{stage.callout}</p>
            )}

            <footer className="skills-scroll4-artifact-foot">
              <p>Illustrative build preview · based on the kind of work the programme develops</p>
            </footer>
          </article>

          <div className="skills-scroll4-cta">
            <div>
              <span>{artifact.catalogueKind}</span>
              <strong>{artifact.catalogueTitle}</strong>
            </div>
            <Link className="home-primary-button" to={artifact.to}>
              {artifact.cta} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
