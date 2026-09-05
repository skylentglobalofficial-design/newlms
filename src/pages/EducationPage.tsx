import { useNavigate, Link } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import {
  Section, Button, Eyebrow, CTABand, T, Heading, SectionHeader, FlowStrip,
} from '../components/ui'
import { Aurora, MediaImage, ContextualNavPanel, ContextualNavBar, useSectionSpy, type ContextualNavItem } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { programs } from '../data'
import { PHOTO, PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO } from '../media'

// ─── EXAM DATA (preserved) ────────────────────────────────────────────────────

const JEE_NEET_EXAMS = [
  {
    name: 'JEE',
    full: 'Joint Entrance Examination',
    target: 'IITs · NITs · Top Engineering',
    subjects: [
      { name: 'Physics', color: '#60a5fa', topics: ['Mechanics', 'Electromagnetism', 'Optics', 'Modern Physics'] },
      { name: 'Chemistry', color: '#34d399', topics: ['Organic', 'Inorganic', 'Physical Chemistry'] },
      { name: 'Mathematics', color: '#f59e0b', topics: ['Calculus', 'Algebra', 'Coordinate Geometry', 'Trigonometry'] },
    ],
    features: ['Question Bank', 'Full mock tests', 'Performance analytics', 'Doubt support'],
  },
  {
    name: 'NEET',
    full: 'National Eligibility cum Entrance Test',
    target: 'MBBS · BDS · Allied Health',
    subjects: [
      { name: 'Biology', color: '#4ade80', topics: ['Botany', 'Zoology', 'Genetics', 'Ecology'] },
      { name: 'Chemistry', color: '#34d399', topics: ['Organic', 'Inorganic', 'Physical Chemistry'] },
      { name: 'Physics', color: '#60a5fa', topics: ['Mechanics', 'Electromagnetism', 'Optics'] },
    ],
    features: ['NCERT-aligned content', 'Topic-level practice', 'Mock tests', 'Concept clarity'],
  },
]

const CAT_SECTION = {
  name: 'CAT',
  full: 'Common Admission Test',
  target: 'IIMs · Top B-Schools',
  sections: [
    { label: 'Verbal Ability & Reading Comprehension', abbr: 'VARC', weight: '34%', color: '#a78bfa' },
    { label: 'Data Interpretation & Logical Reasoning', abbr: 'DILR', weight: '33%', color: '#f59e0b' },
    { label: 'Quantitative Aptitude', abbr: 'QA', weight: '33%', color: '#60a5fa' },
  ],
  features: ['Sectional practice', 'Speed & accuracy drills', 'Mock CATs with analysis', 'Score predictor'],
}

const OTHER_EXAMS = ['CUET', 'CLAT', 'GMAT', 'GRE', 'UPSC', 'Bank PO']

const EXAM_PROGRAMS = programs.filter(p => p.programType === 'EXAM_PREP')
const FEATURED_PROGRAM = EXAM_PROGRAMS.find(p => p.slug === 'jee-advanced-prep') ?? EXAM_PROGRAMS[0]
const SUPPORTING_PROGRAMS = EXAM_PROGRAMS.filter(p => p.slug !== FEATURED_PROGRAM?.slug)

const accent = getDomainAccent('schooling')

const EDUCATION_NAV_ITEMS: ContextualNavItem[] = [
  { id: 'schooling', label: 'Schooling', sub: 'Grades 1–12' },
  { id: 'undergraduate', label: 'Undergraduate', sub: 'Degree-aligned' },
  { id: 'postgraduate', label: 'Postgraduate', sub: 'Specialisation' },
  { id: 'competitive-exams', label: 'Competitive Exams', sub: 'JEE · NEET · CAT' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (T.navH + 16), behavior: 'smooth' })
}

// ─── HERO PROGRESSION VISUAL ──────────────────────────────────────────────────

