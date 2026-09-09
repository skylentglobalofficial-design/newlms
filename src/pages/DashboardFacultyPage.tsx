import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuroraBand, GlassSurface } from '../components/foundation'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import { fetchFacultyDashboard, type FacultyDashboard, type FacultySubmission } from '../lib/faculty-api'

const TEACHING_COURSE_SLUG = 'data-analytics'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', sectionId: 'faculty-overview' },
  { id: 'classes', label: 'Classes', short: 'Classes', sectionId: 'faculty-classes' },
  { id: 'curriculum', label: 'Curriculum', short: 'Curriculum', sectionId: 'faculty-curriculum' },
  { id: 'assignments', label: 'Assignments', short: 'Tasks', sectionId: 'faculty-assignments' },
  { id: 'assessments', label: 'Assessments', short: 'Tests', sectionId: 'faculty-upcoming' },
  { id: 'learners', label: 'Learners', short: 'Learners', sectionId: 'faculty-learners' },
  { id: 'settings', label: 'Settings', short: 'Settings', sectionId: 'faculty-settings' },
]

const accent = getRoleAccent('faculty')

const canvasSectionStyle = {
  padding: '22px 24px',
  border: '1px solid rgba(8, 9, 9, 0.1)',
  borderRadius: T.rCard,
} as const

// ─── NAV ICONS ────────────────────────────────────────────────────────────────

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'overview') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'classes') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  if (id === 'curriculum') return <svg {...s}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  if (id === 'assignments') return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (id === 'assessments') return <svg {...s}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  if (id === 'learners') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}

function NeutralNote({ children }: { children: ReactNode }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(11,13,15,0.02)',
      border: `1px solid ${T.lineLight}`,
      borderRadius: T.rCard,
      color: C.slate,
      fontSize: 13,
      lineHeight: 1.6,
    }}>
      {children}
    </div>
  )
}

// ─── FACULTY WORKSPACE (Level 2 — primary surface) ────────────────────────────

