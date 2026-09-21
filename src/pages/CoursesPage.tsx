import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import {
  HarborDeskWorkspace,
  NorthwindWorkspace,
} from "../components/product/ProductLanguage"
import { courses } from "../data"
import { coursePublicView } from "../lib/catalog-maturity"
import { courseProductProfile } from "../lib/course-product"
import "./CoursesPage.css"

const HERO_IMAGE =
  "https://images.pexels.com/photos/7742816/pexels-photo-7742816.jpeg?auto=compress&dpr=1&w=1600"

function FeaturedCourse({
  view,
  index,
}: {
  view: ReturnType<typeof coursePublicView>
  index: number
}) {
  const profile = courseProductProfile(view.slug)
  const visual = profile?.visual === "harbor-desk" ? "harbor-desk" : "northwind"

  return (
    <article className={"courses-feature " + (index % 2 ? "is-reverse" : "")}>
      <div className="courses-feature-copy">
        <p className="courses-label">0{index + 1} · Ready now</p>
        <h2>{view.title}</h2>
        <p className="courses-feature-lead">{view.summary}</p>

        <div className="courses-facts">
          <span>{view.duration}</span>
          <span>{view.stats.lessonCount} lessons</span>
          <span>{view.course.level}</span>
          <span>Self-paced</span>
        </div>

        <p className="courses-price">
          <strong>₹{view.listedPrice.toLocaleString("en-IN")}</strong>
          <span>listed price · payment is not collected here yet</span>
        </p>

        <Link className="courses-arrow" to={`/courses/${view.slug}`}>
          Open course <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="courses-feature-visual">
        {visual === "harbor-desk" ? (
          <HarborDeskWorkspace compact meta="Product case · evidence → specification" />
        ) : (
          <NorthwindWorkspace compact />
        )}
      </div>
    </article>
  )
}

function CatalogueRow({ view }: { view: ReturnType<typeof coursePublicView> }) {
  const authored = view.maturity === "ready"

  return (
    <Link className="courses-row" to={`/courses/${view.slug}`}>
      <span className="courses-row-status">{authored ? "Ready" : view.maturityLabel}</span>
      <strong>{view.title}</strong>
      <span>{view.course.category}</span>
      <span>{authored ? `${view.stats.lessonCount} lessons` : "Outline"}</span>
      <span aria-hidden="true">→</span>
    </Link>
  )
}

