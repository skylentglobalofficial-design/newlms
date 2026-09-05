import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, FadeIn, EnrollmentModal, PageShell } from '../components/shared'
import {
  T, Section, SectionHeader, Eyebrow, Button, FlowStrip, Badge,
} from '../components/ui'
import { Aurora, GlassSurface, MediaImage } from '../components/foundation'
import { resolveAuroraTheme, getDomainAccent, type AuroraThemeId } from '../aurora-themes'
import ProgramWorkflowVisual from '../components/program/ProgramWorkflowVisual'
import { programs } from '../data'
import type { ProgramType, EnrollmentStatus } from '../data'
import { PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO, PHOTO } from '../media'

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
  open: 'Enroll Now',
  waitlist: 'Join Waitlist',
  coming_soon: 'Register Interest',
}

const CURRICULUM_MODEL: Record<ProgramType, string> = {
  SCHOOLING: 'Grade → Subject → Chapter → Lesson → Activity → Assessment',
  UNDERGRADUATE: 'Degree → Semester → Subject → Module → Lesson → Assignment / Project',
  POSTGRADUATE: 'Program → Term → Specialization → Module → Case / Project → Assessment',
  EXAM_PREP: 'Exam → Subject / Section → Topic → Practice → Test → Mock → Analytics',
  PROFESSIONAL: 'Program → Module → Topic → Project → Assessment',
  CERTIFICATE: 'Program → Module → Topic → Project → Assessment',
  WEBINAR: 'Session → Topic → Live / Recorded',
}

type NavSection = { id: string; label: string }

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function CheckItem({ label, accent }: { label: string; accent?: string }) {
  const color = accent ?? C.orange
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
        <rect width="16" height="16" rx="4" fill={`${color}22`} stroke={`${color}55`} strokeWidth="0.8" />
        <path d="M4.5 8.5L7 11L11.5 5.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.55 }}>{label}</span>
    </div>
  )
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' })
}

// ─── STICKY SECTION NAV ───────────────────────────────────────────────────────