function FacultyWorkspace({
  courseName,
  courseContext,
  teachingCourseTitle,
  moduleCount,
  lessonCount,
  curriculumModuleTitle,
  curriculumLessonTitle,
  nextAction,
  pendingCount,
  professionalProgramCount,
  onReview,
}: {
  courseName: string
  courseContext: string
  teachingCourseTitle: string | null
  moduleCount: number | null
  lessonCount: number | null
  curriculumModuleTitle: string | null
  curriculumLessonTitle: string | null
  nextAction: string
  pendingCount: number
  professionalProgramCount: number
  onReview: () => void
}) {
  const courseLine = [
    courseName,
    teachingCourseTitle && teachingCourseTitle !== courseName ? teachingCourseTitle : null,
  ].filter(Boolean).join(' · ')

  const structureLine = [
    moduleCount != null ? `${moduleCount} modules` : null,
    lessonCount != null ? `${lessonCount} lessons` : null,
  ].filter(Boolean).join(' · ')

  const focusLine = [
    curriculumModuleTitle ? `Module · ${curriculumModuleTitle}` : null,
    curriculumLessonTitle ? `Lesson · ${curriculumLessonTitle}` : null,
  ].filter(Boolean).join(' · ')

  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', position: 'relative' }}>
      <AuroraBand themeId="data-analytics" />

      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(24px, 4vw, 36px)' }}>
        <h1 className="skylent-display-sm" style={{ color: C.ink, margin: '0 0 8px', lineHeight: 1.1 }}>
          What are you teaching today?
        </h1>
        <p style={{ color: C.slate, fontSize: 16, margin: '0 0 4px', lineHeight: 1.5 }}>
          {courseContext}
        </p>
        <p style={{ color: C.slate, fontSize: 15, margin: '0 0 4px' }}>
          {courseLine}
        </p>
        {structureLine ? (
          <p style={{ color: C.slate, fontSize: 14, margin: '0 0 4px' }}>{structureLine}</p>
        ) : (
          <p style={{ color: C.slate, fontSize: 14, margin: '0 0 4px' }}>
            Course structure will appear when a teaching course is available.
          </p>
        )}
        {focusLine ? (
          <p style={{ color: C.slate, fontSize: 13, margin: '0 0 24px' }}>{focusLine}</p>
        ) : (
          <p style={{ color: C.slate, fontSize: 13, margin: '0 0 24px' }}>
            Current module and lesson focus is not available yet.
          </p>
        )}

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '16px 24px', alignItems: 'center',
          padding: '16px 0', marginBottom: 20,
          borderTop: `1px solid ${T.lineLight}`, borderBottom: `1px solid ${T.lineLight}`,
        }}>
          <div style={{ flex: '1 1 120px', minWidth: 0 }}>
            <div style={{ color: C.slate, fontSize: 11, marginBottom: 4 }}>Pending reviews</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.ink }}>
              {pendingCount}
            </div>
            <div style={{ color: C.slate, fontSize: 11, marginTop: 2 }}>submissions waiting</div>
          </div>
          <div style={{ flex: '1 1 120px', minWidth: 0 }}>
            <div style={{ color: C.slate, fontSize: 11, marginBottom: 4 }}>Assigned programs</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.ink }}>
              {professionalProgramCount}
            </div>
            <div style={{ color: C.slate, fontSize: 11, marginTop: 2 }}>from catalog</div>
          </div>
          <div style={{ flex: '1 1 140px', minWidth: 0 }}>
            <div style={{ color: C.slate, fontSize: 11, marginBottom: 6 }}>Cohort progress</div>
            <div style={{ color: C.slate, fontSize: 12 }}>—</div>
            <div style={{ color: C.slate, fontSize: 10, marginTop: 4 }}>Requires cohort integration</div>
          </div>
          <div style={{ flex: '1 1 140px', minWidth: 0 }}>
            <div style={{ color: C.slate, fontSize: 11, marginBottom: 4 }}>Curriculum focus</div>
            <div style={{ color: C.slate, fontSize: 12 }}>
              {curriculumModuleTitle ?? 'Not assigned yet'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            onClick={onReview}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: accent.primary, color: C.black, border: 'none',
              padding: '13px 24px', borderRadius: T.rControl,
              fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
          >
            {nextAction}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <span style={{ color: C.slate, fontSize: 13 }}>
            {pendingCount > 0
              ? `${pendingCount} submission${pendingCount === 1 ? '' : 's'} ready for review`
              : 'No submissions pending review'}
          </span>
        </div>
      </div>
    </GlassSurface>
  )
}

// ─── CURRICULUM TEACHING PATH (Level 0 — canvas timeline) ─────────────────────

