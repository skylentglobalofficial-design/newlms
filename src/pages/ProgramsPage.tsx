import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { PathwayThumb } from "../components/product/ProductLanguage"
import { programs } from "../data"
import { programmePublicView } from "../lib/catalog-maturity"
import "./Catalog.css"

export default function ProgramsPage() {
  const [search, setSearch] = useState("")
  const views = useMemo(() => programs.map(programmePublicView), [])

  const filtered = views.filter((view) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return `${view.title} ${view.summary}`.toLowerCase().includes(q)
  })

  const open = filtered.filter((view) => view.maturity !== "coming_later")
  const later = filtered.filter((view) => view.maturity === "coming_later")

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="cat-hero">
          <div className="cat-rail">
            <h1>Longer pathways, shown honestly.</h1>
            <p className="cat-lead">
              A programme is meant to connect courses into a longer path. Today, enrolment opens the linked LMS course — it does not create a separate taught syllabus.
            </p>
            <Link className="cat-text-link" to="/courses">Prefer a focused course? Browse courses</Link>
            <input
              className="cat-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search programmes"
              aria-label="Search programmes"
            />
          </div>
        </section>

        <section className="cat-section">
          <div className="cat-rail">
            {filtered.length === 0 ? (
              <p className="cat-empty">No programmes match this search.</p>
            ) : (
              <>
                {open.length > 0 ? (
                  <div className="cat-group">
                    <h2>Open listings</h2>
                    <p className="cat-fine">These can enrol you into a linked course. They are not fully authored programmes.</p>
                    <div className="cat-grid">
                      {open.map((view) => (
                        <ProgrammeCard key={view.slug} view={view} />
                      ))}
                    </div>
                  </div>
                ) : null}
                {later.length > 0 ? (
                  <div className="cat-group">
                    <h2>Coming later</h2>
                    <p className="cat-fine">These are not open for enrolment. There is no live batch behind them.</p>
                    <div className="cat-grid">
                      {later.map((view) => (
                        <ProgrammeCard key={view.slug} view={view} />
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

function ProgrammeCard({ view }: { view: ReturnType<typeof programmePublicView> }) {
  const taught = view.linked[0]?.title
  return (
    <Link className="cat-card-link" to={`/programs/${view.slug}`}>
      <PathwayThumb />
      <div className="cat-card-copy">
        <span className="cat-mark">{view.maturityLabel}</span>
        <h3>{view.title}</h3>
        <p>{view.summary}</p>
        <div className="cat-meta">
          {taught ? <span>Linked course: {taught}</span> : <span>No linked LMS course yet</span>}
        </div>
        <span className="cat-btn cat-btn-ghost cat-card-cta">View programme</span>
      </div>
    </Link>
  )
}
