import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuthDashboardShell, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import { useDemoState } from '../demo/DemoStateContext'
import { ProductVisual } from '../components/product/ProductVisuals'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'roles', label: 'Open roles', short: 'Roles', sectionId: 'rec-roles' },
  { id: 'candidates', label: 'Candidates', short: 'Pool', sectionId: 'rec-candidates' },
  { id: 'review', label: 'Review queue', short: 'Review', sectionId: 'rec-review' },
  { id: 'shortlist', label: 'Shortlist', short: 'List', sectionId: 'rec-shortlist' },
  { id: 'applications', label: 'Applications', short: 'Apps', sectionId: 'rec-applications' },
]

const accent = getRoleAccent('recruiter')

const sectionCardStyle = {
  padding: '16px',
  background: 'rgba(11,13,15,0.02)',
  border: `1px solid ${T.lineLight}`,
  borderRadius: T.rCard,
} as const

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

function NavIcon({ id }: { id: string }) {
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 }
  if (id === 'roles') return <svg {...s}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
  if (id === 'candidates') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  if (id === 'review') return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (id === 'shortlist') return <svg {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  return <svg {...s}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
}

function RecruiterWorkspace({ recruiterName }: { recruiterName: string }) {
  return (
    <div id="rec-overview" className="rec-workspace-header">
      <div className="rec-workspace-visual" style={{ marginBottom: 24 }}>
        <ProductVisual id="career-pipeline" themeId="career" style={{ minHeight: 220 }} />
      </div>

      <div style={{ marginBottom: 28 }}>
        <h1 className="skylent-display-md" style={{ color: C.ink, margin: '0 0 8px', maxWidth: 680, lineHeight: 1.08 }}>
          {recruiterName}
        </h1>
        <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          Hire from Role → Capability → Evidence. No fabricated candidate pools or placement claims.
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20,
      }}>
        {[
          { label: 'Role', detail: 'Open roles you need filled' },
          { label: 'Capability', detail: 'Skills that match the role' },
          { label: 'Evidence', detail: 'Projects & proof, not resumes alone' },
        ].map(step => (
          <div key={step.label} style={{
            padding: '12px 14px',
            borderLeft: `3px solid ${accent.primary}`,
            background: 'rgba(11,13,15,0.02)',
            borderRadius: T.rCard,
            border: `1px solid ${T.lineLight}`,
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: accent.text, marginBottom: 6 }}>{step.label}</div>
            <div style={{ color: C.ink, fontSize: 13, lineHeight: 1.45 }}>{step.detail}</div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '20px 18px', marginBottom: 28,
        borderTop: `1px solid ${T.lineLight}`,
        borderBottom: `1px solid ${T.lineLight}`,
        borderLeft: `3px solid ${accent.primary}`,
        background: 'rgba(11,13,15,0.02)',
        borderRadius: T.rCard,
      }}>
        <div style={{ color: accent.text, fontSize: 11, fontWeight: 500, marginBottom: 8 }}>
          What needs your attention?
        </div>
        <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          No live hiring pipeline is connected yet. Open roles, candidate capability profiles, and evidence will appear here once recruiter APIs are available.
        </p>
      </div>
    </div>
  )
}

function OpenRolesSection() {
  return (
    <section id="rec-roles" className="rec-section" style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, margin: 0 }}>Open roles</h2>
        <span style={{ color: C.slate, fontSize: 12 }}>0 active</span>
      </div>
      <NeutralNote>
        No live job postings available yet. Posted roles, application counts, and pipeline stages will show here when recruiter job data is connected.
      </NeutralNote>
    </section>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '6px 12px', borderRadius: T.rPill,
      border: `1px solid ${active ? accent.border : T.lineLight}`,
      background: active ? accent.subtle : 'transparent',
      color: active ? accent.text : C.slate,
      fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)',
    }}>
      {label}
    </button>
  )
}

function ReviewQueueSection({
  skillFilter,
  setSkillFilter,
  readinessFilter,
  setReadinessFilter,
}: {
  skillFilter: string
  setSkillFilter: (s: string) => void
  readinessFilter: string
  setReadinessFilter: (s: string) => void
}) {
  const skillOptions = ['All', 'SQL', 'Python', 'React', 'Power BI', 'ML']
  const readinessOptions = ['All', '80%+', '60–80%']

  return (
    <section id="rec-review" className="rec-section" style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, margin: 0 }}>Review queue</h2>
        <span style={{ color: C.slate, fontSize: 12 }}>0 to review</span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: C.slate, fontSize: 11 }}>Skills</span>
          {skillOptions.map(s => (
            <FilterChip key={s} label={s} active={skillFilter === s} onClick={() => setSkillFilter(s)} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: C.slate, fontSize: 11 }}>Readiness</span>
          {readinessOptions.map(r => (
            <FilterChip key={r} label={r} active={readinessFilter === r} onClick={() => setReadinessFilter(r)} />
          ))}
        </div>
      </div>

      <div id="rec-candidates">
      <NeutralNote>
        No candidates connected yet. When talent data loads, review will follow Role → Capability → Evidence — not invented readiness scores. Filters are ready for when profiles arrive.
      </NeutralNote>
      </div>
    </section>
  )
}

