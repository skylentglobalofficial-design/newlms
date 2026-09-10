import { useCallback, useId, useState } from 'react'
import { Link } from 'react-router-dom'

export type SkillsCapabilityId = 'data-ai' | 'coding' | 'business'

type SkillsCapability = {
  id: SkillsCapabilityId
  index: string
  label: string
  blurb: string
  cta: string
  to: string
  source: string
  artifact: {
    rail: string
    kicker: string
    title: string
    body: string[]
    note: string
  }
}

/**
 * Capability options derived from real PROFESSIONAL / CERTIFICATE programs
 * and related courses in src/data.ts. Design is omitted — no catalog support.
 */
export const SKILLS_CAPABILITIES: SkillsCapability[] = [
  {
    id: 'data-ai',
    index: '01',
    label: 'Data & AI',
    blurb: 'Analyse data, write queries, and apply AI where it helps the work.',
    cta: 'Explore Data Analytics',
    to: '/programs/data-analytics-pro',
    source: 'Programs: data-analytics-pro, data-science-ai, generative-ai-program, sql-certificate · Courses: data-analytics, power-bi, generative-ai',
    artifact: {
      rail: 'Data · Analytics · Representative',
      kicker: 'Working analysis',
      title: 'Find where customers go quiet',
      body: [
        'SELECT region, days_since_visit',
        'FROM customer_activity',
        'WHERE days_since_visit > 14',
        'ORDER BY days_since_visit DESC;',
      ],
      note: 'Representative SQL task · not a learner result',
    },
  },
  {
    id: 'coding',
    index: '02',
    label: 'Coding',
    blurb: 'Build software, APIs, and systems you can ship and revise.',
    cta: 'Explore Full Stack',
    to: '/programs/full-stack',
    source: 'Programs: full-stack · Courses: full-stack-web, python-programming',
    artifact: {
      rail: 'Coding · Full stack · Representative',
      kicker: 'Build surface',
      title: 'Ship a working endpoint',
      body: [
        'POST /api/orders',
        'validate(payload)',
        'save(order)',
        'return 201 Created',
      ],
      note: 'Representative build task · not a live project',
    },
  },
  {
    id: 'business',
    index: '03',
    label: 'Business',
    blurb: 'Make product decisions, frame cases, and defend a recommendation.',
    cta: 'Explore Product Management',
    to: '/programs/product-management',
    source: 'Programs: product-management · Courses: product-management',
    artifact: {
      rail: 'Business · Product · Representative',
      kicker: 'Case brief',
      title: 'Which launch path first?',
      body: [
        'Constraint: 6-week window',
        'Option A — high demand, higher risk',
        'Option B — lower cost, slower reach',
        'Write the recommendation.',
      ],
      note: 'Representative case · not an institutional result',
    },
  },
]

export default function SkillsCapabilityHero() {
  const baseId = useId()
  const [capabilityId, setCapabilityId] = useState<SkillsCapabilityId>('data-ai')
  const capability = SKILLS_CAPABILITIES.find(item => item.id === capabilityId) ?? SKILLS_CAPABILITIES[0]
  const selectedIndex = SKILLS_CAPABILITIES.findIndex(item => item.id === capabilityId)

  const selectByOffset = useCallback((offset: number) => {
    const next = (selectedIndex + offset + SKILLS_CAPABILITIES.length) % SKILLS_CAPABILITIES.length
    setCapabilityId(SKILLS_CAPABILITIES[next].id)
  }, [selectedIndex])

  const onTablistKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      selectByOffset(1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      selectByOffset(-1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setCapabilityId(SKILLS_CAPABILITIES[0].id)
    } else if (event.key === 'End') {
      event.preventDefault()
      setCapabilityId(SKILLS_CAPABILITIES[SKILLS_CAPABILITIES.length - 1].id)
    }
  }, [selectByOffset])

  return (
    <section className="skills-scroll1" aria-labelledby={`${baseId}-heading`}>
      <div className="skills-scroll1-inner">
        <div className="skills-scroll1-copy">
          <div className="home-section-label"><span />Skylent Skills</div>
          <h1 id={`${baseId}-heading`}>
            What do you want<br />
            to be able to <em>do?</em>
          </h1>
          <p>
            Learn the skill. Put it to work. Leave with something you can show.
          </p>

          <div
            className="skills-scroll1-capabilities"
            role="tablist"
            aria-label="Skill capabilities"
            onKeyDown={onTablistKeyDown}
          >
            {SKILLS_CAPABILITIES.map(item => {
              const selected = item.id === capabilityId
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  className={selected ? 'is-active' : ''}
                  onClick={() => setCapabilityId(item.id)}
                >
                  <span aria-hidden="true">{item.index}</span>
                  <strong>{item.label}</strong>
                  <em>{item.blurb}</em>
                </button>
              )
            })}
          </div>

          <div className="skills-scroll1-actions">
            <Link className="home-primary-button" to={capability.to}>
              {capability.cta} <span aria-hidden="true">↗</span>
            </Link>
            <Link className="home-secondary-button" to="/programs">
              Browse programmes
            </Link>
          </div>
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${capability.id}`}
          className={`skills-scroll1-artifact skills-scroll1-artifact--${capability.id}`}
          key={capability.id}
        >
          <div className="skills-scroll1-artifact-rail" aria-hidden="true">
            {capability.artifact.rail.split(' · ').map(part => (
              <span key={part}>{part}</span>
            ))}
          </div>
          <div className="skills-scroll1-artifact-body">
            <span>{capability.artifact.kicker}</span>
            <h2>{capability.artifact.title}</h2>
            <ul className={capability.id === 'business' ? undefined : 'skills-scroll1-code'}>
              {capability.artifact.body.map(line => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p>{capability.artifact.note}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
