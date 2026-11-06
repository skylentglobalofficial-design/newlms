import { apiV1, isNativeAppShell } from "./api-base"
import { getNativeCsrfToken, setNativeCsrfToken } from "./native-app-bridge"
import { parseApiJson, readJsonBody } from "./http"
import { POLICY_VERSION, consentPayload } from "./policy"

const API_BASE = apiV1()

export type ApiRole = "student" | "faculty" | "organisation" | "college" | "recruiter" | "admin" | "superadmin"

export type GoogleOAuthStartOptions = {
  returnTo?: string
  acceptedTerms?: boolean
  enrollTarget?: {
    kind: "course" | "program"
    slug: string
  }
}

export function buildGoogleOAuthStartUrl(options: GoogleOAuthStartOptions = {}): string {
  const params = new URLSearchParams()
  if (options.returnTo) params.set("returnTo", options.returnTo)
  if (options.enrollTarget) {
    params.set("enrollKind", options.enrollTarget.kind)
    params.set("enrollSlug", options.enrollTarget.slug)
  }
  if (options.acceptedTerms) params.set("consent", POLICY_VERSION)
  if (isNativeAppShell()) params.set("nativeApp", "1")
  const query = params.toString()
  return `${API_BASE}/auth/google${query ? `?${query}` : ""}`
}

export async function checkGoogleOAuthAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth/google/status`, { credentials: "include" })
    if (!response.ok) return false
    const body = (await readJsonBody(response).catch(() => null)) as
      | { data?: { available?: boolean; configured?: boolean } }
      | null
    return Boolean(body?.data?.available ?? body?.data?.configured)
  } catch {
    return true
  }
}

export type ApiAuthUser = {
  id: string
  email: string
  displayName: string
  name: string
  avatar: string
  nameChangeLockedUntil?: string | null
}

export type AuthResponse = {
  user: ApiAuthUser
  roles: ApiRole[]
  role: ApiRole
  mustChangePassword?: boolean
  nameChangeLockedUntil?: string | null
}

let csrfToken: string | null = null
let csrfRequest: Promise<string> | null = null

function readCsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function csrfCookieMatchesApi(): boolean {
  if (typeof window === "undefined") return true
  if (API_BASE.startsWith("/")) return true
  try {
    return new URL(API_BASE, window.location.origin).origin === window.location.origin
  } catch {
    return false
  }
}

export async function ensureCsrfToken(): Promise<string> {
  if (csrfCookieMatchesApi()) {
    const fromCookie = readCsrfCookie()
    if (fromCookie) {
      csrfToken = fromCookie
      return fromCookie
    }
  }
  if (csrfToken) return csrfToken
  const nativeCsrf = getNativeCsrfToken()
  if (nativeCsrf && nativeCsrf.length >= 32) {
    csrfToken = nativeCsrf
    return nativeCsrf
  }
  if (!csrfRequest) {
    csrfRequest = requestCsrfToken().finally(() => {
      csrfRequest = null
    })
  }
  return csrfRequest
}

async function requestCsrfToken(): Promise<string> {
  const response = await fetch(`${API_BASE}/auth/csrf`, { credentials: "include" })
  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token")
  }

  const parsed = await parseApiJson<{ csrfToken: string }>(response)
  const fromCookie = csrfCookieMatchesApi() ? readCsrfCookie() : null
  csrfToken = fromCookie ?? parsed.csrfToken
  if (csrfToken) setNativeCsrfToken(csrfToken)
  return csrfToken
}

async function parseJson<T>(response: Response): Promise<T> {
  return parseApiJson<T>(response)
}

async function authRequest<T>(
  path: string,
  options: { method?: string; body?: Record<string, unknown> } = {},
): Promise<T> {
  const token = await ensureCsrfToken()
  const headers = new Headers()
  headers.set("Content-Type", "application/json")
  headers.set("X-CSRF-Token", token)

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    const message = await credentialFailureMessage(path, response)
    if (message) throw new Error(message)
  }

  const parsed = await parseJson<T>(response)
  rememberIssuedCsrf(parsed)
  return parsed
}

async function credentialFailureMessage(path: string, response: Response): Promise<string | null> {
  if (
    response.status !== 400 &&
    response.status !== 409 &&
    response.status !== 429 &&
    response.status !== 502 &&
    response.status !== 503 &&
    !(response.status === 401 && (path === "/auth/login" || path === "/auth/otp/verify" || path === "/auth/email-otp/verify"))
  ) {
    return null
  }
  const data = (await readJsonBody(response.clone()).catch(() => null)) as
    | { error?: unknown; details?: Record<string, unknown> }
    | null
  if (!data || typeof data !== "object") return null
  if (data.details && typeof data.details === "object") {
    for (const value of Object.values(data.details)) {
      const first = Array.isArray(value) ? value[0] : null
      if (typeof first === "string" && first.length <= 240) return first
    }
  }
  return typeof data.error === "string" && data.error.length <= 240 ? data.error : null
}

function rememberIssuedCsrf(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("csrfToken" in payload)) return
  const token = (payload as { csrfToken?: unknown }).csrfToken
  if (typeof token === "string" && token) csrfToken = token
}

export async function fetchCurrentUser(): Promise<AuthResponse | null> {
  const response = await fetch(`${API_BASE}/auth/me`, { credentials: "include" })
  if (response.status === 401) return null
  return parseJson<AuthResponse>(response)
}

export async function signupRequest(input: {
  name: string
  email: string
  password: string
  acceptedTerms: boolean
  emailOtp?: string
}): Promise<AuthResponse> {
  return authRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: {
      displayName: input.name,
      email: input.email,
      password: input.password,
      ...(input.emailOtp ? { emailOtp: input.emailOtp, requireEmailOtp: true } : {}),
      ...(input.acceptedTerms ? { consent: consentPayload() } : {}),
    },
  })
}

export async function loginRequest(input: {
  email: string
  password: string
}): Promise<AuthResponse> {
  return authRequest<AuthResponse>("/auth/login", { method: "POST", body: input })
}

export async function logoutRequest(): Promise<void> {
  await authRequest<{ ok: boolean }>("/auth/logout", { method: "POST", body: {} })
  csrfToken = null
}

export async function updateProfileRequest(input: { displayName: string }): Promise<AuthResponse> {
  return authRequest<AuthResponse>("/auth/me", {
    method: "PATCH",
    body: { displayName: input.displayName },
  })
}

export function clearAuthClientState() {
  csrfToken = null
}

async function readAuthJson(response: Response): Promise<Record<string, unknown>> {
  const data = (await readJsonBody(response).catch(() => null)) as Record<string, unknown> | null
  return data && typeof data === "object" ? data : {}
}

function authErrorMessage(data: Record<string, unknown>, fallback: string): string {
  const details = data.details
  if (details && typeof details === "object") {
    for (const value of Object.values(details as Record<string, unknown>)) {
      const first = Array.isArray(value) ? value[0] : null
      if (typeof first === "string" && first.length > 0 && first.length <= 160) return first
    }
  }
  return typeof data.error === "string" && data.error.length > 0 && data.error.length <= 160 ? data.error : fallback
}

export async function requestPasswordReset(email: string): Promise<{ message: string; emailConfigured: boolean }> {
  const response = await fetch(`${API_BASE}/auth/password-reset/request`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  const data = await readAuthJson(response)
  if (!response.ok) throw new Error(authErrorMessage(data, "The reset request could not be sent. Try again."))
  return {
    message: typeof data.message === "string" ? data.message : "If an account exists with that email, you will receive a password reset link.",
    emailConfigured: data.emailConfigured === true,
  }
}

export async function verifyPasswordResetToken(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/password-reset/verify`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  const data = await readAuthJson(response)
  if (!response.ok || data.valid === false) {
    throw new Error(authErrorMessage(data, "This reset link is invalid or has expired."))
  }
}

