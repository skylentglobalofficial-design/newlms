import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { CourseThumb } from "../components/product/ProductLanguage"
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
            <h1>Courses you can start this week.</h1>
            <p className="cat-lead">
              Focused learning units in Skylent OS. Data Analytics and Product Management are ready to enrol;
              the rest are thinner catalogue listings.
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
                    <h2>Ready to start</h2>
                    <div className="cat-ready">
                      {ready.map((view) => (
                        <CourseCard key={view.slug} view={view} featured />
                      ))}
                    </div>
                  </div>
                ) : null}
                {listings.length > 0 ? (
                  <div className="cat-group">
                    <h2>Thinner listings</h2>
                    <p className="cat-fine">These exist in the catalogue and LMS, but they are not as complete as the ready courses.</p>
                    <div className="cat-grid">
                      {listings.map((view) => (
                        <CourseCard key={view.slug} view={view} />
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

function CourseUnitChrome({ view }: { view: ReturnType<typeof coursePublicView> }) {
  const firstModule = view.course.modules[0]
  const firstLesson =
    firstModule?.lessons.find((lesson) => lesson.type !== "quiz" && lesson.type !== "assignment") ??
    firstModule?.lessons[0]

  return (
    <div className="cat-unit" aria-hidden="true">
      <p className="cat-unit-brand">Skylent OS</p>
      <p className="cat-unit-kicker">{firstModule?.title ?? "Course"}</p>
      <p className="cat-unit-title">{firstLesson?.title ?? "Open the first lesson"}</p>
      <p className="cat-unit-meta">
        {view.stats.lessonCount} lessons · {view.stats.quizCount} checks · self-paced
      </p>
    </div>
  )
}

function CourseCard({ view, featured = false }: { view: ReturnType<typeof coursePublicView>; featured?: boolean }) {
  const duration = view.showLiveCurriculum ? view.duration : "Duration TBA"
  const lessons = view.showLiveCurriculum
    ? `${view.stats.lessonCount} lessons`
    : `${view.stats.lessonCount} outline items`

  return (
    <Link className={featured ? "cat-tile is-ready" : "cat-tile is-listing"} to={`/courses/${view.slug}`}>
      {view.showLiveCurriculum ? <CourseUnitChrome view={view} /> : <CourseThumb authored={false} />}
      <div className="cat-tile-copy">
        <span className={view.maturity === "ready" ? "cat-mark cat-mark-ready" : "cat-mark"}>
          {view.maturity === "ready" ? "Ready" : view.maturityLabel}
        </span>
        <h3>{view.title}</h3>
        <div className="cat-card-stats">
          <span>{duration}</span>
          <span>{lessons}</span>
          <span>{view.course.level}</span>
        </div>
        <p className="cat-card-price">₹{view.listedPrice.toLocaleString("en-IN")}</p>
        <span className={view.maturity === "ready" ? "cat-btn cat-btn-primary cat-card-cta" : "cat-btn cat-btn-ghost cat-card-cta"}>
          {view.ctaLabel}
        </span>
      </div>
    </Link>
  )
}
