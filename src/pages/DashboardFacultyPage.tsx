import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C, T } from '../tokens'
import { Aurora, GlassSurface } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { useAuth } from '../context/AuthContext'
import { programs } from '../data'

// ─── DEMO TEACHING STATE (preserved from prior dashboard) ─────────────────────

const courses = [
  { name: 'Data Science & AI', students: 52, completion: 71, lastActivity: '2h ago' },
  { name: 'Machine Learning Fundamentals', students: 44, completion: 58, lastActivity: '1d ago' },
  { name: 'Python for Data Science', students: 32, completion: 83, lastActivity: '5h ago' },
]

const submissions = [
  { student: 'Arjun Sharma', assignment: 'SQL Query Assignment', submitted: 'Today 9:41 AM', status: 'Pending' as const },
  { student: 'Meera Pillai', assignment: 'EDA Project', submitted: 'Yesterday 6:12 PM', status: 'Reviewed' as const },
  { student: 'Rohan Mehta', assignment: 'Feature Engineering', submitted: '2 days ago', status: 'Reviewed' as const },
  { student: 'Sneha Iyer', assignment: 'SQL Query Assignment', submitted: 'Today 11:03 AM', status: 'Pending' as const },
  { student: 'Karan Patel', assignment: 'Regression Model', submitted: '3 days ago', status: 'Reviewed' as const },
]

const atRisk = [
  { name: 'Vikram Nair', course: 'Data Science & AI', issue: 'No activity for 8 days', severity: 'high' as const },
  { name: 'Aditi Reddy', course: 'ML Fundamentals', issue: 'Failed quiz twice — needs support', severity: 'medium' as const },
  { name: 'Sameer Khan', course: 'Python for Data Science', issue: 'Assignment overdue by 5 days', severity: 'high' as const },
]

const DEMO = {
  moduleTitle: 'SQL for Analysis',
  moduleIndex: 3,
  moduleTotal: 18,
  lessonTitle: 'Introduction to SQL',
  sessionContext: 'Cohort A · Live session Thu 4:00 PM',
  currentAssignment: 'SQL Query Assignment',
  upcomingAssessment: 'SQL Module Quiz',
  assessmentWhen: 'Next week',
}

const CURRICULUM_TEACHING = [
  { id: 'module', label: 'Module', detail: 'SQL for Analysis', status: 'complete' as const },
  { id: 'lesson', label: 'Lesson', detail: 'Introduction to SQL', status: 'complete' as const },
  { id: 'assignment', label: 'Assignment', detail: 'SQL Query Assignment', status: 'current' as const },
  { id: 'assessment', label: 'Assessment', detail: 'SQL Module Quiz', status: 'upcoming' as const },
  { id: 'review', label: 'Review', detail: '2 pending', status: 'upcoming' as const },
]

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', short: 'Home' },
  { id: 'classes', label: 'Classes', short: 'Classes' },
  { id: 'curriculum', label: 'Curriculum', short: 'Curriculum' },
  { id: 'assignments', label: 'Assignments', short: 'Tasks' },
  { id: 'assessments', label: 'Assessments', short: 'Tests' },
  { id: 'learners', label: 'Learners', short: 'Learners' },
  { id: 'settings', label: 'Settings', short: 'Settings' },
]

const accent = getDomainAccent('data-analytics')

const pendingCount = submissions.filter(s => s.status === 'Pending').length
const reviewedCount = submissions.filter(s => s.status === 'Reviewed').length
const totalLearners = courses.reduce((sum, c) => sum + c.students, 0)
const avgCompletion = Math.round(courses.reduce((sum, c) => sum + c.completion, 0) / courses.length)

// ─── NAV ──────────────────────────────────────────────────────────────────────

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

