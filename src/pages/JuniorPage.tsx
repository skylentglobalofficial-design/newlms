import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, ButtonLink, Note } from '../design/primitives'
import { resolveAcademicStages } from '../lib/academic-streams'
import '../design/junior.css'

export default function JuniorPage() {
  const schooling = resolveAcademicStages().find(stage => stage.id === 'schooling')

  return (
    <ProductShell className="sk-junior">
      <section className="sk-junior-hero">
        <Rail>
          <p className="sk-junior-kicker">Schooling</p>
          <h1>Learn a concept. Then try it.</h1>
          <p>
            Junior is Skylent’s school path: class, then subject, then concept, then a short lesson and a little
            practice. It is not an adult skills catalogue.
          </p>
        </Rail>
      </section>

      <Rail>
        <Note>
          No grade-band lessons have been published yet. The stages below are how the path will be organised —
          not a hidden library of chapters.
        </Note>

        <div className="sk-junior-stages">
          {(schooling?.streams ?? []).map(stream => (
            <article key={stream.id} className="sk-junior-stage">
              <strong>{stream.abbr}</strong>
              <span>{stream.name}</span>
              <p>{stream.audience}</p>
              <p className="sk-junior-empty">No subjects published yet.</p>
            </article>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingBottom: 72 }}>
          <ButtonLink to="/contact" themeId="schooling">Register interest</ButtonLink>
          <ButtonLink to="/education" variant="secondary" themeId="schooling">All academic stages</ButtonLink>
          <ButtonLink to="/exams" variant="quiet" themeId="schooling">Entrance exams</ButtonLink>
        </div>

        <p style={{ paddingBottom: 48, fontSize: 14, color: 'var(--sk-ink-muted)' }}>
          Live classes are not part of Junior today.{' '}
          <Link to="/education">Education</Link> explains the rest of the academic map.
        </p>
      </Rail>
    </ProductShell>
  )
}
