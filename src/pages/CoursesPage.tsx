import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { courses } from "../data"
import { coursePublicView } from "../lib/catalog-maturity"
import "./Catalog.css"

export default function CoursesPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [category, setCategory] = useState("All")

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setSearch(q)
  }, [searchParams])

  const views = useMemo(() => courses.map(coursePublicView), [])
  const categories = ["All", ...Array.from(new Set(courses.map((course) => course.category)))]

  const filtered = views.filter((view) => {
    const haystack = `${view.title} ${view.summary}`.toLowerCase()
    const matchSearch = haystack.includes(search.trim().toLowerCase())
    const matchCat = category === "All" || view.course.category === category
    return matchSearch && matchCat
  })

  const ready = filtered.filter((view) => view.maturity === "ready")
  const listings = filtered.filter((view) => view.maturity !== "ready")

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <p className="cat-label">Courses</p>
            <h1>Focused units you can finish.</h1>
            <p className="cat-lead">
              A course is a unit of lessons and practice. Data Analytics is ready to start. Other rows are thinner catalogue listings.
            </p>
            <Link className="cat-text-link" to="/programs">Looking for a longer pathway? See programmes</Link>
            <input
              className="cat-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses"
              aria-label="Search courses"
            />
            <div className="cat-filters" role="group" aria-label="Course category">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={category === item ? "cat-chip is-on" : "cat-chip"}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="cat-section">
          <div className="cat-rail">
            {filtered.length === 0 ? (
              <p className="cat-empty">No courses match these filters.</p>
            ) : (
              <>
                {ready.length > 0 ? (
                  <div className="cat-group">
                    <p className="cat-label">Ready to start</p>
                    <div className="cat-list">
                      {ready.map((view) => (
                        <CourseRow key={view.slug} view={view} />
                      ))}
                    </div>
                  </div>
                ) : null}
                {listings.length > 0 ? (
                  <div className="cat-group">
                    <p className="cat-label">Catalogue listings</p>
                    <p className="cat-fine">These exist in the catalogue and LMS, but they are not as complete as Data Analytics.</p>
                    <div className="cat-list">
                      {listings.map((view) => (
                        <CourseRow key={view.slug} view={view} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  )
}

function CourseRow({ view }: { view: ReturnType<typeof coursePublicView> }) {
  const stats = view.showLiveCurriculum
    ? `${view.stats.lessonCount} lessons · ${view.delivery}`
    : `${view.stats.lessonCount} outline lessons`

  return (
    <Link className="cat-row" to={`/courses/${view.slug}`}>
      <div>
        <span className={view.maturity === "ready" ? "cat-mark cat-mark-ready" : "cat-mark"}>
          {view.maturityLabel}
        </span>
        <h3>{view.title}</h3>
        <p>{view.summary}</p>
        <div className="cat-meta">
          <span>{view.course.level}</span>
          <span>{stats}</span>
        </div>
      </div>
      <span className={view.maturity === "ready" ? "cat-btn cat-btn-primary" : "cat-btn cat-btn-ghost"}>
        {view.ctaLabel}
      </span>
    </Link>
  )
}