function HeroProgressionVisual() {
  const stages = [
    { label: 'Schooling', sub: 'Grades 1–12', photo: PHOTO.classroomWarm, position: 'center 20%' },
    { label: 'Undergraduate', sub: 'Degree years', photo: PHOTO.college, position: 'center' },
    { label: 'Postgraduate', sub: 'Specialisation', photo: PHOTO.research, position: 'center 30%' },
  ]

  return (
    <div className="education-hero-visual" style={{ position: 'relative', minHeight: 420 }}>
      {stages.map((stage, i) => (
        <div
          key={stage.label}
          className={`education-hero-stage education-hero-stage-${i + 1}`}
          style={{
            position: 'absolute',
            width: i === 1 ? '58%' : '52%',
            zIndex: 3 - i,
            ...(i === 0 ? { top: 0, left: 0 } : {}),
            ...(i === 1 ? { top: '28%', right: 0 } : {}),
            ...(i === 2 ? { bottom: 0, left: '12%' } : {}),
          }}
        >
          <MediaImage
            src={stage.photo}
            alt={`${stage.label} learning environment`}
            aspect="4/3"
            overlay="bottom"
            objectPosition={stage.position}
            imgStyle={{ opacity: 0.92 }}
          />
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(5,5,5,0.55)',
              border: `1px solid ${accent.border}`,
              borderRadius: 8,
              padding: '6px 10px',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: accent.text, letterSpacing: '0.08em' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.white }}>{stage.label}</span>
          </div>
        </div>
      ))}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '8% 6%',
          border: `1px dashed ${accent.border}`,
          borderRadius: T.rCard,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </div>
  )
}

// ─── EDUCATION JOURNEY ────────────────────────────────────────────────────────

