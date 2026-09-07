import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { careerOsWorkspaceNav } from '../lib/auth-routing'
import { C, FadeIn, PageShell } from '../components/shared'
import {
  Section, Button, Eyebrow, CTABand, T, Heading, SectionHeader,
} from '../components/ui'
import { Aurora, MediaImage, GlassSurface, ContextualNavBar, useSectionSpy, type ContextualNavItem } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import SkillsExplorer from '../components/skills/SkillsExplorer'
import { programs, workshops } from '../data'
import { PHOTO, PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO } from '../media'

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PROFESSIONAL = programs.filter(p => p.programType === 'PROFESSIONAL')
const CERTIFICATES = programs.filter(p => p.programType === 'CERTIFICATE')
const FEATURED_PRO = PROFESSIONAL.find(p => p.slug === 'data-science-ai') ?? PROFESSIONAL[0]
const OTHER_PRO = PROFESSIONAL.filter(p => p.slug !== FEATURED_PRO?.slug)
const FEATURED_WORKSHOP = workshops[0]
const OTHER_WORKSHOPS = workshops.slice(1, 4)

const accent = getDomainAccent('professional')

const SKILLS_NAV_ITEMS: ContextualNavItem[] = [
  { id: 'webinars', label: 'Webinars', sub: 'Live sessions' },
  { id: 'certificate', label: 'Certificate Programs', sub: 'Credentials' },
  { id: 'professional', label: 'Professional Programs', sub: 'Career products' },
  { id: 'job-assistance', label: 'Job Assistance', sub: 'Career support' },
]

// ─── SKILLS PATH ──────────────────────────────────────────────────────────────

