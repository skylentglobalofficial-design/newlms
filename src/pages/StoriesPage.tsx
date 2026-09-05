import { useNavigate, Link } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import {
  Section, Eyebrow, Button, T, SectionHeader, CTABand, Heading,
} from '../components/ui'
import {
  Aurora, GlassSurface, ContextualNavPanel, ContextualNavBar, useSectionSpy, type ContextualNavItem,
} from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { programs } from '../data'

const accent = getDomainAccent('general')
const careerAccent = getDomainAccent('career')
const skillsAccent = getDomainAccent('professional')
const instAccent = getDomainAccent('institution')

const STORIES_NAV_ITEMS: ContextualNavItem[] = [
  { id: 'publishing', label: 'Publishing', sub: 'Story status' },
  { id: 'learning', label: 'Learning', sub: 'Project work' },
  { id: 'career', label: 'Career', sub: 'Product workflow' },
  { id: 'institutions', label: 'Institutions', sub: 'Product workflow' },
]

const FEATURED_PROGRAM = programs.find(p => p.slug === 'data-science-ai')
const PROJECT_ARTIFACTS = FEATURED_PROGRAM?.projectsDetail ?? []

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function StoriesHeroVisual() {
  const queue = [
    { label: 'Learner journeys', status: 'Awaiting verification', theme: accent },
    { label: 'Program experiences', status: 'In editorial review', theme: skillsAccent },
    { label: 'Institution stories', status: 'Not yet published', theme: instAccent },
  ]

  return (
    <div style={{ position: 'relative', minHeight: 380 }}>
      <GlassSurface level={2} padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.lineDark}` }}>
          <div className="skylent-label" style={{ color: accent.text }}>Editorial queue</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.white, marginTop: 8 }}>
            Stories in preparation
          </div>
        </div>
        <div>
          {queue.map((item, i) => (
            <div
              key={item.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 16,
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: i < queue.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                borderLeft: `2px solid ${item.theme.primary}`,
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>{item.status}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.lineDark}`, background: 'rgba(243,107,33,0.06)' }}>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11.5, lineHeight: 1.55 }}>
            No verified learner stories are published yet. Sample narratives are not shown here.
          </div>
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

