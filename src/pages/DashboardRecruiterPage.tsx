import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuthDashboardShell, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useRequireRole } from '../hooks/useRequireRole'
import { useDemoState } from '../demo/DemoStateContext'

// ─── DEMO DATA (local workspace preview) ─────────────────────────────────────

type Candidate = {
  name: string
  initials: string
  role: string
  skills: string[]
  readiness: number
  certified: boolean
  experience: string
  status: 'new' | 'reviewing' | 'shortlisted' | 'interview'
}

const candidates: Candidate[] = [
  { name: 'Arjun Sharma', initials: 'AS', role: 'Data Analyst', skills: ['SQL', 'Python', 'Power BI'], readiness: 87, certified: true, experience: 'Fresher', status: 'reviewing' },
  { name: 'Meera Pillai', initials: 'MP', role: 'ML Engineer', skills: ['Python', 'TensorFlow', 'Scikit-learn'], readiness: 79, certified: true, experience: '1 yr', status: 'new' },
  { name: 'Rohan Mehta', initials: 'RM', role: 'Full Stack Developer', skills: ['React', 'Node.js', 'PostgreSQL'], readiness: 92, certified: true, experience: '2 yrs', status: 'shortlisted' },
  { name: 'Sneha Iyer', initials: 'SI', role: 'Data Analyst', skills: ['SQL', 'Excel', 'Looker'], readiness: 68, certified: false, experience: 'Fresher', status: 'new' },
  { name: 'Karan Patel', initials: 'KP', role: 'AI/ML Engineer', skills: ['Python', 'PyTorch', 'LangChain'], readiness: 83, certified: true, experience: '1 yr', status: 'reviewing' },
  { name: 'Ananya Krishnan', initials: 'AK', role: 'BI Developer', skills: ['Power BI', 'DAX', 'SQL'], readiness: 75, certified: false, experience: 'Fresher', status: 'new' },
]

const postedJobs = [
  { title: 'Junior Data Analyst', applications: 34, active: true, posted: '5 days ago', pipeline: 6 },
  { title: 'ML Engineer', applications: 18, active: true, posted: '2 days ago', pipeline: 3 },
]

const applications = [
  { candidate: 'Rohan Mehta', role: 'Junior Data Analyst', stage: 'Interview scheduled', updated: '2 days ago' },
  { candidate: 'Arjun Sharma', role: 'Junior Data Analyst', stage: 'Screening complete', updated: '4 days ago' },
  { candidate: 'Karan Patel', role: 'ML Engineer', stage: 'Application received', updated: '1 day ago' },
]

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'roles', label: 'Open roles', short: 'Roles', sectionId: 'rec-roles' },
  { id: 'candidates', label: 'Candidates', short: 'Pool', sectionId: 'rec-candidates' },
  { id: 'review', label: 'Review queue', short: 'Review', sectionId: 'rec-review' },
  { id: 'shortlist', label: 'Shortlist', short: 'List', sectionId: 'rec-shortlist' },
  { id: 'applications', label: 'Applications', short: 'Apps', sectionId: 'rec-applications' },
]

const accent = getRoleAccent('recruiter')

function NavIcon({ id }: { id: string }) {
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 }
  if (id === 'roles') return <svg {...s}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
  if (id === 'candidates') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  if (id === 'review') return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (id === 'shortlist') return <svg {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  return <svg {...s}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
}

function DemoBanner() {
  return (
    <div style={{
      padding: '12px 16px', marginBottom: 28,
      borderLeft: `3px solid ${accent.border}`,
      background: accent.subtle,
    }}>
      <div style={{ color: accent.text, fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Demo workspace</div>
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.5 }}>
        Candidate names and counts below are sample data for UI preview — not a live talent pool.
      </div>
    </div>
  )
}

