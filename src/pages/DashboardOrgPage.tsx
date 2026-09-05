import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C, T } from '../tokens'
import { Aurora, GlassSurface } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { useAuth } from '../context/AuthContext'

// ─── DEMO INSTITUTION DATA (preserved from prior dashboard) ───────────────────

const cohorts = [
  { name: 'Data Science Batch 12', program: 'Data Science & AI', students: 52, completion: 74, atRisk: 4, status: 'On Track' as const, faculty: 'Dr. Priya Nair' },
  { name: 'Analytics Pro Cohort 8', program: 'Data Analytics with Gen AI', students: 38, completion: 58, atRisk: 9, status: 'Needs Attention' as const, faculty: 'Arun Krishnamurthy' },
  { name: 'Full Stack Batch 5', program: 'Full Stack Development', students: 44, completion: 42, atRisk: 14, status: 'Critical' as const, faculty: 'Meghna Srivastava' },
  { name: 'Gen AI Cohort 3', program: 'Generative AI', students: 61, completion: 81, atRisk: 2, status: 'On Track' as const, faculty: 'Ritesh Agarwal' },
  { name: 'PM Program Batch 2', program: 'Product Management', students: 29, completion: 63, atRisk: 6, status: 'Needs Attention' as const, faculty: 'Sunita Menon' },
]

const facultyLoad = [
  { name: 'Dr. Priya Nair', load: 92, programs: ['Data Science & AI'] },
  { name: 'Arun Krishnamurthy', load: 74, programs: ['Data Analytics with Gen AI'] },
  { name: 'Meghna Srivastava', load: 61, programs: ['Full Stack Development'] },
  { name: 'Ritesh Agarwal', load: 85, programs: ['Generative AI'] },
  { name: 'Sunita Menon', load: 48, programs: ['Product Management'] },
]

const offerings = [
  { program: 'Data Science & AI', offering: 'Professional Program · Cohort 12', batches: 1, learners: 52, status: 'Active' },
  { program: 'Data Analytics with Gen AI', offering: 'Certificate Track · Cohort 8', batches: 1, learners: 38, status: 'Active' },
  { program: 'Full Stack Development', offering: 'Professional Program · Batch 5', batches: 1, learners: 44, status: 'Active' },
  { program: 'Generative AI', offering: 'Certificate Track · Cohort 3', batches: 1, learners: 61, status: 'Active' },
  { program: 'Product Management', offering: 'Professional Program · Batch 2', batches: 1, learners: 29, status: 'Active' },
]

const attentionLearners = [
  { cohort: 'Full Stack Batch 5', count: 14, issue: 'Below 50% completion target' },
  { cohort: 'Analytics Pro Cohort 8', count: 9, issue: 'Elevated at-risk learners' },
  { cohort: 'PM Program Batch 2', count: 6, issue: 'Assignment backlog' },
]

const ACADEMIC_PIPELINE = [
  { id: 'program', label: 'Program', detail: 'Data Science & AI', status: 'complete' as const },
  { id: 'offering', label: 'Offering', detail: 'Cohort 12', status: 'complete' as const },
  { id: 'batch', label: 'Batch', detail: 'Batch 12', status: 'current' as const },
  { id: 'curriculum', label: 'Curriculum', detail: 'SQL for Analysis', status: 'upcoming' as const },
  { id: 'modules', label: 'Modules', detail: 'Module 3 of 18', status: 'upcoming' as const },
  { id: 'assessments', label: 'Assessments', detail: 'SQL Module Quiz', status: 'upcoming' as const },
]

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', short: 'Home' },
  { id: 'programs', label: 'Programs', short: 'Programs' },
  { id: 'offerings', label: 'Offerings', short: 'Offerings' },
  { id: 'batches', label: 'Batches', short: 'Batches' },
  { id: 'learners', label: 'Learners', short: 'Learners' },
  { id: 'faculty', label: 'Faculty', short: 'Faculty' },
  { id: 'curriculum', label: 'Curriculum', short: 'Curriculum' },
  { id: 'assessments', label: 'Assessments', short: 'Tests' },
  { id: 'progress', label: 'Progress', short: 'Progress' },
  { id: 'settings', label: 'Settings', short: 'Settings' },
]