function Sidebar({
  active,
  setActive,
  mobileOpen,
  onCloseMobile,
}: {
  active: string
  setActive: (s: string) => void
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleNav(id: string) {
    setActive(id)
    onCloseMobile()
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const content = (
    <>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${T.lineDark}` }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: C.white, letterSpacing: '-0.02em' }}>
            Skylent<span style={{ color: accent.primary }}>.</span>
          </div>
        </Link>
        <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, marginTop: 4, letterSpacing: '0.04em' }}>Teaching workspace</div>
      </div>

      <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                textAlign: 'left',
                padding: '11px 12px',
                marginBottom: 2,
                borderRadius: T.rControl,
                border: 'none',
                background: isActive ? accent.subtle : 'transparent',
                borderLeft: isActive ? `2px solid ${accent.primary}` : '2px solid transparent',
                color: isActive ? C.white : 'rgba(255,255,255,0.48)',
                fontSize: 13.5,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span style={{ color: isActive ? accent.text : 'rgba(255,255,255,0.35)', display: 'flex' }}>
                <NavIcon id={item.id} />
              </span>
              <span className="faculty-nav-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: `1px solid ${T.lineDark}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: T.rControl, border: `1px solid ${T.lineDark}` }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: C.white, flexShrink: 0,
          }}>
            {user?.avatar || 'PN'}
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div style={{ color: C.white, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Dr. Priya Nair'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Faculty</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: '100%', padding: '9px',
            background: 'transparent',
            border: `1px solid ${T.lineDark}`,
            borderRadius: T.rControl,
            color: 'rgba(255,255,255,0.45)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className="faculty-sidebar-desktop" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 236,
        background: 'rgba(5,5,5,0.92)', borderRight: `1px solid ${T.lineDark}`,
        display: 'flex', flexDirection: 'column', zIndex: 120,
      }}>
        {content}
      </aside>

      {mobileOpen && (
        <div className="faculty-mobile-overlay" onClick={onCloseMobile} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200,
          backdropFilter: 'blur(4px)',
        }} />
      )}
      <aside className={`faculty-sidebar-mobile ${mobileOpen ? 'open' : ''}`} style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
        background: 'rgba(5,5,5,0.98)', borderRight: `1px solid ${T.lineDark}`,
        display: 'flex', flexDirection: 'column', zIndex: 210,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}>
        {content}
      </aside>
    </>
  )
}

// ─── FACULTY WORKSPACE ────────────────────────────────────────────────────────

function FacultyWorkspace({
  courseName,
  moduleTitle,
  moduleIndex,
  moduleTotal,
  lessonTitle,
  sessionContext,
  nextAction,
  onReview,
}: {
  courseName: string
  moduleTitle: string
  moduleIndex: number
  moduleTotal: number
  lessonTitle: string
  sessionContext: string
  nextAction: string
  onReview: () => void
}) {
  const cohortCompletion = courses.find(c => c.name === courseName)?.completion ?? avgCompletion

  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '42%', height: '100%', pointerEvents: 'none', opacity: 0.3 }}>
        <div style={{
          position: 'absolute', inset: '10% 5% 10% 20%',
          background: `radial-gradient(ellipse at center, ${accent.primary}28 0%, transparent 70%)`,
        }} />
      </div>

      <div className="faculty-workspace-inner" style={{ position: 'relative', padding: 'clamp(24px, 4vw, 36px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent.primary }} />
              <span style={{ color: accent.text, fontSize: 11, letterSpacing: '0.08em' }}>Active class</span>
            </div>

            <h2 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 10px', lineHeight: 1.1 }}>
              {courseName}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, margin: '0 0 6px', lineHeight: 1.5 }}>
              {moduleTitle} · Module {moduleIndex}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, margin: '0 0 4px' }}>
              {lessonTitle}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13, margin: 0 }}>
              {sessionContext}
            </p>
          </div>

          <div className="faculty-workspace-stat" style={{ flexShrink: 0, textAlign: 'center', minWidth: 88 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: C.white, lineHeight: 1 }}>
              {cohortCompletion}%
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 4 }}>cohort completion</div>
          </div>
        </div>

        <div style={{ marginTop: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Module {moduleIndex} of {moduleTotal}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{pendingCount} reviews waiting</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${(moduleIndex / moduleTotal) * 100}%`, height: '100%', background: accent.secondary, borderRadius: 2 }} />
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
          <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 13 }}>
            {DEMO.currentAssignment} · {pendingCount} submissions to review
          </span>
        </div>
      </div>
    </GlassSurface>
  )
}

// ─── TEACHING RAIL ────────────────────────────────────────────────────────────

function TeachingRail({
  activeClasses,
  learners,
  pendingReviews,
  upcomingAssessment,
}: {
  activeClasses: number
  learners: number
  pendingReviews: number
  upcomingAssessment: string
}) {
  const metrics = [
    { label: 'Active classes', value: String(activeClasses), sub: 'this term' },
    { label: 'Learners', value: String(learners), sub: 'enrolled' },
    { label: 'Pending reviews', value: String(pendingReviews), sub: 'submissions' },
    { label: 'Upcoming', value: upcomingAssessment, sub: 'assessment' },
  ]

  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${T.lineDark}` }}>
        <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 12, fontSize: 10, letterSpacing: '0.12em' }}>
          Teaching load
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white }}>
            {avgCompletion}% avg completion
          </span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>across {activeClasses} classes</span>
        </div>
      </div>
      <div className="faculty-teaching-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {metrics.map((m, i) => (
          <div key={m.label} style={{
            padding: '16px 14px',
            borderRight: i < metrics.length - 1 ? `1px solid ${T.lineDark}` : 'none',
            textAlign: 'center',
            minWidth: 0,
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.white, lineHeight: 1.1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {m.value}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 4 }}>{m.label}</div>
            <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10, marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </GlassSurface>
  )
}

