import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1, isNativeAppShell } from "../../lib/api-base"
import { APP_VERSION, getNativeSessionToken } from "../../lib/native-app-bridge"

type AppConfigPayload = {
  appVersion: string
  minSupportedAppVersion: string
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
const DISMISSED_BUILD_KEY = "skylent:dismissed-build-id:v1"

export function NativeAppShellController() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isNative, setIsNative] = useState(() => isNativeAppShell())
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== "undefined" ? !navigator.onLine : false))
  const [appConfig, setAppConfig] = useState<AppConfigPayload | null>(null)
  const [dismissedBanner, setDismissedBanner] = useState(false)
  const [dismissedBuildKey, setDismissedBuildKey] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(DISMISSED_BUILD_KEY)
    } catch {
      return null
    }
  })
  const [installedBuildId, setInstalledBuildId] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(INSTALLED_BUILD_KEY)
    } catch {
      return null
    }
  })
  const [updatingInApp, setUpdatingInApp] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)

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

  useEffect(() => {
    let cancelled = false
    const checkConfig = () => {
      fetch(`${apiV1()}/health/app-config?t=${Date.now()}`, {
        credentials: "include",
        cache: "no-store",
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: AppConfigPayload | null) => {
          if (!cancelled && data && typeof data.minSupportedAppVersion === "string") {
            setAppConfig(data)
            const currentStamp = `${data.appVersion}:${data.buildId || "live"}`
            try {
              const existing = window.localStorage.getItem(INSTALLED_BUILD_KEY)
              // On web (skylent.live), record the initial stamp; on native APK, if no stamp was recorded yet,
              // compare against bundled APP_VERSION so any server push immediately triggers the update banner!
              if (!existing && !isNativeAppShell()) {
                window.localStorage.setItem(INSTALLED_BUILD_KEY, currentStamp)
                setInstalledBuildId(currentStamp)
              }
            } catch {
              // ignore
            }
          }
        })
        .catch(() => {})
    }
    checkConfig()
    const timer = window.setInterval(checkConfig, 30_000)
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

  const forceUpdateRequired =
    isNative &&
    appConfig?.minSupportedAppVersion &&
    compareSemver(APP_VERSION, appConfig.minSupportedAppVersion) < 0

  const hasNewerVersionOrBuild = Boolean(
    appConfig &&
      remoteStamp &&
      dismissedBuildKey !== remoteStamp &&
      ((isNative && compareSemver(APP_VERSION, appConfig.appVersion) < 0 && installedBuildId !== remoteStamp) ||
        (installedBuildId && installedBuildId !== remoteStamp)),
  )

  async function triggerInAppUpdate() {
    if (!appConfig || !remoteStamp) return
    setUpdatingInApp(true)
    setUpdateProgress(20)
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map((r) => r.unregister()))
      }
      setUpdateProgress(60)
      if ("caches" in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
      setUpdateProgress(90)
      try {
        window.localStorage.setItem(INSTALLED_BUILD_KEY, remoteStamp)
        window.localStorage.setItem(DISMISSED_BUILD_KEY, remoteStamp)
      } catch {
        // ignore
      }
      setInstalledBuildId(remoteStamp)
      setDismissedBuildKey(remoteStamp)
      setTimeout(() => {
        setUpdateProgress(100)
        // If running inside Capacitor local host (https://localhost), load the live updated origin from https://skylent.live
        // so the APK immediately renders the latest pushed UI without needing a Play Store reinstall!
        if (
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" || window.location.hostname === "app.skylent.local") &&
          isNative
        ) {
          const token = getNativeSessionToken()
          const targetPath = window.location.pathname + window.location.search + window.location.hash
          const separator = targetPath.includes("?") ? "&" : "?"
          window.location.href = `https://skylent.live${targetPath}${separator}nativeApp=1${token ? `&nativeToken=${encodeURIComponent(token)}` : ""}`
          return
        }
        window.location.reload()
      }, 350)
    } catch {
      window.location.reload()
    }
  }

  // Hide the public bottom bar inside ALL Dashboards, Career OS, Lesson Player, Checkout, and Auth routes
  // so Career OS and Student Dashboard ALWAYS keep their unified AuthDashboardShell navigation!
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

      {hasNewerVersionOrBuild && appConfig && remoteStamp ? (
        <div
          role="region"
          aria-label="In-app update available"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 9995,
            background: "linear-gradient(90deg, #0f172a 0%, #3b2d96 55%, #5142b5 100%)",
            color: "#ffffff",
            padding: "10px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            flexWrap: "wrap",
            boxShadow: "0 6px 20px rgba(15, 23, 42, 0.25)",
          }}
        >
          <span>
            🚀 <strong>New Update v{appConfig.appVersion}</strong>
            {appConfig.updateTitle ? ` — ${appConfig.updateTitle}` : " is ready to apply!"}
          </span>
          <button
            type="button"
            onClick={() => void triggerInAppUpdate()}
            disabled={updatingInApp}
            style={{
              background: "#10b981",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
            }}
          >
            {updatingInApp ? `Updating (${updateProgress}%)…` : "Update Now"}
          </button>
          <button
            type="button"
            onClick={() => {
              setDismissedBuildKey(remoteStamp)
              try {
                window.localStorage.setItem(DISMISSED_BUILD_KEY, remoteStamp)
              } catch {
                // ignore
              }
            }}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#cbd5e1",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Later
          </button>
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

      {forceUpdateRequired && appConfig ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="skylent-force-update-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(15, 23, 42, 0.75)",
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
              border: "1px solid #e2e8f0",
              maxWidth: 400,
              width: "100%",
              padding: "24px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h3 id="skylent-force-update-title" style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
              Update Required
            </h3>
            <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.55, color: "#475569" }}>
              Please update Skylent to version <strong>v{appConfig.minSupportedAppVersion}</strong> to continue.
            </p>
            <button
              type="button"
              onClick={() => void triggerInAppUpdate()}
              style={{
                display: "inline-block",
                background: "#5142b5",
                color: "#ffffff",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Update Now
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
