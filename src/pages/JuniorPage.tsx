import { useState } from 'react'
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
  ProductTable,
  ProductTabs,
  ProgrammeList,
  SectionHeader,
  SegmentedControl,
  programCard,
} from '../components/product-ui'
import { SCHOOL_BANDS, SCHOOL_LAYERS } from '../skylent-worlds'
import { programsForWorld } from '../lib/world-programs'

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

  return (
    <WorldFrame world="schooling">
      <ContentRail>
        <ContextHeader
          world="schooling"
          eyebrow="Schooling"
          title="Choose your class, then find what you need."
          description="Class → subject → concept → lesson → activity. This is not a professional skills catalogue."
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

          {layer === 'Subjects' && (
            published.length ? (
              <ProgrammeList
                items={published.map((program) => programCard(program))}
                empty={<EmptyState title="None published" description="Class programmes will list here." />}
              />
            ) : (
              <>
                <ProductTable
                  headers={['Subject', 'Status']}
                  rows={band.subjects.map((item) => [
                    item,
                    item === activeSubject ? 'Selected — no lessons published' : 'No lessons published',
                  ])}
                />
                <p className="panel-note">
                  Concepts, lessons, and activities appear when they exist in the catalogue.
                  {' '}<Link to="/programs?type=SCHOOLING">Catalogue filter</Link>
                </p>
              </>
            )
          )}

          {layer === 'Experiments' && (
            <ComingSoonState
              title="Class experiments are not published"
              description={`No ${activeSubject} experiments are in the catalogue for ${band.label}. Labs has the experiments that exist today.`}
            />
          )}

          {layer === 'Experiments' && (
            <p className="panel-note"><Link to="/labs">Open Labs</Link></p>
          )}

          {(layer === 'Concepts' || layer === 'Lessons' || layer === 'Activities') && (
            <ComingSoonState
              title={`${layer} not published`}
              description={`${layer} for ${band.label} ${activeSubject} are not in the catalogue yet. Nothing is invented as a live worksheet.`}
            />
          )}

          {layer === 'Progress' && (
            <EmptyState
              title="Nothing to continue yet"
              description="Progress appears after lessons exist. This page will not show a made-up streak."
            />
          )}

          <p className="panel-note">
            JEE, CAT, and other papers live under <Link to="/exams">Exams</Link> — not inside Class 11–12 schooling.
          </p>
        </ProductLayout>
      </ContentRail>
    </WorldFrame>
  )
}
