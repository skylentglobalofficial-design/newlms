export type SmokeObservation = {
  healthStatus: number | null
  healthBody: Record<string, unknown> | null
  homeStatus: number | null
  asset: string | null
  elixirStatus: number | null
  elixirBody: Record<string, unknown> | null
  adminAiStatus: number | null
}

export function decideSmoke(observation: SmokeObservation, expectSha?: string): { decision: "PASS" | "BLOCKED"; reasons: string[] } {
  const reasons: string[] = []
  const health = observation.healthBody
  if (observation.healthStatus !== 200 || !health) {
    reasons.push(`health is ${observation.healthStatus ?? "unreachable"}, not 200`)
  } else {
    if (health.status !== "ok") reasons.push(`health status is ${String(health.status)}`)
    if (health.db !== "ok") reasons.push(`database is ${String(health.db)}`)
    if (health.migrations !== "ok") reasons.push(`migrations are ${String(health.migrations)}`)
    if (expectSha && health.release !== expectSha) reasons.push(`release is ${String(health.release ?? "missing")}, expected ${expectSha}`)
  }
  if (observation.homeStatus !== 200 || !observation.asset?.startsWith("/assets/index-")) {
    reasons.push("homepage did not serve the built client")
  }
  const elixirUnavailable = observation.elixirStatus === 503 && observation.elixirBody?.code === "unavailable"
  if (elixirUnavailable) reasons.push("Elixir tables are not available")
  else if (observation.elixirStatus !== 401) reasons.push(`Elixir responded ${observation.elixirStatus ?? "unreachable"}, expected 401 once the tables exist`)
  if (observation.adminAiStatus !== 401) reasons.push(`admin AI diagnostics responded ${observation.adminAiStatus ?? "unreachable"}, expected 401 without a session`)
  return { decision: reasons.length === 0 ? "PASS" : "BLOCKED", reasons }
}
