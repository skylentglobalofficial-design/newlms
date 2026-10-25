import { apiV1 } from "./api-base"
import { ensureCsrfToken } from "./auth-api"
import { parseApiJson } from "./http"

const API_BASE = apiV1()

export type SkylentAiAction = "ask" | "explain" | "example" | "quiz" | "practice"

export type SkylentAiTurn = {
  role: "user" | "assistant"
  content: string
  related?: string | null
}

export type SkylentAiStatus = {
  available: boolean
  configured?: boolean
  access?: "ok" | "locked" | "enrolment_required" | "not_found"
  code?: string
}

export async function fetchSkylentAiStatus(
  signalOrOptions?: AbortSignal | { courseSlug?: string; lessonId?: string; signal?: AbortSignal },
): Promise<SkylentAiStatus> {
  const options = signalOrOptions instanceof AbortSignal ? { signal: signalOrOptions } : signalOrOptions
  const params = new URLSearchParams()
  if (options?.courseSlug) params.set("courseSlug", options.courseSlug)
  if (options?.lessonId) params.set("lessonId", options.lessonId)
  const query = params.toString()
  const response = await fetch(`${API_BASE}/lms/ai/status${query ? `?${query}` : ""}`, {
    credentials: "include",
    signal: options?.signal,
  })
  const parsed = await parseApiJson<{ data: SkylentAiStatus }>(response)
  return parsed.data
}

export async function askSkylentAi(input: {
  courseSlug: string
  lessonId: string
  action: SkylentAiAction
  question?: string
  messages?: SkylentAiTurn[]
  signal?: AbortSignal
}): Promise<{ answer: string; basedOn: string; related: string | null; caseLabel: string | null; refused: boolean }> {
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
    data: { answer: string; basedOn: string; related?: string | null; caseLabel?: string | null; refused?: boolean; policy?: string }
  }>(response)
  return {
    answer: parsed.data.answer,
    basedOn: parsed.data.basedOn,
    related: parsed.data.related ?? null,
    caseLabel: parsed.data.caseLabel ?? null,
    refused: parsed.data.refused === true,
  }
}
