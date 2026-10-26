import { buildLessonAiContext } from "./authored.js"
import { createLessonGroundedProvider } from "./grounded.js"
import {
  OPEN_QUIZ_REFUSAL,
  academicIntegrityRefusal,
  answerLeaksWithheldAnswers,
  answerLeaksWithheldResult,
  historyForPolicy,
  redactPrivilegedAssessmentContext,
} from "./integrity.js"
import { createOpenAiCompatibleProvider, readOpenAiCompatibleConfig } from "./openai-compatible.js"
import { buildProviderMessages, pickRelated } from "./prompts.js"
import type { AcademicPolicy, AiAskInput, AiAskResult, AiProvider, ChatTurn, LessonAiContext } from "./types.js"

const DEFAULT_TIMEOUT_MS = 30_000

export function readProviderTimeoutMs(): number {
  const raw = Number(process.env.SKYLENT_AI_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS)
  if (!Number.isFinite(raw) || raw < 1_000) return DEFAULT_TIMEOUT_MS
  return Math.min(Math.trunc(raw), 120_000)
}

function lessonGroundedAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") return true
  return process.env.SKYLENT_AI_ALLOW_GROUNDED === "1"
}

export function isAiConfigured(): boolean {
  const provider = (process.env.SKYLENT_AI_PROVIDER ?? "").trim().toLowerCase()
  if (provider === "off" || provider === "none") return false
  if (provider === "lesson-grounded") return lessonGroundedAllowed()
  return Boolean(process.env.SKYLENT_AI_API_KEY?.trim())
}

export type AiReadinessReason =
  | "ready"
  | "grounded_preview"
  | "provider_off"
  | "grounded_blocked"
  | "missing_key"
  | "invalid_base_url"

/** Safe for logs and the admin API. Does not include the key, URL, or model. */
export function describeAiReadiness(): {
  provider: string
  keyPresent: boolean
  providerReady: boolean
  reason: AiReadinessReason
  publicStatus: "configured" | "preview" | "not_configured"
} {
  const provider = (process.env.SKYLENT_AI_PROVIDER ?? "").trim().toLowerCase() || "unset"
  const keyPresent = Boolean(process.env.SKYLENT_AI_API_KEY?.trim())
  let reason: AiReadinessReason
  if (provider === "off" || provider === "none") reason = "provider_off"
  else if (provider === "lesson-grounded" && !lessonGroundedAllowed()) reason = "grounded_blocked"
  else if (provider === "lesson-grounded") reason = "grounded_preview"
  else if (!keyPresent) reason = "missing_key"
  else if (!readOpenAiCompatibleConfig()) reason = "invalid_base_url"
  else reason = "ready"
  const providerReady = reason === "ready" || reason === "grounded_preview"
  const publicStatus = reason === "ready" ? "configured" : reason === "grounded_preview" ? "preview" : "not_configured"
  return { provider, keyPresent, providerReady, reason, publicStatus }
}

/** Factory only — routes must not branch on provider.id. */
export function resolveAiProvider(): AiProvider | null {
  if (!isAiConfigured()) return null
  const provider = (process.env.SKYLENT_AI_PROVIDER ?? "").trim().toLowerCase()
  if (provider === "lesson-grounded") {
    if (!lessonGroundedAllowed()) return null
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
  policy?: AcademicPolicy
  quizGuard?: AiAskInput["quizGuard"]
  withheldAnswers?: string[]
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
    policy: options.policy ?? "lesson",
    quizGuard: options.quizGuard,
    withheldAnswers: options.withheldAnswers,
  }
}

export async function completeLessonAsk(input: AiAskInput, provider: AiProvider): Promise<AiAskResult> {
  const policy = input.policy ?? "lesson"
  const refusal = academicIntegrityRefusal(policy, input.question, input.history, input.context, input.quizGuard, input.action)
  if (refusal) {
    return {
      answer: refusal,
      basedOn: input.context.lessonTitle,
      provider: "policy",
      related: pickRelated(input.context, input.question, input.action),
      caseLabel: input.context.caseLabel,
    }
  }

  const safeInput: AiAskInput = {
    ...input,
    policy,
    history: historyForPolicy(input.history, policy),
    context: redactPrivilegedAssessmentContext(input.context, policy),
    quizGuard: undefined,
    withheldAnswers: undefined,
  }
  const result = provider.answerLesson
    ? await provider.answerLesson(safeInput)
    : await provider.complete(buildProviderMessages(safeInput))
  if (
    answerLeaksWithheldResult(result.answer, input.context, policy) ||
    answerLeaksWithheldAnswers(result.answer, input.withheldAnswers, policy)
  ) {
    return {
      answer:
        policy === "open_quiz"
          ? OPEN_QUIZ_REFUSAL
          : "This assignment is still open, so I will not state its results. I can explain the concept, what the rubric is asking for, or give you a hint on your approach.",
      basedOn: safeInput.context.lessonTitle,
      provider: "policy",
      related: pickRelated(safeInput.context, input.question, input.action),
      caseLabel: safeInput.context.caseLabel,
    }
  }
  return {
    answer: result.answer,
    basedOn: safeInput.context.lessonTitle,
    provider: provider.id,
    related: pickRelated(safeInput.context, input.question, input.action),
    caseLabel: safeInput.context.caseLabel,
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
