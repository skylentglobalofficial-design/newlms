import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C, FadeIn, Footer } from '../components/shared'
import {
  Section, Eyebrow, Button, CTABand, T, SectionHeader, FlowStrip, Heading,
} from '../components/ui'
import { Aurora, GlassSurface, MediaImage } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { programs, jobs } from '../data'
import type { Program, ProgramType } from '../data'
import { PHOTO, PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO } from '../media'

const accent = getDomainAccent('general')

const TYPE_LABELS: Record<ProgramType, string> = {
  PROFESSIONAL: 'Professional Program',
  CERTIFICATE: 'Certificate Program',
  WEBINAR: 'Webinar',
  EXAM_PREP: 'Exam Preparation',
  SCHOOLING: 'Schooling',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate',
}

const FEATURED_PROGRAM = programs.find(p => p.slug === 'data-science-ai') ?? programs[0]
const SUPPORTING_PROGRAMS = programs
  .filter(p => p.slug !== FEATURED_PROGRAM.slug)
  .slice(0, 5)

// ─── HERO VISUAL ──────────────────────────────────────────────────────────────

function EcosystemHeroVisual() {
  const sampleJob = jobs[0]
  const careerAccent = getDomainAccent('career')

  return (
    <div className="home-hero-visual" style={{ position: 'relative', minHeight: 'clamp(320px, 52vh, 480px)' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <MediaImage
          src={PHOTO.classroomWarm}
          alt="Students learning in a classroom"
          aspect="4/5"
          overlay="full"
          objectPosition="center 25%"
          className="skylent-hero-visual"
        />
        <GlassSurface
          level={2}
          padding="16px 18px"
          style={{ position: 'absolute', top: 16, left: 16, right: 16, maxWidth: 280 }}
        >
          <div className="skylent-label" style={{ color: accent.text, marginBottom: 12 }}>The journey</div>
          <FlowStrip
            tone="dark"
            steps={[
              { label: 'Learn', sub: 'Education' },
              { label: 'Build', sub: 'Skills', highlight: true },
              { label: 'Career', sub: 'Career OS' },
            ]}
          />
        </GlassSurface>
      </div>

      <GlassSurface
        level={2}
        padding="14px 16px"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 'min(72%, 300px)',
          zIndex: 3,
        }}
      >
        <div className="skylent-label" style={{ color: accent.text, marginBottom: 10 }}>Career proof</div>
        <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: accent.subtle, border: `1px dashed ${accent.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text }}>
            PRJ
          </div>
          <div>
            <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>Program projects</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>Portfolio from coursework</div>
          </div>
        </div>
        {sampleJob && (
          <div style={{ paddingTop: 12, borderTop: `1px solid ${T.lineDark}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: accent.text, marginBottom: 3 }}>OPPORTUNITY</div>
              <div style={{ color: C.white, fontSize: 12, fontWeight: 600 }}>{sampleJob.role}</div>
            </div>
            <div style={{ background: careerAccent.primary, color: C.white, borderRadius: 5, padding: '6px 10px', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
              Apply
            </div>
          </div>
        )}
      </GlassSurface>

      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-6% -4%',
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

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'min(92vh, 920px)',
        display: 'flex',
        alignItems: 'center',
        padding: `${T.navH + 24}px ${T.gutter} clamp(48px, 6vw, 72px)`,
      }}
    >
      <Aurora themeId="general" variant="hero" />
      <div style={{ maxWidth: T.maxW, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 'clamp(28px, 5vw, 64px)', alignItems: 'center' }}
          className="hero-grid two-col skylent-page-hero"
        >
          <FadeIn>
            <Eyebrow tone="dark" accent>Skylent</Eyebrow>
            <h1 className="skylent-display-xl" style={{ color: C.white, margin: '22px 0 20px', maxWidth: 680 }}>
              Learn. Build skills.<br />
              <span style={{ color: accent.text }}>Build a career.</span>
            </h1>
            <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 520, margin: '0 0 32px' }}>
              Programs, credentials, and Career OS in one workspace — from school through professional hire.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={() => navigate('/programs')}>Explore Programs</Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/education')}>Explore Education</Button>
            </div>
          </FadeIn>
          <FadeIn delay={80}>
            <EcosystemHeroVisual />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

// ─── 2. WHAT SKYLENT COVERS ──────────────────────────────────────────────────

