import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import { useDemoState } from '../demo/DemoStateContext'
import { courses, programs } from '../data'
import {
  LearningWorkspacePanel,
  CurriculumProgressRail,
  StudentProgressSurface,
  StudentActionRail,
  computeCourseProgress,
  getPendingTasks,
  getRecentActivity,
} from '../components/lms'

const LEARN_SLUG = 'data-analytics'

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
  const demo = useDemoState()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  const course = courses.find(c => c.slug === LEARN_SLUG)
  const program = programs.find(p => p.slug === 'data-science-ai') ?? programs[0]
  const programName = user?.program || program?.name || 'Your program'
  const lms = demo.getLmsSummary(LEARN_SLUG)
  const lessonStates = demo.getLessonStates(LEARN_SLUG)
  const allLessons = course?.modules.flatMap(m => m.lessons) ?? []
  const { progressPct, allComplete } = course ? computeCourseProgress(allLessons, lessonStates) : { progressPct: 0, allComplete: false }

  const currentLesson = allLessons.find(l => l.id === lms?.currentLessonId)
  const pending = course ? getPendingTasks(course, lessonStates) : []
  const recent = getRecentActivity(courses.filter(c => c.slug === LEARN_SLUG), demo.getLessonStates)

  const activeProject = program?.projectsDetail?.[Math.min(lms?.completedCount ?? 0, (program?.projectsDetail?.length ?? 1) - 1)] ?? program?.projectsDetail?.[0]

  if (!ready || !user || !course) return null

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
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 20, padding: '10px 14px', background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: T.rControl }}>
          Demo workspace — progress is saved locally in this browser only.
        </div>
        <AuthDashboardLayout
          primary={
            <>
              <div id="student-learning">
                <LearningWorkspacePanel
                  courseTitle={course.title}
                  programName={programName}
                  progressPct={progressPct}
                  completedCount={lms?.completedCount ?? 0}
                  totalLessons={lms?.totalLessons ?? allLessons.length}
                  moduleTitle={lms?.currentModuleTitle ?? course.modules[0]?.title ?? ''}
                  moduleIndex={lms?.moduleIndex ?? 1}
                  moduleTotal={lms?.moduleTotal ?? course.modules.length}
                  lessonTitle={lms?.currentLessonTitle ?? 'Start learning'}
                  lessonType={currentLesson?.type ?? 'video'}
                  nextLessonTitle={lms?.nextLessonTitle ?? null}
                  learnSlug={LEARN_SLUG}
                  lessonId={lms?.currentLessonId ?? ''}
                  accent={accent}
                />
              </div>
              <CurriculumProgressRail course={course} lessonStates={lessonStates} accent={accent} learnSlug={LEARN_SLUG} />
              <StudentProgressSurface course={course} lessonStates={lessonStates} accent={accent} certificateReady={allComplete} />
              <div id="student-certificates" style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.lineDark}` }}>
                <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.32)', marginBottom: 10 }}>Certificate</div>
                {allComplete ? (
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                    Course complete — certificate issuance is not available in this demo.
                  </p>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 12px', lineHeight: 1.6 }}>
                    Complete all lessons to unlock certificate eligibility.
                  </p>
                )}
                <Link to={`/learn/${LEARN_SLUG}`} style={{ color: accent.text, fontSize: 13, textDecoration: 'none' }}>Open course →</Link>
              </div>
            </>
          }
          rail={
            <StudentActionRail
              pendingTasks={pendingRail}
              recentActivity={recentRail}
              projectTitle={activeProject?.title ?? 'Capstone project'}
              projectWhat={activeProject?.what ?? 'Portfolio artifact from your program.'}
              accent={accent}
            />
          }
        />
      </div>
    </AuthDashboardShell>
  )
}
