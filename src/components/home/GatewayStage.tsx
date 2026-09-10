import { useState } from 'react'
import type { GatewayIntent } from './gateway-intents'

function SkillsArtifact() {
  return (
    <div className="gw-artifact gw-artifact--skills">
      <div className="gw-skills-bar">
        <span>project · customer-churn.csv</span>
        <span>run</span>
      </div>
      <div className="gw-skills-body">
        <pre className="gw-skills-code">{`SELECT region, COUNT(*) AS churned
FROM customers
WHERE last_active < DATE '2025-01-01'
GROUP BY region
ORDER BY churned DESC;`}</pre>
        <aside className="gw-skills-output">
          <strong>Output</strong>
          <ul>
            <li><span>West</span><b>142</b></li>
            <li><span>North</span><b>98</b></li>
            <li><span>South</span><b>71</b></li>
          </ul>
          <p>Task: explain the pattern, then propose one intervention.</p>
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
      <p className="gw-exams-kicker">Practice · Mechanics</p>
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
        <p className="gw-exams-note">
          {picked === 'b'
            ? 'Friction opposes motion along the ramp, so net acceleration drops.'
            : 'Look at forces along the ramp — friction acts against the slide.'}
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
        <p>What happens if the planet moves faster?</p>
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
      </div>
      <p className="gw-school-observe">
        {mode === 'steady'
          ? 'Observation: gravity and motion stay balanced.'
          : 'Observation: the path widens — escape becomes possible.'}
      </p>
    </div>
  )
}

function UniversityArtifact() {
  return (
    <div className="gw-artifact gw-artifact--university">
      <p className="gw-uni-kicker">Project brief</p>
      <h3 className="gw-uni-title">Design a small water-quality sensor for a campus lake.</h3>
      <div className="gw-uni-grid">
        <div>
          <span>Understand</span>
          <p>Map the variables that affect local water quality.</p>
        </div>
        <div>
          <span>Apply</span>
          <p>Choose sensors, sampling logic, and a simple model.</p>
        </div>
        <div>
          <span>Deliver</span>
          <p>Prototype, test, and explain trade-offs in a short report.</p>
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
        <p>Segmented inactive customers by region and proposed one retention experiment.</p>
        <ul>
          <li>SQL analysis</li>
          <li>Written recommendation</li>
          <li>Review notes</li>
        </ul>
      </div>
      <div className="gw-career-next">
        <p className="gw-career-kicker">Next step</p>
        <h3>Attach this proof to your profile</h3>
        <p>Show the work, then move toward the roles it supports.</p>
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
