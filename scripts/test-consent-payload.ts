import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { CURRENT_POLICY_VERSION } from "../server/src/lib/policy.ts"

/** What a client sends after the terms checkbox is ticked. Used by the API test scripts when they act as that client. */
export const TEST_CONSENT = { accepted: true, policyVersion: CURRENT_POLICY_VERSION } as const

/**
 * Ensures an Express API server is listening for integration tests.
 * Automatically boots the Express `app` from `../server/src/index.js` in-process
 * with `AUTH_RATE_LIMIT_MAX=1000` when run standalone via `npx tsx scripts/test-*.ts`.
 */
export async function ensureTestApiServer(defaultApiBase: string): Promise<{
  apiBase: string
  close: () => Promise<void>
}> {
  if (process.env.API_BASE) {
    try {
      const probe = await fetch(`${defaultApiBase}/health/live`, {
        signal: AbortSignal.timeout(1500),
      })
      if (probe.ok || probe.status === 503 || probe.status === 404) {
        return { apiBase: defaultApiBase, close: async () => {} }
      }
    } catch {
      // Fall back to in-process server below.
    }
  }

  process.env.SKYLENT_EMBEDDED_TEST_SERVER = "1"
  process.env.AUTH_RATE_LIMIT_MAX ||= "1000"
  process.env.SKYLENT_LABS_RATE_LIMIT_MAX ||= "1000"

  const { app } = await import("../server/src/index.js")

  let preferredPort = 0
  try {
    const parsed = new URL(defaultApiBase)
    preferredPort = Number(parsed.port) || 0
  } catch {
    preferredPort = 0
  }

  const listenOn = (port: number): Promise<Server> =>
    new Promise((resolve, reject) => {
      const srv = app.listen(port, "127.0.0.1", () => resolve(srv))
      srv.once("error", reject)
    })

  let server: Server
  if (preferredPort > 0) {
    try {
      server = await listenOn(preferredPort)
    } catch {
      server = await listenOn(0)
    }
  } else {
    server = await listenOn(0)
  }

  const actualPort = (server.address() as AddressInfo).port
  const host = defaultApiBase.includes("localhost") ? "localhost" : "127.0.0.1"
  const apiBase = `http://${host}:${actualPort}/api/v1`

  return {
    apiBase,
    close: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    },
  }
}
