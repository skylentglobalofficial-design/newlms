import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C, T } from '../tokens'
import { Aurora, GlassSurface } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { useAuth } from '../context/AuthContext'
import { programs } from '../data'

// ─── DEMO LEARNING STATE (preserved from prior dashboard) ─────────────────────

const LEARN_SLUG = 'data-analytics'
const DEMO = {
  moduleIndex: 3,
  moduleTotal: 18,
  moduleTitle: 'SQL for Analysis',
  lessonTitle: 'Introduction to SQL',
  lessonRemaining: '20:00',
  overallProgress: 72,
  moduleProgress: 48,
  lessonsCompleted: 34,
  streakDays: 14,
  projectsCompleted: 3,
  projectsTotal: 6,
  nextLesson: 'SQL Joins',
}

const CURRICULUM_PATH = [
  { id: 'foundation', label: 'Foundation', status: 'complete' as const },
  { id: 'sql', label: 'SQL', status: 'current' as const },
  { id: 'analysis', label: 'Data Analysis', status: 'upcoming' as const },
  { id: 'statistics', label: 'Statistics', status: 'upcoming' as const },
  { id: 'python', label: 'Python', status: 'upcoming' as const },
  { id: 'projects', label: 'Projects', status: 'upcoming' as const },
]

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', short: 'Home' },
  { id: 'learning', label: 'My Learning', short: 'Learn' },
  { id: 'courses', label: 'Courses', short: 'Courses' },
  { id: 'assignments', label: 'Assignments', short: 'Tasks' },
  { id: 'career', label: 'Career OS', short: 'Career' },
  { id: 'settings', label: 'Settings', short: 'Settings' },
]

const accent = getDomainAccent('data-science')

