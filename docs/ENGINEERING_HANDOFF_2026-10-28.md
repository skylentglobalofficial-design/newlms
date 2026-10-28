# Skylent engineering handoff — 28 Oct 2026

Inspection and diagnosis only. No homepage redesign, no production migration, no deploy, and no commit.

The approved visual reference is the current live site at `https://skylent.live/`. The uncommitted route `/preview/homepage` (`src/pages/home/HomeDirectionPreview.tsx`) is not an approved design and must not replace `/`.

## 1. Current architecture and routes

The product in this repo is one Vite + React app and one Express API.

- Public site and LMS UI: `src/`, served by Vite in development and by the built frontend in production.
- API: `server/src/index.ts`, mounted at `/api/v1`.
- Data: PostgreSQL through Prisma (`prisma/schema.prisma`, `prisma/migrations/`).
- Production HTTP host observed on 28 Oct 2026, 6:15 PM IST: `https://skylent.live` responds with `server: hcdn` (Hostinger CDN). `GET /api/v1/health` is on that same origin.
- Local development database in this environment is a different database: localhost PostgreSQL `skylent_agent_tmp`. It is not the production database. This session did not open a connection to production Postgres.

`npm start` is `node server.js`. That file runs `prisma migrate deploy` before the API listens. A production restart that uses this command is a migration. `node server/dist/index.js` starts the API without migrating. Which command Hostinger actually runs is still unverified.

### Public routes that matter

| Path | Role |
|---|---|
| `/` | Current homepage (`HomePage` → `src/pages/home/Repolish.tsx`) |
| `/programmes`, `/programmes/:slug` | Catalogue index and programme detail (`ProgramsPage`, `ProgramPage`) |
| `/programs`, `/programs/:slug` | Redirects into `/programmes` |
| `/courses` | Redirects to `/programmes` (keeps `q`) |
| `/courses/:slug` | Course detail |
| `/education`, `/education/online/:slug`, `/education/campus/:slug` | Degree index and degree detail |
| `/career-os` and nested profile, projects, jobs, applications | Career OS |
| `/labs`, `/learn/:slug`, `/learn/:slug/:lessonId` | Labs and the lesson workspace |
| `/login`, `/signup` | Same `LoginPage` |
| `/dashboard/student` | Learner dashboard, role-guarded |

The Skylent mark in the public header and footer (`src/components/shared.tsx`) links to `/`. The signed-in shell brand (`src/components/AuthDashboardShell.tsx`) also links to `/`. No redirect loop was found in those links. `/` does not bounce a signed-in learner to the dashboard.

`/preview/homepage` exists only as uncommitted work on this branch. It is not on the approved baseline.

## 2. Confirmed defects and root causes

Verified against live HTTP on 28 Oct 2026 unless marked otherwise.

| Symptom | Evidence | Root cause |
|---|---|---|
| Production health is not ready | `GET https://skylent.live/api/v1/health` HTTP 503: `db: ok`, `migrations: pending`, `pendingMigrations: 8`, `failedMigrations: 0`, `ai: not_configured`, `release: unknown` | The deployed schema is behind the migrations shipped with this release. Health returns 503 whenever any shipped migration is pending (`server/src/routes/health.ts`). |
| Account creation says the database update is not applied | The sentence is `UNAVAILABLE_MESSAGES.accounts` in `server/src/lib/schema-capabilities.ts`. Signup returns HTTP 503 with that sentence when `PolicyAcceptance` is missing or the probe fails (`server/src/routes/auth.ts`). The login screen prints `err.message`. | Signup is blocked until migration `20261009000000_policy_acceptance` has created `PolicyAcceptance`. This session did not POST a real signup to production. |
| Elixir says the database update is not applied | `GET https://skylent.live/api/v1/elixir` HTTP 503 with that exact sentence and `code: unavailable`. | Separate check. `elixirReady()` is true only when table `ElixirAccount` exists (`server/src/lib/elixir.ts`). That table is created by `20261025180000_elixir_ledger_and_admin_audit`, not by the policy migration. |
| Degrees and events unavailable | Live `GET /api/v1/degrees` and `GET /api/v1/events` HTTP 503, `code: unavailable` | `Degree` is created in `20261024140000_password_reset_and_degrees`. `Event` is created in `20261024120000_quiz_grading_events`. |
| Certificates can fail to load | `GET /api/v1/certificates/mine` returns 503 `Certificate check is unavailable right now.` when table `SkylentCertificate` is missing (`server/src/routes/skylent/certificates.ts`). The dashboard then shows `ListError` for “Your certificates”. | `SkylentCertificate` is created in `20261004000000_skylent_additions`. This is not the Elixir check. A signed-in production call was not made in this session. |
| Enrolments can sit on “loading” or fail | `GET /api/v1/lms/enrollments` does not consult `PolicyAcceptance` or `ElixirAccount`. On an unexpected error it returns HTTP 500 `Failed to list enrollments`. The dashboard shows a skeleton while loading and `ListError` for “Your enrolments” on failure. | Not proven to be the same missing migration. A missing column selected by Prisma would surface as 500, not the account-creation sentence. Not reproduced with a production session. |

Local contrast, same code, different database: `GET http://127.0.0.1:3000/api/v1/health` returned `migrations: ok`. `GET /api/v1/elixir` returned 401 Unauthorized, which means the Elixir route got past the schema check and stopped on auth. That local database must not be treated as production.

## 3. Database migration diagnosis and safest remediation

Production health does not name the eight pending migrations (`NODE_ENV=production` hides the list). The repository has exactly eight October 2026 folders. The count matches the handoff written on 26 Oct 2026, and live Elixir, Degree, and Event checks are still unavailable. The names below are the expected set, not a list read from production `_prisma_migrations`.

