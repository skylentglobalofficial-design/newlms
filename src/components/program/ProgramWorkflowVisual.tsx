import { GlassSurface } from '../foundation'
import { C, T } from '../../tokens'
import type { ProgramType } from '../../data'
import { getAuroraTheme, getDomainAccent, resolveAuroraTheme } from '../../aurora-themes'

type WorkflowStep = { label: string; detail: string }

const SLUG_WORKFLOW: Record<string, WorkflowStep[]> = {
  'data-science-ai': [
    { label: 'Dataset', detail: 'Tables, features, labels' },
    { label: 'Model', detail: 'Train & tune' },
    { label: 'Evaluation', detail: 'Metrics & validation' },
    { label: 'Insight', detail: 'Decision-ready output' },
  ],
  'data-analytics-pro': [
    { label: 'Question', detail: 'Business framing' },
    { label: 'Dataset', detail: 'Source & quality' },
    { label: 'SQL', detail: 'Query & transform' },
    { label: 'Dashboard', detail: 'Visualise KPIs' },
    { label: 'Insight', detail: 'Recommend action' },
  ],
  'full-stack': [
    { label: 'Code', detail: 'Frontend & API' },
    { label: 'API', detail: 'Routes & auth' },
    { label: 'Database', detail: 'Schema & queries' },
    { label: 'Deploy', detail: 'Ship to production' },
  ],
  'jee-advanced-prep': [
    { label: 'Problem', detail: 'Exam-style question' },
    { label: 'Formula', detail: 'Concept & method' },
    { label: 'Practice', detail: 'Timed drills' },
    { label: 'Solution', detail: 'Worked answer' },
  ],
  'cat-prep': [
    { label: 'Case', detail: 'Business scenario' },
    { label: 'DI', detail: 'Data interpretation' },
    { label: 'Reasoning', detail: 'Logic & structure' },
    { label: 'Decision', detail: 'Final choice' },
  ],
}

const TYPE_WORKFLOW: Record<ProgramType, WorkflowStep[]> = {
  PROFESSIONAL: [
    { label: 'Module', detail: 'Structured units' },
    { label: 'Skill', detail: 'Hands-on practice' },
    { label: 'Project', detail: 'Portfolio work' },
    { label: 'Assessment', detail: 'Prove mastery' },
  ],
  CERTIFICATE: [
    { label: 'Module', detail: 'Core topics' },
    { label: 'Skill', detail: 'Applied exercises' },
    { label: 'Project', detail: 'Capstone build' },
    { label: 'Credential', detail: 'Certificate issued' },
  ],
  WEBINAR: [
    { label: 'Event', detail: 'Scheduled session' },
    { label: 'Session', detail: 'Live instruction' },
    { label: 'Speaker', detail: 'Expert delivery' },
    { label: 'Recording', detail: 'On-demand replay' },
  ],
  EXAM_PREP: [
    { label: 'Subject', detail: 'Topic coverage' },
    { label: 'Practice', detail: 'Question banks' },
    { label: 'Mock', detail: 'Full-length tests' },
    { label: 'Analytics', detail: 'Score breakdown' },
  ],
  SCHOOLING: [
    { label: 'Classroom', detail: 'Guided learning' },
    { label: 'Subject', detail: 'Curriculum unit' },
    { label: 'Lesson', detail: 'Instruction block' },
    { label: 'Activity', detail: 'Apply & assess' },
  ],
  UNDERGRADUATE: [
    { label: 'Semester', detail: 'Term structure' },
    { label: 'Lab', detail: 'Practical work' },
    { label: 'Assignment', detail: 'Coursework' },
    { label: 'Project', detail: 'Capstone output' },
  ],
  POSTGRADUATE: [
    { label: 'Case', detail: 'Applied scenario' },
    { label: 'Research', detail: 'Deep investigation' },
    { label: 'Project', detail: 'Deliverable' },
    { label: 'Assessment', detail: 'Evaluation' },
  ],
}

function resolveWorkflow(slug: string, programType: ProgramType): WorkflowStep[] {
  if (SLUG_WORKFLOW[slug]) return SLUG_WORKFLOW[slug]
  if (slug.includes('neet')) {
    return [
      { label: 'Biology', detail: 'Core concepts' },
      { label: 'Science', detail: 'Anatomy & systems' },
      { label: 'MCQ', detail: 'Question practice' },
      { label: 'Mock', detail: 'Full exam simulation' },
    ]
  }
  return TYPE_WORKFLOW[programType]
}