// ─── NAV ──────────────────────────────────────────────────────────────────────

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'overview') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'learning') return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  if (id === 'courses') return <svg {...s}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  if (id === 'assignments') return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (id === 'career') return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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
    if (id === 'career') navigate('/career-os')
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
        <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, marginTop: 4, letterSpacing: '0.04em' }}>Learning workspace</div>
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
              <span className="student-nav-label">{item.label}</span>
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
            {user?.avatar || 'AS'}
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div style={{ color: C.white, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Arjun Sharma'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Learner</div>
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
      {/* Desktop sidebar */}
      <aside className="student-sidebar-desktop" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 236,
        background: 'rgba(5,5,5,0.92)', borderRight: `1px solid ${T.lineDark}`,
        display: 'flex', flexDirection: 'column', zIndex: 120,
      }}>
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="student-mobile-overlay" onClick={onCloseMobile} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200,
          backdropFilter: 'blur(4px)',
        }} />
      )}
      <aside className={`student-sidebar-mobile ${mobileOpen ? 'open' : ''}`} style={{
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

// ─── PROGRESS RAIL ────────────────────────────────────────────────────────────

function ProgressRail({
  overall,
  modulePct,
  lessonsDone,
  projectsDone,
  projectsTotal,
  streak,
}: {
  overall: number
  modulePct: number
  lessonsDone: number
  projectsDone: number
  projectsTotal: number
  streak: number
}) {
  const metrics = [
    { label: 'Program', value: `${overall}%`, sub: 'overall' },
    { label: 'Module', value: `${modulePct}%`, sub: 'SQL track' },
    { label: 'Lessons', value: String(lessonsDone), sub: 'completed' },
    { label: 'Projects', value: `${projectsDone}/${projectsTotal}`, sub: 'submitted' },
    { label: 'Streak', value: String(streak), sub: 'days' },
  ]

  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${T.lineDark}` }}>
        <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 12, fontSize: 10, letterSpacing: '0.12em' }}>
          Learning progress
        </div>
        <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${overall}%`,
            background: `linear-gradient(90deg, ${accent.primary}, ${accent.secondary})`,
            borderRadius: 3,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Program completion</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent.text }}>{overall}%</span>
        </div>
      </div>
      <div className="student-progress-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {metrics.map((m, i) => (
          <div key={m.label} style={{
            padding: '16px 14px',
            borderRight: i < metrics.length - 1 ? `1px solid ${T.lineDark}` : 'none',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.white, lineHeight: 1.1 }}>
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

// ─── CURRICULUM PATH ──────────────────────────────────────────────────────────

function CurriculumPath() {
  return (
    <GlassSurface level={2} padding="22px 24px">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Curriculum path
      </div>
      <div className="student-curriculum-path">
        {CURRICULUM_PATH.map((node, i) => {
          const isCurrent = node.status === 'current'
          const isComplete = node.status === 'complete'
          return (
            <div key={node.id} className="student-curriculum-node" style={{ display: 'flex', alignItems: 'center', flex: i < CURRICULUM_PATH.length - 1 ? '1 1 0' : '0 0 auto', minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{
                  width: isCurrent ? 36 : 28,
                  height: isCurrent ? 36 : 28,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCurrent ? accent.subtleStrong : isComplete ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isCurrent ? accent.border : isComplete ? 'rgba(255,255,255,0.2)' : T.lineDark}`,
                  boxShadow: isCurrent ? `0 0 24px ${accent.subtle}` : 'none',
                  transition: 'all 0.2s',
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
                  whiteSpace: 'nowrap',
                  maxWidth: 72,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {node.label}
                </span>
              </div>
              {i < CURRICULUM_PATH.length - 1 && (
                <div className="student-curriculum-connector" style={{
                  flex: 1, height: 1, minWidth: 8, margin: '0 4px 22px',
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

// ─── LEARNING WORKSPACE ───────────────────────────────────────────────────────

function LearningWorkspace({
  programName,
  moduleTitle,
  moduleIndex,
  moduleTotal,
  lessonTitle,
  lessonRemaining,
  progress,
  learnSlug,
}: {
  programName: string
  moduleTitle: string
  moduleIndex: number
  moduleTotal: number
  lessonTitle: string
  lessonRemaining: string
  progress: number
  learnSlug: string
}) {
  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', pointerEvents: 'none', opacity: 0.35 }}>
        <div style={{
          position: 'absolute', inset: '10% 5% 10% 20%',
          background: `radial-gradient(ellipse at center, ${accent.primary}30 0%, transparent 70%)`,
        }} />
      </div>

      <div className="student-workspace-inner" style={{ position: 'relative', padding: 'clamp(24px, 4vw, 36px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent.primary }} />
              <span style={{ color: accent.text, fontSize: 11, letterSpacing: '0.08em' }}>In progress</span>
            </div>

            <h2 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 10px', lineHeight: 1.1 }}>
              {programName}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, margin: '0 0 6px', lineHeight: 1.5 }}>
              {moduleTitle} · Module {moduleIndex}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, margin: 0 }}>
              {lessonTitle} · {lessonRemaining} remaining
            </p>
          </div>

          <div className="student-workspace-ring" style={{ flexShrink: 0, textAlign: 'center' }}>
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle
                cx="44" cy="44" r="36" fill="none"
                stroke={accent.primary}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(progress / 100) * 226} 226`}
                transform="rotate(-90 44 44)"
              />
              <text x="44" y="48" textAnchor="middle" fill={C.white} fontSize="18" fontFamily="var(--font-display)" fontWeight="600">{progress}%</text>
            </svg>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 4 }}>program</div>
          </div>
        </div>

        <div style={{ marginTop: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Module {moduleIndex} of {moduleTotal}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Next: {DEMO.nextLesson}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${DEMO.moduleProgress}%`, height: '100%', background: accent.secondary, borderRadius: 2 }} />
          </div>
        </div>

        <Link
          to={`/learn/${learnSlug}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.orange, color: C.white, textDecoration: 'none',
            padding: '13px 24px', borderRadius: T.rControl,
            fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
            transition: 'opacity 0.2s',
          }}
        >
          Resume learning
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
      </div>
    </GlassSurface>
  )
}

// ─── PROJECT PROOF ────────────────────────────────────────────────────────────

type ProjectItem = {
  title: string
  what: string
  skills: string[]
  difficulty: string
  status: 'completed' | 'in_progress' | 'upcoming'
}

function ProjectProof({ projects }: { projects: ProjectItem[] }) {
  return (
    <GlassSurface level={2} padding="22px 24px">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 }}>
        <div>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontSize: 10, letterSpacing: '0.12em' }}>
            Build / proof
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.white, margin: 0 }}>
            Portfolio work from your program
          </h3>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
          {DEMO.projectsCompleted}/{DEMO.projectsTotal}
        </span>
      </div>

      <div className="student-project-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {projects.map((p, i) => (
          <div key={p.title} style={{
            padding: '16px 18px',
            background: p.status === 'in_progress' ? accent.subtle : 'rgba(255,255,255,0.02)',
            border: `1px solid ${p.status === 'in_progress' ? accent.border : T.lineDark}`,
            borderRadius: T.rControl,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.white }}>{p.title}</div>
              <span style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 4, flexShrink: 0,
                background: p.status === 'completed' ? 'rgba(34,197,94,0.12)' : p.status === 'in_progress' ? accent.subtleStrong : 'rgba(255,255,255,0.04)',
                color: p.status === 'completed' ? '#4ade80' : p.status === 'in_progress' ? accent.text : 'rgba(255,255,255,0.35)',
                border: `1px solid ${p.status === 'completed' ? 'rgba(34,197,94,0.25)' : p.status === 'in_progress' ? accent.border : T.lineDark}`,
              }}>
                {p.status === 'completed' ? 'Complete' : p.status === 'in_progress' ? 'In progress' : 'Upcoming'}
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13, lineHeight: 1.55, margin: '0 0 10px' }}>{p.what}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {p.skills.slice(0, 4).map(s => (
                <span key={s} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: `1px solid ${T.lineDark}` }}>
                  {s}
                </span>
              ))}
            </div>
            {p.status === 'in_progress' && i === projects.findIndex(x => x.status === 'in_progress') && (
              <div style={{ marginTop: 12, fontSize: 12, color: accent.text }}>Continue project brief →</div>
            )}
          </div>
        ))}
      </div>
    </GlassSurface>
  )
}

