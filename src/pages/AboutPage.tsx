import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import {
  Section, Eyebrow, Button, T, SectionHeader, CTABand, Heading, FlowStrip,
} from '../components/ui'
import {
  Aurora, GlassSurface, ContextualNavPanel, ContextualNavBar, useSectionSpy, type ContextualNavItem,
} from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'

const accent = getDomainAccent('general')

const ABOUT_NAV_ITEMS: ContextualNavItem[] = [
  { id: 'story', label: 'Story', sub: 'What Skylent is' },
  { id: 'gap', label: 'The gap', sub: 'What we address' },
  { id: 'ecosystem', label: 'Ecosystem', sub: 'What connects' },
  { id: 'journey', label: 'Journey', sub: 'How it works' },
  { id: 'who-we-serve', label: 'Who we serve', sub: 'Learners & partners' },
  { id: 'institutions', label: 'Institutions', sub: 'Beyond individuals' },
  { id: 'platform', label: 'Platform', sub: 'What we build' },
]

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function AboutHeroVisual() {
  const pillars = [
    { label: 'Education', sub: 'School · UG · PG · Exams', theme: getDomainAccent('schooling') },
    { label: 'Skills', sub: 'Webinars · Certificates · Pro', theme: getDomainAccent('professional') },
    { label: 'Career OS', sub: 'Profile · Jobs · Applications', theme: getDomainAccent('career') },
    { label: 'Institutions', sub: 'Schools · Colleges · Training', theme: getDomainAccent('institution') },
  ]

  return (
    <div style={{ position: 'relative', minHeight: 420 }}>
      <GlassSurface level={2} padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.lineDark}` }}>
          <div className="skylent-label" style={{ color: accent.text }}>Skylent OS</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.white, marginTop: 8 }}>
            One operating system
          </div>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12.5, lineHeight: 1.6, margin: '8px 0 0' }}>
            Academic learning, practical capability, and career opportunity — connected.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {pillars.map((pillar, i) => (
            <div
              key={pillar.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr',
                gap: 14,
                padding: '14px 20px',
                borderBottom: i < pillars.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                borderLeft: `2px solid ${pillar.theme.primary}`,
                background: pillar.theme.subtle,
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: pillar.theme.text, paddingTop: 2 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.white, marginBottom: 3 }}>{pillar.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11.5 }}>{pillar.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassSurface>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-5% -4%',
          border: `1px dashed ${accent.border}`,
          borderRadius: T.rCard,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </div>
  )
}

// ─── 1. HERO ──────────────────────────────────────────────────────────────────

function HeroSection() {
  const navigate = useNavigate()
  const activeSection = useSectionSpy(ABOUT_NAV_ITEMS.map(i => i.id))

  return (
    <>
      <section id="story" style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 24}px ${T.gutter} ${T.sectionTight}` }}>
        <Aurora themeId="general" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px, 5vw, 64px)', alignItems: 'start' }} className="two-col skylent-page-hero">
            <FadeIn>
              <Eyebrow tone="dark" accent>About Skylent</Eyebrow>
              <h1 className="skylent-display-lg" style={{ color: C.white, margin: '20px 0 16px', maxWidth: 640 }}>
                Why Skylent exists.
              </h1>
              <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 520, margin: '0 0 20px' }}>
                Education should not end when the class ends. Skylent connects academic learning, practical capability, and career opportunity in one operating system.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 16, lineHeight: 1.75, maxWidth: 520, margin: '0 0 28px' }}>
                We are building the infrastructure where students, parents, institutions, and employers can meet — with product depth, not marketing claims.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button variant="primary" size="lg" onClick={() => navigate('/programs')}>Explore Programs</Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/contact')}>Contact</Button>
              </div>
            </FadeIn>
            <FadeIn delay={80}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ContextualNavPanel
                  items={ABOUT_NAV_ITEMS}
                  themeId="general"
                  title="About"
                  activeId={activeSection}
                />
                <AboutHeroVisual />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      <ContextualNavBar items={ABOUT_NAV_ITEMS} themeId="general" activeId={activeSection} />
    </>
  )
}

// ─── 2. THE GAP ───────────────────────────────────────────────────────────────

