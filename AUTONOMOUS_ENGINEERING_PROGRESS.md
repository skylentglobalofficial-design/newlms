# Skylent Autonomous Engineering & Release-Readiness Progress

**Repository:** `https://github.com/skylentglobalofficial-design/newlms`
**Working Branch:** `release/skylent-readiness-2026-10-30` (branched from baseline snapshot `848297c8dc184d85456ecd0ee007da028342f05a` / `ed831cb4cf9030bb3ea0752285f13c08a0e21352`)
**Last Updated:** 2026-10-30

## 1. Executive Summary & Live Domain Verification

### Live Domain State (Read-Only HTTP Probes)
| Domain / Endpoint | Observed Status | Evidence & Classification |
| :--- | :--- | :--- |
| `https://skylent.live/` | **HTTP 200 OK** | **VERIFIED:** Serves the SPA shell (`index.html`, asset bundle `index-CT93_3X7.js`, `index-BY8x94N5.css`). |
| `https://skylent.live/api/v1/health` | **HTTP 503** (`text/html`) | **VERIFIED (Symptom) / UNCONFIRMED (Root Cause):** Hostinger/Cloudflare edge returns default HTML `503 Service Unavailable`. Because `server/src/index.ts` invokes `await assertNoPendingMigrations()` before `app.listen(port, "0.0.0.0")`, the Node process exits with code `1` before binding the port whenever any of the 11 October 2026 Prisma migrations (`20261004000000_skylent_enquiries` through `20261028161000_lesson_material_compat`) are unapplied or `DATABASE_URL` is unreachable. Without Hostinger runtime log access, the exact startup failure reason remains unconfirmed until the operator runs `npx prisma migrate status`. |
| `https://skylent.live/api/v1/catalog` | **HTTP 503** (`text/html`) | **VERIFIED:** Upstream Node process is not listening; public catalogue pages stay usable via static catalogue fallback (`src/lib/catalogue-api.ts`) and now include an inline `"Try again"` retry control on the homepage (`src/pages/HomePage.tsx`, `src/pages/home/Repolish.tsx`). |
| `https://skylent.in/` | **DNS / Edge Unreachable** | **VERIFIED:** Secondary domain does not resolve to an active HTTP origin (`FETCH_ERROR`). |

## 2. Completed Autonomous Engineering Cycles

### Cycle 1 — Backend Route Hardening, Fail-Safe Session Resolution, Liveness/Readiness Split & Secret Redaction
- **Fail-Safe Session Resolution (`server/src/lib/auth.ts`):**
  - `resolveSession` defaults `mustChangePassword = true` when `readSchemaCapabilities()` fails transiently so forced password resets (`mustChangePassword: true`) can never be bypassed on the October 2026 schema.
  - If `prisma.session.findUnique` throws `P2022` (missing column on the pre-October September schema), `resolveSession` automatically retries once with `includeMustChangePassword = false`.
  - If the capability probe fails with a non-database error and the returned session lacks `mustChangePassword` without a `P2022` retry, `resolveSession` fails closed (`null` -> `401 Unauthorized`).
- **Graded Assignment Completion Guard (`server/src/lib/lms.ts`, `server/src/routes/lms.ts`):**
  - Updated `buildLessonState` and `POST /api/v1/lms/courses/:slug/lessons/:lessonId/complete` so both `"submitted"` and `"graded"` assignments count as submitted, preventing faculty grading from regressing learner completion state.
- **Liveness vs. Readiness Health Endpoints & Correlation IDs (`server/src/routes/health.ts`, `server/src/lib/security-middleware.ts`, `server/src/index.ts`, `server.js`):**
  - Added `GET /api/v1/health/live` returning `200 { status: "ok", live: true, version, uptimeSeconds }` without querying Postgres so container/process supervisors can distinguish liveness from migration readiness.
  - Added `GET /api/v1/health/ready` alongside `GET /api/v1/health` returning `200` when Postgres and all migrations are ready, or `503` when migrations are pending or Postgres is unreachable.
  - Added `requestIdMiddleware` (`X-Request-Id`) and `redactSecrets()` across `server/src/index.ts` and `server.js` so database URLs, bearer tokens, and passwords are never leaked in error logs.