// ─── NEXT ACTION / UPCOMING ───────────────────────────────────────────────────

function UpcomingWork() {
  const items = [
    { type: 'lesson', title: DEMO.nextLesson, detail: 'Next in SQL for Analysis', action: `/learn/${LEARN_SLUG}` },
    { type: 'assignment', title: 'SQL Assignment', detail: 'Due in 2 days', action: `/learn/${LEARN_SLUG}` },
  ]

  return (
    <GlassSurface level={2} padding="22px 24px">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Upcoming work
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item, i) => (
          <Link
            key={item.title}
            to={item.action}
            style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
              padding: '14px 0',
              borderBottom: i < items.length - 1 ? `1px solid ${T.lineDark}` : 'none',
              textDecoration: 'none', color: 'inherit',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: item.type === 'assignment' ? 'rgba(239,68,68,0.08)' : accent.subtle,
              border: `1px solid ${item.type === 'assignment' ? 'rgba(239,68,68,0.2)' : accent.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.type === 'assignment' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent.text} strokeWidth="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              )}
            </div>
            <div>
              <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 2 }}>{item.detail}</div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 16 }}>→</span>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${T.lineDark}` }}>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, marginBottom: 4 }}>Assessment</div>
        <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13 }}>No scheduled assessments yet — they appear here when your cohort assigns them.</div>
      </div>
    </GlassSurface>
  )
}

// ─── CAREER CONNECTION ────────────────────────────────────────────────────────

