/**
 * Deterministic product/interface visuals — no remote image URLs.
 * Use visualId strings from media.ts via MediaImage or ProductVisual directly.
 */
import type { CSSProperties, ReactNode } from 'react'
import { GlassSurface } from '../foundation'
import { C, T } from '../../tokens'
import { getDomainAccent, type AuroraThemeId } from '../../aurora-themes'
import type { ProgramType } from '../../data'

export type ProductVisualId =
  | 'ecosystem-flow'
  | 'career-pipeline'
  | 'catalog-browser'
  | 'data-workspace'
  | 'analytics-workspace'
  | 'fullstack-workspace'
  | 'exam-interface'
  | 'schooling-classroom'
  | 'college-lab'
  | 'research-desk'
  | 'study-session'
  | 'workshop-session'
  | 'institution-dashboard'
  | 'institution-ops'
  | 'skills-ladder'
  | 'neet-lab'
  | 'mba-case'
  | 'campaign-funnel'
  | 'curriculum-map'
  | 'curriculum-rail'
  | 'learning-loop'
  | 'career-workspace'
  | 'institution-pipeline'
  | 'about-ecosystem'
  | 'generic-program'

type Accent = ReturnType<typeof getDomainAccent>

function Shell({
  label,
  accent,
  children,
  className,
  style,
}: {
  label: string
  accent: Accent
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <GlassSurface level={2} padding={0} className={className} style={{ overflow: 'hidden', height: '100%', ...style }}>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.lineDark}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => (
            <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.65 }} />
          ))}
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.06em' }}>
          {label}
        </div>
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </GlassSurface>
  )
}

function MiniBar({ accent, heights }: { accent: Accent; heights: number[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
      {heights.map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h}%`, background: accent.primary, opacity: 0.35 + i * 0.1, borderRadius: '2px 2px 0 0' }} />
      ))}
    </div>
  )
}

function EcosystemFlow({ accent }: { accent: Accent }) {
  const careerAccent = getDomainAccent('career')
  const proAccent = getDomainAccent('professional')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 10, padding: 12 }}>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Learn</div>
        <div style={{ fontSize: 11, color: C.white, marginBottom: 8 }}>Module 4 · SQL joins</div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
          <div style={{ width: '68%', height: '100%', background: accent.primary, borderRadius: 2, opacity: 0.8 }} />
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 10, padding: 12 }}>
        <div className="skylent-label" style={{ color: proAccent.text, marginBottom: 8 }}>Build</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          SELECT region, SUM(revenue)<br />FROM orders GROUP BY 1
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1', background: careerAccent.subtle, border: `1px solid ${careerAccent.border}`, borderRadius: 10, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="skylent-label" style={{ color: careerAccent.text, marginBottom: 6 }}>Career</div>
          <div style={{ fontSize: 11, color: C.white }}>Application submitted · Data Analyst</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>See what happens after you apply</div>
        </div>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: careerAccent.text, background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: 6 }}>Track</div>
      </div>
    </div>
  )
}

function CareerPipeline({ accent }: { accent: Accent }) {
  const steps = ['Profile', 'Proof', 'Discover', 'Apply', 'Prepare', 'Track']
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
      {steps.map((step, i) => (
        <div key={step} style={{ flex: '1 0 72px', textAlign: 'center' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, margin: '0 auto 6px',
            background: i === 3 ? accent.subtleStrong : 'rgba(255,255,255,0.04)',
            border: `1px solid ${i === 3 ? accent.border : T.lineDark}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontFamily: 'var(--font-mono)', color: i === 3 ? accent.text : 'rgba(255,255,255,0.35)',
          }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 9, color: i === 3 ? C.white : 'rgba(255,255,255,0.45)', fontWeight: i === 3 ? 600 : 400 }}>{step}</div>
        </div>
      ))}
    </div>
  )
}

function DataWorkspace({ accent }: { accent: Accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 8 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: accent.text, lineHeight: 1.7, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8 }}>
        features · label<br />0.82 · churn<br />0.71 · tenure
      </div>
      <div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>validation</div>
        <MiniBar accent={accent} heights={[55, 72, 68, 81]} />
      </div>
    </div>
  )
}

