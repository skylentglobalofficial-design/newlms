import { PageShell } from "../components/shared"
import { CertificateOsPreview } from "../components/product/ProductLanguage"
import "./Catalog.css"

export default function ProgramsPage() {
  return (
    <PageShell aurora={false}>
      <div className="cat-page">
        <section className="pg-open" aria-labelledby="pg-open-title">
          <div className="cat-rail pg-open-grid">
            <div className="pg-open-copy">
              <p className="pg-open-eyebrow">Professional Certificate Programs</p>
              <h1 id="pg-open-title">
                Professional learning,
                <br />
                built around real work.
              </h1>
              <p className="pg-open-lead">
                Learn through structured courses, practise what you learn, build real work, and turn that work into evidence.
              </p>
              <div className="pg-open-actions">
                <a className="cat-btn cat-btn-primary cat-btn-lg" href="#programs">
                  Explore programs
                </a>
                <a className="pg-open-quiet" href="#how-it-works">
                  How it works ↓
                </a>
              </div>
            </div>
            <div className="pg-open-visual">
              <CertificateOsPreview />
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
