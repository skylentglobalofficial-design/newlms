import { apiV1 } from "./api-base"
import { parseApiJson, readJsonBody } from "./http"
import { POLICY_VERSION, consentPayload } from "./policy"

const API_BASE = apiV1()

export type ApiRole = "student" | "faculty" | "organisation" | "recruiter" | "superadmin"

export type GoogleOAuthStartOptions = {
  returnTo?: string
  /** Set on the sign-up form once the terms checkbox is ticked. A new account is refused without it. */
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
  const query = params.toString()
  return `${API_BASE}/auth/google${query ? `?${query}` : ""}`
}

export type ApiAuthUser = {
  id: string
  email: string
  displayName: string
  name: string
  avatar: string
}

export type AuthResponse = {
  user: ApiAuthUser
  roles: ApiRole[]
  role: ApiRole
}

let csrfToken: string | null = null
let csrfRequest: Promise<string> | null = null

function readCsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * The csrf cookie is host-only. On skylent.live the page can still hold a
 * cookie from the colocated API, which is not the token api.skylent.live checks.
 */
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

/**
 * The generic 401 copy ("Sign in to continue.") means an ended session. On the sign-in form a 401
 * means wrong credentials, so the server's own sentence is shown. A 400 shows the first field error.
 */
async function credentialFailureMessage(path: string, response: Response): Promise<string | null> {
  if (response.status !== 400 && !(response.status === 401 && path === "/auth/login")) return null
  const data = (await readJsonBody(response.clone()).catch(() => null)) as
    | { error?: unknown; details?: Record<string, unknown> }
    | null
  if (!data || typeof data !== "object") return null
  if (data.details && typeof data.details === "object") {
    for (const value of Object.values(data.details)) {
      const first = Array.isArray(value) ? value[0] : null
      if (typeof first === "string" && first.length <= 160) return first
    }
  }
  return typeof data.error === "string" && data.error.length <= 160 ? data.error : null
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
  /** The terms checkbox. The server refuses to create the account without it. */
  acceptedTerms: boolean
}): Promise<AuthResponse> {
  return authRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: {
      displayName: input.name,
      email: input.email,
      password: input.password,
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
