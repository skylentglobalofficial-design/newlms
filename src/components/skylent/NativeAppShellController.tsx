import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
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

type NativeHubTab = "home" | "batches" | "practice" | "live"

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
    subtitle: "Course Studio & Telemetry",
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
    label: "Faculty TA",
    subtitle: "20-Min Doubt SLA & Grading",
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
    subtitle: "Cohort Placement & CSV",
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
    subtitle: "Verified Proof Dossiers",
    badge: "💼",
    path: "/dashboard/recruiter",
    user: {
      id: "demo-recruiter",
      name: "Rohan Verma (Hiring)",
      email: "recruiter@demo.skylent.in",
      role: "recruiter",
      avatar: "RV",
    },
  },
  {
    role: "organisation",
    label: "Enterprise L&D",
    subtitle: "Team Upskilling & ROI",
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

const MOBILE_APP_BATCHES = [
  {
    slug: "data-analytics-pro",
    courseSlug: "data-analytics",
    category: "data",
    icon: "📊",
    title: "Data Analytics & SQL Bootcamp",
    oneLiner: "SQL Joins, CTEs & Northwind Margin Audit",
    rating: "4.9",
    learners: "1.4k",
    lessons: "15 Lessons",
    capstone: "1 Graded Capstone",
    price: "₹0 Free Pilot",
    accent: "#5142b5",
    bg: "linear-gradient(135deg, #3B2D96 0%, #5142B5 100%)",
    chipBg: "#f5f3ff",
  },
  {
    slug: "generative-ai-program",
    courseSlug: "generative-ai",
    category: "ai",
    icon: "🤖",
    title: "Generative AI & RAG Systems",
    oneLiner: "Citation-Grounded RAG & Prompt Guardrails",
    rating: "4.9",
    learners: "1.1k",
    lessons: "15 Lessons",
    capstone: "1 Graded Capstone",
    price: "₹0 Free Pilot",
    accent: "#4f46e5",
    bg: "linear-gradient(135deg, #312e81 0%, #4f46e5 100%)",
    chipBg: "#eef2ff",
  },
  {
    slug: "data-science-ai",
    courseSlug: "data-science-ai",
    category: "data",
    icon: "🧬",
    title: "Data Science & Applied AI",
    oneLiner: "SQL + Python Pipelines & Cohort Churn Models",
    rating: "4.9",
    learners: "980",
    lessons: "30 Lessons",
    capstone: "2 Capstones",
    price: "₹0 Free Pilot",
    accent: "#059669",
    bg: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
    chipBg: "#ecfdf5",
  },
  {
    slug: "product-management",
    courseSlug: "product-management",
    category: "product",
    icon: "📦",
    title: "Product Management & Strategy",
    oneLiner: "Harbor Desk Triage, Metrics & 6-Week PRD",
    rating: "4.8",
    learners: "860",
    lessons: "15 Lessons",
    capstone: "1 Graded PRD",
    price: "₹0 Free Pilot",
    accent: "#0284c7",
    bg: "linear-gradient(135deg, #075985 0%, #0284c7 100%)",
    chipBg: "#f0f9ff",
  },
  {
    slug: "full-stack",
    courseSlug: "full-stack-web",
    category: "web",
    icon: "💻",
    title: "Full-Stack TypeScript & Cloud",
    oneLiner: "React, Node/Express APIs & PostgreSQL Ledgers",
    rating: "4.8",
    learners: "920",
    lessons: "15 Lessons",
    capstone: "1 Production App",
    price: "₹0 Free Pilot",
    accent: "#7c3aed",
    bg: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)",
    chipBg: "#faf5ff",
  },
  {
    slug: "python-programming",
    courseSlug: "python-programming",
    category: "ai",
    icon: "🐍",
    title: "Python Programming & ETL",
    oneLiner: "Automated Data Hygiene, Validators & Pytest",
    rating: "4.9",
    learners: "1.2k",
    lessons: "15 Lessons",
    capstone: "1 ETL Capstone",
    price: "₹0 Free Pilot",
    accent: "#d97706",
    bg: "linear-gradient(135deg, #78350f 0%, #d97706 100%)",
    chipBg: "#fffbeb",
  },
] as const