// ─── HERO ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const activeSection = useSectionSpy(STORIES_NAV_ITEMS.map(i => i.id))

  return (
    <>
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 24}px ${T.gutter} ${T.sectionTight}` }}>
        <Aurora themeId="general" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px, 5vw, 64px)', alignItems: 'start' }} className="two-col skylent-page-hero">
            <FadeIn>
              <Eyebrow tone="dark" accent>Stories</Eyebrow>
              <h1 className="skylent-display-lg" style={{ color: C.white, margin: '20px 0 16px', maxWidth: 640 }}>
                Journeys, told<br />editorially.
              </h1>
              <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 520, margin: '0 0 16px' }}>
                What does learning and career progression through Skylent look like? This page will publish verified learner, program, and institution stories — not marketing testimonials.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
                Until verified experiences are available, we show the product workflows stories will eventually document — clearly labelled, never as fabricated outcomes.
              </p>
            </FadeIn>
            <FadeIn delay={80}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ContextualNavPanel items={STORIES_NAV_ITEMS} themeId="general" title="Stories" activeId={activeSection} />
                <StoriesHeroVisual />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      <ContextualNavBar items={STORIES_NAV_ITEMS} themeId="general" activeId={activeSection} />
    </>
  )
}

// ─── PUBLISHING STATE ─────────────────────────────────────────────────────────

function PublishingSection() {
  const categories = [
    { label: 'Learner journeys', desc: 'How someone moved through education, skills, and career — with their consent and verification.', accent: accent },
    { label: 'Program experiences', desc: 'What a Professional Program or exam prep track actually involved — curriculum, projects, cohort.', accent: skillsAccent },
    { label: 'Learning & projects', desc: 'Work produced during programs — artifacts, not invented before/after claims.', accent: getDomainAccent('schooling') },
    { label: 'Career preparation', desc: 'How Career OS was used — only when the learner agrees to share.', accent: careerAccent },
    { label: 'Institution stories', desc: 'How a partner institution runs programs on Skylent — verified, not promotional.', accent: instAccent },
  ]

  return (
    <Section id="publishing" tone="canvas" divider>
      <FadeIn>
        <GlassSurface level={2} padding="clamp(28px, 4vw, 40px)" style={{ borderLeft: `2px solid ${accent.primary}` }}>
          <div className="skylent-label" style={{ color: accent.text, marginBottom: 12 }}>Publishing status</div>
          <Heading tone="dark" size="md" style={{ marginBottom: 16 }}>
            Stories are being prepared.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.75, margin: '0 0 28px', maxWidth: 640 }}>
            Verified learner, program, and institution stories will appear here as they are reviewed and approved. We do not publish names, outcomes, salaries, or placement claims we cannot verify.
          </p>
          <div style={{ display: 'inline-flex', background: 'rgba(243,107,33,0.08)', border: '1px solid rgba(243,107,33,0.22)', borderRadius: 8, padding: '10px 14px' }}>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5, lineHeight: 1.5 }}>
              Sample narratives in the codebase are not displayed on this page. Editorial writing lives on the <Link to="/blog" style={{ color: C.orange, textDecoration: 'none' }}>blog</Link>.
            </span>
          </div>
        </GlassSurface>
      </FadeIn>

      <FadeIn delay={80}>
        <div style={{ marginTop: 48 }}>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 20 }}>What will publish here</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {categories.map((cat, i) => (
              <div
                key={cat.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr',
                  gap: 16,
                  padding: '18px 0',
                  borderBottom: i < categories.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  alignItems: 'start',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: cat.accent.text, paddingTop: 2 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 4 }}>{cat.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13.5, lineHeight: 1.6 }}>{cat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </Section>
  )
}

// ─── LEARNING / PROJECT WORKFLOW ──────────────────────────────────────────────

function LearningSection() {
  const navigate = useNavigate()

  return (
    <Section id="learning" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Product workflow"
          title="How learning work becomes proof."
          lead="Not a learner story — the curriculum structure stories will eventually document. Project artifacts from the Data Science & AI program catalog."
        />
      </FadeIn>

      {PROJECT_ARTIFACTS.length > 0 ? (
        <div style={{ marginTop: 40 }}>
          <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: skillsAccent.subtleStrong, border: `1px solid ${skillsAccent.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 10, fontFamily: 'var(--font-mono)', color: skillsAccent.text, letterSpacing: '0.06em' }}>
              PROGRAM CURRICULUM
            </span>
            {FEATURED_PROGRAM && (
              <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13 }}>{FEATURED_PROGRAM.name}</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PROJECT_ARTIFACTS.map((project, i) => (
              <FadeIn key={project.title} delay={i * 50}>
                <GlassSurface level={1} padding="22px 24px" style={{ marginBottom: 12, borderLeft: `2px solid ${skillsAccent.primary}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 20, alignItems: 'start' }} className="two-col-sm">
                    <div>
                      <div className="skylent-label" style={{ color: skillsAccent.text, marginBottom: 8 }}>Project {i + 1}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.white, marginBottom: 8 }}>{project.title}</div>
                      <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 14, lineHeight: 1.65, margin: '0 0 12px' }}>{project.what}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {project.skills.map(skill => (
                          <span key={skill} style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>DIFFICULTY</div>
                      <div style={{ color: C.white, fontSize: 13 }}>{project.difficulty}</div>
                    </div>
                  </div>
                </GlassSurface>
              </FadeIn>
            ))}
          </div>
          {FEATURED_PROGRAM && (
            <div style={{ marginTop: 24 }}>
              <Button variant="secondary" onClick={() => navigate(`/programs/${FEATURED_PROGRAM.slug}`)}>View program curriculum →</Button>
            </div>
          )}
        </div>
      ) : (
        <FadeIn>
          <GlassSurface level={1} padding="32px" style={{ marginTop: 32, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, margin: 0 }}>Program project details will appear here when available in the catalog.</p>
          </GlassSurface>
        </FadeIn>
      )}
    </Section>
  )
}

// ─── CAREER WORKFLOW ──────────────────────────────────────────────────────────

function CareerWorkflowSection() {
  const navigate = useNavigate()

  const steps = [
    { label: 'Profile', sub: 'Identity, skills, resume slots' },
    { label: 'Proof', sub: 'Portfolio links from program work' },
    { label: 'Discover', sub: 'Job board roles' },
    { label: 'Apply', sub: 'Screening workflow' },
    { label: 'Prepare', sub: 'Interview rounds and mocks' },
    { label: 'Track', sub: 'Application status' },
  ]

  return (
    <Section id="career" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <SectionHeader
            tone="dark"
            eyebrow="Product workflow"
            title="Career OS — what stories will cover."
            lead="Not a placement story. The career workspace learners enter after a Professional Program — where verified career journeys may be documented later."
          />
          <div style={{ marginTop: 8 }}>
            <span style={{ background: careerAccent.subtleStrong, border: `1px solid ${careerAccent.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 10, fontFamily: 'var(--font-mono)', color: careerAccent.text }}>
              CAREER OS PRODUCT
            </span>
          </div>
        </FadeIn>
        <FadeIn delay={80}>
          <GlassSurface level={2} padding="20px 22px">
            <div className="skylent-label" style={{ color: careerAccent.text, marginBottom: 16 }}>Career workspace</div>
            {steps.map((step, i) => (
              <div
                key={step.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr',
                  gap: 14,
                  padding: '12px 0',
                  borderBottom: i < steps.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  alignItems: 'start',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: careerAccent.text, paddingTop: 2 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.white, marginBottom: 2 }}>{step.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </GlassSurface>
          <div style={{ marginTop: 20 }}>
            <Button variant="secondary" onClick={() => navigate('/career-os')}>Explore Career OS</Button>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── INSTITUTION WORKFLOW ─────────────────────────────────────────────────────

function InstitutionWorkflowSection() {
  const navigate = useNavigate()

  const workflow = [
    'Programs', 'Offerings', 'Batches', 'Learners', 'Faculty', 'Curriculum', 'Assessments', 'Progress',
  ]

  return (
    <Section id="institutions" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'center' }} className="two-col">
        <FadeIn>
          <GlassSurface level={2} padding="22px 24px">
            <div className="skylent-label" style={{ color: instAccent.text, marginBottom: 16 }}>Institution OS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 14px' }}>
              {workflow.map((item, i) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: instAccent.textMuted }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ color: 'rgba(255,255,255,0.58)', fontSize: 13.5 }}>{item}</span>
                  {i < workflow.length - 1 && <span style={{ color: 'rgba(255,255,255,0.15)', marginLeft: 4 }}>→</span>}
                </div>
              ))}
            </div>
          </GlassSurface>
        </FadeIn>
        <FadeIn delay={80}>
          <SectionHeader
            tone="dark"
            eyebrow="Product workflow"
            title="Institution stories — when partners are ready."
            lead="Not a case study. The delivery workflow institution stories will document once verified partner experiences are published."
          />
          <div style={{ marginTop: 8, marginBottom: 24 }}>
            <span style={{ background: instAccent.subtleStrong, border: `1px solid ${instAccent.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 10, fontFamily: 'var(--font-mono)', color: instAccent.text }}>
              INSTITUTION OS PRODUCT
            </span>
          </div>
          <Button variant="secondary" onClick={() => navigate('/institutions')}>For Institutions</Button>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function StoriesPage() {
  return (
    <PageShell auroraTheme="general">
      <HeroSection />
      <PublishingSection />
      <LearningSection />
      <CareerWorkflowSection />
      <InstitutionWorkflowSection />

      <CTABand
        eyebrow="Explore Skylent"
        title={<>See the product<br />stories will document.</>}
        lead="Programs, education pathways, Career OS, and institution partnerships — explore what exists today while verified stories are prepared."
        primary={{ label: 'Explore Programs', to: '/programs' }}
        secondary={{ label: 'Contact', to: '/contact' }}
        auroraTheme="general"
      />
    </PageShell>
  )
}
