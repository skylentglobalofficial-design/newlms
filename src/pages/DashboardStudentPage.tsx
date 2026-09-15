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
  getPendingTasks,
  getRecentActivity,
  lessonTypeLabel,
} from '../components/lms'
import { useLmsDashboard } from '../hooks/useLms'
import { enrollInCourse, fetchLmsEnrollments, type ApiEnrollmentSummary } from '../lib/lms-api'
import EnrollmentEvidence from '../components/learner/EnrollmentEvidence'
import { workspaceErrorMessage } from '../lib/http'
import './LearnWorkspace.css'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Home', short: 'Home', sectionId: 'student-overview' },
  { id: 'learning', label: 'My learning', short: 'Learn', sectionId: 'student-learning' },
  { id: 'career', label: 'Career OS', short: 'Career', href: '/career-os' },
]

const accent = getRoleAccent('student')

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'overview') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'learning') return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

export default function DashboardStudentPage() {
  const { user, ready } = useAuth()
  const { workspace, course, lessonStates, loading, error, reload } = useLmsDashboard()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')
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
  const pending = course ? getPendingTasks(course, lessonStates) : []
  const recent = course ? getRecentActivity([course], () => lessonStates) : []
  const viaProgram = enrollments.find((item) => item.courseSlug === learnSlug && item.programName)?.programName ?? null

  const submittedAssignments = allLessons.filter(
    (lesson) => lesson.type === 'assignment' && (lessonStates[lesson.id]?.assignmentSubmitted || lessonStates[lesson.id]?.complete),
  )
  const evidenceLesson = submittedAssignments[submittedAssignments.length - 1]
  const evidenceTitle = evidenceLesson ? evidenceLesson.title : 'No submitted assignments yet'
  const evidenceDetail = evidenceLesson
    ? 'This is work recorded in the course. Add it to Career OS when you want it on your profile. Nothing is created automatically.'
    : 'Assignments you submit in the course can be recorded in Career OS. Nothing is invented here.'

  const shell = {
    themeId: 'data-science' as const,
    workspaceLabel: 'Learning',
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
        <div className="dash-error" id="student-overview" style={{ maxWidth: 560 }}>
          <h1>Learning workspace unavailable</h1>
          <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7 }}>{error}</p>
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
        <div className="dash-empty" id="student-overview" style={{ maxWidth: 560 }}>
          <h1>No courses yet.</h1>
          <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.7, margin: '0 0 20px' }}>
            Choose something to learn and it will appear here.
          </p>
          <div className="os-actions">
            <button
              type="button"
              className="os-btn os-btn-primary"
              disabled={enrolling}
              onClick={() => {
                setEnrolling(true)
                setEnrollError(null)
                void enrollInCourse('data-analytics')
                  .then(() => reload({ silent: true }))
                  .catch((err) => setEnrollError(workspaceErrorMessage(err)))
                  .finally(() => setEnrolling(false))
              }}
            >
              {enrolling ? 'Enrolling…' : 'Start Data Analytics'}
            </button>
            <Link className="os-btn os-btn-ghost" to="/courses">Browse courses</Link>
          </div>
          {enrollError ? <p className="os-error">{enrollError}</p> : null}
        </div>
      </AuthDashboardShell>
    )
  }

  const pendingRail = pending.map((task) => ({
    label: task.kind === 'quiz' ? 'Quiz' : task.kind === 'assignment' ? 'Assignment' : 'Lesson',
    title: task.title,
    detail: `${task.moduleTitle} · ${task.courseTitle}`,
    href: `/learn/${task.courseSlug}/${task.lessonId}`,
  }))

  const recentRail = recent.map((item) => ({
    label: item.label,
    detail: item.detail,
    href: item.lessonId ? `/learn/${item.courseSlug}/${item.lessonId}` : `/learn/${item.courseSlug}`,
  }))

  return (
    <AuthDashboardShell {...shell}>
      <div id="student-overview">
        <AuthDashboardLayout
          primary={
            <>
              <LearningWorkspacePanel
                courseTitle={course.title}
                programName={viaProgram}
                progressPct={progressPct}
                completedCount={workspace.progress.completedCount}
                totalLessons={workspace.progress.totalLessons}
                moduleTitle={resume?.moduleTitle ?? course.modules[0]?.title ?? ''}
                moduleIndex={resume?.moduleIndex ?? 1}
                moduleTotal={resume?.moduleTotal ?? course.modules.length}
                lessonTitle={resume?.lessonTitle ?? 'Start learning'}
                lessonType={currentLesson ? lessonTypeLabel(currentLesson.type, currentLesson.title) : ''}
                nextLessonTitle={resume?.nextLessonTitle ?? null}
                learnSlug={learnSlug}
                lessonId={resume?.lessonId ?? ''}
                accent={accent}
                started={workspace.progress.completedCount > 0 || Boolean(resume?.lessonId)}
              />
              {enrollments.filter((item) => item.courseSlug).length > 1 ? (
                <div style={{ margin: '24px 0' }}>
                  <p className="os-rail-kicker">Enrolled courses</p>
                  <EnrollmentEvidence items={enrollments} />
                </div>
              ) : null}
              <CurriculumProgressRail course={course} lessonStates={lessonStates} accent={accent} learnSlug={learnSlug} />
            </>
          }
          rail={
            <StudentActionRail
              pendingTasks={pendingRail}
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
