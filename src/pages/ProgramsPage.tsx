import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Button, T, PageHero } from '../components/ui'
import type { Program, ProgramType } from '../data'
import { PROGRAM_SEGMENTS } from '../lib/programSegments'
import { fetchPrograms } from '../api/programs'
import { getProgramPreview } from '../lib/programPreview'
import { VS } from '../lib/visualSystem'

const TYPE_LABELS: Record<ProgramType, string> = Object.fromEntries(
  Object.entries(PROGRAM_SEGMENTS).map(([key, config]) => [key, config.label]),
) as Record<ProgramType, string>

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  open: { text: 'Enrolling now', color: '#3d8b5a' },
  waitlist: { text: 'Waitlist', color: '#b45309' },
  coming_soon: { text: 'Coming soon', color: C.slate },
}

type Pillar = 'All' | 'Education' | 'Skills' | 'Exams' | 'Career'

function ProgramCard({ program }: { program: Program }) {
  const navigate = useNavigate()
  const lowestPrice = Math.min(...program.pricing.map(p => p.price))
  const preview = getProgramPreview(program)
  const status = STATUS_LABEL[program.enrollmentStatus ?? 'open']

  return (
    <article
      onClick={() => navigate(`/programs/${program.slug}`)}
      style={{ background: VS.surfaceElevated, border: `1px solid ${VS.hairline}`, borderRadius: T.rCard, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', height: '100%' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.32)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = VS.hairline; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ padding: '18px 20px 16px', background: VS.surface, borderBottom: `1px solid ${VS.hairline}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ background: C.ink, color: C.white, borderRadius: 5, padding: '4px 9px', fontSize: 10, fontFamily: 'var(--font-mono)' }}>{TYPE_LABELS[program.programType].toUpperCase()}</span>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: preview.accent }}>{preview.contextLabel}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {preview.chips.map(chip => (
            <span key={chip} style={{ background: VS.surfaceElevated, borderTop: `2px solid ${preview.accent}`, borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: VS.textPrimary }}>{chip}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '20px 20px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: status.color, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{status.text}</span>
          {program.careerSupport && <span style={{ color: C.orange, fontSize: 10, fontFamily: 'var(--font-mono)' }}>CAREER OS</span>}
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: VS.textPrimary, margin: '0 0 8px', lineHeight: 1.25 }}>{program.name}</h3>
        <p style={{ color: VS.textSecondary, fontSize: 13.5, lineHeight: 1.6, margin: '0 0 16px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{program.desc}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '12px 0', borderTop: `1px solid ${VS.hairline}`, borderBottom: `1px solid ${VS.hairline}`, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: VS.textMuted, fontFamily: 'var(--font-mono)' }}>DURATION</div>
            <div style={{ fontSize: 13, color: VS.textPrimary, fontWeight: 500 }}>{program.duration}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: VS.textMuted, fontFamily: 'var(--font-mono)' }}>MODE</div>
            <div style={{ fontSize: 13, color: VS.textPrimary, fontWeight: 500 }}>{program.format}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: VS.textMuted, fontFamily: 'var(--font-mono)' }}>LEVEL</div>
            <div style={{ fontSize: 13, color: VS.textPrimary, fontWeight: 500 }}>{program.level}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: VS.textMuted, fontFamily: 'var(--font-mono)' }}>STARTS</div>
            <div style={{ fontSize: 13, color: VS.textPrimary, fontWeight: 500 }}>{program.upcomingBatch}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: VS.textPrimary }}>₹{lowestPrice.toLocaleString('en-IN')}</div>
          <span style={{ color: C.orange, fontSize: 13, fontWeight: 600 }}>View Program →</span>
        </div>
      </div>
    </article>
  )
}

