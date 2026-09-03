import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C } from '../components/shared'
import { useAuth } from '../context/AuthContext'
import { courses } from '../data'
import { getEnrollments, getLessonProgress } from '../persistence/lmsPersistence'

const NAV_ITEMS = ['Overview', 'My Learning', 'Courses', 'Assignments', 'Career OS', 'Settings']

// ─── PROGRESS HELPERS (derived from real persisted enrollment/lesson data) ────
type EnrolledCourseSummary = {
  slug: string
  title: string
  totalLessons: number
  completedLessons: number
  percentComplete: number
  totalModules: number
  moduleIndex: number
  moduleTitle: string | null
  nextLessonTitle: string | null
  totalAssignments: number
  completedAssignments: number
  lastActivityAt: string
}

// Only course enrollments are summarised here — programs in data.ts have no
// module/lesson data to compute real progress from, so we do not fabricate
// a number for them (see src/types/lms.ts CourseProgress).
function getEnrolledCourseSummaries(userId: string): EnrolledCourseSummary[] {
  const enrollments = getEnrollments(userId).filter(e => e.courseId && e.status !== 'cancelled')
  const progress = getLessonProgress(userId)

  return enrollments.flatMap((enrollment): EnrolledCourseSummary[] => {
    const course = courses.find(c => c.slug === enrollment.courseId)
    if (!course) return []

    const lessons = course.modules.flatMap(m => m.lessons)
    const progressByLessonId = new Map(
      progress.filter(p => p.enrollmentId === enrollment.id).map(p => [p.lessonId, p]),
    )

    const completedLessons = lessons.filter(l => progressByLessonId.get(l.id)?.completedAt).length
    const nextLesson = lessons.find(l => !progressByLessonId.get(l.id)?.completedAt) ?? null
    const nextModule = nextLesson ? course.modules.find(m => m.lessons.some(l => l.id === nextLesson.id)) : undefined
    const assignments = lessons.filter(l => l.type === 'assignment')
    const completedAssignments = assignments.filter(l => progressByLessonId.get(l.id)?.completedAt).length

    const activityDates = [...progressByLessonId.values()]
      .flatMap(p => [p.startedAt, p.completedAt])
      .filter((d): d is string => Boolean(d))
      .sort()
    const lastActivityAt = activityDates[activityDates.length - 1] ?? enrollment.enrolledAt

    return [{
      slug: course.slug,
      title: course.title,
      totalLessons: lessons.length,
      completedLessons,
      percentComplete: lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0,
      totalModules: course.modules.length,
      moduleIndex: nextModule ? course.modules.indexOf(nextModule) : Math.max(course.modules.length - 1, 0),
      moduleTitle: nextModule?.title ?? null,
      nextLessonTitle: nextLesson?.title ?? null,
      totalAssignments: assignments.length,
      completedAssignments,
      lastActivityAt,
    }]
  })
}