- **Complete 27-Route Backend Schema & Database-Unavailable Hardening (`server/src/routes/**`):**
  - Audited all **27** route modules (**199** route handlers) in `server/src/routes/`.
  - Wrapped every async handler in `try / catch`, added `isMissingSchemaError(error) || isDatabaseUnavailableError(error)` guards returning structured HTTP `503` (`code: "unavailable"`), moved all mid-file imports to top-level module scope, and eliminated all raw `console.error(..., error)` object dumps (`0` remaining across `server/src/`).

### Cycle 2 — Google OAuth Pre-Check & Browser Redirect Fallback (`Skylent_Product_Strategy_and_Platform_Blueprint_v1.docx` §5.2 & §7)
- **Backend (`server/src/routes/auth.ts`):**
  - Added `GET /api/v1/auth/google/status` returning `{ data: { available: configured, configured } }` and exposed `googleOAuthConfigured` in `GET /api/v1/auth/csrf`.
  - Updated `GET /api/v1/auth/google` so browser navigations (`Accept: text/html`) redirect cleanly to `/login?error=oauth_not_configured` instead of rendering raw `503` JSON in the browser tab, while API/fetch callers (`Accept: application/json`) continue to receive HTTP `503 { error: "Google OAuth is not configured" }`.
- **Frontend (`src/lib/auth-api.ts`, `src/pages/LoginPage.tsx`):**
  - Added `checkGoogleOAuthAvailable()` in `src/lib/auth-api.ts` and wired `src/pages/LoginPage.tsx` to check Google OAuth availability on mount, disable the Google sign-in button with `"Google sign-in unavailable — use email above"` when unconfigured, and display a clear inline message when redirected with `?error=oauth_not_configured`.

### Cycle 3 — Homepage Catalogue Availability Retry Action (`Skylent_Product_Strategy_and_Platform_Blueprint_v1.docx` §3 & §5.1)
- **Frontend (`src/pages/HomePage.tsx`, `src/pages/home/Repolish.tsx`):**
  - Wired `onRetry={() => void catalog.reload()}` from `HomePage.tsx` into `HomeProgrammes` (`src/pages/home/Repolish.tsx`) so visitors who see `"Availability could not be confirmed"` when `/api/v1/catalog` is unreachable can immediately retry live catalogue verification without a full page reload.

### Cycle 4 — Learner Writing & Course Assignment Local Browser Draft Persistence (`Skylent_Product_Strategy_and_Platform_Blueprint_v1.docx` §5.3 & §5.4)
- **Shared Draft Storage (`src/lib/draft-storage.ts`):**
  - Implemented `DraftStorageLike`, `ProjectReflectionDraft`, `PracticeWorkspaceDraft`, and `AssignmentDraft` with `sessionStorage` helpers (`readLocalDraft`, `writeLocalDraft`, `clearLocalDraft`) and race-condition-safe reconciliation (`reconcileProjectReflectionDraft`, `reconcilePracticeTextDraft`, `reconcileAssignmentDraft`).
  - Scoped project reflection drafts by `projectId` (`buildProjectReflectionDraftKey(projectType, projectId)`) and `baseUpdatedAt` so drafts never leak across accounts or overwrite newer server saves.
  - Scoped practice workspace drafts by `(courseSlug, lessonId)` and `baseServerBody`.
  - Scoped course assignment drafts by `(courseSlug, lessonKey)` and `baseServerText`, preserving unsaved learner responses across refreshes and transient `fetchAssignmentState` failures (`serverText === null`) while never overwriting `"submitted"` or `"graded"` submissions.
- **Workspace Integrations (`src/pages/ProjectsPage.tsx`, `src/components/lms/PracticeWorkspacePanel.tsx`, `src/pages/LearnPage.tsx`, `src/components/lms/AssignmentResponse.tsx`):**
  - Wired all three learner writing surfaces to persist local drafts on keystroke, restore unsaved work with an inline `"Restored unsaved local draft from this browser."` notice, and clear local storage once the server save/submit succeeds.

### Cycle 5 — Site Assistant Pre-Input Status Check & Release Gate CI Alignment
- **Site Assistant (`server/src/routes/skylent/reva.ts`, `src/components/skylent/SiteAssistant.tsx`):**
  - Added `GET /api/v1/reva/status` (`isRevaModelConfigured`) and wired `SiteAssistant.tsx` to check model availability when opened so visitors are routed directly to the programme enquiry form when the AI provider is unconfigured (`siteOff && (panelMode === "chat" || finderDone)`), without covering Step 1 of the guided programme finder.
