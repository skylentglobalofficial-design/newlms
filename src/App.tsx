import { useState, useEffect } from 'react'
// Visual realism pass — no abstract AI decorations on public pages
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { C, FadeIn, Nav, Footer, globalCSS } from './components/shared'
import { Section, SectionHeader, Eyebrow, Button, Badge, Card, PillarCard, FlowStrip, CTABand, T } from './components/ui'
import { stories, programs } from './data'
import { AuthProvider } from './context/AuthContext'
import EducationPage from './pages/EducationPage'
import OSPage from './pages/OSPage'
import InstitutionsPage from './pages/InstitutionsPage'
import UniversitiesPage from './pages/UniversitiesPage'
import LabsPage from './pages/LabsPage'
import StoriesPage from './pages/StoriesPage'
import AboutPage from './pages/AboutPage'
import ProgramPage from './pages/ProgramPage'
import ProgramsPage from './pages/ProgramsPage'
import SkillsPage from './pages/SkillsPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import WorkshopsPage from './pages/WorkshopsPage'
import WorkshopDetailPage from './pages/WorkshopDetailPage'
import CareerOSPage from './pages/CareerOSPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import DashboardStudentPage from './pages/DashboardStudentPage'
import DashboardFacultyPage from './pages/DashboardFacultyPage'
import DashboardOrgPage from './pages/DashboardOrgPage'
import DashboardRecruiterPage from './pages/DashboardRecruiterPage'
import DashboardAdminPage from './pages/DashboardAdminPage'
import LearnPage from './pages/LearnPage'

// ─── PHOTO URLS ───────────────────────────────────────────────────────────────
const PHOTOS = {
  heroClassroom: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=900&fit=crop&auto=format',
  teacherStudents: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=900&h=700&fit=crop&auto=format',
  groupLearning: 'https://images.unsplash.com/photo-1573164574511-73c773193279?w=900&h=700&fit=crop&auto=format',
  mentorSession: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=900&h=700&fit=crop&auto=format',
  analyticsLaptop: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=600&fit=crop&auto=format',
  workshopRoom: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=900&h=600&fit=crop&auto=format',
}

// ─── 1. HERO ──────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate()
  return (
    <section style={{ background: C.ink, minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 64 }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto', padding: `clamp(60px,9vw,100px) ${T.gutter}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,64px)', alignItems: 'center', width: '100%' }} className="hero-grid">
        <div>
          <FadeIn>
            <Eyebrow tone="dark">Education · Skills · Career OS</Eyebrow>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(44px, 6vw, 86px)', lineHeight: 0.97, color: C.white, margin: '28px 0 26px', letterSpacing: '-0.04em' }}>
              From education<br />to <span style={{ color: C.orange }}>employability.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={160}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(16px,2vw,18px)', lineHeight: 1.75, maxWidth: 480, margin: '0 0 40px' }}>
              Skylent is one connected platform — spanning academic education, career-ready skills, and a dedicated operating system for your career. One journey, built end to end.
            </p>
          </FadeIn>
          <FadeIn delay={240}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={() => navigate('/programs')}>Explore Programs →</Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/career-os')}>Explore Career OS</Button>
            </div>
          </FadeIn>
          <FadeIn delay={340}>
            <div style={{ display: 'flex', gap: 'clamp(24px,4vw,48px)', marginTop: 52, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.09)', flexWrap: 'wrap' }}>
              {[
                { label: '11 months', sub: 'Longest program' },
                { label: 'Live + async', sub: 'Flexible learning' },
                { label: 'Career OS', sub: 'Unlocked on completion' },
              ].map(({ label, sub }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.white, letterSpacing: '-0.02em' }}>{label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 5, letterSpacing: '0.04em' }}>{sub}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Editorial photo — real learning environment */}
        <FadeIn delay={180}>
          <div className="hero-visual" style={{ position: 'relative', borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '4/3', background: '#1a1f24' }}>
            <img
              src={PHOTOS.heroClassroom}
              alt="Students engaged in a workshop session"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88, display: 'block' }}
            />
            {/* Gradient vignette blending into ink */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(11,13,15,0.18) 0%, transparent 40%, transparent 70%, rgba(11,13,15,0.22) 100%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(11,13,15,0.72), transparent)' }} />
            {/* Caption strip */}
            <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500 }}>Professional Program · Live cohort in progress</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── 2. WHAT ARE YOU LOOKING FOR? ─────────────────────────────────────────────
