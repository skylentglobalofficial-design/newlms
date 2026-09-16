import type { AiProvider, ProviderChatMessage } from "./types.js"

export const PROVIDER_ERROR = "provider_error"
export const EMPTY_PROVIDER_RESPONSE = "empty_provider_response"
const DEFAULT_TIMEOUT_MS = 30_000

export function parseChatCompletionContent(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    throw new Error(EMPTY_PROVIDER_RESPONSE)
  }
  const choices = (payload as { choices?: unknown }).choices
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error(EMPTY_PROVIDER_RESPONSE)
  }
  const message = (choices[0] as { message?: { content?: unknown } } | undefined)?.message
  const content = message?.content
  if (typeof content !== "string" || !content.trim()) {
    throw new Error(EMPTY_PROVIDER_RESPONSE)
  }
  return content.trim()
}

function toProviderError(error: unknown): Error {
  if (error instanceof Error && (error.message === EMPTY_PROVIDER_RESPONSE || error.message === PROVIDER_ERROR)) {
    return error
  }
  return new Error(PROVIDER_ERROR)
}

export function createOpenAiCompatibleProvider(options: {
  apiKey: string
  baseUrl: string
  model: string
  timeoutMs?: number
}): AiProvider {
  const baseUrl = options.baseUrl.replace(/\/+$/, "")
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  return {
    id: "openai-compatible",
    async complete(messages: ProviderChatMessage[]) {
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
            messages,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        })
        const text = await response.text()
        let payload: unknown = null
        try {
          payload = text ? JSON.parse(text) : null
        } catch {
          throw new Error(PROVIDER_ERROR)
        }
        if (!response.ok) {
          throw new Error(PROVIDER_ERROR)
        }
        return parseChatCompletionContent(payload)
      } catch (error) {
        throw toProviderError(error)
      }
    },
  }
}
