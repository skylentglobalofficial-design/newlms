/**
 * Skylent Universal Web & Native APK Runtime Bridge (Security, Live OTA Sync, API Rewriting & Token Vault)
 */
import { isNativeAppShell, PRODUCTION_API_ORIGIN } from "./api-base"

const NATIVE_SESSION_KEY = "skylent:native:session-token:v1"
const NATIVE_CSRF_KEY = "skylent:native:csrf-token:v1"
export const APP_VERSION = "8.8.0"

let bridgeInstalled = false

export function getNativeSessionToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(NATIVE_SESSION_KEY)
  } catch {
    return null
  }
}

export function setNativeSessionToken(token: string | null) {
  if (typeof window === "undefined") return
  try {
    if (token) window.localStorage.setItem(NATIVE_SESSION_KEY, token)
    else window.localStorage.removeItem(NATIVE_SESSION_KEY)
  } catch {
    // Ignore storage quota errors
  }
}

export function getNativeCsrfToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(NATIVE_CSRF_KEY)
  } catch {
    return null
  }
}

export function setNativeCsrfToken(token: string | null) {
  if (typeof window === "undefined") return
  try {
    if (token) window.localStorage.setItem(NATIVE_CSRF_KEY, token)
    else window.localStorage.removeItem(NATIVE_CSRF_KEY)
  } catch {
    // Ignore storage quota errors
  }
}

export function clearNativeAuthVault() {
  setNativeSessionToken(null)
  setNativeCsrfToken(null)
}

export function installNativeAppBridge() {
  if (bridgeInstalled || typeof window === "undefined") return
  bridgeInstalled = true

  // Restore native session & shell mode if redirected from Capacitor localhost to live https://skylent.live
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get("nativeApp") === "1") {
      window.sessionStorage.setItem("skylent:native-shell", "1")
      const urlToken = params.get("nativeToken")
      const urlCsrf = params.get("nativeCsrf")
      if (urlToken) setNativeSessionToken(urlToken)
      if (urlCsrf) setNativeCsrfToken(urlCsrf)
      params.delete("nativeToken")
      params.delete("nativeCsrf")
      const cleanQuery = params.toString()
      const cleanUrl =
        window.location.pathname +
        (cleanQuery ? `?${cleanQuery}` : "") +
        window.location.hash
      window.history.replaceState(null, "", cleanUrl)
    }
  } catch {
    // ignore URL parse errors
  }

  const nativeMode = isNativeAppShell()
  if (nativeMode) {
    document.documentElement.setAttribute("data-native-app", "true")
    // Reset OTA live redirect whenever a fresh APK binary (versionCode 8800) is installed so local dist/ runs first!
    try {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : ""
      if (ua.includes("SkylentVersionCode/8800") && window.localStorage.getItem("skylent:apk-vcode") !== "8800") {
        window.localStorage.setItem("skylent:apk-vcode", "8800")
        window.localStorage.removeItem("skylent:ota-live-mode")
      }

      if (
        (window.location.hostname === "localhost" || window.location.hostname === "app.skylent.local") &&
        navigator.onLine &&
        window.localStorage.getItem("skylent:ota-live-mode") === "1"
      ) {
        const token = getNativeSessionToken()
        const csrf = getNativeCsrfToken()
        const target = window.location.pathname + window.location.search + window.location.hash
        const sep = target.includes("?") ? "&" : "?"
        window.location.replace(
          `${PRODUCTION_API_ORIGIN}${target}${sep}nativeApp=1${token ? `&nativeToken=${encodeURIComponent(token)}` : ""}${csrf ? `&nativeCsrf=${encodeURIComponent(csrf)}` : ""}`,
        )
        return
      }
    } catch {
      // ignore
    }
  }

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const activeNative = isNativeAppShell()
    let urlString = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url

    const isApiCall =
      urlString.startsWith("/api/") ||
      urlString.startsWith(`${PRODUCTION_API_ORIGIN}/api/`) ||
      urlString.includes("/api/v1/")

    if (activeNative && urlString.startsWith("/api/") && window.location.hostname !== "skylent.live") {
      urlString = `${PRODUCTION_API_ORIGIN}${urlString}`
    }

    if (!isApiCall) {
      return originalFetch(input, init)
    }

    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined))
    headers.set("X-Skylent-Client", activeNative ? "native-app" : "web-app")
    headers.set("X-Skylent-App-Version", APP_VERSION)

    const sessionToken = getNativeSessionToken()
    if (sessionToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${sessionToken}`)
    }

    const csrfToken = getNativeCsrfToken()
    if (csrfToken && !headers.has("X-CSRF-Token")) {
      headers.set("X-CSRF-Token", csrfToken)
    }

    const nextInit: RequestInit = {
      ...init,
      headers,
      credentials: init?.credentials ?? "include",
    }

    const response = await originalFetch(urlString, nextInit)

    if (urlString.includes("/api/v1/auth/")) {
      if (urlString.endsWith("/logout") && response.ok) {
        clearNativeAuthVault()
      } else if (response.ok) {
        try {
          const clone = response.clone()
          const body = (await clone.json()) as {
            sessionToken?: string
            csrfToken?: string
          } | null
          if (body?.sessionToken) setNativeSessionToken(body.sessionToken)
          if (body?.csrfToken) setNativeCsrfToken(body.csrfToken)
        } catch {
          // Non-JSON response; ignore
        }
      }
    }

    return response
  }
}
