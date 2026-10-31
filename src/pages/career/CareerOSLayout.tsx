import { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1 } from "../../lib/api-base"
import { PageShell } from "../../components/shared"
import { ArrowRight } from "../../components/skylent/primitives"
import CareerOSShell from "../../components/career/CareerOSShell"
import CareerOSPublicPage from "./CareerOSPublicPage"
import CareerOSPublicAreaPage from "./CareerOSPublicAreaPage"
import "./CareerOS.css"

function CareerOsStatus({ title, body }: { title: string; body: string }) {
  const steps = [
    {
      num: "01",
      title: "60% Curriculum Gate",
      desc: "Complete at least 60% of modules in an enrolled course (Data Analytics, PM, Python, or Web Engineering).",
    },
    {
      num: "02",
      title: "Portfolio Capstone",
      desc: "Assemble your commercial analysis memo, product spec, or code repository to prove hands-on mastery.",
    },
    {
      num: "03",
      title: "Verified Skill Match",
      desc: "Unlock mock interview defense, Career Rise readiness evaluation, and verified job-matching.",
    },
  ]

  return (
    <PageShell aurora={false}>
      <div className="site-light" style={{ minHeight: "80vh", padding: "48px 0" }}>
        <main className="sky-container" style={{ maxWidth: 760, margin: "0 auto" }}>
          <nav className="sky-label" aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
            <Link to="/dashboard/student">My Courses</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Career Development</span>
          </nav>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
              padding: "36px 32px",
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 999, background: "rgba(81, 66, 181, 0.08)", color: "#5142B5", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
              <span>🏆</span>
              <span>Career Development · Merit-Gated Access</span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
              {title}
            </h1>

            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#475569", margin: "0 0 28px" }}>
              {body}
            </p>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 24, marginBottom: 28 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px" }}>
                How to Unlock Career Rise &amp; Portfolio Matching:
              </p>
              <div style={{ display: "grid", gap: 14 }}>
                {steps.map((st) => (
                  <div
                    key={st.num}
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                      background: "#f8fafc",
                      padding: "14px 18px",
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#5142B5",
                        background: "#ede9fe",
                        padding: "4px 10px",
                        borderRadius: 8,
                      }}
                    >
                      {st.num}
                    </span>
                    <div>
                      <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>{st.title}</strong>
                      <span style={{ fontSize: 13, color: "#64748b", marginTop: 2, display: "block" }}>{st.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Link to="/dashboard/student" className="sk-btn sk-btn-primary" style={{ padding: "12px 24px", fontSize: 14 }}>
                Go to My Courses &amp; Continue Learning
                <ArrowRight />
              </Link>
              <Link to="/career-os" className="sk-btn sk-btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>
                Explore Career OS Overview
              </Link>
            </div>
          </div>
        </main>
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
        const body = (await response.json()) as { data?: { entitled?: boolean } }
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
      <CareerOsStatus
        title="Checking Career OS access"
        body="Checking your account entitlements and learning progress in Skylent OS."
      />
    )
  }

  if (access === "unavailable") {
    return (
      <CareerOsStatus
        title="Career OS is temporarily offline"
        body="The entitlement service could not be reached just now. You can continue studying in your course workspace."
      />
    )
  }

  if (access !== "open") {
    return (
      <CareerOsStatus
        title="Merit-Gated Career Development"
        body="Career OS is a dedicated workspace for verified portfolio matching and mock interview defense. Complete 60% of your course in My Courses to unlock Career Rise and portfolio evidence tools."
      />
    )
  }

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
