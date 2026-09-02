import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { C } from '../components/shared'
import { labSubjects } from '../data'
import type { LabExperimentStatus, LabType } from '../data'
import { useAuth } from '../context/AuthContext'

const labTypeLabels: Record<LabType, string> = {
  coding: 'Coding',
  data: 'Data',
  business: 'Business',
  simulation: 'Simulation',
}

const labTypeColors: Record<LabType, { bg: string; text: string; border: string }> = {
  coding: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  data: { bg: 'rgba(243,107,33,0.15)', text: C.orange, border: 'rgba(243,107,33,0.3)' },
  business: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  simulation: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
}

// ── Workspace panels ───────────────────────────────────────────────────────────

function CodingWorkspace({ title, subject }: { title: string; subject: string }) {
  const [ran, setRan] = useState(false)
  const codeLines = [
    'import pandas as pd',
    'import numpy as np',
    '',
    '# Load the dataset',
    'df = pd.read_csv("dataset.csv")',
    '',
    '# Inspect structure',
    'print(df.head())',
    'print(df.info())',
    '',
    '# Check for missing values',
    'null_counts = df.isnull().sum()',
    'print(null_counts)',
    '',
    '# Compute descriptive statistics',
    'print(df.describe())',
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: C.white, fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{title}</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{subject}</div>
        </div>
        <div style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 12px', borderRadius: 100 }}>Python 3.11</div>
      </div>

      {/* Editor */}
      <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ background: '#161b22', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'var(--font-mono)', marginLeft: 8 }}>main.py</span>
        </div>
        <div style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }}>
          {codeLines.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 16 }}>
              <span style={{ color: 'rgba(255,255,255,0.15)', minWidth: 24, textAlign: 'right', userSelect: 'none' }}>{line ? i + 1 : ''}</span>
              <span style={{ color: line.startsWith('#') ? '#6a9955' : line.startsWith('import') || line.startsWith('from') ? '#c586c0' : line.includes('=') ? '#9cdcfe' : 'rgba(255,255,255,0.7)' }}>
                {line || ' '}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setRan(true)}
        style={{ alignSelf: 'flex-start', background: C.orange, border: 'none', color: C.white, padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Run Code
      </button>

      {ran && (
        <div style={{ background: '#0d1117', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: '#161b22', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Output</span>
          </div>
          <div style={{ padding: '16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            <div style={{ color: '#4ade80', marginBottom: 8 }}>DataFrame loaded: 150 rows, 5 columns</div>
            <div>   sepal_length  sepal_width  petal_length  petal_width  species</div>
            <div>0           5.1          3.5           1.4          0.2   setosa</div>
            <div>1           4.9          3.0           1.4          0.2   setosa</div>
            <div>2           4.7          3.2           1.3          0.2   setosa</div>
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.35)' }}>Null values: sepal_length 0, sepal_width 0, petal_length 3, ...</div>
            <div style={{ marginTop: 4, color: '#4ade80' }}>Process finished with exit code 0</div>
          </div>
        </div>
      )}
    </div>
  )
}

function DataWorkspace({ title }: { title: string }) {
  const [executed, setExecuted] = useState<Record<number, boolean>>({})
  const cells = [
    { type: 'markdown', content: '## ' + title + '\n\nThis notebook guides you through the experiment. Execute each code cell in order.' },
    { type: 'code', content: 'import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Load dataset\ndf = pd.read_csv("data.csv")\nprint(f"Shape: {df.shape}")\ndf.head()' },
    { type: 'code', content: '# Compute statistics\nstats = df.describe()\nprint(stats)\n\n# Check null values\nprint("\\nNull counts:")\nprint(df.isnull().sum())' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ color: C.white, fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 4 }}>{title}</div>
      {cells.map((cell, i) => (
        <div key={i} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
          {cell.type === 'markdown' ? (
            <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)' }}>
              {cell.content.split('\n').map((line, li) => (
                <div key={li} style={{ color: line.startsWith('## ') ? C.white : 'rgba(255,255,255,0.5)', fontSize: line.startsWith('## ') ? 16 : 13, fontWeight: line.startsWith('## ') ? 700 : 400, lineHeight: 1.7, marginBottom: line.startsWith('## ') ? 8 : 0 }}>{line.replace(/^## /, '')}</div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ background: '#0d1117', padding: '14px 20px', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8, color: 'rgba(255,255,255,0.65)' }}>
                {cell.content.split('\n').map((l, li) => (
                  <div key={li} style={{ color: l.startsWith('#') ? '#6a9955' : l.startsWith('import') || l.startsWith('from') ? '#c586c0' : 'rgba(255,255,255,0.65)' }}>{l || ' '}</div>
                ))}
              </div>
              <div style={{ background: '#161b22', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => setExecuted(prev => ({ ...prev, [i]: true }))}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', padding: '4px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                >Execute Cell</button>
                {executed[i] && <span style={{ color: '#4ade80', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Done</span>}
              </div>
              {executed[i] && (
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                  <div style={{ color: '#4ade80' }}>Shape: (150, 5)</div>
                  <div>        count       mean        std   min   25%</div>
                  <div>sepal_l  150.0      5.843      0.828  4.30  5.10</div>
                  <div>sepal_w  150.0      3.057      0.436  2.00  2.80</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function BusinessWorkspace({ title, instructions }: { title: string; instructions: string[] }) {
  const [analysis, setAnalysis] = useState('')
  const [findings, setFindings] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [saved, setSaved] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ color: C.white, fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 12 }}>{title}</div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>CASE STUDY</div>
          {instructions.map((inst, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
              <span style={{ color: C.orange, fontSize: 12, fontFamily: 'var(--font-mono)', flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.7 }}>{inst}</span>
            </div>
          ))}
        </div>
      </div>

      {[
        { label: 'YOUR ANALYSIS', value: analysis, setter: setAnalysis, placeholder: 'Describe your analytical approach and observations...' },
        { label: 'KEY FINDINGS', value: findings, setter: setFindings, placeholder: 'List your key findings from the case data...' },
        { label: 'RECOMMENDATION', value: recommendation, setter: setRecommendation, placeholder: 'State your recommendation with supporting justification...' },
      ].map(field => (
        <div key={field.label}>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>{field.label}</div>
          <textarea
            value={field.value}
            onChange={e => field.setter(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', color: C.white, fontSize: 13, fontFamily: 'var(--font-body)', lineHeight: 1.7, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      ))}

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => setSaved(true)}
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: saved ? '#4ade80' : C.white, padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
        >{saved ? 'Draft Saved' : 'Save Draft'}</button>
      </div>
    </div>
  )
}

function SimulationWorkspace({ title, instructions }: { title: string; instructions: string[] }) {
  const [params, setParams] = useState({ iterations: 1000, mean: 50, stddev: 10 })
  const [ran, setRan] = useState(false)

  const result = {
    mean: (params.mean + Math.random() * 2 - 1).toFixed(2),
    p50: (params.mean - 0.3).toFixed(2),
    p80: (params.mean + params.stddev * 0.84).toFixed(2),
    p90: (params.mean + params.stddev * 1.28).toFixed(2),
    overrunProb: (Math.random() * 0.3 + 0.05).toFixed(3),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ color: C.white, fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-display)' }}>{title}</div>

      <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 10, padding: '20px 24px' }}>
        <div style={{ color: 'rgba(168,85,247,0.7)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>SIMULATION DESCRIPTION</div>
        {instructions.slice(0, 3).map((inst, i) => (
          <div key={i} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.7, marginBottom: 6 }}>{inst}</div>
        ))}
      </div>

      {/* Parameters */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '20px 24px' }}>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 16 }}>PARAMETERS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'iterations' as const, label: 'Iterations', min: 100, max: 10000, step: 100 },
            { key: 'mean' as const, label: 'Mean Value', min: 10, max: 100, step: 1 },
            { key: 'stddev' as const, label: 'Std Deviation', min: 1, max: 30, step: 1 },
          ].map(param => (
            <div key={param.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{param.label}</label>
                <span style={{ color: C.orange, fontSize: 13, fontFamily: 'var(--font-mono)' }}>{params[param.key]}</span>
              </div>
              <input
                type="range" min={param.min} max={param.max} step={param.step}
                value={params[param.key]}
                onChange={e => setParams(prev => ({ ...prev, [param.key]: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: C.orange }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setRan(true)}
        style={{ alignSelf: 'flex-start', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
      >Run Simulation</button>

      {ran && (
        <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ color: 'rgba(168,85,247,0.7)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 16 }}>RESULTS — {params.iterations.toLocaleString()} ITERATIONS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Mean Outcome', value: result.mean },
              { label: 'P50 (Median)', value: result.p50 },
              { label: 'P80 Estimate', value: result.p80 },
              { label: 'P90 Estimate', value: result.p90 },
              { label: 'Overrun Probability', value: result.overrunProb },
              { label: 'Std Deviation', value: params.stddev.toString() },
            ].map(m => (
              <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px' }}>
                <div style={{ color: '#c084fc', fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{m.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ExperimentPage() {
  const { labId, experimentId } = useParams<{ labId: string; experimentId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const subject = labSubjects.find(s => s.id === labId)
  const experiment = subject?.experiments.find(e => e.id === experimentId)

  const [statuses, setStatuses] = useState<Record<string, LabExperimentStatus>>(() => {
    const init: Record<string, LabExperimentStatus> = {}
    subject?.experiments.forEach(e => { init[e.id] = 'not_started' })
    return init
  })
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function handleSubmit() {
    if (!experimentId) return
    setStatuses(prev => ({ ...prev, [experimentId]: 'submitted' }))
    showToast('Experiment submitted! Under review.')
  }

  function handleMarkComplete() {
    if (!experimentId) return
    setStatuses(prev => ({ ...prev, [experimentId]: 'completed' }))
    showToast('Experiment marked as completed!')
  }

  if (!subject || !experiment) {
    return (
      <div style={{ minHeight: '100vh', background: C.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'var(--font-body)' }}>
        <div style={{ color: C.white, fontSize: 24, fontFamily: 'var(--font-display)' }}>Experiment not found</div>
        <Link to={`/labs/${labId}`} style={{ color: C.orange, textDecoration: 'none' }}>&larr; Back to Lab</Link>
      </div>
    )
  }

  const currentStatus = statuses[experiment.id] ?? 'not_started'
  const typeColors = labTypeColors[experiment.type]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c0e', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80', padding: '12px 24px', borderRadius: 10, fontSize: 13, fontFamily: 'var(--font-body)', zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Top bar */}
      <div style={{ height: 48, background: C.ink, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(`/labs/${labId}`)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'var(--font-body)', padding: 0, flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Lab Overview
        </button>
        <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 14 }}>/</div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Exp {experiment.number}: {experiment.title}
        </div>
      </div>

      {/* Three-panel layout */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 48px)', overflow: 'hidden' }}>

        {/* LEFT sidebar — experiment list */}
        <div style={{ width: 200, flexShrink: 0, background: C.ink, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto' }}>
          <div style={{ padding: '14px 14px 6px', color: 'rgba(255,255,255,0.18)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em' }}>ALL EXPERIMENTS</div>
          {subject.experiments.map(exp => {
            const isActive = exp.id === experimentId
            const status = statuses[exp.id] ?? 'not_started'
            const dotColor = status === 'completed' ? '#4ade80' : status === 'submitted' ? '#60a5fa' : status === 'in_progress' ? C.orange : 'rgba(255,255,255,0.2)'
            return (
              <button
                key={exp.id}
                onClick={() => navigate(`/labs/${labId}/${exp.id}`)}
                style={{ display: 'flex', width: '100%', textAlign: 'left', padding: '10px 14px', gap: 10, alignItems: 'flex-start', background: 'transparent', borderLeft: isActive ? `3px solid ${C.orange}` : '3px solid transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s', borderRight: 'none' }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: 5, border: status === 'not_started' ? '1px solid rgba(255,255,255,0.2)' : 'none' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>#{exp.number}</div>
                  <div style={{ color: isActive ? C.white : 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.title}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* CENTER — workspace */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
          {experiment.type === 'coding' && <CodingWorkspace title={experiment.title} subject={subject.subject} />}
          {experiment.type === 'data' && <DataWorkspace title={experiment.title} />}
          {experiment.type === 'business' && <BusinessWorkspace title={experiment.title} instructions={experiment.instructions} />}
          {experiment.type === 'simulation' && <SimulationWorkspace title={experiment.title} instructions={experiment.instructions} />}
        </div>

        {/* RIGHT panel — instructions + submission */}
        <div style={{ width: 280, flexShrink: 0, background: '#0d0f11', borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 20px 0' }}>
            {/* Experiment header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 6 }}>EXPERIMENT {experiment.number}</div>
              <div style={{ color: C.white, fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginBottom: 10 }}>{experiment.title}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ background: typeColors.bg, color: typeColors.text, border: `1px solid ${typeColors.border}`, fontSize: 9, fontFamily: 'var(--font-mono)', padding: '3px 9px', borderRadius: 100 }}>{labTypeLabels[experiment.type]}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--font-mono)', paddingTop: 2 }}>{experiment.duration}</span>
              </div>
            </div>

            {/* Status */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: currentStatus === 'completed' ? '#4ade80' : currentStatus === 'submitted' ? '#60a5fa' : currentStatus === 'in_progress' ? C.orange : 'rgba(255,255,255,0.2)', border: currentStatus === 'not_started' ? '1px solid rgba(255,255,255,0.2)' : 'none' }} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                {currentStatus === 'not_started' ? 'Not Started' : currentStatus === 'in_progress' ? 'In Progress' : currentStatus === 'submitted' ? 'Under Review' : 'Completed'}
              </span>
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 10 }}>INSTRUCTIONS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {experiment.instructions.map((inst, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)', flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11.5, lineHeight: 1.65 }}>{inst}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks checklist */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 10 }}>TASKS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {experiment.tasks.map((task, i) => {
                  const key = `${experimentId}-task-${i}`
                  const checked = checkedTasks[key] ?? false
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }))
                        if (currentStatus === 'not_started') setStatuses(prev => ({ ...prev, [experimentId!]: 'in_progress' }))
                      }}
                      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                    >
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${checked ? C.orange : 'rgba(255,255,255,0.18)'}`, background: checked ? 'rgba(243,107,33,0.15)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                        {checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span style={{ color: checked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)', fontSize: 11.5, lineHeight: 1.6, textDecoration: checked ? 'line-through' : 'none' }}>{task}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Expected outcome */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 8 }}>EXPECTED OUTCOME</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11.5, lineHeight: 1.7, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '12px' }}>
                {experiment.expectedOutcome}
              </div>
            </div>
          </div>

          {/* Submission section */}
          <div style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', marginBottom: 14 }}>SUBMISSION</div>

            {(currentStatus === 'not_started' || currentStatus === 'in_progress') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleSubmit}
                  style={{ width: '100%', background: C.orange, border: 'none', color: C.white, padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >Submit Experiment</button>
              </div>
            )}

            {currentStatus === 'submitted' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ color: '#60a5fa', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Under Review</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Your submission is being reviewed</div>
                </div>
                <button
                  onClick={handleMarkComplete}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                >Mark Complete (Admin)</button>
                <button onClick={() => navigate(`/labs/${labId}`)} style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', padding: '6px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Return to Lab</button>
              </div>
            )}

            {currentStatus === 'completed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '14px', textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div style={{ color: '#4ade80', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Completed</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: C.white }}>88<span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>/100</span></div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 }}>Score</div>
                </div>
                <button onClick={() => navigate(`/labs/${labId}`)} style={{ width: '100%', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Return to Lab</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
