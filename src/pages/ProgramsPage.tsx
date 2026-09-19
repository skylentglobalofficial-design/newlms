import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { HarborDeskWorkspace, NorthwindWorkspace } from "../components/product/ProductLanguage"
import "./Catalog.css"

function useProgramsOpenNarrow() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
  )

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const onChange = () => setNarrow(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return narrow
}

export default function ProgramsPage() {
  const narrow = useProgramsOpenNarrow()

  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="pg-open" aria-labelledby="pg-open-title">
          <div className="cat-rail pg-open-stack">
            <div className="pg-open-editorial">
              <div className="pg-open-editorial-copy">
                <p className="pg-open-eyebrow">Professional programmes · Authored in Skylent OS</p>
                <h1 id="pg-open-title">Learn to produce work like this.</h1>
                <p className="pg-open-lead">
                  Two authored Professional Certificate programmes — each built around work you can show.
                </p>
              </div>
              <div className="pg-open-editorial-cta">
                <a className="cat-btn cat-btn-primary cat-btn-lg" href="#programs">
                  Explore programmes ↓
                </a>
              </div>
            </div>

            <div className="pg-open-specimens">
              <div className="pg-open-specimen">
                <NorthwindWorkspace compact />
                <div className="pg-open-attr">
                  <p className="pg-open-attr-label">Professional Certificate</p>
                  <p className="pg-open-attr-title">Data Analytics with Gen AI</p>
                  <Link
                    className="pg-open-attr-link"
                    to="/programs/data-analytics-pro"
                    aria-label="View Data Analytics with Gen AI programme"
                  >
                    View Program →
                  </Link>
                </div>
              </div>

              <div className="pg-open-specimen">
                <HarborDeskWorkspace
                  compact={narrow}
                  meta="harbor-desk-case.md · 4 interviews"
                />
                <div className="pg-open-attr">
                  <p className="pg-open-attr-label">Professional Certificate</p>
                  <p className="pg-open-attr-title">Product Management</p>
                  <Link
                    className="pg-open-attr-link"
                    to="/programs/product-management"
                    aria-label="View Product Management programme"
                  >
                    View Program →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
