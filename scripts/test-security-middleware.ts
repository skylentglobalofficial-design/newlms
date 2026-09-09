import "dotenv/config"

const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"
const ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGINS?.split(",")[0]?.trim()
  ?? process.env.FRONTEND_URL
  ?? "http://localhost:5173"
const DISALLOWED_ORIGIN = "https://evil.example.test"

type CookieJar = Map<string, string>

function parseSetCookie(headers: string[] | undefined, jar: CookieJar) {
  if (!headers) return
  for (const header of headers) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index === -1) continue
    const name = pair.slice(0, index).trim()
    const value = pair.slice(index + 1).trim()
    if (value) jar.set(name, value)
    else jar.delete(name)
  }
}

async function request(
  path: string,
  options: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
    jar?: CookieJar
    csrf?: boolean
  } = {},
) {
  const jar = options.jar ?? new Map<string, string>()
  const headers: Record<string, string> = { ...options.headers }
  const cookie = Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join("; ")
  if (cookie) headers.Cookie = cookie
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) headers["X-CSRF-Token"] = jar.get("csrf") ?? ""

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  parseSetCookie(response.headers.getSetCookie?.() ?? [], jar)

  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  return { response, data, jar }
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

async function main() {
  console.log("1. /api/v1/health works without Origin")
  const health = await request("/health")
  assert(health.response.ok, `health failed: ${health.response.status}`)
  assert((health.data as { status?: string }).status === "ok", "health payload mismatch")

  console.log("2. Allowed origin receives CORS headers")
  const allowed = await request("/health", {
    headers: { Origin: ALLOWED_ORIGIN },
  })
  assert(allowed.response.ok, "allowed-origin health failed")
  assert(
    allowed.response.headers.get("access-control-allow-origin") === ALLOWED_ORIGIN,
    `missing ACAO for allowed origin (${ALLOWED_ORIGIN})`,
  )
  assert(
    allowed.response.headers.get("access-control-allow-credentials") === "true",
    "credentials header missing for allowed origin",
  )

  console.log("3. Disallowed origin is rejected by CORS")
  const disallowed = await request("/health", {
    headers: { Origin: DISALLOWED_ORIGIN },
  })
  assert(disallowed.response.ok, "health should still return 200 for disallowed Origin header")
  assert(
    disallowed.response.headers.get("access-control-allow-origin") !== DISALLOWED_ORIGIN,
    "disallowed origin should not be reflected in ACAO",
  )

  console.log("4. Oversized JSON body is rejected")
  const oversized = await request("/auth/csrf", {
    method: "POST",
    body: { blob: "x".repeat(600_000) },
  })
  assert(oversized.response.status === 413, `expected 413, got ${oversized.response.status}`)
  assert(
    (oversized.data as { error?: string }).error === "Request body too large",
    "oversized body error message mismatch",
  )

  console.log("5. Normal signup/login still works with CSRF")
  const jar: CookieJar = new Map()
  const email = `security-test-${Date.now()}@example.com`
  const password = "test-password-123"

  const csrf = await request("/auth/csrf", { jar })
  assert(csrf.response.ok, "csrf bootstrap failed")

  const signup = await request("/auth/signup", {
    method: "POST",
    jar,
    csrf: true,
    body: { displayName: "Security Test", email, password },
  })
  assert(signup.response.status === 201, `signup failed: ${signup.response.status}`)

  jar.clear()
  const loginCsrf = await request("/auth/csrf", { jar })
  assert(loginCsrf.response.ok, "login csrf bootstrap failed")

  const login = await request("/auth/login", {
    method: "POST",
    jar,
    csrf: true,
    body: { email, password },
  })
  assert(login.response.ok, `login failed: ${login.response.status}`)

  console.log("6. Repeated auth attempts are rate-limited")
  const limitJar: CookieJar = new Map()
  const limitCsrf = await request("/auth/csrf", { jar: limitJar })
  assert(limitCsrf.response.ok, "rate-limit csrf bootstrap failed")

  let saw429 = false
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const attemptCsrf = attempt % 5 === 0 ? await request("/auth/csrf", { jar: limitJar }) : null
    if (attemptCsrf) assert(attemptCsrf.response.ok, "rate-limit csrf refresh failed")

    const result = await request("/auth/login", {
      method: "POST",
      jar: limitJar,
      csrf: true,
      body: { email: "missing@example.com", password: "wrong-password" },
    })

    if (result.response.status === 429) {
      saw429 = true
      assert(
        (result.data as { error?: string }).error === "Too many attempts. Please try again later.",
        "rate-limit error message mismatch",
      )
      break
    }
  }

  assert(saw429, "expected login rate limit to return 429")

  console.log("All security middleware checks passed.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
