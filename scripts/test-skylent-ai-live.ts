import "dotenv/config"
import {
  buildLessonAiContext,
} from "../server/src/lib/skylent-ai/authored.ts"
import {
  createOpenAiCompatibleProvider,
  readOpenAiCompatibleConfig,
} from "../server/src/lib/skylent-ai/openai-compatible.ts"
import { buildProviderMessages } from "../server/src/lib/skylent-ai/prompts.ts"
import type { AiAskInput } from "../server/src/lib/skylent-ai/types.ts"

/**
 * Explicit live-vendor smoke. Never treats lesson-grounded as a real provider.
 * Run: SKYLENT_AI_LIVE_SMOKE=1 pnpm test:ai:live
 * Does not print API keys or Authorization headers.
 */
async function main() {
  if (process.env.SKYLENT_AI_LIVE_SMOKE !== "1") {
    console.log("Live provider smoke skipped: set SKYLENT_AI_LIVE_SMOKE=1 to request it.")
    return
  }

  const config = readOpenAiCompatibleConfig()
  if (!config) {
    console.log("Live provider smoke skipped: SKYLENT_AI_API_KEY is not set (or base URL/model is invalid).")
    return
  }

  const providerName = (process.env.SKYLENT_AI_PROVIDER ?? "").trim().toLowerCase()
  if (providerName === "lesson-grounded" || providerName === "off" || providerName === "none") {
    console.log(
      "Live provider smoke skipped: refuses to treat lesson-grounded/off as a live vendor. Set SKYLENT_AI_PROVIDER=openai-compatible.",
    )
    return
  }

  const context = buildLessonAiContext({
    courseSlug: "data-analytics",
    courseTitle: "Data Analytics",
    moduleTitle: "Foundations of Data",
    lessonId: "l1",
    lessonTitle: "What is Data Analytics?",
    lessonKind: "notes",
  })
  const input: AiAskInput = {
    action: "ask",
    question: "What is net revenue in this lesson?",
    history: [],
    context,
  }

  const provider = createOpenAiCompatibleProvider(config)
  const started = Date.now()
  const result = await provider.complete(buildProviderMessages(input))
  const elapsedMs = Date.now() - started
  const answer = result.answer.trim()

  if (!answer) {
    throw new Error("Live provider returned an empty answer")
  }
  if (/SKYLENT_AI_API_KEY|Bearer |sk-[a-zA-Z0-9]{8,}/i.test(answer)) {
    throw new Error("Live provider answer appeared to include a secret")
  }

  const grounded =
    /net.?revenue|valid[- ]row|northwind|discount|unit_price|units ×|812/i.test(answer)
  if (!grounded) {
    throw new Error("Live provider answer did not stay recognisably on the lesson")
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        basedOn: context.lessonTitle,
        modelConfigured: Boolean(config.model),
        answerChars: answer.length,
        elapsedMs,
        lessonGrounded: grounded,
        answer,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  const name = error instanceof Error ? error.name : "unknown"
  const message = error instanceof Error ? error.message : "unknown"
  if (/sk-[a-zA-Z0-9]{8,}|Bearer |SKYLENT_AI_API_KEY/i.test(message)) {
    console.error("Live provider smoke failed:", name)
  } else {
    console.error("Live provider smoke failed:", name, message)
  }
  process.exit(1)
})
