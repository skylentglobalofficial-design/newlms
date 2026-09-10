import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthDashboardShell, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import { useLmsDashboard } from '../hooks/useLms'
import { enrollInCourse } from '../lib/lms-api'
import { getRecentActivity } from '../components/lms'
import '../styles/lms-workspace.css'
import {
  LearnerContextPanel,
  LearnerContinueAction,
  LearnerEmptyEnrollment,
  LearnerPhaseNote,
  LearnerProgrammeStructure,
  LearnerRecentWork,
} from '../components/lms/LearnerWorkspace'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'learn', label: 'Learn', short: 'Learn', sectionId: 'learner-main' },
  { id: 'structure', label: 'Structure', short: 'Map', sectionId: 'learner-structure' },
  { id: 'work', label: 'Work', short: 'Work', sectionId: 'learner-work' },
]

const accent = getRoleAccent('student')

function NavIcon({ id }: { id: string }) {
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' as const, stroke: 'currentColor', strokeWidth: 1.8 }
  if (id === 'learn') {
    return (
      <svg {...s}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )
  }
  if (id === 'structure') {
    return (
      <svg {...s}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    )
  }
  return (
    <svg {...s}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

export default function DashboardStudentPage() {
  const { user, ready } = useAuth()
  const { workspace, course, lessonStates, loading, error, reload } = useLmsDashboard()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('learn')
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (ready && !user) navigate('/login', { state: { returnTo: '/dashboard/student' } })
  }, [ready, user, navigate])

  if (!ready || !user) {
    return (
      <div className="learner-gate" role="status">
        Checking your session…
      </div>
    )
  }

  const shellProps = {
    themeId: 'data-analytics' as const,
    workspaceLabel: 'Learning',
    roleLabel: 'Learner',
    navItems: NAV_ITEMS,
    bottomNavItems: NAV_ITEMS,
    activeNav,
    onNavChange: setActiveNav,
    renderNavIcon: (id: string) => <NavIcon id={id} />,
  }

  if (loading) {
    return (
      <AuthDashboardShell {...shellProps}>
        <div className="learner-gate" role="status">Loading your learning workspace…</div>
      </AuthDashboardShell>
    )
  }

  if (error) {
    return (
      <AuthDashboardShell {...shellProps}>
        <section className="learner-empty" aria-labelledby="learner-error-heading">
          <h1 id="learner-error-heading">We could not load your LMS workspace</h1>
          <p>{error}</p>
          <button type="button" className="learner-continue-btn" style={{ background: accent.primary, color: '#0B0D0F' }} onClick={() => void reload()}>
            Try again
          </button>
        </section>
      </AuthDashboardShell>
    )
  }

  if (!course || !workspace) {
    return (
      <AuthDashboardShell {...shellProps}>
        <LearnerEmptyEnrollment
          enrolling={enrolling}
          accent={accent}
          onEnroll={() => {
            setEnrolling(true)
            void enrollInCourse('data-analytics')
              .then(() => reload())
              .catch(() => undefined)
              .finally(() => setEnrolling(false))
          }}
        />
      </AuthDashboardShell>
    )
  }

  const resume = workspace.resume
  const learnSlug = workspace.enrollment.courseSlug
  const allLessons = course.modules.flatMap(m => m.lessons)
  const currentLesson = allLessons.find(l => l.id === resume?.lessonId)
  const continueHref = resume?.lessonId
    ? `/learn/${learnSlug}/${resume.lessonId}`
    : `/learn/${learnSlug}`
  const continueLabel = workspace.progress.completedCount > 0
    ? 'Continue learning'
    : 'Start learning'

  const recent = getRecentActivity([course], () => lessonStates).map(r => ({
    label: r.label,
    detail: r.detail,
    href: r.lessonId ? `/learn/${r.courseSlug}/${r.lessonId}` : `/learn/${r.courseSlug}`,
  }))

  return (
    <AuthDashboardShell
      {...shellProps}
      header={
        <div className="learner-topbar">
          <div>
            <p className="learner-kicker">Learner workspace</p>
            <p className="learner-identity">
              Signed in as <strong>{user.name}</strong>
            </p>
          </div>
          <Link to={continueHref} className="learner-topbar-link" style={{ color: accent.text }}>
            Open course →
          </Link>
        </div>
      }
    >
      <div id="learner-main" className="learner-workspace">
        <LearnerContextPanel
          courseTitle={workspace.enrollment.courseTitle || course.title}
          moduleTitle={resume?.moduleTitle ?? course.modules[0]?.title ?? ''}
          moduleIndex={resume?.moduleIndex ?? 1}
          moduleTotal={resume?.moduleTotal ?? course.modules.length}
          lessonTitle={resume?.lessonTitle ?? currentLesson?.title ?? 'Begin the first lesson'}
          lessonType={currentLesson?.type ?? 'video'}
          completedCount={workspace.progress.completedCount}
          totalLessons={workspace.progress.totalLessons}
          progressPct={workspace.progress.progressPct}
          accent={accent}
        />

        <LearnerContinueAction
          href={continueHref}
          label={continueLabel}
          nextLabel={resume?.nextLessonTitle ?? null}
          accent={accent}
        />

        <LearnerProgrammeStructure
          course={course}
          lessonStates={lessonStates}
          learnSlug={learnSlug}
          currentLessonId={resume?.lessonId ?? null}
          accent={accent}
        />

        <LearnerRecentWork items={recent} />

        <LearnerPhaseNote />
      </div>
    </AuthDashboardShell>
  )
}
