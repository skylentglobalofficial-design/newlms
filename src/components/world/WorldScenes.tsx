import type { WorldId } from '../../skylent-worlds'

const LABELS: Record<WorldId, string> = {
  learn: 'Workspace / project artefacts',
  exams: 'Timed attempt / review sheet',
  schooling: 'Class notebook / experiment',
  university: 'Lab bench / research notes',
  career: 'Profile / next action',
  institutions: 'Delivery board / operations',
}

export default function WorldScene({
  world,
  compact = false,
}: {
  world: WorldId
  compact?: boolean
}) {
  return (
    <div className={`world-scene world-scene--${world}${compact ? ' is-compact' : ''}`} aria-hidden="true">
      <div className="world-scene-label">{LABELS[world]}</div>
      {world === 'learn' && <LearnScene />}
      {world === 'exams' && <ExamScene />}
      {world === 'schooling' && <SchoolScene />}
      {world === 'university' && <UniversityScene />}
      {world === 'career' && <CareerScene />}
      {world === 'institutions' && <InstitutionScene />}
    </div>
  )
}

function LearnScene() {
  return (
    <div className="scene-learn">
      <div className="scene-window">
        <span>sales_analysis.py</span>
        <code>
          {`SELECT region, SUM(revenue)
FROM sales
GROUP BY region;`}
        </code>
      </div>
      <div className="scene-aside">
        <b>Dashboard v2</b>
        <i />
        <i />
        <i />
        <small>Evidence · not a mock metric</small>
      </div>
    </div>
  )
}

function ExamScene() {
  return (
    <div className="scene-exam">
      <div className="scene-timer">12:40</div>
      <ol>
        <li className="is-done">Mechanics · attempted</li>
        <li className="is-active">Calculus · in review</li>
        <li>Organic · queued</li>
      </ol>
      <div className="scene-grid">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} className={i === 4 || i === 11 ? 'is-mark' : ''} />
        ))}
      </div>
    </div>
  )
}

function SchoolScene() {
  return (
    <div className="scene-school">
      <div className="scene-notebook">
        <em>Class 8 · Science</em>
        <strong>Why does ice float?</strong>
        <p>Density of ice is lower than water. Observe, then write the explanation.</p>
      </div>
      <div className="scene-beaker">
        <span />
        <span />
      </div>
    </div>
  )
}

function UniversityScene() {
  return (
    <div className="scene-uni">
      <div className="scene-lab">
        <b>Project studio</b>
        <ul>
          <li>Brief</li>
          <li>Method</li>
          <li>Build</li>
          <li>Review</li>
        </ul>
      </div>
      <div className="scene-thesis">
        <span>Capstone outline</span>
        <p>Question → literature → method → artefact → defence</p>
      </div>
    </div>
  )
}

function CareerScene() {
  return (
    <div className="scene-career">
      <div className="scene-profile">
        <b>Your next action</b>
        <p>Evidence before applications.</p>
      </div>
      <ul>
        <li>Update project proof</li>
        <li>Prepare one interview</li>
        <li>Open CareerOS when ready</li>
      </ul>
    </div>
  )
}

function InstitutionScene() {
  return (
    <div className="scene-ops">
      <div className="scene-board">
        <span>Programmes</span>
        <span>Batches</span>
        <span>Delivery</span>
        <span>Assessment</span>
      </div>
      <div className="scene-rows">
        <p>School calendar</p>
        <p>College LMS</p>
        <p>Skylent OS</p>
      </div>
    </div>
  )
}