const INTENT_PHOTOS = {
  learn: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&h=500&fit=crop&auto=format',
  skills: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=700&h=500&fit=crop&auto=format',
  prepare: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=700&h=500&fit=crop&auto=format',
  career: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&h=500&fit=crop&auto=format',
}

function WhatLookingFor() {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)

  const intents = [
    {
      label: 'Learn',
      tagline: 'Academic programs from school to postgraduate.',
      sub: 'Schooling · Undergraduate · Postgraduate',
      photo: INTENT_PHOTOS.learn,
      photoAlt: 'Students learning in a classroom',
      desc: 'Structured academic programs from school through postgraduate — building the qualifications and foundations you need.',
      exams: null as null | string[],
      to: '/education',
    },
    {
      label: 'Build Skills',
      tagline: 'Credentialed upskilling that unlocks Career OS.',
      sub: 'Webinars · Certificate · Professional Programs',
      photo: INTENT_PHOTOS.skills,
      photoAlt: 'Professionals in a learning workshop',
      desc: 'From a single webinar to a full Professional Program. Skills is where learning becomes a credential — and a credential becomes a career.',
      exams: null,
      to: '/skills',
    },
    {
      label: 'Prepare',
      tagline: 'Performance-first exam preparation.',
      sub: 'JEE · NEET · CAT · Competitive Exams',
      photo: INTENT_PHOTOS.prepare,
      photoAlt: 'Student focused on study preparation',
      desc: 'Subject-level practice, mock tests, performance analytics, and expert guidance — structured around the exam pattern.',
      exams: ['JEE', 'NEET', 'CAT', 'CUET', 'CLAT', 'GMAT'],
      to: '/education#competitive-exams',
    },
    {
      label: 'Build Your Career',
      tagline: 'Your career, as an operating system.',
      sub: 'Career OS · Interview Prep · Job Board',
      photo: INTENT_PHOTOS.career,
      photoAlt: 'Professional in a career development session',
      desc: 'Interview preparation and a curated job board — a dedicated operating system for your career. Activated on completing a Professional Program.',
      exams: null,
      to: '/career-os',
    },
  ]

  const current = intents[active]

  return (
    <Section bg={C.warmWhite}>
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Eyebrow>Get started</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(26px,3.2vw,40px)', lineHeight: 1.1, letterSpacing: '-0.025em', color: C.ink, margin: '18px 0 0' }}>
              What are you looking to do?
            </h2>
          </div>
        </div>
      </FadeIn>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,48px)', alignItems: 'start' }} className="two-col">
        {/* Left: tab list */}
        <FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {intents.map((intent, i) => {
              const isActive = active === i
              return (
                <button
                  key={intent.label}
                  onClick={() => { setActive(i); navigate(intent.to) }}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '20px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: `1px solid ${T.lineLight}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    alignItems: 'flex-start',
                    transition: 'opacity 0.15s',
                    opacity: isActive ? 1 : 0.65,
                  }}
                >
                  <div style={{ width: 3, alignSelf: 'stretch', background: isActive ? C.orange : 'transparent', borderRadius: 2, flexShrink: 0, transition: 'background 0.2s' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, letterSpacing: '-0.02em' }}>{intent.label}</span>
                      <span style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{intent.sub}</span>
                    </div>
                    {isActive && (
                      <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.65, margin: 0, maxWidth: 380 }}>{intent.desc}</p>
                    )}
                    {isActive && intent.exams && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {intent.exams.map(e => (
                          <span key={e} style={{ background: 'rgba(243,107,33,0.08)', border: '1px solid rgba(243,107,33,0.2)', borderRadius: 5, padding: '3px 9px', color: C.orange, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{e}</span>
                        ))}
                      </div>
                    )}
                    {isActive && (
                      <div style={{ marginTop: 12, color: C.orange, fontSize: 13, fontWeight: 600 }}>Explore →</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </FadeIn>

        {/* Right: editorial photo */}
        <FadeIn delay={80}>
          <div style={{ position: 'sticky', top: 88 }}>
            <div style={{ borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '4/3', background: C.sand, position: 'relative' }}>
              <img
                key={current.photo}
                src={current.photo}
                alt={current.photoAlt}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.4s ease' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,13,15,0.65) 0%, transparent 50%)' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 22, right: 22 }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 5 }}>SKYLENT — {current.label.toUpperCase()}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.white, letterSpacing: '-0.015em', lineHeight: 1.25 }}>{current.tagline}</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── 3. FEATURED PROGRAMS ─────────────────────────────────────────────────────
