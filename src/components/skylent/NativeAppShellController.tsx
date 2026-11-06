import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1, isNativeAppShell } from "../../lib/api-base"
import { APP_VERSION, getNativeCsrfToken, getNativeSessionToken } from "../../lib/native-app-bridge"

type AppConfigPayload = {
  appVersion: string
  minSupportedAppVersion: string
  forceUpdate?: boolean
  buildId?: string
  playStoreUrl: string
  announcement: string | null
  maintenanceMode: boolean
  updateTitle?: string | null
  updateNotes?: string | null
  apkDownloadUrl?: string | null
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

function TabIcon({ name }: { name: "home" | "courses" | "workshops" | "labs" | "account" }) {
  switch (name) {
    case "home":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      )
    case "courses":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
      )
    case "workshops":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    case "labs":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )
    case "account":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.8-3.6 5-5.5 8-5.5s6.2 1.9 8 5.5" />
        </svg>
      )
  }
}

const INSTALLED_BUILD_KEY = "skylent:installed-build-id:v1"

function tryExitNativeApp(): boolean {
  if (typeof window === "undefined") return false
  try {
    const cap = (window as unknown as {
      Capacitor?: {
        Plugins?: { App?: { exitApp?: () => void } }
      }
    }).Capacitor
    if (typeof cap?.Plugins?.App?.exitApp === "function") {
      cap.Plugins.App.exitApp()
      return true
    }
    const navApp = (navigator as unknown as { app?: { exitApp?: () => void } }).app
    if (typeof navApp?.exitApp === "function") {
      navApp.exitApp()
      return true
    }
  } catch {
    // ignore
  }
  return false
}

