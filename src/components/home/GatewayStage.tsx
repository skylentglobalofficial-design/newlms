import { useState } from 'react'
import type { GatewayIntent } from './gateway-intents'

function SkillsArtifact() {
  return (
    <div className="gw-artifact gw-artifact--skills">
      <header className="gw-skills-top">
        <div>
          <p className="gw-skills-task">Build</p>
          <h3>Find where customers are going quiet</h3>
        </div>
        <span className="gw-skills-file">customer-churn.csv</span>
      </header>
      <div className="gw-skills-body">
        <pre className="gw-skills-code">{`SELECT region, COUNT(*) AS quiet
FROM customers
WHERE last_active < DATE '2025-01-01'
GROUP BY region
ORDER BY quiet DESC;`}</pre>
        <aside className="gw-skills-side">
          <p className="gw-skills-side-label">What you&apos;ll produce</p>
          <ul>
            <li>A working query</li>
            <li>A short interpretation</li>
            <li>One recommended next action</li>
          </ul>
          <p className="gw-skills-prompt">Then explain the pattern in your own words.</p>
        </aside>
      </div>
    </div>
  )
}

function ExamsArtifact() {
  const [picked, setPicked] = useState<string | null>(null)
  const choices = [
    { id: 'a', label: 'Acceleration increases' },
    { id: 'b', label: 'Acceleration decreases' },
    { id: 'c', label: 'Acceleration stays the same' },
    { id: 'd', label: 'Direction reverses' },
  ]

  return (
    <div className="gw-artifact gw-artifact--exams">
      <div className="gw-exams-meta">
        <p className="gw-exams-kicker">Practice</p>
        <p className="gw-exams-topic">Mechanics · Friction</p>
      </div>
      <h3 className="gw-exams-question">
        You increase friction on a block sliding down a ramp. What happens to its acceleration?
      </h3>
      <div className="gw-exams-choices" role="group" aria-label="Example practice choices">
        {choices.map((choice, i) => (
          <button
            key={choice.id}
            type="button"
            className={picked === choice.id ? 'is-picked' : ''}
            onClick={() => setPicked(choice.id)}
          >
            <span aria-hidden="true">{String.fromCharCode(65 + i)}</span>
            {choice.label}
          </button>
        ))}
      </div>
      {picked && (
        <p className={`gw-exams-note ${picked === 'b' ? 'is-good' : ''}`}>
          {picked === 'b'
            ? 'Yes — friction opposes the slide, so net acceleration drops.'
            : 'Not yet. Think about the force that acts against motion along the ramp.'}
        </p>
      )}
    </div>
  )
}

function SchoolingArtifact() {
  const [mode, setMode] = useState<'steady' | 'push'>('steady')

  return (
    <div className="gw-artifact gw-artifact--schooling">
      <div className="gw-school-head">
        <div>
          <p className="gw-school-kicker">Try it</p>
          <h3>What happens if the planet moves faster?</h3>
        </div>
        <div className="gw-school-toggles">
          <button type="button" className={mode === 'steady' ? 'is-on' : ''} onClick={() => setMode('steady')}>
            Steady orbit
          </button>
          <button type="button" className={mode === 'push' ? 'is-on' : ''} onClick={() => setMode('push')}>
            Increase speed
          </button>
        </div>
      </div>
      <div className={`gw-school-orbit ${mode}`} aria-hidden="true">
        <span className="gw-school-sun" />
        <span className="gw-school-path" />
        <span className="gw-school-planet" />
        <span className="gw-school-trail" />
      </div>
      <p className="gw-school-observe">
        {mode === 'steady'
          ? 'Observation: gravity and motion stay in balance.'
          : 'Observation: the path widens — escape becomes possible.'}
      </p>
    </div>
  )
}

function UniversityArtifact() {
  return (
    <div className="gw-artifact gw-artifact--university">
      <p className="gw-uni-kicker">Project brief</p>
      <h3 className="gw-uni-title">Design a water-quality sensor for a campus lake.</h3>
      <p className="gw-uni-lead">
        Move from concept to a working prototype — then explain the trade-offs.
      </p>
      <div className="gw-uni-rail">
        <div>
          <span>01</span>
          <strong>Understand</strong>
          <p>Map the variables that matter on site.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Apply</strong>
          <p>Choose sensors, sampling, and a simple model.</p>
        </div>
        <div>
          <span>03</span>
          <strong>Deliver</strong>
          <p>Prototype, test, and write the rationale.</p>
        </div>
      </div>
    </div>
  )
}

function CareerArtifact() {
  return (
    <div className="gw-artifact gw-artifact--career">
      <div className="gw-career-proof">
        <p className="gw-career-kicker">Evidence</p>
        <h3>Churn analysis notebook</h3>
        <p>
          Segmented quiet customers by region and proposed one retention experiment.
        </p>
        <ul>
          <li>Working analysis</li>
          <li>Written recommendation</li>
          <li>Review notes attached</li>
        </ul>
      </div>
      <div className="gw-career-next">
        <p className="gw-career-kicker">Next step</p>
        <h3>Put this on your profile</h3>
        <p>Show the work first. Then move toward roles it supports.</p>
        <span className="gw-career-chip">Proof ready</span>
      </div>
    </div>
  )
}

export default function GatewayStage({ intent }: { intent: GatewayIntent }) {
  return (
    <div
      className={`gateway-stage gateway-stage--${intent.id}`}
      style={{ '--stage-accent': intent.accent } as React.CSSProperties}
    >
      <div className="gateway-stage-label">{intent.stageLabel}</div>
      <div className="gateway-stage-body" key={intent.id}>
        {intent.id === 'skills' && <SkillsArtifact />}
        {intent.id === 'exams' && <ExamsArtifact />}
        {intent.id === 'schooling' && <SchoolingArtifact />}
        {intent.id === 'university' && <UniversityArtifact />}
        {intent.id === 'career' && <CareerArtifact />}
      </div>
    </div>
  )
}
