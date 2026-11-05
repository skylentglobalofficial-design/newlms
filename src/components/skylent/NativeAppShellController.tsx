import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth, type AuthUser, type UserRole } from "../../context/AuthContext"
import { apiV1, isNativeAppShell } from "../../lib/api-base"
import { APP_VERSION } from "../../lib/native-app-bridge"

type AppConfigPayload = {
  appVersion: string
  minSupportedAppVersion: string
  playStoreUrl: string
  announcement: string | null
  maintenanceMode: boolean
}

function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0)
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < 3; i += 1) {
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1
  }
  return 0
}

const QUICK_ROLE_ACCOUNTS: Array<{
  role: UserRole
  label: string
  subtitle: string
  badge: string
  path: string
  user: AuthUser
}> = [
  {
    role: "student",
    label: "Student App",
    subtitle: "Courses, Streak & Elixir",
    badge: "🎓",
    path: "/dashboard/student",
    user: {
      id: "demo-student",
      name: "Aarav Sharma",
      email: "learner@demo.skylent.in",
      role: "student",
      avatar: "AS",
      program: "Data Analytics & GenAI",
      progress: 42,
    },
  },
  {
    role: "superadmin",
    label: "Admin C-Suite",
    subtitle: "CEO/CFO Telemetry & Users",
    badge: "🛡️",
    path: "/dashboard/admin",
    user: {
      id: "demo-superadmin",
      name: "Chandan (Founder Admin)",
      email: "admin@demo.skylent.in",
      role: "superadmin",
      avatar: "CA",
    },
  },
  {
    role: "faculty",
    label: "Faculty SLA",
    subtitle: "20-Min Doubt Queue & Grading",
    badge: "👩‍🏫",
    path: "/dashboard/faculty",
    user: {
      id: "demo-faculty",
      name: "Dr. Meera Krishnan",
      email: "faculty@demo.skylent.in",
      role: "faculty",
      avatar: "MK",
    },
  },
  {
    role: "college",
    label: "College TPO",
    subtitle: "Cohort Placement & NEP CSV",
    badge: "🏛️",
    path: "/dashboard/college",
    user: {
      id: "demo-college",
      name: "Dean Placement Cell",
      email: "college@demo.skylent.in",
      role: "college",
      avatar: "TP",
    },
  },
  {
    role: "recruiter",
    label: "Recruiter",
    subtitle: "Verified Proof-of-Work Dossiers",
    badge: "💼",
    path: "/dashboard/recruiter",
    user: {
      id: "demo-recruiter",
      name: "Rohan Verma (Hiring Partner)",
      email: "recruiter@demo.skylent.in",
      role: "recruiter",
      avatar: "RV",
    },
  },
  {
    role: "organisation",
    label: "Enterprise Org",
    subtitle: "Team Upskilling & L&D",
    badge: "🏢",
    path: "/dashboard/organisation",
    user: {
      id: "demo-org",
      name: "Enterprise L&D Lead",
      email: "institution@demo.skylent.in",
      role: "organisation",
      avatar: "EL",
    },
  },
]

const MOBILE_APP_TRACKS = [
  {
    slug: "data-analytics",
    courseSlug: "sql-analytics-foundations",
    title: "Data Analytics & Business Intelligence",
    tag: "MOST POPULAR · SQL + PYTHON + BI",
    duration: "24 Weeks",
    projects: "4 Graded Capstones",
    fee: "₹2,999 / self-paced",
    accent: "#5142b5",
    bg: "#f5f3ff",
  },
  {
    slug: "product-management",
    courseSlug: "product-management-foundations",
    title: "Product Management & AI Execution",
    tag: "HARBOR DESK PRD + METRICS",
    duration: "20 Weeks",
    projects: "3 Live Case Dossiers",
    fee: "₹2,999 / self-paced",
    accent: "#0284c7",
    bg: "#f0f9ff",
  },
  {
    slug: "data-science-ai",
    courseSlug: "python-for-data-science",
    title: "Data Science & Applied GenAI",
    tag: "PYTHON + ML + RAG PIPELINES",
    duration: "28 Weeks",
    projects: "5 Portfolio Systems",
    fee: "₹3,499 / self-paced",
    accent: "#059669",
    bg: "#ecfdf5",
  },
  {
    slug: "full-stack-web",
    courseSlug: "full-stack-typescript",
    title: "Full-Stack TypeScript & Cloud Systems",
    tag: "REACT + NODE + POSTGRESQL",
    duration: "26 Weeks",
    projects: "4 Production Apps",
    fee: "₹3,499 / self-paced",
    accent: "#7c3aed",
    bg: "#faf5ff",
  },
  {
    slug: "business-ai",
    courseSlug: "business-analytics-strategy",
    title: "Business Strategy & AI Operations",
    tag: "BOARDROOM COLD CALLS + P&L",
    duration: "18 Weeks",
    projects: "3 Executive Dossiers",
    fee: "₹2,499 / self-paced",
    accent: "#d97706",
    bg: "#fffbeb",
  },
  {
    slug: "applied-ai-engineering",
    courseSlug: "applied-genai-systems",
    title: "Applied GenAI & Agentic Engineering",
    tag: "LLM EVALS + CITATION GUARDRAILS",
    duration: "24 Weeks",
    projects: "4 AI Agent Builds",
    fee: "₹3,499 / self-paced",
    accent: "#4f46e5",
    bg: "#eef2ff",
  },
]

