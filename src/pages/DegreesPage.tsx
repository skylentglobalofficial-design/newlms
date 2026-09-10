import { Link } from 'react-router-dom'
import { PageShell } from '../components/shared'
import { programs } from '../data'
import '../styles/degrees-surface.css'

const UNDERGRAD = programs.filter(p => p.programType === 'UNDERGRADUATE')
const POSTGRAD = programs.filter(p => p.programType === 'POSTGRADUATE')
const FEATURED_UG = UNDERGRAD[0]
const FEATURED_PG = POSTGRAD[0]

const UG_LOOP = [
  { id: 'learn', label: 'Learn', copy: 'Coursework with clear semester rhythm.' },
  { id: 'apply', label: 'Apply', copy: 'Use concepts in assigned work.' },
  { id: 'build', label: 'Build', copy: 'Projects that belong in a portfolio.' },
  { id: 'demonstrate', label: 'Demonstrate', copy: 'Show evidence of what you can do.' },
]

const PG_LOOP = [
  { id: 'research', label: 'Research', copy: 'Frame the question with rigor.' },
  { id: 'apply', label: 'Apply', copy: 'Methods that survive scrutiny.' },
  { id: 'create', label: 'Create', copy: 'Cases, papers, and advanced projects.' },
  { id: 'defend', label: 'Defend', copy: 'Present and stand behind the work.' },
]

