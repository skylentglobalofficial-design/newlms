import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { AuthDashboardShell } from '../components/AuthDashboardShell'
import { LEARNER_NAV, LearnerNavIcon, learnerNavId } from '../components/learner/learner-nav'
import { useAuth } from '../context/AuthContext'
import { learnerErrorMessage } from '../components/lms/lms-utils'
import { useLmsDashboard } from '../hooks/useLms'
import {
  canOpenEnrollment,
  fetchLmsEnrollments,
  type ApiEnrollmentSummary,
} from '../lib/lms-api'
import { myCourseRows } from '../lib/my-courses'
import CareerRiseCard from '../components/learner/CareerRiseCard'
import { findProjectForCourse, listLearnerProjects, learnerProjectPath, projectStatusLabel, type ProjectSummary } from '../lib/projects-api'
import { fetchMyCertificates, issueCertificate, issueProgrammeCertificate, type SkylentCertificate } from '../lib/skylent-api'
import { fetchSkylentAiStatus } from '../lib/skylent-ai-api'
import ElixirWalletPanel from '../components/learner/ElixirWallet'
import { computeLearnerExecutionStreak } from '../lib/execution-streak'
import { truthOf } from '../lib/truth'
import { courseProductProfile } from '../lib/course-product'
import { dashboardSqlLabHref, practiceEnvironmentForCourse } from '../lib/practice-environments'
import { isAuthoredCourse } from '../lib/authored-courses'
import { EnrollmentModal } from '../components/shared'
import { buildSkylentTiersForPrice, getCourseTierRecord, saveAdminPriceOverridesLocal, saveStoredCourseTier, tierLabelFor } from '../lib/enrolment-tiers'
import { AiMark, AI_NAME, ArrowRight, TruthChip } from '../components/skylent/primitives'
import analyticsVisual from '@/assets/site/home/program-analytics-800.webp'
import productVisual from '@/assets/site/home/program-product-800.webp'
import scienceVisual from '@/assets/site/degree-computing.jpg'
import webVisual from '@/assets/site/home/program-web-800.webp'
import aiVisual from '@/assets/site/program-ai.jpg'
import sqlVisual from '@/assets/site/program-library.jpg'
import './LearnWorkspace.css'
import './StudentHome.css'

type DashboardExploreCourse = {
  slug: string
  programSlug: string
  title: string
  subtitle: string
  category: 'Data & SQL' | 'AI & Data Science' | 'Product & Full-Stack'
  duration: string
  modulesCount: number
  lessonsCount: number
  price: number
  image: string
  labBadge: string
  skills: string[]
  syllabusModules: string[]
}

const EXPLORE_CATALOGUE: DashboardExploreCourse[] = [
  {
    slug: 'data-analytics',
    programSlug: 'data-analytics-pro',
    title: 'Data Analytics & Business SQL',
    subtitle: 'Clean raw spreadsheets, write multi-table SQL queries, and defend a commercial revenue review.',
    category: 'Data & SQL',
    duration: '12 Weeks · Self-Paced',
    modulesCount: 5,
    lessonsCount: 15,
    price: 3499,
    image: analyticsVisual,
    labBadge: 'Northwind SQL Lab (166 Rows)',
    skills: ['SQL Joins & CTEs', 'Cohort Retention', 'Margin & Discount Audit', 'Executive Reporting'],
    syllabusModules: [
      'Module 01: Commercial Metrics, Grain & Revenue Hygiene',
      'Module 02: Multi-Table SQL Joins, Aggregations & Window Functions',
      'Module 03: Discount Leakage & Margin Diagnostics on Northwind',
      'Module 04: Customer Retention Cohorts & Churn Decomposition',
      'Module 05: Graded Commercial Capstone & Boardroom Defense',
    ],
  },
  {
    slug: 'product-management',
    programSlug: 'product-management',
    title: 'Product Management & Strategy',
    subtitle: 'Isolate user activation bottlenecks, prioritize engineering sprints, and author a 6-week PRD.',
    category: 'Product & Full-Stack',
    duration: '12 Weeks · Self-Paced',
    modulesCount: 5,
    lessonsCount: 15,
    price: 3999,
    image: productVisual,
    labBadge: 'Harbor Desk PRD Studio',
    skills: ['PRD Authoring', 'Funnel Diagnostics', 'RICE & Sprint Triage', 'Stakeholder Alignment'],
    syllabusModules: [
      'Module 01: Problem Framing & Activation Funnel Diagnostics',
      'Module 02: User Research Synthesis & Root-Cause Evidence',
      'Module 03: Engineering Scope, Trade-Offs & Guardrail Metrics',
      'Module 04: Writing a Defensible 6-Week Product Requirement Doc',
      'Module 05: Harbor Desk Onboarding Capstone & Executive Review',
    ],
  },
  {
    slug: 'python-programming',
    programSlug: 'data-science-ai',
    title: 'Python Programming & Automation',
    subtitle: 'Build resilient ETL data pipelines, automated anomaly detectors, and clean production Python code.',
    category: 'AI & Data Science',
    duration: '10 Weeks · Self-Paced',
    modulesCount: 5,
    lessonsCount: 15,
    price: 2999,
    image: sqlVisual,
    labBadge: 'In-Browser Python Pipeline Lab',
    skills: ['Python Data Structures', 'Generators & Streams', 'Webhook Deduplication', 'Automated Testing'],
    syllabusModules: [
      'Module 01: Python Core Types, Control Flow & Memory Discipline',
      'Module 02: Functions, Modules & Defensive Error Handling',
      'Module 03: Generators, Iterators & Large-File Stream Processing',
      'Module 04: Schema Validation, Idempotency & Pipeline Auditing',
      'Module 05: Graded Python Transaction Anomaly Capstone',
    ],
  },
  {
    slug: 'data-science-ai',
    programSlug: 'data-science-ai',
    title: 'Data Science & Machine Learning',
    subtitle: 'Combine SQL analytics and Python statistical modelling to predict churn and validate uplift.',
    category: 'AI & Data Science',
    duration: '16 Weeks · Self-Paced',
    modulesCount: 5,
    lessonsCount: 15,
    price: 5999,
    image: scienceVisual,
    labBadge: 'SQL + Python Dual Sandbox',
    skills: ['Feature Engineering', 'Churn Classification', 'Precision-Recall Tradeoffs', 'A/B Experimentation'],
    syllabusModules: [
      'Module 01: Exploratory Data Analysis & Feature Leakage Prevention',
      'Module 02: Statistical Inference, Hypothesis Testing & A/B Sizing',
      'Module 03: Supervised Classification & Calibration Curves',
      'Module 04: Time-Split Cohort Validation & Drift Monitoring',
      'Module 05: Graded Customer Churn & Retention Capstone',
    ],
  },
  {
    slug: 'generative-ai',
    programSlug: 'generative-ai-program',
    title: 'Generative AI & Grounded RAG Systems',
    subtitle: 'Architect enterprise LLM assistants with vector retrieval, strict source citations, and eval harnesses.',
    category: 'AI & Data Science',
    duration: '12 Weeks · Self-Paced',
    modulesCount: 5,
    lessonsCount: 15,
    price: 4999,
    image: aiVisual,
    labBadge: 'Grounded RAG & Eval Studio',
    skills: ['Chunking & Embeddings', 'Hybrid Retrieval', 'Hallucination Guardrails', 'Golden-Set Evals'],
    syllabusModules: [
      'Module 01: LLM Architecture, Token Economics & Structured Outputs',
      'Module 02: Document Chunking, Metadata Filtering & Hybrid Search',
      'Module 03: Grounded Citation Enforcement & Prompt Injection Defense',
      'Module 04: Automated RAG Evaluation (Faithfulness & Recall)',
      'Module 05: Graded Enterprise Knowledge Assistant Capstone',
    ],
  },
  {
    slug: 'full-stack-web',
    programSlug: 'full-stack',
    title: 'Full-Stack Web Engineering (React, Node & SQL)',
    subtitle: 'Ship production-grade web apps with React, TypeScript, Express REST APIs, and PostgreSQL transactions.',
    category: 'Product & Full-Stack',
    duration: '16 Weeks · Self-Paced',
    modulesCount: 5,
    lessonsCount: 15,
    price: 5499,
    image: webVisual,
    labBadge: 'Full-Stack Ledger Architecture Lab',
    skills: ['React & TypeScript', 'Node & Express APIs', 'PostgreSQL ACID Transactions', 'Auth & Security'],
    syllabusModules: [
      'Module 01: Modern React State, Accessible UI & TypeScript Contracts',
      'Module 02: REST API Design, Validation & Idempotency Keys',
      'Module 03: Relational Schema Design, Indexing & Transactions',
      'Module 04: Session Security, CSRF Defense & Rate Limiting',
      'Module 05: Graded Idempotent Payment Ledger Capstone',
    ],
  },
]

