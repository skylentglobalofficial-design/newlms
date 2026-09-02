import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, SectionHeader, PageHero, Button, Badge, Card, Glow, FlowStrip, CTABand, T } from '../components/ui'

export default function SkillsPage() {
  const navigate = useNavigate()

  const minor = [
    { name: 'Webinars', tag: 'Learn', desc: 'Live, expert-led sessions on emerging skills and industry trends — a low-commitment first step.', to: '/workshops' },
    { name: 'Certificate Programs', tag: 'Build skills', desc: 'Focused, credentialed tracks that build a specific, demonstrable capability.', to: '/programs' },
    { name: 'Job Assistance', tag: 'Career ready', desc: 'Placement readiness — resume, portfolio and interview support to convert skills into offers.', to: '/skills#job-assistance' },
  ]

  return (
    <PageShell>
      <PageHero
        eyebrow="Pillar 02 — Skills"
        title={<>The bridge from learning<br />to <span style={{ color: C.orange }}>employability.</span></>}
        lead="Skills is where education becomes career-ready capability. Move from your first live session to a professional program that unlocks Career OS."
        actions={<>
          <Button variant="primary" size="lg" onClick={() => navigate('/programs')}>Explore Professional Programs →</Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/workshops')}>Browse Webinars</Button>
        </>}
      >
        <FadeIn delay={320}>
          <div style={{ marginTop: 56, maxWidth: 720 }}>
            <FlowStrip tone="dark" steps={[
              { label: 'Learn', sub: 'Webinars' },
              { label: 'Build Skills', sub: 'Certificate & Professional' },
              { label: 'Career Ready', sub: 'Job Assistance + Career OS', highlight: true },
            ]} />
          </div>
        </FadeIn>
      </PageHero>

      {/* Featured — Professional Programs */}
      <Section bg={C.warmWhite} id="professional">
        <FadeIn>
          <SectionHeader
            eyebrow="The centre of gravity"
            title="Professional Programs"
            lead="Deep, project-driven programs built around real skills, a portfolio and career outcomes. Completing one unlocks the full Career OS."
          />
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ position: 'relative', overflow: 'hidden', background: C.ink, borderRadius: T.rCard, padding: 'clamp(30px,5vw,56px)', marginTop: 48 }}>
            <Glow x="88%" y="10%" size={460} />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(30px,5vw,64px)', alignItems: 'center' }} className="two-col">
              <div>
                <Badge tone="dark" accent>Unlocks Career OS</Badge>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,40px)', fontWeight: 600, color: C.white, margin: '22px 0 16px', letterSpacing: '-0.025em' }}>
                  The program that opens the door to your career.
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.75, margin: '0 0 28px' }}>
                  Professional Programs combine structured curriculum, live mentorship and real projects. On completion, Career OS activates automatically — interview preparation and the job board, ready to use.
                </p>
                <Button variant="primary" onClick={() => navigate('/programs')}>View Programs →</Button>
              </div>
              <div>
                <FlowStrip tone="dark" steps={[
                  { label: 'Professional Program', sub: 'Enrol & complete' },
                  { label: 'Access Granted', sub: 'Automatic', highlight: true },
                  { label: 'Career OS', sub: 'Interview + Jobs' },
                ]} />
              </div>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* Other offerings */}
      <Section bg={C.sand} id="job-assistance">
        <FadeIn>
          <SectionHeader
            eyebrow="Every step of the way"
            title={<>From first session<br />to first offer.</>}
          />
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 52 }} className="three-col">
          {minor.map((m, i) => (
            <FadeIn key={m.name} delay={i * 80}>
              <Card onClick={() => navigate(m.to)} style={{ minHeight: 220, display: 'flex', flexDirection: 'column' }}>
                <Badge>{m.tag}</Badge>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 600, color: C.ink, margin: '18px 0 12px', letterSpacing: '-0.02em' }}>{m.name}</h3>
                <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, margin: 0, flex: 1 }}>{m.desc}</p>
                <span style={{ color: C.orange, fontSize: 13, marginTop: 18, fontFamily: 'var(--font-mono)' }}>Explore →</span>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Section>

      <CTABand
        eyebrow="Next step"
        title={<>Ready to become<br />career-ready?</>}
        lead="Start with a Professional Program to unlock Career OS, or explore a webinar to begin."
        primary={{ label: 'Explore Professional Programs', to: '/programs' }}
        secondary={{ label: 'See Career OS', to: '/career-os' }}
      />
    </PageShell>
  )
}
