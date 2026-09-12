import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import WorkspaceShell, { type WorkspaceNavItem } from '../design/WorkspaceShell'
import {
  Button,
  ButtonLink,
  EmptyState,
  Note,
  Progress,
  SectionHeading,
  getSurfaceAccent,
  type SurfaceAccent,
} from '../design/primitives'
import { R, S, TY } from '../design/tokens'
import '../design/dashboard.css'
import { useRequireRole } from '../hooks/useRequireRole'
import { useLmsDashboard, useLmsEnrollments } from '../hooks/useLms'
import { useCareerProfile } from '../hooks/useCareerProfile'
import {
  computeCourseProgress,
  computeModuleProgress,
  getPendingTasks,
  getRecentActivity,
  isLessonUnlocked,
  type LmsCourseView,
} from '../components/lms'
import { enrollInCourse } from '../lib/lms-api'
import type { ApiEnrollment } from '../lib/lms-api'
import type { LessonState } from '../demo/types'
import type { CourseLesson } from '../data'
import { emptySubjectLabCopy, labsForLearningContext } from '../lib/virtual-labs'
import { labRunPath } from '../lib/safe-return'

const THEME = 'general' as const
const accent: SurfaceAccent = getSurfaceAccent(THEME)

const NAV_ITEMS: WorkspaceNavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', sectionId: 'dash-overview', group: 'Learning' },
  { id: 'courses', label: 'My courses', short: 'Courses', sectionId: 'dash-courses', group: 'Learning' },
  { id: 'tasks', label: 'Up next', short: 'Next', sectionId: 'dash-tasks', group: 'Learning' },
  { id: 'progress', label: 'Curriculum', short: 'Progress', sectionId: 'dash-curriculum', group: 'Learning' },
  { id: 'certificate', label: 'Certificate', short: 'Cert', sectionId: 'dash-certificate', group: 'Learning' },
  { id: 'labs', label: 'Virtual labs', short: 'Labs', href: '/labs', group: 'Elsewhere' },
  { id: 'catalog', label: 'Browse catalogue', href: '/skills', group: 'Elsewhere' },
  { id: 'career', label: 'Career OS', short: 'Career', href: '/career-os/app', group: 'Elsewhere' },
]

const BOTTOM_NAV = NAV_ITEMS.filter(item => ['overview', 'courses', 'tasks', 'progress', 'career'].includes(item.id))

function firstName(name: string | undefined) {
  if (!name) return 'there'
  return name.trim().split(/\s+/)[0] ?? 'there'
}

function LessonGlyph({ type, color }: { type: CourseLesson['type']; color: string }) {
  const p = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (type === 'quiz') return <svg {...p}><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="9.5" /></svg>
  if (type === 'assignment') return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 15h6" /></svg>
  if (type === 'notes') return <svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
  return <svg {...p}><circle cx="12" cy="12" r="9.5" /><path d="m10 8.5 6 3.5-6 3.5z" /></svg>
}

function CheckGlyph({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20 6-11 11-5-5" />
    </svg>
  )
}

