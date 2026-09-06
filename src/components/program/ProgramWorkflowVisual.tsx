import type { ReactNode } from 'react'
import { GlassSurface } from '../foundation'
import { C, T } from '../../tokens'
import type { ProgramType } from '../../data'
import { getDomainAccent, resolveAuroraTheme } from '../../aurora-themes'

type WorkflowStep = { label: string; detail: string }
type Accent = ReturnType<typeof getDomainAccent>

const SLUG_WORKFLOW: Record<string, WorkflowStep[]> = {
  'data-science-ai': [
    { label: 'Pipeline', detail: 'Features & splits' },
    { label: 'Model', detail: 'Train & tune' },
    { label: 'Metrics', detail: 'Validation scores' },
    { label: 'Project', detail: 'Portfolio output' },
  ],
  'data-analytics-pro': [
    { label: 'Dataset', detail: 'Source & quality' },
    { label: 'SQL', detail: 'Query & transform' },
    { label: 'Dashboard', detail: 'Visualise KPIs' },
    { label: 'Insight', detail: 'Recommend action' },
  ],
  'full-stack': [
    { label: 'Code', detail: 'Frontend & API' },
    { label: 'API', detail: 'Routes & auth' },
    { label: 'Database', detail: 'Schema & queries' },
    { label: 'Logs', detail: 'Debug & monitor' },
    { label: 'Project', detail: 'Ship deliverable' },
  ],
  'jee-advanced-prep': [
    { label: 'Question', detail: 'PCM prompt' },
    { label: 'Timer', detail: 'Timed attempt' },
    { label: 'Answer', detail: 'Your response' },
    { label: 'Solution', detail: 'Worked method' },
    { label: 'Score', detail: 'Performance log' },
  ],
  'cat-prep': [
    { label: 'Case', detail: 'Passage or DI set' },
    { label: 'Timer', detail: 'Section clock' },
    { label: 'Reason', detail: 'Logic path' },
    { label: 'Answer', detail: 'Selected option' },
    { label: 'Score', detail: 'Accuracy trend' },
  ],
  'generative-ai-program': [
    { label: 'Prompt', detail: 'Task design' },
    { label: 'Pipeline', detail: 'LLM workflow' },
    { label: 'Evaluate', detail: 'Output quality' },
    { label: 'Project', detail: 'Use case doc' },
  ],
  'sql-certificate': [
    { label: 'Dataset', detail: 'Business tables' },
    { label: 'SQL', detail: 'Query practice' },
    { label: 'Result', detail: 'Answer set' },
    { label: 'Assessment', detail: 'Timed test' },
  ],
  'product-management': [
    { label: 'Campaign', detail: 'Goal & audience' },
    { label: 'Channel', detail: 'Touchpoints' },
    { label: 'Analytics', detail: 'Track metrics' },
    { label: 'ROAS', detail: 'Conversion outcome' },
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
    { label: 'Session', detail: 'Live instruction' },
    { label: 'Notes', detail: 'Key takeaways' },
    { label: 'Activity', detail: 'Apply concepts' },
    { label: 'Recording', detail: 'On-demand replay' },
  ],
  EXAM_PREP: [
    { label: 'Question', detail: 'Topic prompt' },
    { label: 'Timer', detail: 'Timed attempt' },
    { label: 'Answer', detail: 'Your response' },
    { label: 'Solution', detail: 'Worked method' },
    { label: 'Score', detail: 'Performance log' },
  ],
  SCHOOLING: [
    { label: 'Lesson', detail: 'Instruction block' },
    { label: 'Activity', detail: 'Guided practice' },
    { label: 'Explain', detail: 'Concept clarity' },
    { label: 'Assess', detail: 'Check mastery' },
  ],
  UNDERGRADUATE: [
    { label: 'Curriculum', detail: 'Term structure' },
    { label: 'Module', detail: 'Subject unit' },
    { label: 'Assignment', detail: 'Coursework' },
    { label: 'Project', detail: 'Capstone output' },
  ],
  POSTGRADUATE: [
    { label: 'Curriculum', detail: 'Specialisation' },
    { label: 'Module', detail: 'Advanced unit' },
    { label: 'Case', detail: 'Applied scenario' },
    { label: 'Project', detail: 'Deliverable' },
  ],
}

