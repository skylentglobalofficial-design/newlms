/**
 * /courses — public course index.
 *
 * Rows come from GET /catalog/courses (or the published list when that request fails).
 * Readiness uses coursePublicView, the same helper as the course detail page.
 * Nothing here states a fee, a learner count, or a placement outcome.
 */
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { LearnPillarSubnav } from "../components/product/Architecture"
import { TruthChip } from "../components/skylent/primitives"
import { STATUS_NOT_CONFIRMED } from "../components/programme/CatalogueNotice"
import { useCatalogCourses } from "../hooks/useCatalog"
import { coursePublicView, type CoursePublicView } from "../lib/catalog-maturity"
import { isPublicCourseRow } from "../lib/course-catalogue"
import "./Catalog.css"

export default function CoursesPage() {
  const catalog = useCatalogCourses()
  const confirmed = !catalog.offline

  const views = (catalog.data ?? [])
    .filter(isPublicCourseRow)
    .map(coursePublicView)

  const ready = views.filter((view) => view.authored)
  const listings = views.filter((view) => !view.authored)

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
            <p className="cat-label">Self-Paced Flagship Courses · In-Browser Labs · ₹0 Free Pilot</p>
            <h1>{catalog.offline ? "Skylent courses." : "Courses you can start this week."}</h1>
            <p className="cat-lead">
              {catalog.offline
                ? `${STATUS_NOT_CONFIRMED}. The live course catalogue could not be reached just now, so availability is not confirmed. You can browse courses below or retry before starting.`
                : "Every self-paced course includes 5 modules, 15 written lessons, an interactive in-browser SQL/code/PRD sandbox, a graded capstone project, and a verifiable SKL certificate."}
            </p>
            <div className="cat-actions">
              <Link className="cat-btn cat-btn-primary" to="/programmes">
                Compare full career programmes
              </Link>
              <Link className="cat-btn cat-btn-ghost" to="/path">
                Find My Path in 90 Seconds
              </Link>
            </div>
          </div>
        </section>

        <section className="cat-section">
          <div className="cat-rail">
            {catalog.loading ? (
              <p className="cat-empty">Loading courses...</p>
            ) : catalog.offline ? (
              <div className="cat-notice" role="status">
                <p>
                  <strong>{STATUS_NOT_CONFIRMED}.</strong> Course availability could not be checked right now.{" "}
                  <button type="button" className="cat-chip" onClick={() => void catalog.reload()}>
                    Try again
                  </button>
                </p>
              </div>
            ) : null}

            {!catalog.loading && views.length === 0 ? (
              <p className="cat-empty">No courses are published yet.</p>
            ) : (
              <>
                {ready.length > 0 ? (
                  <div className="cat-group">
                    <h2>{catalog.offline ? "Full courses" : "Open now"}</h2>
                    <div className="cat-ready">
                      {ready.map((view) => (
                        <ReadyCourseCard key={view.course.slug} view={view} confirmed={confirmed} />
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
                        <ListingCourseCard key={view.course.slug} view={view} confirmed={confirmed} />
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
  "data-analytics": ["SQL Joins & CTEs", "Northwind Lab (166 Rows)", "Margin Audit", "Capstone Report"],
  "product-management": ["PRD Scoping", "Harbor Desk Case", "Feature Triage", "6-Week Roadmap"],
  "python-programming": ["Python 3", "ETL Pipelines", "Pytest Suite", "Automation"],
  "data-science-ai": ["SQL + Python", "Cohort Retention", "Churn Validation", "Dual Capstone"],
  "generative-ai": ["Grounded RAG", "Vector Search", "Prompt Guardrails", "LLM Accuracy Evals"],
  "full-stack-web": ["React & TypeScript", "Node & Express", "PostgreSQL", "API Security"],
}

function ReadyCourseCard({ view, confirmed }: { view: CoursePublicView; confirmed: boolean }) {
  const { course } = view
  const tags = COURSE_SKILL_TAGS[course.slug] ?? ["Interactive Lessons", "Browser Lab", "Graded Capstone"]
  return (
    <Link to={`/courses/${course.slug}`} className="cat-ready-card">
      <div className="cat-ready-head">
        <span className="cat-label">{course.category}</span>
        {confirmed ? (
          <TruthChip state="live" label="Open · ₹0 Pilot" />
        ) : (
          <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />
        )}
      </div>
      <h3>{course.title}</h3>
      <p>{view.summary}</p>
      <div className="cat-skill-pills" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
              background: "#ffffff",
              color: "#0f172a",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      <dl className="cat-ready-facts">
        <div>
          <dt>Structure</dt>
          <dd>{view.structureLabel}</dd>
        </div>
        <div>
          <dt>Practice</dt>
          <dd>{view.practiceLabel}</dd>
        </div>
      </dl>
      <span className="cat-card-cta">{confirmed ? "Start course free →" : "See course outline →"}</span>
    </Link>
  )
}

function ListingCourseCard({ view, confirmed }: { view: CoursePublicView; confirmed: boolean }) {
  const { course } = view
  return (
    <Link to={`/courses/${course.slug}`} className="cat-card">
      <div className="cat-card-top">
        <span className="cat-label">{course.category}</span>
        <TruthChip state="development" label={confirmed ? view.maturityLabel : STATUS_NOT_CONFIRMED} />
      </div>
      <h3>{course.title}</h3>
      <p>{view.summary}</p>
      <span className="cat-card-cta">See outline →</span>
    </Link>
  )
}
