import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, SectionHeader, Button, Eyebrow, T, Heading } from '../components/ui'
import { ContextualNavBar, useSectionSpy, type ContextualNavItem } from '../components/foundation'
import { CapabilityRail, MaturityMark } from '../components/product/Architecture'
import { INSTITUTION_OS_LAYERS } from '../lib/product-architecture'
import { getDomainAccent } from '../aurora-themes'

const accent = getDomainAccent('institution')

const INSTITUTION_NAV_ITEMS: ContextualNavItem[] = [
  { id: 'institution-types', label: 'Institution Types', sub: 'Six partnership models' },
  { id: 'ecosystem', label: 'Product coverage', sub: 'Education → Skills → Career' },
  { id: 'partnership', label: 'Partnership', sub: 'How it works' },
  { id: 'enquiries', label: 'Enquiries', sub: 'Get in touch' },
]

const institutionTypes = [
  {
    id: 'schools',
    label: 'Schools',
    sub: 'K–12 · Secondary · Senior Secondary',
    problem: 'Academic progress is hard for parents and teachers to see in one place.',
    value: 'Students, teachers, classes, assessments, parent visibility, and progress in a schooling workflow.',
    workflow: ['Students', 'Teachers', 'Classes', 'Assessments', 'Parent view', 'Progress'],
    description: 'Introduce structured learning, activities, and career awareness before higher education — without turning school into a corporate LMS.',
    offers: [
      'Grade → subject → chapter → lesson delivery',
      'Activities and assessments teachers can run',
      'Parent-visible progress',
      'Faculty development resources',
    ],
  },
  {
    id: 'colleges',
    label: 'Colleges',
    sub: 'Degree Colleges · Autonomous Institutions',
    problem: 'Degrees finish. Employability does not arrive automatically.',
    value: 'Programs, departments, LMS, skills, projects, and career readiness alongside the academic calendar.',
    workflow: ['Programs', 'Departments', 'Students', 'LMS', 'Projects', 'Career OS'],
    description: 'Pair undergraduate study with professional programs, projects, and a path into Career OS for qualifying students.',
    offers: [
      'Professional Programs beside the degree',
      'Skills tracks and project portfolios',
      'Career OS for qualifying students',
      'Interview and application workflow',
    ],
  },
  {
    id: 'universities',
    label: 'Universities',
    sub: 'Multi-program · Research Institutions',
    problem: 'Scale across departments without fragmenting student lifecycle and outcomes.',
    value: 'Multi-program curriculum, assessments, student lifecycle, and outcomes as shared infrastructure.',
    workflow: ['Multi-program', 'Departments', 'Curriculum', 'Assessments', 'Lifecycle', 'Outcomes'],
    description: 'Run Skylent OS as institutional infrastructure — curriculum enrichment, LMS, career readiness, postgraduate tracks.',
    offers: [
      'Curriculum co-design across departments',
      'LMS and assessment infrastructure',
      'Career readiness at graduate scale',
      'Postgraduate specialisation tracks',
    ],
  },
  {
    id: 'skill-institutions',
    label: 'Skill & Training Institutions',
    sub: 'Training Centers · Vocational · EdTech',
    problem: 'Batches, trainers, and certificates live in spreadsheets, not a career path.',
    value: 'Programs, batches, trainers, learners, certification, and career support as one delivery system.',
    workflow: ['Programs', 'Batches', 'Trainers', 'Learners', 'Certification', 'Career support'],
    description: 'Power delivery with Skylent infrastructure — credentials and Career OS for qualifying graduates.',
    offers: [
      'Batch and trainer operations',
      'Certification framework',
      'Career OS for qualifying learners',
      'Job board connection — when roles are published',
    ],
  },
  {
    id: 'assessment',
    label: 'Assessment & Exam Partners',
    sub: 'Boards · Assessment Bodies · Coaching',
    problem: 'Tests end at a score. Learners need a path after the result.',
    value: 'Question banks, tests, attempts, scoring, and analytics — linked to learning, not stranded.',
    workflow: ['Question banks', 'Tests', 'Attempts', 'Scoring', 'Analytics'],
    description: 'Connect examination infrastructure to continuous learning and, where relevant, exam-prep products (JEE, NEET, CAT).',
    offers: [
      'Assessment technology integration',
      'Analytics on attempts and scoring',
      'Link scores to learning pathways',
      'Exam-prep product collaboration',
    ],
  },
  {
    id: 'industry',
    label: 'Academic & Industry Partners',
    sub: 'Employers · Industry Bodies · Curriculum partners',
    problem: 'Hiring and curriculum rarely share the same pipeline.',
    value: 'Projects, experts, curriculum collaboration, and employability — co-designed, not bolted on.',
    workflow: ['Projects', 'Experts', 'Curriculum', 'Employability'],
    description: 'Co-design programs that create a talent pipeline from education into your industry.',
    offers: [
      'Custom program co-design',
      'Expert and project collaboration',
      'Employability-aligned curriculum',
      'Hiring pathway into Career OS when roles exist',
    ],
  },
]