function resolveWorkflow(slug: string, programType: ProgramType): WorkflowStep[] {
  if (SLUG_WORKFLOW[slug]) return SLUG_WORKFLOW[slug]
  if (slug.includes('neet')) {
    return [
      { label: 'Question', detail: 'MCQ prompt' },
      { label: 'Timer', detail: 'Timed section' },
      { label: 'Answer', detail: 'Marked response' },
      { label: 'Solution', detail: 'Explanation' },
      { label: 'Score', detail: 'Accuracy trend' },
    ]
  }
  return TYPE_WORKFLOW[programType]
}

function Panel({ label, accent, children, highlight }: { label: string; accent: Accent; children: ReactNode; highlight?: boolean }) {
  return (
    <div style={{
      background: highlight ? accent.subtle : 'rgba(255,255,255,0.03)',
      border: `1px solid ${highlight ? accent.border : T.lineDark}`,
      borderRadius: 10, padding: '12px 12px', minHeight: 100,
    }}>
      <div style={{ color: highlight ? accent.textMuted : 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 10, letterSpacing: '0.08em' }}>{label}</div>
      {children}
    </div>
  )
}

function DataScienceWorkspace({ accent }: { accent: Accent }) {
  const cols = ['tenure', 'charges', 'churn']
  const rows = [['12', '2840', '0'], ['24', '5120', '0'], ['6', '1890', '1']]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr 1fr', gap: 10 }} className="program-workflow-panels">
      <Panel label="DATASET" accent={accent}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 4, marginBottom: 6 }}>
          {cols.map(c => <div key={c} style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: accent.text, opacity: 0.8, paddingBottom: 4, borderBottom: `1px solid ${T.lineDark}` }}>{c}</div>)}
        </div>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 4, padding: '3px 0' }}>
            {row.map((cell, ci) => <div key={ci} style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: cell === '1' && ci === 2 ? accent.text : 'rgba(255,255,255,0.45)' }}>{cell}</div>)}
          </div>
        ))}
      </Panel>
      <Panel label="METRICS" accent={accent}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>experiment · run 12</div>
        {[{ label: 'accuracy', w: 82 }, { label: 'f1', w: 76 }, { label: 'auc', w: 71 }].map(m => (
          <div key={m.label} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>{m.label}</div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${m.w}%`, background: accent.primary, borderRadius: 2, opacity: 0.75 }} />
            </div>
          </div>
        ))}
      </Panel>
      <Panel label="PROJECT" accent={accent} highlight>
        <div style={{ fontSize: 11, color: C.white, lineHeight: 1.5, marginBottom: 8 }}>Churn prediction notebook</div>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text }}>portfolio-ready · v1</div>
      </Panel>
    </div>
  )
}

function DataAnalyticsWorkspace({ accent }: { accent: Accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }} className="program-workflow-panels">
      <Panel label="SQL" accent={accent}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text, lineHeight: 1.6 }}>
          SELECT region,<br />SUM(revenue)<br />GROUP BY 1
        </div>
      </Panel>
      <Panel label="DASHBOARD" accent={accent}>
        {[{ label: 'Revenue', w: 68 }, { label: 'Conv.', w: 42 }].map(k => (
          <div key={k.label} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>{k.label}</div>
            <div style={{ height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${k.w}%`, background: accent.primary, opacity: 0.5, borderRadius: '4px 4px 0 0' }} />
            </div>
          </div>
        ))}
      </Panel>
      <Panel label="INSIGHT" accent={accent} highlight>
        <div style={{ fontSize: 11, color: C.white, lineHeight: 1.5 }}>West region underperforming — investigate channel mix</div>
      </Panel>
    </div>
  )
}