| Migration | What it adds | Live signal |
|---|---|---|
| `20261004000000_skylent_additions` | `SkylentCertificate` and related certificate columns | Certificate list depends on this table. Not probed while signed in. |
| `20261004180000_backfill_program_course_links` | Inserts missing `ProgramCourse` rows for known slug pairs. Does not delete rows. | Preflight treats this as `REVIEW` and, with `--production`, blocks until `--approve-backfill`. |
| `20261009000000_policy_acceptance` | Table `PolicyAcceptance` | This is the account-creation and new-enrolment gate. |
| `20261011000000_employer_membership_and_shared_applications` | Employer membership and `JobApplication.sharedWithEmployer` | Not probed live. |
| `20261017120000_practice_workspaces` | Practice workspace tables | Practice stays unavailable until these exist. |
| `20261024120000_quiz_grading_events` | Quiz grading columns and `Event` | Live events API is 503. |
| `20261024140000_password_reset_and_degrees` | Password-reset tokens and `Degree` | Live degrees API is 503. |
| `20261025180000_elixir_ledger_and_admin_audit` | `ElixirAccount`, ledger, reward rules (inserted disabled, amount 0), `VerifiedPayment`, `LearningResource`, `AdminAuditLog` | Live Elixir API is 503. |

Four older production-only migrations are documented in `docs/PRODUCTION.md` and are not in `prisma/migrations`. Do not delete, rename, or `migrate resolve` them.

### Safety

- These SQL files are additive (new tables, new columns, or `INSERT ... WHERE NOT EXISTS`). None of the October files contain `DROP` or `DELETE`.
- `20261025180000_elixir_ledger_and_admin_audit` has no down migration. Its own comment says rollback is restoring a backup taken before it runs.
- `20261009000000_policy_acceptance` comments a manual undo: `DROP TABLE "PolicyAcceptance"`. That drop is not a Prisma down migration and would remove consent history.
- The programme-course backfill can attach `data-science-ai` to the Data Analytics course. That is a data change, not a visual one. Do not approve it casually.
- A restorable production backup was not verified in this session.
- Do not restart Hostinger until the start command is known. If the start command is `node server.js`, the restart itself runs `prisma migrate deploy`.

### Remediation, after explicit approval

1. Confirm a restorable backup.
2. Record the Hostinger start command and the deployed commit. Set `SKYLENT_RELEASE_SHA` to that commit when the new build starts.
3. Run read-only `npm run db:preflight -- --production`. It must list the pending names and must not be pointed at the local database.
4. Stop if the names are not the eight October folders, if any migration is failed, or if the backfill is still `REVIEW` and `--approve-backfill` has not been accepted in writing.
5. Apply `prisma migrate deploy` once, on purpose. Do not mark rows applied by hand.
6. Re-check `GET /api/v1/health` for HTTP 200 and `migrations: ok`.
7. Smoke one signup, `GET /api/v1/elixir` while signed in (expect 200, not 503), `GET /api/v1/degrees`, `GET /api/v1/events`, and `GET /api/v1/certificates/mine`.

## 4. Authentication, dashboard, and enrolment

### What the code does

- `POST /api/v1/auth/login` checks the password and creates a session. It does not insert `UserEnrollment`.
- `POST /api/v1/auth/signup` creates the user and a `PolicyAcceptance` row in one transaction. If `PolicyAcceptance` is missing, it returns 503 and does not leave a user behind (`isMissingSchemaError` also returns 503).
- A new programme or course enrolment is only `POST /api/v1/lms/enrollments`. The server requires the current terms (`consent.accepted === true` and policy version `2026-10-09`). It then checks `PolicyAcceptance` again. It refuses programmes that are not in `AUTHORED_PROGRAM_SLUGS` (`data-analytics-pro`, `product-management`) or whose linked courses are not authored.
- If that user already has a row for the programme, the same POST returns the existing workspace and does not insert another row. The UI can then open the course. That is “resume”, not a second enrolment.
- After sign-in, the browser calls that POST only when login state or the OAuth return contains `enrollTarget`. That state is set when the visitor accepted the terms in the enrol dialog and was sent to `/login`. Without a stored consent token, the request omits `consent`, the server returns 400, and the browser sends the person to the programme or course page instead of creating a row (`src/pages/LoginPage.tsx`, `src/lib/policy.ts`).
- Opening `/learn/:slug` while signed in but not enrolled shows “Enrol to start learning”. It does not enrol on page load (`src/pages/LearnPage.tsx`).

### What was not reproduced

A production login was not performed. The report that “logging in alone enrols a learner” does not match `POST /login`. It does match this narrower path: the person already accepted terms for a specific programme, then finished sign-in, and the client completed that enrolment. It also matches opening a programme they were already enrolled in. Those two need a signed-in test before any enrolment code is removed.

## 5. Website-to-LMS learning-stage mapping

The approved “How learning works” experience is the live homepage section in `src/pages/home/Repolish.tsx` (`InsideProgramme`, id `how-it-works`). It is a product demo, not the learner’s account.

Stages, in order, from `LMS_STAGES`:

