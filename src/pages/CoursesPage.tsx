import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageShell } from "../components/shared"
import { LearnPillarSubnav } from "../components/product/Architecture"
import { catalogCourseListView, type CatalogCourseListView } from "../lib/catalog-maturity"
import { useCatalogCourses } from "../hooks/useCatalog"
import CatalogueNotice, { STATUS_NOT_CONFIRMED } from "../components/programme/CatalogueNotice"
import photoAnalytics from "@/assets/site/home/program-analytics-800.webp"
import photoProduct from "@/assets/site/home/program-product-800.webp"
import photoScience from "@/assets/site/home/program-web-800.webp"
import photoClass from "@/assets/site/home/hero-classroom-960.webp"
import photoCampusPg from "@/assets/site/home/degree-management-960.webp"
import heroStudent720 from "@/assets/site/home/hero-student-720.webp"
import "./Catalog.css"

export const COURSE_SKILL_TAGS: Record<string, readonly string[]> = {
  "data-analytics": ["SQL Joins & CTEs", "Spreadsheet Analysis", "Dashboards"],
  "product-management": ["User Research", "Problem Framing", "Product Specs"],
  "python-programming": ["Python 3", "Data Pipelines", "Pytest"],
  "data-science-ai": ["SQL + Python", "Cohort Retention", "Model Validation"],
  "generative-ai": ["RAG Pipelines", "Prompt Guardrails", "LLM Evaluation"],
  "full-stack-web": ["React & TypeScript", "Node & Express", "PostgreSQL"],
}

const COURSE_SUMMARIES: Record<string, string> = {
  "data-analytics": "Query multi-table business data in SQL, audit margins in spreadsheets, and build clear dashboards.",
  "product-management": "Interview users, frame testable problems, prioritize one bet, and write an engineering-ready product spec.",
  "python-programming": "Write clean Python scripts, validate messy CSV/JSON data streams, and test pipelines with Pytest.",
  "data-science-ai": "Prepare point-in-time cohorts, engineer retention features, and validate churn models without data leakage.",
  "generative-ai": "Build document retrieval pipelines, enforce citation checks, and evaluate LLM accuracy.",
  "full-stack-web": "Design relational schemas, build typed Node/Express APIs, and ship resilient React interfaces.",
}

const COURSE_THUMBS: Record<string, string> = {
  "data-analytics": photoAnalytics,
  "product-management": photoProduct,
  "python-programming": photoScience,
  "data-science-ai": photoClass,
  "generative-ai": photoCampusPg,
  "full-stack-web": heroStudent720,
}

export default function CoursesPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [category, setCategory] = useState("All")
  const catalog = useCatalogCourses()

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setSearch(q)
  }, [searchParams])

  const courses = (catalog.data ?? []).filter((c) => c.slug !== "power-bi")
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
  const listings = search.trim().length > 0 ? filtered.filter((view) => view.maturity !== "ready") : []

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <LearnPillarSubnav current="courses" />
        <section className="cat-hero" style={{ paddingBottom: 28 }}>
          <div className="cat-rail">
            <p className="cat-label">Self-Paced Courses</p>
            <h1>{catalog.offline ? "Courses" : "Practical courses you can start today."}</h1>
            <p className="cat-lead" style={{ maxWidth: 620 }}>
              {catalog.offline
                ? `Focused courses with lessons, checks and practice. ${STATUS_NOT_CONFIRMED}: the catalogue could not be checked just now.`
                : "Each course includes 5 structured modules (15 lessons), hands-on browser labs, and a graded capstone project."}
            </p>
            <input
              className="cat-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by skill or topic (SQL, Python, Product, AI, Web)..."
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
              <p className="cat-empty">Loading courses…</p>
            ) : catalog.error ? (
              <div className="cat-empty">
                <p>The course catalogue could not be loaded.</p>
                <button type="button" className="cat-btn cat-btn-ghost" onClick={() => void catalog.reload()}>
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <p className="cat-empty">No courses match your search.</p>
            ) : (
              <>
                {ready.length > 0 ? (
                  <div className="cat-group">
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
                        gap: 22,
                      }}
                    >
                      {ready.map((view) => (
                        <CourseCard key={view.slug} view={view} confirmed={!catalog.offline} />
                      ))}
                    </div>
                  </div>
                ) : null}
                {listings.length > 0 ? (
                  <div className="cat-group" style={{ marginTop: 32 }}>
                    <h2>Opening soon</h2>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
                        gap: 22,
                        marginTop: 14,
                      }}
                    >
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

function CourseCard({ view, confirmed = true }: { view: CatalogCourseListView; confirmed?: boolean }) {
  const tags = (COURSE_SKILL_TAGS[view.slug] ?? []).slice(0, 3)
  const summary = COURSE_SUMMARIES[view.slug] ?? view.course.description ?? "Structured lessons, hands-on practice, and a final project."
  const thumb = COURSE_THUMBS[view.slug] ?? photoAnalytics

  return (
    <Link
      to={`/courses/${view.slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderTop: "3px solid #5142b5",
        borderRadius: 16,
        overflow: "hidden",
        textDecoration: "none",
        color: "#0f172a",
        boxShadow: "0 4px 18px -8px rgba(15, 23, 42, 0.06)",
        transition: "transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease",
      }}
    >
      <div>
        <div style={{ position: "relative", height: 168, background: "#0f172a", overflow: "hidden" }}>
          <img
            src={thumb}
            alt={view.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              padding: "4px 10px",
              borderRadius: 999,
              background: "#5142b5",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {view.course.category}
          </span>
        </div>

        <div style={{ padding: "18px 20px 14px" }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 6 }}>
            5 modules · 15 lessons · {view.duration}
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 18.5, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
            {view.title}
          </h3>
          <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "#475569", lineHeight: 1.55 }}>
            {summary}
          </p>
          {tags.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11.5,
                    padding: "4px 9px",
                    borderRadius: 6,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#334155",
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          padding: "14px 20px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "#fcfcfd",
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
          {view.maturity === "ready" ? "From ₹1,499" : "Coming soon"}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#5142b5",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {confirmed ? (view.maturity === "ready" ? "View course →" : view.ctaLabel) : "View course →"}
        </span>
      </div>
    </Link>
  )
}
