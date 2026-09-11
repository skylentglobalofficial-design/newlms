import { useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import {
  ComingSoonState,
  ContentRail,
  ContextHeader,
  EmptyState,
  FilterDrawer,
  FilterPanel,
  FilterToggle,
  ProductLayout,
  ProductTable,
  ProgrammeList,
  SectionHeader,
  StickyActionBar,
  formatInr,
  programCard,
} from '../components/product-ui'
import { courses, programs, workshops } from '../data'
import { programsByType } from '../lib/world-programs'

const VIEWS = [
  { id: 'professional', label: 'Professional' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'short-courses', label: 'Short courses' },
  { id: 'webinars', label: 'Webinars' },
] as const

type ViewId = (typeof VIEWS)[number]['id']

function viewFromSearch(value: string | null, hash = ''): ViewId {
  const fromHash = hash.replace('#', '')
  if (fromHash === 'certificate') return 'certificates'
  if (fromHash === 'professional' || fromHash === 'webinars') return fromHash
  return VIEWS.some((view) => view.id === value) ? (value as ViewId) : 'professional'
}

export default function SkillsPage() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const view = viewFromSearch(params.get('view'), location.hash)

  const professional = useMemo(() => programs.filter((program) => program.programType === 'PROFESSIONAL'), [])
  const certificates = useMemo(() => programs.filter((program) => program.programType === 'CERTIFICATE'), [])
  const ugCount = programsByType('UNDERGRADUATE').length
  const pgCount = programsByType('POSTGRADUATE').length

  const filterOptions = [
    { id: 'professional', label: 'Professional', count: professional.length },
    { id: 'certificates', label: 'Certificates', count: certificates.length },
    { id: 'short-courses', label: 'Short courses', count: courses.length },
    { id: 'webinars', label: 'Webinars', count: workshops.length },
  ]

  function setView(next: string) {
    const paramsNext = new URLSearchParams(params)
    paramsNext.set('view', next)
    setParams(paramsNext, { replace: true })
    setFiltersOpen(false)
  }

  const featured = professional.find((program) => program.slug === 'data-science-ai') ?? professional[0]
  const featuredProjects = featured?.projectsDetail?.length ?? featured?.projects ?? 0
  const featuredHref = featured ? `/programs/${featured.slug}` : '/programs?type=PROFESSIONAL'

  const filter = (
    <FilterPanel
      title="Learn"
      options={filterOptions}
      value={view}
      onChange={setView}
    />
  )

  return (
    <WorldFrame world="learn">
      <ContentRail>
        <ContextHeader
          world="learn"
          eyebrow="Learn"
          title="Build skills you can show."
          description="Filter the catalogue, open a programme, then practise, build, and take the work into Career."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Learn' }]}
          actions={<Link className="product-btn-ghost" to="/programs?type=PROFESSIONAL">All programmes</Link>}
        />

        <div className="product-toolbar">
          <FilterToggle open={filtersOpen} onClick={() => setFiltersOpen(true)} />
          <p className="panel-note" style={{ margin: 0 }}>
            Degree programmes live in University ({ugCount} UG, {pgCount} PG published).
          </p>
        </div>

        <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Learn filters">
          {filter}
        </FilterDrawer>

        <ProductLayout sidebar={filter}>
          {view === 'professional' && (
            <>
              <SectionHeader
                title="Professional programmes"
                description="Longer programmes with projects and assessment. Open one for curriculum and enrollment."
              />
              <ProgrammeList
                items={professional.map((program) => programCard(program, {
                  status: program.slug === featured?.slug ? 'Flagship' : undefined,
                }))}
                empty={<EmptyState title="No professional programmes" description="Nothing is published in this category yet." />}
              />
            </>
          )}

          {view === 'certificates' && (
            <>
              <SectionHeader title="Certificates" description="A credential with a defined curriculum and assessment." />
              <ProgrammeList
                items={certificates.map((program) => programCard(program))}
                empty={<EmptyState title="No certificates published" description="Certificate programmes appear here when they exist in the catalogue." />}
              />
            </>
          )}

          {view === 'short-courses' && (
            <>
              <SectionHeader
                title="Short courses"
                description="Shorter skill courses. Ratings and crossed-out prices are not shown here."
                action={<Link className="product-btn-ghost" to="/courses">Course catalogue</Link>}
              />
              <ProgrammeList
                items={courses.map((course) => ({
                  href: `/courses/${course.slug}`,
                  title: course.title,
                  type: 'Short course',
                  description: course.desc,
                  meta: [course.level, course.duration, course.mode],
                  price: formatInr(course.price),
                  cta: 'Open',
                }))}
                empty={<EmptyState title="No short courses" description="Short courses appear here when published." />}
              />
            </>
          )}

          {view === 'webinars' && (
            <>
              <SectionHeader
                title="Webinars"
                description="Dated sessions appear here when they are published. Registration is not live."
                action={<Link className="product-btn-ghost" to="/workshops">All webinars</Link>}
              />
              <ProgrammeList
                items={workshops.map((workshop) => ({
                  href: `/workshops/${workshop.slug}`,
                  title: workshop.title,
                  type: 'Webinar',
                  description: workshop.desc,
                  meta: [workshop.date, workshop.duration, workshop.mode],
                  price: formatInr(workshop.price),
                  cta: 'Open',
                }))}
                empty={<EmptyState title="No webinars published" description="Webinars appear here when dates are published." />}
              />
            </>
          )}

          {view === 'professional' && !professional.length ? (
            <ComingSoonState title="Coming soon" description="Professional programmes will appear when they are published." />
          ) : null}

          {view === 'professional' && featured ? (
            <>
              <SectionHeader
                title="Learn → practise → build → prove → move"
                description="The loop lives in the programme, not as a homepage story."
              />
              <ProductTable
                headers={['Step', 'What to do', 'Where']}
                rows={[
                  ['Discover', `${professional.length} professional, ${certificates.length} certificate, ${courses.length} short courses, ${workshops.length} webinars.`, 'This page'],
                  ['Choose', `Open ${featured.name} for curriculum and enrollment.`, <Link key="choose" to={featuredHref}>Programme</Link>],
                  ['Practise', 'Labs for experiments. Assessed practice sits inside the programme.', <Link key="labs" to="/labs">Labs</Link>],
                  ['Build', `${featured.name}: ${featuredProjects} published project${featuredProjects === 1 ? '' : 's'}.`, <Link key="build" to={`${featuredHref}#projects`}>Projects</Link>],
                  ['Prove', 'Assessment is on the programme page after you enroll.', <Link key="prove" to={`${featuredHref}#assessment`}>Assessment</Link>],
                  ['Move', 'Take work you can show into Career.', <Link key="move" to="/career">Career</Link>],
                ]}
              />
            </>
          ) : null}
        </ProductLayout>

        {featured ? (
          <StickyActionBar>
            <span>Start with {featured.name}</span>
            <Link className="product-btn" to={featuredHref}>Open programme</Link>
          </StickyActionBar>
        ) : null}
      </ContentRail>
    </WorldFrame>
  )
}
