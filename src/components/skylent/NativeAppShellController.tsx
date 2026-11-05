import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
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

export function NativeAppShellController() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isNative, setIsNative] = useState(() => isNativeAppShell())
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== "undefined" ? !navigator.onLine : false))
  const [appConfig, setAppConfig] = useState<AppConfigPayload | null>(null)
  const [dismissedBanner, setDismissedBanner] = useState(false)

  useEffect(() => {
    const active = isNativeAppShell()
    setIsNative(active)
    if (active) {
      document.documentElement.setAttribute("data-native-app", "true")
    } else {
      document.documentElement.removeAttribute("data-native-app")
    }
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

  const isDashboardOrLearn =
    location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/learn")

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
          <span>Offline Mode — Your local drafts are saved safely. Reconnecting to Skylent...</span>
        </div>
      ) : null}

      {/* 2. Remote OTA Live Announcement Banner (Controlled via SKYLENT_APP_BANNER env) */}
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
              We have upgraded Skylent to version <strong>v{appConfig.minSupportedAppVersion}</strong> with new labs and faster performance. Please update your app from Google Play Store to continue.
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

      {/* 4. Native APK Bottom Navigation Bar (Shown in Native App Mode on public/catalog screens; Dashboards already have their own bottom nav) */}
      {isNative && !isDashboardOrLearn ? (
        <nav
          aria-label="Skylent App Navigation"
          className="skylent-native-bottom-bar"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 990,
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            boxShadow: "0 -4px 20px rgba(15, 23, 42, 0.06)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            padding: "6px 8px calc(6px + env(safe-area-inset-bottom))",
          }}
        >
          {[
            { to: "/", label: "Home", icon: "🏠", match: (p: string) => p === "/" },
            { to: "/programmes", label: "Tracks", icon: "🎓", match: (p: string) => p.startsWith("/programme") || p.startsWith("/course") },
            { to: "/practice", label: "SQL Lab", icon: "⚡", match: (p: string) => p.startsWith("/practice") || p.startsWith("/labs") },
            { to: "/events", label: "₹99 Live", icon: "🪙", match: (p: string) => p.startsWith("/event") || p.startsWith("/workshop") },
            { to: dashHref, label: user ? "My OS" : "Sign In", icon: "👤", match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/login") },
          ].map((tab) => {
            const active = tab.match(location.pathname)
            return (
              <Link
                key={tab.label}
                to={tab.to}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(tab.to)
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  textDecoration: "none",
                  padding: "4px 2px",
                  borderRadius: 8,
                  color: active ? "#5142b5" : "#64748b",
                  fontWeight: active ? 800 : 600,
                  fontSize: 11,
                  background: active ? "#f5f3ff" : "transparent",
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden="true">{tab.icon}</span>
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