// ─── CURRICULUM TEACHING PATH ─────────────────────────────────────────────────

function CurriculumTeachingPath() {
  return (
    <GlassSurface level={2} padding="22px 24px">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Curriculum workspace
      </div>
      <div className="faculty-curriculum-path">
        {CURRICULUM_TEACHING.map((node, i) => {
          const isCurrent = node.status === 'current'
          const isComplete = node.status === 'complete'
          return (
            <div key={node.id} className="faculty-curriculum-node" style={{ display: 'flex', alignItems: 'center', flex: i < CURRICULUM_TEACHING.length - 1 ? '1 1 0' : '0 0 auto', minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{
                  width: isCurrent ? 36 : 28,
                  height: isCurrent ? 36 : 28,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCurrent ? accent.subtleStrong : isComplete ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isCurrent ? accent.border : isComplete ? 'rgba(255,255,255,0.2)' : T.lineDark}`,
                  boxShadow: isCurrent ? `0 0 24px ${accent.subtle}` : 'none',
                }}>
                  {isComplete ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent.text} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : isCurrent ? (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent.primary }} />
                  ) : (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                  )}
                </div>
                <span style={{
                  fontSize: isCurrent ? 12 : 11,
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? C.white : isComplete ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.32)',
                  textAlign: 'center',
                }}>
                  {node.label}
                </span>
                <span style={{
                  fontSize: 10,
                  color: isCurrent ? accent.textMuted : 'rgba(255,255,255,0.28)',
                  textAlign: 'center',
                  maxWidth: 88,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {node.detail}
                </span>
              </div>
              {i < CURRICULUM_TEACHING.length - 1 && (
                <div className="faculty-curriculum-connector" style={{
                  flex: 1, height: 1, minWidth: 8, margin: '0 4px 32px',
                  background: isComplete ? `linear-gradient(90deg, ${accent.primary}88, ${T.lineDark})` : T.lineDark,
                }} />
              )}
            </div>
          )
        })}
      </div>
    </GlassSurface>
  )
}

// ─── ASSIGNMENT REVIEW ────────────────────────────────────────────────────────

function AssignmentReview({ onFocus }: { onFocus: () => void }) {
  const pending = submissions.filter(s => s.status === 'Pending')

  return (
    <GlassSurface level={2} padding="22px 24px">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontSize: 10, letterSpacing: '0.12em' }}>
            Assignment review
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.white, margin: 0 }}>
            {DEMO.currentAssignment}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text }}>{pendingCount} pending</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{reviewedCount} reviewed</span>
        </div>
      </div>

      {pending.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {pending.map((row, i) => (
            <div key={row.student} style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 12,
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: i < pending.length - 1 ? `1px solid ${T.lineDark}` : 'none',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{row.student}</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 2 }}>{row.submitted}</div>
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
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          No pending submissions for this assignment.
        </p>
      )}

      <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${T.lineDark}` }}>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, marginBottom: 8 }}>Recent reviewed</div>
        {submissions.filter(s => s.status === 'Reviewed').slice(0, 2).map(row => (
          <div key={row.student} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', fontSize: 13 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{row.student}</span>
            <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>{row.submitted}</span>
          </div>
        ))}
      </div>
    </GlassSurface>
  )
}

// ─── LEARNER PROGRESS ─────────────────────────────────────────────────────────

function LearnerProgress({
  nudgeSent,
  onNudge,
}: {
  nudgeSent: Record<string, boolean>
  onNudge: (name: string) => void
}) {
  const distribution = courses.map(c => ({ name: c.name, completion: c.completion, students: c.students }))

  return (
    <GlassSurface level={2} padding="22px 24px">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Learner progress
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginBottom: 14 }}>Completion by class</div>
        {distribution.map(c => (
          <div key={c.name} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text, flexShrink: 0 }}>{c.completion}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${c.completion}%`, height: '100%', borderRadius: 2,
                background: c.completion >= 70 ? accent.primary : c.completion >= 50 ? '#f59e0b' : '#ef4444',
              }} />
            </div>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 4 }}>{c.students} learners</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${T.lineDark}`, paddingTop: 18 }}>
        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginBottom: 14 }}>Learners needing attention</div>
        {atRisk.map((s, i) => (
          <div key={s.name} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            background: s.severity === 'high' ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)',
            border: `1px solid ${s.severity === 'high' ? 'rgba(239,68,68,0.18)' : 'rgba(245,158,11,0.18)'}`,
            borderRadius: T.rControl,
            marginBottom: i < atRisk.length - 1 ? 10 : 0,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{s.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{s.issue}</div>
            </div>
            <button
              type="button"
              onClick={() => onNudge(s.name)}
              style={{
                background: nudgeSent[s.name] ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${nudgeSent[s.name] ? 'rgba(34,197,94,0.25)' : T.lineDark}`,
                color: nudgeSent[s.name] ? '#4ade80' : 'rgba(255,255,255,0.45)',
                padding: '6px 12px', borderRadius: T.rControl,
                fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {nudgeSent[s.name] ? 'Nudge sent' : 'Send nudge'}
            </button>
          </div>
        ))}
      </div>
    </GlassSurface>
  )
}

// ─── UPCOMING TEACHING ────────────────────────────────────────────────────────

function UpcomingTeaching() {
  const items = [
    { type: 'session', title: DEMO.sessionContext, detail: DEMO.lessonTitle },
    { type: 'assessment', title: DEMO.upcomingAssessment, detail: DEMO.assessmentWhen },
    { type: 'assignment', title: DEMO.currentAssignment, detail: `${pendingCount} submissions pending review` },
  ]

  return (
    <GlassSurface level={2} padding="22px 24px">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Upcoming teaching
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item, i) => (
          <div
            key={item.title}
            style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, alignItems: 'center',
              padding: '14px 0',
              borderBottom: i < items.length - 1 ? `1px solid ${T.lineDark}` : 'none',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: item.type === 'assessment' ? 'rgba(245,158,11,0.08)' : accent.subtle,
              border: `1px solid ${item.type === 'assessment' ? 'rgba(245,158,11,0.2)' : accent.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.type === 'session' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent.text} strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ) : item.type === 'assessment' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent.text} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: C.white, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 2 }}>{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassSurface>
  )
}

