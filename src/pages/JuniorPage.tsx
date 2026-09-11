import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import WorldScene from '../components/world/WorldScenes'
import { programsForWorld, schoolBandForGrade } from '../skylent-worlds'

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export default function JuniorPage() {
  const [grade, setGrade] = useState(8)
  const band = useMemo(() => schoolBandForGrade(grade), [grade])
  const published = programsForWorld('schooling')

  return (
    <WorldFrame world="schooling">
      <header className="world-hero">
        <div className="world-rail world-split">
          <div>
            <p className="world-kicker">Schooling</p>
            <h1 className="world-title">Choose your class, then find what you need to <em>learn</em>.</h1>
            <p className="world-lede">
              For Class 1–12. Grade first, then subjects, concepts, experiments, and activities — not a professional skills marketplace.
            </p>
            <div className="world-actions">
              <a className="world-btn" href="#grades">Choose class</a>
              <Link className="world-btn-ghost" to="/labs">Open experiments</Link>
            </div>
          </div>
          <WorldScene world="schooling" />
        </div>
      </header>

      <section className="world-section" id="grades">
        <div className="world-rail">
          <p className="world-kicker">Grade</p>
          <h2 className="world-title" style={{ fontSize: 'clamp(26px, 3vw, 36px)', maxWidth: '20ch' }}>Class {grade}</h2>
          <p className="world-lede">{band.focus}</p>
          <div className="world-picker" style={{ marginTop: 20 }} role="listbox" aria-label="Select class">
            {GRADES.map((n) => (
              <button
                key={n}
                type="button"
                className={`world-chip${grade === n ? ' is-active' : ''}`}
                aria-pressed={grade === n}
                onClick={() => setGrade(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="world-section" id="subjects">
        <div className="world-rail world-split">
          <div>
            <p className="world-kicker">{band.stage}</p>
            <h2 className="world-title" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }}>{band.label}</h2>
            <ul className="world-card-list" style={{ marginTop: 20 }}>
              {band.subjects.map((subject) => (
                <li key={subject} className="world-card">
                  <b>{subject}</b>
                  <p>Concepts, practice, and activities for Class {grade}.</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="world-panel" style={{ padding: 20 }}>
            <p className="world-kicker">How a school day works here</p>
            <ul className="world-flow">
              <li>Grade</li>
              <li>Subject</li>
              <li>Concept</li>
              <li>Experiment</li>
              <li>Activity</li>
              <li>Progress</li>
            </ul>
            <p className="world-note" style={{ marginTop: 18 }}>
              Schooling is foundational learning. It is not a job-prep funnel and it is not a cartoon classroom.
            </p>
          </div>
        </div>
      </section>

      <section className="world-section" id="programmes">
        <div className="world-rail">
          <p className="world-kicker">Catalogue</p>
          <h2 className="world-title" style={{ fontSize: 'clamp(26px, 3vw, 36px)', maxWidth: '18ch' }}>Published class programmes</h2>
          {published.length ? (
            <div className="world-card-list" style={{ marginTop: 20 }}>
              {published.map((program) => (
                <Link key={program.slug} className="world-card" to={`/programs/${program.slug}`}>
                  <b>{program.name}</b>
                  <p>{program.desc}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="world-empty">
              Class 1–12 programmes are not in the published catalogue yet. You can still choose a class, see the subject map, and use experiments in Labs. Nothing here is invented as a live course.
            </p>
          )}
          <div className="world-actions">
            <Link className="world-btn-ghost" to="/programs?type=SCHOOLING">Open catalogue filter</Link>
            <Link className="world-btn-ghost" to="/exams">Exam prep is a different world</Link>
          </div>
        </div>
      </section>
    </WorldFrame>
  )
}
