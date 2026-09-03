import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C, FadeIn, EnrollmentModal, PageShell } from '../components/shared'
import { T } from '../components/ui'
import { stories } from '../data'
import type { Program, ProgramType, EnrollmentStatus, PricingTier } from '../data'
import { PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO, MEDIA } from '../media'
import { ProgramHeroVisual } from '../components/premium'
import { useAuth } from '../context/AuthContext'
import { fetchProgramBySlug } from '../api/programDetail'
import { fetchSchoolingProgram, type SchoolingProgramOverview } from '../api/schooling'
import { fetchUndergraduateProgram, type UndergraduateProgramOverview } from '../api/undergraduate'
import { fetchPostgraduateProgram, type PostgraduateProgramOverview } from '../api/postgraduate'
import { fetchExamProgram, type ExamProgramOverview } from '../api/exams'
import { fetchSkillsProgram, type SkillsProgramOverview, type WebinarProgramOverview, type CertificateProgramOverview, type ProfessionalProgramOverview } from '../api/skills'
import { fetchMyEnrollments, findEnrollmentForProgram } from '../api/enrollments'
import { getCurriculumModel, PROGRAM_SEGMENTS } from '../lib/programSegments'
import { VS } from '../lib/visualSystem'
import { resolveProgramContext, getContextualCtaLabel } from '../lib/programContext'
import { programBreadcrumbs } from '../lib/breadcrumbs'
import { Breadcrumbs } from '../components/contextual/Breadcrumbs'
import { WorkRealitySection } from '../components/contextual/WorkRealitySection'
import { ExamWorkflowPanel, SegmentWorkflowPanel } from '../components/contextual/ExamWorkflowPanel'
import { SchoolingProgramSections } from '../components/schooling/SchoolingProgramSections'
import { UndergraduateProgramSections } from '../components/undergraduate/UndergraduateProgramSections'
import { UGProgramHero } from '../components/undergraduate/UGProgramHero'
import { PostgraduateProgramSections } from '../components/postgraduate/PostgraduateProgramSections'
import { PGProgramHero } from '../components/postgraduate/PGProgramHero'
import { ExamProgramHero } from '../components/exams/ExamProgramHero'
import { ExamProgramSections } from '../components/exams/ExamProgramSections'
import { WebinarProgramHero, CertificateProgramHero, ProfessionalProgramHero } from '../components/skills/SkillsProgramHero'
import { SkillsProgramSections } from '../components/skills/SkillsProgramSections'
import {
  isSubjectNativeFlagship,
  SubjectNativeProgramHero,
  SubjectNativeProfessionalSections,
} from '../components/subjectNative'
import {
  getContextFlagshipKind,
  isContextNativeFlagship,
  CatFlagshipHero,
  CatFlagshipSections,
  DataAnalyticsFlagshipHero,
  DataAnalyticsFlagshipSections,
  JeeFlagshipHero,
  JeeFlagshipSections,
  NeetFlagshipHero,
  NeetFlagshipSections,
} from '../components/flagship'

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ProgramType, string> = Object.fromEntries(
  Object.entries(PROGRAM_SEGMENTS).map(([key, config]) => [key, config.label]),
) as Record<ProgramType, string>

const CTA_LABEL: Record<EnrollmentStatus, string> = {
  open: 'Enroll Now',
  waitlist: 'Join Waitlist',
  coming_soon: 'Register Interest',
  closed: 'Enrollment Closed',
}

function curriculumModelFor(programType: ProgramType): string {
  return getCurriculumModel(programType)
}

type ApiPricingTier = PricingTier & { label?: string; amount?: number; currency?: string }

function normalizePricingTier(tier: ApiPricingTier): PricingTier {
  const price = tier.price ?? tier.amount ?? 0
  return {
    name: tier.name ?? tier.label ?? 'Plan',
    price,
    originalPrice: tier.originalPrice ?? price,
    features: tier.features ?? [],
    highlight: tier.highlight,
  }
}

function normalizedPricing(program: Program): PricingTier[] {
  return (program.pricing as ApiPricingTier[]).map(normalizePricingTier)
}