export function NativeAppShellController() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loginDemo, logout } = useAuth()
  const [isNative, setIsNative] = useState(() => isNativeAppShell())
  const [showWebBrochureOnHome, setShowWebBrochureOnHome] = useState(false)
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== "undefined" ? !navigator.onLine : false))
  const [appConfig, setAppConfig] = useState<AppConfigPayload | null>(null)
  const [dismissedBanner, setDismissedBanner] = useState(false)
  const [sqlOutputReady, setSqlOutputReady] = useState(false)
  const [coldCallChoice, setColdCallChoice] = useState<string | null>(null)
  const [elixirBonus, setElixirBonus] = useState(99)

  useEffect(() => {
    const active = isNativeAppShell()
    setIsNative(active)
    if (active) {
      document.documentElement.setAttribute("data-native-app", "true")
    } else {
      document.documentElement.removeAttribute("data-native-app")
    }
  }, [location.search])

  const isAppHomeHubActive = isNative && location.pathname === "/" && !showWebBrochureOnHome

  useEffect(() => {
    if (isAppHomeHubActive) {
      document.documentElement.setAttribute("data-native-home-hub", "true")
    } else {
      document.documentElement.removeAttribute("data-native-home-hub")
    }
    return () => {
      document.documentElement.removeAttribute("data-native-home-hub")
    }
  }, [isAppHomeHubActive])

  useEffect(() => {
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  // Fetch remote app config for OTA version gate & live announcements
  useEffect(() => {
    let cancelled = false
    fetch(`${apiV1()}/health/app-config`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AppConfigPayload | null) => {
        if (!cancelled && data && typeof data.minSupportedAppVersion === "string") {
          setAppConfig(data)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const forceUpdateRequired =
    isNative &&
    appConfig?.minSupportedAppVersion &&
    compareSemver(APP_VERSION, appConfig.minSupportedAppVersion) < 0

  const dashHref = user
    ? user.role === "admin" || user.role === "superadmin"
      ? "/dashboard/admin"
      : user.role === "faculty"
        ? "/dashboard/faculty"
        : user.role === "college"
          ? "/dashboard/college"
          : user.role === "recruiter"
            ? "/dashboard/recruiter"
            : user.role === "organisation"
              ? "/dashboard/organisation"
              : "/dashboard/student"
    : "/login"

  function handleQuickRoleSwitch(entry: (typeof QUICK_ROLE_ACCOUNTS)[number]) {
    loginDemo(entry.user)
    navigate(entry.path)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {/* 1. Offline Connection Guard Banner */}
      {isOffline ? (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9998,
            background: "#0f172a",
            color: "#f8fafc",
            padding: "8px 16px",
            fontSize: 12.5,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderBottom: "2px solid #5142b5",
          }}
        >
          <span aria-hidden="true">📡</span>
          <span>Offline Mode — Local drafts saved safely.</span>
        </div>
      ) : null}

      {/* 2. Remote OTA Live Announcement Banner */}
      {appConfig?.announcement && !dismissedBanner ? (
        <div
          role="region"
          aria-label="Skylent announcement"
          style={{
            background: "linear-gradient(90deg, #3B2D96 0%, #5142B5 100%)",
            color: "#ffffff",
            padding: "7px 16px",
            fontSize: 12.5,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <span>✨ {appConfig.announcement}</span>
          <button
            type="button"
            onClick={() => setDismissedBanner(true)}
            aria-label="Dismiss announcement"
            style={{
              background: "rgba(255,255,255,0.16)",
              border: "none",
              color: "#ffffff",
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      ) : null}

      {/* 3. Force Update Modal for Outdated Play Store APKs */}
      {forceUpdateRequired && appConfig ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="skylent-force-update-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(15, 23, 42, 0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid #ddd6fe",
              borderTop: "5px solid #5142b5",
              maxWidth: 420,
              width: "100%",
              padding: "26px 24px",
              textAlign: "center",
              boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🚀</div>
            <h3 id="skylent-force-update-title" style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 800, color: "#0f172a" }}>
              New Skylent App Update Required
            </h3>
            <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.55, color: "#475569" }}>
              We have upgraded Skylent to version <strong>v{appConfig.minSupportedAppVersion}</strong> with new labs and faster performance.
            </p>
            <a
              href={appConfig.playStoreUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                background: "#5142b5",
                color: "#ffffff",
                textDecoration: "none",
                padding: "11px 22px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Update on Google Play Store →
            </a>
          </div>
        </div>
      ) : null}

      {/* 4. Native Play Store App Top Bar (Shown in Native App Mode across public & catalogue screens) */}
      {isNative ? (
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 58,
            zIndex: 995,
            background: "linear-gradient(90deg, #1e1b4b 0%, #3B2D96 55%, #5142B5 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
            boxShadow: "0 4px 18px rgba(30, 27, 75, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {location.pathname !== "/" ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ←
              </button>
            ) : (
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  color: "#1e1b4b",
                  fontWeight: 900,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(251, 191, 36, 0.35)",
                }}
              >
                S
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 15.5, letterSpacing: "-0.02em", color: "#ffffff" }}>
                  Skylent
                </span>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: "rgba(52, 211, 153, 0.22)",
                    color: "#6ee7b7",
                    border: "1px solid rgba(52, 211, 153, 0.4)",
                  }}
                >
                  APP
                </span>
              </div>
              <div style={{ fontSize: 10.5, color: "#c4b5fd", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user ? `${user.name} · ${user.role.toUpperCase()}` : "Learn · Practise · Build"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <button
              type="button"
              onClick={() => navigate("/events")}
              style={{
                background: "rgba(251, 191, 36, 0.16)",
                border: "1px solid rgba(251, 191, 36, 0.45)",
                color: "#fde68a",
                borderRadius: 999,
                padding: "5px 10px",
                fontSize: 11.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>🪙</span>
              <span>{elixirBonus}</span>
            </button>

            {location.pathname === "/" ? (
              <button
                type="button"
                onClick={() => setShowWebBrochureOnHome((v) => !v)}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.24)",
                  color: "#ffffff",
                  borderRadius: 999,
                  padding: "5px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {showWebBrochureOnHome ? "📱 App Hub" : "🌐 Web View"}
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => navigate(dashHref)}
              style={{
                background: "#ffffff",
                color: "#3B2D96",
                border: "none",
                borderRadius: 999,
                padding: "5px 11px",
                fontSize: 11.5,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {user ? user.avatar : "Sign In"}
            </button>
          </div>
        </header>
      ) : null}

      {/* 5. Google Play Store Native Mobile App Home Hub (Rendered on / in Native App Mode) */}
      {isAppHomeHubActive ? (
        <div
          className="skylent-playstore-home-hub"
          style={{
            paddingTop: 68,
            paddingBottom: "calc(90px + env(safe-area-inset-bottom))",
            paddingInline: 14,
            maxWidth: 560,
            margin: "0 auto",
            background: "#f8f7ff",
            minHeight: "100vh",
            color: "#0f172a",
            fontFamily: "var(--font-body, Inter, system-ui, sans-serif)",
          }}
        >
          {/* A. Hero Welcome + Active Track Resume Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #3B2D96 52%, #5142B5 100%)",
              borderRadius: 20,
              padding: "20px 18px",
              color: "#ffffff",
              boxShadow: "0 16px 36px -12px rgba(59, 45, 150, 0.45)",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: "rgba(255,255,255,0.14)",
                  padding: "4px 10px",
                  borderRadius: 999,
                  color: "#e0e7ff",
                }}
              >
                🔥 5-Day Execution Streak
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fde68a" }}>
                ⚡ 20-Min TA SLA Live
              </span>
            </div>

            <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, lineHeight: 1.2, color: "#ffffff" }}>
              {user ? `Welcome back, ${user.name.split(" ")[0]} 👋` : "Namaste! Ready to build real proof-of-work?"}
            </h1>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#ddd6fe", lineHeight: 1.45 }}>
              Practise SQL, Python, Product & GenAI in real sandboxes and graduate with a recruiter-verified dossier.
            </p>

            {/* Active Lesson Resume Strip */}
            <div
              style={{
                background: "rgba(255,255,255,0.11)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 14,
                padding: "12px 14px",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#e0e7ff", marginBottom: 5 }}>
                <span style={{ fontWeight: 700 }}>ACTIVE TRACK · SQL & DATA ANALYTICS</span>
                <span style={{ fontWeight: 800, color: "#34d399" }}>42% Complete</span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>
                Module 1 · Lesson 3: Order Grain & Fanout Joins
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                <div style={{ width: "42%", height: "100%", background: "#34d399", borderRadius: 999 }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                type="button"
                onClick={() => navigate("/courses/sql-analytics-foundations")}
                style={{
                  background: "#fbbf24",
                  color: "#1e1b4b",
                  border: "none",
                  borderRadius: 12,
                  padding: "11px 12px",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ▶ Resume Course
              </button>
              <button
                type="button"
                onClick={() => navigate("/labs")}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 12,
                  padding: "11px 12px",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ⚡ Open SQL Lab
              </button>
            </div>
          </div>

          {/* B. 1-Tap Instant Role Switcher (Test All 6 Dashboards on Phone Without Typing Passwords) */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #ddd6fe",
              borderRadius: 18,
              padding: "15px 14px",
              marginBottom: 16,
              boxShadow: "0 8px 24px -12px rgba(59, 45, 150, 0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  ⚡ Instant Mobile Role Switcher
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a" }}>
                  Tap Any Role to Open Its Live Dashboard
                </div>
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={() => void logout()}
                  style={{
                    background: "#fee2e2",
                    color: "#b91c1c",
                    border: "none",
                    borderRadius: 8,
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              ) : null}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {QUICK_ROLE_ACCOUNTS.map((item) => {
                const isActiveRole = user?.role === item.role
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleQuickRoleSwitch(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      textAlign: "left",
                      padding: "10px 11px",
                      borderRadius: 12,
                      border: isActiveRole ? "2px solid #5142b5" : "1px solid #e2e8f0",
                      background: isActiveRole ? "#f5f3ff" : "#f8fafc",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{item.badge}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: "#1e1b4b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 10.5, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* C. 4 Quick-Action Native App Tiles (2x2 Grid) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              {
                icon: "🧭",
                title: "90s Skill Diagnostic",
                sub: "Find your career track",
                to: "/path",
                bg: "#f5f3ff",
                border: "#c4b5fd",
              },
              {
                icon: "⚡",
                title: "Practice Sandbox",
                sub: "SQL, Python & GenAI",
                to: "/labs",
                bg: "#ecfdf5",
                border: "#a7f3d0",
              },
              {
                icon: "🪙",
                title: "₹99 Live Workshops",
                sub: "100% Elixir Cashback",
                to: "/events",
                bg: "#fffbeb",
                border: "#fde68a",
              },
              {
                icon: "📜",
                title: "Verify Certificate",
                sub: "Check Proof-of-Work",
                to: "/verify",
                bg: "#f0f9ff",
                border: "#bae6fd",
              },
            ].map((tile) => (
              <button
                key={tile.title}
                type="button"
                onClick={() => navigate(tile.to)}
                style={{
                  background: tile.bg,
                  border: `1px solid ${tile.border}`,
                  borderRadius: 16,
                  padding: "14px 13px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{tile.icon}</div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>
                  {tile.title}
                </div>
                <div style={{ fontSize: 11.5, color: "#475569" }}>{tile.sub}</div>
              </button>
            ))}
          </div>

          {/* D. Interactive In-App 30-Second SQL & Cold Call Challenge */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderLeft: "4px solid #5142b5",
              borderRadius: 18,
              padding: "16px 15px",
              marginBottom: 16,
              boxShadow: "0 8px 24px -14px rgba(15, 23, 42, 0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                ⚡ Daily 30-Sec App Challenge
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#dcfce7", padding: "2px 8px", borderRadius: 999 }}>
                +25 Elixir Coins
              </span>
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
              Why did Northwind Q3 Gross Revenue inflate by 2.4x after joining `orders` to `order_items`?
            </div>
            <div style={{ display: "grid", gap: 7, marginBottom: 10 }}>
              {[
                { id: "fanout", text: "A. 1-to-many join fanout duplicated order-level shipping fees" },
                { id: "nulls", text: "B. LEFT JOIN dropped NULL customer rows" },
              ].map((opt) => {
                const picked = coldCallChoice === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setColdCallChoice(opt.id)
                      if (opt.id === "fanout" && !sqlOutputReady) {
                        setSqlOutputReady(true)
                        setElixirBonus((c) => c + 25)
                      }
                    }}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: picked ? "2px solid #5142b5" : "1px solid #cbd5e1",
                      background: picked ? "#f5f3ff" : "#f8fafc",
                      color: "#0f172a",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {opt.text}
                  </button>
                )
              })}
            </div>
            {coldCallChoice === "fanout" ? (
              <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", background: "#ecfdf5", padding: "9px 12px", borderRadius: 10 }}>
                ✓ Spot on! Aggregate `order_items` to `order_id` grain first before joining. (+25 Elixir credited!)
              </div>
            ) : coldCallChoice === "nulls" ? (
              <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", background: "#fffbeb", padding: "9px 12px", borderRadius: 10 }}>
                Hint: When 1 order has 4 line items, an unaggregated join multiplies order-level columns 4x. Try Option A!
              </div>
            ) : null}
          </div>

          {/* E. 6 Flagship Career Tracks (Native Mobile Cards) */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: "#0f172a" }}>
                🎓 Flagship Career Tracks
              </h2>
              <button
                type="button"
                onClick={() => navigate("/programmes")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#5142b5",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                See All 6 →
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {MOBILE_APP_TRACKS.map((track) => (
                <div
                  key={track.slug}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: "14px 15px",
                    boxShadow: "0 4px 14px -6px rgba(15, 23, 42, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: track.accent,
                        background: track.bg,
                        padding: "3px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {track.tag}
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: "#0f172a" }}>{track.fee}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                    {track.title}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#64748b" }}>
                    <span>⏱ {track.duration} · 🛠 {track.projects}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/programmes/${track.slug}`)}
                      style={{
                        background: "#5142b5",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Open →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* F. University Degrees & Exam Prep Strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => navigate("/education")}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "13px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: "#5142b5" }}>UG & PG DEGREES</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                University Pathways →
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate("/education/exams")}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "13px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: "#059669" }}>90s DIAGNOSTIC</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                Exam Prep Hub →
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowWebBrochureOnHome(true)}
            style={{
              width: "100%",
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: 12,
              padding: "11px",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🌐 Switch to Full Marketing Website View
          </button>
        </div>
      ) : null}

      {/* 6. 5-Tab Google Play Store Bottom Navigation Bar */}
      {isNative ? (
        <nav
          aria-label="Skylent App Navigation"
          className="skylent-native-bottom-bar"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 995,
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            boxShadow: "0 -6px 24px rgba(15, 23, 42, 0.08)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            padding: "6px 6px calc(6px + env(safe-area-inset-bottom))",
          }}
        >
          {[
            { to: "/", label: "Home", icon: "🏠", match: (p: string) => p === "/" },
            { to: "/programmes", label: "Courses", icon: "🎓", match: (p: string) => p.startsWith("/programme") || p.startsWith("/course") },
            { to: "/labs", label: "Practice", icon: "⚡", match: (p: string) => p.startsWith("/labs") || p.startsWith("/os/labs") || p.startsWith("/os/practice") },
            { to: "/career-os", label: "Career OS", icon: "💼", match: (p: string) => p.startsWith("/career") },
            { to: dashHref, label: user ? "My OS" : "Account", icon: "👤", match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/login") },
          ].map((tab) => {
            const active = tab.match(location.pathname)
            return (
              <Link
                key={tab.label}
                to={tab.to}
                onClick={(e) => {
                  e.preventDefault()
                  if (tab.to === "/") setShowWebBrochureOnHome(false)
                  navigate(tab.to)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  textDecoration: "none",
                  padding: "5px 2px",
                  borderRadius: 10,
                  color: active ? "#5142b5" : "#64748b",
                  fontWeight: active ? 800 : 600,
                  fontSize: 11,
                  background: active ? "#f5f3ff" : "transparent",
                }}
              >
                <span style={{ fontSize: 17, lineHeight: 1 }} aria-hidden="true">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      ) : null}
    </>
  )
}
export default NativeAppShellController
