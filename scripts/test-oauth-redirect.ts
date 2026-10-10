import { buildGoogleAuthorizationUrl, getGoogleOAuthConfig } from "../server/src/lib/google-oauth.ts"
import {
  resolveBrowserReturnOrigin,
  resolveGoogleRedirectUri,
} from "../server/src/lib/oauth-redirect.ts"
import { oauthErrorRedirect, oauthSuccessRedirect } from "../server/src/lib/safe-redirect.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const LOCAL_CALLBACK = "http://localhost:5173/api/v1/auth/google/callback"
const PUBLIC_CALLBACK = "https://skylent.live/api/v1/auth/google/callback"
const PRODUCTION_REQUEST = { protocol: "https", hostname: "skylent.live" }

const saved = {
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
}

function restoreEnv() {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
}

function productionEnv(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "production",
    FRONTEND_URL: "https://skylent.live",
    GOOGLE_REDIRECT_URI: LOCAL_CALLBACK,
    ...overrides,
  }
}

try {
  console.log("1. Production ignores a localhost GOOGLE_REDIRECT_URI")
  const fromFrontend = resolveGoogleRedirectUri(productionEnv())
  assert(fromFrontend === PUBLIC_CALLBACK, `expected public callback, got ${fromFrontend}`)
  assert(!fromFrontend?.includes("localhost"), "production callback must not contain localhost")

  console.log("2. Production uses the request host when FRONTEND_URL is also localhost")
  const fromRequest = resolveGoogleRedirectUri(
    productionEnv({ FRONTEND_URL: "http://localhost:5173" }),
    PRODUCTION_REQUEST,
  )
  assert(fromRequest === PUBLIC_CALLBACK, `expected request-host callback, got ${fromRequest}`)

  console.log("3. Production without a public origin does not invent a localhost callback")
  const unavailable = resolveGoogleRedirectUri(productionEnv({ FRONTEND_URL: "http://localhost:5173" }))
  assert(unavailable === null, "localhost production settings must not produce a callback")

  console.log("4. The configured public site wins over www")
  const apexCallback = resolveGoogleRedirectUri(
    productionEnv(),
    { protocol: "https", hostname: "www.skylent.live" },
  )
  assert(apexCallback === PUBLIC_CALLBACK, `www request must still use the apex callback, got ${apexCallback}`)

  console.log("5. An explicit public HTTPS callback is kept")
  const configured = resolveGoogleRedirectUri(
    productionEnv({ GOOGLE_REDIRECT_URI: PUBLIC_CALLBACK }),
    { protocol: "https", hostname: "www.skylent.live" },
  )
  assert(configured === PUBLIC_CALLBACK, "configured public callback must win")

  console.log("6. Local development may still use localhost")
  const devCallback = resolveGoogleRedirectUri({
    NODE_ENV: "development",
    GOOGLE_REDIRECT_URI: LOCAL_CALLBACK,
    FRONTEND_URL: "http://localhost:5173",
  })
  assert(devCallback === LOCAL_CALLBACK, "development must keep an explicit localhost callback")
  assert(
    resolveGoogleRedirectUri({ NODE_ENV: "development", FRONTEND_URL: "http://localhost:5173" }) === null,
    "development must not invent a callback when GOOGLE_REDIRECT_URI is unset",
  )

  console.log("7. Production return URL is https://skylent.live/login")
  process.env.NODE_ENV = "production"
  process.env.FRONTEND_URL = "https://skylent.live"
  process.env.GOOGLE_REDIRECT_URI = LOCAL_CALLBACK
  const success = oauthSuccessRedirect({ returnTo: "/courses/data-analytics" }, PRODUCTION_REQUEST)
  const error = oauthErrorRedirect("oauth_state", PRODUCTION_REQUEST)
  assert(success.startsWith("https://skylent.live/login?"), `success redirect was ${success}`)
  assert(success.includes("returnTo=%2Fcourses%2Fdata-analytics"), "returnTo must stay on the login route")
  assert(error === "https://skylent.live/login?error=oauth_state", `error redirect was ${error}`)
  assert(!success.includes("localhost") && !error.includes("localhost"), "production redirects must not use localhost")
  const fromWww = oauthSuccessRedirect({}, { protocol: "https", hostname: "www.skylent.live" })
  assert(fromWww.startsWith("https://skylent.live/login?"), `www return URL was ${fromWww}`)

  console.log("8. A localhost FRONTEND_URL does not override the public request host")
  process.env.FRONTEND_URL = "http://localhost:5173"
  const recovered = oauthSuccessRedirect({}, PRODUCTION_REQUEST)
  assert(recovered.startsWith("https://skylent.live/login?"), `recovered redirect was ${recovered}`)
  assert(!recovered.includes("localhost"), "recovered production redirect must not use localhost")
  assert(
    resolveBrowserReturnOrigin({ NODE_ENV: "development" }) === "http://localhost:5173",
    "development without FRONTEND_URL stays on localhost",
  )

  console.log("9. Authorization URL uses the public callback")
  process.env.NODE_ENV = "production"
  process.env.FRONTEND_URL = "https://skylent.live"
  process.env.GOOGLE_REDIRECT_URI = LOCAL_CALLBACK
  process.env.GOOGLE_CLIENT_ID = "test-client"
  process.env.GOOGLE_CLIENT_SECRET = "test-secret"
  const config = getGoogleOAuthConfig(PRODUCTION_REQUEST)
  assert(config?.redirectUri === PUBLIC_CALLBACK, `config redirect was ${config?.redirectUri}`)
  const authorizationUrl = new URL(buildGoogleAuthorizationUrl({ state: "state", nonce: "nonce", req: PRODUCTION_REQUEST }))
  assert(authorizationUrl.origin === "https://accounts.google.com", "authorization host must stay Google")
  assert(authorizationUrl.searchParams.get("redirect_uri") === PUBLIC_CALLBACK, "authorization redirect_uri must be public")
  assert(!authorizationUrl.toString().includes("localhost"), "authorization URL must not contain localhost")

  console.log("OAuth redirect checks passed")
} finally {
  restoreEnv()
}