function AnalyticsWorkspace({ accent }: { accent: Accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 8 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: accent.text, lineHeight: 1.6 }}>
        Practice SQL with real business scenarios
      </div>
      <MiniBar accent={accent} heights={[40, 65, 52, 78, 58]} />
    </div>
  )
}

function FullStackWorkspace({ accent }: { accent: Accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 9 }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>GET /api/users<br />200 · 24ms</div>
      <div style={{ color: accent.text, lineHeight: 1.6 }}>users(id, email)<br />sessions(user_id)</div>
    </div>
  )
}

function ExamInterface({ accent }: { accent: Accent }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.white, lineHeight: 1.5, marginBottom: 10 }}>
        If ∫₀² 3t² dt = k, find k.
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {['A', 'B', 'C', 'D'].map(o => (
          <span key={o} style={{
            fontSize: 10, fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 4,
            background: o === 'B' ? accent.subtle : 'rgba(255,255,255,0.04)',
            border: `1px solid ${o === 'B' ? accent.border : T.lineDark}`,
            color: o === 'B' ? accent.text : 'rgba(255,255,255,0.4)',
          }}>{o}</span>
        ))}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: accent.text }}>04:32</div>
    </div>
  )
}

function SchoolingClassroom({ accent }: { accent: Accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {['Chapter 6', 'Activity'].map((t, i) => (
        <div key={t} style={{ padding: 10, background: i === 1 ? accent.subtle : 'rgba(255,255,255,0.03)', border: `1px solid ${i === 1 ? accent.border : T.lineDark}`, borderRadius: 8 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text, marginBottom: 4 }}>{t}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{i === 0 ? 'Fractions · NCERT' : 'Guided practice'}</div>
        </div>
      ))}
    </div>
  )
}

function CatalogBrowser({ accent }: { accent: Accent }) {
  const items = ['Data Science & AI', 'Data Analytics', 'Full Stack', 'CAT Prep']
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 0, minHeight: 140 }}>
      <div style={{ borderRight: `1px solid ${T.lineDark}`, paddingRight: 10 }}>
        {items.map((item, i) => (
          <div key={item} style={{
            padding: '8px 6px', fontSize: 11,
            color: i === 0 ? C.white : 'rgba(255,255,255,0.45)',
            borderLeft: `2px solid ${i === 0 ? accent.primary : 'transparent'}`,
            background: i === 0 ? accent.subtle : 'transparent',
          }}>{item}</div>
        ))}
      </div>
      <div style={{ paddingLeft: 10 }}>
        <div style={{ fontSize: 10, color: accent.text, marginBottom: 6 }}>Program structure</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>18 modules · 6 projects · live + self-paced</div>
      </div>
    </div>
  )
}

function InstitutionDashboard({ accent }: { accent: Accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
      {[
        { k: 'Batches', v: 'Schedule view' },
        { k: 'Learners', v: 'Roster' },
        { k: 'Progress', v: 'Review queue' },
      ].map(({ k, v }) => (
        <div key={k} style={{ padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: `1px solid ${T.lineDark}` }}>
          <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>{k}</div>
          <div style={{ fontSize: 11, color: k === 'Progress' ? accent.text : 'rgba(255,255,255,0.55)', marginTop: 4 }}>{v}</div>
        </div>
      ))}
    </div>
  )
}

