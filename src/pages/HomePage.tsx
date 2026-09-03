import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, Footer } from '../components/shared'
import { Section, Eyebrow, Button, Badge, FlowStrip, CTABand, T, Aurora } from '../components/ui'
import { stories, programs } from '../data'
import type { Program, ProgramType } from '../data'
import { PHOTO, PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO } from '../media'

const TYPE_LABELS: Record<ProgramType, string> = {
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
    <section style={{ background: C.ink, minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 64 }}>
      <Aurora domain="home" />
      <div style={{ maxWidth: T.maxW, margin: '0 auto', padding: `clamp(48px,7vw,88px) ${T.gutter}`, width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(28px,5vw,56px)', alignItems: 'center' }} className="hero-grid">
          <div>
            <Eyebrow tone="dark">Education · Skills · Career</Eyebrow>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(40px, 6vw, 76px)', lineHeight: 0.96, color: C.white, margin: '22px 0 20px', letterSpacing: '-0.04em' }}>
              From education<br />to <span style={{ color: C.orange }}>employability.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.64)', fontSize: 'clamp(16px,2vw,18px)', lineHeight: 1.75, maxWidth: 500, margin: '0 0 32px' }}>
              One platform for academic learning, credentialed skills, and Career OS — for students, parents, and institutions.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={() => navigate('/programs')}>Explore Programs</Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/institutions')}>Partner With Us</Button>
            </div>
            <div style={{ display: 'flex', gap: 'clamp(20px,4vw,40px)', marginTop: 44, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.12)', flexWrap: 'wrap' }}>
              {[
                { label: 'Education', sub: 'School · UG · PG · Exams' },
                { label: 'Skills', sub: 'Webinars to Professional' },
                { label: 'Career OS', sub: 'Interview prep + Jobs' },
              ].map(({ label, sub }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.white }}>{label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '4/5', maxHeight: 640, background: '#1a1f24' }} className="hero-visual">
            <img
              src={PHOTO.hero}
              alt="Students collaborating on campus"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 20px', background: 'linear-gradient(to top, rgba(11,13,15,0.72), transparent)' }}>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }}>Campus · classroom · career — one journey</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function WhatLookingFor() {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)

  const intents = [
    {
      label: 'Learn',
      tagline: 'Academic programs from school to postgraduate.',
      sub: 'Schooling · Undergraduate · Postgraduate',
      photo: PHOTO.classroomWarm,
      photoAlt: 'Students learning in a classroom',
      desc: 'Structured academic programs from school through postgraduate — qualifications, subjects, and progress that parents and institutions can see.',
      exams: null as null | string[],
      to: '/education',
    },
    {
      label: 'Build Skills',
      tagline: 'Credentialed upskilling that can unlock Career OS.',
      sub: 'Webinars · Certificate · Professional Programs',
      photo: PHOTO.collab,
      photoAlt: 'Learners collaborating in a workshop',
      desc: 'From a live webinar to a full Professional Program. Skills is where learning becomes a credential — and a Professional Program opens Career OS.',
      exams: null,
      to: '/skills',
    },
    {
      label: 'Prepare',
      tagline: 'Performance-first exam preparation.',
      sub: 'JEE · NEET · CAT · Other Exams',
      photo: PHOTO.study,
      photoAlt: 'Student focused on exam preparation',
      desc: 'Not a degree program. Subject-level practice, mock tests, analytics, and faculty support — structured around the exam.',
      exams: ['JEE', 'NEET', 'CAT', 'CUET', 'CLAT', 'GMAT'],
      to: '/education#competitive-exams',
    },
    {
      label: 'Build Your Career',
      tagline: 'Career readiness as a product, not a promise.',
      sub: 'Profile · Interview Prep · Job Board',
      photo: PHOTO.career,
      photoAlt: 'Professional in a career conversation',
      desc: 'Career OS is interview preparation, a job board, and application tracking — activated when you complete a Professional Program.',
      exams: null,
      to: '/career-os',
    },
  ]

  const current = intents[active]

  return (
    <Section bg={C.warmWhite}>
      <FadeIn>
        <div style={{ marginBottom: 36 }}>
          <Eyebrow>Start here</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(26px,3.2vw,40px)', lineHeight: 1.1, letterSpacing: '-0.025em', color: C.ink, margin: '18px 0 0' }}>
            What are you looking to do?
          </h2>
        </div>
      </FadeIn>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,48px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <div>
            {intents.map((intent, i) => {
              const isActive = active === i
              return (
                <div
                  key={intent.label}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '20px 0',
                    width: '100%',
                    borderBottom: `1px solid ${T.lineLight}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    alignItems: 'flex-start',
                    opacity: isActive ? 1 : 0.62,
                    transition: 'opacity 0.15s',
                  }}
                >
                  <div style={{ width: 3, alignSelf: 'stretch', background: isActive ? C.orange : 'transparent', borderRadius: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.ink, letterSpacing: '-0.02em' }}>{intent.label}</span>
                      <span style={{ color: C.slate, fontSize: 12 }}>{intent.sub}</span>
                    </div>
                    {isActive && (
                      <>
                        <p style={{ color: C.slate, fontSize: 14.5, lineHeight: 1.65, margin: '0 0 12px', maxWidth: 420 }}>{intent.desc}</p>
                        {intent.exams && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                            {intent.exams.map(e => (
                              <span key={e} style={{ background: 'rgba(243,107,33,0.08)', border: '1px solid rgba(243,107,33,0.2)', borderRadius: 5, padding: '3px 9px', color: C.orange, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{e}</span>
                            ))}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={ev => { ev.stopPropagation(); navigate(intent.to) }}
                          style={{ color: C.orange, fontSize: 14, fontWeight: 600, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                        >
                          Continue →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div style={{ position: 'sticky', top: 88 }}>
            <div style={{ borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '4/3', background: C.sand, position: 'relative' }}>
              <img key={current.photo} src={current.photo} alt={current.photoAlt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,13,15,0.7) 0%, transparent 52%)' }} />
              <div style={{ position: 'absolute', bottom: 22, left: 22, right: 22 }}>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{current.label.toUpperCase()}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, letterSpacing: '-0.015em', lineHeight: 1.25 }}>{current.tagline}</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

function SkylentOS() {
  const navigate = useNavigate()
  const stages = [
    {
      name: 'Education',
      bridge: 'learning',
      photo: PHOTO.campus,
      tagline: 'Schooling, undergraduate, postgraduate, and competitive exam preparation — four different products, one academic foundation.',
      items: ['Schooling', 'Undergraduate', 'Postgraduate', 'Competitive Exams'],
      to: '/education',
    },
    {
      name: 'Skills',
      bridge: 'capability',
      photo: PHOTO.workshop,
      tagline: 'Webinars, certificate programs, and Professional Programs. Completing a Professional Program unlocks Career OS.',
      items: ['Webinars', 'Certificate Programs', 'Professional Programs', 'Job Assistance'],
      to: '/skills',
      accent: true,
    },
    {
      name: 'Career OS',
      bridge: 'opportunity',
      photo: PHOTO.career,
      tagline: 'Interview preparation, job board, applications — a career product, not a slogan. Activated by Professional Programs.',
      items: ['Career Readiness', 'Interview Preparation', 'Job Board'],
      to: '/career-os',
    },
  ]

  return (
    <Section bg={C.ink} id="skylent-os">
      <FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'end', marginBottom: 56 }} className="two-col">
          <div>
            <Eyebrow tone="dark">Skylent OS</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(30px,4vw,52px)', lineHeight: 1.04, letterSpacing: '-0.03em', color: C.white, margin: '20px 0 0' }}>
              One journey.<br />Three products.
            </h2>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 17, lineHeight: 1.78, margin: 0 }}>
            Education builds the foundation. Skills turns it into capability. Career OS turns capability into opportunity. Each stage feeds the next.
          </p>
        </div>
      </FadeIn>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {stages.map((stage, i) => (
          <FadeIn key={stage.name} delay={i * 80}>
            <div
              onClick={() => navigate(stage.to)}
              style={{
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
                gap: 0,
                borderTop: i === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                minHeight: 220,
              }}
              className="two-col"
            >
              <div style={{ position: 'relative', minHeight: 200, overflow: 'hidden' }}>
                <img src={stage.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(11,13,15,0.15), rgba(11,13,15,0.55))' }} />
              </div>
              <div style={{ padding: 'clamp(28px,4vw,44px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 10 }}>
                  0{i + 1}{i < stages.length - 1 ? `  ·  then ${stage.bridge}` : ''}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.2vw,36px)', fontWeight: 600, color: stage.accent ? C.orange : C.white, margin: '0 0 12px', letterSpacing: '-0.025em' }}>{stage.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, margin: '0 0 20px', maxWidth: 520 }}>{stage.tagline}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {stage.items.map(item => (
                    <span key={item} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 12px', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={240}>
        <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" size="lg" onClick={() => navigate('/os')}>Explore Skylent OS</Button>
        </div>
      </FadeIn>
    </Section>
  )
}

function ProgramMiniCard({ prog }: { prog: Program }) {
  const navigate = useNavigate()
  const photo = PROGRAM_PHOTO[prog.slug] ?? DEFAULT_PROGRAM_PHOTO
  const lowest = Math.min(...prog.pricing.map(p => p.price))
  return (
    <div
      onClick={() => navigate(`/programs/${prog.slug}`)}
      style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 18px 50px rgba(11,13,15,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
        <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{ background: C.ink, color: C.white, borderRadius: 5, padding: '4px 10px', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{TYPE_LABELS[prog.programType].toUpperCase()}</span>
        </div>
      </div>
      <div style={{ padding: '20px 22px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{prog.name}</h3>
        <p style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>{prog.desc}</p>
        <div style={{ display: 'flex', gap: 16, paddingTop: 14, borderTop: `1px solid ${T.lineLight}`, fontSize: 12, color: C.slate }}>
          <span>{prog.duration}</span>
          <span>{prog.format}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: C.ink }}>₹{lowest.toLocaleString('en-IN')}</div>
          <span style={{ color: C.orange, fontSize: 13, fontWeight: 600 }}>View Program →</span>
        </div>
      </div>
    </div>
  )
}

function FeaturedPrograms() {
  const navigate = useNavigate()
  const featured = [
    programs.find(p => p.slug === 'data-science-ai'),
    programs.find(p => p.slug === 'jee-advanced-prep'),
    programs.find(p => p.slug === 'sql-certificate'),
    programs.find(p => p.slug === 'full-stack'),
  ].filter((p): p is Program => Boolean(p))

  return (
    <Section bg={C.sand}>
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <Eyebrow>Catalog</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.1, letterSpacing: '-0.025em', color: C.ink, margin: '18px 0 0' }}>
              Programs, not placeholders.
            </h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('/programs')}>View all programs →</Button>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="programs-grid">
        {featured.map((prog, i) => (
          <FadeIn key={prog.slug} delay={i * 60}>
            <ProgramMiniCard prog={prog} />
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}

function EducationPreview() {
  const navigate = useNavigate()
  const paths = [
    { name: 'Schooling', desc: 'Warm, academic learning for students, parents, and schools.', photo: PHOTO.classroomWarm, anchor: 'schooling', tone: 'warm' as const },
    { name: 'Undergraduate', desc: 'Campus-aligned degrees with projects, internships, and career direction.', photo: PHOTO.campus, anchor: 'undergraduate', tone: 'ink' as const },
    { name: 'Postgraduate', desc: 'Specialisation, cases, and professional outcomes.', photo: PHOTO.professional, anchor: 'postgraduate', tone: 'sand' as const },
    { name: 'Competitive Exams', desc: 'JEE, NEET, CAT — practice, mocks, analytics. Not a degree page.', photo: PHOTO.study, anchor: 'competitive-exams', tone: 'exam' as const },
  ]
  return (
    <Section bg={C.warmWhite}>
      <FadeIn>
        <div style={{ marginBottom: 40, maxWidth: 640 }}>
          <Eyebrow>Education</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.12, letterSpacing: '-0.025em', color: C.ink, margin: '18px 0 16px' }}>
            Four products. Four personalities.
          </h2>
          <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.75, margin: 0 }}>
            Schooling is not undergraduate. Undergraduate is not exam prep. Each pathway has its own curriculum model, audience, and visual language.
          </p>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="programs-grid">
        {paths.map((p, i) => (
          <FadeIn key={p.name} delay={i * 70}>
            <button
              type="button"
              onClick={() => navigate(`/education#${p.anchor}`)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                borderRadius: T.rCard,
                overflow: 'hidden',
                position: 'relative',
                minHeight: 280,
                background: C.sand,
              }}
            >
              <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: p.tone === 'exam' ? 'linear-gradient(to top, rgba(11,13,15,0.88), rgba(11,13,15,0.25))' : 'linear-gradient(to top, rgba(11,13,15,0.78), rgba(11,13,15,0.12))' }} />
              <div style={{ position: 'relative', padding: '28px 26px', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {p.tone === 'exam' && <Badge tone="dark" accent>Exam system</Badge>}
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: C.white, margin: '10px 0 8px', letterSpacing: '-0.02em' }}>{p.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>{p.desc}</p>
              </div>
            </button>
          </FadeIn>
        ))}
      </div>
      <div style={{ marginTop: 28 }}>
        <Button variant="ghost" onClick={() => navigate('/education')}>Explore Education →</Button>
      </div>
    </Section>
  )
}

