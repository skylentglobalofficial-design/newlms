import type { Program, ProgramType } from '../../data'
import { C, T } from '../../tokens'
import type { AuroraThemeId } from '../../aurora-themes'
import { getDomainAccent } from '../../aurora-themes'
import { FadeIn } from '../shared'
import { Section, SectionHeader, Eyebrow, FlowStrip } from '../ui'
import { GlassSurface } from '../foundation'
import { ProductVisual, resolveProgramVisualId, type ModuleRailItem } from '../product/ProductVisuals'

const SLUG_ACTIVITIES: Record<string, string[]> = {
  'data-analytics-pro': [
    'Practice SQL with real business scenarios',
    'Build a dashboard from a business dataset',
    'Write queries that answer stakeholder questions',
    'Present insights with charts and narrative',
  ],
  'data-science-ai': [
    'Train a model on a real dataset',
    'Evaluate precision, recall, and validation metrics',
    'Build an end-to-end ML pipeline',
    'Ship a portfolio-ready prediction project',
  ],
  'generative-ai-program': [
    'Design prompts for structured data tasks',
    'Build an LLM-assisted analytics workflow',
    'Evaluate model outputs against business criteria',
    'Document a generative AI use case',
  ],
  'full-stack': [
    'Build and debug an API',
    'Model a database schema for a product feature',
    'Trace a request from browser to database',
    'Ship a full-stack project with logs you can read',
  ],
  'sql-certificate': [
    'Write joins across business tables',
    'Practice SQL with real business scenarios',
    'Aggregate data for reporting questions',
    'Pass a timed SQL assessment',
  ],
  'jee-advanced-prep': [
    'Work through timed engineering problems',
    'Solve calculus and mechanics under exam conditions',
    'Review worked solutions after each attempt',
    'Track accuracy by subject section',
  ],
  'cat-prep': [
    'Analyse a business case under time pressure',
    'Interpret data for decision questions',
    'Practice verbal reasoning passages',
    'Review accuracy trends by section',
  ],
  'product-management': [
    'Break down a product problem into metrics',
    'Prioritise features with a business case',
    'Map a user journey to product decisions',
    'Present a product recommendation',
  ],
}

const TYPE_ACTIVITIES: Record<ProgramType, string[]> = {
  PROFESSIONAL: [
    'Complete structured modules with hands-on work',
    'Build portfolio projects reviewed by mentors',
    'Pass assessments that prove applied skill',
    'Move into Career OS after program completion',
  ],
  CERTIFICATE: [
    'Complete module exercises on a fixed schedule',
    'Build a capstone project for your credential',
    'Pass the program assessment',
    'Receive a verifiable certificate',
  ],
  WEBINAR: [
    'Attend a live session with Q&A',
    'Complete the session activity',
    'Review the recording on demand',
    'Apply concepts from the session',
  ],
  EXAM_PREP: [
    'Work through timed practice questions',
    'Review solutions and methods',
    'Take mock tests by section',
    'Track performance by topic',
  ],
  SCHOOLING: [
    'Follow chapter-based lessons',
    'Complete guided activities',
    'Take chapter assessments',
    'See progress by subject',
  ],
  UNDERGRADUATE: [
    'Follow semester module structure',
    'Complete assignments and coursework',
    'Build term projects',
    'Track progress across subjects',
  ],
  POSTGRADUATE: [
    'Work through specialisation modules',
    'Analyse cases and research problems',
    'Complete term projects',
    'Prepare portfolio deliverables',
  ],
}

export function getProgramActivities(program: Program): string[] {
  if (SLUG_ACTIVITIES[program.slug]) return SLUG_ACTIVITIES[program.slug]
  if (program.whatYouWillLearn?.length) {
    return program.whatYouWillLearn.slice(0, 4).map(item => {
      if (item.length > 72) return item.slice(0, 69) + '…'
      return item
    })
  }
  return TYPE_ACTIVITIES[program.programType]
}

