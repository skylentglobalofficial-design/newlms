import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { AcademicSubnav, LiveCoreRail } from "../../components/product/Architecture"
import { C, T } from "../../tokens"

export default function AcademicPageShell({
  current,
  children,
}: {
  current?: string
  children: ReactNode
}) {
  return (
    <PageShell aurora={false}>
      <div className="arch-academic-shell" style={{ paddingTop: T.navH + 28 }}>
        <div className="arch-academic-inner">
          <AcademicSubnav current={current} />
          {children}
          <div className="arch-section" style={{ paddingTop: 8 }}>
            <LiveCoreRail lead="Academic lines above are product direction. Start with a live course or programme, then Skylent OS and Career OS." />
            <div className="edu-start-row">
              <Link to="/courses/data-analytics">
                <strong>Start Data Analytics</strong>
                <span>Ready written course</span>
              </Link>
              <Link to="/courses/product-management">
                <strong>Start Product Management</strong>
                <span>Ready written course</span>
              </Link>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 18 }}>
              <Link to="/programs" style={{ color: C.indigo, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Browse live programmes →</Link>
              <Link to="/courses" style={{ color: C.slate, fontSize: 14, textDecoration: "none" }}>Browse courses</Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