// Honest "current streak" derived from real activity timestamps — counts
// consecutive days (ending today) that have at least one lesson-progress
// event. Returns 0 when there is no persisted activity, rather than a
// fabricated number.
function computeLearningStreakDays(userId: string): number {
  const progress = getLessonProgress(userId)
  const activeDates = new Set<string>()
  progress.forEach(p => {
    if (p.startedAt) activeDates.add(p.startedAt.slice(0, 10))
    if (p.completedAt) activeDates.add(p.completedAt.slice(0, 10))
  })
  if (activeDates.size === 0) return 0

  let streak = 0
  const cursor = new Date()
  while (activeDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 220, background: C.ink, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: C.white, letterSpacing: '0.1em' }}>SKYLENT <span style={{ color: C.orange }}>OS</span></div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '0.08em' }}>STUDENT PORTAL</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item}
            onClick={() => setActive(item)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              marginBottom: 2,
              borderRadius: 8,
              border: 'none',
              background: active === item ? 'rgba(243,107,33,0.1)' : 'transparent',
              borderLeft: active === item ? `3px solid ${C.orange}` : '3px solid transparent',
              color: active === item ? C.orange : 'rgba(255,255,255,0.5)',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontWeight: active === item ? 600 : 400,
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* User chip + logout */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}, #ff9a3c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.white, flexShrink: 0 }}>
            {user?.avatar || 'AS'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: C.white, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Arjun Sharma'}</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>Student</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

function CircleProgress({ pct, label, size = 70 }: { pct: number; label: string; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={C.orange}
          strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fill={C.white} fontSize={13} fontFamily="var(--font-mono)" fontWeight={700}>{pct}%</text>
      </svg>
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'var(--font-mono)', textAlign: 'center', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  )
}

export default function DashboardStudentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('Overview')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const name = user?.name || 'Arjun'
  const firstName = name.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (!user) return null

  const enrolledCourses = getEnrolledCourseSummaries(user.id)
  const primaryCourse = enrolledCourses.length > 0
    ? enrolledCourses.reduce((a, b) => (a.lastActivityAt >= b.lastActivityAt ? a : b))
    : null
  const streakDays = computeLearningStreakDays(user.id)
  const totalAssignments = enrolledCourses.reduce((sum, c) => sum + c.totalAssignments, 0)
  const completedAssignments = enrolledCourses.reduce((sum, c) => sum + c.completedAssignments, 0)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0e1012', fontFamily: 'var(--font-body)' }}>
      <Sidebar active={active} setActive={setActive} />

      {/* Main content */}
      <div style={{ marginLeft: 220, flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(14,16,18,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ color: C.white, fontSize: 16, fontWeight: 600 }}>{greeting}, {firstName}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}> — welcome back</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 14px' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input placeholder="Search..." style={{ background: 'none', border: 'none', outline: 'none', color: C.white, fontSize: 13, width: 160, fontFamily: 'var(--font-body)' }} />
            </div>
            {/* Bell */}
            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <div style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: '50%', background: C.orange, border: '2px solid #0e1012' }} />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '32px' }}>

          {/* Demo banner */}
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '10px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>DEMO DATA — Career Readiness scores below are illustrative; your course progress and streak reflect real activity</span>
          </div>

          {/* Next Action Banner */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `4px solid ${C.orange}`, borderRadius: 12, padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 6 }}>
                {primaryCourse ? 'CONTINUE WHERE YOU LEFT OFF' : 'GET STARTED'}
              </div>
              <div style={{ color: C.white, fontSize: 15, fontWeight: 600 }}>
                {primaryCourse
                  ? `${primaryCourse.title}${primaryCourse.nextLessonTitle ? ` — ${primaryCourse.nextLessonTitle}` : ''}`
                  : 'You are not enrolled in a course yet'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 3 }}>
                {primaryCourse
                  ? (primaryCourse.nextLessonTitle ? `${primaryCourse.completedLessons} of ${primaryCourse.totalLessons} lessons complete` : 'All lessons complete')
                  : 'Browse courses to begin your first lesson'}
              </div>
            </div>
            <Link to={primaryCourse ? `/learn/${primaryCourse.slug}` : '/courses'} style={{ background: C.orange, color: C.white, textDecoration: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >{primaryCourse ? 'Resume Learning →' : 'Browse Courses →'}</Link>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Overall Progress', value: primaryCourse ? `${primaryCourse.percentComplete}%` : '0%', sub: primaryCourse ? primaryCourse.title : 'Not enrolled yet' },
              { label: 'Learning Streak', value: String(streakDays), unit: 'days', sub: streakDays > 0 ? 'Keep it up!' : 'No activity yet' },
              { label: 'Projects Completed', value: String(completedAssignments), unit: `of ${totalAssignments}`, sub: totalAssignments > 0 ? `${totalAssignments - completedAssignments} remaining` : 'Enroll in a course to start' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 10 }}>{stat.label.toUpperCase()}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: C.white }}>{stat.value}</span>
                  {stat.unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{stat.unit}</span>}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 28 }}>
            {/* Continue Learning */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>CONTINUE LEARNING</div>
              {primaryCourse ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{primaryCourse.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                        {primaryCourse.moduleTitle ? `Module ${primaryCourse.moduleIndex + 1} of ${primaryCourse.totalModules} — ${primaryCourse.moduleTitle}` : `All ${primaryCourse.totalModules} modules complete`}
                      </div>
                    </div>
                    <Link to={`/learn/${primaryCourse.slug}`} style={{ background: 'rgba(243,107,33,0.15)', border: '1px solid rgba(243,107,33,0.3)', color: C.orange, textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>Open Course</Link>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Progress</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.orange }}>{primaryCourse.percentComplete}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ background: `linear-gradient(90deg, ${C.orange}, #ff9a3c)`, width: `${primaryCourse.percentComplete}%`, height: '100%', borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { label: 'Lessons Done', value: String(primaryCourse.completedLessons) },
                      { label: 'Lessons Left', value: String(primaryCourse.totalLessons - primaryCourse.completedLessons) },
                      { label: 'Next Up', value: primaryCourse.nextLessonTitle ?? 'All done' },
                    ].map(m => (
                      <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px' }}>
                        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{m.label.toUpperCase()}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', color: C.white, fontSize: 14, fontWeight: 600 }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 14 }}>You have not enrolled in a course yet.</div>
                  <Link to="/courses" style={{ color: C.orange, fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>Browse Courses →</Link>
                </div>
              )}
            </div>

            {/* Upcoming */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>UPCOMING</div>
              {[
                { title: 'Mock Interview', detail: 'Tomorrow · 10:00 AM', type: 'interview', urgent: false },
                { title: 'SQL Assignment', detail: 'Due in 2 days', type: 'assignment', urgent: true },
                { title: 'Live Q&A Session', detail: 'Friday · 7:00 PM', type: 'live', urgent: false },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 14, marginBottom: 14, borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: item.urgent ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${item.urgent ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.type === 'interview' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                    {item.type === 'assignment' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                    {item.type === 'live' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>}
                  </div>
                  <div>
                    <div style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>{item.title}</div>
                    <div style={{ color: item.urgent ? '#ef4444' : 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 2 }}>{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career Readiness */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 4 }}>CAREER READINESS</div>
                <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>Your job-readiness profile</div>
              </div>
              <Link to="/career-os" style={{ color: C.orange, fontSize: 12, textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>View Full Profile →</Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }}>
              <CircleProgress pct={85} label="Resume" />
              <CircleProgress pct={61} label="Interview" />
              <CircleProgress pct={74} label="Projects" />
              <CircleProgress pct={80} label="Skills" />
              <CircleProgress pct={72} label="Overall" size={80} />
            </div>
          </div>

          {/* Certificates */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px' }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 16 }}>RECENT CERTIFICATES</div>
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Complete a course to earn your first certificate</div>
              <Link to={primaryCourse ? `/learn/${primaryCourse.slug}` : '/courses'} style={{ display: 'inline-block', marginTop: 14, color: C.orange, fontSize: 12, textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>{primaryCourse ? 'Continue Learning →' : 'Browse Courses →'}</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
