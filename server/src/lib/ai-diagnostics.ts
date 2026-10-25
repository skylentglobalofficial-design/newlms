import { isAiConfigured } from "./skylent-ai/service.js"

export type AiFailureCode = "not_configured" | "provider_error" | "unavailable" | "enrolment_required" | "lesson_locked"

type LastFailure = { at: string; code: AiFailureCode }

let lastFailure: LastFailure | null = null

export function noteAiFailure(code: AiFailureCode) {
  lastFailure = { at: new Date().toISOString(), code }
}

export function readAiDiagnostics() {
  const providerName = (process.env.SKYLENT_AI_PROVIDER ?? "").trim().toLowerCase()
  const keyPresent = Boolean(process.env.SKYLENT_AI_API_KEY?.trim())
  return {
    configured: isAiConfigured(),
    provider: providerName || "unset",
    keyPresent,
    lastFailure,
  }
}