function GapSection() {
  const stages = [
    { label: 'Learning', sub: 'Academic programs and structured coursework', accent: getDomainAccent('schooling') },
    { label: 'Practice', sub: 'Activities, assessments, and applied work', accent: getDomainAccent('undergraduate') },
    { label: 'Proof', sub: 'Projects, credentials, and portfolio artifacts', accent: getDomainAccent('professional') },
    { label: 'Career', sub: 'Profile, interview prep, jobs, applications', accent: getDomainAccent('career') },
    { label: 'Institutions', sub: 'Infrastructure to deliver and measure outcomes', accent: getDomainAccent('institution') },
  ]

  return (
    <Section id="gap" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 72px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <Eyebrow tone="dark">The gap</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            Close the distance between what people learn and what they can do next.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.8, margin: '0 0 20px' }}>
            Students need more than lectures. Parents need visibility. Institutions need infrastructure. Employers need people who can contribute. Skylent is built so those needs meet in one system.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 15, lineHeight: 1.75, margin: 0 }}>
            The gap is not a single missing feature — it is the disconnect between learning, practice, proof, career readiness, and the institutions that deliver education at scale.
          </p>
        </FadeIn>
        <FadeIn delay={80}>
          <GlassSurface level={1} padding="0" style={{ overflow: 'hidden' }}>
            {stages.map((stage, i) => (
              <div
                key={stage.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 22px',
                  borderBottom: i < stages.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.accent.primary, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 3 }}>{stage.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12.5, lineHeight: 1.5 }}>{stage.sub}</div>
                </div>
                {i < stages.length - 1 && (
                  <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 14, flexShrink: 0 }}>↓</span>
                )}
              </div>
            ))}
          </GlassSurface>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── 3. WHAT SKYLENT CONNECTS ───────────────────────────────────────────────