function FeaturedPrograms() {
  const navigate = useNavigate()
  const featured = programs.slice(0, 4)
  const programColors: Record<string, string> = {
    'data-science-ai': '#1a2a3a',
    'data-analytics-pro': '#1a2a1a',
    'full-stack': '#1a1a2a',
    'generative-ai-program': '#2a1a1a',
  }
  return (
    <Section bg={C.sand}>
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <Eyebrow>Featured Programs</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.1, letterSpacing: '-0.025em', color: C.ink, margin: '18px 0 0' }}>
              Career-ready. Industry-built.
            </h2>
          </div>
          <Button variant="ghost" onClick={() => navigate('/programs')}>View all programs →</Button>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="programs-grid">
        {featured.map((prog, i) => (
          <FadeIn key={prog.slug} delay={i * 70}>
            <div
              onClick={() => navigate(`/programs/${prog.slug}`)}
              style={{ background: programColors[prog.slug] ?? '#1a1f24', borderRadius: T.rCard, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.22s, box-shadow 0.22s', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ padding: 28 }}>
                {/* Program type + outcome */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(243,107,33,0.15)', border: '1px solid rgba(243,107,33,0.3)', borderRadius: 6, padding: '4px 10px', color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>PROFESSIONAL PROGRAM</span>
                  <span style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: '4px 10px', color: 'rgba(255,255,255,0.55)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>UNLOCKS CAREER OS</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,2.4vw,26px)', fontWeight: 600, color: C.white, margin: '0 0 10px', letterSpacing: '-0.02em' }}>{prog.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, lineHeight: 1.65, margin: '0 0 22px' }}>{prog.desc}</p>
                {/* Metadata row */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {[
                    { k: 'Duration', v: prog.duration },
                    { k: 'Format', v: prog.format },
                    { k: 'Outcome', v: prog.outcome },
                  ].map(({ k, v }) => (
                    <div key={k}>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 3 }}>{k.toUpperCase()}</div>
                      <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: 500 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Card footer */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>NEXT BATCH</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}>{prog.upcomingBatch}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>STARTING FROM</div>
                  <div style={{ color: C.white, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>₹{prog.pricing[0].price.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}

// ─── 4. SKYLENT OS — CONTINUOUS JOURNEY ─────────────────────────────────────
function SkylentOS() {
  const navigate = useNavigate()
  const stages = [
    {
      name: 'Education',
      bridge: 'learning',
      tagline: 'Schooling, undergraduate, postgraduate, and competitive exam preparation — the academic foundation.',
      items: ['Schooling', 'Undergraduate', 'Postgraduate', 'Competitive Exams'],
      to: '/education',
    },
    {
      name: 'Skills',
      bridge: 'capability',
      tagline: 'Webinars, certificate programs, and professional programs that build real, credentialed skills. Professional Programs unlock Career OS.',
      items: ['Webinars', 'Certificate Programs', 'Professional Programs', 'Job Assistance'],
      to: '/skills',
      accent: true,
    },
    {
      name: 'Career OS',
      bridge: 'opportunity',
      tagline: 'Interview preparation and a curated job board — a dedicated operating system for your career. Activated by Professional Programs.',
      items: ['Interview Preparation', 'Job Board'],
      to: '/career-os',
    },
  ]
  return (
    <Section bg={C.ink} id="skylent-os">
      <FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'end', marginBottom: 72 }} className="two-col">
          <div>
            <Eyebrow tone="dark">Skylent OS</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(30px,4vw,52px)', lineHeight: 1.04, letterSpacing: '-0.03em', color: C.white, margin: '20px 0 0' }}>
              One ecosystem.<br />Every stage of the journey.
            </h2>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.44)', fontSize: 17, lineHeight: 1.78, margin: 0 }}>
            From the first lesson to the first offer — Education, Skills, and Career OS form a single continuous path. Each stage feeds the next.
          </p>
        </div>
      </FadeIn>

      {/* Vertical journey */}
      <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '0 32px' }}>
        {stages.map((stage, i) => (
          <FadeIn key={stage.name} delay={i * 100}>
            {/* Left: connector line + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {i > 0 && <div style={{ width: 1, flex: '0 0 40px', background: 'rgba(255,255,255,0.12)' }} />}
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: stage.accent ? C.orange : 'rgba(255,255,255,0.25)', border: `2px solid ${stage.accent ? C.orange : 'rgba(255,255,255,0.18)'}`, flexShrink: 0, zIndex: 1 }} />
              {i < stages.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minHeight: 48 }}>
                  <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.12)' }} />
                </div>
              )}
            </div>
            {/* Right: stage content + bridge word below */}
            <div style={{ paddingBottom: i < stages.length - 1 ? 0 : 0 }}>
              <div
                onClick={() => navigate(stage.to)}
                style={{
                  cursor: 'pointer',
                  background: stage.accent ? 'rgba(243,107,33,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${stage.accent ? 'rgba(243,107,33,0.22)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: T.rCard,
                  padding: 'clamp(24px,3vw,36px)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '16px 32px',
                  alignItems: 'start',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = stage.accent ? 'rgba(243,107,33,0.45)' : 'rgba(255,255,255,0.18)'
                  e.currentTarget.style.background = stage.accent ? 'rgba(243,107,33,0.09)' : 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = stage.accent ? 'rgba(243,107,33,0.22)' : 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.background = stage.accent ? 'rgba(243,107,33,0.06)' : 'rgba(255,255,255,0.03)'
                }}
              >
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 600, color: stage.accent ? C.orange : C.white, margin: '0 0 10px', letterSpacing: '-0.025em' }}>{stage.name}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 15, lineHeight: 1.65, margin: '0 0 20px', maxWidth: 520 }}>{stage.tagline}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {stage.items.map(item => (
                      <span key={item} style={{ background: stage.accent ? 'rgba(243,107,33,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${stage.accent ? 'rgba(243,107,33,0.2)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, padding: '5px 12px', color: stage.accent ? C.orange : 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{item}</span>
                    ))}
                  </div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 20, marginTop: 4, flexShrink: 0 }}>↗</span>
              </div>
              {/* Bridge word between stages */}
              {i < stages.length - 1 && (
                <div style={{ padding: '14px 0 14px clamp(24px,3vw,36px)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>{stage.bridge}</span>
                </div>
              )}
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={320}>
        <div style={{ marginTop: 44, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" size="lg" onClick={() => navigate('/os')}>Explore the full ecosystem →</Button>
        </div>
      </FadeIn>
    </Section>
  )
}

// ─── 5. EDUCATION PREVIEW ─────────────────────────────────────────────────────
function EducationPreview() {
  const navigate = useNavigate()
  const paths = [
    { name: 'Schooling', desc: 'Foundational academic programs that build curiosity, rigour and lifelong habits.', anchor: 'schooling' },
    { name: 'Undergraduate', desc: 'Degree-aligned programs pairing academic depth with industry relevance.', anchor: 'undergraduate' },
    { name: 'Postgraduate', desc: 'Advanced specialisation for leadership, research and career acceleration.', anchor: 'postgraduate' },
    { name: 'Competitive Exams', desc: 'Structured preparation for JEE, NEET, CAT and future entrance exams.', anchor: 'competitive-exams', highlight: true },
  ]
  return (
    <Section bg={C.warmWhite}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px,6vw,80px)', alignItems: 'start' }} className="two-col">
        {/* Photo */}
        <FadeIn>
          <div style={{ borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '4/3', background: C.sand, position: 'sticky', top: 80 }}>
            <img src={PHOTOS.teacherStudents} alt="Teacher with students in a learning environment" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </FadeIn>
        {/* Text */}
        <FadeIn delay={100}>
          <div>
            <Eyebrow>Education</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.12, letterSpacing: '-0.025em', color: C.ink, margin: '22px 0 20px' }}>
              Education that grows with you.
            </h2>
            <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.8, margin: '0 0 32px' }}>
              Four distinct learning pathways — each with its own experience, curriculum model, and progression logic. Not one-size-fits-all.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 36 }}>
              {paths.map(({ name, desc, anchor, highlight }) => (
                <div
                  key={name}
                  onClick={() => navigate(`/education#${anchor}`)}
                  style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: `1px solid ${T.lineLight}`, cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: highlight ? C.orange : C.ink, marginTop: 8, flexShrink: 0, opacity: highlight ? 1 : 0.35 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.ink }}>{name}</span>
                      {highlight && <span style={{ background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.22)', borderRadius: 4, padding: '1px 7px', color: C.orange, fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>NEW</span>}
                    </div>
                    <div style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.6 }}>{desc}</div>
                  </div>
                  <span style={{ color: C.slate, fontSize: 16, marginTop: 2, opacity: 0.4 }}>→</span>
                </div>
              ))}
            </div>
            <Button variant="ghost" onClick={() => navigate('/education')}>Explore Education →</Button>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── 6. SKILLS PREVIEW ────────────────────────────────────────────────────────
