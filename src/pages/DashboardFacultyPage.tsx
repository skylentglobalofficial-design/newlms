import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuroraBand, GlassSurface } from '../components/foundation'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
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

const pendingCount = submissions.filter(s => s.status === 'Pending').length
const reviewedCount = submissions.filter(s => s.status === 'Reviewed').length
const avgCompletion = Math.round(courses.reduce((sum, c) => sum + c.completion, 0) / courses.length)

const canvasSectionStyle = {
  padding: '22px 24px',
  border: `1px solid ${T.lineDark}`,
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

// ─── FACULTY WORKSPACE (Level 2 — primary surface) ────────────────────────────

function FacultyWorkspace({
  courseName,
  courseContext,
  moduleTitle,
  moduleIndex,
  moduleTotal,
  lessonTitle,
  sessionContext,
  nextAction,
  onReview,
}: {
  courseName: string
  courseContext: string
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
      <AuroraBand themeId="data-analytics" />

      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(24px, 4vw, 36px)' }}>
        <h1 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 8px', lineHeight: 1.1 }}>
          Today&apos;s teaching
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 16, margin: '0 0 4px', lineHeight: 1.5 }}>
          {courseContext}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, margin: '0 0 4px' }}>
          {courseName} · {moduleTitle} · Module {moduleIndex}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, margin: '0 0 4px' }}>
          {lessonTitle}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13, margin: '0 0 24px' }}>
          {sessionContext}
        </p>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '16px 24px', alignItems: 'center',
          padding: '16px 0', marginBottom: 20,
          borderTop: `1px solid ${T.lineDark}`, borderBottom: `1px solid ${T.lineDark}`,
        }}>
          <div style={{ flex: '1 1 120px', minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 4 }}>Pending reviews</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.white }}>
              {pendingCount}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, marginTop: 2 }}>submissions waiting</div>
          </div>
          <div style={{ flex: '1 1 120px', minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 4 }}>Active classes</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.white }}>
              {courses.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, marginTop: 2 }}>this term</div>
          </div>
          <div style={{ flex: '1 1 140px', minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 6 }}>Cohort completion</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${cohortCompletion}%`, height: '100%', background: accent.primary, borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent.text, flexShrink: 0 }}>{cohortCompletion}%</span>
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 4 }}>Module {moduleIndex} of {moduleTotal}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{DEMO.currentAssignment}</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
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

// ─── CURRICULUM TEACHING PATH (Level 0 — canvas timeline) ─────────────────────

function CurriculumTeachingPath() {
  return (
    <div id="faculty-curriculum" style={{ marginTop: 'clamp(28px, 4vw, 40px)' }}>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: '0.08em', marginBottom: 20 }}>
        Curriculum workspace
      </div>
      <div className="faculty-path-timeline">
        {CURRICULUM_TEACHING.map((node, i) => {
          const isCurrent = node.status === 'current'
          const isComplete = node.status === 'complete'
          const isLast = i === CURRICULUM_TEACHING.length - 1
          return (
            <div key={node.id} className="faculty-path-step" style={{ display: 'flex', gap: 16, minHeight: isLast ? 'auto' : 52 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                <div style={{
                  width: isCurrent ? 12 : 8,
                  height: isCurrent ? 12 : 8,
                  borderRadius: '50%',
                  background: isCurrent ? accent.primary : isComplete ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)',
                  boxShadow: isCurrent ? `0 0 16px ${accent.subtleStrong}` : 'none',
                  flexShrink: 0,
                  marginTop: 4,
                }} />
                {!isLast && (
                  <div style={{
                    width: 1, flex: 1, minHeight: 28,
                    background: isComplete ? `${accent.primary}55` : T.lineDark,
                    marginTop: 4,
                  }} />
                )}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : 20, minWidth: 0 }}>
                <div style={{
                  fontSize: isCurrent ? 14 : 13,
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? C.white : isComplete ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.32)',
                }}>
                  {node.label}
                  {isCurrent && <span style={{ color: accent.text, fontSize: 11, marginLeft: 8, fontWeight: 500 }}>current</span>}
                </div>
                <div style={{
                  fontSize: 12,
                  color: isCurrent ? accent.textMuted : 'rgba(255,255,255,0.28)',
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

function AssignmentReview({ onFocus }: { onFocus: () => void }) {
  const pending = submissions.filter(s => s.status === 'Pending')

  return (
    <div style={canvasSectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.12em', marginBottom: 8 }}>
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
    </div>
  )
}

// ─── LEARNER PROGRESS (Level 0) ───────────────────────────────────────────────

function LearnerProgress({
  nudgeSent,
  onNudge,
}: {
  nudgeSent: Record<string, boolean>
  onNudge: (name: string) => void
}) {
  const distribution = courses.map(c => ({ name: c.name, completion: c.completion, students: c.students }))

  return (
    <div style={canvasSectionStyle}>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.12em', marginBottom: 18 }}>
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
    </div>
  )
}

// ─── UPCOMING TEACHING (Level 0) ──────────────────────────────────────────────

function UpcomingTeaching() {
  const items = [
    { type: 'session', title: DEMO.sessionContext, detail: DEMO.lessonTitle },
    { type: 'assessment', title: DEMO.upcomingAssessment, detail: DEMO.assessmentWhen },
    { type: 'assignment', title: DEMO.currentAssignment, detail: `${pendingCount} submissions pending review` },
  ]

  return (
    <div style={canvasSectionStyle}>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.12em', marginBottom: 18 }}>
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
    </div>
  )
}

// ─── CLASSES RAIL (Level 0) ───────────────────────────────────────────────────

function ClassesRail() {
  return (
    <div style={{ ...canvasSectionStyle, marginTop: 20 }}>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.12em', marginBottom: 18 }}>
        Your classes
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DashboardFacultyPage() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')
  const [nudgeSent, setNudgeSent] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  if (!ready || !user) return null

  const program = programs.find(p => p.slug === 'data-science-ai') ?? programs[0]
  const courseName = user.course || program?.name || 'Data Science & AI'
  const displayName = user.name || 'Dr. Priya Nair'
  const honorific = displayName.startsWith('Dr.') ? displayName : `Dr. ${displayName.split(' ').pop()}`
  const courseContext = `${honorific} · Review the pending ${DEMO.currentAssignment.toLowerCase()} submissions`

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
      <div id="faculty-overview">
        <AuthDashboardLayout
          primary={
            <>
              <FacultyWorkspace
                courseName={courseName}
                courseContext={courseContext}
                moduleTitle={DEMO.moduleTitle}
                moduleIndex={DEMO.moduleIndex}
                moduleTotal={DEMO.moduleTotal}
                lessonTitle={DEMO.lessonTitle}
                sessionContext={DEMO.sessionContext}
                nextAction="Review submissions"
                onReview={focusAssignments}
              />
              <CurriculumTeachingPath />
              <div id="faculty-assignments" style={{ marginTop: 'clamp(24px, 3vw, 32px)' }}>
                <AssignmentReview onFocus={focusAssignments} />
              </div>
              <div id="faculty-learners" style={{ marginTop: 'clamp(24px, 3vw, 32px)' }}>
                <LearnerProgress
                  nudgeSent={nudgeSent}
                  onNudge={name => setNudgeSent(prev => ({ ...prev, [name]: true }))}
                />
              </div>
              <div id="faculty-settings" style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.lineDark}` }}>
                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, letterSpacing: '0.08em', marginBottom: 10 }}>SETTINGS</div>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  Notification preferences and teaching profile settings will appear here.
                </p>
              </div>
            </>
          }
          rail={
            <>
              <div id="faculty-upcoming">
                <UpcomingTeaching />
              </div>
              <div id="faculty-classes">
                <ClassesRail />
              </div>
            </>
          }
        />
      </div>
    </AuthDashboardShell>
  )
}
