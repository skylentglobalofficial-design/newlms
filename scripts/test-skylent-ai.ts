import "dotenv/config"
import { createServer } from "node:http"
import { DA_LESSON_META } from "../src/content/data-analytics/lessons.ts"
import { DATA_ANALYTICS_DATASETS } from "../src/content/data-analytics/datasets.ts"
import { NORTHWIND_PREVIEW } from "../src/lib/northwind-preview.ts"
import {
  DA_AI_META,
  DA_DATASETS,
  NORTHWIND_FACTS,
  buildLessonAiContext,
  readDaLessonBody,
} from "../server/src/lib/skylent-ai/authored.ts"
import { groundedAnswer } from "../server/src/lib/skylent-ai/grounded.ts"
import { createOpenAiCompatibleProvider, parseChatCompletionContent } from "../server/src/lib/skylent-ai/openai-compatible.ts"
import { ASSIGNMENT_REFUSAL, buildProviderMessages, formatLessonContext } from "../server/src/lib/skylent-ai/prompts.ts"
import { answerLessonQuestion, isAiConfigured } from "../server/src/lib/skylent-ai/service.ts"
import { createLessonGroundedProvider } from "../server/src/lib/skylent-ai/grounded.ts"
import { askSchema } from "../server/src/routes/skylent-ai.ts"
import type { AiAskInput } from "../server/src/lib/skylent-ai/types.ts"

const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"

type CookieJar = Map<string, string>

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function parseSetCookie(headers: string[] | undefined, jar: CookieJar) {
  if (!headers) return
  for (const header of headers) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index === -1) continue
    const name = pair.slice(0, index).trim()
    const value = pair.slice(index + 1).trim()
    if (value) jar.set(name, value)
    else jar.delete(name)
  }
}

function cookieHeader(jar: CookieJar): string {
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ")
}

