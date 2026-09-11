import { Link } from 'react-router-dom'
import { PageShell } from '../components/shared'
import '../styles/exams-surface.css'

const CAREER_DOORS = [
  {
    id: 'career-os',
    label: 'CareerOS',
    copy: 'Profile, applications, and career workspace.',
    to: '/career-os',
    note: 'Requires sign-in',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    copy: 'Browse and track roles from the signed-in job board.',
    to: '/career-os/jobs',
    note: 'Requires sign-in',
  },
  {
    id: 'interviews',
    label: 'Interview Preparation',
    copy: 'Practice rounds and interview workflows.',
    to: '/career-os/interviews',
    note: 'Requires sign-in',
  },
] as const

/** Public Career destination — routes into authenticated CareerOS tools without pretending they are public. */
export default function CareerDestinationPage() {
  return (
    <PageShell aurora={false}>
      <main className="exams-v1">
        <section className="exams-v1-hero" aria-labelledby="career-destination-heading">
          <div className="exams-v1-hero-inner">
            <div className="exams-v1-hero-copy">
              <div className="home-section-label"><span />Career</div>
              <h1 id="career-destination-heading">
                From learning<br />
                to <em>opportunity.</em>
              </h1>
              <p>
                Career tools live in CareerOS. This page is the public door —
                sign in to open the workspace, jobs, and interview prep.
              </p>
              <div className="exams-v1-hero-actions">
                <Link className="home-primary-button" to="/career-os">
                  Open CareerOS <span aria-hidden="true">↗</span>
                </Link>
                <Link className="home-secondary-button" to="/login">
                  Sign in
                </Link>
              </div>
            </div>
            <aside className="exams-v1-hero-artifact" aria-label="Career access note">
              <div className="exams-v1-artifact-rail">
                <span>Public directory</span>
                <span>Auth for tools</span>
              </div>
              <div className="exams-v1-artifact-body">
                <span>Honest access</span>
                <h2>CareerOS is signed-in product space.</h2>
                <p>
                  Jobs and interviews are not publicly browsable catalogues.
                  Use the links below — you will be asked to sign in when needed.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="exams-v1-section" aria-labelledby="career-doors-heading">
          <div className="exams-v1-inner">
            <header className="exams-v1-copy">
              <div className="home-section-label"><span />Where to go</div>
              <h2 id="career-doors-heading">CareerOS · Jobs · Interview Preparation.</h2>
              <p>Three authenticated products. One public Career destination.</p>
            </header>
            <div className="exams-v1-program-grid">
              {CAREER_DOORS.map((door) => (
                <article key={door.id} className="exams-v1-program">
                  <span>{door.note}</span>
                  <h3>{door.label}</h3>
                  <p>{door.copy}</p>
                  <Link className="home-primary-button" to={door.to}>
                    Continue <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
