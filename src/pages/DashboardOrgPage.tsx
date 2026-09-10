import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
import { useAuth } from '../context/AuthContext'
import { fetchOrganisationDashboard, type OrganisationDashboard } from '../lib/organisation-api'
import { ProductVisual } from '../components/product/ProductVisuals'

const NAV_ITEMS: AuthNavItem[] = [
  { id: 'overview', label: 'Overview', short: 'Home', sectionId: 'org-overview' },
  { id: 'programs', label: 'Programs', short: 'Programs', sectionId: 'org-programs' },
  { id: 'offerings', label: 'Offerings', short: 'Offerings', sectionId: 'org-offerings' },
  { id: 'batches', label: 'Batches', short: 'Batches', sectionId: 'org-batches' },
  { id: 'learners', label: 'Learners', short: 'Learners', sectionId: 'org-learners' },
  { id: 'faculty', label: 'Faculty', short: 'Faculty', sectionId: 'org-faculty' },
  { id: 'curriculum', label: 'Curriculum', short: 'Curriculum', sectionId: 'org-curriculum' },
  { id: 'assessments', label: 'Assessments', short: 'Tests', sectionId: 'org-assessments' },
  { id: 'progress', label: 'Progress', short: 'Progress', sectionId: 'org-progress' },
  { id: 'settings', label: 'Settings', short: 'Settings', sectionId: 'org-settings' },
]

const accent = getRoleAccent('organisation')

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

// ─── NAV ICONS ────────────────────────────────────────────────────────────────

function NavIcon({ id }: { id: string }) {
  const stroke = 'currentColor'
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8 }
  if (id === 'overview') return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  if (id === 'programs') return <svg {...s}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  if (id === 'offerings') return <svg {...s}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
  if (id === 'batches') return <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  if (id === 'learners') return <svg {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  if (id === 'faculty') return <svg {...s}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
  if (id === 'curriculum') return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  if (id === 'assessments') return <svg {...s}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  if (id === 'progress') return <svg {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}

// ─── INSTITUTION WORKSPACE (Level 2 — primary surface) ────────────────────────

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
    <div id="org-overview" className="org-institution-workspace">
      <div className="org-institution-visual">
        <ProductVisual id="institution-pipeline" themeId="institution" style={{ minHeight: 240 }} />
      </div>

      <div style={{ marginBottom: 28 }}>
        <h1 className="skylent-display-md" style={{ color: C.ink, margin: '0 0 8px', maxWidth: 680, lineHeight: 1.08 }}>
          {institutionName}
        </h1>
        <p style={{ color: C.slate, fontSize: 14, margin: 0 }}>
          {programCount} programs · {institutionLearners} enrollments · backend-backed totals
        </p>
      </div>

      <div style={{
        padding: '24px 20px', marginBottom: 28,
        borderTop: `1px solid ${T.lineLight}`,
        borderBottom: `1px solid ${T.lineLight}`,
        borderLeft: `3px solid ${accent.primary}`,
        background: 'rgba(11,13,15,0.02)',
        borderRadius: T.rCard,
      }}>
        <div style={{ color: accent.text, fontSize: 11, fontWeight: 500, marginBottom: 10 }}>
          What needs your attention?
        </div>
        <p style={{ color: C.slate, fontSize: 15, margin: 0, lineHeight: 1.6 }}>
          Batch analytics unavailable. {batchMessage}
        </p>
      </div>
    </div>
  )
}

// ─── ACADEMIC PIPELINE (Level 0 — honest empty until API provides steps) ───────

