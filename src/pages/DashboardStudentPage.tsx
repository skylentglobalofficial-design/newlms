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
  const [_aiStatus, setAiStatus] = useState<AiAvailability>('available')
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
    hash === '#sh-my-learning'
      ? 'Active Courses'
      : hash === '#student-projects'
        ? 'Projects & Labs'
        : 'Dashboard'

  const shell = {
    themeId: 'data-science' as const,
    workspace: 'learning' as const,
    workspaceLabel: 'My Courses',
    roleLabel: user?.role === 'superadmin' ? 'Superadmin' : user?.role === 'admin' ? 'Admin' : 'Learner',
    navItems: LEARNER_NAV,
    bottomNavItems: LEARNER_NAV,
    activeNav,
    onNavChange: () => undefined,
    renderNavIcon: (id: string) => <LearnerNavIcon id={id} />,
    bar: (
      <>
        <span className="sh-crumb">My Courses <span aria-hidden="true">/</span> <b>{crumbSection}</b></span>
        <ProductSlice steps={SLICE} current={hash === '#student-projects' ? 'Build' : 'Learn'} label="Where this screen sits in the product model" />
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

  const myLearning = (
    <section
      className={hash === '#sh-my-learning' ? 'sh-card sh-card--focused' : 'sh-card'}
      aria-labelledby="sh-my-learning"
    >
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
              ? `${item.programmeName ? `${item.programmeName} · ` : ''}${progress.completedCount} of ${progress.totalLessons} lessons complete (${progress.progressPct}%)`
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
          <p className="os-eyebrow">My Courses</p>
          <h1>Start with a course</h1>
          <div className="sh-next sh-royal-hero">
            <p className="sh-next-label"><span aria-hidden="true" />Next step · ₹0 Free Pilot</p>
            <h2>Choose what to learn first</h2>
            <p className="sh-body">You are signed in and ready to start. Pick any of our 6 career tracks and its first lesson and browser lab open immediately.</p>
            <div className="os-actions">
              <Link className="os-btn os-btn-primary os-btn-lg" to="/programmes">Explore programmes <ArrowRight /></Link>
            </div>
          </div>
          {enrolmentRows.length > 0 ? <div className="sh-stack">{myLearning}<CareerRiseCard />{evidence}</div> : null}
          <section className="sh-card" aria-label="Elixir wallet" style={{ marginTop: 22 }}><ElixirWalletPanel /></section>
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
      className={hash === '#student-projects' ? 'sh-card sh-card--focused' : 'sh-card'}
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

        {/* 1. Primary Action Above the Fold: Royal Midnight Navy Continue Learning Hero Card */}
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
                <Link className="os-btn os-btn-primary os-btn-lg" to={`/learn/${course.slug}`}>Review the course <ArrowRight /></Link>
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

        {/* 2. Compact 14-Day Execution Streak Bar */}
        {(() => {
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
                      background: day.active ? "linear-gradient(145deg, #11152c 0%, #1d1849 100%)" : "#f1f5f9",
                      border: day.active ? "1px solid rgba(251, 191, 36, 0.55)" : "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: day.active ? "#fbbf24" : "#64748B",
                    }}
                  >
                    {day.date.slice(8)}
                  </div>
                ))}
              </div>
            </section>
          )
        })()}

        {/* 3. Main 2-Column Workspace Grid */}
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
            {/* Royal Midnight Navy Skylent AI & 20-Min TA Mentor Card (Always Ready) */}
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

        {/* 4. Elixir Wallet & Case Study Store (Cleanly placed below main learning workspace) */}
        <section className="sh-card" aria-label="Elixir wallet" style={{ marginTop: 22 }}>
          <ElixirWalletPanel />
        </section>
      </div>
    </AuthDashboardShell>
  )
}
