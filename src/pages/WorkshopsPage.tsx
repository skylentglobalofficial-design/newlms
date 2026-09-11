import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
  ProgrammeList,
  SectionHeader,
  formatInr,
} from '../components/product-ui'
import { workshops } from '../data'

export default function WorkshopsPage() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const category = params.get('category') ?? 'All'

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(workshops.map((workshop) => workshop.category)))],
    [],
  )

  const filtered = useMemo(
    () => workshops.filter((workshop) => category === 'All' || workshop.category === category),
    [category],
  )

  function setCategory(next: string) {
    const nextParams = new URLSearchParams()
    if (next !== 'All') nextParams.set('category', next)
    setParams(nextParams, { replace: true })
    setFiltersOpen(false)
  }

  const filter = (
    <FilterPanel
      title="Topic"
      options={categories.map((item) => ({
        id: item,
        label: item === 'All' ? 'All topics' : item,
        count: item === 'All' ? workshops.length : workshops.filter((workshop) => workshop.category === item).length,
      }))}
      value={category}
      onChange={setCategory}
    />
  )

  return (
    <WorldFrame world="learn">
      <ContentRail>
        <ContextHeader
          world="learn"
          eyebrow="Workshops"
          title="Sessions with a date."
          description="Workshops belong under Learn. Registration is not live yet. Seat counts, discounts, and named instructors are not shown."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Learn', href: '/skills' }, { label: 'Workshops' }]}
          actions={<Link className="product-btn-ghost" to="/skills?view=webinars">Back to Learn</Link>}
        />

        <div className="product-toolbar">
          <FilterToggle open={filtersOpen} onClick={() => setFiltersOpen(true)} />
        </div>

        <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Workshop filters">
          {filter}
        </FilterDrawer>

        <ProductLayout sidebar={workshops.length ? filter : undefined}>
          {!workshops.length ? (
            <ComingSoonState
              title="No workshops published"
              description="Dated sessions will list here when they exist. Nothing is invented to fill this page."
            />
          ) : (
            <>
              <SectionHeader
                title={filtered.length ? `${filtered.length} session${filtered.length === 1 ? '' : 's'}` : 'No matching sessions'}
                description="Date, duration, and format come from the catalogue. Open a session for the outline."
              />
              <ProgrammeList
                items={filtered.map((workshop) => ({
                  href: `/workshops/${workshop.slug}`,
                  title: workshop.title,
                  type: workshop.category,
                  description: workshop.desc,
                  meta: [workshop.date, workshop.duration, workshop.mode],
                  price: formatInr(workshop.price),
                  cta: 'View session',
                }))}
                empty={
                  <EmptyState
                    title="No matching sessions"
                    description="Try another topic."
                    action={<Link className="product-btn-ghost" to="/workshops">All workshops</Link>}
                  />
                }
              />
            </>
          )}
        </ProductLayout>
      </ContentRail>
    </WorldFrame>
  )
}
