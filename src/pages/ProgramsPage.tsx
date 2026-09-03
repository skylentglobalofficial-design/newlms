import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, T, PageHero } from '../components/ui'
import { programs } from '../data'
import type { Program, ProgramType } from '../data'
import { PROGRAM_PHOTO, DEFAULT_PROGRAM_PHOTO, PHOTO } from '../media'

const TYPE_LABELS: Record<ProgramType, string> = {
  PROFESSIONAL: 'Professional Program',
  CERTIFICATE: 'Certificate Program',
  WEBINAR: 'Webinar',
  EXAM_PREP: 'Exam Preparation',
  SCHOOLING: 'Schooling',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate',
}

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  open: { text: 'Enrolling now', color: '#3d8b5a' },
  waitlist: { text: 'Waitlist', color: '#b45309' },
  coming_soon: { text: 'Coming soon', color: C.slate },
}

type Pillar = 'All' | 'Education' | 'Skills' | 'Exams' | 'Career'

function ProgramCard({ program }: { program: Program }) {
  const navigate = useNavigate()
  const lowestPrice = Math.min(...program.pricing.map(p => p.price))
  const photo = PROGRAM_PHOTO[program.slug] ?? DEFAULT_PROGRAM_PHOTO
  const status = STATUS_LABEL[program.enrollmentStatus ?? 'open']

  return (
    <article
      onClick={() => navigate(`/programs/${program.slug}`)}
      style={{ background: C.white, border: `1px solid ${T.lineLight}`, borderRadius: T.rCard, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', height: '100%' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(11,13,15,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(11,13,15,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.lineLight; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ height: 168, position: 'relative', overflow: 'hidden', background: C.sand }}>
        <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ background: C.ink, color: C.white, borderRadius: 5, padding: '4px 9px', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{TYPE_LABELS[program.programType].toUpperCase()}</span>
        </div>
      </div>
      <div style={{ padding: '20px 20px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: status.color, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{status.text}</span>
          {program.careerSupport && <span style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)' }}>CAREER OS</span>}
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: C.ink, margin: '0 0 8px', lineHeight: 1.25 }}>{program.name}</h3>
        <p style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.6, margin: '0 0 16px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{program.desc}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 0', borderTop: `1px solid ${T.lineLight}`, borderBottom: `1px solid ${T.lineLight}`, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: C.slate, fontFamily: 'var(--font-mono)' }}>DURATION</div>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{program.duration}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.slate, fontFamily: 'var(--font-mono)' }}>MODE</div>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{program.format}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.slate, fontFamily: 'var(--font-mono)' }}>LEVEL</div>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{program.level}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: C.slate, fontFamily: 'var(--font-mono)' }}>STARTS</div>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{program.upcomingBatch}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: C.ink }}>₹{lowestPrice.toLocaleString('en-IN')}</div>
          <span style={{ color: C.orange, fontSize: 13, fontWeight: 600 }}>View Program →</span>
        </div>
      </div>
    </article>
  )
}

export default function ProgramsPage() {
  const navigate = useNavigate()
  const [pillar, setPillar] = useState<Pillar>('All')
  const [type, setType] = useState<'All' | ProgramType>('All')
  const [level, setLevel] = useState('All')
  const [mode, setMode] = useState('All')

  const levels = useMemo(() => ['All', ...Array.from(new Set(programs.map(p => p.level)))], [])
  const modes = useMemo(() => ['All', ...Array.from(new Set(programs.map(p => p.format)))], [])

  const filtered = programs.filter(p => {
    if (pillar === 'Exams' && p.programType !== 'EXAM_PREP') return false
    if (pillar === 'Education' && !['SCHOOLING', 'UNDERGRADUATE', 'POSTGRADUATE'].includes(p.programType)) return false
    if (pillar === 'Skills' && !['WEBINAR', 'CERTIFICATE', 'PROFESSIONAL'].includes(p.programType)) return false
    if (pillar === 'Career' && !p.careerSupport) return false
    if (type !== 'All' && p.programType !== type) return false
    if (level !== 'All' && p.level !== level) return false
    if (mode !== 'All' && p.format !== mode) return false
    return true
  })

  const allTypeOptions: { value: 'All' | ProgramType; label: string }[] = [
    { value: 'All', label: 'All types' },
    { value: 'PROFESSIONAL', label: 'Professional' },
    { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'EXAM_PREP', label: 'Exam prep' },
    { value: 'SCHOOLING', label: 'Schooling' },
    { value: 'UNDERGRADUATE', label: 'Undergraduate' },
    { value: 'POSTGRADUATE', label: 'Postgraduate' },
  ]
  const typeOptions = allTypeOptions.filter(opt => opt.value === 'All' || programs.some(p => p.programType === opt.value))

  return (
    <PageShell>
      <PageHero
        eyebrow="Catalog"
        domain="skills"
        photo={PHOTO.workshop}
        photoAlt="Learners in a professional program session"
        title={<>Find the right<br />program.</>}
        lead="Filter by education, skills, exams, or career. Only options that exist in the catalog are shown."
      />

      <section style={{ background: C.warmWhite, padding: '32px 32px 80px', minHeight: '60vh' }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {(['All', 'Education', 'Skills', 'Exams', 'Career'] as Pillar[]).map(f => (
              <button
                key={f}
                onClick={() => { setPillar(f); setType('All') }}
                style={{
                  padding: '9px 18px', borderRadius: 24,
                  border: `1px solid ${pillar === f ? C.ink : T.lineStrong}`,
                  background: pillar === f ? C.ink : C.white,
                  color: pillar === f ? C.white : C.ink,
                  fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: pillar === f ? 600 : 400,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: C.slate, display: 'flex', alignItems: 'center', gap: 8 }}>
              Type
              <select value={type} onChange={e => setType(e.target.value as 'All' | ProgramType)} style={{ border: `1px solid ${T.lineStrong}`, borderRadius: 8, padding: '8px 10px', fontFamily: 'var(--font-body)', background: C.white }}>
                {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12, color: C.slate, display: 'flex', alignItems: 'center', gap: 8 }}>
              Level
              <select value={level} onChange={e => setLevel(e.target.value)} style={{ border: `1px solid ${T.lineStrong}`, borderRadius: 8, padding: '8px 10px', fontFamily: 'var(--font-body)', background: C.white }}>
                {levels.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12, color: C.slate, display: 'flex', alignItems: 'center', gap: 8 }}>
              Mode
              <select value={mode} onChange={e => setMode(e.target.value)} style={{ border: `1px solid ${T.lineStrong}`, borderRadius: 8, padding: '8px 10px', fontFamily: 'var(--font-body)', background: C.white }}>
                {modes.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          </div>

          <div style={{ color: C.slate, fontSize: 13, marginBottom: 20, fontFamily: 'var(--font-mono)' }}>
            {filtered.length} program{filtered.length !== 1 ? 's' : ''}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} className="three-col">
            {filtered.map((program, i) => (
              <FadeIn key={program.slug} delay={i * 40}>
                <ProgramCard program={program} />
              </FadeIn>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '72px 0', color: C.slate }}>
              No programs match these filters yet. Schooling, undergraduate, and postgraduate listings will appear here as they are published.
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{ marginTop: 56, background: C.sand, borderRadius: T.rCard, padding: '32px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.ink, marginBottom: 6 }}>Not sure which program?</div>
                <div style={{ color: C.slate, fontSize: 14 }}>Tell us your background — we will help you choose from what is actually available.</div>
              </div>
              <Button variant="dark" onClick={() => navigate('/contact')}>Talk to an advisor</Button>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}
