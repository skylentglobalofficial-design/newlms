import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import {
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
import { courses } from '../data'
import { catalogCourseBySlug } from '../lib/catalog-api'
import { useCatalogCourses } from '../hooks/useCatalog'

export default function CoursesPage() {
  const catalog = useCatalogCourses()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [query, setQuery] = useState(() => params.get('q') ?? '')
  const [category, setCategory] = useState(() => params.get('category') ?? 'All')
  const [level, setLevel] = useState(() => params.get('level') ?? 'All')

  useEffect(() => {
    setQuery(params.get('q') ?? '')
    setCategory(params.get('category') ?? 'All')
    setLevel(params.get('level') ?? 'All')
  }, [params])

  const categories = useMemo(() => ['All', ...Array.from(new Set(courses.map((course) => course.category)))], [])
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter((course) => {
      if (category !== 'All' && course.category !== category) return false
      if (level !== 'All' && course.level !== level) return false
      if (q && !`${course.title} ${course.desc} ${course.category}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [category, level, query])

  function update(nextCategory: string, nextLevel = level, nextQuery = query) {
    setCategory(nextCategory)
    setLevel(nextLevel)
    setQuery(nextQuery)
    const next = new URLSearchParams()
    if (nextQuery.trim()) next.set('q', nextQuery.trim())
    if (nextCategory !== 'All') next.set('category', nextCategory)
    if (nextLevel !== 'All') next.set('level', nextLevel)
    setParams(next, { replace: true })
    setFiltersOpen(false)
  }

  const filter = (
    <>
      <FilterPanel
        title="Category"
        options={categories.map((item) => ({
          id: item,
          label: item === 'All' ? 'All categories' : item,
          count: item === 'All' ? courses.length : courses.filter((course) => course.category === item).length,
        }))}
        value={category}
        onChange={(id) => update(id, level, query)}
      />
      <div style={{ marginTop: 18 }}>
        <FilterPanel
          title="Level"
          options={levels.map((item) => ({
            id: item,
            label: item === 'All' ? 'All levels' : item,
            count: item === 'All' ? courses.length : courses.filter((course) => course.level === item).length,
          }))}
          value={level}
          onChange={(id) => update(category, id, query)}
        />
      </div>
    </>
  )

  return (
    <WorldFrame world="learn">
      <ContentRail>
        <ContextHeader
          world="learn"
          eyebrow="Courses"
          title="Start learning."
          description="Courses are LMS content — lessons, modules, and projects. Programmes are the longer purchase path. This list is not a programme catalogue."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Learn', href: '/skills' }, { label: 'Courses' }]}
          actions={<Link className="product-btn-ghost" to="/programs">Explore programmes</Link>}
        />

        <div className="product-toolbar">
          <FilterToggle open={filtersOpen} onClick={() => setFiltersOpen(true)} />
          <form className="product-search" onSubmit={(event) => { event.preventDefault(); update(category, level, query) }}>
            <label className="visually-hidden" htmlFor="course-search">Search courses</label>
            <input
              id="course-search"
              type="search"
              value={query}
              onChange={(event) => update(category, level, event.target.value)}
              placeholder="Search courses"
            />
          </form>
        </div>

        <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Course filters">
          {filter}
        </FilterDrawer>

        <ProductLayout sidebar={filter}>
          <SectionHeader
            title={filtered.length ? `${filtered.length} course${filtered.length === 1 ? '' : 's'}` : 'No matching courses'}
            description="Open a course for modules and enrollment. Ratings and crossed-out prices are not shown."
          />
          <ProgrammeList
            items={filtered.map((course) => {
              const facts = catalogCourseBySlug(catalog.data, course.slug)
              return {
                href: `/courses/${course.slug}`,
                title: course.title,
                type: course.category,
                description: course.desc,
                meta: [course.level, course.duration, course.mode, `${facts?.lessonCount ?? course.lessons} lessons`],
                price: formatInr(facts?.price ?? course.price),
                cta: 'Open course',
              }
            })}
            empty={
              <EmptyState
                title="No matching courses"
                description="Try another category or level. Empty is better than invented inventory."
                action={<Link className="product-btn-ghost" to="/courses">Clear filters</Link>}
              />
            }
          />
        </ProductLayout>
      </ContentRail>
    </WorldFrame>
  )
}
