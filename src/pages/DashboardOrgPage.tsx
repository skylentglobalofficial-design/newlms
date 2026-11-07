import { useState, useEffect, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import { fetchOrganisationDashboard, type OrganisationDashboard } from '../lib/organisation-api'
import { ProductVisual } from '../components/product/ProductVisuals'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview & Pipeline', short: 'Home' },
  { id: 'programs', label: 'Programs & Offerings', short: 'Programs' },
  { id: 'batches', label: 'Batches & Cohorts', short: 'Batches' },
  { id: 'learners', label: 'Learner Analytics', short: 'Learners' },
  { id: 'faculty', label: 'Faculty Operations', short: 'Faculty' },
  { id: 'curriculum', label: '60-Hr Workload & L1–L5', short: 'Curriculum' },
  { id: 'assessments', label: 'Rubric & Assessments', short: 'Tests' },
  { id: 'settings', label: 'Institution Settings', short: 'Settings' },
]

const accent = getRoleAccent('organisation')

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: '20px 24px',
  boxShadow: '0 10px 28px -12px rgba(15, 23, 42, 0.08)',
} as const

function NeutralNote({ children }: { children: ReactNode }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      color: '#475569',
      fontSize: 13.5,
      lineHeight: 1.6,
    }}>
      {children}
    </div>
  )
}

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'overview') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'programs') return <svg {...s}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  if (id === 'batches') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  if (id === 'learners') return <svg {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  if (id === 'faculty') return <svg {...s}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
  if (id === 'curriculum') return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  if (id === 'assessments') return <svg {...s}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}

