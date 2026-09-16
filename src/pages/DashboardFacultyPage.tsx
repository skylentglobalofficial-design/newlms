import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { GlassSurface } from '../components/foundation'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import { fetchFacultyDashboard, type FacultyDashboard, type FacultySubmission } from '../lib/faculty-api'

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

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'overview') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'classes') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  if (id === 'curriculum') return <svg {...s}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  if (id === 'assignments') return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (id === 'assessments') return <svg {...s}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  if (id === 'learners') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}

function TeachingEmptyState({ message }: { message?: string | null }) {
  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(24px, 4vw, 36px)' }}>
        <h1 className="skylent-display-sm" style={{ color: C.ink, margin: '0 0 8px', lineHeight: 1.1 }}>
          Teaching scope
        </h1>
        <p style={{ color: C.slate, fontSize: 16, margin: '0 0 12px', lineHeight: 1.5 }}>
          No programmes or courses are assigned to your account yet.
        </p>
        <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
          {message ?? 'Faculty assignment is not modeled yet. This workspace stays empty until programmes or courses are linked to your account.'}
        </p>
      </div>
    </GlassSurface>
  )
}

function CatalogOverview({
  programCount,
  courseCount,
  pendingCount,
  onReview,
}: {
  programCount: number
  courseCount: number
  pendingCount: number
  onReview: () => void
}) {
  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(24px, 4vw, 36px)' }}>
        <h1 className="skylent-display-sm" style={{ color: C.ink, margin: '0 0 8px', lineHeight: 1.1 }}>
          Catalog overview
        </h1>
        <p style={{ color: C.slate, fontSize: 16, margin: '0 0 24px', lineHeight: 1.5 }}>
          Superadmin catalog peek — not a personal teaching assignment.
        </p>

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
            <div style={{ color: C.slate, fontSize: 11, marginBottom: 4 }}>Programs in catalog</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.ink }}>
              {programCount}
            </div>
            <div style={{ color: C.slate, fontSize: 11, marginTop: 2 }}>from catalog</div>
          </div>
          <div style={{ flex: '1 1 120px', minWidth: 0 }}>
            <div style={{ color: C.slate, fontSize: 11, marginBottom: 4 }}>Courses in catalog</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.ink }}>
              {courseCount}
            </div>
            <div style={{ color: C.slate, fontSize: 11, marginTop: 2 }}>from catalog</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onReview}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: accent.primary, color: C.white, border: 'none',
            padding: '13px 24px', borderRadius: T.rControl,
            fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
            cursor: 'pointer', transition: 'opacity 0.2s',
          }}
        >
          Review submissions
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </GlassSurface>
  )
}

