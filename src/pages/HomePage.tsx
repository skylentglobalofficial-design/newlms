import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/shared'

const domains = [
  { label: 'NEET / MBBS', copy: 'Anatomy, clinical reasoning and exam practice.', accent: '#168C83', scene: 'biology', to: '/education#competitive-exams' },
  { label: 'JEE / Engineering', copy: 'Physics, systems and building with purpose.', accent: '#3478D4', scene: 'engineering', to: '/education#competitive-exams' },
  { label: 'Analytics', copy: 'Investigate data and make better decisions.', accent: '#6D58D9', scene: 'analytics', to: '/programs/data-analytics-pro' },
  { label: 'IIM / Business', copy: 'Cases, markets, operations and leadership.', accent: '#B87918', scene: 'business', to: '/programs/product-management' },
  { label: 'Coding & Tech', copy: 'Build software, workflows and useful products.', accent: '#2E73C8', scene: 'coding', to: '/programs/full-stack' },
  { label: 'Design & Creative', copy: 'Research, prototype and shape better experiences.', accent: '#B45A86', scene: 'design', to: '/skills' },
  { label: 'Humanities & Social', copy: 'Understand people, culture and the world around them.', accent: '#4E765B', scene: 'humanities', to: '/education' },
]

const intents = [
  { label: 'Understand something', copy: 'Build a clear foundation.', icon: '01' },
  { label: 'Build a skill', copy: 'Practice until you can use it.', icon: '02' },
  { label: 'Prepare for an exam', copy: 'Diagnose, practice, improve.', icon: '03' },
  { label: 'Build a project', copy: 'Turn learning into evidence.', icon: '04' },
]

const journey = ['Schooling', 'Undergraduate', 'Postgraduate', 'Exams', 'Skills', 'Career']

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="home-section-label"><span />{children}</div>
}

function HomeHeroPhoto() {
  return (
    <div className="home-hero-photo" role="img" aria-label="Learners exploring a lesson together">
      <div className="home-hero-photo-sky" />
      <div className="home-hero-photo-room" />
      <div className="home-hero-photo-desk" />
      <div className="home-hero-photo-figures" aria-hidden="true">
        <span className="home-hero-figure home-hero-figure--mentor" />
        <span className="home-hero-figure home-hero-figure--learner" />
        <span className="home-hero-figure home-hero-figure--peer" />
      </div>
      <div className="home-hero-photo-glow" aria-hidden="true" />
      <p className="home-hero-photo-caption">Learning together, in the room where ideas become action.</p>
    </div>
  )
}

