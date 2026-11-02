import { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1 } from "../../lib/api-base"
import { PageShell } from "../../components/shared"
import { CareerPublicSubnav } from "../../components/product/Architecture"
import CareerOSShell from "../../components/career/CareerOSShell"
import CareerOSPublicPage from "./CareerOSPublicPage"
import CareerOSPublicAreaPage from "./CareerOSPublicAreaPage"
import "./CareerOS.css"

function CareerOsLockedDashboard() {
  return (
    <PageShell aurora={false}>
      <div className="cos-public-page">
        <section className="cos-public-area" aria-labelledby="cos-locked-title">
          <div className="sk-rail" style={{ maxWidth: 860, paddingBlock: "36px 64px" }}>
            <CareerPublicSubnav current="overview" />
            <div
              style={{
                marginTop: 24,
                padding: "28px 28px",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#5142B5",
                  background: "#f3f0ff",
                  padding: "4px 10px",
                  borderRadius: 999,
                  marginBottom: 12,
                }}
              >
                Career OS · Merit-Gated Workspace
              </span>
              <h1 id="cos-locked-title" style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3vw, 32px)", color: "#0f172a" }}>
                Unlock Career OS by completing 60% of your course modules
              </h1>
              <p style={{ margin: "0 0 22px", fontSize: 15, lineHeight: 1.6, color: "#475569", maxWidth: 680 }}>
                Career OS connects your verified SQL queries, product specifications, and graded capstones directly into an employer-ready portfolio and application tracker. Complete the 3 steps below in your learning workspace to unlock full access:
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 14,
                  marginBottom: 24,
                }}
              >
                <div style={{ padding: 16, borderRadius: 12, border: "1px solid #dcfce7", background: "#f0fdf4" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#15803d", textTransform: "uppercase" }}>
                    Step 01 · Account Ready
                  </div>
                  <strong style={{ display: "block", marginTop: 4, fontSize: 15, color: "#0f172a" }}>
                    Enrol in a Flagship Track
                  </strong>
                  <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5, color: "#334155" }}>
                    Start Data Analytics, Product Management, Python, GenAI, or Full-Stack in Skylent OS.
                  </p>
                </div>

                <div style={{ padding: 16, borderRadius: 12, border: "1px solid #ddd7ff", background: "#faf9ff" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#5142B5", textTransform: "uppercase" }}>
                    Step 02 · Merit Gate (60%)
                  </div>
                  <strong style={{ display: "block", marginTop: 4, fontSize: 15, color: "#0f172a" }}>
                    Complete 3 of 5 Course Modules
                  </strong>
                  <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5, color: "#334155" }}>
                    Pass module concept checks and submit applied briefs inside your course player.
                  </p>
                </div>

                <div style={{ padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                    Step 03 · Portfolio Unlock
                  </div>
                  <strong style={{ display: "block", marginTop: 4, fontSize: 15, color: "#0f172a" }}>
                    Activate Career Rise &amp; Career OS
                  </strong>
                  <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5, color: "#334155" }}>
                    Publish your verified capstone dossier, track role applications, and rehearse interviews.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link className="sk-btn sk-btn-primary" to="/dashboard/student">
                  Continue in My Learning Dashboard →
                </Link>
                <Link className="sk-btn sk-btn-secondary" to="/programmes">
                  Explore Open Programmes
                </Link>
                <Link className="sk-btn sk-btn-secondary" to="/verify">
                  Inspect Verified Graduate Dossiers (/verify)
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}

export default function CareerOSLayout() {
  const { user, ready } = useAuth()
  const { pathname } = useLocation()
  const [access, setAccess] = useState<"loading" | "open" | "locked" | "unavailable">("loading")

  useEffect(() => {
    if (!user?.id) return
    const controller = new AbortController()
    setAccess("loading")
    void fetch(`${apiV1()}/career/access`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          setAccess("unavailable")
          return
        }
        const body = await response.json() as { data?: { entitled?: boolean } }
        setAccess(body.data?.entitled === true ? "open" : "locked")
      })
      .catch(() => {
        if (!controller.signal.aborted) setAccess("unavailable")
      })
    return () => controller.abort()
  }, [user?.id])

  if (!ready) {
    return (
      <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(var(--site-dim))", fontSize: 14 }}>
        Loading Career OS…
      </div>
    )
  }

  if (!user) {
    const isOverview = pathname === "/career-os" || pathname === "/career-os/"
    if (isOverview) return <CareerOSPublicPage />
    return <CareerOSPublicAreaPage />
  }

  if (access === "loading") {
    return (
      <PageShell aurora={false}>
        <main style={{ maxWidth: 640, margin: "64px auto", padding: 24 }}>
          <p className="os-eyebrow">Career OS</p>
          <h1>Checking your Career OS workspace…</h1>
          <p>Verifying your curriculum progress and Career OS entitlement.</p>
        </main>
      </PageShell>
    )
  }

  if (access !== "open") {
    return <CareerOsLockedDashboard />
  }

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