const partnershipSteps = [
  { n: '01', label: 'Discovery', desc: 'We map your institution\'s needs, learner profile, and current gaps.' },
  { n: '02', label: 'Co-design', desc: 'Faculty, curriculum leads, and Skylent design the program together.' },
  { n: '03', label: 'Deployment', desc: 'Configure what already ships: organisation accounts, live programmes, LMS progress.' },
  { n: '04', label: 'Delivery', desc: 'Learners enrol on open programmes. Batches and faculty assignment are not built yet.' },
  { n: '05', label: 'Review', desc: 'Partnership review against real enrolment and LMS progress — not a reporting suite.' },
]

function InstitutionTypesSection({
  activeType,
  setActiveType,
}: {
  activeType: string
  setActiveType: (id: string) => void
}) {
  const navigate = useNavigate()
  const active = institutionTypes.find(t => t.id === activeType) ?? institutionTypes[1]

  return (
    <Section id="institution-types" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="light"
          eyebrow="Operating models"
          title="Partnership by institution type — intended workflow, not a live OS."
          lead="Select a type to see the operating spine we would build with that partner. Batches, faculty assignment, and reporting are not shipping."
        />
      </FadeIn>

      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'minmax(200px, 0.35fr) 1fr', gap: 'clamp(28px,4vw,48px)', alignItems: 'start' }} className="institution-type-grid">
        <FadeIn>
          <div className="skylent-label" style={{ color: C.slate, marginBottom: 14 }}>Select type</div>
          <nav aria-label="Institution types" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {institutionTypes.map((t, i) => {
              const selected = activeType === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveType(t.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: selected ? accent.subtle : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${selected ? accent.primary : 'transparent'}`,
                    borderBottom: i < institutionTypes.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: selected ? 600 : 400, color: selected ? C.ink : C.slate }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: 11, color: C.slate, marginTop: 3 }}>{t.sub}</div>
                </button>
              )
            })}
          </nav>
        </FadeIn>

        <FadeIn delay={60}>
          <div
            style={{
              background: C.cream,
              border: `1px solid ${T.lineDark}`,
              borderRadius: 12,
              padding: '24px 26px',
              minWidth: 0,
            }}
          >
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{active.sub}</div>
            <h3 className="skylent-display-sm" style={{ color: C.ink, margin: '0 0 6px' }}>{active.label}</h3>
            <p style={{ color: C.slate, fontSize: 12.5, fontFamily: 'var(--font-mono)', margin: '0 0 18px' }}>Product direction · not a live control panel</p>
            <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.75, margin: '0 0 12px' }}>
              <strong style={{ color: C.ink, fontWeight: 600 }}>Problem. </strong>{active.problem}
            </p>
            <p style={{ color: C.slate, fontSize: 15, lineHeight: 1.75, margin: '0 0 12px' }}>{active.value}</p>
            <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, margin: '0 0 22px' }}>{active.description}</p>
            <Button variant="primary" themeId="institution" onClick={() => navigate('/contact')}>Enquire now →</Button>
          </div>

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${T.lineDark}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,48px)' }} className="two-col-sm">
              <div>
                <div className="skylent-label" style={{ color: C.slate, marginBottom: 14 }}>Intended workflow</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {active.workflow.map((step, i, arr) => (
                    <div
                      key={step}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '28px minmax(0, 1fr)',
                        gap: 10,
                        padding: '10px 0',
                        borderBottom: i < arr.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.indigo }}>{String(i + 1).padStart(2, '0')}</span>
                      <span style={{ color: C.ink, fontSize: 14 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="skylent-label" style={{ color: C.slate, marginBottom: 14 }}>Intended capability</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {active.offers.map((offer, i) => (
                    <div key={offer} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < active.offers.length - 1 ? `1px solid ${T.lineDark}` : 'none', alignItems: 'flex-start' }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent.primary, flexShrink: 0, marginTop: 7 }} />
                      <span style={{ color: C.slate, fontSize: 14, lineHeight: 1.55 }}>{offer}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

function EcosystemSection() {
  const columns = [
    {
      name: 'Education',
      note: 'Coming soon',
      items: ['Schooling pathway', 'Undergraduate tracks', 'Postgraduate specialisation'],
    },
    {
      name: 'Skills',
      note: 'Live core',
      items: ['Courses', 'Certificate programmes', 'Professional programmes'],
      accent: true,
    },
    {
      name: 'Career OS',
      note: 'Live workspace',
      items: ['Profile and evidence', 'Opportunities when published', 'Applications and interviews'],
    },
  ]

  return (
    <Section id="ecosystem" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="light"
          eyebrow="Product coverage"
          title="What a partner can actually run today."
          lead="Live professional programmes, LMS progress, and Career OS are real. Academic lines and institutional reporting are not."
        />
      </FadeIn>

      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }} className="institution-ecosystem-grid">
        {columns.map((col, i) => (
          <FadeIn key={col.name} delay={i * 50}>
            <div style={{ padding: '0 28px 0 0', borderRight: i < columns.length - 1 ? `1px solid ${T.lineDark}` : 'none' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: col.accent ? accent.text : C.ink, margin: '0 0 6px' }}>
                {col.name}
              </h3>
              <div className="skylent-label" style={{ color: C.slate, marginBottom: 16 }}>{col.note}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {col.items.map((item, j) => (
                  <div key={item} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: j < col.items.length - 1 ? `1px solid ${T.lineDark}` : 'none', alignItems: 'center' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: col.accent ? accent.primary : C.indigo, flexShrink: 0 }} />
                    <span style={{ color: C.slate, fontSize: 14 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}

function PartnershipSection() {
  return (
    <Section id="partnership" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="light"
          eyebrow="How it works"
          title="The partnership process."
          lead="Partnership starts with a conversation. Full Institution OS — batches, faculty, reporting — is the intended product, not what an organisation account can run today."
        />
      </FadeIn>

      <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
        <div
          aria-hidden
          className="institution-partnership-line"
          style={{
            position: 'absolute',
            top: 18,
            left: '4%',
            right: '4%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accent.border}, ${accent.border}, transparent)`,
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }} className="institution-partnership-grid">
          {partnershipSteps.map((step, i) => (
            <FadeIn key={step.n} delay={i * 50}>
              <div style={{ padding: '0 16px 0 0' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text, marginBottom: 14 }}>{step.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.ink, margin: '0 0 8px' }}>{step.label}</h3>
                <p style={{ color: C.slate, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )
}

function EnquiriesSection() {
  const navigate = useNavigate()
  const features = ['No long lock-ins', 'Co-designed programmes', 'Organisation accounts exist', 'Honest capability map']

  return (
    <Section id="enquiries" tone="canvas" divider>
      <FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,64px)', alignItems: 'start' }} className="two-col">
          <div>
            <Eyebrow tone="light">Institution enquiries</Eyebrow>
            <Heading tone="light" size="sm" style={{ margin: '20px 0 16px' }}>
              Ready to explore a partnership?
            </Heading>
            <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.75, margin: '0 0 28px', maxWidth: 480 }}>
              Get in touch to discuss your institution's needs. We'll map a partnership that fits your learners, your curriculum, and your goals.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginBottom: 28 }}>
              {features.map(f => (
                <span key={f} style={{ color: C.slate, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: accent.primary }} />
                  {f}
                </span>
              ))}
            </div>
            <Button variant="primary" themeId="institution" size="lg" onClick={() => navigate('/contact')}>Partner With Skylent →</Button>
          </div>
          <div style={{ background: C.cream, border: `1px solid ${T.lineDark}`, borderRadius: 12, padding: '24px 26px' }}>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 16 }}>What is in scope now</div>
            {[
              { k: 'Live for learners', v: 'Programmes, LMS, Career OS' },
              { k: 'Organisation account', v: 'Sign-in shell exists' },
              { k: 'Not built', v: 'Batches, faculty assignment, reporting' },
              { k: 'Next conversation', v: 'Co-design around what already ships' },
            ].map(({ k, v }, i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.lineDark}` : 'none' }}>
                <span style={{ color: C.slate, fontSize: 13 }}>{k}</span>
                <span style={{ color: C.ink, fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </Section>
  )
}

export default function InstitutionsPage() {
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState<string>('colleges')
  const activeSection = useSectionSpy(INSTITUTION_NAV_ITEMS.map(i => i.id))

  return (
    <PageShell aurora={false}>
      <div className="arch-academic-shell" style={{ paddingTop: T.navH + 28 }}>
        <div className="arch-academic-inner">
          <header className="arch-line-header" style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
              <div className="skylent-label" style={{ color: C.indigo, margin: 0 }}>Institution OS</div>
              <MaturityMark maturity="direction" />
            </div>
            <h1 className="skylent-display-md" style={{ color: C.ink, margin: '0 0 14px', maxWidth: 740 }}>
              An operating layer for delivery — not a consumer landing page.
            </h1>
            <p className="skylent-body-lg" style={{ color: C.slate, margin: 0, maxWidth: 580 }}>
              Institution OS is how a school, college, university, or training partner would run programmes, people, and reporting. The organisation dashboard today is an honest shell. Batches, faculty assignment, and institutional reporting are not built.
            </p>
          </header>
          <section className="arch-section">
            <div className="skylent-label" style={{ color: C.slate, marginBottom: 14 }}>Capability vs what ships</div>
            <CapabilityRail items={INSTITUTION_OS_LAYERS} />
          </section>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <Button variant="primary" themeId="institution" onClick={() => navigate('/contact')}>Talk to partnerships</Button>
            <Button variant="secondary" onClick={() => navigate('/login')}>Organisation sign in</Button>
          </div>
        </div>
      </div>

      <ContextualNavBar items={INSTITUTION_NAV_ITEMS} themeId="institution" activeId={activeSection} />

      <InstitutionTypesSection activeType={activeType} setActiveType={setActiveType} />
      <EcosystemSection />
      <PartnershipSection />
      <EnquiriesSection />
    </PageShell>
  )
}