function FullStackWorkspace({ accent }: { accent: Accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="program-workflow-panels">
      <Panel label="CODE" accent={accent}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
          export async function GET() {'{'}<br />
          &nbsp;&nbsp;return Response.json(data)<br />
          {'}'}
        </div>
      </Panel>
      <Panel label="API" accent={accent}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text }}>GET /api/users</div>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>200 · 24ms</div>
      </Panel>
      <Panel label="DATABASE" accent={accent}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          users (id, email, role)<br />sessions (id, user_id)
        </div>
      </Panel>
      <Panel label="LOGS" accent={accent} highlight>
        <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
          [info] query ok 12ms<br />
          [warn] cache miss<br />
          [info] deploy ready
        </div>
      </Panel>
    </div>
  )
}

function JeeExamWorkspace({ accent }: { accent: Accent }) {
  const mathAccent = getDomainAccent('jee')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 10 }} className="program-workflow-panels">
      <Panel label="QUESTION · MATH" accent={accent}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {['Physics', 'Chemistry', 'Math'].map((s, i) => (
            <span key={s} style={{
              fontSize: 8, fontFamily: 'var(--font-mono)', padding: '3px 8px', borderRadius: 4,
              background: i === 2 ? mathAccent.subtle : 'rgba(255,255,255,0.04)',
              border: `1px solid ${i === 2 ? mathAccent.border : T.lineDark}`,
              color: i === 2 ? mathAccent.text : 'rgba(255,255,255,0.4)',
            }}>{s}</span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.white, lineHeight: 1.5, marginBottom: 10 }}>If ∫₀² 3t² dt = k, find k.</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['A', 'B', 'C', 'D'].map(opt => (
            <span key={opt} style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 4,
              background: opt === 'B' ? accent.subtleStrong : 'rgba(255,255,255,0.04)',
              border: `1px solid ${opt === 'B' ? accent.border : T.lineDark}`,
              color: opt === 'B' ? accent.text : 'rgba(255,255,255,0.45)',
            }}>{opt}</span>
          ))}
        </div>
      </Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Panel label="TIMER" accent={accent}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: accent.text, letterSpacing: '0.06em' }}>04:32</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Q 14 · timed practice</div>
        </Panel>
        <Panel label="SOLUTION" accent={accent} highlight>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>∫₀² 3t² dt = 8 units</div>
        </Panel>
      </div>
    </div>
  )
}

