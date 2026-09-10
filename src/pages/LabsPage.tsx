import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, T } from '../components/ui'
import { Aurora, GlassSurface } from '../components/foundation'
import { getDomainAccent } from '../aurora-themes'
import { labSubjects } from '../data'
import type { LabType } from '../data'

const accent = getDomainAccent('professional')

const programs = ['All', 'Data Centric AI', 'BCA Full Stack Development', 'MBA', 'BBA', 'MCA', 'M.Com Fintech', 'SSU Semester 3', 'SSU Semester 5']
const semesters = ['All', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 5']
const labTypes: Array<'All' | LabType> = ['All', 'coding', 'data', 'business', 'simulation']

const labTypeLabels: Record<LabType, string> = {
  coding: 'Coding',
  data: 'Data',
  business: 'Business',
  simulation: 'Simulation',
}

const labTypeColors: Record<LabType, { bg: string; text: string; border: string }> = {
  coding: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  data: { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  business: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.25)' },
  simulation: { bg: 'rgba(168,85,247,0.12)', text: '#c084fc', border: 'rgba(168,85,247,0.25)' },
}

export default function LabsPage() {
  const navigate = useNavigate()
  const [selectedProgram, setSelectedProgram] = useState('All')
  const [selectedSemester, setSelectedSemester] = useState('All')
  const [selectedType, setSelectedType] = useState<'All' | LabType>('All')

  const filtered = labSubjects.filter(s => {
    const matchProgram = selectedProgram === 'All' || s.program === selectedProgram
    const matchSemester = selectedSemester === 'All' || s.semester === selectedSemester
    const matchType = selectedType === 'All' || s.labType === selectedType
    return matchProgram && matchSemester && matchType
  })

  const catalogStats = useMemo(() => {
    const programCount = new Set(labSubjects.map(s => s.program)).size
    const subjectCount = labSubjects.length
    const experimentCount = labSubjects.reduce((sum, s) => sum + s.experiments.length, 0)
    return [
      { value: String(programCount), label: 'Programs' },
      { value: String(subjectCount), label: 'Subjects' },
      { value: String(experimentCount), label: 'Experiments' },
    ]
  }, [])

  return (
    <PageShell auroraTheme="professional">
      <section style={{ position: 'relative', overflow: 'hidden', padding: `${T.navH + 32}px ${T.gutter} clamp(48px, 6vw, 72px)` }}>
        <Aurora themeId="professional" variant="hero" />
        <div style={{ maxWidth: T.maxW, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <div className="skylent-label" style={{ color: accent.text, marginBottom: 20 }}>Skylent Labs</div>
            <h1 className="skylent-display-lg" style={{ color: C.ink, margin: '0 0 16px', maxWidth: 560 }}>
              Practice in structured lab environments.
            </h1>
            <p className="skylent-body-lg" style={{ color: C.slate, maxWidth: 480, margin: '0 0 36px' }}>
              Run coding, data, and simulation exercises connected to your coursework — with clear objectives and submission steps.
            </p>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 8 }}>
              {catalogStats.map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: '-0.03em' }}>{value}</div>
                  <div className="skylent-label" style={{ color: C.slate, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
            <p style={{ color: C.slate, fontSize: 12, margin: 0 }}>Counts reflect the current lab catalog in this demo environment.</p>
          </FadeIn>
        </div>
      </section>

      {/* Filter bar */}
      <section style={{ background: C.canvas, borderBottom: `1px solid ${T.lineLight}`, position: 'sticky', top: T.navH, zIndex: 40 }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto', padding: `0 ${T.gutter}` }}>
          <div className="scroll-control-strip">
            <div className="scroll-control-strip-scroll labs-filter-bar" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '16px 0' }}>
              {/* Program filter */}
              <div className="labs-filter-group" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
              {programs.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedProgram(p)}
                  style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${selectedProgram === p ? accent.border : C.slate}`, background: selectedProgram === p ? accent.subtle : 'transparent', color: selectedProgram === p ? accent.text : C.slate, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="labs-filter-divider" style={{ width: 1, background: 'rgba(11,13,15,0.08)', flexShrink: 0 }} />
            {/* Semester filter */}
            <div className="labs-filter-group" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
              {semesters.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSemester(s)}
                  style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${selectedSemester === s ? C.slate : C.slate}`, background: selectedSemester === s ? C.slate : 'transparent', color: selectedSemester === s ? C.ink : C.slate, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="labs-filter-divider" style={{ width: 1, background: 'rgba(11,13,15,0.08)', flexShrink: 0 }} />
            {/* Type filter */}
            <div className="labs-filter-group" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
              {labTypes.map(t => {
                const colors = t !== 'All' ? labTypeColors[t] : null
                const active = selectedType === t
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${active && colors ? colors.border : active ? C.slate : C.slate}`, background: active && colors ? colors.bg : active ? C.slate : 'transparent', color: active && colors ? colors.text : active ? C.ink : C.slate, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                  >
                    {t === 'All' ? 'All Types' : labTypeLabels[t]}
                  </button>
                )
              })}
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <Section tone="canvas">
        <div style={{ maxWidth: T.maxW, margin: '0 auto', width: '100%' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: C.slate }}>
              <div style={{ fontSize: 24, marginBottom: 12, color: C.ink }}>No labs found</div>
              <div style={{ fontSize: 15 }}>Try adjusting your filters.</div>
            </div>
          ) : (
            <>
              <div className="skylent-label" style={{ color: C.slate, marginBottom: 28 }}>
                {filtered.length} lab{filtered.length !== 1 ? 's' : ''} found
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="labs-grid">
                {filtered.map(subject => {
                  const typeColors = labTypeColors[subject.labType]
                  return (
                    <div
                      key={subject.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/labs/${subject.id}`)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/labs/${subject.id}`) }}
                      style={{ cursor: 'pointer' }}
                    >
                      <GlassSurface
                        level={2}
                        padding="24px"
                        style={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.2s' }}
                      >
                      {/* Badges */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                        <span style={{ background: '$rgba(11,13,15,0.04)', color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 100 }}>
                          {subject.program}
                        </span>
                        <span style={{ background: '#FFFDFC', color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 100 }}>
                          {subject.semester}
                        </span>
                      </div>

                      {/* Subject name */}
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: C.ink, lineHeight: 1.2, marginBottom: 10 }}>
                        {subject.subject}
                      </div>

                      {/* Desc */}
                      <div style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.65, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {subject.desc}
                      </div>

                      <div style={{ flex: 1 }} />

                      {/* Type badge */}
                      <div style={{ marginBottom: 16 }}>
                        <span style={{ background: typeColors.bg, color: typeColors.text, border: `1px solid ${typeColors.border}`, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', padding: '4px 10px', borderRadius: 100 }}>
                          {labTypeLabels[subject.labType]}
                        </span>
                      </div>

                      {/* Experiment count + Progress */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ color: C.slate, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{subject.experiments.length} experiments</span>
                          <span style={{ color: C.slate, fontSize: 12, fontFamily: 'var(--font-mono)' }}>Demo</span>
                        </div>
                        <div style={{ background: 'rgba(11,13,15,0.08)', borderRadius: 3, height: 3 }}>
                          <div style={{ background: accent.primary, width: '0%', height: '100%', borderRadius: 3 }} />
                        </div>
                      </div>

                      {/* Launch button */}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); navigate(`/labs/${subject.id}`) }}
                        style={{ width: '100%', background: accent.primary, border: 'none', color: C.ink, padding: '11px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s', textAlign: 'center' }}
                      >
                        Open lab →
                      </button>
                      </GlassSurface>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </Section>

      <style>{`
        @media (max-width: 1024px) { .labs-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .labs-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </PageShell>
  )
}
