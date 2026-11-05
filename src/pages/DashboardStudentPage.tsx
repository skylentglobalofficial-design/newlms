import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { AuthDashboardShell } from '../components/AuthDashboardShell'
import { LEARNER_NAV, LearnerNavIcon, learnerNavId } from '../components/learner/learner-nav'
import { useAuth } from '../context/AuthContext'
import { isCapstoneLesson, learnerErrorMessage, lessonTypeLabel } from '../components/lms/lms-utils'
import { useLmsDashboard } from '../hooks/useLms'
import {
  canOpenEnrollment,
  enrollInCourse,
  fetchLmsEnrollments,
  type ApiEnrollmentSummary,
} from '../lib/lms-api'
import { myCourseRows } from '../lib/my-courses'
import CareerRiseCard from '../components/learner/CareerRiseCard'
import { findProjectForCourse, listLearnerProjects, learnerProjectPath, projectStatusLabel, type ProjectSummary } from '../lib/projects-api'
import { fetchMyCertificates, issueCertificate, issueProgrammeCertificate, type SkylentCertificate } from '../lib/skylent-api'
import { fetchSkylentAiStatus } from '../lib/skylent-ai-api'
import ElixirWalletPanel from '../components/learner/ElixirWallet'
import StudentProfileAndSettingsPanel from '../components/learner/StudentProfileAndSettingsPanel'
import { computeLearnerExecutionStreak } from '../lib/execution-streak'
import { truthOf } from '../lib/truth'
import { courseProductProfile } from '../lib/course-product'
import { dashboardSqlLabHref, practiceEnvironmentForCourse } from '../lib/practice-environments'
import { isAuthoredCourse } from '../lib/authored-courses'
import { AiMark, AI_NAME, ArrowRight, ProductSlice, TruthChip } from '../components/skylent/primitives'
import './LearnWorkspace.css'
import './StudentHome.css'

/** Mirrors the server's certificate name rule (server/src/routes/skylent/certificates.ts): a full name, not an email. */
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

const SLICE = ['Learn', 'Practice', 'Build', 'Prove'] as const

type Loaded<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error' }
type AiAvailability = 'checking' | 'available' | 'unavailable' | 'unknown'
type StudentTabId = 'overview' | 'courses' | 'projects' | 'programmes' | 'certificates' | 'wallet' | 'profile'

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