function NeetExamWorkspace({ accent }: { accent: Accent }) {
  const bioAccent = getDomainAccent('neet')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="program-workflow-panels">
      <Panel label="BIOLOGY · DIAGRAM" accent={accent}>
        <div style={{ height: 52, borderRadius: 6, border: `1px dashed ${bioAccent.border}`, background: bioAccent.subtle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
          Cell · NCERT Fig 8.2
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>Label organelles · guided practice</div>
      </Panel>
      <Panel label="MCQ · BOTANY" accent={accent} highlight>
        <div style={{ fontSize: 11, color: C.white, lineHeight: 1.45, marginBottom: 10 }}>Which enzyme fixes CO₂ in C₄ plants?</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['PEP', 'RuBisCO', 'ATP'].map((o, i) => (
            <span key={o} style={{
              fontSize: 9, fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 4,
              background: i === 0 ? accent.subtleStrong : 'rgba(255,255,255,0.04)',
              border: `1px solid ${i === 0 ? accent.border : T.lineDark}`,
              color: i === 0 ? accent.text : 'rgba(255,255,255,0.45)',
            }}>{o}</span>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function CatExamWorkspace({ accent }: { accent: Accent }) {
  const catAccent = getDomainAccent('cat')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 10 }} className="program-workflow-panels">
      <Panel label="CASE · DILR" accent={accent}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {['VARC', 'DILR', 'QA'].map((s, i) => (
            <span key={s} style={{
              fontSize: 8, fontFamily: 'var(--font-mono)', padding: '3px 8px', borderRadius: 4,
              background: i === 1 ? catAccent.subtle : 'rgba(255,255,255,0.04)',
              border: `1px solid ${i === 1 ? catAccent.border : T.lineDark}`,
              color: i === 1 ? catAccent.text : 'rgba(255,255,255,0.4)',
            }}>{s}</span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.white, lineHeight: 1.5, marginBottom: 10 }}>Should the brand enter Tier-2 cities this quarter?</div>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>DI table · Region · revenue</div>
      </Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Panel label="REASONING" accent={accent} highlight>
          <div style={{ fontSize: 10, color: accent.text, marginBottom: 6 }}>Option B · margin analysis</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>Expansion cost vs projected lift</div>
        </Panel>
        <Panel label="SECTION TIMER" accent={accent}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: accent.text }}>18:45</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>DILR · sectional clock</div>
        </Panel>
      </div>
    </div>
  )
}

function MarketingWorkspace({ accent }: { accent: Accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="program-workflow-panels">
      <Panel label="CAMPAIGN" accent={accent}>
        <div style={{ fontSize: 11, color: C.white, marginBottom: 6 }}>Q3 product launch</div>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>Goal: qualified leads</div>
      </Panel>
      <Panel label="CHANNELS" accent={accent}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['email', 'paid', 'organic'].map(ch => (
            <span key={ch} style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: accent.text, background: accent.subtle, padding: '3px 8px', borderRadius: 4, border: `1px solid ${accent.border}` }}>{ch}</span>
          ))}
        </div>
      </Panel>
      <Panel label="ANALYTICS" accent={accent}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 36 }}>
          {[40, 65, 48, 80, 58].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, background: accent.primary, opacity: 0.45 + i * 0.08, borderRadius: '2px 2px 0 0' }} />
          ))}
        </div>
      </Panel>
      <Panel label="ROAS" accent={accent} highlight>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: accent.text }}>3.2×</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>conversion vs spend</div>
      </Panel>
    </div>
  )
}

function GenericWorkspace({ accent, steps }: { accent: Accent; steps: WorkflowStep[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="program-workflow-panels">
      <Panel label="INPUT" accent={accent}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{steps[0]?.detail}</div>
      </Panel>
      <Panel label="OUTPUT" accent={accent} highlight>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{steps[steps.length - 1]?.detail}</div>
      </Panel>
    </div>
  )
}

function resolveWorkspace(slug: string, programType: ProgramType, accent: Accent, steps: WorkflowStep[]) {
  if (slug === 'data-science-ai' || slug === 'generative-ai-program') return <DataScienceWorkspace accent={accent} />
  if (slug === 'data-analytics-pro' || slug === 'sql-certificate') return <DataAnalyticsWorkspace accent={accent} />
  if (slug === 'full-stack') return <FullStackWorkspace accent={accent} />
  if (slug === 'product-management') return <MarketingWorkspace accent={accent} />
  if (slug.includes('neet')) return <NeetExamWorkspace accent={accent} />
  if (slug.includes('cat')) return <CatExamWorkspace accent={accent} />
  if (slug.includes('jee') || programType === 'EXAM_PREP') return <JeeExamWorkspace accent={accent} />
  return <GenericWorkspace accent={accent} steps={steps} />
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
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: '1 1 0', minWidth: 72 }}>
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
        {resolveWorkspace(slug, programType, accent, steps)}
        <div style={{ marginTop: 10, padding: '9px 12px', background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent.primary }} />
          <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {steps[steps.length - 1]?.label} ready · {steps[steps.length - 1]?.detail}
          </span>
        </div>
      </div>
    </GlassSurface>
  )
}
