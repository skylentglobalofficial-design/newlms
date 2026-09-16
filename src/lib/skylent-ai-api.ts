import { ensureCsrfToken } from "./auth-api"
import { parseApiJson } from "./http"

const API_BASE = "/api/v1"

export type SkylentAiAction = "ask" | "explain" | "example" | "quiz" | "practice"

export type SkylentAiTurn = {
  role: "user" | "assistant"
  content: string
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
}): Promise<{ answer: string; basedOn: string }> {
  const token = await ensureCsrfToken()
  const response = await fetch(
    `${API_BASE}/lms/courses/${encodeURIComponent(input.courseSlug)}/lessons/${encodeURIComponent(input.lessonId)}/ai`,
    {
      method: "POST",
      credentials: "include",
      signal: input.signal,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token,
      },
      body: JSON.stringify({
        action: input.action,
        question: input.question,
        messages: input.messages,
      }),
    },
  )
  const parsed = await parseApiJson<{ data: { answer: string; basedOn: string } }>(response)
  return parsed.data
}
