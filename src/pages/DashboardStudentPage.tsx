import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C } from '../tokens'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import {
  LearningWorkspacePanel,
  CurriculumProgressRail,
  StudentActionRail,
  computeCourseProgress,
  getRecentActivity,
  isLessonUnlocked,
  isCapstoneLesson,
  lessonTypeLabel,
} from '../components/lms'
import { useLmsDashboard } from '../hooks/useLms'
import { enrollInCourse, fetchLmsEnrollments, type ApiEnrollmentSummary } from '../lib/lms-api'
import EnrollmentEvidence from '../components/learner/EnrollmentEvidence'
import { LearnFlow, CourseProductVisual } from '../components/product/ProductLanguage'
import { workspaceErrorMessage } from '../lib/http'
import { authoredCourseList, courseProductProfile } from '../lib/course-product'
import { FLAGSHIP_COURSE_SLUG } from '../lib/authored-courses'
import './LearnWorkspace.css'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'learning', label: 'Learning', short: 'Learn', sectionId: 'student-learning' },
  { id: 'practice', label: 'Practice', short: 'Practice', sectionId: 'student-practice' },
  { id: 'projects', label: 'Projects', short: 'Projects', sectionId: 'student-projects' },
  { id: 'evidence', label: 'Evidence', short: 'Evidence', href: '/career-os/projects' },
  { id: 'career', label: 'Career', short: 'Career', href: '/career-os' },
]

const accent = getRoleAccent('student')
const recommendedCourses = authoredCourseList().sort((a, b) => {
  if (a.slug === FLAGSHIP_COURSE_SLUG) return -1
  if (b.slug === FLAGSHIP_COURSE_SLUG) return 1
  return a.title.localeCompare(b.title)
})

function greetingName(firstName: string) {
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return `${hello}, ${firstName}`
}

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'learning') return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  if (id === 'practice') return <svg {...s}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  if (id === 'projects') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'evidence') return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

