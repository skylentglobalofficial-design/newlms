import { computeLearnerExecutionStreak } from '../lib/execution-streak'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { AuthDashboardShell } from '../components/AuthDashboardShell'
import { LEARNER_NAV, LearnerNavIcon, learnerNavId } from '../components/learner/learner-nav'
import { useAuth } from '../context/AuthContext'
import { isCapstoneLesson, learnerErrorMessage, lessonTypeLabel } from '../components/lms/lms-utils'
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

/**
 * The name printed on certificates. A certificate needs a full name, so a learner who signed up with one
 * word (or whose Google name is one word) can fix it here. Saves through PATCH /auth/me.
 */
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

/** A list the page loads beside the dashboard. `null` data with an error means it could not be loaded. */
type Loaded<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error' }

type AiAvailability = 'checking' | 'available' | 'unavailable' | 'unknown'

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

/** The backend's own enrolment status, shown as it is stored. */
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

export default function DashboardStudentPage() {
  const { user, ready } = useAuth()
  const { workspace, course, loading, error, reload } = useLmsDashboard()
  const navigate = useNavigate()
  const { pathname, hash } = useLocation()
  const activeNav = learnerNavId(pathname, hash)
  const previousHash = useRef(hash)
  const [enrollments, setEnrollments] = useState<Loaded<ApiEnrollmentSummary[]>>({ status: 'loading' })
  const [projects, setProjects] = useState<Loaded<ProjectSummary[]>>({ status: 'loading' })
  const [certificates, setCertificates] = useState<Loaded<SkylentCertificate[]>>({ status: 'loading' })
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<{ slug: string; message: string } | null>(null)
  const [aiStatus, setAiStatus] = useState<AiAvailability>('checking')
  const [listsKey, setListsKey] = useState(0)

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  useEffect(() => {
    const sectionId = hash === '#sh-my-learning' || hash === '#student-projects' ? hash.slice(1) : ''
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (sectionId) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    } else if (previousHash.current === '#sh-my-learning' || previousHash.current === '#student-projects') {
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

  // Skylent AI: GET /lms/ai/status says whether the server has a provider configured.
  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    void fetchSkylentAiStatus(controller.signal)
      .then((status) => { if (!controller.signal.aborted) setAiStatus(status.available ? 'available' : 'unavailable') })
      .catch(() => { if (!controller.signal.aborted) setAiStatus('unknown') })
    return () => controller.abort()
  }, [user])

  async function claimCertificate(courseSlug: string) {
    setClaiming(courseSlug)
    setClaimError(null)
    try {
      const issued = await issueCertificate(courseSlug)
      // The certificate code is the only key the server sends.
      setCertificates((current) => ({
        status: 'ready',
        data: [issued, ...(current.status === 'ready' ? current.data.filter((item) => item.code !== issued.code) : [])],
      }))
    } catch (err) {
      // A 403 or 400 carries the server's own sentence ("Complete every lesson first.",
      // "Add your full name before a certificate can be issued."). Transport noise is never shown.
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
    themeId: 'data-science' as const,
    workspace: 'learning' as const,
    workspaceLabel: 'My Courses',
    roleLabel: 'Learner',
    navItems: LEARNER_NAV,
    bottomNavItems: LEARNER_NAV,
    activeNav,
    onNavChange: () => undefined,
    renderNavIcon: (id: string) => <LearnerNavIcon id={id} />,
    bar: (
      <>
        <span className="sh-crumb">My Courses <span aria-hidden="true">/</span> <b>Home</b></span>
        <ProductSlice steps={SLICE} current="Learn" label="Where this screen sits in the product model" />
      </>
    ),
  }

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

  /* ── Sections shared by the loaded and the empty state ── */

  const myLearning = (
    <section className="sh-card" aria-labelledby="sh-my-learning">
      <header className="sh-card-head">
        <h2 id="sh-my-learning">My learning</h2>
        {enrollments.status === 'ready' ? (
          <span className="sh-note">{myCourseRows(enrollments.data).length} {myCourseRows(enrollments.data).length === 1 ? 'course' : 'courses'}</span>
        ) : null}
      </header>
      {enrollments.status === 'loading' ? (
        <div className="sh-row"><span className="os-skeleton" style={{ width: '60%' }} /></div>
      ) : enrollments.status === 'error' ? (
        <ListError what="Your enrolments" onRetry={retryLists} />
      ) : myCourseRows(enrollments.data).length === 0 ? (
        <p className="sh-empty">You are not enrolled in anything yet. <Link className="os-link" to="/programmes">Browse programmes</Link></p>
      ) : (
        <ul className="sh-rows">
          {myCourseRows(enrollments.data).map((item) => {
            const title = item.title
            const progress = item.progressPct == null || item.completedCount == null || item.totalLessons == null
              ? null
              : { progressPct: item.progressPct, completedCount: item.completedCount, totalLessons: item.totalLessons }
            const openHref = canOpenEnrollment(item.status) && item.slug ? `/learn/${item.slug}` : null
            const note = progress
              ? `${item.programmeName ? `${item.programmeName} · ` : ''}${progress.completedCount} of ${progress.totalLessons} lessons`
              : `Enrolled ${formatDate(item.createdAt)}`
            return (
              <li key={item.key} className="sh-row">
                <div className="sh-row-main">
                  <strong>{title}</strong>
                  <span className="sh-note">{note}</span>
                  {progress ? (
                    <div className="os-progress-bar sh-row-bar" role="progressbar" aria-label={`${title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.progressPct}>
                      <span style={{ width: `${progress.progressPct}%` }} />
                    </div>
                  ) : null}
                </div>
                <span className={item.status === 'completed' ? 'os-status is-done' : 'os-status'}>{enrolmentStatusLabel(item.status)}</span>
                {openHref ? (
                  <Link className="os-link sh-row-link" to={openHref} aria-label={`Continue ${title}`}>
                    {progress && progress.completedCount > 0 && progress.completedCount < progress.totalLessons ? 'Resume' : 'Open'} <ArrowRight />
                  </Link>
                ) : null}
              </li>
            )
          })}
        </ul>
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
        !certificateRows.some((cert) => cert.code.includes('-PRG-') && cert.courseTitle === (item.programName ?? item.programSlug))
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
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/verify/' + cert.code : 'https://skylent.live/verify/' + cert.code)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="os-link"
                        style={{ fontSize: 12 }}
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
            <p className="sh-empty">No certificates yet. You can claim one when every lesson in a course is complete.</p>
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
      <p className="sh-body">Career OS holds your profile, your projects and your applications. Work you finish here is added there by you, not automatically.</p>
      <p className="sh-foot"><Link className="os-link" to="/career-os">Open Career OS <ArrowRight /></Link></p>
    </section>
  )

  
  const projectRows = projects.status === 'ready' ? projects.data : []
  const currentProject = course ? findProjectForCourse(projectRows, course.slug) : null

  const activityTimestamps = [
    ...enrolmentRows.map((e) => e.createdAt),
    ...projectRows.map((p) => p.updatedAt),
    ...certificateRows.map((c) => c.issuedAt),
    ...(workspace && workspace.progress && workspace.progress.completedCount > 0 ? [new Date().toISOString()] : []),
  ]
  const executionStreak = computeLearnerExecutionStreak(activityTimestamps)


  /* ── Empty learner: no primary enrolment workspace ── */

  if (!course || !workspace) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="sh" id="student-learning">
          <p className="os-eyebrow">My Courses</p>
          <h1>Start with a course</h1>
          <section className="sh-card" aria-label="Elixir wallet"><ElixirWalletPanel /></section>
        
        <div className="sh-card sh-streak" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }} aria-hidden="true">🔥</span>
            <div>
              <strong style={{ fontSize: 16 }}>{executionStreak.currentStreakDays}-Day Execution Streak</strong>
              <span style={{ fontSize: 12, display: "block", color: "var(--skylent-muted, #71717a)" }}>
                {executionStreak.streakBonusElixir > 0
                  ? `+${executionStreak.streakBonusElixir} Elixir Momentum Bonus active · Longest streak: ${executionStreak.longestStreakDays} days`
                  : `Complete an action today to start your momentum streak · Longest: ${executionStreak.longestStreakDays} days`}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 12, textAlign: "right" }}>
              <strong>Weekly Goal</strong>: {executionStreak.weeklyActionsCount} / 5 actions
            </div>
            <div style={{ display: "flex", gap: 3 }} aria-label="14-Day Activity Heatmap">
              {executionStreak.activityHeatmap.map((p) => (
                <span
                  key={p.date}
                  title={`${p.date}: ${p.count} actions`}
                  style={{
                    width: 8,
                    height: 18,
                    borderRadius: 2,
                    background: p.active ? "#16a34a" : "var(--skylent-line, #e4e4e7)",
                    display: "inline-block",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

          


          <div className="sh-next">
            <p className="sh-next-label"><span aria-hidden="true" />Next step</p>
            <h2>Choose what to learn first</h2>
            <p className="sh-body">You are signed in and have no lessons open yet. Pick a course and its first lesson opens here.</p>
            <div className="os-actions">
              <Link className="os-btn os-btn-primary os-btn-lg" to="/programmes">Explore programmes <ArrowRight /></Link>
            </div>
          </div>
          {enrolmentRows.length > 0 ? <div className="sh-stack">{myLearning}<CareerRiseCard />{evidence}</div> : null}
        </div>
      </AuthDashboardShell>
    )
  }

  /* ── Loaded ── */

  const allLessons = course.modules.flatMap((module) => module.lessons)
  const resume = workspace.resume
  const resumeLesson = allLessons.find((lesson) => lesson.id === resume.lessonId) ?? null
  const resumeNumber = resumeLesson ? allLessons.findIndex((lesson) => lesson.id === resumeLesson.id) + 1 : 0
  const { completedCount, totalLessons, progressPct, allComplete } = workspace.progress
  const resumeHref = resume.lessonId ? `/learn/${course.slug}/${resume.lessonId}` : `/learn/${course.slug}`
  const resumeStarted = Boolean(resume.lessonId && workspace.lessonStates[resume.lessonId]?.started)
  const profile = courseProductProfile(course.slug)

  // Needs attention: opened checks and assignments that are not complete, across every enrolment.
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

  return (
    <AuthDashboardShell {...shell}>
      <div className="sh">
        <p className="os-eyebrow">My Courses</p>
        <h1>What to do next</h1>
        <section className="sh-card" aria-label="Elixir wallet"><ElixirWalletPanel /></section>
        
        <div className="sh-card sh-streak" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }} aria-hidden="true">🔥</span>
            <div>
              <strong style={{ fontSize: 16 }}>{executionStreak.currentStreakDays}-Day Execution Streak</strong>
              <span style={{ fontSize: 12, display: "block", color: "var(--skylent-muted, #71717a)" }}>
                {executionStreak.streakBonusElixir > 0
                  ? `+${executionStreak.streakBonusElixir} Elixir Momentum Bonus active · Longest streak: ${executionStreak.longestStreakDays} days`
                  : `Complete an action today to start your momentum streak · Longest: ${executionStreak.longestStreakDays} days`}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 12, textAlign: "right" }}>
              <strong>Weekly Goal</strong>: {executionStreak.weeklyActionsCount} / 5 actions
            </div>
            <div style={{ display: "flex", gap: 3 }} aria-label="14-Day Activity Heatmap">
              {executionStreak.activityHeatmap.map((p) => (
                <span
                  key={p.date}
                  title={`${p.date}: ${p.count} actions`}
                  style={{
                    width: 8,
                    height: 18,
                    borderRadius: 2,
                    background: p.active ? "#16a34a" : "var(--skylent-line, #e4e4e7)",
                    display: "inline-block",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <ul className="sh-facts">
          <li>
            {enrollments.status === 'ready' ? (
              <><strong>{enrolmentRows.length}</strong> {enrolmentRows.length === 1 ? 'enrolment' : 'enrolments'}</>
            ) : enrollments.status === 'error' ? (
              'Enrolments could not be loaded'
            ) : (
              'Enrolments loading'
            )}
          </li>
          <li><strong>{completedCount}</strong> of {totalLessons} lessons complete in {course.title}</li>
          <li>
            {certificates.status === 'ready' && (claimable.length > 0 || claimableProgrammes.length > 0)
              ? 'A certificate can be claimed below'
              : allComplete
                ? 'Every lesson in this course is complete'
                : completedCount > 0 || resumeStarted
                  ? 'Resume is the current lesson'
                  : 'The first lesson is ready to start'}
          </li>
        </ul>

        <div className="sh-grid">
          <div className="sh-stack">
            <section className="sh-next" id="student-learning" aria-labelledby="sh-continue">
              <p className="sh-next-label">
                <span aria-hidden="true" />
                {allComplete ? 'Course complete' : 'Continue learning'}
                {allComplete ? (
                  <em>{course.title}</em>
                ) : (
                  <em>
                    {course.title} · M{resume.moduleIndex}
                    {resumeLesson ? ` · ${lessonTypeLabel(resumeLesson.type, resumeLesson.title)}` : ''}
                    {resumeLesson?.duration ? ` · ${resumeLesson.duration}` : ''}
                  </em>
                )}
              </p>
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
                  : `Module ${resume.moduleIndex} of ${resume.moduleTotal} · ${resume.moduleTitle}${resume.nextLessonTitle ? `. Next: ${resume.nextLessonTitle}` : ''}`}
              </p>
              {workspace.program ? (
                <p className="sh-note sh-programme">
                  Part of {workspace.program.name} · {workspace.program.progress.completedCourses} of {workspace.program.progress.totalCourses} courses complete
                </p>
              ) : null}
              <div className="sh-progress">
                <span className="sh-note">{completedCount} of {totalLessons} lessons complete</span>
                <div className="os-progress-bar" role="progressbar" aria-label={`${course.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct}>
                  <span style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              <div className="os-actions">
                {allComplete ? (
                  <Link className="os-btn os-btn-ghost" to={`/learn/${course.slug}`}>Review the course</Link>
                ) : (
                  <Link className="os-btn os-btn-primary os-btn-lg" to={resumeHref}>
                    {resumeStarted || completedCount > 0 ? 'Continue learning' : 'Start learning'} <ArrowRight />
                  </Link>
                )}
              </div>
            </section>

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

            {myLearning}
            <CareerRiseCard />

            <section className="sh-card" id="student-projects" aria-labelledby="sh-project">
              <header className="sh-card-head">
                <h2 id="sh-project">Current project</h2>
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
                    Open <ArrowRight />
                  </Link>
                </div>
              ) : profile?.project ? (
                <div className="sh-row">
                  <div className="sh-row-main">
                    <strong>Not started</strong>
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
                        <strong>Northwind Lab</strong>
                        <span className="sh-note">{environment.honesty}</span>
                      </div>
                      <Link className="os-link sh-row-link" to={sqlLabHref}>
                        Open <ArrowRight />
                      </Link>
                    </div>
                  )
                }
                if (environment?.status === "written") {
                  return (
                    <div className="sh-row" id="student-practice">
                      <div className="sh-row-main">
                        <strong>Harbor Desk</strong>
                        <span className="sh-note">{environment.honesty}</span>
                      </div>
                      <Link className="os-link sh-row-link" to={environment.href}>
                        Open <ArrowRight />
                      </Link>
                    </div>
                  )
                }
                return <span id="student-practice" />
              })()}
            </section>
          </div>

          <div className="sh-stack">
            {evidence}
            {career}
            <section className="sh-card sh-ai" aria-labelledby="sh-ai">
              <header className="sh-ai-head">
                <AiMark />
                {aiStatus === 'available' ? (
                  <TruthChip state={truthOf('lessonAi')} />
                ) : aiStatus === 'unavailable' ? (
                  <TruthChip state="soon" label="Not available" />
                ) : null}
              </header>
              <h2 id="sh-ai" className="sr-only">{AI_NAME}</h2>
              <p className="sh-body">
                {aiStatus === 'checking'
                  ? `Checking whether ${AI_NAME} is switched on.`
                  : aiStatus === 'unavailable'
                    ? `${AI_NAME} is not switched on yet. Lessons work as normal without it.`
                    : aiStatus === 'unknown'
                      ? `${AI_NAME} availability could not be checked. Lessons work as normal without it.`
                      : `${AI_NAME} can help inside a lesson you can open. What it uses depends on that lesson. It does not see your progress, projects, or career profile. During an open quiz it withholds the quiz answers.`}
              </p>
              {allComplete || aiStatus === 'unavailable' ? null : (
                <p className="sh-foot"><Link className="os-link" to={resumeHref}>Open the current lesson <ArrowRight /></Link></p>
              )}
            </section>
          </div>
        </div>
      </div>
    </AuthDashboardShell>
  )
}
