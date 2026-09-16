import { buildLessonAiContext } from "./authored.js"
import { createLessonGroundedProvider } from "./grounded.js"
import { createOpenAiCompatibleProvider, readOpenAiCompatibleConfig } from "./openai-compatible.js"
import { buildProviderMessages, pickRelated } from "./prompts.js"
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

/** Factory only — routes must not branch on provider.id. */
export function resolveAiProvider(): AiProvider | null {
  if (!isAiConfigured()) return null
  const provider = (process.env.SKYLENT_AI_PROVIDER ?? "").trim().toLowerCase()
  if (provider === "lesson-grounded") {
    return createLessonGroundedProvider()
  }
  const config = readOpenAiCompatibleConfig()
  if (!config) return null
  return createOpenAiCompatibleProvider(config)
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
  const result = provider.answerLesson
    ? await provider.answerLesson(input)
    : await provider.complete(buildProviderMessages(input))
  return {
    answer: result.answer,
    basedOn: input.context.lessonTitle,
    provider: provider.id,
    related: pickRelated(input.context, input.question, input.action),
    caseLabel: input.context.caseLabel,
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