function SkillsPreview() {
  const navigate = useNavigate()
  return (
    <Section bg={C.sand}>
      <FadeIn>
        <div style={{ marginBottom: 40 }}>
          <Eyebrow>Skills</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.12, letterSpacing: '-0.025em', color: C.ink, margin: '20px 0 16px' }}>
            Events, credentials, and career programs — not the same product.
          </h2>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }} className="skills-grid">
        <FadeIn>
          <div onClick={() => navigate('/programs')} style={{ cursor: 'pointer', background: C.ink, borderRadius: T.rCard, overflow: 'hidden' }}>
            <div style={{ height: 240, position: 'relative' }}>
              <img src={PHOTO.collab} alt="Professional program cohort" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.75 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,13,15,0.92), transparent 60%)' }} />
              <div style={{ position: 'absolute', top: 18, left: 20 }}><Badge tone="dark" accent>Unlocks Career OS</Badge></div>
            </div>
            <div style={{ padding: '24px 28px 28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: C.white, margin: '0 0 12px' }}>Professional Programs</h3>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, lineHeight: 1.7, margin: '0 0 22px' }}>
                Deep, project-driven programs. Curriculum, projects, tools, cohort, certification — and Career OS on completion.
              </p>
              <FlowStrip tone="dark" steps={[{ label: 'Enroll' }, { label: 'Career OS', highlight: true }, { label: 'Jobs' }]} />
            </div>
          </div>
        </FadeIn>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { name: 'Webinars', desc: 'Event-first: speaker, topic, date, live or recorded. Register.', to: '/workshops', photo: PHOTO.workshop },
            { name: 'Certificate Programs', desc: 'Structured credentials — duration, curriculum, assessment, certification.', to: '/programs', photo: PHOTO.lab },
            { name: 'Job Assistance', desc: 'A career-support product: resume, interviews, applications — not a course.', to: '/skills#job-assistance', photo: PHOTO.career },
          ].map((m, i) => (
            <FadeIn key={m.name} delay={i * 60}>
              <button type="button" onClick={() => navigate(m.to)} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 0, padding: 0, border: `1px solid ${T.lineLight}`, background: C.white, borderRadius: T.rCard, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ minHeight: 110, overflow: 'hidden' }}>
                  <img src={m.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{m.name}</div>
                  <div style={{ color: C.slate, fontSize: 13, lineHeight: 1.55 }}>{m.desc}</div>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )
}