function enrolmentStatusLabel(status: string) {
  if (status === 'completed') return 'Completed'
  if (status === 'active') return 'Active'
  return status.replace(/_/g, ' ')
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


type DashboardTrackItem = {
  courseSlug: string
  programSlug: string
  title: string
  programTitle: string
  category: "data" | "ai-eng" | "product"
  lessonsCount: number
  durationLabel: string
  labName: string
  summary: string
}

const DASHBOARD_CAREER_TRACKS: DashboardTrackItem[] = [
  {
    courseSlug: "data-analytics",
    programSlug: "data-analytics-pro",
    title: "Data Analytics & SQL",
    programTitle: "Data Analytics Pro Programme",
    category: "data",
    lessonsCount: 15,
    durationLabel: "900 min",
    labName: "Northwind SQL Browser Lab",
    summary: "Master SQL joins, revenue reconciliation, cohort retention, and executive KPI reporting.",
  },
  {
    courseSlug: "python-programming",
    programSlug: "data-science-ai",
    title: "Python Programming & Automation",
    programTitle: "Data Science & AI Programme",
    category: "data",
    lessonsCount: 15,
    durationLabel: "960 min",
    labName: "Python Pipeline Audit Sandbox",
    summary: "Build clean data pipelines, automated ETL validators, and anomaly quarantine scripts.",
  },
  {
    courseSlug: "data-science-ai",
    programSlug: "data-science-ai",
    title: "Data Science & Machine Learning",
    programTitle: "Data Science & AI Programme",
    category: "data",
    lessonsCount: 15,
    durationLabel: "1080 min",
    labName: "Churn Cohort ML Sandbox",
    summary: "Design feature pipelines, out-of-time validation splits, and precision-recall thresholds.",
  },
  {
    courseSlug: "generative-ai",
    programSlug: "generative-ai-program",
    title: "Generative AI & LLM Systems",
    programTitle: "Generative AI Engineering Programme",
    category: "ai-eng",
    lessonsCount: 15,
    durationLabel: "1020 min",
    labName: "Enterprise RAG Evaluation Lab",
    summary: "Ship grounded RAG pipelines, metadata citation filters, and hallucination guardrails.",
  },
  {
    courseSlug: "full-stack-web",
    programSlug: "full-stack",
    title: "Full-Stack Web Engineering",
    programTitle: "Full-Stack Web Programme",
    category: "ai-eng",
    lessonsCount: 15,
    durationLabel: "1140 min",
    labName: "Idempotent Ledger Architecture Lab",
    summary: "Architect resilient REST APIs, transactional state machines, and production React UIs.",
  },
  {
    courseSlug: "product-management",
    programSlug: "product-management",
    title: "Product Management & PRD Studio",
    programTitle: "Product Management Programme",
    category: "product",
    lessonsCount: 15,
    durationLabel: "900 min",
    labName: "Harbor Desk PRD Studio",
    summary: "Write rigorous PRDs, onboarding funnel teardowns, and prioritization trade-off memos.",
  },
]

function InDashboardProgrammesCatalog({
  enrollments,
  activeCourseSlug,
  activeCourseTitle,
  progressPct = 0,
  resumeHref = "/dashboard/student",
  onEnrolled,
}: {
  enrollments: ApiEnrollmentSummary[]
  activeCourseSlug?: string | null
  activeCourseTitle?: string | null
  progressPct?: number
  resumeHref?: string
  onEnrolled?: () => void
}) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<"all" | "data" | "ai-eng" | "product">("all")
  const [enrollingSlug, setEnrollingSlug] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const enrolledCourseSlugs = new Set<string>()
  for (const item of enrollments) {
    if (item.courseSlug) enrolledCourseSlugs.add(item.courseSlug)
    for (const linked of item.linkedCourses ?? []) {
      enrolledCourseSlugs.add(linked.slug)
    }
    for (const c of item.courses ?? []) {
      enrolledCourseSlugs.add(c.slug)
    }
  }
  if (activeCourseSlug) enrolledCourseSlugs.add(activeCourseSlug)

  const visibleTracks = DASHBOARD_CAREER_TRACKS.filter(
    (t) => filter === "all" || t.category === filter,
  )

  async function handleStartOrOpenTrack(track: DashboardTrackItem) {
    setError(null)
    if (enrolledCourseSlugs.has(track.courseSlug)) {
      navigate(`/learn/${track.courseSlug}`)
      return
    }
    setEnrollingSlug(track.courseSlug)
    try {
      await enrollInCourse(track.courseSlug, true)
      onEnrolled?.()
      navigate(`/learn/${track.courseSlug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enrol in this track right now.")
    } finally {
      setEnrollingSlug(null)
    }
  }

  return (
    <section
      id="explore-programmes"
      aria-label="In-Dashboard Programmes and Career Tracks"
      style={{ display: "grid", gap: 20, marginTop: 18 }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          padding: "14px 20px",
          borderRadius: 14,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 6px 20px -12px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#64748b",
              paddingRight: 10,
              borderRight: "1px solid #cbd5e1",
            }}
          >
            My Course
          </span>
          <select
            aria-label="Switch active course track inside dashboard"
            value={activeCourseSlug || ""}
            onChange={(e) => {
              const target = DASHBOARD_CAREER_TRACKS.find((t) => t.courseSlug === e.target.value)
              if (target) void handleStartOrOpenTrack(target)
            }}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 14,
              fontWeight: 800,
              color: "#0f172a",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {!activeCourseSlug ? (
              <option value="">Select a Career Track to Start…</option>
            ) : null}
            {DASHBOARD_CAREER_TRACKS.map((t) => (
              <option key={t.courseSlug} value={t.courseSlug}>
                {t.title} ({enrolledCourseSlugs.has(t.courseSlug) ? "Enrolled" : "Start Free Pilot"})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: "#475569", fontWeight: 600 }}>
            {activeCourseTitle
              ? `Complete ${Math.max(0, 60 - progressPct)}% more to unlock Career OS Exclusive`
              : "Pick any track below to unlock your interactive browser lab immediately"}
          </span>
          {activeCourseSlug ? (
            <Link
              to={resumeHref}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1.5px solid #5142b5",
                background: "#ffffff",
                color: "#5142b5",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Continue Learning
            </Link>
          ) : null}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          padding: "22px 26px",
          borderRadius: 16,
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 52%, #fffbeb 100%)",
          border: "1px solid #fde68a",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, maxWidth: 560 }}>
          <div
            aria-hidden="true"
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#ffffff",
              border: "1px solid #fcd34d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🔒
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
              <span style={{ color: "#dc2626" }}>Unlock</span> Career OS Exclusive
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
              To unlock placement resources, recruiter referrals, and AI Mock Defense, complete 60% of your active track modules inside this dashboard.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <Link
                to={activeCourseSlug ? resumeHref : "/dashboard/student#explore-programmes"}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  background: "#ffffff",
                  border: "1.5px solid #dc2626",
                  color: "#dc2626",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Continue Learning
              </Link>
              <Link
                to="/career-os"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#dc2626",
                  textDecoration: "underline",
                }}
              >
                Career OS Batch &amp; Portfolio Details
              </Link>
            </div>
          </div>
        </div>

        <div
          style={{
            minWidth: 250,
            padding: "14px 18px",
            borderRadius: 12,
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid #fde68a",
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>
            Learn Track Completion
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
            <span>My Progress</span>
            <span>{progressPct}%</span>
          </div>
          <div
            style={{
              marginTop: 8,
              height: 6,
              borderRadius: 999,
              background: "#fef3c7",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.max(progressPct, 4)}%`,
                height: "100%",
                background: "#d97706",
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "22px 24px",
          borderRadius: 16,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 28px -16px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              Career Tracks &amp; Programmes (In-Dashboard Access)
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
              Browse and start any Skylent programme directly inside your dashboard without leaving your learning workspace.
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Career Track Categories"
          style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}
        >
          {[
            { id: "all" as const, label: "All Career Tracks (6)" },
            { id: "data" as const, label: "Data & Analytics Engineering" },
            { id: "ai-eng" as const, label: "AI & Full-Stack Engineering" },
            { id: "product" as const, label: "Product Management & Strategy" },
          ].map((tab) => {
            const active = filter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: active ? "1.5px solid #dc2626" : "1px solid #e2e8f0",
                  background: active ? "#fff1f2" : "#f8fafc",
                  color: active ? "#dc2626" : "#475569",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {error ? (
          <div
            role="alert"
            style={{
              padding: "10px 14px",
              marginBottom: 16,
              borderRadius: 10,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          {visibleTracks.map((track) => {
            const isEnrolled = enrolledCourseSlugs.has(track.courseSlug)
            const isCurrent = activeCourseSlug === track.courseSlug
            const busy = enrollingSlug === track.courseSlug
            return (
              <div
                key={track.courseSlug}
                style={{
                  borderRadius: 14,
                  border: isCurrent ? "2px solid #5142b5" : "1px solid #e2e8f0",
                  background: "#ffffff",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 6px 18px -10px rgba(15, 23, 42, 0.08)",
                }}
              >
                <div>
                  <div
                    style={{
                      padding: "8px 14px",
                      textAlign: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      background: isEnrolled ? "#ecfdf5" : "#fff1f2",
                      color: isEnrolled ? "#047857" : "#e11d48",
                      borderBottom: isEnrolled ? "1px solid #a7f3d0" : "1px solid #ffe4e6",
                    }}
                  >
                    {isCurrent
                      ? `Active Course · ${progressPct}% Complete`
                      : isEnrolled
                        ? "Enrolled · Ready to Continue"
                        : "Not Started · Free Pilot"}
                  </div>

                  <div style={{ padding: "18px 18px 14px" }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#5142b5",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 4,
                      }}
                    >
                      {track.programTitle}
                    </div>
                    <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                      {track.title}
                    </h3>
                    <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
                      {track.summary}
                    </p>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "3px 9px",
                        borderRadius: 6,
                        background: "#f5f3ff",
                        border: "1px solid #ddd6fe",
                        color: "#4338ca",
                        fontSize: 11,
                        fontWeight: 700,
                        marginBottom: 10,
                      }}
                    >
                      🧪 {track.labName}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "0 18px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 12,
                      color: "#64748b",
                      marginBottom: 12,
                      paddingTop: 10,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <span>📄 {track.lessonsCount} lessons</span>
                    <span>|</span>
                    <span>⏱ {track.durationLabel}</span>
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleStartOrOpenTrack(track)}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      color: isEnrolled ? "#5142b5" : "#e11d48",
                      fontSize: 13.5,
                      fontWeight: 800,
                      cursor: busy ? "wait" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {busy
                      ? "Opening Workspace…"
                      : isEnrolled
                        ? "Continue Track ›"
                        : "View & Start Track ›"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function DashboardStudentPage() {
  const { user, ready } = useAuth()
  const { workspace, course, loading, error, reload } = useLmsDashboard()
  const navigate = useNavigate()
  const { pathname, hash } = useLocation()
  const activeNav = learnerNavId(pathname, hash)
  const previousHash = useRef(hash)
  const [studentTab, setStudentTab] = useState<StudentTabId>(() => {
    if (hash === '#profile-settings') return 'profile'
    if (hash === '#explore-programmes') return 'programmes'
    return 'overview'
  })
  const [enrollments, setEnrollments] = useState<Loaded<ApiEnrollmentSummary[]>>({ status: 'loading' })
  const [projects, setProjects] = useState<Loaded<ProjectSummary[]>>({ status: 'loading' })
  const [certificates, setCertificates] = useState<Loaded<SkylentCertificate[]>>({ status: 'loading' })
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<{ slug: string; message: string } | null>(null)
  const [_aiStatus, setAiStatus] = useState<AiAvailability>('available')
  const [listsKey, setListsKey] = useState(0)

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  useEffect(() => {
    if (hash === '#profile-settings') {
      setStudentTab('profile')
    } else if (hash === '#explore-programmes') {
      setStudentTab('programmes')
    } else if (hash === '#sh-my-learning') {
      setStudentTab('courses')
    } else if (hash === '#student-projects') {
      setStudentTab('projects')
    }
    const sectionId =
      hash === '#sh-my-learning' ||
      hash === '#student-projects' ||
      hash === '#profile-settings' ||
      hash === '#explore-programmes'
        ? hash.slice(1)
        : ''
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (sectionId) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    } else if (
      previousHash.current === '#sh-my-learning' ||
      previousHash.current === '#student-projects' ||
      previousHash.current === '#profile-settings' ||
      previousHash.current === '#explore-programmes'
    ) {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    }
    previousHash.current = hash
  }, [hash, workspace, enrollments.status, projects.status])

  const loadLists = useCallback((signal: AbortSignal) => {
    const settle = <T,>(promise: Promise<T>, set: (value: Loaded<T>) => void) => {
      void promise
        .then((data) => { if (!signal.aborted) set({ status: 'ready', data }) })
        .catch(() => { if (!signal.aborted) set({ status: 'error' }) })
    }
    settle(fetchLmsEnrollments(), setEnrollments)
    settle(listLearnerProjects(signal), setProjects)
    settle(fetchMyCertificates(signal), setCertificates)
  }, [])

  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    loadLists(controller.signal)
    return () => controller.abort()
  }, [user, workspace, loadLists, listsKey])

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

  const shell = {
    themeId: 'student' as const,
    workspace: 'learning' as const,
    workspaceLabel: 'Learning',
    roleLabel: 'Learner',
    navItems: LEARNER_NAV,
    bottomNavItems: LEARNER_NAV,
    activeNav,
    onNavChange: () => {},
    renderNavIcon: (id: string) => <LearnerNavIcon id={id} />,
  }

  const passwordRotationBanner = user?.passwordRotation?.rotationDue ? (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '14px 18px',
        marginBottom: 18,
        borderRadius: 14,
        background: '#fffbeb',
        border: '1px solid #fde68a',
        color: '#92400e',
      }}
    >
      <div>
        <strong style={{ display: 'block', fontSize: 14 }}>
          🔐 3-Month (90-Day) Password Security Update Due
        </strong>
        <span style={{ fontSize: 12.5 }}>
          For account security, Skylent requires learners to rotate their password every 90 days. Please update your password in Profile &amp; Settings.
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          setStudentTab('profile')
          navigate('/dashboard/student#profile-settings')
        }}
        style={{
          padding: '8px 14px',
          borderRadius: 10,
          border: 'none',
          background: '#d97706',
          color: '#ffffff',
          fontSize: 12.5,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Update Password Now →
      </button>
    </div>
  ) : null

  if (!ready || (loading && !workspace)) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="sh"><Skeleton /></div>
      </AuthDashboardShell>
    )
  }

  if (error && !workspace) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="sh">
          <div className="os-alert" role="alert">
            <div>
              <strong>Your learning workspace did not load</strong>
              <p>{learnerErrorMessage(error, 'Check your connection and try again.')}</p>
            </div>
            <button type="button" className="os-btn os-btn-primary" onClick={() => void reload()}>Try again</button>
          </div>
        </div>
      </AuthDashboardShell>
    )
  }

  const enrolmentRows = enrollments.status === 'ready' ? enrollments.data : []
  const certificateRows = certificates.status === 'ready' ? certificates.data : []
  const issuedSlugs = new Set(certificateRows.map((item) => item.courseSlug))
  const myCourses = myCourseRows(enrolmentRows, workspace)
  const claimable = enrollments.status === 'ready' && certificates.status === 'ready'
    ? enrolmentRows.flatMap((item) =>
        (item.courses ?? [])
          .filter((linked) => linked.progress.allComplete && !issuedSlugs.has(linked.slug))
          .map((linked) => ({
            key: `${item.id}:${linked.slug}`,
            courseSlug: linked.slug,
            courseTitle: linked.title,
          })),
      )
    : []

  const claimableProgrammes = enrollments.status === 'ready' && certificates.status === 'ready'
    ? enrolmentRows
        .filter((item) => {
          const courses = item.courses ?? []
          const masterSlug = `programme-${item.programSlug}`
          return courses.length >= 2 && courses.every((c) => c.progress.allComplete) && !issuedSlugs.has(masterSlug)
        })
        .map((item) => ({
          key: `master:${item.id}:${item.programSlug}`,
          programSlug: item.programSlug,
          programName: item.programName,
        }))
    : []

  const myLearning = (
    <section
      className={hash === '#sh-my-learning' ? 'sh-card sh-card--focused' : 'sh-card'}
      id="sh-my-learning"
      aria-labelledby="sh-my-learning-heading"
    >
      <header className="sh-card-head">
        <h2 id="sh-my-learning-heading">My Courses</h2>
        {/* to="/programmes" */}<Link className="os-link" to="/dashboard/student#explore-programmes">Explore programmes <ArrowRight /></Link>
      </header>
      {enrollments.status === 'loading' ? (
        <div className="sh-rows" aria-label="Loading your courses">
          <div className="sh-row"><span className="os-skeleton" style={{ width: '62%' }} /></div>
          <div className="sh-row"><span className="os-skeleton" style={{ width: '48%' }} /></div>
        </div>
      ) : enrollments.status === 'error' ? (
        <ListError what="Your courses" onRetry={retryLists} />
      ) : myCourses.length > 0 ? (
        <ul className="sh-rows">
          {myCourses.map((row) => {
            const truth = truthOf('course', row.courseSlug)
            const authored = isAuthoredCourse(row.courseSlug)
            const actionHref = row.continueHref
            const actionLabel = row.progress
              ? row.progress.allComplete
                ? 'Review course'
                : row.progress.completedCount > 0 || row.currentLessonStarted
                  ? 'Continue'
                  : 'Start course'
              : 'Open course'
            return (
              <li key={row.key} className="sh-row sh-course-row">
                <div className="sh-row-main">
                  <div className="sh-row-title">
                    <strong>{row.courseTitle}</strong>
                    <span className={row.status === 'completed' ? 'os-status is-done' : 'os-status'}>
                      {enrolmentStatusLabel(row.status)}
                    </span>
                    {truth && !authored ? <TruthChip truth={truth} /> : null}
                  </div>
                  <span className="sh-note">
                    {row.programName && row.programName !== row.courseTitle ? `${row.programName} · ` : ''}
                    {row.progress
                      ? `${row.progress.completedCount} of ${row.progress.totalLessons} lessons (${row.progress.progressPct}%)`
                      : row.Schedule}
                    {row.currentLessonTitle && !row.progress?.allComplete ? ` · Current: ${row.currentLessonTitle}` : ''}
                  </span>
                  {row.progress ? (
                    <div className="os-progress-bar sh-row-bar" role="progressbar" aria-label={`${row.courseTitle} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={row.progress.progressPct}>
                      <span style={{ width: `${row.progress.progressPct}%` }} />
                    </div>
                  ) : null}
                  {authored ? <ProductSlice active={SLICE} /> : null}
                </div>
                {canOpenEnrollment(row.enrolment) ? (
                  <Link className="os-link sh-row-link" to={actionHref}>
                    {actionLabel} <ArrowRight />
                  </Link>
                ) : (
                  <Link className="os-link sh-row-link" to={`/programmes/${row.programSlug}`}>
                    Programme <ArrowRight />
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="sh-empty">
          You have not started a course yet. {/* to="/programmes" */}<Link className="os-link" to="/dashboard/student#explore-programmes">Explore programmes <ArrowRight /></Link>
        </p>
      )}
    </section>
  )

  const evidence = (
    <section className="sh-card sh-evidence" id="student-evidence" aria-labelledby="sh-certs">
      <header className="sh-card-head">
        <h2 id="sh-certs">Certificates &amp; Verified Proof</h2>
        <Link className="os-link" to="/verify">Public verification <ArrowRight /></Link>
      </header>
      {certificates.status === 'loading' ? (
        <div className="sh-row"><span className="os-skeleton" style={{ width: '58%' }} /></div>
      ) : certificates.status === 'error' ? (
        <ListError what="Your certificates" onRetry={retryLists} />
      ) : (
        <>
          {certificateRows.length > 0 ? (
            <ul className="sh-rows">
              {certificateRows.map((cert) => (
                <li key={cert.code} className="sh-row">
                  <div className="sh-row-main">
                    <strong>{cert.courseTitle}{cert.code.includes('-PGM') ? " · Programme Master Certificate" : ""}</strong>
                    <span className="sh-note">
                      <code className="sh-code">{cert.code}</code> ·{' '}
                      {cert.status === 'revoked' ? 'Revoked' : `Issued ${formatDate(cert.issuedAt)}`}
                    </span>
                  </div>
                  {cert.status === 'revoked' ? (
                    <span className="os-status is-idle">Revoked</span>
                  ) : (
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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

  const career = (
    <section className="sh-card" aria-labelledby="sh-career">
      <header className="sh-card-head">
        <h2 id="sh-career">Career connection</h2>
      </header>
      <p className="sh-body">Career OS brings your verified projects, certificates, and role skill-gap matching into one recruiter-ready profile.</p>
      <p className="sh-foot"><Link className="os-link" to="/career-os">Open Career OS <ArrowRight /></Link></p>
    </section>
  )

  if (!course || !workspace) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="sh" id="student-learning">
          {passwordRotationBanner}

          {/* Workspace View Switcher even when 0 courses are enrolled */}
          <div
            role="tablist"
            aria-label="Learner Workspace Views"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              padding: '10px 12px',
              marginBottom: 16,
              borderRadius: 14,
              background: '#f6f4ff',
              border: '1px solid #ddd6fe',
            }}
          >
            {[
              { id: 'overview' as const, label: '1. Learning Dashboard & All Programmes' },
              { id: 'programmes' as const, label: '2. Explore Programmes & Career Tracks' },
              { id: 'wallet' as const, label: '3. Elixir Wallet & Case Store' },
              { id: 'profile' as const, label: '4. ⚙️ My Profile, Mobile & Password Settings' },
            ].map((t) => {
              const active = studentTab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setStudentTab(t.id)
                    if (t.id === 'profile') navigate('/dashboard/student#profile-settings')
                    else if (t.id === 'programmes') navigate('/dashboard/student#explore-programmes')
                    else navigate('/dashboard/student')
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: active ? '1px solid #5142b5' : '1px solid #cbd5e1',
                    background: active ? '#5142b5' : '#ffffff',
                    color: active ? '#ffffff' : '#334155',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>

          {studentTab === 'profile' ? (
            <StudentProfileAndSettingsPanel />
          ) : studentTab === 'wallet' ? (
            <section className="sh-card" aria-label="Elixir wallet" style={{ marginTop: 12 }}><ElixirWalletPanel /></section>
          ) : (
            <>
              <InDashboardProgrammesCatalog
                enrollments={enrolmentRows}
                onEnrolled={() => {
                  void reload()
                  retryLists()
                }}
              />
              {enrolmentRows.length > 0 ? <div className="sh-stack" style={{ marginTop: 22 }}>{myLearning}<CareerRiseCard />{evidence}</div> : null}
              <section className="sh-card" aria-label="Elixir wallet" style={{ marginTop: 22 }}><ElixirWalletPanel /></section>
            </>
          )}
        </div>
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

  const primaryAttention = allLessons.flatMap((lesson) => {
    const state = workspace.lessonStates[lesson.id]
    if (!state || !state.started || state.complete || state.locked) return []
    if (lesson.type !== 'quiz' && lesson.type !== 'assignment') return []
    return [{
      id: lesson.id,
      title: lesson.title,
      href: `/learn/${course.slug}/${lesson.id}`,
      note: lesson.type === 'quiz'
        ? 'Check opened, not passed yet'
        : `${isCapstoneLesson(lesson) ? 'Capstone' : 'Assignment'} opened, not submitted yet`,
    }]
  })
  const covered = new Set(primaryAttention.map((item) => item.href))
  const otherAttention = enrolmentRows.flatMap((item) =>
    (item.courses ?? []).flatMap((linked) =>
      linked.openAssessments.flatMap((open) => {
        const href = `/learn/${linked.slug}/${open.lessonKey}`
        if (covered.has(href)) return []
        covered.add(href)
        return [{
          id: `${linked.slug}:${open.lessonKey}`,
          title: open.title,
          href,
          note: `${linked.title} · ${open.type === 'quiz' ? 'Check opened, not passed yet' : 'Assignment opened, not submitted yet'}`,
        }]
      }),
    ),
  )
  const attention = [...primaryAttention, ...otherAttention]

  const projectRows = projects.status === 'ready' ? projects.data : []
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
      {projects.status === 'loading' ? (
        <div className="sh-row"><span className="os-skeleton" style={{ width: '55%' }} /></div>
      ) : projects.status === 'error' ? (
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
        if (environment?.status === "runs") {
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
        if (environment?.status === "written") {
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

  return (
    <AuthDashboardShell {...shell}>
      <div className="sh">
        {passwordRotationBanner}

        {/* Multi-Tab Student Workspace Switcher Bar */}
        <div
          role="tablist"
          aria-label="Learner Workspace Views"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '10px 12px',
            marginBottom: 16,
            borderRadius: 14,
            background: '#f6f4ff',
            border: '1px solid #ddd6fe',
          }}
        >
          {[
            { id: 'overview' as const, label: '1. Full Workspace (Overview)' },
            { id: 'courses' as const, label: '2. My Active Courses' },
            { id: 'projects' as const, label: '3. Capstone & Browser Labs' },
            { id: 'programmes' as const, label: '4. Explore Programmes (In-Dashboard)' },
            { id: 'certificates' as const, label: '5. Certificates & Flight Recorder' },
            { id: 'wallet' as const, label: '6. Elixir Wallet & Case Store' },
            { id: 'profile' as const, label: '7. ⚙️ My Profile & Settings' },
          ].map((t) => {
            const active = studentTab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setStudentTab(t.id)
                  if (t.id === 'profile') navigate('/dashboard/student#profile-settings')
                  else if (t.id === 'programmes') navigate('/dashboard/student#explore-programmes')
                  else if (hash === '#profile-settings' || hash === '#explore-programmes') navigate('/dashboard/student')
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: active ? '1px solid #5142b5' : '1px solid #cbd5e1',
                  background: active ? '#5142b5' : '#ffffff',
                  color: active ? '#ffffff' : '#334155',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {studentTab === 'profile' ? (
          <StudentProfileAndSettingsPanel />
        ) : null}

        {studentTab === 'programmes' ? (
          <InDashboardProgrammesCatalog
            enrollments={enrolmentRows}
            activeCourseSlug={course.slug}
            activeCourseTitle={course.title}
            progressPct={progressPct}
            resumeHref={resumeHref}
            onEnrolled={() => {
              void reload()
              retryLists()
            }}
          />
        ) : null}

        {studentTab !== 'profile' && studentTab !== 'programmes' ? (
        <div className="sh-top-head">
          <div>
            <p className="os-eyebrow">My Learning Workspace</p>
            <h1>What to do next</h1>
          </div>
          <ul className="sh-facts">
            <li>
              {enrollments.status === 'ready' ? (
                <><strong>{enrolmentRows.length}</strong> {enrolmentRows.length === 1 ? 'active course' : 'active courses'}</>
              ) : enrollments.status === 'error' ? (
                'Enrolments could not be loaded'
              ) : (
                'Enrolments loading'
              )}
            </li>
            <li><strong>{completedCount}</strong> of {totalLessons} lessons complete ({progressPct}%)</li>
            <li>
              {certificates.status === 'ready' && (claimable.length > 0 || claimableProgrammes.length > 0)
                ? 'A certificate can be claimed below'
                : allComplete
                  ? 'Every lesson in this course is complete'
                  : '24/7 Hinglish AI Coach & 20-Min TA Help active'}
            </li>
          </ul>
        </div>
        ) : null}

        {/* 1. Primary Action Above the Fold: Royal Purple Continue Learning Hero Card */}
        {studentTab === 'overview' || studentTab === 'courses' ? (
          <section className="sh-next sh-royal-hero" id="student-learning" aria-labelledby="sh-continue">
            <div className="sh-royal-hero__top">
              <p className="sh-next-label">
                <span aria-hidden="true" />
                {allComplete ? 'COURSE COMPLETE' : 'CONTINUE LEARNING · ACTIVE LESSON'}
                {allComplete ? (
                  <em>{course.title}</em>
                ) : (
                  <em>
                    {course.title} · Module {resume.moduleIndex}
                    {resumeLesson ? ` · ${lessonTypeLabel(resumeLesson.type, resumeLesson.title)}` : ''}
                    {resumeLesson?.duration ? ` · ${resumeLesson.duration}` : ''}
                  </em>
                )}
              </p>
              <span className="sh-royal-hero__badge">
                ✓ {completedCount}/{totalLessons} Lessons ({progressPct}%)
              </span>
            </div>

            <h2 id="sh-continue">
              {allComplete
                ? `You have completed every lesson in ${course.title}`
                : `${resumeNumber ? `Lesson ${resumeNumber} · ` : ''}${resume.lessonTitle || course.title}`}
            </h2>
            <p className="sh-body">
              {allComplete
                ? certificates.status === 'ready' && (claimable.length > 0 || claimableProgrammes.length > 0)
                  ? 'Your certificate can be claimed below.'
                  : 'Every lesson in this course is complete.'
                : `Module ${resume.moduleIndex} of ${resume.moduleTotal} · ${resume.moduleTitle}${resume.nextLessonTitle ? ` · Up next: ${resume.nextLessonTitle}` : ''}`}
            </p>
            {workspace.program ? (
              <p className="sh-note sh-programme">
                Part of {workspace.program.name} · {workspace.program.progress.completedCourses} of {workspace.program.progress.totalCourses} courses complete
              </p>
            ) : null}

            <div className="sh-progress">
              <div className="os-progress-bar" role="progressbar" aria-label={`${course.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct}>
                <span style={{ width: `${Math.max(progressPct, 6)}%` }} />
              </div>
              <span className="sh-royal-hero__pct">{progressPct}% complete · Career Rise unlocks at 60%</span>
            </div>

            <div className="sh-royal-hero__footer">
              <div className="os-actions" style={{ marginTop: 0 }}>
                {allComplete ? (
                  <Link className="os-btn os-btn-primary os-btn-lg sh-royal-cta" to={`/learn/${course.slug}`}>Review the course <ArrowRight /></Link>
                ) : (
                  <Link className="os-btn os-btn-primary os-btn-lg sh-royal-cta" to={resumeHref}>
                    {resumeStarted || completedCount > 0 ? 'Continue learning' : 'Start learning'} <ArrowRight />
                  </Link>
                )}
                {profile?.project ? (
                  <Link className="os-btn os-btn-ghost sh-royal-secondary" to={profile.project.href}>
                    Open Capstone Studio
                  </Link>
                ) : null}
              </div>
              <div className="sh-royal-hero__pills">
                <span>🇮🇳 Hinglish AI Coach</span>
                <span>Browser Lab Included</span>
                <span>20-Min TA Help</span>
              </div>
            </div>
          </section>
        ) : null}

        {/* 2. Compact 14-Day Execution Streak Bar */}
        {studentTab === 'overview' ? (() => {
          const activityDates: string[] = [
            ...projectRows.map((p) => p.updatedAt),
            ...certificateRows.map((c) => c.issuedAt),
          ]
          if (completedCount > 0 || resumeStarted) {
            activityDates.push(new Date().toISOString())
          }
          const streak = computeLearnerExecutionStreak(activityDates)
          return (
            <section className="sh-card sh-streak-card" aria-label="Daily Execution Streak and 14-Day Proof-of-Work Activity Heatmap">
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div>
                  <strong style={{ fontSize: 15, display: "block", color: "#0f172a" }}>
                    🔥 {streak.currentStreakDays}-Day Learning Streak · 14-Day Proof-of-Work Activity Grid
                  </strong>
                  <span className="sh-note">
                    Weekly Goal: {streak.weeklyActionsCount} / {streak.weeklyGoalTarget} lessons &amp; lab actions ({streak.weeklyGoalPercent}%) · Best streak: {streak.longestStreakDays}d
                  </span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857" }}>
                  +{streak.streakBonusElixir} Elixir Streak Bonus
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(14, minmax(0, 1fr))", gap: 6 }} role="list" aria-label="Last 14 days activity heatmap">
                {streak.heatmapDays.map((day) => (
                  <div
                    key={day.date}
                    role="listitem"
                    title={`${day.label}: ${day.count} verified action(s)`}
                    style={{
                      height: 26,
                      borderRadius: 6,
                      background: day.active ? "linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)" : "#f1f5f9",
                      border: day.active ? "1px solid #c4b8ff" : "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: day.active ? "#ffffff" : "#64748B",
                    }}
                  >
                    {day.date.slice(8)}
                  </div>
                ))}
              </div>
            </section>
          )
        })() : null}

        {/* 3. Main 2-Column Workspace Grid (Placed Directly Above the Fold!) */}
        {studentTab === 'overview' ? (
          <div className="sh-grid">
            <div className="sh-stack">
              {attention.length > 0 ? (
                <section className="sh-card" aria-labelledby="sh-attention">
                  <header className="sh-card-head">
                    <h2 id="sh-attention">Needs attention</h2>
                    <span className="sh-note">{attention.length} open</span>
                  </header>
                  <ul className="sh-rows">
                    {attention.map((lesson) => (
                      <li key={lesson.id} className="sh-row">
                        <div className="sh-row-main">
                          <strong>{lesson.title}</strong>
                          <span className="sh-note">{lesson.note}</span>
                        </div>
                        <Link className="os-link sh-row-link" to={lesson.href} aria-label={`Open ${lesson.title}`}>
                          Open <ArrowRight />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {hash === '#student-projects' ? (
                <>
                  {projectsSection}
                  {myLearning}
                  <CareerRiseCard />
                </>
              ) : (
                <>
                  {myLearning}
                  {projectsSection}
                  <CareerRiseCard />
                </>
              )}
            </div>

            <div className="sh-stack">
              {/* Soft Lavender + Crisp White Skylent AI & 20-Min TA Mentor Card */}
              <section className="sh-card sh-ai sh-royal-ai" aria-labelledby="sh-ai">
                <header className="sh-ai-head">
                  <AiMark />
                  <span className="sh-ai-live-pill">✓ Live in Lesson</span>
                </header>
                <div className="sh-royal-ai__body">
                  <h2 id="sh-ai" className="sh-royal-ai__title">{AI_NAME} · Hinglish &amp; English Coach</h2>
                  <p className="sh-royal-ai__desc">
                    Need a simple Hinglish analogy, help debugging a SQL query, or a 20-minute human Faculty TA review? Open your active lesson to use {AI_NAME} side-by-side.
                  </p>
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

              {evidence}
              {career}
            </div>
          </div>
        ) : null}

        {studentTab === 'courses' ? (
          <div className="sh-stack">
            {myLearning}
            <CareerRiseCard />
          </div>
        ) : null}

        {studentTab === 'projects' ? (
          <div className="sh-stack">
            {projectsSection}
            <CareerRiseCard />
          </div>
        ) : null}

        {studentTab === 'certificates' ? (
          <div className="sh-stack">
            {evidence}
            {career}
          </div>
        ) : null}

        {/* 4. L1-L5 Institutional Competency & Work Assignment Exchange (Soft Lavender + Crisp White + 4px #5142B5 Card) */}
        {studentTab === 'overview' || studentTab === 'certificates' ? (
          <section
            aria-label="L1 to L5 Competency Progression and Work Assignment Exchange"
            style={{
              marginTop: 22,
              background: "linear-gradient(180deg, #f6f4ff 0%, #ffffff 100%)",
              border: "1px solid #ddd6fe",
              borderTop: "4px solid #5142b5",
              borderRadius: 16,
              padding: "20px 24px",
              color: "#0f172a",
              boxShadow: "0 12px 30px -14px rgba(81, 66, 181, 0.14)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
              <div>
                <span style={{ color: "#5142b5", font: "700 11px/1.4 var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                  ★ SKYLENT INSTITUTE OF APPLIED LEARNING · L1 → L5 PROGRESSION &amp; WORK ASSIGNMENT EXCHANGE
                </span>
                <strong style={{ fontSize: 18, color: "#0f172a", fontFamily: "var(--font-display)", display: "block" }}>
                  Current Stage: L2 Guided Practice → Unlocking Env B Partner Fieldwork Exchange
                </strong>
                <span style={{ fontSize: 13, color: "#475569", display: "block", marginTop: 4 }}>
                  Complete your Environment A Simulated Enterprise Sprint (Northwind / Harbor Desk) with a V1 → V2 Faculty Red-Line pass to unlock supervised real-world MSME &amp; startup assignments.
                </span>
              </div>
              <Link
                to="/verify"
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  color: "#166534",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                ✓ View Flight Recorder Standard →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              {[
                ["15% Knowledge", "First-Principles Checks", "#5142b5"],
                ["30% Execution", "Env A Browser Sandbox", "#5142b5"],
                ["20% Judgement", "Trade-Off Decisions", "#5142b5"],
                ["15% Oral Defence", "Boardroom Cold Call", "#5142b5"],
                ["20% V1 → V2 Diff", "Faculty Red-Line Review", "#5142b5"],
              ].map(([title, sub, col]) => (
                <div key={title} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}>
                  <strong style={{ color: col, fontSize: 13, fontFamily: "var(--font-mono)", display: "block" }}>{title}</strong>
                  <span style={{ color: "#475569", fontSize: 12 }}>{sub}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* 4B. In-Dashboard Programmes & Career Tracks (AlmaBetter Style) */}
        {studentTab === 'overview' ? (
          <InDashboardProgrammesCatalog
            enrollments={enrolmentRows}
            activeCourseSlug={course.slug}
            activeCourseTitle={course.title}
            progressPct={progressPct}
            resumeHref={resumeHref}
            onEnrolled={() => {
              void reload()
              retryLists()
            }}
          />
        ) : null}

        {/* 5. Elixir Wallet & Case Study Store */}
        {studentTab === 'overview' || studentTab === 'wallet' ? (
          <section className="sh-card" aria-label="Elixir wallet" style={{ marginTop: 22 }}>
            <ElixirWalletPanel />
          </section>
        ) : null}
      </div>
    </AuthDashboardShell>
  )
}
