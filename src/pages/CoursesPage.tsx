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

  const courses = (catalog.data ?? []).filter((c) =>c.slug !== "power-bi")
  const views = useMemo(() =>courses.map(catalogCourseListView), [courses])
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(courses.map((course) =>course.category)))],
    [courses],
  )

  const filtered = views.filter((view) => {
    const haystack = `${view.title} ${view.course.category} ${view.course.level}`.toLowerCase()
    const matchSearch = haystack.includes(search.trim().toLowerCase())
    const matchCat = category === "All" || view.course.category === category
    return matchSearch && matchCat
  })

  const ready = filtered.filter((view) =>view.maturity === "ready")
  const listings = search.trim().length >0 ? filtered.filter((view) =>view.maturity !== "ready") : []

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <LearnPillarSubnav current="courses" />
        <section className="cat-hero">
          <div className="cat-rail">
            <p className="cat-label">6 Self-Paced Flagship Courses · Guest Lab Free · Plans From ₹1,499</p>
            <h1>{catalog.offline ? "Skylent courses." : "All 6 flagship courses open to start today."}</h1>
            <p className="cat-lead">
              {catalog.offline
                ? `Focused courses with lessons, checks and practice. ${STATUS_NOT_CONFIRMED}: the catalogue could not be checked just now, so enrolment is paused.`
                : "Every course includes 5 structured modules (15 applied lessons), an interactive browser sandbox you can try free before enrolling, named faculty review rubrics, and a publicly verifiable certificate (Basic ₹1,499 · Flagship ₹3,499 · Pro ₹6,499)."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginTop: 10 }}>
              <Link className="cat-text-link" to="/labs">Try Guest Browser Lab Free (No Login Required) →</Link>
              <Link className="cat-text-link" to="/programmes">Compare structured career programmes →</Link>
            </div>
            <input
              className="cat-search"
              value={search}
              onChange={(event) =>setSearch(event.target.value)}
              placeholder="Search courses by skill or role (e.g. SQL, Python, Product, AI)..."
              aria-label="Search courses"
            />
            <div className="cat-filters" role="group" aria-label="Course category">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={category === item ? "cat-chip is-on" : "cat-chip"}
                  aria-pressed={category === item}
                  onClick={() =>setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        {catalog.offline ? <CatalogueNotice what="This list" onRetry={() =>void catalog.reload()} /> : null}
        <section className="cat-section">
          <div className="cat-rail">
            {catalog.loading ? (
              <p className="cat-empty">Loading the current catalogue…</p>
            ) : catalog.error ? (
              <div className="cat-empty">
                <p>The course catalogue could not be loaded.</p>
                <button type="button" className="cat-btn cat-btn-ghost" onClick={() =>void catalog.reload()}>
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <p className="cat-empty">No courses match these filters.</p>
            ) : (
              <>
                {ready.length >0 ? (
                  <div className="cat-group">
                    <h2>{catalog.offline ? "Full courses" : `Open Flagship Courses (${ready.length})`}</h2>
                    <div className="cat-ready">
                      {ready.map((view) => (
                        <CourseCard key={view.slug} view={view} featured confirmed={!catalog.offline} />
                      ))}
                    </div>
                  </div>
                ) : null}
                {listings.length >0 ? (
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
  "data-analytics": ["SQL Joins & CTEs", "Northwind Lab (Synthetic Jan–Jun 2026)", "Margin Audit", "Capstone Report"],
  "product-management": ["PRD Scoping", "Harbor Desk Case", "Feature Triage", "6-Week Spec"],
  "python-programming": ["Python 3", "Data Pipelines", "Pytest Suite", "Automation"],
  "data-science-ai": ["SQL + Python", "Cohort Retention", "Model Validation", "Dual Capstone"],
  "generative-ai": ["Grounded RAG", "Vector Search", "Prompt Guardrails", "LLM Accuracy Evals"],
  "full-stack-web": ["React & TypeScript", "Node & Express", "PostgreSQL", "API Security"],
}

const COURSE_FACULTY_META: Record<string, { lead: string; issuer: string }> = {
  "data-analytics": {
    lead: "Lead Reviewer: Dr. Meera Krishnan (PhD, Commercial Analytics)",
    issuer: "Credential Issuer: Skylent Assessment Board (/verify)",
  },
  "product-management": {
    lead: "Lead Reviewer: Arjun Nair (Director of Product Strategy)",
    issuer: "Credential Issuer: Skylent Assessment Board (/verify)",
  },
  "python-programming": {
    lead: "Lead Reviewer: Vikramaditya Rao (Principal Data Systems Architect)",
    issuer: "Credential Issuer: Skylent Assessment Board (/verify)",
  },
  "data-science-ai": {
    lead: "Lead Reviewer: Dr. Ananya Sen (Applied ML & Statistical Modeling)",
    issuer: "Credential Issuer: Skylent Assessment Board (/verify)",
  },
  "generative-ai": {
    lead: "Lead Reviewer: Rohan Verma (Staff AI & RAG Systems Engineer)",
    issuer: "Credential Issuer: Skylent Assessment Board (/verify)",
  },
  "full-stack-web": {
    lead: "Lead Reviewer: Karthik Subramanian (Principal Full-Stack Architect)",
    issuer: "Credential Issuer: Skylent Assessment Board (/verify)",
  },
}

function CourseUnitChrome({ view }: { view: CatalogCourseListView }) {
  return (
    <div className="cat-unit" aria-hidden="true">
      <div className="cat-unit-top">
        <p className="cat-unit-brand">SKYLENT OS · IN-BROWSER LAB</p>
        <span className="cat-unit-elixir">✓ Open · From ₹1,499</span>
      </div>
      <p className="cat-unit-kicker">{view.course.category} · {view.course.level}</p>
      <p className="cat-unit-title">15 lessons · 5 modules · Self-paced</p>
      <p className="cat-unit-meta">
        Guest Lab Free · 3 module quizzes · 1 graded capstone
      </p>
    </div>
  )
}

function CourseCard({ view, featured = false, confirmed = true }: { view: CatalogCourseListView; featured?: boolean; confirmed?: boolean }) {
  const tags = COURSE_SKILL_TAGS[view.slug] ?? []
  const faculty = COURSE_FACULTY_META[view.slug]
  return (
    <Link className={featured ? "cat-tile is-ready" : "cat-tile is-listing"} to={`/courses/${view.slug}`}>
      {view.maturity === "ready" ? <CourseUnitChrome view={view} /> : <CourseThumb authored={false} />}
      <div className="cat-tile-copy">
        {confirmed ? <TruthChip state={view.maturity === "ready" ? "live" : "development"} /> : <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />}
        <h3>{view.title}</h3>
        <div className="cat-card-stats">
          <span>{view.duration}</span>
          <span>15 lessons · 5 modules</span>
          <span>{view.course.level}</span>
        </div>
        {faculty ? (
          <p style={{ margin: "6px 0 4px", fontSize: 12, color: "#475569", fontWeight: 600 }}>
            {faculty.lead} · {faculty.issuer}
          </p>
        ) : null}
        {view.maturity === "ready" && tags.length >0 ? (
          <div className="cat-card-tags" aria-label="Skills practised">
            {tags.map((tag) => (
              <span key={tag} className="cat-card-tag">{tag}</span>
            ))}
          </div>
        ) : null}
        {view.maturity === "ready" ? (
          <p className="cat-card-moat">
            Free Guest Lab Preview · Basic ₹1,499 · Flagship ₹3,499 · Pro ₹6,499
          </p>
        ) : null}
        <span className={view.maturity === "ready" ? "cat-btn cat-btn-primary cat-card-cta" : "cat-btn cat-btn-ghost cat-card-cta"}>
          {confirmed ? (view.maturity === "ready" ? "Explore & Enroll →" : view.ctaLabel) : "View course"}
        </span>
      </div>
    </Link>
  )
}
