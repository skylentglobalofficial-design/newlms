import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import {
  ComingSoonState,
  ContentRail,
  ContextHeader,
  EmptyState,
  FilterDrawer,
  FilterToggle,
  NavList,
  ProductLayout,
  ProductTabs,
  ProgressPanel,
  ProgrammeList,
  SectionHeader,
  SegmentedControl,
  WorkspaceBlock,
  programCard,
} from '../components/product-ui'
import { SCHOOL_BANDS, SCHOOL_LAYERS, programsForWorld } from '../skylent-worlds'

const BAND_TABS = SCHOOL_BANDS.map((band) => ({ id: band.id, label: band.label }))

function bandFromSearch(value: string | null) {
  return SCHOOL_BANDS.some((band) => band.id === value) ? value! : 'middle'
}

export default function JuniorPage() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const bandId = bandFromSearch(params.get('band'))
  const band = SCHOOL_BANDS.find((item) => item.id === bandId) ?? SCHOOL_BANDS[1]
  const subject = params.get('subject') ?? band.subjects[0]
  const requestedLayer = params.get('layer')
  const layer = (SCHOOL_LAYERS as readonly string[]).includes(requestedLayer ?? '')
    ? (requestedLayer as (typeof SCHOOL_LAYERS)[number])
    : 'Subjects'
  const published = programsForWorld('schooling')

  const activeSubject = (band.subjects as readonly string[]).includes(subject) ? subject : band.subjects[0]

  function setBand(next: string) {
    const nextBand = SCHOOL_BANDS.find((item) => item.id === next) ?? SCHOOL_BANDS[1]
    const nextParams = new URLSearchParams()
    nextParams.set('band', nextBand.id)
    nextParams.set('subject', nextBand.subjects[0])
    setParams(nextParams, { replace: true })
    setFiltersOpen(false)
  }

  function setSubject(next: string) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('band', band.id)
    nextParams.set('subject', next)
    setParams(nextParams, { replace: true })
    setFiltersOpen(false)
  }

  function setLayer(next: string) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('band', band.id)
    nextParams.set('subject', activeSubject)
    nextParams.set('layer', next)
    setParams(nextParams, { replace: true })
  }

  const sidebar = (
    <div>
      <h2 className="product-filter-title">Subjects</h2>
      <NavList
        items={band.subjects.map((item) => ({ id: item, label: item }))}
        value={activeSubject}
        onChange={setSubject}
      />
    </div>
  )

  const layerCopy = useMemo(() => ({
    Subjects: `${activeSubject} for ${band.label}. Pick a subject in the rail, then open concepts when they are published.`,
    Concepts: `Concept pages for ${activeSubject} are not in the catalogue yet.`,
    Lessons: `Lessons for Class ${band.grades[0]}–${band.grades[band.grades.length - 1]} ${activeSubject} are not published.`,
    Activities: 'Activities appear with class programmes. Nothing is invented as a live worksheet.',
    Experiments: 'Experiments that exist today live in Labs — not as fake classroom animations.',
    Progress: 'Progress appears after lessons exist. This page will not show a made-up streak.',
  }), [activeSubject, band])

  return (
    <WorldFrame world="schooling">
      <ContentRail>
        <ContextHeader
          world="schooling"
          eyebrow="Schooling"
          title="Choose your class, then find what you need."
          description="For Class 1–12. Class first, then subjects, concepts, lessons, activities, and experiments — not a professional skills catalogue."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Schooling' }]}
        />

        <div className="product-toolbar">
          <FilterToggle open={filtersOpen} onClick={() => setFiltersOpen(true)} />
          <SegmentedControl options={BAND_TABS} value={band.id} onChange={setBand} label="Choose your class" />
        </div>

        <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Subjects">
          {sidebar}
        </FilterDrawer>

        <ProductLayout sidebar={sidebar}>
          <SectionHeader
            title={`${band.label} · ${activeSubject}`}
            description={`${band.stage}. ${band.focus}`}
          />

          <ProductTabs
            tabs={SCHOOL_LAYERS.map((item) => ({ id: item, label: item }))}
            value={layer}
            onChange={setLayer}
            label="Learning layer"
          />

          <WorkspaceBlock title={layer}>
            <p>{layerCopy[layer]}</p>
            {layer === 'Experiments' ? (
              <p><Link className="product-btn-ghost" to="/labs">Open Labs</Link></p>
            ) : null}
          </WorkspaceBlock>

          <ProgressPanel
            title="Continue learning"
            steps={['Choose class', 'Choose subject', 'Open a lesson when published', 'Do the activity', 'Check progress']}
            note="There is nothing to continue until class programmes are published."
          />

          <SectionHeader title="Class programmes" description="Only published catalogue items appear here." />
          {published.length ? (
            <ProgrammeList
              items={published.map((program) => programCard(program))}
              empty={<EmptyState title="None published" description="Class programmes will list here." />}
            />
          ) : (
            <EmptyState
              title="No class programmes published yet"
              description="You can still choose a class and subject. Labs has experiments. Nothing here is invented as a live course."
              action={<Link className="product-btn-ghost" to="/programs?type=SCHOOLING">Catalogue filter</Link>}
            />
          )}

          <ComingSoonState
            title="Exam prep is a different world"
            description="JEE, CAT, and other papers live under Exams — not inside Class 11–12 schooling."
          />
          <p className="panel-note"><Link to="/exams">Open Exams</Link></p>
        </ProductLayout>
      </ContentRail>
    </WorldFrame>
  )
}