function CoverageSection() {
  const navigate = useNavigate()

  const pillars = [
    {
      label: 'Education',
      sub: 'School · Undergraduate · Postgraduate · Exams',
      desc: 'Academic programs with visible progress — not one generic LMS.',
      to: '/education',
      theme: getDomainAccent('schooling'),
    },
    {
      label: 'Skills',
      sub: 'Webinars · Certificates · Professional Programs',
      desc: 'Credentialed upskilling. Professional Programs unlock Career OS.',
      to: '/skills',
      theme: getDomainAccent('professional'),
    },
    {
      label: 'Career OS',
      sub: 'Profile · Interview prep · Jobs · Applications',
      desc: 'A career workspace — activated after a Professional Program.',
      to: '/career-os',
      theme: getDomainAccent('career'),
    },
    {
      label: 'Institutions',
      sub: 'Schools · Colleges · Universities · Training',
      desc: 'Enterprise workflows for partners who deliver the ecosystem.',
      to: '/institutions',
      theme: getDomainAccent('institution'),
    },
  ]

  return (
    <Section tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="What Skylent covers"
          title="Four products. One connected journey."
          lead="Education builds foundation. Skills turn it into capability. Career OS turns capability into opportunity. Institutions deliver it at scale."
        />
      </FadeIn>

      <div style={{ marginTop: 52 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
          {pillars.map((pillar, i) => (
            <FadeIn key={pillar.label} delay={i * 60}>
              <button
                type="button"
                onClick={() => navigate(pillar.to)}
                style={{
                  display: 'block',
                  flex: '1 1 min(240px, 100%)',
                  minWidth: 'min(240px, 100%)',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  borderTop: `1px solid ${T.lineDark}`,
                  padding: '28px clamp(12px, 2vw, 24px)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <div className="skylent-label" style={{ color: pillar.theme.text, marginBottom: 14 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.4vw, 28px)', fontWeight: 600, color: C.white, marginBottom: 8, letterSpacing: '-0.02em' }}>
                  {pillar.label}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginBottom: 14, lineHeight: 1.45 }}>{pillar.sub}</div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, lineHeight: 1.65, margin: '0 0 16px', maxWidth: 240 }}>{pillar.desc}</p>
                <span style={{ color: pillar.theme.text, fontSize: 13, fontWeight: 600 }}>Explore →</span>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── 3. EDUCATION ─────────────────────────────────────────────────────────────

function EducationSection() {
  const navigate = useNavigate()

  const stages = [
    { label: 'Schooling', sub: 'Grades 1–12', anchor: 'schooling', photo: PHOTO.classroomWarm },
    { label: 'Undergraduate', sub: 'Degree-aligned', anchor: 'undergraduate', photo: PHOTO.college },
    { label: 'Postgraduate', sub: 'Specialisation', anchor: 'postgraduate', photo: PHOTO.research },
    { label: 'Competitive Exams', sub: 'JEE · NEET · CAT', anchor: 'competitive-exams', photo: PHOTO.study },
  ]

  const eduAccent = getDomainAccent('schooling')

  return (
    <Section tone="canvas" divider id="education">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 72px)', alignItems: 'center' }} className="two-col">
        <FadeIn>
          <MediaImage
            src={PHOTO.lecture}
            alt="Students in a lecture environment"
            aspect="4/3"
            overlay="bottom"
            objectPosition="center"
          />
        </FadeIn>
        <FadeIn delay={80}>
          <Eyebrow tone="dark">Education</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            From schooling<br />to competitive exams.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.75, margin: '0 0 32px', maxWidth: 480 }}>
            Four distinct academic products — each with its own curriculum model, audience, and workflow. Not one generic course catalog.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {stages.map((stage, i) => (
              <button
                key={stage.label}
                type="button"
                onClick={() => navigate(`/education#${stage.anchor}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto',
                  gap: 16,
                  alignItems: 'center',
                  padding: '16px 0',
                  borderTop: i === 0 ? `1px solid ${T.lineDark}` : 'none',
                  borderBottom: `1px solid ${T.lineDark}`,
                  background: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: C.ink3 }}>
                  <img src={stage.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.white, marginBottom: 3 }}>{stage.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{stage.sub}</div>
                </div>
                <span style={{ color: eduAccent.text, fontSize: 16 }}>→</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Button variant="secondary" onClick={() => navigate('/education')}>Explore Education</Button>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── 4. SKILLS ────────────────────────────────────────────────────────────────

function SkillsSection() {
  const navigate = useNavigate()
  const skillsAccent = getDomainAccent('professional')

  const stages = [
    { label: 'Webinars', sub: 'Live sessions · Register and attend', to: '/skills#webinars' },
    { label: 'Certificate Programs', sub: 'Structured credentials with assessment', to: '/skills#certificate' },
    { label: 'Professional Programs', sub: 'Deep programs that unlock Career OS', to: '/skills#professional', highlight: true },
    { label: 'Job Assistance', sub: 'Resume, interviews, applications', to: '/skills#job-assistance' },
  ]

  return (
    <Section tone="canvas" divider id="skills">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 72px)', alignItems: 'center' }} className="two-col">
        <FadeIn>
          <Eyebrow tone="dark">Skills</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            Events, credentials,<br />and career programs.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.75, margin: '0 0 28px', maxWidth: 480 }}>
            A webinar is not a Professional Program. Each skills product has its own depth, format, and outcome — with Professional Programs as the bridge to Career OS.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {stages.map((stage, i) => (
              <button
                key={stage.label}
                type="button"
                onClick={() => navigate(stage.to)}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  padding: '18px 14px',
                  background: stage.highlight ? skillsAccent.subtle : 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${T.lineDark}`,
                  borderLeft: `2px solid ${stage.highlight ? skillsAccent.primary : 'transparent'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: stage.highlight ? skillsAccent.text : 'rgba(255,255,255,0.28)', marginTop: 4, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: stage.highlight ? skillsAccent.text : C.white, marginBottom: 4 }}>{stage.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, lineHeight: 1.55 }}>{stage.sub}</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Button variant="secondary" onClick={() => navigate('/skills')}>Explore Skills</Button>
          </div>
        </FadeIn>
        <FadeIn delay={80}>
          <div style={{ position: 'relative' }}>
            <MediaImage
              src={PHOTO.workshop}
              alt="Professionals in a skills workshop"
              aspect="4/3"
              overlay="full"
            />
            <GlassSurface level={2} padding="14px 16px" style={{ position: 'absolute', bottom: 20, left: 20, right: 20, maxWidth: 320 }}>
              <div className="skylent-label" style={{ color: skillsAccent.text, marginBottom: 8 }}>Professional Program</div>
              <div style={{ color: C.white, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Project-driven curriculum</div>
              <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12 }}>Modules → Projects → Certification → Career OS</div>
            </GlassSurface>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── 5. CAREER ────────────────────────────────────────────────────────────────

function CareerSection() {
  const navigate = useNavigate()
  const careerAccent = getDomainAccent('career')
  const sampleJob = jobs[0]

  const journey = [
    { label: 'Profile', sub: 'Identity, skills, resume' },
    { label: 'Proof', sub: 'Projects from programs' },
    { label: 'Discover', sub: 'Job board roles' },
    { label: 'Apply', sub: 'Screening workflow' },
    { label: 'Prepare', sub: 'Interview rounds' },
    { label: 'Track', sub: 'Application status' },
  ]

  return (
    <Section tone="canvas" divider id="career">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 72px)', alignItems: 'center' }} className="two-col">
        <FadeIn>
          <GlassSurface level={2} padding="20px 22px">
            <div className="skylent-label" style={{ color: careerAccent.text, marginBottom: 16 }}>Career OS workspace</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { tag: 'PROFILE', title: 'Your professional profile', sub: 'Identity · Skills · Portfolio' },
                { tag: 'PROOF', title: 'Program projects', sub: 'Portfolio links from coursework' },
              ].map(row => (
                <div key={row.tag} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 14, padding: '14px 0', borderBottom: `1px solid ${T.lineDark}`, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: row.tag === 'PROFILE' ? '50%' : 8, background: careerAccent.subtle, border: `1px solid ${careerAccent.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: careerAccent.text }}>
                    {row.tag === 'PROFILE' ? '—' : 'PRJ'}
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>{row.tag}</div>
                    <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>{row.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{row.sub}</div>
                  </div>
                </div>
              ))}
              {sampleJob && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, padding: '14px 0', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: careerAccent.text, marginBottom: 3 }}>OPPORTUNITY</div>
                    <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>{sampleJob.role}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{sampleJob.company} · {sampleJob.mode}</div>
                  </div>
                  <div style={{ background: careerAccent.primary, color: C.white, borderRadius: 6, padding: '8px 14px', fontSize: 11, fontWeight: 600 }}>Apply</div>
                </div>
              )}
            </div>
          </GlassSurface>
        </FadeIn>
        <FadeIn delay={80}>
          <Eyebrow tone="dark" accent>Career OS</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            A career product,<br />not a slogan.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.75, margin: '0 0 28px', maxWidth: 480 }}>
            Interview preparation, a job board, and application tracking in one workspace. Unlocks when you complete a Professional Program.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0', marginBottom: 28 }}>
            {journey.map((step, i) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: '1 1 140px', minWidth: 0 }}>
                <div style={{ padding: '12px 0', minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white }}>{step.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 3 }}>{step.sub}</div>
                </div>
                {i < journey.length - 1 && (
                  <span style={{ color: 'rgba(255,255,255,0.2)', padding: '0 8px', fontSize: 14, flexShrink: 0 }}>→</span>
                )}
              </div>
            ))}
          </div>
          <Button variant="primary" onClick={() => navigate('/career-os')}>Explore Career OS</Button>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── 6. INSTITUTIONS ──────────────────────────────────────────────────────────

