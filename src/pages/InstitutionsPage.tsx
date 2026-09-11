import { useState } from 'react'
import { Link } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import WorldScene from '../components/world/WorldScenes'

const TYPES = [
  {
    id: 'schools',
    label: 'Schools',
    problem: 'Classes, teachers, and progress sit in different places.',
    value: 'Grade → subject → lesson delivery, assessments, and a parent-visible record.',
    offers: ['Class structure', 'Teacher tools', 'Assessments', 'Progress'],
  },
  {
    id: 'colleges',
    label: 'Colleges',
    problem: 'The degree calendar and skills delivery rarely share a system.',
    value: 'Programmes, departments, LMS, projects, and operations beside the academic year.',
    offers: ['Programmes', 'LMS', 'Projects', 'Student records'],
  },
  {
    id: 'universities',
    label: 'Universities',
    problem: 'Departments scale faster than shared curriculum and assessment infrastructure.',
    value: 'Multi-programme curriculum, assessment, and student lifecycle on Skylent OS.',
    offers: ['Multi-programme', 'Curriculum', 'Assessment', 'Lifecycle'],
  },
  {
    id: 'training',
    label: 'Training organisations',
    problem: 'Batches, trainers, and certificates live in spreadsheets.',
    value: 'Programmes, batches, trainers, learners, and certification as one delivery system.',
    offers: ['Batches', 'Trainers', 'Certification', 'Delivery'],
  },
]

export default function InstitutionsPage() {
  const [activeId, setActiveId] = useState('colleges')
  const active = TYPES.find((item) => item.id === activeId) ?? TYPES[1]

  return (
    <WorldFrame world="institutions">
      <header className="world-hero">
        <div className="world-rail world-split">
          <div>
            <p className="world-kicker">Institutions</p>
            <h1 className="world-title">Institutional learning, run as an operation.</h1>
            <p className="world-lede">
              For schools, colleges, universities, and training organisations. Programmes, delivery, operations, Skylent OS — not a student-facing playground.
            </p>
            <div className="world-actions">
              <Link className="world-btn" to="/contact">Talk to Skylent</Link>
              <Link className="world-btn-ghost" to="/os">Skylent OS</Link>
            </div>
          </div>
          <WorldScene world="institutions" />
        </div>
      </header>

      <section className="world-section" id="institution-types">
        <div className="world-rail world-split">
          <div>
            <p className="world-kicker">Select institution type</p>
            <div className="world-picker" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              {TYPES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`world-chip${activeId === item.id ? ' is-active' : ''}`}
                  aria-pressed={activeId === item.id}
                  onClick={() => setActiveId(item.id)}
                  style={{ textAlign: 'left' }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="world-panel" style={{ padding: 22 }}>
            <p className="world-status">{active.label}</p>
            <h2 className="world-title" style={{ fontSize: 28, maxWidth: '20ch', marginTop: 8 }}>{active.problem}</h2>
            <p className="world-lede">{active.value}</p>
            <ul className="world-flow">
              {active.offers.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="world-section" id="os">
        <div className="world-rail world-split">
          <div>
            <p className="world-kicker">Skylent OS</p>
            <h2 className="world-title" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }}>Delivery infrastructure, not a brochure.</h2>
            <p className="world-lede">
              Curriculum, assessment, LMS, and operations share the same platform learners already use. Partnership starts with what you actually need to run.
            </p>
            <div className="world-actions">
              <Link className="world-btn" to="/os">View Skylent OS</Link>
              <Link className="world-btn-ghost" to="/contact">Request a conversation</Link>
            </div>
          </div>
          <div className="world-panel" style={{ padding: 20 }}>
            <p className="world-kicker">What we do not publish here</p>
            <p className="world-note">No invented partner logos, placement rates, or student counts. If a school or university is not named in the product, it is not named here.</p>
          </div>
        </div>
      </section>
    </WorldFrame>
  )
}
