import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { LearnPillarSubnav } from "../components/product/Architecture"
import { CourseThumb } from "../components/product/ProductLanguage"
import { TruthChip } from "../components/skylent/primitives"
import { catalogCourseListView, type CatalogCourseListView } from "../lib/catalog-maturity"
import { useCatalogCourses } from "../hooks/useCatalog"
import CatalogueNotice, { STATUS_NOT_CONFIRMED } from "../components/programme/CatalogueNotice"
import "./Catalog.css"

export default function CoursesPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [category, setCategory] = useState("All")
  const catalog = useCatalogCourses()

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setSearch(q)
  }, [searchParams])

  const courses = catalog.data ?? []
  const views = useMemo(() => courses.map(catalogCourseListView), [courses])
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(courses.map((course) => course.category)))],
    [courses],
  )

  const filtered = views.filter((view) => {
    const haystack = `${view.title} ${view.course.category} ${view.course.level}`.toLowerCase()
    const matchSearch = haystack.includes(search.trim().toLowerCase())
    const matchCat = category === "All" || view.course.category === category
    return matchSearch && matchCat
  })

  const ready = filtered.filter((view) => view.maturity === "ready")
  const listings = filtered.filter((view) => view.maturity !== "ready")

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <div className="cat-pillar-bar">
          <div className="cat-rail">
            <LearnPillarSubnav current="courses" />
          </div>
        </div>
        <section className="cat-hero">
          <div className="cat-rail">
            <h1>{catalog.offline ? "Skylent courses." : "Courses you can start this week."}</h1>
            <p className="cat-lead">
              {catalog.offline
                ? `Focused courses with lessons, checks and practice. ${STATUS_NOT_CONFIRMED}: the catalogue could not be checked just now, so enrolment is paused.`
                : "All 6 flagship courses are open now — each with 5 modules, 15 lessons, in-browser labs, and a graded capstone."}
            </p>
            <Link className="cat-text-link" to="/programmes">Looking for a longer pathway? See programmes</Link>
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

        {catalog.offline ? <CatalogueNotice what="This list" onRetry={() => void catalog.reload()} /> : null}
        <section className="cat-section">
          <div className="cat-rail">
            {catalog.loading ? (
              <p className="cat-empty">Loading the current catalogue…</p>
            ) : catalog.error ? (
              <div className="cat-empty">
                <p>The course catalogue could not be loaded.</p>
                <button type="button" className="cat-btn cat-btn-ghost" onClick={() => void catalog.reload()}>
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <p className="cat-empty">No courses match these filters.</p>
            ) : (
              <>
                {ready.length > 0 ? (
                  <div className="cat-group">
                    <h2>{catalog.offline ? "Full courses" : "Open now"}</h2>
                    <div className="cat-ready">
                      {ready.map((view) => (
                        <CourseCard key={view.slug} view={view} featured confirmed={!catalog.offline} />
                      ))}
                    </div>
                  </div>
                ) : null}
                {listings.length > 0 ? (
                  <div className="cat-group">
                    <h2>{catalog.offline ? "Course outlines" : "Opening soon"}</h2>
                    <p className="cat-fine">Outlines are published; enrolment opens when the lessons are ready.</p>
                    <div className="cat-grid">
                      {listings.map((view) => (
                        <CourseCard key={view.slug} view={view} confirmed={!catalog.offline} />
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

const COURSE_SKILL_TAGS: Record<string, readonly string[]> = {
  "data-analytics": ["SQL", "Northwind Lab", "Margin Analysis", "Cold Calls"],
  "product-management": ["PRD Scoping", "Harbor Desk Case", "Triage", "Cold Calls"],
  "python-programming": ["Python 3", "Data Pipelines", "Pytest", "Automation"],
  "data-science-ai": ["EDA", "Feature Engineering", "Model Validation", "Cold Calls"],
  "generative-ai": ["Prompt Systems", "Grounded RAG", "ReAct Agents", "Eval Rubrics"],
  "full-stack-web": ["React & TypeScript", "Node & Express", "PostgreSQL", "API Security"],
}

function CourseUnitChrome({ view }: { view: CatalogCourseListView }) {
  return (
    <div className="cat-unit" aria-hidden="true">
      <div className="cat-unit-top">
        <p className="cat-unit-brand">Skylent OS · Proof of Work</p>
        <span className="cat-unit-elixir">Self-paced</span>
      </div>
      <p className="cat-unit-kicker">{view.course.category} · {view.course.level}</p>
      <p className="cat-unit-title">{view.countLabel}</p>
      <p className="cat-unit-meta">
        3 module quizzes · Applied briefs · 1 graded capstone
      </p>
    </div>
  )
}

function CourseCard({ view, featured = false, confirmed = true }: { view: CatalogCourseListView; featured?: boolean; confirmed?: boolean }) {
  const tags = COURSE_SKILL_TAGS[view.slug] ?? []
  return (
    <Link className={featured ? "cat-tile is-ready" : "cat-tile is-listing"} to={`/courses/${view.slug}`}>
      {view.maturity === "ready" ? <CourseUnitChrome view={view} /> : <CourseThumb authored={false} />}
      <div className="cat-tile-copy">
        {confirmed ? <TruthChip state={view.maturity === "ready" ? "live" : "development"} /> : <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />}
        <h3>{view.title}</h3>
        <div className="cat-card-stats">
          <span>{view.duration}</span>
          <span>{view.lessonLabel}</span>
          <span>{view.course.level}</span>
        </div>
        {view.maturity === "ready" && tags.length > 0 ? (
          <div className="cat-card-tags" aria-label="Skills practised">
            {tags.map((tag) => (
              <span key={tag} className="cat-card-tag">{tag}</span>
            ))}
          </div>
        ) : null}
        {view.maturity === "ready" ? (
          <p className="cat-card-moat">
            Written lessons · In-browser lab · Graded capstone
          </p>
        ) : null}
        <span className={view.maturity === "ready" ? "cat-btn cat-btn-primary cat-card-cta" : "cat-btn cat-btn-ghost cat-card-cta"}>
          {confirmed ? view.ctaLabel : "View course"}
        </span>
      </div>
    </Link>
  )
}
