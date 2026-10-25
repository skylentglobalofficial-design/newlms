/**
 * Public readiness probe. It does not log in, send cookies, or read secrets.
 *
 *   npx tsx scripts/smoke-public.ts
 *   npx tsx scripts/smoke-public.ts --base https://skylent.live --expect-sha <commit>
 *
 * Exit 0 only when the public health check says the process, database, and migrations are ready.
 * AI configuration is reported separately and does not by itself pass this check.
 * Exit 1 when the site is unreachable or not ready. Missing data is BLOCKED, never invented.
 */
import { decideSmoke, type SmokeObservation } from "./smoke-decision.ts"

const baseArg = process.argv.indexOf("--base")
const base = (baseArg >= 0 ? process.argv[baseArg + 1] : "https://skylent.live").replace(/\/$/, "")
const shaArg = process.argv.indexOf("--expect-sha")
const expectSha = shaArg >= 0 ? process.argv[shaArg + 1] : undefined

async function get(path: string): Promise<{ status: number; body: string; contentType: string }> {
  const response = await fetch(`${base}${path}`, {
    headers: { Accept: "application/json,text/html", "User-Agent": "skylent-release-readonly" },
    redirect: "manual",
  })
  return {
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    body: await response.text(),
  }
}

function jsonBody(body: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(body) as unknown
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

async function main() {
  let health: Awaited<ReturnType<typeof get>> | null = null
  let home: Awaited<ReturnType<typeof get>> | null = null
  let elixir: Awaited<ReturnType<typeof get>> | null = null
  let adminAi: Awaited<ReturnType<typeof get>> | null = null
  try {
    ;[health, home, elixir, adminAi] = await Promise.all([
      get("/api/v1/health"),
      get("/"),
      get("/api/v1/elixir"),
      get("/api/v1/admin/ai"),
    ])
  } catch (error) {
    console.error(`Smoke could not reach ${base}: ${error instanceof Error ? error.name : "network"}`)
    console.log("\nDECISION: BLOCKED")
    process.exit(1)
  }
  const asset = home.body.match(/src="(\/assets\/index-[^"]+\.js)"/)?.[1] ?? null
  const observation: SmokeObservation = {
    healthStatus: health.status,
    healthBody: jsonBody(health.body),
    homeStatus: home.status,
    asset,
    elixirStatus: elixir.status,
    elixirBody: jsonBody(elixir.body),
    adminAiStatus: adminAi.status,
  }
  const decision = decideSmoke(observation, expectSha)
  console.log(JSON.stringify({ base, ...observation, healthBody: observation.healthBody, decision: decision.decision, reasons: decision.reasons }, null, 2))
  console.log(`\nDECISION: ${decision.decision}`)
  if (decision.decision !== "PASS") process.exit(1)
}

if (process.argv[1]?.endsWith("smoke-public.ts")) {
  void main()
}
