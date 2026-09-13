import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { CAREER_OS_IA } from "../../lib/product-architecture"
import { LiveCoreRail, MaturityMark } from "../../components/product/Architecture"
import { C, T } from "../../tokens"

export default function CareerOSPublicPage() {
  return (
    <PageShell aurora={false}>
      <div className="arch-academic-shell" style={{ paddingTop: T.navH + 28 }}>
        <div className="arch-academic-inner">
          <header className="arch-line-header" style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
              <div className="skylent-label" style={{ color: C.indigo, margin: 0 }}>Career OS</div>
              <MaturityMark maturity="live" />
            </div>
            <h1 className="skylent-display-md" style={{ color: C.ink, margin: "0 0 14px", maxWidth: 720 }}>
              A career workspace — not a placement desk.
            </h1>
            <p className="skylent-body-lg" style={{ color: C.slate, margin: 0, maxWidth: 560 }}>
              Career OS is where you keep a profile, watch for published roles, apply, and practise interviews. Jobs appear when partners publish them. None are invented for the marketing page.
            </p>
          </header>

          <section className="arch-section">
            <div className="skylent-label" style={{ color: C.slate, marginBottom: 12 }}>Workspace</div>
            <div>
              {CAREER_OS_IA.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(140px, 0.5fr) minmax(0, 1fr)",
                    gap: 16,
                    padding: "16px 0",
                    borderBottom: `1px solid ${T.lineDark}`,
                    minWidth: 0,
                  }}
                  className="arch-career-ia-row"
                >
                  <strong style={{ fontFamily: "var(--font-display)", fontSize: 18, color: C.ink }}>{item.label}</strong>
                  <span style={{ color: C.slate, fontSize: 14, lineHeight: 1.55 }}>{item.sub}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="arch-section">
            <p style={{ color: C.slate, fontSize: 14, lineHeight: 1.7, maxWidth: 560, margin: "0 0 20px" }}>
              Sign in to open the workspace. If the job board is empty, that is the real state — not a demo feed.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                to="/login"
                style={{
                  background: C.indigo,
                  color: C.white,
                  padding: "10px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign in to Career OS
              </Link>
              <Link to="/programs" style={{ color: C.slate, fontSize: 14, alignSelf: "center", textDecoration: "none" }}>
                Professional programmes include Career OS access
              </Link>
            </div>
          </section>

          <LiveCoreRail lead="Career OS sits after real coursework. It does not replace programmes or the LMS." />
        </div>
      </div>
    </PageShell>
  )
}