function ShortlistSection({
  shortlistedNames,
  onScheduleNote,
  onRemove,
}: {
  shortlistedNames: string[]
  onScheduleNote: (name: string) => void
  onRemove: (name: string) => void
}) {
  return (
    <section id="rec-shortlist" className="rec-section" style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, margin: '0 0 18px' }}>Shortlist</h2>
      {shortlistedNames.length === 0 ? (
        <NeutralNote>
          No candidates shortlisted yet. Saved shortlist entries will appear here when you mark candidates from the review queue.
        </NeutralNote>
      ) : (
        <div style={sectionCardStyle}>
          <p style={{ color: C.slate, fontSize: 12, margin: '0 0 14px', lineHeight: 1.5 }}>
            Names saved locally — full candidate profiles are not connected yet.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {shortlistedNames.map((name, i) => (
              <div key={name} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center',
                padding: '14px 0', borderBottom: i < shortlistedNames.length - 1 ? `1px solid ${T.lineLight}` : 'none',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: C.ink, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ color: C.slate, fontSize: 12, marginTop: 2 }}>Profile unavailable</div>
                </div>
                <button type="button" onClick={() => onRemove(name)} style={{
                  background: 'transparent', border: `1px solid ${T.lineLight}`,
                  color: C.slate, padding: '8px 12px', borderRadius: T.rControl,
                  fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}>
                  Remove
                </button>
                <button type="button" onClick={() => onScheduleNote(name)} style={{
                  background: accent.subtle, border: `1px solid ${accent.border}`,
                  color: accent.text, padding: '8px 14px', borderRadius: T.rControl,
                  fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                }}>
                  Schedule interview
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function ApplicationsSection() {
  return (
    <section id="rec-applications" className="rec-section">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, margin: '0 0 18px' }}>Application status</h2>
      <NeutralNote>
        No application activity yet. Candidate application stages and updates will appear here when recruiter application data is connected.
      </NeutralNote>
    </section>
  )
}

export default function DashboardRecruiterPage() {
  const { user, ready } = useAuth()
  const demo = useDemoState()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('review')
  const [skillFilter, setSkillFilter] = useState('All')
  const [readinessFilter, setReadinessFilter] = useState('All')
  const [scheduleNote, setScheduleNote] = useState<string | null>(null)

  const shortlistedNames = demo.shortlist

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  if (!ready || !user) return null

  const recruiterName = user.name ?? 'Recruiter'

  function toggleShortlist(name: string) {
    demo.toggleShortlist(name)
  }

  return (
    <AuthDashboardShell
      themeId="career"
      workspaceLabel="Recruiter"
      roleLabel="Recruiter"
      navItems={NAV_ITEMS}
      bottomNavItems={NAV_ITEMS}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      <div className="recruiter-workspace">
        <RecruiterWorkspace recruiterName={recruiterName} />

        {scheduleNote && (
          <div style={{
            padding: '14px 16px', marginBottom: 24,
            borderLeft: `3px solid ${accent.primary}`,
            background: 'rgba(11,13,15,0.02)',
            border: `1px solid ${T.lineLight}`,
            borderRadius: T.rCard,
          }}>
            <div style={{ color: accent.text, fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Interview scheduling</div>
            <p style={{ color: C.slate, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              Calendar integration is not available yet. Scheduling for {scheduleNote} is not persisted.
            </p>
          </div>
        )}

        <OpenRolesSection />
        <ReviewQueueSection
          skillFilter={skillFilter}
          setSkillFilter={setSkillFilter}
          readinessFilter={readinessFilter}
          setReadinessFilter={setReadinessFilter}
        />
        <ShortlistSection
          shortlistedNames={shortlistedNames}
          onScheduleNote={name => setScheduleNote(name)}
          onRemove={toggleShortlist}
        />
        <ApplicationsSection />
      </div>

      <style>{`
        .recruiter-workspace > * { min-width: 0; }
        .rec-section { min-width: 0; }
        @media (max-width: 600px) {
          .rec-workspace-header .skylent-display-md { font-size: clamp(1.5rem, 6vw, 2rem); }
        }
      `}</style>
    </AuthDashboardShell>
  )
}