function ProgramBlock({
  programsList,
  featured,
  emptyLabel,
  educationAnchor,
  typeLabel,
}: {
  programsList: typeof UNDERGRAD
  featured: (typeof UNDERGRAD)[0] | undefined
  emptyLabel: string
  educationAnchor: string
  typeLabel: string
}) {
  if (programsList.length === 0) {
    return (
      <div className="degrees-v1-empty-panel">
        <p className="degrees-v1-empty">
          {emptyLabel}{' '}
          <Link to={educationAnchor}>See the education overview →</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="degrees-v1-program-grid">
      {featured && (
        <article className="degrees-v1-program">
          <span>{typeLabel}</span>
          <h3>{featured.name}</h3>
          <p>{featured.desc}</p>
          <ul>
            <li>{featured.duration}</li>
            <li>{featured.format}</li>
            <li>{featured.level}</li>
          </ul>
          <Link className="home-primary-button" to={`/programs/${featured.slug}`}>
            View programme <span aria-hidden="true">↗</span>
          </Link>
        </article>
      )}
      <div className="degrees-v1-program-list">
        {programsList.filter(p => p.slug !== featured?.slug).map(program => (
          <Link key={program.slug} className="degrees-v1-program-row" to={`/programs/${program.slug}`}>
            <span>{typeLabel}</span>
            <strong>{program.name}</strong>
            <em>{program.duration}</em>
          </Link>
        ))}
        <Link className="degrees-v1-program-all" to={educationAnchor}>
          Education overview →
        </Link>
      </div>
    </div>
  )
}

export default function DegreesPage() {
  return (
    <PageShell aurora={false}>
      <main className="degrees-v1">
        <section className="degrees-v1-hero" aria-labelledby="degrees-v1-hero-heading">
          <div className="degrees-v1-hero-inner">
            <div className="degrees-v1-hero-copy">
              <div className="home-section-label"><span />University</div>
              <h1 id="degrees-v1-hero-heading">
                Undergraduate<br />
                and <em>postgraduate.</em>
              </h1>
              <p>
                Degree-aligned learning with projects you can defend — not invented accreditation badges
                or ranking claims.
              </p>
              <div className="degrees-v1-hero-actions">
                <a className="home-primary-button" href="#degrees-undergrad">
                  Undergraduate path
                </a>
                <a className="home-secondary-button" href="#degrees-postgrad">
                  Postgraduate path
                </a>
              </div>
            </div>
            <aside className="degrees-v1-hero-artifact" aria-label="Representative project brief">
              <div className="degrees-v1-artifact-rail">
                <span>Project brief</span>
                <span>Week 6 · Methods</span>
                <span>Representative</span>
              </div>
              <div className="degrees-v1-artifact-body">
                <span>Studio</span>
                <h2>Apply · document · defend</h2>
                <p>Coursework becomes evidence when the work can stand on its own.</p>
              </div>
            </aside>
          </div>
        </section>

        <section id="degrees-undergrad" className="degrees-v1-section" aria-labelledby="degrees-ug-heading">
          <div className="degrees-v1-inner">
            <header className="degrees-v1-copy">
              <div className="home-section-label"><span />Undergraduate</div>
              <h2 id="degrees-ug-heading">Learn → Apply → Build → Demonstrate.</h2>
              <p>Semester-aware programmes that sit beside the degree — skills, projects, and proof.</p>
            </header>
            <ol className="degrees-v1-loop" aria-label="Undergraduate loop">
              {UG_LOOP.map((step, index) => (
                <li key={step.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step.label}</strong>
                  <em>{step.copy}</em>
                </li>
              ))}
            </ol>
            <ProgramBlock
              programsList={UNDERGRAD}
              featured={FEATURED_UG}
              emptyLabel="No undergraduate programmes are published in the catalog yet."
              educationAnchor="/education#undergraduate"
              typeLabel="Undergraduate"
            />
            <div className="degrees-v1-inline-links">
              <Link to="/education#undergraduate">Education · undergraduate →</Link>
              <Link to="/skills">Explore Skills →</Link>
            </div>
          </div>
        </section>

        <section id="degrees-postgrad" className="degrees-v1-section degrees-v1-section--ink" aria-labelledby="degrees-pg-heading">
          <div className="degrees-v1-inner">
            <header className="degrees-v1-copy">
              <div className="home-section-label"><span />Postgraduate</div>
              <h2 id="degrees-pg-heading">Research → Apply → Create → Defend.</h2>
              <p>Specialisation with case depth — for advanced learners and research-minded tracks.</p>
            </header>
            <ol className="degrees-v1-loop degrees-v1-loop--light" aria-label="Postgraduate loop">
              {PG_LOOP.map((step, index) => (
                <li key={step.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step.label}</strong>
                  <em>{step.copy}</em>
                </li>
              ))}
            </ol>
            <ProgramBlock
              programsList={POSTGRAD}
              featured={FEATURED_PG}
              emptyLabel="No postgraduate programmes are published in the catalog yet."
              educationAnchor="/education#postgraduate"
              typeLabel="Postgraduate"
            />
            <div className="degrees-v1-inline-links degrees-v1-inline-links--light">
              <Link to="/education#postgraduate">Education · postgraduate →</Link>
              <Link to="/institutions">For universities →</Link>
            </div>
          </div>
        </section>

        <section className="degrees-v1-section" aria-labelledby="degrees-honesty-heading">
          <div className="degrees-v1-inner degrees-v1-split">
            <header className="degrees-v1-copy">
              <div className="home-section-label"><span />Honest framing</div>
              <h2 id="degrees-honesty-heading">No fabricated accreditation.</h2>
              <p>
                This page does not invent university seals, ranking strips, or placement percentages.
                Catalog programmes speak for themselves when published.
              </p>
            </header>
            <div className="degrees-v1-honesty">
              <div>
                <span>What we show</span>
                <strong>Real UNDERGRADUATE and POSTGRADUATE catalog entries</strong>
                <em>Plus education deep links for structure and journey.</em>
              </div>
              <div>
                <span>What we do not invent</span>
                <strong>Accreditation badges or outcome stats</strong>
                <em>Those belong only where they are verified.</em>
              </div>
            </div>
          </div>
        </section>

        <section className="degrees-v1-cta" aria-labelledby="degrees-cta-heading">
          <div className="degrees-v1-inner">
            <div className="home-section-label"><span />Next</div>
            <h2 id="degrees-cta-heading">Choose the path that matches your stage.</h2>
            <p>Undergraduate and postgraduate remain distinct — same platform, different depth.</p>
            <div className="degrees-v1-hero-actions">
              <Link className="home-light-button" to="/education#undergraduate">
                Undergraduate overview <span aria-hidden="true">↗</span>
              </Link>
              <Link className="home-secondary-button degrees-v1-cta-secondary" to="/education#postgraduate">
                Postgraduate overview
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