function CareerWorkspace({ accent }: { accent: Accent }) {
  const sampleSteps = [
    { label: 'Profile', detail: 'Identity · skills', active: false },
    { label: 'Proof', detail: 'Program projects', active: false },
    { label: 'Apply', detail: 'Data Analyst role', active: true },
    { label: 'Track', detail: 'Application status', active: false },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sampleSteps.map(step => (
          <div key={step.label} style={{
            padding: '8px 10px', borderRadius: 6, fontSize: 10,
            background: step.active ? accent.subtle : 'rgba(255,255,255,0.03)',
            border: `1px solid ${step.active ? accent.border : T.lineDark}`,
          }}>
            <div style={{ color: step.active ? accent.text : 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)', fontSize: 9, marginBottom: 3 }}>{step.label}</div>
            <div style={{ color: step.active ? C.white : 'rgba(255,255,255,0.4)', fontSize: 10 }}>{step.detail}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${T.lineDark}`, borderRadius: 8, padding: 12 }}>
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 10 }}>Application</div>
        <div style={{ fontSize: 11, color: C.white, marginBottom: 8 }}>Submitted · under review</div>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          See what happens after you apply
        </div>
        <div style={{ marginTop: 12, padding: '8px 10px', background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 6, fontSize: 9, color: accent.text }}>
          Prepare → interview round scheduled
        </div>
      </div>
    </div>
  )
}

function InstitutionPipeline({ accent }: { accent: Accent }) {
  const steps = ['Institution', 'Programs', 'Learners', 'Assessment', 'Progress', 'Outcomes']
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 10, marginBottom: 10 }}>
        {steps.map((step, i) => (
          <div key={step} style={{ flex: '1 0 64px', textAlign: 'center' }}>
            <div style={{
              height: 4, borderRadius: 2, marginBottom: 6,
              background: i <= 2 ? accent.primary : 'rgba(255,255,255,0.08)',
              opacity: i <= 2 ? 0.75 : 1,
            }} />
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: i === 2 ? accent.text : 'rgba(255,255,255,0.35)' }}>{step}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 8 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text, marginBottom: 6 }}>Batch · Sem 4</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Modules · assessments</div>
        </div>
        <div style={{ padding: 10, background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 8 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text, marginBottom: 6 }}>Learner progress</div>
          <div style={{ fontSize: 10, color: C.white }}>At-risk review · outcomes</div>
        </div>
      </div>
    </div>
  )
}

function LearningLoop({ accent }: { accent: Accent }) {
  const phases = [
    { label: 'Learn', sub: 'Instruction' },
    { label: 'Practice', sub: 'Exercises' },
    { label: 'Build', sub: 'Projects' },
    { label: 'Review', sub: 'Feedback' },
    { label: 'Prove', sub: 'Assessment' },
  ]
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
      {phases.map((phase, i) => (
        <div key={phase.label} style={{ flex: '1 0 72px', textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, margin: '0 auto 6px',
            background: i === 2 ? accent.subtleStrong : 'rgba(255,255,255,0.04)',
            border: `1px solid ${i === 2 ? accent.border : T.lineDark}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontFamily: 'var(--font-mono)', color: i === 2 ? accent.text : 'rgba(255,255,255,0.35)',
          }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 10, color: i === 2 ? C.white : 'rgba(255,255,255,0.5)', fontWeight: i === 2 ? 600 : 400 }}>{phase.label}</div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{phase.sub}</div>
        </div>
      ))}
    </div>
  )
}

type ModuleRailItem = { number: string; title: string; duration?: string }

function CurriculumRail({ accent, modules }: { accent: Accent; modules: ModuleRailItem[] }) {
  const visible = modules.slice(0, 6)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {visible.map((mod, i) => (
        <div key={mod.number} style={{
          display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 10, alignItems: 'center',
          padding: '10px 0', borderBottom: i < visible.length - 1 ? `1px solid ${T.lineDark}` : 'none',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: i === 1 ? accent.subtle : 'rgba(255,255,255,0.04)',
            border: `1px solid ${i === 1 ? accent.border : T.lineDark}`,
            fontSize: 9, fontFamily: 'var(--font-mono)', color: i === 1 ? accent.text : 'rgba(255,255,255,0.35)',
          }}>
            {mod.number}
          </div>
          <div style={{ fontSize: 11, color: i === 1 ? C.white : 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>{mod.title}</div>
          {mod.duration && <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.28)' }}>{mod.duration}</div>}
        </div>
      ))}
    </div>
  )
}

function AboutEcosystem({ accent }: { accent: Accent }) {
  const pillars = [
    { label: 'Education', theme: getDomainAccent('schooling') },
    { label: 'Skills', theme: getDomainAccent('professional') },
    { label: 'Career', theme: getDomainAccent('career') },
    { label: 'Institutions', theme: getDomainAccent('institution') },
    { label: 'Employers', theme: accent },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {pillars.map((pillar, i) => (
        <div key={pillar.label} style={{
          display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10, alignItems: 'center',
          padding: '10px 12px', borderRadius: 8,
          background: i === 2 ? pillar.theme.subtle : 'rgba(255,255,255,0.03)',
          border: `1px solid ${i === 2 ? pillar.theme.border : T.lineDark}`,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: pillar.theme.text }}>{String(i + 1).padStart(2, '0')}</div>
          <div style={{ fontSize: 12, color: i === 2 ? C.white : 'rgba(255,255,255,0.6)', fontWeight: i === 2 ? 600 : 400 }}>{pillar.label}</div>
          {i < pillars.length - 1 && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>→</div>}
        </div>
      ))}
    </div>
  )
}

function SkillsLadder({ accent }: { accent: Accent }) {
  const items = ['Webinar', 'Certificate', 'Professional', 'Career OS']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <div key={item} style={{
          padding: '8px 10px', borderRadius: 6, fontSize: 11,
          background: i === 2 ? accent.subtle : 'rgba(255,255,255,0.03)',
          border: `1px solid ${i === 2 ? accent.border : T.lineDark}`,
          color: i === 2 ? C.white : 'rgba(255,255,255,0.5)',
        }}>{item}</div>
      ))}
    </div>
  )
}

