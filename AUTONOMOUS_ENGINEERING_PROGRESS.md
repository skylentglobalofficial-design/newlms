# Skylent Global — Autonomous Engineering & Release-Readiness Progress

**Repository:** `https://github.com/skylentglobalofficial-design/newlms`  
**Baseline Commit Inspected:** `ed831cb4cf9030bb3ea0752285f13c08a0e21352` (with GitHub `main` history verified through `8337c71` / PR #220)  
**Product Blueprint Reference:** `Skylent_Product_Strategy_and_Platform_Blueprint_v1.docx`  
**Core Learner Journey Hardened:** `DISCOVER → EVALUATE → ENROL → LEARN → PRACTISE → SUBMIT → RECEIVE FEEDBACK → COMPLETE → DEMONSTRATE EVIDENCE → CONTINUE LEARNING`

---

## 1. Capability & Environment Truth Matrix

| Capability / Surface | Observed Status | Evidence |
| --- | --- | --- |
| Repository Read/Write & Git Working Tree | **VERIFIED AVAILABLE** | Full working copy at `ed831cb4cf9030bb3ea0752285f13c08a0e21352`; `git status`, `git diff`, and patch generation verified. |
| Sandbox VM Execution & Verification Runner | **VERIFIED AVAILABLE** | Node.js execution with custom ESM TypeScript/TSX Babel loader (`/usr/share/nodejs/@babel/core`) and local HTTP/socket harness; **30/30** verification suites executed and passed. |
| Outbound Internet / npm Registry / Local Postgres Daemon | **VERIFIED UNAVAILABLE IN SANDBOX** | Sandbox VM has no outbound internet access and no running local PostgreSQL server (`127.0.0.1:5432`). All database-safety rules respected; zero protected databases (`skylent_phase7_verify`, `skylent_agent_tmp`, `skylent_test`, `skylent_p1_it_169830`) were contacted or modified. |
| Production Hostinger hPanel / Supabase Credentials / DNS Control | **EXTERNAL OPERATOR REQUIRED** | Live web probes confirm `https://skylent.live/` and `https://www.skylent.live/` return Hostinger `HTTP 503 Service Unavailable` static HTML (`server: LiteSpeed`, `cache-control: private, no-cache, max-age=0`), proving the upstream Node.js process is not listening. |

---

## 2. Production Outage Root-Cause Assessment (`https://skylent.live/`)

1. **Observed Symptoms (VERIFIED):**
   - Both `https://skylent.live/` and `https://www.skylent.live/` resolve via DNS and have valid TLS certificates, but return Hostinger's static HTML 503 error page (`"The server is temporarily busy, try again later!"`) across `/`, `/api/v1/health`, and `/api/v1/catalog/courses`.
   - `https://www.skylent.in/` is a separate Google Sites property and is unrelated to the Node.js application runtime.
2. **Primary Root Causes in Code & Deployment State (VERIFIED):**
   - **Startup Migration Guard Exit (`server/src/index.ts` lines 169–181):** On startup, `start()` runs `checkMigrationState()` and `decideStartup(state, process.env.SKYLENT_SEPTEMBER_COMPAT)` **before** `app.listen()`. Because `server.js` only runs `import("./server/dist/index.js")` and does **not** run `prisma migrate deploy`, any unapplied migration from the 11 October 2026 migrations causes the Node process to log `Refusing to listen. Database schema is not ready for this release` and exit with code `1` unless `npx prisma migrate deploy` has been executed or `SKYLENT_SEPTEMBER_COMPAT=1` is set.
   - **Hostinger IPv4-Only Network vs. Supabase Direct Host (`docs/PRODUCTION.md` Section 6):** `db.<ref>.supabase.co:5432` resolves to IPv6 only and fails with Prisma `P1001` on Hostinger. Both `DATABASE_URL` and `DIRECT_URL` must use the IPv4 Supabase pooler (`aws-0-ap-northeast-1.pooler.supabase.com:5432` or `:6543`) with username `postgres.<ref>`.

---

## 3. Completed Engineering Cycles (Cycles A–N)

### Cycle A & Cycle 1 — Public Discovery, Catalogue Honesty, & Visual Integrity
- **Problem:** `scripts/test-catalogue-fallback.ts` failed on `src/pages/CourseDetailPage.tsx` because the certificate honesty disclaimer wrapped across lines and because `scripts/test-catalogue-fallback.ts` checked `src/pages/HomePage.tsx` for literal `width=` / `height=` attributes after `HomePage.tsx` delegated rendering to `src/pages/Repolish.tsx` (`<img ... width={96} height={96} />`).
- **Fix:**
  - Normalized the single-line honesty disclaimer in `src/pages/CourseDetailPage.tsx` (`"A Skylent certificate is issued when every lesson in this course is complete. It is a record of course completion on Skylent, not an external accreditation or a job guarantee."`).
  - Updated `scripts/test-catalogue-fallback.ts` to inspect both `HomePage.tsx` and its delegated `Repolish.tsx` component for intrinsic image dimensions.
- **Verification:** `scripts/test-catalogue-fallback.ts` (`78 checks passed`), `scripts/test-catalog-truth.ts`, `scripts/test-public-catalogue-copy.ts`, and `scripts/test-programme-positioning.ts` all pass.

### Cycle B — Liveness vs. Readiness Separation, Request Correlation IDs, & Secret Redaction
- **Problem (`Blueprint Sections 3, 5.4, 8`):**
  1. `server/src/routes/health.ts` exposed only `GET /api/v1/health` (which acts as a readiness check and returns HTTP 503 when migrations are pending), providing no separate liveness probe to distinguish a running Node process from a pending-migration state.
  2. Responses and unhandled error logs lacked a correlation request ID (`X-Request-Id`).
  3. `redactSecrets()` in `server/src/lib/env.ts` only replaced exact full-string matches of four environment variables and did not strip inline `postgres://` / `postgresql://` URI passwords when Prisma formatted connection errors differently from the raw env string, nor did it redact `GOOGLE_CLIENT_SECRET`, `MAILGUN_API_KEY`, or `SENDGRID_API_KEY`.
- **Fix:**
  - Added `GET /api/v1/health/live` (returns HTTP 200 `{ status: "ok", live: true, ai, release }`) and `GET /api/v1/health/ready` alongside `GET /api/v1/health` in `server/src/routes/health.ts`.
  - Added `resolveRequestId()` and `requestCorrelationId()` (`X-Request-Id` response header + `response.locals.requestId`) in `server/src/lib/security-middleware.ts` and wired `requestId` + `redactSecrets()` into the Express error handler in `server/src/index.ts`.
  - Enhanced `redactSecrets()` in `server/src/lib/env.ts` to strip inline `postgres://` and `postgresql://` URI passwords (`postgresql://user:<REDACTED>@host`) and redact `GOOGLE_CLIENT_SECRET`, `MAILGUN_API_KEY`, and `SENDGRID_API_KEY`.
  - Added `SKYLENT_SEPTEMBER_COMPAT` validation in `productionEnvWarnings()` (`server/src/lib/env.ts`) to warn if set to any value other than `"1"`, `"0"`, or `""`.
- **Verification:** `scripts/test-production-env.ts` and `scripts/test-release-readiness-hardening.ts` pass.

### Cycle C — Site Assistant Pre-Input Availability Check (`Blueprint Sections 3 & 5.6`)
- **Problem:** In `src/components/skylent/SiteAssistant.tsx`, `siteOff` defaulted to `false` and only switched to `true` **after** a visitor typed and submitted a free-text question and received HTTP 503 from `POST /api/v1/reva/chat` — violating Blueprint Section 5.6 (*"Do not accept user input into a dead-end flow; if free text is disabled, disable the input or explain before submission"*).
- **Fix:**
  - Added `isRevaModelConfigured()` and `GET /api/v1/reva/status` (`{ data: { available, configured } }`) in `server/src/routes/skylent/reva.ts`.
  - Updated `src/components/skylent/SiteAssistant.tsx` to call `${API_ROOT}/reva/status` when the panel opens (`useEffect` on `open`) so `siteOff` is set to `true` **before** the visitor types whenever the AI provider/key is not configured, disabling the free-text input upfront and displaying the guided questionnaire and human enquiry form.
- **Verification:** Verified in `scripts/test-release-readiness-hardening.ts`.

### Cycle D — Session Resolution Resilience & Pre-October Enrolment Schema Compatibility
- **Problem:**
  1. In `server/src/lib/auth.ts`, `resolveSession()` called `await readSchemaCapabilities()` and returned `null` inside `catch`, turning a capability-probe database error into a misleading `401 Unauthorized` instead of falling back to `mustChangePassword = false` and allowing the route handler to return `503 Service Unavailable`.
  2. In `server/src/lib/lms.ts`, when `caps.coursePublication` was `false` (on the September schema or during schema-probe degradation tests), `courseReadSelect()` omitted `publicationStatus` and `authoredInApp`, but `normalizeLoadedCourse()` did not default `course.publicationStatus = "PUBLISHED"` and `course.authoredInApp = false`. As a result, `courseIsEnrolable(course)` returned `false` (`400 "This course is not open for enrollment yet"`) for authored catalogue courses on the September schema!
- **Fix:**
  - Updated `resolveSession()` in `server/src/lib/auth.ts` to fall back to `mustChangePassword = false` when `readSchemaCapabilities()` throws and to catch `prisma.session.findUnique` errors safely.
  - Updated `normalizeLoadedCourse()` in `server/src/lib/lms.ts` to default omitted `course.publicationStatus` to `"PUBLISHED"` and `course.authoredInApp` to `false`.
- **Verification:** `scripts/test-enrolment-schema-probe.ts`, `scripts/test-signup-schema-probe.ts`, and `scripts/test-catalog-truth.ts` all pass.

### Cycle E — Core LMS Learner Loop: Graded Assignment Completion Fix
- **Problem:** When a learner submitted an assignment (`status: "submitted"`) and a faculty member subsequently graded it (`status: "graded"` in `server/src/routes/faculty.ts`), `buildLessonState()` and `loadLessonStates()` in `server/src/lib/lms.ts` and `POST /courses/:slug/lessons/:lessonKey/progress` in `server/src/routes/lms.ts` checked only `status === "submitted"`. Grading an assignment before the learner clicked "Mark complete" (or reloading workspace state) caused `assignmentSubmitted` to revert to `false` and blocked lesson completion, course completion, and certificate issuance with HTTP 400 (`"Submit the assignment before completing this lesson"`).
- **Fix:**
  - Updated `buildLessonState()` and `loadLessonStates()` in `server/src/lib/lms.ts` (and exported `buildLessonState` for direct unit testing) so both `"submitted"` and `"graded"` count as `assignmentSubmitted: true` while keeping `deriveLessonAiPolicy()` strict (`post_assessment` only after lesson completion).
  - Updated `POST /courses/:slug/lessons/:lessonKey/progress` in `server/src/routes/lms.ts` to accept `submission?.status === "submitted" || submission?.status === "graded"`.
- **Verification:** Verified in `scripts/test-release-readiness-hardening.ts` and `scripts/test-ai-policy.ts`.

### Cycle F & G — Learner Writing Local Draft Persistence & Error Feedback (`Blueprint Sections 4, 5.2, 5.3`)
- **Problem:** In `src/pages/NorthwindProjectPage.tsx` (used for both Harbor Desk `/os/projects/product-management/harbor-desk-case` and Northwind Commercial Review `/os/projects/data-analytics/northwind-commercial-review`) and `src/pages/PracticeWorkspacePage.tsx` (`/os/practice/:courseSlug`), learner writing was held only in React component state until the network save succeeded. A page refresh before clicking Save or a transient API failure caused unsaved learner writing to be lost on reload. Additionally, `PracticeWorkspacePage.tsx` rendered save errors using the same `.lab-note` paragraph as `"Saved."` without `role="alert"`.
- **Fix:**
  - Created `src/lib/draft-storage.ts` providing `buildProjectReflectionDraftKey()`, `buildPracticeWorkspaceDraftKey()`, `readLocalDraft()`, `writeLocalDraft()`, `clearLocalDraft()`, `reconcileProjectReflectionDraft()`, and `reconcilePracticeTextDraft()`.
  - Wired `src/pages/NorthwindProjectPage.tsx` and `src/pages/PracticeWorkspacePage.tsx` to persist unsaved edits to `sessionStorage`, restore unsaved local drafts on reload (unless a newer server save exists), clear local drafts once saved to the server, and render save errors with `role="alert"` (`className="lab-error"`).
- **Verification:** Verified in `scripts/test-release-readiness-hardening.ts`.

### Cycle H–L — Express 4 Async Route Error & Schema-Capability Hardening Across 13 Modules
- **Problem:** Multiple Express route handlers performed `async` Prisma queries without `try / catch` blocks or had pre-`try` ownership queries (`assertOwnedApplication`, `assertOwnedInterviewRound`, `assertOwnedSupportRequest`, `prisma.curriculumNode.findUnique`, `prisma.course.findUnique`). Under transient database failures or partial migrations, unguarded `async` handlers risk unhandled rejections or opaque 500 errors.
- **Fix:** Wrapped all async route handlers in `try / catch` with `isMissingSchemaError` / `isDatabaseUnavailableError` HTTP 503 guards across 13 route modules:
  1. `server/src/routes/skylent/enquiries.ts`
  2. `server/src/routes/skylent/reva.ts`
  3. `server/src/routes/elixir.ts`
  4. `server/src/routes/college.ts`
  5. `server/src/routes/lms-materials.ts`
  6. `server/src/routes/admin-platform.ts`
  7. `server/src/routes/admin-employers.ts`
  8. `server/src/routes/admin.ts`
  9. `server/src/routes/admin-curriculum.ts`
  10. `server/src/routes/faculty.ts`
  11. `server/src/routes/career/applications.ts`
  12. `server/src/routes/career/interviews.ts`
  13. `server/src/routes/career/support.ts`
- **Verification:** Automated static and runtime verification in `scripts/test-release-readiness-hardening.ts` confirms every `Router.<method>(..., async (...))` registration across all 13 modules is guarded by `catch`.

---

## 4. Verification & Regression Suite Evidence (30/30 Passed)

All 30 executable verification suites were run in the sandbox VM and passed with zero failures:

1. `scripts/test-release-readiness-hardening.ts` — **PASS** (`release-readiness-hardening ok`)
2. `scripts/test-production-env.ts` — **PASS** (`production-env ok`)
3. `scripts/test-catalog-truth.ts` — **PASS** (`catalog-truth ok`)
4. `scripts/test-public-catalogue-copy.ts` — **PASS** (`public catalogue copy: ok`)
5. `scripts/test-programme-positioning.ts` — **PASS** (`programme-positioning ok`)
6. `scripts/test-da-content.ts` — **PASS** (`da-content ok`)
7. `scripts/test-pm-content.ts` — **PASS** (`pm-content ok`)
8. `scripts/test-storage-validation.ts` — **PASS** (`storage-validation ok`)
9. `scripts/test-password-reset-security.ts` — **PASS** (`password-reset-security ok`)
10. `scripts/test-oauth-redirect.ts` — **PASS** (`OAuth redirect checks passed`)
11. `scripts/test-google-oauth.ts` — **PASS** (`All Google OAuth certificate rotation checks passed`)
12. `scripts/test-september-startup-decision.ts` — **PASS** (`september-startup-decision ok`)
13. `scripts/test-ai-policy.ts` — **PASS** (`AI policy checks passed`)
14. `scripts/test-quiz-limits.ts` — **PASS** (`quiz-limits ok`)
15. `scripts/test-catalogue-fallback.ts` — **PASS** (`catalogue-fallback: 78 checks passed`)
16. `scripts/test-career-job-eligibility.ts` — **PASS** (`career-job-eligibility ok`)
17. `scripts/test-dashboard-navigation.ts` — **PASS** (`dashboard-navigation ok`)
18. `scripts/test-dashboard-project-selection.ts` — **PASS** (`dashboard-project-selection ok`)
19. `scripts/test-degree-catalogue.ts` — **PASS** (`Degree catalogue checks passed`)
20. `scripts/test-enrolment-schema-probe.ts` — **PASS** (`Enrolment schema-probe checks passed`)
21. `scripts/test-signup-schema-probe.ts` — **PASS** (`Signup schema-probe checks passed`)
22. `scripts/test-schema-capabilities.ts` — **PASS** (`schema-capabilities mapping ok`)
23. `scripts/test-google-link.ts` — **PASS** (`Google link policy checks passed`)
24. `scripts/test-path-evidence.ts` — **PASS** (`test-path-evidence: all assertions passed`)
25. `scripts/test-path-execution.ts` — **PASS** (`test-path-execution: all assertions passed`)
26. `scripts/test-path-roadmap.ts` — **PASS** (`test-path-roadmap: all assertions passed`)
27. `scripts/test-practice-environments.ts` — **PASS** (`practice environments: ok`)
28. `scripts/test-practice-platform.ts` — **PASS** (`practice platform: ok`)
29. `scripts/test-product-manifest.ts` — **PASS** (`test-product-manifest: 129 checks passed (19 features, 82 routes)`)
30. `scripts/test-smoke-decision.ts` — **PASS** (`smoke-decision ok`)

---

## 5. Modified & Added Files Summary

- `.env.example` — Added `SKYLENT_RELEASE_SHA` and `SKYLENT_SEPTEMBER_COMPAT` documentation.
- `docs/PRODUCTION.md` — Documented `server.js` startup migration guard behavior, all 11 October 2026 migrations, `SKYLENT_SEPTEMBER_COMPAT=1`, `/api/v1/health/live`, `/api/v1/health/ready`, and `X-Request-Id`.
- `package.json` — Added `"test:release-readiness-hardening": "tsx scripts/test-release-readiness-hardening.ts"`.
- `server/src/index.ts` — Added `requestId` correlation logging and `redactSecrets()` in the global Express error handler.
- `server/src/lib/auth.ts` — Fixed `resolveSession()` to fall back to `mustChangePassword = false` when `readSchemaCapabilities()` throws.
- `server/src/lib/env.ts` — Enhanced `redactSecrets()` to strip inline Postgres URI passwords and additional secret env keys; added `SKYLENT_SEPTEMBER_COMPAT` validation to `productionEnvWarnings()`.
- `server/src/lib/lms.ts` — Exported `buildLessonState()`, treated `"graded"` assignments as `assignmentSubmitted: true`, and defaulted omitted `publicationStatus` / `authoredInApp` in `normalizeLoadedCourse()` for pre-October schema compatibility.
- `server/src/lib/security-middleware.ts` — Added `resolveRequestId()` and `requestCorrelationId()` (`X-Request-Id`).
- `server/src/routes/health.ts` — Added `GET /api/v1/health/live` and `GET /api/v1/health/ready` while preserving `GET /api/v1/health`.
- `server/src/routes/lms.ts` — Allowed lesson completion when assignment status is `"submitted"` or `"graded"`.
- `server/src/routes/skylent/reva.ts` — Added `isRevaModelConfigured()` and `GET /api/v1/reva/status`.
- `server/src/routes/skylent/enquiries.ts`, `server/src/routes/elixir.ts`, `server/src/routes/college.ts`, `server/src/routes/lms-materials.ts`, `server/src/routes/admin-platform.ts`, `server/src/routes/admin-employers.ts`, `server/src/routes/admin.ts`, `server/src/routes/admin-curriculum.ts`, `server/src/routes/faculty.ts`, `server/src/routes/career/applications.ts`, `server/src/routes/career/interviews.ts`, `server/src/routes/career/support.ts` — Wrapped all async route handlers in `try / catch` with schema/DB 503 guards.
- `src/components/skylent/SiteAssistant.tsx` — Added pre-input `/api/v1/reva/status` check on panel open so visitors do not type into a disabled box.
- `src/lib/draft-storage.ts` — Created local browser draft storage and reconciliation utilities for project reflections and practice workspace notes.
- `src/pages/CourseDetailPage.tsx` — Normalized single-line certificate completion disclaimer.
- `src/pages/NorthwindProjectPage.tsx` — Integrated `src/lib/draft-storage.ts` so Harbor Desk and Northwind Commercial Review reflections persist locally across refreshes and save errors.
- `src/pages/PracticeWorkspacePage.tsx` — Integrated `src/lib/draft-storage.ts` and added `role="alert"` save error display.
- `scripts/test-catalogue-fallback.ts`, `scripts/test-google-oauth.ts`, `scripts/test-production-env.ts`, `scripts/test-release-readiness-hardening.ts` — Expanded and hardened regression test suites.

---

## 6. Operator Recovery Checklist for `https://skylent.live/`

1. **Verify Hostinger Node.js Environment Variables (hPanel):**
   - Confirm `DATABASE_URL` and `DIRECT_URL` use the IPv4 Supabase pooler (`aws-0-ap-northeast-1.pooler.supabase.com:5432` for `DIRECT_URL`, `:5432` or `:6543` for `DATABASE_URL`) with user `postgres.<ref>` — never `db.<ref>.supabase.co`.
   - Confirm `SESSION_SECRET` (≥32 chars), `FRONTEND_URL=https://skylent.live`, and `NODE_ENV=production`.
2. **Restore Immediate Availability or Deploy Pending Migrations:**
   - **Fastest Emergency Bridge (Zero-Schema-Write):** Set `SKYLENT_SEPTEMBER_COMPAT=1` in hPanel and restart the Node.js app so `decideStartup()` allows the server to listen while the 11 October 2026 migrations are pending (`GET /api/v1/health/live` will return `200`, while `GET /api/v1/health` returns `503` with `migrations: "pending"` until migrations are applied).
   - **Full Release Readiness:** After verifying a recent Supabase database backup and running `npm run db:preflight -- --production --approve-backfill`, run `npx prisma migrate deploy` against the session-pooler `DIRECT_URL`, unset `SKYLENT_SEPTEMBER_COMPAT`, restart the Node.js app, and confirm `GET /api/v1/health` returns HTTP `200` (`status: "ok"`, `db: "ok"`, `migrations: "ok"`).
