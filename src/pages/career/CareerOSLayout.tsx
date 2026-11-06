import { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1 } from "../../lib/api-base"
import CareerOSShell from "../../components/career/CareerOSShell"
import CareerOSPublicPage from "./CareerOSPublicPage"
import CareerOSPublicAreaPage from "./CareerOSPublicAreaPage"
import "./CareerOS.css"

type RiseRow = {
  kind: "course" | "program"
  slug: string
  title: string
  percent: number
  eligible: boolean
  enrolled: boolean
  completedModules: number
  totalModules: number
  thresholdPercent: number
}

function CareerOsLockedInsideLearnerShell({ bestPercent }: { bestPercent: number }) {
  return (
    <CareerOSShell hideSubnav>
      <section aria-labelledby="cos-locked-title" style={{ maxWidth: 820, padding: "12px 0 40px" }}>
        <div
          style={{
            padding: "28px 26px",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            borderTop: "4px solid #5142b5",
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
            Career OS · Merit-Gated Workspace ({bestPercent}% / 60% Completed)
          </span>
          <h1 id="cos-locked-title" style={{ margin: "0 0 10px", fontSize: "clamp(22px, 2.8vw, 28px)", color: "#0f172a" }}>
            Complete 60% of your enrolled course to unlock Career OS
          </h1>
          <p style={{ margin: "0 0 22px", fontSize: 14.5, lineHeight: 1.6, color: "#475569", maxWidth: 680 }}>
            Career OS connects your verified SQL queries, product specifications, and graded capstones directly into an employer-ready portfolio, mock interview defense, and job tracker. Complete the 3 steps below in your learning workspace to unlock full access:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div style={{ padding: 16, borderRadius: 12, border: "1px solid #dcfce7", background: "#f0fdf4" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#15803d", textTransform: "uppercase" }}>
                Step 01 · Enrolment
              </div>
              <strong style={{ display: "block", marginTop: 4, fontSize: 15, color: "#0f172a" }}>
                Enrol in a Career Track
              </strong>
              <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5, color: "#334155" }}>
                Start Data Analytics, Product Management, Python, GenAI, or Full-Stack in your dashboard.
              </p>
            </div>

            <div style={{ padding: 16, borderRadius: 12, border: "1px solid #ddd7ff", background: "#faf9ff" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#5142B5", textTransform: "uppercase" }}>
                Step 02 · 60% Syllabus &amp; Quizzes
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
                Step 03 · Portfolio &amp; Jobs Unlock
              </div>
              <strong style={{ display: "block", marginTop: 4, fontSize: 15, color: "#0f172a" }}>
                Unlock Career OS &amp; Mock Interviews
              </strong>
              <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5, color: "#334155" }}>
                Publish your verified capstone dossier, rehearse interviews, and apply to matched roles.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link className="sk-btn sk-btn-primary" to="/dashboard/student#sh-my-learning">
              Go to My Courses →
            </Link>
            <Link className="sk-btn sk-btn-secondary" to="/dashboard/student#explore-programmes">
              Explore Programmes
            </Link>
          </div>
        </div>
      </section>
    </CareerOSShell>
  )
}

export default function CareerOSLayout() {
  const { user, ready } = useAuth()
  const { pathname } = useLocation()
  const [accessState, setAccessState] = useState<"loading" | "open" | "locked">("loading")
  const [bestPercent, setBestPercent] = useState(0)

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    const isSuperOrAdmin =
      user.role === "superadmin" ||
      user.role === "admin" ||
      user.email?.toLowerCase() === "tariniprasadtripathy17@gmail.com"

    const checkEligibility = async () => {
      try {
        const [accessRes, riseRes] = await Promise.all([
          fetch(`${apiV1()}/career/access`, { credentials: "include" }).catch(() => null),
          fetch(`${apiV1()}/career-rise`, { credentials: "include" }).catch(() => null),
        ])

        let explicitEntitled = false
        if (accessRes && accessRes.ok) {
          const body = (await accessRes.json().catch(() => ({}))) as { data?: { entitled?: boolean } }
          explicitEntitled = body.data?.entitled === true
        }

        let maxPct = 0
        let qualified60 = false
        if (riseRes && riseRes.ok) {
          const riseBody = (await riseRes.json().catch(() => ({}))) as { data?: RiseRow[] }
          const rows = riseBody.data ?? []
          for (const r of rows) {
            if (r.percent > maxPct) maxPct = r.percent
            if (r.percent >= (r.thresholdPercent || 60) && (r.eligible || r.enrolled)) {
              qualified60 = true
            }
          }
        }

        if (!cancelled) {
          setBestPercent(maxPct)
          if (isSuperOrAdmin || (explicitEntitled && qualified60)) {
            setAccessState("open")
          } else {
            setAccessState("locked")
          }
        }
      } catch {
        if (!cancelled) setAccessState("locked")
      }
    }
    void checkEligibility()
    return () => {
      cancelled = true
    }
  }, [user?.id, user?.role, user?.email])

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

  if (accessState === "loading") {
    return (
      <CareerOSShell hideSubnav>
        <div style={{ padding: "32px 24px", color: "#475569", fontSize: 14 }}>
          Checking your Career OS progress…
        </div>
      </CareerOSShell>
    )
  }

  if (accessState !== "open") {
    return <CareerOsLockedInsideLearnerShell bestPercent={bestPercent} />
  }

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