export default function DashboardStudentPage() {
  const { user, ready } = useAuth()
  const { workspace, course, lessonStates, loading, error, reload } = useLmsDashboard()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('learning')
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<ApiEnrollmentSummary[]>([])

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    void fetchLmsEnrollments()
      .then((rows) => {
        if (!cancelled) setEnrollments(rows)
      })
      .catch(() => {
        if (!cancelled) setEnrollments([])
      })
    return () => {
      cancelled = true
    }
  }, [user, workspace])

  const learnSlug = workspace?.course.slug ?? ''
  const allLessons = course?.modules.flatMap((module) => module.lessons) ?? []
  const { progressPct } = course ? computeCourseProgress(allLessons, lessonStates) : { progressPct: 0 }
  const resume = workspace?.resume
  const currentLesson = allLessons.find((lesson) => lesson.id === resume?.lessonId)
  const recent = course ? getRecentActivity([course], () => lessonStates) : []
  const viaProgram =
    workspace?.program?.name ??
    enrollments.find((item) => item.courseSlug === learnSlug && item.programName)?.programName ??
    null
  const firstName = user?.name?.split(' ')[0] || 'there'

  const lessonModuleTitle = (lessonId: string) =>
    course?.modules.find((mod) => mod.lessons.some((lesson) => lesson.id === lessonId))?.title ?? course?.title ?? ''
  const currentIndex = resume?.lessonId ? allLessons.findIndex((lesson) => lesson.id === resume.lessonId) : 0
  const lessonIndex = currentIndex >= 0 ? currentIndex + 1 : 1
  const upcomingItems = allLessons
    .slice(Math.max(currentIndex, 0) + 1, Math.max(currentIndex, 0) + 4)
    .map((lesson) => ({ lesson, moduleTitle: lessonModuleTitle(lesson.id) }))
  const practiceItems = allLessons
    .filter((lesson) => lesson.type === 'quiz' || lesson.type === 'assignment')
    .filter((lesson) => isLessonUnlocked(lesson.id, allLessons, lessonStates) && !lessonStates[lesson.id]?.complete)
    .map((lesson) => ({ lesson, moduleTitle: lessonModuleTitle(lesson.id) }))

  const submittedAssignments = allLessons.filter(
    (lesson) => lesson.type === 'assignment' && (lessonStates[lesson.id]?.assignmentSubmitted || lessonStates[lesson.id]?.complete),
  )
  const evidenceLesson = submittedAssignments[submittedAssignments.length - 1]
  const evidenceTitle = evidenceLesson ? evidenceLesson.title : 'No submitted assignments yet'
  const evidenceDetail = evidenceLesson
    ? 'This is work recorded in the course. Add it to Career OS when you want it on your profile. Nothing is created automatically.'
    : 'Assignments you submit in the course can be added to Career OS as evidence on your profile.'

  const extraEnrollments = enrollments.filter((item) => {
    if (!item.courseSlug || item.courseSlug === learnSlug) return false
    if (workspace?.program?.courses.some((linked) => linked.slug === item.courseSlug)) return false
    return true
  })
  const productProfile = course ? courseProductProfile(course.slug) : null

  const shell = {
    themeId: 'data-science' as const,
    workspaceLabel: 'Skylent OS',
    roleLabel: 'Learner',
    navItems: NAV_ITEMS,
    bottomNavItems: NAV_ITEMS,
    activeNav,
    onNavChange: setActiveNav,
    renderNavIcon: (id: string) => <NavIcon id={id} />,
  }

  if (!ready || !user) return null

  if (error && !workspace) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="dash-error" id="student-learning">
          <p className="os-eyebrow">Learning</p>
          <h1>Learning workspace unavailable</h1>
          <p className="dash-empty-copy">{error}</p>
          <button type="button" className="os-btn os-btn-primary" onClick={() => void reload()}>Try again</button>
        </div>
      </AuthDashboardShell>
    )
  }

  if (loading) {
    return (
      <AuthDashboardShell {...shell}>
        <p style={{ color: C.slate, fontSize: 14 }}>Loading your learning workspace…</p>
      </AuthDashboardShell>
    )
  }

  if (!course || !workspace) {
    return (
      <AuthDashboardShell {...shell}>
        <div className="dash-empty" id="student-learning">
          <div className="dash-welcome">
            <h1>{greetingName(firstName)}</h1>
            <p>
              You are signed in. Enrol in a ready course to open a workspace with lessons, practice, and a place to keep the work.
            </p>
          </div>
          {recommendedCourses.length > 0 ? (
            <>
            <div className="dash-empty-grid dash-empty-courses">
              {recommendedCourses.map((item) => {
                const profile = courseProductProfile(item.slug)
                return (
                <div className="dash-empty-card" key={item.slug}>
                  {profile ? <CourseProductVisual visual={profile.visual} compact /> : null}
                  <p className="os-eyebrow">Ready to start</p>
                  <h2>{item.title}</h2>
                  <p>{item.desc}</p>
                  <p className="dash-continue-meta">
                    {item.duration} · {item.lessons} lessons · {item.level}
                  </p>
                  <div className="os-actions">
                    <button
                      type="button"
                      className="os-btn os-btn-primary"
                      disabled={enrolling}
                      onClick={() => {
                        setEnrolling(true)
                        setEnrollError(null)
                        void enrollInCourse(item.slug)
                          .then(() => reload({ silent: true }))
                          .catch((err) => setEnrollError(workspaceErrorMessage(err)))
                          .finally(() => setEnrolling(false))
                      }}
                    >
                      {enrolling ? 'Enrolling…' : `Start ${item.title}`}
                    </button>
                    <Link className="os-btn os-btn-ghost" to={`/courses/${item.slug}`}>View course</Link>
                  </div>
                </div>
                )
              })}
              {enrollError ? <p className="os-error">{enrollError}</p> : null}
            </div>
            <div className="dash-empty-flow">
              <LearnFlow
                steps={[
                  { title: "Learn", copy: "Enrolment opens that course in Skylent OS.", kind: "learn" },
                  { title: "Practise", copy: "Quizzes unlock after the written work.", kind: "practice" },
                  { title: "Build", copy: "Assignments follow the subject — a dataset, or a product case.", kind: "build" },
                  { title: "Keep", copy: "Carry evidence into Career OS yourself.", kind: "keep" },
                ]}
              />
            </div>
            </>
          ) : (
            <div className="os-actions">
              <Link className="os-btn os-btn-primary" to="/courses">Browse courses</Link>
            </div>
          )}
        </div>
      </AuthDashboardShell>
    )
  }

  const pendingRail = upcomingItems.map((item) => ({
    label: lessonTypeLabel(item.lesson.type, item.lesson.title),
    title: item.lesson.title,
    detail: `${item.moduleTitle}${item.lesson.duration ? ` · ${item.lesson.duration}` : ''}`,
    href: `/learn/${course.slug}/${item.lesson.id}`,
    locked: !isLessonUnlocked(item.lesson.id, allLessons, lessonStates),
  }))

  const practiceRail = practiceItems.map((item) => ({
    label: isCapstoneLesson(item.lesson) ? 'Capstone' : lessonTypeLabel(item.lesson.type, item.lesson.title),
    title: item.lesson.title,
    detail: `${item.moduleTitle} · ${item.lesson.duration ?? 'Self-paced'}`,
    href: `/learn/${course.slug}/${item.lesson.id}`,
  }))

  const recentRail = recent.map((item) => ({
    label: item.label,
    detail: item.detail,
    href: item.lessonId ? `/learn/${item.courseSlug}/${item.lessonId}` : `/learn/${item.courseSlug}`,
  }))

  return (
    <AuthDashboardShell {...shell}>
      <div id="student-overview">
        <div className="dash-welcome">
          <h1>{greetingName(firstName)}</h1>
          <p>
            {resume?.lessonTitle
              ? `Continue ${course.title} from ${resume.lessonTitle.replace(/[.!?]+$/, "")}.`
              : `Start ${course.title} when you are ready.`}
          </p>
        </div>
        <AuthDashboardLayout
          className="dash-layout"
          primary={
            <>
              <LearningWorkspacePanel
                courseTitle={course.title}
                courseSlug={course.slug}
                programName={viaProgram}
                progressPct={progressPct}
                completedCount={workspace.progress.completedCount}
                totalLessons={workspace.progress.totalLessons}
                lessonIndex={lessonIndex}
                moduleTitle={resume?.moduleTitle ?? course.modules[0]?.title ?? ''}
                moduleIndex={resume?.moduleIndex ?? 1}
                moduleTotal={resume?.moduleTotal ?? course.modules.length}
                lessonTitle={resume?.lessonTitle ?? 'Start learning'}
                lessonType={currentLesson ? lessonTypeLabel(currentLesson.type, currentLesson.title) : ''}
                lessonDuration={currentLesson?.duration}
                nextLessonTitle={resume?.nextLessonTitle ?? null}
                learnSlug={learnSlug}
                lessonId={resume?.lessonId ?? ''}
                accent={accent}
                started={workspace.progress.completedCount > 0 || Boolean(resume?.lessonId)}
              />
              {workspace.program && workspace.program.courses.length > 0 ? (
                <section className="dash-card dash-enrollments" aria-labelledby="student-programme">
                  <p className="os-eyebrow">Programme</p>
                  <h2 id="student-programme">{workspace.program.name}</h2>
                  <p className="dash-continue-meta">
                    {workspace.program.progress.completedCourses} of {workspace.program.progress.totalCourses} courses
                    {" · "}
                    {workspace.program.progress.completedCount} of {workspace.program.progress.totalLessons} lessons
                  </p>
                  <div
                    className="os-progress-bar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={workspace.program.progress.progressPct}
                    aria-label={`${workspace.program.progress.progressPct} percent of programme lessons complete`}
                    style={{ marginTop: 10 }}
                  >
                    <span style={{ width: `${workspace.program.progress.progressPct}%` }} />
                  </div>
                  <ul className="dash-program-courses">
                    {workspace.program.courses.map((item) => (
                      <li key={item.slug}>
                        <Link to={item.resume.lessonId ? `/learn/${item.slug}/${item.resume.lessonId}` : `/learn/${item.slug}`}>
                          <span>
                            <strong>{item.title}</strong>
                            <span className="dash-continue-meta">
                              {item.progress.completedCount}/{item.progress.totalLessons} lessons
                              {item.resume.lessonTitle ? ` · ${item.resume.lessonTitle}` : ""}
                            </span>
                          </span>
                          <span>{item.progress.allComplete ? "Completed" : "Resume"}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {productProfile?.project ? (
                <section className="dash-card" id="student-projects">
                  <p className="os-eyebrow">Projects</p>
                  <h2>{productProfile.project.label.replace(/^Open\s+/i, '')}</h2>
                  <p className="dash-continue-meta">{productProfile.project.note}</p>
                  <div className="os-actions" style={{ marginTop: 14 }}>
                    {productProfile.lab ? (
                      <Link className="os-btn os-btn-ghost" to={productProfile.lab.href(resume?.lessonId ?? '')}>
                        {productProfile.lab.label}
                      </Link>
                    ) : null}
                    <Link className="os-btn os-btn-primary" to={productProfile.project.href}>
                      {productProfile.project.label}
                    </Link>
                  </div>
                </section>
              ) : (
                <section className="dash-card" id="student-projects">
                  <p className="os-eyebrow">Projects</p>
                  <h2>Named work lives in the lesson path</h2>
                  <p className="dash-continue-meta">
                    This course does not open a separate project workspace. Assignments and the capstone stay inside Skylent OS.
                  </p>
                </section>
              )}
              {extraEnrollments.length > 0 ? (
                <div className="dash-card dash-enrollments">
                  <h2>Also enrolled</h2>
                  <p className="dash-continue-meta">Progress is stored per course. Open another workspace to continue it.</p>
                  <EnrollmentEvidence items={extraEnrollments} />
                </div>
              ) : null}
              <CurriculumProgressRail course={course} lessonStates={lessonStates} accent={accent} learnSlug={learnSlug} />
            </>
          }
          rail={
            <StudentActionRail
              pendingTasks={pendingRail}
              practiceTasks={practiceRail}
              recentActivity={recentRail}
              evidenceTitle={evidenceTitle}
              evidenceDetail={evidenceDetail}
              accent={accent}
            />
          }
        />
      </div>
    </AuthDashboardShell>
  )
}
