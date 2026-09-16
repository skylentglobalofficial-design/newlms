import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { CourseProductVisual, CourseThumb, CourseWorkspacePreview } from "../components/product/ProductLanguage"
import { courses } from "../data"
import { coursePublicView } from "../lib/catalog-maturity"
import { courseProductProfile, FLAGSHIP_COURSE_SLUG } from "../lib/course-product"
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

  const flagship = courses.find((course) => course.slug === FLAGSHIP_COURSE_SLUG)
  const flagshipView = flagship ? coursePublicView(flagship) : null

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail cat-hero-split">
            <div>
            <h1>Focused units you can finish.</h1>
            <p className="cat-lead">
              A course is a unit of lessons and practice. Data Analytics and Product Management are ready to start. Other listings are thinner catalogue items.
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
            {flagship && flagshipView ? (
              <div className="cat-hero-visual">
                <CourseWorkspacePreview
                  courseTitle={flagship.title}
                  lessonTitle={flagship.modules[0]?.lessons[0]?.title ?? "Open the first lesson"}
                  practiceTitle={flagship.modules.flatMap((module) => module.lessons).find((lesson) => lesson.type === "quiz")?.title ?? "A short check"}
                  workTitle={flagship.modules.flatMap((module) => module.lessons).find((lesson) => /capstone/i.test(lesson.title))?.title ?? "Capstone"}
                  modules={flagship.modules.map((module) => module.title)}
                  lessonCount={flagshipView.stats.lessonCount}
                  visual="northwind"
                />
              </div>
            ) : null}
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
                    <h2>Catalogue listings</h2>
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

function CourseCard({ view, featured = false }: { view: ReturnType<typeof coursePublicView>; featured?: boolean }) {
  const stats = view.showLiveCurriculum
    ? `${view.stats.lessonCount} lessons · ${view.stats.quizCount} quizzes · ${view.stats.assignmentCount} assignments`
    : `${view.stats.lessonCount} outline items`
  const profile = courseProductProfile(view.slug)

  return (
    <Link className={featured ? "cat-feature" : "cat-tile"} to={`/courses/${view.slug}`}>
      {featured ? (
        <div className="cat-feature-stage">
          {profile ? <CourseProductVisual visual={profile.visual} compact /> : <CourseThumb authored={false} />}
        </div>
      ) : (
        <CourseThumb authored={view.showLiveCurriculum} visual={profile?.visual ?? "northwind"} />
      )}
      <div className="cat-tile-copy">
        <span className={view.maturity === "ready" ? "cat-mark cat-mark-ready" : "cat-mark"}>
          {view.maturityLabel}
        </span>
        <h3>{view.title}</h3>
        <p>{view.summary}</p>
        <p className="cat-tile-meta">
          {view.course.category}
          {" · "}
          {view.course.level}
          {" · "}
          {view.showLiveCurriculum ? view.duration : "Duration not finished"}
          {" · "}
          {stats}
        </p>
        <span className={view.maturity === "ready" ? "cat-btn cat-btn-primary cat-card-cta" : "cat-btn cat-btn-ghost cat-card-cta"}>
          {view.ctaLabel}
        </span>
      </div>
    </Link>
  )
}