const accent = getDomainAccent('institution')

const batchLearners = cohorts.reduce((sum, c) => sum + c.students, 0)
const avgCompletion = Math.round(cohorts.reduce((sum, c) => sum + c.completion, 0) / cohorts.length)
const totalAtRisk = cohorts.reduce((sum, c) => sum + c.atRisk, 0)
const activePrograms = [...new Set(cohorts.map(c => c.program))].length
const needsAttentionCohorts = cohorts.filter(c => c.status !== 'On Track')

const statusColor: Record<string, string> = {
  'On Track': '#4ade80',
  'Needs Attention': '#fbbf24',
  'Critical': '#f87171',
}

const statusBg: Record<string, string> = {
  'On Track': 'rgba(74,222,128,0.1)',
  'Needs Attention': 'rgba(251,191,36,0.1)',
  'Critical': 'rgba(248,113,113,0.1)',
}

const statusBorder: Record<string, string> = {
  'On Track': 'rgba(74,222,128,0.25)',
  'Needs Attention': 'rgba(251,191,36,0.25)',
  'Critical': 'rgba(248,113,113,0.25)',
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

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
        <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11, marginTop: 4, letterSpacing: '0.04em' }}>Institution workspace</div>
      </div>

      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
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
                gap: 10,
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                marginBottom: 2,
                borderRadius: T.rControl,
                border: 'none',
                background: isActive ? accent.subtle : 'transparent',
                borderLeft: isActive ? `2px solid ${accent.primary}` : '2px solid transparent',
                color: isActive ? C.white : 'rgba(255,255,255,0.48)',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span style={{ color: isActive ? accent.text : 'rgba(255,255,255,0.35)', display: 'flex', flexShrink: 0 }}>
                <NavIcon id={item.id} />
              </span>
              <span className="org-nav-label">{item.label}</span>
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
            {user?.avatar || 'AC'}
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div style={{ color: C.white, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.institution || user?.name || 'Apex College'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Institution</div>
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
      <aside className="org-sidebar-desktop" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 236,
        background: 'rgba(5,5,5,0.92)', borderRight: `1px solid ${T.lineDark}`,
        display: 'flex', flexDirection: 'column', zIndex: 120,
      }}>
        {content}
      </aside>

      {mobileOpen && (
        <div className="org-mobile-overlay" onClick={onCloseMobile} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200,
          backdropFilter: 'blur(4px)',
        }} />
      )}
      <aside className={`org-sidebar-mobile ${mobileOpen ? 'open' : ''}`} style={{
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

// ─── INSTITUTION WORKSPACE ────────────────────────────────────────────────────

function InstitutionWorkspace({
  institutionName,
  activeBatch,
  activeProgram,
  learnerCount,
  completion,
  atRisk,
  onAction,
}: {
  institutionName: string
  activeBatch: string
  activeProgram: string
  learnerCount: number
  completion: number
  atRisk: number
  onAction: () => void
}) {
  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', pointerEvents: 'none', opacity: 0.28 }}>
        <div style={{
          position: 'absolute', inset: '10% 5% 10% 20%',
          background: `radial-gradient(ellipse at center, ${accent.secondary}24 0%, transparent 70%)`,
        }} />
      </div>

      <div className="org-workspace-inner" style={{ position: 'relative', padding: 'clamp(24px, 4vw, 36px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent.primary }} />
              <span style={{ color: accent.text, fontSize: 11, letterSpacing: '0.08em' }}>Active operations</span>
            </div>

            <h2 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 10px', lineHeight: 1.1 }}>
              {institutionName}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, margin: '0 0 6px', lineHeight: 1.5 }}>
              {activeProgram} · {activeBatch}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, margin: 0 }}>
              {cohorts.length} active batches · {batchLearners} learners in cohort · {totalAtRisk} at-risk
            </p>
          </div>

          <div className="org-workspace-stat" style={{ flexShrink: 0, textAlign: 'center', minWidth: 88 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: C.white, lineHeight: 1 }}>
              {completion}%
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 4 }}>avg completion</div>
          </div>
        </div>

        <div style={{ marginTop: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 12, flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{activePrograms} programs · {offerings.length} offerings</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{needsAttentionCohorts.length} batches need attention</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${completion}%`, height: '100%', background: accent.primary, borderRadius: 2 }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            onClick={onAction}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: accent.primary, color: C.black, border: 'none',
              padding: '13px 24px', borderRadius: T.rControl,
              fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            Review critical batch
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 13 }}>
            Full Stack Batch 5 · {learnerCount} learners · {atRisk} at-risk
          </span>
        </div>
      </div>
    </GlassSurface>
  )
}

// ─── COHORT RAIL ──────────────────────────────────────────────────────────────

function CohortRail() {
  const metrics = [
    { label: 'Active batches', value: String(cohorts.length), sub: 'this term' },
    { label: 'Batch learners', value: String(batchLearners), sub: 'enrolled' },
    { label: 'At-risk', value: String(totalAtRisk), sub: 'across batches' },
    { label: 'Faculty', value: String(facultyLoad.length), sub: 'assigned' },
  ]

  return (
    <GlassSurface level={2} padding="0" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${T.lineDark}` }}>
        <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 12, fontSize: 10, letterSpacing: '0.12em' }}>
          Academic operations
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white }}>
            {avgCompletion}% avg completion
          </span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>across {cohorts.length} batches</span>
        </div>
      </div>
      <div className="org-ops-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {metrics.map((m, i) => (
          <div key={m.label} style={{
            padding: '16px 14px',
            borderRight: i < metrics.length - 1 ? `1px solid ${T.lineDark}` : 'none',
            textAlign: 'center',
            minWidth: 0,
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

// ─── PROGRAM OPERATIONS ───────────────────────────────────────────────────────

function ProgramOperations() {
  return (
    <GlassSurface level={2} padding="22px 24px">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Programs & offerings
      </div>

      <div className="org-program-list" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {offerings.map((o, i) => (
          <div key={o.program} style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            alignItems: 'center',
            padding: '14px 0',
            borderBottom: i < offerings.length - 1 ? `1px solid ${T.lineDark}` : 'none',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: C.white, fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {o.program}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {o.offering}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent.text }}>{o.learners} learners</div>
              <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, marginTop: 2 }}>{o.status}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassSurface>
  )
}

// ─── BATCH OPERATIONS TABLE ───────────────────────────────────────────────────

function BatchOperations({ onFocusBatch }: { onFocusBatch: () => void }) {
  return (
    <GlassSurface level={2} padding="22px 24px">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontSize: 10, letterSpacing: '0.12em' }}>
            Batch operations
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.white, margin: 0 }}>
            Cohort performance
          </h3>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          {needsAttentionCohorts.length} need attention
        </span>
      </div>

      <div className="org-batch-table-wrap" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="org-batch-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr>
              {['Batch', 'Program', 'Learners', 'Progress', 'At-risk', 'Status'].map(h => (
                <th key={h} style={{
                  color: 'rgba(255,255,255,0.28)', fontSize: 10, fontFamily: 'var(--font-mono)',
                  textAlign: 'left', padding: '0 12px 12px 0', letterSpacing: '0.06em', fontWeight: 500,
                }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map(c => (
              <tr key={c.name} style={{ borderTop: `1px solid ${T.lineDark}` }}>
                <td style={{ padding: '12px 12px 12px 0', color: C.white, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{c.name}</td>
                <td style={{ padding: '12px 12px 12px 0', color: 'rgba(255,255,255,0.45)', fontSize: 12, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.program}</td>
                <td style={{ padding: '12px 12px 12px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{c.students}</td>
                <td style={{ padding: '12px 12px 12px 0', minWidth: 100 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 2, height: 4, minWidth: 48 }}>
                      <div style={{ background: statusColor[c.status], width: `${c.completion}%`, height: '100%', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: statusColor[c.status], flexShrink: 0 }}>{c.completion}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px 12px 12px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: c.atRisk > 8 ? '#f87171' : 'rgba(255,255,255,0.45)' }}>{c.atRisk}</td>
                <td style={{ padding: '12px 0' }}>
                  <span style={{
                    background: statusBg[c.status], border: `1px solid ${statusBorder[c.status]}`,
                    color: statusColor[c.status], padding: '3px 8px', borderRadius: 4,
                    fontSize: 10, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                  }}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {needsAttentionCohorts.length > 0 && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${T.lineDark}` }}>
          <button
            type="button"
            onClick={onFocusBatch}
            style={{
              background: 'transparent', border: `1px solid ${T.lineDark}`,
              color: accent.text, padding: '8px 14px', borderRadius: T.rControl,
              fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            Open {needsAttentionCohorts[0].name} →
          </button>
        </div>
      )}
    </GlassSurface>
  )
}

// ─── LEARNER PROGRESS ─────────────────────────────────────────────────────────

function LearnerProgress() {
  return (
    <GlassSurface level={2} padding="22px 24px">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Learner operations
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginBottom: 14 }}>Distribution by batch</div>
        {cohorts.map(c => (
          <div key={c.name} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text, flexShrink: 0 }}>{c.students}</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(c.students / batchLearners) * 100}%`, height: '100%', background: accent.secondary, borderRadius: 2, opacity: 0.85 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${T.lineDark}`, paddingTop: 18 }}>
        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginBottom: 14 }}>Attention needed</div>
        {attentionLearners.map((item, i) => (
          <div key={item.cohort} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            background: 'rgba(248,113,113,0.04)',
            border: `1px solid rgba(248,113,113,0.15)`,
            borderRadius: T.rControl,
            marginBottom: i < attentionLearners.length - 1 ? 8 : 0,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>{item.cohort}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{item.issue}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f87171', flexShrink: 0 }}>{item.count}</span>
          </div>
        ))}
      </div>
    </GlassSurface>
  )
}

// ─── FACULTY OPERATIONS ───────────────────────────────────────────────────────

function FacultyOperations() {
  return (
    <GlassSurface level={2} padding="22px 24px">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Faculty
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {facultyLoad.map((f, i) => {
          const cohort = cohorts.find(c => c.faculty === f.name)
          const loadColor = f.load > 85 ? '#f87171' : f.load > 70 ? '#fbbf24' : accent.text
          return (
            <div key={f.name} style={{
              padding: '14px 0',
              borderBottom: i < facultyLoad.length - 1 ? `1px solid ${T.lineDark}` : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{f.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.programs.join(' · ')}
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: loadColor, flexShrink: 0 }}>{f.load}%</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${f.load}%`, height: '100%', background: loadColor, borderRadius: 2, opacity: 0.8 }} />
              </div>
              {cohort && (
                <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, marginTop: 6 }}>
                  {cohort.name} · {cohort.students} learners
                </div>
              )}
            </div>
          )
        })}
      </div>
    </GlassSurface>
  )
}

