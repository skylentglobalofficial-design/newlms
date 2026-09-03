import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, Button, Eyebrow, CTABand, T } from '../components/ui'
import { PremiumHero, PathMicroVisual } from '../components/premium'
import { VS } from '../lib/visualSystem'

// ─── EXAM DATA ────────────────────────────────────────────────────────────────
const JEE_NEET_EXAMS = [
  {
    name: 'JEE',
    full: 'Joint Entrance Examination',
    target: 'Engineering colleges · JEE aspirants',
    type: 'subject-oriented',
    programSlug: 'jee-advanced-prep',
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
    programSlug: 'neet-prep',
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
  programSlug: 'cat-prep',
  sections: [
    { label: 'Verbal Ability & Reading Comprehension', abbr: 'VARC', weight: '34%', color: '#a78bfa' },
    { label: 'Data Interpretation & Logical Reasoning', abbr: 'DILR', weight: '33%', color: '#f59e0b' },
    { label: 'Quantitative Aptitude', abbr: 'QA', weight: '33%', color: '#60a5fa' },
  ],
  features: ['Sectional practice', 'Speed & accuracy drills', 'Mock CATs with analysis', 'Performance breakdown'],
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
    <Section id="schooling" bg={VS.surface}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,80px)', alignItems: 'start' }} className="two-col">
        {/* Left: photo + grade cards */}
        <FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ borderRadius: T.rCard, overflow: 'hidden', background: VS.surfaceElevated, border: '1px solid var(--accent-border)', padding: '24px 22px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 14 }}>SCHOOLING JOURNEY</div>
              <PathMicroVisual variant="schooling" />
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {gradeBands.map(({ band, color }) => (
                  <div key={band} style={{ background: VS.surfaceElevated, borderRadius: 8, padding: '10px 8px', textAlign: 'center', border: '1px solid var(--hairline)', borderTop: `2px solid ${color}` }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{band}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Grade band cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {gradeBands.map(({ band, grades, color }) => (
                <div key={band} style={{ background: VS.surfaceElevated, border: `1px solid color-mix(in srgb, ${color} 35%, var(--hairline))`, borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, margin: '0 auto 6px' }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{band}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Gr {grades}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Right: content */}
        <FadeIn delay={100}>
          <div>
            <Eyebrow tone="dark">Schooling</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.6vw,44px)', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: '22px 0 16px', lineHeight: 1.1 }}>
              Learning that builds<br />confidence.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8, margin: '0 0 32px', maxWidth: 460 }}>
              For school students and their parents. Programs built around the actual curriculum — from foundational concepts in primary school to board-level mastery in senior secondary.
            </p>

            {/* Grade bands detail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 32 }}>
              {gradeBands.map(({ band, grades, color, subjects }, i) => (
                <div key={band} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < gradeBands.length - 1 ? '1px solid var(--hairline)' : 'none', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{band}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>Grade {grades}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {subjects.map(s => (
                        <span key={s} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--hairline)', borderRadius: 4, padding: '2px 8px', color: 'var(--text-secondary)', fontSize: 11 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Audience + journey */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }} className="two-col-sm">
              {[
                { t: 'Parents', d: 'See progress, assessments, and what happens after class.' },
                { t: 'Teachers', d: 'Lessons, activities, and assessments in one academic flow.' },
              ].map(x => (
                <div key={x.t} style={{ background: VS.surfaceElevated, border: '1px solid var(--hairline)', borderRadius: 10, padding: '14px 14px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{x.t}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12.5, lineHeight: 1.5 }}>{x.d}</div>
                </div>
              ))}
            </div>

            {/* Curriculum model */}
            <div style={{ background: VS.surfaceElevated, border: '1px solid var(--hairline)', borderRadius: 10, padding: '14px 16px', marginBottom: 28 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 8 }}>LEARNING JOURNEY</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>
                {['Grade', 'Subject', 'Chapter', 'Lesson', 'Activity', 'Assessment', 'Progress'].map((s, i, arr) => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--hairline)', borderRadius: 6, padding: '4px 8px' }}>{s}</span>
                    {i < arr.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => navigate('/education/schooling')}>Explore Schooling →</Button>
              <Button variant="secondary" onClick={() => navigate('/institutions')}>For Schools →</Button>
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
    <Section id="undergraduate" bg={VS.pageBg}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,80px)', alignItems: 'start' }} className="two-col">
        <FadeIn>
          <div>
            <Eyebrow tone="dark">Undergraduate</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.6vw,44px)', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: '22px 0 16px', lineHeight: 1.1 }}>
              Academic depth.<br />Industry direction.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8, margin: '0 0 32px', maxWidth: 460 }}>
              For college students and degree institutions. Programs that sit alongside the academic calendar — building applied skills, projects, and career readiness from the first year.
            </p>

            {/* Journey flow — horizontal */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 16 }}>PROGRAM STRUCTURE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {journey.map(({ step, desc }, i) => (
                  <div key={step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {/* Connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === journey.length - 1 ? C.orange : 'rgba(255,255,255,0.28)', border: `1px solid ${i === journey.length - 1 ? C.orange : 'rgba(255,255,255,0.18)'}`, marginTop: 13, flexShrink: 0, zIndex: 1 }} />
                      {i < journey.length - 1 && (
                        <div style={{ width: 1, flex: 1, minHeight: 20, background: 'var(--hairline)', marginTop: 3 }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < journey.length - 1 ? 12 : 0, paddingTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: i === journey.length - 1 ? C.orange : 'var(--text-primary)' }}>{step}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => navigate('/education/undergraduate')}>Explore Undergraduate →</Button>
              <Button variant="secondary" onClick={() => navigate('/institutions')}>For Colleges</Button>
            </div>
          </div>
        </FadeIn>

        {/* Right: photos */}
        <FadeIn delay={100}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ borderRadius: T.rCard, background: VS.surfaceElevated, border: '1px solid var(--hairline)', padding: '22px 20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 14 }}>DEGREE ECOSYSTEM</div>
              <PathMicroVisual variant="ug" />
            </div>
            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { value: 'Sem-aligned', label: 'Schedule' },
                { value: 'Projects', label: 'Portfolio ready' },
                { value: 'Career ready', label: 'Data-ready path' },
              ].map(({ value, label }) => (
                <div key={label} style={{ background: VS.surfaceElevated, border: '1px solid var(--hairline)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{label}</div>
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
    <Section id="postgraduate" bg={VS.surface}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,80px)', alignItems: 'start' }} className="two-col">
        {/* Left: photo */}
        <FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ borderRadius: T.rCard, background: VS.surfaceElevated, border: '1px solid var(--hairline)', padding: '22px 20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 14 }}>PG STRUCTURE</div>
              <PathMicroVisual variant="pg" />
            </div>
            {/* Specialization chips */}
            <div style={{ background: VS.surfaceElevated, border: '1px solid var(--hairline)', borderRadius: T.rCard, padding: '18px 20px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>PROGRAM STRUCTURE</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.03em', lineHeight: 2 }}>
                Program → Specialization → Advanced Modules → Cases → Projects → Professional Outcomes
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Right: content */}
        <FadeIn delay={100}>
          <div>
            <Eyebrow tone="dark">Postgraduate</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.6vw,44px)', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: '22px 0 16px', lineHeight: 1.1 }}>
              Specialisation.<br />Mastery. Leadership.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8, margin: '0 0 28px', maxWidth: 460 }}>
              For advanced learners, working professionals, and researchers. Deep, case-driven programs designed around professional outcomes — not just academic completion.
            </p>

            {/* Specialization tracks */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>SPECIALIZATION TRACKS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tracks.map(({ name, desc }) => (
                  <div key={name} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '13px 16px', background: VS.surfaceElevated, border: '1px solid var(--hairline)', borderRadius: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0, marginTop: 6, opacity: 0.4 }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 12.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => navigate('/education/postgraduate')}>Explore Postgraduate →</Button>
              <Button variant="secondary" onClick={() => navigate('/institutions')}>For Universities</Button>
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
    <Section id="competitive-exams" bg={VS.pageBg}>
      <FadeIn>
        <div style={{ marginBottom: 56 }}>
          <Eyebrow tone="dark" accent>Competitive Exams</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,4vw,56px)', alignItems: 'end', marginTop: 20 }} className="two-col">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,3.6vw,44px)', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>
              Structured.<br />Performance-first.
            </h2>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.78, margin: '0 0 16px' }}>
                Exam preparation is not a course. It is a performance system — built around exam patterns, subject mastery, and analytics.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Batches', 'Topics', 'Practice', 'Mock tests', 'Analytics', 'Doubt support'].map(f => (
                  <span key={f} style={{ background: 'rgba(243,107,33,0.1)', border: '1px solid rgba(243,107,33,0.22)', borderRadius: 6, padding: '4px 10px', color: C.orange, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 36, alignItems: 'center' }}>
          <Button variant="primary" onClick={() => navigate('/education/exams')}>Explore Exams →</Button>
        </div>
      </FadeIn>

      <FadeIn>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36, alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)', marginRight: 8 }}>PREP SYSTEM</span>
          {['Exam', 'Subject / Section', 'Topic', 'Practice', 'Test', 'Mock', 'Analytics'].map((s, i, arr) => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontSize: 12 }}>
              <span style={{ background: VS.surfaceElevated, border: '1px solid var(--hairline)', borderRadius: 6, padding: '5px 10px' }}>{s}</span>
              {i < arr.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
            </span>
          ))}
        </div>
      </FadeIn>

      {/* JEE + NEET: subject-oriented layout */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>ENGINEERING & MEDICAL — SUBJECT-ORIENTED</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="programs-grid">
          {JEE_NEET_EXAMS.map((exam, ei) => (
            <FadeIn key={exam.name} delay={ei * 70}>
              <div style={{ background: VS.surfaceElevated, border: '1px solid var(--hairline)', borderRadius: T.rCard, padding: '26px 28px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{exam.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{exam.full}</div>
                  </div>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 20 }}>{exam.target}</div>

                {/* Subject breakdown — visual blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {exam.subjects.map(({ name, color, topics }) => (
                    <div key={name} style={{ background: `${color}0D`, border: `1px solid ${color}28`, borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{name}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {topics.map(t => (
                          <span key={t} style={{ background: `${color}14`, borderRadius: 4, padding: '2px 8px', color: `${color}CC`, fontSize: 11 }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                  {exam.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.orange, opacity: 0.7 }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" onClick={() => navigate(`/programs/${exam.programSlug}`)}>View preparation →</Button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* CAT: section-oriented layout — different visual treatment */}
      <FadeIn delay={140}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>MBA ENTRANCE — SECTION-ORIENTED</div>
          <div style={{ background: VS.surfaceElevated, border: '1px solid var(--hairline)', borderRadius: T.rCard, padding: '28px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'clamp(24px,4vw,48px)', alignItems: 'start' }} className="two-col-sm">
              {/* CAT identity */}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>CAT</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{CAT_SECTION.full}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 16 }}>{CAT_SECTION.target}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                  {CAT_SECTION.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.orange, opacity: 0.7 }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" onClick={() => navigate(`/programs/${CAT_SECTION.programSlug}`)}>View CAT preparation →</Button>
              </div>

              {/* Section breakdown — progress bar style */}
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 14 }}>SECTION BREAKDOWN</div>
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
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.45, paddingTop: 2 }}>{label}</div>
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
        <div style={{ background: VS.surfaceElevated, border: '1px solid var(--hairline)', borderRadius: T.rCard, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>MORE EXAMS — COMING SOON</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {OTHER_EXAMS.map(e => (
                <span key={e} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--hairline)', borderRadius: 6, padding: '4px 10px', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{e}</span>
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
      <PremiumHero
        eyebrow="Education hub"
        title={<>Four gateways.<br /><span style={{ color: C.orange }}>Four anatomies.</span></>}
        lead="Schooling is warmer. Undergraduate is structured. Postgraduate is specialized. Exams are performance-oriented — each section uses a different information model."
        actions={<>
          <Button variant="primary" size="lg" onClick={() => navigate('/programs')}>Browse Programs</Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/education/schooling')}>Enter Schooling</Button>
        </>}
        visual={
          <div style={{ display: 'grid', gap: 10 }}>
            <PathMicroVisual variant="schooling" />
            <PathMicroVisual variant="ug" />
            <PathMicroVisual variant="exams" />
          </div>
        }
      />

      <SchoolingSection />
      <UndergraduateSection />
      <PostgraduateSection />
      <CompetitiveExamsSection />

      {/* Journey connection */}
      <Section bg={VS.surface}>
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,64px)', alignItems: 'center' }} className="two-col">
            <div>
              <Eyebrow tone="dark">One journey</Eyebrow>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(26px,3.2vw,40px)', letterSpacing: '-0.025em', color: 'var(--text-primary)', margin: '20px 0 16px', lineHeight: 1.1 }}>
                Education is only the beginning.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.78, margin: '0 0 28px', maxWidth: 440 }}>
                Every Education pathway connects into Skills and Career OS — one continuous ecosystem with no gap between learning and employment.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button variant="primary" size="lg" onClick={() => navigate('/skills')}>Explore Skills →</Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/career-os')}>Explore Career OS</Button>
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
                  style={{ display: 'flex', gap: 16, padding: '18px 0', borderBottom: '1px solid var(--hairline)', cursor: 'pointer', transition: 'opacity 0.15s', alignItems: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.72')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent ? C.orange : 'var(--text-muted)', opacity: accent ? 1 : 0.3, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{desc}</div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 16, opacity: 0.4 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </Section>

      <CTABand
        eyebrow="Next step"
        title={<>Enter the pathway<br />that matches you.</>}
        lead="One action — explore programs filtered by your education context."
        primary={{ label: 'Explore Programs', to: '/programs' }}
      />
    </PageShell>
  )
}
