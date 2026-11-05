import { Link, useLocation } from "react-router-dom"
import { PageShell } from "../components/shared"

const QUICK_DESTINATIONS = [
  {
    badge: "6 FLAGSHIP TRACKS · ₹0 PILOT",
    title: "Explore Career Programmes",
    desc: "Data Analytics, Product Management, Python, Data Science & AI, Generative AI, and Full-Stack Web.",
    to: "/programmes",
    cta: "Browse Programmes →",
  },
  {
    badge: "₹99 LIVE · 100% COIN BACK",
    title: "Workshops & Masterclasses",
    desc: "Weekend live builder sprints with 99 Elixir Coins cashback and standalone campus topic syllabi.",
    to: "/workshops",
    cta: "Open Workshops →",
  },
  {
    badge: "LIVE WEEKEND CALENDAR",
    title: "Scheduled Events & Case Store",
    desc: "Book upcoming weekend live sessions and redeem Elixir Coins for industry Case Studies.",
    to: "/events",
    cta: "Open Events & Case Store →",
  },
  {
    badge: "90-SECOND DIAGNOSTIC",
    title: "Find My Career Path",
    desc: "Take a 3-scenario skill diagnostic to see your readiness tier and recommended starting track.",
    to: "/path",
    cta: "Start 90s Diagnostic →",
  },
  {
    badge: "PUBLIC CREDENTIAL REGISTRY",
    title: "Verify a Certificate (/verify)",
    desc: "Inspect any SKL-2026 certificate ID and its attached SQL, Python, or PRD Proof-of-Work Dossier.",
    to: "/verify",
    cta: "Open Verifier →",
  },
  {
    badge: "SIGNED-IN WORKSPACE",
    title: "My Learning Dashboard",
    desc: "Resume your active course lesson, open browser sandboxes, or switch role dashboards.",
    to: "/dashboard/student",
    cta: "Open Dashboard →",
  },
] as const

export default function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <PageShell aurora={false}>
      <div
        className="skylent-container"
        style={{ maxWidth: 1120, margin: "0 auto", padding: "clamp(28px, 4vw, 48px) 20px 64px" }}
      >
        <section
          style={{
            background: "linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)",
            border: "1px solid rgba(196, 184, 255, 0.45)",
            borderRadius: 20,
            padding: "clamp(26px, 4vw, 38px)",
            color: "#ffffff",
            boxShadow: "0 20px 44px -16px rgba(59, 45, 150, 0.35)",
            marginBottom: 28,
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#e9d5ff",
              font: "700 11.5px/1.4 var(--font-mono)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            SKYLENT ROUTE RECOVERY · 404 NAVIGATION ASSIST
          </p>
          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "clamp(26px, 3.2vw, 38px)",
              color: "#ffffff",
              fontFamily: "var(--font-display)",
            }}
          >
            Page not found ({pathname})
          </h1>
          <p
            style={{
              margin: "0 0 20px",
              color: "rgba(255,255,255,0.9)",
              fontSize: 15,
              lineHeight: 1.6,
              maxWidth: 680,
            }}
          >
            The address you entered does not match an active page, or it may have moved. Choose any verified destination below to jump straight into a programme, live workshop, or browser lab.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              to="/"
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                background: "#ffffff",
                color: "#5142b5",
                fontWeight: 800,
                fontSize: 13.5,
                textDecoration: "none",
              }}
            >
              ← Back to home
            </Link>
            <Link
              to="/programmes"
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.34)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13.5,
                textDecoration: "none",
              }}
            >
              Explore All 6 Programmes →
            </Link>
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 310px), 1fr))",
            gap: 18,
          }}
        >
          {QUICK_DESTINATIONS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
                padding: "20px 22px",
                borderRadius: 16,
                background: "linear-gradient(180deg, #f6f4ff 0%, #ffffff 100%)",
                border: "1px solid #ddd6fe",
                borderTop: "4px solid #5142b5",
                color: "#0f172a",
                textDecoration: "none",
                boxShadow: "0 10px 26px -14px rgba(81, 66, 181, 0.14)",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    color: "#5142b5",
                    letterSpacing: "0.06em",
                  }}
                >
                  {item.badge}
                </span>
                <h2 style={{ margin: "6px 0 6px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                  {item.title}
                </h2>
                <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.55 }}>{item.desc}</p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#5142b5" }}>{item.cta}</span>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