| Stage | What the homepage shows | What the LMS actually does | Persistence | Status |
|---|---|---|---|---|
| Programme | Data Analytics module list from authored course facts. Counts are course content, not a personal enrolment. | `/programmes/:slug`, then `POST /lms/enrollments` after terms. | `UserEnrollment` | Working in code for `data-analytics-pro` and `product-management` only. Live catalogue also marks other programmes `OPEN`. The server still rejects those as not authored. |
| Lesson | A lesson canvas for the Data Analytics example. | `/learn/:courseSlug/:lessonId` (`LearnPage`). Sequential unlock is server-side. | Lesson progress on the enrolment | Described as passing in the 26 Oct handoff on a local browser. Not re-clicked on `skylent.live` in this session. |
| Practice | Northwind lab example. | `/labs` and the Northwind lab. Practice workspaces are a separate API and stay unavailable until `20261017120000_practice_workspaces`. | Lab work tables; practice tables only after that migration | SQL lab was exercised locally on 26 Oct. Practice workspaces are blocked in production if that migration is pending. |
| Project | A project example inside the demo canvas. | Learner projects API and Career OS project pages. | `LearnerProject` | Local project tests exist. Not re-run on production here. |
| Evidence | The demo record says it is an illustrative preview and “not your account”. The Career OS block on the homepage says shared evidence is not released yet. | Career OS profile, plus certificates when `SkylentCertificate` exists. | Profile fields; certificate rows | Do not describe Evidence as a finished learner record. Certificate issue/verify worked in a local API journey on 26 Oct. Production certificate storage is not confirmed. |

The demo auto-advances while the section is on screen. Previous, next, and play/pause are manual controls. `prefers-reduced-motion: reduce` stops the timer. Do not replace this interaction with the static five cards in `/preview/homepage`.

## 6. Programme discovery and programme-detail recommendations

### Discovery

- Live `GET /api/v1/catalog/programs` returned HTTP 200 and 8 programmes on 28 Oct 2026: CAT Preparation, Data Analytics with Gen AI, Data Science & AI, Full Stack Development, Generative AI, JEE Advanced Preparation, Product Management, SQL for Business Analytics.
- An empty Explore Programmes screen is therefore not “the production catalogue has no rows”, unless the browser request failed or the client filtered every row. That screen was not clicked on the live site in this session.
- Cards in `ProgramsPage` link to `/programmes/${slug}`.
- Degree cards in `EducationPage` link through `degreePath(degree)` to the online or campus detail route. Live degree records are unavailable until the Degree migration is applied, so the live degree grid cannot show published degrees today.

### Programme page architecture (do not build in this task)

Reuse `ProgramPage` and `ProfessionalProgrammeTemplate`. Feed them from programme-specific data (catalogue row, authored course pack, images in `src/media.ts`). Do not clone a generic layout per programme.

Digital Marketing is not a catalogue slug in this repo. `src/media.ts` only has an image key `digital-marketing`. Do not invent its curriculum.

Suggested sections, filled only from verified data:

1. Overview and who it is for.
2. Prerequisites, duration, and format from the catalogue row.
3. What the authored course actually teaches.
4. Curriculum from that course’s modules and lessons.
5. Practice and projects that exist for that slug (Northwind only for Data Analytics; Harbor Desk for Product Management).
6. The same Programme → Lesson → Practice → Project → Evidence sequence, labelled as the product model.
7. Evidence the learner can actually save (profile, certificate if issued).
8. Career OS links that do not claim unpublished jobs.
9. Career pathways only where copy already exists.
10. Enrolment that uses the existing terms dialog and `POST /lms/enrollments`.
11. Links to the next real Skylent programme, not a fictional ladder.

Imagery direction, not a claim that the work already exists in the course:

- Digital Marketing, if a programme is added later: campaign, SEO, content, social, marketing analytics.
- Data Analytics: SQL, datasets, spreadsheets, dashboards. Northwind is the real lab.
- Data Science & AI: data, experiments, notebooks, model outputs. The live row exists, but new enrolment is refused until it is an authored programme. Do not show a full curriculum that is not in the course pack.

## 7. Design consistency findings

No visual redesign was applied.

- Public and LMS body text already share `--font-body` / `--font-display` (Inter) in `src/index.css`. The signed-in shell uses those tokens in `AuthDashboardShell.css`, plus `--font-mono` and `--skylent-font-heading` for small labels.
- Degree pages add a separate mono and heading stack in `Degree.css`. That is the largest typography split.
- The unapproved preview (`HomeDirectionPreview.css`) sets its own Inter stack and purple (`#5142b5`) and must not become the token source.
- Buttons differ: marketing uses `sk-btn`; the LMS uses `os-btn`. Interaction states are not one component.
- A shared token pass should name the existing brand tokens and point both skins at them. It should not restyle the homepage or the learning walkthrough.

## 8. Preserve these

- Live homepage composition and the How learning works demo, including play/pause, next/previous, scroll visibility, and reduced motion.
- `/` stays the public home. Logo links to `/`.
- Enrolment only through the explicit POST, with terms, authored-programme checks, and no duplicate row.
- Existing enrolments and their progress.
- Certificate, Elixir, and degree features staying unavailable, with the current error sentences, until the matching tables exist. Do not hide those sentences.
- The four production-only lesson-material migrations.

## 9. Prioritised fixes

Do not start these until the items in section 3 are approved.

