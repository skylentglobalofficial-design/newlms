import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import {
  AcademicSubnav,
  LiveCoreRail,
} from "../../components/product/Architecture"
import { C } from "../../tokens"
import "./AcademicPages.css"

export default function AcademicPageShell({
  current,
  children,
}: {
  current?: string
  children: ReactNode
}) {
  return (
    <PageShell aurora={false}>
      <div className="arch-academic-shell">
        <div className="arch-academic-inner">
          <AcademicSubnav current={current} />
          {children}
          <div
            className="arch-section"
            style={{
              marginTop: 24,
              background: "linear-gradient(145deg, #10263d 0%, #183750 100%)",
              border: "1px solid rgba(196, 184, 255, 0.38)",
              borderRadius: 18,
              padding: "26px 28px",
              color: "#ffffff",
              boxShadow: "0 18px 40px rgba(10, 14, 34, 0.22)",
            }}
          >
            <p style={{ margin: "0 0 8px", color: "#c4b8ff", font: "700 11px/1.4 var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              LIVE SIMULATED COMPANY TRACKS · NEP 2020 &amp; NCrF CREDIT-READY
            </p>
            <LiveCoreRail lead="Academic lines above are product direction. Start with a live course or programme, then Skylent OS and Career OS." />
            <div className="edu-start-row" style={{ marginTop: 14 }}>
              <Link to="/courses/data-analytics" style={{ background: "rgba(15,23,42,0.65)", border: "1px solid rgba(196, 184, 255,0.38)", borderRadius: 12, padding: "14px 18px", color: "#ffffff", textDecoration: "none" }}>
                <strong style={{ color: "#c4b8ff", display: "block" }}>Start Data Analytics →</strong>
                <span style={{ color: "rgba(255,255,255,0.82)", fontSize: 13 }}>Ready written course · Northwind SQL Lab</span>
              </Link>
              <Link to="/courses/product-management" style={{ background: "rgba(15,23,42,0.65)", border: "1px solid rgba(52,211,153,0.38)", borderRadius: 12, padding: "14px 18px", color: "#ffffff", textDecoration: "none" }}>
                <strong style={{ color: "#34d399", display: "block" }}>Start Product Management →</strong>
                <span style={{ color: "rgba(255,255,255,0.82)", fontSize: 13 }}>Ready written course · Harbor Desk Studio</span>
              </Link>
            </div>
            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <Link
                to="/programmes"
                style={{
                  color: C.indigo,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Browse live programmes →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
