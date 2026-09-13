import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FadeIn, PageShell } from '../components/shared'
import { Section, T } from '../components/ui'
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
  coding: { bg: 'rgba(79,70,229,0.08)', text: '#4F46E5', border: 'rgba(79,70,229,0.28)' },
  data: { bg: 'rgba(37,99,235,0.08)', text: '#2563EB', border: 'rgba(37,99,235,0.28)' },
  business: { bg: 'rgba(21,23,26,0.04)', text: '#15171A', border: 'rgba(21,23,26,0.14)' },
  simulation: { bg: 'rgba(37,99,235,0.08)', text: '#2563EB', border: 'rgba(37,99,235,0.22)' },
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
    <PageShell aurora={false}>
      <section style={{ padding: `${T.navH + 28}px ${T.gutter} 48px`, background: C.canvas }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(220px, 0.6fr)', gap: 48, alignItems: 'end' }} className="two-col">
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
                  <div className="skylent-label" style={{ color: C.indigo, margin: 0 }}>Skylent Labs</div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A3412', border: '1px solid rgba(154,52,18,0.28)', background: 'rgba(249,115,22,0.08)', borderRadius: 4, padding: '2px 7px' }}>Local demo</span>
                </div>
                <h1 className="skylent-display-lg" style={{ color: C.ink, margin: '0 0 16px', maxWidth: 560 }}>
                  Experiment workbenches, in the browser.
                </h1>
                <p className="skylent-body-lg" style={{ color: C.slate, maxWidth: 480, margin: '0 0 18px' }}>
                  Lab → experiment → workspace → run → result. Runs are simulated in this session. Progress is stored locally in the browser, not on Skylent servers.
                </p>
                <div className="skylent-label" style={{ color: C.slate }}>Lab · subject · experiment · workspace · run · takeaway</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingBottom: 8, borderBottom: `1px solid ${T.lineLight}` }}>
                {catalogStats.map(({ value, label }) => (
                  <div key={label}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: C.ink, letterSpacing: '-0.03em' }}>{value}</div>
                    <div className="skylent-label" style={{ color: C.slate, marginTop: 6 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section style={{ background: C.cream, borderTop: `1px solid ${T.lineLight}`, borderBottom: `1px solid ${T.lineLight}`, position: 'sticky', top: T.navH, zIndex: 40 }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto', padding: `0 ${T.gutter}` }}>
          <div className="scroll-control-strip">
            <div className="scroll-control-strip-scroll labs-filter-bar" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '14px 0' }}>
              <div className="labs-filter-group" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                {programs.map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedProgram(p)}
                    style={{ padding: '7px 12px', borderRadius: 0, border: 0, borderBottom: `2px solid ${selectedProgram === p ? C.indigo : 'transparent'}`, background: 'transparent', color: selectedProgram === p ? C.ink : C.slate, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="labs-filter-divider" style={{ width: 1, background: T.lineLight, flexShrink: 0 }} />
              <div className="labs-filter-group" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                {semesters.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSemester(s)}
                    style={{ padding: '7px 12px', borderRadius: 0, border: 0, borderBottom: `2px solid ${selectedSemester === s ? C.indigo : 'transparent'}`, background: 'transparent', color: selectedSemester === s ? C.ink : C.slate, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="labs-filter-divider" style={{ width: 1, background: T.lineLight, flexShrink: 0 }} />
              <div className="labs-filter-group" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                {labTypes.map(t => {
                  const active = selectedType === t
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      style={{ padding: '7px 12px', borderRadius: 0, border: 0, borderBottom: `2px solid ${active ? C.indigo : 'transparent'}`, background: 'transparent', color: active ? C.ink : C.slate, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
                    >
                      {t === 'All' ? 'All types' : labTypeLabels[t]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section tone="canvas" style={{ paddingTop: 48 }}>
        <div style={{ maxWidth: T.maxW, margin: '0 auto', width: '100%' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '64px 0', color: C.slate }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8, color: C.ink }}>No labs match these filters.</div>
              <div style={{ fontSize: 15 }}>Try a broader programme, semester, or type.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, paddingBottom: 16, borderBottom: `1px solid ${T.lineStrong}` }}>
                <div className="skylent-label" style={{ color: C.slate }}>
                  {filtered.length} lab{filtered.length !== 1 ? 's' : ''}
                </div>
                <div className="skylent-label" style={{ color: C.slate }}>Demo catalogue</div>
              </div>
              <div>
                {filtered.map(subject => {
                  const typeColors = labTypeColors[subject.labType]
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => navigate(`/labs/${subject.id}`)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(140px, 0.7fr) 120px 88px',
                        gap: 20,
                        width: '100%',
                        textAlign: 'left',
                        padding: '22px 0',
                        border: 0,
                        borderBottom: `1px solid ${T.lineLight}`,
                        background: 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        alignItems: 'baseline',
                      }}
                      className="labs-row"
                    >
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: C.ink, letterSpacing: '-0.02em', marginBottom: 6 }}>{subject.subject}</div>
                        <div style={{ color: C.slate, fontSize: 13.5, lineHeight: 1.55, maxWidth: 520 }}>{subject.desc}</div>
                      </div>
                      <div>
                        <div style={{ color: C.ink, fontSize: 13, marginBottom: 4 }}>{subject.program}</div>
                        <div style={{ color: C.slate, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{subject.semester}</div>
                      </div>
                      <div>
                        <span style={{ color: typeColors.text, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{labTypeLabels[subject.labType]}</span>
                        <div style={{ color: C.slate, fontSize: 12, marginTop: 4 }}>{subject.experiments.length} experiments</div>
                      </div>
                      <div style={{ color: C.indigo, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>Open →</div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </Section>

      <style>{`
        @media (max-width: 900px) {
          .labs-row { grid-template-columns: 1fr 1fr !important; }
          .labs-row > :last-child { text-align: left !important; }
        }
        @media (max-width: 640px) {
          .labs-row { grid-template-columns: 1fr !important; gap: 8px !important; }
        }
      `}</style>
    </PageShell>
  )
}
