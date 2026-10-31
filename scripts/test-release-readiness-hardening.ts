process.env.DATABASE_URL ||= "postgresql://unused:unused@127.0.0.1:1/unused"
process.env.DIRECT_URL ||= process.env.DATABASE_URL
process.env.SESSION_SECRET ||= "test-only-session-secret-0123456789abcdef"
process.env.FRONTEND_URL ||= "http://127.0.0.1:8443"
process.env.NODE_ENV ||= "test"

import { readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import type { AddressInfo } from "node:net"
import express from "express"
import { Prisma } from "@prisma/client"
import {
  buildAssignmentDraftKey,
  buildPracticeWorkspaceDraftKey,
  buildProjectReflectionDraftKey,
  clearLocalDraft,
  readLocalDraft,
  reconcileAssignmentDraft,
  reconcilePracticeTextDraft,
  reconcileProjectReflectionDraft,
  writeLocalDraft,
  type AssignmentDraft,
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

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name)
    if (ent.isDirectory()) walkTsFiles(p, out)
    else if (ent.name.endsWith(".ts")) out.push(p)
  }
  return out
}

async function main() {
  const { prisma } = await import("../server/src/lib/prisma.ts")
  const { resolveSession } = await import("../server/src/lib/auth.ts")
  const { clearSchemaCapabilityCache } = await import("../server/src/lib/schema-capabilities.ts")
  const { buildLessonState } = await import("../server/src/lib/lms.ts")
  const { courseIsEnrolable } = await import("../server/src/lib/course-publication.ts")
  const { productionEnvWarnings, redactSecrets } = await import("../server/src/lib/env.ts")
  const { resolveRequestId } = await import("../server/src/lib/security-middleware.ts")
  const healthRouter = (await import("../server/src/routes/health.ts")).default
  const { authRouter } = await import("../server/src/routes/auth.ts")
  const { isRevaModelConfigured } = await import("../server/src/routes/skylent/reva.ts")

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

  console.log("2. All 27 backend route modules have top-level imports, try/catch guards, 503 schema/DB guards, and zero raw error logs")
  const allRouteFiles = walkTsFiles(resolve(process.cwd(), "server/src/routes"))
  assert(allRouteFiles.length >= 27, `expected at least 27 route modules in server/src/routes, found ${allRouteFiles.length}`)

  for (const absPath of allRouteFiles) {
    const source = readFileSync(absPath, "utf8")
    const routerIdx = source.indexOf("Router()")
    const lastImportIdx = source.lastIndexOf("\nimport ")
    assert(
      routerIdx === -1 || lastImportIdx < routerIdx,
      `${absPath} contains a mid-file import after Router()`,
    )
    assert(
      !/console\.(?:error|warn)\([^\n]*,\s*(?:error|err)\s*\)/.test(source),
      `${absPath} logs raw error object in console.error/warn without redaction`,
    )
  }

  const hardenedRoutes = [
    "server/src/routes/skylent/enquiries.ts",
    "server/src/routes/skylent/reva.ts",
    "server/src/routes/skylent/certificates.ts",
    "server/src/routes/elixir.ts",
    "server/src/routes/college.ts",
    "server/src/routes/lms-materials.ts",
    "server/src/routes/lms.ts",
    "server/src/routes/admin-platform.ts",
    "server/src/routes/admin-employers.ts",
    "server/src/routes/admin-media.ts",
    "server/src/routes/admin.ts",
    "server/src/routes/admin-curriculum.ts",
    "server/src/routes/faculty.ts",
    "server/src/routes/organisation.ts",
    "server/src/routes/events.ts",
    "server/src/routes/labs.ts",
    "server/src/routes/projects.ts",
    "server/src/routes/practice-admin.ts",
    "server/src/routes/practice.ts",
    "server/src/routes/career-rise.ts",
    "server/src/routes/career/applications.ts",
    "server/src/routes/career/employer-jobs.ts",
    "server/src/routes/career/interviews.ts",
    "server/src/routes/career/jobs.ts",
    "server/src/routes/career/practice.ts",
    "server/src/routes/career/profile.ts",
    "server/src/routes/career/projects.ts",
    "server/src/routes/career/questions.ts",
    "server/src/routes/career/saved-jobs.ts",
    "server/src/routes/career/support.ts",
  ]

  for (const relPath of hardenedRoutes) {
    const source = readFileSync(resolve(process.cwd(), relPath), "utf8")
    assert(
      source.includes("isMissingSchemaError") && source.includes("isDatabaseUnavailableError"),
      `${relPath} must guard against missing schema and unavailable database errors`,
    )
  }

  console.log("3. Fail-safe session resolution never bypasses mustChangePassword and supports September schema fallback")
  const origQueryRaw = prisma.$queryRaw
  const origFindUnique = prisma.session.findUnique
  try {
    clearSchemaCapabilityCache()
    ;(prisma as unknown as { $queryRaw: () => Promise<unknown> }).$queryRaw = async () => {
      throw new Error("Transient capability probe timeout")
    }
    const selectCalls: boolean[] = []
    ;(prisma.session as unknown as { findUnique: (args: { include: { user: { select: Record<string, unknown> } } }) => Promise<unknown> }).findUnique =
      async (args) => {
        const requestedMustChange = Boolean(args.include?.user?.select?.mustChangePassword)
        selectCalls.push(requestedMustChange)
        return {
          id: "sess-oct",
          expiresAt: new Date(Date.now() + 60_000),
          user: {
            id: "u-oct",
            email: "admin@skylent.live",
            displayName: "Admin",
            mustChangePassword: true,
            roles: [{ role: { id: "r-1", name: "ADMIN" } }],
          },
        }
      }
    const octResolved = await resolveSession("oct-token")
    assert(selectCalls[0] === true, "resolveSession must request mustChangePassword=true by default when capability probe fails")
    assert(octResolved?.user.mustChangePassword === true, "resolveSession must preserve mustChangePassword=true so forced password reset is never bypassed")

    clearSchemaCapabilityCache()
    const sepCalls: boolean[] = []
    ;(prisma.session as unknown as { findUnique: (args: { include: { user: { select: Record<string, unknown> } } }) => Promise<unknown> }).findUnique =
      async (args) => {
        const requestedMustChange = Boolean(args.include?.user?.select?.mustChangePassword)
        sepCalls.push(requestedMustChange)
        if (requestedMustChange) {
          throw new Prisma.PrismaClientKnownRequestError("Column mustChangePassword does not exist", {
            code: "P2022",
            clientVersion: "6.19.3",
          })
        }
        return {
          id: "sess-sep",
          expiresAt: new Date(Date.now() + 60_000),
          user: {
            id: "u-sep",
            email: "learner@skylent.live",
            displayName: "Learner",
            roles: [{ role: { id: "r-2", name: "STUDENT" } }],
          },
        }
      }
    const sepResolved = await resolveSession("sep-token")
    assert(sepCalls.length === 2 && sepCalls[0] === true && sepCalls[1] === false, "resolveSession must retry without mustChangePassword on P2022 missing-column error")
    assert(sepResolved?.user.id === "u-sep" && sepResolved.user.mustChangePassword === false, "September schema session must resolve cleanly on retry")
  } finally {
    ;(prisma as unknown as { $queryRaw: unknown }).$queryRaw = origQueryRaw
    ;(prisma.session as unknown as { findUnique: unknown }).findUnique = origFindUnique
    clearSchemaCapabilityCache()
  }

  console.log("4. Liveness (/health/live) vs Readiness (/health and /health/ready) HTTP behavior and X-Request-Id")
  const generatedId = resolveRequestId(undefined)
  assert(/^[0-9a-f-]{36}$/i.test(generatedId), `expected UUID requestId, got ${generatedId}`)
  assert(resolveRequestId("req-abc_123.45") === "req-abc_123.45", "valid client X-Request-Id must be preserved")
  assert(resolveRequestId("bad id with spaces / injection") !== "bad id with spaces / injection", "unsafe X-Request-Id must be replaced")

  const indexSrc = readFileSync(resolve(process.cwd(), "server/src/index.ts"), "utf8")
  assert(indexSrc.includes("requestId") && indexSrc.includes("redactSecrets"), "server/src/index.ts error handler must log requestId and redact secrets")
  assert(
    indexSrc.includes("isMissingSchemaError(error) || isDatabaseUnavailableError(error)"),
    "server/src/index.ts error handler must map missing-schema and database-unavailable errors to 503",
  )
  assert(!redactSecrets("postgresql://postgres.ref:mySecretPass@pooler.supabase.com:5432/postgres").includes("mySecretPass"), "redactSecrets must strip DB password")

  const origHealthQuery = prisma.$queryRaw
  const app = express()
  app.use("/api/v1/health", healthRouter)
  app.use("/api/v1/auth", authRouter)
  const server = app.listen(0, "127.0.0.1")
  await new Promise<void>((r) => server.once("listening", r))
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  try {
    ;(prisma as unknown as { $queryRaw: (strings: TemplateStringsArray) => Promise<unknown> }).$queryRaw = async (strings) => {
      const sql = strings.join(" ")
      if (sql.includes("_prisma_migrations")) {
        return [{ migration_name: "20260905120000_init", finished_at: new Date(), rolled_back_at: null }]
      }
      return [{ "?column?": 1 }]
    }
    const liveRes = await fetch(`${baseUrl}/api/v1/health/live`)
    const liveBody = (await liveRes.json()) as { status?: string; live?: boolean }
    assert(liveRes.status === 200 && liveBody.status === "ok" && liveBody.live === true, "GET /api/v1/health/live must return 200 while process is up")

    const readyRes = await fetch(`${baseUrl}/api/v1/health/ready`)
    const readyBody = (await readyRes.json()) as { status?: string; migrations?: string }
    assert(readyRes.status === 503 && readyBody.migrations === "pending", "GET /api/v1/health/ready must return 503 while migrations are pending")

    const rootHealthRes = await fetch(`${baseUrl}/api/v1/health`)
    const rootHealthBody = (await rootHealthRes.json()) as { status?: string; migrations?: string }
    assert(rootHealthRes.status === 503 && rootHealthBody.migrations === "pending", "GET /api/v1/health must remain 503 while migrations are pending")

    console.log("5. Google OAuth pre-check status endpoint and browser redirect fallback")
    const savedClientId = process.env.GOOGLE_CLIENT_ID
    const savedClientSecret = process.env.GOOGLE_CLIENT_SECRET
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET
    try {
      const googleStatusRes = await fetch(`${baseUrl}/api/v1/auth/google/status`)
      const googleStatusBody = (await googleStatusRes.json()) as { data?: { available?: boolean; configured?: boolean } }
      assert(
        googleStatusRes.status === 200 && googleStatusBody.data?.available === false && googleStatusBody.data?.configured === false,
        "GET /api/v1/auth/google/status must report available=false when Google OAuth is unconfigured",
      )

      const googleApiRes = await fetch(`${baseUrl}/api/v1/auth/google`, {
        headers: { Accept: "application/json" },
        redirect: "manual",
      })
      assert(googleApiRes.status === 503, "API call to GET /api/v1/auth/google must return 503 JSON when unconfigured")

      const googleHtmlRes = await fetch(`${baseUrl}/api/v1/auth/google`, {
        headers: { Accept: "text/html,application/xhtml+xml" },
        redirect: "manual",
      })
      const redirectLocation = googleHtmlRes.headers.get("location") ?? ""
      assert(
        googleHtmlRes.status === 302 && redirectLocation.includes("/login?error=oauth_not_configured"),
        `Browser navigation to GET /api/v1/auth/google must redirect cleanly to /login?error=oauth_not_configured, got status=${googleHtmlRes.status} location=${redirectLocation}`,
      )
    } finally {
      if (savedClientId !== undefined) process.env.GOOGLE_CLIENT_ID = savedClientId
      if (savedClientSecret !== undefined) process.env.GOOGLE_CLIENT_SECRET = savedClientSecret
    }
  } finally {
    ;(prisma as unknown as { $queryRaw: unknown }).$queryRaw = origHealthQuery
    await new Promise<void>((r) => server.close(() => r()))
  }

  const loginPageSrc = readFileSync(resolve(process.cwd(), "src/pages/LoginPage.tsx"), "utf8")
  assert(
    loginPageSrc.includes("checkGoogleOAuthAvailable") && loginPageSrc.includes("oauth_not_configured"),
    "LoginPage.tsx must pre-check Google OAuth availability and handle oauth_not_configured error state",
  )

  const homePageSrc = readFileSync(resolve(process.cwd(), "src/pages/HomePage.tsx"), "utf8")
  const repolishSrc = readFileSync(resolve(process.cwd(), "src/pages/home/Repolish.tsx"), "utf8")
  assert(
    homePageSrc.includes("onRetry={() => void catalog.reload()}") && repolishSrc.includes("onRetry?: () => void"),
    "HomePage.tsx and Repolish.tsx must wire a retry action when programme availability cannot be confirmed",
  )

  console.log("6. Site assistant status endpoint and pre-input availability check")
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
  assert(
    siteAssistantSrc.includes('siteOff && (panelMode === "chat" || finderDone)'),
    "SiteAssistant.tsx must not render the enquiry form over Step 1 of the guided questionnaire before finderDone",
  )

  console.log("7. Learner writing local draft persistence (Projects, Practice, and Course Assignments) and race-condition guards")
  const mem = createMemoryStorage()
  const projectKey = buildProjectReflectionDraftKey("harbor-desk-case", "proj-1")
  const draftPayload: ProjectReflectionDraft = {
    projectId: "proj-1",
    baseUpdatedAt: "2026-10-29T11:00:00.000Z",
    finding: "Onboarding handoff delays enterprise activation by 9 days.",
    whyItMatters: "42% of churned accounts stalled before first ticket routing.",
    recommendation: "Ship guided workspace setup before custom webhook rules.",
    savedAt: "2026-10-29T12:00:00.000Z",
  }
  assert(writeLocalDraft(projectKey, draftPayload, mem), "writeLocalDraft must store project draft")
  const readBack = readLocalDraft<ProjectReflectionDraft>(projectKey, mem)
  assert(readBack?.finding === draftPayload.finding, "readLocalDraft must round-trip project draft")

  const reconciledLocal = reconcileProjectReflectionDraft(
    { finding: "", whyItMatters: "", recommendation: "", updatedAt: "2026-10-29T11:00:00.000Z" },
    readBack,
    "proj-1",
  )
  assert(reconciledLocal.restoredFromLocal === true, "unsaved local project draft must be restored when baseUpdatedAt matches")
  assert(reconciledLocal.recommendation === draftPayload.recommendation, "restored draft must preserve learner recommendation")

  const mismatchedProject = reconcileProjectReflectionDraft(
    { finding: "Other user finding", whyItMatters: "", recommendation: "", updatedAt: null },
    readBack,
    "proj-different-user",
  )
  assert(mismatchedProject.restoredFromLocal === false && mismatchedProject.finding === "Other user finding", "draft from another projectId must never leak across users")

  const staleBaseSnapshot = reconcileProjectReflectionDraft(
    {
      finding: "Server saved finding",
      whyItMatters: "Server saved why",
      recommendation: "Server saved rec",
      updatedAt: "2026-10-29T11:30:00.000Z",
    },
    readBack,
    "proj-1",
  )
  assert(staleBaseSnapshot.restoredFromLocal === false, "changed server updatedAt since baseUpdatedAt must take precedence over stale local draft")
  assert(staleBaseSnapshot.finding === "Server saved finding", "newer server text must be used")

  clearLocalDraft(projectKey, mem)
  assert(readLocalDraft(projectKey, mem) === null, "clearLocalDraft must remove stored draft")

  const practiceKey = buildPracticeWorkspaceDraftKey("product-management", "l2")
  writeLocalDraft<PracticeWorkspaceDraft>(
    practiceKey,
    { baseServerBody: "v1", body: "My unsaved PM case notes", savedAt: "2026-10-29T12:05:00.000Z" },
    mem,
  )
  const reconciledPractice = reconcilePracticeTextDraft("v1", readLocalDraft<PracticeWorkspaceDraft>(practiceKey, mem))
  assert(reconciledPractice.restoredFromLocal === true && reconciledPractice.body === "My unsaved PM case notes", "practice draft must recover unsaved notes when baseServerBody matches")

  const stalePractice = reconcilePracticeTextDraft("v2-saved-elsewhere", readLocalDraft<PracticeWorkspaceDraft>(practiceKey, mem))
  assert(stalePractice.restoredFromLocal === false && stalePractice.body === "v2-saved-elsewhere", "practice draft must not overwrite a newer server body when baseServerBody differs")

  const assignKey = buildAssignmentDraftKey("data-analytics", "l6")
  writeLocalDraft<AssignmentDraft>(
    assignKey,
    {
      baseServerText: "Initial server draft",
      responseText: "Updated local case memo with SQL cohort breakdown",
      savedAt: "2026-10-29T12:10:00.000Z",
    },
    mem,
  )
  const reconciledAssign = reconcileAssignmentDraft(
    "Initial server draft",
    "in_progress",
    readLocalDraft<AssignmentDraft>(assignKey, mem),
  )
  assert(
    reconciledAssign.restoredFromLocal === true &&
      reconciledAssign.responseText === "Updated local case memo with SQL cohort breakdown",
    "reconcileAssignmentDraft must restore unsaved local assignment text when baseServerText matches",
  )

  const offlineAssign = reconcileAssignmentDraft(
    null,
    "in_progress",
    readLocalDraft<AssignmentDraft>(assignKey, mem),
  )
  assert(
    offlineAssign.restoredFromLocal === true &&
      offlineAssign.responseText === "Updated local case memo with SQL cohort breakdown",
    "reconcileAssignmentDraft must preserve unsaved local assignment text when server fetch fails transiently (serverText=null)",
  )

  const gradedAssign = reconcileAssignmentDraft(
    "Final submitted text",
    "graded",
    readLocalDraft<AssignmentDraft>(assignKey, mem),
  )
  assert(
    gradedAssign.restoredFromLocal === false && gradedAssign.responseText === "Final submitted text",
    "reconcileAssignmentDraft must never overwrite a submitted or graded assignment with a local draft",
  )

  const learnPageSrc = readFileSync(resolve(process.cwd(), "src/pages/LearnPage.tsx"), "utf8")
  assert(
    learnPageSrc.includes("buildAssignmentDraftKey") && learnPageSrc.includes("reconcileAssignmentDraft"),
    "LearnPage.tsx must persist and reconcile local assignment drafts across refreshes and transient errors",
  )

  console.log("8. Production environment warnings and runbook documentation")
  const warnInvalid = productionEnvWarnings({
    NODE_ENV: "production",
    FRONTEND_URL: "https://skylent.live",
    SKYLENT_SEPTEMBER_COMPAT: "yes",
  })
  assert(
    warnInvalid.some((w) => w.includes("SKYLENT_SEPTEMBER_COMPAT")),
    "invalid SKYLENT_SEPTEMBER_COMPAT must produce a production warning",
  )

  const prodDoc = readFileSync(resolve(process.cwd(), "docs/PRODUCTION.md"), "utf8")
  const envExample = readFileSync(resolve(process.cwd(), ".env.example"), "utf8")
  assert(prodDoc.includes("SKYLENT_SEPTEMBER_COMPAT"), "docs/PRODUCTION.md must document SKYLENT_SEPTEMBER_COMPAT")
  assert(prodDoc.includes("20261028161000_lesson_material_compat"), "docs/PRODUCTION.md must list all 11 October 2026 migrations")
  assert(prodDoc.includes("/api/v1/health/live"), "docs/PRODUCTION.md must document liveness endpoint")
  assert(envExample.includes("SKYLENT_SEPTEMBER_COMPAT"), ".env.example must document SKYLENT_SEPTEMBER_COMPAT")
  assert(envExample.includes("SKYLENT_RELEASE_SHA"), ".env.example must document SKYLENT_RELEASE_SHA")


  console.log("9. Competitive moat modules: Certificate issuer transparency, Boardroom Cold Call, Socratic quick prompts, and Career OS Skill-Gap Match")
  const { buildCertificateEvidenceSummary, SKYLENT_CREDENTIAL_ISSUER, SKYLENT_CREDENTIAL_STANDARD } = await import("../server/src/routes/skylent/certificates.ts")
  const certSummary = buildCertificateEvidenceSummary({
    code: "SKL-2026-DA-1234ABCD",
    learnerName: "Aarav Sharma",
    courseTitle: "Data Analytics",
    issuedAt: new Date("2026-10-30T00:00:00.000Z"),
  })
  assert(certSummary.issuer === SKYLENT_CREDENTIAL_ISSUER && certSummary.credentialStandard === SKYLENT_CREDENTIAL_STANDARD, "certificate verification summary must expose explicit issuer and credential standard")

  const { computeJobSkillMatch } = await import("../server/src/lib/career/serializers.ts")
  const matchResult = computeJobSkillMatch(["SQL", "Python", "Cohort Analysis", "Product Strategy"], ["sql", "Cohort Analysis", "Excel"])
  assert(
    matchResult.matchScore === 50 &&
      matchResult.matchedSkills.length === 2 &&
      matchResult.missingSkills.length === 2 &&
      matchResult.matchedSkills.includes("SQL") &&
      matchResult.missingSkills.includes("Python"),
    `computeJobSkillMatch must calculate accurate skill match score and missing skills, got ${JSON.stringify(matchResult)}`,
  )

  const eduSrc = readFileSync(resolve(process.cwd(), "src/pages/EducationPage.tsx"), "utf8")
  const degHookSrc = readFileSync(resolve(process.cwd(), "src/hooks/useDegreeCatalogue.ts"), "utf8")
  assert(eduSrc.includes("onClick={reload}") && degHookSrc.includes("reload"), "EducationPage.tsx and useDegreeCatalogue.ts must support live retry when degree catalogue is unreachable")

  const plSrc = readFileSync(resolve(process.cwd(), "src/components/product/ProductLanguage.tsx"), "utf8")
  const aiSrc = readFileSync(resolve(process.cwd(), "src/components/lms/SkylentAI.tsx"), "utf8")
  assert(plSrc.includes("COLD_CALL_SCENARIOS") && plSrc.includes("BoardroomColdCallCard"), "ProductLanguage.tsx must include Harvard/IIM-style BoardroomColdCallCard checkpoints")
  assert(aiSrc.includes("socraticQuickPromptsFor") && aiSrc.includes("Debug my SQL logic") && aiSrc.includes("Check rubric criteria"), "SkylentAI.tsx must expose context-aware Socratic debug and rubric prompts")


  console.log("10. Zero-to-One Workshop (₹99 -> 99 Elixir Coins 100% Cashback) and Case Study Store flywheel")
  const {
    DEFAULT_WORKSHOP_FEE_RUPEES,
    STARTER_ELIXIR_CASE_STUDIES,
    mergeStarterElixirResources,
    workshopCoinCashbackForRupees,
  } = await import("../server/src/lib/elixir.ts")
  const { workshopRewardMetadata } = await import("../server/src/routes/events.ts")

  assert(DEFAULT_WORKSHOP_FEE_RUPEES === 99, "default workshop fee must be 99 rupees")
  assert(workshopCoinCashbackForRupees(99) === 99, "₹99 workshop must award 99 Elixir Coins (100% 1:1 cashback)")
  assert(workshopCoinCashbackForRupees(199) === 199, "₹199 workshop must award 199 Elixir Coins")
  assert(workshopCoinCashbackForRupees(0) === 0 && workshopCoinCashbackForRupees(-50) === 0, "non-positive workshop fee must award 0 Elixir")

  const rewardMeta = workshopRewardMetadata()
  assert(
    rewardMeta.feeRupees === 99 && rewardMeta.elixirCashback === 99 && rewardMeta.cashbackPercent === 100,
    "workshopRewardMetadata must report 99 rupees -> 99 Elixir (100% cashback)",
  )

  const mergedStore = mergeStarterElixirResources([], new Set(["saas-onboarding-churn-teardown"]))
  assert(mergedStore.length === STARTER_ELIXIR_CASE_STUDIES.length && mergedStore.length >= 4, "starter Case Study Store must provide at least 4 case studies/playbooks on a fresh DB")
  const flagship99 = mergedStore.find((r) => r.slug === "saas-onboarding-churn-teardown")
  assert(
    flagship99?.elixirPrice === 99 && flagship99.owned === true && flagship99.kind === "case_study",
    "99-Elixir flagship case study must be redeemable with a single ₹99 workshop cashback and mark owned=true when entitled",
  )


  console.log("11. C-Suite telemetry: CEO/CFO unit economics, CCRO college cohort summary, and CAO academic Elixir schedule")
  const { computeExecutiveUnitEconomics } = await import("../server/src/routes/admin-platform.ts")
  const { computeCollegeCohortSummary } = await import("../server/src/routes/college.ts")
  const { VERIFIED_ACADEMIC_ELIXIR_SCHEDULE } = await import("../server/src/lib/elixir.ts")

  const econ = computeExecutiveUnitEconomics({
    users: 200,
    enrolments: 120,
    elixirIssued: 9900,
    elixirSpent: 4950,
    elixirUnrecovered: 0,
  })
  assert(
    econ.activationRatePercent === 60 && econ.elixirRedemptionRatePercent === 50 && econ.netUnredeemedElixirLiability === 4950,
    `computeExecutiveUnitEconomics must calculate activation, redemption, and net coin liability accurately, got ${JSON.stringify(econ)}`,
  )

  const cohort = computeCollegeCohortSummary(50, [
    { status: "completed" },
    { status: "completed" },
    { status: "active" },
    { status: "active" },
  ])
  assert(
    cohort.totalMembers === 50 &&
      cohort.totalEnrolments === 4 &&
      cohort.completedEnrolments === 2 &&
      cohort.activeEnrolments === 2 &&
      cohort.completionRatePercent === 50,
    `computeCollegeCohortSummary must calculate college B2B cohort metrics accurately, got ${JSON.stringify(cohort)}`,
  )

  assert(
    VERIFIED_ACADEMIC_ELIXIR_SCHEDULE.length >= 5 && VERIFIED_ACADEMIC_ELIXIR_SCHEDULE[0].elixir === 99,
    "VERIFIED_ACADEMIC_ELIXIR_SCHEDULE must expose the 99-Elixir workshop cashback and academic merit milestones",
  )


  console.log("12. Website Sprints 1-4 UI verification: Homepage Elixir Flywheel, Events Case Store preview, VerifyPage issuer, and College KPI strip")
  const hpSrc = readFileSync(resolve(process.cwd(), "src/pages/HomePage.tsx"), "utf8")
  const repSrc = readFileSync(resolve(process.cwd(), "src/pages/home/Repolish.tsx"), "utf8")
  const evPageSrc = readFileSync(resolve(process.cwd(), "src/pages/EventsPage.tsx"), "utf8")
  const walletSrc = readFileSync(resolve(process.cwd(), "src/components/learner/ElixirWallet.tsx"), "utf8")
  const verifySrc = readFileSync(resolve(process.cwd(), "src/pages/VerifyPage.tsx"), "utf8")
  const collegePageSrc = readFileSync(resolve(process.cwd(), "src/pages/DashboardCollegePage.tsx"), "utf8")

  assert(hpSrc.includes("HomeElixirFlywheel") && repSrc.includes("Start with a ₹99 Workshop. Get 99 Elixir Coins for Case Studies."), "HomePage.tsx and Repolish.tsx must render the HomeElixirFlywheel section")
  assert(evPageSrc.includes("Redeemable with your 99 Workshop Elixir Coins"), "EventsPage.tsx must display the 4 redeemable Case Studies preview")
  assert(walletSrc.includes("How to earn Elixir Coins (Verified Merit Schedule)"), "ElixirWallet.tsx must display the Verified Merit Schedule")
  assert(verifySrc.includes("Credential issuer") && verifySrc.includes("Verification standard"), "VerifyPage.tsx must display Credential issuer and Verification standard")
  assert(collegePageSrc.includes("cohortSummary") && collegePageSrc.includes("Completion rate"), "DashboardCollegePage.tsx must render the college cohortSummary KPI strip")


  console.log("13. All 7 Blueprint Pillars: 6-Track Cold Calls with peer %, 20-min Doubt SLA, Programme Certificates, Job Skill-Match UI, and College CSV Export")
  const { buildProgrammeCertificateCode } = await import("../server/src/routes/skylent/certificates.ts")
  const { formatCollegeCohortCsv } = await import("../server/src/routes/college.ts")

  const pgmCode = buildProgrammeCertificateCode("data-analytics-pro", 2026, "abcd1234")
  assert(pgmCode === "SKL-2026-PGMDAP-ABCD1234", `expected SKL-2026-PGMDAP-ABCD1234, got ${pgmCode}`)

  const csvOut = formatCollegeCohortCsv(
    "IITM Partner College",
    [{ id: "u-1", name: "Aarav Sharma" }, { id: "u-2", name: "Priya Nair" }],
    [{ userId: "u-1", status: "completed", courseTitle: "Data Analytics" }],
  )
  assert(
    csvOut.includes(`"IITM Partner College","u-1","Aarav Sharma","Data Analytics","completed"`) &&
      csvOut.includes(`"IITM Partner College","u-2","Priya Nair","None","not_enrolled"`),
    "formatCollegeCohortCsv must generate valid escaped CSV rows for enrolled and unenrolled college members",
  )

  const plFull = readFileSync(resolve(process.cwd(), "src/components/product/ProductLanguage.tsx"), "utf8")
  for (const track of ["data-analytics", "product-management", "python-programming", "data-science-ai", "generative-ai", "full-stack-web"]) {
    assert(plFull.includes(`"${track}":`) && plFull.includes("peerPercent"), `ProductLanguage.tsx must include ColdCallScenario with peerPercent for ${track}`)
  }

  const aiFull = readFileSync(resolve(process.cwd(), "src/components/lms/SkylentAI.tsx"), "utf8")
  const facFull = readFileSync(resolve(process.cwd(), "src/pages/DashboardFacultyPage.tsx"), "utf8")
  assert(aiFull.includes("Flag for Faculty TA review (20-min SLA)") && facFull.includes("20-minute doubt &amp; rubric SLA"), "SkylentAI.tsx and DashboardFacultyPage.tsx must wire the 20-minute Faculty TA doubt SLA")

  const jrowFull = readFileSync(resolve(process.cwd(), "src/components/career/JobResultRow.tsx"), "utf8")
  const jdetFull = readFileSync(resolve(process.cwd(), "src/components/career/JobDetailPanel.tsx"), "utf8")
  assert(jrowFull.includes("job.skillMatch") && jdetFull.includes("Verified Skill-Gap Match"), "JobResultRow.tsx and JobDetailPanel.tsx must render skillMatch badges and skill-gap breakdown")

  const colPageFull = readFileSync(resolve(process.cwd(), "src/pages/DashboardCollegePage.tsx"), "utf8")
  assert(colPageFull.includes("/college/dashboard/export.csv") && colPageFull.includes("Export Cohort CSV"), "DashboardCollegePage.tsx must include the Export Cohort CSV action")

console.log("14. Admin C-Suite Unit Economics UI and Student Programme Master Certificate Claim UI")
  const adminPlatformSrc = readFileSync(resolve(process.cwd(), "src/components/admin/AdminPlatform.tsx"), "utf8")
  const adminApiSrc = readFileSync(resolve(process.cwd(), "src/lib/admin-api.ts"), "utf8")
  const skylentApiSrc = readFileSync(resolve(process.cwd(), "src/lib/skylent-api.ts"), "utf8")
  const studentPageSrc = readFileSync(resolve(process.cwd(), "src/pages/DashboardStudentPage.tsx"), "utf8")

  assert(adminApiSrc.includes("AdminUnitEconomics") && adminPlatformSrc.includes("Learner activation rate") && adminPlatformSrc.includes("Elixir redemption velocity") && adminPlatformSrc.includes("Net unredeemed Elixir liability"), "AdminPlatform.tsx and admin-api.ts must surface C-Suite unit economics cards")
  assert(skylentApiSrc.includes("issueProgrammeCertificate") && skylentApiSrc.includes("/certificates/issue-programme"), "skylent-api.ts must expose issueProgrammeCertificate")
  assert(studentPageSrc.includes("claimProgrammeMasterCertificate") && studentPageSrc.includes("Claim Master Certificate"), "DashboardStudentPage.tsx must allow learners to claim their Programme Master Certificate when all courses in a programme are complete")

  console.log("15. Phase 1A-1D completeness: Programme -PGM code match, Proof-of-Work evidenceSummary, Backend 20-Min Doubt SLA queue, 6-Track Socratic prompts, 3 Flagship Workshop Tracks, and Career Rise 3-Milestone checklist")
  assert(
    studentPageSrc.includes("cert.code.includes('-PGM')"),
    "DashboardStudentPage.tsx must check -PGM code prefix for issued Programme Master Certificates",
  )
  assert(
    certSummary.verificationStandard === SKYLENT_CREDENTIAL_STANDARD &&
      certSummary.credentialLevel === "course" &&
      typeof certSummary.evidenceSummary === "string" &&
      certSummary.evidenceSummary.length > 10,
    "buildCertificateEvidenceSummary must return verificationStandard, credentialLevel, and evidenceSummary",
  )
  const pgmCertSummary = buildCertificateEvidenceSummary({
    code: "SKL-2026-PGMDAP-ABCD1234",
    learnerName: "Aarav Sharma",
    courseTitle: "Data Analytics Pro",
    issuedAt: new Date("2026-10-30T00:00:00.000Z"),
  })
  assert(
    pgmCertSummary.credentialLevel === "programme" && pgmCertSummary.evidenceSummary.includes("programme"),
    "Programme certificate summary must report credentialLevel=programme",
  )
  assert(
    verifySrc.includes("Verified evidence") && verifySrc.includes("evidenceSummary"),
    "VerifyPage.tsx must display Verified evidence from evidenceSummary",
  )

  const {
    clearFacultyDoubtStoreForTests,
    createFacultyDoubtTicket,
    FACULTY_DOUBT_SLA_MINUTES,
    listFacultyDoubtTickets,
    resolveFacultyDoubtTicket,
  } = await import("../server/src/lib/doubt-sla.ts")
  clearFacultyDoubtStoreForTests()
  const ticket = createFacultyDoubtTicket({
    userId: "u-learner-1",
    learnerName: "Aarav Sharma",
    courseSlug: "data-analytics",
    lessonKey: "l2",
    lessonTitle: "Margin & Discount Leakage",
    question: "Why does LEFT JOIN change row counts on OrderDetails?",
  })
  assert(
    ticket.status === "open" && ticket.slaMinutes === FACULTY_DOUBT_SLA_MINUTES && ticket.slaMinutes === 20,
    "createFacultyDoubtTicket must create an open 20-min SLA ticket",
  )
  const deduped = createFacultyDoubtTicket({
    userId: "u-learner-1",
    learnerName: "Aarav Sharma",
    courseSlug: "data-analytics",
    lessonKey: "l2",
    question: "Updated SQL join question",
  })
  assert(deduped.id === ticket.id && deduped.question === "Updated SQL join question", "duplicate open doubt on same lesson must update existing ticket")
  assert(listFacultyDoubtTickets(["data-analytics"]).length === 1, "listFacultyDoubtTickets must filter by courseSlug")
  assert(listFacultyDoubtTickets(["product-management"]).length === 0, "listFacultyDoubtTickets must exclude unassigned courses")
  const resolvedTicket = resolveFacultyDoubtTicket(ticket.id, "u-faculty-1", "Verified grain on OrderID + ProductID.")
  assert(resolvedTicket?.status === "resolved" && resolvedTicket.resolvedById === "u-faculty-1", "resolveFacultyDoubtTicket must mark ticket resolved")
  clearFacultyDoubtStoreForTests()

  const { socraticQuickPromptsFor } = await import("../src/lib/socratic-prompts.ts")
  for (const track of ["data-analytics", "product-management", "python-programming", "data-science-ai", "generative-ai", "full-stack-web"]) {
    const prompts = socraticQuickPromptsFor(track, "reading", false)
    assert(prompts.length === 5 && Boolean(prompts.at(-1)?.question), `socraticQuickPromptsFor must include a custom track-specific Socratic prompt for ${track}`)
  }

  const evDetailSrc = readFileSync(resolve(process.cwd(), "src/pages/EventDetailPage.tsx"), "utf8")
  assert(
    evPageSrc.includes("3 Flagship ₹99 Live Workshop Tracks") && evDetailSrc.includes("Go to Elixir Case Study Store →"),
    "EventsPage.tsx and EventDetailPage.tsx must render the 3 Flagship Workshop Tracks and post-registration Case Study Store CTA",
  )

  const crRouteSrc = readFileSync(resolve(process.cwd(), "server/src/routes/career-rise.ts"), "utf8")
  const crCardSrc = readFileSync(resolve(process.cwd(), "src/components/learner/CareerRiseCard.tsx"), "utf8")
  assert(
    crRouteSrc.includes("curriculumGatePassed") && crCardSrc.includes("60% Curriculum Gate") && crCardSrc.includes("Mock Interview Defense"),
    "career-rise.ts and CareerRiseCard.tsx must expose and render the 3-step Career Rise readiness milestones",
  )

  console.log("16. Phase 2B Faculty Doubt SLA Queue UI in DashboardFacultyPage.tsx and faculty-api.ts")
  const facApiSrc = readFileSync(resolve(process.cwd(), "src/lib/faculty-api.ts"), "utf8")
  const facPageUpdated = readFileSync(resolve(process.cwd(), "src/pages/DashboardFacultyPage.tsx"), "utf8")
  assert(
    facApiSrc.includes("fetchFacultyDoubts") &&
      facApiSrc.includes("resolveFacultyDoubt") &&
      facPageUpdated.includes("FacultyDoubtQueue") &&
      facPageUpdated.includes("20-Minute Faculty TA Doubt Queue"),
    "faculty-api.ts and DashboardFacultyPage.tsx must wire the live 20-Minute Faculty TA Doubt Queue UI",
  )


  console.log("17. Phases P1-P3 Verification: Homepage Learn. Practise. Build. Prove it., University Pathways, Header Elixir Wallet & Notifications, and Learner Doubts API")
  const { listLearnerDoubtTickets } = await import("../server/src/lib/doubt-sla.ts")
  const { buildNotificationItems, formatElixirReason } = await import("../src/lib/learner-notifications.ts")

  clearFacultyDoubtStoreForTests()
  const dTicket = createFacultyDoubtTicket({
    userId: "u-notif-learner",
    learnerName: "Riya Patel",
    courseSlug: "python-programming",
    lessonKey: "l5",
    lessonTitle: "Generators, Iterators & Stream Processing",
    question: "How does yield preserve local stack frame state?",
  })
  assert(listLearnerDoubtTickets("u-notif-learner").length === 1, "listLearnerDoubtTickets must return the learner's own doubt ticket")
  assert(listLearnerDoubtTickets("u-other-learner").length === 0, "listLearnerDoubtTickets must isolate tickets by userId")
  resolveFacultyDoubtTicket(dTicket.id, "u-fac-1", "CPython suspends the PyFrameObject instruction pointer until next().")
  const resolvedList = listLearnerDoubtTickets("u-notif-learner")
  assert(
    resolvedList[0]?.status === "resolved" &&
      resolvedList[0]?.resolutionNote?.includes("PyFrameObject"),
    "listLearnerDoubtTickets must expose faculty resolutionNote to the learner",
  )
  clearFacultyDoubtStoreForTests()

  const notifItems = buildNotificationItems({
    transactions: [
      {
        id: "tx-99",
        amount: 99,
        type: "purchase_reward",
        activity: null,
        note: "100% Elixir Coin cashback (99 Elixir) for workshop: AI Systems",
        unrecovered: 0,
        createdAt: "2026-10-30T10:00:00.000Z",
      },
    ],
    doubts: resolvedList,
    certificates: [
      {
        code: "SKL-2026-PP-99887766",
        learnerName: "Riya Patel",
        courseTitle: "Python Programming & Automation",
        courseSlug: "python-programming",
        issuedAt: "2026-10-30T11:00:00.000Z",
        verifyPath: "/verify/SKL-2026-PP-99887766",
      },
    ],
  })
  assert(
    notifItems.length === 3 &&
      notifItems.some((n) => n.kind === "elixir" && n.title.includes("+99 Elixir")) &&
      notifItems.some((n) => n.kind === "faculty_reply" && n.detail.includes("PyFrameObject")) &&
      notifItems.some((n) => n.kind === "certificate" && n.detail.includes("SKL-2026-PP-99887766")),
    "buildNotificationItems must aggregate real Elixir credits, faculty doubt replies, and certificate unlocks",
  )
  assert(
    formatElixirReason({
      id: "tx-1",
      amount: 5,
      type: "learning_reward",
      activity: "lesson_complete",
      note: "lesson_complete",
      unrecovered: 0,
      createdAt: "2026-10-30T10:00:00.000Z",
    }).includes("Verified lesson completion"),
    "formatElixirReason must translate raw activity codes into human-readable earning reasons",
  )

  const sharedNavSrc = readFileSync(resolve(process.cwd(), "src/components/shared.tsx"), "utf8")
  const authShellSrc = readFileSync(resolve(process.cwd(), "src/components/AuthDashboardShell.tsx"), "utf8")
  const repolishUpdated = readFileSync(resolve(process.cwd(), "src/pages/home/Repolish.tsx"), "utf8")
  const eduUpdated = readFileSync(resolve(process.cwd(), "src/pages/EducationPage.tsx"), "utf8")
  const lmsUpdated = readFileSync(resolve(process.cwd(), "server/src/routes/lms.ts"), "utf8")

  assert(
    sharedNavSrc.includes("HeaderWalletAndNotifications") && authShellSrc.includes("HeaderWalletAndNotifications"),
    "Both public Nav and AuthDashboardShell must mount HeaderWalletAndNotifications for signed-in users",
  )
  assert(
    lmsUpdated.includes('"/doubts/mine"') && lmsUpdated.includes("listLearnerDoubtTickets"),
    "server/src/routes/lms.ts must expose GET /api/v1/lms/doubts/mine for learner doubt notifications",
  )
  assert(
    repolishUpdated.includes("Learn. Practise. Build. <em>Prove it.</em>") &&
      repolishUpdated.includes("Interactive SQL &amp; Python practice"),
    "Homepage hero must display Learn. Practise. Build. Prove it. and verified platform capabilities",
  )
  assert(
    eduUpdated.includes("University &amp; Institutional Pathways") &&
      eduUpdated.includes("Register learner or institutional interest"),
    "EducationPage.tsx must be repositioned as University & Institutional Pathways with interest registration",
  )


  const elixirLibSrc = readFileSync(resolve(process.cwd(), "server/src/lib/elixir.ts"), "utf8")
  const osPageSrc = readFileSync(resolve(process.cwd(), "src/pages/OSPage.tsx"), "utf8")
  assert(
    elixirLibSrc.includes("awardCourseEnrolmentElixir") && lmsUpdated.includes("awardCourseEnrolmentElixir"),
    "elixir.ts and lms.ts must credit Elixir rewards upon course and programme enrolment",
  )
  assert(
    sharedNavSrc.includes("All 6 live courses") && sharedNavSrc.includes("Workshops & Case Store"),
    "Public navigation must include All 6 live courses and Workshops & Case Store",
  )
  assert(
    osPageSrc.includes("AUTHORED_COURSE_SLUGS"),
    "OSPage.tsx must count workspace scope across all 6 authored courses",
  )

  console.log("18. Visual Effectiveness, Mobile Responsiveness & Competitive Moat Matrix Verification")
  const hrCss = readFileSync(resolve(process.cwd(), "src/pages/HomeRepolish.css"), "utf8")
  const spCss = readFileSync(resolve(process.cwd(), "src/skylent-public.css"), "utf8")
  const hwnSrc = readFileSync(resolve(process.cwd(), "src/components/learner/HeaderWalletAndNotifications.tsx"), "utf8")
  assert(
    repolishUpdated.includes('className="hxw-ws"') &&
      repolishUpdated.includes("hx-moat-compare") &&
      repolishUpdated.includes("Why learners and institutions choose Skylent OS over passive video platforms"),
    "Repolish.tsx must render the floating Hero Live Workspace HUD (.hxw-ws) and Competitive Moat comparison matrix (.hx-moat-compare)",
  )
  assert(
    !hrCss.includes("padding-right: 80px") &&
      hrCss.includes("hx-moat-table-wrap") &&
      spCss.includes("skn-popover") &&
      hwnSrc.includes("skn-popover"),
    "HomeRepolish.css and skylent-public.css must eliminate broken mobile padding and enforce viewport-safe mobile popovers",
  )
  const coursesPageSrc = readFileSync(resolve(process.cwd(), "src/pages/CoursesPage.tsx"), "utf8")
  const courseDetailSrc = readFileSync(resolve(process.cwd(), "src/pages/CourseDetailPage.tsx"), "utf8")
  const progListingSrc = readFileSync(resolve(process.cwd(), "src/components/programme/ProgrammeListing.tsx"), "utf8")
  assert(
    coursesPageSrc.includes("COURSE_SKILL_TAGS") &&
      courseDetailSrc.includes("cat-rubric-strip") &&
      progListingSrc.includes("Start the linked self-paced course") &&
      repolishUpdated.includes("hx-live-courses-grid") &&
      readFileSync(resolve(process.cwd(), "src/pages/ProgramsPage.tsx"), "utf8").includes('id="live-courses"') &&
      evPageSrc.indexOf("events-launch-tracks-title") < evPageSrc.indexOf("events-list-title"),
    "Final Touch 100% check: CoursesPage skill tags, CourseDetailPage rubric strip, ProgrammeListing live course cards, Homepage 6-course grid, and EventsPage above-the-fold workshop tracks",
  )

  assert(
    repolishUpdated.includes("ZeroLoginInteractiveTryout") &&
      readFileSync(resolve(process.cwd(), "src/pages/path/PathPage.tsx"), "utf8").includes("QuickAdaptiveDiagnostic") &&
      readFileSync(resolve(process.cwd(), "src/pages/VerifyPage.tsx"), "utf8").includes("SKL-2026-DA-EXEMPLAR") &&
      readFileSync(resolve(process.cwd(), "src/pages/career/CareerOSPublicPage.tsx"), "utf8").includes("cpx-pillars") &&
      existsSync(resolve(process.cwd(), "public/_redirects")) &&
      existsSync(resolve(process.cwd(), "vercel.json")),
    "Unified Master Polish check: Homepage Zero-Login Playground, Path 90-Sec Diagnostic, Verify Exemplar Dossiers, Career OS 3-Pillar Strip, and SPA routing files must be present",
  )

  console.log("release-readiness-hardening ok")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
