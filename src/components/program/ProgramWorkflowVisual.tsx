import { GlassSurface } from '../foundation'
import { C, T } from '../../tokens'
import type { ProgramType } from '../../data'
import { getAuroraTheme, resolveAuroraTheme } from '../../aurora-themes'

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
  const theme = getAuroraTheme(resolveAuroraTheme(`/programs/${slug}`, slug, programType))
  const accent = theme.primary

  return (
    <GlassSurface level={3} padding={0} style={{ overflow: 'hidden' }} className="program-workflow-visual">
      {/* Window chrome */}
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

      {/* Workflow strip */}
      <div className="program-workflow-steps" style={{ display: 'flex', alignItems: 'stretch', gap: 0, padding: '20px 16px 8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {steps.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: '1 1 0', minWidth: 72 }}>
            <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, margin: '0 auto 8px',
                background: i === steps.length - 1 ? `${accent}22` : 'rgba(255,255,255,0.06)',
                border: `1px solid ${i === steps.length - 1 ? `${accent}55` : T.lineDark}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontFamily: 'var(--font-mono)', color: i === steps.length - 1 ? accent : 'rgba(255,255,255,0.45)',
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ color: C.white, fontSize: 11, fontWeight: 600, lineHeight: 1.2, marginBottom: 2 }}>{step.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 9, lineHeight: 1.3 }}>{step.detail}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 16, height: 1, background: T.lineDark, flexShrink: 0, marginBottom: 28 }} />
            )}
          </div>
        ))}
      </div>

      {/* Product workspace mock */}
      <div style={{ padding: '8px 16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="program-workflow-panels">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 10, padding: '12px 14px', minHeight: 88 }}>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 8, letterSpacing: '0.08em' }}>INPUT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['feature_a', 'feature_b', 'feature_c'].map((row, idx) => (
                <div key={row} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 4, height: 4, borderRadius: 1, background: accent, opacity: 0.6 }} />
                  <div style={{ height: 6, flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 2, maxWidth: `${[72, 58, 85][idx]}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 10, padding: '12px 14px', minHeight: 88 }}>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 8, letterSpacing: '0.08em' }}>OUTPUT</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
              {[40, 65, 50, 80, 55, 72].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? accent : 'rgba(255,255,255,0.12)', borderRadius: 2, opacity: i === 5 ? 0.85 : 0.5 }} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10, padding: '10px 12px', background: `${accent}12`, border: `1px solid ${accent}30`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
          <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {steps[steps.length - 1]?.label}: ready for review
          </span>
        </div>
      </div>
    </GlassSurface>
  )
}