function NeetLab({ accent }: { accent: Accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <div style={{ padding: 10, background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 8 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text, marginBottom: 6 }}>Biology · Diagram</div>
        <div style={{ height: 36, borderRadius: 6, border: `1px dashed ${accent.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Cell structure</div>
      </div>
      <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 8 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text, marginBottom: 6 }}>Practice</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>MCQ · timed set</div>
      </div>
    </div>
  )
}

function MbaCase({ accent }: { accent: Accent }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: accent.text, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>Case · Retail expansion</div>
      <div style={{ fontSize: 11, color: C.white, lineHeight: 1.55, marginBottom: 10 }}>Should the brand enter Tier-2 cities this quarter?</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>
        <div style={{ padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>Revenue data</div>
        <div style={{ padding: 8, background: accent.subtle, borderRadius: 6, color: accent.text }}>DI chart</div>
      </div>
    </div>
  )
}

function CampaignFunnel({ accent }: { accent: Accent }) {
  const stages = ['Reach', 'Click', 'Lead', 'ROAS']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {stages.map((stage, i) => (
        <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: `${100 - i * 18}%`, padding: '6px 10px', background: i === 3 ? accent.subtle : 'rgba(255,255,255,0.04)', border: `1px solid ${i === 3 ? accent.border : T.lineDark}`, borderRadius: 4, fontSize: 10, color: i === 3 ? accent.text : 'rgba(255,255,255,0.5)' }}>
            {stage}
          </div>
        </div>
      ))}
    </div>
  )
}

function CurriculumMap({ accent }: { accent: Accent }) {
  const terms = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
      {terms.map((term, i) => (
        <div key={term} style={{ padding: '8px 6px', textAlign: 'center', background: i === 1 ? accent.subtle : 'rgba(255,255,255,0.03)', border: `1px solid ${i === 1 ? accent.border : T.lineDark}`, borderRadius: 6 }}>
          <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: accent.text, marginBottom: 4 }}>{term}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>{i === 1 ? 'Active' : '—'}</div>
        </div>
      ))}
    </div>
  )
}

function InstitutionOps({ accent }: { accent: Accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.lineDark}`, borderRadius: 8 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text, marginBottom: 6 }}>Programs</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Batches · offerings</div>
      </div>
      <div style={{ padding: 10, background: accent.subtle, border: `1px solid ${accent.border}`, borderRadius: 8 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text, marginBottom: 6 }}>Learners</div>
        <div style={{ fontSize: 11, color: C.white }}>Progress · at-risk</div>
      </div>
    </div>
  )
}

const VISUAL_LABELS: Record<ProductVisualId, string> = {
  'ecosystem-flow': 'Skylent · workspace',
  'career-pipeline': 'Career OS · pipeline',
  'catalog-browser': 'Programs · catalog',
  'data-workspace': 'Data Science · pipeline',
  'analytics-workspace': 'Analytics · SQL + dashboard',
  'fullstack-workspace': 'Full Stack · API + DB',
  'exam-interface': 'Exam prep · timed practice',
  'schooling-classroom': 'Schooling · chapter view',
  'college-lab': 'Undergraduate · lab session',
  'research-desk': 'Postgraduate · research',
  'study-session': 'Study · practice set',
  'workshop-session': 'Workshop · live session',
  'institution-dashboard': 'Institution · batch review',
  'institution-ops': 'Institution · operations',
  'skills-ladder': 'Skills · progression',
  'neet-lab': 'NEET · biology lab',
  'mba-case': 'CAT/MBA · case study',
  'campaign-funnel': 'Marketing · campaign funnel',
  'curriculum-map': 'UG · curriculum map',
  'curriculum-rail': 'Curriculum · module rail',
  'learning-loop': 'Learning · workflow',
  'career-workspace': 'Career OS · workspace',
  'institution-pipeline': 'Institution OS · pipeline',
  'about-ecosystem': 'Skylent · ecosystem',
  'generic-program': 'Program · workspace',
}

