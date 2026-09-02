import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, SectionHeader, PageHero, Eyebrow, Button, Badge, CTABand, T } from '../components/ui'

// ─── INSTITUTION TYPES ────────────────────────────────────────────────────────
const institutionTypes = [
  {
    id: 'schools',
    label: 'Schools',
    sub: 'K–12 · Secondary · Senior Secondary',
    description: 'Introduce students to structured skill development and career awareness before they reach higher education. Build confidence, curiosity, and foundational knowledge early.',
    offers: [
      'Structured foundational learning programs',
      'Skill exposure and career awareness sessions',
      'Live webinars and workshops for students',
      'Digital literacy and future-readiness tracks',
      'Faculty development resources',
    ],
    color: '#1a2a1a',
    accentLight: 'rgba(74,222,128,0.12)',
    accentBorder: 'rgba(74,222,128,0.2)',
    accentText: '#4ade80',
  },
  {
    id: 'colleges',
    label: 'Colleges',
    sub: 'Degree Colleges · Autonomous Institutions',
    description: 'Equip undergraduate students with professional programs, industry-relevant skills, and a clear pathway from graduation into employment.',
    offers: [
      'Professional Programs integrated with curriculum',
      'Skill development tracks (Certificate + Professional)',
      'Career OS access for qualifying students',
      'Structured placement preparation',
      'Resume, portfolio, and interview support',
    ],
    color: '#1a1a2a',
    accentLight: 'rgba(96,165,250,0.12)',
    accentBorder: 'rgba(96,165,250,0.2)',
    accentText: '#60a5fa',
  },
  {
    id: 'universities',
    label: 'Universities',
    sub: 'Autonomous Universities · Research Institutions',
    description: 'Integrate Skylent OS as institutional infrastructure — from curriculum enrichment to LMS deployment, career readiness, and industry alignment at scale.',
    offers: [
      'Curriculum integration and co-design support',
      'Industry-aligned Professional Programs',
      'LMS / technology infrastructure deployment',
      'Career readiness ecosystem for graduates',
      'Employer partnership facilitation',
      'Postgraduate specialisation tracks',
    ],
    color: '#2a1a1a',
    accentLight: 'rgba(243,107,33,0.1)',
    accentBorder: 'rgba(243,107,33,0.22)',
    accentText: '#F36B21',
  },
  {
    id: 'skill-institutions',
    label: 'Skill & Training Institutions',
    sub: 'Training Centers · Vocational Institutes · EdTech',
    description: 'Power your program delivery with Skylent infrastructure — certifications, technology, and career pathway integration for your learners.',
    offers: [
      'Program delivery infrastructure',
      'Certification and credentialing framework',
      'Career OS for qualifying graduates',
      'Job Board and placement ecosystem',
      'Technology and LMS integration',
    ],
    color: '#1a1f2a',
    accentLight: 'rgba(167,139,250,0.12)',
    accentBorder: 'rgba(167,139,250,0.2)',
    accentText: '#a78bfa',
  },
  {
    id: 'assessment',
    label: 'Assessment & Examination Partners',
    sub: 'Examination Boards · Assessment Bodies',
    description: 'Partner with Skylent to integrate assessment and examination infrastructure into a continuous learning and career pathway for students.',
    offers: [
      'Assessment technology integration',
      'Post-assessment learning pathway linkage',
      'Skill recognition and credentialing',
      'Career pathway connection for test-takers',
    ],
    color: '#1a2a26',
    accentLight: 'rgba(45,212,191,0.1)',
    accentBorder: 'rgba(45,212,191,0.2)',
    accentText: '#2dd4bf',
  },
  {
    id: 'industry',
    label: 'Academic & Industry Partners',
    sub: 'Corporate Training · Industry Bodies · NGOs',
    description: 'Co-design programs with Skylent that create a talent pipeline directly from education into your industry. Build custom pathways and certification tracks.',
    offers: [
      'Custom program co-design and delivery',
      'Branded certification and credentialing',
      'Talent pipeline from learner to employer',
      'Employer-specific job board integration',
      'Skills gap analysis and curriculum advice',
    ],
    color: '#261a2a',
    accentLight: 'rgba(244,114,182,0.1)',
    accentBorder: 'rgba(244,114,182,0.2)',
    accentText: '#f472b6',
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
        title={<>The infrastructure behind<br /><span style={{ color: C.orange }}>modern education.</span></>}
        lead="Skylent partners with schools, colleges, universities, training institutions, and industry bodies as an education and career technology partner — bringing the full Skylent OS ecosystem to your learners."
        actions={<>
          <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>Partner With Skylent →</Button>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px,4vw,56px)', alignItems: 'start' }} className="two-col">
            <div style={{ background: active.color, borderRadius: T.rCard, padding: 'clamp(28px,4vw,44px)', border: `1px solid ${active.accentBorder}` }}>
              <div style={{ color: active.accentText, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 6 }}>{active.sub.toUpperCase()}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 600, color: C.white, margin: '0 0 18px', letterSpacing: '-0.025em' }}>{active.label}</h3>
              <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 15.5, lineHeight: 1.75, margin: 0 }}>{active.description}</p>
              <div style={{ marginTop: 32, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button variant="primary" onClick={() => navigate('/contact')}>Enquire now →</Button>
              </div>
            </div>
            <div>
              <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 20 }}>WHAT SKYLENT PROVIDES</div>
              {active.offers.map((offer, i) => (
                <div key={offer} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: i < active.offers.length - 1 ? `1px solid ${T.lineLight}` : 'none' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: active.accentLight, border: `1px solid ${active.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: active.accentText }} />
                  </div>
                  <div style={{ color: C.ink, fontSize: 14.5, lineHeight: 1.6, fontWeight: 500 }}>{offer}</div>
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
