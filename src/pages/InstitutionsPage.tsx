import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, SectionHeader, Button, Eyebrow, CTABand, T, Heading } from '../components/ui'
import { Aurora, MediaImage, GlassSurface, ContextualNavPanel, ContextualNavBar, useSectionSpy, type ContextualNavItem } from '../components/foundation'
import { ProductVisual } from '../components/product/ProductVisuals'
import { getDomainAccent } from '../aurora-themes'
import { PHOTO } from '../media'

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
    photo: PHOTO.schoolBuilding,
  },
  {
    id: 'colleges',
    label: 'Colleges',
    sub: 'Degree Colleges · Autonomous Institutions',
    problem: 'Degrees finish. Employability does not arrive automatically.',
    value: 'Programs, departments, LMS, skills, projects, and career readiness alongside the academic calendar.',
    workflow: ['Programs', 'Departments', 'Students', 'LMS', 'Projects', 'Career'],
    description: 'Pair undergraduate study with professional programs, projects, and a path into Career OS for qualifying students.',
    offers: [
      'Professional Programs beside the degree',
      'Skills tracks and project portfolios',
      'Career OS for qualifying students',
      'Career readiness workflow',
    ],
    photo: PHOTO.college,
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
    photo: PHOTO.university,
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
      'Job board connection',
    ],
    photo: PHOTO.training,
  },
  {
    id: 'assessment',
    label: 'Assessment & Exam Partners',
    sub: 'Boards · Assessment Bodies · Coaching',
    problem: 'Tests end at a score. Learners need a path after the result.',
    value: 'Question banks, tests, attempts, scoring, and analytics — linked to learning, not stranded.',
    workflow: ['Question banks', 'Tests', 'Attempts', 'Scoring', 'Analytics'],
    description: 'Connect examination infrastructure to continuous learning and, where relevant, catalogue exam-prep products (JEE, CAT).',
    offers: [
      'Assessment technology integration',
      'Analytics on attempts and scoring',
      'Link scores to learning pathways',
      'Exam-prep product collaboration',
    ],
    photo: PHOTO.assessment,
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
      'Hiring pathway into Career OS jobs',
    ],
    photo: PHOTO.industry,
  },
]