function courseThumbForSlug(slug?: string | null): string {
  switch (slug) {
    case 'product-management': return productVisual
    case 'python-programming': return sqlVisual
    case 'data-science-ai': return scienceVisual
    case 'generative-ai': return aiVisual
    case 'full-stack-web': return webVisual
    default: return analyticsVisual
  }
}

function ProgressRing({
  percent,
  size = 54,
  stroke = 5,
  color = '#5142b5',
  label,
}: {
  percent: number
  size?: number
  stroke?: number
  color?: string
  label?: string
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (clamped / 100) * circumference
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: size >= 90 ? 18 : 11.5, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
        {label ?? `${clamped}%`}
      </span>
    </div>
  )
}

function looksLikeFullName(name: string): boolean {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.length >= 2 && !name.includes('@')
}

function CertificateName() {
  const { user, updateDisplayName } = useAuth()
  const current = user?.name || ''
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(current)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (!user) return null
  const complete = looksLikeFullName(current)
  async function save() {
    const next = draft.trim().replace(/\s+/g, ' ')
    if (!looksLikeFullName(next)) {
      setError('Enter your first and last name as they should appear on a certificate.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateDisplayName(next)
      setEditing(false)
    } catch (err) {
      setError(learnerErrorMessage(err, 'Your name could not be saved. Try again in a moment.'))
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="sh-row sh-name">
      {editing ? (
        <form className="sh-name-form" onSubmit={(event) => { event.preventDefault(); void save() }}>
          <label htmlFor="sh-cert-name" className="sh-note">Full name on certificates</label>
          <input id="sh-cert-name" className="sh-name-input" value={draft} maxLength={120} autoComplete="name" onChange={(event) => setDraft(event.target.value)} />
          <div className="sh-name-actions">
            <button type="submit" className="os-btn os-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save name'}</button>
            <button type="button" className="os-btn os-btn-ghost" disabled={saving} onClick={() => { setEditing(false); setDraft(current); setError(null) }}>Cancel</button>
          </div>
          {error ? <span className="os-error" role="alert">{error}</span> : null}
        </form>
      ) : (
        <>
          <div className="sh-row-main">
            <strong>Name on certificates: {current || 'not set'}</strong>
            <span className="sh-note">{complete ? 'Certificates print this name.' : 'A certificate needs your first and last name.'}</span>
          </div>
          <button type="button" className="os-link sh-row-link" onClick={() => { setDraft(current); setEditing(true) }}>
            {complete ? 'Change' : 'Add full name'}
          </button>
        </>
      )}
    </div>
  )
}

type Loaded<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error' }
type AiAvailability = 'checking' | 'available' | 'unavailable' | 'unknown'
type StudentTabId = 'overview' | 'courses' | 'explore' | 'projects' | 'certificates' | 'wallet'

function ListError({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <div className="sh-empty sh-list-error" role="status">
      <span>{what} could not be loaded.</span>
      <button type="button" className="os-link" onClick={onRetry}>Try again</button>
    </div>
  )
}

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Skeleton() {
  return (
    <div className="sh-skeleton" role="status" aria-label="Loading your learning">
      <span className="os-skeleton" style={{ width: 120 }} />
      <span className="os-skeleton" style={{ height: 30, width: 'min(420px, 80%)' }} />
      <span className="os-skeleton" style={{ height: 168 }} />
      <span className="os-skeleton" style={{ height: 96 }} />
      <span className="os-skeleton" style={{ height: 96 }} />
    </div>
  )
}

export default function DashboardStudentPage() {
  const { user, ready } = useAuth()
  const { workspace, course, loading, error, reload } = useLmsDashboard()
  const navigate = useNavigate()
  const { pathname, hash, search } = useLocation()
  const activeNav = learnerNavId(pathname, hash)
  const previousHash = useRef(hash)
  const [studentTab, setStudentTab] = useState<StudentTabId>(() => {
    const qTab = new URLSearchParams(search).get('tab')
    if (qTab === 'courses' || hash === '#sh-my-learning') return 'courses'
    if (qTab === 'projects' || hash === '#student-projects') return 'projects'
    if (qTab === 'explore' || hash === '#explore-programmes') return 'explore'
    return 'overview'
  })
  const [courseFilter, setCourseFilter] = useState<'all' | 'in_progress' | 'completed'>('all')
  const [exploreMode, setExploreMode] = useState<'courses' | 'degrees'>(() =>
    new URLSearchParams(search).get('tab') === 'degrees' ? 'degrees' : 'courses'
  )
  const [exploreCategory, setExploreCategory] = useState<'All' | 'Data & SQL' | 'AI & Data Science' | 'Product & Full-Stack'>('All')
  const [exploreQuery, setExploreQuery] = useState('')
  const [selectedExploreDetail, setSelectedExploreDetail] = useState<DashboardExploreCourse | null>(null)
  const [checkoutTarget, setCheckoutTarget] = useState<DashboardExploreCourse | null>(null)
  const [degreeTrack, setDegreeTrack] = useState('BCA (Online / Campus) — AI & Data Science')
  const [degreePhone, setDegreePhone] = useState('')
  const [degreeQualification, setDegreeQualification] = useState('12th / Higher Secondary Completed')
  const [degreeSubmitted, setDegreeSubmitted] = useState<string | null>(null)
  const [, setPriceTick] = useState(0)

  useEffect(() => {
    fetch('/api/v1/payments/catalog-config', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (p?.data?.priceOverrides) {
          saveAdminPriceOverridesLocal(p.data.priceOverrides)
          setPriceTick((t) => t + 1)
        }
      })
      .catch(() => {})
  }, [])

  const [enrollments, setEnrollments] = useState<Loaded<ApiEnrollmentSummary[]>>(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem('skylent:v71:student-enrollments') : null
      if (raw) return { status: 'ready', data: JSON.parse(raw) as ApiEnrollmentSummary[] }
    } catch {}
    return { status: 'loading' }
  })
  const [projects, setProjects] = useState<Loaded<ProjectSummary[]>>(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem('skylent:v71:student-projects') : null
      if (raw) return { status: 'ready', data: JSON.parse(raw) as ProjectSummary[] }
    } catch {}
    return { status: 'loading' }
  })
  const [certificates, setCertificates] = useState<Loaded<SkylentCertificate[]>>(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem('skylent:v71:student-certificates') : null
      if (raw) return { status: 'ready', data: JSON.parse(raw) as SkylentCertificate[] }
    } catch {}
    return { status: 'loading' }
  })
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<{ slug: string; message: string } | null>(null)
  const [_aiStatus, setAiStatus] = useState<AiAvailability>('available')
  const [listsKey, setListsKey] = useState(0)

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  useEffect(() => {
    const qTab = new URLSearchParams(search).get('tab')
    if (qTab === 'courses' || hash === '#sh-my-learning') setStudentTab('courses')
    else if (qTab === 'projects' || hash === '#student-projects') setStudentTab('projects')
    else if (qTab === 'explore' || hash === '#explore-programmes') setStudentTab('explore')
    else if (!hash && !qTab) setStudentTab('overview')
    previousHash.current = hash
  }, [hash, search])

  const loadLists = useCallback((signal: AbortSignal) => {
    const settle = <T,>(promise: Promise<T>, set: (value: Loaded<T>) => void, cacheKey: string) => {
      void promise
        .then((data) => {
          if (!signal.aborted) {
            set({ status: 'ready', data })
            try { window.sessionStorage.setItem(cacheKey, JSON.stringify(data)) } catch {}
          }
        })
        .catch(() => {
          if (!signal.aborted) {
            set((prev) => (prev.status === 'ready' ? prev : { status: 'error' }))
          }
        })
    }
    settle(fetchLmsEnrollments(), setEnrollments, 'skylent:v71:student-enrollments')
    settle(listLearnerProjects(signal), setProjects, 'skylent:v71:student-projects')
    settle(fetchMyCertificates(signal), setCertificates, 'skylent:v71:student-certificates')
  }, [])

  useEffect(() => {
    if (!user?.id) return
    const controller = new AbortController()
    loadLists(controller.signal)
    return () => controller.abort()
  }, [user?.id, loadLists, listsKey])

  const retryLists = useCallback(() => {
    setEnrollments({ status: 'loading' })
    setProjects({ status: 'loading' })
    setCertificates({ status: 'loading' })
    setListsKey((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    void fetchSkylentAiStatus(controller.signal)
      .then((status) => { if (!controller.signal.aborted) setAiStatus(status.available ? 'available' : 'available') })
      .catch(() => { if (!controller.signal.aborted) setAiStatus('available') })
    return () => controller.abort()
  }, [user])

  async function claimCertificate(courseSlug: string) {
    setClaiming(courseSlug)
    setClaimError(null)
    try {
      const issued = await issueCertificate(courseSlug)
      setCertificates((current) => ({
        status: 'ready',
        data: [issued, ...(current.status === 'ready' ? current.data.filter((item) => item.code !== issued.code) : [])],
      }))
    } catch (err) {
      setClaimError({ slug: courseSlug, message: learnerErrorMessage(err, 'The certificate could not be issued right now. Try again in a moment.') })
    } finally {
      setClaiming(null)
    }
  }

  async function claimProgrammeMasterCertificate(programSlug: string) {
    const key = `programme:${programSlug}`
    setClaiming(key)
    setClaimError(null)
    try {
      const issued = await issueProgrammeCertificate(programSlug)
      setCertificates((current) => ({
        status: 'ready',
        data: [issued, ...(current.status === 'ready' ? current.data.filter((item) => item.code !== issued.code) : [])],
      }))
    } catch (err) {
      setClaimError({ slug: key, message: learnerErrorMessage(err, 'The programme master certificate could not be issued right now. Try again in a moment.') })
    } finally {
      setClaiming(null)
    }
  }

  const crumbSection =
    studentTab === 'courses'
      ? 'My Courses'
      : studentTab === 'explore'
        ? 'Explore Programmes'
        : studentTab === 'projects'
          ? 'Projects & Labs'
          : studentTab === 'certificates'
            ? 'Certificates & Proof'
            : studentTab === 'wallet'
              ? 'Elixir Wallet'
              : 'Dashboard'

  const effectiveActiveNav =
    studentTab === 'explore'
      ? 'explore-programmes'
      : studentTab === 'courses'
        ? 'my-courses'
        : studentTab === 'projects'
          ? 'projects'
          : activeNav

  const shell = {
    themeId: 'data-science' as const,
    workspace: 'learning' as const,
    workspaceLabel: 'My Courses',
    roleLabel: user?.role === 'superadmin' ? 'Superadmin' : user?.role === 'admin' ? 'Admin' : 'Learner',
    navItems: LEARNER_NAV,
    bottomNavItems: LEARNER_NAV,
    activeNav: effectiveActiveNav,
    onNavChange: (id: string) => {
      if (id === 'dashboard') setStudentTab('overview')
      else if (id === 'my-courses' || id === 'courses') setStudentTab('courses')
      else if (id === 'projects') setStudentTab('projects')
      else if (id === 'explore-programmes') setStudentTab('explore')
    },
    renderNavIcon: (id: string) => <LearnerNavIcon id={id} />,
    bar: (
      <strong style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{crumbSection}</strong>
    ),
  }

  const filteredExploreCourses = useMemo(() => {
    return EXPLORE_CATALOGUE.filter((c) => {
      if (exploreCategory !== 'All' && c.category !== exploreCategory) return false
      if (exploreQuery.trim()) {
        const q = exploreQuery.trim().toLowerCase()
        return (
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [exploreCategory, exploreQuery])

  if (!ready || !user) return null

  if (error && !workspace) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="sh sh-state" id="student-learning">
          <p className="os-eyebrow">My Courses</p>
          {error === 'Sign in to continue.' ? (
            <>
              <h1>Your session has ended</h1>
              <p className="os-lead">Sign in again to see your learning. Nothing has been lost.</p>
              <div className="os-actions">
                <Link className="os-btn os-btn-primary" to="/login" state={{ returnTo: '/dashboard/student' }}>Sign in</Link>
              </div>
            </>
          ) : (
            <>
              <h1>Your learning could not be loaded</h1>
              <p className="os-lead">{learnerErrorMessage(new Error(error))}</p>
              <div className="os-actions">
                <button type="button" className="os-btn os-btn-primary" onClick={() => void reload()}>Try again</button>
              </div>
            </>
          )}
        </div>
      </AuthDashboardShell>
    )
  }

  if (loading) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="sh"><Skeleton /></div>
      </AuthDashboardShell>
    )
  }

  const enrolmentRows = enrollments.status === 'ready' ? enrollments.data : []
  const certificateRows = certificates.status === 'ready' ? certificates.data : []
  const projectRows = projects.status === 'ready' ? projects.data : []
  const allMyCourses = useMemo(() => {
    const fromApi = myCourseRows(enrolmentRows)
    if (fromApi.length > 0) return fromApi
    if (workspace?.course) {
      return [
        {
          key: `course:${workspace.course.slug}`,
          enrolmentId: workspace.enrollment.id,
          title: workspace.course.title,
          slug: workspace.course.slug,
          programmeName: workspace.program?.name ?? null,
          status: workspace.enrollment.status,
          progressPct: workspace.progress.progressPct,
          completedCount: workspace.progress.completedCount,
          totalLessons: workspace.progress.totalLessons,
          createdAt: new Date().toISOString(),
        },
      ]
    }
    return []
  }, [enrolmentRows, workspace])
  const filteredMyCourses = allMyCourses.filter((row) => {
    if (courseFilter === 'completed') return row.status === 'completed' || (row.progressPct ?? 0) >= 100
    if (courseFilter === 'in_progress') return row.status !== 'completed' && (row.progressPct ?? 0) < 100
    return true
  })

  // In-Dashboard Explore Programmes View (Stays inside the logged-in Sidebar!)
  const exploreProgrammesSection = (
    <section id="explore-programmes" aria-label="Explore Programmes inside Dashboard">
      {selectedExploreDetail ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 14px 36px -16px rgba(15, 23, 42, 0.1)',
          }}
        >
          {/* Course Detail Banner inside Dashboard (matching Image 4 layout) */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #3b2d96 100%)',
              color: '#ffffff',
              padding: '28px clamp(20px, 3.5vw, 36px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 24,
              alignItems: 'center',
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => setSelectedExploreDetail(null)}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: 14,
                }}
              >
                ← Back to All Programmes
              </button>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#5142b5', color: '#ffffff' }}>
                  {selectedExploreDetail.category}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.14)', color: '#e2e8f0' }}>
                  {selectedExploreDetail.labBadge}
                </span>
              </div>
              <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(22px, 2.8vw, 30px)', color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                {selectedExploreDetail.title}
              </h2>
              <p style={{ margin: '0 0 18px', fontSize: 14.5, lineHeight: 1.6, color: '#cbd5e1' }}>
                {selectedExploreDetail.subtitle}
              </p>
              {allMyCourses.some((r) => r.slug === selectedExploreDetail.slug) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 999, background: '#dcfce7', color: '#166534' }}>
                    ✓ Enrolled · {tierLabelFor(getCourseTierRecord(selectedExploreDetail.slug).tier)}
                  </span>
                  <Link
                    to={`/learn/${selectedExploreDetail.slug}`}
                    style={{
                      padding: '12px 22px',
                      borderRadius: 10,
                      background: '#059669',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 14.5,
                      textDecoration: 'none',
                    }}
                  >
                    Resume Course →
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#cbd5e1' }}>3 Plans Available · Starting at</span>
                    <strong style={{ fontSize: 28, color: '#ffffff' }}>
                      ₹{Math.max(999, Math.round((selectedExploreDetail.price * 0.43) / 100) * 100 - 1).toLocaleString('en-IN')}
                    </strong>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#dcfce7', color: '#166534' }}>
                      Certificate / Professional (Career OS) / Flagship Live
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setCheckoutTarget(selectedExploreDetail)}
                      style={{
                        padding: '12px 22px',
                        borderRadius: 10,
                        border: 'none',
                        background: '#5142b5',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: 14.5,
                        cursor: 'pointer',
                      }}
                    >
                      Choose Plan &amp; Enroll →
                    </button>
                  </div>
                </>
              )}
            </div>
            <div>
              <img
                src={selectedExploreDetail.image}
                alt={selectedExploreDetail.title}
                style={{ width: '100%', maxHeight: 230, objectFit: 'cover', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)' }}
              />
            </div>
          </div>

          {/* 4-Pillar Info Bar (Duration | Modules | Lab | Certificate) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 14,
              padding: '18px 28px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Duration</span>
              <strong style={{ display: 'block', fontSize: 14.5, color: '#0f172a', marginTop: 2 }}>{selectedExploreDetail.duration}</strong>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Curriculum</span>
              <strong style={{ display: 'block', fontSize: 14.5, color: '#0f172a', marginTop: 2 }}>
                {selectedExploreDetail.modulesCount} Modules · {selectedExploreDetail.lessonsCount} Lessons
              </strong>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Practice Workbench</span>
              <strong style={{ display: 'block', fontSize: 14.5, color: '#0f172a', marginTop: 2 }}>{selectedExploreDetail.labBadge}</strong>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Credential</span>
              <strong style={{ display: 'block', fontSize: 14.5, color: '#0f172a', marginTop: 2 }}>Verified SKL Certificate (/verify)</strong>
            </div>
          </div>

          {/* Curriculum Breakdown inside Dashboard */}
          <div style={{ padding: '24px 28px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 18, color: '#0f172a' }}>Course Curriculum &amp; Modules</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {selectedExploreDetail.syllabusModules.map((modTitle, idx) => (
                <div
                  key={modTitle}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 14.5, color: '#0f172a', display: 'block' }}>{modTitle}</strong>
                    <span style={{ fontSize: 12.5, color: '#64748b' }}>
                      3 lessons · Written notes, interactive check &amp; applied case assignment
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#5142b5', background: '#f5f3ff', padding: '4px 10px', borderRadius: 999 }}>
                    Module 0{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inline 3-Card Choose Your Plan Section inside Dashboard Course View */}
          {!allMyCourses.some((r) => r.slug === selectedExploreDetail.slug) ? (
            <div
              id="dashboard-choose-plan"
              style={{
                padding: '24px 28px 28px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                Choose Your Plan
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 265px), 1fr))',
                  gap: 16,
                  alignItems: 'stretch',
                }}
              >
                {buildSkylentTiersForPrice(selectedExploreDetail.price, selectedExploreDetail.slug).map((tier) => {
                  const isProCard = tier.id === 'flagship'
                  const displayTitle =
                    tier.id === 'certificate'
                      ? 'Basic Plan'
                      : tier.id === 'professional'
                        ? 'Premium Plan'
                        : 'Pro Plan'
                  return (
                    <article
                      key={tier.id}
                      style={{
                        borderRadius: 16,
                        padding: '22px 20px',
                        background: isProCard
                          ? 'linear-gradient(160deg, #2e1065 0%, #4c1d95 55%, #5142b5 100%)'
                          : '#ffffff',
                        color: isProCard ? '#ffffff' : '#0f172a',
                        border: isProCard ? '2px solid #6d28d9' : '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 14,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <strong style={{ fontSize: 18, fontWeight: 800 }}>{displayTitle}</strong>
                          {isProCard ? (
                            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.22)', color: '#ffffff' }}>
                              Recommended
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: tier.includesCareerOS ? '#f5f3ff' : '#f1f5f9', color: tier.includesCareerOS ? '#5142b5' : '#475569' }}>
                              {tier.includesCareerOS ? 'Career OS' : 'Self-Paced'}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                          <strong style={{ fontSize: 26, fontWeight: 800 }}>
                            ₹{tier.price.toLocaleString('en-IN')}
                          </strong>
                          <span style={{ fontSize: 13, color: isProCard ? 'rgba(255,255,255,0.65)' : '#94a3b8', textDecoration: 'line-through' }}>
                            ₹{tier.mrp.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <Link
                          to={`/checkout?kind=course&slug=${encodeURIComponent(selectedExploreDetail.slug)}&tier=${tier.id}&price=${selectedExploreDetail.price}`}
                          onClick={() => saveStoredCourseTier(selectedExploreDetail.slug, tier.id)}
                          style={{
                            display: 'block',
                            textAlign: 'center',
                            textDecoration: 'none',
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '11px 16px',
                            borderRadius: 10,
                            border: isProCard ? 'none' : '1px solid #ddd6fe',
                            background: isProCard ? '#ffffff' : '#ede9fe',
                            color: isProCard ? '#3b0764' : '#5142b5',
                            fontSize: 14,
                            fontWeight: 800,
                            marginBottom: 14,
                          }}
                        >
                          Buy Now
                        </Link>
                        <div style={{ borderTop: isProCard ? '1px solid rgba(255,255,255,0.18)' : '1px solid #f1f5f9', paddingTop: 12, display: 'grid', gap: 8 }}>
                          {tier.features.map((feat) => (
                            <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, lineHeight: 1.4, color: isProCard ? '#f8fafc' : '#334155' }}>
                              <span style={{ fontWeight: 800, color: isProCard ? '#ffffff' : '#15803d' }}>✓</span>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Top Header & Search + Category Pills (matching Image 5 layout inside Dashboard) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: '20px 24px',
              display: 'grid',
              gap: 16,
            }}
          >
            {/* Switcher: Self-Paced / Live Courses vs University Degrees (Different Process) */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => setExploreMode('courses')}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: exploreMode === 'courses' ? '2px solid #5142b5' : '1px solid #cbd5e1',
                  background: exploreMode === 'courses' ? '#5142b5' : '#ffffff',
                  color: exploreMode === 'courses' ? '#ffffff' : '#334155',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Career Courses &amp; Batches (Direct Enrolment)
              </button>
              <button
                type="button"
                onClick={() => setExploreMode('degrees')}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: exploreMode === 'degrees' ? '2px solid #1e1b4b' : '1px solid #cbd5e1',
                  background: exploreMode === 'degrees' ? '#1e1b4b' : '#ffffff',
                  color: exploreMode === 'degrees' ? '#ffffff' : '#334155',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                University Degrees (Separate Admission Process)
              </button>
            </div>

            {exploreMode === 'degrees' ? (
              <div style={{ display: 'grid', gap: 18, paddingTop: 4 }}>
                <div style={{ padding: '18px 20px', borderRadius: 14, background: 'linear-gradient(135deg, #1e1b4b 0%, #3b2d96 100%)', color: '#ffffff' }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#e9d5ff', textTransform: 'uppercase' }}>
                    UGC-ENTITLED UNIVERSITY DEGREES · COUNSELOR-GUIDED ADMISSION
                  </span>
                  <h3 style={{ margin: '6px 0 6px', fontSize: 20, color: '#ffffff' }}>
                    Join a University Degree Programme (UG &amp; PG)
                  </h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.88)', lineHeight: 1.55 }}>
                    Unlike self-paced skill courses, University Degrees (BCA, BBA, B.Tech, MBA, MCA) follow a dedicated university eligibility review, document verification, and Academic Counselor onboarding process.
                  </p>
                </div>

                {degreeSubmitted ? (
                  <div style={{ padding: '16px 18px', borderRadius: 12, background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', fontWeight: 700, fontSize: 13.5 }}>
                    ✓ {degreeSubmitted}
                  </div>
                ) : null}

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setDegreeSubmitted(`Your University Degree application for "${degreeTrack}" has been registered! A Skylent Senior Academic Counselor will contact you at ${degreePhone || user.email} with the university admission & fee structure.`)
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 12,
                    padding: 16,
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    alignItems: 'end',
                  }}
                >
                  <label style={{ display: 'grid', gap: 5, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                    <span>Select Degree Track</span>
                    <select
                      value={degreeTrack}
                      onChange={(e) => setDegreeTrack(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#ffffff', fontSize: 13.5 }}
                    >
                      <option>BCA (Online / Campus) — AI &amp; Data Science</option>
                      <option>BBA (Online / Campus) — Digital Product &amp; Analytics</option>
                      <option>B.Tech Computer Science (Partner University)</option>
                      <option>MBA — Business Analytics &amp; Product Strategy</option>
                      <option>MCA — Full-Stack &amp; Cloud Engineering</option>
                    </select>
                  </label>

                  <label style={{ display: 'grid', gap: 5, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                    <span>Highest Qualification</span>
                    <select
                      value={degreeQualification}
                      onChange={(e) => setDegreeQualification(e.target.value)}
                      style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#ffffff', fontSize: 13.5 }}
                    >
                      <option>12th / Higher Secondary Completed</option>
                      <option>Currently in 12th Standard</option>
                      <option>Undergraduate Degree Completed</option>
                      <option>Final-Year Undergraduate Student</option>
                      <option>Working Professional</option>
                    </select>
                  </label>

                  <label style={{ display: 'grid', gap: 5, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                    <span>WhatsApp / Phone Number *</span>
                    <input
                      type="tel"
                      required
                      value={degreePhone}
                      onChange={(e) => setDegreePhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#ffffff', fontSize: 13.5 }}
                    />
                  </label>

                  <button
                    type="submit"
                    style={{
                      padding: '11px 18px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#5142b5',
                      color: '#ffffff',
                      fontSize: 13.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Request Degree Admission Process →
                  </button>
                </form>
              </div>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#5142b5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  SKYLENT COURSE CATALOGUE
                </span>
                <h2 style={{ margin: '4px 0 0', fontSize: 22, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                  Explore Programmes &amp; Career Tracks
                </h2>
              </div>
              <input
                type="search"
                value={exploreQuery}
                onChange={(e) => setExploreQuery(e.target.value)}
                placeholder="Search courses, SQL, Python, AI, Product…"
                style={{
                  minWidth: 260,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: 13.5,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['All', 'Data & SQL', 'AI & Data Science', 'Product & Full-Stack'] as const).map((cat) => {
                const active = exploreCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setExploreCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 999,
                      border: active ? '1.5px solid #5142b5' : '1px solid #cbd5e1',
                      background: active ? '#5142b5' : '#ffffff',
                      color: active ? '#ffffff' : '#334155',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3-Column Programme Card Grid inside Dashboard */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: 18,
            }}
          >
            {filteredExploreCourses.map((item) => {
              const isEnrolled = allMyCourses.some((r) => r.slug === item.slug)
              return (
                <article
                  key={item.slug}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 24px -14px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <div>
                    <div style={{ position: 'relative', height: 156, overflow: 'hidden', background: '#0f172a' }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: 'rgba(15, 23, 42, 0.82)',
                          color: '#ffffff',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {item.category}
                      </span>
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 10,
                          right: 10,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: '#dcfce7',
                          color: '#166534',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {item.labBadge}
                      </span>
                    </div>

                    <div style={{ padding: '16px 18px 12px' }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: 17, color: '#0f172a', lineHeight: 1.3 }}>
                        {item.title}
                      </h3>

                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 10 }}>
                        <span>⏱ {item.duration}</span>
                        <span>📚 {item.modulesCount} Modules ({item.lessonsCount} Lessons)</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {item.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            style={{
                              fontSize: 11,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: '#f1f5f9',
                              color: '#334155',
                              fontWeight: 600,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 18px 16px',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      {isEnrolled ? (
                        <>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '4px 10px',
                              borderRadius: 999,
                              background: '#dcfce7',
                              color: '#166534',
                              fontSize: 11.5,
                              fontWeight: 800,
                            }}
                          >
                            ✓ Enrolled · Active
                          </span>
                          <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, display: 'block', marginTop: 3 }}>
                            {tierLabelFor(getCourseTierRecord(item.slug).tier)}
                          </span>
                        </>
                      ) : (
                        <>
                          <strong style={{ fontSize: 16.5, color: '#0f172a', display: 'block' }}>
                            From ₹{(buildSkylentTiersForPrice(item.price, item.slug)[0]?.price ?? item.price).toLocaleString('en-IN')}
                          </strong>
                          <span style={{ fontSize: 11, color: '#5142b5', fontWeight: 700 }}>
                            3 Plans · Career OS in Tier 2 &amp; 3
                          </span>
                        </>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setSelectedExploreDetail(item)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Syllabus
                      </button>
                      {isEnrolled ? (
                        <Link
                          to={`/learn/${item.slug}`}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 8,
                            background: '#059669',
                            color: '#ffffff',
                            fontSize: 12.5,
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          Resume →
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCheckoutTarget(item)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 8,
                            border: 'none',
                            background: '#5142b5',
                            color: '#ffffff',
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )

  const myLearning = (
    <section
      className={hash === '#sh-my-learning' || studentTab === 'courses' ? 'sh-card sh-card--focused' : 'sh-card'}
      aria-labelledby="sh-my-learning"
    >
      <header className="sh-card-head" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 id="sh-my-learning">My Courses</h2>
          {enrollments.status === 'ready' ? (
            <span className="sh-note">{allMyCourses.length} {allMyCourses.length === 1 ? 'enrolled course' : 'enrolled courses'}</span>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all' as const, label: 'All' },
            { id: 'in_progress' as const, label: 'In Progress' },
            { id: 'completed' as const, label: 'Completed' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setCourseFilter(f.id)}
              style={{
                padding: '5px 12px',
                borderRadius: 999,
                border: courseFilter === f.id ? '1.5px solid #5142b5' : '1px solid #cbd5e1',
                background: courseFilter === f.id ? '#f5f3ff' : '#ffffff',
                color: courseFilter === f.id ? '#5142b5' : '#475569',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>
      {enrollments.status === 'loading' && allMyCourses.length === 0 ? (
        <div className="sh-row"><span className="os-skeleton" style={{ width: '60%' }} /></div>
      ) : enrollments.status === 'error' ? (
        <ListError what="Your enrolments" onRetry={retryLists} />
      ) : filteredMyCourses.length === 0 ? (
        <p className="sh-empty">
          No courses match this filter yet.{' '}
          <button
            type="button"
            className="os-link"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
            onClick={() => setStudentTab('explore')}
          >
            Explore programmes
          </button>{' '}
          or <Link className="os-link" to="/programmes">view public catalogue</Link>.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 12, paddingTop: 8 }}>
          {filteredMyCourses.map((item) => {
            const title = item.title
            const pct = item.progressPct ?? 0
            const completed = item.completedCount ?? 0
            const total = item.totalLessons ?? 15
            const openHref = canOpenEnrollment(item.status) && item.slug ? `/learn/${item.slug}` : null
            const thumb = courseThumbForSlug(item.slug)
            return (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 240, flex: 1 }}>
                  <img
                    src={thumb}
                    alt={title}
                    style={{ width: 88, height: 60, objectFit: 'cover', borderRadius: 10, flexShrink: 0, border: '1px solid #e2e8f0' }}
                  />
                  <div>
                    <strong style={{ fontSize: 15.5, color: '#0f172a', display: 'block', marginBottom: 3 }}>{title}</strong>
                    <span style={{ fontSize: 12.5, color: '#64748b', display: 'block' }}>
                      {item.programmeName ? `${item.programmeName} · ` : ''}
                      {completed}/{total} Lessons Completed
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <ProgressRing percent={pct} size={46} stroke={4.5} />
                  {openHref ? (
                    <Link
                      className="os-btn os-btn-primary"
                      to={openHref}
                      style={{ textDecoration: 'none', padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}
                    >
                      {completed > 0 && completed < total ? 'Resume Learning' : 'Start Course'} <ArrowRight />
                    </Link>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )

  const issuedFor = (slug: string, title: string) =>
    certificateRows.some((cert) => (cert.courseSlug ? cert.courseSlug === slug : cert.courseTitle === title))
  const claimable: Array<{ key: string; courseSlug: string; courseTitle: string }> = []
  const claimableProgrammes: Array<{ key: string; programSlug: string; programName: string }> = []
  const seenClaims = new Set<string>()
  const seenProgrammeClaims = new Set<string>()
  for (const item of enrolmentRows) {
    const linked = item.courses ?? []
    if (linked.length > 0) {
      for (const courseRow of linked) {
        if (!isAuthoredCourse(courseRow.slug) || !courseRow.progress.allComplete) continue
        if (issuedFor(courseRow.slug, courseRow.title) || seenClaims.has(courseRow.slug)) continue
        seenClaims.add(courseRow.slug)
        claimable.push({ key: `${item.id}:${courseRow.slug}`, courseSlug: courseRow.slug, courseTitle: courseRow.title })
      }
      const authoredLinked = linked.filter((courseRow) => isAuthoredCourse(courseRow.slug))
      if (
        item.programSlug &&
        authoredLinked.length > 0 &&
        authoredLinked.every((courseRow) => courseRow.progress.allComplete) &&
        !seenProgrammeClaims.has(item.programSlug) &&
        !certificateRows.some((cert) => (cert.code.includes('-PGM') || cert.code.includes('-PRG-')) && cert.courseTitle === (item.programName ?? item.programSlug))
      ) {
        seenProgrammeClaims.add(item.programSlug)
        claimableProgrammes.push({
          key: `prg:${item.id}:${item.programSlug}`,
          programSlug: item.programSlug,
          programName: item.programName ?? item.programSlug,
        })
      }
      continue
    }
    if (
      item.certificateEligible &&
      item.courseSlug &&
      !item.programSlug &&
      isAuthoredCourse(item.courseSlug) &&
      !issuedFor(item.courseSlug, item.courseTitle ?? '') &&
      !seenClaims.has(item.courseSlug)
    ) {
      seenClaims.add(item.courseSlug)
      claimable.push({ key: item.id, courseSlug: item.courseSlug, courseTitle: item.courseTitle ?? item.courseSlug })
    }
  }

  const evidence = (
    <section className="sh-card sh-proof" id="student-evidence" aria-labelledby="sh-evidence">
      <header className="sh-card-head">
        <h2 id="sh-evidence">Evidence and certificates</h2>
        {certificates.status === 'ready' ? <TruthChip state={truthOf('certificates')} /> : null}
      </header>
      {certificates.status === 'loading' ? (
        <div className="sh-row"><span className="os-skeleton" style={{ width: '50%' }} /></div>
      ) : certificates.status === 'error' ? (
        <ListError what="Your certificates" onRetry={retryLists} />
      ) : (
        <>
          {certificateRows.length > 0 ? (
            <ul className="sh-rows">
              {certificateRows.map((cert) => (
                <li key={cert.code} className="sh-row">
                  <div className="sh-row-main">
                    <strong>{cert.courseTitle}</strong>
                    <span className="sh-note">{cert.code} · issued {formatDate(cert.issuedAt)}</span>
                  </div>
                  {cert.revoked ? (
                    <span className="os-status is-idle">Revoked</span>
                  ) : (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <a
                        className="os-link sh-row-link"
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://skylent.live/verify/${cert.code}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Share ${cert.courseTitle} certificate on LinkedIn`}
                      >
                        Share on LinkedIn ↗
                      </a>
                      <Link className="os-link sh-row-link" to={`/verify/${cert.code}`} aria-label={`Verify the ${cert.courseTitle} certificate`}>
                        Verify <ArrowRight />
                      </Link>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
          <CertificateName />
          {claimableProgrammes.map((prog) => {
            const claimKey = `programme:${prog.programSlug}`
            return (
              <div key={prog.key} className="sh-row sh-claim">
                <div className="sh-row-main">
                  <strong>{prog.programName} · Programme Master Certificate</strong>
                  <span className="sh-note">Every course in this programme is complete. Claim your Programme Master Certificate.</span>
                  {claimError?.slug === claimKey ? (
                    <span className="os-error" role="alert">{claimError.message}</span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="os-btn os-btn-primary"
                  disabled={claiming !== null}
                  onClick={() => void claimProgrammeMasterCertificate(prog.programSlug)}
                >
                  {claiming === claimKey ? 'Issuing…' : 'Claim Master Certificate'}
                </button>
              </div>
            )
          })}
          {claimable.map((item) => (
            <div key={item.key} className="sh-row sh-claim">
              <div className="sh-row-main">
                <strong>{item.courseTitle}</strong>
                <span className="sh-note">Every lesson in this course is complete. No certificate issued yet.</span>
                {claimError?.slug === item.courseSlug ? (
                  <span className="os-error" role="alert">{claimError.message}</span>
                ) : null}
              </div>
              <button
                type="button"
                className="os-btn os-btn-primary"
                disabled={claiming !== null}
                onClick={() => void claimCertificate(item.courseSlug)}
              >
                {claiming === item.courseSlug ? 'Issuing…' : 'Claim certificate'}
              </button>
            </div>
          ))}
          {certificateRows.length === 0 && claimable.length === 0 && claimableProgrammes.length === 0 ? (
            <p className="sh-empty">No certificates yet. Complete all 15 lessons in your active course to claim your verifiable SKL certificate.</p>
          ) : null}
        </>
      )}
      <p className="sh-foot">
        Project evidence is kept in Career OS.{' '}
        <Link className="os-link" to="/career-os/projects">View your projects <ArrowRight /></Link>
      </p>
    </section>
  )

  const upcomingEventsWidget = (
    <section className="sh-card" aria-label="Upcoming Workshops and Live Sessions">
      <header className="sh-card-head">
        <h2>Upcoming Events &amp; Workshops</h2>
        <Link className="os-link" to="/events" style={{ fontSize: 12.5 }}>View all →</Link>
      </header>
      <div style={{ display: 'grid', gap: 10 }}>
        {[
          {
            title: 'SQL Revenue & Margin Diagnostics Workshop',
            when: 'Sat, Nov 14 · 6:00 PM IST',
            badge: '₹99 → 99 Elixir Cashback',
            href: '/events',
          },
          {
            title: 'Grounded RAG & LLM Evaluation Live Lab',
            when: 'Sun, Nov 15 · 11:00 AM IST',
            badge: 'Live Browser Lab',
            href: '/events',
          },
        ].map((ev) => (
          <div
            key={ev.title}
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div>
              <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block' }}>{ev.title}</strong>
              <span style={{ fontSize: 12, color: '#64748b' }}>{ev.when} · {ev.badge}</span>
            </div>
            <Link className="os-link" to={ev.href} style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>
              Register →
            </Link>
          </div>
        ))}
      </div>
    </section>
  )

  if (!course || !workspace) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="sh" id="student-learning">
          {studentTab === 'explore' ? (
            exploreProgrammesSection
          ) : (
            <>
              <div className="sh-next sh-royal-hero" style={{ marginBottom: 22 }}>
                <p className="sh-next-label"><span aria-hidden="true" />Welcome to Skylent</p>
                <h2>Choose your first career track</h2>
                <p className="sh-body">
                  Pick any of our 6 flagship programmes below to open your interactive lessons, browser lab, and capstone workspace immediately.
                </p>
                <div className="os-actions">
                  <button
                    type="button"
                    className="os-btn os-btn-primary os-btn-lg sh-royal-cta"
                    onClick={() => setStudentTab('explore')}
                  >
                    Explore Programmes <ArrowRight />
                  </button>
                  <Link className="os-btn os-btn-ghost sh-royal-secondary" to="/programmes">
                    Public Catalogue
                  </Link>
                </div>
              </div>
              {exploreProgrammesSection}
              {enrolmentRows.length > 0 ? <div className="sh-stack" style={{ marginTop: 20 }}>{myLearning}<CareerRiseCard />{evidence}</div> : null}
              <section className="sh-card" aria-label="Elixir wallet" style={{ marginTop: 22 }}><ElixirWalletPanel /></section>
            </>
          )}
        </div>
        {checkoutTarget ? (
          <EnrollmentModal
            item={{
              kind: 'course',
              slug: checkoutTarget.slug,
              title: checkoutTarget.title,
              price: checkoutTarget.price,
              enrollable: true,
              enrollmentStatus: 'open',
            }}
            onClose={() => setCheckoutTarget(null)}
          />
        ) : null}
      </AuthDashboardShell>
    )
  }

  const allLessons = course.modules.flatMap((module) => module.lessons)
  const resume = workspace.resume
  const resumeLesson = allLessons.find((lesson) => lesson.id === resume.lessonId) ?? null
  const resumeNumber = resumeLesson ? allLessons.findIndex((lesson) => lesson.id === resumeLesson.id) + 1 : 0
  const { completedCount, totalLessons, progressPct, allComplete } = workspace.progress
  const resumeHref = resume.lessonId ? `/learn/${course.slug}/${resume.lessonId}` : `/learn/${course.slug}`
  const resumeStarted = Boolean(resume.lessonId && workspace.lessonStates[resume.lessonId]?.started)
  const profile = courseProductProfile(course.slug)
  const completedModulesCount = course.modules.filter((m) =>
    m.lessons.every((l) => workspace.lessonStates[l.id]?.complete),
  ).length
  const totalModulesCount = course.modules.length
  const checksAttempted = allLessons.filter(
    (l) => (l.type === 'quiz' || l.type === 'assignment') && workspace.lessonStates[l.id]?.started,
  ).length
  const totalChecks = Math.max(
    1,
    allLessons.filter((l) => l.type === 'quiz' || l.type === 'assignment').length,
  )

  const currentProject = findProjectForCourse(projectRows, course.slug)

  const projectsSection = (
    <section
      className={hash === '#student-projects' || studentTab === 'projects' ? 'sh-card sh-card--focused' : 'sh-card'}
      id="student-projects"
      aria-labelledby="sh-project"
    >
      <header className="sh-card-head">
        <h2 id="sh-project">Project &amp; Interactive Studio</h2>
        {currentProject ? (
          <span className={currentProject.status === 'ready_to_review' ? 'os-status is-done' : currentProject.status === 'not_started' ? 'os-status is-idle' : 'os-status'}>
            {projectStatusLabel(currentProject.status)}
          </span>
        ) : null}
      </header>
      {projects.status === 'loading' ? (
        <div className="sh-row"><span className="os-skeleton" style={{ width: '55%' }} /></div>
      ) : projects.status === 'error' ? (
        <ListError what="Your projects" onRetry={retryLists} />
      ) : currentProject ? (
        <div className="sh-row" id="student-practice">
          <div className="sh-row-main">
            <strong>{currentProject.title}</strong>
            <span className="sh-note">
              {currentProject.progress.complete} / {currentProject.progress.total} milestones complete
            </span>
            <div className="os-progress-bar sh-row-bar" role="progressbar" aria-label={`${currentProject.title} tasks`} aria-valuemin={0} aria-valuemax={currentProject.progress.total} aria-valuenow={currentProject.progress.complete}>
              <span style={{ width: `${currentProject.progress.total ? (currentProject.progress.complete / currentProject.progress.total) * 100 : 0}%` }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {(() => {
              const environment = practiceEnvironmentForCourse(course.slug)
              const sqlLabHref = dashboardSqlLabHref(course.slug, resume.lessonId)
              if (environment?.status === 'runs' && sqlLabHref) {
                return (
                  <Link className="os-btn os-btn-ghost" style={{ minHeight: 36, fontSize: 12.5 }} to={sqlLabHref}>
                    SQL Lab
                  </Link>
                )
              }
              return null
            })()}
            <Link
              className="os-btn os-btn-primary"
              style={{ minHeight: 36, fontSize: 12.5, textDecoration: 'none' }}
              to={learnerProjectPath(currentProject.courseSlug, currentProject.projectType)}
              aria-label={`Open ${currentProject.title}`}
            >
              Open Project Studio <ArrowRight />
            </Link>
          </div>
        </div>
      ) : profile?.project ? (
        <div className="sh-row" id="student-practice">
          <div className="sh-row-main">
            <strong>{profile.project.title || 'Capstone Project Studio'}</strong>
            <span className="sh-note">Interactive Case &amp; 6 Capstone Milestones</span>
          </div>
          <Link className="os-btn os-btn-primary" style={{ minHeight: 36, fontSize: 12.5, textDecoration: 'none' }} to={profile.project.href}>
            Open Project Studio <ArrowRight />
          </Link>
        </div>
      ) : (
        <p className="sh-empty" id="student-practice">Assignments are inside your course lessons.</p>
      )}
    </section>
  )

  const activityDates: string[] = [
    ...projectRows.map((p) => p.updatedAt),
    ...certificateRows.map((c) => c.issuedAt),
  ]
  if (completedCount > 0 || resumeStarted) {
    activityDates.push(new Date().toISOString())
  }
  const streak = computeLearnerExecutionStreak(activityDates)
  const activeDayNumbers = new Set(
    streak.heatmapDays.filter((d) => d.active).map((d) => Number(d.date.slice(8))),
  )
  activeDayNumbers.add(new Date().getDate())

  const profileCompletenessPct = looksLikeFullName(user.name) ? 85 : 60

  return (
    <AuthDashboardShell {...shell}>
      <div className="sh">
        {/* Top Streak & Profile Readiness Strip (Matching Image 6) */}
        {studentTab === 'overview' ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              padding: '12px 18px',
              marginBottom: 18,
              borderRadius: 14,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  color: '#c2410c',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                🔥 {streak.currentStreakDays} Days Streak
              </span>
              <span style={{ fontSize: 13.5, color: '#334155', fontWeight: 600 }}>
                Welcome back, <strong style={{ color: '#0f172a' }}>{user.name}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
                  Profile Readiness: <strong style={{ color: '#5142b5' }}>{profileCompletenessPct}%</strong>
                </span>
                <div style={{ width: 90, height: 7, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: `${profileCompletenessPct}%`, height: '100%', background: '#5142b5' }} />
                </div>
              </div>
              <Link
                to="/career-os/profile"
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  color: '#5142b5',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Complete Profile →
              </Link>
            </div>
          </div>
        ) : null}

        {/* Resume Learning Card (Matching Image 6 Horizontal Card with Thumbnail + Progress Ring) */}
        {studentTab === 'overview' ? (
          <section
            id="student-learning"
            aria-labelledby="sh-continue"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: '20px 22px',
              marginBottom: 20,
              boxShadow: '0 10px 28px -16px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Resume Learning
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 260, flex: 1 }}>
                <img
                  src={courseThumbForSlug(course.slug)}
                  alt={course.title}
                  style={{
                    width: 128,
                    height: 84,
                    objectFit: 'cover',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#5142b5', display: 'block', marginBottom: 2 }}>
                    {course.title} · Module {resume.moduleIndex} of {resume.moduleTotal}
                  </span>
                  <h2 id="sh-continue" style={{ margin: '0 0 6px', fontSize: 19, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                    {allComplete
                      ? `Completed: ${course.title}`
                      : `${resumeNumber ? `Lecture ${resumeNumber}: ` : ''}${resume.lessonTitle || course.title}`}
                  </h2>
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    {completedModulesCount}/{totalModulesCount} Modules Completed · {completedCount}/{totalLessons} Lessons ({progressPct}%)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ProgressRing percent={progressPct} size={54} stroke={5} />
                <Link
                  className="os-btn os-btn-primary"
                  to={allComplete ? `/learn/${course.slug}` : resumeHref}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 10,
                    background: '#5142b5',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  {allComplete ? 'Review Course' : 'Continue Learning'} <ArrowRight />
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {/* Today's Progress (Circular Rings) + Monthly Progress Calendar Grid (Matching Image 6) */}
        {studentTab === 'overview' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: 18,
              marginBottom: 20,
            }}
          >
            {/* Left Card: Today's Progress */}
            <section
              className="sh-card"
              aria-label="Today's Progress"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 17, color: '#0f172a' }}>Today&apos;s Progress</h2>
                  <span style={{ fontSize: 12.5, color: '#64748b' }}>
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#ecfdf5', color: '#047857' }}>
                  +{streak.streakBonusElixir} Elixir Bonus
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  padding: '14px 8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <ProgressRing
                    percent={totalLessons ? (completedCount / totalLessons) * 100 : 0}
                    size={96}
                    stroke={8}
                    color="#5142b5"
                    label={`${completedCount}/${totalLessons}`}
                  />
                  <div>
                    <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block' }}>Lessons Completed</strong>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{progressPct}% of active track</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <ProgressRing
                    percent={(checksAttempted / totalChecks) * 100}
                    size={96}
                    stroke={8}
                    color="#059669"
                    label={`${checksAttempted}/${totalChecks}`}
                  />
                  <div>
                    <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block' }}>Labs &amp; Checks Attempted</strong>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Quizzes &amp; case assignments</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Card: Monthly Progress Calendar + 14-Day Proof-of-Work Activity Grid */}
            <section
              className="sh-card"
              aria-label="Monthly Progress and 14-Day Proof-of-Work Activity Grid"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 17, color: '#0f172a' }}>Monthly Progress</h2>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · 14-Day Proof-of-Work Activity Grid
                  </span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#5142b5' }}>
                  Best: {streak.longestStreakDays}d
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginBottom: 12 }}>
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
                  <span key={d} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', paddingBottom: 4 }}>{d}</span>
                ))}
                {Array.from({ length: 30 }, (_, idx) => {
                  const dayNum = idx + 1
                  const isActive = activeDayNumbers.has(dayNum)
                  return (
                    <div
                      key={dayNum}
                      style={{
                        height: 28,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11.5,
                        fontWeight: isActive ? 800 : 500,
                        background: isActive ? '#5142b5' : '#f8fafc',
                        color: isActive ? '#ffffff' : '#475569',
                        border: isActive ? '1px solid #5142b5' : '1px solid #f1f5f9',
                      }}
                    >
                      {dayNum}
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, minmax(0, 1fr))', gap: 4 }} role="list" aria-label="Last 14 days activity heatmap">
                {streak.heatmapDays.map((day) => (
                  <div
                    key={day.date}
                    role="listitem"
                    title={`${day.label}: ${day.count} verified action(s)`}
                    style={{
                      height: 18,
                      borderRadius: 4,
                      background: day.active ? '#5142b5' : '#e2e8f0',
                    }}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {/* Main 2-Column Overview Grid */}
        {studentTab === 'overview' ? (
          <div className="sh-grid">
            <div className="sh-stack">
              {myLearning}
              {projectsSection}
              <CareerRiseCard />
            </div>

            <div className="sh-stack">
              <section className="sh-card sh-ai sh-royal-ai" aria-labelledby="sh-ai">
                <header className="sh-ai-head">
                  <AiMark />
                  <span className="sh-ai-live-pill">✓ Live in Lesson</span>
                </header>
                <div className="sh-royal-ai__body">
                  <h2 id="sh-ai" className="sh-royal-ai__title">{AI_NAME} · Hinglish &amp; English Coach</h2>

                  <div className="sh-royal-ai__pills">
                    <span>🇮🇳 Simple Hinglish Mode</span>
                    <span>🛠️ SQL &amp; Code Debugger</span>
                    <span>👨‍🏫 20-Min Human TA SLA</span>
                  </div>
                  <Link className="sh-royal-ai__cta" to={resumeHref}>
                    Open {AI_NAME} in Lesson {resumeNumber || 1} <ArrowRight />
                  </Link>
                </div>
              </section>

              {upcomingEventsWidget}
              {evidence}
            </div>
          </div>
        ) : null}

        {/* My Courses View (Matching Image 7: Courses on Left + Upcoming Events on Right) */}
        {studentTab === 'courses' ? (
          <div className="sh-grid">
            <div className="sh-stack">
              {myLearning}
              <CareerRiseCard />
            </div>
            <div className="sh-stack">
              {upcomingEventsWidget}
              {projectsSection}
            </div>
          </div>
        ) : null}

        {/* Explore Programmes View (Inside Logged-in Dashboard!) */}
        {studentTab === 'explore' ? exploreProgrammesSection : null}

        {studentTab === 'projects' ? (
          <div className="sh-stack">
            {projectsSection}
            <CareerRiseCard />
          </div>
        ) : null}

        {studentTab === 'certificates' ? (
          <div className="sh-stack">
            {evidence}
          </div>
        ) : null}

        {studentTab === 'wallet' ? (
          <section className="sh-card" aria-label="Elixir wallet" style={{ marginTop: 12 }}>
            <ElixirWalletPanel />
          </section>
        ) : null}
      </div>

      {checkoutTarget ? (
        <EnrollmentModal
          item={{
            kind: 'course',
            slug: checkoutTarget.slug,
            title: checkoutTarget.title,
            price: checkoutTarget.price,
            enrollable: true,
            enrollmentStatus: 'open',
          }}
          onClose={() => setCheckoutTarget(null)}
        />
      ) : null}
    </AuthDashboardShell>
  )
}
