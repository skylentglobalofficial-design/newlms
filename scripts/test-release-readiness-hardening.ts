import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { buildLessonState } from "../server/src/lib/lms.ts"
import { courseIsEnrolable } from "../server/src/lib/course-publication.ts"
import { productionEnvWarnings, redactSecrets } from "../server/src/lib/env.ts"
import { resolveRequestId } from "../server/src/lib/security-middleware.ts"
import { isRevaModelConfigured } from "../server/src/routes/skylent/reva.ts"
import {
  buildPracticeWorkspaceDraftKey,
  buildProjectReflectionDraftKey,
  clearLocalDraft,
  readLocalDraft,
  reconcilePracticeTextDraft,
  reconcileProjectReflectionDraft,
  writeLocalDraft,
  type DraftStorageLike,
  type PracticeWorkspaceDraft,
  type ProjectReflectionDraft,
} from "../src/lib/draft-storage.ts"

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function createMemoryStorage(): DraftStorageLike {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: (key) => {
      map.delete(key)
    },
  }
}

console.log("1. Graded assignments count as submitted for lesson state and completion")
const assignmentNode = {
  id: "node-assign-1",
  moduleId: "mod-1",
  sourceId: "l6",
  title: "Written Case Assignment",
  nodeType: "ASSIGNMENT",
  order: 6,
  duration: "45 min",
  summary: null,
  referenceUrl: null,
  maxAttempts: null,
  passingScore: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Parameters<typeof buildLessonState>[0]

const draftState = buildLessonState(assignmentNode, undefined, [], { status: "draft" }, { locked: false })
assert(draftState.assignmentSubmitted === false, "draft assignment must not count as submitted")

const submittedState = buildLessonState(assignmentNode, undefined, [], { status: "submitted" }, { locked: false })
assert(submittedState.assignmentSubmitted === true, "submitted assignment must count as submitted")

const gradedState = buildLessonState(assignmentNode, undefined, [], { status: "graded" }, { locked: false })
assert(gradedState.assignmentSubmitted === true, "graded assignment must count as submitted so faculty grading does not regress completion")

const lmsRouteSrc = readFileSync(resolve(process.cwd(), "server/src/routes/lms.ts"), "utf8")
assert(
  lmsRouteSrc.includes('submission?.status !== "submitted" && submission?.status !== "graded"'),
  "lms.ts lesson completion guard must allow both submitted and graded assignments",
)

assert(
  courseIsEnrolable({ slug: "data-analytics", publicationStatus: "PUBLISHED" as never, authoredInApp: false }) === true,
  "published authored course must be enrolable",
)
assert(
  courseIsEnrolable({ slug: "data-analytics", publicationStatus: "DRAFT" as never, authoredInApp: false }) === false,
  "draft course must not be enrolable",
)
assert(
  courseIsEnrolable({ slug: "custom-course", publicationStatus: "PUBLISHED" as never, authoredInApp: true }) === true,
  "published authoredInApp course must be enrolable",
)

console.log("2. Express 4 async route handlers in hardened modules have try/catch guards")
const hardenedRoutes = [
  "server/src/routes/skylent/enquiries.ts",
  "server/src/routes/skylent/reva.ts",
  "server/src/routes/elixir.ts",
  "server/src/routes/college.ts",
  "server/src/routes/lms-materials.ts",
  "server/src/routes/admin-platform.ts",
  "server/src/routes/admin-employers.ts",
  "server/src/routes/admin.ts",
  "server/src/routes/admin-curriculum.ts",
  "server/src/routes/faculty.ts",
  "server/src/routes/career/applications.ts",
  "server/src/routes/career/interviews.ts",
  "server/src/routes/career/support.ts",
]

for (const relPath of hardenedRoutes) {
  const source = readFileSync(resolve(process.cwd(), relPath), "utf8")
  const asyncRouteRegistrations = (source.match(/Router\.(?:get|post|patch|put|delete)\s*\([^;\n]*async\s*\(/g) ?? []).length
  const catchBlocks = (source.match(/\bcatch\s*\(/g) ?? []).length
  assert(
    asyncRouteRegistrations > 0 && catchBlocks >= asyncRouteRegistrations,
    `${relPath} has ${asyncRouteRegistrations} async route handlers but only ${catchBlocks} catch blocks`,
  )
}

console.log("3. Liveness/readiness separation and X-Request-Id correlation headers")
const healthSrc = readFileSync(resolve(process.cwd(), "server/src/routes/health.ts"), "utf8")
assert(healthSrc.includes('router.get("/live"'), "health.ts must expose GET /api/v1/health/live for liveness")
assert(healthSrc.includes('router.get("/ready"'), "health.ts must expose GET /api/v1/health/ready for readiness")
assert(healthSrc.includes('router.get("/"'), "health.ts must preserve GET /api/v1/health")

const generatedId = resolveRequestId(undefined)
assert(/^[0-9a-f-]{36}$/i.test(generatedId), `expected UUID requestId, got ${generatedId}`)
assert(resolveRequestId("req-abc_123.45") === "req-abc_123.45", "valid client X-Request-Id must be preserved")
assert(resolveRequestId("bad id with spaces / injection") !== "bad id with spaces / injection", "unsafe X-Request-Id must be replaced")

const indexSrc = readFileSync(resolve(process.cwd(), "server/src/index.ts"), "utf8")
assert(indexSrc.includes("requestId") && indexSrc.includes("redactSecrets"), "server/src/index.ts error handler must log requestId and redact secrets")
assert(!redactSecrets("postgresql://postgres.ref:mySecretPass@pooler.supabase.com:5432/postgres").includes("mySecretPass"), "redactSecrets must strip DB password")

console.log("4. Site assistant status endpoint and pre-input availability check")
assert(isRevaModelConfigured({ NODE_ENV: "production" }).available === false, "unset SKYLENT_AI_API_KEY must report unavailable")
assert(
  isRevaModelConfigured({ NODE_ENV: "production", SKYLENT_AI_PROVIDER: "off", SKYLENT_AI_API_KEY: "sk-test" }).available === false,
  "SKYLENT_AI_PROVIDER=off must report unavailable",
)
assert(
  isRevaModelConfigured({ NODE_ENV: "production", SKYLENT_AI_PROVIDER: "openai-compatible", SKYLENT_AI_API_KEY: "sk-test" }).available === true,
  "configured SKYLENT_AI_API_KEY must report available",
)
const siteAssistantSrc = readFileSync(resolve(process.cwd(), "src/components/skylent/SiteAssistant.tsx"), "utf8")
assert(
  siteAssistantSrc.includes("${API_ROOT}/reva/status") && siteAssistantSrc.includes("checkSiteAssistantAvailable"),
  "SiteAssistant.tsx must check /reva/status when opened so visitors do not type into a dead-end box",
)

console.log("5. Learner writing local draft persistence and recovery")
const mem = createMemoryStorage()
const projectKey = buildProjectReflectionDraftKey("harbor-desk-case")
const draftPayload: ProjectReflectionDraft = {
  finding: "Onboarding handoff delays enterprise activation by 9 days.",
  whyItMatters: "42% of churned accounts stalled before first ticket routing.",
  recommendation: "Ship guided workspace setup before custom webhook rules.",
  savedAt: "2026-10-29T12:00:00.000Z",
}
assert(writeLocalDraft(projectKey, draftPayload, mem), "writeLocalDraft must store project draft")
const readBack = readLocalDraft<ProjectReflectionDraft>(projectKey, mem)
assert(readBack?.finding === draftPayload.finding, "readLocalDraft must round-trip project draft")

const reconciledLocal = reconcileProjectReflectionDraft(
  { finding: "", whyItMatters: "", recommendation: "", updatedAt: null },
  readBack,
)
assert(reconciledLocal.restoredFromLocal === true, "unsaved local project draft must be restored when server is empty")
assert(reconciledLocal.recommendation === draftPayload.recommendation, "restored draft must preserve learner recommendation")

const reconciledNewerServer = reconcileProjectReflectionDraft(
  {
    finding: "Server saved finding",
    whyItMatters: "Server saved why",
    recommendation: "Server saved rec",
    updatedAt: "2026-10-29T13:00:00.000Z",
  },
  readBack,
)
assert(reconciledNewerServer.restoredFromLocal === false, "newer server save must take precedence over older local draft")
assert(reconciledNewerServer.finding === "Server saved finding", "newer server text must be used")

clearLocalDraft(projectKey, mem)
assert(readLocalDraft(projectKey, mem) === null, "clearLocalDraft must remove stored draft")

const practiceKey = buildPracticeWorkspaceDraftKey("product-management", "l2")
writeLocalDraft<PracticeWorkspaceDraft>(practiceKey, { body: "My unsaved PM case notes", savedAt: "2026-10-29T12:05:00.000Z" }, mem)
const reconciledPractice = reconcilePracticeTextDraft("", readLocalDraft<PracticeWorkspaceDraft>(practiceKey, mem))
assert(reconciledPractice.restoredFromLocal === true && reconciledPractice.body === "My unsaved PM case notes", "practice draft must recover unsaved notes")

console.log("6. Production environment warnings validate SKYLENT_SEPTEMBER_COMPAT")
const warnInvalid = productionEnvWarnings({
  NODE_ENV: "production",
  FRONTEND_URL: "https://skylent.live",
  SKYLENT_SEPTEMBER_COMPAT: "yes",
})
assert(
  warnInvalid.some((w) => w.includes("SKYLENT_SEPTEMBER_COMPAT")),
  "invalid SKYLENT_SEPTEMBER_COMPAT must produce a production warning",
)

console.log("7. Runbook and .env.example document startup migration behavior and compat flags")
const prodDoc = readFileSync(resolve(process.cwd(), "docs/PRODUCTION.md"), "utf8")
const envExample = readFileSync(resolve(process.cwd(), ".env.example"), "utf8")
assert(prodDoc.includes("SKYLENT_SEPTEMBER_COMPAT"), "docs/PRODUCTION.md must document SKYLENT_SEPTEMBER_COMPAT")
assert(prodDoc.includes("20261028161000_lesson_material_compat"), "docs/PRODUCTION.md must list all 11 October 2026 migrations")
assert(prodDoc.includes("/api/v1/health/live"), "docs/PRODUCTION.md must document liveness endpoint")
assert(envExample.includes("SKYLENT_SEPTEMBER_COMPAT"), ".env.example must document SKYLENT_SEPTEMBER_COMPAT")
assert(envExample.includes("SKYLENT_RELEASE_SHA"), ".env.example must document SKYLENT_RELEASE_SHA")

console.log("release-readiness-hardening ok")
