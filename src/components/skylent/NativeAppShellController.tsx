import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1, isNativeAppShell } from "../../lib/api-base"

type AppConfigPayload = {
  appVersion: string
  minSupportedAppVersion: string
  autoSyncUpdate?: boolean
  buildId?: string
  playStoreUrl: string
  announcement: string | null
  maintenanceMode: boolean
  updateTitle?: string | null
  updateNotes?: string | null
  releaseNotes?: string | null
  apkDownloadUrl?: string | null
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

const INSTALLED_BUILD_KEY = "skylent:installed-build-id:v93"
export const BUNDLED_CLIENT_BUILD_ID = "10.3.0:v103-20261109"

function tryExitNativeApp(): boolean {
  if (typeof window === "undefined") return false
  try {
    const bridge = (window as unknown as { SkylentNativeBridge?: { exitApp?: () => void } }).SkylentNativeBridge
    if (typeof bridge?.exitApp === "function") {
      bridge.exitApp()
      return true
    }
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
  const { user, ready } = useAuth()
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
  const autoTriggeredRef = useRef<string | null>(null)

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

  // Direct EdTech App Entry (PW / Unacademy / Coursera style):
  // Inside the APK, never drop the learner onto the marketing landing page (/).
  // Signed-in users go straight to their role dashboard; signed-out users go straight to /login.
  useEffect(() => {
    if (!isNative || !ready) return
    if (location.pathname === "/" || location.pathname === "/preview/homepage") {
      if (!user) {
        try {
          if (!window.sessionStorage.getItem("skylent:apk-booted")) {
            window.sessionStorage.setItem("skylent:apk-booted", "1")
            navigate("/programmes", { replace: true })
          }
        } catch {
          navigate("/programmes", { replace: true })
        }
      } else {
        const target =
          user.role === "admin" || user.role === "superadmin"
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
        navigate(target, { replace: true })
      }
    }
  }, [isNative, ready, user, location.pathname, navigate])

  // YouTube-style Double-Back to Exit on /dashboard/student (Overview)
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
    const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : ""
    const hasAndroidNativeInsets = ua.includes("SkylentNativeInsetsApplied")

    if (active) {
      document.documentElement.setAttribute("data-native-app", "true")
      if (hasAndroidNativeInsets) {
        document.documentElement.setAttribute("data-native-insets", "android")
      }
    } else {
      document.documentElement.removeAttribute("data-native-app")
      document.documentElement.removeAttribute("data-native-insets")
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

  // Poll /health/app-config for YouTube-style automatic update detection
  useEffect(() => {
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
          if (!cancelled && data && typeof data.appVersion === "string") {
            // First boot on this device: record current server stamp silently so fresh install doesn't immediately reload
            const stamp = `${data.appVersion}:${data.buildId || "live"}`
            if (!storedStamp) {
              try {
                window.localStorage.setItem(INSTALLED_BUILD_KEY, stamp)
              } catch {
                // ignore
              }
              setInstalledBuildId(stamp)
            }
            setAppConfig(data)
          }
        })
        .catch(() => {})
    }
    checkConfig()
    const timer = window.setInterval(checkConfig, 35_000)
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

  // Seamless Auto-Update triggers ONLY when installedBuildId exists and differs from remoteStamp (never loops!)
  const alreadySyncedThisSession = (() => {
    try {
      return Boolean(remoteStamp && window.sessionStorage.getItem("skylent:ota-synced-stamp") === remoteStamp)
    } catch {
      return false
    }
  })()

  const needsSeamlessAutoUpdate = Boolean(
    appConfig &&
      remoteStamp &&
      installedBuildId &&
      installedBuildId !== remoteStamp &&
      !alreadySyncedThisSession,
  )

  const triggerInAppUpdate = useCallback(async () => {
    if (!appConfig || !remoteStamp) return
    setUpdatingInApp(true)
    setUpdateProgress(35)
    // Persist the new stamp FIRST so even if reload happens immediately, it never loops!
    try {
      window.localStorage.setItem(INSTALLED_BUILD_KEY, remoteStamp)
      window.sessionStorage.setItem("skylent:ota-synced-stamp", remoteStamp)
    } catch {
      // ignore
    }
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map((r) => r.unregister()))
      }
      setUpdateProgress(72)
      if ("caches" in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
      setUpdateProgress(100)
      setInstalledBuildId(remoteStamp)
      setTimeout(() => {
        window.location.reload()
      }, 380)
    } catch {
      window.location.reload()
    }
  }, [appConfig, remoteStamp])

  // YouTube / Facebook Style Automatic Seamless Sync: Auto-triggers within 350ms when a new deployment is pushed!
  useEffect(() => {
    if (!needsSeamlessAutoUpdate || !remoteStamp) return
    if (autoTriggeredRef.current === remoteStamp) return
    autoTriggeredRef.current = remoteStamp
    const timer = window.setTimeout(() => {
      void triggerInAppUpdate()
    }, 350)
    return () => window.clearTimeout(timer)
  }, [needsSeamlessAutoUpdate, remoteStamp, triggerInAppUpdate])

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
      label: isNative && user ? "Dashboard" : "Home",
      to: isNative && user ? dashHref : "/",
      match: (p) => (isNative && user ? p === "/dashboard/student" && !location.hash : p === "/"),
    },
    {
      id: "courses",
      label: isNative && !user ? "Programmes" : "Courses",
      to: user ? "/dashboard/student#explore-programmes" : "/programmes",
      match: (p) => p.startsWith("/programme") || p.startsWith("/education") || location.hash === "#explore-programmes",
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
      match: (p) => p.startsWith("/labs") || p.startsWith("/os/"),
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
            bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
            background: "rgba(15, 23, 42, 0.92)",
            color: "#ffffff",
            padding: "9px 18px",
            borderRadius: 999,
            fontSize: 12.5,
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

      {/* YouTube / Facebook Style Automatic Update Sync Screen (Auto-applies & reloads once per deployment!) */}
      {(needsSeamlessAutoUpdate || updatingInApp) && appConfig ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="skylent-auto-update-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "linear-gradient(165deg, #0f172a 0%, #1e1b4b 55%, #3b2d96 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              maxWidth: 360,
              width: "100%",
              padding: "28px 22px",
              borderRadius: 22,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              backdropFilter: "blur(16px)",
              textAlign: "center",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
            }}
          >
            <img src="/icon-192.png" alt="Skylent" width={56} height={56} style={{ width: 56, height: 56, margin: "0 auto 14px", borderRadius: 14, display: "block", boxShadow: "0 10px 24px rgba(81, 66, 181, 0.45)" }} />
            <h3 id="skylent-auto-update-title" style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600, color: "#ffffff" }}>
              Updating Skylent…
            </h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, lineHeight: 1.55, color: "#cbd5e1" }}>
              {appConfig.releaseNotes || `Syncing the latest courses, labs, and workspace improvements automatically (${updateProgress || 35}%).`}
            </p>
            <div
              style={{
                width: "100%",
                height: 6,
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.16)",
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: `${Math.max(updateProgress, 35)}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #a78bfa 0%, #34d399 100%)",
                  borderRadius: 999,
                  transition: "width 240ms ease",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => void triggerInAppUpdate()}
              style={{
                width: "100%",
                padding: "11px 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.24)",
                background: "rgba(255,255,255,0.14)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {updatingInApp ? "Opening Latest Version…" : "Update Now →"}
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
