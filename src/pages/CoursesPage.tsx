import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, SectionHeading, SearchField, Select, EmptyState, Button, ButtonLink } from '../design/primitives'
import { CourseCard } from '../design/CatalogueCard'
import { S, TY } from '../design/tokens'
import { publishedLessonCount } from '../lib/catalogue-status'
import { courses } from '../data'
import type { Course } from '../data'

const ALL = 'all'

function categoryOptions() {
  const present = [...new Set(courses.map(course => course.category))].filter(Boolean)
  return [{ value: ALL, label: 'All subjects' }, ...present.map(item => ({ value: item, label: item }))]
}

function levelOptions() {
  const present = [...new Set(courses.map(course => course.level))].filter(Boolean)
  return [{ value: ALL, label: 'All levels' }, ...present.map(item => ({ value: item, label: item }))]
}

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? ALL)
  const [level, setLevel] = useState(ALL)

  useEffect(() => {
    const next = searchParams.get('q')
    if (next) setQuery(next)
  }, [searchParams])

  const { published, unpublished, total } = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = courses.filter(course => {
      if (category !== ALL && course.category !== category) return false
      if (level !== ALL && course.level !== level) return false
      if (needle && !`${course.title} ${course.desc} ${course.category}`.toLowerCase().includes(needle)) return false
      return true
    })

    const withLessons: Course[] = []
    const withoutLessons: Course[] = []
    for (const course of matches) {
      if (publishedLessonCount(course.slug) > 0) withLessons.push(course)
      else withoutLessons.push(course)
    }
    return { published: withLessons, unpublished: withoutLessons, total: matches.length }
  }, [query, category, level])

  const filtersActive = query.trim() !== '' || category !== ALL || level !== ALL

  function reset() {
    setQuery('')
    setCategory(ALL)
    setLevel(ALL)
    setSearchParams({}, { replace: true })
  }

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Learn"
          title="Courses"
          lead="Self-paced courses that open in the learning platform as soon as you enrol. Lesson counts below are the lessons actually published. Search programmes and courses together on Learn."
          actions={<ButtonLink to="/skills" variant="secondary">Learn discovery</ButtonLink>}
        />

        <div className="sk-filterbar">
          <SearchField value={query} onChange={setQuery} placeholder="Search courses" />
          <Select value={category} onChange={setCategory} options={categoryOptions()} ariaLabel="Filter by subject" />
          <Select value={level} onChange={setLevel} options={levelOptions()} ariaLabel="Filter by level" />
          <span className="sk-filterbar-spacer" />
          <span style={{ ...TY.bodySm, color: S.inkMuted, whiteSpace: 'nowrap' }}>
            {total} of {courses.length}
          </span>
          {filtersActive && <Button variant="quiet" size="sm" onClick={reset}>Clear</Button>}
        </div>

        {total === 0 ? (
          <div style={{ paddingBottom: 64 }}>
            <EmptyState
              title="No courses match those filters"
              body="Try a broader search, or clear the filters to see every course."
              action={<Button onClick={reset}>Clear filters</Button>}
            />
          </div>
        ) : (
          <div style={{ paddingBottom: 64 }}>
            {published.length > 0 && (
              <section style={{ marginBottom: unpublished.length > 0 ? 44 : 0 }}>
                <div className="sk-grid sk-grid-3">
                  {published.map(course => (
                    <CourseCard key={course.slug} course={course} />
                  ))}
                </div>
              </section>
            )}

            {unpublished.length > 0 && (
              <section>
                <SectionHeading
                  size="sm"
                  title="No lessons published yet"
                  lead="These are listed in the catalogue but have nothing to open in the learning platform."
                />
                <div className="sk-grid sk-grid-3">
                  {unpublished.map(course => (
                    <CourseCard key={course.slug} course={course} compact />
                  ))}
                </div>
              </section>
            )}

            <div style={{ marginTop: 44, paddingTop: 26, borderTop: `1px solid ${S.line}`, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: '1 1 320px' }}>
                Want a longer, structured path instead of a single course? Programmes bundle a syllabus, projects and a
                completion certificate.
              </p>
              <ButtonLink to="/programs" variant="secondary" size="sm">Browse programmes</ButtonLink>
            </div>
          </div>
        )}
      </Rail>
    </ProductShell>
  )
}
