import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, T } from '../tokens'
import { AuthDashboardShell, AuthDashboardLayout, type AuthNavItem } from '../components/AuthDashboardShell'
import { getRoleAccent } from '../role-themes'
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

const batchLearners = cohorts.reduce((sum, c) => sum + c.students, 0)
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
  criticalBatch,
  onAction,
}: {
  institutionName: string
  institutionLearners: number
  criticalBatch: typeof cohorts[0]
  onAction: () => void
}) {
  return (
    <div id="org-overview">
      <div style={{ marginBottom: 28 }}>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 10 }}>Institution workspace</div>
        <h1 className="skylent-display-md" style={{ color: C.white, margin: '0 0 8px', maxWidth: 680, lineHeight: 1.08 }}>
          {institutionName}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, margin: 0 }}>
          {institutionLearners.toLocaleString('en-IN')} learners · {cohorts.length} active batches · Academic Year 2025–26
        </p>
      </div>

      <div style={{
        padding: '24px 0', marginBottom: 28,
        borderTop: `1px solid ${T.lineDark}`,
        borderBottom: `1px solid ${T.lineDark}`,
        borderLeft: `3px solid ${statusColor[criticalBatch.status]}`,
        paddingLeft: 20,
      }}>
        <div style={{ color: statusColor[criticalBatch.status], fontSize: 11, fontWeight: 500, marginBottom: 10 }}>
          Needs attention
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 600, color: C.white, margin: '0 0 8px' }}>
          {criticalBatch.name}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, margin: '0 0 4px', lineHeight: 1.5 }}>
          {criticalBatch.completion}% completion · {criticalBatch.atRisk} learners need attention
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '0 0 20px' }}>
          {criticalBatch.program} · Faculty: {criticalBatch.faculty}
        </p>
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
          Review batch
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {attentionLearners.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 14 }}>Other batches needing review</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {attentionLearners.filter(a => a.cohort !== criticalBatch.name).map((item, i, arr) => (
              <div key={item.cohort} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: i < arr.length - 1 ? `1px solid ${T.lineDark}` : 'none',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>{item.cohort}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{item.issue}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f87171', flexShrink: 0 }}>{item.count} learners</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ACADEMIC PIPELINE (Level 0 — canvas timeline) ────────────────────────────

function AcademicPipeline() {
  return (
    <div id="org-curriculum" style={{ marginTop: 'clamp(28px, 4vw, 40px)' }}>
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
    </div>
  )
}

// ─── PROGRAM OPERATIONS (Level 0) ─────────────────────────────────────────────

function ProgramOperations() {
  return (
    <div id="org-programs">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Programs & offerings
      </div>

      <div id="org-offerings">
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
    </div>
  )
}

// ─── BATCH OPERATIONS (Level 0) ───────────────────────────────────────────────

function BatchOperations({ onFocusBatch }: { onFocusBatch: () => void }) {
  return (
    <div id="org-batches">
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

      <div id="org-batch-operations" className="org-batch-table-wrap" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
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
    </div>
  )
}

// ─── LEARNER PROGRESS (Level 0) ───────────────────────────────────────────────

function LearnerProgress() {
  return (
    <div id="org-learners">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Learner operations
      </div>

      <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginBottom: 14 }}>Distribution by batch</div>
      {cohorts.map((c, i) => (
        <div key={c.name} style={{
          marginBottom: 12,
          paddingBottom: i < cohorts.length - 1 ? 12 : 0,
          borderBottom: i < cohorts.length - 1 ? `1px solid ${T.lineDark}` : 'none',
        }}>
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
  )
}

// ─── FACULTY OPERATIONS (Level 0) ─────────────────────────────────────────────

function FacultyOperations() {
  return (
    <div id="org-faculty">
      <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
        Faculty
      </div>

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
  )
}

// ─── CONTEXT RAIL (Level 0 — assessments + attention) ───────────────────────────

function OrgContextRail() {
  const assessmentItems = cohorts.map(c => ({
    batch: c.name,
    completion: c.completion,
    status: c.status,
  }))

  return (
    <div>
      <div id="org-assessments">
        <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 18, fontSize: 10, letterSpacing: '0.12em' }}>
          Assessments & progress
        </div>

        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginBottom: 12 }}>Completion by cohort</div>
        {assessmentItems.map((item, i) => (
          <div key={item.batch} style={{
            marginBottom: 12,
            paddingBottom: i < assessmentItems.length - 1 ? 12 : 0,
            borderBottom: i < assessmentItems.length - 1 ? `1px solid ${T.lineDark}` : 'none',
          }}>
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

      <div id="org-progress" style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.lineDark}` }}>
        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginBottom: 14 }}>Attention needed</div>
        {attentionLearners.map((item, i) => (
          <div key={item.cohort} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            padding: '12px 0',
            borderBottom: i < attentionLearners.length - 1 ? `1px solid ${T.lineDark}` : 'none',
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>{item.cohort}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{item.issue}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f87171', flexShrink: 0 }}>{item.count}</span>
          </div>
        ))}

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.lineDark}` }}>
          <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, marginBottom: 8 }}>Pending academic actions</div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            {needsAttentionCohorts.length} batches below target completion. Review cohort progress and faculty assignments to address at-risk learners ({totalAtRisk} total).
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DashboardOrgPage() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('overview')

  useEffect(() => {
    if (ready && !user) navigate('/login')
  }, [ready, user, navigate])

  if (!ready || !user) return null

  const institutionName = user.institution || user.name || 'Apex College'
  const institutionLearners = user.students ?? batchLearners
  const criticalBatch = cohorts.find(c => c.status === 'Critical') ?? cohorts[0]

  function focusBatches() {
    setActiveNav('batches')
    document.getElementById('org-batch-operations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
      <AuthDashboardLayout
        primary={
          <>
            <InstitutionWorkspace
              institutionName={institutionName}
              institutionLearners={institutionLearners}
              criticalBatch={criticalBatch}
              onAction={focusBatches}
            />

            <AcademicPipeline />

            <div className="org-two-col" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 'clamp(16px, 2vw, 24px)', marginTop: 'clamp(28px, 4vw, 40px)' }}>
              <ProgramOperations />
              <BatchOperations onFocusBatch={focusBatches} />
            </div>

            <div className="org-two-col" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(16px, 2vw, 24px)', marginTop: 'clamp(28px, 4vw, 40px)' }}>
              <LearnerProgress />
              <FacultyOperations />
            </div>

            <div id="org-settings" style={{ marginTop: 'clamp(28px, 4vw, 40px)', paddingTop: 24, borderTop: `1px solid ${T.lineDark}` }}>
              <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 10, fontSize: 10, letterSpacing: '0.12em' }}>
                Institution settings
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                Configure programs, faculty assignments, and academic calendar for {institutionName}.
              </p>
            </div>
          </>
        }
        rail={<OrgContextRail />}
      />

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