| Priority | Fix | Acceptance | Regression |
|---|---|---|---|
| P0 | Apply the eight October migrations on production after backup, preflight, and backfill approval. | Health 200, `migrations: ok`. Signup no longer returns the policy 503. Elixir, degrees, and events no longer 503 for a missing table. | `npm run db:preflight -- --expect-none`. One local `test:migration-replay` before production. No `migrate resolve` of the four legacy rows. |
| P0 | Do not restart Hostinger until the start command is written down. | Operator note names the command. | A restart on `server.js` is observed to migrate, or it is confirmed that it does not. |
| P1 | Signed-in test of login, dashboard, Explore, and one explicit enrol. | Login alone does not add `UserEnrollment`. Enrol from the programme page does, once. A second enrol does not add a row. | Existing `test:enrollment-access` plus one account checked before and after login. |
| P1 | Confirm certificate and enrolment dashboard failures against the same account after migrate. | `GET /lms/enrollments` 200. `GET /certificates/mine` 200 with a list, possibly empty. | Dashboard no longer stuck on the enrolments skeleton or the certificate error solely because the table was missing. |
| P2 | If Explore is still empty in the browser while the catalogue API returns rows, fix the filter or the failed request. Do not invent programmes. | `/programmes` shows the eight live rows, open and not-open separated by the authored rules. | Cards open `/programmes/:slug`. |
| P3 | Token note only: map `os-btn` and degree mono fonts back to existing tokens. | No homepage diff. | Visual check of `/` and `/dashboard/student` at desktop and a narrow width. |

## 10. Unverified or needs a product decision

- The eight pending migration names were not read from production `_prisma_migrations`.
- A production signup POST was not sent.
- A production learner session was not used, so “login enrols me” and the dashboard loading states were not reproduced on `skylent.live`.
- Hostinger start command, backup, and `SKYLENT_RELEASE_SHA` are unknown.
- Whether `data-science-ai` should gain a `ProgramCourse` link to Data Analytics via the backfill.
- Whether programmes the API marks `OPEN` but the server refuses (`full-stack`, `generative-ai-program`, `sql-certificate`, `data-science-ai`) should stay listed as not open.
- Digital Marketing has no programme record. Do not write one in this task.
- Skylent AI remains `not_configured` on production and locally. That is separate from the migration 503.
- `skylent.in` is a different site. Do not edit it from this repo.
- Uncommitted work on `cursor/phase-2-core-learning-cd19` (homepage files, programme templates, `/preview/homepage`, catalogue helpers) was left untouched. It is not the live baseline.

## Evidence collected

- Git: branch `cursor/phase-2-core-learning-cd19`, ahead of origin by 1 commit (`22144ca`). Dirty working tree preserved. No commit, push, merge, or branch switch.
- Live read-only HTTP: health, Elixir, degrees, events, catalogue.
- Local read-only HTTP: health `migrations: ok`; Elixir 401 (schema present, auth required).
- Code: `schema-capabilities.ts`, `elixir.ts`, `auth.ts`, `lms.ts`, `certificates.ts`, `LoginPage.tsx`, `LearnPage.tsx`, `Repolish.tsx`, `ProgramsPage.tsx`, `EducationPage.tsx`, October migration SQL.

## Files changed

This document only: `docs/ENGINEERING_HANDOFF_2026-10-28.md`.

No application code, schema, or migration was edited. No production migration was applied.

## 11. Migration readiness — 28 Oct 2026, evening

No migration was executed. Production was not restarted, deployed, or written to. This section adds to the diagnosis above. It does not replace it.

**Recommendation: NOT READY FOR APPROVAL.**

### 11.1 The eight October migrations

Prisma applies these in filename order. Each later file assumes the earlier October files, and the September migrations already on the database, have finished. Production health still says 8 pending and does not name them. The list below is every October folder in this release. It is the expected pending set because the count matches and Elixir, Degree, and Event are still missing on the live API. It is not a list read from production `_prisma_migrations`.

| Order | ID | Depends on | Schema change | Data change | Rollback |
|---|---|---|---|---|---|
| 1 | `20261004000000_skylent_additions` | `User` and `Course` already exist. This file does not add those foreign keys. | New tables `SkylentCertificate`, `SkylentEnquiry`. Unique certificate code and one certificate per user and course. | None. | No down migration. Undo would be dropping those two empty tables. |
| 2 | `20261004180000_backfill_program_course_links` | `Program`, `Course`, and `ProgramCourse` from earlier migrations. | No new table or column. | Inserts missing `ProgramCourse` rows for six slug pairs. Skips a pair that already exists. | No down migration. Inserted rows are new random ids with no marker, so they cannot be separated later from links created by hand. Recovery is a backup restore. See 11.3. |
| 3 | `20261009000000_policy_acceptance` | `User`, and `SkylentEnquiry` from migration 1. | New table `PolicyAcceptance`. | None. | Comment in the SQL says `DROP TABLE "PolicyAcceptance"`. That is not a Prisma down migration. Dropping it deletes consent history. |
| 4 | `20261011000000_employer_membership_and_shared_applications` | `User` and `Employer`. | New table `EmployerMembership`. New column `JobApplication.sharedWithEmployer`, default false. | Existing applications stay private because of that default. | Comment says drop the column and the table. Not a Prisma down migration. |
| 5 | `20261017120000_practice_workspaces` | `User`. | Enum `PracticeWorkspaceStatus`. Tables `PracticeWorkspace`, `PracticeWorkspaceRevision`, `PracticeWorkspaceResponse`. | None. | No down migration. Enum values are not safely removable in Postgres. |
| 6 | `20261024120000_quiz_grading_events` | `QuizQuestion`, `CurriculumNode`, `AssignmentProgress`, `User`. | New nullable columns `explanation`, `maxAttempts`, `passingScore`, `grade`, `feedback`, `gradedById`, `gradedAt`. Enum value `graded` on `AssignmentStatus`. Enums and tables `Event` and `EventRegistration`. | None. Existing quiz and assignment rows keep their current values. New columns are null. | No down migration. `ALTER TYPE ... ADD VALUE` cannot be reversed without a restore. |
| 7 | `20261024140000_password_reset_and_degrees` | `User`. | Table `PasswordResetToken`. Enums for degree mode, level, and status. Tables `Institution` and `Degree`. New degrees default to `sample = true` and status `DRAFT`. | None. | No down migration. |
| 8 | `20261025180000_elixir_ledger_and_admin_audit` | `User`. | Enums for Elixir transaction, activity, resource kind, and payment status. Tables `ElixirAccount`, `ElixirTransaction`, `ElixirRewardRule`, `VerifiedPayment`, `LearningResource`, `LearningResourceEntitlement`, `AdminAuditLog`. Balance and price checks are non-negative. | Inserts five `ElixirRewardRule` rows: amount 0, `enabled = false`. | The file says there is no down migration. Rollback is restoring a backup taken before this migration. |

