import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/shared'
import { MediaImage } from '../components/foundation'
import { PHOTO } from '../media'

const domains = [
  { label: 'NEET / MBBS', copy: 'Anatomy, clinical reasoning and exam practice.', image: PHOTO.biologyLab, accent: '#168C83', to: '/education#competitive-exams' },
  { label: 'JEE / Engineering', copy: 'Physics, systems and building with purpose.', image: PHOTO.engineering, accent: '#3478D4', to: '/education#competitive-exams' },
  { label: 'Analytics', copy: 'Investigate data and make better decisions.', image: PHOTO.dataAnalytics, accent: '#6D58D9', to: '/programs/data-analytics-pro' },
  { label: 'IIM / Business', copy: 'Cases, markets, operations and leadership.', image: PHOTO.businessSchool, accent: '#B87918', to: '/programs/product-management' },
  { label: 'Coding & Tech', copy: 'Build software, workflows and useful products.', image: PHOTO.codingSession, accent: '#2E73C8', to: '/programs/full-stack' },
  { label: 'Design & Creative', copy: 'Research, prototype and shape better experiences.', image: PHOTO.professional, accent: '#B45A86', to: '/skills' },
  { label: 'Humanities & Social', copy: 'Understand people, culture and the world around them.', image: PHOTO.research, accent: '#4E765B', to: '/education' },
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

function ProductPreview() {
  const [active, setActive] = useState(2)
  const [orbitMode, setOrbitMode] = useState<'observe' | 'change'>('observe')
  const activeIntent = intents[active]
  return (
    <div className="home-product-preview" aria-label="Skylent learning workspace preview">
      <div className="preview-topbar"><span className="preview-dot" /><span>SKYLENT / LEARNING STUDIO</span><span className="preview-status">SIMULATION</span></div>
      <div className="preview-body">
        <div className="preview-sidebar"><div className="preview-sidebar-title">TODAY</div>{['Question', 'Observe', 'Change', 'Explain'].map((item, index) => <div key={item} className={`preview-side-item ${index === 1 ? 'is-active' : ''}`}><b>0{index + 1}</b>{item}</div>)}</div>
        <div className="preview-workspace preview-orbit-workspace"><div className="preview-kicker">PHYSICS / ORBIT SIMULATION</div><h3>Why does a planet stay in orbit?</h3><p>Change one variable. Watch the system respond. Then explain what you observed.</p><div className={`orbit-simulation ${orbitMode}`} aria-label="Orbit simulation preview"><span className="orbit-sun" /><span className="orbit-ring orbit-ring-one" /><span className="orbit-ring orbit-ring-two" /><span className="orbit-planet" /></div><div className="orbit-controls"><span>Gravity</span><button type="button" className={orbitMode === 'observe' ? 'is-active' : ''} onClick={() => setOrbitMode('observe')}>Stable</button><button type="button" className={orbitMode === 'change' ? 'is-active' : ''} onClick={() => setOrbitMode('change')}>Change speed</button></div><div className="preview-workspace-footer"><span>{orbitMode === 'observe' ? 'Observation saved · 1 of 3' : 'Feedback: the orbit is changing'}</span><button type="button" onClick={() => setActive((active + 1) % intents.length)}>Try next step <span>→</span></button></div></div>
      </div>
      <div className="preview-caption"><span className="preview-caption-index">{activeIntent.icon}</span><span><strong>{activeIntent.label}</strong>{activeIntent.copy}</span></div>
    </div>
  )
}

export default function HomePage() {
  const [intent, setIntent] = useState(0)
  const selectedIntent = intents[intent]
  return (
    <PageShell aurora={false}>
      <main className="home-redesign">
        <section className="home-hero-new"><div className="home-hero-inner"><div className="home-hero-copy"><SectionLabel>Education, skills and opportunity</SectionLabel><h1>Don't just learn.<br /><em>Do something</em> with it.</h1><p>Academic education, exams, practical skills, real work and future opportunities, connected in one place.</p><div className="home-hero-actions"><Link className="home-primary-button" to="/programs">Experience Skylent <span>↗</span></Link><a className="home-secondary-button" href="#interests">Explore by interest</a></div><div className="home-proof-line"><span className="home-proof-dot" />A learning system built around capability, not just completion.</div></div><div className="home-hero-art"><div className="home-hero-image"><MediaImage src={PHOTO.classroomWarm} alt="Learners exploring a lesson together" aspect="4/3" radius={18} /></div><ProductPreview /></div></div></section>

        <section className="home-journey-band"><div className="home-journey-inner"><SectionLabel>One connected journey</SectionLabel><div className="home-journey-track">{journey.map((item, index) => <div key={item} className="home-journey-item"><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong>{index < journey.length - 1 && <i>→</i>}</div>)}</div></div></section>

        <section id="interests" className="home-section home-interest-section"><div className="home-section-heading"><div><SectionLabel>Start where you are</SectionLabel><h2>Different worlds.<br /><em>One platform.</em></h2></div><p>Choose a direction, then move between understanding, practice, projects and opportunities as your goals evolve.</p></div><div className="home-domain-grid">{domains.map((domain, index) => <Link to={domain.to} className={`home-domain-card domain-card-${index + 1}`} key={domain.label} style={{ '--domain-accent': domain.accent } as React.CSSProperties}><MediaImage src={domain.image} alt="" aspect="3/2" radius={0} /><div className="home-domain-content"><span className="home-domain-number">0{index + 1}</span><h3>{domain.label}</h3><p>{domain.copy}</p><span className="home-card-arrow">Explore <b>→</b></span></div></Link>)}</div></section>

        <section className="home-section home-engine-section"><div className="home-section-heading"><div><SectionLabel>The learning engine</SectionLabel><h2>The medium should<br /><em>fit the objective.</em></h2></div><p>A lesson is useful when it matches what the learner is trying to do. Sometimes that means explanation. Sometimes it means a case, a simulation, a build or a hard question.</p></div><div className="home-engine-grid"><div className="home-engine-list">{['Simulation', 'Case', 'Build', 'Practice'].map((item, index) => <button type="button" key={item} className={`home-engine-item ${intent === index ? 'is-active' : ''}`} onClick={() => setIntent(index)}><span>0{index + 1}</span><strong>{item}</strong><i>↗</i></button>)}<div className="home-engine-note"><strong>{selectedIntent.label}</strong><span>{selectedIntent.copy}</span></div></div><div className={`home-engine-workspace engine-mode-${intent}`}><div className="workspace-heading"><span>ACTIVE WORKSPACE / {selectedIntent.label.toUpperCase()}</span><b>0{intent + 1} / 04</b></div><div className="engine-task"><span className="engine-task-label">TODAY'S TASK</span><h3>{intent === 0 ? 'Test the idea before you memorise it.' : intent === 1 ? 'Make a decision. See what changes.' : intent === 2 ? 'Build a useful thing from the brief.' : 'Practice with feedback that tells you why.'}</h3>{intent === 0 && <div className="engine-visual engine-simulation"><span className="engine-axis" /><span className="engine-point point-a" /><span className="engine-point point-b" /><i>change one variable</i></div>}{intent === 1 && <div className="engine-visual engine-case"><span>CASE / CITY TRANSIT</span><strong>Which route should launch first?</strong><div><b>Demand</b><em>High</em></div><div><b>Cost</b><em>Medium</em></div></div>}{intent === 2 && <div className="engine-visual engine-build"><span>YOUR BUILD</span><div className="build-frame"><i /><i /><i /></div><small>Draft · feedback · revision</small></div>}{intent === 3 && <div className="engine-visual engine-practice"><span>FEEDBACK</span><strong>Good reasoning. Try the next constraint.</strong><div className="practice-meter"><i /></div><small>2 of 5 attempts · specific guidance</small></div>}</div><div className="workspace-action"><span>Learning objective</span><strong>{selectedIntent.copy}</strong><button type="button" onClick={() => setIntent((intent + 1) % intents.length)}>Continue <span>→</span></button></div></div></div></section>

        <section className="home-section home-progress-section"><div className="home-section-heading"><div><SectionLabel>Progress with purpose</SectionLabel><h2>Learning should<br /><em>lead somewhere.</em></h2></div><p>Every meaningful step creates evidence. Evidence creates confidence. Confidence creates movement.</p></div><div className="home-progress-flow">{[['01', 'Learn', 'Understand the foundation.'], ['02', 'Build', 'Use it on a real problem.'], ['03', 'Prove', 'Show what you can do.'], ['04', 'Move', 'Find the next opportunity.']].map((step, index) => <div className="home-progress-step" key={step[1]}><span>{step[0]}</span><div><h3>{step[1]}</h3><p>{step[2]}</p></div>{index < 3 && <i>→</i>}</div>)}</div><div className="home-outcome-panel"><div><SectionLabel>Outcome over applause</SectionLabel><h3>“I can do this now.”</h3><p>Projects, assessment, reflection and feedback give a learner something stronger than a completion tick: a reason to trust their own capability.</p></div><div className="home-outcome-score"><span>CAPABILITY SIGNAL</span><strong>01</strong><small>Project evidence</small></div></div></section>

        <section className="home-opportunity-section"><div className="home-opportunity-inner"><div><SectionLabel>Where it can go</SectionLabel><h2>“I know what<br /><em>this can become.</em>”</h2><p>CareerOS connects learning to portfolios, interviews, applications, further study and real work. The next step stays visible.</p><Link className="home-light-button" to="/career-os">Explore CareerOS <span>↗</span></Link></div><div className="home-opportunity-map"><div className="opportunity-node opportunity-node-main">Your work<div>Project evidence</div></div>{[['Career', 'Jobs and applications'], ['Further study', 'Courses and pathways'], ['Build something', 'Venture experiments'], ['Community', 'Mentors and peers']].map((node, index) => <div className={`opportunity-node opportunity-node-${index}`} key={node[0]}><span>{String(index + 1).padStart(2, '0')}</span>{node[0]}<div>{node[1]}</div></div>)}</div></div></section>

        <section className="home-institution-section"><div className="home-institution-inner"><div><SectionLabel>For institutions</SectionLabel><h2>Bring better learning into<br /><em>the institution you already have.</em></h2><p>Give schools, colleges, universities and training teams a clearer way to connect learning, practice, evidence and opportunity.</p><Link className="home-primary-button" to="/institutions">For institutions <span>↗</span></Link></div><div className="institution-preview"><div className="institution-preview-head"><span>INSTITUTION WORKSPACE</span><b>PRODUCT PREVIEW</b></div><div className="institution-preview-columns"><div><span>LEARNING PATHS</span><strong>—</strong><small>Your programmes will appear here</small></div><div><span>PROJECT REVIEW</span><strong>—</strong><small>Review activity will appear here</small></div><div><span>CAREER SIGNALS</span><strong>—</strong><small>Next steps will appear here</small></div></div><div className="institution-progress"><span /><b>Programme health</b><em>Launching soon</em></div></div></div></section>

        <section className="home-final-section"><SectionLabel>Built for the long term</SectionLabel><h2>Make learning worth<br /><em>coming back to.</em></h2><p>Because the point is not to collect more lessons. It is to become more capable, more certain, and more ready for what comes next.</p><Link className="home-primary-button" to="/programs">Start exploring <span>↗</span></Link></section>
      </main>
    </PageShell>
  )
}
