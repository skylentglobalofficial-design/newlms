/**
 * Skylent Career OS — Smart Multi-Course Validity Engine + Zero-to-Hero Readiness Studio + Recruiter Job Board.
 *
 * Implements:
 * 1. Smart Multi-Course Validity Engine:
 *    - Career OS is included with Tier 2 (Professional) and Tier 3 (Flagship Live) courses (not Tier 1 Certificate-only).
 *    - Each course has a 6-Month Active Course Window (Enrolled Date -> +6 Months).
 *    - Rule: Learner must reach >= 60% course completion BEFORE the 6-Month Course Window ends to enroll in Career OS.
 *    - Enrolling in Career OS within the 6-Month window at >= 60% unlocks +3 Months of Intensive Practice & Placement Access.
 * 2. Zero-to-Hero Career Readiness Studio:
 *    - Track-Aware Technical Prep: Shows "Interview Prep + Applied Statistics & SQL" ONLY for Data Science (data-science-ai) and Data Analytics (data-analytics); shows track-specific technical interview modules for PM, Python, GenAI, and Full-Stack.
 *    - Spoken English & Executive Communication Studio
 *    - ATS Resume, LinkedIn Makeover & Verified Certificate Builder
 * 3. Recruiter Job Board:
 *    - Interactive Recruiter Job Board showing role openings matched to the learner's track & verified skills.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useCareerProfile } from "../../hooks/useCareerProfile"
import {
  fetchProfileCompleteness,
  listApplications,
  listCareerEvidenceProjects,
  searchJobs,
  type CareerCompleteness,
  type CareerEvidenceSummary,
  type JobApplication,
  type JobListResult,
} from "../../lib/career-api"
import {
  fetchLmsDashboard,
  fetchLmsEnrollments,
  type ApiCourseWorkspace,
  type ApiEnrollmentSummary,
} from "../../lib/lms-api"
import {
  learnerProjectPath,
  listLearnerProjects,
  projectStatusLabel,
  type ProjectSummary,
} from "../../lib/projects-api"
import {
  fetchMyCertificates,
  type SkylentCertificate,
} from "../../lib/skylent-api"
import {
  computeCourseCareerOSValidity,
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
    detail: string
    sampleQuestion: string
    sampleAnswerKey: string
  }>
}

const TRACK_INTERVIEW_MODULES: Record<string, TrackInterviewModule> = {
  "data-analytics": {
    slug: "data-analytics",
    trackName: "Data Analytics & Business SQL",
    includesStatistics: true,
    headline: "Interview Prep + Applied Statistics, Probability & Business SQL",
    badge: "Includes Applied Statistics + SQL",
    topics: [
      {
        title: "Applied Statistics & Business Hypothesis Testing",
        tag: "Statistics (DA/DS Exclusive)",
        detail: "Mean vs Median on skewed revenue, Standard Deviation, Z-scores, p-values, and A/B promo uplift validation.",
        sampleQuestion: "Northwind's average order value rose by 8%, but median order value dropped by 3%. What statistical distribution shift happened and which metric should you report to the CFO?",
        sampleAnswerKey: "A right-skewed outlier spike (a few large B2B bulk orders) pulled the mean up while typical orders shrank. Report both the median (typical order) and trimmed/segmented mean.",
      },
      {
        title: "Multi-Table SQL Joins, Grain & Window Functions",
        tag: "Technical SQL",
        detail: "Preventing fan-out traps on LEFT JOIN, ROW_NUMBER() vs DENSE_RANK(), and MoM cohort retention queries.",
        sampleQuestion: "Why does joining Orders to OrderReturns without aggregating returns first inflate total net revenue?",
        sampleAnswerKey: "1-to-many join fan-out duplicates the parent Order row for every return line item. Aggregate returns at the order_id grain in a CTE before joining.",
      },
      {
        title: "Executive Case & Dashboard Stand-Up Defense",
        tag: "Case Defense",
        detail: "Defending the 166 valid Northwind rows (₹8,12,020 net revenue) and margin leakage recommendations.",
        sampleQuestion: "How do you justify excluding 14 rows from the 180-row Northwind extract during a live hiring manager review?",
        sampleAnswerKey: "State the explicit valid-row rule upfront: units > 0, unit_price > 0, and returned = 'no', and quantify the exact 14 excluded rows so the total is 100% reproducible.",
      },
    ],
  },
  "data-science-ai": {
    slug: "data-science-ai",
    trackName: "Data Science & Machine Learning",
    includesStatistics: true,
    headline: "Interview Prep + Applied Statistics, Probability & ML Validation",
    badge: "Includes Applied Statistics + ML",
    topics: [
      {
        title: "Probability, Bayes Theorem, Hypothesis Testing & A/B Sizing",
        tag: "Statistics (DA/DS Exclusive)",
        detail: "Type I vs Type II errors, statistical power (1 - β), confidence intervals, and sample-size calculation for churn experiments.",
        sampleQuestion: "Your churn campaign shows p = 0.03 across 20 tested customer segments. Why might this be a false positive?",
        sampleAnswerKey: "Multiple hypothesis testing inflates family-wise Type I error. Apply Bonferroni or Benjamini-Hochberg FDR correction and validate on an out-of-time holdout cohort.",
      },
      {
        title: "Point-in-Time Feature Engineering & Leakage Auditing",
        tag: "Applied ML",
        detail: "Preventing post-event target leakage, handling censored cohorts, and Precision@Top-K under capacity constraints.",
        sampleQuestion: "A churn model achieves 0.98 ROC-AUC in cross-validation but fails in production. What is the first thing you audit?",
        sampleAnswerKey: "Audit feature timestamps against the prediction cutoff date for target leakage (e.g., using full-month support tickets that occurred after cancellation intent).",
      },
      {
        title: "Probability Calibration & Drift Monitoring (PSI)",
        tag: "Production DS",
        detail: "Platt scaling vs Isotonic regression, Brier score, and Population Stability Index (PSI) alerts.",
        sampleQuestion: "When is Population Stability Index (PSI) considered critical enough to trigger model retraining?",
        sampleAnswerKey: "PSI < 0.10 indicates stability, 0.10–0.25 signals moderate shift requiring investigation, and PSI > 0.25 indicates significant distribution drift requiring recalibration/retraining.",
      },
    ],
  },
  "product-management": {
    slug: "product-management",
    trackName: "Product Management & Strategy",
    includesStatistics: false,
    headline: "Interview Prep + Product Sense, PRD Scoping & Root-Cause Triage",
    badge: "PM Case & PRD Defense",
    topics: [
      {
        title: "Root-Cause Funnel Diagnostics & Metric Drops",
        tag: "Product Analytical",
        detail: "Decomposing activation drop-offs by platform, store cohort, and workflow step before proposing features.",
        sampleQuestion: "Store manager weekly active usage dropped 18% on Monday mornings. How do you isolate the root cause?",
        sampleAnswerKey: "Segment by store tier, app version, and weekend exception volume; verify whether unlogged Sunday handoffs caused managers to bypass the tool on WhatsApp.",
      },
      {
        title: "Constrained PRD Scoping (2 Engineers, 6 Weeks)",
        tag: "PRD & Execution",
        detail: "Defining problem statements, explicit non-goals, RICE trade-offs, and kill criteria.",
        sampleQuestion: "HQ asks for a full 'Gmail for stores' inbox, but you only have 2 engineers for 6 weeks. What do you ship?",
        sampleAnswerKey: "Refuse the full inbox; scope a single weekend exception ownership log with 1-click Monday 10 AM escalation and measurable resolution SLA.",
      },
    ],
  },
  "python-programming": {
    slug: "python-programming",
    trackName: "Python Programming & Automation",
    includesStatistics: false,
    headline: "Interview Prep + Python Data Structures, Generators & ETL Debugging",
    badge: "Python & ETL Defense",
    topics: [
      {
        title: "Memory-Safe Generators, Iterators & Stream Processing",
        tag: "Core Python",
        detail: "Processing multi-gigabyte logs with O(1) memory using yield generators vs list comprehensions.",
        sampleQuestion: "Why does reading a 5GB CSV with list comprehension crash a 512MB container, and how do you fix it?",
        sampleAnswerKey: "List comprehensions materialize all rows in RAM at once. Replace with a generator expression or chunked iterator that yields one validated record at a time.",
      },
      {
        title: "Idempotency Keys & Webhook Deduplication",
        tag: "Data Engineering",
        detail: "Quarantining duplicate retries, schema validation, and deterministic pytest suites.",
        sampleQuestion: "Payment webhooks arrive at-least-once with occasional retries. How do you prevent double-crediting?",
        sampleAnswerKey: "Enforce a composite idempotency key (gateway_tx_id, settlement_epoch) and quarantine malformed/negative-fee rows into a dead-letter audit table.",
      },
    ],
  },
  "generative-ai": {
    slug: "generative-ai",
    trackName: "Generative AI & Grounded RAG Systems",
    includesStatistics: false,
    headline: "Interview Prep + RAG Architecture, Vector Retrieval & Eval Harnesses",
    badge: "GenAI & RAG Defense",
    topics: [
      {
        title: "Chunking, Hybrid Search (BM25 + Dense) & Metadata Filtering",
        tag: "RAG Systems",
        detail: "Designing retrieval pipelines that preserve document hierarchy and prevent cross-tenant context bleed.",
        sampleQuestion: "Why does pure cosine similarity on dense embeddings fail on exact SKU codes or policy IDs?",
        sampleAnswerKey: "Dense embeddings smooth over exact lexical tokens. Combine BM25 keyword retrieval with dense vector search via Reciprocal Rank Fusion (RRF) and strict metadata filters.",
      },
      {
        title: "Hallucination Guardrails & Golden-Set Evaluation",
        tag: "LLM Evals",
        detail: "Measuring faithfulness, citation precision, and prompt-injection refusal rates.",
        sampleQuestion: "How do you prove to an enterprise client that your RAG assistant will not fabricate policy rules?",
        sampleAnswerKey: "Enforce strict inline source citations, abstain when retrieval confidence is below threshold, and run a CI golden-set evaluation measuring faithfulness >= 98%.",
      },
    ],
  },
  "full-stack-web": {
    slug: "full-stack-web",
    trackName: "Full-Stack Web Engineering",
    includesStatistics: false,
    headline: "Interview Prep + React, REST API Idempotency & PostgreSQL ACID",
    badge: "Full-Stack System Defense",
    topics: [
      {
        title: "PostgreSQL ACID Transactions, Row Locking & Ledger Integrity",
        tag: "Backend & SQL",
        detail: "Preventing race conditions on concurrent balance updates using SELECT FOR UPDATE and serializable isolation.",
        sampleQuestion: "Two concurrent requests try to withdraw ₹5,000 from a ₹6,000 wallet at the same millisecond. How do you stop double-spend?",
        sampleAnswerKey: "Wrap the balance check and debit insert inside a single database transaction with row-level locking or an atomic conditional UPDATE ... WHERE balance >= amount.",
      },
      {
        title: "React State Architecture, CSRF Security & Rate Limiting",
        tag: "Frontend & Auth",
        detail: "HttpOnly session cookies, CSRF double-submit tokens, and optimistic UI reconciliation.",
        sampleQuestion: "Why shouldn't sensitive session tokens be stored in localStorage for a financial web app?",
        sampleAnswerKey: "Any XSS script can read localStorage. Use HttpOnly, SameSite=Lax/Strict, Secure cookies paired with an anti-CSRF header token.",
      },
    ],
  },
}

type CuratedRecruiterJob = {
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
    company: "RazorEdge FinTech Partner",
    location: "Bengaluru · Hybrid",
    workMode: "Hybrid",
    ctcRange: "₹6.5 – ₹9.5 LPA",
    trackSlug: "data-analytics",
    skills: ["SQL Joins & CTEs", "Cohort Retention", "Applied Statistics", "Executive Reporting"],
    matchPct: 94,
    postedAgo: "2 days ago",
    badge: "Direct Recruiter Shortlist",
  },
  {
    id: "job-ds-1",
    title: "Associate Data Scientist (Churn & Risk Modelling)",
    company: "CredPulse Analytics",
    location: "Bengaluru / Remote",
    workMode: "Remote",
    ctcRange: "₹8.0 – ₹13.0 LPA",
    trackSlug: "data-science-ai",
    skills: ["Applied Statistics", "Feature Engineering", "Python", "SQL", "Probability Calibration"],
    matchPct: 91,
    postedAgo: "1 day ago",
    badge: "Verified Dossier Preferred",
  },
  {
    id: "job-pm-1",
    title: "Associate Product Manager (B2B SaaS Workflows)",
    company: "HarborStack Cloud",
    location: "Gurugram / Hybrid",
    workMode: "Hybrid",
    ctcRange: "₹8.5 – ₹12.5 LPA",
    trackSlug: "product-management",
    skills: ["PRD Authoring", "Funnel Diagnostics", "RICE Prioritization", "User Research"],
    matchPct: 92,
    postedAgo: "3 days ago",
    badge: "Hiring Final-Year & Freshers",
  },
  {
    id: "job-py-1",
    title: "Python Data & Automation Engineer",
    company: "DataWeave Commerce",
    location: "Hyderabad · Hybrid",
    workMode: "Hybrid",
    ctcRange: "₹6.0 – ₹9.0 LPA",
    trackSlug: "python-programming",
    skills: ["Python 3", "ETL Pipelines", "Webhook Deduplication", "Automated Testing"],
    matchPct: 89,
    postedAgo: "2 days ago",
    badge: "Fast-Track Technical Round",
  },
  {
    id: "job-ai-1",
    title: "Applied AI & RAG Engineer",
    company: "NovaMind Enterprise AI",
    location: "Remote (India)",
    workMode: "Remote",
    ctcRange: "₹10.0 – ₹15.0 LPA",
    trackSlug: "generative-ai",
    skills: ["Grounded RAG", "Vector Retrieval", "LLM Evals", "Python & TypeScript"],
    matchPct: 90,
    postedAgo: "Today",
    badge: "High-Growth AI Partner",
  },
  {
    id: "job-fs-1",
    title: "Full-Stack Product Engineer (React, Node & Postgres)",
    company: "PayLedger Systems",
    location: "Pune / Bengaluru",
    workMode: "Hybrid",
    ctcRange: "₹7.5 – ₹12.0 LPA",
    trackSlug: "full-stack-web",
    skills: ["React & TypeScript", "Node & Express", "PostgreSQL ACID", "REST APIs"],
    matchPct: 93,
    postedAgo: "1 day ago",
    badge: "Direct Capstone Review",
  },
]

export default function CareerOSOverviewPage() {
  const { profile } = useCareerProfile()
  const [completeness] = useLoad<CareerCompleteness>(fetchProfileCompleteness)
  const [dashboard] = useLoad<ApiCourseWorkspace | null>(fetchLmsDashboard)
  const [enrollments] = useLoad<ApiEnrollmentSummary[]>(fetchLmsEnrollments)
  const [learnerProjects] = useLoad<ProjectSummary[]>(() => listLearnerProjects())
  const [careerProjects] = useLoad<CareerEvidenceSummary[]>(() => listCareerEvidenceProjects())
  const [certificates] = useLoad<SkylentCertificate[]>(() => fetchMyCertificates())
  const [jobs] = useLoad<JobListResult>(() => searchJobs())
  const [applications] = useLoad<JobApplication[]>(() => listApplications().catch(() => []))

  const [tierRefresh, setTierRefresh] = useState(0)
  const [activePillar, setActivePillar] = useState<"readiness" | "jobboard" | "portfolio">("readiness")
  const [selectedTrackSlug, setSelectedTrackSlug] = useState<string>("")
  const [revealedAnswerIdx, setRevealedAnswerIdx] = useState<number | null>(null)
  const [englishDrillIdx, setEnglishDrillIdx] = useState(0)
  const [appliedCuratedIds, setAppliedCuratedIds] = useState<Set<string>>(() => new Set())
  const [jobTrackFilter, setJobTrackFilter] = useState<string>("all")

  const workspace = dashboard.status === "ready" ? dashboard.data : null
  const enrolmentList = enrollments.status === "ready" ? enrollments.data : []
  const certList = certificates.status === "ready" ? certificates.data : []
  const projectList = learnerProjects.status === "ready" ? learnerProjects.data : []
  const linkedCareerList = careerProjects.status === "ready" ? careerProjects.data : []

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
  const activeTrackModule =
    TRACK_INTERVIEW_MODULES[activeTrackSlug] ?? TRACK_INTERVIEW_MODULES["data-analytics"]

  // Check if learner has any Data Science or Data Analytics course enrolled
  const enrolledInDsOrDa = courseValidities.some(
    (c) => c.slug === "data-analytics" || c.slug === "data-science-ai",
  )

  function handleUpgradeTier(slug: string, nextTier: SkylentTierId) {
    saveStoredCourseTier(slug, nextTier)
    setTierRefresh((v) => v + 1)
  }

  function handleActivateCareerOSWith3MExtension(course: CourseCareerOSValidity) {
    saveStoredCourseTier(course.slug, course.tier === "certificate" ? "professional" : course.tier, course.enrolledAt.toISOString(), true)
    setTierRefresh((v) => v + 1)
  }

  const completenessPct =
    completeness.status === "ready"
      ? completeness.data.percent
      : profile?.completeness?.percent ?? 75

  const SPOKEN_ENGLISH_DRILLS = [
    {
      title: "Drill 01: 60-Second Self-Introduction for Technical & Business Roles",
      prompt: "Structure your opening pitch without reciting your entire resume line-by-line.",
      framework: "Present (Your core track + verified capstone metric) → Past (How you built/validated it) → Future (Why this role & company fit your execution style).",
      example:
        "\"Hi, I'm a final-year analyst trained on SQL and cohort diagnostics. In my recent Northwind commercial audit, I isolated 14 invalid order rows and identified a 15% discount margin leak across ₹8.12L in sales. I'm excited to bring this same data-hygiene discipline to your revenue ops team.\"",
    },
    {
      title: "Drill 02: Explaining a Technical Mistake or Trade-Off (STAR Method)",
      prompt: "Answer 'Tell me about a time your analysis or code had an edge-case bug' with executive clarity.",
      framework: "Situation → Task → Action (What root-cause check you added) → Result (Measurable impact).",
      example:
        "\"When joining orders with return logs, my initial query overcounted revenue by 9% due to a 1-to-many join fan-out. I refactored the return aggregation into an order-grain CTE first, which restored 100% reconciliation with finance.\"",
    },
    {
      title: "Drill 03: Salary & Role Expectation Conversation in Simple, Confident English",
      prompt: "Respond professionally when a recruiter asks about your expected CTC and notice/joining timeline.",
      framework: "Express enthusiasm for the role → Anchor to market range & verified proof-of-work → Confirm immediate/graduation availability.",
      example:
        "\"Based on the responsibilities of this role and my verified capstone portfolio in SQL and analytics, I am looking at the ₹6.5–9.5 LPA range, and I am available to join immediately upon graduation.\"",
    },
  ]

  const dbJobs = jobs.status === "ready" ? jobs.data.jobs : []
  const filteredCuratedJobs = CURATED_RECRUITER_JOBS.filter(
    (j) => jobTrackFilter === "all" || j.trackSlug === jobTrackFilter,
  )

  return (
    <div className="cosh" style={{ display: "grid", gap: 22 }}>
      {/* 1. Top Hero & Smart Multi-Course Career OS Validity Engine */}
      <section
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 58%, #3b2d96 100%)",
          color: "#ffffff",
          borderRadius: 18,
          padding: "24px clamp(18px, 3vw, 30px)",
          boxShadow: "0 16px 38px -18px rgba(15, 23, 42, 0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 18,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#5142b5",
                  color: "#ffffff",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                SKYLENT CAREER OS · ZERO-TO-HERO PLACEMENT ENGINE
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(52, 211, 153, 0.35)",
                }}
              >
                Smart Rule: 60% Within 6 Months → +3 Months Intensive Practice Extension
              </span>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(22px, 2.6vw, 28px)", color: "#ffffff", fontFamily: "var(--font-display)" }}>
              {profile?.preferredRole?.trim() ? `Target Role: ${profile.preferredRole}` : "Your Smart Career Readiness & Recruiter Hub"}
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: "#cbd5e1", lineHeight: 1.55 }}>
              Career OS is included with <strong>Tier 2 (Professional)</strong> &amp; <strong>Tier 3 (Flagship Live)</strong> courses. Complete <strong>60% of your course within its 6-Month Active Window</strong> to unlock Career OS enrolment and earn <strong>+3 Months of Extra Intensive Interview &amp; Placement Practice</strong>!
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              to="/career-os/profile"
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.24)",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Profile Readiness ({completenessPct}%) →
            </Link>
            <Link
              to="/career-os/interviews"
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                background: "#10b981",
                color: "#064e3b",
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Mock Interview Room →
            </Link>
          </div>
        </div>

        {/* Multi-Course Smart Validity Cards (Supports 1, 2, or more courses simultaneously!) */}
        {courseValidities.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 14,
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong style={{ fontSize: 15, color: "#ffffff", display: "block" }}>
                No Active Course Enrolled Yet
              </strong>
              <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                Enrol in any Professional (Tier 2) or Flagship Live (Tier 3) course to activate your 6-Month Career OS Window.
              </span>
            </div>
            <Link
              to="/dashboard/student#explore-programmes"
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                background: "#ffffff",
                color: "#1e1b4b",
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Explore Programmes →
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: 14,
            }}
          >
            {courseValidities.map((cv) => {
              const isSelectedTrack = activeTrackSlug === cv.slug
              return (
                <div
                  key={cv.slug}
                  style={{
                    background: isSelectedTrack ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)",
                    border: isSelectedTrack
                      ? "1.5px solid #a78bfa"
                      : "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "3px 9px",
                          borderRadius: 999,
                          background: cv.includesCareerOS ? "#dcfce7" : "#fef3c7",
                          color: cv.includesCareerOS ? "#166534" : "#92400e",
                        }}
                      >
                        {cv.tierLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedTrackSlug(cv.slug)}
                        style={{
                          background: isSelectedTrack ? "#5142b5" : "rgba(255,255,255,0.12)",
                          border: "1px solid rgba(255,255,255,0.25)",
                          color: "#ffffff",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        {isSelectedTrack ? "● Active Track in Studio" : "Switch Studio to Track"}
                      </button>
                    </div>

                    <strong style={{ fontSize: 16, color: "#ffffff", display: "block", marginBottom: 4 }}>
                      {cv.title}
                    </strong>

                    {/* 6-Month Window + +3M Extension Dates */}
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#e2e8f0", marginBottom: 10 }}>
                      <span>
                        📅 <strong>6M Course Window:</strong> Until {formatDate(cv.courseEndDate)} ({cv.daysRemainingInCourseWindow}d left)
                      </span>
                      {cv.status === "unlocked_with_3m_extension" ? (
                        <span style={{ color: "#6ee7b7", fontWeight: 700 }}>
                          🚀 <strong>+3M Intensive Practice Active:</strong> Until {formatDate(cv.practiceExtensionEndDate)}
                        </span>
                      ) : (
                        <span style={{ color: "#cbd5e1" }}>
                          🎯 <strong>+3M Extension Unlock:</strong> {formatDate(cv.practiceExtensionEndDate)} (at 60%)
                        </span>
                      )}
                    </div>

                    {/* Progress Toward 60% Gate */}
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span>
                          Course Completion: <strong>{cv.progressPct}%</strong> ({cv.completedLessons}/{cv.totalLessons} lessons)
                        </span>
                        <span style={{ color: cv.meets60PctRule ? "#6ee7b7" : "#fde68a", fontWeight: 700 }}>
                          {cv.meets60PctRule ? "✓ 60% Gate Passed" : `${Math.max(0, 60 - cv.progressPct)}% more needed for 60% Gate`}
                        </span>
                      </div>
                      <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.18)", overflow: "hidden", position: "relative" }}>
                        <div
                          style={{
                            width: `${cv.progressPct}%`,
                            height: "100%",
                            background: cv.meets60PctRule ? "#10b981" : "#a78bfa",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Footer per Course Based on Smart Rule */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.14)" }}>
                    {cv.status === "tier_locked" ? (
                      <>
                        <span style={{ fontSize: 11.5, color: "#fde68a" }}>
                          Tier 1 (Certificate Plan) does not include Career OS.
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpgradeTier(cv.slug, "professional")}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "none",
                            background: "#f59e0b",
                            color: "#0f172a",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          Upgrade to Tier 2 (Unlock Career OS) →
                        </button>
                      </>
                    ) : cv.status === "expired_missed_gate" ? (
                      <span style={{ fontSize: 12, color: "#fca5a5", fontWeight: 700 }}>
                        ✕ 6-Month Window Ended Before 60% Completion — Career OS Access Expired
                      </span>
                    ) : cv.status === "unlocked_with_3m_extension" ? (
                      <span style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 700 }}>
                        ✓ Enrolled in Career OS · +3 Months Intensive Practice Unlocked (Valid till {formatDate(cv.practiceExtensionEndDate)})
                      </span>
                    ) : cv.status === "ready_to_enrol_plus_3m" ? (
                      <button
                        type="button"
                        onClick={() => handleActivateCareerOSWith3MExtension(cv)}
                        style={{
                          width: "100%",
                          padding: "9px 14px",
                          borderRadius: 8,
                          border: "none",
                          background: "#10b981",
                          color: "#064e3b",
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        🎉 60% Reached Within 6M! Enrol in Career OS (+3 Months Extra Practice) →
                      </button>
                    ) : (
                      <>
                        <span style={{ fontSize: 11.5, color: "#cbd5e1" }}>
                          Reach <strong>60% before {formatDate(cv.courseEndDate)}</strong> to claim +3M Practice.
                        </span>
                        <Link
                          to={`/learn/${cv.slug}`}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "#ffffff",
                            color: "#1e1b4b",
                            fontSize: 12,
                            fontWeight: 800,
                            textDecoration: "none",
                          }}
                        >
                          Continue Course ({cv.progressPct}%) →
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 2. Zero-to-Hero 5-Stage Visual Roadmap Strip */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              ZERO-TO-HERO PLACEMENT JOURNEY
            </span>
            <h2 style={{ margin: "2px 0 0", fontSize: 18, color: "#0f172a" }}>
              How You Go From Classroom Learner to Recruiter Shortlist
            </h2>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "readiness" as const, label: "1. Zero-to-Hero Prep Studio" },
              { id: "jobboard" as const, label: `2. Recruiter Job Board (${CURATED_RECRUITER_JOBS.length + dbJobs.length} Roles)` },
              { id: "portfolio" as const, label: "3. Verified Certificates & Projects" },
            ].map((tab) => {
              const active = activePillar === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePillar(tab.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: active ? "1.5px solid #5142b5" : "1px solid #cbd5e1",
                    background: active ? "#5142b5" : "#ffffff",
                    color: active ? "#ffffff" : "#334155",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: 10,
          }}
        >
          {[
            {
              step: "Stage 01",
              title: "60% Within 6 Months",
              desc: "Complete 60% of your course before month 6 to unlock +3M intensive practice.",
              done: courseValidities.some((c) => c.meets60PctRule),
            },
            {
              step: "Stage 02",
              title: activeTrackModule.includesStatistics ? "Interview + Statistics & SQL" : "Track Technical Defense",
              desc: activeTrackModule.includesStatistics
                ? "Applied Statistics, Probability & SQL case drills (for DS & DA tracks)."
                : `Role-specific technical & architecture defense for ${activeTrackModule.trackName}.`,
              done: true,
            },
            {
              step: "Stage 03",
              title: "Spoken English & HR Pitch",
              desc: "60-sec intro, STAR behavioral storyboarding & fluent workplace communication.",
              done: true,
            },
            {
              step: "Stage 04",
              title: "Certificate, Resume & LinkedIn",
              desc: "ATS resume optimization, LinkedIn headline makeover & verified SKL credential.",
              done: certList.length > 0 || completenessPct >= 80,
            },
            {
              step: "Stage 05",
              title: "Recruiter Job Board",
              desc: "Apply directly to partner openings with your verified Proof-of-Work Dossier.",
              done: (applications.status === "ready" && applications.data.length > 0) || appliedCuratedIds.size > 0,
            },
          ].map((st) => (
            <div
              key={st.step}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: st.done ? "1.5px solid #c4b5fd" : "1px solid #e2e8f0",
                background: st.done ? "#f5f3ff" : "#f8fafc",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase" }}>{st.step}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: st.done ? "#059669" : "#64748b" }}>
                  {st.done ? "✓ Ready" : "In Progress"}
                </span>
              </div>
              <strong style={{ fontSize: 13.5, color: "#0f172a", display: "block", marginBottom: 3 }}>{st.title}</strong>
              <span style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.45, display: "block" }}>{st.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PILLAR 1: ZERO-TO-HERO CAREER READINESS STUDIO */}
      {activePillar === "readiness" ? (
        <div style={{ display: "grid", gap: 20 }}>
          {/* Track Switcher + Track-Specific Technical & Statistics Interview Prep */}
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "22px 24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    MODULE 1 · TRACK-SPECIFIC TECHNICAL INTERVIEW PREP
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 9px",
                      borderRadius: 999,
                      background: activeTrackModule.includesStatistics ? "#dcfce7" : "#f1f5f9",
                      color: activeTrackModule.includesStatistics ? "#166534" : "#334155",
                    }}
                  >
                    {activeTrackModule.badge}
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>{activeTrackModule.headline}</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                  {activeTrackModule.includesStatistics
                    ? "Applied Statistics & Probability is automatically included because this track is Data Analytics / Data Science."
                    : enrolledInDsOrDa
                      ? "Viewing non-DS/DA track module (Switch to your Data Analytics / Data Science course tab on the right for Applied Statistics)."
                      : "Tailored specifically to your enrolled track — Statistics is only shown for Data Science & Data Analytics learners."}
                </p>
              </div>

              {/* Track Selector Pills */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Object.values(TRACK_INTERVIEW_MODULES).map((tm) => {
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
                      {tm.trackName.split("&")[0].trim()}
                      {tm.includesStatistics ? " (+Stats)" : ""}
                    </button>
                  )
                })}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: 14,
              }}
            >
              {activeTrackModule.topics.map((topic, idx) => {
                const revealed = revealedAnswerIdx === idx
                return (
                  <article
                    key={topic.title}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 14,
                      padding: "16px 18px",
                      background: "#f8fafc",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: topic.tag.includes("Statistics") ? "#dcfce7" : "#ede9fe",
                          color: topic.tag.includes("Statistics") ? "#166534" : "#5142b5",
                          display: "inline-block",
                          marginBottom: 8,
                        }}
                      >
                        {topic.tag}
                      </span>
                      <h3 style={{ margin: "0 0 6px", fontSize: 15.5, color: "#0f172a" }}>{topic.title}</h3>
                      <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>{topic.detail}</p>
                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          fontSize: 12.5,
                          color: "#0f172a",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong style={{ color: "#5142b5", display: "block", marginBottom: 3 }}>
                          Mock Interview Question:
                        </strong>
                        {topic.sampleQuestion}
                      </div>
                      {revealed ? (
                        <div
                          style={{
                            marginTop: 8,
                            padding: "10px 12px",
                            borderRadius: 10,
                            background: "#ecfdf5",
                            border: "1px solid #a7f3d0",
                            fontSize: 12.5,
                            color: "#065f46",
                            lineHeight: 1.5,
                          }}
                        >
                          <strong style={{ display: "block", marginBottom: 2 }}>✓ Winning Interview Answer Structure:</strong>
                          {topic.sampleAnswerKey}
                        </div>
                      ) : null}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setRevealedAnswerIdx(revealed ? null : idx)}
                        style={{
                          padding: "7px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#334155",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {revealed ? "Hide Model Answer" : "Reveal Model Answer"}
                      </button>
                      <Link
                        to={`/career-os/interviews?track=${encodeURIComponent(activeTrackSlug)}`}
                        style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", textDecoration: "none" }}
                      >
                        Practice Live →
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* Module 2: Spoken English, Communication Fluency & HR Storyboarding + Module 3: Certificate, Resume & LinkedIn */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
              gap: 20,
            }}
          >
            {/* Spoken English & Executive Communication Studio */}
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  MODULE 2 · SPOKEN ENGLISH &amp; WORKPLACE FLUENCY
                </span>
                <h2 style={{ margin: "4px 0 6px", fontSize: 19, color: "#0f172a" }}>
                  Spoken English, STAR Answers &amp; Confident Interview Pitch
                </h2>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                  Even strong coders and analysts lose offers if they hesitate while explaining their work. Practice these 3 spoken English scripts aloud before your HR &amp; hiring manager rounds:
                </p>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {SPOKEN_ENGLISH_DRILLS.map((drill, idx) => (
                    <button
                      key={drill.title}
                      type="button"
                      onClick={() => setEnglishDrillIdx(idx)}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 8,
                        border: englishDrillIdx === idx ? "1.5px solid #059669" : "1px solid #cbd5e1",
                        background: englishDrillIdx === idx ? "#ecfdf5" : "#ffffff",
                        color: englishDrillIdx === idx ? "#065f46" : "#475569",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Drill 0{idx + 1}
                    </button>
                  ))}
                </div>

                {(() => {
                  const drill = SPOKEN_ENGLISH_DRILLS[englishDrillIdx] ?? SPOKEN_ENGLISH_DRILLS[0]
                  return (
                    <div
                      style={{
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>{drill.title}</strong>
                      <span style={{ fontSize: 12.5, color: "#475569" }}>{drill.prompt}</span>
                      <div style={{ fontSize: 12, color: "#5142b5", fontWeight: 700 }}>
                        Framework: {drill.framework}
                      </div>
                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          background: "#ffffff",
                          borderLeft: "3px solid #059669",
                          fontSize: 12.5,
                          color: "#1e293b",
                          fontStyle: "italic",
                          lineHeight: 1.55,
                        }}
                      >
                        {drill.example}
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Includes grammar clarity, filler-word reduction &amp; salary negotiation scripts
                </span>
                <Link to="/career-os/interviews" style={{ fontSize: 12.5, fontWeight: 700, color: "#059669", textDecoration: "none" }}>
                  Start Spoken Mock →
                </Link>
              </div>
            </section>

            {/* Certificate, ATS Resume & LinkedIn Makeover Studio */}
            <section
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  MODULE 3 · CERTIFICATE, ATS RESUME &amp; LINKEDIN MAKEOVER
                </span>
                <h2 style={{ margin: "4px 0 6px", fontSize: 19, color: "#0f172a" }}>
                  Build a Proof-Backed Profile Recruiters Actually Shortlist
                </h2>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                  Turn your completed Skylent lessons, SQL/Python labs, and capstones into an ATS-friendly resume and high-conversion LinkedIn profile:
                </p>

                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    {
                      title: "1. ATS Resume & Proof-of-Work Bullet Generator",
                      status: completenessPct >= 80 ? "✓ Ready" : `${completenessPct}% Complete`,
                      detail: "Replace generic 'familiar with SQL/Python' lines with verified metric bullets from your Capstone Studio.",
                      href: "/career-os/profile",
                      cta: "Edit Resume & Profile →",
                    },
                    {
                      title: "2. LinkedIn Headline, About & Featured Dossier Setup",
                      status: "✓ Template Ready",
                      detail: "Pin your public /verify/:code Proof-of-Work Dossier in your LinkedIn Featured section so recruiters can verify your work in 1 click.",
                      href: "/career-os/projects",
                      cta: "Link Capstone Projects →",
                    },
                    {
                      title: "3. Verifiable SKL Certificate & Credential Ledger",
                      status: certList.length > 0 ? `✓ ${certList.length} Issued` : "Unlock at 100%",
                      detail: "Every Skylent certificate carries a cryptographic verification URL (/verify) with your graded capstone summary.",
                      href: "/dashboard/student#student-evidence",
                      cta: "View Certificates →",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <strong style={{ fontSize: 13.5, color: "#0f172a" }}>{item.title}</strong>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "#ede9fe", color: "#5142b5" }}>
                            {item.status}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>{item.detail}</span>
                      </div>
                      <Link
                        to={item.href}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#5142b5",
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.cta}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Need a mentor review of your resume or LinkedIn?
                </span>
                <Link to="/career-os/support" style={{ fontSize: 12.5, fontWeight: 700, color: "#5142b5", textDecoration: "none" }}>
                  Request Mentor Review →
                </Link>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {/* PILLAR 2: SKYLENT RECRUITER JOB BOARD (Embedded right inside Career OS Overview AND /career-os/jobs) */}
      {(activePillar === "jobboard" || activePillar === "readiness") ? (
        <section
          id="career-os-job-board"
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: "22px 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                PILLAR 2 · SKYLENT RECRUITER JOB BOARD &amp; DIRECT SHORTLISTS
              </span>
              <h2 style={{ margin: "4px 0 0", fontSize: 20, color: "#0f172a" }}>
                Verified Recruiter Openings Matched to Your Track
              </h2>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { id: "all", label: "All Tracks" },
                { id: "data-analytics", label: "Data Analytics" },
                { id: "data-science-ai", label: "Data Science" },
                { id: "product-management", label: "Product Mgmt" },
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
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: active ? "1.5px solid #5142b5" : "1px solid #cbd5e1",
                      background: active ? "#5142b5" : "#ffffff",
                      color: active ? "#ffffff" : "#334155",
                      fontSize: 12,
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
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
              gap: 16,
            }}
          >
            {filteredCuratedJobs.map((job) => {
              const applied = appliedCuratedIds.has(job.id)
              return (
                <article
                  key={job.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    padding: "16px 18px",
                    background: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 12,
                    boxShadow: "0 6px 18px -12px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "#dcfce7",
                          color: "#166534",
                        }}
                      >
                        {job.matchPct}% Skill Match
                      </span>
                      <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{job.postedAgo}</span>
                    </div>

                    <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#0f172a" }}>{job.title}</h3>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                      {job.company} · {job.location}
                    </div>

                    <div style={{ display: "flex", gap: 10, fontSize: 12.5, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
                      <span style={{ color: "#5142b5" }}>💰 {job.ctcRange}</span>
                      <span>·</span>
                      <span>🏢 {job.workMode}</span>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {job.skills.map((s) => (
                        <span
                          key={s}
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "#f1f5f9",
                            color: "#334155",
                            fontWeight: 600,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>{job.badge}</span>
                    {applied ? (
                      <span
                        style={{
                          padding: "7px 12px",
                          borderRadius: 8,
                          background: "#ecfdf5",
                          color: "#047857",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        ✓ Dossier Sent to Recruiter
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCuratedIds((prev) => new Set(prev).add(job.id))
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          border: "none",
                          background: "#5142b5",
                          color: "#ffffff",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Apply with Dossier →
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: 12.5, color: "#64748b" }}>
              Want to filter by city, work mode, or manage saved applications?
            </span>
            <Link
              to="/career-os/jobs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                color: "#5142b5",
                textDecoration: "none",
              }}
            >
              Open Full Job Board &amp; Filters <ArrowRight />
            </Link>
          </div>
        </section>
      ) : null}

      {/* PILLAR 3: VERIFIED PORTFOLIO PROJECTS & CERTIFICATES LEDGER */}
      {activePillar === "portfolio" || projectList.length > 0 || certList.length > 0 ? (
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: "22px 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                VERIFIED PROOF-OF-WORK PORTFOLIO
              </span>
              <h2 style={{ margin: "2px 0 0", fontSize: 19, color: "#0f172a" }}>
                Your Capstone Projects &amp; Verifiable Certificates
              </h2>
            </div>
            <Link to="/career-os/projects" style={{ fontSize: 13, fontWeight: 700, color: "#5142b5", textDecoration: "none" }}>
              Manage All Projects →
            </Link>
          </div>

          {projectList.length === 0 && certList.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13.5, color: "#64748b" }}>
              Complete your course capstone tasks and lessons to populate your verified recruiter dossier.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {projectList.map((project) => {
                const linked = linkedCareerList.find((item) => item.projectType === project.projectType)
                return (
                  <div
                    key={project.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 14.5, color: "#0f172a", display: "block" }}>{project.title}</strong>
                      <span style={{ fontSize: 12.5, color: "#64748b" }}>
                        {projectStatusLabel(project.status)} · {project.progress.complete} of {project.progress.total} milestones complete
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Link
                        to={learnerProjectPath(project.courseSlug, project.projectType)}
                        style={{
                          padding: "7px 12px",
                          borderRadius: 8,
                          background: "#5142b5",
                          color: "#ffffff",
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        Open Project Studio →
                      </Link>
                      {linked ? (
                        <Link to={linked.href} style={{ fontSize: 12, fontWeight: 700, color: "#5142b5", textDecoration: "none" }}>
                          View Record
                        </Link>
                      ) : null}
                    </div>
                  </div>
                )
              })}

              {certList.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 14.5, color: "#0f172a", display: "block" }}>
                      {cert.courseTitle} · Verified Certificate ({cert.code})
                    </strong>
                    <span style={{ fontSize: 12.5, color: "#64748b" }}>
                      Issued {formatDate(cert.issuedAt)} · Publicly verifiable on /verify/{cert.code}
                    </span>
                  </div>
                  <Link
                    to={`/verify/${cert.code}`}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      color: "#0f172a",
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Verify Dossier →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}
