import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
import { AiMark, AI_NAME, ArrowRight, TruthChip } from '../components/skylent/primitives'
import analyticsVisual from '@/assets/site/home/program-analytics-800.webp'
import productVisual from '@/assets/site/home/program-product-800.webp'
import scienceVisual from '@/assets/site/degree-computing.jpg'
import webVisual from '@/assets/site/home/program-web-800.webp'
import aiVisual from '@/assets/site/program-ai.jpg'
import sqlVisual from '@/assets/site/program-library.jpg'
import './LearnWorkspace.css'
import './StudentHome.css'

const CACHE_ENROLLMENTS_KEY = 'skylent_cache_enrollments_v1'
const CACHE_PROJECTS_KEY = 'skylent_cache_projects_v1'
const CACHE_CERTS_KEY = 'skylent_cache_certs_v1'

let memEnrollments: ApiEnrollmentSummary[] | null = null
let memProjects: ProjectSummary[] | null = null
let memCerts: SkylentCertificate[] | null = null

function readCache<T>(key: string, mem: T | null): T | null {
  if (mem) return mem
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeCache<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

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
    price: 1499,
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
    price: 1499,
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
    price: 1499,
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
    price: 1499,
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
    price: 1499,
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
    price: 1499,
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
      <span style={{ position: 'absolute', fontSize: size >= 90 ? 18 : 11.5, fontWeight: 600, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
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
  const [localLockedUntil, setLocalLockedUntil] = useState<string | null>(() => {
    if (typeof window === 'undefined' || !user?.id) return null
    try {
      return window.localStorage.getItem(`skylent:name-locked-until:${user.id}`)
    } catch {
      return null
    }
  })
  if (!user) return null
  const complete = looksLikeFullName(current)
  const effectiveLockedUntil = user.nameChangeLockedUntil || localLockedUntil
  const isLocked = Boolean(
    effectiveLockedUntil && new Date(effectiveLockedUntil).getTime() > Date.now(),
  )
  const lockedDateLabel = effectiveLockedUntil
    ? new Date(effectiveLockedUntil).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

  async function save() {
    const next = draft.trim().replace(/\s+/g, ' ')
    if (!looksLikeFullName(next)) {
      setError('Enter your first and last name as they should appear on a certificate.')
      return
    }
    if (next.toLowerCase() === current.trim().toLowerCase()) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateDisplayName(next)
      const sixMonthsLater = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      setLocalLockedUntil(sixMonthsLater)
      try {
        window.localStorage.setItem(`skylent:name-locked-until:${user.id}`, sixMonthsLater)
      } catch {
        // ignore
      }
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
          <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '8px 10px', borderRadius: 8, fontWeight: 600 }}>
            Note: To prevent certificate misuse, your account &amp; certificate name can only be changed once every 6 months (180 days). Please verify your spelling carefully before saving.
          </p>
          <input id="sh-cert-name" className="sh-name-input" value={draft} maxLength={120} autoComplete="name" onChange={(event) => setDraft(event.target.value)} />
          <div className="sh-name-actions">
            <button type="submit" className="os-btn os-btn-primary" disabled={saving}>{saving ? 'Saving & Locking…' : 'Save name (Locks for 6 months)'}</button>
            <button type="button" className="os-btn os-btn-ghost" disabled={saving} onClick={() => { setEditing(false); setDraft(current); setError(null) }}>Cancel</button>
          </div>
          {error ? <span className="os-error" role="alert">{error}</span> : null}
        </form>
      ) : (
        <>
          <div className="sh-row-main">
            <strong>Name on certificates: {current || 'not set'}</strong>
            <span className="sh-note">
              {isLocked
                ? `Certificates print this name. Name change is locked for 6 months (until ${lockedDateLabel}) to prevent certificate misuse.`
                : complete
                  ? 'Certificates print this name. (Can only be changed once every 6 months)'
                  : 'A certificate needs your first and last name.'}
            </span>
          </div>
          {isLocked ? (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: 999,
                background: '#f1f5f9',
                color: '#475569',
                whiteSpace: 'nowrap',
              }}
              title={`Next name change allowed after ${lockedDateLabel}`}
            >
              Locked until {lockedDateLabel}
            </span>
          ) : (
            <button type="button" className="os-link sh-row-link" onClick={() => { setDraft(current); setEditing(true) }}>
              {complete ? 'Change (1x / 6M)' : 'Add full name'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

type Loaded<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error' }
type AiAvailability = 'checking' | 'available' | 'unavailable' | 'unknown'
type StudentTabId = 'overview' | 'courses' | 'explore' | 'projects' | 'certificates' | 'wallet' | 'profile'

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

/**
 * Full-Viewport Portal Plan Selection Modal (z-index: 99999)
 * Never clipped by .auth-shell-rail (z-index: 120) and closes automatically on sidebar navigation, Escape, or backdrop click.
 */
function LearnerProfileSettingsSection() {
  const { user } = useAuth()
  const storageKey = user?.id ? `skylent:learner-prof-details:${user.id}` : "skylent:learner-prof-details:default"
  const [savedToast, setSavedToast] = useState(false)
  const [prof, setProf] = useState<{
    phone: string
    phoneLocked: boolean
    status: string
    organization: string
    roleOrDegree: string
    graduationYear: string
    targetTrack: string
    linkedinUrl: string
    githubUrl: string
  }>(() => {
    const fallback = {
      phone: "",
      phoneLocked: false,
      status: "College Student / Final Year",
      organization: "",
      roleOrDegree: "",
      graduationYear: "2026",
      targetTrack: "Data Analytics & Business SQL",
      linkedinUrl: "",
      githubUrl: "",
    }
    if (typeof window === "undefined") return fallback
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) return fallback
      return { ...fallback, ...(JSON.parse(raw) as Record<string, unknown>) }
    } catch {
      return fallback
    }
  })

  if (!user) return null

  function handleSaveProf(e: React.FormEvent) {
    e.preventDefault()
    const cleanPhone = prof.phone.replace(/\D/g, "").slice(-10)
    const next = {
      ...prof,
      phone: cleanPhone.length === 10 ? cleanPhone : prof.phone,
      phoneLocked: prof.phoneLocked || cleanPhone.length === 10,
    }
    setProf(next)
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // ignore
    }
    setSavedToast(true)
    window.setTimeout(() => setSavedToast(false), 3000)
  }

  return (
    <section id="profile-settings" aria-label="My Profile and Account Settings" style={{ display: "grid", gap: 20 }}>
      <div
        style={{
          padding: "24px 26px",
          borderRadius: 18,
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #3b2d96 100%)",
          color: "#ffffff",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(255,255,255,0.16)",
              border: "1.5px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {user.avatar || "LR"}
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#c4b8ff" }}>
              LEARNER PROFILE &amp; SECURITY SETTINGS
            </span>
            <h2 style={{ margin: "4px 0 2px", fontSize: 22, color: "#ffffff" }}>{user.name}</h2>
            <span style={{ fontSize: 13, color: "#cbd5e1" }}>{user.email}</span>
          </div>
        </div>
        <Link
          to="/account/password"
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: "#ffffff",
            color: "#0f172a",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Change Password (3-Month Policy)
        </Link>
      </div>

      {/* 1. Certificate Name (6-Month Lock) & Registered Email/Mobile Lock */}
      <div className="sh-card">
        <header className="sh-card-head">
          <h2>1. Verified Account Identity (6-Month Name Lock &amp; Permanent Email/Mobile Binding)</h2>
        </header>
        <CertificateName />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
            marginTop: 14,
          }}
        >
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block" }}>
              Registered Email Address (Locked)
            </span>
            <strong style={{ fontSize: 14, color: "#0f172a", display: "block", marginTop: 4 }}>{user.email}</strong>
            <span style={{ fontSize: 11.5, color: "#059669", fontWeight: 600 }}>Permanently bound to this account</span>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block" }}>
              Registered Mobile Number (+91)
            </span>
            {prof.phoneLocked && prof.phone ? (
              <>
                <strong style={{ fontSize: 14, color: "#0f172a", display: "block", marginTop: 4 }}>+91-{prof.phone}</strong>
                <span style={{ fontSize: 11.5, color: "#059669", fontWeight: 600 }}>Permanently bound (Admin-only change)</span>
              </>
            ) : (
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <input
                  type="tel"
                  maxLength={10}
                  value={prof.phone}
                  onChange={(e) => setProf({ ...prof, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  placeholder="Enter 10-digit mobile"
                  style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Professional & Academic Details */}
      <form className="sh-card" onSubmit={handleSaveProf}>
        <header className="sh-card-head">
          <h2>2. Professional &amp; Academic Details</h2>
          {savedToast ? (
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#059669" }}>✓ Profile Saved</span>
          ) : null}
        </header>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <label style={{ display: "grid", gap: 5, fontSize: 12.5, fontWeight: 700, color: "#334155" }}>
            Current Status
            <select
              value={prof.status}
              onChange={(e) => setProf({ ...prof, status: e.target.value })}
              style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13.5, background: "#ffffff" }}
            >
              <option value="College Student / Final Year">College Student / Final Year</option>
              <option value="Recent Graduate / Job Seeker">Recent Graduate / Job Seeker</option>
              <option value="Working Professional (1-3 Yrs)">Working Professional (1-3 Yrs)</option>
              <option value="Working Professional (3+ Yrs)">Working Professional (3+ Yrs)</option>
            </select>
          </label>
          <label style={{ display: "grid", gap: 5, fontSize: 12.5, fontWeight: 700, color: "#334155" }}>
            College / University or Company Name
            <input
              type="text"
              value={prof.organization}
              onChange={(e) => setProf({ ...prof, organization: e.target.value })}
              placeholder="e.g. NIT Rourkela / TCS"
              style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13.5 }}
            />
          </label>
          <label style={{ display: "grid", gap: 5, fontSize: 12.5, fontWeight: 700, color: "#334155" }}>
            Degree / Branch or Job Role
            <input
              type="text"
              value={prof.roleOrDegree}
              onChange={(e) => setProf({ ...prof, roleOrDegree: e.target.value })}
              placeholder="e.g. B.Tech CSE / Data Analyst"
              style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13.5 }}
            />
          </label>
          <label style={{ display: "grid", gap: 5, fontSize: 12.5, fontWeight: 700, color: "#334155" }}>
            Graduation Year
            <input
              type="text"
              value={prof.graduationYear}
              onChange={(e) => setProf({ ...prof, graduationYear: e.target.value })}
              placeholder="e.g. 2026"
              style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13.5 }}
            />
          </label>
          <label style={{ display: "grid", gap: 5, fontSize: 12.5, fontWeight: 700, color: "#334155" }}>
            LinkedIn Profile URL
            <input
              type="url"
              value={prof.linkedinUrl}
              onChange={(e) => setProf({ ...prof, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/yourname"
              style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13.5 }}
            />
          </label>
          <label style={{ display: "grid", gap: 5, fontSize: 12.5, fontWeight: 700, color: "#334155" }}>
            GitHub / Portfolio URL
            <input
              type="url"
              value={prof.githubUrl}
              onChange={(e) => setProf({ ...prof, githubUrl: e.target.value })}
              placeholder="https://github.com/yourname"
              style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13.5 }}
            />
          </label>
        </div>
        <button type="submit" className="os-btn os-btn-primary">
          Save Professional Details
        </button>
      </form>

      {/* 3. 3-Month (90-Day) Mandatory Password Auto-Rotation Policy Card */}
      <div className="sh-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
        <div>
          <strong style={{ fontSize: 15.5, color: "#0f172a", display: "block" }}>
            3. Password Security &amp; 3-Month (90-Day) Auto-Rotation Policy
          </strong>
          <span className="sh-note">
            To protect your certificates and Career OS portfolio, Skylent prompts you every 3 months (90 days) to rotate your account password.
          </span>
        </div>
        <Link className="os-btn os-btn-primary" to="/account/password" style={{ textDecoration: "none" }}>
          Update Password →
        </Link>
      </div>
    </section>
  )
}