const MOBILE_PRACTICE_LABS = [
  {
    id: "sql",
    icon: "🗄️",
    badge: "POSTGRESQL IN-BROWSER",
    title: "Northwind SQL Workbench",
    sub: "Query 180 retail orders & isolate discount leaks",
    xp: "+15 Coins",
    to: "/os/labs/data-analytics/northwind",
    accent: "#5142b5",
  },
  {
    id: "diagnostic",
    icon: "🧭",
    badge: "90-SECOND TEST",
    title: "Career Skill Diagnostic",
    sub: "3 real scenarios to benchmark your percentile",
    xp: "Instant Report",
    to: "/path",
    accent: "#059669",
  },
  {
    id: "harbor",
    icon: "📋",
    badge: "PRODUCT STUDIO",
    title: "Harbor Desk PRD Case Lab",
    sub: "Scope a 6-week triage fix from 18 store interviews",
    xp: "+25 Coins",
    to: "/os/projects/product-management/harbor-desk-case",
    accent: "#0284c7",
  },
  {
    id: "sandbox",
    icon: "⚡",
    badge: "MULTI-TRACK SANDBOX",
    title: "Python, RAG & Ledger Labs",
    sub: "Run automated evaluators on Python & GenAI tasks",
    xp: "+20 Coins",
    to: "/labs",
    accent: "#7c3aed",
  },
] as const

const MOBILE_LIVE_WORKSHOPS = [
  {
    slug: "ai-systems-rag-workshop",
    tag: "SATURDAY · 2 HOURS LIVE",
    title: "AI Systems & Grounded RAG Masterclass",
    mentor: "Live Build + Q&A · Certificate Included",
    price: "₹99",
    cashback: "100% Back (99 Coins)",
    to: "/events",
  },
  {
    slug: "commercial-sql-analytics-workshop",
    tag: "SUNDAY · 2 HOURS LIVE",
    title: "Commercial SQL & Margin Audit Bootcamp",
    mentor: "Hands-On SQL Lab · Certificate Included",
    price: "₹99",
    cashback: "100% Back (99 Coins)",
    to: "/events",
  },
  {
    slug: "product-triage-prd-workshop",
    tag: "WEEKEND · 2 HOURS LIVE",
    title: "Product Strategy & PRD Teardown",
    mentor: "Live Case Study · Certificate Included",
    price: "₹99",
    cashback: "100% Back (99 Coins)",
    to: "/events",
  },
] as const

