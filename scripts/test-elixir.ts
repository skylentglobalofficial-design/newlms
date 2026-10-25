import "dotenv/config"
import { PrismaClient, RoleName } from "@prisma/client"
import { ensureRole } from "../server/src/lib/auth.js"
import {
  InsufficientElixirError,
  adjustElixir,
  awardLearningActivity,
  clearElixirReadyCache,
  elixirForNetRupees,
  reconcileElixir,
  recordVerifiedPayment,
  refundVerifiedPayment,
  spendOnResource,
  updateRewardRule,
} from "../server/src/lib/elixir.ts"
import { TEST_CONSENT } from "./test-consent-payload.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const prisma = new PrismaClient()
const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api/v1"
const stamp = `${process.pid}-${Date.now()}`
const email = `elixir-test-${stamp}@example.com`
const studentEmail = `elixir-student-${stamp}@example.com`
const password = "elixir-test-password-123"

function unit() {
  assert(elixirForNetRupees(100) === 10, "100 rupees is 10 Elixir")
  assert(elixirForNetRupees(500) === 50, "500 rupees is 50 Elixir")
  assert(elixirForNetRupees(109) === 10, "partial hundreds floor")
  assert(elixirForNetRupees(9) === 0, "under 10 rupees earns nothing")
  assert(elixirForNetRupees(0) === 0, "zero earns nothing")
  assert(elixirForNetRupees(-10) === 0, "negative earns nothing")
  console.log("elixir formula ok")
}

type Jar = Map<string, string>

function cookies(jar: Jar) {
  return Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join("; ")
}

function storeCookies(response: Response, jar: Jar) {
  const headers = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : []
  for (const header of headers) {
    const [pair] = header.split(";")
    const index = pair.indexOf("=")
    if (index === -1) continue
    jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
  }
}

async function api(jar: Jar, path: string, options: { method?: string; body?: unknown; csrf?: boolean } = {}) {
  const headers: Record<string, string> = {}
  const cookie = cookies(jar)
  if (cookie) headers.Cookie = cookie
  if (options.body !== undefined) headers["Content-Type"] = "application/json"
  if (options.csrf) headers["X-CSRF-Token"] = jar.get("csrf") ?? ""
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  storeCookies(response, jar)
  const data = await response.json().catch(() => null)
  return { response, data }
}