function EcosystemSection() {
  const navigate = useNavigate()

  const connected = [
    {
      label: 'Education',
      body: 'Schooling, undergraduate, postgraduate, and competitive exams as distinct products — not one generic academic page.',
      to: '/education',
      accent: getDomainAccent('schooling'),
    },
    {
      label: 'Skills',
      body: 'Webinars, certificate programs, Professional Programs, and job assistance — each with its own depth and conversion path.',
      to: '/skills',
      accent: getDomainAccent('professional'),
    },
    {
      label: 'Career OS',
      body: 'Interview preparation, job board, and applications as a working product, unlocked by Professional Programs.',
      to: '/career-os',
      accent: getDomainAccent('career'),
    },
    {
      label: 'Institutions',
      body: 'Infrastructure for schools, colleges, universities, training institutes, assessment partners, and industry.',
      to: '/institutions',
      accent: getDomainAccent('institution'),
    },
  ]

  return (
    <Section id="ecosystem" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="What Skylent connects"
          title="Four products. One operating system."
          lead="Education builds foundation. Skills turn it into capability. Career OS turns capability into opportunity. Institutions deliver it at scale."
        />
      </FadeIn>

      <div style={{ marginTop: 48, position: 'relative' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            left: '12%',
            right: '12%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accent.border}, transparent)`,
            transform: 'translateY(-50%)',
            display: 'none',
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
          {connected.map((item, i) => (
            <FadeIn key={item.label} delay={i * 60}>
              <button
                type="button"
                onClick={() => navigate(item.to)}
                style={{
                  flex: '1 1 min(240px, 100%)',
                  minWidth: 'min(240px, 100%)',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  borderTop: `1px solid ${T.lineDark}`,
                  padding: '28px clamp(14px, 2vw, 24px)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  borderLeft: `2px solid ${item.accent.primary}`,
                }}
              >
                <div className="skylent-label" style={{ color: item.accent.text, marginBottom: 10 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.white, marginBottom: 10 }}>{item.label}</div>
                <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 14, lineHeight: 1.65, margin: '0 0 14px' }}>{item.body}</p>
                <span style={{ color: item.accent.text, fontSize: 13, fontWeight: 600 }}>Explore →</span>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── 4. HOW THE ECOSYSTEM WORKS ─────────────────────────────────────────────

function JourneySection() {
  const learnerSteps = [
    { label: 'Learn', sub: 'Programs and coursework' },
    { label: 'Practice', sub: 'Activities and assessments' },
    { label: 'Build', sub: 'Projects and applied work' },
    { label: 'Prove', sub: 'Portfolio and credentials' },
    { label: 'Prepare', sub: 'Interview preparation' },
    { label: 'Apply', sub: 'Job board and screening' },
    { label: 'Track', sub: 'Application status' },
  ]

  const productMap = [
    { label: 'Programs', sub: 'Education and skills catalog', accent: getDomainAccent('schooling') },
    { label: 'Learning', sub: 'Curriculum, lessons, cohort', accent: getDomainAccent('undergraduate') },
    { label: 'Projects / Assessments', sub: 'Work that becomes proof', accent: getDomainAccent('professional') },
    { label: 'Career Proof', sub: 'Profile, resume, portfolio', accent: getDomainAccent('career') },
    { label: 'Career OS', sub: 'Interview prep, jobs, tracker', accent: getDomainAccent('career') },
    { label: 'Opportunities', sub: 'Roles to discover and apply', accent: accent },
  ]

  return (
    <Section id="journey" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="How it works"
          title="From programs to opportunities."
          lead="Each step maps to product surfaces already in Skylent — not a marketing funnel, but an implemented journey."
        />
      </FadeIn>

      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <div className="skylent-label" style={{ color: accent.text, marginBottom: 16 }}>Learner journey</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0' }}>
            {learnerSteps.map((step, i) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: '1 1 120px', minWidth: 0 }}>
                <div style={{ padding: '10px 0' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white }}>{step.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{step.sub}</div>
                </div>
                {i < learnerSteps.length - 1 && (
                  <span style={{ color: 'rgba(255,255,255,0.2)', padding: '0 6px', fontSize: 13 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={80}>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 16 }}>Product surfaces</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {productMap.map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '8px 1fr',
                  gap: 16,
                  padding: '14px 0',
                  borderBottom: i < productMap.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  alignItems: 'start',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.accent.primary, marginTop: 6 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.white, marginBottom: 3 }}>{item.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12.5 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={120}>
        <div style={{ marginTop: 40 }}>
          <FlowStrip
            tone="dark"
            steps={[
              { label: 'Programs', sub: 'Catalog' },
              { label: 'Learning', sub: 'Curriculum' },
              { label: 'Projects', sub: 'Proof', highlight: true },
              { label: 'Career OS', sub: 'Workspace' },
              { label: 'Opportunities', sub: 'Jobs' },
            ]}
          />
        </div>
      </FadeIn>
    </Section>
  )
}

// ─── 5. WHO IT SERVES ───────────────────────────────────────────────────────

function WhoWeServeSection() {
  const navigate = useNavigate()

  const groups = [
    { label: 'School learners & parents', desc: 'Schooling workflows with parent-visible progress.', to: '/education#schooling', accent: getDomainAccent('schooling') },
    { label: 'Undergraduate learners', desc: 'Degree-aligned programs, projects, and career direction.', to: '/education#undergraduate', accent: getDomainAccent('undergraduate') },
    { label: 'Postgraduate learners', desc: 'Specialisation tracks with professional outcomes.', to: '/education#postgraduate', accent: getDomainAccent('postgraduate') },
    { label: 'Exam aspirants', desc: 'JEE, NEET, CAT — practice, mocks, and analytics.', to: '/education#competitive-exams', accent: getDomainAccent('jee') },
    { label: 'Skill learners', desc: 'Webinars, certificates, and Professional Programs.', to: '/skills', accent: getDomainAccent('professional') },
    { label: 'Career seekers', desc: 'Career OS — profile, interview prep, jobs, applications.', to: '/career-os', accent: getDomainAccent('career') },
    { label: 'Institutions', desc: 'Schools, colleges, universities, and training partners.', to: '/institutions', accent: getDomainAccent('institution') },
    { label: 'Employers & recruiters', desc: 'Job board and recruiter workflows for open roles.', to: '/career-os#jobs', accent: getDomainAccent('career') },
  ]

  return (
    <Section id="who-we-serve" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Who we serve"
          title="Built for learners and the institutions that support them."
          lead="Each audience has a distinct workflow in Skylent — not one generic user type forced into the same product."
        />
      </FadeIn>

      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {groups.map((group, i) => (
          <FadeIn key={group.label} delay={i * 40}>
            <button
              type="button"
              onClick={() => navigate(group.to)}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: 20,
                alignItems: 'center',
                padding: '20px 16px',
                border: 'none',
                borderBottom: `1px solid ${T.lineDark}`,
                borderLeft: `2px solid ${group.accent.primary}`,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
                background: 'transparent',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.white, marginBottom: 4 }}>{group.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13.5, lineHeight: 1.55 }}>{group.desc}</div>
              </div>
              <span style={{ color: group.accent.text, fontSize: 16, flexShrink: 0 }}>→</span>
            </button>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}

// ─── 6. INSTITUTION + EMPLOYER ──────────────────────────────────────────────

function InstitutionsEmployersSection() {
  const navigate = useNavigate()
  const instAccent = getDomainAccent('institution')
  const careerAccent = getDomainAccent('career')

  const institutionItems = ['Programs', 'Offerings', 'Batches', 'Learners', 'Faculty', 'Curriculum', 'Assessments', 'Progress']
  const careerItems = ['Career Profile', 'Resume readiness', 'Interview Preparation', 'Job Board', 'Applications', 'Career Support']

  return (
    <Section id="institutions" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <Eyebrow tone="dark">Institution side</Eyebrow>
          <Heading tone="dark" size="sm" style={{ margin: '18px 0 14px' }}>
            Infrastructure institutions run on.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 15, lineHeight: 1.75, margin: '0 0 24px' }}>
            Long-term, Skylent OS is curriculum, assessment, skills, and placement readiness as shared infrastructure — for schools through universities, training partners, and industry.
          </p>
          <GlassSurface level={1} padding="18px 22px" style={{ marginBottom: 24 }}>
            <div className="skylent-label" style={{ color: instAccent.text, marginBottom: 14 }}>Institution OS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
              {institutionItems.map(item => (
                <span key={item} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{item}</span>
              ))}
            </div>
          </GlassSurface>
          <Button variant="secondary" onClick={() => navigate('/institutions')}>For Institutions</Button>
        </FadeIn>
        <FadeIn delay={80}>
          <Eyebrow tone="dark">Career side</Eyebrow>
          <Heading tone="dark" size="sm" style={{ margin: '18px 0 14px' }}>
            Career readiness as a product.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 15, lineHeight: 1.75, margin: '0 0 24px' }}>
            Career OS gives learners a working profile, interview preparation, and a job board — with application tracking that stays empty until they apply. Employers interact through open roles, not unverified partnership claims.
          </p>
          <GlassSurface level={1} padding="18px 22px" style={{ marginBottom: 24 }}>
            <div className="skylent-label" style={{ color: careerAccent.text, marginBottom: 14 }}>Career OS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
              {careerItems.map(item => (
                <span key={item} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{item}</span>
              ))}
            </div>
          </GlassSurface>
          <Button variant="secondary" onClick={() => navigate('/career-os')}>Explore Career OS</Button>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── 7. BUILDING THE PLATFORM ───────────────────────────────────────────────

function PlatformSection() {
  const navigate = useNavigate()

  const surfaces = [
    { label: 'Education', desc: 'Schooling, undergraduate, postgraduate, and exam preparation products.', to: '/education', accent: getDomainAccent('schooling') },
    { label: 'Skills', desc: 'Webinars, certificates, Professional Programs, and job assistance.', to: '/skills', accent: getDomainAccent('professional') },
    { label: 'Career', desc: 'Career OS workspace for profile, prep, jobs, and applications.', to: '/career-os', accent: getDomainAccent('career') },
    { label: 'Institutions', desc: 'Partnership workflows for schools, colleges, and training institutes.', to: '/institutions', accent: getDomainAccent('institution') },
    { label: 'Programs', desc: 'The catalog connecting learners to every product surface.', to: '/programs', accent: accent },
  ]

  return (
    <Section id="platform" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Building the platform"
          title="Become the education and career operating system institutions run on."
          lead="Skylent OS is not a single app — it is the connected layer where curriculum, skills, career readiness, and institutional delivery meet."
        />
      </FadeIn>

      <div style={{ marginTop: 40 }}>
        {surfaces.map((surface, i) => (
          <FadeIn key={surface.label} delay={i * 50}>
            <button
              type="button"
              onClick={() => navigate(surface.to)}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px minmax(0, 1fr) auto',
                gap: 18,
                alignItems: 'center',
                width: '100%',
                padding: '22px 0',
                borderTop: i === 0 ? `1px solid ${T.lineDark}` : 'none',
                borderBottom: `1px solid ${T.lineDark}`,
                background: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: surface.accent.text }}>{String(i + 1).padStart(2, '0')}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, marginBottom: 4 }}>{surface.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.55 }}>{surface.desc}</div>
              </div>
              <span style={{ color: surface.accent.text, fontSize: 16 }}>→</span>
            </button>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={280}>
        <GlassSurface level={1} padding="28px 32px" style={{ marginTop: 40 }}>
          <Eyebrow tone="dark">Honest company</Eyebrow>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.8, margin: '16px 0 0', maxWidth: 720 }}>
            We do not publish student counts, placement rates, or partner logos we cannot verify. Credibility is product depth, honest enrollment, and institutions that can actually run on this platform.
          </p>
        </GlassSurface>
      </FadeIn>
    </Section>
  )
}

// ─── PAGE ───────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <PageShell auroraTheme="general">
      <HeroSection />
      <GapSection />
      <EcosystemSection />
      <JourneySection />
      <WhoWeServeSection />
      <InstitutionsEmployersSection />
      <PlatformSection />

      <CTABand
        eyebrow="Get in touch"
        title={<>Education → Skills → Career.<br />One ecosystem, built to scale.</>}
        lead="Explore programs, partner as an institution, or contact us to learn what Skylent can support today."
        primary={{ label: 'Explore Programs', to: '/programs' }}
        secondary={{ label: 'For Institutions', to: '/institutions' }}
        auroraTheme="general"
      />

      <Section tone="canvas" style={{ paddingTop: 0, paddingBottom: T.sectionTight }}>
        <FadeIn>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => navigate('/education')}>Explore Education</Button>
            <Button variant="ghost" onClick={() => navigate('/contact')}>Contact</Button>
          </div>
        </FadeIn>
      </Section>
    </PageShell>
  )
}
