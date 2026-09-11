import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, Eyebrow, Section, SectionHeader, CTABand, T, Heading } from '../components/ui'
import { Aurora, GlassSurface } from '../components/foundation'
import { MediaImage } from '../components/MediaImage'
import { ProductVisual } from '../components/product/ProductVisuals'
import { getDomainAccent } from '../aurora-themes'
import { PHOTO } from '../media'

const accent = getDomainAccent('institution')

const collaborationModel = [
  {
    step: '01',
    title: 'Academic design',
    desc: 'Faculty and program leads define outcomes, credit alignment, and assessment structure with Skylent.',
  },
  {
    step: '02',
    title: 'Delivery infrastructure',
    desc: 'LMS workflows, faculty tools, learner progress, and skills tracks on shared institutional rails.',
  },
  {
    step: '03',
    title: 'Assessment & readiness',
    desc: 'Formative and summative assessment data tied to learner records — not stranded in spreadsheets.',
  },
  {
    step: '04',
    title: 'Career handoff',
    desc: 'Where programs qualify, learners move into Career OS for portfolios, applications, and interview prep.',
  },
]

const examplePrograms = [
  { name: 'B.Sc. Data Science', dur: '3 years', focus: 'Analytics pathway with project portfolio' },
  { name: 'PG Diploma in AI', dur: '1 year', focus: 'Applied ML with faculty-reviewed projects' },
  { name: 'MBA Tech', dur: '2 years', focus: 'Product and technology management cases' },
]

export default function UniversitiesPage() {
  const navigate = useNavigate()

  return (
    <PageShell auroraTheme="institution">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 28}px ${T.gutter} clamp(40px, 5vw, 64px)` }}>
        <Aurora themeId="institution" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px, 5vw, 56px)', alignItems: 'center' }}>
            <FadeIn>
              <Eyebrow tone="dark" accent>Universities</Eyebrow>
              <h1 className="skylent-display-lg" style={{ color: C.white, margin: '18px 0 16px' }}>
                Degree pathways<br />
                <span style={{ color: accent.text }}>with institutional depth.</span>
              </h1>
              <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 0 14px' }}>
                Curriculum design, delivery infrastructure, assessment, and career readiness — structured for multi-department universities.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: 13, lineHeight: 1.65, maxWidth: 520, margin: '0 0 28px' }}>
                Illustrative program examples below. No partner university names or placement statistics are published here.
              </p>
              <Button variant="primary" onClick={() => navigate('/contact')}>Talk to partnerships</Button>
            </FadeIn>
            <FadeIn delay={80}>
              <GlassSurface level={2} padding="0" style={{ overflow: 'hidden', minHeight: 320 }}>
                <ProductVisual id="institution-pipeline" themeId="institution" style={{ minHeight: 320 }} />
              </GlassSurface>
            </FadeIn>
          </div>
        </div>
      </section>

      <Section tone="canvas" divider id="collaboration">
        <FadeIn>
          <SectionHeader
            tone="dark"
            eyebrow="Collaboration model"
            title="From academic design<br />to career handoff."
            lead="A delivery model for universities — not a student course catalog."
          />
        </FadeIn>
        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="institution-partnership-grid">
          {collaborationModel.map((item, i) => (
            <FadeIn key={item.step} delay={i * 50}>
              <GlassSurface level={2} padding="22px 24px" style={{ height: '100%' }}>
                <div className="skylent-label" style={{ color: accent.text, marginBottom: 12 }}>{item.step}</div>
                <Heading tone="dark" size="sm" style={{ margin: '0 0 10px' }}>{item.title}</Heading>
                <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </GlassSurface>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section tone="canvas" divider id="implementation">
        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center' }}>
          <FadeIn>
            <MediaImage src={PHOTO.university} alt="University operations" aspect="4/3" overlay="bottom" />
          </FadeIn>
          <FadeIn delay={80}>
            <Eyebrow tone="dark">Implementation</Eyebrow>
            <Heading tone="dark" size="md" style={{ margin: '16px 0 14px' }}>
              Shared infrastructure<br />across departments.
            </Heading>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, lineHeight: 1.75, margin: '0 0 24px' }}>
              Universities use Skylent for multi-program curriculum, faculty workflows, learner lifecycle visibility, and outcomes reporting — with skills and career products where programs require them.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {['Curriculum mapping across schools and departments', 'Faculty dashboards and assessment workflows', 'Learner progress parents and admins can audit', 'Career OS for qualifying professional pathways'].map((line, i) => (
                <div key={line} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: `1px solid ${T.lineDark}`, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text, paddingTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.55 }}>{line}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </Section>

      <Section tone="canvas" divider id="examples">
        <FadeIn>
          <SectionHeader
            tone="dark"
            eyebrow="Illustrative programs"
            title="Example university pathways."
            lead="Sample listings for product exploration — not verified partnerships or live enrollments."
          />
        </FadeIn>
        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="three-col">
          {examplePrograms.map((p, i) => (
            <FadeIn key={p.name} delay={i * 40}>
              <GlassSurface level={2} padding="22px 24px">
                <span className="skylent-label" style={{ color: 'rgba(255,255,255,0.32)', display: 'block', marginBottom: 12 }}>{p.dur} · example</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.white, margin: '0 0 8px' }}>{p.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{p.focus}</p>
              </GlassSurface>
            </FadeIn>
          ))}
        </div>
      </Section>

      <CTABand
        eyebrow="Institutional partnerships"
        title={<>Discuss a university<br />deployment with Skylent.</>}
        lead="We map academic structure, delivery workflows, and career handoff before any program goes live."
        primary={{ label: 'Contact partnerships', to: '/contact' }}
        secondary={{ label: 'View all institutions', to: '/institutions' }}
      />
    </PageShell>
  )
}
