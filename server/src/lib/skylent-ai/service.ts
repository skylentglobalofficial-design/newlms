import { buildLessonAiContext } from "./authored.js"
import { createLessonGroundedProvider } from "./grounded.js"
import { createOpenAiCompatibleProvider } from "./openai-compatible.js"
import { buildProviderMessages } from "./prompts.js"
import type { AiAskInput, AiAskResult, AiProvider, ChatTurn, LessonAiContext } from "./types.js"

const DEFAULT_TIMEOUT_MS = 30_000

export function readProviderTimeoutMs(): number {
  const raw = Number(process.env.SKYLENT_AI_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS)
  if (!Number.isFinite(raw) || raw < 1_000) return DEFAULT_TIMEOUT_MS
  return Math.min(Math.trunc(raw), 120_000)
}

export function isAiConfigured(): boolean {
  const provider = (process.env.SKYLENT_AI_PROVIDER ?? "").trim().toLowerCase()
  if (provider === "off" || provider === "none") return false
  if (provider === "lesson-grounded") return true
  return Boolean(process.env.SKYLENT_AI_API_KEY?.trim())
}

export function resolveAiProvider(): AiProvider | null {
  if (!isAiConfigured()) return null
  const provider = (process.env.SKYLENT_AI_PROVIDER ?? "").trim().toLowerCase()
  if (provider === "lesson-grounded") {
    return createLessonGroundedProvider()
  }
  const apiKey = process.env.SKYLENT_AI_API_KEY?.trim()
  if (!apiKey) return null
  const baseUrl = process.env.SKYLENT_AI_BASE_URL?.trim() || "https://api.openai.com/v1"
  const model = process.env.SKYLENT_AI_MODEL?.trim() || "gpt-4o-mini"
  if (!/^https?:\/\//i.test(baseUrl) || !model) return null
  return createOpenAiCompatibleProvider({
    apiKey,
    baseUrl,
    model,
    timeoutMs: readProviderTimeoutMs(),
  })
}

export function buildAskInput(options: {
  action: AiAskInput["action"]
  question: string
  history: ChatTurn[]
  courseSlug: string
  courseTitle: string
  moduleTitle: string
  lessonId: string
  lessonTitle: string
  lessonKind: string
}): AiAskInput {
  const context: LessonAiContext = buildLessonAiContext({
    courseSlug: options.courseSlug,
    courseTitle: options.courseTitle,
    moduleTitle: options.moduleTitle,
    lessonId: options.lessonId,
    lessonTitle: options.lessonTitle,
    lessonKind: options.lessonKind,
  })
  return {
    action: options.action,
    question: options.question,
    history: options.history,
    context,
  }
}

export async function completeLessonAsk(input: AiAskInput, provider: AiProvider): Promise<AiAskResult> {
  const answer = provider.answerLesson
    ? await provider.answerLesson(input)
    : await provider.complete(buildProviderMessages(input))
  return {
    answer,
    basedOn: input.context.lessonTitle,
    provider: provider.id,
  }
}

export async function answerLessonQuestion(
  options: Parameters<typeof buildAskInput>[0],
  provider: AiProvider | null = resolveAiProvider(),
): Promise<AiAskResult | { unavailable: true }> {
  if (!provider) return { unavailable: true }
  const input = buildAskInput(options)
  return completeLessonAsk(input, provider)
}
