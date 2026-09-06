import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C } from '../components/shared'
import { getDomainAccent } from '../aurora-themes'

const accent = getDomainAccent('professional')
import { labSubjects } from '../data'
import type { LabExperimentStatus, LabType } from '../data'
import { useAuth } from '../context/AuthContext'
import { useDemoState } from '../demo/DemoStateContext'

const labTypeLabels: Record<LabType, string> = {
  coding: 'Coding',
  data: 'Data',
  business: 'Business',
  simulation: 'Simulation',
}

const labTypeColors: Record<LabType, { bg: string; text: string; border: string }> = {
  coding: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  data: { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  business: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  simulation: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
}

const statusColors: Record<LabExperimentStatus, { color: string; label: string }> = {
  not_started: { color: 'rgba(255,255,255,0.2)', label: 'Not Started' },
  in_progress: { color: accent.primary, label: 'In Progress' },
  submitted: { color: '#60a5fa', label: 'Submitted' },
  completed: { color: '#4ade80', label: 'Completed' },
}

export default function LabDetailPage() {
  const { labId } = useParams<{ labId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const demo = useDemoState()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const subject = labSubjects.find(s => s.id === labId)
  const labProgress = labId ? demo.getLabProgress(labId) : { launched: false, complete: false, experiments: {} }

  const statuses: Record<string, LabExperimentStatus> = {}
  subject?.experiments.forEach(e => {
    statuses[e.id] = labProgress.experiments[e.id] ?? 'not_started'
  })

  if (!subject) {
    return (
      <div style={{ minHeight: '100vh', background: C.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'var(--font-body)' }}>
        <div style={{ color: C.white, fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700 }}>Lab not found</div>
        <Link to="/labs" style={{ color: accent.text, textDecoration: 'none', fontSize: 14 }}>&larr; Back to Labs</Link>
      </div>
    )
  }

  const completedCount = Object.values(statuses).filter(s => s === 'completed').length
  const typeColors = labTypeColors[subject.labType]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c0e', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ height: 52, background: C.ink, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate('/labs')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'var(--font-body)', padding: 0, flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Labs
        </button>
        <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 14 }}>/</div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {subject.program} &rsaquo; {subject.semester} &rsaquo; {subject.subject}
        </div>
        <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.35)', fontSize: 12, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
          {completedCount} of {subject.experiments.length} complete
        </div>
      </div>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left sidebar */}
        <div style={{ width: 240, flexShrink: 0, background: C.ink, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', position: 'sticky', top: 52, height: 'calc(100vh - 52px)' }}>
          <div style={{ padding: '16px 16px 8px', color: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>EXPERIMENTS</div>
          {subject.experiments.map(exp => {
            const status = statuses[exp.id] ?? 'not_started'
            const sc = statusColors[status]
            return (
              <button
                key={exp.id}
                onClick={() => navigate(`/labs/${labId}/${exp.id}`)}
                style={{ display: 'flex', width: '100%', textAlign: 'left', padding: '11px 16px', gap: 12, alignItems: 'flex-start', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Status dot */}
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.color, flexShrink: 0, marginTop: 4, border: status === 'not_started' ? '1px solid rgba(255,255,255,0.2)' : 'none', boxSizing: 'border-box' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>Exp {exp.number}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.title}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '48px 48px 80px' }}>
          {/* Lab header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)' }}>{subject.program}</span>
              <span style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.08)' }}>{subject.semester}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: C.white, lineHeight: 1.1, margin: '0 0 14px', letterSpacing: '-0.025em' }}>{subject.subject}</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 580, margin: '0 0 24px' }}>{subject.desc}</p>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: typeColors.bg, color: typeColors.text, border: `1px solid ${typeColors.border}`, fontSize: 12, fontFamily: 'var(--font-mono)', padding: '5px 14px', borderRadius: 100 }}>{labTypeLabels[subject.labType]}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{subject.experiments.length} Experiments</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{completedCount} Completed</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>Overall Progress</span>
              <span style={{ color: accent.text, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{Math.round((completedCount / subject.experiments.length) * 100)}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6 }}>
              <div style={{ background: accent.primary, width: `${(completedCount / subject.experiments.length) * 100}%`, height: '100%', borderRadius: 4, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* Experiment cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {subject.experiments.map(exp => {
              const status = statuses[exp.id] ?? 'not_started'
              const sc = statusColors[status]
              const expTypeColors = labTypeColors[exp.type]
              return (
                <div
                  key={exp.id}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px 28px', display: 'flex', alignItems: 'flex-start', gap: 20, transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                >
                  {/* Number */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{String(exp.number).padStart(2, '0')}</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ background: expTypeColors.bg, color: expTypeColors.text, border: `1px solid ${expTypeColors.border}`, fontSize: 10, fontFamily: 'var(--font-mono)', padding: '3px 9px', borderRadius: 100 }}>{labTypeLabels[exp.type]}</span>
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{exp.duration}</span>
                    </div>
                    <div style={{ color: C.white, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{exp.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>{exp.objective}</div>
                  </div>

                  {/* Status + button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
                    <span style={{ color: sc.color, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{sc.label}</span>
                    <button
                      onClick={() => navigate(`/labs/${labId}/${exp.id}`)}
                      style={{ background: status === 'completed' ? 'rgba(34,197,94,0.1)' : accent.primary, border: status === 'completed' ? '1px solid rgba(34,197,94,0.3)' : 'none', color: status === 'completed' ? '#4ade80' : C.black, padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      {status === 'not_started' ? 'Start →' : status === 'in_progress' ? 'Continue →' : status === 'submitted' ? 'View →' : 'Review →'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
