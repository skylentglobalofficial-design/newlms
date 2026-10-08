import { Link, useLocation } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { CareerPublicSubnav } from "../../components/product/Architecture"
import { CAREER_OS_IA } from "../../lib/product-architecture"
import "./CareerOS.css"

function areaFromPath(pathname: string) {
  const match = CAREER_OS_IA.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
  return match ?? null
}

function subnavId(pathname: string): string {
  return areaFromPath(pathname)?.id ?? "overview"
}

export default function CareerOSPublicAreaPage() {
  const { pathname } = useLocation()
  const area = areaFromPath(pathname)
  const navId = subnavId(pathname)

  if (!area) {
    return (
      <PageShell aurora={false}>
        <div className="cos-public-page">
          <div className="sk-rail">
            <CareerPublicSubnav current={navId} />
            <p className="cos-public-lead">This Career OS destination is not recognised.</p>
            <Link to="/career-os">Back to Career OS overview</Link>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell aurora={false}>
      <div className="cos-public-page">
        <section className="cos-public-area" aria-labelledby="cos-area-title">
          <div className="sk-rail">
            <CareerPublicSubnav current={navId} />
            <p className="cos-eyebrow">CAREER OS · SIGN IN REQUIRED</p>
            <h1 id="cos-area-title">{area.label}</h1>
            <p className="cos-public-lead">{area.sub}</p>
            <p className="cos-area-state cos-area-state-prominent">{area.empty}</p>
            <p className="cos-public-fine">
              Career OS does not show sample jobs, applications, or interviews on public pages. Sign in to see your
              workspace — empty areas stay empty.
            </p>
            <div className="cos-public-actions">
              <Link to="/login">Sign in to open {area.label}</Link>
              <Link className="cos-public-secondary" to="/career-os">
                Read the Career OS overview
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
