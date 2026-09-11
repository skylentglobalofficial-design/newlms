import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EnrollmentModal } from '../components/shared'
import WorldFrame from '../components/world/WorldFrame'
import {
  ContentRail,
  ContextHeader,
  CurriculumNav,
  EmptyState,
  ProductLayout,
  StickyActionBar,
  formatInr,
} from '../components/product-ui'
import { courses } from '../data'
import { useCatalogCourse } from '../hooks/useCatalog'

export default function CourseDetailPage() {
  const { slug } = useParams()
  const course = courses.find((item) => item.slug === slug)
  const catalog = useCatalogCourse(slug)
  const [openModule, setOpenModule] = useState<string | null>(course?.modules[0]?.id ?? null)
  const [enrollOpen, setEnrollOpen] = useState(false)

  if (!course) {
    return (
      <WorldFrame world="learn">
        <ContentRail>
          <EmptyState
            title="Course not found"
            description="That course is not in the catalogue."
            action={<Link className="product-btn-ghost" to="/courses">Back to courses</Link>}
          />
        </ContentRail>
      </WorldFrame>
    )
  }

  const price = catalog.data?.price ?? course.price
  const lessonCount = catalog.data?.lessonCount ?? course.lessons
  const projectCount = catalog.data?.projectCount ?? course.projects
  const enrollable = Boolean(catalog.data)
  const ctaLabel = catalog.loading ? 'Checking availability…' : enrollable ? 'Start learning' : 'Enrollment unavailable'

  function openEnroll() {
    if (!catalog.loading) setEnrollOpen(true)
  }

  return (
    <WorldFrame world="learn">
      <ContentRail>
        <ContextHeader
          world="learn"
          eyebrow="Course"
          title={course.title}
          description={course.longDesc}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Courses', href: '/courses' },
            { label: course.title },
          ]}
          actions={
            <>
              <button type="button" className="product-btn" disabled={catalog.loading} onClick={openEnroll}>{ctaLabel}</button>
              <Link className="product-btn-ghost" to="/programs">Explore programmes</Link>
            </>
          }
        />

        <p className="programme-meta" style={{ marginTop: -8, marginBottom: 18 }}>
          <span>{course.category}</span>
          <span>{course.level}</span>
          <span>{course.duration}</span>
          <span>{course.mode}</span>
        </p>

        <ProductLayout
          variant="pdp"
          sidebar={
            <div>
              <h2 className="product-filter-title">Course summary</h2>
              <p style={{ margin: '0 0 8px', fontSize: '1.45rem', fontWeight: 750, letterSpacing: '-0.03em' }}>
                {formatInr(price)}
              </p>
              <ul className="assessment-list">
                <li><strong>Duration</strong><span className="product-count">{course.duration}</span></li>
                <li><strong>Format</strong><span className="product-count">{course.mode}</span></li>
                <li><strong>Lessons</strong><span className="product-count">{lessonCount}</span></li>
                <li><strong>Projects</strong><span className="product-count">{projectCount}</span></li>
              </ul>
              <p className="panel-note">Opens in the LMS after you enroll. This is a course, not a programme.</p>
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                <button type="button" className="product-btn" disabled={catalog.loading} onClick={openEnroll}>{ctaLabel}</button>
                <Link className="product-btn-ghost" to="/courses">All courses</Link>
              </div>
            </div>
          }
        >
          <section className="pdp-block">
            <h2>Who it is for</h2>
            <ul>
              {course.forWhom.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section className="pdp-block">
            <h2>What you will cover</h2>
            <ul>
              {course.outcomes.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section id="modules" className="pdp-block">
            <h2>Modules</h2>
            <CurriculumNav
              items={course.modules.map((mod) => ({
                id: mod.id,
                label: mod.title,
                meta: `${mod.lessons.length} lesson${mod.lessons.length === 1 ? '' : 's'}`,
              }))}
              current={openModule ?? undefined}
            />
            <div style={{ marginTop: 12 }}>
              {course.modules.map((mod) => {
                const open = openModule === mod.id
                return (
                  <div key={mod.id} id={`module-${mod.id}`} className="workspace-block" style={{ marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => setOpenModule(open ? null : mod.id)}
                      aria-expanded={open}
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 12, background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
                    >
                      <strong>{mod.title}</strong>
                      <span className="product-count">{mod.lessons.length} lessons</span>
                    </button>
                    {open ? (
                      <ul>
                        {mod.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            {lesson.title}
                            {lesson.duration ? ` · ${lesson.duration}` : ''}
                            {' · '}
                            {lesson.type}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        </ProductLayout>
      </ContentRail>

      <StickyActionBar>
        <div>
          <strong>{course.title}</strong>
          <div className="panel-note" style={{ margin: 0 }}>{formatInr(price)} · {course.duration}</div>
        </div>
        <button type="button" className="product-btn" disabled={catalog.loading} onClick={openEnroll}>
          {ctaLabel}
        </button>
      </StickyActionBar>

      {enrollOpen && (
        <EnrollmentModal
          item={{ kind: 'course', slug: course.slug, title: course.title, price, enrollable }}
          onClose={() => setEnrollOpen(false)}
          themeId="professional"
        />
      )}
    </WorldFrame>
  )
}