function resolveContent(id: ProductVisualId, accent: Accent, modules?: ModuleRailItem[]) {
  switch (id) {
    case 'ecosystem-flow': return <EcosystemFlow accent={accent} />
    case 'career-pipeline': return <CareerPipeline accent={accent} />
    case 'catalog-browser': return <CatalogBrowser accent={accent} />
    case 'data-workspace': return <DataWorkspace accent={accent} />
    case 'analytics-workspace': return <AnalyticsWorkspace accent={accent} />
    case 'fullstack-workspace': return <FullStackWorkspace accent={accent} />
    case 'exam-interface': return <ExamInterface accent={accent} />
    case 'schooling-classroom': return <SchoolingClassroom accent={accent} />
    case 'college-lab': return <FullStackWorkspace accent={accent} />
    case 'research-desk': return <DataWorkspace accent={accent} />
    case 'study-session': return <ExamInterface accent={accent} />
    case 'workshop-session': return <SkillsLadder accent={accent} />
    case 'institution-dashboard': return <InstitutionDashboard accent={accent} />
    case 'institution-ops': return <InstitutionOps accent={accent} />
    case 'institution-pipeline': return <InstitutionPipeline accent={accent} />
    case 'skills-ladder': return <SkillsLadder accent={accent} />
    case 'neet-lab': return <NeetLab accent={accent} />
    case 'mba-case': return <MbaCase accent={accent} />
    case 'campaign-funnel': return <CampaignFunnel accent={accent} />
    case 'curriculum-map': return <CurriculumMap accent={accent} />
    case 'curriculum-rail': return <CurriculumRail accent={accent} modules={modules ?? []} />
    case 'learning-loop': return <LearningLoop accent={accent} />
    case 'career-workspace': return <CareerWorkspace accent={accent} />
    case 'about-ecosystem': return <AboutEcosystem accent={accent} />
    default: return <AnalyticsWorkspace accent={accent} />
  }
}

export function resolveProgramVisualId(slug: string, programType?: ProgramType): ProductVisualId {
  if (slug === 'data-science-ai' || slug === 'generative-ai-program') return 'data-workspace'
  if (slug === 'data-analytics-pro' || slug === 'sql-certificate') return 'analytics-workspace'
  if (slug === 'full-stack' || slug === 'full-stack-web') return 'fullstack-workspace'
  if (slug.includes('neet')) return 'neet-lab'
  if (slug.includes('cat') || slug === 'product-management') return 'mba-case'
  if (slug.includes('jee') || programType === 'EXAM_PREP') return 'exam-interface'
  if (slug.includes('marketing') || slug.includes('digital')) return 'campaign-funnel'
  if (programType === 'SCHOOLING') return 'schooling-classroom'
  if (programType === 'UNDERGRADUATE') return 'college-lab'
  if (programType === 'POSTGRADUATE') return 'research-desk'
  if (programType === 'WEBINAR') return 'workshop-session'
  return 'generic-program'
}

export type { ModuleRailItem }

export function ProductVisual({
  id,
  themeId = 'general',
  className,
  style,
  label,
  modules,
}: {
  id: ProductVisualId
  themeId?: AuroraThemeId
  className?: string
  style?: CSSProperties
  label?: string
  modules?: ModuleRailItem[]
}) {
  const accent = getDomainAccent(themeId)
  return (
    <Shell label={label ?? VISUAL_LABELS[id]} accent={accent} className={className} style={style}>
      {resolveContent(id, accent, modules)}
    </Shell>
  )
}

export function isProductVisualRef(value: string): boolean {
  return value.startsWith('skylent:')
}

export function parseProductVisualRef(value: string): ProductVisualId {
  return value.replace(/^skylent:/, '') as ProductVisualId
}