function CurriculumTeachingPath({ summary }: { summary: FacultyDashboard['curriculumSummary'] }) {
  if (summary.length === 0) {
    return (
      <div id="faculty-curriculum" style={{ marginTop: 'clamp(28px, 4vw, 40px)' }}>
        <div style={{ color: C.slate, fontSize: 11, letterSpacing: '0.08em', marginBottom: 16 }}>
          Curriculum workspace
        </div>
        <NeutralNote>
          Curriculum path details will appear here when teaching assignment and course modules are available from the workspace API.
        </NeutralNote>
      </div>
    )
  }

  const curriculum = summary.map((node, index) => ({
    id: `step-${index}`,
    label: node.label,
    detail: node.detail,
    status: (node.status === 'complete' || node.status === 'current' || node.status === 'upcoming'
      ? node.status
      : 'upcoming') as 'complete' | 'current' | 'upcoming',
  }))

  return (
    <div id="faculty-curriculum" style={{ marginTop: 'clamp(28px, 4vw, 40px)' }}>
      <div style={{ color: C.slate, fontSize: 11, letterSpacing: '0.08em', marginBottom: 20 }}>
        Curriculum workspace
      </div>
      <div className="faculty-path-timeline">
        {curriculum.map((node, i) => {
          const isCurrent = node.status === 'current'
          const isComplete = node.status === 'complete'
          const isLast = i === curriculum.length - 1
          return (
            <div key={node.id} className="faculty-path-step" style={{ display: 'flex', gap: 16, minHeight: isLast ? 'auto' : 52 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                <div style={{
                  width: isCurrent ? 12 : 8,
                  height: isCurrent ? 12 : 8,
                  borderRadius: '50%',
                  background: isCurrent ? accent.primary : isComplete ? accent.primary : 'rgba(11,13,15,0.12)',
                  boxShadow: isCurrent ? `0 0 16px ${accent.subtleStrong}` : 'none',
                  flexShrink: 0,
                  marginTop: 4,
                }} />
                {!isLast && (
                  <div style={{
                    width: 1, flex: 1, minHeight: 28,
                    background: isComplete ? `${accent.primary}55` : T.lineLight,
                    marginTop: 4,
                  }} />
                )}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : 20, minWidth: 0 }}>
                <div style={{
                  fontSize: isCurrent ? 14 : 13,
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? C.ink : isComplete ? C.slate : C.slate,
                }}>
                  {node.label}
                  {isCurrent && <span style={{ color: accent.text, fontSize: 11, marginLeft: 8, fontWeight: 500 }}>current</span>}
                </div>
                <div style={{
                  fontSize: 12,
                  color: isCurrent ? accent.textMuted : C.slate,
                  marginTop: 4,
                }}>
                  {node.detail}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── ASSIGNMENT REVIEW (Level 0) ──────────────────────────────────────────────

function formatSubmittedAt(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function AssignmentReview({
  submissions,
  onFocus,
}: {
  submissions: FacultySubmission[]
  onFocus: () => void
}) {
  const pendingCount = submissions.length
  const featured = submissions[0]

  return (
    <div style={canvasSectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: C.slate, fontSize: 10, letterSpacing: '0.12em', marginBottom: 8 }}>
            Assignment review
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.ink, margin: 0 }}>
            {featured?.lessonTitle ?? 'Submitted assignments'}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text }}>{pendingCount} pending</span>
        </div>
      </div>

      {submissions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {submissions.map((row, i) => (
            <div key={row.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 12,
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: i < submissions.length - 1 ? `1px solid ${T.lineLight}` : 'none',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: C.ink, fontSize: 14, fontWeight: 500 }}>{row.studentName}</div>
                <div style={{ color: C.slate, fontSize: 12, marginTop: 2 }}>
                  {row.lessonTitle}
                  {row.courseTitle ? ` · ${row.courseTitle}` : ''}
                  {row.attachmentCount > 0 ? ` · ${row.attachmentCount} attachment(s)` : ''}
                </div>
                <div style={{ color: C.slate, fontSize: 11, marginTop: 2 }}>{formatSubmittedAt(row.submittedAt)}</div>
              </div>
              <button
                type="button"
                onClick={onFocus}
                style={{
                  background: accent.subtle,
                  border: `1px solid ${accent.border}`,
                  color: accent.text,
                  padding: '7px 14px',
                  borderRadius: T.rControl,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Review
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          No submitted assignments yet. Learner submissions will appear here when available.
        </p>
      )}
    </div>
  )
}

// ─── LEARNER PROGRESS (Level 0) ───────────────────────────────────────────────

function LearnerProgress({ dashboard }: { dashboard: FacultyDashboard | null }) {
  return (
    <div style={canvasSectionStyle}>
      <div style={{ color: C.slate, fontSize: 10, letterSpacing: '0.12em', marginBottom: 18 }}>
        Learner progress
      </div>

      <div style={{ padding: '16px', background: 'rgba(11,13,15,0.02)', border: `1px solid ${T.lineLight}`, borderRadius: T.rCard }}>
        <div style={{ color: C.slate, fontSize: 13, lineHeight: 1.6 }}>
          {dashboard?.teachingScopeAvailable === false
            ? (dashboard.teachingScopeMessage ?? "Teaching scope is unavailable until faculty assignment is modeled in the backend.")
            : "Cohort completion analytics are not available yet. Learner counts, completion rates, and at-risk cohort data require a Batch/Cohort model in the backend."}
        </div>
      </div>
    </div>
  )
}

// ─── UPCOMING TEACHING (Level 0) ──────────────────────────────────────────────

function UpcomingTeaching({
  pendingCount,
  featuredLessonTitle,
}: {
  pendingCount: number
  featuredLessonTitle: string | null
}) {
  const items: Array<{ type: 'assignment' | 'note'; title: string; detail: string }> = []

  if (pendingCount > 0) {
    items.push({
      type: 'assignment',
      title: featuredLessonTitle ?? 'Submitted assignments',
      detail: `${pendingCount} submission${pendingCount === 1 ? '' : 's'} pending review`,
    })
  }

  return (
    <div style={canvasSectionStyle}>
      <div style={{ color: C.slate, fontSize: 10, letterSpacing: '0.12em', marginBottom: 18 }}>
        Upcoming teaching
      </div>
      {items.length === 0 ? (
        <NeutralNote>
          Live sessions and scheduled assessments are not available yet. Pending assignment reviews will appear here when learners submit work.
        </NeutralNote>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {items.map((item, i) => (
            <div
              key={`${item.type}-${item.title}`}
              style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'center',
                padding: '14px 0',
                borderBottom: i < items.length - 1 ? `1px solid ${T.lineLight}` : 'none',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 6,
                background: accent.subtle,
                border: `1px solid ${accent.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent.text} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: C.ink, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                <div style={{ color: C.slate, fontSize: 12, marginTop: 2 }}>{item.detail}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <NeutralNote>
              Session schedule and assessment dates are not connected yet.
            </NeutralNote>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CLASSES RAIL (Level 0) ───────────────────────────────────────────────────

function ClassesRail({
  programs,
  courses,
}: {
  programs: FacultyDashboard['programs']
  courses: FacultyDashboard['courses']
}) {
  const assignedPrograms = programs.filter(p => p.programType === 'PROFESSIONAL').slice(0, 4)
  const teachingCourse = courses.find(c => c.slug === TEACHING_COURSE_SLUG) ?? courses[0]

  return (
    <div style={{ ...canvasSectionStyle, marginTop: 20 }}>
      <div style={{ color: C.slate, fontSize: 10, letterSpacing: '0.12em', marginBottom: 18 }}>
        Assigned programs & courses
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {assignedPrograms.map((p, i) => (
          <div key={p.slug} style={{
            padding: '16px 0',
            borderBottom: i < assignedPrograms.length - 1 ? `1px solid ${T.lineLight}` : 'none',
          }}>
            <div style={{ color: C.ink, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
            <div style={{ color: C.slate, fontSize: 12 }}>{p.duration} · {p.format}</div>
            <div style={{ color: C.slate, fontSize: 11, marginTop: 6 }}>Cohort data —</div>
          </div>
        ))}
        {teachingCourse && (
          <div style={{ padding: '16px 0', borderTop: assignedPrograms.length > 0 ? `1px solid ${T.lineLight}` : 'none', marginTop: assignedPrograms.length > 0 ? 8 : 0 }}>
            <div style={{ color: accent.text, fontSize: 10, letterSpacing: '0.08em', marginBottom: 6 }}>LMS course</div>
            <div style={{ color: C.ink, fontSize: 14, fontWeight: 600 }}>{teachingCourse.title}</div>
            <div style={{ color: C.slate, fontSize: 12, marginTop: 4 }}>{teachingCourse.moduleCount} modules · {teachingCourse.lessonCount} lessons</div>
          </div>
        )}
        {assignedPrograms.length === 0 && !teachingCourse && (
          <p style={{ color: C.slate, fontSize: 13, margin: 0 }}>No programs or courses available yet.</p>
        )}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DashboardFacultyPage() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')
  const [dashboard, setDashboard] = useState<FacultyDashboard | null>(null)

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  useEffect(() => {
    if (!ready || !user) return
    fetchFacultyDashboard()
      .then(setDashboard)
      .catch(() => setDashboard(null))
  }, [ready, user])

  if (!ready || !user) return null

  const programs = dashboard?.programs ?? []
  const courses = dashboard?.courses ?? []
  const submissions = dashboard?.submissions ?? []
  const curriculumSummary = dashboard?.curriculumSummary ?? []
  const program = programs.find(p => p.slug === 'data-science-ai') ?? programs[0]
  const teachingCourse = courses.find(c => c.slug === TEACHING_COURSE_SLUG) ?? courses[0] ?? null
  const courseName = user.course || program?.name || teachingCourse?.title || 'Teaching workspace'
  const displayName = user.name || 'Faculty'
  const honorific = displayName.startsWith('Dr.') ? displayName : `Dr. ${displayName.split(' ').pop()}`
  const courseContext = `${honorific} · ${submissions.length > 0 ? 'Review recent learner submissions' : 'No submissions pending review'}`

  const curriculumModuleTitle = curriculumSummary.find(n => n.label.toLowerCase() === 'module')?.detail
    ?? null
  const curriculumLessonTitle = curriculumSummary.find(n => n.label.toLowerCase() === 'lesson')?.detail
    ?? null

  function focusAssignments() {
    setActiveNav('assignments')
    document.getElementById('faculty-assignments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <AuthDashboardShell
      themeId="data-analytics"
      workspaceLabel="Teaching"
      roleLabel="Faculty"
      navItems={NAV_ITEMS}
      bottomNavItems={NAV_ITEMS.filter(n => ['overview', 'classes', 'assignments', 'learners', 'settings'].includes(n.id))}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      <div id="faculty-overview" className="faculty-teaching-workspace">
        <AuthDashboardLayout
          primary={
            <>
              <FacultyWorkspace
                courseName={courseName}
                courseContext={courseContext}
                teachingCourseTitle={teachingCourse?.title ?? null}
                moduleCount={teachingCourse?.moduleCount ?? null}
                lessonCount={teachingCourse?.lessonCount ?? null}
                curriculumModuleTitle={curriculumModuleTitle && curriculumModuleTitle !== '—' ? curriculumModuleTitle : null}
                curriculumLessonTitle={curriculumLessonTitle && curriculumLessonTitle !== '—' ? curriculumLessonTitle : null}
                nextAction="Review submissions"
                pendingCount={submissions.length}
                professionalProgramCount={programs.filter(p => p.programType === 'PROFESSIONAL').length}
                onReview={focusAssignments}
              />
              <CurriculumTeachingPath summary={curriculumSummary} />
              <div id="faculty-assignments" style={{ marginTop: 'clamp(24px, 3vw, 32px)' }}>
                <AssignmentReview submissions={submissions} onFocus={focusAssignments} />
              </div>
              <div id="faculty-learners" style={{ marginTop: 'clamp(24px, 3vw, 32px)' }}>
                <LearnerProgress dashboard={dashboard} />
              </div>
              <div id="faculty-settings" style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.lineLight}` }}>
                <div style={{ color: C.slate, fontSize: 11, letterSpacing: '0.08em', marginBottom: 10 }}>SETTINGS</div>
                <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  Notification preferences and teaching profile settings will appear here.
                </p>
              </div>
            </>
          }
          rail={
            <>
              <div id="faculty-upcoming">
                <UpcomingTeaching
                  pendingCount={submissions.length}
                  featuredLessonTitle={submissions[0]?.lessonTitle ?? null}
                />
              </div>
              <div id="faculty-classes">
                <ClassesRail programs={programs} courses={courses} />
              </div>
            </>
          }
        />
      </div>
    </AuthDashboardShell>
  )
}
