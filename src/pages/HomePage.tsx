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

function HeroInformationVisual() {
  const [orbitMode, setOrbitMode] = useState<'observe' | 'change'>('observe')
  const velocity = orbitMode === 'observe' ? '7.2' : '9.4'
  const outcome = orbitMode === 'observe' ? 'Stable elliptical path' : 'Orbit widening — escape risk'

  return (
    <div className="home-hero-info-visual" aria-label="Physics orbit learning workspace">
      <div className="home-info-visual-head">
        <span className="home-info-kicker">Physics / Orbit</span>
        <span className="home-info-flow">Question → Experiment → Observation → Understanding</span>
      </div>
      <h3 className="home-info-question">Why does a planet stay in orbit?</h3>
      <p className="home-info-prompt">Adjust mass or velocity. Read the system. Explain what changed.</p>

      <div className="home-info-visual-body">
        <div className="home-orbit-stage">
          <div className={`home-orbit-diagram ${orbitMode}`} aria-hidden="true">
            <span className="home-orbit-sun" />
            <span className="home-orbit-path" />
            <span className="home-orbit-planet" />
            <span className="home-orbit-vector" />
            <span className="home-orbit-mass-label">M<sub>☉</sub></span>
          </div>
          <div className="home-orbit-controls">
            <span>Variable</span>
            <button type="button" className={orbitMode === 'observe' ? 'is-active' : ''} onClick={() => setOrbitMode('observe')}>Stable orbit</button>
            <button type="button" className={orbitMode === 'change' ? 'is-active' : ''} onClick={() => setOrbitMode('change')}>Increase velocity</button>
          </div>
        </div>

        <aside className="home-orbit-metrics">
          <div className="home-metric"><span>Velocity</span><strong>{velocity} km/s</strong></div>
          <div className="home-metric"><span>Gravity</span><strong>9.8 m/s²</strong></div>
          <div className="home-metric"><span>Distance</span><strong>4.2M km</strong></div>
          <div className="home-metric home-metric--outcome"><span>Outcome</span><strong>{outcome}</strong></div>
          <div className="home-mini-chart" aria-hidden="true">
            <span className="home-mini-chart-label">Velocity trace</span>
            <div className="home-mini-chart-bars">
              {[42, 55, 48, 62, orbitMode === 'observe' ? 58 : 78, 65].map((h, i) => (
                <i key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="home-info-visual-foot">
        <span>{orbitMode === 'observe' ? 'Observation saved · centrifugal force balances gravity' : 'Feedback: velocity exceeded stable threshold'}</span>
        <span className="home-info-step">Step 2 of 4 · Observe</span>
      </div>
    </div>
  )
}

function DomainInfoVisual({ scene, accent }: { scene: string; accent: string }) {
  return (
    <div className={`home-domain-info home-domain-info--${scene}`} style={{ '--domain-accent': accent } as React.CSSProperties} aria-hidden="true">
      {scene === 'biology' && (
        <svg viewBox="0 0 320 180" className="home-domain-svg">
          <rect width="320" height="180" fill="#f3f7f4" />
          <ellipse cx="160" cy="92" rx="38" ry="58" fill="none" stroke={accent} strokeWidth="1.5" opacity=".5" />
          <circle cx="160" cy="78" r="14" fill={accent} opacity=".22" />
          <circle cx="148" cy="98" r="9" fill={accent} opacity=".35" />
          <circle cx="172" cy="98" r="9" fill={accent} opacity=".35" />
          <path d="M160 92 L148 118 M160 92 L172 118" stroke={accent} strokeWidth="1.2" opacity=".6" />
          <text x="24" y="28" fill={accent} fontSize="10" fontFamily="var(--font-mono)">CARDIOVASCULAR FLOW</text>
          <text x="24" y="158" fill="#6d7772" fontSize="9" fontFamily="var(--font-mono)">symptom → system → diagnosis</text>
        </svg>
      )}
      {scene === 'engineering' && (
        <svg viewBox="0 0 320 180" className="home-domain-svg">
          <rect width="320" height="180" fill="#f2f6fb" />
          <rect x="118" y="72" width="84" height="44" fill="#fff" stroke={accent} strokeWidth="1.5" rx="4" />
          <line x1="88" y1="94" x2="118" y2="94" stroke={accent} strokeWidth="2" markerEnd="url(#arrow)" />
          <line x1="202" y1="94" x2="232" y2="94" stroke={accent} strokeWidth="2" />
          <line x1="160" y1="52" x2="160" y2="72" stroke={accent} strokeWidth="2" />
          <text x="70" y="88" fill={accent} fontSize="9" fontFamily="var(--font-mono)">F</text>
          <text x="24" y="28" fill={accent} fontSize="10" fontFamily="var(--font-mono)">MECHANICS / FORCES</text>
          <text x="24" y="158" fill="#6d7772" fontSize="9" fontFamily="var(--font-mono)">load → structure → response</text>
        </svg>
      )}
      {scene === 'analytics' && (
        <svg viewBox="0 0 320 180" className="home-domain-svg">
          <rect width="320" height="180" fill="#f5f3fa" />
          <text x="24" y="28" fill={accent} fontSize="10" fontFamily="var(--font-mono)">DATASET / TREND</text>
          {[48, 72, 58, 90, 68, 110, 84].map((h, i) => (
            <rect key={i} x={36 + i * 32} y={150 - h} width="18" height={h} fill={accent} opacity={0.25 + i * 0.08} rx="2" />
          ))}
          <polyline points="44,118 76,96 108,104 140,72 172,88 204,58 236,74" fill="none" stroke={accent} strokeWidth="2" />
          <text x="24" y="158" fill="#6d7772" fontSize="9" fontFamily="var(--font-mono)">filter → pattern → decision</text>
        </svg>
      )}
      {scene === 'business' && (
        <svg viewBox="0 0 320 180" className="home-domain-svg">
          <rect width="320" height="180" fill="#fbf7ef" />
          <text x="24" y="28" fill={accent} fontSize="10" fontFamily="var(--font-mono)">STRATEGY MAP</text>
          <rect x="130" y="44" width="60" height="28" rx="4" fill="#fff" stroke={accent} strokeWidth="1.2" />
          <line x1="160" y1="72" x2="100" y2="108" stroke={accent} strokeWidth="1.2" />
          <line x1="160" y1="72" x2="220" y2="108" stroke={accent} strokeWidth="1.2" />
          <rect x="70" y="108" width="60" height="28" rx="4" fill={accent} opacity=".18" stroke={accent} strokeWidth="1" />
          <rect x="190" y="108" width="60" height="28" rx="4" fill="#fff" stroke={accent} strokeWidth="1" />
          <text x="24" y="158" fill="#6d7772" fontSize="9" fontFamily="var(--font-mono)">option → trade-off → outcome</text>
        </svg>
      )}
      {scene === 'coding' && (
        <svg viewBox="0 0 320 180" className="home-domain-svg">
          <rect width="320" height="180" fill="#f0f5fa" />
          <text x="24" y="28" fill={accent} fontSize="10" fontFamily="var(--font-mono)">SYSTEM FLOW</text>
          {[{ x: 32, label: 'API' }, { x: 120, label: 'Service' }, { x: 208, label: 'Store' }].map((node, i) => (
            <g key={node.label}>
              <rect x={node.x} y="78" width="72" height="36" rx="4" fill="#fff" stroke={accent} strokeWidth="1.2" />
              <text x={node.x + 36} y="100" textAnchor="middle" fill={accent} fontSize="10" fontFamily="var(--font-mono)">{node.label}</text>
              {i < 2 && <line x1={node.x + 72} y1="96" x2={node.x + 96} y2="96" stroke={accent} strokeWidth="1.5" />}
            </g>
          ))}
          <text x="24" y="158" fill="#6d7772" fontSize="9" fontFamily="var(--font-mono)">input → process → output</text>
        </svg>
      )}
      {scene === 'design' && (
        <svg viewBox="0 0 320 180" className="home-domain-svg">
          <rect width="320" height="180" fill="#faf3f7" />
          <text x="24" y="28" fill={accent} fontSize="10" fontFamily="var(--font-mono)">PROTOTYPE FLOW</text>
          <rect x="32" y="56" width="256" height="18" rx="3" fill="#fff" stroke={accent} strokeWidth="1" opacity=".7" />
          <rect x="32" y="84" width="180" height="52" rx="4" fill="#fff" stroke={accent} strokeWidth="1.2" />
          <rect x="32" y="146" width="120" height="10" rx="2" fill={accent} opacity=".2" />
          <rect x="220" y="84" width="68" height="52" rx="4" fill={accent} opacity=".12" stroke={accent} strokeWidth="1" strokeDasharray="4 3" />
          <text x="24" y="168" fill="#6d7772" fontSize="9" fontFamily="var(--font-mono)">wireframe → test → refine</text>
        </svg>
      )}
      {scene === 'humanities' && (
        <svg viewBox="0 0 320 180" className="home-domain-svg">
          <rect width="320" height="180" fill="#f2f6f3" />
          <text x="24" y="28" fill={accent} fontSize="10" fontFamily="var(--font-mono)">TIMELINE / CONTEXT</text>
          <line x1="40" y1="110" x2="280" y2="110" stroke={accent} strokeWidth="1.5" opacity=".5" />
          {[{ x: 56, y: '1962' }, { x: 120, y: '1991' }, { x: 188, y: '2008' }, { x: 256, y: '2024' }].map((point) => (
            <g key={point.y}>
              <circle cx={point.x} cy="110" r="5" fill={accent} />
              <text x={point.x} y="132" textAnchor="middle" fill="#6d7772" fontSize="8" fontFamily="var(--font-mono)">{point.y}</text>
            </g>
          ))}
          <text x="24" y="158" fill="#6d7772" fontSize="9" fontFamily="var(--font-mono)">event → cause → consequence</text>
        </svg>
      )}
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
              <HeroInformationVisual />
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
                <DomainInfoVisual scene={domain.scene} accent={domain.accent} />
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
                <span>ACTIVE WORKSPACE / {['SIMULATION', 'CASE', 'BUILD', 'PRACTICE'][intent]}</span>
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
                    <div className="engine-sim-controls">
                      <span>Variable: friction</span>
                      <div className="engine-sim-sliders"><i className="is-low" /><i className="is-mid is-active" /><i /></div>
                    </div>
                    <div className="engine-sim-chart">
                      <span className="engine-axis" />
                      <span className="engine-point point-a" />
                      <span className="engine-point point-b" />
                      <span className="engine-sim-curve" />
                    </div>
                    <p className="engine-visual-caption">Increase friction → curve shifts → predict the landing point</p>
                  </div>
                )}
                {intent === 1 && (
                  <div className="engine-visual engine-case">
                    <span>CASE / CITY TRANSIT</span>
                    <strong>Which route should launch first?</strong>
                    <div className="engine-case-tree">
                      <div className="engine-case-node is-root">Launch decision</div>
                      <div className="engine-case-branch"><div className="engine-case-node is-choice">Route A · high demand</div><em>+18% ridership</em></div>
                      <div className="engine-case-branch"><div className="engine-case-node">Route B · lower cost</div><em>−6% margin</em></div>
                    </div>
                  </div>
                )}
                {intent === 2 && (
                  <div className="engine-visual engine-build">
                    <span>YOUR BUILD</span>
                    <div className="engine-build-flow">
                      <div><b>Input</b><small>Brief + constraints</small></div>
                      <i>→</i>
                      <div className="is-active"><b>Build</b><small>Draft v2</small></div>
                      <i>→</i>
                      <div><b>Output</b><small>Working demo</small></div>
                    </div>
                    <div className="build-frame"><i /><i /><i /></div>
                    <small>Draft · feedback · revision</small>
                  </div>
                )}
                {intent === 3 && (
                  <div className="engine-visual engine-practice">
                    <span>PRACTICE / FEEDBACK</span>
                    <div className="engine-practice-q"><b>Q.</b> Which constraint breaks first when load doubles?</div>
                    <div className="engine-practice-a"><b>A.</b> Memory on the worker node</div>
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
