import { useCallback, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthDashboardShell, type AuthNavItem } from '../components/AuthDashboardShell'
import { useAuth } from '../context/AuthContext'
import { isCapstoneLesson, lessonTypeLabel } from '../components/lms/lms-utils'
import { useLmsDashboard } from '../hooks/useLms'
import { fetchLmsEnrollments, type ApiEnrollmentSummary } from '../lib/lms-api'
import { listLearnerProjects, learnerProjectPath, projectStatusLabel, type ProjectSummary } from '../lib/projects-api'
import { fetchMyCertificates, issueCertificate, type SkylentCertificate } from '../lib/skylent-api'
import { truthOf } from '../lib/truth'
import { workspaceErrorMessage } from '../lib/http'
import { courseProductProfile } from '../lib/course-product'
import { AiMark, AI_NAME, ArrowRight, ProductSlice, TruthChip } from '../components/skylent/primitives'
import './LearnWorkspace.css'
import './StudentHome.css'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'learning', label: 'Learning', short: 'Learn', sectionId: 'student-learning' },
  { id: 'practice', label: 'Practice', short: 'Practice', sectionId: 'student-practice' },
  { id: 'projects', label: 'Projects', short: 'Projects', sectionId: 'student-projects' },
  { id: 'evidence', label: 'Evidence', short: 'Evidence', href: '/career-os/projects' },
  { id: 'career', label: 'Career', short: 'Career', href: '/career-os' },
]

const SLICE = ['Learn', 'Practice', 'Build', 'Prove'] as const

/** A list the page loads beside the dashboard. `null` data with an error means it could not be loaded. */
type Loaded<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error' }