function DataScienceWorkspace({ accent }: { accent: ReturnType<typeof getDomainAccent> }) {
  const cols = ['tenure', 'charges', 'churn']
  const rows = [
    ['12', '2840', '0'],
    ['24', '5120', '0'],
    ['6', '1890', '1'],
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr 1fr', gap: 10 }} className="program-workflow-panels">
      {/* Dataset table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 10, padding: '12px 12px', minHeight: 110 }}>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 10, letterSpacing: '0.08em' }}>DATASET</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 4, marginBottom: 6 }}>
          {cols.map(c => (
            <div key={c} style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: accent.text, opacity: 0.8, paddingBottom: 4, borderBottom: `1px solid ${T.lineDark}` }}>{c}</div>
          ))}
        </div>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 4, padding: '3px 0' }}>
            {row.map((cell, ci) => (
              <div key={ci} style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: cell === '1' && ci === 2 ? accent.text : 'rgba(255,255,255,0.45)' }}>{cell}</div>
            ))}
          </div>
        ))}
      </div>
      {/* Model + metrics */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 10, padding: '12px 12px', minHeight: 110 }}>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 10, letterSpacing: '0.08em' }}>MODEL</div>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>classifier · v3</div>
        {[
          { label: 'accuracy', w: 82 },
          { label: 'precision', w: 76 },
          { label: 'recall', w: 71 },
        ].map(m => (
          <div key={m.label} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>
              <span>{m.label}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${m.w}%`, background: accent.primary, borderRadius: 2, opacity: 0.75 }} />
            </div>
          </div>
        ))}
      </div>
      {/* Insight output */}
      <div style={{ background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 10, padding: '12px 12px', minHeight: 110 }}>
        <div style={{ color: accent.textMuted, fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 10, letterSpacing: '0.08em' }}>INSIGHT</div>
        <div style={{ fontSize: 11, color: C.white, lineHeight: 1.5, marginBottom: 10 }}>High-risk segment identified</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['retain', 'review', 'act'].map(tag => (
            <span key={tag} style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: accent.text, background: accent.subtleStrong, padding: '3px 8px', borderRadius: 4, border: `1px solid ${accent.border}` }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function GenericWorkspace({ accent, steps }: { accent: ReturnType<typeof getDomainAccent>; steps: WorkflowStep[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="program-workflow-panels">
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 10, padding: '12px 14px', minHeight: 88 }}>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 8, letterSpacing: '0.08em' }}>INPUT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['row_a', 'row_b', 'row_c'].map((row, idx) => (
            <div key={row} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 4, height: 4, borderRadius: 1, background: accent.primary, opacity: 0.6 }} />
              <div style={{ height: 6, flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 2, maxWidth: `${[72, 58, 85][idx]}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 10, padding: '12px 14px', minHeight: 88 }}>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 8, letterSpacing: '0.08em' }}>OUTPUT</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{steps[steps.length - 1]?.detail}</div>
      </div>
    </div>
  )
}

/** Domain-native workflow composition — the primary product visual anchor for program heroes. */
export default function ProgramWorkflowVisual({
  slug,
  programType,
  programName,
}: {
  slug: string
  programType: ProgramType
  programName: string
}) {
  const steps = resolveWorkflow(slug, programType)
  const themeId = resolveAuroraTheme(`/programs/${slug}`, slug, programType)
  const accent = getDomainAccent(themeId)
  const isDataScience = slug === 'data-science-ai'

  return (
    <GlassSurface level={3} padding={0} style={{ overflow: 'hidden' }} className="program-workflow-visual">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${T.lineDark}` }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => (
            <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
        </div>
        <div style={{ flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          {programName} · workspace
        </div>
      </div>

      <div className="program-workflow-steps" style={{ display: 'flex', alignItems: 'stretch', gap: 0, padding: '18px 16px 6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {steps.map((step, i) => {
          const isActive = i === steps.length - 1
          const isPast = i < steps.length - 2
          return (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: '1 1 0', minWidth: 76 }}>
              <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, margin: '0 auto 8px',
                  background: isActive ? accent.subtleStrong : isPast ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? accent.border : T.lineDark}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontFamily: 'var(--font-mono)', color: isActive ? accent.text : 'rgba(255,255,255,0.4)',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ color: isActive ? C.white : 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, lineHeight: 1.2, marginBottom: 2 }}>{step.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 9, lineHeight: 1.3 }}>{step.detail}</div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 14, height: 1, background: isPast ? accent.border : T.lineDark, flexShrink: 0, marginBottom: 30, opacity: isPast ? 0.6 : 1 }} />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ padding: '10px 16px 18px' }}>
        {isDataScience ? <DataScienceWorkspace accent={accent} /> : <GenericWorkspace accent={accent} steps={steps} />}
        <div style={{ marginTop: 10, padding: '9px 12px', background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent.primary }} />
          <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            Pipeline complete · {steps[steps.length - 1]?.label} ready
          </span>
        </div>
      </div>
    </GlassSurface>
  )
}