function CareerOSShowcase() {
  const navigate = useNavigate()
  const modules = [
    { name: 'Career Readiness', desc: 'A working view of profile, resume, skills, and next actions.' },
    { name: 'Interview Preparation', desc: 'Technical, HR, and managerial rounds — plus mock interviews.' },
    { name: 'Job Board', desc: 'Openings you can inspect and apply to from Career OS.' },
    { name: 'Applications', desc: 'Track what you have submitted. Empty until you apply.' },
  ]
  return (
    <Section bg={C.ink}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,72px)', alignItems: 'center' }} className="two-col">
        <FadeIn>
          <Eyebrow tone="dark" accent>Career OS</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(30px,4vw,52px)', lineHeight: 1.04, letterSpacing: '-0.03em', color: C.white, margin: '24px 0 20px' }}>
            A career product,<br />not a slogan.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 17, lineHeight: 1.75, margin: '0 0 28px', maxWidth: 460 }}>
            Resume, interview prep, jobs, and applications in one place. Access opens when you complete a Professional Program.
          </p>
          <div style={{ marginBottom: 32 }}>
            <FlowStrip tone="dark" steps={[
              { label: 'Professional Program' },
              { label: 'Career OS', highlight: true },
              { label: 'Applications' },
            ]} />
          </div>
          <Button variant="primary" size="lg" onClick={() => navigate('/career-os')}>Explore Career OS</Button>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ background: '#111518', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>Career OS</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Product preview</span>
            </div>
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {modules.map(m => (
                <div key={m.name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 16px' }}>
                  <div style={{ color: C.white, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{m.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, lineHeight: 1.5 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

function InstitutionsPreview() {
  const navigate = useNavigate()
  const types = [
    { name: 'Schools', photo: PHOTO.schoolBuilding },
    { name: 'Colleges', photo: PHOTO.college },
    { name: 'Universities', photo: PHOTO.university },
    { name: 'Skill / Training', photo: PHOTO.training },
    { name: 'Assessment', photo: PHOTO.assessment },
    { name: 'Industry partners', photo: PHOTO.industry },
  ]
  return (
    <Section bg={C.warmWhite}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'clamp(28px,5vw,64px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <Eyebrow>For Institutions</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(28px,3.6vw,44px)', lineHeight: 1.06, letterSpacing: '-0.025em', color: C.ink, margin: '22px 0 20px' }}>
            Enterprise education infrastructure.
          </h2>
          <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.78, margin: '0 0 28px', maxWidth: 460 }}>
            Schools, colleges, universities, training institutes, assessment bodies, and industry partners each get a different workflow — not six copies of the same card.
          </p>
          <Button variant="dark" size="lg" onClick={() => navigate('/institutions')}>Partner With Skylent</Button>
        </FadeIn>
        <FadeIn delay={80}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }} className="three-col">
            {types.map(t => (
              <button key={t.name} type="button" onClick={() => navigate('/institutions')} style={{ position: 'relative', border: 'none', padding: 0, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', height: 120, background: C.sand }}>
                <img src={t.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,13,15,0.45)' }} />
                <span style={{ position: 'absolute', left: 12, bottom: 12, color: C.white, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{t.name}</span>
              </button>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

function StoriesSection() {
  const navigate = useNavigate()
  const featured = stories[0]
  const supporting = stories.slice(1, 3)
  const photos = [PHOTO.career, PHOTO.collab, PHOTO.professional]
  return (
    <Section bg={C.ink}>
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <Eyebrow tone="dark">Stories</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.12, letterSpacing: '-0.025em', color: C.white, margin: '18px 0 0' }}>
              How the journey reads, once it is real.
            </h2>
          </div>
          <Button variant="secondary" onClick={() => navigate('/stories')}>All stories</Button>
        </div>
      </FadeIn>
      <div style={{ display: 'inline-flex', marginBottom: 28, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 12px' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Sample editorial — verified stories replace this when available</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 16 }} className="two-col">
        <FadeIn>
          <article onClick={() => navigate('/stories')} style={{ cursor: 'pointer', borderRadius: T.rCard, overflow: 'hidden', background: '#14181c' }}>
            <div style={{ aspectRatio: '16/10', position: 'relative' }}>
              <img src={photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,13,15,0.85), transparent 50%)' }} />
              <div style={{ position: 'absolute', left: 22, bottom: 22, right: 22 }}>
                <div style={{ color: C.orange, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>LEARNER STORY · SAMPLE</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: C.white, margin: 0, lineHeight: 1.2 }}>{featured.outcome} after {featured.program}</h3>
              </div>
            </div>
            <div style={{ padding: '22px 24px' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.7, margin: '0 0 14px' }}>{featured.provided}</p>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{featured.name}</div>
            </div>
          </article>
        </FadeIn>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {supporting.map((s, i) => (
            <FadeIn key={s.name} delay={80 + i * 60}>
              <article onClick={() => navigate('/stories')} style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: '140px 1fr', background: '#14181c', borderRadius: T.rCard, overflow: 'hidden', minHeight: 150 }}>
                <img src={photos[i + 1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>SAMPLE</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: C.white, fontWeight: 600, marginBottom: 8 }}>{s.outcome}</div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.55, margin: 0 }}>{s.before}</p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )
}

export default function HomePage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <>
      <Hero />
      <WhatLookingFor />
      <SkylentOS />
      <FeaturedPrograms />
      <EducationPreview />
      <SkillsPreview />
      <CareerOSShowcase />
      <InstitutionsPreview />
      <StoriesSection />
      <CTABand
        eyebrow="Get started"
        title={<>The infrastructure for<br />education and careers.</>}
        lead="Explore programs, or partner with Skylent to bring the ecosystem to your institution."
        primary={{ label: 'Explore Programs', to: '/programs' }}
        secondary={{ label: 'Partner With Us', to: '/institutions' }}
      />
      <Footer />
    </>
  )
}