None of the eight files contain `DROP` or `DELETE`. That does not make them reversible.

### 11.2 Which migration each feature needs

| Feature | Required migration | Live check on 28 Oct 2026 |
|---|---|---|
| Account creation | `20261009000000_policy_acceptance` | Not re-posted. The signup 503 sentence is returned only when `PolicyAcceptance` is missing or the probe fails. |
| New programme enrolment | Same policy migration, plus the backfill only if the programme has no `ProgramCourse` row yet | Not signed in. |
| Certificates | `20261004000000_skylent_additions` | Authenticated `GET /certificates/mine` was not called. The route returns 503 when `SkylentCertificate` is missing. |
| Public enquiries that store policy acceptance | Additions, then policy | Not called. |
| Employer sharing | `20261011000000_employer_membership_and_shared_applications` | Not called. |
| Practice workspaces | `20261017120000_practice_workspaces` | Not called. |
| Quiz explanations, attempt limits, assignment grades, events | `20261024120000_quiz_grading_events` | `GET /api/v1/events` HTTP 503, `code: unavailable`. |
| Password reset tokens and degrees | `20261024140000_password_reset_and_degrees` | `GET /api/v1/degrees` HTTP 503, `code: unavailable`. |
| Elixir and admin audit | `20261025180000_elixir_ledger_and_admin_audit` | `GET /api/v1/elixir` HTTP 503 with the database-update sentence. |
| Public catalogue list | No October migration. `GET /api/v1/catalog/programs` is already HTTP 200 with 8 rows. | The backfill can change which courses a programme shows. It is not required for the list itself. |

Elixir is not blocked by the policy migration. Account creation is not blocked by the Elixir migration. They are two different missing objects inside the same pending batch.

### 11.3 Programme-course backfill

`20261004180000_backfill_program_course_links` inserts a link only when that programme and course slug both exist and the pair is not already in `ProgramCourse`:

| Programme slug | Course slug |
|---|---|
| `data-analytics-pro` | `data-analytics` |
| `data-science-ai` | `data-analytics` |
| `data-science-ai` | `python-programming` |
| `full-stack` | `full-stack-web` |
| `generative-ai-program` | `generative-ai` |
| `product-management` | `product-management` |

Why this needs a separate yes:

- It changes data, not just shape. A learner already enrolled in `data-science-ai` can gain the Data Analytics course on that enrolment when the workspace follows `ProgramCourse`.
- `db:preflight --production` blocks while this file is pending unless `--approve-backfill` is also passed. A normal PASS does not approve it.
- The new rows have random ids. After it runs, they cannot be picked out from links created later. Undo is a backup restore, not a precise delete.
- New enrolment is still limited in code to `data-analytics-pro` and `product-management`. The backfill does not by itself open Data Science, Full Stack, or Generative AI for a new signup. It can still change what an existing enrolment can open.

Do not pass `--approve-backfill` until someone accepts that Data Science may show the Data Analytics course.

### 11.4 How production starts

`server.js` is the Hostinger shim. On every start it runs `prisma migrate deploy` using `DIRECT_URL`, or `DATABASE_URL` if `DIRECT_URL` is empty. If migrate fails, the process exits and the API does not listen. The error prints the database host only.

So `node server.js` and `npm start` do apply pending migrations automatically.

`node server/dist/index.js` does not. Whether Hostinger runs `server.js` is still unverified. A restart is not a safe way to “see if it migrates”.

### 11.5 Production database target

This checkout cannot see the production connection string.

- `DIRECT_URL` in this environment is class `local`, host `127.0.0.1:5432`, database `skylent_agent_tmp`. `db:preflight --production` against it exits blocked: “Production preflight requires the Supabase session pooler on port 5432.” It does not connect when the target is local.
- The only target that preflight will accept as production is a host ending in `.pooler.supabase.com` on port 5432 (`server/src/lib/database-target.ts`). A `db.<ref>.supabase.co` host and port 6543 are rejected.
- The live app is `https://skylent.live` (`server: hcdn`). Its database URL is on that host, not in this workspace.

No project ref, user, or password is recorded here.

### 11.6 Backup

**Unverified.**

`docs/PHASE_0_STATUS.md` says the owner deferred the backup check. No backup file, Supabase backup timestamp, or tested `pg_dump` is in this workspace. This session did not open the Supabase dashboard.

### 11.7 Disposable databases

These are local only. None of them is production.