function OpenRolesSection() {
  return (
    <section id="rec-roles" style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, margin: 0 }}>Open roles</h2>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{postedJobs.length} active · demo</span>
      </div>
      <div className="rec-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr>
              {['Role', 'Applications', 'In pipeline', 'Posted', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0 12px 12px 0', color: 'rgba(255,255,255,0.28)', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {postedJobs.map(j => (
              <tr key={j.title} style={{ borderTop: `1px solid ${T.lineDark}` }}>
                <td style={{ padding: '14px 12px 14px 0', color: C.white, fontSize: 14, fontWeight: 500 }}>{j.title}</td>
                <td style={{ padding: '14px 12px 14px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{j.applications}</td>
                <td style={{ padding: '14px 12px 14px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: accent.text }}>{j.pipeline}</td>
                <td style={{ padding: '14px 12px 14px 0', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{j.posted}</td>
                <td style={{ padding: '14px 0' }}>
                  <span style={{ color: '#4ade80', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ReviewQueueSection({
  filtered,
  skillFilter,
  setSkillFilter,
  readinessFilter,
  setReadinessFilter,
  onShortlist,
  shortlistedSet,
}: {
  filtered: Candidate[]
  skillFilter: string
  setSkillFilter: (s: string) => void
  readinessFilter: string
  setReadinessFilter: (s: string) => void
  onShortlist: (name: string) => void
  shortlistedSet: Set<string>
}) {
  const skillOptions = ['All', 'SQL', 'Python', 'React', 'Power BI', 'ML']
  const reviewQueue = filtered.filter(c => c.status === 'new' || c.status === 'reviewing')

  return (
    <section id="rec-review" style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, margin: 0 }}>Review queue</h2>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{reviewQueue.length} to review</span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Skills</span>
          {skillOptions.map(s => (
            <button key={s} type="button" onClick={() => setSkillFilter(s)} style={{
              padding: '5px 12px', borderRadius: T.rPill,
              border: `1px solid ${skillFilter === s ? accent.border : T.lineDark}`,
              background: skillFilter === s ? accent.subtle : 'transparent',
              color: skillFilter === s ? accent.text : 'rgba(255,255,255,0.45)',
              fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Readiness</span>
          {['All', '80%+', '60–80%'].map(r => (
            <button key={r} type="button" onClick={() => setReadinessFilter(r)} style={{
              padding: '5px 12px', borderRadius: T.rPill,
              border: `1px solid ${readinessFilter === r ? accent.border : T.lineDark}`,
              background: readinessFilter === r ? accent.subtle : 'transparent',
              color: readinessFilter === r ? accent.text : 'rgba(255,255,255,0.45)',
              fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>{r}</button>
          ))}
        </div>
      </div>

      <div id="rec-candidates" className="rec-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr>
              {['Candidate', 'Role', 'Skills', 'Readiness', 'Status', ''].map(h => (
                <th key={h || 'action'} style={{ textAlign: 'left', padding: '0 12px 12px 0', color: 'rgba(255,255,255,0.28)', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reviewQueue.map(c => {
              const isShortlisted = shortlistedSet.has(c.name)
              return (
                <tr key={c.name} style={{ borderTop: `1px solid ${T.lineDark}` }}>
                  <td style={{ padding: '14px 12px 14px 0', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: accent.subtle, border: `1px solid ${accent.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: accent.text,
                      }}>{c.initials}</div>
                      <div>
                        <div style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{c.experience}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px 14px 0', color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{c.role}</td>
                  <td style={{ padding: '14px 12px 14px 0' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {c.skills.slice(0, 3).map(s => (
                        <span key={s} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px 14px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: c.readiness >= 80 ? '#4ade80' : 'rgba(255,255,255,0.5)' }}>{c.readiness}%</td>
                  <td style={{ padding: '14px 12px 14px 0', fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{c.status}</td>
                  <td style={{ padding: '14px 0', whiteSpace: 'nowrap' }}>
                    <button type="button" onClick={() => onShortlist(c.name)} style={{
                      background: isShortlisted ? accent.subtle : 'transparent',
                      border: `1px solid ${isShortlisted ? accent.border : T.lineDark}`,
                      color: isShortlisted ? accent.text : 'rgba(255,255,255,0.5)',
                      padding: '6px 14px', borderRadius: T.rControl, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
                      fontWeight: isShortlisted ? 600 : 400,
                    }}>
                      {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ShortlistSection({ shortlistedSet, onScheduleNote }: { shortlistedSet: Set<string>; onScheduleNote: (name: string) => void }) {
  const list = candidates.filter(c => shortlistedSet.has(c.name) || c.status === 'shortlisted')

  return (
    <section id="rec-shortlist" style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, margin: '0 0 18px' }}>Shortlist</h2>
      {list.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: 0 }}>No candidates shortlisted yet. Use the review queue to add candidates.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {list.map((c, i) => (
            <div key={c.name} style={{
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
              padding: '14px 0', borderBottom: i < list.length - 1 ? `1px solid ${T.lineDark}` : 'none',
            }}>
              <div>
                <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{c.role} · {c.readiness}% readiness</div>
              </div>
              <button type="button" onClick={() => onScheduleNote(c.name)} style={{
                background: accent.subtle, border: `1px solid ${accent.border}`,
                color: accent.text, padding: '8px 14px', borderRadius: T.rControl,
                fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                Schedule interview
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ApplicationsSection() {
  return (
    <section id="rec-applications">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, margin: '0 0 18px' }}>Application status</h2>
      <div className="rec-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr>
              {['Candidate', 'Role', 'Stage', 'Updated'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0 12px 12px 0', color: 'rgba(255,255,255,0.28)', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.map(a => (
              <tr key={a.candidate + a.role} style={{ borderTop: `1px solid ${T.lineDark}` }}>
                <td style={{ padding: '14px 12px 14px 0', color: C.white, fontSize: 13, fontWeight: 500 }}>{a.candidate}</td>
                <td style={{ padding: '14px 12px 14px 0', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{a.role}</td>
                <td style={{ padding: '14px 12px 14px 0', color: accent.text, fontSize: 12 }}>{a.stage}</td>
                <td style={{ padding: '14px 0', color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{a.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function DashboardRecruiterPage() {
  const { user, ready, authorized } = useRequireRole('recruiter')
  const demo = useDemoState()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('review')
  const [skillFilter, setSkillFilter] = useState('All')
  const [readinessFilter, setReadinessFilter] = useState('All')
  const [scheduleNote, setScheduleNote] = useState<string | null>(null)

  const shortlistedSet = new Set(demo.shortlist)

  if (!ready || !authorized || !user) return null

  const filtered = candidates.filter(c => {
    const matchSkill = skillFilter === 'All' || c.skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()))
    const matchReadiness = readinessFilter === 'All'
      || (readinessFilter === '80%+' && c.readiness >= 80)
      || (readinessFilter === '60–80%' && c.readiness >= 60 && c.readiness < 80)
    return matchSkill && matchReadiness
  })

  function toggleShortlist(name: string) {
    demo.toggleShortlist(name)
  }

  return (
    <AuthDashboardShell
      themeId="career"
      accent={accent}
      workspaceLabel="Recruiter"
      roleLabel="Recruiter"
      navItems={NAV_ITEMS}
      bottomNavItems={NAV_ITEMS}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
      header={
        <div style={{ marginBottom: 8 }}>
          <h1 className="skylent-display-md" style={{ color: C.white, margin: '0 0 8px', lineHeight: 1.1 }}>Hiring workspace</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, margin: 0, maxWidth: 520 }}>
            Review candidates, manage open roles, and track application stages.
          </p>
        </div>
      }
    >
      <DemoBanner />
      {scheduleNote && (
        <div style={{ padding: '12px 16px', marginBottom: 20, borderLeft: `3px solid ${accent.border}`, background: accent.subtle }}>
          <div style={{ color: accent.text, fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Interview scheduling — demo only</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>No calendar integration exists. Scheduling for {scheduleNote} is not persisted.</div>
        </div>
      )}
      <OpenRolesSection />
      <ReviewQueueSection
        filtered={filtered}
        skillFilter={skillFilter}
        setSkillFilter={setSkillFilter}
        readinessFilter={readinessFilter}
        setReadinessFilter={setReadinessFilter}
        onShortlist={toggleShortlist}
        shortlistedSet={shortlistedSet}
      />
      <ShortlistSection shortlistedSet={shortlistedSet} onScheduleNote={name => setScheduleNote(name)} />
      <ApplicationsSection />

      <style>{`
        @media (max-width: 375px) {
          .rec-table-wrap table { font-size: 12px; }
        }
      `}</style>
    </AuthDashboardShell>
  )
}
