import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, SectionHeader, PageHero, Eyebrow, Button, Badge, CTABand, T } from '../components/ui'
import { PHOTO } from '../media'

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
    color: '#1a2418',
  },
  {
    id: 'colleges',
    label: 'Colleges',
    sub: 'Degree Colleges · Autonomous Institutions',
    problem: 'Degrees finish. Employability does not arrive automatically.',
    value: 'Programs, departments, LMS, skills, projects, and placement readiness alongside the academic calendar.',
    workflow: ['Programs', 'Departments', 'Students', 'LMS', 'Projects', 'Placement'],
    description: 'Pair undergraduate study with professional programs, projects, and a path into Career OS for qualifying students.',
    offers: [
      'Professional Programs beside the degree',
      'Skills tracks and project portfolios',
      'Career OS for qualifying students',
      'Placement preparation workflow',
    ],
    photo: PHOTO.college,
    color: '#161820',
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
    color: '#1c1614',
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
    color: '#16141f',
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
    photo: PHOTO.assessment,
    color: '#13201c',
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
    color: '#1c1420',
  },
]

const partnershipSteps = [
  { n: '01', label: 'Discovery', desc: 'We map your institution\'s needs, learner profile, and current gaps.' },
  { n: '02', label: 'Co-design', desc: 'Faculty, curriculum leads, and Skylent design the program together.' },
  { n: '03', label: 'Deployment', desc: 'Skylent OS is configured and deployed for your institution.' },
  { n: '04', label: 'Delivery', desc: 'Live program delivery with ongoing support and analytics.' },
  { n: '05', label: 'Outcomes', desc: 'Graduate career readiness, placements, and continuous improvement.' },
]

