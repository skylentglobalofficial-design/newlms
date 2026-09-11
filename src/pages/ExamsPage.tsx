import { Link } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import WorldScene from '../components/world/WorldScenes'
import { OTHER_EXAMS_UNPUBLISHED, PUBLISHED_EXAMS, UNPUBLISHED_EXAMS, programsByType } from '../skylent-worlds'

const LOOP = ['Learn', 'Practice', 'Test', 'Review', 'Measure', 'Improve']

export default function ExamsPage() {
  const examPrograms = programsByType('EXAM_PREP')

  return (
    <WorldFrame world="exams">
      <header className="world-hero">
        <div className="world-rail world-split">
          <div>
            <p className="world-kicker">Exams</p>
            <h1 className="world-title">Prepare for the exam you are actually taking.</h1>
            <p className="world-lede">
              Select the paper, then work the loop: syllabus, practice, tests, review, and measurement. No invented ranks or result boards.
            </p>
            <ul className="world-flow" aria-label="Preparation loop">
              {LOOP.map((step) => <li key={step}>{step}</li>)}
            </ul>
            <div className="world-actions">
              <a className="world-btn" href="#jee">Open JEE</a>
              <a className="world-btn-ghost" href="#cat">Open CAT</a>
            </div>
          </div>
          <WorldScene world="exams" />
        </div>
      </header>

      {PUBLISHED_EXAMS.map((exam) => {
        const program = examPrograms.find((item) => item.slug === exam.slug)
        return (
          <section key={exam.id} className="world-section" id={exam.id}>
            <div className="world-rail world-split">
              <div>
                <p className="world-status">Published</p>
                <h2 className="world-title" style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', marginTop: 8 }}>{exam.name}</h2>
                <p className="world-lede">{exam.full}. {exam.target}.</p>
                <p className="world-meta" style={{ marginTop: 14 }}>{exam.subjects.join(' · ')}</p>
                {program ? (
                  <>
                    <p className="world-note" style={{ marginTop: 16 }}>{program.desc}</p>
                    <div className="world-actions">
                      <Link className="world-btn" to={`/programs/${program.slug}`}>Open {exam.name} programme</Link>
                    </div>
                  </>
                ) : (
                  <p className="world-empty">This exam is marked published in navigation, but the programme record is missing from the catalogue.</p>
                )}
              </div>
              <div className="world-panel" style={{ padding: 20 }}>
                <p className="world-kicker">What you work on</p>
                <ul className="world-card-list">
                  <li className="world-card"><b>Syllabus</b><p>Subject and section coverage for this paper.</p></li>
                  <li className="world-card"><b>Practice</b><p>Timed questions, then worked solutions.</p></li>
                  <li className="world-card"><b>Tests</b><p>Section tests and full mocks — scores appear after you attempt them.</p></li>
                </ul>
              </div>
            </div>
          </section>
        )
      })}

      {UNPUBLISHED_EXAMS.map((exam) => (
        <section key={exam.id} className="world-section" id={exam.id}>
          <div className="world-rail">
            <p className="world-status">Unpublished · coming soon</p>
            <h2 className="world-title" style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', marginTop: 8 }}>{exam.name}</h2>
            <p className="world-lede">{exam.full}. {exam.target}.</p>
            <p className="world-empty">
              NEET is not a published Skylent programme. Subjects ({exam.subjects.join(', ')}) are listed so the destination is honest — there is no syllabus product, mock series, or scoreboard here yet.
            </p>
          </div>
        </section>
      ))}

      <section className="world-section" id="other-exams">
        <div className="world-rail">
          <p className="world-kicker">Other papers</p>
          <div className="world-picker">
            {OTHER_EXAMS_UNPUBLISHED.map((name) => (
              <span key={name} className="world-chip is-soon">{name} · not published</span>
            ))}
          </div>
          <div className="world-actions">
            <Link className="world-btn-ghost" to="/programs?type=EXAM_PREP">Exam programmes in the catalogue</Link>
            <Link className="world-btn-ghost" to="/junior">Schooling is a different world</Link>
          </div>
        </div>
      </section>
    </WorldFrame>
  )
}