function EducationJourneySection() {
  const stages = [
    {
      num: '01',
      title: 'Schooling',
      desc: 'Foundational academic learning from primary through senior secondary.',
      anchor: 'schooling',
      photo: PHOTO.schoolBuilding,
    },
    {
      num: '02',
      title: 'Undergraduate',
      desc: 'Degree-aligned programs with projects, skills, and career direction.',
      anchor: 'undergraduate',
      photo: PHOTO.collab,
    },
    {
      num: '03',
      title: 'Postgraduate',
      desc: 'Specialisation, cases, and professional outcomes.',
      anchor: 'postgraduate',
      photo: PHOTO.university,
    },
  ]

  return (
    <Section tone="canvas" divider style={{ paddingTop: T.sectionTight }}>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Academic stages"
          title="Schooling, undergraduate, postgraduate."
          lead="Three audiences, three curriculum models. Each section below covers format, subjects, and how progress is tracked."
        />
      </FadeIn>

      <div className="education-journey" style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, position: 'relative' }}>
        <div
          aria-hidden
          className="education-journey-line"
          style={{
            position: 'absolute',
            top: 28,
            left: '16%',
            right: '16%',
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accent.border}, ${accent.border}, transparent)`,
          }}
        />
        {stages.map((stage, i) => (
          <FadeIn key={stage.anchor} delay={i * 80}>
            <button
              type="button"
              onClick={() => scrollToId(stage.anchor)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '0 20px 0 0',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
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
                    fontSize: 11,
                    color: accent.text,
                    flexShrink: 0,
                  }}
                >
                  {stage.num}
                </div>
                {i < stages.length - 1 && (
                  <span className="education-journey-arrow" style={{ color: accent.textMuted, fontSize: 14, opacity: 0.35, display: 'none' }} aria-hidden>·</span>
                )}
              </div>
              <div style={{ borderRadius: T.rCard, overflow: 'hidden', marginBottom: 18, aspectRatio: '16/10' }}>
                <img
                  src={stage.photo}
                  alt={stage.title}
                  loading="lazy"
                  className="skylent-media-img"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <h3 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 8px', fontSize: 'clamp(22px, 2.5vw, 28px)' }}>
                {stage.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 14, lineHeight: 1.65, margin: 0, maxWidth: 280 }}>
                {stage.desc}
              </p>
            </button>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}

// ─── SCHOOLING ────────────────────────────────────────────────────────────────

function SchoolingSection() {
  const navigate = useNavigate()
  const gradeBands = [
    { band: 'Primary', grades: '1–5', color: '#fbbf24', subjects: ['Mathematics', 'Science', 'Language', 'Socials'] },
    { band: 'Middle', grades: '6–8', color: '#4ade80', subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Language'] },
    { band: 'Secondary', grades: '9–10', color: '#60a5fa', subjects: ['Maths', 'Science', 'Social Studies', 'Language', 'IT'] },
    { band: 'Senior', grades: '11–12', color: accent.primary, subjects: ['Stream subjects', 'Advanced Maths', 'Electives', 'Practicals'] },
  ]

  return (
    <Section id="schooling" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(36px,6vw,72px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <MediaImage
            src={PHOTO.classroomWarm}
            alt="Students learning in an Indian classroom"
            aspect="4/3"
            overlay="full"
            objectPosition="center 25%"
          />
          <div style={{ display: 'flex', gap: 0, marginTop: 20, borderTop: `1px solid ${T.lineDark}` }}>
            {gradeBands.map(({ band, grades, color }, i) => (
              <div
                key={band}
                style={{
                  flex: 1,
                  padding: '14px 8px',
                  textAlign: 'center',
                  borderRight: i < gradeBands.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, margin: '0 auto 6px' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: C.white }}>{band}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 2 }}>Gr {grades}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <Eyebrow tone="dark">Schooling</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            Learning that builds confidence.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.8, margin: '0 0 24px', maxWidth: 480 }}>
            For school students and their parents. Programs built around the actual curriculum — from foundational concepts in primary school to board-level mastery in senior secondary.
          </p>

          <div style={{ marginBottom: 32 }}>
            <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 14 }}>Lesson rhythm</div>
            <FlowStrip
              tone="dark"
              steps={[
                { label: 'Lesson', sub: 'Concept introduction' },
                { label: 'Activity', sub: 'Guided practice' },
                { label: 'Explanation', sub: 'Concept clarity' },
                { label: 'Assessment', sub: 'Check mastery' },
              ]}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 32 }}>
            {gradeBands.map(({ band, grades, color, subjects }, i) => (
              <div
                key={band}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '14px 0',
                  borderBottom: i < gradeBands.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: `${color}18`,
                    border: `1px solid ${color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.white }}>{band}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Grade {grades}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {subjects.map(s => (
                      <span key={s} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 28, paddingTop: 20, borderTop: `1px solid ${T.lineDark}` }}>
            <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 12 }}>Learning journey</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
              {['Grade', 'Subject', 'Chapter', 'Lesson', 'Activity', 'Assessment', 'Progress'].map((s, i, arr) => (
                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span>{s}</span>
                  {i < arr.length - 1 && <span style={{ color: accent.textMuted }}>→</span>}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => navigate('/institutions')}>For Schools →</Button>
            <Button variant="secondary" onClick={() => navigate('/programs')}>Browse Programs</Button>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── UNDERGRADUATE ────────────────────────────────────────────────────────────

function UndergraduateSection() {
  const navigate = useNavigate()
  const journey = [
    { step: 'Degree', desc: 'B.Tech · B.Sc · BCA · BBA' },
    { step: 'Semester', desc: 'Aligned to university schedule' },
    { step: 'Subjects', desc: 'Core + elective modules' },
    { step: 'Skills', desc: 'Industry-relevant layers' },
    { step: 'Projects', desc: 'Real-world portfolio work' },
    { step: 'Internship', desc: 'Industry exposure' },
    { step: 'Career', desc: 'Skills + Career OS ready' },
  ]

  return (
    <Section id="undergraduate" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 'clamp(36px,6vw,72px)', alignItems: 'start' }} className="two-col education-ug-grid">
        <FadeIn>
          <Eyebrow tone="dark">Undergraduate</Eyebrow>
          <Heading tone="dark" size="md" style={{ margin: '20px 0 16px' }}>
            Academic depth. Industry direction.
          </Heading>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.8, margin: '0 0 32px', maxWidth: 480 }}>
            For college students and degree institutions. Programs that sit alongside the academic calendar — building applied skills, projects, and career readiness from the first year.
          </p>

          <div style={{ marginBottom: 32 }}>
            <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 16 }}>Program structure</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {journey.map(({ step, desc }, i) => (
                <div key={step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: i === journey.length - 1 ? accent.primary : accent.primary,
                        opacity: i === journey.length - 1 ? 1 : 0.5,
                        marginTop: 13,
                        flexShrink: 0,
                      }}
                    />
                    {i < journey.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 20, background: T.lineDark, marginTop: 3 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < journey.length - 1 ? 12 : 0, paddingTop: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: i === journey.length - 1 ? accent.text : C.white }}>
                      {step}
                    </span>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => navigate('/skills')}>Explore Skills →</Button>
            <Button variant="secondary" onClick={() => navigate('/institutions')}>For Colleges</Button>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <MediaImage
            src={PHOTO.collab}
            alt="University students in a collaborative workshop"
            aspect="4/3"
            overlay="full"
            objectPosition="center"
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginTop: 20, borderTop: `1px solid ${T.lineDark}` }}>
            {[
              { value: 'Sem-aligned', label: 'Schedule' },
              { value: 'Projects', label: 'Portfolio ready' },
              { value: 'Career OS', label: 'Path unlocked' },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                style={{
                  padding: '16px 12px',
                  textAlign: 'center',
                  borderRight: i < 2 ? `1px solid ${T.lineDark}` : 'none',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 3 }}>{value}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── POSTGRADUATE ─────────────────────────────────────────────────────────────

function PostgraduateSection() {
  const navigate = useNavigate()
  const tracks = [
    { name: 'Technology & AI', desc: 'Advanced ML, AI research, system design' },
    { name: 'Business & Strategy', desc: 'Strategic management, business cases, leadership' },
    { name: 'Data & Analytics', desc: 'Advanced analytics, business intelligence, forecasting' },
    { name: 'Research', desc: 'Academic pathways, thesis work, publication support' },
  ]

  return (
    <Section id="postgraduate" tone="canvas" divider>
      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 'clamp(36px,6vw,72px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <Eyebrow tone="dark">Postgraduate</Eyebrow>
          <h2 className="skylent-display-lg" style={{ color: C.white, margin: '20px 0 24px', lineHeight: 1.02 }}>
            Specialisation.<br />Mastery.<br />Leadership.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.8, margin: '0 0 28px', maxWidth: 420 }}>
            For advanced learners, working professionals, and researchers. Deep, case-driven programs designed around professional outcomes — not just academic completion.
          </p>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 12 }}>Program structure</div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.03em', lineHeight: 1.9, margin: '0 0 28px' }}>
            Program → Specialization → Advanced Modules → Cases → Projects → Professional Outcomes
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => navigate('/programs')}>Explore Professional Programs →</Button>
            <Button variant="secondary" onClick={() => navigate('/institutions')}>For Universities</Button>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 16 }}>Specialization tracks</div>
            {tracks.map(({ name, desc }, i) => (
              <div
                key={name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr',
                  gap: 16,
                  padding: '20px 0',
                  borderBottom: i < tracks.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                  alignItems: 'start',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: accent.text, paddingTop: 2 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.white, marginBottom: 4 }}>{name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.55 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <MediaImage
              src={PHOTO.research}
              alt="Advanced research and postgraduate study"
              aspect="21/9"
              objectPosition="center 40%"
            />
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── HOW LEARNING WORKS ───────────────────────────────────────────────────────

function HowLearningWorksSection() {
  const steps = [
    { label: 'Explore', sub: 'Browse pathways and programs' },
    { label: 'Enrol', sub: 'Join a batch or register interest' },
    { label: 'Learn', sub: 'Curriculum-aligned lessons' },
    { label: 'Practice', sub: 'Activities, tests, and mocks' },
    { label: 'Progress', sub: 'Track outcomes and analytics' },
  ]

  return (
    <Section tone="canvas" divider style={{ paddingTop: T.sectionTight, paddingBottom: T.sectionTight }}>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="How learning works"
          title="From browsing to assessed progress."
          lead="Every education pathway on Skylent follows the same academic rhythm — structured content, deliberate practice, and visible progress."
        />
        <div style={{ marginTop: 40 }}>
          <FlowStrip steps={steps} tone="dark" />
        </div>
      </FadeIn>
    </Section>
  )
}

// ─── PROGRAM DISCOVERY ────────────────────────────────────────────────────────

function ProgramDiscoverySection() {
  const navigate = useNavigate()
  if (!FEATURED_PROGRAM) return null

  const featuredPhoto = PROGRAM_PHOTO[FEATURED_PROGRAM.slug] ?? DEFAULT_PROGRAM_PHOTO
  const lowestPrice = Math.min(...FEATURED_PROGRAM.pricing.map(p => p.price))

  return (
    <Section tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Program discovery"
          title="Exam preparation, structured."
          lead="Programs built around exam patterns, subject mastery, and performance analytics — not generic course bundles."
        />
      </FadeIn>

      <div className="education-discovery" style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 'clamp(28px,4vw,48px)', alignItems: 'start' }}>
        <FadeIn>
          <div>
            <Link to={`/programs/${FEATURED_PROGRAM.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ position: 'relative' }}>
                <MediaImage
                  src={featuredPhoto}
                  alt={FEATURED_PROGRAM.name}
                  aspect="16/9"
                  overlay="full"
                />
                <div style={{ position: 'absolute', top: 16, left: 16 }}>
                  <span
                    style={{
                      background: accent.subtleStrong,
                      border: `1px solid ${accent.border}`,
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: accent.text,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Featured
                  </span>
                </div>
              </div>
              <div style={{ paddingTop: 24 }}>
                <div className="skylent-label" style={{ color: accent.text, marginBottom: 8 }}>Exam Preparation</div>
                <h3 className="skylent-display-sm" style={{ color: C.white, margin: '0 0 12px' }}>{FEATURED_PROGRAM.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, lineHeight: 1.7, margin: '0 0 20px', maxWidth: 520 }}>
                  {FEATURED_PROGRAM.desc}
                </p>
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
            <Button variant="primary" onClick={() => navigate(`/programs/${FEATURED_PROGRAM.slug}`)}>
              View Program →
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 20 }}>More programs</div>
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
                    gridTemplateColumns: '72px 1fr auto',
                    gap: 16,
                    alignItems: 'center',
                    padding: '18px 0',
                    borderBottom: i < SUPPORTING_PROGRAMS.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{ width: 72, height: 54, borderRadius: 8, overflow: 'hidden', background: C.ink3 }}>
                    <MediaImage src={photo} alt="" aspect="4/3" radius={8} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.white, marginBottom: 4 }}>{program.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{program.duration} · {program.outcome}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: C.white }}>₹{price.toLocaleString('en-IN')}</div>
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

// ─── COMPETITIVE EXAMS ────────────────────────────────────────────────────────

function CompetitiveExamsSection() {
  const navigate = useNavigate()

  return (
    <Section id="competitive-exams" tone="canvas" divider>
      <FadeIn>
        <div style={{ marginBottom: 48 }}>
          <Eyebrow tone="dark" accent>Competitive Exams</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,4vw,56px)', alignItems: 'end', marginTop: 20 }} className="two-col">
            <Heading tone="dark" size="md">Structured. Performance-first.</Heading>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 16, lineHeight: 1.78, margin: 0 }}>
              Exam preparation is not a course. It is a performance system — built around exam patterns, subject mastery, and analytics.
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40, alignItems: 'center' }}>
          <span className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginRight: 8 }}>Prep system</span>
          {['Exam', 'Subject / Section', 'Topic', 'Practice', 'Test', 'Mock', 'Analytics'].map((s, i, arr) => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
              <span>{s}</span>
              {i < arr.length - 1 && <span style={{ color: accent.textMuted }}>→</span>}
            </span>
          ))}
        </div>
      </FadeIn>

      <div style={{ marginBottom: 32 }}>
        <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 20 }}>Engineering & medical — subject-oriented</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(20px,3vw,32px)' }} className="two-col">
          {JEE_NEET_EXAMS.map((exam, ei) => (
            <FadeIn key={exam.name} delay={ei * 70}>
              <div style={{ padding: '28px 0', borderTop: `1px solid ${T.lineDark}` }}>
                <div style={{ marginBottom: 20 }}>
                  <div className="skylent-display-sm" style={{ color: C.white, margin: '0 0 4px' }}>{exam.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{exam.full}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 6 }}>{exam.target}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {exam.subjects.map(({ name, color, topics }) => (
                    <div key={name} style={{ padding: '14px 0', borderBottom: `1px solid ${T.lineDark}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white }}>{name}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {topics.map(t => (
                          <span key={t} style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12 }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {exam.features.map(f => (
                    <span key={f} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: accent.primary, opacity: 0.7 }} />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      <FadeIn delay={100}>
        <div style={{ marginBottom: 32 }}>
          <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 20 }}>MBA entrance — section-oriented</div>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'clamp(24px,4vw,48px)', alignItems: 'start' }} className="two-col-sm education-cat-grid">
            <div>
              <div className="skylent-display-md" style={{ color: C.white, margin: '0 0 4px', fontSize: 'clamp(36px,4vw,48px)' }}>CAT</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{CAT_SECTION.full}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 16 }}>{CAT_SECTION.target}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CAT_SECTION.features.map(f => (
                  <span key={f} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: accent.primary, opacity: 0.7 }} />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 20 }}>
                {CAT_SECTION.sections.map(({ abbr, weight, color }) => (
                  <div key={abbr} style={{ flex: parseFloat(weight), background: color, opacity: 0.85 }} />
                ))}
              </div>
              {CAT_SECTION.sections.map(({ label, abbr, weight, color }) => (
                <div
                  key={abbr}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr',
                    gap: 16,
                    padding: '14px 0',
                    borderBottom: `1px solid ${T.lineDark}`,
                    alignItems: 'start',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color }}>{abbr}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 2 }}>{weight}</div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.45 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={140}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingTop: 24, borderTop: `1px solid ${T.lineDark}` }}>
          <div>
            <div className="skylent-label" style={{ color: 'rgba(255,255,255,0.28)', marginBottom: 10 }}>More exams — coming soon</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {OTHER_EXAMS.map(e => (
                <span key={e} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{e}</span>
              ))}
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/institutions')}>For Coaching Institutes →</Button>
        </div>
      </FadeIn>
    </Section>
  )
}

