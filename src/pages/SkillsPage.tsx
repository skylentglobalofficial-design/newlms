import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/shared'
import { programs, workshops } from '../data'
import SkillsCapabilityHero from '../components/skills/SkillsCapabilityHero'
import SkillsCapabilityDiscovery from '../components/skills/SkillsCapabilityDiscovery'
import SkillsPracticeExperience from '../components/skills/SkillsPracticeExperience'
import SkillsBuildPreview from '../components/skills/SkillsBuildPreview'
import SkillsEvidencePreview from '../components/skills/SkillsEvidencePreview'
import SkillsNextStepPreview from '../components/skills/SkillsNextStepPreview'
import '../styles/skills-surface.css'

const PROFESSIONAL = programs.filter(p => p.programType === 'PROFESSIONAL')
const CERTIFICATES = programs.filter(p => p.programType === 'CERTIFICATE')
const FEATURED = PROFESSIONAL.find(p => p.slug === 'data-analytics-pro')
  ?? PROFESSIONAL.find(p => p.slug === 'data-science-ai')
  ?? PROFESSIONAL[0]

const CAPABILITY_MAP = [
  { id: 'sql', label: 'SQL', copy: 'Ask the data the right question.' },
  { id: 'stats', label: 'Statistics', copy: 'Know what the numbers can claim.' },
  { id: 'analysis', label: 'Analysis', copy: 'Find the pattern that matters.' },
  { id: 'viz', label: 'Visualization', copy: 'Make the finding readable.' },
  { id: 'comms', label: 'Communication', copy: 'Recommend a next action.' },
]

const PATH_STEPS = [
  { id: 'learn', label: 'Learn', copy: 'Concept and context' },
  { id: 'practice', label: 'Practice', copy: 'Guided attempts' },
  { id: 'build', label: 'Build', copy: 'Project work' },
  { id: 'prove', label: 'Prove', copy: 'Reviewed output' },
  { id: 'move', label: 'Move', copy: 'CareerOS next step' },
]

