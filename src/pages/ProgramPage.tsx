import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { C, FadeIn, EnrollmentModal, PageShell } from '../components/shared'
import { T } from '../components/ui'
import { programs, stories } from '../data'
import type { ProgramType, EnrollmentStatus } from '../data'

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ProgramType, string> = {
  PROFESSIONAL: 'Professional Program',
  CERTIFICATE: 'Certificate Program',
  WEBINAR: 'Webinar',
  EXAM_PREP: 'Exam Preparation',
  SCHOOLING: 'Schooling',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate',
}

const CTA_LABEL: Record<EnrollmentStatus, string> = {
  open: 'Apply Now',
  waitlist: 'Join Waitlist',
  coming_soon: 'Register Interest',
}

const PROGRAM_PHOTOS: Record<string, string> = {
  'data-science-ai': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=560&fit=crop&auto=format',
  'data-analytics-pro': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=560&fit=crop&auto=format',
  'full-stack': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=560&fit=crop&auto=format',
  'generative-ai-program': 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=560&fit=crop&auto=format',
}
const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=560&fit=crop&auto=format'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function MonoLabel({ children, tone = 'light' }: { children: React.ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <div style={{
      color: tone === 'dark' ? 'rgba(255,255,255,0.3)' : C.slate,
      fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em',
      marginBottom: 14, textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

function CheckItem({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <rect width="16" height="16" rx="4" fill={dark ? 'rgba(243,107,33,0.15)' : 'rgba(243,107,33,0.1)'} stroke="rgba(243,107,33,0.3)" strokeWidth="0.8" />
        <path d="M4.5 8.5L7 11L11.5 5.5" stroke={C.orange} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ color: dark ? 'rgba(255,255,255,0.72)' : C.ink, fontSize: 13.5, lineHeight: 1.55 }}>{label}</span>
    </div>
  )
}

// ─── STICKY SECTION NAV ───────────────────────────────────────────────────────

type NavSection = { id: string; label: string }

