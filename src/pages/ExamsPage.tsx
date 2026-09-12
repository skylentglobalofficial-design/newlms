import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, StatusPill, ButtonLink, Note } from '../design/primitives'
import { getProgrammeAvailability } from '../lib/catalogue-status'
import { programs } from '../data'
import '../design/exams.css'

const EXAMS = [
  {
    slug: 'jee-advanced-prep',
    abbr: 'JEE Advanced',
    name: 'Engineering entrance',
    pattern: 'Two papers. Physics, Chemistry, Mathematics. Objective and numerical questions. Negative marking applies.',
    planned: [
      'Subject lessons organised to the published JEE Advanced syllabus',
      'Chapter practice and full-length papers in the exam format',
      'Review of attempts once a test engine exists',
    ],
  },
  {
    slug: 'cat-prep',
    abbr: 'CAT',
    name: 'Management entrance',
    pattern: 'Three timed sections: VARC, DILR and QA. MCQs and type-in answers. Negative marking on MCQs.',
    planned: [
      'Section lessons organised to the CAT pattern',
      'Set practice for DILR and timed QA',
      'Mock papers once a test engine exists',
    ],
  },
] as const

export default function ExamsPage() {
  return (
    <ProductShell className="sk-exams">
      <section className="sk-exam-hero">
        <Rail>
          <p className="sk-exam-kicker">Competitive exams</p>
          <h1>Prepare when the material exists.</h1>
          <p>
            Skylent has programmes for two exams only: JEE Advanced and CAT. Neither is open to study yet.
            There are no mock-test counts, ranks, batches or live classes to show.
          </p>
        </Rail>
      </section>

      <Rail>
        <Note tone="caution">
          Exam pattern notes below describe the public exam, not a Skylent product that is already running.
        </Note>

        <div className="sk-exam-list">
          {EXAMS.map(exam => {
            const program = programs.find(item => item.slug === exam.slug)
            const availability = program
              ? getProgrammeAvailability(program)
              : {
                  id: 'coming-soon' as const,
                  label: 'Coming soon',
                  tone: 'muted' as const,
                  ctaLabel: 'Register interest',
                  canStartLearning: false,
                  explanation: '',
                }

            return (
              <article key={exam.slug} className="sk-exam-item">
                <div>
                  <StatusPill availability={availability} />
                  <h2>{exam.abbr}</h2>
                  <p className="lead">{exam.name}</p>
                  <p className="sk-exam-meta">{exam.pattern}</p>
                  <div className="sk-exam-actions">
                    <ButtonLink to="/contact">{availability.ctaLabel}</ButtonLink>
                    {program && (
                      <ButtonLink to={`/programs/${program.slug}`} variant="secondary">
                        Programme outline
                      </ButtonLink>
                    )}
                  </div>
                </div>
                <div>
                  <p className="lead" style={{ marginTop: 0 }}>Planned shape — not built:</p>
                  <ol className="sk-exam-plan">
                    <li>Syllabus</li>
                    <li>Preparation</li>
                    <li>Practice</li>
                    <li>Tests</li>
                    <li>Review</li>
                    <li>Progress</li>
                  </ol>
                  <p className="lead">Planned inside Skylent:</p>
                  <ul className="sk-exam-plan">
                    {exam.planned.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </div>

        <p style={{ paddingBottom: 48, color: 'var(--sk-ink-muted)', fontSize: 14 }}>
          No other entrance exam is on Skylent. Schooling is on{' '}
          <Link to="/junior">Junior</Link>. Degrees are on{' '}
          <Link to="/degrees">Education — degrees</Link>.
        </p>
      </Rail>
    </ProductShell>
  )
}