export function NativeAppShellController() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loginDemo, logout } = useAuth()
  const [isNative, setIsNative] = useState(() => isNativeAppShell())
  const [hubTab, setHubTab] = useState<NativeHubTab>("home")
  const [showWebBrochureOnHome, setShowWebBrochureOnHome] = useState(false)
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<"all" | "data" | "ai" | "product" | "web">("all")
  const [searchQuery, setSearchQuery] = useState("")
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
    setRoleDrawerOpen(false)
    navigate(entry.path)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openAppRoute(to: string) {
    setShowWebBrochureOnHome(false)
    navigate(to)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const filteredBatches = MOBILE_APP_BATCHES.filter((b) => {
    const matchesCat = categoryFilter === "all" || b.category === categoryFilter
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || b.title.toLowerCase().includes(q) || b.oneLiner.toLowerCase().includes(q)
    return matchesCat && matchesSearch
  })

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
            fontSize: 12,
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
            fontSize: 12,
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
              Update to version <strong>v{appConfig.minSupportedAppVersion}</strong> on Google Play Store to continue.
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

      {/* 4. Clean Consumer EdTech Mobile App Top Bar (PW / Unacademy / Udemy Standard) */}
      {isNative ? (
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            zIndex: 995,
            background: "#ffffff",
            color: "#0f172a",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
            {location.pathname !== "/" ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#0f172a",
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
                  background: "linear-gradient(135deg, #3B2D96 0%, #5142B5 100%)",
                  color: "#ffffff",
                  fontWeight: 900,
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                S
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, color: "#0f172a", lineHeight: 1.15 }}>
                {user ? `Hi, ${user.name.split(" ")[0]} 👋` : "Skylent"}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user ? `${user.role.toUpperCase()} WORKSPACE` : " Data · AI · Product · Web"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Clean 1-Tap Role Switcher Drawer Trigger (Keeps developer role buttons off the main student feed!) */}
            <button
              type="button"
              onClick={() => setRoleDrawerOpen(true)}
              style={{
                background: "#f5f3ff",
                border: "1px solid #ddd6fe",
                color: "#5142b5",
                borderRadius: 999,
                padding: "5px 10px",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>🎭</span>
              <span>Role</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowWebBrochureOnHome(false)
                setHubTab("live")
                if (location.pathname !== "/") navigate("/")
              }}
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                color: "#b45309",
                borderRadius: 999,
                padding: "5px 9px",
                fontSize: 11.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span>🪙</span>
              <span>{elixirBonus}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(dashHref)}
              style={{
                background: "#5142b5",
                color: "#ffffff",
                border: "none",
                borderRadius: 999,
                padding: "5px 11px",
                fontSize: 11.5,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {user ? user.avatar : "Login"}
            </button>
          </div>
        </header>
      ) : null}

      {/* Role Switcher Bottom Sheet Drawer */}
      {isNative && roleDrawerOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Switch Role Workspace"
          onClick={() => setRoleDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: 520,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: "18px 16px calc(22px + env(safe-area-inset-bottom))",
              boxShadow: "0 -12px 36px rgba(15, 23, 42, 0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase" }}>
                  INSTANT WORKSPACE SWITCHER
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                  Preview Any Skylent Role
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoleDrawerOpen(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 999,
                  width: 32,
                  height: 32,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
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
                    <span style={{ fontSize: 20 }}>{item.badge}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0f172a" }}>{item.label}</div>
                      <div style={{ fontSize: 10.5, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setRoleDrawerOpen(false)
                  setShowWebBrochureOnHome((v) => !v)
                  if (location.pathname !== "/") navigate("/")
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#334155",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {showWebBrochureOnHome ? "📱 Switch to App UI" : "🌐 Preview Website Mode"}
              </button>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    void logout()
                    setRoleDrawerOpen(false)
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* 5. Unacademy / PW / Udemy / Coursera Style Native Mobile App Screens */}
      {isAppHomeHubActive ? (
        <div
          className="skylent-playstore-home-hub"
          style={{
            paddingTop: 64,
            paddingBottom: "calc(84px + env(safe-area-inset-bottom))",
            paddingInline: 14,
            maxWidth: 520,
            margin: "0 auto",
            background: "#f8fafc",
            minHeight: "100vh",
            color: "#0f172a",
            fontFamily: "var(--font-body, Inter, system-ui, sans-serif)",
          }}
        >
          {/* Search + Category Filter Pills (Shown on Home & Batches tabs) */}
          {hubTab === "home" || hubTab === "batches" ? (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 12,
                  padding: "9px 12px",
                  marginBottom: 10,
                  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03)",
                }}
              >
                <span style={{ fontSize: 14, color: "#64748b" }}>🔍</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (hubTab === "home" && e.target.value.trim()) setHubTab("batches")
                  }}
                  placeholder="Search SQL, Python, GenAI, Product..."
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    fontSize: 13,
                    color: "#0f172a",
                    background: "transparent",
                  }}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{ border: "none", background: "none", color: "#64748b", fontSize: 12, cursor: "pointer" }}
                  >
                    ✕
                  </button>
                ) : null}
              </div>

              {/* Horizontal Swipe Category Pills */}
              <div
                style={{
                  display: "flex",
                  gap: 7,
                  overflowX: "auto",
                  paddingBottom: 2,
                  scrollbarWidth: "none",
                }}
              >
                {[
                  { id: "all" as const, label: "All (6)" },
                  { id: "data" as const, label: "📊 Data & SQL" },
                  { id: "ai" as const, label: "🤖 AI & Python" },
                  { id: "product" as const, label: "📦 Product" },
                  { id: "web" as const, label: "💻 Full-Stack" },
                ].map((cat) => {
                  const active = categoryFilter === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryFilter(cat.id)}
                      style={{
                        padding: "6px 13px",
                        borderRadius: 999,
                        border: active ? "1.5px solid #5142b5" : "1px solid #e2e8f0",
                        background: active ? "#5142b5" : "#ffffff",
                        color: active ? "#ffffff" : "#334155",
                        fontSize: 12,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* ==================== TAB 1: HOME ==================== */}
          {hubTab === "home" ? (
            <>
              {/* Compact Resume Learning Banner (Coursera / PW Style) */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1e1b4b 0%, #3B2D96 55%, #5142B5 100%)",
                  borderRadius: 18,
                  padding: "16px",
                  color: "#ffffff",
                  boxShadow: "0 12px 28px -10px rgba(59, 45, 150, 0.45)",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, background: "rgba(255,255,255,0.16)", padding: "3px 9px", borderRadius: 999 }}>
                    🔥 5-DAY STREAK · ACTIVE BATCH
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: "#34d399" }}>42% Done</span>
                </div>
                <div style={{ fontSize: 16.5, fontWeight: 800, marginBottom: 4 }}>
                  Data Analytics &amp; SQL Bootcamp
                </div>
                <div style={{ fontSize: 12, color: "#ddd6fe", marginBottom: 10 }}>
                  Next: Module 1 · Order Grain &amp; Fanout Joins
                </div>
                <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.2)", marginBottom: 12 }}>
                  <div style={{ width: "42%", height: "100%", background: "#34d399", borderRadius: 999 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => openAppRoute("/courses/data-analytics")}
                    style={{
                      background: "#fbbf24",
                      color: "#1e1b4b",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px",
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ▶ Resume Lesson
                  </button>
                  <button
                    type="button"
                    onClick={() => setHubTab("practice")}
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      color: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.28)",
                      borderRadius: 10,
                      padding: "10px",
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ⚡ Practice Labs
                  </button>
                </div>
              </div>

              {/* Horizontal Swipe Carousel: Popular Job-Ready Batches (Udemy / PW Style) */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: "#0f172a" }}>
                    🎓 Popular Job-Ready Batches
                  </h2>
                  <button
                    type="button"
                    onClick={() => setHubTab("batches")}
                    style={{ background: "none", border: "none", color: "#5142b5", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                  >
                    View All ({filteredBatches.length}) →
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridAutoFlow: "column",
                    gridAutoColumns: "82%",
                    gap: 12,
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    paddingBottom: 6,
                  }}
                >
                  {filteredBatches.map((batch) => (
                    <div
                      key={batch.slug}
                      style={{
                        scrollSnapAlign: "start",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 16,
                        overflow: "hidden",
                        boxShadow: "0 4px 14px -6px rgba(15, 23, 42, 0.08)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            background: batch.bg,
                            padding: "12px 14px",
                            color: "#ffffff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: 22 }}>{batch.icon}</span>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              background: "rgba(255,255,255,0.2)",
                              padding: "3px 8px",
                              borderRadius: 999,
                            }}
                          >
                            ★ {batch.rating} ({batch.learners})
                          </span>
                        </div>
                        <div style={{ padding: "12px 14px 8px" }}>
                          <div style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a", marginBottom: 3 }}>
                            {batch.title}
                          </div>
                          <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>
                            {batch.oneLiner}
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                            <span style={{ fontSize: 10.5, fontWeight: 700, background: "#f1f5f9", color: "#334155", padding: "3px 8px", borderRadius: 6 }}>
                              📚 {batch.lessons}
                            </span>
                            <span style={{ fontSize: 10.5, fontWeight: 700, background: "#ecfdf5", color: "#065f46", padding: "3px 8px", borderRadius: 6 }}>
                              ✓ {batch.price}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: "0 14px 12px", display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => openAppRoute(`/courses/${batch.courseSlug}`)}
                          style={{
                            flex: 1,
                            background: "#5142b5",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 9,
                            padding: "8px 10px",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          Start Free →
                        </button>
                        <button
                          type="button"
                          onClick={() => openAppRoute(`/programmes/${batch.slug}`)}
                          style={{
                            background: "#f8fafc",
                            color: "#334155",
                            border: "1px solid #cbd5e1",
                            borderRadius: 9,
                            padding: "8px 10px",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Syllabus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Compact Quick-Action Pills (2x2 Grid) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 16 }}>
                {[
                  { icon: "🧭", title: "90s Skill Test", sub: "Find your best track", action: () => openAppRoute("/path"), bg: "#f5f3ff", border: "#ddd6fe" },
                  { icon: "⚡", title: "SQL & Code Labs", sub: "Practise in browser", action: () => setHubTab("practice"), bg: "#ecfdf5", border: "#a7f3d0" },
                  { icon: "🪙", title: "₹99 Live Classes", sub: "100% Coin Cashback", action: () => setHubTab("live"), bg: "#fffbeb", border: "#fde68a" },
                  { icon: "📜", title: "Verify Certificate", sub: "Check SKL ID", action: () => openAppRoute("/verify"), bg: "#f0f9ff", border: "#bae6fd" },
                ].map((tile) => (
                  <button
                    key={tile.title}
                    type="button"
                    onClick={tile.action}
                    style={{
                      background: tile.bg,
                      border: `1px solid ${tile.border}`,
                      borderRadius: 14,
                      padding: "11px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{tile.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{tile.title}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{tile.sub}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Compact Daily 1-Tap Quiz Poll (+25 Coins) */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderLeft: "4px solid #5142b5",
                  borderRadius: 16,
                  padding: "13px 14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: "#5142b5", textTransform: "uppercase" }}>
                    ⚡ DAILY 1-TAP POLL
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: "#059669", background: "#dcfce7", padding: "2px 8px", borderRadius: 999 }}>
                    +25 Coins
                  </span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
                  Why did revenue inflate 2.4x after joining `orders` to `order_items`?
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  {[
                    { id: "fanout", text: "A. 1-to-many join fanout duplicated order shipping" },
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
                          padding: "8px 11px",
                          borderRadius: 9,
                          border: picked ? "2px solid #5142b5" : "1px solid #cbd5e1",
                          background: picked ? "#f5f3ff" : "#f8fafc",
                          color: "#0f172a",
                          fontSize: 12,
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
                  <div style={{ marginTop: 8, fontSize: 11.5, fontWeight: 700, color: "#065f46", background: "#ecfdf5", padding: "7px 10px", borderRadius: 8 }}>
                    ✓ Correct! Aggregate `order_items` first before joining (+25 Coins added!).
                  </div>
                ) : coldCallChoice === "nulls" ? (
                  <div style={{ marginTop: 8, fontSize: 11.5, fontWeight: 700, color: "#92400e", background: "#fffbeb", padding: "7px 10px", borderRadius: 8 }}>
                    Hint: 1 order with 4 items multiplies order-level columns 4x. Try Option A!
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {/* ==================== TAB 2: BATCHES & COURSES ==================== */}
          {hubTab === "batches" ? (
            <div style={{ display: "grid", gap: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                  🎓 All Job-Ready Batches ({filteredBatches.length})
                </h2>
                <button
                  type="button"
                  onClick={() => openAppRoute("/education")}
                  style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#5142b5", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                >
                  🏛️ UG/PG Degrees →
                </button>
              </div>

              {filteredBatches.map((batch) => (
                <div
                  key={batch.slug}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: "13px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: batch.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {batch.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a" }}>{batch.title}</div>
                        <div style={{ fontSize: 12, color: "#475569" }}>{batch.oneLiner}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#065f46", background: "#ecfdf5", padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>
                      ★ {batch.rating}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
                    <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>
                      📚 {batch.lessons} · 🏆 {batch.capstone}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => openAppRoute(`/programmes/${batch.slug}`)}
                        style={{
                          background: "#f8fafc",
                          color: "#334155",
                          border: "1px solid #cbd5e1",
                          borderRadius: 8,
                          padding: "6px 10px",
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => openAppRoute(`/courses/${batch.courseSlug}`)}
                        style={{
                          background: "#5142b5",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 8,
                          padding: "6px 12px",
                          fontSize: 11.5,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Start Free →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* ==================== TAB 3: PRACTICE ARENA ==================== */}
          {hubTab === "practice" ? (
            <div style={{ display: "grid", gap: 11 }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #1e1b4b 0%, #3B2D96 100%)",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: "#ffffff",
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 800, color: "#a5b4fc", textTransform: "uppercase" }}>
                  ZERO-SETUP MOBILE LABS
                </div>
                <div style={{ fontSize: 16.5, fontWeight: 800, marginTop: 2 }}>
                  Practise SQL, Python, PRDs &amp; GenAI
                </div>
                <div style={{ fontSize: 12, color: "#ddd6fe", marginTop: 3 }}>
                  Tap any workbench below to run real queries and earn Elixir Coins.
                </div>
              </div>

              {MOBILE_PRACTICE_LABS.map((lab) => (
                <button
                  key={lab.id}
                  type="button"
                  onClick={() => openAppRoute(lab.to)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderLeft: `4px solid ${lab.accent}`,
                    borderRadius: 14,
                    padding: "13px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    textAlign: "left",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span style={{ fontSize: 24 }}>{lab.icon}</span>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: lab.accent }}>{lab.badge}</span>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{lab.title}</div>
                      <div style={{ fontSize: 11.5, color: "#64748b" }}>{lab.sub}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: "#f5f3ff",
                      color: "#5142b5",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "5px 9px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lab.xp} →
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {/* ==================== TAB 4: ₹99 LIVE WORKSHOPS ==================== */}
          {hubTab === "live" ? (
            <div style={{ display: "grid", gap: 11 }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #3B2D96 0%, #5142B5 100%)",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: "#fde68a" }}>
                    100% ELIXIR COIN CASHBACK
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>
                    ₹99 Weekend Live Workshops
                  </div>
                  <div style={{ fontSize: 11.5, color: "#ddd6fe", marginTop: 2 }}>
                    Attend a 2-hr live build &amp; get all 99 Coins back!
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    borderRadius: 12,
                    padding: "8px 12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#fde68a" }}>🪙 {elixirBonus}</div>
                  <div style={{ fontSize: 9.5, color: "#ffffff", fontWeight: 700 }}>WALLET</div>
                </div>
              </div>

              {MOBILE_LIVE_WORKSHOPS.map((ws) => (
                <div
                  key={ws.slug}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: "13px 14px",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#5142b5", background: "#f5f3ff", padding: "3px 8px", borderRadius: 999 }}>
                      {ws.tag}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#065f46", background: "#ecfdf5", padding: "3px 8px", borderRadius: 999 }}>
                      ★ {ws.cashback}
                    </span>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a", marginBottom: 3 }}>
                    {ws.title}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <span style={{ fontSize: 11.5, color: "#64748b" }}>{ws.mentor}</span>
                    <button
                      type="button"
                      onClick={() => openAppRoute(ws.to)}
                      style={{
                        background: "#5142b5",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 12px",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Book {ws.price} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 6. 5-Tab Consumer EdTech Bottom Navigation Bar (Unacademy / PW / Udemy Standard) */}
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
            padding: "5px 6px calc(5px + env(safe-area-inset-bottom))",
          }}
        >
          {[
            {
              id: "home",
              label: "Home",
              icon: "🏠",
              active: isAppHomeHubActive ? hubTab === "home" : location.pathname === "/",
              onClick: () => {
                setShowWebBrochureOnHome(false)
                setHubTab("home")
                if (location.pathname !== "/") navigate("/")
                window.scrollTo({ top: 0, behavior: "smooth" })
              },
            },
            {
              id: "batches",
              label: "Batches",
              icon: "🎓",
              active: isAppHomeHubActive
                ? hubTab === "batches"
                : location.pathname.startsWith("/programme") || location.pathname.startsWith("/course"),
              onClick: () => {
                setShowWebBrochureOnHome(false)
                setHubTab("batches")
                if (location.pathname !== "/") navigate("/")
                window.scrollTo({ top: 0, behavior: "smooth" })
              },
            },
            {
              id: "practice",
              label: "Practice",
              icon: "⚡",
              active: isAppHomeHubActive
                ? hubTab === "practice"
                : location.pathname.startsWith("/labs") || location.pathname.startsWith("/os/") || location.pathname.startsWith("/path"),
              onClick: () => {
                setShowWebBrochureOnHome(false)
                setHubTab("practice")
                if (location.pathname !== "/") navigate("/")
                window.scrollTo({ top: 0, behavior: "smooth" })
              },
            },
            {
              id: "live",
              label: "₹99 Live",
              icon: "🪙",
              active: isAppHomeHubActive
                ? hubTab === "live"
                : location.pathname.startsWith("/event") || location.pathname.startsWith("/workshop"),
              onClick: () => {
                setShowWebBrochureOnHome(false)
                setHubTab("live")
                if (location.pathname !== "/") navigate("/")
                window.scrollTo({ top: 0, behavior: "smooth" })
              },
            },
            {
              id: "myos",
              label: user ? "My OS" : "Account",
              icon: "👤",
              active: location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/login"),
              onClick: () => {
                navigate(dashHref)
                window.scrollTo({ top: 0, behavior: "smooth" })
              },
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={tab.onClick}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                border: "none",
                padding: "5px 2px",
                borderRadius: 10,
                color: tab.active ? "#5142b5" : "#64748b",
                fontWeight: tab.active ? 800 : 600,
                fontSize: 11,
                background: tab.active ? "#f5f3ff" : "transparent",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 17, lineHeight: 1 }} aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      ) : null}
    </>
  )
}
export default NativeAppShellController