function AcademicPipeline({
  batchMessage,
  catalogScopeMessage,
}: {
  batchMessage: string
  catalogScopeMessage?: string | null
}) {
  return (
    <div id="org-curriculum" className="org-section org-curriculum-section" style={{ marginTop: 'clamp(28px, 4vw, 40px)' }}>
      <div className="skylent-label" style={{ color: C.slate, marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Curriculum operations
      </div>
      <NeutralNote>
        Program → offering → batch → curriculum pipeline steps are not available from the organisation workspace yet.
        {' '}{batchMessage}
        {catalogScopeMessage ? ` ${catalogScopeMessage}` : ''}
      </NeutralNote>
    </div>
  )
}

// ─── PROGRAM OPERATIONS (Level 0) ─────────────────────────────────────────────

function ProgramOperations({ programs }: { programs: OrganisationDashboard['programs'] }) {
  return (
    <div id="org-programs" className="org-section">
      <div className="skylent-label" style={{ color: C.slate, marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Programs & offerings
      </div>

      <div id="org-offerings">
        {programs.length > 0 ? programs.map((program, i) => (
          <div key={program.slug} style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            alignItems: 'center',
            padding: '14px 0',
            borderBottom: i < programs.length - 1 ? `1px solid ${T.lineLight}` : 'none',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: C.ink, fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {program.name}
              </div>
              <div style={{ color: C.slate, fontSize: 12, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {program.duration} · {program.format}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent.text }}>{program.enrollmentCount} enrollments</div>
              <div style={{ color: C.slate, fontSize: 10, marginTop: 2 }}>{program.enrollmentStatus ?? '—'}</div>
            </div>
          </div>
        )) : (
          <p style={{ color: C.slate, fontSize: 13, margin: 0 }}>No programs available yet.</p>
        )}
      </div>
    </div>
  )
}

// ─── BATCH OPERATIONS (Level 0) ───────────────────────────────────────────────

function BatchOperations({ batchMessage }: { batchMessage: string }) {
  return (
    <div id="org-batches" className="org-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="skylent-label" style={{ color: C.slate, marginBottom: 8, fontSize: 10, letterSpacing: '0.12em' }}>
            Batch operations
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.ink, margin: 0 }}>
            Cohort performance
          </h3>
        </div>
      </div>

      <div id="org-batch-operations" style={{ padding: '16px', background: 'rgba(11,13,15,0.02)', border: `1px solid ${T.lineLight}`, borderRadius: T.rCard }}>
        <p style={{ color: C.slate, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          {batchMessage}
        </p>
      </div>
    </div>
  )
}

// ─── LEARNER PROGRESS (Level 0) ───────────────────────────────────────────────

function LearnerProgress({ enrollmentCount }: { enrollmentCount: number }) {
  return (
    <div id="org-learners" className="org-section">
      <div className="skylent-label" style={{ color: C.slate, marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Learner operations
      </div>

      <div style={{ padding: '16px', background: 'rgba(11,13,15,0.02)', border: `1px solid ${T.lineLight}`, borderRadius: T.rCard }}>
        <div style={{ color: C.slate, fontSize: 12, marginBottom: 8 }}>Total enrollments</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: accent.text }}>{enrollmentCount}</div>
        <p style={{ color: C.slate, fontSize: 13, margin: '12px 0 0', lineHeight: 1.6 }}>
          Batch-level learner distribution requires a Batch/Cohort model. Per-batch completion and at-risk analytics are not available yet.
        </p>
      </div>
    </div>
  )
}

// ─── FACULTY OPERATIONS (Level 0) ─────────────────────────────────────────────

function FacultyOperations() {
  return (
    <div id="org-faculty" className="org-section">
      <div className="skylent-label" style={{ color: C.slate, marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Faculty
      </div>
      <div style={{ padding: '16px', background: 'rgba(11,13,15,0.02)', border: `1px solid ${T.lineLight}`, borderRadius: T.rCard }}>
        <p style={{ color: C.slate, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          Faculty load and cohort assignment data are not represented in the current schema. Organisation membership is available; faculty workload analytics will require additional models.
        </p>
      </div>
    </div>
  )
}

// ─── CONTEXT RAIL (Level 0 — assessments + attention) ───────────────────────────

function OrgContextRail({ programs }: { programs: OrganisationDashboard['programs'] }) {
  const topPrograms = programs.slice(0, 5)

  return (
    <div className="org-context-rail">
      <div id="org-assessments">
        <div className="skylent-label" style={{ color: C.slate, marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
          Program enrollments
        </div>

        {topPrograms.length > 0 ? topPrograms.map((program, i) => (
          <div key={program.slug} style={{
            marginBottom: 12,
            paddingBottom: i < topPrograms.length - 1 ? 12 : 0,
            borderBottom: i < topPrograms.length - 1 ? `1px solid ${T.lineLight}` : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
              <span style={{ color: C.slate, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{program.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text, flexShrink: 0 }}>{program.enrollmentCount}</span>
            </div>
            <div style={{ color: C.slate, fontSize: 10 }}>Completion analytics —</div>
          </div>
        )) : (
          <p style={{ color: C.slate, fontSize: 13, margin: 0 }}>No program enrollment data yet.</p>
        )}
      </div>

      <div id="org-progress" style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.lineLight}` }}>
        <div style={{ color: C.slate, fontSize: 12, marginBottom: 14 }}>Attention needed</div>
        <p style={{ color: C.slate, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          Batch-level attention lists require cohort models and learner-batch relationships that are not yet in the database.
        </p>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

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
      <div className="organisation-workspace">
      <AuthDashboardLayout
        primary={
          <>
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

            <div className="org-two-col" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 'clamp(16px, 2vw, 24px)', marginTop: 'clamp(28px, 4vw, 40px)' }}>
              <ProgramOperations programs={programs} />
              <BatchOperations batchMessage={batchMessage} />
            </div>

            <div className="org-two-col" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(16px, 2vw, 24px)', marginTop: 'clamp(28px, 4vw, 40px)' }}>
              <LearnerProgress enrollmentCount={institutionLearners} />
              <FacultyOperations />
            </div>

            <div id="org-settings" style={{ marginTop: 'clamp(28px, 4vw, 40px)', paddingTop: 24, borderTop: `1px solid ${T.lineLight}` }}>
              <div className="skylent-label" style={{ color: C.slate, marginBottom: 10, fontSize: 10, letterSpacing: '0.12em' }}>
                Institution settings
              </div>
              <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                Configure programs, faculty assignments, and academic calendar for {institutionName}.
              </p>
            </div>
          </>
        }
        rail={<OrgContextRail programs={programs} />}
      />
      </div>
      <style>{`
        .org-two-col > * { min-width: 0; }
        .org-academic-pipeline { display: flex; align-items: flex-start; }
        @media (max-width: 900px) {
          .org-workspace-stat { display: none; }
          .org-two-col { grid-template-columns: 1fr !important; }
          .org-academic-pipeline { display: flex; overflow-x: auto; max-width: 100%; padding-bottom: 8px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .org-academic-pipeline::-webkit-scrollbar { display: none; }
          .org-pipeline-node { flex: 0 0 auto !important; }
          .org-pipeline-connector { min-width: 16px !important; }
          .org-batch-table-wrap { -webkit-overflow-scrolling: touch; }
        }
      `}</style>
    </AuthDashboardShell>
  )
}
