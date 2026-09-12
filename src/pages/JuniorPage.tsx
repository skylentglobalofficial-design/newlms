import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, ButtonLink, Note } from '../design/primitives'
import { resolveAcademicStages } from '../lib/academic-streams'
import '../design/junior.css'

const JOURNEY = [
  'Grade band',
  'Subject',
  'Chapter',
  'Lesson',
  'Practice',
  'Assessment',
] as const

export default function JuniorPage() {
  const schooling = resolveAcademicStages().find(stage => stage.id === 'schooling')

  return (
    <ProductShell className="sk-junior">
      <section className="sk-junior-hero">
        <Rail>
          <p className="sk-junior-kicker">Schooling</p>
          <h1>An academic path for school years.</h1>
          <p>
            Junior is organised as a journey: grade band, then subject, then chapter, then a lesson and practice.
            It is not an adult skills catalogue, and no grade-band lessons are in the platform today.
          </p>
        </Rail>
      </section>

      <Rail>
        <Note>
          No classes, teachers, tests or chapters have been published. The path below is how schooling will be
          organised — not a hidden library.
        </Note>

        <ol className="sk-junior-path" aria-label="Schooling journey — not published">
          {JOURNEY.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
              <em>Not published</em>
            </li>
          ))}
        </ol>

        <h2 className="sk-junior-bands-title">Grade bands</h2>
        <ul className="sk-junior-bands">
          {(schooling?.streams ?? []).map(stream => (
            <li key={stream.id}>
              <strong>{stream.abbr}</strong>
              <span>{stream.name}</span>
              <p>{stream.audience}</p>
            </li>
          ))}
        </ul>

        <div className="sk-junior-actions">
          <ButtonLink to="/contact" variant="secondary" themeId="schooling">Register interest</ButtonLink>
          <ButtonLink to="/education" variant="secondary" themeId="schooling">All academic stages</ButtonLink>
          <ButtonLink to="/exams" variant="quiet" themeId="schooling">Entrance exams</ButtonLink>
        </div>

        <p className="sk-junior-foot">
          Live classes are not part of Junior today.{' '}
          <Link to="/education">Education</Link> explains the rest of the academic map.
        </p>
      </Rail>
    </ProductShell>
  )
}
