import { Link } from 'react-router-dom'
import { PageShell } from '../components/shared'
import { programs } from '../data'
import '../styles/exams-surface.css'

const EXAM_PROGRAMS = programs.filter(p => p.programType === 'EXAM_PREP')
const FEATURED = EXAM_PROGRAMS.find(p => p.slug === 'jee-advanced-prep') ?? EXAM_PROGRAMS[0]

const LOOP = [
  { id: 'diagnose', label: 'Diagnose', copy: 'Find the weak spot before you drill.' },
  { id: 'practice', label: 'Practice', copy: 'Attempt under the real constraints.' },
  { id: 'improve', label: 'Improve', copy: 'Review misses. Close the gap.' },
  { id: 'perform', label: 'Perform', copy: 'Mocks that feel like the exam day.' },
]

export default function ExamsPage() {
  return (
    <PageShell aurora={false}>
      <main className="exams-v1">
        <section className="exams-v1-hero" aria-labelledby="exams-v1-hero-heading">
          <div className="exams-v1-hero-inner">
            <div className="exams-v1-hero-copy">
              <div className="home-section-label"><span />Exams</div>
              <h1 id="exams-v1-hero-heading">
                How ready<br />
                are <em>you?</em>
              </h1>
              <p>
                Exam prep is a performance loop — diagnose, practice, improve, perform.
                No fabricated diagnostic scores on this page.
              </p>
              <div className="exams-v1-hero-actions">
                <Link
                  className="home-primary-button"
                  to={FEATURED ? `/programs/${FEATURED.slug}` : '/programs?type=EXAM_PREP'}
                >
                  Open a prep programme <span aria-hidden="true">↗</span>
                </Link>
                <a className="home-secondary-button" href="#exams-loop">
                  See the loop
                </a>
              </div>
            </div>
            <aside className="exams-v1-hero-artifact" aria-label="Representative practice item">
              <div className="exams-v1-artifact-rail">
                <span>Practice item</span>
                <span>Representative</span>
                <span>Not scored</span>
              </div>
              <div className="exams-v1-artifact-body">
                <span>Prompt</span>
                <h2>Which constraint fails first under timed load?</h2>
                <ol>
                  <li>Concept clarity</li>
                  <li>Speed under pressure</li>
                  <li>Review after each miss</li>
                </ol>
                <p>Illustrative only — your readiness starts when you attempt real practice.</p>
              </div>
            </aside>
          </div>
        </section>

        <section id="exams-loop" className="exams-v1-section" aria-labelledby="exams-loop-heading">
          <div className="exams-v1-inner">
            <header className="exams-v1-copy">
              <div className="home-section-label"><span />Core loop</div>
              <h2 id="exams-loop-heading">Diagnose → Practice → Improve → Perform.</h2>
              <p>One rhythm for competitive prep. Depth comes from the programme you choose.</p>
            </header>
            <ol className="exams-v1-loop" aria-label="Exam prep loop">
              {LOOP.map((step, index) => (
                <li key={step.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step.label}</strong>
                  <em>{step.copy}</em>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="exams-v1-section exams-v1-section--cool" aria-labelledby="exams-programs-heading">
          <div className="exams-v1-inner">
            <header className="exams-v1-copy">
              <div className="home-section-label"><span />Catalog</div>
              <h2 id="exams-programs-heading">Exam prep programmes in the live catalog.</h2>
              <p>
                Filtered from real <code>EXAM_PREP</code> entries — not a marketing wall of fake ranks.
              </p>
            </header>

            {EXAM_PROGRAMS.length === 0 ? (
              <p className="exams-v1-empty">
                No exam prep programmes are published in the catalog yet.{' '}
                <Link to="/programs?type=EXAM_PREP">Browse exam prep programmes →</Link>
              </p>
            ) : (
              <div className="exams-v1-program-grid">
                {FEATURED && (
                  <article className="exams-v1-program exams-v1-program--featured">
                    <span>Featured prep</span>
                    <h3>{FEATURED.name}</h3>
                    <p>{FEATURED.desc}</p>
                    <ul>
                      <li>{FEATURED.duration}</li>
                      <li>{FEATURED.format}</li>
                      {FEATURED.examSections?.slice(0, 3).map(section => (
                        <li key={section}>{section}</li>
                      ))}
                      <li>
                        {FEATURED.enrollmentStatus === 'open'
                          ? 'Enrollment open'
                          : FEATURED.enrollmentStatus === 'waitlist'
                            ? 'Waitlist'
                            : 'Coming soon'}
                      </li>
                    </ul>
                    <Link className="home-primary-button" to={`/programs/${FEATURED.slug}`}>
                      View programme <span aria-hidden="true">↗</span>
                    </Link>
                  </article>
                )}
                <div className="exams-v1-program-list">
                  {EXAM_PROGRAMS.filter(p => p.slug !== FEATURED?.slug).map(program => (
                    <Link key={program.slug} className="exams-v1-program-row" to={`/programs/${program.slug}`}>
                      <span>Exam prep</span>
                      <strong>{program.name}</strong>
                      <em>{program.duration}</em>
                    </Link>
                  ))}
                  <Link className="exams-v1-program-all" to="/programs?type=EXAM_PREP">
                    Browse exam prep programmes →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="exams-v1-section" aria-labelledby="exams-honesty-heading">
          <div className="exams-v1-inner exams-v1-split">
            <header className="exams-v1-copy">
              <div className="home-section-label"><span />Honest prep</div>
              <h2 id="exams-honesty-heading">Readiness is earned in practice — not claimed here.</h2>
              <p>
                This page does not invent percentiles, ranks, or diagnostic scores.
                Those appear when you work inside a programme.
              </p>
            </header>
            <div className="exams-v1-honesty">
              <div>
                <span>What you get</span>
                <strong>Structured subjects, mocks, and review rhythm</strong>
                <em>From the catalog programme you enrol in.</em>
              </div>
              <div>
                <span>What you will not see here</span>
                <strong>Fabricated “you scored 82%” widgets</strong>
                <em>No demo ranks. No fake readiness meters.</em>
              </div>
            </div>
          </div>
        </section>

        <section className="exams-v1-cta" aria-labelledby="exams-cta-heading">
          <div className="exams-v1-inner">
            <div className="home-section-label"><span />Next</div>
            <h2 id="exams-cta-heading">Pick a programme. Start the loop.</h2>
            <p>Stay in Exams — open a listed prep programme or browse the exam catalogue.</p>
            <div className="exams-v1-hero-actions">
              <Link
                className="home-light-button"
                to={FEATURED ? `/programs/${FEATURED.slug}` : '/programs?type=EXAM_PREP'}
              >
                Open prep programme <span aria-hidden="true">↗</span>
              </Link>
              <Link className="home-secondary-button exams-v1-cta-secondary" to="/programs?type=EXAM_PREP">
                Exam prep catalogue
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
