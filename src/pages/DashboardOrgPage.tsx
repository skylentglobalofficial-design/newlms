import { useState, useEffect, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
      background: 'var(--skylent-surface-elevated)',
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

const DELIVERY_PIPELINE_STEPS = [
  { step: '01 · Track Mapping', title: '6 Flagship 15-Lesson Tracks', detail: 'Data Analytics, Product Management, Python, Data Science, GenAI, and Full Stack Web.' },
  { step: '02 · Cohort Onboarding', title: 'Instant Browser Lab Access', detail: 'Zero local setup; every enrolled learner receives +50 Elixir welcome credit.' },
  { step: '03 · Two-Tier Review', title: 'Automated + 20-Min Faculty SLA', detail: 'Immediate pre-flight checks in SQL/Python/PRD labs backed by human Faculty TA review.' },
  { step: '04 · Verified Outcomes', title: '60% Career Rise & CSV Export', detail: 'Automatic Career OS unlock at 60% completion and 1-click NAAC/NIRF/L&D CSV reporting.' },
]

function InstitutionWorkspace({
  institutionName,
  institutionLearners,
  programCount,
}: {
  institutionName: string
  institutionLearners: number
  programCount: number
  batchMessage?: string
}) {
  return (
    <div id="org-overview" className="org-institution-workspace">
      <div className="org-institution-visual">
        <ProductVisual id="institution-pipeline" themeId="institution" style={{ minHeight: 240 }} />
      </div>

      <div style={{
        background: 'linear-gradient(145deg, #11152c 0%, #1e1b4b 100%)',
        border: '1px solid rgba(196, 184, 255, 0.38)',
        borderRadius: 18,
        padding: '26px 28px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: '0 18px 40px rgba(10, 14, 34, 0.22)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <p style={{ margin: 0, color: '#c4b8ff', font: '700 11px/1.4 var(--font-mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            ORGANISATION &amp; ENTERPRISE L&amp;D COMMAND CENTER · MULTI-TENANT WORKSPACE
          </p>
          <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(16, 185, 129, 0.16)', border: '1px solid rgba(52, 211, 153, 0.35)', color: '#34d399', fontSize: 11, fontWeight: 700 }}>
            ✓ 6 Tracks Live · 90 Authored Lessons
          </span>
        </div>
        <h1 className="skylent-display-md" style={{ color: '#ffffff', margin: '0 0 8px', maxWidth: 680, lineHeight: 1.08 }}>
          {institutionName}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.84)', fontSize: 14.5, margin: 0 }}>
          {programCount} published programmes · {institutionLearners} active enrollments · 60-Hour Notional Workload Standard
        </p>
      </div>

      <div style={{
        padding: '20px 22px', marginBottom: 28,
        border: `1px solid ${T.lineLight}`,
        borderLeft: `4px solid #5142B5`,
        background: 'var(--skylent-surface-elevated)',
        borderRadius: T.rCard,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ color: '#5142B5', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Institutional Delivery &amp; Cohort Readiness
          </div>
          <p style={{ color: C.ink, fontSize: 14.5, fontWeight: 600, margin: '0 0 4px' }}>
            All 6 flagship self-paced courses and in-browser execution sandboxes are active for your organisation.
          </p>
          <p style={{ color: C.slate, fontSize: 13, margin: 0, lineHeight: 1.55 }}>
            Learners progress through L1–L5 competency milestones (`15% Knowledge · 30% Execution · 20% Judgement · 15% Oral Defence · 20% V1→V2 Revision`) and unlock Career OS automatically at 60% completion.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Link to="/dashboard/college" className="sk-btn sk-btn-primary" style={{ fontSize: 13 }}>
            Open Cohort &amp; CSV Portal →
          </Link>
          <Link to="/programmes" className="sk-btn sk-btn-secondary" style={{ fontSize: 13 }}>
            Inspect Track Catalogue
          </Link>
        </div>
      </div>
    </div>
  )
}

function AcademicPipeline() {
  return (
    <div id="org-curriculum" className="org-section org-curriculum-section" style={{ marginTop: 'clamp(28px, 4vw, 40px)' }}>
      <div className="skylent-label" style={{ color: C.slate, marginBottom: 14, fontSize: 10, letterSpacing: '0.12em' }}>
        Curriculum &amp; Delivery Pipeline (L1 → L5 Competency Architecture)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
        {DELIVERY_PIPELINE_STEPS.map((item) => (
          <div key={item.step} style={{ padding: '16px 18px', borderRadius: T.rCard, background: 'var(--skylent-surface-elevated)', border: `1px solid ${T.lineLight}` }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: '#5142B5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {item.step}
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
              {item.title}
            </div>
            <p style={{ fontSize: 12.5, color: C.slate, margin: 0, lineHeight: 1.5 }}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgramOperations({ programs }: { programs: OrganisationDashboard['programs'] }) {
  return (
    <div id="org-programs" className="org-section">
      <div className="skylent-label" style={{ color: C.slate, marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Programs &amp; offerings
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
              <div style={{ color: C.slate, fontSize: 10, marginTop: 2 }}>{program.enrollmentStatus ?? 'OPEN'}</div>
            </div>
          </div>
        )) : (
          <p style={{ color: C.slate, fontSize: 13, margin: 0 }}>No programs available yet.</p>
        )}
      </div>
    </div>
  )
}

function BatchOperations({ programs }: { programs: OrganisationDashboard['programs'] }) {
  const activeCount = programs.filter(p => p.enrollmentStatus === 'open').length || programs.length || 6
  return (
    <div id="org-batches" className="org-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="skylent-label" style={{ color: C.slate, marginBottom: 8, fontSize: 10, letterSpacing: '0.12em' }}>
            Batch &amp; Cohort Standards
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.ink, margin: 0 }}>
            60-Hour Notional Workload Allocation
          </h3>
        </div>
        <span style={{ padding: '3px 10px', borderRadius: 999, background: '#EAE6FF', color: '#5142B5', fontSize: 11, fontWeight: 700 }}>
          {activeCount} Active Tracks
        </span>
      </div>

      <div id="org-batch-operations" style={{ padding: '16px', background: 'var(--skylent-surface-elevated)', border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, display: 'grid', gap: 10 }}>
        {[
          { label: 'Guided Instruction & First-Principles Readings', hours: '12 Hours (15 Lessons / Track)' },
          { label: 'Simulated Enterprise Lab Execution (Env A)', hours: '18 Hours (SQL, Python, PRD, RAG)' },
          { label: 'Applied Briefs & Capstone Project Studio', hours: '18 Hours (3 Briefs + 1 Capstone)' },
          { label: 'Oral Cold Call Defence & V1 → V2 Revision', hours: '12 Hours (5-Dimension Rubric)' },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 13, paddingBottom: 8, borderBottom: `1px solid ${T.lineLight}` }}>
            <span style={{ color: C.ink, fontWeight: 500 }}>{row.label}</span>
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#5142B5', whiteSpace: 'nowrap' }}>{row.hours}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function LearnerProgress({ enrollmentCount }: { enrollmentCount: number }) {
  return (
    <div id="org-learners" className="org-section">
      <div className="skylent-label" style={{ color: C.slate, marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Learner operations &amp; merit progression
      </div>

      <div style={{ padding: '18px', background: 'var(--skylent-surface-elevated)', border: `1px solid ${T.lineLight}`, borderRadius: T.rCard }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ color: C.slate, fontSize: 11 }}>Total enrollments</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: accent.text }}>{enrollmentCount}</div>
          </div>
          <div>
            <div style={{ color: C.slate, fontSize: 11 }}>Career Rise Gate</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: '#5142B5' }}>60%</div>
          </div>
          <div>
            <div style={{ color: C.slate, fontSize: 11 }}>Certificate Standard</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: '#0E6A44' }}>100%</div>
          </div>
        </div>
        <p style={{ color: C.slate, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          Enrolled learners earn +50 Elixir on registration, unlock Career OS portfolio &amp; role skill-matching at 60% lesson completion, and claim verifiable SKL &amp; `-PGM` credentials at 100% completion.
        </p>
      </div>
    </div>
  )
}

function FacultyOperations() {
  return (
    <div id="org-faculty" className="org-section">
      <div className="skylent-label" style={{ color: C.slate, marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Faculty &amp; Two-Tier Review SLA
      </div>
      <div style={{ padding: '18px', background: 'var(--skylent-surface-elevated)', border: `1px solid ${T.lineLight}`, borderRadius: T.rCard }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <strong style={{ fontSize: 14, color: C.ink }}>20-Minute Human Faculty TA Doubt SLA</strong>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0E6A44', background: '#E7F6EF', padding: '2px 8px', borderRadius: 999 }}>Active</span>
        </div>
        <p style={{ color: C.slate, fontSize: 13, margin: '0 0 12px', lineHeight: 1.6 }}>
          Tier 1 provides instant Socratic AI coaching (English + 1-click Hinglish mode) inside every lesson. Tier 2 escalates technical or rubric doubts directly to human Faculty TAs with a 20-minute response SLA.
        </p>
        <Link to="/dashboard/faculty" style={{ fontSize: 13, fontWeight: 700, color: '#5142B5', textDecoration: 'none' }}>
          Open Faculty TA Review Queue →
        </Link>
      </div>
    </div>
  )
}

function OrgContextRail({ programs }: { programs: OrganisationDashboard['programs'] }) {
  const topPrograms = programs.slice(0, 6)

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
              <span style={{ color: C.ink, fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{program.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text, flexShrink: 0 }}>{program.enrollmentCount} enrolled</span>
            </div>
            <div style={{ color: C.slate, fontSize: 11 }}>{program.duration} · {program.format}</div>
          </div>
        )) : (
          <p style={{ color: C.slate, fontSize: 13, margin: 0 }}>No program enrollment data yet.</p>
        )}
      </div>

      <div id="org-progress" style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.lineLight}` }}>
        <div className="skylent-label" style={{ color: C.slate, fontSize: 10, letterSpacing: '0.12em', marginBottom: 12 }}>
          5-Dimension Assessment Rubric
        </div>
        <div style={{ display: 'grid', gap: 8, fontSize: 12.5, color: C.slate }}>
          <div><strong style={{ color: C.ink }}>15%</strong> · Conceptual Knowledge Checks</div>
          <div><strong style={{ color: C.ink }}>30%</strong> · Clean-Room Lab Execution</div>
          <div><strong style={{ color: C.ink }}>20%</strong> · Commercial &amp; Product Judgement</div>
          <div><strong style={{ color: C.ink }}>15%</strong> · Timed Boardroom Oral Defence</div>
          <div><strong style={{ color: C.ink }}>20%</strong> · V1 → V2 Red-Line Revision</div>
        </div>
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

  const institutionName = dashboard?.organisation.name ?? user.institution ?? user.name ?? 'Skylent Partner Organisation'
  const institutionLearners = dashboard?.totals.enrollmentCount ?? 0
  const programCount = dashboard?.totals.programCount ?? 6
  const programs = dashboard?.programs ?? []

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
              />

              <AcademicPipeline />

              <div className="org-two-col" style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 'clamp(16px, 2vw, 24px)', marginTop: 'clamp(28px, 4vw, 40px)' }}>
                <ProgramOperations programs={programs} />
                <BatchOperations programs={programs} />
              </div>

              <div className="org-two-col" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(16px, 2vw, 24px)', marginTop: 'clamp(28px, 4vw, 40px)' }}>
                <LearnerProgress enrollmentCount={institutionLearners} />
                <FacultyOperations />
              </div>

              <div id="org-settings" style={{ marginTop: 'clamp(28px, 4vw, 40px)', paddingTop: 24, borderTop: `1px solid ${T.lineLight}` }}>
                <div className="skylent-label" style={{ color: C.slate, marginBottom: 10, fontSize: 10, letterSpacing: '0.12em' }}>
                  Institution settings
                </div>
                <p style={{ color: C.slate, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  Configure programmes, faculty assignments, and academic calendar for {institutionName}.
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
        }
      `}</style>
    </AuthDashboardShell>
  )
}
