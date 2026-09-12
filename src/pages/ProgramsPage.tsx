import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, SectionHeading, SearchField, Select, EmptyState, Button, ButtonLink, Note } from '../design/primitives'
import { ProgrammeCard, FeaturedProgrammeCard } from '../design/CatalogueCard'
import { PROGRAM_TYPE_LABEL } from '../design/CatalogueCard'
import { S, TY } from '../design/tokens'
import { getProgrammeAvailability } from '../lib/catalogue-status'
import { programs } from '../data'
import type { Program, ProgramType } from '../data'

const ALL = 'all'

/** Only offer filters for types that actually appear in the catalogue. */
function typeOptions() {
  const present = [...new Set(programs.map(program => program.programType))] as ProgramType[]
  return [
    { value: ALL, label: 'All types' },
    ...present.map(type => ({ value: type, label: PROGRAM_TYPE_LABEL[type] })),
  ]
}

function levelOptions() {
  const present = [...new Set(programs.map(program => program.level))].filter(Boolean)
  return [{ value: ALL, label: 'All levels' }, ...present.map(level => ({ value: level, label: level }))]
}

const AVAILABILITY_OPTIONS = [
  { value: ALL, label: 'Any status' },
  { value: 'open', label: 'Open to study now' },
  { value: 'upcoming', label: 'Not open yet' },
]

export default function ProgramsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [type, setType] = useState(searchParams.get('type') ?? ALL)
  const [level, setLevel] = useState(ALL)
  const [availability, setAvailability] = useState(ALL)

  useEffect(() => {
    const nextType = searchParams.get('type')
    if (nextType) setType(nextType)
    const nextQuery = searchParams.get('q')
    if (nextQuery) setQuery(nextQuery)
  }, [searchParams])

  const { open, upcoming, total } = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = programs.filter(program => {
      if (type !== ALL && program.programType !== type) return false
      if (level !== ALL && program.level !== level) return false
      if (needle && !`${program.name} ${program.desc} ${program.outcome}`.toLowerCase().includes(needle)) return false
      return true
    })

    const openNow: Program[] = []
    const notOpen: Program[] = []
    for (const program of matches) {
      if (getProgrammeAvailability(program).canStartLearning) openNow.push(program)
      else notOpen.push(program)
    }

    return {
      open: availability === 'upcoming' ? [] : openNow,
      upcoming: availability === 'open' ? [] : notOpen,
      total: matches.length,
    }
  }, [query, type, level, availability])

  const filtersActive = query.trim() !== '' || type !== ALL || level !== ALL || availability !== ALL
  const shown = open.length + upcoming.length

  function reset() {
    setQuery('')
    setType(ALL)
    setLevel(ALL)
    setAvailability(ALL)
    setSearchParams({}, { replace: true })
  }

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Learn"
          title="Programmes"
          lead="Long-form programmes with published curriculum, duration, level and fees. Every card states whether its course material is open in the learning platform yet."
        />

        <div className="sk-filterbar">
          <SearchField value={query} onChange={setQuery} placeholder="Search programmes" />
          <Select value={type} onChange={setType} options={typeOptions()} ariaLabel="Filter by programme type" />
          <Select value={level} onChange={setLevel} options={levelOptions()} ariaLabel="Filter by level" />
          <Select value={availability} onChange={setAvailability} options={AVAILABILITY_OPTIONS} ariaLabel="Filter by availability" />
          <span className="sk-filterbar-spacer" />
          <span style={{ ...TY.bodySm, color: S.inkMuted, whiteSpace: 'nowrap' }}>
            {shown} of {programs.length}
          </span>
          {filtersActive && (
            <Button variant="quiet" size="sm" onClick={reset}>Clear</Button>
          )}
        </div>

        {total === 0 ? (
          <div style={{ paddingBottom: 64 }}>
            <EmptyState
              title="No programmes match those filters"
              body="Try a broader search, or clear the filters to see the whole catalogue."
              action={<Button onClick={reset}>Clear filters</Button>}
            />
          </div>
        ) : (
          <div style={{ paddingBottom: 64 }}>
            {open.length > 0 && (
              <section style={{ marginBottom: upcoming.length > 0 ? 44 : 0 }}>
                <SectionHeading
                  size="sm"
                  title="Open in the learning platform"
                  lead="Course material for these is published — enrol and you can start today."
                />
                {open.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <FeaturedProgrammeCard program={open[0]} />
                  </div>
                )}
                {open.length > 1 && (
                  <div className="sk-grid sk-grid-3">
                    {open.slice(1).map(program => (
                      <ProgrammeCard key={program.slug} program={program} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {upcoming.length > 0 && (
              <section>
                <SectionHeading
                  size="sm"
                  title="Not open yet"
                  lead="These have a published syllabus and fee, but no lessons in the learning platform."
                />
                <div style={{ marginBottom: 18, maxWidth: '70ch' }}>
                  <Note>
                    Registering interest in these does not reserve a place and nothing is charged. They are listed so
                    you can see what is planned, not so they can be bought.
                  </Note>
                </div>
                <div className="sk-grid sk-grid-3">
                  {upcoming.map(program => (
                    <ProgrammeCard key={program.slug} program={program} />
                  ))}
                </div>
              </section>
            )}

            {open.length === 0 && upcoming.length === 0 && (
              <EmptyState
                title="Nothing in that status"
                body="No programme in the current filters has that availability."
                action={<Button onClick={reset}>Clear filters</Button>}
              />
            )}

            <div style={{ marginTop: 44, paddingTop: 26, borderTop: `1px solid ${S.line}`, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: '1 1 320px' }}>
                Looking for something shorter? Courses are self-paced when their lessons are published — each course card shows that status.
              </p>
              <ButtonLink to="/courses" variant="secondary" size="sm">Browse courses</ButtonLink>
            </div>
          </div>
        )}
      </Rail>
    </ProductShell>
  )
}
