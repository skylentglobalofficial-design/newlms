import { Link, useLocation, useSearchParams } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import {
  ContentRail,
  ContextHeader,
  EmptyState,
  NavList,
  ProductLayout,
  ProgrammeList,
  SectionHeader,
  SegmentedControl,
  WorkspaceBlock,
  programCard,
} from '../components/product-ui'
import { PG_STUDIO, UG_STUDIO, programsByType } from '../skylent-worlds'

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

const UG_COPY: Record<string, { title: string; body: string; items: string[] }> = {
  programmes: {
    title: 'Programmes',
    body: 'Undergraduate programmes appear here when they are in the catalogue. No departments or campuses are invented.',
    items: ['Degree name', 'Department', 'Duration', 'Curriculum outline'],
  },
  departments: {
    title: 'Departments',
    body: 'Department structure follows published degrees. This studio stays visible without fake faculty lists.',
    items: ['Department pages publish with inventory', 'Shared assessment rules', 'Not a partner brochure'],
  },
  curriculum: {
    title: 'Curriculum',
    body: 'Degree → semester → subject → module → lesson → assignment / project.',
    items: UG_STUDIO.model,
  },
  projects: {
    title: 'Projects',
    body: 'Studio and course projects attach to real programmes. Empty until those programmes exist.',
    items: ['Course projects', 'Studio work', 'Assessed deliverables'],
  },
  labs: {
    title: 'Labs',
    body: 'Lab work belongs to the degree, not a separate marketing section.',
    items: ['Subject labs', 'Shared equipment booking is operational, not shown as fake inventory'],
  },
  internships: {
    title: 'Internships',
    body: 'Internship pathways publish with programmes. Employer names are not invented here.',
    items: ['Credit-bearing internships when offered', 'Evidence goes to Career when you have work to show'],
  },
  pathways: {
    title: 'Career pathways',
    body: 'Progression is curriculum plus evidence — not placement percentages.',
    items: ['Further study', 'Professional programmes in Learn', 'Career OS after you have proof'],
  },
}

const PG_COPY: Record<string, { title: string; body: string; items: string[] }> = {
  programmes: {
    title: 'Specialisation',
    body: 'Postgraduate programmes appear when published. Specialisation names are not placeholder degrees.',
    items: ['Named specialisation', 'Entry requirements', 'Duration'],
  },
  curriculum: {
    title: 'Advanced curriculum',
    body: 'Program → term → specialisation → module → case / project → assessment.',
    items: PG_STUDIO.model,
  },
  research: {
    title: 'Research',
    body: 'Research supervision and labs publish with real postgraduate inventory.',
    items: ['Research methods', 'Supervisor assignment when offered', 'No invented publications'],
  },
  projects: {
    title: 'Projects',
    body: 'Applied projects sit beside research — only when the programme exists.',
    items: ['Industry project', 'Studio project', 'Assessed output'],
  },
  dissertation: {
    title: 'Dissertation / capstone',
    body: 'Capstone and dissertation requirements will attach to published PG programmes.',
    items: ['Proposal', 'Supervision', 'Viva / defence when required'],
  },
  pathways: {
    title: 'Academic / industry pathways',
    body: 'Further research or professional practice — described when the degree exists.',
    items: ['Doctoral progression', 'Industry practice', 'Not a placement statistic'],
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
  const level = levelFromSearch(params.get('level'), location.hash)
  const nav = level === 'ug' ? UG_NAV : PG_NAV
  const section = nav.some((item) => item.id === params.get('section'))
    ? params.get('section')!
    : 'programmes'
  const programmes = programsByType(level === 'ug' ? 'UNDERGRADUATE' : 'POSTGRADUATE')
  const copy = (level === 'ug' ? UG_COPY : PG_COPY)[section]

  function setLevel(next: string) {
    const nextParams = new URLSearchParams()
    nextParams.set('level', next)
    nextParams.set('section', 'programmes')
    setParams(nextParams, { replace: true })
  }

  function setSection(next: string) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('level', level)
    nextParams.set('section', next)
    setParams(nextParams, { replace: true })
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
          title="Undergraduate and postgraduate are different studios."
          description="Degrees, departments, curriculum, labs, and research. Institutional operations stay on Institutions. Programmes appear only when they exist in the catalogue."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'University' }]}
          actions={<Link className="product-btn-ghost" to="/institutions">Institutions</Link>}
        />

        <div className="product-toolbar">
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

        <ProductLayout sidebar={sidebar}>
          <div id={level === 'ug' ? 'undergraduate' : 'postgraduate'}>
            <SectionHeader
              title={copy.title}
              description={copy.body}
            />
            <WorkspaceBlock title="In this studio">
              <ul>
                {copy.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </WorkspaceBlock>

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
                      ? 'This studio stays visible so University has a place to work. Departments, faculty, and campuses are not invented.'
                      : 'Dissertation, faculty, and industry pathways will appear with real inventory — not placeholder degrees.'
                  }
                  action={
                    <Link className="product-btn-ghost" to={level === 'ug' ? '/programs?type=UNDERGRADUATE' : '/programs?type=POSTGRADUATE'}>
                      Catalogue filter
                    </Link>
                  }
                />
              )
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