function InstitutionsSection() {
  const navigate = useNavigate()
  const instAccent = getDomainAccent('institution')

  const workflow = [
    { label: 'Programs', sub: 'Curriculum across departments' },
    { label: 'Offerings', sub: 'Skills tracks beside degrees' },
    { label: 'Learners', sub: 'Student lifecycle visibility' },
    { label: 'Faculty', sub: 'Teaching and development' },
    { label: 'Progress', sub: 'Outcomes parents can see' },
  ]

  return (
    <Section tone="canvas" divider id="institutions">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 72px)', alignItems: 'center' }} className="two-col">
        <FadeIn>
          <Eyebrow tone="dark">For Institutions</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            Enterprise software<br />for education.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.75, margin: '0 0 28px', maxWidth: 480 }}>
            Schools, colleges, universities, and training institutes each get a distinct workflow — programs, offerings, learners, faculty, and progress as shared infrastructure.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {workflow.map((step, i) => (
              <div
                key={step.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr',
                  gap: 14,
                  padding: '14px 0',
                  borderBottom: `1px solid ${T.lineDark}`,
                  alignItems: 'start',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: instAccent.text, paddingTop: 2 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.white, marginBottom: 3 }}>{step.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12.5 }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Button variant="secondary" onClick={() => navigate('/institutions')}>For Institutions</Button>
          </div>
        </FadeIn>
        <FadeIn delay={80}>
          <div style={{ position: 'relative' }}>
            <MediaImage
              src={PHOTO.schoolBuilding}
              alt="School building"
              aspect="4/3"
              overlay="full"
              objectPosition="center"
            />
            <GlassSurface level={2} padding="16px 18px" style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <div className="skylent-label" style={{ color: instAccent.text, marginBottom: 10 }}>Institution OS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Education delivery', 'Skills integration', 'Career OS for graduates'].map(item => (
                  <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: instAccent.primary, flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{item}</span>
                  </div>
                ))}
              </div>
            </GlassSurface>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── 7. ECOSYSTEM CONNECTION ──────────────────────────────────────────────────