function SkillsPathSection() {
  const steps = [
    { num: '01', label: 'Learn', desc: 'Structured curriculum and live sessions' },
    { num: '02', label: 'Practice', desc: 'Activities, drills, and assessments' },
    { num: '03', label: 'Build', desc: 'Projects with real deliverables' },
    { num: '04', label: 'Prove', desc: 'Certificates and portfolio work' },
    { num: '05', label: 'Move Forward', desc: 'Career OS and job support' },
  ]

  return (
    <Section tone="canvas" divider style={{ paddingTop: T.sectionTight }}>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Skills path"
          title="Learning → proof → career."
          lead="Webinars, certificates, and professional programs are separate products. Professional Programs include Career OS."
        />
      </FadeIn>

      <div className="skills-path" style={{ marginTop: 48, position: 'relative' }}>
        <div
          aria-hidden
          className="skills-path-line"
          style={{
            position: 'absolute',
            top: 20,
            left: '4%',
            right: '4%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accent.border}, ${accent.border}, transparent)`,
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
          {steps.map((step, i) => (
            <FadeIn key={step.label} delay={i * 50}>
              <div style={{ padding: '0 12px 0 0' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: accent.subtle,
                    border: `1px solid ${accent.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: accent.text,
                    marginBottom: 16,
                  }}
                >
                  {step.num}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 1.8vw, 20px)', fontWeight: 600, color: C.white, margin: '0 0 6px' }}>
                  {step.label}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12.5, lineHeight: 1.55, margin: 0, maxWidth: 160 }}>
                  {step.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ─── WEBINARS ─────────────────────────────────────────────────────────────────

function WebinarsSection() {
  const navigate = useNavigate()
  if (!FEATURED_WORKSHOP) return null

  return (
    <Section id="webinars" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(36px,6vw,72px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <Link to={`/workshops/${FEATURED_WORKSHOP.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative' }}>
            <MediaImage
              src={PHOTO.workshop}
              alt={FEATURED_WORKSHOP.title}
              aspect="16/9"
              overlay="full"
            />
            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
              <span
                style={{
                  background: 'rgba(5,5,5,0.65)',
                  border: `1px solid ${accent.border}`,
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: accent.text,
                  letterSpacing: '0.08em',
                }}
              >
                {FEATURED_WORKSHOP.mode} · {FEATURED_WORKSHOP.duration}
              </span>
            </div>
          </Link>
        </FadeIn>

        <FadeIn delay={80}>
          <Eyebrow tone="dark">Webinars</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            Show up for a session. Leave with a topic mastered.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.8, margin: '0 0 24px', maxWidth: 480 }}>
            Event-oriented: speaker, date, duration, live or recorded. Open to anyone who wants a first step.
          </p>

          <div style={{ padding: '20px 0', borderTop: `1px solid ${T.lineDark}`, borderBottom: `1px solid ${T.lineDark}`, marginBottom: 24 }}>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Next session</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.white, margin: '0 0 10px', lineHeight: 1.25 }}>
              {FEATURED_WORKSHOP.title}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.65, margin: '0 0 16px' }}>{FEATURED_WORKSHOP.desc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 4 }}>Date</div>
                <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{FEATURED_WORKSHOP.date}</div>
              </div>
              <div>
                <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 4 }}>Speaker</div>
                <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{FEATURED_WORKSHOP.instructor}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 }}>
            {OTHER_WORKSHOPS.map((w, i) => (
              <Link
                key={w.slug}
                to={`/workshops/${w.slug}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 12,
                  padding: '14px 0',
                  borderBottom: i < OTHER_WORKSHOPS.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 3 }}>{w.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{w.date} · {w.duration}</div>
                </div>
                <span style={{ color: accent.textMuted, fontSize: 14 }}>→</span>
              </Link>
            ))}
          </div>

          <Button variant="primary" onClick={() => navigate('/workshops')}>All webinars →</Button>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── CERTIFICATE PROGRAMS ─────────────────────────────────────────────────────

function CertificateSection() {
  const navigate = useNavigate()
  const cert = CERTIFICATES[0]

  return (
    <Section id="certificate" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 'clamp(36px,6vw,72px)', alignItems: 'start' }} className="two-col skills-cert-grid">
        <FadeIn>
          <Eyebrow tone="dark">Certificate Programs</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            A credential you can finish.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.8, margin: '0 0 28px', maxWidth: 480 }}>
            Shorter than a Professional Program. Structured curriculum, assessment, and certification — without Career OS access.
          </p>

          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 14 }}>Credential path</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 28 }}>
            {['Module', 'Skill', 'Project', 'Credential'].map((s, i, arr) => (
              <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>{s}</span>
                {i < arr.length - 1 && <span style={{ color: accent.textMuted }}>→</span>}
              </span>
            ))}
          </div>

          {cert ? (
            <>
              <div style={{ padding: '20px 0', borderTop: `1px solid ${T.lineDark}`, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.white, margin: '0 0 10px' }}>{cert.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.65, margin: '0 0 14px' }}>{cert.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  <span>{cert.duration}</span>
                  <span>{cert.level}</span>
                  <span>{cert.format}</span>
                  <span>{cert.cert}</span>
                </div>
              </div>
              <Button variant="primary" onClick={() => navigate(`/programs/${cert.slug}`)}>View Program →</Button>
            </>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Certificate programs will appear here as they are published.</p>
          )}
        </FadeIn>

        <FadeIn delay={80}>
          <GlassSurface level={2} padding="28px 28px 24px" style={{ marginBottom: 20 }}>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 16 }}>Certificate of completion</div>
            <div style={{ borderBottom: `1px solid ${T.lineDark}`, paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: C.white, marginBottom: 4 }}>
                {cert?.name ?? 'Certificate Program'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                {cert?.cert ?? 'Skylent Certificate'}
              </div>
            </div>
            {cert?.curriculumDetail && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {cert.curriculumDetail.slice(0, 4).map((mod, i) => (
                  <div
                    key={mod.number}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 1fr',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: i < 3 ? `1px solid ${T.lineDark}` : 'none',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text }}>{mod.number}</span>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{mod.title}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassSurface>
          {cert && (
            <MediaImage
              src={PROGRAM_PHOTO[cert.slug] ?? DEFAULT_PROGRAM_PHOTO}
              alt={cert.name}
              aspect="16/9"
              objectPosition="center"
            />
          )}
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── PROFESSIONAL PROGRAMS ────────────────────────────────────────────────────

function ProfessionalSection() {
  const navigate = useNavigate()
  if (!FEATURED_PRO) return null

  const featuredPhoto = PROGRAM_PHOTO[FEATURED_PRO.slug] ?? DEFAULT_PROGRAM_PHOTO
  const featuredProject = FEATURED_PRO.projectsDetail?.[0]
  const lowestPrice = Math.min(...FEATURED_PRO.pricing.map(p => p.price))

  return (
    <Section id="professional" tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Professional Programs"
          title="The deepest conversion product."
          lead="Career outcome, curriculum, projects, tools, cohort, certification, and Career OS. This is the program that opens the door."
        />
      </FadeIn>

      <div style={{ marginTop: 32, marginBottom: 40 }}>
        <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 14 }}>Program flow</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
          {['Learning', 'Project', 'Assessment', 'Career Support'].map((s, i, arr) => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: i === arr.length - 1 ? accent.text : C.white }}>{s}</span>
              {i < arr.length - 1 && <span style={{ color: accent.textMuted }}>→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="skills-pro-featured" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(28px,4vw,48px)', alignItems: 'start' }}>
        <FadeIn>
          <GlassSurface level={2} padding="20px 22px" style={{ marginBottom: 20 }}>
            {featuredProject ? (
              <>
                <div className="skylent-label" style={{ color: accent.text, marginBottom: 12 }}>Featured project</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12, minHeight: 64 }}>
                    <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>DATASET</div>
                    <div style={{ height: 4, width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 4 }} />
                    <div style={{ height: 4, width: '60%', background: 'rgba(255,255,255,0.08)', borderRadius: 2 }} />
                  </div>
                  <div style={{ background: accent.subtle, borderRadius: 8, padding: 12, minHeight: 64, border: `1px solid ${accent.border}` }}>
                    <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: accent.textMuted, marginBottom: 8 }}>RESULT</div>
                    <div style={{ fontSize: 10, color: C.white, lineHeight: 1.45 }}>{featuredProject.title}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  {featuredProject.skills.join(' · ')}
                </div>
              </>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Portfolio projects included in every professional program.</div>
            )}
          </GlassSurface>
          <MediaImage src={featuredPhoto} alt={FEATURED_PRO.name} aspect="16/9" overlay="full" />
        </FadeIn>

        <FadeIn delay={80}>
          <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Professional Program · Career OS</div>
          <h3 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 12px' }}>{FEATURED_PRO.name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, lineHeight: 1.7, margin: '0 0 20px' }}>{FEATURED_PRO.desc}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
            {[
              { k: 'Outcome', v: FEATURED_PRO.outcome },
              { k: 'Duration', v: FEATURED_PRO.duration },
              { k: 'Projects', v: String(FEATURED_PRO.projects) },
              { k: 'From', v: `₹${lowestPrice.toLocaleString('en-IN')}` },
            ].map(({ k, v }) => (
              <div key={k}>
                <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 4 }}>{k}</div>
                <div style={{ color: C.white, fontSize: 14, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          <Button variant="primary" onClick={() => navigate(`/programs/${FEATURED_PRO.slug}`)}>View Program →</Button>

          <div style={{ marginTop: 36, paddingTop: 24, borderTop: `1px solid ${T.lineDark}` }}>
            <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 16 }}>All professional programs</div>
            {OTHER_PRO.map((p, i) => (
              <Link
                key={p.slug}
                to={`/programs/${p.slug}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 12,
                  padding: '14px 0',
                  borderBottom: i < OTHER_PRO.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 3 }}>{p.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{p.outcome} · {p.duration}</div>
                </div>
                <span style={{ color: accent.textMuted, fontSize: 14 }}>→</span>
              </Link>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── JOB ASSISTANCE ───────────────────────────────────────────────────────────

function JobAssistanceSection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const workspace = careerOsWorkspaceNav(Boolean(user))
  const steps = [
    { label: 'Profile', desc: 'Resume and profile review' },
    { label: 'Interview Prep', desc: 'Preparation and mock interviews' },
    { label: 'Job Discovery', desc: 'Curated job board' },
    { label: 'Applications', desc: 'Apply and track status' },
    { label: 'Tracking', desc: 'Application progress visibility' },
  ]

  return (
    <Section id="job-assistance" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 'clamp(36px,6vw,72px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <MediaImage
            src={PHOTO.career}
            alt="Career conversation"
            aspect="4/3"
            overlay="full"
            objectPosition="center"
          />
        </FadeIn>

        <FadeIn delay={80}>
          <Eyebrow tone="dark">Not a course</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            Job Assistance
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.8, margin: '0 0 32px', maxWidth: 520 }}>
            Career-support product layered on Professional Programs and Career OS. Resume, profile, interview preparation, mock interviews, job opportunities, and applications — the work after the curriculum.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28 }}>
            {steps.map((step, i) => (
              <div
                key={step.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: 16,
                  padding: '16px 0',
                  borderBottom: i < steps.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  alignItems: 'start',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent.primary, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white }}>{step.label}</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.55 }}>{step.desc}</span>
              </div>
            ))}
          </div>

          <Button variant="primary" onClick={() => navigate(workspace.path, { state: workspace.state })}>Open Career OS workspace →</Button>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── CAREER PROOF ─────────────────────────────────────────────────────────────