function InstitutionWorkspace({
  institutionName,
  institutionLearners,
  programCount,
  batchMessage,
}: {
  institutionName: string
  institutionLearners: number
  programCount: number
  batchMessage: string
}) {
  return (
    <div id="org-overview" className="org-institution-workspace" style={{ display: 'grid', gap: 18 }}>
      <div style={{
        background: 'linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)',
        border: '1px solid rgba(196, 184, 255, 0.42)',
        borderRadius: 18,
        padding: '26px 28px',
        color: '#ffffff',
        boxShadow: '0 18px 40px -14px rgba(59, 45, 150, 0.35)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: '0 0 8px', color: '#e9d5ff', font: '700 11px/1.4 var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              ORGANISATION &amp; ENTERPRISE L&amp;D COMMAND CENTER · MULTI-TENANT WORKSPACE
            </p>
            <h1 className="skylent-display-md" style={{ color: '#ffffff', margin: '0 0 8px', maxWidth: 680, lineHeight: 1.08 }}>
              {institutionName}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14.5, margin: 0 }}>
              {programCount} programs · {institutionLearners} enrollments · backend-backed totals
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to="/dashboard/college"
              style={{
                background: '#ffffff',
                color: '#5142b5',
                padding: '10px 16px',
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 13,
                textDecoration: 'none',
                boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
              }}
            >
              Open College NAAC / CSV Center →
            </Link>
            <Link
              to="/verify"
              style={{
                background: 'rgba(255,255,255,0.14)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.34)',
                padding: '10px 16px',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              Verify Proof Dossiers →
            </Link>
          </div>
        </div>
      </div>

      <div className="org-institution-visual">
        <ProductVisual id="institution-pipeline" themeId="institution" style={{ minHeight: 220 }} />
      </div>

      <div style={cardStyle}>
        <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
          OPERATIONAL STATUS
        </span>
        <p style={{ color: '#475569', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          {batchMessage}
        </p>
      </div>
    </div>
  )
}

function AcademicPipeline({
  batchMessage,
  catalogScopeMessage,
}: {
  batchMessage: string
  catalogScopeMessage?: string | null
}) {
  return (
    <div id="org-curriculum" style={cardStyle}>
      <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
        60-HOUR NOTIONAL WORKLOAD &amp; L1 → L5 COMPETENCY ARCHITECTURE
      </span>
      <h3 style={{ margin: '0 0 12px', fontSize: 18, color: '#0f172a' }}>Institutional Curriculum &amp; Competency Standard</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14 }}>
        {[
          ['15 Hrs · Guided Notes', 'First-Principles Reading & Concept Checks'],
          ['20 Hrs · Browser Labs', 'Northwind SQL, Python ETL & RAG Sandboxes'],
          ['15 Hrs · Capstone', '6-Task Applied Project Studio'],
          ['10 Hrs · Red-Line & Defence', 'V1 → V2 Faculty Review & Cold Call'],
        ].map(([k, v]) => (
          <div key={k} style={{ padding: 12, borderRadius: 10, background: '#f6f4ff', border: '1px solid #ddd6fe' }}>
            <strong style={{ display: 'block', fontSize: 13.5, color: '#5142b5' }}>{k}</strong>
            <span style={{ fontSize: 12, color: '#475569' }}>{v}</span>
          </div>
        ))}
      </div>
      <NeutralNote>
        Program → offering → batch → curriculum pipeline steps: {batchMessage}
        {catalogScopeMessage ? ` ${catalogScopeMessage}` : ''}
      </NeutralNote>
    </div>
  )
}

function ProgramOperations({ programs }: { programs: OrganisationDashboard['programs'] }) {
  return (
    <div id="org-programs" style={cardStyle}>
      <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
        CATALOGUE TRACKS
      </span>
      <h3 style={{ margin: '0 0 12px', fontSize: 18, color: '#0f172a' }}>Programs &amp; offerings</h3>
      <div id="org-offerings" style={{ display: 'grid', gap: 8 }}>
        {programs.length > 0 ? programs.map((program) => (
          <div key={program.slug} style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            alignItems: 'center',
            padding: '12px 14px',
            borderRadius: 10,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#0f172a', fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {program.name}
              </div>
              <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>
                {program.duration} · {program.format}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#5142b5' }}>{program.enrollmentCount} enrollments</div>
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{program.enrollmentStatus ?? 'Active'}</div>
            </div>
          </div>
        )) : (
          <p style={{ color: C.slate, fontSize: 13, margin: 0 }}>No programs available yet.</p>
        )}
      </div>
    </div>
  )
}

function BatchOperations({ batchMessage }: { batchMessage: string }) {
  return (
    <div id="org-batches" style={cardStyle}>
      <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
        BATCH &amp; COHORT TELEMETRY
      </span>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
        Cohort performance
      </h3>
      <div id="org-batch-operations" style={{ padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <p style={{ color: '#475569', fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
          {batchMessage}
        </p>
      </div>
    </div>
  )
}

function LearnerProgress({ enrollmentCount }: { enrollmentCount: number }) {
  return (
    <div id="org-learners" style={cardStyle}>
      <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
        LEARNER OPERATIONS
      </span>
      <h3 style={{ margin: '0 0 10px', fontSize: 18, color: '#0f172a' }}>Total enrollments: {enrollmentCount}</h3>
      <p style={{ color: '#475569', fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
        Batch-level learner distribution requires a Batch/Cohort model. Use the College Workspace (`/dashboard/college`) to export member-level enrolment CSVs.
      </p>
    </div>
  )
}

function FacultyOperations() {
  return (
    <div id="org-faculty" style={cardStyle}>
      <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
        FACULTY &amp; TA SLA GOVERNANCE
      </span>
      <h3 style={{ margin: '0 0 10px', fontSize: 18, color: '#0f172a' }}>Faculty Operations</h3>
      <p style={{ color: '#475569', fontSize: 13.5, margin: '0 0 12px', lineHeight: 1.6 }}>
        Assign Faculty accounts to specific courses inside the Course Builder Studio (`/dashboard/curriculum` → Tab 4: Assign Faculty TA).
      </p>
      <Link to="/dashboard/faculty" style={{ fontSize: 13, fontWeight: 700, color: '#5142b5', textDecoration: 'none' }}>
        Open Faculty TA Grading Terminal →
      </Link>
    </div>
  )
}

function OrgContextRail({ programs }: { programs: OrganisationDashboard['programs'] }) {
  const topPrograms = programs.slice(0, 5)

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div id="org-assessments" style={cardStyle}>
        <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'block', marginBottom: 8 }}>
          PROGRAM ENROLLMENTS
        </span>
        {topPrograms.length > 0 ? topPrograms.map((program, i) => (
          <div key={program.slug} style={{
            marginBottom: i < topPrograms.length - 1 ? 10 : 0,
            paddingBottom: i < topPrograms.length - 1 ? 10 : 0,
            borderBottom: i < topPrograms.length - 1 ? '1px solid #e2e8f0' : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
              <span style={{ color: '#0f172a', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{program.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#5142b5', flexShrink: 0 }}>{program.enrollmentCount}</span>
            </div>
            <div style={{ color: '#64748b', fontSize: 11 }}>5-Dimension Rubric Active</div>
          </div>
        )) : (
          <p style={{ color: C.slate, fontSize: 13, margin: 0 }}>No program enrollment data yet.</p>
        )}
      </div>

      <div id="org-progress" style={cardStyle}>
        <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
          ATTENTION &amp; SLA
        </span>
        <p style={{ color: '#475569', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          20-minute human Faculty TA SLA and V1 → V2 Capstone Red-Line reviews are active across all 6 flagship tracks.
        </p>
      </div>
    </div>
  )
}

export default function DashboardOrgPage() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')
  const [dashboard, setDashboard] = useState<OrganisationDashboard | null>(null)

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  useEffect(() => {
    if (!ready || !user) return
    fetchOrganisationDashboard()
      .then(setDashboard)
      .catch(() => setDashboard(null))
  }, [ready, user])

  if (!ready || !user) return null

  const institutionName = dashboard?.organisation.name ?? user.institution ?? user.name ?? 'Institution'
  const institutionLearners = dashboard?.totals.enrollmentCount ?? 0
  const programCount = dashboard?.totals.programCount ?? 0
  const programs = dashboard?.programs ?? []
  const batchMessage = dashboard?.batchModelRequired ?? 'Batch/Cohort model not yet in schema — batch analytics unavailable'

  return (
    <AuthDashboardShell
      themeId="institution"
      workspaceLabel="Institution"
      roleLabel="Institution"
      navItems={NAV_ITEMS}
      bottomNavItems={NAV_ITEMS.filter(n => ['overview', 'programs', 'batches', 'learners', 'settings'].includes(n.id))}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      renderNavIcon={id => <NavIcon id={id} />}
    >
      <div className="organisation-workspace" style={{ display: 'grid', gap: 20 }}>
        {/* Multi-Tab Switcher Bar */}
        <div
          role="tablist"
          aria-label="Organisation Workspace Tabs"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 14,
            background: '#f6f4ff',
            border: '1px solid #ddd6fe',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveNav(item.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: active ? '1px solid #5142b5' : '1px solid #cbd5e1',
                  background: active ? '#5142b5' : '#ffffff',
                  color: active ? '#ffffff' : '#334155',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {activeNav === 'overview' ? (
          <AuthDashboardLayout
            primary={
              <div style={{ display: 'grid', gap: 20 }}>
                <InstitutionWorkspace
                  institutionName={institutionName}
                  institutionLearners={institutionLearners}
                  programCount={programCount}
                  batchMessage={batchMessage}
                />
                <AcademicPipeline
                  batchMessage={batchMessage}
                  catalogScopeMessage={dashboard?.catalogScopeMessage}
                />
                <div className="org-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <ProgramOperations programs={programs} />
                  <BatchOperations batchMessage={batchMessage} />
                </div>
                <div className="org-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <LearnerProgress enrollmentCount={institutionLearners} />
                  <FacultyOperations />
                </div>
              </div>
            }
            rail={<OrgContextRail programs={programs} />}
          />
        ) : null}

        {activeNav === 'programs' ? <ProgramOperations programs={programs} /> : null}
        {activeNav === 'batches' ? <BatchOperations batchMessage={batchMessage} /> : null}
        {activeNav === 'learners' ? <LearnerProgress enrollmentCount={institutionLearners} /> : null}
        {activeNav === 'faculty' ? <FacultyOperations /> : null}
        {activeNav === 'curriculum' ? (
          <AcademicPipeline
            batchMessage={batchMessage}
            catalogScopeMessage={dashboard?.catalogScopeMessage}
          />
        ) : null}
        {activeNav === 'assessments' ? <OrgContextRail programs={programs} /> : null}
        {activeNav === 'settings' ? (
          <div id="org-settings" style={cardStyle}>
            <span style={{ color: '#5142b5', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              INSTITUTION SETTINGS
            </span>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>{institutionName} Configuration</h3>
            <p style={{ color: '#475569', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              Configure programs, faculty assignments, and academic calendar for {institutionName}.
            </p>
          </div>
        ) : null}
      </div>
      <style>{`
        .org-two-col > * { min-width: 0; }
        @media (max-width: 900px) {
          .org-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AuthDashboardShell>
  )
}
