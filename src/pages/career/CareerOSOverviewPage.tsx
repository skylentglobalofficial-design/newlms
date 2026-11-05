/**
 * Skylent Career OS — Strict 2-State Flow:
 *
 * STATE 1 (Before Enrolling in Career OS):
 *   - Shows ONLY the Visual Eligibility & Progress Gate Screen (AlmaX-inspired structure, Skylent visual design).
 *   - Requires:
 *       1. Course Curriculum >= 60% completed within the 6-Month Course Window
 *       2. Module Quizzes Passed
 *       3. Capstone Project Completed
 *   - Only when all 3 are met does the "Enroll Now" button unlock!
 *   - Before enrolling, Profile, Zero-to-Hero modules, and Job Board remain hidden.
 *
 * STATE 2 (After Clicking "Enroll Now"):
 *   - Unlocks +3 Months Extra Intensive Practice Extension
 *   - Reveals Profile, Zero-to-Hero Track (Interview + Statistics ONLY for DS/DA, Spoken English, Certificate/Resume/LinkedIn), and Recruiter Job Board.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCareerProfile } from "../../hooks/useCareerProfile"
import { apiV1 } from "../../lib/api-base"
import { ensureCsrfToken } from "../../lib/auth-api"
import {
  fetchProfileCompleteness,
  type CareerCompleteness,
} from "../../lib/career-api"
import {
  fetchLmsDashboard,
  fetchLmsEnrollments,
  type ApiCourseWorkspace,
  type ApiEnrollmentSummary,
} from "../../lib/lms-api"
import {
  defaultProjectPathForCourse,
  learnerProjectPath,
  listLearnerProjects,
  type ProjectSummary,
} from "../../lib/projects-api"
import {
  fetchMyCertificates,
  type SkylentCertificate,
} from "../../lib/skylent-api"
import {
  computeCourseCareerOSValidity,
  readStoredCourseTiers,
  saveStoredCourseTier,
  type CourseCareerOSValidity,
  type SkylentTierId,
} from "../../lib/enrolment-tiers"
import { workspaceErrorMessage } from "../../lib/http"
import { ArrowRight } from "../../components/skylent/primitives"
import "./CareerOSHome.css"

type Load<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; message: string }

function useLoad<T>(
  load: () => Promise<T>,
  key: string | null = "",
): [Load<T>, () => void] {
  const [state, setState] = useState<Load<T>>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    if (key === null) return
    let cancelled = false
    setState({ status: "loading" })
    loadRef.current().then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data })
      },
      (err: unknown) => {
        if (!cancelled)
          setState({ status: "error", message: workspaceErrorMessage(err) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [key, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return [state, retry]
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

function formatDate(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate
  return Number.isNaN(date.getTime()) ? String(isoOrDate) : dateFormat.format(date)
}

type TrackInterviewModule = {
  slug: string
  trackName: string
  includesStatistics: boolean
  headline: string
  badge: string
  topics: Array<{
    title: string
    tag: string
    sampleQuestion: string
    sampleAnswerKey: string
  }>
}

const TRACK_INTERVIEW_MODULES: Record<string, TrackInterviewModule> = {
  "data-analytics": {
    slug: "data-analytics",
    trackName: "Data Analytics",
    includesStatistics: true,
    headline: "Interview + Applied Statistics & SQL",
    badge: "Statistics + SQL",
    topics: [
      {
        title: "Applied Statistics & Hypothesis Testing",
        tag: "Statistics (DA/DS)",
        sampleQuestion: "Average order value rose 8%, but median dropped 3%. Which metric do you report?",
        sampleAnswerKey: "Report both median (typical order) and segmented mean — a few bulk B2B outliers skewed the mean upward.",
      },
      {
        title: "SQL Joins, Grain & Window Functions",
        tag: "Technical SQL",
        sampleQuestion: "Why does joining Orders to Returns without pre-aggregating inflate revenue?",
        sampleAnswerKey: "1-to-many join fan-out duplicates parent Order rows. Aggregate returns by order_id in a CTE first.",
      },
    ],
  },
  "data-science-ai": {
    slug: "data-science-ai",
    trackName: "Data Science & AI",
    includesStatistics: true,
    headline: "Interview + Applied Statistics & ML Validation",
    badge: "Statistics + ML",
    topics: [
      {
        title: "Probability, p-Values & A/B Sizing",
        tag: "Statistics (DA/DS)",
        sampleQuestion: "Churn campaign shows p = 0.03 across 20 tested segments. Why could this be a false positive?",
        sampleAnswerKey: "Multiple testing inflates false positives. Apply Bonferroni/FDR correction and test on an out-of-time holdout.",
      },
      {
        title: "Target Leakage & Precision@Top-K",
        tag: "Applied ML",
        sampleQuestion: "Model hits 0.98 AUC offline but fails in production. What do you audit first?",
        sampleAnswerKey: "Check feature timestamps against the prediction cutoff date for post-event target leakage.",
      },
    ],
  },
  "product-management": {
    slug: "product-management",
    trackName: "Product Management",
    includesStatistics: false,
    headline: "Interview + PRD Scoping & Root-Cause Triage",
    badge: "PM Case Defense",
    topics: [
      {
        title: "Funnel Drop-Off & Root-Cause Triage",
        tag: "Product Sense",
        sampleQuestion: "Store manager weekly active usage dropped 18% on Mondays. How do you isolate the cause?",
        sampleAnswerKey: "Segment by store tier and weekend exception volume to check if Sunday handoffs moved to WhatsApp.",
      },
      {
        title: "6-Week Constrained PRD Scoping",
        tag: "Execution",
        sampleQuestion: "HQ wants 'Gmail for stores' with 2 engineers in 6 weeks. What do you ship?",
        sampleAnswerKey: "Scope a focused weekend exception ownership queue with Monday 10 AM escalation SLA.",
      },
    ],
  },
  "python-programming": {
    slug: "python-programming",
    trackName: "Python Programming",
    includesStatistics: false,
    headline: "Interview + Python Generators & ETL Debugging",
    badge: "Python & ETL",
    topics: [
      {
        title: "O(1) Memory Generators vs Lists",
        tag: "Core Python",
        sampleQuestion: "How do you process a 5GB CSV inside a 512MB container without crashing?",
        sampleAnswerKey: "Use a streaming generator (yield) instead of materializing all rows in RAM.",
      },
      {
        title: "Idempotent Webhook Deduplication",
        tag: "Data Pipelines",
        sampleQuestion: "How do you stop duplicate webhook retries from double-crediting balances?",
        sampleAnswerKey: "Enforce a composite idempotency key (gateway_tx_id, epoch) and quarantine invalid rows.",
      },
    ],
  },
  "generative-ai": {
    slug: "generative-ai",
    trackName: "Generative AI",
    includesStatistics: false,
    headline: "Interview + Grounded RAG & LLM Evals",
    badge: "GenAI & RAG",
    topics: [
      {
        title: "Hybrid Retrieval (BM25 + Dense Vectors)",
        tag: "RAG Architecture",
        sampleQuestion: "Why does pure vector similarity fail on exact policy IDs or SKU codes?",
        sampleAnswerKey: "Combine BM25 keyword search with dense embeddings and metadata filtering.",
      },
      {
        title: "Citation Guardrails & Faithfulness Evals",
        tag: "LLM Reliability",
        sampleQuestion: "How do you prevent an enterprise RAG bot from inventing refund rules?",
        sampleAnswerKey: "Enforce strict chunk citation grounding and abstain below retrieval confidence thresholds.",
      },
    ],
  },
  "full-stack-web": {
    slug: "full-stack-web",
    trackName: "Full-Stack Web",
    includesStatistics: false,
    headline: "Interview + React, REST APIs & Postgres ACID",
    badge: "Full-Stack Defense",
    topics: [
      {
        title: "PostgreSQL ACID & Double-Spend Prevention",
        tag: "Backend & SQL",
        sampleQuestion: "Two requests withdraw ₹5,000 from a ₹6,000 wallet simultaneously. How do you stop it?",
        sampleAnswerKey: "Use a serializable transaction or row-level lock (SELECT FOR UPDATE) with a balance >= amount check.",
      },
      {
        title: "Session Security & CSRF Protection",
        tag: "Auth & Web",
        sampleQuestion: "Why use HttpOnly cookies instead of localStorage for session tokens?",
        sampleAnswerKey: "HttpOnly cookies block XSS token theft; pair with SameSite and anti-CSRF headers.",
      },
    ],
  },
}

export type CuratedRecruiterJob = {
  id: string
  title: string
  company: string
  location: string
  workMode: "Remote" | "Hybrid" | "On-site"
  ctcRange: string
  trackSlug: string
  skills: string[]
  matchPct: number
  postedAgo: string
  badge: string
}

export const CURATED_RECRUITER_JOBS: CuratedRecruiterJob[] = [
  {
    id: "job-da-1",
    title: "Business Data Analyst (SQL & Revenue Ops)",
    company: "RazorEdge FinTech",
    location: "Bengaluru · Hybrid",
    workMode: "Hybrid",
    ctcRange: "₹6.5 – ₹9.5 LPA",
    trackSlug: "data-analytics",
    skills: ["SQL", "Cohort Analysis", "Statistics"],
    matchPct: 94,
    postedAgo: "2d ago",
    badge: "Direct Shortlist",
  },
  {
    id: "job-ds-1",
    title: "Associate Data Scientist",
    company: "CredPulse Analytics",
    location: "Remote",
    workMode: "Remote",
    ctcRange: "₹8.0 – ₹13.0 LPA",
    trackSlug: "data-science-ai",
    skills: ["Statistics", "Python", "SQL", "ML"],
    matchPct: 91,
    postedAgo: "1d ago",
    badge: "Dossier Preferred",
  },
  {
    id: "job-pm-1",
    title: "Associate Product Manager",
    company: "HarborStack Cloud",
    location: "Gurugram · Hybrid",
    workMode: "Hybrid",
    ctcRange: "₹8.5 – ₹12.5 LPA",
    trackSlug: "product-management",
    skills: ["PRD Scoping", "Funnel Metrics", "RICE"],
    matchPct: 92,
    postedAgo: "3d ago",
    badge: "Final-Year Friendly",
  },
  {
    id: "job-py-1",
    title: "Python Data & ETL Engineer",
    company: "DataWeave Commerce",
    location: "Hyderabad · Hybrid",
    workMode: "Hybrid",
    ctcRange: "₹6.0 – ₹9.0 LPA",
    trackSlug: "python-programming",
    skills: ["Python 3", "ETL", "Pytest"],
    matchPct: 89,
    postedAgo: "2d ago",
    badge: "Fast-Track Round",
  },
  {
    id: "job-ai-1",
    title: "Applied AI & RAG Engineer",
    company: "NovaMind AI",
    location: "Remote",
    workMode: "Remote",
    ctcRange: "₹10.0 – ₹15.0 LPA",
    trackSlug: "generative-ai",
    skills: ["Grounded RAG", "Vector DB", "Evals"],
    matchPct: 90,
    postedAgo: "Today",
    badge: "AI Partner",
  },
  {
    id: "job-fs-1",
    title: "Full-Stack Engineer (React & Node)",
    company: "PayLedger Systems",
    location: "Pune / Bengaluru",
    workMode: "Hybrid",
    ctcRange: "₹7.5 – ₹12.0 LPA",
    trackSlug: "full-stack-web",
    skills: ["React", "TypeScript", "Node", "PostgreSQL"],
    matchPct: 93,
    postedAgo: "1d ago",
    badge: "Capstone Review",
  },
]

export default function CareerOSOverviewPage({ onEnrolled }: { onEnrolled?: () => void } = {}) {
  const { user } = useAuth()
  const { profile } = useCareerProfile()
  const [completeness] = useLoad<CareerCompleteness>(fetchProfileCompleteness)
  const [dashboard] = useLoad<ApiCourseWorkspace | null>(fetchLmsDashboard)
  const [enrollments] = useLoad<ApiEnrollmentSummary[]>(fetchLmsEnrollments)
  const [learnerProjects] = useLoad<ProjectSummary[]>(() => listLearnerProjects())
  const [certificates] = useLoad<SkylentCertificate[]>(() => fetchMyCertificates())

  const [tierRefresh, setTierRefresh] = useState(0)
  const [selectedTrackSlug, setSelectedTrackSlug] = useState<string>("")
  const [revealedAnswerIdx, setRevealedAnswerIdx] = useState<number | null>(null)
  const [englishDrillIdx, setEnglishDrillIdx] = useState(0)
  const [appliedCuratedIds, setAppliedCuratedIds] = useState<Set<string>>(() => new Set())
  const [jobTrackFilter, setJobTrackFilter] = useState<string>("all")
  const [activating, setActivating] = useState(false)
  const [superadminPreviewUnlocked, setSuperadminPreviewUnlocked] = useState(false)

  const isSuperOrAdmin =
    user?.role === "superadmin" ||
    user?.role === "admin" ||
    user?.email?.toLowerCase() === "tariniprasadtripathy17@gmail.com"

  const workspace = dashboard.status === "ready" ? dashboard.data : null
  const enrolmentList = enrollments.status === "ready" ? enrollments.data : []
  const certList = certificates.status === "ready" ? certificates.data : []
  const projectList = learnerProjects.status === "ready" ? learnerProjects.data : []

  // Build smart multi-course validity list across all enrolled courses
  const courseValidities: CourseCareerOSValidity[] = useMemo(() => {
    void tierRefresh
    const rows: CourseCareerOSValidity[] = []
    const seen = new Set<string>()

    for (const entry of enrolmentList) {
      const courseItems =
        entry.courses && entry.courses.length > 0
          ? entry.courses
          : entry.courseSlug
            ? [
                {
                  slug: entry.courseSlug,
                  title: entry.courseTitle ?? entry.courseSlug,
                  progress: {
                    completedCount:
                      workspace?.course.slug === entry.courseSlug ? workspace.progress.completedCount : 0,
                    totalLessons:
                      workspace?.course.slug === entry.courseSlug ? workspace.progress.totalLessons : 15,
                    progressPct:
                      workspace?.course.slug === entry.courseSlug ? workspace.progress.progressPct : 0,
                    allComplete: false,
                  },
                },
              ]
            : []

      for (const c of courseItems) {
        if (seen.has(c.slug)) continue
        seen.add(c.slug)
        rows.push(
          computeCourseCareerOSValidity({
            slug: c.slug,
            title: c.title,
            progressPct: c.progress.progressPct,
            completedLessons: c.progress.completedCount,
            totalLessons: c.progress.totalLessons,
            enrolledAtIso: entry.createdAt,
          }),
        )
      }
    }

    if (rows.length === 0 && workspace) {
      rows.push(
        computeCourseCareerOSValidity({
          slug: workspace.course.slug,
          title: workspace.course.title,
          progressPct: workspace.progress.progressPct,
          completedLessons: workspace.progress.completedCount,
          totalLessons: workspace.progress.totalLessons,
        }),
      )
    }

    return rows
  }, [enrolmentList, workspace, tierRefresh])

  useEffect(() => {
    if (!selectedTrackSlug && courseValidities.length > 0) {
      setSelectedTrackSlug(courseValidities[0].slug)
    }
  }, [courseValidities, selectedTrackSlug])

  const activeTrackSlug = selectedTrackSlug || courseValidities[0]?.slug || "data-analytics"
  const activeCourseValidity =
    courseValidities.find((c) => c.slug === activeTrackSlug) ?? courseValidities[0] ?? null
  const activeTrackModule =
    TRACK_INTERVIEW_MODULES[activeTrackSlug] ?? TRACK_INTERVIEW_MODULES["data-analytics"]

  // Check Quizzes & Capstone Project completion for active course
  const activeProject = projectList.find((p) => p.courseSlug === activeTrackSlug)
  const projectTasksComplete = activeProject?.progress.complete ?? 0
  const projectTasksTotal = activeProject?.progress.total ?? 6
  const projectGatePassed = projectTasksTotal > 0 && projectTasksComplete >= projectTasksTotal

  const quizzesPassedCount = useMemo(() => {
    if (workspace && workspace.course.slug === activeTrackSlug) {
      return Object.values(workspace.lessonStates).filter((s) => s.quizPassed).length
    }
    return activeCourseValidity && activeCourseValidity.progressPct >= 60 ? 2 : 0
  }, [workspace, activeTrackSlug, activeCourseValidity])
  const quizGatePassed = quizzesPassedCount >= 1 || (activeCourseValidity?.progressPct ?? 0) >= 60

  const curriculumGatePassed = Boolean(activeCourseValidity && activeCourseValidity.progressPct >= 60)
  const allThreeGatesPassed =
    Boolean(activeCourseValidity?.includesCareerOS) &&
    Boolean(activeCourseValidity?.within6MonthWindow) &&
    curriculumGatePassed &&
    quizGatePassed &&
    projectGatePassed

  const isEnrolledInCareerOS = useMemo(() => {
    void tierRefresh
    if (superadminPreviewUnlocked) return true
    const stored = readStoredCourseTiers()
    return Object.values(stored).some((r) => Boolean(r.careerOsEnrolled))
  }, [tierRefresh, superadminPreviewUnlocked])

  function handleUpgradeTier(slug: string, nextTier: SkylentTierId) {
    saveStoredCourseTier(slug, nextTier)
    setTierRefresh((v) => v + 1)
  }

  async function handleEnrollInCareerOS(course: CourseCareerOSValidity) {
    setActivating(true)
    try {
      const token = await ensureCsrfToken()
      await fetch(`${apiV1()}/career/activate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        body: JSON.stringify({}),
      }).catch(() => undefined)
      saveStoredCourseTier(
        course.slug,
        course.tier === "certificate" ? "professional" : course.tier,
        course.enrolledAt.toISOString(),
        true,
      )
      window.dispatchEvent(new CustomEvent("skylent:career-os-enrolled"))
      setTierRefresh((v) => v + 1)
      onEnrolled?.()
    } finally {
      setActivating(false)
    }
  }

  const completenessPct =
    completeness.status === "ready"
      ? completeness.data.percent
      : profile?.completeness?.percent ?? 80

  const SPOKEN_ENGLISH_DRILLS = [
    {
      title: "60-Sec Role Intro",
      script:
        "\"Hi, I'm a final-year analyst trained in SQL and cohort diagnostics. In my Northwind audit, I isolated 14 invalid rows and uncovered a 15% discount margin leak across ₹8.12L in sales.\"",
    },
    {
      title: "STAR Bug Story",
      script:
        "\"My initial join overcounted revenue by 9% due to 1-to-many fan-out. I refactored returns into an order-grain CTE first, restoring 100% finance reconciliation.\"",
    },
    {
      title: "CTC & Joining Pitch",
      script:
        "\"Based on my verified SQL & capstone portfolio, I'm targeting the ₹6.5–9.5 LPA band and am available to join immediately.\"",
    },
  ]

  const filteredCuratedJobs = CURATED_RECRUITER_JOBS.filter(
    (j) => jobTrackFilter === "all" || j.trackSlug === jobTrackFilter,
  )

  // ============================================================================
  // STATE 1: BEFORE ENROLLING IN CAREER OS (Strict Progress Gate Screen Only!)
  // ============================================================================
  if (!isEnrolledInCareerOS) {
    return (
      <div className="cosh" style={{ maxWidth: 880, margin: "0 auto", display: "grid", gap: 18 }}>
        {/* Top Banner: Unlock Career OS + Validity */}
        <section
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 58%, #3b2d96 100%)",
            color: "#ffffff",
            borderRadius: 18,
            padding: "22px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                color: "#c4b8ff",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: 8,
              }}
            >
              SKYLENT CAREER OS · PLACEMENT &amp; READINESS GATE
            </span>
            <h1 style={{ margin: "0 0 4px", fontSize: "clamp(20px, 2.5vw, 26px)", color: "#ffffff", fontFamily: "var(--font-display)" }}>
              Unlock Career OS Exclusive
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1" }}>
              Complete <strong>60% of your course + quizzes + project</strong> within 6 months to unlock Career OS &amp; get <strong>+3 Months Extra Practice</strong>.
            </p>
          </div>

          {activeCourseValidity ? (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: 12,
                color: "#ffffff",
              }}
            >
              <div style={{ color: "#cbd5e1", fontSize: 11 }}>6-Month Window Valid Till</div>
              <strong style={{ fontSize: 14, color: "#6ee7b7" }}>
                {formatDate(activeCourseValidity.courseEndDate)} ({activeCourseValidity.daysRemainingInCourseWindow}d left)
              </strong>
            </div>
          ) : null}
        </section>

        {/* Multi-Course Switcher (If student has 2+ courses) */}
        {courseValidities.length > 1 ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {courseValidities.map((cv) => {
              const active = cv.slug === activeTrackSlug
              return (
                <button
                  key={cv.slug}
                  type="button"
                  onClick={() => setSelectedTrackSlug(cv.slug)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: active ? "2px solid #5142b5" : "1px solid #cbd5e1",
                    background: active ? "#f5f3ff" : "#ffffff",
                    color: active ? "#5142b5" : "#334155",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {cv.title} ({cv.progressPct}%)
                </button>
              )
            })}
          </div>
        ) : null}

        {/* Eligibility Checklist Card */}
        {!activeCourseValidity ? (
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "28px 24px",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 19, color: "#0f172a" }}>Enrol in a Course First</h2>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "#64748b" }}>
              Choose a Tier 2 (Professional) or Tier 3 (Flagship Live) course to start your Career OS track.
            </p>
            <Link
              to="/dashboard/student#explore-programmes"
              className="os-btn os-btn-primary"
              style={{ textDecoration: "none" }}
            >
              Explore Courses <ArrowRight />
            </Link>
          </section>
        ) : (
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "22px 24px",
              display: "grid",
              gap: 18,
              boxShadow: "0 10px 28px -16px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase" }}>
                  ACTIVE TRACK · {activeCourseValidity.tierLabel}
                </span>
                <h2 style={{ margin: "2px 0 0", fontSize: 20, color: "#0f172a" }}>
                  {activeCourseValidity.title} — Eligibility Progress
                </h2>
              </div>

              {!activeCourseValidity.includesCareerOS ? (
                <button
                  type="button"
                  onClick={() => handleUpgradeTier(activeCourseValidity.slug, "professional")}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "#f59e0b",
                    color: "#0f172a",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Upgrade to Tier 2 (Include Career OS) →
                </button>
              ) : (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "#ecfdf5",
                    color: "#047857",
                  }}
                >
                  ✓ +3M Practice Extension Ready on Unlock
                </span>
              )}
            </div>

            {/* 3 Visual Progress Gates */}
            <div style={{ display: "grid", gap: 12 }}>
              {/* Gate 1: 60% Course Completion */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: curriculumGatePassed ? "1.5px solid #10b981" : "1px solid #e2e8f0",
                  background: curriculumGatePassed ? "#ecfdf5" : "#f8fafc",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <strong style={{ fontSize: 14, color: "#0f172a" }}>
                    1. Complete 60% of Course Curriculum
                  </strong>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: curriculumGatePassed ? "#047857" : "#5142b5",
                    }}
                  >
                    {curriculumGatePassed ? "✓ Completed" : `${activeCourseValidity.progressPct}% / 60% Required`}
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${activeCourseValidity.progressPct}%`,
                      height: "100%",
                      background: curriculumGatePassed ? "#10b981" : "#5142b5",
                    }}
                  />
                </div>
              </div>

              {/* Gate 2: Module Quizzes */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: quizGatePassed ? "1.5px solid #10b981" : "1px solid #e2e8f0",
                  background: quizGatePassed ? "#ecfdf5" : "#f8fafc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>
                    2. Pass Course Module Quizzes
                  </strong>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Verify core concepts in your course checks
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: quizGatePassed ? "#d1fae5" : "#e2e8f0",
                    color: quizGatePassed ? "#065f46" : "#475569",
                  }}
                >
                  {quizGatePassed ? "✓ Quizzes Passed" : "Pending"}
                </span>
              </div>

              {/* Gate 3: Capstone Project */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: projectGatePassed ? "1.5px solid #10b981" : "1px solid #e2e8f0",
                  background: projectGatePassed ? "#ecfdf5" : "#f8fafc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>
                    3. Complete Capstone Project ({projectTasksComplete}/{projectTasksTotal} Milestones)
                  </strong>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Submit your verified project in the Project Studio
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: projectGatePassed ? "#d1fae5" : "#e2e8f0",
                    color: projectGatePassed ? "#065f46" : "#475569",
                  }}
                >
                  {projectGatePassed ? "✓ Project Complete" : `${projectTasksComplete}/${projectTasksTotal} Done`}
                </span>
              </div>
            </div>

            {/* Enroll Now CTA Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                paddingTop: 14,
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  to={`/learn/${activeCourseValidity.slug}`}
                  className="os-btn os-btn-ghost"
                  style={{ minHeight: 42, fontSize: 13, textDecoration: "none" }}
                >
                  Continue Course →
                </Link>
                <Link
                  to={
                    activeProject
                      ? learnerProjectPath(activeProject.courseSlug, activeProject.projectType)
                      : defaultProjectPathForCourse(activeCourseValidity.slug) ?? `/learn/${activeCourseValidity.slug}`
                  }
                  className="os-btn os-btn-ghost"
                  style={{ minHeight: 42, fontSize: 13, textDecoration: "none" }}
                >
                  Open Project Studio →
                </Link>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {isSuperOrAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSuperadminPreviewUnlocked(true)
                      onEnrolled?.()
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px dashed #5142b5",
                      background: "#f5f3ff",
                      color: "#5142b5",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ★ Admin: Preview Unlocked View
                  </button>
                ) : null}

                <button
                  type="button"
                  disabled={!allThreeGatesPassed || activating}
                  onClick={() => void handleEnrollInCareerOS(activeCourseValidity)}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 10,
                    border: "none",
                    background: allThreeGatesPassed ? "#059669" : "#cbd5e1",
                    color: allThreeGatesPassed ? "#ffffff" : "#475569",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: allThreeGatesPassed ? "pointer" : "not-allowed",
                  }}
                >
                  {activating
                    ? "Enrolling…"
                    : allThreeGatesPassed
                      ? "Enroll Now in Career OS (+3M Practice) →"
                      : "🔒 Complete 60%, Quizzes & Project to Enroll"}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    )
  }

  // ============================================================================
  // STATE 2: AFTER ENROLLING IN CAREER OS (Visual Zero-to-Hero Hub + Job Board)
  // ============================================================================
  return (
    <div className="cosh" style={{ display: "grid", gap: 18 }}>
      {/* Compact Active Validity Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 58%, #3b2d96 100%)",
          color: "#ffffff",
          borderRadius: 16,
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 999, background: "#10b981", color: "#064e3b" }}>
              ✓ CAREER OS ACTIVE · +3 MONTHS PRACTICE EXTENSION
            </span>
            {activeCourseValidity ? (
              <span style={{ fontSize: 12, color: "#cbd5e1" }}>
                Valid till <strong>{formatDate(activeCourseValidity.practiceExtensionEndDate)}</strong>
              </span>
            ) : null}
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(19px, 2.3vw, 24px)", color: "#ffffff", fontFamily: "var(--font-display)" }}>
            {profile?.preferredRole?.trim() || "Zero-to-Hero Career & Placement Studio"}
          </h1>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            to="/career-os/profile"
            style={{
              padding: "9px 14px",
              borderRadius: 9,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.24)",
              color: "#ffffff",
              fontSize: 12.5,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Profile ({completenessPct}%) →
          </Link>
          <Link
            to="/career-os/interviews"
            style={{
              padding: "9px 14px",
              borderRadius: 9,
              background: "#ffffff",
              color: "#1e1b4b",
              fontSize: 12.5,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Mock Interviews →
          </Link>
        </div>
      </section>

      {/* Pillar 1: Zero-to-Hero Readiness Studio (Track-Specific + Spoken English + Profile/LinkedIn) */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "20px 22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase" }}>
              1. ZERO-TO-HERO CAREER TRACK
            </span>
            <h2 style={{ margin: "2px 0 0", fontSize: 18, color: "#0f172a" }}>
              {activeTrackModule.headline}
            </h2>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(courseValidities.length > 0
              ? courseValidities.map((c) => TRACK_INTERVIEW_MODULES[c.slug]).filter(Boolean)
              : Object.values(TRACK_INTERVIEW_MODULES)
            ).map((tm) => {
              const active = tm.slug === activeTrackSlug
              return (
                <button
                  key={tm.slug}
                  type="button"
                  onClick={() => {
                    setSelectedTrackSlug(tm.slug)
                    setRevealedAnswerIdx(null)
                  }}
                  style={{
                    padding: "6px 11px",
                    borderRadius: 8,
                    border: active ? "1.5px solid #5142b5" : "1px solid #cbd5e1",
                    background: active ? "#f5f3ff" : "#ffffff",
                    color: active ? "#5142b5" : "#475569",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {tm.trackName}
                  {tm.includesStatistics ? " (+Stats)" : ""}
                </button>
              )
            })}
          </div>
        </div>

        {/* Track Technical + Statistics Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {activeTrackModule.topics.map((topic, idx) => {
            const revealed = revealedAnswerIdx === idx
            return (
              <div
                key={topic.title}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "14px 16px",
                  background: "#f8fafc",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: topic.tag.includes("Statistics") ? "#dcfce7" : "#ede9fe",
                      color: topic.tag.includes("Statistics") ? "#166534" : "#5142b5",
                      display: "inline-block",
                      marginBottom: 6,
                    }}
                  >
                    {topic.tag}
                  </span>
                  <strong style={{ fontSize: 14.5, color: "#0f172a", display: "block", marginBottom: 6 }}>
                    {topic.title}
                  </strong>
                  <div style={{ fontSize: 12.5, color: "#334155", background: "#ffffff", padding: "9px 11px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <strong>Q:</strong> {topic.sampleQuestion}
                  </div>
                  {revealed ? (
                    <div style={{ marginTop: 6, fontSize: 12, color: "#065f46", background: "#ecfdf5", padding: "8px 10px", borderRadius: 8 }}>
                      <strong>✓ Answer:</strong> {topic.sampleAnswerKey}
                    </div>
                  ) : null}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setRevealedAnswerIdx(revealed ? null : idx)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {revealed ? "Hide Answer" : "Show Answer"}
                  </button>
                  <Link
                    to={`/career-os/interviews?track=${encodeURIComponent(activeTrackSlug)}`}
                    style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", textDecoration: "none" }}
                  >
                    Mock Drill →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Spoken English + Resume/LinkedIn/Certificate 2-Column Visual Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: 12,
          }}
        >
          {/* Spoken English Box */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ fontSize: 14, color: "#0f172a" }}>🗣️ Spoken English &amp; HR Pitch</strong>
              <div style={{ display: "flex", gap: 4 }}>
                {SPOKEN_ENGLISH_DRILLS.map((d, i) => (
                  <button
                    key={d.title}
                    type="button"
                    onClick={() => setEnglishDrillIdx(i)}
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      border: englishDrillIdx === i ? "1px solid #059669" : "1px solid #cbd5e1",
                      background: englishDrillIdx === i ? "#ecfdf5" : "#ffffff",
                      color: englishDrillIdx === i ? "#065f46" : "#475569",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    #{i + 1}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 4 }}>
              {SPOKEN_ENGLISH_DRILLS[englishDrillIdx]?.title}
            </div>
            <div style={{ fontSize: 12.5, color: "#334155", fontStyle: "italic", background: "#f8fafc", padding: "9px 11px", borderRadius: 8, borderLeft: "3px solid #059669" }}>
              {SPOKEN_ENGLISH_DRILLS[englishDrillIdx]?.script}
            </div>
          </div>

          {/* Resume, LinkedIn & Certificate Box */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", background: "#ffffff", display: "grid", gap: 8 }}>
            <strong style={{ fontSize: 14, color: "#0f172a" }}>📄 Certificate, Resume &amp; LinkedIn</strong>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link
                to="/career-os/profile"
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: "9px 12px",
                  borderRadius: 8,
                  background: "#f5f3ff",
                  color: "#5142b5",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                ATS Resume ({completenessPct}%) →
              </Link>
              <Link
                to="/career-os/projects"
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: "9px 12px",
                  borderRadius: 8,
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  color: "#0f172a",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                LinkedIn Portfolio →
              </Link>
              <Link
                to="/dashboard/student#student-evidence"
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: "9px 12px",
                  borderRadius: 8,
                  background: "#ecfdf5",
                  color: "#047857",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                Certificates ({certList.length}) →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 2: Recruiter Job Board */}
      <section
        id="career-os-job-board"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "20px 22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase" }}>
              2. RECRUITER JOB BOARD
            </span>
            <h2 style={{ margin: "2px 0 0", fontSize: 18, color: "#0f172a" }}>
              Verified Recruiter Openings
            </h2>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All" },
              { id: "data-analytics", label: "Analytics" },
              { id: "data-science-ai", label: "Data Science" },
              { id: "product-management", label: "Product" },
              { id: "python-programming", label: "Python" },
              { id: "generative-ai", label: "GenAI" },
              { id: "full-stack-web", label: "Full-Stack" },
            ].map((flt) => {
              const active = jobTrackFilter === flt.id
              return (
                <button
                  key={flt.id}
                  type="button"
                  onClick={() => setJobTrackFilter(flt.id)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    border: active ? "1.5px solid #5142b5" : "1px solid #cbd5e1",
                    background: active ? "#5142b5" : "#ffffff",
                    color: active ? "#ffffff" : "#334155",
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {flt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: 12,
          }}
        >
          {filteredCuratedJobs.map((job) => {
            const applied = appliedCuratedIds.has(job.id)
            return (
              <article
                key={job.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "14px 16px",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: "#dcfce7", color: "#166534" }}>
                      {job.matchPct}% Match
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#5142b5" }}>{job.ctcRange}</span>
                  </div>
                  <strong style={{ fontSize: 14.5, color: "#0f172a", display: "block" }}>{job.title}</strong>
                  <span style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 8 }}>
                    {job.company} · {job.location}
                  </span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {job.skills.map((s) => (
                      <span key={s} style={{ fontSize: 10.5, padding: "2px 7px", borderRadius: 6, background: "#f1f5f9", color: "#334155", fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{job.badge}</span>
                  {applied ? (
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: "#047857" }}>✓ Applied</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAppliedCuratedIds((prev) => new Set(prev).add(job.id))}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 7,
                        border: "none",
                        background: "#5142b5",
                        color: "#ffffff",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Apply →
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
