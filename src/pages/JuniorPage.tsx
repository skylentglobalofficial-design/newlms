import { Link } from 'react-router-dom'
import { PageShell } from '../components/shared'
import { programs } from '../data'
import '../styles/junior-surface.css'

const SCHOOLING = programs.filter(p => p.programType === 'SCHOOLING')
const FEATURED = SCHOOLING[0]

const LOOP = [
  { id: 'curiosity', label: 'Curiosity', copy: 'Start with a question worth chasing.' },
  { id: 'explore', label: 'Explore', copy: 'Look closer. Change one variable.' },
  { id: 'understand', label: 'Understand', copy: 'Name what actually happened.' },
  { id: 'practice', label: 'Practice', copy: 'Try again with a clear idea.' },
  { id: 'create', label: 'Create', copy: 'Make something that shows it.' },
]

const GRADE_BANDS = [
  { id: 'primary', label: 'Primary', grades: '1–5', focus: 'Foundations in maths, science, language, and socials.' },
  { id: 'middle', label: 'Middle', grades: '6–8', focus: 'Deeper subjects — still curiosity-led, not exam-drilled.' },
  { id: 'secondary', label: 'Secondary', grades: '9–10', focus: 'Board-aware practice with room to explore.' },
  { id: 'senior', label: 'Senior', grades: '11–12', focus: 'Stream subjects, electives, and clearer pathways.' },
]

export default function JuniorPage() {
  return (
    <PageShell aurora={false}>
      <main className="junior-v1">
        <section className="junior-v1-hero" aria-labelledby="junior-v1-hero-heading">
          <div className="junior-v1-hero-inner">
            <div className="junior-v1-hero-copy">
              <div className="home-section-label"><span />Schooling</div>
              <h1 id="junior-v1-hero-heading">
                Class 1–12.<br />
                Built for <em>curiosity.</em>
              </h1>
              <p>
                Schooling on Skylent is age-aware and concept-first — friendly without cartoons,
                structured without exam-prep pressure.
              </p>
              <div className="junior-v1-hero-actions">
                <Link className="home-primary-button" to="/education#schooling">
                  Education · schooling <span aria-hidden="true">↗</span>
                </Link>
                <a className="home-secondary-button" href="#junior-loop">
                  See how learning moves
                </a>
              </div>
            </div>
            <aside className="junior-v1-hero-artifact" aria-label="Representative concept prompt">
              <div className="junior-v1-artifact-rail">
                <span>Concept</span>
                <span>Class 6–8</span>
                <span>Representative</span>
              </div>
              <div className="junior-v1-artifact-body">
                <span>Wonder</span>
                <h2>Why does the path bend when light meets water?</h2>
                <p>Observe → change one thing → explain what you saw.</p>
              </div>
            </aside>
          </div>
        </section>

        <section id="junior-loop" className="junior-v1-section" aria-labelledby="junior-loop-heading">
          <div className="junior-v1-inner">
            <header className="junior-v1-copy">
              <div className="home-section-label"><span />Core loop</div>
              <h2 id="junior-loop-heading">Curiosity → Explore → Understand → Practice → Create.</h2>
              <p>A school rhythm that protects wonder while still checking understanding.</p>
            </header>
            <ol className="junior-v1-loop" aria-label="Schooling learning loop">
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

        <section className="junior-v1-section junior-v1-section--soft" aria-labelledby="junior-bands-heading">
          <div className="junior-v1-inner">
            <header className="junior-v1-copy">
              <div className="home-section-label"><span />Grade bands</div>
              <h2 id="junior-bands-heading">One platform. Four ages of mind.</h2>
              <p>Primary through senior secondary — same care, different depth.</p>
            </header>
            <div className="junior-v1-bands">
              {GRADE_BANDS.map(band => (
                <article key={band.id}>
                  <span>{band.grades}</span>
                  <strong>{band.label}</strong>
                  <p>{band.focus}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="junior-v1-section" aria-labelledby="junior-programs-heading">
          <div className="junior-v1-inner">
            <header className="junior-v1-copy">
              <div className="home-section-label"><span />Catalog</div>
              <h2 id="junior-programs-heading">Schooling programmes from the live catalog.</h2>
              <p>
                Filtered where <code>programType === &apos;SCHOOLING&apos;</code>.
                Listings appear here as they are published.
              </p>
            </header>

            {SCHOOLING.length === 0 ? (
              <div className="junior-v1-empty-panel">
                <p className="junior-v1-empty">
                  No schooling programmes are published in the catalog yet.
                  The education overview still covers grade bands, lesson rhythm, and how progress is shown to parents.
                </p>
                <div className="junior-v1-hero-actions">
                  <Link className="home-primary-button" to="/education#schooling">
                    Open schooling overview <span aria-hidden="true">↗</span>
                  </Link>
                  <Link className="home-secondary-button" to="/programs">
                    Browse programmes
                  </Link>
                </div>
              </div>
            ) : (
              <div className="junior-v1-program-grid">
                {FEATURED && (
                  <article className="junior-v1-program">
                    <span>Featured schooling</span>
                    <h3>{FEATURED.name}</h3>
                    <p>{FEATURED.desc}</p>
                    <ul>
                      <li>{FEATURED.duration}</li>
                      <li>{FEATURED.format}</li>
                      <li>{FEATURED.level}</li>
                    </ul>
                    <Link className="home-primary-button" to={`/programs/${FEATURED.slug}`}>
                      View programme <span aria-hidden="true">↗</span>
                    </Link>
                  </article>
                )}
                <div className="junior-v1-program-list">
                  {SCHOOLING.filter(p => p.slug !== FEATURED?.slug).map(program => (
                    <Link key={program.slug} className="junior-v1-program-row" to={`/programs/${program.slug}`}>
                      <span>Schooling</span>
                      <strong>{program.name}</strong>
                      <em>{program.duration}</em>
                    </Link>
                  ))}
                  <Link className="junior-v1-program-all" to="/education#schooling">
                    Education · schooling →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="junior-v1-cta" aria-labelledby="junior-cta-heading">
          <div className="junior-v1-inner">
            <div className="home-section-label"><span />Parents & schools</div>
            <h2 id="junior-cta-heading">Progress that parents can see. Structure schools can trust.</h2>
            <p>Start from the schooling overview, or talk to institutions about classroom workflows.</p>
            <div className="junior-v1-hero-actions">
              <Link className="home-light-button" to="/education#schooling">
                Schooling overview <span aria-hidden="true">↗</span>
              </Link>
              <Link className="home-secondary-button junior-v1-cta-secondary" to="/institutions">
                For schools
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
