import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuroraBand, GlassSurface } from '../components/foundation'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import { programs } from '../data'

// ─── DEMO LEARNING STATE ──────────────────────────────────────────────────────

const LEARN_SLUG = 'data-analytics'
const DEMO = {
  moduleIndex: 3,
  moduleTotal: 18,
  moduleTitle: 'SQL for Analysis',
  lessonTitle: 'Introduction to SQL',
  lessonRemaining: '20:00',
  overallProgress: 72,
  moduleProgress: 48,
  nextLesson: 'SQL Joins',
  projectsCompleted: 3,
  projectsTotal: 6,
}

const CURRICULUM_PATH = [
  { id: 'foundation', label: 'Foundation', status: 'complete' as const },
  { id: 'sql', label: 'SQL', status: 'current' as const },
  { id: 'analysis', label: 'Data Analysis', status: 'upcoming' as const },
  { id: 'statistics', label: 'Statistics', status: 'upcoming' as const },
  { id: 'python', label: 'Python', status: 'upcoming' as const },
  { id: 'projects', label: 'Projects', status: 'upcoming' as const },
]

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', sectionId: 'student-overview' },
  { id: 'learning', label: 'My Learning', short: 'Learn', sectionId: 'student-learning' },
  { id: 'courses', label: 'Courses', short: 'Courses', sectionId: 'student-curriculum' },
  { id: 'assignments', label: 'Assignments', short: 'Tasks', sectionId: 'student-rail' },
  { id: 'career', label: 'Career OS', short: 'Career', href: '/career-os' },
  { id: 'settings', label: 'Settings', short: 'Settings', sectionId: 'student-certificates' },
]

const accent = getRoleAccent('student')

// ─── NAV ICONS ──────────────────────────────────────────────────────────────────

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

// ─── LEARNING WORKSPACE (Level 2 — primary surface) ───────────────────────────

function LearningWorkspace({
  programName,
  progress,
  learnSlug,
}: {
  programName: string
  progress: number
  learnSlug: string
}) {
  return (
    <div id="student-learning">
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', position: 'relative' }}>
      <AuroraBand themeId="data-science" />

      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(24px, 3.5vw, 36px)' }}>
        <h1 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 8px', lineHeight: 1.1 }}>
          Continue {programName}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 16, margin: '0 0 4px', lineHeight: 1.5 }}>
          {DEMO.moduleTitle} · Module {DEMO.moduleIndex}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 24px' }}>
          {DEMO.lessonTitle} · {DEMO.lessonRemaining} remaining
        </p>

        {/* Status row — embedded, not a separate metric rail */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '16px 24px', alignItems: 'center',
          padding: '16px 0', marginBottom: 20,
          borderTop: `1px solid ${T.lineDark}`, borderBottom: `1px solid ${T.lineDark}`,
        }}>
          <div style={{ flex: '1 1 140px', minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 6 }}>Program progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: accent.primary, borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent.text, flexShrink: 0 }}>{progress}%</span>
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 4 }}>Module {DEMO.moduleIndex} of {DEMO.moduleTotal}</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Next: {DEMO.nextLesson}</div>
          </div>
        </div>

        <Link
          to={`/learn/${learnSlug}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: accent.primary, color: C.black, textDecoration: 'none',
            padding: '13px 24px', borderRadius: T.rControl,
            fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
          }}
        >
          Resume learning
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
      </div>
    </GlassSurface>
    </div>
  )
}

// ─── CURRICULUM PATH (Level 0 — canvas timeline) ──────────────────────────────

function CurriculumPath() {
  return (
    <div id="student-curriculum" style={{ marginTop: 'clamp(28px, 4vw, 40px)' }}>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: '0.08em', marginBottom: 20 }}>
        Your path
      </div>
      <div className="student-path-timeline">
        {CURRICULUM_PATH.map((node, i) => {
          const isCurrent = node.status === 'current'
          const isComplete = node.status === 'complete'
          const isLast = i === CURRICULUM_PATH.length - 1
          return (
            <div key={node.id} className="student-path-step" style={{ display: 'flex', gap: 16, minHeight: isLast ? 'auto' : 48 }}>
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
                  <div style={{ width: 1, flex: 1, minHeight: 24, background: isComplete ? `${accent.primary}55` : T.lineDark, marginTop: 4 }} />
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── CONTEXT RAIL (Level 0 — bare canvas) ─────────────────────────────────────

function ContextRail({ projectTitle, projectWhat }: { projectTitle: string; projectWhat: string }) {
  const items = [
    {
      label: 'Up next',
      title: DEMO.nextLesson,
      detail: `Next in ${DEMO.moduleTitle}`,
      href: `/learn/${LEARN_SLUG}`,
    },
    {
      label: 'Assessment',
      title: 'SQL Module Quiz',
      detail: 'Not scheduled yet',
      href: `/learn/${LEARN_SLUG}`,
    },
    {
      label: 'Project',
      title: projectTitle,
      detail: projectWhat,
      href: `/learn/${LEARN_SLUG}`,
    },
    {
      label: 'Career',
      title: 'Prepare for your interview',
      detail: 'Career OS · interview prep',
      href: '/career-os',
    },
  ]

  return (
    <div id="student-rail">
      {items.map((item, i) => (
        <Link
          key={item.label}
          to={item.href}
          style={{
            display: 'block',
            padding: '16px 0',
            borderBottom: i < items.length - 1 ? `1px solid ${T.lineDark}` : 'none',
            textDecoration: 'none', color: 'inherit',
          }}
        >
          <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 10, letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase' }}>
            {item.label}
          </div>
          <div style={{ color: C.white, fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, lineHeight: 1.5 }}>{item.detail}</div>
        </Link>
      ))}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DashboardStudentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const program = programs.find(p => p.slug === 'data-science-ai') ?? programs[0]
  const programName = user?.program || program?.name || 'Data Science & AI'
  const overallProgress = user?.progress ?? DEMO.overallProgress

  const activeProject = program?.projectsDetail?.[DEMO.projectsCompleted] ?? program?.projectsDetail?.[0]
  const projectTitle = activeProject?.title ?? 'Capstone project'
  const projectWhat = activeProject?.what ?? 'Build a portfolio-ready project from your program.'

  if (!user) return null

  return (
    <AuthDashboardShell
      themeId="data-science"
      workspaceLabel="Learning"
      roleLabel="Learner"
      navItems={NAV_ITEMS}
      bottomNavItems={NAV_ITEMS.filter(n => ['overview', 'learning', 'assignments', 'career', 'settings'].includes(n.id))}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      <div id="student-overview">
        <AuthDashboardLayout
          primary={
            <>
              <LearningWorkspace
                programName={programName}
                progress={overallProgress}
                learnSlug={LEARN_SLUG}
              />
              <CurriculumPath />
              <div id="student-certificates" style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.lineDark}` }}>
                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, letterSpacing: '0.08em', marginBottom: 10 }}>CERTIFICATE</div>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 12px', lineHeight: 1.6 }}>
                  Complete your program to earn a verifiable certificate.
                </p>
                <Link to={`/learn/${LEARN_SLUG}`} style={{ color: accent.text, fontSize: 13, textDecoration: 'none' }}>
                  Continue learning →
                </Link>
              </div>
            </>
          }
          rail={<ContextRail projectTitle={projectTitle} projectWhat={projectWhat} />}
        />
      </div>
    </AuthDashboardShell>
  )
}
