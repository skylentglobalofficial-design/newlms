import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import {
  ActionPanel,
  ContentRail,
  ContextHeader,
  FilterDrawer,
  FilterToggle,
  NavList,
  ProductLayout,
  ProductTable,
  ProductTabs,
  SectionHeader,
  WorkspaceBlock,
} from '../components/product-ui'

const TYPES = [
  {
    id: 'schools',
    label: 'Schools',
    problem: 'Classes, teachers, and progress sit in different places.',
    value: 'Grade → subject → lesson delivery, assessments, and a parent-visible record.',
    offers: [
      ['Class structure', 'Year, section, and subject as the operating unit.'],
      ['Teacher tools', 'Lesson delivery and assessment in one place.'],
      ['Assessments', 'Checks that attach to the class, not a separate spreadsheet.'],
      ['Progress', 'A record families can actually see.'],
    ] as [string, string][],
  },
  {
    id: 'colleges',
    label: 'Colleges',
    problem: 'The degree calendar and skills delivery rarely share a system.',
    value: 'Programmes, departments, LMS, projects, and operations beside the academic year.',
    offers: [
      ['Programmes', 'Degree and skill programmes on one calendar.'],
      ['LMS', 'Delivery, assignments, and sequential unlock.'],
      ['Projects', 'Assessed work inside the programme, not a side portal.'],
      ['Student records', 'Enrolment, progress, and certification in one record.'],
    ] as [string, string][],
  },
  {
    id: 'universities',
    label: 'Universities',
    problem: 'Departments scale faster than shared curriculum and assessment infrastructure.',
    value: 'Multi-programme curriculum, assessment, and student lifecycle on Skylent OS.',
    offers: [
      ['Multi-programme', 'Shared platform across departments.'],
      ['Curriculum', 'Semester and module structures that can be assessed.'],
      ['Assessment', 'Common rules without inventing a faculty directory.'],
      ['Lifecycle', 'From admission through records — described, not demoed with fake students.'],
    ] as [string, string][],
  },
  {
    id: 'training',
    label: 'Training organisations',
    problem: 'Batches, trainers, and certificates live in spreadsheets.',
    value: 'Programmes, batches, trainers, learners, and certification as one delivery system.',
    offers: [
      ['Batches', 'Cohorts with start dates and trainers.'],
      ['Trainers', 'Delivery assignment without a fake roster.'],
      ['Certification', 'Issued when assessment is complete.'],
      ['Delivery', 'The same LMS learners already use.'],
    ] as [string, string][],
  },
]

const LAYERS = [
  {
    id: 'programmes',
    title: 'Programmes',
    body: 'Create and run programmes with curriculum, assessment, and batches — the same objects learners already use.',
  },
  {
    id: 'delivery',
    title: 'Learning delivery',
    body: 'LMS, assignments, sequential unlock, and faculty tools. Delivery is operational, not a brochure site.',
  },
  {
    id: 'operations',
    title: 'Operations',
    body: 'Cohorts, roles, records, and certification. Information density is the point.',
  },
  {
    id: 'os',
    title: 'Skylent OS',
    body: 'The shared platform under Learn, Exams, Schooling, University, and Career. The /os page is a labelled demo cockpit, not a live tenant.',
  },
]

export default function InstitutionsPage() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeId = TYPES.some((item) => item.id === params.get('audience'))
    ? params.get('audience')!
    : 'colleges'
  const active = TYPES.find((item) => item.id === activeId) ?? TYPES[1]
  const layer = LAYERS.some((item) => item.id === params.get('layer'))
    ? params.get('layer')!
    : 'programmes'
  const activeLayer = LAYERS.find((item) => item.id === layer) ?? LAYERS[0]

  function setAudience(next: string) {
    const nextParams = new URLSearchParams()
    nextParams.set('audience', next)
    if (layer !== 'programmes') nextParams.set('layer', layer)
    setParams(nextParams, { replace: true })
    setFiltersOpen(false)
  }

  function setLayer(next: string) {
    const nextParams = new URLSearchParams()
    nextParams.set('audience', activeId)
    nextParams.set('layer', next)
    setParams(nextParams, { replace: true })
  }

  const sidebar = (
    <div>
      <h2 className="product-filter-title">Audience</h2>
      <NavList
        items={TYPES.map((item) => ({ id: item.id, label: item.label }))}
        value={activeId}
        onChange={setAudience}
      />
    </div>
  )

  return (
    <WorldFrame world="institutions">
      <ContentRail>
        <ContextHeader
          world="institutions"
          eyebrow="Institutions"
          title="Run learning as an operation."
          description="For schools, colleges, universities, and training organisations. Programmes, delivery, operations, Skylent OS — not a student playground."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Institutions' }]}
          actions={
            <>
              <Link className="product-btn" to="/contact">Talk to Skylent</Link>
              <Link className="product-btn-ghost" to="/os">View OS demo</Link>
            </>
          }
        />

        <div className="product-toolbar">
          <FilterToggle open={filtersOpen} onClick={() => setFiltersOpen(true)} />
        </div>
        <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Audience">
          {sidebar}
        </FilterDrawer>

        <ProductLayout sidebar={sidebar}>
          <SectionHeader
            title={active.label}
            description={`${active.problem} ${active.value}`}
          />

          <ProductTable
            headers={['Capability', 'In this audience']}
            rows={active.offers.map(([name, detail]) => [name, detail])}
          />

          <div className="product-toolbar" style={{ marginTop: 24 }}>
            <ProductTabs
              tabs={LAYERS.map((item) => ({ id: item.id, label: item.title }))}
              value={layer}
              onChange={setLayer}
              label="Institution layers"
            />
          </div>

          <WorkspaceBlock title={activeLayer.title}>
            <p>{activeLayer.body}</p>
          </WorkspaceBlock>

          <ActionPanel title="What we do not publish here">
            <p className="panel-note" style={{ marginTop: 0 }}>
              No invented partner logos, placement rates, or student counts. If a school or university is not named in the product, it is not named here.
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link className="product-btn" to="/os">View OS demo</Link>
              <Link className="product-btn-ghost" to="/contact">Request a conversation</Link>
            </div>
          </ActionPanel>
        </ProductLayout>
      </ContentRail>
    </WorldFrame>
  )
}
