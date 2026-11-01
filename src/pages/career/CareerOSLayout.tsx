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

function CareerOsStatus({
  title,
  body,
  isLockedWall = false,
}: {
  title: string
  body: string
  isLockedWall?: boolean
}) {
  return (
    <PageShell aurora={false}>
      <main style={{ maxWidth: 780, margin: "48px auto 80px", padding: "0 20px" }}>
        <div
          style={{
            padding: "32px 32px 28px",
            borderRadius: 20,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            boxShadow: "0 12px 32px -16px rgba(15, 23, 42, 0.08)",
          }}
        >
          <p className="os-eyebrow" style={{ color: "#5142b5", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
            Career OS · Merit-Gated Proof-of-Work Workspace
          </p>
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", lineHeight: 1.15 }}>
            {title}
          </h1>
          <p style={{ margin: "0 0 22px", fontSize: 15.5, lineHeight: 1.6, color: "#475569" }}>
            {body}
          </p>

          {isLockedWall ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                padding: 16,
                borderRadius: 14,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                marginBottom: 24,
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#5142b5", textTransform: "uppercase" }}>Step 01</span>
                <strong style={{ display: "block", fontSize: 14, marginTop: 4, color: "#0f172a" }}>Enrol in a Track (₹0)</strong>
                <span style={{ fontSize: 12.5, color: "#64748b" }}>Start Data Analytics or Product Management in Skylent OS.</span>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#5142b5", textTransform: "uppercase" }}>Step 02</span>
                <strong style={{ display: "block", fontSize: 14, marginTop: 4, color: "#0f172a" }}>Complete 60% + Capstone</strong>
                <span style={{ fontSize: 12.5, color: "#64748b" }}>Pass lesson checks and defend 1 graded capstone dossier.</span>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d", textTransform: "uppercase" }}>Step 03</span>
                <strong style={{ display: "block", fontSize: 14, marginTop: 4, color: "#0f172a" }}>Unlock Career OS</strong>
                <span style={{ fontSize: 12.5, color: "#64748b" }}>Activate ATS diagnostics, mock interviews &amp; application tracking.</span>
              </div>
            </div>
          ) : null}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link className="sk-btn sk-btn-primary" to="/dashboard/student">
              Continue in My Learning
              <ArrowRight />
            </Link>
            <Link className="sk-btn sk-btn-secondary" to="/programmes">
              Explore Flagship Programmes
            </Link>
            <Link className="sk-btn sk-btn-secondary" to="/verify">
              Inspect Sample Dossiers
            </Link>
          </div>
        </div>
      </main>
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
      <CareerOsStatus
        title="Checking your Career OS workspace status…"
        body="Verifying your course completion and capstone dossier milestones."
      />
    )
  }

  if (access === "unavailable") {
    return (
      <CareerOsStatus
        title="Career OS status could not be checked right now"
        body="We could not verify your workspace entitlement just now. Please return to My Learning and try again in a moment."
      />
    )
  }

  if (access !== "open") {
    return (
      <CareerOsStatus
        title="Unlock Career OS with your Proof-of-Work Milestone"
        body="Career OS is merit-gated so every profile holds real, verified work. Complete 60% of your enrolled course modules and pass 1 graded capstone (or hold an institutional Career OS entitlement) to unlock this workspace."
        isLockedWall
      />
    )
  }

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