function EcosystemConnectionSection() {
  const steps = [
    { label: 'Education / Skills', sub: 'Academic foundation and credentialed capability', accent: accent },
    { label: 'Learning + Projects', sub: 'Structured coursework becomes portfolio artifacts', accent: getDomainAccent('professional') },
    { label: 'Career Proof', sub: 'Projects, certifications, and program outcomes', accent: getDomainAccent('career') },
    { label: 'Career OS', sub: 'Profile, interview prep, jobs, applications', accent: getDomainAccent('career') },
    { label: 'Opportunities', sub: 'Roles to discover, apply, and track', accent: accent },
  ]

  return (
    <Section tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="How it connects"
          title="One ecosystem,<br />not four products."
          lead="Each stage feeds the next. Institutions deliver the same connected journey at scale — with workflows appropriate to their model."
          align="center"
        />
      </FadeIn>

      <div style={{ marginTop: 56, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
        {steps.map((step, i) => (
          <FadeIn key={step.label} delay={i * 70}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 28 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: step.accent.primary, border: `2px solid ${step.accent.border}`, flexShrink: 0 }} />
                {i < steps.length - 1 && (
                  <div style={{ width: 1, flex: 1, minHeight: 48, background: `linear-gradient(180deg, ${step.accent.border}, transparent)`, marginTop: 8 }} />
                )}
              </div>
              <div style={{ paddingBottom: i < steps.length - 1 ? 36 : 0, flex: 1 }}>
                <GlassSurface level={1} padding="18px 22px" style={{ borderLeft: `2px solid ${step.accent.primary}` }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2.2vw, 24px)', fontWeight: 600, color: C.white, marginBottom: 6 }}>
                    {step.label}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: 14, lineHeight: 1.6 }}>{step.sub}</div>
                </GlassSurface>
              </div>
            </div>
          </FadeIn>
        ))}

        <FadeIn delay={400}>
          <div style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid ${T.lineDark}`, textAlign: 'center' }}>
            <div className="skylent-label" style={{ color: getDomainAccent('institution').text, marginBottom: 10 }}>Institutions</div>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 15, lineHeight: 1.7, margin: 0, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
              Partners deliver Education, Skills, and Career OS through institution-specific workflows — schools to universities to training centres.
            </p>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── 8. PROGRAM DISCOVERY ─────────────────────────────────────────────────────

function ProgramDiscoverySection() {
  const navigate = useNavigate()
  if (!FEATURED_PROGRAM) return null

  const featuredPhoto = PROGRAM_PHOTO[FEATURED_PROGRAM.slug] ?? DEFAULT_PROGRAM_PHOTO
  const lowestPrice = Math.min(...FEATURED_PROGRAM.pricing.map(p => p.price))

  const categories = [
    { label: 'Professional', type: 'PROFESSIONAL' as ProgramType },
    { label: 'Certificate', type: 'CERTIFICATE' as ProgramType },
    { label: 'Exam Prep', type: 'EXAM_PREP' as ProgramType },
  ]

  return (
    <Section tone="canvas" divider id="programs">
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Program discovery"
          title="Programs with structure,<br />not placeholders."
          lead="Professional Programs, certificates, and exam preparation — each with curriculum, format, and a defined outcome."
        />
      </FadeIn>

      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 'clamp(28px, 4vw, 48px)', alignItems: 'start' }} className="two-col education-discovery">
        <FadeIn>
          <Link to={`/programs/${FEATURED_PROGRAM.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ position: 'relative' }}>
              <MediaImage src={featuredPhoto} alt={FEATURED_PROGRAM.name} aspect="16/9" overlay="full" />
              <div style={{ position: 'absolute', top: 16, left: 16 }}>
                <span style={{ background: accent.subtleStrong, border: `1px solid ${accent.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 10, fontFamily: 'var(--font-mono)', color: accent.text, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Featured
                </span>
              </div>
            </div>
            <div style={{ paddingTop: 24 }}>
              <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>{TYPE_LABELS[FEATURED_PROGRAM.programType]}</div>
              <h3 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 12px' }}>{FEATURED_PROGRAM.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, lineHeight: 1.7, margin: '0 0 20px', maxWidth: 520 }}>{FEATURED_PROGRAM.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 20 }}>
                {[
                  { k: 'Duration', v: FEATURED_PROGRAM.duration },
                  { k: 'Format', v: FEATURED_PROGRAM.format },
                  { k: 'Outcome', v: FEATURED_PROGRAM.outcome },
                  { k: 'From', v: `₹${lowestPrice.toLocaleString('en-IN')}` },
                ].map(({ k, v }) => (
                  <div key={k}>
                    <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 4 }}>{k}</div>
                    <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
          <Button variant="primary" onClick={() => navigate(`/programs/${FEATURED_PROGRAM.slug}`)}>View Program →</Button>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 16 }}>By category</div>
          {categories.map(cat => {
            const count = programs.filter(p => p.programType === cat.type).length
            if (!count) return null
            return (
              <div key={cat.label} style={{ padding: '14px 0', borderBottom: `1px solid ${T.lineDark}` }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.white, marginBottom: 4 }}>{cat.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{count} program{count !== 1 ? 's' : ''} in catalog</div>
              </div>
            )
          })}

          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', margin: '28px 0 16px' }}>More programs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {SUPPORTING_PROGRAMS.map((program, i) => {
              const photo = PROGRAM_PHOTO[program.slug] ?? DEFAULT_PROGRAM_PHOTO
              const price = Math.min(...program.pricing.map(p => p.price))
              return (
                <Link
                  key={program.slug}
                  to={`/programs/${program.slug}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '64px 1fr auto',
                    gap: 14,
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: i < SUPPORTING_PROGRAMS.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{ width: 64, height: 48, borderRadius: 8, overflow: 'hidden', background: C.ink3 }}>
                    <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 3 }}>{program.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11.5 }}>{TYPE_LABELS[program.programType]} · {program.duration}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.white }}>₹{price.toLocaleString('en-IN')}</div>
                  </div>
                </Link>
              )
            })}
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.lineDark}` }}>
            <Button variant="secondary" onClick={() => navigate('/programs')}>Explore Programs</Button>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <HeroSection />
      <CoverageSection />
      <EducationSection />
      <SkillsSection />
      <CareerSection />
      <InstitutionsSection />
      <EcosystemConnectionSection />
      <ProgramDiscoverySection />
      <CTABand
        eyebrow="Get started"
        title={<>The infrastructure for<br />education and careers.</>}
        lead="Explore programs, education pathways, skills tracks, Career OS, or partner with Skylent as an institution."
        primary={{ label: 'Explore Programs', to: '/programs' }}
        secondary={{ label: 'For Institutions', to: '/institutions' }}
        auroraTheme="general"
      />
      <Footer />
    </>
  )
}
