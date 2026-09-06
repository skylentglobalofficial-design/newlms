import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { getDomainAccent } from '../aurora-themes'

const accent = getDomainAccent('professional')
import { labSubjects } from '../data'
import type { LabType } from '../data'

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

  return (
    <PageShell>
      {/* Hero */}
      <section style={{ background: C.ink, padding: '120px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '56px 56px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, right: '5%', width: 480, height: 480, background: `radial-gradient(circle, ${accent.primary}12 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <FadeIn>
            <div style={{ color: accent.text, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', marginBottom: 24 }}>SKYLENT LABS</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 700, color: C.white, lineHeight: 1.0, letterSpacing: '-0.035em', margin: '0 0 20px' }}>
              Practice. Build. Prove.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, lineHeight: 1.75, maxWidth: 480, margin: '0 0 44px' }}>
              Structured lab environments connected to your learning journey.
            </p>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[['8', 'Programs'], ['24+', 'Subjects'], ['180+', 'Experiments']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: C.white, letterSpacing: '-0.03em' }}>{n}</div>
                  <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, fontFamily: 'var(--font-mono)', marginTop: 3, letterSpacing: '0.1em' }}>{l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Filter bar */}
      <section style={{ background: C.ink, borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', gap: 24, overflowX: 'auto', padding: '16px 0', flexWrap: 'nowrap', scrollbarWidth: 'none' }}>
            {/* Program filter */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {programs.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedProgram(p)}
                  style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${selectedProgram === p ? accent.border : 'rgba(255,255,255,0.12)'}`, background: selectedProgram === p ? accent.subtle : 'transparent', color: selectedProgram === p ? accent.text : 'rgba(255,255,255,0.45)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                >
                  {p}
                </button>
              ))}
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            {/* Semester filter */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {semesters.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSemester(s)}
                  style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${selectedSemester === s ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`, background: selectedSemester === s ? 'rgba(255,255,255,0.08)' : 'transparent', color: selectedSemester === s ? C.white : 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            {/* Type filter */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {labTypes.map(t => {
                const colors = t !== 'All' ? labTypeColors[t] : null
                const active = selectedType === t
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${active && colors ? colors.border : active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`, background: active && colors ? colors.bg : active ? 'rgba(255,255,255,0.07)' : 'transparent', color: active && colors ? colors.text : active ? C.white : 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                  >
                    {t === 'All' ? 'All Types' : labTypeLabels[t]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section style={{ background: C.warmWhite, padding: '60px 32px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: C.slate }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>No labs found</div>
              <div style={{ fontSize: 15 }}>Try adjusting your filters.</div>
            </div>
          ) : (
            <>
              <div style={{ color: C.slate, fontSize: 13, fontFamily: 'var(--font-mono)', marginBottom: 28 }}>
                {filtered.length} lab{filtered.length !== 1 ? 's' : ''} found
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="labs-grid">
                {filtered.map(subject => {
                  const typeColors = labTypeColors[subject.labType]
                  return (
                    <div
                      key={subject.id}
                      style={{ background: C.white, border: '1px solid rgba(11,13,15,0.08)', borderRadius: 14, padding: '28px', display: 'flex', flexDirection: 'column', gap: 0, transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(11,13,15,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
                      onClick={() => navigate(`/labs/${subject.id}`)}
                    >
                      {/* Badges */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(11,13,15,0.06)', color: C.ink, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 100 }}>
                          {subject.program}
                        </span>
                        <span style={{ background: 'rgba(102,112,120,0.1)', color: C.slate, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 100 }}>
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
                          <span style={{ color: C.slate, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{subject.experiments.length} Experiments</span>
                          <span style={{ color: C.slate, fontSize: 12, fontFamily: 'var(--font-mono)' }}>0%</span>
                        </div>
                        <div style={{ background: 'rgba(11,13,15,0.08)', borderRadius: 3, height: 3 }}>
                          <div style={{ background: accent.primary, width: '0%', height: '100%', borderRadius: 3 }} />
                        </div>
                      </div>

                      {/* Launch button */}
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/labs/${subject.id}`) }}
                        style={{ width: '100%', background: C.ink, border: 'none', color: C.white, padding: '11px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'opacity 0.2s', textAlign: 'center' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        Launch Lab &rarr;
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) { .labs-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .labs-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </PageShell>
  )
}