async function main() {
  unit()
  const databaseUrl = process.env.DATABASE_URL
  assert(databaseUrl, "DATABASE_URL is required for the local Elixir ledger test")
  const host = new URL(databaseUrl).hostname
  assert(["localhost", "127.0.0.1", "::1"].includes(host), `refusing non-local database host ${host}`)
  clearElixirReadyCache()

  const user = await prisma.user.create({ data: { email, displayName: "Elixir Test" } })
  try {
    const pending = await recordVerifiedPayment({
      userId: user.id,
      externalRef: `pay-pending-${stamp}`,
      eligibleNetRupees: 100,
      status: "pending",
      recordedById: null,
    })
    assert(pending.payment.elixirAwarded === 0, "pending payment awards nothing")

    const failed = await recordVerifiedPayment({
      userId: user.id,
      externalRef: `pay-failed-${stamp}`,
      eligibleNetRupees: 100,
      status: "failed",
      recordedById: null,
    })
    assert(failed.payment.elixirAwarded === 0, "failed payment awards nothing")

    const first = await recordVerifiedPayment({
      userId: user.id,
      externalRef: `pay-100-${stamp}`,
      eligibleNetRupees: 100,
      status: "succeeded",
      recordedById: null,
    })
    assert(first.payment.elixirAwarded === 10, "100 rupees awards 10")
    const duplicate = await recordVerifiedPayment({
      userId: user.id,
      externalRef: `pay-100-${stamp}`,
      eligibleNetRupees: 100,
      status: "succeeded",
      recordedById: null,
    })
    assert(duplicate.duplicate, "retried payment reference is a duplicate")
    const second = await recordVerifiedPayment({
      userId: user.id,
      externalRef: `pay-500-${stamp}`,
      eligibleNetRupees: 500,
      status: "succeeded",
      recordedById: null,
    })
    assert(second.payment.elixirAwarded === 50, "500 rupees awards 50")
    let reconciled = await reconcileElixir(user.id)
    assert(reconciled.balance === 60 && reconciled.consistent, `balance after purchases ${reconciled.balance} consistent ${reconciled.consistent}`)

    await updateRewardRule({ activity: "lesson_complete", amount: 4, enabled: true, quizScorePercent: null, cooldownSeconds: 0, actorId: user.id })
    const once = await awardLearningActivity({ userId: user.id, activity: "lesson_complete", sourceId: `lesson-a-${stamp}` })
    const again = await awardLearningActivity({ userId: user.id, activity: "lesson_complete", sourceId: `lesson-a-${stamp}` })
    assert(once.awarded && again.reason === "duplicate", "the same lesson cannot be claimed twice")
    await updateRewardRule({ activity: "lesson_complete", amount: 4, enabled: true, quizScorePercent: null, cooldownSeconds: 3600, actorId: user.id })
    const cooled = await awardLearningActivity({ userId: user.id, activity: "lesson_complete", sourceId: `lesson-b-${stamp}` })
    assert(cooled.reason === "cooldown", "a second lesson inside the cooldown is not rewarded")

    await updateRewardRule({ activity: "quiz_score", amount: 3, enabled: true, quizScorePercent: 80, cooldownSeconds: 0, actorId: user.id })
    const low = await awardLearningActivity({ userId: user.id, activity: "quiz_score", sourceId: `quiz-${stamp}`, scorePercent: 70 })
    const high = await awardLearningActivity({ userId: user.id, activity: "quiz_score", sourceId: `quiz-${stamp}`, scorePercent: 80 })
    assert(low.reason === "threshold" && high.awarded, "quiz score uses the configured threshold")

    reconciled = await reconcileElixir(user.id)
    assert(reconciled.consistent, "ledger matches balance after learning rewards")
    const price = reconciled.balance
    await prisma.learningResource.create({
      data: { slug: `elixir-test-${stamp}`, kind: "notes", title: "Test notes", elixirPrice: price, published: true },
    })
    const [left, right] = await Promise.all([
      spendOnResource(user.id, `elixir-test-${stamp}`),
      spendOnResource(user.id, `elixir-test-${stamp}`),
    ])
    const outcomes = [left.error, right.error]
    assert(outcomes.filter((error) => error === null).length === 1, `one purchase must succeed, got ${outcomes.join(",")}`)
    assert(outcomes.some((error) => error === "insufficient" || error === "owned"), "the other purchase must not double-spend")
    reconciled = await reconcileElixir(user.id)
    assert(reconciled.balance === 0 && reconciled.consistent, `balance after spend ${reconciled.balance}`)
    const entitlements = await prisma.learningResourceEntitlement.count({ where: { userId: user.id } })
    assert(entitlements === 1, "one entitlement")

    const refund = await refundVerifiedPayment(second.payment.id, user.id)
    assert(refund && refund.payment.status === "refunded", "succeeded payment can be refunded")
    assert(refund.reversal?.unrecovered === 50, `spent reward stays unrecovered, got ${refund.reversal?.unrecovered}`)
    assert((await reconcileElixir(user.id)).balance === 0, "refund does not create a negative balance")
    const refundAgain = await refundVerifiedPayment(second.payment.id, user.id)
    assert(refundAgain?.duplicate, "refund retry does not add another reversal")
    const reversals = await prisma.elixirTransaction.count({ where: { userId: user.id, type: "reversal" } })
    assert(reversals === 1, "reversal history is kept once")

    const credit = await adjustElixir({ userId: user.id, amount: 5, reason: "Test correction for ledger", actorId: user.id, idempotencyKey: crypto.randomUUID() })
    assert(credit.transaction.amount === 5, "admin credit applies")
    let rejected = false
    try {
      await adjustElixir({ userId: user.id, amount: -100, reason: "This would go negative", actorId: user.id, idempotencyKey: crypto.randomUUID() })
    } catch (error) {
      rejected = error instanceof InsufficientElixirError
    }
    assert(rejected, "adjustment cannot drive the balance negative")
    assert((await reconcileElixir(user.id)).balance === 5, "failed adjustment leaves the balance")
    console.log("elixir ledger ok")
  } finally {
    await prisma.elixirRewardRule.updateMany({
      where: { activity: { in: ["lesson_complete", "quiz_score"] } },
      data: { enabled: false, amount: 0, cooldownSeconds: 0, quizScorePercent: null },
    })
    await prisma.learningResource.deleteMany({ where: { slug: { startsWith: "elixir-test-" } } })
    await prisma.user.deleteMany({ where: { email: { in: [email, studentEmail] } } })
  }

  const health = await fetch(`${API_BASE}/health`).then((response) => response.ok).catch(() => false)
  if (!health) {
    throw new Error(`API is not reachable at ${API_BASE}. Start the local API with npm run dev:api before authorization checks.`)
  }

  const student = new Map<string, string>()
  const csrf = await api(student, "/auth/csrf")
  assert(csrf.response.ok, "csrf")
  const signup = await api(student, "/auth/signup", {
    method: "POST",
    csrf: true,
    body: { name: "Elixir Student", email: studentEmail, password, consent: TEST_CONSENT },
  })
  assert(signup.response.status === 201, `student signup ${signup.response.status} ${JSON.stringify(signup.data)}`)
  const forbidden = await api(student, "/admin/elixir/rules")
  assert(forbidden.response.status === 403, `student must not read Elixir rules, got ${forbidden.response.status}`)
  const forbiddenPay = await api(student, "/admin/payments", {
    method: "POST",
    csrf: true,
    body: { userId: signup.data.user.id, externalRef: `student-${stamp}`, eligibleNetRupees: 100000, status: "succeeded" },
  })
  assert(forbiddenPay.response.status === 403, `student must not record a payment, got ${forbiddenPay.response.status}`)
  const anon = await api(new Map(), "/admin/users")
  assert(anon.response.status === 401, `anonymous admin list ${anon.response.status}`)

  const adminRole = await ensureRole(RoleName.ADMIN)
  await prisma.userRole.deleteMany({ where: { userId: signup.data.user.id } })
  await prisma.userRole.create({ data: { userId: signup.data.user.id, roleId: adminRole.id } })
  const allowed = await api(student, "/admin/elixir/rules")
  assert(allowed.response.ok, `superadmin can read rules ${allowed.response.status} ${JSON.stringify(allowed.data)}`)
  const report = await api(student, "/admin/reports")
  assert(report.response.ok && typeof report.data.data.users === "number", "superadmin report")
  const aiAdmin = await api(student, "/admin/ai")
  assert(aiAdmin.response.ok && typeof aiAdmin.data.data.keyPresent === "boolean" && !JSON.stringify(aiAdmin.data).includes("sk-"), "AI diagnostics omit secrets")

  const course = await prisma.course.findUnique({ where: { slug: "data-analytics" }, select: { id: true } })
  if (course) {
    await prisma.userRole.deleteMany({ where: { userId: signup.data.user.id } })
    const studentRole = await ensureRole(RoleName.STUDENT)
    await prisma.userRole.create({ data: { userId: signup.data.user.id, roleId: studentRole.id } })
    const blocked = await api(student, "/lms/ai/status?courseSlug=data-analytics&lessonId=l1")
    assert(blocked.response.ok, `AI status ${blocked.response.status}`)
    assert(blocked.data.data.access === "enrolment_required", `unenrolled AI access ${blocked.data.data.access}`)
    assert(blocked.data.data.available === false, "unenrolled AI is not available")
    const enrol = await api(student, "/lms/enrollments", { method: "POST", csrf: true, body: { consent: TEST_CONSENT, courseSlug: "data-analytics" } })
    assert(enrol.response.status === 201 || enrol.response.ok, `enrol ${enrol.response.status} ${JSON.stringify(enrol.data)}`)
    const opened = await api(student, "/lms/ai/status?courseSlug=data-analytics&lessonId=l1")
    assert(opened.data.data.access === "ok", `enrolled first lesson access ${opened.data.data.access}`)
    const locked = await api(student, "/lms/ai/status?courseSlug=data-analytics&lessonId=l2")
    assert(locked.data.data.access === "locked", `second lesson stays locked ${locked.data.data.access}`)
    const ask = await api(student, "/lms/ai/ask", {
      method: "POST",
      csrf: true,
      body: { courseSlug: "data-analytics", lessonSlug: "l1", mode: "ask", question: "What is net revenue?" },
    })
    if (opened.data.data.configured) {
      assert(ask.response.ok, `configured enrolled ask failed ${ask.response.status} ${JSON.stringify(ask.data)}`)
      assert(typeof ask.data.data.answer === "string" && ask.data.data.answer.length > 0, "enrolled ask returned an answer")
    } else {
      assert(ask.response.status === 503 && ask.data.code === "not_configured", `unconfigured enrolled ask ${ask.response.status} ${ask.data?.code}`)
    }
    const stranger = new Map<string, string>()
    const strangerStatus = await api(stranger, "/lms/ai/status")
    assert(strangerStatus.response.status === 401, "AI status requires auth")
  }
  await prisma.user.deleteMany({ where: { email: studentEmail } })
  console.log("elixir authorization and AI access ok")
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