export default function CoursesPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [category, setCategory] = useState("All")

  useEffect(() => {
    const q = searchParams.get("q")
    if (q !== null) setSearch(q)
  }, [searchParams])

  const views = useMemo(() => courses.map(coursePublicView), [])
  const categories = ["All", ...Array.from(new Set(courses.map((course) => course.category)))]
  const filtered = views.filter((view) => {
    const q = search.trim().toLowerCase()
    const haystack = `${view.title} ${view.summary} ${view.course.category}`.toLowerCase()
    return (!q || haystack.includes(q)) && (category === "All" || view.course.category === category)
  })

  const ready = filtered.filter((view) => view.maturity === "ready")
  const listings = filtered.filter((view) => view.maturity !== "ready")

  return (
    <PageShell aurora={false}>
      <div className="courses-editorial">
        <section className="courses-hero" aria-labelledby="courses-title">
          <div className="courses-rail courses-hero-grid">
            <div className="courses-hero-copy">
              <p className="courses-eyebrow"><i aria-hidden="true" /> Course catalogue</p>
              <h1 id="courses-title">Learn one skill.<br />Use it in the work.</h1>
              <p className="courses-hero-lead">
                Focused, self-paced courses inside Skylent OS. Start with the teaching that is authored today,
                practise against real-shaped material, and keep the work you produce.
              </p>
              <div className="courses-hero-actions">
                <a className="courses-primary" href="#courses-ready">See ready courses <span aria-hidden="true">↘</span></a>
                <Link className="courses-secondary" to="/programs">Explore programmes</Link>
              </div>
              <div className="courses-hero-meta">
                <span>{ready.length} ready to start</span>
                <span>Written learning</span>
                <span>Work-led practice</span>
              </div>
            </div>

            <figure className="courses-hero-photo">
              <img src={HERO_IMAGE} alt="Students working together on laptops in a classroom" />
              <figcaption>
                <span>01</span>
                <strong>Learn → practise → keep</strong>
                <em>A course is a focused unit inside the larger Skylent system.</em>
              </figcaption>
            </figure>
          </div>
        </section>

        <nav className="courses-railbar" aria-label="Course catalogue sections">
          <div className="courses-rail">
            <a href="#courses-ready">Ready courses</a>
            <a href="#courses-catalogue">Catalogue</a>
            <a href="#courses-filter">Find a course</a>
          </div>
        </nav>

        <section className="courses-section" id="courses-ready" aria-labelledby="courses-ready-title">
          <div className="courses-rail">
            <div className="courses-section-head">
              <div>
                <p className="courses-label">Start here</p>
                <h2 id="courses-ready-title">The courses that are actually taught.</h2>
              </div>
              <p>These are the authored courses connected to Skylent OS today. The interface shows the real teaching surface rather than a brochure promise.</p>
            </div>

            {ready.length > 0 ? (
              <div className="courses-feature-list">
                {ready.map((view, index) => <FeaturedCourse key={view.slug} view={view} index={index} />)}
              </div>
            ) : (
              <p className="courses-empty">No authored course matches this search.</p>
            )}
          </div>
        </section>

        <section className="courses-method" aria-labelledby="courses-method-title">
          <div className="courses-rail courses-method-grid">
            <div>
              <p className="courses-label">Course anatomy</p>
              <h2 id="courses-method-title">A course should leave you with more than a completion state.</h2>
            </div>
            <div className="courses-method-list">
              <div><span>01</span><strong>Learn</strong><p>Written lessons establish the concept.</p></div>
              <div><span>02</span><strong>Check</strong><p>Knowledge checks make understanding visible.</p></div>
              <div><span>03</span><strong>Practise</strong><p>Assignments move the idea into applied work.</p></div>
              <div><span>04</span><strong>Keep</strong><p>The resulting work stays in your workspace.</p></div>
            </div>
          </div>
        </section>

        <section className="courses-catalogue" id="courses-catalogue" aria-labelledby="courses-catalogue-title">
          <div className="courses-rail">
            <div className="courses-section-head">
              <div>
                <p className="courses-label">Full catalogue</p>
                <h2 id="courses-catalogue-title">Everything currently listed.</h2>
              </div>
              <p>Catalogue maturity stays visible. A listing is not presented as authored teaching until the content actually exists.</p>
            </div>

            <div className="courses-filter" id="courses-filter">
              <label>
                <span>Search</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search courses"
                  aria-label="Search courses"
                />
              </label>
              <div className="courses-categories" role="group" aria-label="Course category">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={category === item ? "is-on" : ""}
                    aria-pressed={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="courses-table">
              {filtered.length === 0 ? (
                <p className="courses-empty">No courses match these filters.</p>
              ) : (
                <>
                  {listings.length > 0 ? (
                    <div className="courses-listing-note">
                      <strong>Catalogue listings</strong>
                      <span>These outlines exist, but are not represented as fully authored teaching yet.</span>
                    </div>
                  ) : null}
                  {filtered.map((view) => <CatalogueRow key={view.slug} view={view} />)}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="courses-final" aria-labelledby="courses-final-title">
          <div className="courses-rail courses-final-inner">
            <div>
              <p className="courses-label">Choose your depth</p>
              <h2 id="courses-final-title">Need one skill? Start with a course. Need a longer path? Choose a programme.</h2>
            </div>
            <div className="courses-final-actions">
              <a className="courses-primary" href="#courses-ready">Browse courses <span aria-hidden="true">↗</span></a>
              <Link className="courses-secondary" to="/programs">See programmes</Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
