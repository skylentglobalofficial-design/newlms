import type { AiProvider, ProviderChatMessage, ProviderCompleteOptions } from "./types.js"

export const PROVIDER_ERROR = "provider_error"
export const PROVIDER_TIMEOUT = "provider_timeout"
export const PROVIDER_NETWORK = "provider_network"
export const PROVIDER_HTTP_400 = "provider_http_400"
export const PROVIDER_HTTP_401 = "provider_http_401"
export const PROVIDER_HTTP_403 = "provider_http_403"
export const PROVIDER_HTTP_429 = "provider_http_429"
export const PROVIDER_HTTP_500 = "provider_http_500"
export const PROVIDER_MALFORMED = "provider_malformed"
export const EMPTY_PROVIDER_RESPONSE = "empty_provider_response"

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_MAX_OUTPUT_TOKENS = 800
const DEFAULT_BASE_URL = "https://api.openai.com/v1"
const DEFAULT_MODEL = "gpt-4o-mini"

const STABLE_ERRORS = new Set([
  PROVIDER_ERROR,
  PROVIDER_TIMEOUT,
  PROVIDER_NETWORK,
  PROVIDER_HTTP_400,
  PROVIDER_HTTP_401,
  PROVIDER_HTTP_403,
  PROVIDER_HTTP_429,
  PROVIDER_HTTP_500,
  PROVIDER_MALFORMED,
  EMPTY_PROVIDER_RESPONSE,
])

function textFromContent(content: unknown): string {
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return ""
  return content
    .map((part) => {
      if (typeof part === "string") return part
      if (part && typeof part === "object" && "text" in part && typeof (part as { text: unknown }).text === "string") {
        return (part as { text: string }).text
      }
      return ""
    })
    .join("")
}

export function parseChatCompletionContent(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    throw new Error(EMPTY_PROVIDER_RESPONSE)
  }
  const choices = (payload as { choices?: unknown }).choices
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error(EMPTY_PROVIDER_RESPONSE)
  }
  const message = (choices[0] as { message?: { content?: unknown } } | undefined)?.message
  const text = textFromContent(message?.content).trim()
  if (!text) {
    throw new Error(EMPTY_PROVIDER_RESPONSE)
  }
  return text
}

export function statusToProviderError(status: number): string {
  if (status === 400) return PROVIDER_HTTP_400
  if (status === 401) return PROVIDER_HTTP_401
  if (status === 403) return PROVIDER_HTTP_403
  if (status === 429) return PROVIDER_HTTP_429
  if (status >= 500) return PROVIDER_HTTP_500
  return PROVIDER_ERROR
}

function toProviderError(error: unknown): Error {
  if (error instanceof Error && STABLE_ERRORS.has(error.message)) {
    return error
  }
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return new Error(PROVIDER_TIMEOUT)
  }
  if (error instanceof TypeError) {
    return new Error(PROVIDER_NETWORK)
  }
  return new Error(PROVIDER_ERROR)
}

export function readMaxOutputTokens(): number {
  const raw = Number(process.env.SKYLENT_AI_MAX_OUTPUT_TOKENS ?? DEFAULT_MAX_OUTPUT_TOKENS)
  if (!Number.isFinite(raw) || raw < 64) return DEFAULT_MAX_OUTPUT_TOKENS
  return Math.min(Math.trunc(raw), 2_048)
}

export function readOpenAiCompatibleConfig(): {
  apiKey: string
  baseUrl: string
  model: string
  timeoutMs: number
  maxOutputTokens: number
} | null {
  const apiKey = process.env.SKYLENT_AI_API_KEY?.trim()
  if (!apiKey) return null
  const baseUrl = (process.env.SKYLENT_AI_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "")
  const model = process.env.SKYLENT_AI_MODEL?.trim() || DEFAULT_MODEL
  if (!/^https?:\/\//i.test(baseUrl) || !model) return null
  const timeoutRaw = Number(process.env.SKYLENT_AI_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS)
  const timeoutMs =
    Number.isFinite(timeoutRaw) && timeoutRaw >= 1_000 ? Math.min(Math.trunc(timeoutRaw), 120_000) : DEFAULT_TIMEOUT_MS
  return {
    apiKey,
    baseUrl,
    model,
    timeoutMs,
    maxOutputTokens: readMaxOutputTokens(),
  }
}

export function createOpenAiCompatibleProvider(options: {
  apiKey: string
  baseUrl: string
  model: string
  timeoutMs?: number
  maxOutputTokens?: number
}): AiProvider {
  const baseUrl = options.baseUrl.replace(/\/+$/, "")
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxOutputTokens = options.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS
  return {
    id: "openai-compatible",
    async complete(messages: ProviderChatMessage[], completeOptions?: ProviderCompleteOptions) {
      const timeoutSignal = AbortSignal.timeout(timeoutMs)
      const signal = completeOptions?.signal
        ? AbortSignal.any([completeOptions.signal, timeoutSignal])
        : timeoutSignal
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: options.model,
            temperature: 0.2,
            max_tokens: maxOutputTokens,
            messages,
          }),
          signal,
        })
        const text = await response.text()
        let payload: unknown = null
        try {
          payload = text ? JSON.parse(text) : null
        } catch {
          if (!response.ok) throw new Error(statusToProviderError(response.status))
          throw new Error(PROVIDER_MALFORMED)
        }
        if (!response.ok) {
          throw new Error(statusToProviderError(response.status))
        }
        return { answer: parseChatCompletionContent(payload) }
      } catch (error) {
        throw toProviderError(error)
      }
    },
  }
}
