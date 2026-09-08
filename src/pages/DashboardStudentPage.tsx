import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useRequireRole } from '../hooks/useRequireRole'
import {
  LearningWorkspacePanel,
  CurriculumProgressRail,
  StudentProgressSurface,
  StudentActionRail,
  computeCourseProgress,
  getPendingTasks,
  getRecentActivity,
} from '../components/lms'
import LmsEmptyState, { LmsSectionShell } from '../components/lms/LmsEmptyState'
import EnrolledCoursesPanel from '../components/lms/EnrolledCoursesPanel'
import CertificatePanel from '../components/lms/CertificatePanel'
import CareerOsLinkPanel from '../components/lms/CareerOsLinkPanel'
import RoleWorkspaceBanner from '../components/auth/RoleWorkspaceBanner'
import { useLmsDashboard, useLmsEnrollments } from '../hooks/useLms'
import { enrollInCourse } from '../lib/lms-api'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', sectionId: 'student-overview' },
  { id: 'learning', label: 'My Learning', short: 'Learn', sectionId: 'student-learning' },
  { id: 'courses', label: 'Courses', short: 'Courses', sectionId: 'student-courses' },
  { id: 'assignments', label: 'Assignments', short: 'Tasks', sectionId: 'student-rail' },
  { id: 'progress', label: 'Progress', short: 'Progress', sectionId: 'student-progress' },
  { id: 'career', label: 'Career OS', short: 'Career', href: '/career-os/app' },
  { id: 'certificate', label: 'Certificate', short: 'Cert', sectionId: 'student-certificates' },
]

const BOTTOM_NAV = NAV_ITEMS.filter(n => ['overview', 'learning', 'assignments', 'progress', 'career'].includes(n.id))
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
  if (id === 'certificate') return <svg {...s}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="3"/></svg>
}

function StudentShell({
  activeNav,
  onNavChange,
  children,
}: {
  activeNav: string
  onNavChange: (id: string) => void
  children: React.ReactNode
}) {
  return (
    <AuthDashboardShell
      themeId="data-science"
      accent={accent}
      workspaceLabel="Learning"
      roleLabel="Learner"
      navItems={NAV_ITEMS}
      bottomNavItems={BOTTOM_NAV}
      activeNav={activeNav}
      onNavChange={onNavChange}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      {children}
    </AuthDashboardShell>
  )
}

export default function DashboardStudentPage() {
  const { user, ready, authorized } = useRequireRole('student')
  const { workspace, course, lessonStates, loading, error, reload } = useLmsDashboard()
  const { enrollments, loading: enrollmentsLoading } = useLmsEnrollments()
  const [activeNav, setActiveNav] = useState('overview')
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

  if (!ready || !authorized || !user) return null

  const programEnrollment = enrollments.find(e => e.programSlug && !e.courseSlug)
  const programName = programEnrollment?.programName ?? 'Your learning path'

  const learnSlug = workspace?.course.slug ?? ''
  const allLessons = course?.modules.flatMap(m => m.lessons) ?? []
  const { progressPct, allComplete } = course ? computeCourseProgress(allLessons, lessonStates) : { progressPct: 0, allComplete: false }

  const resume = workspace?.resume
  const currentLesson = allLessons.find(l => l.id === resume?.lessonId)
  const pending = course ? getPendingTasks(course, lessonStates) : []
  const recent = course ? getRecentActivity([course], () => lessonStates) : []

  if (loading) {
    return (
      <StudentShell activeNav={activeNav} onNavChange={setActiveNav}>
        <div className="lms-dashboard-loading">Loading your learning workspace…</div>
      </StudentShell>
    )
  }

  if (error) {
    return (
      <StudentShell activeNav={activeNav} onNavChange={setActiveNav}>
        <LmsEmptyState
          title="Could not load your workspace"
          description={error}
          actionLabel="Try again"
          onAction={() => { void reload() }}
        />
      </StudentShell>
    )
  }

  if (!course || !workspace) {
    return (
      <StudentShell activeNav={activeNav} onNavChange={setActiveNav}>
        <div id="student-overview">
          <RoleWorkspaceBanner
            variant="functional"
            accent={accent}
            title="Learner workspace"
            description="Enrollments, curriculum progress, lesson completion, and certificates load from the LMS API. Progress and scores reflect your account only."
          />
          <LmsEmptyState
            title="Start your learning journey"
            description="Enroll in a course to open your learner dashboard, curriculum progress, and resume learning."
            actionLabel={enrolling ? 'Enrolling…' : 'Enroll in Data Analytics'}
            onAction={() => {
              setEnrollError(null)
              setEnrolling(true)
              void enrollInCourse('data-analytics')
                .then(() => reload())
                .catch((err: unknown) => {
                  setEnrollError(err instanceof Error ? err.message : 'Enrollment failed')
                })
                .finally(() => setEnrolling(false))
            }}
            actionDisabled={enrolling}
            actionHref={undefined}
          />
          {enrollError && (
            <p role="alert" className="lms-dashboard-error">{enrollError} Please try again.</p>
          )}
          <Link to="/courses" className="lms-dashboard-browse" style={{ color: accent.text }}>Browse courses →</Link>
        </div>
      </StudentShell>
    )
  }

  const pendingRail = pending.map(t => ({
    label: t.kind === 'quiz' ? 'Assessment' : t.kind === 'assignment' ? 'Assignment' : 'Lesson',
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
    <StudentShell activeNav={activeNav} onNavChange={setActiveNav}>
      <div id="student-overview">
        <RoleWorkspaceBanner
          variant="functional"
          accent={accent}
          title="Learner workspace"
          description="Enrollments, curriculum progress, lesson completion, and certificates load from the LMS API. Progress and scores reflect your account only."
        />
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

              <LmsSectionShell id="student-courses" label="Enrolled courses">
                {enrollmentsLoading ? (
                  <p className="lms-dashboard-loading-inline">Loading enrollments…</p>
                ) : (
                  <EnrolledCoursesPanel
                    enrollments={enrollments}
                    activeCourseSlug={learnSlug}
                    accent={accent}
                  />
                )}
              </LmsSectionShell>

              <CurriculumProgressRail course={course} lessonStates={lessonStates} accent={accent} learnSlug={learnSlug} />
              <StudentProgressSurface course={course} lessonStates={lessonStates} accent={accent} certificateReady={allComplete} />

              <LmsSectionShell id="student-certificates" label="Certificate">
                <CertificatePanel
                  courseSlug={learnSlug}
                  lessonId={resume?.lessonId ?? allLessons[0]?.id ?? ''}
                  accent={accent}
                />
              </LmsSectionShell>
            </>
          }
          rail={
            <StudentActionRail
              pendingTasks={pendingRail}
              recentActivity={recentRail}
              accent={accent}
              careerPanel={<CareerOsLinkPanel accent={accent} />}
            />
          }
        />
      </div>
    </StudentShell>
  )
}