function HomeDomainArt({ label, scene, accent }: { label: string; scene: string; accent: string }) {
  const tag = label.split(' / ')[0]
  return (
    <div
      className={`home-domain-art home-domain-art--${scene}`}
      style={{ '--domain-accent': accent } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="home-domain-art-bg" />
      <div className="home-domain-art-figure" />
      <span className="home-domain-art-tag">{tag}</span>
    </div>
  )
}

function LearningMomentPreview() {
  const [orbitMode, setOrbitMode] = useState<'observe' | 'change'>('observe')

  return (
    <div className="home-learning-moment" aria-label="Learning by doing preview">
      <div className="home-learning-moment-header">
        <span>Physics · Orbit simulation</span>
        <span className="home-learning-moment-badge">Learn by doing</span>
      </div>
      <h3>Why does a planet stay in orbit?</h3>
      <p>Change one variable. Watch the system respond. Then explain what you observed.</p>
      <div className={`orbit-simulation ${orbitMode}`} aria-label="Orbit simulation preview">
        <span className="orbit-sun" />
        <span className="orbit-ring orbit-ring-one" />
        <span className="orbit-ring orbit-ring-two" />
        <span className="orbit-planet" />
      </div>
      <div className="orbit-controls">
        <span>Gravity</span>
        <button type="button" className={orbitMode === 'observe' ? 'is-active' : ''} onClick={() => setOrbitMode('observe')}>Stable</button>
        <button type="button" className={orbitMode === 'change' ? 'is-active' : ''} onClick={() => setOrbitMode('change')}>Change speed</button>
      </div>
      <div className="home-learning-moment-footer">
        <span>{orbitMode === 'observe' ? 'Observation saved · step 1 of 3' : 'Feedback: the orbit is changing'}</span>
        <button type="button">Next step <span>→</span></button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [intent, setIntent] = useState(0)
  const selectedIntent = intents[intent]

  return (
    <PageShell aurora={false}>
      <main className="home-redesign">
        <section className="home-hero-new">
          <div className="home-hero-inner">
            <div className="home-hero-copy">
              <SectionLabel>Education, skills and opportunity</SectionLabel>
              <h1>Don&apos;t just learn.<br /><em>Do something</em> with it.</h1>
              <p>Academic education, exams, practical skills, real work and future opportunities, connected in one place.</p>
              <div className="home-hero-actions">
                <Link className="home-primary-button" to="/programs">Experience Skylent <span>↗</span></Link>
                <a className="home-secondary-button" href="#interests">Explore by interest</a>
              </div>
              <div className="home-proof-line">
                <span className="home-proof-dot" />
                A learning system built around capability, not just completion.
              </div>
            </div>

            <div className="home-hero-art">
              <div className="home-hero-visual-stack">
                <HomeHeroPhoto />
                <LearningMomentPreview />
              </div>
            </div>
          </div>
        </section>

        <section className="home-journey-band">
          <div className="home-journey-inner">
            <SectionLabel>One connected journey</SectionLabel>
            <div className="home-journey-track">
              {journey.map((item, index) => (
                <div key={item} className="home-journey-item">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{item}</strong>
                  {index < journey.length - 1 && <i>→</i>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="interests" className="home-section home-interest-section">
          <div className="home-section-heading">
            <div>
              <SectionLabel>Start where you are</SectionLabel>
              <h2>Different worlds.<br /><em>One platform.</em></h2>
            </div>
            <p>Choose a direction, then move between understanding, practice, projects and opportunities as your goals evolve.</p>
          </div>
          <div className="home-domain-grid">
            {domains.map((domain, index) => (
              <Link
                to={domain.to}
                className={`home-domain-card domain-card-${index + 1}`}
                key={domain.label}
                style={{ '--domain-accent': domain.accent } as React.CSSProperties}
              >
                <HomeDomainArt label={domain.label} scene={domain.scene} accent={domain.accent} />
                <div className="home-domain-content">
                  <span className="home-domain-number">0{index + 1}</span>
                  <h3>{domain.label}</h3>
                  <p>{domain.copy}</p>
                  <span className="home-card-arrow">Explore <b>→</b></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-section home-engine-section">
          <div className="home-section-heading">
            <div>
              <SectionLabel>The learning engine</SectionLabel>
              <h2>The medium should<br /><em>fit the objective.</em></h2>
            </div>
            <p>A lesson is useful when it matches what the learner is trying to do. Sometimes that means explanation. Sometimes it means a case, a simulation, a build or a hard question.</p>
          </div>
          <div className="home-engine-grid">
            <div className="home-engine-list">
              {['Simulation', 'Case', 'Build', 'Practice'].map((item, index) => (
                <button
                  type="button"
                  key={item}
                  className={`home-engine-item ${intent === index ? 'is-active' : ''}`}
                  onClick={() => setIntent(index)}
                >
                  <span>0{index + 1}</span>
                  <strong>{item}</strong>
                  <i>↗</i>
                </button>
              ))}
              <div className="home-engine-note">
                <strong>{selectedIntent.label}</strong>
                <span>{selectedIntent.copy}</span>
              </div>
            </div>
            <div className={`home-engine-workspace engine-mode-${intent}`}>
              <div className="workspace-heading">
                <span>ACTIVE WORKSPACE / {selectedIntent.label.toUpperCase()}</span>
                <b>0{intent + 1} / 04</b>
              </div>
              <div className="engine-task">
                <span className="engine-task-label">TODAY&apos;S TASK</span>
                <h3>
                  {intent === 0
                    ? 'Test the idea before you memorise it.'
                    : intent === 1
                      ? 'Make a decision. See what changes.'
                      : intent === 2
                        ? 'Build a useful thing from the brief.'
                        : 'Practice with feedback that tells you why.'}
                </h3>
                {intent === 0 && (
                  <div className="engine-visual engine-simulation">
                    <span className="engine-axis" />
                    <span className="engine-point point-a" />
                    <span className="engine-point point-b" />
                    <i>change one variable</i>
                  </div>
                )}
                {intent === 1 && (
                  <div className="engine-visual engine-case">
                    <span>CASE / CITY TRANSIT</span>
                    <strong>Which route should launch first?</strong>
                    <div><b>Demand</b><em>High</em></div>
                    <div><b>Cost</b><em>Medium</em></div>
                  </div>
                )}
                {intent === 2 && (
                  <div className="engine-visual engine-build">
                    <span>YOUR BUILD</span>
                    <div className="build-frame"><i /><i /><i /></div>
                    <small>Draft · feedback · revision</small>
                  </div>
                )}
                {intent === 3 && (
                  <div className="engine-visual engine-practice">
                    <span>FEEDBACK</span>
                    <strong>Good reasoning. Try the next constraint.</strong>
                    <div className="practice-meter"><i /></div>
                    <small>2 of 5 attempts · specific guidance</small>
                  </div>
                )}
              </div>
              <div className="workspace-action">
                <span>Learning objective</span>
                <strong>{selectedIntent.copy}</strong>
                <button type="button" onClick={() => setIntent((intent + 1) % intents.length)}>Continue <span>→</span></button>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section home-progress-section">
          <div className="home-section-heading">
            <div>
              <SectionLabel>Progress with purpose</SectionLabel>
              <h2>Learning should<br /><em>lead somewhere.</em></h2>
            </div>
            <p>Every meaningful step creates evidence. Evidence creates confidence. Confidence creates movement.</p>
          </div>
          <div className="home-progress-flow">
            {[
              ['01', 'Learn', 'Understand the foundation.'],
              ['02', 'Build', 'Use it on a real problem.'],
              ['03', 'Prove', 'Show what you can do.'],
              ['04', 'Move', 'Find the next opportunity.'],
            ].map((step, index) => (
              <div className="home-progress-step" key={step[1]}>
                <span>{step[0]}</span>
                <div>
                  <h3>{step[1]}</h3>
                  <p>{step[2]}</p>
                </div>
                {index < 3 && <i>→</i>}
              </div>
            ))}
          </div>
          <div className="home-outcome-panel">
            <div>
              <SectionLabel>Outcome over applause</SectionLabel>
              <h3>&ldquo;I can do this now.&rdquo;</h3>
              <p>Projects, assessment, reflection and feedback give a learner something stronger than a completion tick: a reason to trust their own capability.</p>
            </div>
            <div className="home-outcome-score">
              <span>CAPABILITY SIGNAL</span>
              <strong>01</strong>
              <small>Project evidence</small>
            </div>
          </div>
        </section>

        <section className="home-opportunity-section">
          <div className="home-opportunity-inner">
            <div>
              <SectionLabel>Where it can go</SectionLabel>
              <h2>&ldquo;I know what<br /><em>this can become.</em>&rdquo;</h2>
              <p>CareerOS connects learning to portfolios, interviews, applications, further study and real work. The next step stays visible.</p>
              <Link className="home-light-button" to="/career-os">Explore CareerOS <span>↗</span></Link>
            </div>
            <div className="home-opportunity-map">
              <div className="opportunity-node opportunity-node-main">
                Your work
                <div>Project evidence</div>
              </div>
              {[
                ['Career', 'Jobs and applications'],
                ['Further study', 'Courses and pathways'],
                ['Build something', 'Venture experiments'],
                ['Community', 'Mentors and peers'],
              ].map((node, index) => (
                <div className={`opportunity-node opportunity-node-${index}`} key={node[0]}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {node[0]}
                  <div>{node[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="home-institution-section">
          <div className="home-institution-inner">
            <div>
              <SectionLabel>For institutions</SectionLabel>
              <h2>Bring better learning into<br /><em>the institution you already have.</em></h2>
              <p>Give schools, colleges, universities and training teams a clearer way to connect learning, practice, evidence and opportunity.</p>
              <Link className="home-primary-button" to="/institutions">For institutions <span>↗</span></Link>
            </div>
            <div className="institution-preview institution-preview--home">
              <div className="institution-preview-head">
                <span>INSTITUTION PATHWAYS</span>
                <b>CONNECTED LEARNING</b>
              </div>
              <div className="institution-preview-columns">
                <div>
                  <span>LEARNING PATHS</span>
                  <strong>Your programmes</strong>
                  <small>Structured journeys across grades, terms and skills.</small>
                </div>
                <div>
                  <span>PROJECT REVIEW</span>
                  <strong>Evidence of work</strong>
                  <small>Faculty review with clear feedback loops.</small>
                </div>
                <div>
                  <span>CAREER SIGNALS</span>
                  <strong>Next steps</strong>
                  <small>Portfolios, placements and progression in view.</small>
                </div>
              </div>
              <div className="institution-progress">
                <span />
                <b>Programme health</b>
                <em>Built for schools and universities</em>
              </div>
            </div>
          </div>
        </section>

        <section className="home-final-section">
          <SectionLabel>Built for the long term</SectionLabel>
          <h2>Make learning worth<br /><em>coming back to.</em></h2>
          <p>Because the point is not to collect more lessons. It is to become more capable, more certain, and more ready for what comes next.</p>
          <Link className="home-primary-button" to="/programs">Start exploring <span>↗</span></Link>
        </section>
      </main>
    </PageShell>
  )
}