function CareerConnection() {
  const steps = ['Learning', 'Project', 'Proof', 'Career']

  return (
    <GlassSurface level={2} padding="22px 24px">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontSize: 10, letterSpacing: '0.12em' }}>
            Career connection
          </div>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 14, margin: 0, maxWidth: 360, lineHeight: 1.6 }}>
            Career OS unlocks after your Professional Program. Your projects become portfolio proof.
          </p>
        </div>
        <Link to="/career-os" style={{ color: accent.text, fontSize: 13, textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}>
          Open Career OS →
        </Link>
      </div>
      <div className="student-career-flow" style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
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

// ─── MOBILE BOTTOM NAV ────────────────────────────────────────────────────────

function MobileBottomNav({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const navigate = useNavigate()
  const items = NAV_ITEMS.slice(0, 5)

  return (
    <nav className="student-bottom-nav" style={{
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
            onClick={() => {
              setActive(item.id)
              if (item.id === 'career') navigate('/career-os')
            }}
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

export default function DashboardStudentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const program = programs.find(p => p.slug === 'data-science-ai') ?? programs[0]
  const programName = user?.program || program?.name || 'Data Science & AI'
  const overallProgress = user?.progress ?? DEMO.overallProgress

  const allProjects: ProjectItem[] = (program?.projectsDetail ?? []).map((p, i): ProjectItem => ({
    title: p.title,
    what: p.what,
    skills: p.skills,
    difficulty: p.difficulty,
    status: i < DEMO.projectsCompleted ? 'completed' : i === DEMO.projectsCompleted ? 'in_progress' : 'upcoming',
  }))
  const projectStart = Math.max(0, DEMO.projectsCompleted - 1)
  const projectItems = allProjects.slice(projectStart, projectStart + 3)

  if (!user) return null

  const firstName = (user.name || 'Learner').split(' ')[0]

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, fontFamily: 'var(--font-body)', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Aurora themeId="data-science" variant="hero" />
      </div>

      <Sidebar active={active} setActive={setActive} mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="student-main" style={{ position: 'relative', zIndex: 1, marginLeft: 236, minHeight: '100vh' }}>
        {/* Mobile top bar */}
        <header className="student-mobile-header" style={{
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

        <main className="student-main-content" style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px) 100px' }}>
          {/* Hero / current state */}
          <header style={{ marginBottom: 'clamp(28px, 4vw, 40px)' }}>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 12, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {firstName}&apos;s workspace
            </div>
            <h1 className="skylent-display-md" style={{ color: C.white, margin: '0 0 12px', maxWidth: 640, lineHeight: 1.08 }}>
              Continue {programName}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 'clamp(15px, 2vw, 17px)', margin: '0 0 8px', lineHeight: 1.55, maxWidth: 520 }}>
              {DEMO.moduleTitle} · Module {DEMO.moduleIndex}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, margin: 0 }}>
              Pick up where you stopped — {DEMO.lessonTitle}
            </p>
          </header>

          {/* Primary learning workspace */}
          <section style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <LearningWorkspace
              programName={programName}
              moduleTitle={DEMO.moduleTitle}
              moduleIndex={DEMO.moduleIndex}
              moduleTotal={DEMO.moduleTotal}
              lessonTitle={DEMO.lessonTitle}
              lessonRemaining={DEMO.lessonRemaining}
              progress={overallProgress}
              learnSlug={LEARN_SLUG}
            />
          </section>

          {/* Progress rail */}
          <section style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <ProgressRail
              overall={overallProgress}
              modulePct={DEMO.moduleProgress}
              lessonsDone={DEMO.lessonsCompleted}
              projectsDone={DEMO.projectsCompleted}
              projectsTotal={DEMO.projectsTotal}
              streak={DEMO.streakDays}
            />
          </section>

          {/* Curriculum path */}
          <section style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <CurriculumPath />
          </section>

          {/* Projects + upcoming */}
          <div className="student-two-col" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'clamp(16px, 2vw, 24px)', marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <ProjectProof projects={projectItems} />
            <UpcomingWork />
          </div>

          {/* Career */}
          <section style={{ marginBottom: 24 }}>
            <CareerConnection />
          </section>

          {/* Certificates — honest empty */}
          <GlassSurface level={3} padding="28px 24px" style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, letterSpacing: '0.1em', marginBottom: 12 }}>CERTIFICATES</div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>
              Complete your program to earn a verifiable certificate.
            </p>
            <Link to={`/learn/${LEARN_SLUG}`} style={{ color: accent.text, fontSize: 13, textDecoration: 'none' }}>
              Continue learning →
            </Link>
          </GlassSurface>
        </main>
      </div>

      <MobileBottomNav active={active} setActive={setActive} />

      <style>{`
        .student-sidebar-mobile { display: none; }
        @media (max-width: 900px) {
          .student-sidebar-desktop { display: none !important; }
          .student-sidebar-mobile { display: flex !important; }
          .student-main { margin-left: 0 !important; }
          .student-mobile-header { display: flex !important; }
          .student-workspace-inner { padding-bottom: 28px !important; }
          .student-workspace-ring { display: none; }
          .student-two-col { grid-template-columns: 1fr !important; }
          .student-progress-metrics { grid-template-columns: repeat(3, 1fr) !important; }
          .student-progress-metrics > div:nth-child(4),
          .student-progress-metrics > div:nth-child(5) { border-top: 1px solid ${T.lineDark}; }
          .student-curriculum-path { display: flex; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .student-curriculum-path::-webkit-scrollbar { display: none; }
          .student-curriculum-node { flex: 0 0 auto !important; }
          .student-curriculum-connector { min-width: 20px !important; }
        }
        @media (max-width: 600px) {
          .student-progress-metrics { grid-template-columns: repeat(2, 1fr) !important; }
          .student-progress-metrics > div { border-right: none !important; border-bottom: 1px solid ${T.lineDark}; }
          .student-progress-metrics > div:last-child { border-bottom: none; }
          .student-bottom-nav { display: flex !important; }
          .student-main-content { padding-bottom: 88px !important; }
        }
        @media (min-width: 601px) {
          .student-bottom-nav { display: none !important; }
        }
        @media (min-width: 901px) {
          .student-bottom-nav { display: none !important; }
        }
      `}</style>
    </div>
  )
}
