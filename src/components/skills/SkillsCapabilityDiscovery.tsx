import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SKILLS_DISCOVERY_DOMAINS,
  type SkillsDiscoveryDomainId,
} from './skills-discovery-data'

export default function SkillsCapabilityDiscovery() {
  const baseId = useId()
  const [domainId, setDomainId] = useState<SkillsDiscoveryDomainId>('data-ai')
  const domain = SKILLS_DISCOVERY_DOMAINS.find(d => d.id === domainId) ?? SKILLS_DISCOVERY_DOMAINS[0]
  const [capabilityId, setCapabilityId] = useState(domain.capabilities[0]?.id ?? '')

  useEffect(() => {
    setCapabilityId(domain.capabilities[0]?.id ?? '')
  }, [domain])

  const capability = domain.capabilities.find(c => c.id === capabilityId) ?? domain.capabilities[0]
  const domainIndex = SKILLS_DISCOVERY_DOMAINS.findIndex(d => d.id === domainId)

  const onDomainKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = (domainIndex + 1) % SKILLS_DISCOVERY_DOMAINS.length
      setDomainId(SKILLS_DISCOVERY_DOMAINS[next].id)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = (domainIndex - 1 + SKILLS_DISCOVERY_DOMAINS.length) % SKILLS_DISCOVERY_DOMAINS.length
      setDomainId(SKILLS_DISCOVERY_DOMAINS[next].id)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setDomainId(SKILLS_DISCOVERY_DOMAINS[0].id)
    } else if (event.key === 'End') {
      event.preventDefault()
      setDomainId(SKILLS_DISCOVERY_DOMAINS[SKILLS_DISCOVERY_DOMAINS.length - 1].id)
    }
  }, [domainIndex])

  if (!capability) return null

  return (
    <section className="skills-scroll2" aria-labelledby={`${baseId}-heading`}>
      <div className="skills-scroll2-inner">
        <header className="skills-scroll2-copy">
          <div className="home-section-label"><span />Capability discovery</div>
          <h2 id={`${baseId}-heading`}>
            Build a capability,<br />
            not just a <em>course.</em>
          </h2>
          <p>
            See what each domain lets you do — then open the real programme or course that supports it.
          </p>
        </header>

        <div
          className="skills-scroll2-domains"
          role="tablist"
          aria-label="Skill domains"
          onKeyDown={onDomainKeyDown}
        >
          {SKILLS_DISCOVERY_DOMAINS.map(item => {
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

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-domain-${domain.id}`}
          className="skills-scroll2-panel"
        >
          <p className="skills-scroll2-domain-summary">{domain.summary}</p>

          <div className="skills-scroll2-layout">
            <div className="skills-scroll2-list" role="group" aria-label={`${domain.label} capabilities`}>
              {domain.capabilities.map((item, index) => {
                const selected = item.id === capability.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={selected ? 'is-active' : ''}
                    aria-pressed={selected}
                    onClick={() => setCapabilityId(item.id)}
                  >
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <strong>{item.action}</strong>
                    <em>{item.catalogueKind}</em>
                  </button>
                )
              })}
            </div>

            <article className="skills-scroll2-detail" aria-live="polite">
              <span className="skills-scroll2-kicker">Capability</span>
              <h3>{capability.action}</h3>
              <p className="skills-scroll2-meaning">{capability.meaning}</p>
              <p className="skills-scroll2-enables"><strong>Enables:</strong> {capability.enables}</p>

              <div className="skills-scroll2-skills" aria-label="Supporting skills from catalogue">
                {capability.skills.map(skill => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <div className="skills-scroll2-source">
                <span>{capability.catalogueKind}</span>
                <strong>{capability.catalogueTitle}</strong>
              </div>

              <Link className="home-primary-button" to={capability.to}>
                Start with {capability.catalogueTitle} <span aria-hidden="true">↗</span>
              </Link>
            </article>

            <aside className="skills-scroll2-artifact" aria-label="Representative capability activity">
              <div className="skills-scroll2-artifact-rail" aria-hidden="true">
                <span>{domain.label}</span>
                <span>Representative</span>
              </div>
              <div className="skills-scroll2-artifact-body">
                <span>{capability.artifact.kicker}</span>
                <h4>{capability.artifact.title}</h4>
                <ul>
                  {capability.artifact.lines.map(line => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p>{capability.artifact.note}</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