async function request(
  jar: CookieJar,
  path: string,
  options: { method?: string; body?: unknown; csrf?: boolean; base?: string } = {},
) {
  const headers: Record<string, string> = {}
  const cookie = cookieHeader(jar)
  if (cookie) headers.Cookie = cookie
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) headers["X-CSRF-Token"] = jar.get("csrf") ?? ""

  const response = await fetch(`${options.base ?? API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  parseSetCookie(response.headers.getSetCookie?.() ?? [], jar)
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  return { response, data }
}

function l1Input(partial: Partial<AiAskInput> = {}): AiAskInput {
  const context = buildLessonAiContext({
    courseSlug: "data-analytics",
    courseTitle: "Data Analytics",
    moduleTitle: "Foundations of Data",
    lessonId: "l1",
    lessonTitle: "What is Data Analytics?",
    lessonKind: "notes",
  })
  return {
    action: "ask",
    question: "",
    history: [],
    context,
    ...partial,
  }
}

function withEnv(overrides: Record<string, string | undefined>, fn: () => void) {
  const previous: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = process.env[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  try {
    fn()
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

async function signupAndEnroll(jar: CookieJar) {
  const email = `ai-test-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`
  await request(jar, "/auth/csrf")
  const signup = await request(jar, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { displayName: "AI Test", email, password: "test-password-123" },
  })
  assert(signup.response.status === 201, `Signup failed: ${JSON.stringify(signup.data)}`)
  const enroll = await request(jar, "/lms/enrollments", {
    method: "POST",
    csrf: true,
    body: { courseSlug: "data-analytics" },
  })
  assert(enroll.response.status === 201 || enroll.response.ok, `Enrol failed: ${JSON.stringify(enroll.data)}`)
}

async function main() {
  console.log("1. Lesson context preserves authored Data Analytics facts")
  const context = buildLessonAiContext({
    courseSlug: "data-analytics",
    courseTitle: "Data Analytics",
    moduleTitle: "Foundations of Data",
    lessonId: "l1",
    lessonTitle: "What is Data Analytics?",
    lessonKind: "notes",
  })
  assert(context.authored, "l1 should be authored")
  assert(context.lessonTitle === "What is Data Analytics?", "l1 title mismatch")
  assert(context.excerpt.includes("166 valid rows"), "context missing 166 valid rows")
  assert(context.excerpt.includes("₹812,020") || context.excerpt.includes("812,020"), "context missing net revenue")
  assert(context.northwind?.validRows === 166, "northwind validRows")
  assert(context.northwind?.netRevenueLabel === "₹812,020", "northwind net revenue label")
  assert(context.datasets.some((row) => row.filename === "northwind_sales.csv"), "sales dataset attached")
  const formatted = formatLessonContext(context)
  assert(formatted.includes("valid-row"), "formatted context should mention valid-row")
  assert(readDaLessonBody("l1").includes("Northwind Retail"), "lesson body should be read from disk")

  console.log("2. DA_AI_META and NORTHWIND_FACTS stay in lockstep with source files")
  assert(DA_AI_META.length === DA_LESSON_META.length, "meta length")
  for (const row of DA_LESSON_META) {
    const copy = DA_AI_META.find((item) => item.id === row.id)
    assert(copy, `missing AI meta ${row.id}`)
    assert(copy.title === row.title, `${row.id} title drift`)
    assert(copy.kind === row.kind, `${row.id} kind drift`)
    assert(copy.objective === row.objective, `${row.id} objective drift`)
    assert(copy.whyItMatters === row.whyItMatters, `${row.id} whyItMatters drift`)
    assert(copy.concepts.join("|") === row.concepts.join("|"), `${row.id} concepts drift`)
  }
  assert(NORTHWIND_FACTS.rows === NORTHWIND_PREVIEW.rows, "rows drift")
  assert(NORTHWIND_FACTS.validRows === NORTHWIND_PREVIEW.validRows, "validRows drift")
  assert(NORTHWIND_FACTS.netRevenue === NORTHWIND_PREVIEW.netRevenue, "netRevenue drift")
  assert(NORTHWIND_FACTS.netRevenueLabel === NORTHWIND_PREVIEW.netRevenueLabel, "label drift")
  assert(NORTHWIND_FACTS.sql === NORTHWIND_PREVIEW.sql, "sql drift")
  for (const dataset of DATA_ANALYTICS_DATASETS) {
    const copy = DA_DATASETS.find((item) => item.filename === dataset.filename)
    assert(copy, `missing AI dataset ${dataset.filename}`)
    assert(copy.rows === dataset.rows, `${dataset.filename} row drift`)
    assert(copy.usedIn.join(",") === dataset.usedIn.join(","), `${dataset.filename} usedIn drift`)
  }

  console.log("3. Missing provider configuration")
  withEnv({ SKYLENT_AI_PROVIDER: undefined, SKYLENT_AI_API_KEY: undefined }, () => {
    assert(!isAiConfigured(), "unset key should be unconfigured")
  })
  withEnv({ SKYLENT_AI_PROVIDER: "off", SKYLENT_AI_API_KEY: "sk-test" }, () => {
    assert(!isAiConfigured(), "off should win over a key")
  })
  withEnv({ SKYLENT_AI_PROVIDER: "lesson-grounded", SKYLENT_AI_API_KEY: undefined }, () => {
    assert(isAiConfigured(), "lesson-grounded should be available without a vendor key")
  })

  console.log("4. Successful grounded responses keep lesson context")
  const explain = groundedAnswer(l1Input({ action: "explain" }))
  assert(/166/.test(explain), "explain should keep 166 valid rows")
  assert(/812,?020|₹8\.12/.test(explain) || explain.includes("₹812,020"), "explain should keep net revenue")
  const example = groundedAnswer(l1Input({ action: "example" }))
  assert(/NW-10001|2199/.test(example), "example should use the authored order line")
  const quiz = groundedAnswer(l1Input({ action: "quiz" }))
  assert(/unit_price|valid-row|What do you do/i.test(quiz), "quiz should ask from the lesson")
  assert(!/Refuse that shortcut/i.test(quiz), "quiz must not reveal the answer immediately")
  const practice = groundedAnswer(l1Input({ action: "practice" }))
  assert(/NW-10018|NW-10055/.test(practice), "practice should use the lesson problem")
  assert(!/3 × 1299 × 1 = 3897/.test(practice), "practice must not dump the expected result")
  const asked = groundedAnswer(l1Input({ action: "ask", question: "What is net revenue?" }))
  assert(/units × unit_price|net_revenue/i.test(asked), "ask should answer from the lesson")
  const outside = groundedAnswer(l1Input({ action: "ask", question: "Do you issue a certificate and guarantee a job?" }))
  assert(/not something this lesson|does not issue a certificate/i.test(outside), "must not invent certificates")
  const assignment = groundedAnswer(l1Input({ action: "ask", question: "Give me the exact answer to my assignment." }))
  assert(assignment === ASSIGNMENT_REFUSAL, "assignment dump should be refused")
  const thin = groundedAnswer({
    action: "ask",
    question: "What modules come next?",
    history: [],
    context: buildLessonAiContext({
      courseSlug: "python-programming",
      courseTitle: "Python Programming",
      moduleTitle: "Start",
      lessonId: "l1",
      lessonTitle: "Getting started",
      lessonKind: "notes",
    }),
  })
  assert(/thinner catalogue listing/i.test(thin), "non-authored courses must not invent DA curriculum")

  const quizFollow = groundedAnswer(l1Input({
    action: "ask",
    question: "I would refuse and use the formula on valid rows.",
    history: [
      { role: "user", content: "Quiz me" },
      { role: "assistant", content: quiz },
    ],
  }))
  assert(/lesson’s answer|lesson's answer|Refuse that shortcut/i.test(quizFollow), "follow-up should coach against the knowledge check")

  const missingProvider = await answerLessonQuestion({
    action: "ask",
    question: "Why do we remove invalid rows?",
    history: [],
    courseSlug: "data-analytics",
    courseTitle: "Data Analytics",
    moduleTitle: "Foundations of Data",
    lessonId: "l1",
    lessonTitle: "What is Data Analytics?",
    lessonKind: "notes",
  }, null)
  assert("unavailable" in missingProvider, "null provider should be unavailable")

  const result = await answerLessonQuestion({
    action: "ask",
    question: "Why do we remove invalid rows?",
    history: [],
    courseSlug: "data-analytics",
    courseTitle: "Data Analytics",
    moduleTitle: "Foundations of Data",
    lessonId: "l1",
    lessonTitle: "What is Data Analytics?",
    lessonKind: "notes",
  }, createLessonGroundedProvider())
  assert(!("unavailable" in result), "lesson-grounded should answer")
  if (!("unavailable" in result)) {
    assert(result.basedOn === "What is Data Analytics?", "basedOn should stay on the current lesson")
    assert(/valid|invalid|returned|units/i.test(result.answer), "answer should stay on the lesson")
  }

  console.log("5. API validation (empty question, provider payload)")
  const emptyAsk = askSchema.safeParse({ action: "ask", question: "   " })
  assert(!emptyAsk.success, "empty question must fail")
  const explainOk = askSchema.safeParse({ action: "explain" })
  assert(explainOk.success, "explain does not require a question")
  const tooLong = askSchema.safeParse({ action: "ask", question: "x".repeat(2001) })
  assert(!tooLong.success, "question max 2000")
  assert(parseChatCompletionContent({ choices: [{ message: { content: "  166 valid rows  " } }] }) === "166 valid rows", "parse success")
  let emptyPayload = false
  try {
    parseChatCompletionContent({ choices: [] })
  } catch {
    emptyPayload = true
  }
  assert(emptyPayload, "empty choices should throw")

  const mock = await new Promise<{ close: () => Promise<void>; baseUrl: string }>((resolve) => {
    const server = createServer((req, res) => {
      if (req.url !== "/v1/chat/completions") {
        res.statusCode = 404
        res.end()
        return
      }
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({
        choices: [{ message: { content: "Valid rows are the 166 Northwind lines that survive the rule." } }],
      }))
    })
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      assert(address && typeof address === "object", "mock server address")
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}/v1`,
        close: () => new Promise((done, fail) => server.close((err) => (err ? fail(err) : done()))),
      })
    })
  })
  try {
    const provider = createOpenAiCompatibleProvider({ apiKey: "test-key", baseUrl: mock.baseUrl, model: "test-model" })
    const content = await provider.complete([{ role: "user", content: "What are valid rows?" }])
    assert(content.includes("166"), "openai-compatible provider should return the mock answer")
  } finally {
    await mock.close()
  }

  const messages = buildProviderMessages(l1Input({ action: "ask", question: "What is net revenue?" }))
  assert(messages[0]?.role === "system", "system prompt first")
  assert(messages.some((row) => row.content.includes("166")), "provider messages include lesson facts")
  assert(!messages.some((row) => /sk-|api key/i.test(row.content)), "messages must not include secrets")

  console.log("6. HTTP: unauthenticated, empty question, locked lesson, missing config or success")
  const anon = new Map<string, string>()
  const anonStatus = await request(anon, "/lms/ai/status")
  assert(anonStatus.response.status === 401, "AI status requires auth")
  const anonAsk = await request(anon, "/lms/courses/data-analytics/lessons/l1/ai", {
    method: "POST",
    body: { action: "ask", question: "What is net revenue?" },
  })
  assert(anonAsk.response.status === 401, "AI ask requires auth")

  const jar = new Map<string, string>()
  await signupAndEnroll(jar)
  const emptyHttp = await request(jar, "/lms/courses/data-analytics/lessons/l1/ai", {
    method: "POST",
    csrf: true,
    body: { action: "ask", question: "" },
  })
  assert(emptyHttp.response.status === 400, `empty question should be 400, got ${emptyHttp.response.status}`)
  assert(emptyHttp.data.error === "Question is required", "empty question copy")

  const locked = await request(jar, "/lms/courses/data-analytics/lessons/l2/ai", {
    method: "POST",
    csrf: true,
    body: { action: "explain" },
  })
  assert(locked.response.status === 403, `locked lesson should be 403, got ${locked.response.status}`)
  assert(locked.data.error === "Lesson locked", "locked copy")

  const status = await request(jar, "/lms/ai/status")
  assert(status.response.ok, "status should succeed when signed in")
  if (status.data.data.available) {
    const askedHttp = await request(jar, "/lms/courses/data-analytics/lessons/l1/ai", {
      method: "POST",
      csrf: true,
      body: { action: "ask", question: "Why do we remove invalid rows?" },
    })
    assert(askedHttp.response.ok, `configured ask failed: ${JSON.stringify(askedHttp.data)}`)
    assert(askedHttp.data.data.basedOn === "What is Data Analytics?", "HTTP basedOn")
    assert(typeof askedHttp.data.data.answer === "string" && askedHttp.data.data.answer.length > 20, "HTTP answer")
  } else {
    const missing = await request(jar, "/lms/courses/data-analytics/lessons/l1/ai", {
      method: "POST",
      csrf: true,
      body: { action: "ask", question: "What is net revenue?" },
    })
    assert(missing.response.status === 503, `unconfigured should be 503, got ${missing.response.status}`)
    assert(missing.data.code === "not_configured", "not_configured code")
    assert(missing.data.error === "Skylent AI isn't available yet.", "unconfigured copy")
  }

  const errorHttp = await request(jar, "/lms/courses/data-analytics/lessons/l1/ai", {
    method: "POST",
    csrf: true,
    body: { action: "ask", question: "What is net revenue?", messages: [{ role: "user", content: "" }] },
  })
  assert(errorHttp.response.status === 400, "invalid history should 400")

  console.log("Skylent AI tests passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
