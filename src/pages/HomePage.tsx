import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FadeIn, Footer } from '../components/shared'
import { Button, Eyebrow, CTABand } from '../components/ui'
import { MediaImage } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { programs } from '../data'
import type { ProgramType } from '../data'
import { PHOTO, PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO } from '../media'

const featured = programs.find(p => p.slug === 'data-science-ai') ?? programs[0]
const professional = getDomainAccent('professional')
const career = getDomainAccent('career')

const typeLabel: Record<ProgramType, string> = {
  PROFESSIONAL: 'Professional Program',
  CERTIFICATE: 'Certificate Program',
  WEBINAR: 'Webinar',
  EXAM_PREP: 'Exam Preparation',
  SCHOOLING: 'Schooling',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate',
}

function Hero() {
  const navigate = useNavigate()
  return (
    <section className="skylent-home-hero">
      <div className="skylent-home-hero-grid" aria-hidden />
      <div className="skylent-home-hero-inner">
        <FadeIn>
          <div className="skylent-home-hero-copy">
            <Eyebrow tone="dark" accent>Skylent Global</Eyebrow>
            <h1 className="skylent-home-hero-title">Where learning<br />becomes <em>career.</em></h1>
            <p className="skylent-home-hero-lead">An education, skills and career ecosystem built to take learners from foundation to capability — and from capability to opportunity.</p>
            <div className="skylent-home-hero-actions">
              <Button size="lg" onClick={() => navigate('/programs')}>Explore Skylent OS</Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/institutions')}>Partner With Us</Button>
            </div>
            <div className="skylent-home-hero-meta"><span>EDUCATION</span><i /><span>SKILLS</span><i /><span>CAREER OS</span></div>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div className="skylent-home-hero-visual" aria-label="Skylent ecosystem product preview">
            <div className="skylent-home-aurora-orb" />
            <div className="skylent-product-window">
              <div className="skylent-product-window-bar"><div className="skylent-window-dots"><b /><b /><b /></div><span>skylent os / overview</span><span className="skylent-window-status">PRODUCT PREVIEW</span></div>
              <div className="skylent-product-window-body">
                <aside>
                  <div className="skylent-mini-brand">SKYLENT <i /></div>
                  {['Learning', 'Practice', 'Proof', 'Career'].map((item, i) => <div key={item} className={`skylent-mini-nav ${i === 0 ? 'is-active' : ''}`}><span>0{i + 1}</span>{item}</div>)}
                </aside>
                <div className="skylent-product-main">
                  <div className="skylent-product-kicker">YOUR JOURNEY</div>
                  <div className="skylent-product-title">Build capability.<br />Create proof.</div>
                  <div className="skylent-progress-line"><span /></div>
                  <div className="skylent-progress-label"><span>Learning progress</span><strong>Preview</strong></div>
                  <div className="skylent-product-cards">
                    <div className="skylent-product-card is-large"><span>01 / LEARN</span><strong>Data Analytics</strong><small>Continue · Module 03</small></div>
                    <div className="skylent-product-card"><span>02 / PROVE</span><strong>Projects</strong><small>Portfolio evidence</small></div>
                    <div className="skylent-product-card"><span>03 / CAREER</span><strong>Career OS</strong><small>Access after Professional Program</small></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="skylent-float-chip chip-learning">Learning <b>↗</b></div>
            <div className="skylent-float-chip chip-proof">Proof <b>✓</b></div>
            <div className="skylent-float-chip chip-career">Career <b>→</b></div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function Ecosystem() {
  const pillars = [
    { n: '01', label: 'Education', title: 'Build the foundation.', body: 'Schooling, undergraduate and postgraduate pathways designed as distinct academic experiences.', to: '/education', accent: getDomainAccent('schooling') },
    { n: '02', label: 'Skills', title: 'Build capability.', body: 'Webinars, credentials and professional programs that turn learning into practical skill.', to: '/skills', accent: professional },
    { n: '03', label: 'Career OS', title: 'Turn proof into opportunity.', body: 'Interview preparation, jobs and application workflows — unlocked through Professional Programs.', to: '/career-os', accent: career },
  ]
  return (
    <section className="skylent-home-section skylent-home-ecosystem">
      <div className="skylent-home-container">
        <FadeIn><div className="skylent-home-section-head"><div><Eyebrow tone="dark">Skylent OS</Eyebrow><h2>One ecosystem.<br /><em>Every stage</em> of the journey.</h2></div><p>Three connected products, each with its own purpose. The value is in the handoff between them.</p></div></FadeIn>
        <div className="skylent-ecosystem-grid">
          {pillars.map((p, i) => <FadeIn key={p.label} delay={i * 80}><Link to={p.to} className="skylent-ecosystem-card"><div className="skylent-ecosystem-top"><span>{p.n}</span><span style={{ color: p.accent.text }}>↗</span></div><div className="skylent-ecosystem-label" style={{ color: p.accent.text }}>{p.label}</div><h3>{p.title}</h3><p>{p.body}</p><div className="skylent-ecosystem-link">Explore {p.label} <span>→</span></div></Link></FadeIn>)}
        </div>
      </div>
    </section>
  )
}

function LearningJourney() {
  const steps = [
    ['01', 'Learn', 'Concepts, curriculum and guided practice.'],
    ['02', 'Build', 'Projects and practical work that create evidence.'],
    ['03', 'Prove', 'Assessments, credentials and a visible skill record.'],
    ['04', 'Advance', 'Career preparation and opportunity through Career OS.'],
  ]
  return <section className="skylent-home-section skylent-home-journey"><div className="skylent-home-container"><FadeIn><div className="skylent-home-journey-intro"><Eyebrow tone="dark">The learning loop</Eyebrow><h2>Learning should leave<br /><em>evidence behind.</em></h2><p>Every meaningful learning action should contribute to something a learner can carry forward.</p></div></FadeIn><div className="skylent-journey-track">{steps.map(([n, title, body], i) => <FadeIn key={title} delay={i * 70}><div className="skylent-journey-step"><span>{n}</span><div><h3>{title}</h3><p>{body}</p></div>{i < steps.length - 1 && <b>→</b>}</div></FadeIn>)}</div></div></section>
}

function OSGateway() {
  return <section className="skylent-home-os-gateway"><div className="skylent-os-glow" /><div className="skylent-home-container"><FadeIn><div className="skylent-os-gateway-inner"><div className="skylent-os-copy"><Eyebrow tone="dark" accent>Experience Skylent OS</Eyebrow><h2>The website introduces the journey.<br /><em>The product runs it.</em></h2><p>A focused product environment for learning, proof and career readiness.</p><Link to="/login" className="skylent-os-link">Enter Skylent OS <span>→</span></Link></div><div className="skylent-os-stack" aria-hidden><div className="skylent-os-layer layer-back"><span>CAREER READINESS</span><strong>Skills · Projects · Interviews</strong></div><div className="skylent-os-layer layer-mid"><span>LEARNING RECORD</span><strong>Courses · Assessments · Credentials</strong></div><div className="skylent-os-layer layer-front"><span>SKYLENT OS</span><strong>Learn → Build → Prove → Advance</strong><i>↗</i></div></div></div></FadeIn></div></section>
}

function ProgramSpotlight() {
  const navigate = useNavigate()
  if (!featured) return null
  const photo = PROGRAM_PHOTO[featured.slug] ?? DEFAULT_PROGRAM_PHOTO
  const price = Math.min(...featured.pricing.map(p => p.price))
  return <section className="skylent-home-section skylent-home-programs"><div className="skylent-home-container"><FadeIn><div className="skylent-home-section-head compact"><div><Eyebrow tone="dark">Programs</Eyebrow><h2>Go deeper when<br /><em>depth matters.</em></h2></div><Button variant="secondary" onClick={() => navigate('/programs')}>View all programs</Button></div></FadeIn><FadeIn delay={80}><Link to={`/programs/${featured.slug}`} className="skylent-program-feature"><MediaImage src={photo} alt={featured.name} aspect="16/9" overlay="full" /><div className="skylent-program-feature-copy"><span>{typeLabel[featured.programType]}</span><h3>{featured.name}</h3><p>{featured.desc}</p><div><b>{featured.duration}</b><b>{featured.format}</b><b>From ₹{price.toLocaleString('en-IN')}</b></div></div></Link></FadeIn></div></section>
}

function CareerPreview() {
  return <section className="skylent-home-section skylent-home-career"><div className="skylent-home-container"><div className="skylent-career-layout"><FadeIn><div className="skylent-career-copy"><Eyebrow tone="dark" accent>Career OS</Eyebrow><h2>Your career,<br /><em>operating layer.</em></h2><p>Professional Programs unlock a workspace that connects your profile, proof, interview preparation and job applications.</p><Link to="/career-os" className="skylent-text-link">Explore Career OS <span>→</span></Link></div></FadeIn><FadeIn delay={100}><div className="skylent-career-product"><div className="skylent-career-product-head"><span>CAREER OS</span><span>READINESS</span></div><div className="skylent-career-score"><div><small>Career readiness</small><strong>—</strong><span>Build your record first</span></div><div className="skylent-score-ring"><i /></div></div><div className="skylent-career-actions"><div><span>01</span><b>Resume</b><small>Profile + skills</small></div><div><span>02</span><b>Interview</b><small>Practice + prep</small></div><div><span>03</span><b>Jobs</b><small>Apply + track</small></div></div><div className="skylent-career-note">Career OS access <strong>unlocks with Professional Programs</strong></div></div></FadeIn></div></div></section>
}

function LabsTeaser() {
  return <section className="skylent-home-section skylent-home-labs"><div className="skylent-home-container"><Link to="/labs" className="skylent-labs-teaser"><div><Eyebrow tone="dark">Skylent Labs</Eyebrow><h2>Turn learning<br /><em>into practice.</em></h2><p>Hands-on experiments and practical work that make skill visible.</p></div><div className="skylent-labs-visual"><div className="lab-line"><span>01</span><b>Experiment</b><i>Complete</i></div><div className="lab-line active"><span>02</span><b>Practical task</b><i>In progress</i></div><div className="lab-line"><span>03</span><b>Learning proof</b><i>Next</i></div></div><span className="skylent-labs-arrow">Explore Labs →</span></Link></div></section>
}

function Institutions() {
  return <section className="skylent-home-section skylent-home-institutions"><div className="skylent-home-container"><div className="skylent-institution-layout"><MediaImage src={PHOTO.schoolBuilding} alt="Education institution" aspect="4/3" overlay="full" /><div><Eyebrow tone="dark">For Institutions</Eyebrow><h2>Infrastructure for<br /><em>better learning.</em></h2><p>Bring industry-aligned programs, skills development, learning workflows and career readiness into one institutional experience.</p><Link to="/institutions" className="skylent-text-link">Partner With Skylent <span>→</span></Link></div></div></div></section>
}

export default function HomePage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return <div className="skylent-home"><Hero /><Ecosystem /><LearningJourney /><OSGateway /><ProgramSpotlight /><CareerPreview /><LabsTeaser /><Institutions /><CTABand eyebrow="Start here" title={<>Find the path<br />that fits you.</>} lead="Explore education, build skills, enter Career OS, or build with Skylent as an institution." primary={{ label: 'Explore Programs', to: '/programs' }} secondary={{ label: 'Partner With Us', to: '/institutions' }} /><Footer /></div>
}
