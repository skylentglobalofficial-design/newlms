import { config as loadEnv } from "dotenv"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createSign, generateKeyPairSync } from "node:crypto"

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..")
loadEnv({ path: resolve(repoRoot, ".env"), override: true })

process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "test-google-client-id"
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "test-google-client-secret"
process.env.GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/v1/auth/google/callback"

const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"
const originalFetch = globalThis.fetch

const {
  resetGoogleCertificateCache,
  seedGoogleCertificateCache,
  parseGoogleCertificates,
  verifyGoogleIdToken,
} = await import("../server/src/lib/google-oauth.js")

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
})

const publicPem = publicKey.export({ type: "spki", format: "pem" }).toString()
const privatePem = privateKey.export({ type: "pkcs8", format: "pem" }).toString()

const staleKid = "stale-google-kid"
const rotatedKid = "rotated-google-kid"
const missingKid = "missing-google-kid"

let certFetchCount = 0
let certFetchQueue: Array<Record<string, string>> = []

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function createSignedIdToken(input: {
  kid: string
  sub?: string
  email?: string
  nonce?: string
}): string {
  const header = { alg: "RS256", kid: input.kid }
  const payload = {
    sub: input.sub ?? "google-subject-123",
    email: input.email ?? "learner@example.com",
    email_verified: true,
    name: "Google Learner",
    iss: "https://accounts.google.com",
    aud: process.env.GOOGLE_CLIENT_ID,
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...(input.nonce ? { nonce: input.nonce } : {}),
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signedData = `${encodedHeader}.${encodedPayload}`
  const signer = createSign("RSA-SHA256")
  signer.update(signedData)
  const signature = signer.sign(privatePem, "base64url")
  return `${signedData}.${signature}`
}

function installCertFetchMock() {
  certFetchCount = 0
  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url

    if (url === GOOGLE_CERTS_URL) {
      certFetchCount += 1
      const keys = certFetchQueue.shift() ?? {}
      return new Response(JSON.stringify(keys), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    return originalFetch(input, init)
  }
}

function restoreFetchMock() {
  globalThis.fetch = originalFetch
}

async function run() {
  installCertFetchMock()

  try {
    console.log("1. Cached Google signing key is used without refetch")
    resetGoogleCertificateCache()
    certFetchCount = 0
    certFetchQueue = [{ [rotatedKid]: publicPem }]
    const cachedToken = createSignedIdToken({ kid: rotatedKid })
    await verifyGoogleIdToken(cachedToken)
    assert(certFetchCount === 1, "Expected one certificate fetch on cold cache")

    await verifyGoogleIdToken(cachedToken)
    assert(certFetchCount === 1, "Expected cached certificates to avoid a second fetch")

    console.log("2. Missing cached key triggers one forced refresh and succeeds")
    resetGoogleCertificateCache()
    certFetchCount = 0
    seedGoogleCertificateCache({ [staleKid]: publicPem })
    certFetchQueue = [{ [rotatedKid]: publicPem }]
    const rotatedToken = createSignedIdToken({ kid: rotatedKid })
    const rotatedClaims = await verifyGoogleIdToken(rotatedToken)
    assert(rotatedClaims.email === "learner@example.com", "Expected verified claims after refresh")
    assert(certFetchCount === 1, "Expected exactly one forced certificate refresh")

    console.log("3. Unknown key after forced refresh is rejected")
    resetGoogleCertificateCache()
    certFetchCount = 0
    seedGoogleCertificateCache({ [staleKid]: publicPem })
    certFetchQueue = [{ [staleKid]: publicPem }]
    const missingToken = createSignedIdToken({ kid: missingKid })
    let rejected = false
    try {
      await verifyGoogleIdToken(missingToken)
    } catch (error) {
      rejected = error instanceof Error && error.message === "Unknown Google signing key"
    }
    assert(rejected, "Expected Unknown Google signing key after forced refresh")
    assert(certFetchCount === 1, "Expected exactly one forced refresh before rejection")

    console.log("4. Nonce validation remains enforced after refresh")
    resetGoogleCertificateCache()
    certFetchCount = 0
    certFetchQueue = [{ [rotatedKid]: publicPem }]
    const nonceToken = createSignedIdToken({ kid: rotatedKid, nonce: "expected-nonce" })
    let nonceRejected = false
    try {
      await verifyGoogleIdToken(nonceToken, "different-nonce")
    } catch (error) {
      nonceRejected = error instanceof Error && error.message === "Invalid ID token nonce"
    }
    assert(nonceRejected, "Expected nonce validation to fail with mismatched nonce")

    console.log("5. Google JWK set response is parsed into kid → PEM map")
    resetGoogleCertificateCache()
    certFetchCount = 0
    const exportedJwk = publicKey.export({ format: "jwk" }) as { kty: string; n: string; e: string }
    const jwkSet = {
      keys: [
        {
          kty: exportedJwk.kty,
          kid: rotatedKid,
          use: "sig",
          alg: "RS256",
          n: exportedJwk.n,
          e: exportedJwk.e,
        },
      ],
    }
    const parsed = parseGoogleCertificates(jwkSet)
    assert(parsed.responseShape === "jwk_set", "Expected JWK set response shape")
    assert(typeof parsed.keys[rotatedKid] === "string", "Expected parsed PEM for rotated kid")
    certFetchQueue = [jwkSet]
    const jwkToken = createSignedIdToken({ kid: rotatedKid })
    await verifyGoogleIdToken(jwkToken)
    assert(certFetchCount === 1, "Expected one fetch for JWK set verification")

    console.log("6. Missing kid in JWK set triggers forced refresh and succeeds")
    resetGoogleCertificateCache()
    certFetchCount = 0
    seedGoogleCertificateCache({ [staleKid]: publicPem })
    certFetchQueue = [jwkSet]
    const jwkRotatedToken = createSignedIdToken({ kid: rotatedKid })
    await verifyGoogleIdToken(jwkRotatedToken)
    assert(certFetchCount === 1, "Expected forced refresh against JWK set response")

    console.log("7. Live Google certificate endpoint returns parseable signing keys")
    restoreFetchMock()
    resetGoogleCertificateCache()
    const liveResponse = await originalFetch(GOOGLE_CERTS_URL)
    assert(liveResponse.ok, "Expected live Google certificate endpoint to respond")
    const livePayload = await liveResponse.json()
    const liveParsed = parseGoogleCertificates(livePayload)
    assert(liveParsed.responseShape === "jwk_set", "Expected live Google certs to use JWK set format")
    assert(Object.keys(liveParsed.keys).length >= 1, "Expected at least one live Google signing key")
    installCertFetchMock()

    console.log("All Google OAuth certificate rotation checks passed.")
  } finally {
    restoreFetchMock()
    resetGoogleCertificateCache()
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