function LockGlyph({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function Chevron() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

// ── Continue banner ──────────────────────────────────────────────────────────
function ContinueBanner({
  first,
  courseTitle,
  moduleIndex,
  moduleTotal,
  moduleTitle,
  lessonTitle,
  nextLessonTitle,
  completedCount,
  totalLessons,
  pct,
  resumeHref,
  enrollments,
  activeCourseSlug,
}: {
  first: string
  courseTitle: string
  moduleIndex: number
  moduleTotal: number
  moduleTitle: string
  lessonTitle: string
  nextLessonTitle: string | null
  completedCount: number
  totalLessons: number
  pct: number
  resumeHref: string
  enrollments: ApiEnrollment[]
  activeCourseSlug: string
}) {
  const courseCards = enrollments.filter(entry => entry.courseSlug).slice(0, 3)

  return (
    <section className="sk-dash-banner">
      <div>
        <p className="sk-dash-banner-kicker">Hi, {first}</p>
        <h2>
          {completedCount === 0
            ? `Start ${courseTitle}`
            : progressLine(completedCount, totalLessons)}
        </h2>
        <p className="sk-dash-banner-meta">
          Continue with {lessonTitle}
          <br />
          {courseTitle} · Module {moduleIndex} of {moduleTotal} — {moduleTitle}
          {nextLessonTitle ? <><br />After this: {nextLessonTitle}</> : null}
        </p>
        <Link to={resumeHref} className="sk-dash-continue">
          {completedCount === 0 ? 'Start first lesson' : 'Continue lesson'}
          <Chevron />
        </Link>
      </div>

      {courseCards.length > 0 && (
        <div className="sk-dash-fan">
          {courseCards.map((entry, index) => {
            const isActive = entry.courseSlug === activeCourseSlug
            return (
              <Link key={entry.id} to={`/learn/${entry.courseSlug}`} className="sk-dash-fan-card">
                <span className="sk-dash-fan-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="sk-dash-fan-title">{entry.courseTitle}</span>
                <span className="sk-dash-fan-meta">
                  {isActive
                    ? `${completedCount} / ${totalLessons} lessons · ${pct}%`
                    : 'Open to see your progress'}
                </span>
                <span className="sk-dash-fan-bar">
                  <span style={{ width: isActive ? `${pct}%` : '0%' }} />
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

function progressLine(completedCount: number, totalLessons: number) {
  if (completedCount >= totalLessons && totalLessons > 0) return 'You have finished this course.'
  return `You have completed ${completedCount} ${completedCount === 1 ? 'lesson' : 'lessons'}.`
}

// ── Real-count statistics ────────────────────────────────────────────────────
function StatTiles({ course, lessonStates }: { course: LmsCourseView; lessonStates: Record<string, LessonState> }) {
  const lessons = course.modules.flatMap(m => m.lessons)
  const done = (list: CourseLesson[]) => list.filter(l => lessonStates[l.id]?.complete).length
  const quizzes = lessons.filter(l => l.type === 'quiz')
  const assignments = lessons.filter(l => l.type === 'assignment')

  const tiles = [
    { value: done(lessons), total: lessons.length, label: 'Lessons completed' },
    { value: done(quizzes), total: quizzes.length, label: 'Quizzes passed' },
    { value: done(assignments), total: assignments.length, label: 'Assignments submitted' },
  ]

  return (
    <div className="sk-dash-stats">
      {tiles.map(tile => (
        <div key={tile.label} className="sk-dash-stat">
          <div className="sk-dash-stat-value">
            {tile.total === 0 ? <em>None in this course</em> : <>{tile.value}<em> / {tile.total}</em></>}
          </div>
          <div className="sk-dash-stat-label">{tile.label}</div>
        </div>
      ))}
    </div>
  )
}


// ── Enrolled courses ─────────────────────────────────────────────────────────
function CourseCards({
  enrollments,
  activeCourseSlug,
  activePct,
}: {
  enrollments: ApiEnrollment[]
  activeCourseSlug: string
  activePct: number
}) {
  const courses = enrollments.filter(entry => entry.courseSlug)
  const programs = enrollments.filter(entry => entry.programSlug && !entry.courseSlug)

  if (courses.length === 0 && programs.length === 0) {
    return (
      <EmptyState
        title="No enrolments yet"
        body="Browse the catalogue to enrol in a course and open your learning workspace."
        action={<ButtonLink to="/skills" themeId={THEME}>Find something to learn</ButtonLink>}
        compact
      />
    )
  }

  return (
    <>
      <div className="sk-dash-courses">
        {courses.map(entry => {
          const isActive = entry.courseSlug === activeCourseSlug
          return (
            <Link key={entry.id} to={`/learn/${entry.courseSlug}`} className="sk-dash-course">
              <div className="sk-dash-course-head">
                <div style={{ minWidth: 0 }}>
                  <div style={{ ...TY.meta, color: S.inkMuted, marginBottom: 5 }}>Course</div>
                  <div className="sk-dash-course-title">{entry.courseTitle}</div>
                </div>
                {isActive && (
                  <span
                    style={{
                      ...TY.meta,
                      fontSize: 11,
                      fontWeight: 600,
                      color: accent.text,
                      background: accent.soft,
                      border: `1px solid ${accent.line}`,
                      borderRadius: R.pill,
                      padding: '2px 9px',
                      flexShrink: 0,
                    }}
                  >
                    Current
                  </span>
                )}
              </div>
              {isActive ? (
                <Progress value={activePct} total={100} label="Your progress" themeId={THEME} />
              ) : (
                <div style={{ ...TY.bodySm, color: S.inkMuted }}>Open the course to see your progress.</div>
              )}
            </Link>
          )
        })}
      </div>

      {programs.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <Note>
            {programs.length === 1 ? 'Programme enrolment: ' : 'Programme enrolments: '}
            {programs.map(entry => entry.programName).join(', ')}. Programme courses appear here as they are published to
            the learning platform.
          </Note>
        </div>
      )}
    </>
  )
}

// ── Up next ──────────────────────────────────────────────────────────────────
type TaskRow = { key: string; kind: string; title: string; meta: string; href: string; type: CourseLesson['type'] }

function TaskList({ tasks }: { tasks: TaskRow[] }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="You are caught up"
        body="Every unlocked lesson in this course is complete."
        compact
      />
    )
  }
  return (
    <div>
      {tasks.map(task => (
        <Link key={task.key} to={task.href} className="sk-dash-row">
          <span className="sk-dash-row-icon" style={{ background: accent.soft }}>
            <LessonGlyph type={task.type} color={accent.text} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span className="sk-dash-row-title" style={{ display: 'block' }}>{task.title}</span>
            <span className="sk-dash-row-meta" style={{ display: 'block' }}>{task.kind} · {task.meta}</span>
          </span>
          <span className="sk-dash-row-chevron"><Chevron /></span>
        </Link>
      ))}
    </div>
  )
}

// ── Curriculum position ──────────────────────────────────────────────────────
function CurriculumPosition({
  course,
  lessonStates,
  currentLessonId,
}: {
  course: LmsCourseView
  lessonStates: Record<string, LessonState>
  currentLessonId: string | null
}) {
  const allLessons = course.modules.flatMap(m => m.lessons)
  const currentModuleId = course.modules.find(m => m.lessons.some(l => l.id === currentLessonId))?.id
  const [openId, setOpenId] = useState<string | null>(currentModuleId ?? course.modules[0]?.id ?? null)

  return (
    <div>
      {course.modules.map((mod, index) => {
        const mp = computeModuleProgress(mod, lessonStates)
        const isOpen = openId === mod.id
        const isCurrent = mod.id === currentModuleId
        return (
          <div key={mod.id} className="sk-dash-module" style={isCurrent ? { borderColor: accent.line } : undefined}>
            <button
              type="button"
              className="sk-dash-module-head"
              onClick={() => setOpenId(isOpen ? null : mod.id)}
              aria-expanded={isOpen}
            >
              <span className="sk-dash-module-index">{String(index + 1).padStart(2, '0')}</span>
              <span style={{ minWidth: 0 }}>
                <span className="sk-dash-module-title" style={{ display: 'block' }}>{mod.title}</span>
                {isCurrent && (
                  <span style={{ ...TY.meta, fontSize: 11.5, color: accent.text, display: 'block', marginTop: 2 }}>
                    You are here
                  </span>
                )}
              </span>
              <span className="sk-dash-module-count">
                {mp.total === 0 ? '—' : `${mp.completed}/${mp.total}`}
              </span>
              <span
                className="sk-dash-row-chevron"
                style={{ marginLeft: 0, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.18s ease' }}
              >
                <Chevron />
              </span>
            </button>

            <div className="sk-dash-module-bar">
              <span style={{ width: `${mp.pct}%`, background: mp.pct > 0 ? accent.solid : 'transparent' }} />
            </div>

            {isOpen && (
              <div className="sk-dash-lessons">
                {mod.lessons.map(lesson => {
                  const state = lessonStates[lesson.id]
                  const unlocked = isLessonUnlocked(lesson.id, allLessons, lessonStates)
                  const isNow = lesson.id === currentLessonId
                  const body = (
                    <>
                      <span style={{ display: 'flex', width: 14, flexShrink: 0 }}>
                        {state?.complete ? (
                          <CheckGlyph color={S.positive} />
                        ) : !unlocked ? (
                          <LockGlyph color={S.inkMuted} />
                        ) : (
                          <LessonGlyph type={lesson.type} color={isNow ? accent.text : S.inkMuted} />
                        )}
                      </span>
                      <span
                        className="sk-dash-lesson-title"
                        style={{ color: isNow ? S.ink : undefined, fontWeight: isNow ? 600 : undefined }}
                      >
                        {lesson.title}
                      </span>
                      {isNow && (
                        <span className="sk-dash-lesson-now" style={{ background: accent.soft, color: accent.text }}>
                          NOW
                        </span>
                      )}
                    </>
                  )
                  if (!unlocked) {
                    return (
                      <div key={lesson.id} className="sk-dash-lesson is-locked" aria-disabled="true" title="Complete the previous lesson to unlock">
                        {body}
                      </div>
                    )
                  }
                  return (
                    <Link key={lesson.id} to={`/learn/${course.slug}/${lesson.id}`} className="sk-dash-lesson">
                      {body}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Rail panels ──────────────────────────────────────────────────────────────
function RailPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="sk-dash-panel">
      <div className="sk-dash-panel-title">{title}</div>
      {children}
    </div>
  )
}

function UpcomingRail({ tasks }: { tasks: TaskRow[] }) {
  const upcoming = tasks.slice(0, 4)
  return (
    <RailPanel title="Upcoming">
      {upcoming.length === 0 ? (
        <p style={{ ...TY.bodySm, color: S.inkMuted, margin: 0 }}>Nothing waiting. You are caught up.</p>
      ) : (
        <div className="sk-dash-timeline">
          {upcoming.map(task => (
            <Link key={task.key} to={task.href} className="sk-dash-time">
              <span className="sk-dash-time-dot" aria-hidden />
              <span>
                <span className="sk-dash-row-title" style={{ display: 'block' }}>{task.title}</span>
                <span className="sk-dash-row-meta" style={{ display: 'block' }}>{task.kind} · {task.meta}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </RailPanel>
  )
}

function CertificateCard({
  completedCount,
  totalLessons,
  eligible,
  status,
}: {
  completedCount: number
  totalLessons: number
  eligible: boolean
  status: string
}) {
  const remaining = Math.max(totalLessons - completedCount, 0)
  return (
    <div id="dash-certificate" className="sk-dash-panel">
      <div className="sk-dash-panel-title">Certificate</div>
      {eligible ? (
        <p style={{ ...TY.bodySm, color: S.ink, margin: '0 0 10px' }}>
          You have met the completion requirements. Status: <strong>{status}</strong>.
        </p>
      ) : (
        <>
          <Progress value={completedCount} total={totalLessons} label="Completion requirement" themeId={THEME} />
          <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '12px 0 10px' }}>
            {remaining === 0
              ? 'All lessons are complete — eligibility is being finalised.'
              : `${remaining} more ${remaining === 1 ? 'lesson' : 'lessons'} to complete this course.`}
          </p>
        </>
      )}
      <Note>Certificate download and verification are not built yet. This is a Skylent completion certificate, not an accredited qualification.</Note>
    </div>
  )
}

function ActivityPanel({ items }: { items: { id: string; label: string; detail: string; href: string }[] }) {
  return (
    <RailPanel title="Recent activity">
      {items.length === 0 ? (
        <p style={{ ...TY.bodySm, color: S.inkMuted, margin: 0 }}>
          Complete a lesson and it will show up here.
        </p>
      ) : (
        items.map(item => (
          <Link key={item.id} to={item.href} className="sk-dash-row" style={{ padding: '9px 4px' }}>
            <span style={{ display: 'flex', flexShrink: 0 }}>
              <CheckGlyph color={S.positive} />
            </span>
            <span style={{ minWidth: 0 }}>
              <span className="sk-dash-row-title" style={{ display: 'block', fontSize: 13.5, fontWeight: 400 }}>
                {item.label}
              </span>
              <span className="sk-dash-row-meta" style={{ display: 'block' }}>{item.detail}</span>
            </span>
          </Link>
        ))
      )}
    </RailPanel>
  )
}

function LabsPanel({
  courseSlug,
  lessonId,
  moduleTitle,
  lessonTitle,
}: {
  courseSlug: string
  lessonId?: string
  moduleTitle?: string
  lessonTitle?: string
}) {
  const labs = labsForLearningContext({ moduleTitle, lessonTitle })
  const from = lessonId ? `/learn/${courseSlug}/${lessonId}` : `/learn/${courseSlug}`
  return (
    <RailPanel title="Virtual labs">
      {labs.length === 0 ? (
        <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '0 0 12px' }}>
          {emptySubjectLabCopy(moduleTitle || lessonTitle || 'this lesson')}
        </p>
      ) : (
        <div className="sk-dash-timeline" style={{ marginBottom: 12 }}>
          {labs.map(lab => (
            <Link key={lab.id} to={labRunPath(lab.id, from)} className="sk-dash-time">
              <span className="sk-dash-time-dot" aria-hidden />
              <span>
                <span className="sk-dash-row-title" style={{ display: 'block' }}>{lab.title}</span>
                <span className="sk-dash-row-meta" style={{ display: 'block' }}>{lab.subject} · {lab.duration}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
      <ButtonLink to={`/labs?course=${encodeURIComponent(courseSlug)}`} variant="secondary" size="sm" themeId={THEME}>
        Labs for this course
      </ButtonLink>
    </RailPanel>
  )
}

function CareerPanel() {
  const { profile, loading } = useCareerProfile()
  const headline = profile?.headline?.trim()
  const skillCount = profile?.skills?.length ?? 0

  return (
    <RailPanel title="Career OS">
      {loading ? (
        <p style={{ ...TY.bodySm, color: S.inkMuted, margin: 0 }}>Loading profile…</p>
      ) : (
        <>
          {headline && (
            <div style={{ ...TY.body, fontWeight: 600, color: S.ink, marginBottom: 5 }}>{headline}</div>
          )}
          <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '0 0 12px' }}>
            {skillCount > 0
              ? `${skillCount} ${skillCount === 1 ? 'skill' : 'skills'} on your profile. `
              : 'Build your career profile, track applications, and practise interviews. '}
            Course progress does not sync into Career OS yet.
          </p>
          <ButtonLink to="/career-os/app" variant="secondary" size="sm" themeId={THEME}>
            Open Career OS
          </ButtonLink>
        </>
      )}
    </RailPanel>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardStudentPage() {
  const { user, ready, authorized } = useRequireRole('student')
  const { workspace, course, lessonStates, loading, error, reload } = useLmsDashboard()
  const { enrollments, loading: enrollmentsLoading } = useLmsEnrollments()
  const [activeNav, setActiveNav] = useState('overview')
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

  const allLessons = useMemo(() => course?.modules.flatMap(m => m.lessons) ?? [], [course])
  const progress = useMemo(
    () => computeCourseProgress(allLessons, lessonStates),
    [allLessons, lessonStates],
  )
  const pending = useMemo(() => (course ? getPendingTasks(course, lessonStates) : []), [course, lessonStates])
  const recent = useMemo(
    () => (course ? getRecentActivity([course], () => lessonStates) : []),
    [course, lessonStates],
  )

  if (!ready || !authorized || !user) return null

  const navItems = NAV_ITEMS.map(item => {
    if (item.id === 'tasks') return { ...item, count: pending.length }
    if (item.id === 'labs' && course?.slug) {
      return { ...item, href: `/labs?course=${encodeURIComponent(course.slug)}` }
    }
    return item
  })

  function shell(children: React.ReactNode, title?: React.ReactNode) {
    return (
      <WorkspaceShell
        themeId={THEME}
        workspaceLabel="Learning"
        roleLabel="Learner"
        navItems={navItems}
        bottomNavItems={BOTTOM_NAV}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        title={title}
        actions={
          <ButtonLink to="/skills" variant="secondary" size="sm" themeId={THEME}>
            Find something to learn
          </ButtonLink>
        }
      >
        {children}
      </WorkspaceShell>
    )
  }

  if (loading) {
    return shell(
      <p style={{ ...TY.body, color: S.inkMuted }}>Loading your learning workspace…</p>,
    )
  }

  if (error) {
    return shell(
      <EmptyState
        title="Could not load your workspace"
        body={error}
        action={<Button onClick={() => { void reload() }} themeId={THEME}>Try again</Button>}
      />,
    )
  }

  if (!course || !workspace) {
    return shell(
      <div id="dash-overview">
        <EmptyState
          title="Start your learning journey"
          body="Enrol in a course to open your learner dashboard, curriculum progress, and resume point."
          action={
            <>
              <Button
                themeId={THEME}
                disabled={enrolling}
                onClick={() => {
                  setEnrollError(null)
                  setEnrolling(true)
                  void enrollInCourse('data-analytics')
                    .then(() => reload())
                    .catch((err: unknown) => setEnrollError(err instanceof Error ? err.message : 'Enrolment failed'))
                    .finally(() => setEnrolling(false))
                }}
              >
                {enrolling ? 'Enrolling…' : 'Enrol in Data Analytics'}
              </Button>
              <ButtonLink to="/skills" variant="secondary" themeId={THEME}>Find something to learn</ButtonLink>
            </>
          }
        />
        {enrollError && (
          <p role="alert" style={{ ...TY.bodySm, color: S.caution, marginTop: 14 }}>{enrollError} Please try again.</p>
        )}
      </div>,
    )
  }

  const resume = workspace.resume
  const resumeHref = resume?.lessonId
    ? `/learn/${course.slug}/${resume.lessonId}`
    : `/learn/${course.slug}`

  const tasks: TaskRow[] = pending.map(task => ({
    key: task.id,
    kind: task.kind === 'quiz' ? 'Quiz' : task.kind === 'assignment' ? 'Assignment' : 'Lesson',
    title: task.title,
    meta: task.moduleTitle,
    href: `/learn/${task.courseSlug}/${task.lessonId}`,
    type: task.kind === 'quiz' ? 'quiz' : task.kind === 'assignment' ? 'assignment' : 'video',
  }))

  const activity = recent.map(item => ({
    id: item.id,
    label: item.label.replace(/^Completed · /, ''),
    detail: item.detail,
    href: item.lessonId ? `/learn/${item.courseSlug}/${item.lessonId}` : `/learn/${item.courseSlug}`,
  }))

  return shell(
    <div id="dash-overview">
      <ContinueBanner
        first={firstName(user.name)}
        courseTitle={course.title}
        moduleIndex={resume?.moduleIndex ?? 1}
        moduleTotal={resume?.moduleTotal ?? course.modules.length}
        moduleTitle={resume?.moduleTitle ?? course.modules[0]?.title ?? ''}
        lessonTitle={resume?.lessonTitle ?? allLessons[0]?.title ?? 'Start learning'}
        nextLessonTitle={resume?.nextLessonTitle ?? null}
        completedCount={progress.completedCount}
        totalLessons={progress.totalLessons}
        pct={progress.progressPct}
        resumeHref={resumeHref}
        enrollments={enrollments}
        activeCourseSlug={course.slug}
      />

      <div style={{ marginTop: 18 }}>
        <StatTiles course={course} lessonStates={lessonStates} />
      </div>

      <div className="sk-ws-grid" style={{ marginTop: 22 }}>
        <div className="sk-ws-col">
          <section id="dash-tasks">
            <SectionHeading
              title="Up next"
              lead="Unlocked work that is not finished yet, in curriculum order."
              size="sm"
            />
            <TaskList tasks={tasks} />
          </section>

          <section id="dash-courses">
            <SectionHeading title="My courses" size="sm" />
            {enrollmentsLoading ? (
              <p style={{ ...TY.bodySm, color: S.inkMuted }}>Loading enrolments…</p>
            ) : (
              <CourseCards
                enrollments={enrollments}
                activeCourseSlug={course.slug}
                activePct={progress.progressPct}
              />
            )}
          </section>

          <section id="dash-curriculum">
            <SectionHeading
              title="Curriculum"
              lead={`${course.modules.length} modules · ${progress.totalLessons} lessons. Lessons unlock in order.`}
              size="sm"
            />
            <CurriculumPosition
              course={course}
              lessonStates={lessonStates}
              currentLessonId={resume?.lessonId ?? null}
            />
          </section>
        </div>

        <aside className="sk-ws-rail">
          <UpcomingRail tasks={tasks} />
          <LabsPanel
            courseSlug={course.slug}
            lessonId={resume?.lessonId}
            moduleTitle={resume?.moduleTitle}
            lessonTitle={resume?.lessonTitle}
          />
          <ActivityPanel items={activity} />
          <CareerPanel />
          <CertificateCard
            completedCount={progress.completedCount}
            totalLessons={progress.totalLessons}
            eligible={workspace.enrollment.certificateEligible}
            status={workspace.enrollment.certificateStatus}
          />
        </aside>
      </div>
    </div>,
    course.title,
  )
}
