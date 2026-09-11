import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import {
  ContentRail,
  ContextHeader,
  EmptyState,
  FilterDrawer,
  FilterToggle,
  NavList,
  ProductLayout,
  ProductTable,
  ProgrammeList,
  SectionHeader,
  SegmentedControl,
  programCard,
} from '../components/product-ui'
import { PG_STUDIO, UG_STUDIO } from '../skylent-worlds'
import { programsByType } from '../lib/world-programs'

const UG_NAV = [
  { id: 'programmes', label: 'Programmes' },
  { id: 'departments', label: 'Departments' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'projects', label: 'Projects' },
  { id: 'labs', label: 'Labs' },
  { id: 'internships', label: 'Internships' },
  { id: 'pathways', label: 'Career pathways' },
]

const PG_NAV = [
  { id: 'programmes', label: 'Specialisation' },
  { id: 'curriculum', label: 'Advanced curriculum' },
  { id: 'research', label: 'Research' },
  { id: 'projects', label: 'Projects' },
  { id: 'dissertation', label: 'Dissertation / capstone' },
  { id: 'pathways', label: 'Academic / industry pathways' },
]

const UG_COPY: Record<string, { title: string; body: string }> = {
  programmes: {
    title: 'Programmes',
    body: 'Undergraduate programmes appear here when they are in the catalogue.',
  },
  departments: {
    title: 'Departments',
    body: 'Department pages publish with degrees. Faculty lists are not invented.',
  },
  curriculum: {
    title: 'Curriculum',
    body: 'Degree → semester → subject → module → lesson → assignment.',
  },
  projects: {
    title: 'Projects',
    body: 'Studio and course projects attach to real programmes.',
  },
  labs: {
    title: 'Labs',
    body: 'Lab work belongs to the degree, not a separate marketing section.',
  },
  internships: {
    title: 'Internships',
    body: 'Internship pathways publish with programmes. Employer names are not invented.',
  },
  pathways: {
    title: 'Career pathways',
    body: 'Progression is curriculum plus evidence — not placement percentages.',
  },
}

const PG_COPY: Record<string, { title: string; body: string }> = {
  programmes: {
    title: 'Specialisation',
    body: 'Postgraduate programmes appear when published.',
  },
  curriculum: {
    title: 'Advanced curriculum',
    body: 'Programme → term → specialisation → module → case / project → assessment.',
  },
  research: {
    title: 'Research',
    body: 'Research supervision publishes with real postgraduate inventory.',
  },
  projects: {
    title: 'Projects',
    body: 'Applied projects sit beside research — only when the programme exists.',
  },
  dissertation: {
    title: 'Dissertation / capstone',
    body: 'Capstone requirements attach to published PG programmes.',
  },
  pathways: {
    title: 'Academic / industry pathways',
    body: 'Further research or professional practice — described when the degree exists.',
  },
}

function levelFromSearch(value: string | null, hash: string) {
  const fromHash = hash.replace('#', '')
  if (value === 'pg' || fromHash === 'postgraduate') return 'pg'
  return 'ug'
}

export default function DegreesPage() {
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const level = levelFromSearch(params.get('level'), location.hash)
  const nav = level === 'ug' ? UG_NAV : PG_NAV
  const section = nav.some((item) => item.id === params.get('section'))
    ? params.get('section')!
    : 'programmes'
  const programmes = programsByType(level === 'ug' ? 'UNDERGRADUATE' : 'POSTGRADUATE')
  const copy = (level === 'ug' ? UG_COPY : PG_COPY)[section]
  const structure = level === 'ug' ? UG_STUDIO.model : PG_STUDIO.model

  function setLevel(next: string) {
    const nextParams = new URLSearchParams()
    nextParams.set('level', next)
    nextParams.set('section', 'programmes')
    setParams(nextParams, { replace: true })
    setFiltersOpen(false)
  }

  function setSection(next: string) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('level', level)
    nextParams.set('section', next)
    setParams(nextParams, { replace: true })
    setFiltersOpen(false)
  }

  const sidebar = (
    <div>
      <h2 className="product-filter-title">{level === 'ug' ? 'Undergraduate' : 'Postgraduate'}</h2>
      <NavList items={nav} value={section} onChange={setSection} />
    </div>
  )

  return (
    <WorldFrame world="university">
      <ContentRail>
        <ContextHeader
          world="university"
          eyebrow="University"
          title="Undergraduate and postgraduate are different."
          description="Degrees, departments, curriculum, labs, and research. Institutional operations stay on Institutions."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'University' }]}
          actions={<Link className="product-btn-ghost" to="/institutions">Institutions</Link>}
        />

        <div className="product-toolbar">
          <FilterToggle open={filtersOpen} onClick={() => setFiltersOpen(true)} />
          <SegmentedControl
            options={[
              { id: 'ug', label: UG_STUDIO.label },
              { id: 'pg', label: PG_STUDIO.label },
            ]}
            value={level}
            onChange={setLevel}
            label="Degree level"
          />
        </div>

        <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title={level === 'ug' ? 'Undergraduate' : 'Postgraduate'}>
          {sidebar}
        </FilterDrawer>

        <ProductLayout sidebar={sidebar}>
          <div id={level === 'ug' ? 'undergraduate' : 'postgraduate'}>
            <SectionHeader
              title={copy.title}
              description={copy.body}
            />

            {section === 'programmes' && (
              programmes.length ? (
                <ProgrammeList
                  items={programmes.map((program) => programCard(program))}
                  empty={<EmptyState title="None published" description="Degree programmes list here when they exist." />}
                />
              ) : (
                <EmptyState
                  title={level === 'ug' ? 'No undergraduate programmes published' : 'No postgraduate programmes published'}
                  description={
                    level === 'ug'
                      ? 'University stays open as its own product. Departments, faculty, and campuses are not invented.'
                      : 'Dissertation, faculty, and industry pathways appear with real inventory — not placeholder degrees.'
                  }
                  action={
                    <Link className="product-btn-ghost" to={level === 'ug' ? '/programs?type=UNDERGRADUATE' : '/programs?type=POSTGRADUATE'}>
                      Catalogue filter
                    </Link>
                  }
                />
              )
            )}

            {section !== 'programmes' && (
              <EmptyState
                title={`${copy.title} not published`}
                description={`No ${level === 'ug' ? 'undergraduate' : 'postgraduate'} ${copy.title.toLowerCase()} inventory exists yet.`}
              />
            )}

            {section === 'programmes' && (
              <ProductTable
                headers={['Academic structure', 'Status']}
                rows={structure.map((item) => [item, 'Not published'])}
              />
            )}

            <p className="panel-note">
              Professional certificates live in <Link to="/skills">Learn</Link>. Partnership and operations live in <Link to="/institutions">Institutions</Link>.
            </p>
          </div>
        </ProductLayout>
      </ContentRail>
    </WorldFrame>
  )
}