| Database | What it is |
|---|---|
| `skylent_agent_tmp` | The database this cloud machine is using. All 16 repo migrations are applied, including Elixir and degrees. Health is `migrations: ok`. It cannot rehearse the production “8 pending” state. |
| `skylent_prodsim` | Local simulation. 18 finished rows, including the four known production-only lesson-material migrations. Still pending: `20261024140000_password_reset_and_degrees` and `20261025180000_elixir_ledger_and_admin_audit`. Policy and certificates are already present. It is not an exact copy of production. |
| `skylent_qa`, `skylent_test` | Local databases with no `_prisma_migrations` table. Empty shells, not staging. |
| `skylent_prod_replay_<pid>` | Created and dropped by `npm run test:migration-replay`. Not present now. The script refuses any non-localhost URL. |
| GitHub Actions | `.github/workflows/release-gate.yml` starts a throwaway Postgres 16 named `skylent_qa` for that job only. It is not a persistent staging server. |

No staging connection string is in this workspace.

### 11.8 Execution sequence, after the blockers below are cleared

1. Someone with production access records a backup newer than the last schema change, or a `pg_dump -Fc` through the session pooler, and shows that `pg_restore --list` can read it. Name who can restore it.
2. Write down the Hostinger start command. Do not restart.
3. On a machine that has the production `DIRECT_URL`, run `npm run db:preflight -- --production`. Confirm the pending names are exactly the eight IDs in 11.1, failed count is 0, and the four lesson-material rows are “production-only, expected”.
4. Read the backfill pairs in 11.3. Only then, if accepted, re-run with `--approve-backfill`.
5. Run `npm run test:migration-replay` on localhost. It must pass before production migrate.
6. Apply `npx prisma migrate deploy` once, using the session-pooler `DIRECT_URL`. Do not use `migrate resolve`. Do not run this by restarting the site.
7. Run `npm run db:preflight -- --production --expect-none`. It must print `DECISION: PASS`.
8. Deploy or restart only after that, with `SKYLENT_RELEASE_SHA` set to the commit that was migrated.
9. Run the checks in 11.9 against `https://skylent.live`.

### 11.9 Failure handling and rollback

- If `migrate deploy` stops mid-file, health stays 503 and that migration shows as failed. Do not mark it finished. Restore the backup, or repair that one migration from the Postgres error, then deploy again.
- If the API is down because `server.js` exited on a failed migrate, the site stays down until the database error is fixed. Have the previous build ready, but do not start it against a half-applied October schema without a restore.
- Code rollback does not remove new tables, the `graded` enum value, reward rows, or `ProgramCourse` inserts.
- Elixir, enum additions, and the backfill are undone only by restoring the pre-migration backup.
- Take a fresh backup after a successful deploy as well, so a later restore does not jump back over a good migration.

### 11.10 Regression tests

Run on the disposable replay database before production, and again on production only as the read-only or single-account checks below.

| Check | Command or request | Pass |
|---|---|---|
| History matches the known production exceptions | `npm run test:migration-history` | Exit 0. |
| September history plus this release deploys on a throwaway local database | `npm run test:migration-replay` | Exit 0. The script creates and drops its own database. |
| Local env is not accepted as production | `npm run db:preflight -- --production` on this machine | `DECISION: BLOCKED` because the host is local. Already observed. |
| Signup | `npm run test:auth` on a migrated disposable database, then one new production account after deploy | 201, not the policy 503. |
| Login | Same auth test, then the new account can open a session | 200 and a session cookie. Login does not insert `UserEnrollment`. |
| Enrolment | `npm run test:enrollment-access` | A new row only after terms, only for an authored programme, and a second call does not add a row. |
| Elixir | `npm run test:elixir` locally. After production deploy, signed-in `GET /api/v1/elixir` | Not 503. Balance can be 0. Reward rules stay disabled. |
| Degrees | `npm run test:degrees-auth`. After deploy, `GET /api/v1/degrees` | Not the “not available yet” 503. An empty list is acceptable. |
| Certificates | `npm run test:certificate-verify`. After deploy, signed-in `GET /api/v1/certificates/mine` | 200 and a list, possibly empty. |
| Public catalogue | `npm run test:catalog-parity`. After deploy, `GET https://skylent.live/api/v1/catalog/programs` | Still 200. The eight current slugs are still present. Compare `ProgramCourse` results with the backfill table before calling new links correct. |

### 11.11 Blockers

1. Production pending names have not been read from `_prisma_migrations`.
2. A restorable production backup is unverified.
3. The Hostinger start command is unverified, and `node server.js` would migrate on startup.
4. The production pooler URL is not in this workspace, so production preflight has not been run against the real database.
5. The programme-course backfill is not approved.
6. No staging database was found. `skylent_agent_tmp` is fully migrated. `skylent_prodsim` is a local partial copy, not production.

**NOT READY FOR APPROVAL** until items 1–5 are closed. Item 6 means the rehearsal must be `npm run test:migration-replay` on localhost, not a migrate of `skylent_agent_tmp`.

## 12. Read-only production verification — 28 Oct 2026, 6:28 PM IST

No migrate, resolve, restart, deploy, or production write was run. No credentials are recorded in this section.

**Final status: NOT READY FOR APPROVAL.**

### 12.1 Hostinger start command

**Not verified. The live start command is not in this repository.**

What was checked:

- `package.json` `"start"` is `node server.js`. That is the npm script, not proof of the hPanel entry file. `server.js` does run `prisma migrate deploy` before listen. That fact is not the live setting.
- `railway.json` start command is `sh scripts/railway-start.sh`. That script also runs `prisma migrate deploy`, then `node server/dist/index.js`. Railway is not the host that answered for `skylent.live`.
- There is no Hostinger app manifest, Procfile, or hPanel export in the repo.
- GitHub Actions secret names and environment secrets were not readable (HTTP 403). No `.supabase` config or Hostinger credential file was on this machine.
- This machine’s `DATABASE_URL` and `DIRECT_URL` are still local `127.0.0.1:5432` / `skylent_agent_tmp`.

