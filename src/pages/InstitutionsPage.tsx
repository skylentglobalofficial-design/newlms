import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, SectionHeader, Button, Eyebrow, CTABand, T, Heading } from '../components/ui'
import { GlassSurface, ContextualNavBar, useSectionSpy, type ContextualNavItem } from '../components/foundation'
import InstitutionTypesSection from '../components/institutions/InstitutionTypesSection'
import { getDomainAccent } from '../aurora-themes'

const accent = getDomainAccent('institution')

const INSTITUTION_NAV_ITEMS: ContextualNavItem[] = [
  { id: 'institution-types', label: 'Institution Types', sub: 'Schools · Colleges · Universities' },
  { id: 'ecosystem', label: 'Product coverage', sub: 'Education → Skills → Career' },
  { id: 'partnership', label: 'Partnership', sub: 'How it works' },
  { id: 'enquiries', label: 'Enquiries', sub: 'Get in touch' },
]

const partnershipSteps = [
  { n: '01', label: 'Discovery', desc: 'We map your institution\'s needs, learner profile, and current gaps.' },
  { n: '02', label: 'Co-design', desc: 'Faculty, curriculum leads, and Skylent design the program together.' },
  { n: '03', label: 'Deployment', desc: 'Skylent OS is configured and deployed for your institution.' },
  { n: '04', label: 'Delivery', desc: 'Live program delivery with ongoing support and analytics.' },
  { n: '05', label: 'Outcomes', desc: 'Graduate career readiness and continuous improvement through partnership.' },
]

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
      items: ['Interview preparation', 'Job Board access', 'Career support workflow'],
    },
  ]

  return (
    <Section id="ecosystem" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Product coverage"
          title="Education, Skills, and Career OS for partners."
          lead="Schools, colleges, and universities choose which products to run. Each ships with the workflows that match their learners."
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
                    <span style={{ color: 'var(--skylent-text-secondary)', fontSize: 14 }}>{item}</span>
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
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--skylent-text)', margin: '0 0 8px' }}>{step.label}</h3>
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
                <span key={f} style={{ color: 'var(--skylent-text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
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
              { k: 'Institution types', v: 'Schools, colleges, universities' },
              { k: 'Delivery', v: 'Skylent OS deployment' },
              { k: 'Programs', v: 'Co-designed with your faculty' },
              { k: 'Support', v: 'Dedicated partnership team' },
            ].map(({ k, v }, i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.lineDark}` : 'none' }}>
                <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>{k}</span>
                <span style={{ color: 'var(--skylent-text)', fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </GlassSurface>
        </div>
      </FadeIn>
    </Section>
  )
}

export default function InstitutionsPage() {
  const activeSection = useSectionSpy(INSTITUTION_NAV_ITEMS.map(i => i.id))

  return (
    <PageShell auroraTheme="institution">
      <InstitutionTypesSection />

      <ContextualNavBar items={INSTITUTION_NAV_ITEMS} themeId="institution" activeId={activeSection} />
      <EcosystemSection />
      <PartnershipSection />
      <EnquiriesSection />

      <CTABand
        eyebrow="Get in touch"
        title={<>Bring Skylent OS<br />to your institution.</>}
        lead="Let's map your needs and co-design a program that moves your learners from education to employability."
        primary={{ label: 'Partner With Skylent', to: '/contact' }}
        secondary={{ label: 'Sign in to workspace', to: '/login' }}
        auroraTheme="institution"
      />
    </PageShell>
  )
}