function SkillsPreview() {
  const navigate = useNavigate()
  const minor = [
    { name: 'Webinars', desc: 'Live, expert-led sessions on emerging topics. Open to all.', to: '/workshops' },
    { name: 'Certificate Programs', desc: 'Focused, credentialed skill tracks for targeted upskilling.', to: '/programs' },
    { name: 'Job Assistance', desc: 'Placement readiness, resume support, and career guidance.', to: '/skills#job-assistance' },
  ]
  return (
    <Section bg={C.sand}>
      <FadeIn>
        <div style={{ marginBottom: 48 }}>
          <Eyebrow>Pillar 02 — Skills</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.12, letterSpacing: '-0.025em', color: C.ink, margin: '20px 0 16px' }}>
            Learn something useful.<br />Build something real.
          </h2>
          <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.75, maxWidth: 560, margin: 0 }}>
            From a single webinar to a full Professional Program — Skills is where learning becomes a credential, and a credential becomes a career.
          </p>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 16, alignItems: 'start' }} className="skills-grid">
        {/* Professional Programs — featured */}
        <FadeIn>
          <div
            onClick={() => navigate('/programs')}
            style={{ cursor: 'pointer', background: C.ink, borderRadius: T.rCard, overflow: 'hidden', transition: 'transform 0.22s', border: `1px solid rgba(243,107,33,0.2)` }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
          >
            {/* Photo header */}
            <div style={{ height: 220, background: '#1a2330', overflow: 'hidden', position: 'relative' }}>
              <img src={PHOTOS.groupLearning} alt="Professionals learning together" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(11,13,15,0.85))' }} />
              <div style={{ position: 'absolute', top: 18, left: 20 }}>
                <Badge tone="dark" accent>Unlocks Career OS</Badge>
              </div>
            </div>
            <div style={{ padding: '24px 28px 28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,2.8vw,32px)', fontWeight: 600, color: C.white, margin: '0 0 12px', letterSpacing: '-0.025em' }}>Professional Programs</h3>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, lineHeight: 1.7, margin: '0 0 24px' }}>
                Deep, project-driven programs built around real outcomes. Completing one grants full access to Career OS — interview preparation, job board, and placement support.
              </p>
              <FlowStrip tone="dark" steps={[{ label: 'Professional Program' }, { label: 'Career OS Access', highlight: true }]} />
              <div style={{ marginTop: 22, color: C.orange, fontSize: 13, fontWeight: 600 }}>Browse programs →</div>
            </div>
          </div>
        </FadeIn>
        {/* Minor skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {minor.map((m, i) => (
            <FadeIn key={m.name} delay={i * 70}>
              <div
                onClick={() => navigate(m.to)}
                style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: 22, cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.lineLight; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.ink, margin: '0 0 8px' }}>{m.name}</h4>
                  <span style={{ color: C.orange, fontSize: 16, marginTop: 2 }}>→</span>
                </div>
                <p style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
              </div>
            </FadeIn>
          ))}
          <FadeIn delay={250}>
            <Button variant="ghost" onClick={() => navigate('/skills')} style={{ alignSelf: 'flex-start', marginTop: 4 }}>All Skills →</Button>
          </FadeIn>
        </div>
      </div>
    </Section>
  )
}

// ─── 7. CAREER OS SHOWCASE ────────────────────────────────────────────────────
function CareerOSShowcase() {
  const navigate = useNavigate()
  return (
    <Section bg={C.ink}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px,6vw,80px)', alignItems: 'center' }} className="two-col">
        <FadeIn>
          <div>
            <Eyebrow tone="dark" accent>Pillar 03 — Career OS</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(30px,4vw,52px)', lineHeight: 1.04, letterSpacing: '-0.03em', color: C.white, margin: '24px 0 20px' }}>
              Your career,<br />as an operating system.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 17, lineHeight: 1.75, margin: '0 0 30px', maxWidth: 460 }}>
              Interview preparation and a curated job board, working together in one place. Career OS unlocks automatically when you complete a Professional Program.
            </p>
            <div style={{ marginBottom: 32 }}>
              <FlowStrip tone="dark" steps={[
                { label: 'Professional Program', sub: 'Complete' },
                { label: 'Access Granted', sub: 'Automatic', highlight: true },
                { label: 'Career OS', sub: 'Interview + Jobs' },
              ]} />
            </div>
            <Button variant="primary" size="lg" onClick={() => navigate('/career-os')}>Explore Career OS →</Button>
          </div>
        </FadeIn>

        {/* Real product dashboard mockup */}
        <FadeIn delay={140}>
          <div style={{ background: '#111518', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
            {/* Titlebar */}
            <div style={{ background: '#0d1014', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 5 }}>{['#f87171', '#fbbf24', '#4ade80'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.8 }} />)}</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', marginLeft: 6 }}>Career OS — Dashboard</div>
            </div>
            <div style={{ padding: 20 }}>
              {/* Welcome row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 4 }}>WELCOME BACK</div>
                  <div style={{ color: C.white, fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 600 }}>Arjun Sharma</div>
                </div>
                <div style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 8, padding: '6px 12px' }}>
                  <div style={{ color: '#4ade80', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Career OS Active</div>
                </div>
              </div>
              {/* Progress cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Interview Prep', value: '12 sessions', progress: 75, color: C.orange },
                  { label: 'Mock Interviews', value: '4 completed', progress: 40, color: '#60a5fa' },
                  { label: 'Resume', value: 'ATS ready', progress: 100, color: '#4ade80' },
                  { label: 'Applications', value: '7 active', progress: 58, color: '#a78bfa' },
                ].map(({ label, value, progress, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 5, letterSpacing: '0.06em' }}>{label.toUpperCase()}</div>
                    <div style={{ color: C.white, fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{value}</div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Top job match */}
              <div style={{ background: 'rgba(243,107,33,0.08)', border: '1px solid rgba(243,107,33,0.2)', borderRadius: 10, padding: 14 }}>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 8, letterSpacing: '0.08em' }}>JOB BOARD — TOP MATCH</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>Data Analyst</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>Bangalore · ₹8–12 LPA</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: C.orange, fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>94%</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>match</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['SQL', 'Python', 'Power BI'].map(s => (
                    <span key={s} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 4, padding: '3px 8px', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── 8. INSTITUTIONS PREVIEW ──────────────────────────────────────────────────
function InstitutionsPreview() {
  const navigate = useNavigate()
  const capabilities = [
    { label: 'Curriculum support', desc: 'Industry-aligned syllabus enrichment and program co-design.' },
    { label: 'Skills development', desc: 'Webinars, certificate programs, and professional programs for students.' },
    { label: 'Career readiness', desc: 'End-to-end placement preparation embedded into the program.' },
    { label: 'Career OS access', desc: 'Unlock Career OS for qualifying students on Professional Programs.' },
    { label: 'Industry alignment', desc: "Real employer partnerships and hiring pathways for your institution's learners." },
  ]
  return (
    <Section bg={C.warmWhite}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px,6vw,80px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <div>
            <Eyebrow>For Institutions</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(28px,3.6vw,44px)', lineHeight: 1.06, letterSpacing: '-0.025em', color: C.ink, margin: '22px 0 20px' }}>
              An education and industry technology partner.
            </h2>
            <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.78, margin: '0 0 36px', maxWidth: 480 }}>
              Universities, colleges and schools use Skylent to deliver industry-aligned learning, professional programs, career readiness, and Career OS — as infrastructure, not an add-on.
            </p>
            <Button variant="dark" size="lg" onClick={() => navigate('/institutions')}>Partner With Skylent →</Button>
          </div>
        </FadeIn>
        <FadeIn delay={120}>
          <div>
            {capabilities.map(({ label, desc }, i) => (
              <div key={label} style={{ display: 'flex', gap: 16, padding: '18px 0', borderBottom: i < capabilities.length - 1 ? `1px solid ${T.lineLight}` : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 4 }}>{label}</div>
                  <div style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── 9. STORIES / TRUST (editorial layout) ───────────────────────────────────
const STORY_PHOTOS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format',
]

function StoriesSection() {
  const navigate = useNavigate()
  const featured = stories[0]
  const supporting = stories.slice(1, 3)

  return (
    <Section bg={C.ink}>
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <Eyebrow tone="dark">Stories</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.12, letterSpacing: '-0.025em', color: C.white, margin: '18px 0 0' }}>
              Outcomes, once they are real.
            </h2>
          </div>
          <Button variant="secondary" onClick={() => navigate('/stories')}>View all stories →</Button>
        </div>
      </FadeIn>

      <FadeIn delay={40}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 12px', marginBottom: 32 }}>
          <Badge tone="dark">Sample content — verified stories will replace these</Badge>
        </div>
      </FadeIn>

      {/* Editorial layout: featured (large) + 2 supporting */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }} className="two-col">
        {/* Featured story — large */}
        <FadeIn delay={60}>
          <div
            onClick={() => navigate('/stories')}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: T.rCard, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
          >
            {/* Photo */}
            <div style={{ aspectRatio: '16/9', overflow: 'hidden', position: 'relative', background: '#1a2330' }}>
              <img src={STORY_PHOTOS[0]} alt={`${featured.name} — learner story`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.82 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(11,13,15,0.8))' }} />
              <div style={{ position: 'absolute', top: 16, left: 16 }}>
                <span style={{ background: 'rgba(243,107,33,0.9)', borderRadius: 5, padding: '4px 10px', color: C.white, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>FEATURED STORY</span>
              </div>
            </div>
            {/* Content */}
            <div style={{ padding: '24px 26px 28px' }}>
              <div style={{ fontSize: 28, color: C.orange, fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 12, opacity: 0.6 }}>"</div>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, lineHeight: 1.72, margin: '0 0 20px', fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic' }}>
                {featured.provided}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(243,107,33,0.18)', border: '1px solid rgba(243,107,33,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.orange, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{featured.initials}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: C.white, fontWeight: 600 }}>{featured.name}</div>
                  <div style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '0.04em' }}>{featured.outcome}</div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Supporting stories — stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {supporting.map((s, i) => (
            <FadeIn key={s.name} delay={120 + i * 80}>
              <div
                onClick={() => navigate('/stories')}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: T.rCard, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s', display: 'grid', gridTemplateColumns: '140px 1fr' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                {/* Small photo */}
                <div style={{ background: '#1a2330', overflow: 'hidden', position: 'relative' }}>
                  <img src={STORY_PHOTOS[i + 1]} alt={`${s.name} — learner story`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.75 }} />
                </div>
                {/* Content */}
                <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.68, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {s.provided}
                  </p>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: C.white, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '0.04em' }}>{s.outcome}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── 10. FINAL CTA ────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <CTABand
      eyebrow="Get started"
      title={<>The infrastructure for<br />education and careers.</>}
      lead="Explore our programs, or partner with us to bring Skylent to your institution."
      primary={{ label: 'Explore Programs', to: '/programs' }}
      secondary={{ label: 'Partner With Us', to: '/institutions' }}
    />
  )
}

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
function HomePage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <>
      <Hero />
      <WhatLookingFor />
      <FeaturedPrograms />
      <SkylentOS />
      <EducationPreview />
      <SkillsPreview />
      <CareerOSShowcase />
      <InstitutionsPreview />
      <StoriesSection />
      <FinalCTA />
      <Footer />
    </>
  )
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<><Nav /><HomePage /></>} />
      {/* Pillar hubs */}
      <Route path="/education" element={<EducationPage />} />
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/career-os" element={<CareerOSPage />} />
      <Route path="/institutions" element={<InstitutionsPage />} />
      {/* Skylent OS product gateway */}
      <Route path="/os" element={<OSPage />} />
      {/* Catalog (functional sub-listings, preserved) */}
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/programs/:slug" element={<ProgramPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:slug" element={<CourseDetailPage />} />
      <Route path="/workshops" element={<WorkshopsPage />} />
      <Route path="/workshops/:slug" element={<WorkshopDetailPage />} />
      {/* Company */}
      <Route path="/stories" element={<StoriesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/contact" element={<ContactPage />} />
      {/* Auth (untouched) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage />} />
      {/* Dashboards + LMS (untouched) */}
      <Route path="/dashboard/student" element={<DashboardStudentPage />} />
      <Route path="/dashboard/faculty" element={<DashboardFacultyPage />} />
      <Route path="/dashboard/organisation" element={<DashboardOrgPage />} />
      <Route path="/dashboard/recruiter" element={<DashboardRecruiterPage />} />
      <Route path="/dashboard/admin" element={<DashboardAdminPage />} />
      <Route path="/learn/:slug" element={<LearnPage />} />
      <Route path="/learn/:slug/:lessonId" element={<LearnPage />} />
      {/* Legacy redirects — no dead links */}
      <Route path="/career" element={<Navigate to="/career-os" replace />} />
      <Route path="/universities" element={<UniversitiesPage />} />
      <Route path="/labs" element={<LabsPage />} />
      <Route path="/jobs" element={<Navigate to="/career-os" replace />} />
      <Route path="/jobs/:id" element={<Navigate to="/career-os" replace />} />
      <Route path="*" element={<><Nav /><div style={{ paddingTop: 120, textAlign: 'center', background: C.warmWhite, minHeight: '100vh' }}><h2 style={{ fontFamily: 'var(--font-display)', color: C.ink }}>Page not found</h2><Link to="/" style={{ color: C.orange }}>← Back to home</Link></div><Footer /></>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <style>{globalCSS}</style>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