What the live response does prove, at 28 Oct 2026, 6:29 PM IST (`Date: Wed, 28 Oct 2026 12:59:25 GMT`):

- `GET https://skylent.live/api/v1/health` is HTTP 503 with `content-type: application/json` and the app’s own JSON body. The Node process is running.
- Response headers include `platform: hostinger` and `panel: hpanel`. The site is served by Hostinger hPanel, not by the Railway config.
- `https://api.skylent.live/api/v1/health` is HTTP 503 HTML from `server: hcdn`, not the app JSON. That hostname is not the Node health endpoint.
- `https://www.skylent.live/` is HTTP 301 to `https://skylent.live/`.

The running process still reports 8 pending migrations. That means the boot that is serving now did not finish `prisma migrate deploy`. It does not tell us what the next hPanel start command is. If the next start is `npm start` or `node server.js`, that restart will migrate. If it is `node server/dist/index.js`, it will not. Both remain possible. Do not restart to find out.

### 12.2 Production migration history

**Not read. Stopped here.**

The authorised production URL is not available. There is no Supabase session-pooler URL in this workspace, in the process environment, or in a secret store this agent can read. `db:preflight --production` was not pointed at production. `prisma migrate deploy` and `migrate resolve` were not run.

The only production-shaped signal is still the public health JSON at 6:29 PM IST:

`status: error`, `db: ok`, `migrations: pending`, `pendingMigrations: 8`, `failedMigrations: 0`, `ai: not_configured`, `release: unknown`.

`GET /api/v1/elixir` is still HTTP 503 with the database-update sentence. That shows `ElixirAccount` is absent. It does not name the other seven pending ids.

### 12.3 Backup and restore

**Unverified. Not claimed restorable.**

No Supabase backup timestamp, backup scope, or restore drill is in this repo or on this machine. `docs/PHASE_0_STATUS.md` records that the owner deferred the backup check. `docs/PRODUCTION.md` describes the procedure an operator should use (Supabase → Database → Backups, or `pg_dump -Fc` through the session pooler and `pg_restore --list`). That procedure was not executed. No production restore was performed.

### 12.4 Programme-course backfill

Not executed.

The file `20261004180000_backfill_program_course_links` inserts only these pairs, and only when both slugs exist and the pair is not already linked:

| Programme | Course it would gain |
|---|---|
| `data-analytics-pro` | `data-analytics` |
| `data-science-ai` | `data-analytics` |
| `data-science-ai` | `python-programming` |
| `full-stack` | `full-stack-web` |
| `generative-ai-program` | `generative-ai` |
| `product-management` | `product-management` |

It does not update `UserEnrollment` rows. It does change what an enrolment can open if the app follows `ProgramCourse`. The sharp case is an existing `data-science-ai` enrolment gaining the Data Analytics course. New enrolment is still limited in code to `data-analytics-pro` and `product-management`, so this insert does not by itself open the other programmes to a brand-new signup.

Recovery, if it must be undone:

- Safe recovery is restore of a backup taken before the migration. That is not verified to exist.
- A surgical delete is not safe after the fact. New rows get random ids and are not tagged. They cannot be distinguished from a link created later.
- The only surgical option is to snapshot the existing `ProgramCourse` ids for those six pairs **before** deploy, in the same read-only preflight session, and delete only ids that appear afterwards. That snapshot has not been taken, because the production URL is unavailable. Do not delete by slug after the fact.

`db:preflight --production` blocks while this migration is pending unless `--approve-backfill` is passed. Do not pass that flag until the Data Science link is accepted in writing.

### 12.5 Remaining blockers

1. Hostinger start command is not in deployment config that this agent can read. Live headers prove hPanel, not the entry file.
2. Production session-pooler URL is unavailable, so applied and pending migration ids were not read.
3. Backup timestamp, scope, and a tested restore are unverified.
4. Programme-course backfill is not approved, and the pre-insert id snapshot was not taken.

**NOT READY FOR APPROVAL.**

## 13. Operator actions for the four open blockers — 28 Oct 2026, 6:31 PM IST

Still no migrate, restart, deploy, or production write. A person with Hostinger hPanel access and a person with Supabase access must do the steps below. This agent cannot see either panel. Do not paste passwords, full connection strings, or backup files into chat or git.

**Final status remains NOT READY FOR APPROVAL** until every check in this section is actually recorded.

### 13.1 Blocker: live start command

**Who:** someone who can open the Hostinger account that owns `skylent.live`.

**Where:** hPanel → Websites → the Node.js web app for `skylent.live`. Hostinger’s current docs call the start setting **Entry file** (Build settings). It must be a `.js`, `.mjs`, or `.cjs` path. For Express or Other, that path is relative to the repository root. Also record, from the same deploy screen and from Deployments:

- Application type / framework preset
- Node.js version
- Build script
- Output directory, if shown
- Package manager
- The latest deployment time and the git branch or commit it built

**Record only the entry file text, character for character.** Examples that mean different things:

| Entry file shown | What the next start does |
|---|---|
| `server.js` | Runs `prisma migrate deploy`, then the API. A restart migrates. |
| `dist/server.js` or `server/dist/index.js` | Starts the API and does not migrate. |
| empty, or a Vite/static preset with no entry file | No Node server from that field. This would not match the JSON health response we already see, so look for a second app. |

`package.json` `"start": "node server.js"` is not this setting. `railway.json` is not this host. Live headers at 6:29 PM IST (`platform: hostinger`, `panel: hpanel`) prove the site is hPanel. They do not prove the entry file.

Do not click Restart or Redeploy while reading the screen.

### 13.2 Blocker: production database URL