function CurriculumTeachingPath({ summary }: { summary: FacultyDashboard['curriculumSummary'] }) {
  if (summary.length === 0) {
    return (
      <div id="faculty-curriculum" style={{ marginTop: 'clamp(28px, 4vw, 40px)' }}>
        <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          No teaching path is assigned yet. Curriculum steps appear here when a programme or course is linked to your account.
        </p>
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
                  color: isCurrent ? C.ink : C.slate,
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
            {featured?.lessonTitle ?? 'No submissions yet'}
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

function UpcomingTeaching({ pendingCount }: { pendingCount: number }) {
  return (
    <div style={canvasSectionStyle}>
      <div style={{ color: C.slate, fontSize: 10, letterSpacing: '0.12em', marginBottom: 18 }}>
        Upcoming teaching
      </div>
      {pendingCount > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'center', padding: '14px 0' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: accent.subtle,
            border: `1px solid ${accent.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent.text} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: C.ink, fontSize: 14, fontWeight: 500 }}>Assignment review</div>
            <div style={{ color: C.slate, fontSize: 12, marginTop: 2 }}>{pendingCount} submissions pending review</div>
          </div>
        </div>
      ) : (
        <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          No scheduled sessions, assessments, or assignments. Items appear here from assigned teaching data — not sample content.
        </p>
      )}
    </div>
  )
}

function ClassesRail({
  programs,
  courses,
  catalogPeek,
}: {
  programs: FacultyDashboard['programs']
  courses: FacultyDashboard['courses']
  catalogPeek: boolean
}) {
  return (
    <div style={{ ...canvasSectionStyle, marginTop: 20 }}>
      <div style={{ color: C.slate, fontSize: 10, letterSpacing: '0.12em', marginBottom: 18 }}>
        {catalogPeek ? 'Catalog programs & courses' : 'Assigned programs & courses'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {programs.map((p, i) => (
          <div key={p.slug} style={{
            padding: '16px 0',
            borderBottom: i < programs.length - 1 || courses.length > 0 ? `1px solid ${T.lineLight}` : 'none',
          }}>
            <div style={{ color: C.ink, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
            <div style={{ color: C.slate, fontSize: 12 }}>{p.duration} · {p.format}</div>
          </div>
        ))}
        {courses.map((course, i) => (
          <div key={course.slug} style={{ padding: '16px 0', borderBottom: i < courses.length - 1 ? `1px solid ${T.lineLight}` : 'none' }}>
            <div style={{ color: accent.text, fontSize: 10, letterSpacing: '0.08em', marginBottom: 6 }}>LMS course</div>
            <div style={{ color: C.ink, fontSize: 14, fontWeight: 600 }}>{course.title}</div>
            <div style={{ color: C.slate, fontSize: 12, marginTop: 4 }}>{course.moduleCount} modules · {course.lessonCount} lessons</div>
          </div>
        ))}
        {programs.length === 0 && courses.length === 0 && (
          <p style={{ color: C.slate, fontSize: 13, margin: 0 }}>No programmes or courses are assigned to your account yet.</p>
        )}
      </div>
    </div>
  )
}

export default function DashboardFacultyPage() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')
  const [dashboard, setDashboard] = useState<FacultyDashboard | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  useEffect(() => {
    if (!ready || !user) return
    fetchFacultyDashboard()
      .then((data) => {
        setDashboard(data)
        setLoadError(null)
      })
      .catch((err: unknown) => {
        setDashboard(null)
        setLoadError(err instanceof Error ? err.message : "Unable to load this workspace. Try again.")
      })
  }, [ready, user])

  if (!ready || !user) return null

  const programs = dashboard?.programs ?? []
  const courses = dashboard?.courses ?? []
  const submissions = dashboard?.submissions ?? []
  const curriculumSummary = dashboard?.curriculumSummary ?? []
  const teachingScopeAvailable = dashboard?.teachingScopeAvailable === true
  const catalogPeek = teachingScopeAvailable && (programs.length > 0 || courses.length > 0)

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
              {loadError ? (
                <GlassSurface level={2} padding="clamp(24px, 4vw, 36px)">
                  <h1 className="skylent-display-sm" style={{ color: C.ink, margin: '0 0 8px' }}>Teaching scope</h1>
                  <p style={{ color: C.slate, fontSize: 15, margin: '0 0 16px' }}>{loadError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      fetchFacultyDashboard()
                        .then((data) => {
                          setDashboard(data)
                          setLoadError(null)
                        })
                        .catch((err: unknown) => {
                          setLoadError(err instanceof Error ? err.message : "Unable to load this workspace. Try again.")
                        })
                    }}
                    style={{
                      background: accent.primary, color: C.white, border: 'none',
                      padding: '11px 18px', borderRadius: T.rControl, cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontWeight: 600,
                    }}
                  >
                    Try again
                  </button>
                </GlassSurface>
              ) : catalogPeek ? (
                <CatalogOverview
                  programCount={programs.length}
                  courseCount={courses.length}
                  pendingCount={submissions.length}
                  onReview={focusAssignments}
                />
              ) : (
                <TeachingEmptyState message={dashboard?.teachingScopeMessage} />
              )}
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
                <UpcomingTeaching pendingCount={submissions.length} />
              </div>
              <div id="faculty-classes">
                <ClassesRail programs={programs} courses={courses} catalogPeek={catalogPeek} />
              </div>
            </>
          }
        />
      </div>
    </AuthDashboardShell>
  )
}
