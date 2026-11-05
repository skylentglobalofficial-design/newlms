function trimSlash(value: string): string {
  return value.replace(/\/$/, "")
}

export const PRODUCTION_API_ORIGIN = "https://skylent.live"

/**
 * Returns true when running inside the compiled Native Android/iOS APK shell
 * (Capacitor local bundle `https://localhost`, `https://app.skylent.local`, Android WebView `; wv)`,
 * or `SkylentNativeApp` user-agent) or when explicitly previewing Native App mode via `?app=native`.
 */
export function isNativeAppShell(): boolean {
  if (typeof window === "undefined") return false
  try {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get("app") === "web") {
      window.sessionStorage.setItem("skylent:native-shell", "0")
      return false
    }
    if (searchParams.get("app") === "native") {
      window.sessionStorage.setItem("skylent:native-shell", "1")
      return true
    }
    const storedPref = window.sessionStorage.getItem("skylent:native-shell")
    if (storedPref === "0") return false
    if (storedPref === "1") return true
  } catch {
    // Ignore storage access errors
  }

  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  if (typeof cap?.isNativePlatform === "function" && cap.isNativePlatform()) {
    return true
  }
  const { protocol, hostname } = window.location
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : ""
  if (
    protocol === "capacitor:" ||
    protocol === "ionic:" ||
    hostname === "app.skylent.local" ||
    Boolean(cap) ||
    ua.includes("SkylentNativeApp") ||
    /; wv\)/i.test(ua)
  ) {
    return true
  }
  return false
}

/**
 * API prefix for browser and Native APK calls.
 * - On the website (skylent.live or localhost dev), uses same-origin `/api/v1`.
 * - Inside the bundled Native APK (`localhost` / `app.skylent.local`), automatically routes API
 *   calls to `https://skylent.live/api/v1` so the UI runs locally from the APK
 *   while data syncs securely over HTTPS.
 */
export function apiV1(): string {
  const configured = import.meta.env?.VITE_API_BASE ?? import.meta.env?.VITE_API_BASE_URL
  if (typeof configured === "string" && configured.trim()) {
    return trimSlash(configured.trim())
  }
  if (isNativeAppShell() && typeof window !== "undefined" && window.location.hostname !== "skylent.live") {
    return `${PRODUCTION_API_ORIGIN}/api/v1`
  }
  return "/api/v1"
}