export async function completePasswordReset(token: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE}/auth/password-reset/complete`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  })
  const data = await readAuthJson(response)
  if (!response.ok || data.success === false) {
    throw new Error(authErrorMessage(data, "The password could not be reset. Try again."))
  }
  return typeof data.message === "string" ? data.message : "Password has been reset. You can now sign in."
}

export type EmailOtpSendResponse = {
  ok: boolean
  email: string
  isExistingUser: boolean
  existingName: string | null
  expiresInSeconds: number
  message: string
}

export async function sendEmailOtpRequest(email: string, purpose: "signup" | "login" = "login"): Promise<EmailOtpSendResponse> {
  return authRequest<EmailOtpSendResponse>("/auth/email-otp/send", {
    method: "POST",
    body: { email: email.trim(), purpose },
  })
}

export async function verifyEmailOtpRequest(input: {
  email: string
  otp: string
  name?: string
  acceptedTerms?: boolean
}): Promise<AuthResponse> {
  return authRequest<AuthResponse>("/auth/email-otp/verify", {
    method: "POST",
    body: {
      email: input.email.trim(),
      otp: input.otp.trim(),
      ...(input.name ? { name: input.name } : {}),
      acceptedTerms: Boolean(input.acceptedTerms),
      ...(input.acceptedTerms ? { consent: consentPayload() } : {}),
    },
  })
}

export type MobileOtpSendResponse = {
  ok: boolean
  phone: string
  isExistingUser: boolean
  existingName: string | null
  expiresInSeconds: number
  channels?: string[]
  message: string
}

export async function sendMobileOtpRequest(phone: string, email?: string): Promise<MobileOtpSendResponse> {
  return authRequest<MobileOtpSendResponse>("/auth/otp/send", {
    method: "POST",
    body: {
      phone,
      ...(email && email.trim() ? { email: email.trim() } : {}),
    },
  })
}

export async function verifyMobileOtpRequest(input: {
  phone: string
  otp: string
  name?: string
  acceptedTerms?: boolean
}): Promise<AuthResponse> {
  return authRequest<AuthResponse>("/auth/otp/verify", {
    method: "POST",
    body: {
      phone: input.phone,
      otp: input.otp,
      ...(input.name ? { name: input.name } : {}),
      acceptedTerms: Boolean(input.acceptedTerms),
      ...(input.acceptedTerms ? { consent: consentPayload() } : {}),
    },
  })
}