export default function SkillsPage() {
  const [capability, setCapability] = useState('analysis')

  const featuredProjects = useMemo(
    () => (FEATURED?.projectsDetail ?? []).slice(0, 3),
    [],
  )

  return (
    <PageShell aurora={false}>
      <main className="skills-v2">
        <SkillsCapabilityHero />

        <SkillsCapabilityDiscovery />

        <SkillsPracticeExperience />

        <SkillsBuildPreview />

        <SkillsEvidencePreview />

        <SkillsNextStepPreview />

        {/* Residual later sections — not part of Skills Phase 2 Scrolls 1–6 */}
        <section className="skills-v2-section skills-v2-section--cream" aria-labelledby="skills-map-heading">
          <div className="skills-v2-inner">
            <header className="skills-v2-copy">
              <div className="home-section-label"><span />Capability map</div>
              <h2 id="skills-map-heading">
                Data Analytics becomes a chain of skills.
              </h2>
              <p>SQL → Statistics → Analysis → Visualization → Communication.</p>
            </header>
            <div className="skills-v2-map" role="list">
              {CAPABILITY_MAP.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="listitem"
                  className={capability === item.id ? 'is-active' : ''}
                  aria-pressed={capability === item.id}
                  onClick={() => setCapability(item.id)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item.label}</strong>
                  <em>{item.copy}</em>
                </button>
              ))}
            </div>
            <div className="skills-v2-map-panel">
              <span>Active focus</span>
              <h3>{CAPABILITY_MAP.find(i => i.id === capability)?.label}</h3>
              <p>{CAPABILITY_MAP.find(i => i.id === capability)?.copy}</p>
              <Link className="home-secondary-button" to="/programs">
                See related programmes
              </Link>
            </div>
          </div>
        </section>

        {/* SCROLL 5 — learning path / programmes */}
        <section className="skills-v2-section skills-v2-section--cream" aria-labelledby="skills-path-heading">
          <div className="skills-v2-inner">
            <header className="skills-v2-copy">
              <div className="home-section-label"><span />Learning path</div>
              <h2 id="skills-path-heading">From programme to practice to proof.</h2>
              <p>Real catalog programmes. Depth differs — webinar, certificate, professional.</p>
            </header>
            <ol className="skills-v2-path" aria-label="Skills path">
              {PATH_STEPS.map(step => (
                <li key={step.id}>
                  <strong>{step.label}</strong>
                  <span>{step.copy}</span>
                </li>
              ))}
            </ol>
            <div className="skills-v2-program-grid">
              {FEATURED && (
                <article className="skills-v2-program skills-v2-program--featured">
                  <span>Featured professional</span>
                  <h3>{FEATURED.name}</h3>
                  <p>{FEATURED.desc}</p>
                  <ul>
                    <li>{FEATURED.duration}</li>
                    <li>{FEATURED.format}</li>
                    <li>{FEATURED.enrollmentStatus === 'open' ? 'Enrollment open' : FEATURED.enrollmentStatus}</li>
                  </ul>
                  <Link className="home-primary-button" to={`/programs/${FEATURED.slug}`}>
                    View programme <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              )}
              <div className="skills-v2-program-list">
                {[...PROFESSIONAL.filter(p => p.slug !== FEATURED?.slug), ...CERTIFICATES].slice(0, 5).map(program => (
                  <Link key={program.slug} className="skills-v2-program-row" to={`/programs/${program.slug}`}>
                    <span>{program.programType === 'CERTIFICATE' ? 'Certificate' : 'Professional'}</span>
                    <strong>{program.name}</strong>
                    <em>{program.duration}</em>
                  </Link>
                ))}
                <Link className="skills-v2-program-all" to="/programs">Browse all programmes →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* SCROLL 6 — projects */}
        <section className="skills-v2-section" aria-labelledby="skills-projects-heading">
          <div className="skills-v2-inner">
            <header className="skills-v2-copy">
              <div className="home-section-label"><span />Projects</div>
              <h2 id="skills-projects-heading">Build work you can show.</h2>
              <p>
                Project briefs from the catalog programme
                {FEATURED ? ` “${FEATURED.name}”` : ''}. Representative of curriculum structure.
              </p>
            </header>
            <div className="skills-v2-projects">
              {featuredProjects.length > 0 ? featuredProjects.map(project => (
                <article key={project.title}>
                  <span>{project.difficulty}</span>
                  <h3>{project.title}</h3>
                  <p>{project.what}</p>
                  <ul>
                    {project.skills.slice(0, 4).map(skill => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </article>
              )) : (
                <p className="skills-v2-empty">Project detail is not available for this catalogue entry yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* SCROLL 7 — assessment */}
        <section className="skills-v2-section skills-v2-section--cream" aria-labelledby="skills-assess-heading">
          <div className="skills-v2-inner skills-v2-split">
            <header className="skills-v2-copy">
              <div className="home-section-label"><span />Assessment</div>
              <h2 id="skills-assess-heading">Review is part of the product.</h2>
              <p>
                Quizzes, assignments, and mentor review exist in the LMS after enrollment.
                This page does not invent completion rates.
              </p>
            </header>
            <div className="skills-v2-assess-panel">
              <div>
                <span>01</span>
                <strong>Practice attempts</strong>
                <em>Feedback on reasoning</em>
              </div>
              <div>
                <span>02</span>
                <strong>Assignment submit</strong>
                <em>Work in for review</em>
              </div>
              <div>
                <span>03</span>
                <strong>Reviewed state</strong>
                <em>Comments · revise · prove</em>
              </div>
            </div>
          </div>
        </section>

        {/* SCROLL 8 — evidence */}
        <section className="skills-v2-section" aria-labelledby="skills-evidence-heading">
          <div className="skills-v2-inner skills-v2-split">
            <header className="skills-v2-copy">
              <div className="home-section-label"><span />Evidence</div>
              <h2 id="skills-evidence-heading">Leave with artifacts, not applause.</h2>
              <p>
                Projects, assessments, and certificates can become CareerOS inputs.
                Unified evidence is still partial — shown honestly.
              </p>
            </header>
            <div className="skills-v2-evidence">
              <article>
                <span>Available today</span>
                <strong>LMS assignments & certificates</strong>
                <p>Issued through enrolled learning after real completion rules.</p>
              </article>
              <article>
                <span>Partial</span>
                <strong>CareerOS profile projects</strong>
                <p>Manual profile work exists; automatic LMS import is not claimed here.</p>
              </article>
              <article>
                <span>Future</span>
                <strong>Unified evidence layer</strong>
                <p>Not implemented as a single product object yet.</p>
              </article>
            </div>
          </div>
        </section>

        {/* SCROLL 9 — CareerOS bridge */}
        <section className="skills-v2-career" aria-labelledby="skills-career-heading">
          <div className="skills-v2-inner skills-v2-split">
            <header className="skills-v2-copy">
              <div className="home-section-label"><span />CareerOS</div>
              <h2 id="skills-career-heading">
                Capability continues into career action.
              </h2>
              <p>
                Profile, jobs, applications, interviews, and support — without fabricated placement numbers.
                Professional programmes may unlock CareerOS as described on their detail pages.
              </p>
              <div className="skills-v2-hero-actions">
                <Link className="home-light-button" to="/career-os">
                  Open CareerOS <span aria-hidden="true">↗</span>
                </Link>
                <Link className="home-secondary-button" to={FEATURED ? `/programs/${FEATURED.slug}` : '/programs'}>
                  Start with a programme
                </Link>
              </div>
            </header>
            <ol className="skills-v2-career-flow" aria-label="Skills to CareerOS">
              {['Skills', 'Projects', 'Evidence', 'Profile', 'Opportunities'].map((label, index) => (
                <li key={label}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{label}</strong>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* honest note on webinars */}
        <section className="skills-v2-webinars" aria-labelledby="skills-webinars-heading">
          <div className="skills-v2-inner">
            <header className="skills-v2-copy">
              <div className="home-section-label"><span />Webinars</div>
              <h2 id="skills-webinars-heading">Shorter sessions, separate product.</h2>
              <p>
                Workshop registration is not live checkout. Browse the catalogue for topics and detail pages.
              </p>
            </header>
            <div className="skills-v2-webinar-list">
              {workshops.slice(0, 4).map(workshop => (
                <Link key={workshop.slug} to={`/workshops/${workshop.slug}`} className="skills-v2-webinar-row">
                  <strong>{workshop.title}</strong>
                  <span>{workshop.duration ?? 'Session'}</span>
                </Link>
              ))}
            </div>
            <Link className="home-secondary-button" to="/workshops">All workshops</Link>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