**Who:** someone allowed to view environment variables for that same Node.js app, or the Supabase project that app uses.

**Obtain, and keep on that person’s machine only:**

- `DATABASE_URL`
- `DIRECT_URL`
- Confirmation both are the Supabase **session** pooler: host ends with `.pooler.supabase.com`, port `5432`, same database name
- Reject `localhost`, `127.0.0.1`, port `6543`, and host `db.<ref>.supabase.co`

**How to verify the target without exposing the secret:**

1. Put the URLs in the environment of a trusted shell. Do not commit them and do not paste them here.
2. Run `npm run db:preflight -- --production`.
3. Keep only these lines: `Database host`, `database`, `Target`, `port`, every `applied` / `pending` / `FAILED` / `production-only` line, and `DECISION`.
4. Stop unless `Target` is `session-pooler` and `port` is `5432`. This workspace’s URL is `127.0.0.1` / `skylent_agent_tmp` and correctly returns `DECISION: BLOCKED`. That run is not production.

If the pooler URL cannot be obtained, stop. Do not point preflight at `skylent_agent_tmp`, `skylent_prodsim`, or `skylent_qa`.

### 13.3 Read-only migration inspection

Run this only after 13.2 has a session-pooler target. Do not run `prisma migrate deploy`, `migrate resolve`, `db push`, or `db seed`.

Preferred command, from this repo, with production `DIRECT_URL` in the environment:

```sh
npm run db:preflight -- --production
```

It opens one `READ ONLY` transaction, prints migration names, and does not write. Expected shape if the earlier count of eight is this October set:

- Pending, in this order: `20261004000000_skylent_additions`, `20261004180000_backfill_program_course_links`, `20261009000000_policy_acceptance`, `20261011000000_employer_membership_and_shared_applications`, `20261017120000_practice_workspaces`, `20261024120000_quiz_grading_events`, `20261024140000_password_reset_and_degrees`, `20261025180000_elixir_ledger_and_admin_audit`
- Production-only, expected: `20260906190000_lesson_materials`, `20260907100000_lesson_material_upload_status`, `20260907120000_curriculum_node_notes_body`, `20260907140000_assignment_attachment_upload_status`
- No `FAILED` row and no `production-only, UNKNOWN` row

If the names differ, stop. The number 8 is not proof.

Equivalent SQL, still inside `BEGIN READ ONLY`:

```sql
BEGIN READ ONLY;
SELECT migration_name, started_at, finished_at, rolled_back_at, applied_steps_count
FROM "_prisma_migrations"
ORDER BY started_at NULLS LAST, migration_name;
COMMIT;
```

A row with `finished_at` set and `rolled_back_at` null is applied. A row with both timestamps null is failed. Do not update the table.

### 13.4 Blocker: backup evidence required before any approval

**Who:** someone who can open the Supabase project used by the pooler URL above.

**Required evidence, before anyone approves a migrate:**

- Supabase → Database → Backups shows a backup **newer than the last schema change**, with the timestamp and whether it is daily, PITR, or a manual snapshot. Or a `pg_dump -Fc` taken through the session pooler, plus `pg_restore --list` output that reads that file.
- The database name on that backup matches the database name printed by preflight.
- A named person who can restore, and the restore path (Supabase restore, or `pg_restore` onto a new database first — not onto production as a test).
- A statement that the dump or snapshot has not been restored onto production.

This session did not see any of that. **Backup remains unverified and is not claimed restorable.** Do not perform a production restore.

### 13.5 Backfill stays separate

`prisma migrate deploy` applies every pending folder in order. The backfill file is second in the October list, **before** policy acceptance. A normal deploy cannot turn on account creation and skip the backfill.

So the backfill is not part of a blanket “approve the eight.” It needs its own written yes, after the operator has seen which of the six pairs are already present. Capture that with read-only SQL before any deploy. Do not run the insert.

```sql
BEGIN READ ONLY;
SELECT p.slug AS programme, c.slug AS course, pc.id
FROM "ProgramCourse" pc
JOIN "Program" p ON p.id = pc."programId"
JOIN "Course" c ON c.id = pc."courseId"
WHERE (p.slug, c.slug) IN (
  ('data-analytics-pro', 'data-analytics'),
  ('data-science-ai', 'data-analytics'),
  ('data-science-ai', 'python-programming'),
  ('full-stack', 'full-stack-web'),
  ('generative-ai-program', 'generative-ai'),
  ('product-management', 'product-management')
)
ORDER BY p.slug, c.slug;
COMMIT;
```

Pairs missing from that result are the ones the migration would insert. The Data Science → Data Analytics row is the one that can widen an existing enrolment. Recovery if that insert is later rejected is a backup restore, unless the id list above was saved first and only new ids are removed. That list has not been saved. Do not pass `--approve-backfill` until this result is reviewed.

### 13.6 What is still blocked

| Blocker | Human action | Status |
|---|---|---|
| hPanel entry file | Open the `skylent.live` Node.js app and copy the Entry file, Node version, and latest deployment. Do not restart. | Not done. |
| Production pooler URL | Put `DATABASE_URL` and `DIRECT_URL` in a trusted shell and run `npm run db:preflight -- --production`. Share only host, port, database name, and the migration lines. | Not done. URL is not in this workspace. |
| Backup | Record timestamp, scope, database name, and who can restore. Run `pg_restore --list` or show the Supabase backup row. | Unverified. |
| Backfill approval | Run the read-only pair query, then accept or reject the Data Science link in writing. | Not approved. Not executed. |

**NOT READY FOR APPROVAL.** None of the four checks is verified.