function StickyProgramNav({
  sections,
  activeId,
  ctaLabel,
  onCTA,
}: {
  sections: NavSection[]
  activeId: string
  ctaLabel: string
  onCTA: () => void
}) {
  return (
    <nav style={{
      position: 'sticky',
      top: 64,
      zIndex: 80,
      background: 'rgba(11,13,15,0.97)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{
        maxWidth: T.maxW,
        margin: '0 auto',
        padding: '0 clamp(16px,4vw,32px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => {
                const el = document.getElementById(s.id)
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 120
                  window.scrollTo({ top: y, behavior: 'smooth' })
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeId === s.id ? C.orange : 'transparent'}`,
                padding: '14px 14px',
                color: activeId === s.id ? C.orange : 'rgba(255,255,255,0.42)',
                fontSize: 12.5,
                fontFamily: 'var(--font-body)',
                fontWeight: activeId === s.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'color 0.2s, border-color 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (activeId !== s.id) e.currentTarget.style.color = 'rgba(255,255,255,0.72)' }}
              onMouseLeave={e => { if (activeId !== s.id) e.currentTarget.style.color = 'rgba(255,255,255,0.42)' }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={onCTA}
          style={{
            flexShrink: 0,
            background: C.orange,
            border: 'none',
            color: C.white,
            borderRadius: 7,
            padding: '8px 18px',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {ctaLabel} →
        </button>
      </div>
    </nav>
  )
}

// ─── ENROLLMENT CARD (hero right panel) ───────────────────────────────────────

function EnrollmentCard({
  program,
  status,
  ctaLabel,
  onCTA,
}: {
  program: ReturnType<typeof programs.find> & object
  status: EnrollmentStatus
  ctaLabel: string
  onCTA: () => void
}) {
  if (!program) return null
  const lowestPrice = Math.min(...program.pricing.map(p => p.price))
  const isCareerOS = !!program.careerSupport

  return (
    <div style={{
      background: C.white,
      borderRadius: T.rCard,
      overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.12)',
    }}>
      {/* Price band */}
      <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${T.lineLight}` }}>
        <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 6 }}>STARTING FROM</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1 }}>
            ₹{lowestPrice.toLocaleString('en-IN')}
          </div>
          {program.pricing[0]?.originalPrice > lowestPrice && (
            <div style={{ color: C.slate, fontSize: 13, textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>
              ₹{program.pricing[0].originalPrice.toLocaleString('en-IN')}
            </div>
          )}
        </div>
        {program.pricing.length > 1 && (
          <div style={{ color: C.slate, fontSize: 11, marginTop: 4 }}>Multiple plans available below</div>
        )}
      </div>

      {/* Key facts */}
      <div style={{ padding: '16px 24px 4px', borderBottom: `1px solid ${T.lineLight}` }}>
        {[
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.slate} strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            ),
            text: `${status === 'coming_soon' ? 'Planned: ' : 'Next batch: '}${program.upcomingBatch}`,
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.slate} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ),
            text: `${program.duration} · ${program.format}`,
          },
          {
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.slate} strokeWidth="1.8"><circle cx="12" cy="8" r="6"/><path d="M8.5 14.5L6 22l6-2 6 2-2.5-7.5"/></svg>
            ),
            text: program.cert,
          },
          ...(isCareerOS ? [{
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><polyline points="16 21 12 17 8 21"/><path d="M12 3v14"/></svg>
            ),
            text: 'Unlocks Career OS on completion',
            accent: true,
          }] : []),
        ].map(({ icon, text, accent }, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
            <span style={{ color: (accent as boolean | undefined) ? C.orange : C.ink, fontSize: 13, lineHeight: 1.45, fontWeight: (accent as boolean | undefined) ? 500 : 400 }}>{text}</span>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ padding: '18px 24px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={onCTA}
          style={{
            width: '100%',
            background: status === 'coming_soon' ? C.ink : C.orange,
            border: 'none',
            color: C.white,
            borderRadius: 9,
            padding: '13px 0',
            fontSize: 14.5,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {ctaLabel} →
        </button>
        <a
          href="/contact"
          style={{ display: 'block', textAlign: 'center', color: C.slate, fontSize: 13, textDecoration: 'none', padding: '6px 0', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
          onMouseLeave={e => (e.currentTarget.style.color = C.slate)}
        >
          Talk to an advisor
        </a>
      </div>

      {/* Trust strip */}
      <div style={{ background: C.sand, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.slate} strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span style={{ color: C.slate, fontSize: 11 }}>Secure enrollment · Verified certificate</span>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ProgramPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const program = programs.find(p => p.slug === slug)

  const [curriculumOpen, setCurriculumOpen] = useState<string | null>(null)
  const [faqOpen, setFaqOpen] = useState<string | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  const isExamPrep = program?.programType === 'EXAM_PREP'
  const isCareerOS = !!program?.careerSupport
  const enrollStatus = (program?.enrollmentStatus ?? 'open') as EnrollmentStatus
  const ctaLabel = CTA_LABEL[enrollStatus]
  const typeLabel = program ? TYPE_LABELS[program.programType] : ''
  const heroPhoto = program ? (PROGRAM_PHOTOS[program.slug] ?? DEFAULT_PHOTO) : DEFAULT_PHOTO

  // Build nav sections based on available data
  const navSections: NavSection[] = program ? [
    { id: 'overview', label: 'Overview' },
    ...(program.curriculumDetail?.length ? [{ id: 'curriculum', label: 'Curriculum' }] : []),
    ...(program.projectsDetail?.length ? [{ id: 'projects', label: 'Projects' }] : []),
    ...(program.learningExperience?.length ? [{ id: 'experience', label: 'Learning' }] : []),
    ...(program.faculty?.length ? [{ id: 'faculty', label: 'Faculty' }] : []),
    ...(isCareerOS ? [{ id: 'career', label: 'Career' }] : []),
    ...(!isExamPrep ? [{ id: 'reviews', label: 'Reviews' }] : []),
    ...(program.faqs?.length ? [{ id: 'faq', label: 'FAQs' }] : []),
  ] : []

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    navSections.forEach(s => {
      const el = document.getElementById(s.id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(s.id) },
        { rootMargin: '-20% 0px -68% 0px', threshold: 0 },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [program?.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!program) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.warmWhite }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: C.ink, fontSize: 28 }}>Program not found</h2>
          <button onClick={() => navigate('/programs')} style={{ marginTop: 16, background: C.orange, border: 'none', color: C.white, borderRadius: 7, padding: '10px 22px', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>← All Programs</button>
        </div>
      </div>
    )
  }

  const lowestPrice = Math.min(...program.pricing.map(p => p.price))
  const highlightTier = program.pricing.find(p => p.highlight) ?? program.pricing[0]

  return (
    <PageShell>
      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section id="program-hero" style={{ background: C.ink, padding: '88px clamp(16px,4vw,32px) 0' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          {/* Back */}
          <FadeIn>
            <button
              onClick={() => navigate('/programs')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 28, padding: 0, transition: 'color 0.15s', letterSpacing: '0.06em' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              ← ALL PROGRAMS
            </button>
          </FadeIn>

          {/* Hero grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'clamp(32px,5vw,64px)', alignItems: 'start', paddingBottom: 48 }} className="program-detail-grid">
            {/* LEFT: program identity */}
            <div>
              <FadeIn>
                {/* Badge row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: 'rgba(243,107,33,0.14)', border: '1px solid rgba(243,107,33,0.3)', borderRadius: 6, padding: '4px 12px', color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                    {typeLabel.toUpperCase()}
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 12px', color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                    {program.level}
                  </span>
                  {isCareerOS && (
                    <span style={{ background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.25)', borderRadius: 6, padding: '4px 12px', color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                      + CAREER OS
                    </span>
                  )}
                  {enrollStatus === 'coming_soon' && (
                    <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 12px', color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                      COMING SOON
                    </span>
                  )}
                </div>

                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,5vw,60px)', fontWeight: 600, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.03, margin: '0 0 16px' }}>
                  {program.name}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 17, lineHeight: 1.72, maxWidth: 560, margin: '0 0 28px' }}>
                  {program.desc}
                </p>
              </FadeIn>

              {/* Key outcomes — top 4 */}
              {program.whatYouWillLearn && program.whatYouWillLearn.length > 0 && (
                <FadeIn delay={80}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', marginBottom: 32 }} className="two-col-sm">
                    {program.whatYouWillLearn.slice(0, 4).map((item, i) => (
                      <CheckItem key={i} label={item} dark />
                    ))}
                  </div>
                </FadeIn>
              )}

              <FadeIn delay={140}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setApplyOpen(true)}
                    style={{ background: enrollStatus === 'coming_soon' ? 'rgba(255,255,255,0.1)' : C.orange, border: 'none', color: C.white, borderRadius: 9, padding: '13px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {ctaLabel} →
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('curriculum')
                      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' })
                    }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.75)', borderRadius: 9, padding: '13px 24px', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}
                  >
                    {isExamPrep ? 'View Subjects' : 'View Curriculum'}
                  </button>
                </div>
              </FadeIn>
            </div>

            {/* RIGHT: enrollment card */}
            <FadeIn delay={100}>
              <EnrollmentCard
                program={program}
                status={enrollStatus}
                ctaLabel={ctaLabel}
                onCTA={() => setApplyOpen(true)}
              />
            </FadeIn>
          </div>

          {/* Quick facts strip */}
          <div style={{ paddingTop: 28, paddingBottom: 32, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 'clamp(20px,4vw,48px)', flexWrap: 'wrap' }}>
            {[
              { label: 'Duration', value: program.duration },
              { label: 'Format', value: program.format },
              { label: 'Level', value: program.level },
              ...(isExamPrep
                ? [{ label: 'Sections', value: program.examSections?.join(' · ') ?? '—' }]
                : [
                    ...(program.modules ? [{ label: 'Modules', value: String(program.modules) }] : []),
                    ...(program.projects ? [{ label: 'Projects', value: String(program.projects) }] : []),
                  ]
              ),
              { label: 'Certificate', value: program.cert },
              { label: enrollStatus === 'coming_soon' ? 'Planned Batch' : 'Next Batch', value: program.upcomingBatch },
            ].filter(f => f.value).map(({ label, value }) => (
              <div key={label}>
                <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ color: C.white, fontSize: 13.5, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY SECTION NAV ──────────────────────────────────────────────── */}
      <StickyProgramNav
        sections={navSections}
        activeId={activeSection}
        ctaLabel={ctaLabel}
        onCTA={() => setApplyOpen(true)}
      />

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}

      {/* OVERVIEW: what you'll learn + who it's for */}
      <section id="overview" style={{ background: C.warmWhite, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          {program.whatYouWillLearn && program.whatYouWillLearn.length > 0 && (
            <FadeIn>
              <div style={{ marginBottom: 56 }}>
                <MonoLabel>What you will learn</MonoLabel>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: C.ink, margin: '0 0 28px', letterSpacing: '-0.025em' }}>
                  {isExamPrep ? 'Topics and concepts covered' : program.programType === 'PROFESSIONAL' ? 'Skills and knowledge you will build' : 'What this program covers'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 32px' }} className="two-col-sm">
                  {program.whatYouWillLearn.map((item, i) => (
                    <CheckItem key={i} label={item} />
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {program.whoIsItFor && program.whoIsItFor.length > 0 && (
            <FadeIn>
              <div style={{ background: C.sand, borderRadius: T.rCard, padding: 'clamp(24px,4vw,40px)', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'clamp(24px,4vw,48px)', alignItems: 'start' }} className="two-col-sm">
                <div>
                  <MonoLabel>Who is this for</MonoLabel>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,2.4vw,28px)', fontWeight: 600, color: C.ink, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    Built for the right person.
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {program.whoIsItFor.map((who, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
                      </div>
                      <span style={{ color: C.ink, fontSize: 15, lineHeight: 1.6 }}>{who}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* CURRICULUM */}
      {program.curriculumDetail && program.curriculumDetail.length > 0 && (
        <section id="curriculum" style={{ background: C.white, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: `1px solid ${T.lineLight}` }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end', marginBottom: 40 }} className="two-col-sm">
                <div>
                  <MonoLabel>{isExamPrep ? 'Subjects & sections' : 'Curriculum'}</MonoLabel>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: C.ink, margin: 0, letterSpacing: '-0.025em' }}>
                    {isExamPrep ? 'Subject and section coverage' : 'What you will study'}
                  </h2>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{program.curriculumDetail.length} {isExamPrep ? 'sections' : 'modules'}</div>
                  {program.duration && <div style={{ color: C.ink, fontSize: 13, fontWeight: 500 }}>{program.duration}</div>}
                </div>
              </div>
              {isExamPrep && program.examSections && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                  {program.examSections.map(s => (
                    <span key={s} style={{ background: 'rgba(243,107,33,0.08)', border: '1px solid rgba(243,107,33,0.2)', borderRadius: 6, padding: '6px 14px', color: C.orange, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{s}</span>
                  ))}
                </div>
              )}
            </FadeIn>
            <div>
              {program.curriculumDetail.map((mod, i) => {
                const isOpen = curriculumOpen === mod.number
                return (
                  <FadeIn key={mod.number} delay={i * 40}>
                    <div style={{ borderBottom: `1px solid ${T.lineLight}` }}>
                      <button
                        onClick={() => setCurriculumOpen(isOpen ? null : mod.number)}
                        style={{ width: '100%', display: 'flex', gap: 18, padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', alignItems: 'flex-start' }}
                      >
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.orange, width: 28, flexShrink: 0, paddingTop: 3, letterSpacing: '0.04em' }}>{mod.number}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{mod.title}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                              <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{mod.duration}</span>
                              <span style={{ color: C.orange, fontSize: 18, display: 'inline-block', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                            </div>
                          </div>
                          {!isOpen && <div style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.6, marginTop: 5 }}>{mod.description}</div>}
                        </div>
                      </button>
                      {isOpen && (
                        <div style={{ paddingLeft: 46, paddingBottom: 24 }}>
                          <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.75, margin: '0 0 16px' }}>{mod.description}</p>
                          {mod.topics && mod.topics.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {mod.topics.map(topic => (
                                <span key={topic} style={{ background: C.sand, border: `1px solid ${T.lineLight}`, borderRadius: 5, padding: '5px 11px', color: C.ink, fontSize: 12 }}>{topic}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {program.projectsDetail && program.projectsDetail.length > 0 && (
        <section id="projects" style={{ background: C.sand, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)' }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <MonoLabel>Projects</MonoLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,48px)', alignItems: 'end', marginBottom: 36 }} className="two-col-sm">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: C.ink, margin: 0, letterSpacing: '-0.025em' }}>
                  What you will build.
                </h2>
                <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                  Real-world projects reviewed by industry mentors — each one portfolio-ready on completion.
                </p>
              </div>
            </FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {program.projectsDetail.map((proj, i) => {
                const diffColor = proj.difficulty === 'Beginner' ? '#4ade80' : proj.difficulty === 'Intermediate' ? '#fbbf24' : '#f87171'
                return (
                  <FadeIn key={i} delay={i * 60}>
                    <div style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: '24px 26px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.slate, letterSpacing: '0.06em' }}>PROJECT {String(i + 1).padStart(2, '0')}</span>
                        <span style={{ background: `${diffColor}16`, border: `1px solid ${diffColor}40`, borderRadius: 4, padding: '3px 9px', color: diffColor, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                          {proj.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.ink, margin: '0 0 10px', letterSpacing: '-0.015em', lineHeight: 1.3 }}>{proj.title}</h4>
                      <p style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.65, margin: '0 0 16px', flex: 1 }}>{proj.what}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 14, borderTop: `1px solid ${T.lineLight}` }}>
                        {proj.skills.map(s => (
                          <span key={s} style={{ background: C.sand, borderRadius: 5, padding: '4px 10px', color: C.ink, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* LEARNING EXPERIENCE */}
      {program.learningExperience && program.learningExperience.length > 0 && (
        <section id="experience" style={{ background: C.warmWhite, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: `1px solid ${T.lineLight}` }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <MonoLabel>Learning experience</MonoLabel>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: C.ink, margin: '0 0 36px', letterSpacing: '-0.025em' }}>
                {isExamPrep ? 'How preparation is structured' : 'How this program is delivered'}
              </h2>
            </FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {program.learningExperience.map((item, i) => (
                <FadeIn key={i} delay={i * 50}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '18px 20px', background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange }} />
                    </div>
                    <span style={{ color: C.ink, fontSize: 14, lineHeight: 1.6 }}>{item}</span>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Community / activities strip — Professional programs */}
            {program.programType === 'PROFESSIONAL' && (
              <FadeIn delay={200}>
                <div style={{ marginTop: 40, borderRadius: T.rCard, overflow: 'hidden', position: 'relative', height: 200 }}>
                  <img
                    src="https://images.unsplash.com/photo-1573164574511-73c773193279?w=1200&h=400&fit=crop&auto=format"
                    alt="Community workshop event"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(11,13,15,0.82) 0%, rgba(11,13,15,0.5) 50%, rgba(11,13,15,0.3) 100%)' }} />
                  <div style={{ position: 'absolute', inset: 0, padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 6 }}>COMMUNITY & ACTIVITIES</div>
                      <div style={{ color: C.white, fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,2.4vw,26px)', fontWeight: 600, letterSpacing: '-0.02em' }}>Live sessions. Expert workshops. Cohort events.</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {['Expert Sessions', 'Live Workshops', 'Hackathons', 'Peer Groups'].map(tag => (
                        <span key={tag} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 6, padding: '6px 14px', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
        </section>
      )}

      {/* FACULTY */}
      {program.faculty && program.faculty.length > 0 && (
        <section id="faculty" style={{ background: C.white, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: `1px solid ${T.lineLight}` }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <MonoLabel>{isExamPrep ? 'Subject experts' : 'Faculty'}</MonoLabel>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: C.ink, margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                {isExamPrep ? 'Who leads this preparation' : 'Who teaches this program'}
              </h2>
              {program.faculty.some(f => f.placeholder) && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.sand, borderRadius: 6, padding: '5px 12px', marginBottom: 28, marginTop: 8 }}>
                  <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Faculty profiles published when enrollment opens</span>
                </div>
              )}
            </FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginTop: 28 }}>
              {program.faculty.map((f, i) => (
                <FadeIn key={i} delay={i * 70}>
                  <div style={{ background: C.sand, borderRadius: T.rCard, padding: '24px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(243,107,33,0.12)', border: '2px solid rgba(243,107,33,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18, fontWeight: 700, color: C.orange, fontFamily: 'var(--font-display)' }}>
                      {f.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{f.name}</div>
                      <div style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.04em' }}>{f.role.toUpperCase()}</div>
                      <div style={{ color: C.slate, fontSize: 12.5, lineHeight: 1.55 }}>{f.expertise}</div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CAREER SUPPORT (Professional programs) */}
      {isCareerOS && (
        <section id="career" style={{ background: C.ink, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)' }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }} className="two-col">
                <div>
                  <div style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 14 }}>CAREER OS</div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,40px)', fontWeight: 600, color: C.white, margin: '0 0 16px', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                    Your career support,<br />included on completion.
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 16, lineHeight: 1.75, margin: '0 0 28px', maxWidth: 440 }}>
                    Completing this Professional Program activates Career OS — a dedicated system for your job search. Not a bonus feature. A full career layer.
                  </p>
                  {/* Activation flow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, flexWrap: 'wrap' }}>
                    {['Complete Program', 'Access Granted', 'Career OS Active'].map((step, i, arr) => (
                      <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ background: i === 1 ? C.orange : 'rgba(255,255,255,0.06)', border: `1px solid ${i === 1 ? C.orange : 'rgba(255,255,255,0.12)'}`, borderRadius: 7, padding: '8px 16px' }}>
                          <div style={{ color: i === 1 ? C.white : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: i === 1 ? 600 : 400 }}>{step}</div>
                        </div>
                        {i < arr.length - 1 && <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Career features grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { icon: '📄', label: 'Resume & Profile', desc: 'ATS-optimised resume reviewed by experts' },
                    { icon: '🎯', label: 'Interview Prep', desc: 'Role-specific preparation with mock sessions' },
                    { icon: '💼', label: 'Job Board', desc: 'Curated openings matched to your profile' },
                    { icon: '📊', label: 'Skill Gap Analysis', desc: 'Know exactly where to improve before applying' },
                    { icon: '📬', label: 'Applications', desc: 'Tracked and guided application workflow' },
                    { icon: '🤝', label: 'Placement Support', desc: 'Direct connections to hiring partners' },
                  ].map(({ icon, label, desc }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 18px' }}>
                      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 4 }}>{label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* REVIEWS / STORIES */}
      {!isExamPrep && (
        <section id="reviews" style={{ background: C.warmWhite, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: `1px solid ${T.lineLight}` }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <MonoLabel>Learner outcomes</MonoLabel>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: C.ink, margin: 0, letterSpacing: '-0.025em' }}>
                  Real people. Real outcomes.
                </h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.sand, borderRadius: 6, padding: '5px 12px' }}>
                  <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Sample content — verified stories will appear here</span>
                </div>
              </div>
            </FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 28 }}>
              {stories.slice(0, 3).map((s, i) => (
                <FadeIn key={s.name} delay={i * 70}>
                  <div style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: '26px 24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 28, color: C.orange, fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 14, opacity: 0.6 }}>"</div>
                    <p style={{ color: C.ink, fontSize: 14, lineHeight: 1.72, margin: '0 0 22px', flex: 1 }}>{s.provided}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 18, borderTop: `1px solid ${T.lineLight}` }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.orange, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.initials}</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: C.ink, fontWeight: 600 }}>{s.name}</div>
                        <div style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '0.04em' }}>{s.outcome}</div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CERTIFICATION */}
      <section style={{ background: C.sand, padding: 'clamp(36px,6vw,56px) clamp(16px,4vw,32px)', borderTop: `1px solid ${T.lineLight}` }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${C.orange} 0%, #ff9a3c 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.5 14.5L6 22l6-2 6 2-2.5-7.5"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>CERTIFICATE</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 3 }}>{program.cert}</div>
                <div style={{ color: C.slate, fontSize: 13.5 }}>Issued by Skylent on successful completion. Includes a verifiable credential ID.{enrollStatus === 'coming_soon' ? ' Available when enrollment opens.' : ''}</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      {program.faqs && program.faqs.length > 0 && (
        <section id="faq" style={{ background: C.white, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: `1px solid ${T.lineLight}` }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <MonoLabel>FAQs</MonoLabel>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: C.ink, margin: '0 0 32px', letterSpacing: '-0.025em' }}>Common questions</h2>
            </FadeIn>
            <div style={{ maxWidth: 780 }}>
              {program.faqs.map((faq, i) => {
                const isOpen = faqOpen === faq.q
                return (
                  <FadeIn key={i} delay={i * 40}>
                    <div style={{ borderBottom: i < program.faqs!.length - 1 ? `1px solid ${T.lineLight}` : 'none' }}>
                      <button
                        onClick={() => setFaqOpen(isOpen ? null : faq.q)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>{faq.q}</span>
                        <span style={{ color: C.orange, fontSize: 20, display: 'inline-block', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>+</span>
                      </button>
                      {isOpen && (
                        <div style={{ paddingBottom: 20 }}>
                          <p style={{ color: C.slate, fontSize: 14.5, lineHeight: 1.78, margin: 0 }}>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── PRICING TIERS ────────────────────────────────────────────────────── */}
      <section style={{ background: C.ink, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'end', marginBottom: 44 }} className="two-col-sm">
              <div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 12 }}>FEES & ENROLLMENT</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.4vw,40px)', fontWeight: 600, color: C.white, margin: 0, letterSpacing: '-0.025em' }}>Choose your plan</h2>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: 0, maxWidth: 280, textAlign: 'right' }}>Every plan includes the full curriculum and Skylent certificate.</p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(program.pricing.length, 3)}, 1fr)`, gap: 16 }} className="three-col">
            {program.pricing.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 60}>
                <div style={{ background: tier.highlight ? 'rgba(243,107,33,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${tier.highlight ? 'rgba(243,107,33,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius: T.rCard, padding: '32px 26px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {tier.highlight && (
                    <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: C.orange, color: C.white, fontSize: 10, fontFamily: 'var(--font-mono)', padding: '4px 14px', borderRadius: 12, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>RECOMMENDED</div>
                  )}
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: tier.highlight ? C.orange : C.white, marginBottom: 16 }}>{tier.name}</div>
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: C.white, lineHeight: 1 }}>₹{tier.price.toLocaleString('en-IN')}</div>
                    <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12.5, textDecoration: 'line-through', marginTop: 4, fontFamily: 'var(--font-mono)' }}>₹{tier.originalPrice.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ flex: 1, marginBottom: 24 }}>
                    {tier.features.map(f => (
                      <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 9 }}>
                        <svg width="13" height="13" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: 2 }}><path d="M2 6.5L5 9.5L10 3" stroke={tier.highlight ? C.orange : 'rgba(255,255,255,0.35)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setApplyOpen(true)}
                    style={{ background: tier.highlight ? C.orange : 'transparent', border: `1px solid ${tier.highlight ? C.orange : 'rgba(255,255,255,0.18)'}`, color: tier.highlight ? C.white : 'rgba(255,255,255,0.55)', borderRadius: 8, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', width: '100%', transition: 'opacity 0.18s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {ctaLabel}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section style={{ background: C.warmWhite, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: `1px solid ${T.lineLight}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            {/* Photo strip */}
            <div style={{ borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '21/6', marginBottom: 44, position: 'relative' }}>
              <img
                src={heroPhoto}
                alt="Learning environment"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11,13,15,0.08), rgba(11,13,15,0.5))' }} />
            </div>
            <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 20, textTransform: 'uppercase' }}>Get started</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 600, color: C.ink, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {enrollStatus === 'coming_soon'
                ? `Be the first to know when ${program.name} opens`
                : `Ready to begin ${program.name}?`}
            </h2>
            <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.75, margin: '0 0 36px' }}>
              {enrollStatus === 'coming_soon'
                ? 'Register your interest and we will notify you when enrollment opens.'
                : `Next batch starts ${program.upcomingBatch}. Applications close when the cohort fills.`}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setApplyOpen(true)}
                style={{ background: enrollStatus === 'coming_soon' ? C.ink : C.orange, border: 'none', color: C.white, borderRadius: 9, padding: '14px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {ctaLabel} →
              </button>
              <a href="/contact" style={{ display: 'inline-block', background: 'transparent', border: `1px solid ${T.lineLight}`, color: C.ink, borderRadius: 9, padding: '14px 28px', fontSize: 15, textDecoration: 'none', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = C.orange)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = T.lineLight)}
              >
                Talk to an advisor
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {applyOpen && (
        <EnrollmentModal
          item={{ id: program.slug, title: program.name, price: highlightTier.price, type: 'program' }}
          onClose={() => setApplyOpen(false)}
        />
      )}
    </PageShell>
  )
}
