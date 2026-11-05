import { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1 } from "../../lib/api-base"
import CareerOSShell from "../../components/career/CareerOSShell"
import CareerOSPublicPage from "./CareerOSPublicPage"
import CareerOSPublicAreaPage from "./CareerOSPublicAreaPage"
import "./CareerOS.css"

function AlmaXStyleCareerUnlockBanner({ locked }: { locked: boolean }) {
  if (!locked) return null
  return (
    <div
      role="region"
      aria-label="Career OS Merit Gate Progress"
      style={{
        marginBottom: 22,
        padding: "20px 24px",
        borderRadius: 16,
        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #ffffff 100%)",
        border: "1px solid #fde68a",
        boxShadow: "0 10px 26px -14px rgba(180, 83, 9, 0.18)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, maxWidth: 640 }}>
        <div
          aria-hidden="true"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#ffffff",
            border: "1px solid #fcd34d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          🔒
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <strong style={{ fontSize: 17, color: "#0f172a" }}>
              Unlock Career OS Placement &amp; Recruiter Referrals
            </strong>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 9px",
                borderRadius: 999,
                background: "#92400e",
                color: "#ffffff",
              }}
            >
              60% Course Gate
            </span>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 13.5, color: "#475569", lineHeight: 1.55 }}>
            Complete 60% of your active course modules and submit your Capstone Project inside your Learning Dashboard to unlock direct recruiter applications. You can build your Career Profile, inspect Projects, and preview Job Board roles below right now.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link
              to="/dashboard/student"
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                background: "#5142b5",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Continue Learning →
            </Link>
            <Link
              to="/dashboard/student#explore-programmes"
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#0f172a",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Switch / Explore Programmes Inside Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div
        style={{
          minWidth: 230,
          padding: "14px 18px",
          borderRadius: 12,
          background: "rgba(255, 255, 255, 0.88)",
          border: "1px solid #fde68a",
        }}
      >
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>
          Learn Track Completion
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#0f172a", fontWeight: 700 }}>
          <span>Target Unlock Gate</span>
          <span>60% Modules</span>
        </div>
        <div
          style={{
            marginTop: 8,
            height: 7,
            borderRadius: 999,
            background: "#fef3c7",
            overflow: "hidden",
          }}
        >
          <div style={{ width: "35%", height: "100%", background: "#d97706", borderRadius: 999 }} />
        </div>
      </div>
    </div>
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

  // Signed-in learners NEVER leave AuthDashboardShell / CareerOSShell!
  return (
    <CareerOSShell>
      <AlmaXStyleCareerUnlockBanner locked={access !== "open" && access !== "loading"} />
      <Outlet />
    </CareerOSShell>
  )
}