// ─── CAREER CONNECTION ────────────────────────────────────────────────────────

function CareerConnection() {
  const steps = ['Teach', 'Practice', 'Project', 'Career Proof']

  return (
    <GlassSurface level={2} padding="22px 24px">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontSize: 10, letterSpacing: '0.12em' }}>
            Learner outcomes
          </div>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 14, margin: 0, maxWidth: 400, lineHeight: 1.6 }}>
            Your teaching feeds the path from classroom work to portfolio proof and career readiness.
          </p>
        </div>
      </div>
      <div className="faculty-career-flow" style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
        {steps.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: '8px 14px', borderRadius: T.rControl,
              background: i === 0 ? accent.subtle : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === 0 ? accent.border : T.lineDark}`,
              color: i === 0 ? C.white : 'rgba(255,255,255,0.45)',
              fontSize: 12, fontWeight: i === 0 ? 600 : 400,
            }}>
              {step}
            </div>
            {i < steps.length - 1 && (
              <span style={{ color: 'rgba(255,255,255,0.2)', padding: '0 6px', fontSize: 12 }}>→</span>
            )}
          </div>
        ))}
      </div>
    </GlassSurface>
  )
}

// ─── CLASSES RAIL ─────────────────────────────────────────────────────────────

function ClassesRail() {
  return (
    <GlassSurface level={2} padding="22px 24px">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Your classes
      </div>
      <div className="faculty-classes-list" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {courses.map((c, i) => (
          <div key={c.name} style={{
            padding: '16px 0',
            borderBottom: i < courses.length - 1 ? `1px solid ${T.lineDark}` : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
              <div style={{ color: C.white, fontSize: 14, fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{c.lastActivity}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{c.students} learners</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent.text }}>{c.completion}%</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${c.completion}%`, height: '100%', background: accent.primary, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </GlassSurface>
  )
}

