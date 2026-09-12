import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, StatusPill, ButtonLink, Note } from '../design/primitives'
import { getProgrammeAvailability } from '../lib/catalogue-status'
import { programs } from '../data'
import '../design/exams.css'

const PREP_PATH = ['Exam', 'Syllabus', 'Preparation', 'Practice', 'Mocks', 'Review'] as const

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
          <h1>Exam preparation — when the material exists.</h1>
          <p>
            Skylent has programmes for two exams only: JEE Advanced and CAT. Neither is open to study yet.
            There are no mock-test counts, ranks, batches or live classes to show.
          </p>
        </Rail>
      </section>

      <Rail>
        <Note tone="caution">
          The path below is the intended product shape. It is not built. Registering interest starts a conversation —
          it does not start a course.
        </Note>

        <ol className="sk-exam-track" aria-label="Planned exam-preparation path — not built">
          {PREP_PATH.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
              <em>Not built</em>
            </li>
          ))}
        </ol>

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
                    <ButtonLink to="/contact" variant="secondary">{availability.ctaLabel}</ButtonLink>
                    {program && (
                      <ButtonLink to={`/programs/${program.slug}`} variant="quiet">
                        Programme outline
                      </ButtonLink>
                    )}
                  </div>
                </div>
                <div>
                  <p className="lead" style={{ marginTop: 0 }}>Planned inside Skylent — not live:</p>
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

        <p className="sk-exam-foot">
          No other entrance exam is on Skylent. Schooling is on{' '}
          <Link to="/junior">Junior</Link>. Degrees are on{' '}
          <Link to="/degrees">Education — degrees</Link>.
        </p>
      </Rail>
    </ProductShell>
  )
}