function StickyProgramNav({
  sections, activeId, ctaLabel, onCTA, accent,
}: {
  sections: NavSection[]
  activeId: string
  ctaLabel: string
  onCTA: () => void
  accent: ReturnType<typeof getDomainAccent>
}) {
  return (
    <nav style={{
      position: 'sticky', top: T.navH, zIndex: 80,
      background: 'var(--glass-01-bg)', backdropFilter: 'var(--glass-01-blur)',
      WebkitBackdropFilter: 'var(--glass-01-blur)', borderBottom: '1px solid var(--glass-01-border)',
    }}>
      <div style={{ maxWidth: T.maxW, margin: '0 auto', padding: `0 ${T.gutter}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div className="program-sticky-nav-scroll" style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              style={{
                background: 'none', border: 'none',
                borderBottom: `2px solid ${activeId === s.id ? accent.primary : 'transparent'}`,
                padding: '14px 14px', color: activeId === s.id ? accent.text : 'rgba(255,255,255,0.42)',
                fontSize: 12.5, fontFamily: 'var(--font-body)', fontWeight: activeId === s.id ? 600 : 400,
                cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={onCTA}
          style={{
            flexShrink: 0, background: C.orange, border: 'none', color: C.white,
            borderRadius: T.rControl, padding: '8px 18px', fontSize: 12.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          {ctaLabel} →
        </button>
      </div>
    </nav>
  )
}

// ─── ENROLLMENT PANEL ─────────────────────────────────────────────────────────

function EnrollmentPanel({
  program, status, ctaLabel, onCTA,
}: {
  program: NonNullable<ReturnType<typeof programs.find>>
  status: EnrollmentStatus
  ctaLabel: string
  onCTA: () => void
}) {
  const lowestPrice = Math.min(...program.pricing.map(p => p.price))
  const isCareerOS = !!program.careerSupport

  return (
    <GlassSurface level={2} padding="0" style={{ position: 'sticky', top: T.navH + 72 }}>
      <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${T.lineDark}` }}>
        <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>Starting from</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: C.white, lineHeight: 1 }}>
            ₹{lowestPrice.toLocaleString('en-IN')}
          </div>
          {program.pricing[0]?.originalPrice > lowestPrice && (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>
              ₹{program.pricing[0].originalPrice.toLocaleString('en-IN')}
            </div>
          )}
        </div>
        {program.pricing.length > 1 && (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 }}>Multiple plans below</div>
        )}
      </div>

      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.lineDark}` }}>
        {[
          { text: `${status === 'coming_soon' ? 'Planned: ' : 'Next batch: '}${program.upcomingBatch}` },
          { text: `${program.duration} · ${program.format}` },
          { text: program.cert },
          ...(isCareerOS ? [{ text: 'Unlocks Career OS on completion', accent: true }] : []),
        ].map(({ text, accent }, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent ? C.orange : 'rgba(255,255,255,0.25)', flexShrink: 0, marginTop: 6 }} />
            <span style={{ color: accent ? C.orange : 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.45 }}>{text}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '18px 24px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button variant="primary" full onClick={onCTA}>
          {ctaLabel} →
        </Button>
        <Link to="/contact" style={{ display: 'block', textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none', padding: '6px 0' }}>
          Talk to an advisor
        </Link>
      </div>

      <div style={{ padding: '10px 24px', borderTop: `1px solid ${T.lineDark}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11 }}>Secure enrollment · Verified certificate</span>
      </div>
    </GlassSurface>
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
  const [featuredProject, setFeaturedProject] = useState(0)

  const isExamPrep = program?.programType === 'EXAM_PREP'
  const isCareerOS = !!program?.careerSupport
  const enrollStatus = (program?.enrollmentStatus ?? 'open') as EnrollmentStatus
  const typeLabel = program ? TYPE_LABELS[program.programType] : ''
  const heroPhoto = program ? (PROGRAM_PHOTO[program.slug] ?? DEFAULT_PROGRAM_PHOTO) : DEFAULT_PROGRAM_PHOTO
  const ctaLabel = program?.programType === 'PROFESSIONAL' && enrollStatus === 'open' ? 'Apply Now' : CTA_LABEL[enrollStatus]
  const auroraTheme: AuroraThemeId = program ? resolveAuroraTheme(`/programs/${program.slug}`, program.slug, program.programType) : 'general'
  const domainAccent = getDomainAccent(auroraTheme)

  const navSections: NavSection[] = program ? [
    { id: 'overview', label: 'Overview' },
    ...(program.curriculumDetail?.length ? [{ id: 'curriculum', label: 'Curriculum' }] : []),
    ...(program.projectsDetail?.length ? [{ id: 'projects', label: 'Projects' }] : []),
    ...(program.projectsDetail?.length ? [{ id: 'tools', label: 'Tools' }] : []),
    ...(program.learningExperience?.length ? [{ id: 'experience', label: 'Learning' }] : []),
    ...(program.faculty?.length ? [{ id: 'faculty', label: 'Faculty' }] : []),
    ...(isCareerOS ? [{ id: 'career', label: 'Career' }] : []),
    ...(!isExamPrep ? [{ id: 'reviews', label: 'Reviews' }] : []),
    ...(program.faqs?.length ? [{ id: 'faq', label: 'FAQs' }] : []),
    { id: 'pricing', label: 'Pricing' },
  ] : []

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
      <PageShell>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 className="skylent-display-md" style={{ color: C.white }}>Program not found</h2>
            <Button variant="primary" onClick={() => navigate('/programs')} style={{ marginTop: 20 }}>← All Programs</Button>
          </div>
        </div>
      </PageShell>
    )
  }

  const highlightTier = program.pricing.find(p => p.highlight) ?? program.pricing[0]
  const allPricingFeatures = Array.from(new Set(program.pricing.flatMap(p => p.features)))

  return (
    <PageShell auroraTheme={auroraTheme}>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section id="program-hero" style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 32}px ${T.gutter} 0` }}>
        <Aurora themeId={auroraTheme} variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => navigate('/programs')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 24, padding: 0, letterSpacing: '0.06em' }}
          >
            ← ALL PROGRAMS
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr min(340px, 32%)', gap: 'clamp(28px,4vw,48px)', alignItems: 'start' }} className="program-detail-grid">
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <Badge tone="dark" accent>{typeLabel}</Badge>
                <Badge tone="dark">{program.level}</Badge>
                {isCareerOS && <Badge tone="dark" accent>+ Career OS</Badge>}
                {enrollStatus === 'coming_soon' && <Badge tone="dark">Coming Soon</Badge>}
              </div>

              <h1 className="skylent-display-lg" style={{ color: C.white, margin: '0 0 16px', maxWidth: 640 }}>
                {program.name}
              </h1>
              <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 520, margin: '0 0 28px' }}>
                {program.desc}
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                <Button variant="primary" size="lg" onClick={() => setApplyOpen(true)}>{ctaLabel} →</Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => scrollToSection(program.curriculumDetail?.length ? 'curriculum' : 'overview')}
                >
                  {isExamPrep ? 'View Subjects' : 'View Curriculum'}
                </Button>
              </div>

              {/* Domain-native workflow — primary visual anchor */}
              <FadeIn delay={60}>
                <div style={{ marginTop: 4 }}>
                  <ProgramWorkflowVisual slug={program.slug} programType={program.programType} programName={program.name} />
                </div>
              </FadeIn>

              {program.whatYouWillLearn && program.whatYouWillLearn.length > 0 && (
                <FadeIn delay={100}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 28px', marginTop: 28 }} className="two-col-sm">
                    {program.whatYouWillLearn.slice(0, 4).map((item, i) => (
                      <CheckItem key={i} label={item} accent={domainAccent.primary} />
                    ))}
                  </div>
                </FadeIn>
              )}
            </div>

            <FadeIn delay={80}>
              <EnrollmentPanel program={program} status={enrollStatus} ctaLabel={ctaLabel} onCTA={() => setApplyOpen(true)} />
            </FadeIn>
          </div>

          {/* Quick facts strip */}
          <div style={{ paddingTop: 28, paddingBottom: 28, marginTop: 4, borderTop: `1px solid ${T.lineDark}`, display: 'flex', gap: 'clamp(20px,4vw,48px)', flexWrap: 'wrap' }}>
            {[
              { label: 'Duration', value: program.duration },
              { label: 'Format', value: program.format },
              { label: 'Level', value: program.level },
              ...(isExamPrep
                ? [{ label: 'Sections', value: program.examSections?.join(' · ') ?? '—' }]
                : [
                    ...(program.modules ? [{ label: 'Modules', value: String(program.modules) }] : []),
                    ...(program.projects ? [{ label: 'Projects', value: String(program.projects) }] : []),
                  ]),
              { label: 'Certificate', value: program.cert },
              { label: enrollStatus === 'coming_soon' ? 'Planned Batch' : 'Next Batch', value: program.upcomingBatch },
            ].filter(f => f.value).map(({ label, value }) => (
              <div key={label}>
                <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 5 }}>{label}</div>
                <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StickyProgramNav sections={navSections} activeId={activeSection} ctaLabel={ctaLabel} onCTA={() => setApplyOpen(true)} accent={domainAccent} />

      {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
      <Section id="overview" tone="canvas" divider>
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(32px,5vw,64px)', alignItems: 'start', marginBottom: 48 }} className="two-col program-overview-split">
            <div>
              <Eyebrow tone="dark">Why this program</Eyebrow>
              <h2 className="skylent-display-md" style={{ color: C.white, margin: '18px 0 16px' }}>
                {program.outcome}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.75, margin: 0, maxWidth: 520 }}>
                {program.desc}
              </p>
            </div>
            <div>
              <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 16 }}>At a glance</div>
              {[
                ['Type', typeLabel],
                ['Duration', program.duration],
                ['Mode', program.format],
                ['Certification', program.cert],
                ...(isCareerOS ? [['Career support', 'Career OS on completion']] : []),
              ].map(([k, v], i, arr) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.lineDark}` : 'none' }}>
                  <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>{k}</span>
                  <span style={{ color: C.white, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {program.whatYouWillLearn && program.whatYouWillLearn.length > 0 && (
          <FadeIn>
            <SectionHeader
              tone="dark"
              eyebrow="What you will learn"
              title={isExamPrep ? 'Topics and concepts covered' : program.programType === 'PROFESSIONAL' ? 'Skills and knowledge you will build' : 'What this program covers'}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px 36px', marginTop: 32 }} className="two-col-sm">
              {program.whatYouWillLearn.map((item, i) => (
                <CheckItem key={i} label={item} accent={domainAccent.primary} />
              ))}
            </div>
          </FadeIn>
        )}

        {program.whoIsItFor && program.whoIsItFor.length > 0 && (
          <FadeIn>
            <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'clamp(24px,4vw,56px)', alignItems: 'start' }} className="program-who-split">
              <div>
                <Eyebrow tone="dark">Who is this for</Eyebrow>
                <h3 className="skylent-display-sm" style={{ color: C.white, margin: '16px 0 0' }}>
                  Built for the right learner.
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {program.whoIsItFor.map((who, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 0', borderBottom: i < program.whoIsItFor!.length - 1 ? `1px solid ${T.lineDark}` : 'none' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: domainAccent.primary, flexShrink: 0, marginTop: 7 }} />
                    <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, lineHeight: 1.65 }}>{who}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </Section>

      {/* ── CURRICULUM PATH ───────────────────────────────────────────────── */}
      {program.curriculumDetail && program.curriculumDetail.length > 0 && (
        <Section id="curriculum" tone="canvas" divider style={{ paddingTop: T.sectionSm }}>
          <FadeIn>
            <SectionHeader
              tone="dark"
              eyebrow={isExamPrep ? 'Subjects & sections' : 'Curriculum'}
              title={isExamPrep ? 'Subject and section coverage' : 'What you will study'}
              lead={CURRICULUM_MODEL[program.programType]}
            />
            {isExamPrep && program.examSections && (
              <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
                {program.examSections.map(s => <Badge key={s} tone="dark" accent>{s}</Badge>)}
              </div>
            )}
          </FadeIn>

          <div style={{ marginTop: 48, position: 'relative' }}>
            {program.curriculumDetail.map((mod, i) => {
              const isOpen = curriculumOpen === mod.number
              const isLast = i === program.curriculumDetail!.length - 1
              return (
                <FadeIn key={mod.number} delay={i * 30}>
                  <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '0 24px', position: 'relative' }} className="program-curriculum-row">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isOpen ? domainAccent.subtleStrong : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isOpen ? domainAccent.border : T.lineDark}`,
                        fontFamily: 'var(--font-mono)', fontSize: 11, color: isOpen ? domainAccent.text : 'rgba(255,255,255,0.4)',
                      }}>
                        {mod.number}
                      </div>
                      {!isLast && <div style={{ width: 1, flex: 1, minHeight: 24, background: T.lineDark, margin: '6px 0' }} />}
                    </div>
                    <div style={{ paddingBottom: isLast ? 0 : 28, borderBottom: isLast ? 'none' : `1px solid ${T.lineDark}` }}>
                      <button
                        onClick={() => setCurriculumOpen(isOpen ? null : mod.number)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '4px 0 0' }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(17px,2vw,20px)', fontWeight: 600, color: C.white, lineHeight: 1.3, marginBottom: 6 }}>
                            {mod.title}
                          </div>
                          {!isOpen && <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.65 }}>{mod.description}</div>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, paddingTop: 4 }}>
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{mod.duration}</span>
                          <span style={{ color: domainAccent.text, fontSize: 18, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                        </div>
                      </button>
                      {isOpen && (
                        <div style={{ paddingTop: 12, paddingBottom: 8 }}>
                          <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 14, lineHeight: 1.75, margin: '0 0 16px' }}>{mod.description}</p>
                          {mod.topics && mod.topics.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {mod.topics.map(topic => (
                                <span key={topic} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, padding: '4px 0', borderBottom: `1px solid ${T.lineDark}` }}>{topic}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </Section>
      )}

      {/* ── PROJECTS ──────────────────────────────────────────────────────── */}
      {program.projectsDetail && program.projectsDetail.length > 0 && (
        <Section id="projects" tone="canvas" divider>
          <FadeIn>
            <SectionHeader
              tone="dark"
              eyebrow="Projects"
              title="What you will build."
              lead="Portfolio-ready work reviewed by industry mentors — not placeholder exercises."
            />
          </FadeIn>

          {/* Featured project artifact */}
          {program.projectsDetail[featuredProject] && (() => {
            const proj = program.projectsDetail![featuredProject]
            const diffColor = proj.difficulty === 'Beginner' ? '#4ade80' : proj.difficulty === 'Intermediate' ? '#fbbf24' : '#f87171'
            return (
              <FadeIn delay={40}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(28px,4vw,48px)', alignItems: 'center', marginTop: 36 }} className="two-col program-project-featured">
                  <GlassSurface level={3} padding="22px 24px">
                    <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 14 }}>Project pipeline</div>
                    {program.slug === 'data-science-ai' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }} className="program-artifact-panels">
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 12, border: `1px solid ${T.lineDark}` }}>
                          <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: domainAccent.text, marginBottom: 8, letterSpacing: '0.06em' }}>DATASET</div>
                          {['id', 'feature', 'label'].map(h => (
                            <div key={h} style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)', padding: '2px 0', borderBottom: `1px solid ${T.lineDark}` }}>{h}</div>
                          ))}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 12, border: `1px solid ${T.lineDark}` }}>
                          <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: domainAccent.text, marginBottom: 8, letterSpacing: '0.06em' }}>MODEL</div>
                          {['precision', 'recall', 'f1'].map((m, i) => (
                            <div key={m} style={{ marginBottom: 5 }}>
                              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                                <div style={{ height: '100%', width: `${[78, 72, 75][i]}%`, background: domainAccent.primary, borderRadius: 2, opacity: 0.7 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ background: domainAccent.subtle, borderRadius: 8, padding: 12, border: `1px solid ${domainAccent.border}` }}>
                          <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: domainAccent.textMuted, marginBottom: 8, letterSpacing: '0.06em' }}>RESULT</div>
                          <div style={{ fontSize: 10, color: C.white, lineHeight: 1.45 }}>Segment flagged for review</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 14, minHeight: 72 }}>
                          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>INPUT</div>
                          <div style={{ height: 5, width: '70%', background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 14, minHeight: 72 }}>
                          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>OUTPUT</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Deliverable ready</div>
                        </div>
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 14 }}>
                      {proj.skills.join(' · ')}
                    </div>
                  </GlassSurface>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span className="skylent-label" style={{ color: 'rgba(255,255,255,0.3)' }}>Project {String(featuredProject + 1).padStart(2, '0')}</span>
                      <span style={{ color: diffColor, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{proj.difficulty}</span>
                    </div>
                    <h3 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 14px' }}>{proj.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{proj.what}</p>
                  </div>
                </div>
              </FadeIn>
            )
          })()}

          {/* Project selector list */}
          {program.projectsDetail.length > 1 && (
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {program.projectsDetail.map((proj, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturedProject(i)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                    padding: '18px 0', background: 'none', border: 'none', borderTop: `1px solid ${T.lineDark}`,
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                  }}
                >
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: featuredProject === i ? domainAccent.text : 'rgba(255,255,255,0.3)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ color: featuredProject === i ? C.white : 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: featuredProject === i ? 600 : 400, marginLeft: 14 }}>
                      {proj.title}
                    </span>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{proj.difficulty}</span>
                </button>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── TOOLS STACK ───────────────────────────────────────────────────── */}
      {program.projectsDetail && program.projectsDetail.length > 0 && (
        <Section id="tools" tone="canvas" divider style={{ paddingTop: T.sectionSm, paddingBottom: T.sectionSm }}>
          <Eyebrow tone="dark">Tools & technologies</Eyebrow>
          <h2 className="skylent-display-sm" style={{ color: C.white, margin: '16px 0 28px' }}>What you will work with</h2>
          <div className="program-tools-strip" style={{ display: 'flex', flexWrap: 'wrap', gap: 0, borderTop: `1px solid ${T.lineDark}`, borderLeft: `1px solid ${T.lineDark}` }}>
            {Array.from(new Set(program.projectsDetail.flatMap(p => p.skills))).map((tool, i, arr) => (
              <div
                key={tool}
                style={{
                  padding: '14px 22px', fontSize: 14, color: 'rgba(255,255,255,0.65)',
                  borderRight: `1px solid ${T.lineDark}`, borderBottom: `1px solid ${T.lineDark}`,
                  fontFamily: i === 0 ? 'var(--font-display)' : 'var(--font-body)',
                  fontWeight: i === 0 ? 600 : 400,
                }}
              >
                {tool}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── LEARNING EXPERIENCE ───────────────────────────────────────────── */}
      {program.learningExperience && program.learningExperience.length > 0 && (
        <Section id="experience" tone="canvas" divider>
          <FadeIn>
            <SectionHeader
              tone="dark"
              eyebrow="Learning experience"
              title={isExamPrep ? 'How preparation is structured' : 'How this program is delivered'}
            />
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {program.learningExperience.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 20, padding: '16px 0', borderBottom: i < program.learningExperience!.length - 1 ? `1px solid ${T.lineDark}` : 'none' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: domainAccent.text, paddingTop: 2 }}>{String(i + 1).padStart(2, '0')}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.65 }}>{item}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          {program.programType === 'PROFESSIONAL' && (
            <FadeIn delay={120}>
              <div style={{ marginTop: 32 }}>
                <MediaImage
                  src={PHOTO.workshop}
                  alt="Learners in a workshop session"
                  aspect="21/9"
                  overlay="full"
                  overlayText="Live sessions · Expert workshops · Cohort events"
                  objectPosition="center 40%"
                />
              </div>
            </FadeIn>
          )}
        </Section>
      )}

      {/* ── FACULTY ───────────────────────────────────────────────────────── */}
      {program.faculty && program.faculty.length > 0 && (
        <Section id="faculty" tone="canvas" divider>
          <FadeIn>
            <SectionHeader
              tone="dark"
              eyebrow={isExamPrep ? 'Subject experts' : 'Faculty'}
              title={isExamPrep ? 'Who leads this preparation' : 'Who teaches this program'}
              lead={program.faculty.some(f => f.placeholder) ? 'Faculty profiles published when enrollment opens.' : undefined}
            />
          </FadeIn>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {program.faculty.map((f, i) => (
              <FadeIn key={i} delay={i * 50}>
                <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 20, alignItems: 'start', padding: '24px 0', borderBottom: i < program.faculty!.length - 1 ? `1px solid ${T.lineDark}` : 'none' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', background: 'rgba(243,107,33,0.1)',
                    border: '1px solid rgba(243,107,33,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: C.orange, fontFamily: 'var(--font-display)',
                  }}>
                    {f.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 4 }}>{f.name}</div>
                    <div className="skylent-label" style={{ color: C.orange, marginBottom: 8 }}>{f.role}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>{f.expertise}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Section>
      )}

      {/* ── CAREER OS ─────────────────────────────────────────────────────── */}
      {isCareerOS && (
        <Section id="career" tone="canvas" divider style={{ paddingTop: T.sectionTight, paddingBottom: T.sectionTight }}>
          <FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }} className="two-col">
              <div>
                <Eyebrow tone="dark" accent>Career OS</Eyebrow>
                <h2 className="skylent-display-md" style={{ color: C.white, margin: '18px 0 16px' }}>
                  From program completion to job applications.
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 16, lineHeight: 1.75, margin: '0 0 32px', maxWidth: 440 }}>
                  Completing this Professional Program activates Career OS: profile, interview preparation, job board, and application tracking.
                </p>
                <FlowStrip
                  tone="dark"
                  steps={[
                    { label: 'Complete Program', sub: 'Finish curriculum & projects' },
                    { label: 'Access Granted', sub: 'Career OS unlocks', highlight: true },
                    { label: 'Apply & Track', sub: 'Jobs & interviews' },
                  ]}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Resume & Profile', desc: 'Build a profile from program work' },
                  { label: 'Interview Prep', desc: 'Role-specific preparation and mocks' },
                  { label: 'Job Board', desc: 'Openings you can inspect and apply to' },
                  { label: 'Applications', desc: 'Track submissions you send' },
                ].map(({ label, desc }, i, arr) => (
                  <div key={label} style={{ padding: '18px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.lineDark}` : 'none' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.white, marginBottom: 4 }}>{label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </Section>
      )}

      {/* ── REVIEWS — honest empty state ──────────────────────────────────── */}
      {!isExamPrep && (
        <Section id="reviews" tone="canvas" divider style={{ paddingTop: T.sectionTight, paddingBottom: T.sectionTight }}>
          <FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(28px,4vw,48px)', alignItems: 'center' }} className="two-col">
              <div>
                <Eyebrow tone="dark">Learner outcomes</Eyebrow>
                <h2 className="skylent-display-sm" style={{ color: C.white, margin: '16px 0 12px' }}>
                  Stories from this program
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, margin: 0, maxWidth: 440 }}>
                  Verified learner stories will be published here when available. Sample content is not shown as testimonials.
                </p>
              </div>
              <div style={{ padding: '28px 32px', borderLeft: `2px solid ${domainAccent.border}`, borderTop: `1px solid ${T.lineDark}`, borderBottom: `1px solid ${T.lineDark}` }}>
                <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 12 }}>Status</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, marginBottom: 8 }}>Not yet published</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, lineHeight: 1.6 }}>
                  Outcome stories require verification before they appear on this page.
                </div>
              </div>
            </div>
          </FadeIn>
        </Section>
      )}

      {/* ── CERTIFICATION + FAQ transition ────────────────────────────────── */}
      <Section tone="canvas" divider style={{ paddingTop: T.sectionTight, paddingBottom: T.sectionCompact }}>
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'clamp(28px,4vw,48px)', alignItems: 'center' }} className="program-cert-split">
            <GlassSurface level={2} padding="24px 22px" style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
                background: `linear-gradient(135deg, ${domainAccent.primary}, ${domainAccent.secondary})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.5 14.5L6 22l6-2 6 2-2.5-7.5"/></svg>
              </div>
              <div className="skylent-label" style={{ color: domainAccent.textMuted, marginBottom: 6 }}>Credential</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.white, lineHeight: 1.3 }}>{program.cert}</div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.lineDark}`, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>
                Verifiable on completion
              </div>
            </GlassSurface>
            <div>
              <Eyebrow tone="dark">Certificate</Eyebrow>
              <h2 className="skylent-display-sm" style={{ color: C.white, margin: '14px 0 12px' }}>
                Credential issued on successful completion
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, margin: 0, maxWidth: 520 }}>
                Issued by Skylent when you complete the program and pass the final assessment. Each certificate includes a verifiable credential reference.
                {enrollStatus === 'coming_soon' ? ' Available when enrollment opens.' : ''}
              </p>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      {program.faqs && program.faqs.length > 0 && (
        <Section id="faq" tone="canvas" divider style={{ paddingTop: T.sectionCompact, paddingBottom: T.sectionTight }}>
          <FadeIn>
            <SectionHeader tone="dark" eyebrow="FAQs" title="Common questions" />
          </FadeIn>
          <div style={{ maxWidth: 780, marginTop: 28 }}>
            {program.faqs.map((faq, i) => {
              const isOpen = faqOpen === faq.q
              return (
                <FadeIn key={i} delay={i * 30}>
                  <div style={{ borderBottom: `1px solid ${T.lineDark}` }}>
                    <button
                      onClick={() => setFaqOpen(isOpen ? null : faq.q)}
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(15px,2vw,17px)', fontWeight: 600, color: C.white, lineHeight: 1.4 }}>{faq.q}</span>
                      <span style={{ color: domainAccent.text, fontSize: 20, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>+</span>
                    </button>
                    {isOpen && (
                      <div style={{ paddingBottom: 22 }}>
                        <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 15, lineHeight: 1.78, margin: 0 }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </Section>
      )}

      {/* ── PRICING COMPARISON ────────────────────────────────────────────── */}
      <Section id="pricing" tone="canvas" divider style={{ paddingTop: T.sectionTight, paddingBottom: T.sectionTight }}>
        <FadeIn>
          <SectionHeader
            tone="dark"
            eyebrow="Fees & enrollment"
            title="Choose your plan"
            lead="Every plan includes the full curriculum and Skylent certificate."
          />
        </FadeIn>

        <div style={{ marginTop: 32, overflowX: 'auto' }} className="program-pricing-wrap">
          <div style={{ minWidth: 560 }}>
            {/* Tier headers */}
            <div style={{ display: 'grid', gridTemplateColumns: `1.4fr repeat(${program.pricing.length}, 1fr)`, gap: 0, borderBottom: `1px solid ${T.lineDark}` }}>
              <div style={{ padding: '16px 0', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Plan</div>
              {program.pricing.map(tier => (
                <div key={tier.name} style={{ padding: '16px 20px', textAlign: 'center', borderLeft: `1px solid ${T.lineDark}`, background: tier.highlight ? domainAccent.subtle : 'transparent' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: tier.highlight ? domainAccent.text : C.white }}>{tier.name}</div>
                  {tier.highlight && <div className="skylent-label" style={{ color: domainAccent.text, fontSize: 9, marginTop: 4 }}>Recommended</div>}
                </div>
              ))}
            </div>
            {/* Prices */}
            <div style={{ display: 'grid', gridTemplateColumns: `1.4fr repeat(${program.pricing.length}, 1fr)`, gap: 0, borderBottom: `1px solid ${T.lineDark}` }}>
              <div style={{ padding: '20px 0', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Price</div>
              {program.pricing.map(tier => (
                <div key={tier.name} style={{ padding: '20px', textAlign: 'center', borderLeft: `1px solid ${T.lineDark}`, background: tier.highlight ? `${domainAccent.subtle}` : 'transparent' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: C.white }}>₹{tier.price.toLocaleString('en-IN')}</div>
                  <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12, textDecoration: 'line-through', marginTop: 4 }}>₹{tier.originalPrice.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
            {/* Feature rows */}
            {allPricingFeatures.map((feature, fi) => (
              <div key={feature} style={{ display: 'grid', gridTemplateColumns: `1.4fr repeat(${program.pricing.length}, 1fr)`, gap: 0, borderBottom: `1px solid ${T.lineDark}` }}>
                <div style={{ padding: '14px 0', color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.4 }}>{feature}</div>
                {program.pricing.map(tier => (
                  <div key={tier.name} style={{ padding: '14px 20px', textAlign: 'center', borderLeft: `1px solid ${T.lineDark}`, background: tier.highlight ? `${domainAccent.subtle}` : 'transparent' }}>
                    {tier.features.includes(feature) ? (
                      <span style={{ color: tier.highlight ? domainAccent.text : 'rgba(255,255,255,0.5)', fontSize: 14 }}>✓</span>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 14 }}>—</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
            {/* CTA row */}
            <div style={{ display: 'grid', gridTemplateColumns: `1.4fr repeat(${program.pricing.length}, 1fr)`, gap: 0, paddingTop: 24 }}>
              <div />
              {program.pricing.map(tier => (
                <div key={tier.name} style={{ padding: '0 12px', borderLeft: `1px solid ${T.lineDark}` }}>
                  <Button
                    variant={tier.highlight ? 'primary' : 'secondary'}
                    full
                    size="sm"
                    onClick={() => setApplyOpen(true)}
                  >
                    {ctaLabel}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.sectionTight} ${T.gutter}` }}>
        <Aurora themeId={auroraTheme} />
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <MediaImage
              src={heroPhoto}
              alt={`${program.name} learning environment`}
              aspect="21/9"
              overlay="full"
              style={{ marginBottom: 32 }}
              objectPosition="center 35%"
            />
            <Eyebrow tone="dark" accent>Get started</Eyebrow>
            <h2 className="skylent-display-md" style={{ color: C.white, margin: '20px 0 16px' }}>
              {enrollStatus === 'coming_soon'
                ? `Be notified when ${program.name} opens`
                : `Ready to begin ${program.name}?`}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 16, lineHeight: 1.75, margin: '0 0 36px' }}>
              {enrollStatus === 'coming_soon'
                ? 'Register your interest and we will notify you when enrollment opens.'
                : `Next batch starts ${program.upcomingBatch}.`}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={() => setApplyOpen(true)}>{ctaLabel} →</Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/contact')}>Talk to an advisor</Button>
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
