import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import {
  LearningWorkspacePanel,
  CurriculumProgressRail,
  StudentProgressSurface,
  StudentActionRail,
  computeCourseProgress,
  getPendingTasks,
  getRecentActivity,
} from '../components/lms'
import { useLmsDashboard } from '../hooks/useLms'
import { enrollInCourse, fetchLmsEnrollments, type ApiEnrollmentSummary } from '../lib/lms-api'
import EnrollmentEvidence from '../components/learner/EnrollmentEvidence'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', sectionId: 'student-overview' },
  { id: 'learning', label: 'My Learning', short: 'Learn', sectionId: 'student-learning' },
  { id: 'courses', label: 'Courses', short: 'Courses', sectionId: 'student-curriculum' },
  { id: 'assignments', label: 'Assignments', short: 'Tasks', sectionId: 'student-rail' },
  { id: 'progress', label: 'Progress', short: 'Progress', sectionId: 'student-progress' },
  { id: 'career', label: 'Career OS', short: 'Career', href: '/career-os' },
  { id: 'settings', label: 'Settings', short: 'Settings', sectionId: 'student-certificates' },
]

const accent = getRoleAccent('student')

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'overview') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'learning') return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  if (id === 'courses') return <svg {...s}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  if (id === 'assignments') return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (id === 'progress') return <svg {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  if (id === 'career') return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}

