import { ensureCsrfToken } from "./auth-api"
import { parseApiJson } from "./http"

const API_BASE = "/api/v1"

export type SkylentAiAction = "ask" | "explain" | "example" | "quiz" | "practice"

export type SkylentAiTurn = {
  role: "user" | "assistant"
  content: string
  related?: string | null
}

export async function fetchSkylentAiStatus(signal?: AbortSignal): Promise<{ available: boolean }> {
  const response = await fetch(`${API_BASE}/lms/ai/status`, { credentials: "include", signal })
  const parsed = await parseApiJson<{ data: { available: boolean } }>(response)
  return parsed.data
}

export async function askSkylentAi(input: {
  courseSlug: string
  lessonId: string
  action: SkylentAiAction
  question?: string
  messages?: SkylentAiTurn[]
  signal?: AbortSignal
}): Promise<{ answer: string; basedOn: string; related: string | null; caseLabel: string | null }> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}/lms/ai/ask`, {
    method: "POST",
    credentials: "include",
    signal: input.signal,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: JSON.stringify({
      courseSlug: input.courseSlug,
      lessonSlug: input.lessonId,
      mode: input.action,
      question: input.question,
      messages: input.messages?.map((turn) => ({ role: turn.role, content: turn.content })),
    }),
  })
  const parsed = await parseApiJson<{
    data: { answer: string; basedOn: string; related?: string | null; caseLabel?: string | null }
  }>(response)
  return {
    answer: parsed.data.answer,
    basedOn: parsed.data.basedOn,
    related: parsed.data.related ?? null,
    caseLabel: parsed.data.caseLabel ?? null,
  }
}