// ─── ACADEMIC PIPELINE ────────────────────────────────────────────────────────

function AcademicPipeline() {
  return (
    <GlassSurface level={2} padding="22px 24px">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Curriculum operations
      </div>
      <div className="org-academic-pipeline" style={{ width: '100%', maxWidth: '100%' }}>
        {ACADEMIC_PIPELINE.map((node, i) => {
          const isCurrent = node.status === 'current'
          const isComplete = node.status === 'complete'
          return (
            <div key={node.id} className="org-pipeline-node" style={{ display: 'flex', alignItems: 'center', flex: i < ACADEMIC_PIPELINE.length - 1 ? '1 1 0' : '0 0 auto', minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <div style={{
                  width: isCurrent ? 32 : 24,
                  height: isCurrent ? 32 : 24,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCurrent ? accent.subtleStrong : isComplete ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isCurrent ? accent.border : isComplete ? 'rgba(255,255,255,0.2)' : T.lineDark}`,
                }}>
                  {isComplete ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={accent.text} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : isCurrent ? (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent.primary }} />
                  ) : (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                  )}
                </div>
                <span style={{
                  fontSize: isCurrent ? 11 : 10,
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? C.white : 'rgba(255,255,255,0.4)',
                  textAlign: 'center',
                }}>
                  {node.label}
                </span>
                <span style={{
                  fontSize: 9,
                  color: isCurrent ? accent.textMuted : 'rgba(255,255,255,0.25)',
                  textAlign: 'center',
                  maxWidth: 72,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {node.detail}
                </span>
              </div>
              {i < ACADEMIC_PIPELINE.length - 1 && (
                <div className="org-pipeline-connector" style={{
                  flex: 1, height: 1, minWidth: 6, margin: '0 3px 28px',
                  background: isComplete ? `linear-gradient(90deg, ${accent.primary}66, ${T.lineDark})` : T.lineDark,
                }} />
              )}
            </div>
          )
        })}
      </div>
    </GlassSurface>
  )
}

// ─── ASSESSMENT + PROGRESS ─────────────────────────────────────────────────────

function AssessmentProgress() {
  const assessmentItems = cohorts.map(c => ({
    batch: c.name,
    completion: c.completion,
    atRisk: c.atRisk,
    status: c.status,
  }))

  return (
    <GlassSurface level={2} padding="22px 24px">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Assessments & progress
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginBottom: 12 }}>Completion by cohort</div>
        {assessmentItems.map(item => (
          <div key={item.batch} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.batch}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: statusColor[item.status], flexShrink: 0 }}>{item.completion}%</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${item.completion}%`, height: '100%', background: statusColor[item.status], borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${T.lineDark}`, paddingTop: 16 }}>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, marginBottom: 8 }}>Pending academic actions</div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          {needsAttentionCohorts.length} batches below target completion. Review cohort progress and faculty assignments to address at-risk learners ({totalAtRisk} total).
        </p>
      </div>
    </GlassSurface>
  )
}

// ─── INSTITUTION ECOSYSTEM ────────────────────────────────────────────────────

function InstitutionEcosystem() {
  const steps = ['Programs', 'Learners', 'Faculty', 'Assessments', 'Career']

  return (
    <GlassSurface level={2} padding="22px 24px">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontSize: 10, letterSpacing: '0.12em' }}>
            Institutional ecosystem
          </div>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 14, margin: 0, maxWidth: 420, lineHeight: 1.6 }}>
            Programs connect learners, faculty, and assessments into career-ready outcomes.
          </p>
        </div>
      </div>
      <div className="org-ecosystem-flow" style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
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
  const items = [
    NAV_ITEMS[0],
    NAV_ITEMS[1],
    NAV_ITEMS[3],
    NAV_ITEMS[4],
    NAV_ITEMS[9],
  ]

  return (
    <nav className="org-bottom-nav" style={{
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

export default function DashboardOrgPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const institutionName = user.institution || user.name || 'Apex College'
  const institutionLearners = user.students ?? batchLearners
  const criticalBatch = cohorts.find(c => c.status === 'Critical') ?? cohorts[0]

  function focusBatches() {
    setActive('batches')
    document.getElementById('org-batch-operations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, fontFamily: 'var(--font-body)', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <Aurora themeId="institution" variant="hero" />
      </div>

      <Sidebar active={active} setActive={setActive} mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="org-main" style={{ position: 'relative', zIndex: 1, marginLeft: 236, minHeight: '100vh' }}>
        <header className="org-mobile-header" style={{
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

        <main className="org-main-content" style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px) 100px', overflowX: 'hidden', minWidth: 0 }}>
          {/* Institution header */}
          <header style={{ marginBottom: 'clamp(28px, 4vw, 40px)' }}>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 12, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Academic operations
            </div>
            <h1 className="skylent-display-md" style={{ color: C.white, margin: '0 0 12px', maxWidth: 680, lineHeight: 1.08 }}>
              {institutionName}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 'clamp(15px, 2vw, 17px)', margin: '0 0 8px', lineHeight: 1.55, maxWidth: 560 }}>
              Manage programs, cohorts and learner progress from one workspace.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, margin: 0 }}>
              {institutionLearners.toLocaleString('en-IN')} institution learners · {cohorts.length} active batches · Academic Year 2025–26
            </p>
          </header>

          {/* Primary workspace */}
          <section style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <InstitutionWorkspace
              institutionName={institutionName}
              activeBatch={criticalBatch.name}
              activeProgram={criticalBatch.program}
              learnerCount={criticalBatch.students}
              completion={avgCompletion}
              atRisk={criticalBatch.atRisk}
              onAction={focusBatches}
            />
          </section>

          {/* Operations rail */}
          <section style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <CohortRail />
          </section>

          {/* Academic pipeline */}
          <section style={{ marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <AcademicPipeline />
          </section>

          {/* Programs + batch operations */}
          <div className="org-two-col" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 'clamp(16px, 2vw, 24px)', marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <ProgramOperations />
            <div id="org-batch-operations">
              <BatchOperations onFocusBatch={focusBatches} />
            </div>
          </div>

          {/* Learners + faculty */}
          <div className="org-two-col" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(16px, 2vw, 24px)', marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <LearnerProgress />
            <FacultyOperations />
          </div>

          {/* Assessments + ecosystem */}
          <div className="org-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(16px, 2vw, 24px)', marginBottom: 'clamp(24px, 3vw, 32px)' }}>
            <AssessmentProgress />
            <InstitutionEcosystem />
          </div>
        </main>
      </div>

      <MobileBottomNav active={active} setActive={setActive} />

      <style>{`
        .org-sidebar-mobile { display: none; }
        .org-two-col > * { min-width: 0; }
        .org-main { overflow-x: hidden; }
        @media (max-width: 900px) {
          .org-sidebar-desktop { display: none !important; }
          .org-sidebar-mobile { display: flex !important; }
          .org-main { margin-left: 0 !important; overflow-x: hidden; }
          .org-mobile-header { display: flex !important; }
          .org-workspace-inner { padding-bottom: 28px !important; }
          .org-workspace-stat { display: none; }
          .org-two-col { grid-template-columns: 1fr !important; }
          .org-ops-metrics { grid-template-columns: repeat(2, 1fr) !important; }
          .org-ops-metrics > div:nth-child(2) { border-right: none !important; }
          .org-ops-metrics > div:nth-child(3),
          .org-ops-metrics > div:nth-child(4) { border-top: 1px solid ${T.lineDark}; }
          .org-academic-pipeline { display: flex; overflow-x: auto; max-width: 100%; padding-bottom: 8px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .org-academic-pipeline::-webkit-scrollbar { display: none; }
          .org-pipeline-node { flex: 0 0 auto !important; }
          .org-pipeline-connector { min-width: 16px !important; }
          .org-batch-table-wrap { -webkit-overflow-scrolling: touch; }
        }
        @media (max-width: 600px) {
          .org-ops-metrics > div { border-right: none !important; }
          .org-bottom-nav { display: flex !important; }
          .org-main-content { padding-bottom: 88px !important; }
        }
        @media (min-width: 601px) {
          .org-bottom-nav { display: none !important; }
        }
        @media (min-width: 901px) {
          .org-bottom-nav { display: none !important; }
        }
      `}</style>
    </div>
  )
}