export default function DashboardStudentPage() {
  const { user, ready } = useAuth()
  const { workspace, course, lessonStates, loading, reload } = useLmsDashboard()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')
  const [enrolling, setEnrolling] = useState(false)
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

  const programName = workspace?.enrollment.courseTitle
    ? workspace.course.title
    : 'Your learning'

  const learnSlug = workspace?.course.slug ?? ''
  const allLessons = course?.modules.flatMap(m => m.lessons) ?? []
  const { progressPct, allComplete } = course ? computeCourseProgress(allLessons, lessonStates) : { progressPct: 0, allComplete: false }

  const resume = workspace?.resume
  const currentLesson = allLessons.find(l => l.id === resume?.lessonId)
  const pending = course ? getPendingTasks(course, lessonStates) : []
  const recent = course
    ? getRecentActivity([course], () => lessonStates)
    : []

  const submittedAssignments = allLessons.filter(
    (lesson) => lesson.type === 'assignment' && (lessonStates[lesson.id]?.assignmentSubmitted || lessonStates[lesson.id]?.complete),
  )
  const evidenceLesson = submittedAssignments[submittedAssignments.length - 1]
  const projectTitle = evidenceLesson ? evidenceLesson.title : 'No submitted assignments yet'
  const projectWhat = evidenceLesson
    ? 'This is evidence from your LMS. Add it to Career OS when you want it on your profile.'
    : 'Assignments you submit in the LMS become evidence you can record in Career OS. Nothing is invented here.'

  if (!ready || !user) return null

  if (loading) {
    return (
      <AuthDashboardShell
        themeId="data-science"
        workspaceLabel="Learning"
        roleLabel="Learner"
        navItems={NAV_ITEMS}
        bottomNavItems={NAV_ITEMS.filter(n => ['overview', 'learning', 'assignments', 'progress', 'career'].includes(n.id))}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        renderNavIcon={id => <NavIcon id={id} />}
      >
        <div style={{ color: C.slate, fontSize: 14 }}>Loading your learning workspace…</div>
      </AuthDashboardShell>
    )
  }

  if (!course || !workspace) {
    return (
      <AuthDashboardShell
        themeId="data-science"
        workspaceLabel="Learning"
        roleLabel="Learner"
        navItems={NAV_ITEMS}
        bottomNavItems={NAV_ITEMS.filter(n => ['overview', 'learning', 'assignments', 'progress', 'career'].includes(n.id))}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        renderNavIcon={id => <NavIcon id={id} />}
      >
        <div id="student-overview" style={{ maxWidth: 560 }}>
          <div style={{ color: C.ink, fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Start your learning journey</div>
          <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, margin: '0 0 20px' }}>
            Enroll in a live course to open the LMS, track progress, and carry evidence into Career OS.
          </p>
          <button
            type="button"
            disabled={enrolling}
            onClick={() => {
              setEnrolling(true)
              void enrollInCourse('data-analytics')
                .then(() => reload())
                .finally(() => setEnrolling(false))
            }}
            style={{ background: accent.primary, border: 'none', color: C.black, padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600, cursor: enrolling ? 'wait' : 'pointer', marginRight: 12 }}
          >
            {enrolling ? 'Enrolling…' : 'Start Data Analytics'}
          </button>
          <Link to="/courses" style={{ color: accent.text, fontSize: 13, textDecoration: 'none' }}>Browse live courses →</Link>
          <div style={{ marginTop: 28 }}>
            <EnrollmentEvidence items={enrollments} />
          </div>
        </div>
      </AuthDashboardShell>
    )
  }

  const pendingRail = pending.map(t => ({
    label: t.kind === 'quiz' ? 'Practice' : t.kind === 'assignment' ? 'Assignment' : 'Lesson',
    title: t.title,
    detail: `${t.moduleTitle} · ${t.courseTitle}`,
    href: `/learn/${t.courseSlug}/${t.lessonId}`,
  }))

  const recentRail = recent.map(r => ({
    label: r.label,
    detail: r.detail,
    href: r.lessonId ? `/learn/${r.courseSlug}/${r.lessonId}` : `/learn/${r.courseSlug}`,
  }))

  return (
    <AuthDashboardShell
      themeId="data-science"
      workspaceLabel="Learning"
      roleLabel="Learner"
      navItems={NAV_ITEMS}
      bottomNavItems={NAV_ITEMS.filter(n => ['overview', 'learning', 'assignments', 'progress', 'career'].includes(n.id))}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      <div id="student-overview">
        <AuthDashboardLayout
          primary={
            <>
              <div id="student-learning">
                <LearningWorkspacePanel
                  courseTitle={course.title}
                  programName={programName}
                  progressPct={progressPct}
                  completedCount={workspace.progress.completedCount}
                  totalLessons={workspace.progress.totalLessons}
                  moduleTitle={resume?.moduleTitle ?? course.modules[0]?.title ?? ''}
                  moduleIndex={resume?.moduleIndex ?? 1}
                  moduleTotal={resume?.moduleTotal ?? course.modules.length}
                  lessonTitle={resume?.lessonTitle ?? 'Start learning'}
                  lessonType={currentLesson?.type ?? 'video'}
                  nextLessonTitle={resume?.nextLessonTitle ?? null}
                  learnSlug={learnSlug}
                  lessonId={resume?.lessonId ?? ''}
                  accent={accent}
                />
              </div>
              {enrollments.filter((item) => item.courseSlug).length > 1 && (
                <div style={{ margin: '8px 0 24px' }}>
                  <div className="skylent-label" style={{ color: C.slate, marginBottom: 8 }}>All enrollments</div>
                  <EnrollmentEvidence items={enrollments} />
                </div>
              )}
              <CurriculumProgressRail course={course} lessonStates={lessonStates} accent={accent} learnSlug={learnSlug} />
              <StudentProgressSurface course={course} lessonStates={lessonStates} accent={accent} certificateReady={allComplete} />
              <div id="student-certificates" style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.lineLight}` }}>
                <div className="skylent-label" style={{ color: C.slate, marginBottom: 10 }}>Certificate</div>
                {workspace.enrollment.certificateEligible ? (
                  <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                    Eligible for certificate — status: {workspace.enrollment.certificateStatus}. Download will be available in a later phase.
                  </p>
                ) : allComplete ? (
                  <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                    Course complete — certificate eligibility is being finalized.
                  </p>
                ) : (
                  <p style={{ color: C.slate, fontSize: 14, margin: '0 0 12px', lineHeight: 1.6 }}>
                    Complete all lessons to unlock certificate eligibility.
                  </p>
                )}
                <Link to={`/learn/${learnSlug}/${resume?.lessonId ?? ''}`} style={{ color: accent.text, fontSize: 13, textDecoration: 'none', marginRight: 16 }}>Resume course →</Link>
                <Link to="/career-os" style={{ color: accent.text, fontSize: 13, textDecoration: 'none' }}>Record evidence in Career OS →</Link>
              </div>
            </>
          }
          rail={
            <StudentActionRail
              pendingTasks={pendingRail}
              recentActivity={recentRail}
              projectTitle={projectTitle}
              projectWhat={projectWhat}
              accent={accent}
            />
          }
        />
      </div>
    </AuthDashboardShell>
  )
}