function NavIcon({ id }: { id: string }) {
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': true }
  if (id === 'learning') return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  if (id === 'practice') return <svg {...s}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  if (id === 'projects') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'evidence') return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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
  const [activeNav, setActiveNav] = useState('learning')
  const [enrollments, setEnrollments] = useState<Loaded<ApiEnrollmentSummary[]>>({ status: 'loading' })
  const [projects, setProjects] = useState<Loaded<ProjectSummary[]>>({ status: 'loading' })
  const [certificates, setCertificates] = useState<Loaded<SkylentCertificate[]>>({ status: 'loading' })
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<{ slug: string; message: string } | null>(null)

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

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
  }, [user, workspace, loadLists])

  async function claimCertificate(courseSlug: string) {
    setClaiming(courseSlug)
    setClaimError(null)
    try {
      const issued = await issueCertificate(courseSlug)
      setCertificates((current) => ({
        status: 'ready',
        data: [issued, ...(current.status === 'ready' ? current.data.filter((item) => item.id !== issued.id) : [])],
      }))
    } catch (err) {
      // A 403 carries the server's own sentence: "Complete every lesson first."
      setClaimError({ slug: courseSlug, message: workspaceErrorMessage(err) })
    } finally {
      setClaiming(null)
    }
  }

  const shell = {
    themeId: 'data-science' as const,
    workspaceLabel: 'My learning',
    roleLabel: 'Learner',
    navItems: NAV_ITEMS,
    bottomNavItems: NAV_ITEMS,
    activeNav,
    onNavChange: setActiveNav,
    renderNavIcon: (id: string) => <NavIcon id={id} />,
    bar: (
      <>
        <span className="sh-crumb">My learning <span aria-hidden="true">/</span> <b>Home</b></span>
        <ProductSlice steps={SLICE} current="Learn" label="Where this screen sits in the product model" />
      </>
    ),
  }

  if (!ready || !user) return null

  if (error && !workspace) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="sh sh-state" id="student-learning">
          <p className="os-eyebrow">My learning</p>
          <h1>Your learning could not be loaded</h1>
          <p className="os-lead">The learning service did not respond. Nothing has been lost. Try again in a moment.</p>
          <div className="os-actions">
            <button type="button" className="os-btn os-btn-primary" onClick={() => void reload()}>Try again</button>
          </div>
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

  const progressFor = (item: ApiEnrollmentSummary) => {
    if (workspace && item.courseSlug === workspace.course.slug) return workspace.progress
    return workspace?.program?.courses.find((linked) => linked.slug === item.courseSlug)?.progress ?? null
  }

  const myLearning = (
    <section className="sh-card" aria-labelledby="sh-my-learning">
      <header className="sh-card-head">
        <h2 id="sh-my-learning">My learning</h2>
        {enrollments.status === 'ready' ? (
          <span className="sh-note">{enrolmentRows.length} {enrolmentRows.length === 1 ? 'enrolment' : 'enrolments'}</span>
        ) : null}
      </header>
      {enrollments.status === 'loading' ? (
        <div className="sh-row"><span className="os-skeleton" style={{ width: '60%' }} /></div>
      ) : enrollments.status === 'error' ? (
        <p className="sh-empty">Your enrolments could not be loaded. Reload the page to try again.</p>
      ) : enrolmentRows.length === 0 ? (
        <p className="sh-empty">You are not enrolled in anything yet.</p>
      ) : (
        <ul className="sh-rows">
          {enrolmentRows.map((item) => {
            const progress = progressFor(item)
            const title = item.programName ?? item.courseTitle ?? 'Enrolment'
            return (
              <li key={item.id} className="sh-row">
                <div className="sh-row-main">
                  <strong>{title}</strong>
                  <span className="sh-note">
                    {item.programName && item.courseTitle ? `${item.courseTitle} · ` : ''}
                    {progress ? `${progress.completedCount} of ${progress.totalLessons} lessons` : `Enrolled ${formatDate(item.createdAt)}`}
                  </span>
                  {progress ? (
                    <div className="os-progress-bar sh-row-bar" role="progressbar" aria-label={`${title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.progressPct}>
                      <span style={{ width: `${progress.progressPct}%` }} />
                    </div>
                  ) : null}
                </div>
                <span className={item.status === 'completed' ? 'os-status is-done' : 'os-status'}>{enrolmentStatusLabel(item.status)}</span>
                {item.courseSlug ? (
                  <Link className="os-link sh-row-link" to={`/learn/${item.courseSlug}`} aria-label={`Open ${title}`}>
                    Open <ArrowRight />
                  </Link>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )

  const claimable = enrolmentRows.filter(
    (item) =>
      item.certificateEligible &&
      Boolean(item.courseSlug) &&
      !certificateRows.some((cert) => cert.courseTitle === item.courseTitle),
  )

  const evidence = (
    <section className="sh-card sh-proof" id="student-evidence" aria-labelledby="sh-evidence">
      <header className="sh-card-head">
        <h2 id="sh-evidence">Evidence and certificates</h2>
        <TruthChip state={truthOf('certificates')} />
      </header>
      {certificates.status === 'loading' ? (
        <div className="sh-row"><span className="os-skeleton" style={{ width: '50%' }} /></div>
      ) : certificates.status === 'error' ? (
        <p className="sh-empty">Your certificates could not be loaded. Reload the page to try again.</p>
      ) : (
        <>
          {certificateRows.length > 0 ? (
            <ul className="sh-rows">
              {certificateRows.map((cert) => (
                <li key={cert.id} className="sh-row">
                  <div className="sh-row-main">
                    <strong>{cert.courseTitle}</strong>
                    <span className="sh-note">{cert.code} · issued {formatDate(cert.issuedAt)}</span>
                  </div>
                  <Link className="os-link sh-row-link" to={`/verify/${cert.code}`} aria-label={`Verify the ${cert.courseTitle} certificate`}>
                    Verify <ArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {claimable.map((item) => (
            <div key={item.id} className="sh-row sh-claim">
              <div className="sh-row-main">
                <strong>{item.courseTitle}</strong>
                <span className="sh-note">Every lesson complete. No certificate issued yet.</span>
                {claimError?.slug === item.courseSlug ? (
                  <span className="os-error" role="alert">{claimError.message}</span>
                ) : null}
              </div>
              <button
                type="button"
                className="os-btn os-btn-primary"
                disabled={claiming !== null}
                onClick={() => void claimCertificate(item.courseSlug as string)}
              >
                {claiming === item.courseSlug ? 'Issuing…' : 'Claim certificate'}
              </button>
            </div>
          ))}
          {certificateRows.length === 0 && claimable.length === 0 ? (
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

  /* ── Empty learner: no primary enrolment workspace ── */

  if (!course || !workspace) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="sh" id="student-learning">
          <p className="os-eyebrow">My learning</p>
          <h1>Start with a programme</h1>
          <div className="sh-next">
            <p className="sh-next-label"><span aria-hidden="true" />Next step</p>
            <h2>Choose what to learn first</h2>
            <p className="sh-body">You are signed in and have no lessons open yet. Pick a programme and its first lesson opens here.</p>
            <div className="os-actions">
              <Link className="os-btn os-btn-primary os-btn-lg" to="/programmes">Explore programmes <ArrowRight /></Link>
            </div>
          </div>
          {enrolmentRows.length > 0 ? <div className="sh-stack">{myLearning}</div> : null}
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

  // Needs attention: only what the lesson states say. A check or an assignment that has been
  // opened (started) and is neither complete nor locked.
  const attention = allLessons.filter((lesson) => {
    const state = workspace.lessonStates[lesson.id]
    if (!state || !state.started || state.complete || state.locked) return false
    return lesson.type === 'quiz' || lesson.type === 'assignment'
  })

  const projectRows = projects.status === 'ready' ? projects.data : []
  const currentProject = projectRows.find((item) => item.courseSlug === course.slug) ?? projectRows[0] ?? null

  return (
    <AuthDashboardShell {...shell}>
      <div className="sh">
        <p className="os-eyebrow">My learning</p>
        <h1>What to do next</h1>

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
                  ? 'Your certificate can be claimed below.'
                  : `Module ${resume.moduleIndex} of ${resume.moduleTotal} · ${resume.moduleTitle}${resume.nextLessonTitle ? `. Next: ${resume.nextLessonTitle}` : ''}`}
              </p>
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
                        <span className="sh-note">
                          {lesson.type === 'quiz'
                            ? 'Check opened, not passed yet'
                            : `${isCapstoneLesson(lesson) ? 'Capstone' : 'Assignment'} opened, not submitted yet`}
                        </span>
                      </div>
                      <Link className="os-link sh-row-link" to={`/learn/${course.slug}/${lesson.id}`} aria-label={`Open ${lesson.title}`}>
                        Open <ArrowRight />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {myLearning}

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
                <p className="sh-empty">Your projects could not be loaded. Reload the page to try again.</p>
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
              {profile?.lab ? (
                <div className="sh-row" id="student-practice">
                  <div className="sh-row-main">
                    <strong>Practice lab</strong>
                    <span className="sh-note">{profile.lab.note}</span>
                  </div>
                  <Link className="os-link sh-row-link" to={profile.lab.href(resume.lessonId)}>
                    {profile.lab.label} <ArrowRight />
                  </Link>
                </div>
              ) : (
                <span id="student-practice" />
              )}
            </section>
          </div>

          <div className="sh-stack">
            {evidence}
            {career}
            <section className="sh-card sh-ai" aria-labelledby="sh-ai">
              <header className="sh-ai-head">
                <AiMark />
                <TruthChip state={truthOf('lessonAi')} />
              </header>
              <h2 id="sh-ai" className="sr-only">{AI_NAME}</h2>
              <p className="sh-body">{AI_NAME} works inside lessons. It answers from the lesson you have open and cannot see your progress, projects or career data.</p>
              {allComplete ? null : (
                <p className="sh-foot"><Link className="os-link" to={resumeHref}>Open the current lesson <ArrowRight /></Link></p>
              )}
            </section>
          </div>
        </div>
      </div>
    </AuthDashboardShell>
  )
}