// ─── MOBILE BOTTOM NAV ────────────────────────────────────────────────────────

function MobileBottomNav({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const items = [
    NAV_ITEMS[0],
    NAV_ITEMS[1],
    NAV_ITEMS[3],
    NAV_ITEMS[5],
    NAV_ITEMS[6],
  ]

  return (
    <nav className="faculty-bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(5,5,5,0.94)', borderTop: `1px solid ${T.lineDark}`,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', justifyContent: 'space-around', padding: '8px 4px max(8px, env(safe-area-inset-bottom))',
    }}>
      {items.map(item => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px',
              color: isActive ? accent.text : 'rgba(255,255,255,0.38)',
            }}
          >
            <NavIcon id={item.id} />
            <span style={{ fontSize: 9, fontWeight: isActive ? 600 : 400 }}>{item.short}</span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DashboardFacultyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [nudgeSent, setNudgeSent] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const program = programs.find(p => p.slug === 'data-science-ai') ?? programs[0]
  const courseName = user.course || program?.name || 'Data Science & AI'
  const learnerCount = user.students ?? totalLearners
  const displayName = user.name || 'Dr. Priya Nair'
  const honorific = displayName.startsWith('Dr.') ? displayName : `Dr. ${displayName.split(' ').pop()}`

  function focusAssignments() {
    setActive('assignments')
    document.getElementById('faculty-assignment-review')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, fontFamily: 'var(--font-body)', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Aurora themeId="data-analytics" variant="hero" />
      </div>

      <Sidebar active={active} setActive={setActive} mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="faculty-main" style={{ position: 'relative', zIndex: 1, marginLeft: 236, minHeight: '100vh' }}>
        <header className="faculty-mobile-header" style={{
          display: 'none', position: 'sticky', top: 0, zIndex: 90,
          padding: '12px 16px', background: 'rgba(5,5,5,0.88)', borderBottom: `1px solid ${T.lineDark}`,
          backdropFilter: 'blur(12px)', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu" style={{ background: 'none', border: 'none', color: C.white, padding: 8, cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.white }}>Skylent<span style={{ color: accent.primary }}>.</span></span>
          <div style={{ width: 36 }} />
        </header>

        <main className="faculty-main-content" style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px) 100px' }}>
          {/* Hero / today */}
          <header style={{ marginBottom: 'clamp(28px, 4vw, 40px)' }}>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 12, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Good to see you
            </div>
            <h1 className="skylent-display-md" style={{ color: C.white, margin: '0 0 12px', maxWidth: 680, lineHeight: 1.08 }}>
              Today&apos;s teaching
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 'clamp(15px, 2vw, 17px)', margin: '0 0 8px', lineHeight: 1.55, maxWidth: 560 }}>
              {honorific} · {courseName}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, margin: 0 }}>
              Review the pending {DEMO.currentAssignment.toLowerCase()} submissions — {pendingCount} waiting.
            </p>
          </header>

          {/* Teaching workspace */}
          <section style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <FacultyWorkspace
              courseName={courseName}
              moduleTitle={DEMO.moduleTitle}
              moduleIndex={DEMO.moduleIndex}
              moduleTotal={DEMO.moduleTotal}
              lessonTitle={DEMO.lessonTitle}
              sessionContext={DEMO.sessionContext}
              nextAction="Review submissions"
              onReview={focusAssignments}
            />
          </section>

          {/* Teaching load */}
          <section style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <TeachingRail
              activeClasses={courses.length}
              learners={learnerCount}
              pendingReviews={pendingCount}
              upcomingAssessment={DEMO.upcomingAssessment}
            />
          </section>

          {/* Curriculum */}
          <section style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <CurriculumTeachingPath />
          </section>

          {/* Assignment review + classes */}
          <div className="faculty-two-col" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(16px, 2vw, 24px)', marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <div id="faculty-assignment-review">
              <AssignmentReview onFocus={focusAssignments} />
            </div>
            <ClassesRail />
          </div>

          {/* Learner progress + upcoming */}
          <div className="faculty-two-col" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'clamp(16px, 2vw, 24px)', marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <LearnerProgress
              nudgeSent={nudgeSent}
              onNudge={name => setNudgeSent(prev => ({ ...prev, [name]: true }))}
            />
            <UpcomingTeaching />
          </div>

          {/* Career connection */}
          <section style={{ marginBottom: 24 }}>
            <CareerConnection />
          </section>
        </main>
      </div>

      <MobileBottomNav active={active} setActive={setActive} />

      <style>{`
        .faculty-sidebar-mobile { display: none; }
        @media (max-width: 900px) {
          .faculty-sidebar-desktop { display: none !important; }
          .faculty-sidebar-mobile { display: flex !important; }
          .faculty-main { margin-left: 0 !important; }
          .faculty-mobile-header { display: flex !important; }
          .faculty-workspace-inner { padding-bottom: 28px !important; }
          .faculty-workspace-stat { display: none; }
          .faculty-two-col { grid-template-columns: 1fr !important; }
          .faculty-teaching-metrics { grid-template-columns: repeat(2, 1fr) !important; }
          .faculty-teaching-metrics > div:nth-child(2) { border-right: none !important; }
          .faculty-teaching-metrics > div:nth-child(3),
          .faculty-teaching-metrics > div:nth-child(4) { border-top: 1px solid ${T.lineDark}; }
          .faculty-curriculum-path { display: flex; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .faculty-curriculum-path::-webkit-scrollbar { display: none; }
          .faculty-curriculum-node { flex: 0 0 auto !important; }
          .faculty-curriculum-connector { min-width: 20px !important; }
        }
        @media (max-width: 600px) {
          .faculty-teaching-metrics > div { border-right: none !important; }
          .faculty-bottom-nav { display: flex !important; }
          .faculty-main-content { padding-bottom: 88px !important; }
        }
        @media (min-width: 601px) {
          .faculty-bottom-nav { display: none !important; }
        }
        @media (min-width: 901px) {
          .faculty-bottom-nav { display: none !important; }
        }
      `}</style>
    </div>
  )
}