- **Release Gate CI (`.github/workflows/release-gate.yml`):**
  - Updated `prisma migrate deploy` to run against `DIRECT_URL: ${{ secrets.TEST_DATABASE_URL }}` before `npm test` and added `npx tsx scripts/test-release-readiness-hardening.ts` to the CI gate.

## 3. Build, AST Transpilation, and Test Verification Results

- **Environment Note:** Outbound internet access and package installation (`npm ci`) are disabled in this sandbox VM, and `node_modules` is not pre-populated in the repository archive. In accordance with strict verification rules, we do not claim `tsc` or `vite build` ran via `npm run build`.
- **Actual Executed Compilation & Verification:**
  1. **Babel TypeScript/TSX AST & Module Graph Verification:** Parsed and transpiled all **477** `.ts`/`.tsx` source files across `src/`, `server/src/`, and `scripts/`, and re-compiled all **111** backend modules from `server/src/**/*.ts` into `server/dist/**/*.js` (plus `.js.map` source maps) with **0 syntax, import-contract, lexical-scope, or transpilation errors**.
  2. **Whitespace & Patch Hygiene (`git diff --check`):** Passed with **0 errors**.
  3. **Executable Test Suites (`40/40` Passed — `PASS=40 FAIL=0`):**
     - `scripts/test-release-readiness-hardening.ts` (all 8 sections covering graded assignments, 27-route hardening, fail-safe `resolveSession`, `/health/live` vs `/health/ready`, Google OAuth `/google/status` & browser redirect, homepage retry wiring, `/reva/status` pre-check, and project/practice/assignment local draft reconciliation)
     - `scripts/test-september-compat-http.ts`
     - `scripts/test-enrolment-schema-probe.ts`
     - `scripts/test-server-entry.ts`
     - `scripts/test-catalogue-fallback.ts` (78/78 checks)
     - `scripts/test-google-oauth.ts`
     - Plus all 34 additional unit and mock-HTTP verification suites in `scripts/` (`PASS=40 FAIL=0`).
     - *(The remaining live-Postgres/running-server scripts in `scripts/` require a live local Postgres instance as `postgres` OS user and were not executed against any protected database.)*

## 4. Safe Production Recovery Runbook for `skylent.live` Today

### Recommended Path — Option A (Standard Forward Migration Deploy)
Run these steps on the Hostinger production environment once authorized:
1. **Verify Environment Variables:** Confirm `DATABASE_URL` (pooler URL with `?pgbouncer=true&connection_limit=5`), `DIRECT_URL` (direct Postgres port `5432` URL for migrations), `SESSION_SECRET`, and `FRONTEND_URL=https://skylent.live` are set.
2. **Inspect Pending Migrations (Read-Only):**
   ```bash
   npx prisma migrate status
   ```
3. **Run Read-Only Backfill Preflight:**
   ```bash
   npm run backfill:preflight
   ```
4. **Apply Pending October 2026 Migrations via `DIRECT_URL`:**
   ```bash
   npx prisma migrate deploy
   ```
5. **Deploy & Build (or Extract Release Bundle):**
   ```bash
   npm ci
   npm run build
   ```
6. **Restart Application & Verify Health:**
   ```bash
   curl -i https://skylent.live/api/v1/health/live
   curl -i https://skylent.live/api/v1/health/ready
   curl -i https://skylent.live/api/v1/catalog
   ```

### Emergency Rollback / Bridge — Option B (`SKYLENT_SEPTEMBER_COMPAT=1`)
Use **only** if `npx prisma migrate deploy` cannot be executed immediately during an active incident:
- Set `SKYLENT_SEPTEMBER_COMPAT=1` in the Hostinger environment and restart the Node process.
- The server will log a prominent `WARNING` and allow read/session/legacy flows to serve traffic while October-schema-dependent mutations return structured HTTP `503` (`code: "unavailable"`). Remove `SKYLENT_SEPTEMBER_COMPAT` immediately after running `npx prisma migrate deploy`.
