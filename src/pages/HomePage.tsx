import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C, FadeIn, Footer } from '../components/shared'
import {
  Section, Button, CTABand, T, SectionHeader, FlowStrip,
} from '../components/ui'
import { GlassSurface, MediaImage } from '../components/foundation'
import EcosystemMapHero from '../components/home/EcosystemMapHero'
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

// ─── 1. ECOSYSTEM MAP ─────────────────────────────────────────────────────────

function CoverageSection() {
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
      desc: 'Credentialed upskilling. Professional Programs include Career OS access.',
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
      desc: 'Dashboards for schools, colleges, universities, and training partners.',
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
          title="Education, Skills, Career, Institutions."
          lead="Each product has its own pages, curriculum, and workflows. They connect when a learner moves from school to hire."
        />
      </FadeIn>

      <div style={{ marginTop: 52 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
          {pillars.map((pillar, i) => (
            <FadeIn key={pillar.label} delay={i * 60}>
              <Link
                to={pillar.to}
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
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div className="skylent-label" style={{ color: pillar.theme.text, marginBottom: 14 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.4vw, 28px)', fontWeight: 600, color: C.white, marginBottom: 8, letterSpacing: '-0.02em' }}>
                  {pillar.label}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 14, lineHeight: 1.45 }}>{pillar.sub}</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.65, margin: '0 0 16px', maxWidth: 240 }}>{pillar.desc}</p>
                <span style={{ color: pillar.theme.text, fontSize: 13, fontWeight: 600 }}>View</span>
              </Link>
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
      <FadeIn>
        <SectionHeader
          tone="dark"
          align="center"
          eyebrow="Education"
          title={<>From schooling<br />to competitive exams.</>}
          lead="Four distinct academic products — each with its own curriculum model, audience, and workflow. Not one generic course catalog."
        />
      </FadeIn>
      <FadeIn delay={60}>
        <div style={{ marginTop: 40 }}>
          <MediaImage
            src={PHOTO.lecture}
            alt="Students in a lecture environment"
            aspect="21/9"
            overlay="bottom"
            objectPosition="center"
          />
        </div>
      </FadeIn>
      <FadeIn delay={80}>
        <div style={{ marginTop: 40, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {stages.map((stage, i) => (
              <Link
                key={stage.label}
                to={`/education#${stage.anchor}`}
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
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: C.ink3 }}>
                  <MediaImage src={stage.photo} alt="" aspect="1/1" radius={8} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.white, marginBottom: 3 }}>{stage.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{stage.sub}</div>
                </div>
                <span style={{ color: eduAccent.text, fontSize: 13, fontWeight: 500 }}>View</span>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Button variant="secondary" onClick={() => navigate('/education')}>Explore Education</Button>
          </div>
        </div>
      </FadeIn>
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
    { label: 'Professional Programs', sub: 'Deep programs with Career OS access', to: '/skills#professional', highlight: true },
    { label: 'Job Assistance', sub: 'Resume, interviews, applications', to: '/skills#job-assistance' },
  ]

  return (
    <Section tone="canvas" divider id="skills">
      <FadeIn>
        <SectionHeader
          tone="dark"
          align="center"
          eyebrow="Skills"
          title={<>Events, credentials,<br />and career programs.</>}
          lead="A webinar is not a Professional Program. Each skills product has its own depth, format, and outcome — with Professional Programs as the bridge to Career OS."
        />
      </FadeIn>
      <FadeIn delay={60}>
        <div style={{ marginTop: 40 }}>
          <MediaImage
            src={PHOTO.workshop}
            alt="Professionals in a skills workshop"
            aspect="21/9"
            overlay="bottom"
          />
        </div>
      </FadeIn>
      <FadeIn delay={80}>
        <div style={{ marginTop: 40, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {stages.map((stage, i) => (
              <Link
                key={stage.label}
                to={stage.to}
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
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: stage.highlight ? skillsAccent.text : 'var(--text-muted)', marginTop: 4, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: stage.highlight ? skillsAccent.text : C.white, marginBottom: 4 }}>{stage.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55 }}>{stage.sub}</div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Button variant="secondary" onClick={() => navigate('/skills')}>Explore Skills</Button>
          </div>
        </div>
      </FadeIn>
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
    { label: 'Application', sub: 'Submit from job board' },
    { label: 'Interview', sub: 'Prep and practice' },
    { label: 'Outcome', sub: 'Offers and status' },
  ]

  return (
    <Section tone="canvas" divider id="career">
      <FadeIn>
        <SectionHeader
          tone="dark"
          align="center"
          eyebrow="Career OS"
          title={<>A career product,<br />not a slogan.</>}
          lead="Interview preparation, a job board, and application tracking in one workspace. Available after you complete a Professional Program."
        />
      </FadeIn>
      <FadeIn delay={60}>
        <div style={{ marginTop: 40, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          <GlassSurface level={2} padding="20px 22px">
            <div className="skylent-label" style={{ color: careerAccent.text, marginBottom: 16 }}>Career OS workspace</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Profile', title: 'Your professional profile', sub: 'Identity · Skills · Portfolio' },
                { label: 'Proof', title: 'Program projects', sub: 'Portfolio links from coursework' },
              ].map(row => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 14, padding: '14px 0', borderBottom: `1px solid ${T.lineDark}`, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: row.label === 'Profile' ? '50%' : 8, background: careerAccent.subtle, border: `1px solid ${careerAccent.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: careerAccent.text }}>
                    {row.label === 'Profile' ? '—' : 'PRJ'}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{row.label}</div>
                    <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>{row.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{row.sub}</div>
                  </div>
                </div>
              ))}
              {sampleJob && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, padding: '14px 0', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: careerAccent.text, marginBottom: 3 }}>Open role</div>
                    <div style={{ color: C.white, fontSize: 14, fontWeight: 600 }}>{sampleJob.role}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{sampleJob.company} · {sampleJob.mode}</div>
                  </div>
                  <div style={{ background: careerAccent.primary, color: C.white, borderRadius: 6, padding: '8px 14px', fontSize: 11, fontWeight: 600 }}>Apply</div>
                </div>
              )}
            </div>
          </GlassSurface>
        </div>
      </FadeIn>
      <FadeIn delay={80}>
        <div style={{ marginTop: 36, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px 16px', marginBottom: 28 }}>
            {journey.map((step) => (
              <div key={step.label} style={{ padding: '12px 0', minWidth: 0, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white }}>{step.label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 3 }}>{step.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Button variant="primary" onClick={() => navigate('/career-os')}>Explore Career OS</Button>
          </div>
        </div>
      </FadeIn>
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
      <FadeIn>
        <SectionHeader
          tone="dark"
          align="center"
          eyebrow="For Institutions"
          title={<>Enterprise software<br />for education.</>}
          lead="Schools, colleges, universities, and training institutes each get a distinct workflow — programs, offerings, learners, faculty, and progress as shared infrastructure."
        />
      </FadeIn>
      <FadeIn delay={60}>
        <div style={{ marginTop: 40 }}>
          <MediaImage
            src={PHOTO.schoolBuilding}
            alt="School building"
            aspect="21/9"
            overlay="bottom"
            objectPosition="center"
          />
        </div>
      </FadeIn>
      <FadeIn delay={80}>
        <div style={{ marginTop: 40, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
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
                  <div style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Button variant="secondary" onClick={() => navigate('/institutions')}>For Institutions</Button>
          </div>
        </div>
      </FadeIn>
    </Section>
  )
}

// ─── 7. CONNECTION BAND (compact) ─────────────────────────────────────────────

function ConnectionBand() {
  const careerAccent = getDomainAccent('career')
  const proAccent = getDomainAccent('professional')

  return (
    <Section tone="canvas" divider style={{ paddingTop: T.sectionTight, paddingBottom: T.sectionTight }}>
      <FadeIn>
        <GlassSurface level={2} padding="clamp(24px, 4vw, 36px)">
          <div className="skylent-label" style={{ color: accent.text, marginBottom: 16 }}>How it connects</div>
          <FlowStrip
            tone="dark"
            steps={[
              { label: 'Learn', sub: 'Education & skills' },
              { label: 'Build', sub: 'Projects & proof', highlight: true },
              { label: 'Career', sub: 'Career OS' },
              { label: 'Hire', sub: 'Applications' },
            ]}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, margin: '20px 0 0', maxWidth: 640 }}>
            Institutions run the same sequence with their own dashboards — programs, learners, faculty, and progress in one place.
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: proAccent.text, fontFamily: 'var(--font-mono)' }}>Skills → Career OS</span>
            <span style={{ fontSize: 12, color: careerAccent.text, fontFamily: 'var(--font-mono)' }}>Education → Exams</span>
            <span style={{ fontSize: 12, color: getDomainAccent('institution').text, fontFamily: 'var(--font-mono)' }}>Institutions → Ops</span>
          </div>
        </GlassSurface>
      </FadeIn>
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
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, margin: '0 0 20px', maxWidth: 520 }}>{FEATURED_PROGRAM.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 20 }}>
                {[
                  { k: 'Duration', v: FEATURED_PROGRAM.duration },
                  { k: 'Format', v: FEATURED_PROGRAM.format },
                  { k: 'Outcome', v: FEATURED_PROGRAM.outcome },
                  { k: 'From', v: `₹${lowestPrice.toLocaleString('en-IN')}` },
                ].map(({ k, v }) => (
                  <div key={k}>
                    <div className="skylent-label" style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{k}</div>
                    <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
          <Button variant="primary" onClick={() => navigate(`/programs/${FEATURED_PROGRAM.slug}`)}>View Program →</Button>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="skylent-label" style={{ color: 'var(--text-muted)', marginBottom: 16 }}>By category</div>
          {categories.map(cat => {
            const count = programs.filter(p => p.programType === cat.type).length
            if (!count) return null
            return (
              <div key={cat.label} style={{ padding: '14px 0', borderBottom: `1px solid ${T.lineDark}` }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.white, marginBottom: 4 }}>{cat.label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{count} program{count !== 1 ? 's' : ''} in catalog</div>
              </div>
            )
          })}

          <div className="skylent-label" style={{ color: 'var(--text-muted)', margin: '28px 0 16px' }}>More programs</div>
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
                    <MediaImage src={photo} alt="" aspect="4/3" radius={8} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 3 }}>{program.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>{TYPE_LABELS[program.programType]} · {program.duration}</div>
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
      <EcosystemMapHero />
      <CoverageSection />
      <EducationSection />
      <SkillsSection />
      <CareerSection />
      <InstitutionsSection />
      <ConnectionBand />
      <ProgramDiscoverySection />
      <CTABand
        eyebrow="Get started"
        title={<>Start with the path<br />that fits you.</>}
        lead="Browse programs, education pathways, skills tracks, Career OS, or partner with Skylent as an institution."
        primary={{ label: 'Explore Programs', to: '/programs' }}
        secondary={{ label: 'For Institutions', to: '/institutions' }}
        auroraTheme="general"
      />
      <Footer />
    </>
  )
}
