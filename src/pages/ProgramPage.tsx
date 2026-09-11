import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, FadeIn, EnrollmentModal, PageShell } from '../components/shared'
import {
  T, Section, SectionHeader, Eyebrow, Button, Badge,
} from '../components/ui'
import { resolveAuroraTheme, getDomainAccent, type AuroraThemeId } from '../aurora-themes'
import {
  ProgramOutcomesSection,
  ProgramLearningSection,
  ProgramCareerSection,
  ProgramAssessmentSection,
} from '../components/program/ProgramSections'
import {
  AssessmentPanel,
  ContentRail,
  ContextHeader,
  CurriculumNav,
  ProductLayout,
  StickyActionBar,
} from '../components/product-ui'
import { programs } from '../data'
import type { ProgramType, EnrollmentStatus } from '../data'
import { isProgramEnrollable } from '../lib/catalog-api'
import { useCatalogProgram } from '../hooks/useCatalog'
import { worldForProgramType } from '../skylent-worlds'

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

const CATALOG_LOADING_CTA = 'Checking availability…'

function programEnrollmentCtaLabel({
  catalogLoading,
  enrollable,
  status,
  programType,
  surface,
}: {
  catalogLoading: boolean
  enrollable: boolean
  status: EnrollmentStatus
  programType: ProgramType
  surface: 'primary' | 'panel'
}): string {
  if (catalogLoading) return CATALOG_LOADING_CTA
  if (enrollable) {
    return programType === 'PROFESSIONAL' ? 'Apply Now' : CTA_LABEL.open
  }
  if (surface === 'panel') {
    if (status === 'coming_soon') return 'Launching soon'
    if (status === 'waitlist') return 'Join waitlist'
    return 'Enrollment not available yet'
  }
  if (status === 'waitlist') return CTA_LABEL.waitlist
  if (status === 'coming_soon') return CTA_LABEL.coming_soon
  return 'Enrollment unavailable'
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

function CheckItem({ label, accent }: { label: string; accent: string }) {
  const color = accent
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
  sections, activeId, ctaLabel, onCTA, ctaDisabled,
}: {
  sections: NavSection[]
  activeId: string
  ctaLabel: string
  onCTA: () => void
  accent: ReturnType<typeof getDomainAccent>
  ctaDisabled?: boolean
}) {
  return (
    <nav className="product-header" style={{ position: 'sticky', top: T.navH, zIndex: 80, background: '#fff', marginBottom: 0, padding: '8px 0' }} aria-label="Programme sections">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div className="product-tabs program-sticky-nav-scroll">
          {sections.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              aria-current={activeId === s.id ? 'location' : undefined}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="product-btn"
          onClick={onCTA}
          disabled={ctaDisabled}
        >
          {ctaLabel}
        </button>
      </div>
    </nav>
  )
}

// ─── ENROLLMENT PANEL ─────────────────────────────────────────────────────────

function programPathway(type: ProgramType): string[] {
  if (type === 'EXAM_PREP') return ['Syllabus', 'Preparation', 'Practice', 'Tests', 'Assessment', 'Admissions path']
  if (type === 'SCHOOLING') return ['Grade', 'Subject', 'Concept', 'Activity', 'Assessment']
  if (type === 'UNDERGRADUATE') return ['Degree', 'Curriculum', 'Labs', 'Projects', 'Internships', 'Progression']
  if (type === 'POSTGRADUATE') return ['Specialisation', 'Coursework', 'Research', 'Capstone', 'Faculty', 'Pathways']
  return ['Skills', 'Curriculum', 'Projects', 'Practice', 'Evidence', 'Career relevance']
}

function EnrollmentPanel({
  program, status, ctaLabel, onCTA, accent, lowestPrice, multipleTiers, enrollable, catalogLoading,
}: {
  program: NonNullable<ReturnType<typeof programs.find>>
  status: EnrollmentStatus
  ctaLabel: string
  onCTA: () => void
  accent: ReturnType<typeof getDomainAccent>
  lowestPrice: number
  multipleTiers: boolean
  enrollable: boolean
  catalogLoading: boolean
}) {
  const isCareerOS = !!program.careerSupport

  return (
    <div>
      <h2 className="product-filter-title">Programme summary</h2>
      <p style={{ margin: '0 0 8px', fontSize: '1.45rem', fontWeight: 750, letterSpacing: '-0.03em' }}>
        ₹{lowestPrice.toLocaleString('en-IN')}
      </p>
      {multipleTiers && <p className="panel-note" style={{ marginTop: 0 }}>Multiple plans below</p>}
      <ul className="assessment-list">
        <li><strong>{status === 'coming_soon' ? 'Planned' : 'Next batch'}</strong><span className="product-count">{program.upcomingBatch}</span></li>
        <li><strong>Duration</strong><span className="product-count">{program.duration}</span></li>
        <li><strong>Format</strong><span className="product-count">{program.format}</span></li>
        <li><strong>Credential</strong><span className="product-count">{program.cert}</span></li>
        {isCareerOS ? <li><strong>Career OS</strong><span className="product-count">Unlocks on completion</span></li> : null}
      </ul>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        <Button
          variant="primary"
          full
          themeId={program.slug ? resolveAuroraTheme(`/programs/${program.slug}`, program.slug, program.programType) : undefined}
          onClick={catalogLoading ? undefined : onCTA}
          style={catalogLoading ? { opacity: 0.72, cursor: 'not-allowed' } : undefined}
        >
          {catalogLoading ? ctaLabel : enrollable ? `${ctaLabel} →` : ctaLabel}
        </Button>
        <Link to="/contact" className="product-btn-ghost">Talk to an advisor</Link>
      </div>
      <p className="panel-note">Enrollment uses the live catalogue status. Assessment stays in the programme.</p>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ProgramPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const program = programs.find(p => p.slug === slug)
  const catalog = useCatalogProgram(slug)

  const [curriculumOpen, setCurriculumOpen] = useState<string | null>(null)
  const [faqOpen, setFaqOpen] = useState<string | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [featuredProject, setFeaturedProject] = useState(0)

  const isExamPrep = program?.programType === 'EXAM_PREP'
  const isCareerOS = !!program?.careerSupport
  const enrollStatus = (catalog.data?.enrollmentStatus ?? program?.enrollmentStatus ?? 'open') as EnrollmentStatus
  const catalogLoading = catalog.loading
  const enrollable = Boolean(catalog.data && isProgramEnrollable(catalog.data))
  const moduleCount = catalog.data?.moduleCount ?? program?.modules ?? 0
  const projectCount = catalog.data?.projectCount ?? program?.projects ?? 0
  const catalogPricing = catalog.data?.pricing.length ? catalog.data.pricing : null
  const staticPricing = program?.pricing ?? []
  const pricingTiers = catalogPricing ?? staticPricing
  const lowestPrice = pricingTiers.length ? Math.min(...pricingTiers.map((tier) => tier.price)) : 0
  const typeLabel = program ? TYPE_LABELS[program.programType] : ''
  const ctaLabel = program
    ? programEnrollmentCtaLabel({
      catalogLoading,
      enrollable,
      status: enrollStatus,
      programType: program.programType,
      surface: 'primary',
    })
    : ''
  const panelCtaLabel = program
    ? programEnrollmentCtaLabel({
      catalogLoading,
      enrollable,
      status: enrollStatus,
      programType: program.programType,
      surface: 'panel',
    })
    : ''
  const auroraTheme: AuroraThemeId = program ? resolveAuroraTheme(`/programs/${program.slug}`, program.slug, program.programType) : 'general'
  const domainAccent = getDomainAccent(auroraTheme)

  const navSections: NavSection[] = program ? [
    { id: 'overview', label: 'Overview' },
    { id: 'outcomes', label: 'Outcomes' },
    { id: 'assessment', label: 'Assessment' },
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

  const highlightTier = pricingTiers.find(p => p.highlight) ?? pricingTiers[0]
  const allPricingFeatures = Array.from(new Set(pricingTiers.flatMap(p => p.features)))
  const world = worldForProgramType(program.programType)
  const pathway = programPathway(program.programType)
  const assessmentItems = isExamPrep
    ? [
        { title: 'Practice', detail: 'Timed questions, then worked solutions.' },
        { title: 'Tests', detail: 'Section tests and mocks after you attempt them.' },
        { title: 'Review', detail: 'Wrong-answer review in the learning workspace.' },
      ]
    : [
        { title: 'Module work', detail: 'Exercises and checkpoints inside the curriculum.' },
        { title: 'Projects', detail: projectCount ? `${projectCount} assessed project${projectCount === 1 ? '' : 's'}` : 'Project work as published in the curriculum.' },
        { title: 'Credential', detail: program.cert },
      ]

  return (
    <PageShell aurora={false} auroraTheme={auroraTheme}>
      <div className={`product-shell program-pdp program-pdp--${world}`} data-world={world}>
      <ContentRail>
      <section id="program-hero">
        <ContextHeader
          world={world}
          eyebrow={typeLabel}
          title={program.name}
          description={program.desc}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Programmes', href: '/programs' },
            { label: program.name },
          ]}
          actions={
            <>
              <Button variant="primary" themeId={auroraTheme} onClick={catalogLoading ? undefined : () => setApplyOpen(true)} style={catalogLoading ? { opacity: 0.72, cursor: 'not-allowed' } : undefined}>{ctaLabel}</Button>
              <Button variant="secondary" onClick={() => scrollToSection(program.curriculumDetail?.length ? 'curriculum' : 'assessment')}>
                {isExamPrep ? 'View syllabus' : 'View curriculum'}
              </Button>
            </>
          }
        />

        <p className="programme-meta" style={{ marginTop: -8, marginBottom: 18 }}>
          <span>{program.level}</span>
          <span>{program.duration}</span>
          <span>{program.format}</span>
          {isCareerOS ? <span>Career OS</span> : null}
          {enrollStatus === 'coming_soon' ? <span>Coming soon</span> : null}
        </p>

        <ProductLayout
          variant="pdp"
          sidebar={
            <EnrollmentPanel
              program={program}
              status={enrollStatus}
              ctaLabel={panelCtaLabel}
              onCTA={() => setApplyOpen(true)}
              accent={domainAccent}
              lowestPrice={lowestPrice}
              multipleTiers={pricingTiers.length > 1}
              enrollable={enrollable}
              catalogLoading={catalogLoading}
            />
          }
        >
          <div className="pdp-main">
            <div>
              <p style={{ margin: '0 0 10px', fontWeight: 650 }}>Who it is for / outcome</p>
              <p className="product-lede" style={{ margin: 0 }}>{program.outcome}</p>
              <ul className="world-pathway" aria-label="Programme path">
                {pathway.map((step) => <li key={step}>{step}</li>)}
              </ul>
            </div>
            <AssessmentPanel items={assessmentItems} />
            {program.curriculumDetail?.length ? (
              <CurriculumNav
                items={program.curriculumDetail.map((mod) => ({ id: mod.number, label: `${mod.number} ${mod.title}`, meta: mod.duration }))}
                current={curriculumOpen ?? undefined}
              />
            ) : null}
          </div>
        </ProductLayout>
      </section>

      <StickyProgramNav sections={navSections} activeId={activeSection} ctaLabel={ctaLabel} onCTA={() => setApplyOpen(true)} accent={domainAccent} ctaDisabled={catalogLoading} />
      </ContentRail>

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

      <ProgramOutcomesSection program={program} themeId={auroraTheme} accent={domainAccent} />
      <ProgramAssessmentSection program={program} />

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

          <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'minmax(220px, 0.85fr) 1fr', gap: 'clamp(28px,4vw,48px)', alignItems: 'start' }} className="two-col program-curriculum-layout">
            {program.curriculumDetail && (
              <FadeIn>
                <CurriculumNav
                  items={program.curriculumDetail.map(m => ({ id: m.number, label: m.title, meta: m.duration }))}
                  current={curriculumOpen ?? undefined}
                />
              </FadeIn>
            )}
            <div style={{ position: 'relative' }}>
            {program.curriculumDetail.map((mod, i) => {
              const isOpen = curriculumOpen === mod.number
              const isLast = i === program.curriculumDetail!.length - 1
              return (
                <FadeIn key={mod.number} delay={i * 30}>
                  <div id={`module-${mod.number}`} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '0 24px', position: 'relative' }} className="program-curriculum-row">
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
              lead="Portfolio-ready work reviewed by mentors — applied deliverables, not placeholder exercises."
            />
          </FadeIn>

          {/* Featured project artifact */}
          {program.projectsDetail[featuredProject] && (() => {
            const proj = program.projectsDetail![featuredProject]
            const diffColor = proj.difficulty === 'Beginner' ? '#4ade80' : proj.difficulty === 'Intermediate' ? '#fbbf24' : '#f87171'
            return (
              <FadeIn delay={40}>
                <div style={{ marginTop: 36 }} className="program-project-featured">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span className="skylent-label">Project {String(featuredProject + 1).padStart(2, '0')}</span>
                      <span style={{ color: diffColor, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{proj.difficulty}</span>
                    </div>
                    <h3 className="skylent-display-sm" style={{ color: C.ink, margin: '0 0 14px' }}>{proj.title}</h3>
                    <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.7, margin: '0 0 14px' }}>{proj.what}</p>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.slate }}>
                      {proj.skills.join(' · ')}
                    </div>
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
      <ProgramLearningSection program={program} themeId={auroraTheme} accent={domainAccent} isExamPrep={isExamPrep} />

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
                    width: 52, height: 52, borderRadius: '50%', background: domainAccent.subtle,
                    border: `1px solid ${domainAccent.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: domainAccent.primary, fontFamily: 'var(--font-display)',
                  }}>
                    {f.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 4 }}>{f.name}</div>
                    <div className="skylent-label" style={{ color: domainAccent.text, marginBottom: 8 }}>{f.role}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>{f.expertise}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Section>
      )}

      {/* ── CAREER OS ─────────────────────────────────────────────────────── */}
      {isCareerOS && <ProgramCareerSection themeId={auroraTheme} accent={domainAccent} />}

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
              <div className="action-panel" style={{ textAlign: 'center' }}>
                <div className="skylent-label" style={{ marginBottom: 6 }}>Credential</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{program.cert}</div>
                <div className="panel-note">Verifiable on completion</div>
              </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: `1.4fr repeat(${pricingTiers.length}, 1fr)`, gap: 0, borderBottom: `1px solid ${T.lineDark}` }}>
              <div style={{ padding: '16px 0', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Plan</div>
              {pricingTiers.map(tier => (
                <div key={tier.name} style={{ padding: '16px 20px', textAlign: 'center', borderLeft: `1px solid ${T.lineDark}`, background: tier.highlight ? domainAccent.subtle : 'transparent' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: tier.highlight ? domainAccent.text : C.white }}>{tier.name}</div>
                  {tier.highlight && <div className="skylent-label" style={{ color: domainAccent.text, fontSize: 9, marginTop: 4 }}>Recommended</div>}
                </div>
              ))}
            </div>
            {/* Prices */}
            <div style={{ display: 'grid', gridTemplateColumns: `1.4fr repeat(${pricingTiers.length}, 1fr)`, gap: 0, borderBottom: `1px solid ${T.lineDark}` }}>
              <div style={{ padding: '20px 0', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Price</div>
              {pricingTiers.map(tier => (
                <div key={tier.name} style={{ padding: '20px', textAlign: 'center', borderLeft: `1px solid ${T.lineDark}`, background: tier.highlight ? `${domainAccent.subtle}` : 'transparent' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: C.white }}>₹{tier.price.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
            {/* Feature rows */}
            {allPricingFeatures.map((feature, fi) => (
              <div key={feature} style={{ display: 'grid', gridTemplateColumns: `1.4fr repeat(${pricingTiers.length}, 1fr)`, gap: 0, borderBottom: `1px solid ${T.lineDark}` }}>
                <div style={{ padding: '14px 0', color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.4 }}>{feature}</div>
                {pricingTiers.map(tier => (
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
            <div style={{ display: 'grid', gridTemplateColumns: `1.4fr repeat(${pricingTiers.length}, 1fr)`, gap: 0, paddingTop: 24 }}>
              <div />
              {pricingTiers.map(tier => (
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
      <section style={{ padding: `${T.sectionTight} ${T.gutter}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <Eyebrow tone="dark" accent>Get started</Eyebrow>
            <h2 className="skylent-display-md" style={{ color: C.ink, margin: '20px 0 16px' }}>
              {enrollStatus === 'coming_soon'
                ? `Be notified when ${program.name} opens`
                : `Ready to begin ${program.name}?`}
            </h2>
            <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.75, margin: '0 0 36px' }}>
              {enrollStatus === 'coming_soon'
                ? 'Register your interest and we will notify you when enrollment opens.'
                : `Next batch starts ${program.upcomingBatch}.`}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={catalogLoading ? undefined : () => setApplyOpen(true)} style={catalogLoading ? { opacity: 0.72, cursor: 'not-allowed' } : undefined}>{ctaLabel}{catalogLoading ? '' : ' →'}</Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/contact')}>Talk to an advisor</Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <StickyActionBar>
        <div>
          <strong>{program.name}</strong>
          <div className="panel-note" style={{ margin: 0 }}>₹{lowestPrice.toLocaleString('en-IN')} · {program.duration}</div>
        </div>
        <button type="button" className="product-btn" disabled={catalogLoading} onClick={() => setApplyOpen(true)}>
          {ctaLabel}
        </button>
      </StickyActionBar>

      {applyOpen && (
        <EnrollmentModal
          item={{
            kind: 'program',
            slug: program.slug,
            title: program.name,
            price: highlightTier.price,
            enrollmentStatus: enrollStatus,
            enrollable,
            linkedCourseSlugs: catalog.data?.linkedCourseSlugs ?? [],
          }}
          themeId={auroraTheme}
          onClose={() => setApplyOpen(false)}
        />
      )}
      </div>
    </PageShell>
  )
}