export default function ProgramsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pillar, setPillar] = useState<Pillar>('All')
  const [type, setType] = useState<'All' | ProgramType>('All')
  const [level, setLevel] = useState('All')
  const [mode, setMode] = useState('All')
  const query = (searchParams.get('q') ?? '').trim().toLowerCase()

  useEffect(() => {
    const pillarParam = searchParams.get('pillar')
    const typeParam = searchParams.get('type')
    const validPillars: Pillar[] = ['All', 'Education', 'Skills', 'Exams', 'Career']
    if (pillarParam && validPillars.includes(pillarParam as Pillar)) {
      setPillar(pillarParam as Pillar)
    }
    if (typeParam) {
      setType(typeParam as 'All' | ProgramType)
    }
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchPrograms()
      .then(data => {
        if (cancelled) return
        setPrograms(data as Program[])
      })
      .catch(err => {
        if (cancelled) return
        setPrograms([])
        setError(err instanceof Error ? err.message : 'Unable to load programs')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const levels = useMemo(() => ['All', ...Array.from(new Set(programs.map(p => p.level)))], [programs])
  const modes = useMemo(() => ['All', ...Array.from(new Set(programs.map(p => p.format)))], [programs])

  const filtered = programs.filter(p => {
    if (query) {
      const haystack = `${p.name} ${p.desc} ${p.outcome} ${TYPE_LABELS[p.programType]}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
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
        title={<>Find the right<br />program.</>}
        lead={query ? `Showing results for “${searchParams.get('q')}”. Filter by education, skills, exams, or career.` : 'Each card previews what you actually do — skills, workflow, and context — not just title and description.'}
      />

      <section style={{ background: VS.pageBg, padding: '32px 32px 80px', minHeight: '60vh', color: VS.textPrimary }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          {loading && (
            <div style={{ color: VS.textSecondary, fontSize: 14, padding: '24px 0' }}>Loading programs from catalog…</div>
          )}
          {error && !loading && (
            <div style={{ background: VS.surface, borderRadius: T.rCard, padding: 24, color: VS.textSecondary, fontSize: 14, marginBottom: 24, border: `1px solid ${VS.hairline}` }}>
              Unable to load programs: {error}
            </div>
          )}
          {!loading && (
          <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {(['All', 'Education', 'Skills', 'Exams', 'Career'] as Pillar[]).map(f => (
              <button
                key={f}
                onClick={() => { setPillar(f); setType('All') }}
                style={{
                  padding: '9px 18px', borderRadius: 24,
                  border: `1px solid ${pillar === f ? VS.textPrimary : VS.hairline}`,
                  background: pillar === f ? VS.textPrimary : VS.surfaceElevated,
                  color: pillar === f ? VS.pageBg : VS.textPrimary,
                  fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: pillar === f ? 600 : 400,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: VS.textSecondary, display: 'flex', alignItems: 'center', gap: 8 }}>
              Type
              <select value={type} onChange={e => setType(e.target.value as 'All' | ProgramType)} style={{ border: `1px solid ${VS.hairline}`, borderRadius: 8, padding: '8px 10px', fontFamily: 'var(--font-body)', background: VS.surfaceElevated, color: VS.textPrimary }}>
                {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12, color: VS.textSecondary, display: 'flex', alignItems: 'center', gap: 8 }}>
              Level
              <select value={level} onChange={e => setLevel(e.target.value)} style={{ border: `1px solid ${VS.hairline}`, borderRadius: 8, padding: '8px 10px', fontFamily: 'var(--font-body)', background: VS.surfaceElevated, color: VS.textPrimary }}>
                {levels.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12, color: VS.textSecondary, display: 'flex', alignItems: 'center', gap: 8 }}>
              Mode
              <select value={mode} onChange={e => setMode(e.target.value)} style={{ border: `1px solid ${VS.hairline}`, borderRadius: 8, padding: '8px 10px', fontFamily: 'var(--font-body)', background: VS.surfaceElevated, color: VS.textPrimary }}>
                {modes.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          </div>

          <div style={{ color: VS.textMuted, fontSize: 13, marginBottom: 20, fontFamily: 'var(--font-mono)' }}>
            {filtered.length} program{filtered.length !== 1 ? 's' : ''}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} className="three-col">
            {filtered.map((program, i) => (
              <FadeIn key={program.slug} delay={i * 40}>
                <ProgramCard program={program} />
              </FadeIn>
            ))}
          </div>

          {filtered.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '72px 0', color: VS.textSecondary }}>
              {query
                ? `No programs match “${searchParams.get('q')}”. Try a different search or clear filters.`
                : 'No programs match these filters yet. Published programs will appear here as they are added.'}
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{ marginTop: 56, background: VS.surface, borderRadius: T.rCard, padding: '32px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', border: `1px solid ${VS.hairline}` }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: VS.textPrimary, marginBottom: 6 }}>Not sure which program?</div>
                <div style={{ color: VS.textSecondary, fontSize: 14 }}>Tell us your background — we will help you choose from what is actually available.</div>
              </div>
              <Button variant="primary" onClick={() => navigate('/contact')}>Talk to an advisor</Button>
            </div>
          )}
          </>
          )}
        </div>
      </section>
    </PageShell>
  )
}