export default function InstitutionsPage() {
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState<string>('colleges')
  const active = institutionTypes.find(t => t.id === activeType) ?? institutionTypes[1]

  return (
    <PageShell>
      <PageHero
        eyebrow="For Institutions"
        photo={PHOTO.university}
        photoAlt="University campus"
        title={<>Enterprise software<br />for <span style={{ color: C.orange }}>education.</span></>}
        lead="Not six marketing cards. Six workflows — schools, colleges, universities, training institutes, assessment partners, and industry — each with a distinct problem and operating model."
        actions={<>
          <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>Partner With Skylent</Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/os')}>Explore Skylent OS</Button>
        </>}
      />

      {/* Institution Type Selector */}
      <Section bg={C.warmWhite}>
        <FadeIn>
          <SectionHeader
            eyebrow="Institution types"
            title={<>What can Skylent provide<br />to your institution?</>}
            lead="Every institution type has a distinct partnership model. Select yours to see what Skylent delivers."
          />
        </FadeIn>

        {/* Type tabs */}
        <FadeIn delay={80}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 48, marginBottom: 32 }}>
            {institutionTypes.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                style={{
                  background: activeType === t.id ? C.ink : C.white,
                  color: activeType === t.id ? C.white : C.slate,
                  border: `1px solid ${activeType === t.id ? C.ink : T.lineLight}`,
                  borderRadius: T.rPill,
                  padding: '9px 18px',
                  fontSize: 13.5,
                  fontWeight: activeType === t.id ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.18s',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Active type detail */}
        <FadeIn delay={120}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(20px,4vw,40px)', alignItems: 'stretch' }} className="two-col">
            <div style={{ background: active.color, borderRadius: T.rCard, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 200, position: 'relative' }}>
                <img src={active.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.7 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
              </div>
              <div style={{ padding: 'clamp(24px,3vw,36px)' }}>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>{active.sub.toUpperCase()}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 600, color: C.white, margin: '0 0 12px' }}>{active.label}</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}><strong style={{ color: C.white, fontWeight: 600 }}>Problem. </strong>{active.problem}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{active.value}</p>
                <div style={{ marginTop: 24 }}>
                  <Button variant="primary" onClick={() => navigate('/contact')}>Enquire now</Button>
                </div>
              </div>
            </div>
            <div>
              <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>WORKFLOW</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {active.workflow.map(step => (
                  <span key={step} style={{ background: C.sand, borderRadius: 8, padding: '8px 12px', fontSize: 13, color: C.ink }}>{step}</span>
                ))}
              </div>
              <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>CAPABILITY</div>
              {active.offers.map((offer, i) => (
                <div key={offer} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: i < active.offers.length - 1 ? `1px solid ${T.lineLight}` : 'none' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange, marginTop: 7, flexShrink: 0 }} />
                  <div style={{ color: C.ink, fontSize: 14.5, lineHeight: 1.55 }}>{offer}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* Ecosystem delivery */}
      <Section bg={C.sand}>
        <FadeIn>
          <SectionHeader
            eyebrow="The ecosystem"
            title={<>Education → Skills →<br />Career OS, delivered.</>}
            lead="Regardless of institution type, Skylent delivers the full connected ecosystem — with the depth and scope appropriate to each partnership."
          />
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginTop: 52 }} className="three-col">
          {[
            {
              name: 'Education',
              items: ['Schooling programs', 'Undergraduate tracks', 'Postgraduate pathways'],
              bg: C.warmWhite,
            },
            {
              name: 'Skills',
              items: ['Webinars & workshops', 'Certificate programs', 'Professional programs', 'Job assistance'],
              bg: C.ink,
              dark: true,
            },
            {
              name: 'Career OS',
              items: ['Interview preparation', 'Job Board access', 'Placement support'],
              bg: C.warmWhite,
            },
          ].map(col => (
            <div key={col.name} style={{ background: col.bg, padding: 'clamp(28px,4vw,44px)', borderRadius: 4 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: col.dark ? C.orange : C.ink, marginBottom: 20 }}>{col.name}</div>
              {col.items.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${col.dark ? 'rgba(255,255,255,0.08)' : T.lineLight}` }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: col.dark ? C.orange : C.ink, opacity: 0.5, flexShrink: 0 }} />
                  <span style={{ color: col.dark ? 'rgba(255,255,255,0.65)' : C.slate, fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* Partnership process */}
      <Section bg={C.ink}>
        <FadeIn>
          <SectionHeader
            tone="dark"
            eyebrow="How it works"
            title={<>The partnership process.</>}
            lead="From the first conversation to a live program — a structured, collaborative approach."
          />
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, marginTop: 52 }} className="process-grid">
          {partnershipSteps.map((step, i) => (
            <FadeIn key={step.n} delay={i * 60}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: T.rCard, padding: 24, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.orange, letterSpacing: '0.1em', marginBottom: 16 }}>{step.n}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.white, marginBottom: 10 }}>{step.label}</div>
                <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13.5, lineHeight: 1.65, margin: 0, flex: 1 }}>{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Trust row — placeholder ready for real data */}
      <Section bg={C.warmWhite}>
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
            <div style={{ maxWidth: 480 }}>
              <Eyebrow>Institution enquiries</Eyebrow>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(24px,3vw,36px)', letterSpacing: '-0.025em', color: C.ink, margin: '20px 0 16px' }}>
                Ready to explore a partnership?
              </h2>
              <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.75, margin: '0 0 28px' }}>
                Get in touch to discuss your institution's needs. We'll map a partnership that fits your learners, your curriculum, and your goals.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                {['No long lock-ins', 'Co-designed programs', 'Full Skylent OS deployment', 'Ongoing support'].map(f => (
                  <Badge key={f}>{f}</Badge>
                ))}
              </div>
              <Button variant="dark" size="lg" onClick={() => navigate('/contact')}>Partner With Skylent →</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minWidth: 280 }}>
              {[
                { label: 'Institution types', value: '6+' },
                { label: 'Partnership scope', value: 'Full OS' },
                { label: 'Support', value: 'Dedicated' },
                { label: 'Programs', value: 'Co-designed' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: C.sand, borderRadius: T.rCard, padding: '20px 22px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{value}</div>
                  <div style={{ color: C.slate, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </Section>

      <CTABand
        eyebrow="Get in touch"
        title={<>Bring Skylent OS<br />to your institution.</>}
        lead="Let's map your needs and co-design a program that moves your learners from education to employability."
        primary={{ label: 'Partner With Skylent', to: '/contact' }}
        secondary={{ label: 'Explore the ecosystem', to: '/os' }}
      />
    </PageShell>
  )
}