export function ProgramOutcomesSection({
  program,
  themeId,
  accent,
}: {
  program: Program
  themeId: AuroraThemeId
  accent: ReturnType<typeof getDomainAccent>
}) {
  const activities = getProgramActivities(program)
  const visualId = resolveProgramVisualId(program.slug, program.programType)

  return (
    <Section id="outcomes" tone="canvas" divider>
      <FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,64px)', alignItems: 'start' }} className="two-col program-outcomes-split">
          <div>
            <SectionHeader
              tone="dark"
              eyebrow="What you will actually do"
              title="Concrete work — not feature bullets."
              lead={`This program is built around applied work that leads to: ${program.outcome}.`}
            />
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {activities.map((activity, i) => (
                <div
                  key={activity}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr',
                    gap: 14,
                    padding: '16px 0',
                    borderBottom: i < activities.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                    alignItems: 'start',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text, paddingTop: 2 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, lineHeight: 1.65 }}>{activity}</div>
                </div>
              ))}
            </div>
          </div>
          <ProductVisual
            id={visualId}
            themeId={themeId}
            className="program-outcomes-visual"
            style={{ minHeight: 280 }}
          />
        </div>
      </FadeIn>
    </Section>
  )
}

export function ProgramCurriculumRail({
  modules,
  themeId,
}: {
  modules: ModuleRailItem[]
  themeId: AuroraThemeId
}) {
  if (!modules.length) return null
  return (
    <ProductVisual
      id="curriculum-rail"
      themeId={themeId}
      modules={modules}
      label="Curriculum · module progression"
      style={{ minHeight: 240 }}
    />
  )
}

export function ProgramLearningSection({
  program,
  themeId,
  accent,
  isExamPrep,
}: {
  program: Program
  themeId: AuroraThemeId
  accent: ReturnType<typeof getDomainAccent>
  isExamPrep: boolean
}) {
  if (!program.learningExperience?.length) return null

  const phases = ['Learn', 'Practice', 'Build', 'Review', 'Prove']

  return (
    <Section id="experience" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Learning experience"
          title={isExamPrep ? 'How preparation is structured' : 'Learn → Practice → Build → Review → Prove'}
          lead="A learning system with clear phases — not six disconnected marketing cards."
        />
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(28px,4vw,48px)', alignItems: 'start' }} className="two-col">
          <ProductVisual id="learning-loop" themeId={themeId} style={{ minHeight: 200 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {program.learningExperience.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr',
                  gap: 16,
                  padding: '16px 0',
                  borderBottom: i < program.learningExperience!.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  alignItems: 'start',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: accent.text }}>
                  {phases[i % phases.length]}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.65 }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </Section>
  )
}

export function ProgramCareerSection({
  themeId,
  accent,
}: {
  themeId: AuroraThemeId
  accent: ReturnType<typeof getDomainAccent>
}) {
  return (
    <Section id="career" tone="canvas" divider style={{ paddingTop: T.sectionTight, paddingBottom: T.sectionTight }}>
      <FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }} className="two-col">
          <div>
            <Eyebrow tone="dark" accent>Career support</Eyebrow>
            <h2 className="skylent-display-md" style={{ color: C.white, margin: '18px 0 16px' }}>
              From learning to application tracking.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 16, lineHeight: 1.75, margin: '0 0 28px', maxWidth: 440 }}>
              Completing this Professional Program activates Career OS. Build proof from coursework, then discover roles, apply, prepare, and track — without unsupported placement claims.
            </p>
            <FlowStrip
              tone="dark"
              steps={[
                { label: 'Learning', sub: 'Finish program' },
                { label: 'Proof', sub: 'Portfolio work', highlight: true },
                { label: 'Apply', sub: 'From job board' },
              ]}
            />
          </div>
          <ProductVisual id="career-workspace" themeId={themeId} style={{ minHeight: 300 }} />
        </div>
        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {['Profile', 'Proof', 'Discover', 'Apply', 'Prepare', 'Track'].map(step => (
            <div key={step} style={{ padding: '14px 16px', borderTop: `1px solid ${T.lineDark}` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 4 }}>{step}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, lineHeight: 1.45 }}>
                {step === 'Track' ? 'See what happens after you apply' : `Career OS · ${step.toLowerCase()}`}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </Section>
  )
}
