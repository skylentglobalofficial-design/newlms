import type { AiProvider, ProviderChatMessage } from "./types.js"

export function parseChatCompletionContent(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    throw new Error("empty_provider_response")
  }
  const choices = (payload as { choices?: unknown }).choices
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error("empty_provider_response")
  }
  const message = (choices[0] as { message?: { content?: unknown } } | undefined)?.message
  const content = message?.content
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("empty_provider_response")
  }
  return content.trim()
}

export function createOpenAiCompatibleProvider(options: {
  apiKey: string
  baseUrl: string
  model: string
}): AiProvider {
  const baseUrl = options.baseUrl.replace(/\/+$/, "")
  return {
    id: "openai-compatible",
    async complete(messages: ProviderChatMessage[]) {
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
        signal: AbortSignal.timeout(30_000),
      })
      const text = await response.text()
      let payload: unknown = null
      try {
        payload = text ? JSON.parse(text) : null
      } catch {
        throw new Error("provider_error")
      }
      if (!response.ok) {
        throw new Error("provider_error")
      }
      return parseChatCompletionContent(payload)
    },
  }
}