function CareerProofSection() {
  const proof = [
    { title: 'Projects', desc: 'Portfolio work from professional and certificate programs' },
    { title: 'Assessments', desc: 'Module tests and program evaluations' },
    { title: 'Certificates', desc: 'Completion credentials on finishing programs' },
    { title: 'Career OS', desc: 'Interview prep, applications, and job tracking on completion' },
  ]

  return (
    <Section tone="canvas" divider style={{ paddingTop: T.sectionTight, paddingBottom: T.sectionTight }}>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="How skills become career proof"
          title="Capability you can show."
          lead="Skills on Skylent are designed to produce evidence — projects, assessments, certificates, and career support — not just course completion."
        />
        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }} className="skills-proof-grid">
          {proof.map((item, i) => (
            <div
              key={item.title}
              style={{
                padding: '0 20px 0 0',
                borderRight: i < proof.length - 1 ? `1px solid ${T.lineDark}` : 'none',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent.text, marginBottom: 10 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: C.white, margin: '0 0 8px' }}>{item.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </Section>
  )
}

// ─── PROGRAM DISCOVERY ────────────────────────────────────────────────────────

function ProgramDiscoverySection() {
  const navigate = useNavigate()
  if (!FEATURED_PRO) return null

  const featuredPhoto = PROGRAM_PHOTO[FEATURED_PRO.slug] ?? DEFAULT_PROGRAM_PHOTO
  const lowestPrice = Math.min(...FEATURED_PRO.pricing.map(p => p.price))
  const allSkillsPrograms = [...PROFESSIONAL, ...CERTIFICATES]

  return (
    <Section tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Program discovery"
          title="Find the right depth."
          lead="Each listing shows duration, format, price, and outcome — from a single webinar to a full professional program."
        />
      </FadeIn>

      <div className="skills-discovery" style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 'clamp(28px,4vw,48px)', alignItems: 'start' }}>
        <FadeIn>
          <Link to={`/programs/${FEATURED_PRO.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <MediaImage src={featuredPhoto} alt={FEATURED_PRO.name} aspect="16/9" overlay="full" />
            <div style={{ paddingTop: 24 }}>
              <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Featured · Professional Program</div>
              <h3 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 12px' }}>{FEATURED_PRO.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, lineHeight: 1.7, margin: '0 0 20px', maxWidth: 520 }}>{FEATURED_PRO.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 20 }}>
                {[
                  { k: 'Outcome', v: FEATURED_PRO.outcome },
                  { k: 'Duration', v: FEATURED_PRO.duration },
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
          <Button variant="primary" onClick={() => navigate(`/programs/${FEATURED_PRO.slug}`)}>View Program →</Button>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 20 }}>All skills programs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {allSkillsPrograms.filter(p => p.slug !== FEATURED_PRO.slug).map((program, i, arr) => {
              const photo = PROGRAM_PHOTO[program.slug] ?? DEFAULT_PROGRAM_PHOTO
              const price = Math.min(...program.pricing.map(p => p.price))
              const typeLabel = program.programType === 'CERTIFICATE' ? 'Certificate' : 'Professional'
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
                    borderBottom: i < arr.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{ width: 64, height: 48, borderRadius: 8, overflow: 'hidden', background: C.ink3 }}>
                    <MediaImage src={photo} alt="" aspect="4/3" radius={8} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: accent.text, marginBottom: 3, letterSpacing: '0.06em' }}>{typeLabel}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 2 }}>{program.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12 }}>{program.duration} · {program.outcome}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.white }}>₹{price.toLocaleString('en-IN')}</div>
                    <div style={{ color: accent.textMuted, fontSize: 11, marginTop: 2 }}>→</div>
                  </div>
                </Link>
              )
            })}
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.lineDark}` }}>
            <Button variant="secondary" onClick={() => navigate('/programs')}>Browse all programs</Button>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const navigate = useNavigate()
  const activeSection = useSectionSpy(SKILLS_NAV_ITEMS.map(i => i.id))

  return (
    <PageShell auroraTheme="professional">
      <SkillsExplorer />

      <ContextualNavBar items={SKILLS_NAV_ITEMS} themeId="professional" activeId={activeSection} />

      <SkillsPathSection />
      <WebinarsSection />
      <CertificateSection />
      <ProfessionalSection />
      <JobAssistanceSection />
      <CareerProofSection />
      <ProgramDiscoverySection />

      <CTABand
        eyebrow="Next step"
        title={<>Ready to become<br />career-ready?</>}
        lead="Start with a Professional Program for Career OS access, or join a webinar to begin."
        primary={{ label: 'Explore Professional Programs', to: '/programs' }}
        secondary={{ label: 'See Career OS', to: '/career-os' }}
        auroraTheme="professional"
      />
    </PageShell>
  )
}
