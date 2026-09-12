import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, Select, Note, EmptyState, Tag } from '../design/primitives'
import { S, TY } from '../design/tokens'
import { labSubjects } from '../data'
import type { LabType } from '../data'

const labTypeLabels: Record<LabType, string> = {
  coding: 'Coding',
  data: 'Data',
  business: 'Business',
  simulation: 'Simulation',
}

export default function LabsPage() {
  const [program, setProgram] = useState('all')
  const [type, setType] = useState('all')

  const programOptions = useMemo(() => {
    const present = [...new Set(labSubjects.map(item => item.program))]
    return [{ value: 'all', label: 'All groupings' }, ...present.map(item => ({ value: item, label: item }))]
  }, [])

  const typeOptions = [
    { value: 'all', label: 'All lab types' },
    ...(['coding', 'data', 'business', 'simulation'] as LabType[]).map(item => ({
      value: item,
      label: labTypeLabels[item],
    })),
  ]

  const filtered = labSubjects.filter(item => {
    if (program !== 'all' && item.program !== program) return false
    if (type !== 'all' && item.labType !== type) return false
    return true
  })

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Labs"
          title="Practice exercises."
          lead="Structured lab subjects with objectives and submission steps. Counts below are the subjects and experiments in this catalogue — not evidence that the named degree programmes are open to enrol."
        />

        <div style={{ paddingBottom: 72 }}>
          <Note>
            A grouping such as “MBA” or “BCA” on a lab card is a catalogue label for the exercise. It is not a Skylent
            degree. Degree study is listed on the education page, and none of those stages are open yet.
          </Note>

          <div className="sk-filterbar" style={{ marginTop: 22 }}>
            <Select value={program} onChange={setProgram} options={programOptions} ariaLabel="Filter by grouping" />
            <Select value={type} onChange={setType} options={typeOptions} ariaLabel="Filter by lab type" />
            <span className="sk-filterbar-spacer" />
            <span style={{ ...TY.bodySm, color: S.inkMuted }}>
              {filtered.length} of {labSubjects.length}
            </span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No labs match those filters" body="Clear a filter to see the rest of the catalogue." />
          ) : (
            <div className="sk-grid sk-grid-3">
              {filtered.map(subject => (
                <Link key={subject.id} to={`/labs/${subject.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Card interactive padding={20} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Tag>{labTypeLabels[subject.labType]}</Tag>
                      <Tag>{subject.semester}</Tag>
                    </div>
                    <h2 style={{ ...TY.h3, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{subject.title}</h2>
                    <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: 1 }}>{subject.desc}</p>
                    <span style={{ ...TY.meta, color: S.inkMuted }}>
                      {subject.experiments.length} {subject.experiments.length === 1 ? 'experiment' : 'experiments'} · {subject.program}
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Rail>
    </ProductShell>
  )
}
