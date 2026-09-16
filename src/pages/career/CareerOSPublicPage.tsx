import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { CAREER_OS_IA } from "../../lib/product-architecture"
import { MaturityMark } from "../../components/product/Architecture"
import { CareerEvidencePreview } from "../../components/product/ProductLanguage"
import "./CareerOS.css"

export default function CareerOSPublicPage() {
  return (
    <PageShell aurora={false}>
      <div className="cos-public">
        <div>
          <div className="cos-kicker" style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <span>Career OS</span>
            <MaturityMark maturity="live" />
          </div>
          <h1>Keep your learning evidence in one place.</h1>
          <p className="cos-public-lead">
            Career OS is a workspace for your profile and the work you build while learning. Published roles appear on the job board when they exist — none are invented for this page.
          </p>
          <div className="cos-public-actions">
            <Link to="/login">Sign in to Career OS</Link>
          </div>
          <div className="cos-ia-grid">
            {CAREER_OS_IA.map((item) => (
              <article key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.sub}</span>
              </article>
            ))}
          </div>
          <p className="cos-lead" style={{ marginTop: 18 }}>
            Sign in to open the workspace. If the job board is empty, that is the real state — not a demo feed. Career OS is not a placement guarantee.
          </p>
        </div>
        <CareerEvidencePreview />
      </div>
    </PageShell>
  )
}