const partnershipSteps = [
  { n: '01', label: 'Discovery', desc: 'We map your institution\'s needs, learner profile, and current gaps.' },
  { n: '02', label: 'Co-design', desc: 'Faculty, curriculum leads, and Skylent design the program together.' },
  { n: '03', label: 'Deployment', desc: 'Skylent OS is configured and deployed for your institution.' },
  { n: '04', label: 'Delivery', desc: 'Live program delivery with ongoing support and analytics.' },
  { n: '05', label: 'Outcomes', desc: 'Career readiness workflows and continuous improvement — without invented placement rates.' },
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
          tone="dark"
          eyebrow="Institution types"
          title="What can Skylent provide to your institution?"
          lead="Every institution type has a distinct partnership model. Select yours to see what Skylent delivers."
        />
      </FadeIn>

      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'minmax(200px, 0.35fr) 1fr', gap: 'clamp(28px,4vw,48px)', alignItems: 'start' }} className="institution-type-grid">
        <FadeIn>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 14 }}>Select type</div>
          <nav aria-label="Institution types" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {institutionTypes.map((t, i) => {
              const selected = activeType === t.id
              return (
                <button
                  key={t.id}
                  id={t.id}
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
                    scrollMarginTop: T.navH + 24,
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: selected ? 600 : 400, color: selected ? C.white : 'rgba(255,255,255,0.55)' }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{t.sub}</div>
                </button>
              )
            })}
          </nav>
        </FadeIn>

        <FadeIn delay={60}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(24px,4vw,40px)', alignItems: 'start' }} className="two-col">
            <MediaImage src={active.photo} alt={active.label} aspect="4/3" overlay="full" />
            <div>
              <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{active.sub}</div>
              <h3 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 14px' }}>{active.label}</h3>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, lineHeight: 1.75, margin: '0 0 12px' }}>
                <strong style={{ color: C.white, fontWeight: 600 }}>Problem. </strong>{active.problem}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.75, margin: '0 0 24px' }}>{active.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>{active.description}</p>
              <Button variant="primary" themeId="institution" onClick={() => navigate('/contact')}>Enquire now →</Button>
            </div>
          </div>

          <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${T.lineDark}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,48px)' }} className="two-col-sm">
              <div>
                <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 14 }}>Workflow</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  {active.workflow.map((step, i, arr) => (
                    <span key={step} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span>{step}</span>
                      {i < arr.length - 1 && <span style={{ color: accent.textMuted }}>→</span>}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 14 }}>Capability</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {active.offers.map((offer, i) => (
                    <div key={offer} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < active.offers.length - 1 ? `1px solid ${T.lineDark}` : 'none', alignItems: 'flex-start' }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent.primary, flexShrink: 0, marginTop: 7 }} />
                      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.55 }}>{offer}</span>
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
      items: ['Schooling programs', 'Undergraduate tracks', 'Postgraduate pathways'],
    },
    {
      name: 'Skills',
      items: ['Webinars & workshops', 'Certificate programs', 'Professional programs', 'Job assistance'],
      accent: true,
    },
    {
      name: 'Career OS',
      items: ['Interview preparation', 'Job Board access', 'Career readiness tools'],
    },
  ]

  return (
    <Section id="ecosystem" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Product coverage"
          title="Education, Skills, and Career OS for partners."
          lead="Schools, colleges, and training partners choose which products to run. Each ships with the workflows that match their learners."
        />
      </FadeIn>

      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }} className="institution-ecosystem-grid">
        {columns.map((col, i) => (
          <FadeIn key={col.name} delay={i * 50}>
            <div style={{ padding: '0 28px 0 0', borderRight: i < columns.length - 1 ? `1px solid ${T.lineDark}` : 'none' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: col.accent ? accent.text : C.white, margin: '0 0 20px' }}>
                {col.name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {col.items.map((item, j) => (
                  <div key={item} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: j < col.items.length - 1 ? `1px solid ${T.lineDark}` : 'none', alignItems: 'center' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: col.accent ? accent.primary : 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{item}</span>
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
          tone="dark"
          eyebrow="How it works"
          title="The partnership process."
          lead="From the first conversation to a live program — a structured, collaborative approach."
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
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.white, margin: '0 0 8px' }}>{step.label}</h3>
                <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
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
  const features = ['No long lock-ins', 'Co-designed programs', 'Full Skylent OS deployment', 'Ongoing support']

  return (
    <Section id="enquiries" tone="canvas" divider>
      <FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,64px)', alignItems: 'start' }} className="two-col">
          <div>
            <Eyebrow tone="dark">Institution enquiries</Eyebrow>
            <Heading tone="dark" size="sm" style={{ margin: '20px 0 16px' }}>
              Ready to explore a partnership?
            </Heading>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.75, margin: '0 0 28px', maxWidth: 480 }}>
              Get in touch to discuss your institution's needs. We'll map a partnership that fits your learners, your curriculum, and your goals.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginBottom: 28 }}>
              {features.map(f => (
                <span key={f} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: accent.primary }} />
                  {f}
                </span>
              ))}
            </div>
            <Button variant="primary" themeId="institution" size="lg" onClick={() => navigate('/contact')}>Partner With Skylent →</Button>
          </div>
          <GlassSurface level={2} padding="24px 26px">
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 16 }}>Partnership scope</div>
            {[
              { k: 'Institution types', v: 'Schools through industry partners' },
              { k: 'Delivery', v: 'Skylent OS deployment' },
              { k: 'Programs', v: 'Co-designed with your faculty' },
              { k: 'Support', v: 'Dedicated partnership team' },
            ].map(({ k, v }, i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.lineDark}` : 'none' }}>
                <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>{k}</span>
                <span style={{ color: C.white, fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </GlassSurface>
        </div>
      </FadeIn>
    </Section>
  )
}

export default function InstitutionsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeType, setActiveType] = useState<string>('colleges')
  const activeSection = useSectionSpy(INSTITUTION_NAV_ITEMS.map(i => i.id))

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '')
    if (!hash) return
    if (institutionTypes.some(t => t.id === hash)) {
      setActiveType(hash)
    }
  }, [location.hash])

  return (
    <PageShell auroraTheme="institution">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 24}px ${T.gutter} ${T.sectionTight}` }}>
        <Aurora themeId="institution" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px,5vw,64px)', alignItems: 'start' }} className="two-col skylent-page-hero institution-page-hero">
            <FadeIn>
              <Eyebrow tone="dark" accent>For Institutions</Eyebrow>
              <h1 className="skylent-display-lg" style={{ color: C.white, margin: '20px 0 16px', maxWidth: 640 }}>
                Institution OS for education delivery.
              </h1>
              <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 520, margin: '0 0 28px' }}>
                Programs, batches, learners, assessment, and progress — operational workflows for schools, colleges, universities, and training partners.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button variant="primary" themeId="institution" size="lg" onClick={() => navigate('/contact')}>Partner With Skylent</Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/os')}>Explore Skylent OS</Button>
              </div>
            </FadeIn>
            <FadeIn delay={80}>
              <div className="institution-hero-visual-wrap" style={{ minHeight: 'clamp(380px, 48vh, 520px)' }}>
                <ProductVisual id="institution-pipeline" themeId="institution" style={{ height: '100%', minHeight: 'clamp(360px, 46vh, 500px)' }} />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <ContextualNavBar items={INSTITUTION_NAV_ITEMS} themeId="institution" activeId={activeSection} />

      <InstitutionTypesSection activeType={activeType} setActiveType={setActiveType} />
      <EcosystemSection />
      <PartnershipSection />
      <EnquiriesSection />

      <CTABand
        eyebrow="Get in touch"
        title={<>Bring Skylent OS<br />to your institution.</>}
        lead="Let's map your needs and co-design a program that moves your learners from education to employability."
        primary={{ label: 'Partner With Skylent', to: '/contact' }}
        secondary={{ label: 'View Skylent OS', to: '/os' }}
        auroraTheme="institution"
      />
    </PageShell>
  )
}
