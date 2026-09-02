import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, PageHero, Button, Eyebrow, CTABand, T } from '../components/ui'

// ─── PHOTOS ───────────────────────────────────────────────────────────────────
const PHOTOS = {
  schooling: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&h=760&fit=crop&auto=format',
  schoolingAlt: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&h=460&fit=crop&auto=format',
  undergraduate: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&h=760&fit=crop&auto=format',
  undergraduate2: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=460&fit=crop&auto=format',
  postgraduate: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=460&fit=crop&auto=format',
  postgraduate2: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=460&fit=crop&auto=format',
  examPrep: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=460&fit=crop&auto=format',
}

// ─── EXAM DATA ────────────────────────────────────────────────────────────────
const JEE_NEET_EXAMS = [
  {
    name: 'JEE',
    full: 'Joint Entrance Examination',
    target: 'IITs · NITs · Top Engineering',
    type: 'subject-oriented',
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
    type: 'subject-oriented',
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
  type: 'section-oriented',
  sections: [
    { label: 'Verbal Ability & Reading Comprehension', abbr: 'VARC', weight: '34%', color: '#a78bfa' },
    { label: 'Data Interpretation & Logical Reasoning', abbr: 'DILR', weight: '33%', color: '#f59e0b' },
    { label: 'Quantitative Aptitude', abbr: 'QA', weight: '33%', color: '#60a5fa' },
  ],
  features: ['Sectional practice', 'Speed & accuracy drills', 'Mock CATs with analysis', 'Score predictor'],
}

const OTHER_EXAMS = ['CUET', 'CLAT', 'GMAT', 'GRE', 'UPSC', 'Bank PO']

// ─── SCHOOLING SECTION ───────────────────────────────────────────────────────

function SchoolingSection() {
  const navigate = useNavigate()
  const gradeBands = [
    { band: 'Primary', grades: '1–5', color: '#fbbf24', subjects: ['Mathematics', 'Science', 'Language', 'Socials'] },
    { band: 'Middle', grades: '6–8', color: '#4ade80', subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Language'] },
    { band: 'Secondary', grades: '9–10', color: '#60a5fa', subjects: ['Maths', 'Science', 'Social Studies', 'Language', 'IT'] },
    { band: 'Senior', grades: '11–12', color: C.orange, subjects: ['Stream subjects', 'Advanced Maths', 'Electives', 'Practicals'] },
  ]

  return (
    <Section id="schooling" bg={C.warmWhite}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,80px)', alignItems: 'start' }} className="two-col">
        {/* Left: photo + grade cards */}
        <FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Main photo */}
            <div style={{ borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '4/3', background: '#fef3c7' }}>
              <img src={PHOTOS.schooling} alt="Students learning in a classroom" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            {/* Grade band cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {gradeBands.map(({ band, grades, color }) => (
                <div key={band} style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, margin: '0 auto 6px' }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{band}</div>
                  <div style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Gr {grades}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Right: content */}
        <FadeIn delay={100}>
          <div>
            <Eyebrow>Schooling</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.6vw,44px)', fontWeight: 600, letterSpacing: '-0.03em', color: C.ink, margin: '22px 0 16px', lineHeight: 1.1 }}>
              Learning that builds<br />confidence.
            </h2>
            <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.8, margin: '0 0 32px', maxWidth: 460 }}>
              For school students and their parents. Programs built around the actual curriculum — from foundational concepts in primary school to board-level mastery in senior secondary.
            </p>

            {/* Grade bands detail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 32 }}>
              {gradeBands.map(({ band, grades, color, subjects }, i) => (
                <div key={band} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < gradeBands.length - 1 ? `1px solid ${T.lineLight}` : 'none', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: C.ink }}>{band}</span>
                      <span style={{ color: C.slate, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Grade {grades}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {subjects.map(s => (
                        <span key={s} style={{ background: C.sand, borderRadius: 4, padding: '2px 8px', color: C.slate, fontSize: 11 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Curriculum model */}
            <div style={{ background: C.sand, borderRadius: 10, padding: '12px 16px', marginBottom: 28, fontFamily: 'var(--font-mono)', fontSize: 12, color: C.slate, letterSpacing: '0.03em' }}>
              Grade → Subject → Chapter → Lesson → Activity → Assessment → Progress
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="dark" onClick={() => navigate('/institutions')}>For Schools →</Button>
              <Button variant="ghost" onClick={() => navigate('/programs')}>Browse Programs</Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── UNDERGRADUATE SECTION ────────────────────────────────────────────────────

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
    <Section id="undergraduate" bg={C.ink}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,80px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <div>
            <Eyebrow tone="dark">Undergraduate</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.6vw,44px)', fontWeight: 600, letterSpacing: '-0.03em', color: C.white, margin: '22px 0 16px', lineHeight: 1.1 }}>
              Academic depth.<br />Industry direction.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 16, lineHeight: 1.8, margin: '0 0 32px', maxWidth: 460 }}>
              For college students and degree institutions. Programs that sit alongside the academic calendar — building applied skills, projects, and career readiness from the first year.
            </p>

            {/* Journey flow — horizontal */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 16 }}>PROGRAM STRUCTURE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {journey.map(({ step, desc }, i) => (
                  <div key={step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {/* Connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === journey.length - 1 ? C.orange : 'rgba(255,255,255,0.28)', border: `1px solid ${i === journey.length - 1 ? C.orange : 'rgba(255,255,255,0.18)'}`, marginTop: 13, flexShrink: 0, zIndex: 1 }} />
                      {i < journey.length - 1 && (
                        <div style={{ width: 1, flex: 1, minHeight: 20, background: 'rgba(255,255,255,0.1)', marginTop: 3 }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < journey.length - 1 ? 12 : 0, paddingTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: i === journey.length - 1 ? C.orange : C.white }}>{step}</span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => navigate('/skills')}>Explore Skills →</Button>
              <Button variant="secondary" onClick={() => navigate('/institutions')}>For Colleges</Button>
            </div>
          </div>
        </FadeIn>

        {/* Right: photos */}
        <FadeIn delay={100}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '4/3', background: '#1a2330' }}>
              <img src={PHOTOS.undergraduate} alt="University students in a collaborative workshop" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.88 }} />
            </div>
            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { value: 'Sem-aligned', label: 'Schedule' },
                { value: 'Projects', label: 'Portfolio ready' },
                { value: 'Career OS', label: 'Path unlocked' },
              ].map(({ value, label }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 3 }}>{value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── POSTGRADUATE SECTION ─────────────────────────────────────────────────────

function PostgraduateSection() {
  const navigate = useNavigate()
  const tracks = [
    { name: 'Technology & AI', desc: 'Advanced ML, AI research, system design' },
    { name: 'Business & Strategy', desc: 'Strategic management, business cases, leadership' },
    { name: 'Data & Analytics', desc: 'Advanced analytics, business intelligence, forecasting' },
    { name: 'Research', desc: 'Academic pathways, thesis work, publication support' },
  ]

  return (
    <Section id="postgraduate" bg={C.sand}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,80px)', alignItems: 'start' }} className="two-col">
        {/* Left: photo */}
        <FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ borderRadius: T.rCard, overflow: 'hidden', aspectRatio: '4/3', background: C.warmWhite }}>
              <img src={PHOTOS.postgraduate2} alt="Professional working on advanced coursework" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            {/* Specialization chips */}
            <div style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, padding: '18px 20px' }}>
              <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>PROGRAM STRUCTURE</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: C.slate, letterSpacing: '0.03em', lineHeight: 2 }}>
                Program → Specialization → Advanced Modules → Cases → Projects → Professional Outcomes
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Right: content */}
        <FadeIn delay={100}>
          <div>
            <Eyebrow>Postgraduate</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.6vw,44px)', fontWeight: 600, letterSpacing: '-0.03em', color: C.ink, margin: '22px 0 16px', lineHeight: 1.1 }}>
              Specialisation.<br />Mastery. Leadership.
            </h2>
            <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.8, margin: '0 0 28px', maxWidth: 460 }}>
              For advanced learners, working professionals, and researchers. Deep, case-driven programs designed around professional outcomes — not just academic completion.
            </p>

            {/* Specialization tracks */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>SPECIALIZATION TRACKS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tracks.map(({ name, desc }) => (
                  <div key={name} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '13px 16px', background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.ink, flexShrink: 0, marginTop: 6, opacity: 0.4 }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{name}</div>
                      <div style={{ color: C.slate, fontSize: 12.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="dark" onClick={() => navigate('/programs')}>Explore Professional Programs →</Button>
              <Button variant="ghost" onClick={() => navigate('/institutions')}>For Universities</Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  )
}

// ─── COMPETITIVE EXAMS SECTION ────────────────────────────────────────────────

function CompetitiveExamsSection() {
  const navigate = useNavigate()

  return (
    <Section id="competitive-exams" bg={C.ink}>
      <FadeIn>
        <div style={{ marginBottom: 56 }}>
          <Eyebrow tone="dark" accent>Competitive Exams</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,4vw,56px)', alignItems: 'end', marginTop: 20 }} className="two-col">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.6vw,44px)', fontWeight: 600, letterSpacing: '-0.03em', color: C.white, margin: 0, lineHeight: 1.1 }}>
              Structured.<br />Performance-first.
            </h2>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 16, lineHeight: 1.78, margin: '0 0 16px' }}>
                Exam preparation is not a course. It is a performance system — built around exam patterns, subject mastery, and analytics.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Question Banks', 'Mock Tests', 'Performance Analytics', 'Doubt Support'].map(f => (
                  <span key={f} style={{ background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.22)', borderRadius: 6, padding: '4px 10px', color: C.orange, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* JEE + NEET: subject-oriented layout */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>ENGINEERING & MEDICAL — SUBJECT-ORIENTED</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="programs-grid">
          {JEE_NEET_EXAMS.map((exam, ei) => (
            <FadeIn key={exam.name} delay={ei * 70}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: T.rCard, padding: '26px 28px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: C.white, letterSpacing: '-0.03em', lineHeight: 1 }}>{exam.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{exam.full}</div>
                  </div>
                  <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 6, padding: '4px 10px', flexShrink: 0 }}>
                    <span style={{ color: '#4ade80', fontSize: 10, fontFamily: 'var(--font-mono)' }}>ACTIVE</span>
                  </div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 20 }}>{exam.target}</div>

                {/* Subject breakdown — visual blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {exam.subjects.map(({ name, color, topics }) => (
                    <div key={name} style={{ background: `${color}0D`, border: `1px solid ${color}28`, borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: C.white }}>{name}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {topics.map(t => (
                          <span key={t} style={{ background: `${color}14`, borderRadius: 4, padding: '2px 8px', color: `${color}CC`, fontSize: 11 }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {exam.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.orange, opacity: 0.7 }} />
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* CAT: section-oriented layout — different visual treatment */}
      <FadeIn delay={140}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>MBA ENTRANCE — SECTION-ORIENTED</div>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: T.rCard, padding: '28px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'clamp(24px,4vw,48px)', alignItems: 'start' }} className="two-col-sm">
              {/* CAT identity */}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: C.white, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>CAT</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{CAT_SECTION.full}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 16 }}>{CAT_SECTION.target}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CAT_SECTION.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.orange, opacity: 0.7 }} />
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section breakdown — progress bar style */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>SECTION BREAKDOWN</div>
                {/* Weight bar */}
                <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 18 }}>
                  {CAT_SECTION.sections.map(({ abbr, weight, color }) => (
                    <div key={abbr} style={{ flex: parseFloat(weight), background: color }} />
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {CAT_SECTION.sections.map(({ label, abbr, weight, color }) => (
                    <div key={abbr} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 14px', background: `${color}0D`, border: `1px solid ${color}24`, borderRadius: 10 }}>
                      <div style={{ flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color }}>
                          {abbr}
                        </div>
                        <div style={{ color: `${color}88`, fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 2 }}>{weight}</div>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.45, paddingTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Other exams */}
      <FadeIn delay={200}>
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: T.rCard, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>MORE EXAMS — COMING SOON</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {OTHER_EXAMS.map(e => (
                <span key={e} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{e}</span>
              ))}
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/institutions')}>For Coaching Institutes →</Button>
        </div>
      </FadeIn>
    </Section>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function EducationPage() {
  const navigate = useNavigate()

  return (
    <PageShell>
      <PageHero
        eyebrow="Education"
        title={<>Build the foundation.<br /><span style={{ color: C.orange }}>Shape the future.</span></>}
        lead="Four distinct learning pathways — schooling, undergraduate, postgraduate, and competitive exam preparation. Each built for a different audience, ambition, and outcome."
        actions={<>
          <Button variant="primary" size="lg" onClick={() => navigate('/skills')}>Continue to Skills →</Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/institutions')}>For Institutions</Button>
        </>}
      />

      <SchoolingSection />
      <UndergraduateSection />
      <PostgraduateSection />
      <CompetitiveExamsSection />

      {/* Journey connection */}
      <Section bg={C.warmWhite}>
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }} className="two-col">
            <div>
              <Eyebrow>One journey</Eyebrow>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(26px,3.2vw,40px)', letterSpacing: '-0.025em', color: C.ink, margin: '20px 0 16px', lineHeight: 1.1 }}>
                Education is only the beginning.
              </h2>
              <p style={{ color: C.slate, fontSize: 16, lineHeight: 1.78, margin: '0 0 28px', maxWidth: 440 }}>
                Every Education pathway connects into Skills and Career OS — one continuous ecosystem with no gap between learning and employment.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button variant="dark" size="lg" onClick={() => navigate('/skills')}>Explore Skills →</Button>
                <Button variant="ghost" size="lg" onClick={() => navigate('/career-os')}>Explore Career OS</Button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { name: 'Education', desc: 'Academic foundations across all levels', to: '/education' },
                { name: 'Skills', desc: 'Practical, credentialed upskilling', to: '/skills', accent: true },
                { name: 'Career OS', desc: 'Interview prep, jobs, placement support', to: '/career-os' },
              ].map(({ name, desc, to, accent }, i) => (
                <div
                  key={name}
                  onClick={() => navigate(to)}
                  style={{ display: 'flex', gap: 16, padding: '18px 0', borderBottom: `1px solid ${T.lineLight}`, cursor: 'pointer', transition: 'opacity 0.15s', alignItems: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.72')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent ? C.orange : C.ink, opacity: accent ? 1 : 0.3, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: C.ink }}>{name}</div>
                    <div style={{ color: C.slate, fontSize: 13, marginTop: 2 }}>{desc}</div>
                  </div>
                  <span style={{ color: C.slate, fontSize: 16, opacity: 0.4 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </Section>

      <CTABand
        eyebrow="Get started"
        title={<>From foundation<br />to employability.</>}
        primary={{ label: 'Explore Programs', to: '/programs' }}
        secondary={{ label: 'Partner With Us', to: '/institutions' }}
      />
    </PageShell>
  )
}