function SelectYourPlanPortalModal({
  course,
  onClose,
  onSelectPlan,
}: {
  course: DashboardExploreCourse
  onClose: () => void
  onSelectPlan: (tier: 'certificate' | 'professional' | 'flagship', price: number) => void
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Select Your Plan for ${course.title}`}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(12px, 2.5vw, 28px)',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 20,
          width: '100%',
          maxWidth: 1020,
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: 'clamp(20px, 3vw, 32px)',
          boxShadow: '0 32px 80px -16px rgba(15, 23, 42, 0.45)',
          border: '1px solid #e2e8f0',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 22 }}>
          <div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#5142b5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {course.title}
            </span>
            <h2 style={{ margin: '4px 0 0', fontSize: 'clamp(22px, 2.6vw, 28px)', color: '#0f172a', fontFamily: 'var(--font-display)' }}>
              Select Your Plan
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ✕ Close
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 18,
            alignItems: 'stretch',
          }}
        >
          {/* Plan 1: Self-Paced Certificate Plan (₹1,499) */}
          <div
            style={{
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              padding: '22px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <strong style={{ fontSize: 18, color: '#0f172a' }}>Certificate Plan</strong>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#f1f5f9', color: '#475569' }}>
                  Self-Paced
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <strong style={{ fontSize: 28, color: '#0f172a' }}>₹1,499</strong>
                <span style={{ fontSize: 14, color: '#94a3b8', textDecoration: 'line-through' }}>₹2,998</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectPlan('certificate', 1499)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid #ddd6fe',
                  background: '#ede9fe',
                  color: '#4c1d95',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: 18,
                }}
              >
                Buy Now
              </button>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                <li>✓ Full self-paced reading modules &amp; concept quizzes</li>
                <li>✓ In-browser practice workbench (SQL / Python / Case Sandbox)</li>
                <li>✓ Verifiable SKL Course Completion Certificate (/verify)</li>
                <li style={{ color: '#94a3b8' }}>✕ Career OS &amp; Recruiter Job Board NOT included</li>
                <li style={{ color: '#94a3b8' }}>✕ Live weekend classes &amp; 1:1 mock interviews NOT included</li>
              </ul>
            </div>
          </div>

          {/* Plan 2: Premium Plan (₹3,499) */}
          <div
            style={{
              borderRadius: 16,
              border: '1.5px solid #c4b5fd',
              background: '#ffffff',
              padding: '22px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 30px -16px rgba(81, 66, 181, 0.18)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <strong style={{ fontSize: 18, color: '#0f172a' }}>Premium Plan</strong>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#f3e8ff', color: '#6b21a8' }}>
                  Career OS Included
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <strong style={{ fontSize: 28, color: '#0f172a' }}>₹3,499</strong>
                <span style={{ fontSize: 14, color: '#94a3b8', textDecoration: 'line-through' }}>₹6,998</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectPlan('professional', 3499)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid #c4b5fd',
                  background: '#ede9fe',
                  color: '#4c1d95',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: 18,
                }}
              >
                Buy Now
              </button>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                <li>✓ Everything in Certificate Training + Graded Capstone Studio</li>
                <li>✓ Public Proof-of-Work Dossier (/verify) for hiring managers</li>
                <li>✓ Skylent Career OS Included (6-Month Active Window + 3-Month Practice Extension after 60% rule)</li>
                <li>✓ Track-Specific Interview Prep, Spoken English, ATS Resume &amp; LinkedIn Makeover</li>
              </ul>
            </div>
          </div>

          {/* Plan 3: Pro Plan (₹6,499) */}
          <div
            style={{
              borderRadius: 16,
              border: '1.5px solid #4c1d95',
              background: 'linear-gradient(160deg, #3b0764 0%, #4c1d95 50%, #5b21b6 100%)',
              color: '#ffffff',
              padding: '22px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 18px 40px -16px rgba(76, 29, 149, 0.45)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <strong style={{ fontSize: 18, color: '#ffffff' }}>Pro Plan</strong>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.18)', color: '#ffffff' }}>
                  Recommended
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <strong style={{ fontSize: 28, color: '#ffffff' }}>₹6,499</strong>
                <span style={{ fontSize: 14, color: '#cbd5e1', textDecoration: 'line-through' }}>₹12,998</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectPlan('flagship', 6499)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: 18,
                }}
              >
                Buy Now
              </button>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10, fontSize: 13, color: '#f1f5f9', lineHeight: 1.5 }}>
                <li>✓ Live weekend mentor classes + full recorded lecture library</li>
                <li>✓ Priority 20-Minute Faculty TA Doubt &amp; Rubric Review SLA</li>
                <li>✓ Full Career OS Pro (6M Window + 3M Intensive Practice Extension at 60%)</li>
                <li>✓ 1-on-1 Mock Interviews + Direct Recruiter Job Board &amp; Referrals</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
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
    if (hash === '#profile-settings') return 'profile'
    if (hash === '#sh-my-learning') return 'courses'
    if (hash === '#student-projects') return 'projects'
    if (hash === '#explore-programmes') return 'explore'
    return 'overview'
  })
  const [courseFilter, setCourseFilter] = useState<'all' | 'in_progress' | 'completed'>('all')
  const [exploreCategory, setExploreCategory] = useState<'All' | 'Data & SQL' | 'AI & Data Science' | 'Product & Full-Stack'>('All')
  const [exploreQuery, setExploreQuery] = useState('')
  const [selectedExploreDetail, setSelectedExploreDetail] = useState<DashboardExploreCourse | null>(null)
  const [checkoutTarget, setCheckoutTarget] = useState<DashboardExploreCourse | null>(null)
  const [targetCareerRole, setTargetCareerRole] = useState<string>(() => {
    try {
      return typeof window !== "undefined" ? window.localStorage.getItem("skylent:learner-target-role") || "Data Analyst & SQL Specialist" : "Data Analyst & SQL Specialist"
    } catch {
      return "Data Analyst & SQL Specialist"
    }
  })
  const [goalSavedToast, setGoalSavedToast] = useState<string | null>(null)

  const [enrollments, setEnrollments] = useState<Loaded<ApiEnrollmentSummary[]>>(() => {
    const cached = readCache(CACHE_ENROLLMENTS_KEY, memEnrollments)
    return cached ? { status: 'ready', data: cached } : { status: 'loading' }
  })
  const [projects, setProjects] = useState<Loaded<ProjectSummary[]>>(() => {
    const cached = readCache(CACHE_PROJECTS_KEY, memProjects)
    return cached ? { status: 'ready', data: cached } : { status: 'loading' }
  })
  const [certificates, setCertificates] = useState<Loaded<SkylentCertificate[]>>(() => {
    const cached = readCache(CACHE_CERTS_KEY, memCerts)
    return cached ? { status: 'ready', data: cached } : { status: 'loading' }
  })
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<{ slug: string; message: string } | null>(null)
  const [_aiStatus, setAiStatus] = useState<AiAvailability>('available')
  const [listsKey, setListsKey] = useState(0)

  const paymentCancelled = useMemo(() => {
    const params = new URLSearchParams(search)
    return params.get('payment') === 'cancelled' || params.get('payment') === 'failed'
  }, [search])

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  // Whenever hash or pathname changes (e.g. clicking Dashboard, My Courses, Projects, Explore Programmes in sidebar),
  // immediately close any open Plan Modal or Explore Detail!
  useEffect(() => {
    setCheckoutTarget(null)
    setSelectedExploreDetail(null)
    if (hash === '#profile-settings') setStudentTab('profile')
    else if (hash === '#sh-my-learning') setStudentTab('courses')
    else if (hash === '#student-projects') setStudentTab('projects')
    else if (hash === '#explore-programmes') setStudentTab('explore')
    else if (!hash) setStudentTab('overview')
    previousHash.current = hash
  }, [hash, pathname])

  const loadLists = useCallback((signal: AbortSignal) => {
    void fetchLmsEnrollments()
      .then((data) => {
        if (!signal.aborted) {
          memEnrollments = data
          writeCache(CACHE_ENROLLMENTS_KEY, data)
          setEnrollments({ status: 'ready', data })
        }
      })
      .catch(() => {
        if (!signal.aborted) {
          setEnrollments((prev) => (prev.status === 'ready' ? prev : { status: 'error' }))
        }
      })

    void listLearnerProjects(signal)
      .then((data) => {
        if (!signal.aborted) {
          memProjects = data
          writeCache(CACHE_PROJECTS_KEY, data)
          setProjects({ status: 'ready', data })
        }
      })
      .catch(() => {
        if (!signal.aborted) {
          setProjects((prev) => (prev.status === 'ready' ? prev : { status: 'error' }))
        }
      })

    void fetchMyCertificates(signal)
      .then((data) => {
        if (!signal.aborted) {
          memCerts = data
          writeCache(CACHE_CERTS_KEY, data)
          setCertificates({ status: 'ready', data })
        }
      })
      .catch(() => {
        if (!signal.aborted) {
          setCertificates((prev) => (prev.status === 'ready' ? prev : { status: 'error' }))
        }
      })
  }, [])

  // Do NOT include `workspace` in dependencies here — otherwise when `workspace` finishes loading,
  // it aborts the in-flight `fetchLmsEnrollments()` and restarts it, causing a 3-4s skeleton delay!
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

  function handleSelectPlanAndCheckout(target: DashboardExploreCourse, tier: 'certificate' | 'professional' | 'flagship', price: number) {
    setCheckoutTarget(null)
    navigate(`/checkout?kind=course&slug=${encodeURIComponent(target.slug)}&tier=${tier}&price=${price}&from=dashboard`)
  }

  const crumbSection =
    studentTab === 'profile'
      ? 'My Profile & Settings'
      : studentTab === 'courses'
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
      setCheckoutTarget(null)
      setSelectedExploreDetail(null)
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
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

  if (loading && !workspace && enrollments.status !== 'ready') {
    return (
      <AuthDashboardShell {...shell}>
        <div className="sh"><Skeleton /></div>
      </AuthDashboardShell>
    )
  }

  const enrolmentRows = enrollments.status === 'ready' ? enrollments.data : []
  const certificateRows = certificates.status === 'ready' ? certificates.data : []
  const projectRows = projects.status === 'ready' ? projects.data : []

  // Immediate fallback to workspace.course while enrollments list is still fetching so My Courses never shows a grey skeleton!
  const allMyCourses = (() => {
    const rows = myCourseRows(enrolmentRows)
    if (rows.length > 0) return rows
    if (course && workspace) {
      return [
        {
          key: `ws:${course.slug}`,
          slug: course.slug,
          title: course.title,
          status: workspace.progress.allComplete ? ('completed' as const) : ('active' as const),
          progressPct: workspace.progress.progressPct,
          completedCount: workspace.progress.completedCount,
          totalLessons: workspace.progress.totalLessons,
          programmeName: null,
        },
      ]
    }
    return []
  })()

  const filteredMyCourses = allMyCourses.filter((row) => {
    if (courseFilter === 'completed') return row.status === 'completed' || (row.progressPct ?? 0) >= 100
    if (courseFilter === 'in_progress') return row.status !== 'completed' && (row.progressPct ?? 0) < 100
    return true
  })

  // In-Dashboard Explore Programmes View (Stays inside the logged-in Sidebar!)
  const exploreProgrammesSection = (
    <section id="explore-programmes" aria-label="Explore Programmes inside Dashboard">
      {paymentCancelled ? (
        <div
          role="status"
          style={{
            marginBottom: 18,
            padding: '14px 18px',
            borderRadius: 14,
            background: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            fontSize: 13.5,
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span>Your PayU payment was cancelled or not completed — no amount was deducted. Select any course below when you are ready.</span>
        </div>
      ) : null}

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
          {/* Course Detail Banner inside Dashboard */}
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
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
                <strong style={{ fontSize: 28, color: '#ffffff' }}>From ₹{selectedExploreDetail.price.toLocaleString('en-IN')}</strong>
                <span style={{ fontSize: 14, color: '#94a3b8', textDecoration: 'line-through' }}>
                  ₹{(selectedExploreDetail.price * 2).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#dcfce7', color: '#166534' }}>
                  Self-Paced · Premium · Pro Plans
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
                  Select Plan &amp; Enroll →
                </button>
              </div>
            </div>
            <div>
              <img
                src={selectedExploreDetail.image}
                alt={selectedExploreDetail.title}
                style={{ width: '100%', maxHeight: 230, objectFit: 'cover', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)' }}
              />
            </div>
          </div>

          {/* 4-Pillar Info Bar */}
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
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Top Header & Search + Category Pills */}
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
                      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                        {item.subtitle}
                      </p>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 10 }}>
                        <span>{item.duration}</span>
                        <span>{item.modulesCount} Modules ({item.lessonsCount} Lessons)</span>
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
                      <strong style={{ fontSize: 17, color: '#0f172a', display: 'block' }}>
                        From ₹{item.price.toLocaleString('en-IN')}
                      </strong>
                      <span style={{ fontSize: 11, color: '#5142b5', fontWeight: 700 }}>
                        Self-Paced · Premium · Pro
                      </span>
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
          <span className="sh-note">{allMyCourses.length} {allMyCourses.length === 1 ? 'enrolled course' : 'enrolled courses'}</span>
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
      ) : enrollments.status === 'error' && allMyCourses.length === 0 ? (
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
          {studentTab === 'profile' ? (
            <LearnerProfileSettingsSection />
          ) : studentTab === 'explore' ? (
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
              {allMyCourses.length > 0 ? <div className="sh-stack" style={{ marginTop: 20 }}>{myLearning}<CareerRiseCard />{evidence}</div> : null}
              {user.role === 'student' ? <section className="sh-card" id="elixir-wallet" aria-label="Elixir wallet" style={{ marginTop: 22 }}><ElixirWalletPanel /></section> : null}
            </>
          )}
        </div>
        {checkoutTarget ? (
          <SelectYourPlanPortalModal
            course={checkoutTarget}
            onClose={() => setCheckoutTarget(null)}
            onSelectPlan={(tier, price) => handleSelectPlanAndCheckout(checkoutTarget, tier, price)}
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
        <h2 id="sh-project">Current project &amp; browser lab</h2>
        {currentProject ? (
          <span className={currentProject.status === 'ready_to_review' ? 'os-status is-done' : currentProject.status === 'not_started' ? 'os-status is-idle' : 'os-status'}>
            {projectStatusLabel(currentProject.status)}
          </span>
        ) : null}
      </header>
      {projects.status === 'loading' && !profile?.project ? (
        <div className="sh-row"><span className="os-skeleton" style={{ width: '55%' }} /></div>
      ) : projects.status === 'error' && !profile?.project ? (
        <ListError what="Your projects" onRetry={retryLists} />
      ) : currentProject ? (
        <div className="sh-row">
          <div className="sh-row-main">
            <strong>{currentProject.title}</strong>
            <span className="sh-note">
              {currentProject.progress.complete} of {currentProject.progress.total} tasks complete · updated {formatDate(currentProject.updatedAt)}
            </span>
            <div className="os-progress-bar sh-row-bar" role="progressbar" aria-label={`${currentProject.title} tasks`} aria-valuemin={0} aria-valuemax={currentProject.progress.total} aria-valuenow={currentProject.progress.complete}>
              <span style={{ width: `${currentProject.progress.total ? (currentProject.progress.complete / currentProject.progress.total) * 100 : 0}%` }} />
            </div>
          </div>
          <Link className="os-link sh-row-link" to={learnerProjectPath(currentProject.courseSlug, currentProject.projectType)} aria-label={`Open ${currentProject.title}`}>
            Open project <ArrowRight />
          </Link>
        </div>
      ) : profile?.project ? (
        <div className="sh-row">
          <div className="sh-row-main">
            <strong>{profile.project.title || 'Capstone Project Studio'}</strong>
            <span className="sh-note">{profile.project.note}</span>
          </div>
          <Link className="os-link sh-row-link" to={profile.project.href}>
            {profile.project.label} <ArrowRight />
          </Link>
        </div>
      ) : (
        <p className="sh-empty">This course has no separate project workspace. Assignments stay in the lesson path.</p>
      )}
      {(() => {
        const environment = practiceEnvironmentForCourse(course.slug)
        const sqlLabHref = dashboardSqlLabHref(course.slug, resume.lessonId)
        if (environment?.status === 'runs') {
          if (!sqlLabHref) return <span id="student-practice" />
          return (
            <div className="sh-row" id="student-practice">
              <div className="sh-row-main">
                <strong>Northwind SQL Lab</strong>
                <span className="sh-note">{environment.honesty}</span>
              </div>
              <Link className="os-link sh-row-link" to={sqlLabHref}>
                Open SQL Lab <ArrowRight />
              </Link>
            </div>
          )
        }
        if (environment?.status === 'written') {
          return (
            <div className="sh-row" id="student-practice">
              <div className="sh-row-main">
                <strong>Harbor Desk PRD Studio</strong>
                <span className="sh-note">{environment.honesty}</span>
              </div>
              <Link className="os-link sh-row-link" to={environment.href}>
                Open Studio <ArrowRight />
              </Link>
            </div>
          )
        }
        return <span id="student-practice" />
      })()}
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
        {/* Top Streak & Profile Readiness Strip */}
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
                {streak.currentStreakDays} {streak.currentStreakDays === 1 ? 'Day' : 'Days'} Streak
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
                to="/dashboard/student#profile-settings"
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

        {/* Resume Learning Card */}
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
                    {course.title} · Module {resume.moduleIndex} of {Math.max(resume.moduleTotal, 5)}
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

        {/* Today's Progress + Monthly Progress Calendar Grid */}
        {studentTab === 'overview' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: 18,
              marginBottom: 20,
            }}
          >
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

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                  marginBottom: 14,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Active Streak</span>
                  <strong style={{ fontSize: 16, color: '#0f172a' }}>{streak.currentStreakDays}d</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Completed</span>
                  <strong style={{ fontSize: 16, color: '#5142b5' }}>{completedCount}/{totalLessons}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Certificates</span>
                  <strong style={{ fontSize: 16, color: '#059669' }}>{certificateRows.length}</strong>
                </div>
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

        {/* Pillar 1: 30-Second Target Career Role & Learning Path Personalizer (Unacademy / Scaler Benchmark) */}
        {studentTab === 'overview' ? (
          <section
            className="sh-card"
            aria-label="Personalize Your Target Career Role"
            style={{
              marginBottom: 16,
              padding: "16px 20px",
              borderTop: "1px solid #e2e8f0",
              background: "linear-gradient(90deg, #f5f3ff 0%, #ffffff 65%)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div style={{ minWidth: 220, flex: "1 1 280px" }}>
              <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", fontWeight: 600, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                PERSONALIZED CAREER GOAL · SKYLENT CAREER OS
              </span>
              <h2 style={{ margin: "3px 0 4px", fontSize: 16.5, color: "#0f172a" }}>
                Target Role: <span style={{ color: "#5142b5" }}>{targetCareerRole}</span>
              </h2>
              <p style={{ margin: 0, fontSize: 12.5, color: "#475569" }}>
                {goalSavedToast || "Select your target career track to tailor your recommended browser labs, guided study prompts, and mock interview milestones."}
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              {[
                { label: "Data Analyst", role: "Data Analyst & SQL Specialist", slug: "data-analytics" },
                { label: "Product Manager", role: "Product Manager (PRD & Growth)", slug: "product-management" },
                { label: "Python Engineer", role: "Python & Data Pipeline Engineer", slug: "python-programming" },
                { label: "Data Scientist", role: "Data Scientist & ML Engineer", slug: "data-science-ai" },
                { label: "GenAI Engineer", role: "Generative AI & RAG Architect", slug: "generative-ai" },
                { label: "Full-Stack Dev", role: "Full-Stack TypeScript Engineer", slug: "full-stack-web" },
              ].map((item) => {
                const isSelected = targetCareerRole === item.role
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setTargetCareerRole(item.role)
                      try { window.localStorage.setItem("skylent:learner-target-role", item.role) } catch {}
                      setGoalSavedToast(`✓ Goal updated to ${item.role}! Recommended track: ${item.label}.`)
                    }}
                    style={{
                      padding: "6px 11px",
                      borderRadius: 999,
                      border: isSelected ? "1.5px solid #5142b5" : "1px solid #cbd5e1",
                      background: isSelected ? "#5142b5" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#334155",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {item.label}
                  </button>
                )
              })}
              <Link
                to="/labs"
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "#ecfdf5",
                  border: "1px solid #6ee7b7",
                  color: "#047857",
                  fontSize: 11.5,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Try Free Lab →
              </Link>
            </div>
          </section>
        ) : null}

        {/* Clean Static Home Overview Grid (No duplicate Courses/Projects clutter!) */}
        {studentTab === 'overview' ? (
          <div className="sh-grid">
            <div className="sh-stack">
              <section className="sh-card sh-ai sh-royal-ai" aria-labelledby="sh-ai">
                <header className="sh-ai-head">
                  <AiMark />
                  <span className="sh-ai-live-pill">✓ Live in Lesson</span>
                </header>
                <div className="sh-royal-ai__body">
                  <h2 id="sh-ai" className="sh-royal-ai__title">Faculty Doubt &amp; Study Support</h2>
                  <p className="sh-royal-ai__desc">
                    Stuck on a SQL query, Python script, or case assignment? Open your active lesson to review guided hints or request a 20-minute Faculty TA review.
                  </p>
                  <div className="sh-royal-ai__pills">
                    <span>Simple Hinglish Mode</span>
                    <span>SQL &amp; Code Debugger</span>
                    <span>20-Min Human TA SLA</span>
                  </div>
                  <Link className="sh-royal-ai__cta" to={resumeHref}>
                    Open Lesson {resumeNumber || 1} Workspace <ArrowRight />
                  </Link>
                </div>
              </section>
            </div>

            <div className="sh-stack">
              {upcomingEventsWidget}
            </div>
          </div>
        ) : null}

        {/* Dedicated My Courses View (Static App Tab — Only Enrolled Courses & Certificates) */}
        {studentTab === 'courses' ? (
          <div className="sh-grid">
            <div className="sh-stack">
              {myLearning}
            </div>
            <div className="sh-stack">
              {evidence}
            </div>
          </div>
        ) : null}

        {/* Explore Programmes View */}
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

        {studentTab === 'wallet' && user.role === 'student' ? (
          <section className="sh-card" id="elixir-wallet" aria-label="Elixir wallet" style={{ marginTop: 12 }}>
            <ElixirWalletPanel />
          </section>
        ) : null}

        {studentTab === 'profile' ? <LearnerProfileSettingsSection /> : null}
      </div>

      {checkoutTarget ? (
        <SelectYourPlanPortalModal
          course={checkoutTarget}
          onClose={() => setCheckoutTarget(null)}
          onSelectPlan={(tier, price) => handleSelectPlanAndCheckout(checkoutTarget, tier, price)}
        />
      ) : null}
    </AuthDashboardShell>
  )
}