const DEFAULT_PHOTO = DEFAULT_PROGRAM_PHOTO

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function MonoLabel({ children, tone = 'light' }: { children: React.ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <div style={{
      color: tone === 'dark' ? 'rgba(255,255,255,0.3)' : VS.textSecondary,
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
      <span style={{ color: dark ? 'rgba(255,255,255,0.72)' : VS.textPrimary, fontSize: 13.5, lineHeight: 1.55 }}>{label}</span>
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
    <nav className="program-sticky-nav" aria-label="Program sections" style={{
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
              type="button"
              aria-current={activeId === s.id ? 'true' : undefined}
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
  program: Program
  status: EnrollmentStatus
  ctaLabel: string
  onCTA: () => void
}) {
  if (!program) return null
  const tiers = normalizedPricing(program)
  const lowestPrice = tiers.length ? Math.min(...tiers.map(p => p.price)) : 0
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
          {program.pricing[0]?.originalPrice != null && program.pricing[0].originalPrice > lowestPrice && (
            <div style={{ color: C.slate, fontSize: 13, textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>
              ₹{(program.pricing[0].originalPrice ?? 0).toLocaleString('en-IN')}
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
            text: 'Career OS on program completion',
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
        <Link
          to="/contact"
          style={{ display: 'block', textAlign: 'center', color: C.slate, fontSize: 13, textDecoration: 'none', padding: '6px 0', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
          onMouseLeave={e => (e.currentTarget.style.color = C.slate)}
        >
          Talk to an advisor
        </Link>
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
  const { user } = useAuth()

  const [program, setProgram] = useState<Program | undefined>(undefined)
  const [schoolingOverview, setSchoolingOverview] = useState<SchoolingProgramOverview | null>(null)
  const [undergraduateOverview, setUndergraduateOverview] = useState<UndergraduateProgramOverview | null>(null)
  const [postgraduateOverview, setPostgraduateOverview] = useState<PostgraduateProgramOverview | null>(null)
  const [examOverview, setExamOverview] = useState<ExamProgramOverview | null>(null)
  const [skillsOverview, setSkillsOverview] = useState<SkillsProgramOverview | null>(null)
  const [programLoading, setProgramLoading] = useState(true)

  const [curriculumOpen, setCurriculumOpen] = useState<string | null>(null)
  const [faqOpen, setFaqOpen] = useState<string | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [offeringId, setOfferingId] = useState<string | undefined>()
  const [learnCourseSlug, setLearnCourseSlug] = useState<string | null>(null)
  const [userEnrollmentId, setUserEnrollmentId] = useState<string | null>(null)

  const isExamPrep = program?.programType === 'EXAM_PREP'
  const isSchooling = program?.programType === 'SCHOOLING'
  const isUndergraduate = program?.programType === 'UNDERGRADUATE'
  const isPostgraduate = program?.programType === 'POSTGRADUATE'
  const isWebinar = program?.programType === 'WEBINAR'
  const isCertificate = program?.programType === 'CERTIFICATE'
  const isProfessionalSkills = program?.programType === 'PROFESSIONAL'
  const isCareerOS = !!program?.careerSupport
  const enrollStatus = (program?.enrollmentStatus ?? 'open') as EnrollmentStatus
  const typeLabel = program ? TYPE_LABELS[program.programType] : ''
  const heroPhoto = program ? (PROGRAM_PHOTO[program.slug] ?? DEFAULT_PHOTO) : DEFAULT_PHOTO
  const programContext = program ? resolveProgramContext(program) : null
  const isSubjectNative = isSubjectNativeFlagship(slug)
  const contextFlagship = getContextFlagshipKind(slug)
  const isContextFlagship = isContextNativeFlagship(slug)

  useEffect(() => {
    if (!slug) return
    setProgramLoading(true)
    Promise.all([
      fetchProgramBySlug(slug).catch(() => null),
      fetchSchoolingProgram(slug).catch(() => null),
      fetchUndergraduateProgram(slug).catch(() => null),
      fetchPostgraduateProgram(slug).catch(() => null),
      fetchExamProgram(slug).catch(() => null),
      fetchSkillsProgram(slug).catch(() => null),
    ])
      .then(([apiProgram, schooling, undergraduate, postgraduate, exam, skills]) => {
        if (apiProgram) {
          setProgram(apiProgram as Program)
          setOfferingId(apiProgram.primaryOffering?.id)
          setLearnCourseSlug(apiProgram.learnCourseSlug ?? null)
        } else {
          setProgram(undefined)
        }
        if (schooling) setSchoolingOverview(schooling)
        if (undergraduate) setUndergraduateOverview(undergraduate)
        if (postgraduate) setPostgraduateOverview(postgraduate)
        if (exam) setExamOverview(exam)
        if (skills) setSkillsOverview(skills)
      })
      .finally(() => setProgramLoading(false))
  }, [slug])

  useEffect(() => {
    if (!user || !slug) {
      setUserEnrollmentId(null)
      return
    }
    fetchMyEnrollments()
      .then(rows => {
        const match = findEnrollmentForProgram(rows, slug)
        setUserEnrollmentId(match?.id ?? null)
      })
      .catch(() => setUserEnrollmentId(null))
  }, [user, slug])

  const isEnrolled = !!userEnrollmentId
  const offeringClosed = enrollStatus === 'closed'
  const offeringComingSoon = enrollStatus === 'coming_soon'

  const ctaLabel = isEnrolled
    ? 'Continue Learning'
    : offeringClosed
      ? 'Enrollment Closed'
      : offeringComingSoon
        ? CTA_LABEL.coming_soon
        : programContext
          ? getContextualCtaLabel(programContext, false)
          : program?.programType === 'PROFESSIONAL' && enrollStatus === 'open'
            ? 'Apply Now'
            : CTA_LABEL[enrollStatus] ?? 'Enroll Now'

  function handleCta() {
    if (isEnrolled && slug) {
      navigate(`/learn/${slug}`)
      return
    }
    if (offeringClosed || offeringComingSoon) return
    if (!user) {
      navigate('/login')
      return
    }
    setApplyOpen(true)
  }

  // Build nav sections based on available data
  const navSections: NavSection[] = program ? [
    ...(contextFlagship === 'data-analytics'
      ? [
          { id: 'analyst-work', label: 'What you do' },
          { id: 'curriculum-map', label: 'Curriculum' },
          { id: 'projects', label: 'Projects' },
          { id: 'tools', label: 'Tools' },
          { id: 'career-connection', label: 'Career' },
          { id: 'pricing', label: 'Fees' },
        ]
      : contextFlagship === 'jee' || contextFlagship === 'neet' || contextFlagship === 'cat'
        ? [
            { id: 'exam-workflow', label: 'Journey' },
            { id: 'sections', label: 'Subjects' },
            { id: 'curriculum-map', label: 'Topics' },
            { id: 'tests', label: 'Tests' },
            { id: 'performance', label: 'Performance' },
          ]
        : isSubjectNative
          ? [
              { id: 'learner-work', label: 'What you do' },
              { id: 'work-reality', label: programContext?.workflowSectionLabel ?? 'Workflow' },
              { id: 'modules', label: 'Curriculum' },
            ]
          : [{ id: 'overview', label: 'Overview' }]),
    ...(!isContextFlagship && !isSubjectNative && isProfessionalSkills && programContext?.discipline ? [{ id: 'work-reality', label: programContext.workflowSectionLabel }] : []),
    ...(!isContextFlagship && isExamPrep && examOverview ? [{ id: 'exam-workflow', label: programContext?.workflowSectionLabel ?? 'Preparation' }] : []),
    ...(isSchooling ? [{ id: 'schooling-workflow', label: 'Schooling Journey' }] : []),
    ...(isUndergraduate ? [{ id: 'degree-workflow', label: 'Degree Ecosystem' }] : []),
    ...(isPostgraduate ? [{ id: 'pg-workflow', label: 'Programme Structure' }] : []),
    ...(isSchooling && schoolingOverview?.subjects.length ? [{ id: 'subjects', label: 'Subjects' }] : []),
    ...(isUndergraduate && undergraduateOverview?.semesters.length ? [{ id: 'semesters', label: 'Semesters' }] : []),
    ...(isUndergraduate && undergraduateOverview?.subjects.length ? [{ id: 'subjects', label: 'Subjects' }] : []),
    ...(isSchooling && schoolingOverview?.curriculumTree.length
      ? [{ id: 'curriculum', label: 'Curriculum' }]
      : isUndergraduate && undergraduateOverview?.curriculumTree.length
        ? [{ id: 'curriculum', label: 'Curriculum' }]
        : !isContextFlagship && !isSubjectNative && program.curriculumDetail?.length
          ? [{ id: 'curriculum', label: 'Curriculum' }]
          : []),
    ...(!isContextFlagship && !isSubjectNative && program.projectsDetail?.length ? [{ id: 'projects', label: 'Projects' }] : []),
    ...(!isContextFlagship && !isSubjectNative && program.projectsDetail?.length ? [{ id: 'tools', label: 'Tools' }] : []),
    ...(program.learningExperience?.length || (isSchooling && schoolingOverview?.learningExperience?.length) || (isUndergraduate && undergraduateOverview?.learningExperience?.length)
      ? [{ id: 'experience', label: 'Learning' }]
      : []),
    ...(isSchooling && schoolingOverview?.assessments.length ? [{ id: 'assessment', label: 'Assessment' }] : []),
    ...(isUndergraduate && undergraduateOverview?.assessments.length ? [{ id: 'assessment', label: 'Assessment' }] : []),
    ...(isUndergraduate && undergraduateOverview?.careerReadiness?.length ? [{ id: 'career-readiness', label: 'Career' }] : []),
    ...(isPostgraduate && postgraduateOverview?.terms.length ? [{ id: 'terms', label: 'Terms' }] : []),
    ...(isPostgraduate && postgraduateOverview?.specialisations.length ? [{ id: 'specialisations', label: 'Specialisation' }] : []),
    ...(isPostgraduate && postgraduateOverview?.curriculumTree.length ? [{ id: 'curriculum', label: 'Curriculum' }] : []),
    ...(isPostgraduate && postgraduateOverview?.curriculumTree.length ? [{ id: 'case-studies', label: 'Case Studies' }] : []),
    ...(isPostgraduate && postgraduateOverview?.curriculumTree.length ? [{ id: 'projects', label: 'Projects' }] : []),
    ...(isPostgraduate && postgraduateOverview?.assessments.length ? [{ id: 'assessment', label: 'Assessment' }] : []),
    ...(isPostgraduate && postgraduateOverview?.careerReadiness?.length ? [{ id: 'career', label: 'Career' }] : []),
    ...(!isContextFlagship && isExamPrep && examOverview?.sections.length ? [{ id: 'sections', label: examOverview.structureType === 'section' ? 'Sections' : 'Subjects' }] : []),
    ...(!isContextFlagship && isExamPrep && examOverview?.topics.length ? [{ id: 'topics', label: 'Topics' }] : []),
    ...(!isContextFlagship && isExamPrep && examOverview?.assessments.some(a => a.examMode === 'PRACTICE') ? [{ id: 'practice', label: 'Practice' }] : []),
    ...(!isContextFlagship && isExamPrep && examOverview?.assessments.some(a => a.examMode === 'TEST' || a.examMode === 'MOCK') ? [{ id: 'tests', label: 'Tests & Mocks' }] : []),
    ...(!isContextFlagship && isExamPrep && examOverview ? [{ id: 'performance', label: 'Performance' }] : []),
    ...(isWebinar && skillsOverview?.programType === 'WEBINAR' ? [{ id: 'agenda', label: 'Agenda' }, { id: 'resources', label: 'Resources' }] : []),
    ...(isCertificate && skillsOverview?.programType === 'CERTIFICATE' ? [{ id: 'modules', label: 'Modules' }, { id: 'assessment', label: 'Assessment' }, { id: 'projects', label: 'Project' }, { id: 'certification', label: 'Certification' }] : []),
    ...(isProfessionalSkills && skillsOverview?.programType === 'PROFESSIONAL' && !isSubjectNative
      ? [{ id: 'career-direction', label: 'Career Direction' }, { id: 'modules', label: 'Modules' }, { id: 'projects', label: 'Projects' }, { id: 'career-support', label: 'Career Support' }]
      : []),
    ...(isSubjectNative ? [{ id: 'projects', label: 'Projects' }, { id: 'tools', label: 'Tools' }, { id: 'career-support', label: 'Career' }] : []),
    ...(!isContextFlagship && program.faculty?.length ? [{ id: 'faculty', label: 'Faculty' }] : []),
    ...(isCareerOS ? [{ id: 'career', label: 'Career' }] : []),
    ...(isSchooling || isUndergraduate || isPostgraduate || isExamPrep || isWebinar || isCertificate || isProfessionalSkills ? [{ id: 'enrollment', label: 'Enrollment' }] : []),
    ...(!isExamPrep && !isSchooling && !isUndergraduate && !isPostgraduate && !isWebinar && !isCertificate && !isProfessionalSkills ? [{ id: 'reviews', label: 'Reviews' }] : []),
    ...(program.faqs?.length || schoolingOverview?.faqs?.length || undergraduateOverview?.faqs?.length || postgraduateOverview?.faqs?.length || examOverview?.faqs?.length || (skillsOverview && 'faqs' in skillsOverview ? skillsOverview.faqs?.length : 0) ? [{ id: 'faq', label: 'FAQs' }] : []),
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

  if (programLoading) {
    return (
      <PageShell>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: VS.pageBg }}>
          <div style={{ color: VS.textSecondary, fontSize: 14 }}>Loading program…</div>
        </div>
      </PageShell>
    )
  }

  if (!program) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: VS.pageBg }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: VS.textPrimary, fontSize: 28 }}>Program not found</h2>
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
      {isUndergraduate && undergraduateOverview ? (
        <UGProgramHero
          programName={program.name}
          programDesc={program.desc}
          degreeLabel={undergraduateOverview.degreeLabel}
          level={program.level}
          overview={undergraduateOverview}
          enrolled={isEnrolled}
          ctaLabel={ctaLabel}
          onCta={handleCta}
          onCurriculum={() => {
            const el = document.getElementById('curriculum')
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' })
          }}
          onBack={() => navigate('/programs')}
        />
      ) : isPostgraduate && postgraduateOverview ? (
        <PGProgramHero
          programName={program.name}
          programDesc={program.desc}
          programLabel={postgraduateOverview.programLabel}
          level={program.level}
          overview={postgraduateOverview}
          enrolled={isEnrolled}
          ctaLabel={ctaLabel}
          onCta={handleCta}
          onCurriculum={() => {
            const el = document.getElementById('curriculum')
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' })
          }}
          onBack={() => navigate('/programs')}
        />
      ) : contextFlagship === 'jee' && examOverview ? (
        <JeeFlagshipHero
          program={examOverview}
          ctaLabel={ctaLabel}
          onCta={handleCta}
          isEnrolled={isEnrolled}
        />
      ) : contextFlagship === 'neet' && examOverview ? (
        <NeetFlagshipHero
          program={examOverview}
          ctaLabel={ctaLabel}
          onCta={handleCta}
          isEnrolled={isEnrolled}
        />
      ) : contextFlagship === 'cat' && examOverview ? (
        <CatFlagshipHero
          program={examOverview}
          ctaLabel={ctaLabel}
          onCta={handleCta}
          isEnrolled={isEnrolled}
        />
      ) : isExamPrep && examOverview ? (
        <ExamProgramHero
          program={examOverview}
          ctaLabel={ctaLabel}
          onCta={handleCta}
          isEnrolled={isEnrolled}
        />
      ) : contextFlagship === 'data-analytics' ? (
        <DataAnalyticsFlagshipHero
          program={program}
          ctaLabel={ctaLabel}
          onCta={handleCta}
          isEnrolled={isEnrolled}
          onBack={() => navigate('/education/skills/professional')}
        />
      ) : isWebinar && skillsOverview?.programType === 'WEBINAR' ? (
        <WebinarProgramHero
          overview={skillsOverview as WebinarProgramOverview}
          ctaLabel={ctaLabel}
          onCta={handleCta}
          isEnrolled={isEnrolled}
          onBack={() => navigate('/education/skills')}
        />
      ) : isCertificate && skillsOverview?.programType === 'CERTIFICATE' ? (
        <CertificateProgramHero
          overview={skillsOverview as CertificateProgramOverview}
          ctaLabel={ctaLabel}
          onCta={handleCta}
          isEnrolled={isEnrolled}
          onBack={() => navigate('/education/skills')}
        />
      ) : isSubjectNative && isProfessionalSkills && skillsOverview?.programType === 'PROFESSIONAL' ? (
        <SubjectNativeProgramHero
          slug={slug!}
          overview={skillsOverview as ProfessionalProgramOverview}
          ctaLabel={ctaLabel}
          onCta={handleCta}
          isEnrolled={isEnrolled}
          onBack={() => navigate('/education/skills')}
        />
      ) : isProfessionalSkills && skillsOverview?.programType === 'PROFESSIONAL' ? (
        <ProfessionalProgramHero
          overview={skillsOverview as ProfessionalProgramOverview}
          ctaLabel={ctaLabel}
          onCta={handleCta}
          isEnrolled={isEnrolled}
          onBack={() => navigate('/education/skills')}
        />
      ) : (
      <section id="program-hero" style={{ background: C.ink, padding: '88px clamp(16px,4vw,32px) 0' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'clamp(32px,5vw,64px)', alignItems: 'start', paddingBottom: 48 }} className="program-detail-grid">
            <div>
              <button
              onClick={() => navigate('/programs')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 24, padding: 0, letterSpacing: '0.06em' }}
            >
              ← ALL PROGRAMS
            </button>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: 'rgba(243,107,33,0.14)', border: '1px solid rgba(243,107,33,0.3)', borderRadius: 6, padding: '4px 12px', color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                    {typeLabel.toUpperCase()}
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 12px', color: 'rgba(255,255,255,0.55)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                    {program.level}
                  </span>
                  {isCareerOS && (
                    <span style={{ background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.25)', borderRadius: 6, padding: '4px 12px', color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                      + CAREER OS
                    </span>
                  )}
                  {enrollStatus === 'coming_soon' && (
                    <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 12px', color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                      COMING SOON
                    </span>
                  )}
                </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(34px,5vw,56px)', color: C.white, letterSpacing: '-0.03em', lineHeight: 1.03, margin: '0 0 14px' }}>
                  {program.name}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 16, lineHeight: 1.72, maxWidth: 560, margin: '0 0 20px' }}>
                  {program.desc}
                </p>
                <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 24, maxWidth: 560 }}>
                  <ProgramHeroVisual
                    discipline={programContext?.discipline}
                    visualTone={programContext?.visualTone}
                    examCode={programContext?.examCode}
                    programName={program.name}
                  />
                </div>

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
                    onClick={handleCta}
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
                onCTA={handleCta}
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
      )}

      {/* ── BREADCRUMBS ─────────────────────────────────────────────────────── */}
      <div style={{ background: C.ink, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px clamp(16px,4vw,32px)' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <Breadcrumbs items={programBreadcrumbs({ name: program.name, slug: program.slug, programType: program.programType })} tone="dark" />
        </div>
      </div>

      {/* ── STICKY SECTION NAV ──────────────────────────────────────────────── */}
      <StickyProgramNav
        sections={navSections}
        activeId={activeSection}
        ctaLabel={ctaLabel}
        onCTA={handleCta}
      />

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}

      {/* OVERVIEW: what you'll learn + who it's for (non-flagship professional programs) */}
      {!isContextFlagship && !isSubjectNative && (
      <section id="overview" style={{ background: VS.pageBg, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <FadeIn>
            <div id="why" style={{ marginBottom: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,48px)' }} className="two-col">
              <div>
                <MonoLabel>Why this program</MonoLabel>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: VS.textPrimary, margin: '0 0 14px', letterSpacing: '-0.025em' }}>
                  {program.outcome}
                </h2>
                <p style={{ color: VS.textSecondary, fontSize: 16, lineHeight: 1.75, margin: 0 }}>{program.desc}</p>
              </div>
              <div style={{ background: VS.surface, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: '24px 26px' }}>
                <div style={{ fontSize: 12, color: VS.textSecondary, fontFamily: 'var(--font-mono)', marginBottom: 12 }}>AT A GLANCE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Type', typeLabel],
                    ['Duration', program.duration],
                    ['Mode', program.format],
                    ['Certification', program.cert],
                    ...(isCareerOS ? [['Career support', 'Career OS on completion']] : []),
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: `1px solid ${VS.hairline}`, paddingBottom: 8 }}>
                      <span style={{ color: VS.textSecondary, fontSize: 13 }}>{k}</span>
                      <span style={{ color: VS.textPrimary, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
          {program.whatYouWillLearn && program.whatYouWillLearn.length > 0 && (
            <FadeIn>
              <div style={{ marginBottom: 56 }}>
                <MonoLabel>What you will learn</MonoLabel>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: VS.textPrimary, margin: '0 0 28px', letterSpacing: '-0.025em' }}>
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
              <div style={{ background: VS.surface, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: 'clamp(24px,4vw,40px)', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'clamp(24px,4vw,48px)', alignItems: 'start' }} className="two-col-sm">
                <div>
                  <MonoLabel>Who is this for</MonoLabel>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,2.4vw,28px)', fontWeight: 600, color: VS.textPrimary, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    Built for the right person.
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {program.whoIsItFor.map((who, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(243,107,33,0.15)', border: '1px solid rgba(243,107,33,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 1.6 }}>{who}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </section>
      )}

      {contextFlagship === 'data-analytics' && (
        <DataAnalyticsFlagshipSections program={program} ctaLabel={ctaLabel} onCta={handleCta} />
      )}

      {isSubjectNative && isProfessionalSkills && skillsOverview?.programType === 'PROFESSIONAL' && slug && (
        <SubjectNativeProfessionalSections
          slug={slug}
          overview={skillsOverview as ProfessionalProgramOverview}
          programCurriculum={program.curriculumDetail}
        />
      )}

      {!isContextFlagship && !isSubjectNative && isProfessionalSkills && programContext?.discipline && (
        <WorkRealitySection discipline={programContext.discipline} sectionLabel={programContext.workflowSectionLabel} />
      )}

      {contextFlagship === 'jee' && examOverview && <JeeFlagshipSections overview={examOverview} />}
      {contextFlagship === 'neet' && examOverview && <NeetFlagshipSections overview={examOverview} />}
      {contextFlagship === 'cat' && examOverview && <CatFlagshipSections overview={examOverview} />}

      {!isContextFlagship && isExamPrep && examOverview && programContext?.examCode && (
        <ExamWorkflowPanel examCode={programContext.examCode} />
      )}

      {isSchooling && (
        <SegmentWorkflowPanel
          id="schooling-workflow"
          title="How schooling works on Skylent"
          tone="warm"
          steps={[
            { label: 'Grade', detail: 'Aligned to learner level' },
            { label: 'Subject', detail: 'Structured coverage' },
            { label: 'Chapter', detail: 'Topic progression' },
            { label: 'Lesson', detail: 'Guided learning' },
            { label: 'Practice', detail: 'Reinforcement activities' },
            { label: 'Assessment', detail: 'Progress checks' },
            { label: 'Progress', detail: 'Visible to learner, parent, teacher' },
          ]}
          panels={
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="three-col">
              {['Learner view', 'Parent visibility', 'Teacher workflow'].map(role => (
                <div key={role} style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: 18, fontSize: 13, color: C.ink, fontWeight: 600 }}>{role}</div>
              ))}
            </div>
          }
        />
      )}

      {isUndergraduate && (
        <SegmentWorkflowPanel
          id="degree-workflow"
          title="Degree + capability + career direction"
          tone="degree"
          steps={[
            { label: 'Degree' },
            { label: 'Semester' },
            { label: 'Subjects' },
            { label: 'Skills' },
            { label: 'Projects' },
            { label: 'Internship' },
            { label: 'Career' },
          ]}
        />
      )}

      {isPostgraduate && (
        <SegmentWorkflowPanel
          id="pg-workflow"
          title="Advanced programme structure"
          tone="mature"
          steps={[
            { label: 'Programme' },
            { label: 'Specialisation' },
            { label: 'Advanced Modules' },
            { label: 'Cases' },
            { label: 'Projects' },
            { label: 'Research' },
            { label: 'Professional Outcomes' },
          ]}
        />
      )}

      {isSchooling && schoolingOverview && (
        <SchoolingProgramSections
          overview={schoolingOverview}
          enrolled={isEnrolled}
          onContinue={() => slug && navigate(`/learn/${slug}`)}
          onEnroll={handleCta}
          ctaLabel={ctaLabel}
        />
      )}

      {isUndergraduate && undergraduateOverview && (
        <UndergraduateProgramSections
          overview={undergraduateOverview}
          enrolled={isEnrolled}
          onContinue={() => slug && navigate(`/learn/${slug}`)}
          onEnroll={handleCta}
          ctaLabel={ctaLabel}
        />
      )}

      {/* CURRICULUM */}
      {isPostgraduate && postgraduateOverview && (
        <PostgraduateProgramSections
          overview={postgraduateOverview}
          enrolled={isEnrolled}
          onContinue={() => slug && navigate(`/learn/${slug}`)}
          onEnroll={handleCta}
          ctaLabel={ctaLabel}
        />
      )}

      {!isContextFlagship && isExamPrep && examOverview && (
        <ExamProgramSections
          overview={examOverview}
          onEnroll={handleCta}
          ctaLabel={ctaLabel}
          isEnrolled={isEnrolled}
        />
      )}

      {(contextFlagship === 'jee' || contextFlagship === 'neet' || contextFlagship === 'cat') && (
        <section id="enrollment" style={{ background: C.ink, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)' }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto', textAlign: 'center' }}>
            <MonoLabel tone="dark">Enrollment</MonoLabel>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: C.white, margin: '0 0 12px' }}>
              {isEnrolled ? 'Continue in the exam workspace' : 'Enroll to access practice, tests, and mocks'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 24px' }}>
              {isEnrolled ? 'Your preparation history builds from attempts you submit.' : 'Enrollment opens access to published curriculum nodes and timed assessments.'}
            </p>
            <button type="button" onClick={handleCta} style={{ background: isEnrolled ? 'rgba(255,255,255,0.12)' : C.orange, color: C.white, border: isEnrolled ? '1px solid rgba(255,255,255,0.2)' : 'none', borderRadius: 10, padding: '14px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {ctaLabel}
            </button>
          </div>
        </section>
      )}

      {skillsOverview && (isWebinar || isCertificate || (isProfessionalSkills && !isSubjectNative && !isContextFlagship)) && (
        <SkillsProgramSections overview={skillsOverview} />
      )}

      {!isSchooling && !isUndergraduate && !isPostgraduate && !isExamPrep && !isWebinar && !isCertificate && !isProfessionalSkills && program.curriculumDetail && program.curriculumDetail.length > 0 && (
        <section id="curriculum" style={{ background: VS.surface, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: `1px solid ${VS.hairline}` }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end', marginBottom: 40 }} className="two-col-sm">
                <div>
                  <MonoLabel>{isExamPrep ? 'Subjects & sections' : 'Curriculum'}</MonoLabel>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: VS.textPrimary, margin: 0, letterSpacing: '-0.025em' }}>
                    {isExamPrep ? 'Subject and section coverage' : 'What you will study'}
                  </h2>
                  <div style={{ marginTop: 12, color: VS.textSecondary, fontSize: 13 }}>{curriculumModelFor(program.programType)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: VS.textSecondary, fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{program.curriculumDetail.length} {isExamPrep ? 'sections' : 'modules'}</div>
                  {program.duration && <div style={{ color: VS.textPrimary, fontSize: 13, fontWeight: 500 }}>{program.duration}</div>}
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
                    <div style={{ borderBottom: `1px solid ${VS.hairline}` }}>
                      <button
                        onClick={() => setCurriculumOpen(isOpen ? null : mod.number)}
                        style={{ width: '100%', display: 'flex', gap: 18, padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', alignItems: 'flex-start' }}
                      >
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.orange, width: 28, flexShrink: 0, paddingTop: 3, letterSpacing: '0.04em' }}>{mod.number}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: VS.textPrimary, lineHeight: 1.3 }}>{mod.title}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                              <span style={{ color: VS.textSecondary, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{mod.duration}</span>
                              <span style={{ color: C.orange, fontSize: 18, display: 'inline-block', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                            </div>
                          </div>
                          {!isOpen && <div style={{ color: VS.textSecondary, fontSize: 13.5, lineHeight: 1.6, marginTop: 5 }}>{mod.description}</div>}
                        </div>
                      </button>
                      {isOpen && (
                        <div style={{ paddingLeft: 46, paddingBottom: 24 }}>
                          <p style={{ color: VS.textSecondary, fontSize: 14, lineHeight: 1.75, margin: '0 0 16px' }}>{mod.description}</p>
                          {mod.topics && mod.topics.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {mod.topics.map(topic => (
                                <span key={topic} style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: 5, padding: '5px 11px', color: VS.textPrimary, fontSize: 12 }}>{topic}</span>
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
      {!isContextFlagship && !isSubjectNative && program.projectsDetail && program.projectsDetail.length > 0 && (
        <section id="projects" style={{ background: VS.pageBg, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)' }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <MonoLabel>Projects</MonoLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,48px)', alignItems: 'end', marginBottom: 36 }} className="two-col-sm">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: VS.textPrimary, margin: 0, letterSpacing: '-0.025em' }}>
                  What you will build.
                </h2>
                <p style={{ color: VS.textSecondary, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                  Real-world projects reviewed by industry mentors — each one portfolio-ready on completion.
                </p>
              </div>
            </FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {program.projectsDetail.map((proj, i) => {
                const diffColor = proj.difficulty === 'Beginner' ? '#4ade80' : proj.difficulty === 'Intermediate' ? '#fbbf24' : '#f87171'
                return (
                  <FadeIn key={i} delay={i * 60}>
                    <div style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: '24px 26px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: VS.textSecondary, letterSpacing: '0.06em' }}>PROJECT {String(i + 1).padStart(2, '0')}</span>
                        <span style={{ background: `${diffColor}16`, border: `1px solid ${diffColor}40`, borderRadius: 4, padding: '3px 9px', color: diffColor, fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                          {proj.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: VS.textPrimary, margin: '0 0 10px', letterSpacing: '-0.015em', lineHeight: 1.3 }}>{proj.title}</h4>
                      <p style={{ color: VS.textSecondary, fontSize: 13.5, lineHeight: 1.65, margin: '0 0 16px', flex: 1 }}>{proj.what}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 14, borderTop: `1px solid ${VS.hairline}` }}>
                        {proj.skills.map(s => (
                          <span key={s} style={{ background: VS.surface, border: `1px solid ${VS.hairline}`, borderRadius: 5, padding: '4px 10px', color: VS.textPrimary, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{s}</span>
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

      {!isContextFlagship && !isSubjectNative && program.projectsDetail && program.projectsDetail.length > 0 && (
        <section id="tools" style={{ background: VS.surface, padding: 'clamp(36px,6vw,56px) clamp(16px,4vw,32px)' }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <MonoLabel>Tools & technologies</MonoLabel>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,2.8vw,32px)', fontWeight: 600, color: VS.textPrimary, margin: '0 0 20px' }}>What you will work with</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Array.from(new Set(program.projectsDetail.flatMap(p => p.skills))).map(t => (
                <span key={t} style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, color: VS.textPrimary }}>{t}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LEARNING EXPERIENCE */}
      {!isSchooling && !isUndergraduate && !isPostgraduate && !isContextFlagship && !isSubjectNative && program.learningExperience && program.learningExperience.length > 0 && (
        <section id="experience" style={{ background: VS.surface, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: `1px solid ${VS.hairline}` }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <MonoLabel>Learning experience</MonoLabel>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: VS.textPrimary, margin: '0 0 36px', letterSpacing: '-0.025em' }}>
                {isExamPrep ? 'How preparation is structured' : 'How this program is delivered'}
              </h2>
            </FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {program.learningExperience.map((item, i) => (
                <FadeIn key={i} delay={i * 50}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '18px 20px', background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange }} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 1.6 }}>{item}</span>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Community / activities strip — Professional programs */}
            {program.programType === 'PROFESSIONAL' && (
              <FadeIn delay={200}>
                <div style={{ marginTop: 40, borderRadius: T.rCard, overflow: 'hidden', position: 'relative', height: 200 }}>
                  <img
                    src={MEDIA.community.src}
                    alt={MEDIA.community.alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: MEDIA.community.objectPosition, display: 'block' }}
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
      { !isContextFlagship && program.faculty && program.faculty.length > 0 && (
        <section id="faculty" style={{ background: VS.pageBg, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: `1px solid ${VS.hairline}` }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <MonoLabel>{isExamPrep ? 'Subject experts' : 'Faculty'}</MonoLabel>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: VS.textPrimary, margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                {isExamPrep ? 'Who leads this preparation' : 'Who teaches this program'}
              </h2>
              {program.faculty.some(f => f.placeholder) && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: VS.surface, border: `1px solid ${VS.hairline}`, borderRadius: 6, padding: '5px 12px', marginBottom: 28, marginTop: 8 }}>
                  <span style={{ color: VS.textSecondary, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Faculty profiles published when enrollment opens</span>
                </div>
              )}
            </FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginTop: 28 }}>
              {program.faculty.map((f, i) => (
                <FadeIn key={i} delay={i * 70}>
                  <div style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: '24px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(243,107,33,0.12)', border: '2px solid rgba(243,107,33,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18, fontWeight: 700, color: C.orange, fontFamily: 'var(--font-display)' }}>
                      {f.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: VS.textPrimary, marginBottom: 2 }}>{f.name}</div>
                      <div style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.04em' }}>{f.role.toUpperCase()}</div>
                      <div style={{ color: VS.textSecondary, fontSize: 12.5, lineHeight: 1.55 }}>{f.expertise}</div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CAREER SUPPORT (Professional programs) */}
      {isCareerOS && !isContextFlagship && !isSubjectNative && (
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
                    Completing this Professional Program activates Career OS: resume, interview preparation, job board, and applications. Not a vague “career support” line.
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
                    { label: 'Resume & Profile', desc: 'Build and review a professional profile from program work' },
                    { label: 'Interview Prep', desc: 'Role-specific preparation and mock interviews' },
                    { label: 'Job Board', desc: 'Openings you can inspect and apply to' },
                    { label: 'Applications', desc: 'Track submissions you actually send' },
                    { label: 'Career Readiness', desc: 'Recommended actions once you have real progress' },
                    { label: 'Career OS', desc: 'The product that opens on program completion' },
                  ].map(({ label, desc }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 18px' }}>
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
      {!isContextFlagship && !isExamPrep && (
        <section id="reviews" style={{ background: VS.surface, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: `1px solid ${VS.hairline}` }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <MonoLabel>Learner outcomes</MonoLabel>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: VS.textPrimary, margin: 0, letterSpacing: '-0.025em' }}>
                  Real people. Real outcomes.
                </h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: 6, padding: '5px 12px' }}>
                  <span style={{ color: VS.textSecondary, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Sample content — verified stories will appear here</span>
                </div>
              </div>
            </FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 28 }}>
              {stories.slice(0, 3).map((s, i) => (
                <FadeIn key={s.name} delay={i * 70}>
                  <div style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, padding: '26px 24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 28, color: C.orange, fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 14, opacity: 0.6 }}>"</div>
                    <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 1.72, margin: '0 0 22px', flex: 1 }}>{s.provided}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 18, borderTop: `1px solid ${VS.hairline}` }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.orange, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.initials}</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: VS.textPrimary, fontWeight: 600 }}>{s.name}</div>
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
      {!(isContextFlagship || isSubjectNative) ? (
      <section style={{ background: VS.pageBg, padding: 'clamp(36px,6vw,56px) clamp(16px,4vw,32px)', borderTop: `1px solid ${VS.hairline}` }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${C.orange} 0%, #ff9a3c 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.5 14.5L6 22l6-2 6 2-2.5-7.5"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: VS.textSecondary, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>CERTIFICATE</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: VS.textPrimary, marginBottom: 3 }}>{program.cert}</div>
                <div style={{ color: VS.textSecondary, fontSize: 13.5 }}>Issued by Skylent on successful completion. Includes a verifiable credential ID.{enrollStatus === 'coming_soon' ? ' Available when enrollment opens.' : ''}</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
      ) : (
      <section className="flagship-canvas-section" style={{ background: 'linear-gradient(180deg, #07090d 0%, #0b0f14 100%)' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <div className="flagship-canvas-meta" style={{ borderTop: 'none', paddingTop: 0 }}>
            <span>Certificate · {program.cert}</span>
            <span className="flagship-canvas-meta-sep" aria-hidden>·</span>
            <span>Issued by Skylent on completion</span>
          </div>
        </div>
      </section>
      )}

      {/* FAQ */}
      {!isContextFlagship && program.faqs && program.faqs.length > 0 && (
        <section id="faq" style={{ background: VS.surface, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: `1px solid ${VS.hairline}` }}>
          <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
            <FadeIn>
              <MonoLabel>FAQs</MonoLabel>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: VS.textPrimary, margin: '0 0 32px', letterSpacing: '-0.025em' }}>Common questions</h2>
            </FadeIn>
            <div style={{ maxWidth: 780 }}>
              {program.faqs.map((faq, i) => {
                const isOpen = faqOpen === faq.q
                return (
                  <FadeIn key={i} delay={i * 40}>
                    <div style={{ borderBottom: i < program.faqs!.length - 1 ? `1px solid ${VS.hairline}` : 'none' }}>
                      <button
                        onClick={() => setFaqOpen(isOpen ? null : faq.q)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: VS.textPrimary, lineHeight: 1.4 }}>{faq.q}</span>
                        <span style={{ color: C.orange, fontSize: 20, display: 'inline-block', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>+</span>
                      </button>
                      {isOpen && (
                        <div style={{ paddingBottom: 20 }}>
                          <p style={{ color: VS.textSecondary, fontSize: 14.5, lineHeight: 1.78, margin: 0 }}>{faq.a}</p>
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
      {contextFlagship !== 'data-analytics' && (
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
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(normalizedPricing(program).length, 3)}, 1fr)`, gap: 16 }} className="three-col">
            {normalizedPricing(program).map((tier, i) => (
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
                    onClick={handleCta}
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
      )}

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section style={{ background: isContextFlagship || isSubjectNative ? 'linear-gradient(180deg, #07090d 0%, #0b0f14 100%)' : VS.pageBg, padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', borderTop: isContextFlagship || isSubjectNative ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${VS.hairline}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            {!(isContextFlagship || isSubjectNative) && (
            <div style={{ borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '21/6', marginBottom: 44, position: 'relative' }}>
              <img
                src={heroPhoto}
                alt="Learning environment"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11,13,15,0.08), rgba(11,13,15,0.5))' }} />
            </div>
            )}
            <div style={{ color: isContextFlagship || isSubjectNative ? 'rgba(255,255,255,0.38)' : VS.textSecondary, fontSize: 13, marginBottom: 20 }}>Get started</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 600, color: isContextFlagship || isSubjectNative ? C.white : VS.textPrimary, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {enrollStatus === 'coming_soon'
                ? `Be the first to know when ${program.name} opens`
                : `Ready to begin ${program.name}?`}
            </h2>
            <p style={{ color: isContextFlagship || isSubjectNative ? 'rgba(255,255,255,0.48)' : VS.textSecondary, fontSize: 16, lineHeight: 1.75, margin: '0 0 36px' }}>
              {enrollStatus === 'coming_soon'
                ? 'Register your interest and we will notify you when enrollment opens.'
                : `Next batch starts ${program.upcomingBatch}. Applications close when the cohort fills.`}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleCta}
                style={{ background: enrollStatus === 'coming_soon' ? C.ink : C.orange, border: 'none', color: C.white, borderRadius: 9, padding: '14px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {ctaLabel} →
              </button>
              <Link to="/contact" style={{ display: 'inline-block', background: 'transparent', border: `1px solid ${isContextFlagship || isSubjectNative ? 'rgba(255,255,255,0.18)' : VS.hairline}`, color: isContextFlagship || isSubjectNative ? C.white : VS.textPrimary, borderRadius: 9, padding: '14px 28px', fontSize: 15, textDecoration: 'none', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = C.orange)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = isContextFlagship || isSubjectNative ? 'rgba(255,255,255,0.18)' : VS.hairline)}
              >
                Talk to an advisor
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {applyOpen && (
        <EnrollmentModal
          item={{
            id: program.slug,
            title: program.name,
            price: highlightTier.price,
            type: 'program',
            offeringId,
            programSlug: program.slug,
          }}
          onClose={() => setApplyOpen(false)}
        />
      )}
    </PageShell>
  )
}