// ─── INSTITUTION / LEARNER VALUE ──────────────────────────────────────────────

function ValueSection() {
  const navigate = useNavigate()
  const audiences = [
    {
      title: 'Learners',
      desc: 'Structured pathways from schooling through postgraduate — with clear curriculum models, assessments, and progress visibility at every stage.',
      points: ['Curriculum-aligned content', 'Activities and assessments', 'Performance tracking', 'Path to Skills and Career OS'],
    },
    {
      title: 'Parents',
      desc: 'Visibility into what your child is learning, how they are progressing, and what comes next in their academic journey.',
      points: ['Progress and assessment visibility', 'Grade-to-grade continuity', 'Clear learning journey', 'Connection to future pathways'],
    },
    {
      title: 'Institutions',
      desc: 'Schools, colleges, universities, and coaching institutes — one platform for academic delivery, assessment, and learner management.',
      points: ['Schooling workflow', 'Degree-aligned programs', 'Exam prep infrastructure', 'Institution dashboards'],
    },
  ]

  return (
    <Section tone="canvas" divider>
      <FadeIn>
        <SectionHeader
          tone="dark"
          eyebrow="Built for every stakeholder"
          title="Learners, parents, and institutions."
          lead="Schools, parents, and institutions each need different views of the same programs — progress, assessments, and next steps."
        />
      </FadeIn>

      <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {audiences.map(({ title, desc, points }, i) => (
          <FadeIn key={title} delay={i * 60}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr',
                gap: 'clamp(24px,4vw,48px)',
                padding: '32px 0',
                borderBottom: i < audiences.length - 1 ? `1px solid ${T.lineDark}` : 'none',
                alignItems: 'start',
              }}
              className="education-value-row"
            >
              <div>
                <h3 className="skylent-display-sm" style={{ color: C.white, margin: 0, fontSize: 'clamp(22px, 2.5vw, 28px)' }}>{title}</h3>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 15, lineHeight: 1.7, margin: '0 0 16px', maxWidth: 560 }}>{desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
                  {points.map(p => (
                    <span key={p} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: accent.primary, flexShrink: 0 }} />
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={120}>
        <div style={{ marginTop: 48, paddingTop: 40, borderTop: `1px solid ${T.lineDark}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }} className="two-col">
            <div>
              <Eyebrow tone="dark">After education</Eyebrow>
              <Heading tone="dark" size="sm" style={{ margin: '18px 0 14px' }}>
                Skills and Career OS come next.
              </Heading>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 15, lineHeight: 1.75, margin: '0 0 24px', maxWidth: 440 }}>
                When academic work is done, learners move into credentialed skills programs. Professional Programs open Career OS — profile, jobs, and applications.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button variant="primary" onClick={() => navigate('/skills')}>Explore Skills</Button>
                <Button variant="secondary" onClick={() => navigate('/career-os')}>Explore Career OS</Button>
              </div>
            </div>
            <div>
              {[
                { name: 'Education', desc: 'Academic foundations across all levels', to: '/education', current: true },
                { name: 'Skills', desc: 'Practical, credentialed upskilling', to: '/skills' },
                { name: 'Career OS', desc: 'Interview prep, jobs, placement support', to: '/career-os' },
              ].map(({ name, desc, to, current }, i) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => !current && navigate(to)}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '16px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: `1px solid ${T.lineDark}`,
                    cursor: current ? 'default' : 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: current ? accent.primary : 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: current ? accent.text : C.white }}>{name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{desc}</div>
                  </div>
                  {!current && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>→</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>
    </Section>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function EducationPage() {
  const navigate = useNavigate()
  const activeSection = useSectionSpy(EDUCATION_NAV_ITEMS.map(i => i.id))

  return (
    <PageShell auroraTheme="schooling">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 24}px ${T.gutter} ${T.sectionTight}` }}>
        <Aurora themeId="schooling" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px,5vw,64px)', alignItems: 'start' }} className="two-col skylent-page-hero">
            <FadeIn>
              <Eyebrow tone="dark" accent>Education</Eyebrow>
              <h1 className="skylent-display-lg" style={{ color: C.white, margin: '20px 0 16px', maxWidth: 640 }}>
                The academic products<br />on Skylent.
              </h1>
              <p className="skylent-body-lg" style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 520, margin: '0 0 28px' }}>
                Schooling, undergraduate, postgraduate, and competitive exams are different audiences and different curriculum models. Explore each on its own terms.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button variant="primary" size="lg" onClick={() => navigate('/programs')}>Explore Programs</Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/institutions')}>For Institutions</Button>
              </div>
            </FadeIn>
            <FadeIn delay={80}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ContextualNavPanel
                  items={EDUCATION_NAV_ITEMS}
                  themeId="schooling"
                  title="Education"
                  activeId={activeSection}
                />
                <HeroProgressionVisual />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <ContextualNavBar items={EDUCATION_NAV_ITEMS} themeId="schooling" activeId={activeSection} />

      <EducationJourneySection />
      <SchoolingSection />
      <UndergraduateSection />
      <PostgraduateSection />
      <HowLearningWorksSection />
      <ProgramDiscoverySection />
      <CompetitiveExamsSection />
      <ValueSection />

      <CTABand
        eyebrow="Get started"
        title={<>From foundation<br />to employability.</>}
        primary={{ label: 'Explore Programs', to: '/programs' }}
        secondary={{ label: 'Partner With Us', to: '/institutions' }}
        auroraTheme="schooling"
      />
    </PageShell>
  )
}
