function trimSlash(value: string): string {
  return value.replace(/\/$/, "")
}

export const PRODUCTION_API_ORIGIN = "https://skylent.live"

/**
 * Returns true when running inside the compiled Native Android/iOS APK shell
 * (Capacitor local bundle `https://app.skylent.local` or `capacitor://localhost`)
 * or when explicitly previewing Native App mode via `?app=native`.
 */
export function isNativeAppShell(): boolean {
  if (typeof window === "undefined") return false
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  if (typeof cap?.isNativePlatform === "function" && cap.isNativePlatform()) {
    return true
  }
  const { protocol, hostname, search } = window.location
  if (
    protocol === "capacitor:" ||
    protocol === "ionic:" ||
    hostname === "app.skylent.local" ||
    (hostname === "localhost" && (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor) ||
    (typeof navigator !== "undefined" && navigator.userAgent.includes("SkylentNativeApp"))
  ) {
    return true
  }
  try {
    if (new URLSearchParams(search).get("app") === "native") {
      window.sessionStorage.setItem("skylent:native-shell", "1")
      return true
    }
    if (new URLSearchParams(search).get("app") === "web") {
      window.sessionStorage.removeItem("skylent:native-shell")
      return false
    }
    return window.sessionStorage.getItem("skylent:native-shell") === "1"
  } catch {
    return false
  }
}

/**
 * API prefix for browser and Native APK calls.
 * - On the website (skylent.live or localhost dev), uses same-origin `/api/v1`.
 * - Inside the bundled Native APK (`app.skylent.local`), automatically routes API
 *   calls to `https://skylent.live/api/v1` so the UI runs locally from the APK
 *   while data syncs securely over HTTPS.
 */
export function apiV1(): string {
  const configured = import.meta.env?.VITE_API_BASE ?? import.meta.env?.VITE_API_BASE_URL
  if (typeof configured === "string" && configured.trim()) {
    return trimSlash(configured.trim())
  }
  if (isNativeAppShell()) {
    return `${PRODUCTION_API_ORIGIN}/api/v1`
  }
  return "/api/v1"
}
