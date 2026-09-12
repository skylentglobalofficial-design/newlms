import { safeInternalPath } from "./safe-return"

const API_BASE = "/api/v1"

export type ApiRole = "student" | "faculty" | "organisation" | "recruiter" | "superadmin"

export type GoogleOAuthStartOptions = {
  returnTo?: string
  enrollTarget?: {
    kind: "course" | "program"
    slug: string
  }
}

export function buildGoogleOAuthStartUrl(options: GoogleOAuthStartOptions = {}): string {
  const params = new URLSearchParams()
  const returnTo = safeInternalPath(options.returnTo)
  if (returnTo) params.set("returnTo", returnTo)
  if (options.enrollTarget) {
    params.set("enrollKind", options.enrollTarget.kind)
    params.set("enrollSlug", options.enrollTarget.slug)
  }
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

type ApiError = {
  error: string
  details?: Record<string, string[] | undefined>
}

let csrfToken: string | null = null

function readCsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function ensureCsrfToken(): Promise<string> {
  const existing = csrfToken ?? readCsrfCookie()
  if (existing) {
    csrfToken = existing
    return existing
  }

  const response = await fetch(`${API_BASE}/auth/csrf`, { credentials: "include" })
  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token")
  }

  const data = (await response.json()) as { csrfToken: string }
  csrfToken = data.csrfToken
  return csrfToken
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | ApiError
  if (!response.ok) {
    const message = typeof data === "object" && data && "error" in data
      ? String((data as ApiError).error)
      : "Request failed"
    throw new Error(message)
  }
  return data as T
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

  return parseJson<T>(response)
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
}): Promise<AuthResponse> {
  return authRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: {
      displayName: input.name,
      email: input.email,
      password: input.password,
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

export function clearAuthClientState() {
  csrfToken = null
}
