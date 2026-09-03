import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, SectionHeader, PageHero, Button, Badge, FlowStrip, CTABand, T, Eyebrow } from '../components/ui'
import { programs, workshops } from '../data'
import { PHOTO } from '../media'

export default function SkillsPage() {
  const navigate = useNavigate()
  const professional = programs.filter(p => p.programType === 'PROFESSIONAL')
  const certificates = programs.filter(p => p.programType === 'CERTIFICATE')
  const upcoming = workshops.slice(0, 3)

  return (
    <PageShell>
      <PageHero
        eyebrow="Skills"
        photo={PHOTO.workshop}
        photoAlt="Professionals in a live learning session"
        title={<>Capability that can<br />become a <span style={{ color: C.orange }}>career.</span></>}
        lead="Webinars are events. Certificate programs are credentials. Professional Programs are career products. Job Assistance is support — not a course."
        actions={<>
          <Button variant="primary" size="lg" onClick={() => navigate('/programs')}>Professional Programs</Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/workshops')}>Browse Webinars</Button>
        </>}
      />

      {/* Webinars — event UI */}
      <Section bg={C.warmWhite} id="webinars">
        <FadeIn>
          <SectionHeader
            eyebrow="Webinars"
            title="Show up for a session. Leave with a topic mastered."
            lead="Event-oriented: speaker, date, duration, live or recorded. Open to anyone who wants a first step."
            action={<Button variant="ghost" onClick={() => navigate('/workshops')}>All webinars →</Button>}
          />
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 40 }} className="three-col">
          {upcoming.map((w, i) => (
            <FadeIn key={w.slug} delay={i * 60}>
              <button type="button" onClick={() => navigate(`/workshops/${w.slug}`)} style={{ textAlign: 'left', background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, overflow: 'hidden', cursor: 'pointer', padding: 0, width: '100%' }}>
                <div style={{ height: 8, background: C.orange }} />
                <div style={{ padding: '22px 22px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
                    <Badge>{w.mode}</Badge>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.slate }}>{w.duration}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, margin: '0 0 10px', lineHeight: 1.25 }}>{w.title}</h3>
                  <p style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.6, margin: '0 0 18px' }}>{w.desc}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 14, borderTop: `1px solid ${T.lineLight}` }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.slate, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>DATE</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{w.date}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: C.slate, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>SPEAKER</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{w.instructor}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, color: C.orange, fontSize: 13, fontWeight: 600 }}>Register →</div>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Certificate */}
      <Section bg={C.sand} id="certificate">
        <FadeIn>
          <SectionHeader
            eyebrow="Certificate Programs"
            title="A credential you can finish."
            lead="Shorter than a Professional Program. Structured curriculum, assessment, and certification — without Career OS unlock."
          />
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: certificates.length > 1 ? '1fr 1fr' : '1fr', gap: 16, marginTop: 40 }} className="two-col">
          {certificates.map((p, i) => (
            <FadeIn key={p.slug} delay={i * 60}>
              <div onClick={() => navigate(`/programs/${p.slug}`)} style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: '28px 28px', cursor: 'pointer' }}>
                <Badge>Certificate</Badge>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: C.ink, margin: '16px 0 10px' }}>{p.name}</h3>
                <p style={{ color: C.slate, fontSize: 14.5, lineHeight: 1.7, margin: '0 0 20px' }}>{p.desc}</p>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: C.slate, marginBottom: 18 }}>
                  <span>{p.duration}</span>
                  <span>{p.level}</span>
                  <span>{p.format}</span>
                  <span>{p.cert}</span>
                </div>
                <span style={{ color: C.orange, fontWeight: 600, fontSize: 14 }}>View Program →</span>
              </div>
            </FadeIn>
          ))}
          {certificates.length === 0 && (
            <div style={{ color: C.slate, fontSize: 14 }}>Certificate programs will appear here as they are published.</div>
          )}
        </div>
      </Section>

      {/* Professional */}
      <Section bg={C.ink} id="professional">
        <FadeIn>
          <div style={{ marginBottom: 40 }}>
            <Eyebrow tone="dark" accent>Professional Programs</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 600, color: C.white, margin: '18px 0 16px', letterSpacing: '-0.03em' }}>
              The deepest conversion product.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.75, maxWidth: 560, margin: 0 }}>
              Career outcome, curriculum, projects, tools, cohort, certification, and Career OS. This is the program that opens the door.
            </p>
          </div>
        </FadeIn>
        <div style={{ marginBottom: 36 }}>
          <FlowStrip tone="dark" steps={[
            { label: 'Professional Program' },
            { label: 'Career OS Access', highlight: true },
            { label: 'Interview Prep' },
            { label: 'Jobs' },
          ]} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="programs-grid">
          {professional.map((p, i) => (
            <FadeIn key={p.slug} delay={i * 50}>
              <div onClick={() => navigate(`/programs/${p.slug}`)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: T.rCard, padding: '24px 26px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                  <Badge tone="dark" accent>Career OS</Badge>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{p.duration}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.white, margin: '0 0 8px' }}>{p.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>{p.outcome}</p>
                <span style={{ color: C.orange, fontSize: 13, fontWeight: 600 }}>View Program →</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Job assistance */}
      <Section bg={C.warmWhite} id="job-assistance">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' }} className="two-col">
          <FadeIn>
            <div style={{ borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '4/3' }}>
              <img src={PHOTO.career} alt="Career conversation" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </FadeIn>
          <FadeIn delay={80}>
            <Badge>Not a course</Badge>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.6vw,42px)', fontWeight: 600, color: C.ink, margin: '16px 0 16px', letterSpacing: '-0.025em' }}>
              Job Assistance
            </h2>
            <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.75, margin: '0 0 24px' }}>
              Career-support product layered on Professional Programs and Career OS. Resume, profile, interview preparation, mock interviews, job opportunities, and applications — the work after the curriculum.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {['Resume and profile review', 'Interview preparation', 'Mock interviews', 'Job board and applications'].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange }} />
                  <span style={{ color: C.ink, fontSize: 15 }}>{item}</span>
                </div>
              ))}
            </div>
            <Button variant="dark" onClick={() => navigate('/career-os')}>Open Career OS →</Button>
          </FadeIn>
        </div>
      </Section>

      <CTABand
        eyebrow="Next step"
        title={<>Ready to become<br />career-ready?</>}
        lead="Start with a Professional Program to unlock Career OS, or join a webinar to begin."
        primary={{ label: 'Explore Professional Programs', to: '/programs' }}
        secondary={{ label: 'See Career OS', to: '/career-os' }}
      />
    </PageShell>
  )
}