export function NativeAppShellController() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isNative, setIsNative] = useState(() => isNativeAppShell())
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== "undefined" ? !navigator.onLine : false))
  const [appConfig, setAppConfig] = useState<AppConfigPayload | null>(null)
  const [dismissedBanner, setDismissedBanner] = useState(false)
  const [installedBuildId, setInstalledBuildId] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(INSTALLED_BUILD_KEY)
    } catch {
      return null
    }
  })
  const [updatingInApp, setUpdatingInApp] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)
  const [exitToastVisible, setExitToastVisible] = useState(false)
  const lastBackPressRef = useRef<number>(0)

  // Performance Audit P1 Fix: Intent-based hover/focus route prefetching
  useEffect(() => {
    const prefetched = new Set<string>()
    const prefetchByPath = (href: string) => {
      if (prefetched.has(href)) return
      prefetched.add(href)
      if (href.startsWith("/dashboard/student")) void import("../../pages/DashboardStudentPage").catch(() => {})
      else if (href.startsWith("/career-os")) void import("../../pages/career/CareerOSLayout").catch(() => {})
      else if (href.startsWith("/learn")) void import("../../pages/LearnPage").catch(() => {})
      else if (href.startsWith("/program")) void import("../../pages/ProgramsPage").catch(() => {})
      else if (href.startsWith("/course")) void import("../../pages/CoursesPage").catch(() => {})
      else if (href.startsWith("/login") || href.startsWith("/signup")) void import("../../pages/LoginPage").catch(() => {})
    }
    const onIntent = (e: Event) => {
      const target = e.target as HTMLElement | null
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null
      const href = anchor?.getAttribute("href")
      if (href && href.startsWith("/")) prefetchByPath(href)
    }
    document.addEventListener("pointerover", onIntent, { passive: true })
    document.addEventListener("focusin", onIntent, { passive: true })
    return () => {
      document.removeEventListener("pointerover", onIntent)
      document.removeEventListener("focusin", onIntent)
    }
  }, [])

  // YouTube-style Double-Back to Exit on /dashboard/student (Overview) and /
  useEffect(() => {
    const isDashboardOverview =
      location.pathname === "/dashboard/student" && !location.hash
    const isRootHome = location.pathname === "/" && isNative
    if (!isDashboardOverview && !isRootHome) {
      setExitToastVisible(false)
      return
    }

    const state = window.history.state as { skylentBackGuard?: boolean } | null
    if (!state?.skylentBackGuard) {
      window.history.pushState({ ...state, skylentBackGuard: true }, "", window.location.href)
    }

    const onPopState = () => {
      const now = Date.now()
      if (now - lastBackPressRef.current < 2500) {
        setExitToastVisible(false)
        if (!tryExitNativeApp()) {
          if (location.pathname.startsWith("/dashboard")) {
            navigate("/dashboard/student", { replace: true })
          } else if (window.history.length > 2) {
            window.history.go(-2)
          }
        }
        return
      }
      lastBackPressRef.current = now
      setExitToastVisible(true)
      window.history.pushState({ skylentBackGuard: true }, "", window.location.href)
      window.setTimeout(() => {
        setExitToastVisible(false)
      }, 2400)
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [location.pathname, location.hash, isNative, navigate])

  useEffect(() => {
    const active = isNativeAppShell()
    setIsNative(active)
    if (active) {
      document.documentElement.setAttribute("data-native-app", "true")
    } else {
      document.documentElement.removeAttribute("data-native-app")
    }
    document.documentElement.removeAttribute("data-native-home-hub")
  }, [location.search])

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

  // Audit P1 + Mandatory Force-Update Gate for Native APK Sessions
  useEffect(() => {
    if (!isNativeAppShell()) return
    let cancelled = false
    const checkConfig = () => {
      let storedStamp = ""
      try {
        storedStamp = window.localStorage.getItem(INSTALLED_BUILD_KEY) || ""
      } catch {
        // ignore
      }
      fetch(`${apiV1()}/health/app-config?installedBuild=${encodeURIComponent(storedStamp)}&t=${Date.now()}`, {
        credentials: "include",
        cache: "no-store",
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: AppConfigPayload | null) => {
          if (!cancelled && data && typeof data.minSupportedAppVersion === "string") {
            setAppConfig(data)
          }
        })
        .catch(() => {})
    }
    checkConfig()
    const timer = window.setInterval(checkConfig, 25_000)
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkConfig()
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const remoteStamp = appConfig ? `${appConfig.appVersion}:${appConfig.buildId || "live"}` : null

  // Mandatory Force-Update Condition: ZERO "Later" / Dismiss option!
  const mandatoryUpdateRequired = Boolean(
    isNative &&
      appConfig &&
      remoteStamp &&
      (appConfig.forceUpdate === true ||
        installedBuildId !== remoteStamp ||
        compareSemver(APP_VERSION, appConfig.minSupportedAppVersion) < 0),
  )

  async function triggerInAppUpdate() {
    if (!appConfig || !remoteStamp) return
    setUpdatingInApp(true)
    setUpdateProgress(25)
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map((r) => r.unregister()))
      }
      setUpdateProgress(65)
      if ("caches" in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
      setUpdateProgress(90)
      try {
        window.localStorage.setItem(INSTALLED_BUILD_KEY, remoteStamp)
        window.localStorage.setItem("skylent:ota-live-mode", "1")
      } catch {
        // ignore
      }
      setInstalledBuildId(remoteStamp)
      setTimeout(() => {
        setUpdateProgress(100)
        if (
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" || window.location.hostname === "app.skylent.local")
        ) {
          const token = getNativeSessionToken()
          const csrf = getNativeCsrfToken()
          const targetPath = window.location.pathname + window.location.search + window.location.hash
          const separator = targetPath.includes("?") ? "&" : "?"
          window.location.replace(
            `https://skylent.live${targetPath}${separator}nativeApp=1${token ? `&nativeToken=${encodeURIComponent(token)}` : ""}${csrf ? `&nativeCsrf=${encodeURIComponent(csrf)}` : ""}`,
          )
          return
        }
        window.location.reload()
      }, 300)
    } catch {
      window.location.reload()
    }
  }

  const isWorkspaceOrAuthRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/career-os") ||
    location.pathname.startsWith("/learn") ||
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/os/") ||
    location.pathname.startsWith("/labs/") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/reset-password")

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

  const tabs: Array<{
    id: "home" | "courses" | "workshops" | "labs" | "account"
    label: string
    to: string
    match: (p: string) => boolean
  }> = [
    {
      id: "home",
      label: "Home",
      to: "/",
      match: (p) => p === "/",
    },
    {
      id: "courses",
      label: "Courses",
      to: "/programmes",
      match: (p) => p.startsWith("/programme") || p.startsWith("/course") || p.startsWith("/education"),
    },
    {
      id: "workshops",
      label: "Workshops",
      to: "/events",
      match: (p) => p.startsWith("/event") || p.startsWith("/workshop"),
    },
    {
      id: "labs",
      label: "Labs",
      to: "/labs",
      match: (p) => p.startsWith("/labs") || p.startsWith("/os/") || p.startsWith("/path"),
    },
    {
      id: "account",
      label: user ? "My Learning" : "Sign in",
      to: dashHref,
      match: (p) => p.startsWith("/dashboard") || p.startsWith("/login") || p.startsWith("/career-os"),
    },
  ]

  return (
    <>
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
            textAlign: "center",
            borderBottom: "2px solid #5142b5",
          }}
        >
          Offline mode — your local drafts are saved safely. Reconnecting...
        </div>
      ) : null}

      {/* YouTube-Style Double-Back to Exit Toast */}
      {exitToastVisible ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "calc(78px + env(safe-area-inset-bottom, 0px))",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
            background: "rgba(15, 23, 42, 0.92)",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.35)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          Press back again to exit
        </div>
      ) : null}

      {appConfig?.announcement && !dismissedBanner ? (
        <div
          role="region"
          aria-label="Skylent announcement"
          style={{
            background: "#3B2D96",
            color: "#ffffff",
            padding: "7px 16px",
            fontSize: 12.5,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <span>{appConfig.announcement}</span>
          <button
            type="button"
            onClick={() => setDismissedBanner(true)}
            aria-label="Dismiss announcement"
            style={{
              background: "rgba(255,255,255,0.16)",
              border: "none",
              color: "#ffffff",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      ) : null}

      {/* Full-Screen Mandatory Force-Update Lock Modal (NO "Later", NO Skip, NO Dismiss!) */}
      {mandatoryUpdateRequired && appConfig ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="skylent-force-update-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "2px solid #5142b5",
              maxWidth: 420,
              width: "100%",
              padding: "28px 24px",
              textAlign: "center",
              boxShadow: "0 28px 60px rgba(0,0,0,0.45)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 14px",
                borderRadius: 16,
                background: "#f5f3ff",
                border: "1px solid #ddd6fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              🔒
            </div>
            <span
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "4px 10px",
                borderRadius: 999,
                background: "#fef2f2",
                color: "#dc2626",
                marginBottom: 10,
              }}
            >
              Mandatory Update Required
            </span>
            <h3 id="skylent-force-update-title" style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
              {appConfig.updateTitle || "Update Skylent to Continue"}
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13.5, lineHeight: 1.6, color: "#475569" }}>
              A new version of Skylent (<strong>{appConfig.buildId || `v${appConfig.appVersion}`}</strong>) is now live. Older versions are disabled to protect your courses, certificates, and account security. You must update now to continue.
            </p>
            <button
              type="button"
              disabled={updatingInApp}
              onClick={() => void triggerInAppUpdate()}
              style={{
                display: "block",
                width: "100%",
                background: "linear-gradient(135deg, #3b2d96 0%, #5142b5 100%)",
                color: "#ffffff",
                border: "none",
                padding: "14px 20px",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 15,
                cursor: updatingInApp ? "wait" : "pointer",
                boxShadow: "0 10px 24px -8px rgba(81, 66, 181, 0.55)",
              }}
            >
              {updatingInApp ? `Installing Mandatory Update (${updateProgress}%)…` : "Update Now to Continue →"}
            </button>
          </div>
        </div>
      ) : null}

      {!isWorkspaceOrAuthRoute ? (
        <nav
          aria-label="Mobile quick navigation"
          className="skylent-mobile-tabbar"
        >
          {tabs.map((tab) => {
            const active = tab.match(location.pathname)
            return (
              <Link
                key={tab.id}
                to={tab.to}
                aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(tab.to)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className={active ? "skylent-mobile-tabbar__item is-active" : "skylent-mobile-tabbar__item"}
              >
                <TabIcon name={tab.id} />
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
