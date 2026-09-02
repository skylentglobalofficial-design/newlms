import { C, FadeIn, PageShell } from '../components/shared'
import { Section, Eyebrow, Button, T, PageHero } from '../components/ui'
import { PHOTO } from '../media'
import { useNavigate } from 'react-router-dom'

export default function AboutPage() {
  const navigate = useNavigate()
  const pillars = [
    { name: 'Education', body: 'Schooling, undergraduate, postgraduate, and competitive exams as distinct products — not one generic academic page.', to: '/education' },
    { name: 'Skills', body: 'Webinars, certificate programs, Professional Programs, and job assistance — each with its own depth and conversion path.', to: '/skills' },
    { name: 'Career OS', body: 'Interview preparation, job board, and applications as a working product, unlocked by Professional Programs.', to: '/career-os' },
    { name: 'Institutions', body: 'Infrastructure for schools, colleges, universities, training institutes, assessment partners, and industry.', to: '/institutions' },
  ]

  return (
    <PageShell>
      <PageHero
        eyebrow="Company"
        photo={PHOTO.campus}
        photoAlt="University campus"
        title={<>Why Skylent exists.</>}
        lead="Education should not end when the class ends. Skylent connects academic learning, practical capability, and career opportunity in one operating system."
      />

      <Section bg={C.warmWhite}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,72px)' }} className="two-col">
          <FadeIn>
            <Eyebrow>Mission</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.2vw,36px)', fontWeight: 600, color: C.ink, margin: '16px 0 16px', letterSpacing: '-0.025em' }}>
              Close the gap between what people learn and what they can do next.
            </h2>
            <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.8, margin: 0 }}>
              Students need more than lectures. Parents need visibility. Institutions need infrastructure. Employers need people who can contribute. Skylent is built so those needs meet in one system.
            </p>
          </FadeIn>
          <FadeIn delay={80}>
            <Eyebrow>Vision</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.2vw,36px)', fontWeight: 600, color: C.ink, margin: '16px 0 16px', letterSpacing: '-0.025em' }}>
              Become the education and career operating system institutions run on.
            </h2>
            <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.8, margin: 0 }}>
              Long-term, Skylent OS is curriculum, assessment, skills, and placement readiness as shared infrastructure — for schools through universities, training partners, and industry.
            </p>
          </FadeIn>
        </div>
      </Section>

      <Section bg={C.sand}>
        <FadeIn>
          <Eyebrow>What we are building</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.6vw,42px)', fontWeight: 600, color: C.ink, margin: '18px 0 36px', letterSpacing: '-0.025em' }}>
            Skylent OS
          </h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="programs-grid">
          {pillars.map((p, i) => (
            <FadeIn key={p.name} delay={i * 50}>
              <button type="button" onClick={() => navigate(p.to)} style={{ textAlign: 'left', background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: '28px 26px', cursor: 'pointer', width: '100%' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.ink, marginBottom: 10 }}>{p.name}</div>
                <p style={{ color: C.slate, fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>{p.body}</p>
              </button>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section bg={C.ink}>
        <FadeIn>
          <div style={{ maxWidth: 720 }}>
            <Eyebrow tone="dark">Direction</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.4vw,40px)', fontWeight: 600, color: C.white, margin: '18px 0 18px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              Education → Skills → Career. One ecosystem, built to scale.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.8, margin: '0 0 32px' }}>
              We do not publish student counts, placement rates, or partner logos we cannot verify. Credibility is product depth, honest enrollment, and institutions that can actually run on this platform.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => navigate('/programs')}>Explore Programs</Button>
              <Button variant="secondary" onClick={() => navigate('/institutions')}>Partner With Us</Button>
            </div>
          </div>
        </FadeIn>
      </Section>
    </PageShell>
  )
}
