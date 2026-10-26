# Product development handoff

Date: 25 October 2026, about 22:00 IST (Asia/Calcutta, UTC+5:30). Operator checks below were confirmed from the repository and a public read at 23:14 IST the same day.

This work is not a production deployment. Production release remains **BLOCKED**. Do not restart Hostinger. Do not run `npm start` or `node server.js` against production. Do not run production migrations. Backup investigation was deferred by the owner. It is still required before any migration, and this update does not add backup steps.

## What a founder can use

Three things are now in the application, on a local database only:

1. **Super Admin** is the existing administrator role. An ordinary signup still becomes a student. An administrator can review users, courses, programmes, enrolments, Elixir, payments they have recorded, Skylent AI status, and an audit log.
2. **Elixir** is learning credit inside Skylent. It is not cash, it cannot be withdrawn, and it cannot be sent to another person. A verified net purchase of ₹100 earns 10 Elixir. ₹500 earns 50. Learning rewards stay at zero until a super admin turns a rule on.
3. **Skylent AI** on a lesson now says why it cannot answer. If the learner is not enrolled, the panel says the lesson cannot be opened. If the previous lesson is unfinished, it says so. If the server has no AI key, it says Skylent AI is not switched on. That last case is what happened in this environment.

## Skylent AI: evidenced cause

The public site assistant and the lesson assistant are different.

- Before login, the programme finder in `SiteAssistant` answers from fixed catalogue rules. It does not need an AI key.
- After login and enrolment, the lesson panel calls `GET /api/v1/lms/ai/status` and `POST /api/v1/lms/ai/ask`.
- `isAiConfigured()` is false unless `SKYLENT_AI_API_KEY` is set, or the non-production `lesson-grounded` preview is explicitly selected. Production still refuses to treat `lesson-grounded` as the live model. That rule was not changed.
- On this machine the local API process had no `SKYLENT_AI_*` variables. `scripts/test-elixir.ts` then checked a real enrolled learner:
  - Before enrolment, status for `data-analytics` lesson `l1` was `access: enrolment_required` and `available: false`.
  - After enrolment, lesson `l1` was `access: ok`.
  - Lesson `l2` stayed `access: locked`.
  - The ask returned HTTP 503 `code: not_configured`.
- A missing key is not an enrolment bug. Enrolment, locking, and consent behaved as they did before.
- The lesson route used to turn every failure into one sentence. It now returns `not_configured`, `unavailable` for a schema or database problem, or `provider_error` when a configured model fails. The provider's own text is not sent to the browser.
- The site assistant, after login, still answers progress questions from a fixed sentence. If loading enrolment names throws, it continues without those names instead of failing the whole chat.
- Production's AI key was not read. A human with Hostinger access must confirm `SKYLENT_AI_PROVIDER=openai-compatible` and that `SKYLENT_AI_API_KEY` is set, without pasting the key into chat. Until that is true, enrolled learners will see that Skylent AI is not switched on.

## Super Admin

The API role `superadmin` is still the database role `ADMIN`. The browser cannot choose its own role. Every new admin route uses `requireAuth` and `requireRoles("superadmin")`. Writes also require the CSRF cookie.

Existing user, organisation, employer, enquiry, practice, and lesson-video tools remain. This change adds:

- Course and programme counts, plus a recent enrolment list.
- Elixir rules, balances, adjustments, and resource prices.
- A place to record a verified payment and to refund it.
- Aggregate reports.
- Skylent AI diagnostics: provider name, whether a key is present, and the last failure code in this process. The key itself is not returned.
- An audit row for role changes, Elixir changes, recorded payments, refunds, and new resources.

There is still no separate "make me super admin" button for a student. The existing `bootstrap:superadmin` script remains the way to promote one operator.

## Elixir

Formula, in whole rupees of eligible net value:

`earned = floor(eligibleNetRupees / 10)`

Examples checked by `scripts/test-elixir.ts`: ₹100 → 10, ₹500 → 50, ₹109 → 10, ₹9 → 0.

Awards happen only when a super admin records a payment with status `succeeded`. Pending, failed, and cancelled payments award 0. The same external reference cannot award twice.

This website still does not collect card or UPI payments. The amount is the net figure the operator attests. Taxes and discounts are not calculated here. Do not invent them.

Learning rewards exist for completing a lesson, passing a quiz, reaching a quiz score, submitting an assignment, and completing a case study that a super admin has linked to that lesson. All five rules are inserted disabled with amount 0. The server awards them only from saved progress, not from a browser event. The same lesson or quiz cannot be claimed twice. A cooldown blocks a different lesson of the same type until it expires.

Notes and case studies can have an Elixir price. The price is shown before purchase. The balance and the unlock are written in one database transaction. Two purchases at once cannot both succeed when the balance covers only one. The balance cannot go below zero.

Refunds: if the reward is still in the balance, it is removed and a reversal row is kept. If it was already spent, the balance stays at zero and the reversal records the unrecovered amount. History is not deleted.

The displayed balance is checked against the sum of the ledger. The learner sees a warning when they differ.

## Database

New migration: `prisma/migrations/20261025180000_elixir_ledger_and_admin_audit`.

It adds enums and empty tables: `ElixirAccount` (balance cannot be negative), `ElixirTransaction` (unique idempotency key), `ElixirRewardRule`, `VerifiedPayment`, `LearningResource`, `LearningResourceEntitlement`, and `AdminAuditLog`. It inserts five disabled reward rules. It does not update existing user, course, or enrolment rows.

There is no down migration. A code rollback does not remove these tables. Recovery is a database backup taken before the migration.

It was applied only to the local database `skylent_agent_tmp` on `127.0.0.1`. `npm run test:production-migration-replay` applied it on a throwaway local database and passed. Production was not migrated.

If this code is deployed before the migration, Elixir routes return HTTP 503 and lesson completion still saves. Health will count this folder as one more pending migration on top of whatever production already has pending. That count is not a verified production history.

## Tests

All of these passed on 25 October 2026:

| Command | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npx tsc -p tsconfig.backend.json --noEmit` | pass |
| `npm run build` | pass |
| `npx tsx scripts/test-elixir.ts` | pass: formula, duplicate payment, cooldown, quiz threshold, concurrent spend, refund shortfall, student forbidden, super admin allowed, AI access before and after enrolment |
| `npx tsx scripts/test-skylent-ai.ts` | pass |
| `npx tsx scripts/test-ai-policy.ts` | pass |
| `npx tsx scripts/test-migration-history.ts` | pass |
| `npx tsx scripts/test-production-migration-replay.ts` | pass on a throwaway local database |
| `npx tsx scripts/test-auth.ts` | pass |
| `npx tsx scripts/test-consent.ts` | pass |
| `npx tsx scripts/test-enrollment-access.ts` | pass |
| `npx tsx scripts/test-lms.ts` | pass after the local API was restarted to clear its in-memory signup limit |
| `npx tsx scripts/test-career.ts` | pass after the same kind of local restart |

The first LMS and career runs failed with "Too many attempts" because the local API limits signups in memory. Restarting that local process cleared the limit. Production was not restarted.

These tests do not prove production is healthy.

## A/B testing

Do not start an experiment on production. There is no experiment assignment, exposure log, or kill switch. `ExperimentPage` is a lab notebook, not an A/B test.

Before any test, the minimum build is:

- A server-owned assignment of each eligible learner to control or variant, stable for the experiment.
- An exposure event when they actually see the variant.
- Outcome events for the metric below.
- A kill switch that forces everyone back to control.
- Consent that covers product analytics. Do not send private lesson text, payment references, or AI prompts to an analytics vendor.

No historical conversion rate is known, so no sample size or promise of significance is stated here. Pick the audience only from learners who can see the feature. Stop if error rates, failed purchases, or support contacts rise above the control.

| Experiment | Control | Variant | Audience | Primary metric | Guardrails |
|---|---|---|---|---|---|
| Elixir and engagement | Rewards remain off | One super-admin-configured lesson reward | Enrolled learners in one course | Share who complete the next lesson within 7 days of an award | Lesson-complete errors, duplicate awards, negative balances |
| Notes and case studies | Price hidden | Price shown before purchase | Learners with a balance and a published resource | Share who unlock a resource | Double-spend, 500 responses, refunds that go negative |
| Skylent AI | Current panel | Panel plus one in-lesson prompt | Enrolled learners on an authored lesson while AI is configured | Share of opened lessons that receive one successful answer | 401, 403, 502, 503, and provider-error rate |

Duration and stop: run only after the metric can be counted, review at a pre-agreed checkpoint, and stop immediately from the kill switch. Do not launch these until the production blockers below are cleared and the AI key question is answered.

## How to verify locally

Use a local database, not production.

1. Sign in as a super admin.
2. Open the admin dashboard. Confirm a student receives 403 on `/api/v1/admin/elixir/rules`.
3. Record a succeeded payment of 100 rupees for a test learner. The balance becomes 10. Record the same reference again. The balance stays 10.
4. Turn on one learning rule, complete that kind of lesson once, and confirm a second completion does not add Elixir.
5. Publish a note with a price and buy it from the student dashboard. Confirm the balance drops by the price and a second buy is refused.
6. Refund the payment. Confirm the balance does not go negative and the ledger still shows the reversal.
7. Open an enrolled lesson. With no AI key, the ask is HTTP 503 `not_configured`. With a key, an enrolled unlocked lesson returns an answer and a locked lesson does not.

## Operator checks, 25 October 2026, 23:14 IST

`origin/main` moved to `7aa7450989bf827de45f1f1fdf4d115b94ef90a7` when PR #208 merged (25 October 2026, 23:23 IST). That commit adds Elixir to the release gate. Production credentials are not configured for an agent checkout: a local `.env` must not be treated as production. `npm run db:preflight -- --production` refuses that local target before it connects.

Public reads, no login and no database connection:

- `GET https://skylent.live/api/v1/health` returned HTTP 503 `{"status":"error","db":"ok","migrations":"pending","pendingMigrations":8,"failedMigrations":0}`. Names were omitted. Headers said Hostinger.
- `GET https://skylent.live/` returned HTTP 200 and `/assets/index-DI03b6xv.js`. That hash is not in git, so it does not prove the SHA.
- `GET /api/v1/elixir` and `GET /api/v1/admin/elixir/rules` returned HTTP 503 `code: unavailable`. The Elixir tables are not visible to the running app.
- `GET /api/v1/admin/ai` without a session returned HTTP 401. The route exists and does not show configuration to an anonymous caller.
- `GET https://api.skylent.live/api/v1/health` returned Hostinger’s HTML 503, “The server is temporarily busy.”

### Read-only production preflight

`npm run db:preflight` runs `tsx scripts/check-migration-history.ts`. It opens one `READ ONLY` transaction, reads `_prisma_migrations`, and prints host, database name, target class, port, applied names, pending names, failed rows, and production-only rows. It ends with `DECISION: PASS` or `DECISION: BLOCKED`. The error path replaces the URL text with `<DATABASE_URL>`. It does not print the user or password. `PASS` is not approval to migrate.

`npm run db:preflight -- --production` connects only when `DIRECT_URL` (or `DATABASE_URL` if that is empty) is the Supabase session pooler on port 5432. Any other target, including localhost and port 6543, is `BLOCKED` before a connection is opened. If `20261004180000_backfill_program_course_links` is pending, `--production` stays blocked until the same command also includes `--approve-backfill`.

`import "dotenv/config"` loads a local `.env` only for variables that are not already set. An exported `DIRECT_URL` wins. If the operator forgets to export it, a checkout that contains `.env` will inspect that file’s database.

An authorized operator, on a trusted machine, from commit `209f43b5b12b5fd383aa4eca72f80b0f6fb2674f`:

1. Put the production session-pooler URL in the shell as `DIRECT_URL`. Take it from the host’s secret store. Do not paste it into chat, a ticket, or a shell history that is shared. The shape is `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`. The user is `postgres.<ref>`. The port is **5432**.
2. Before the preflight, print only host, port, and database name. Stop unless the host ends with `.pooler.supabase.com`, the port is `5432`, and the database name is the intended project. Stop for `localhost`, `127.0.0.1`, port `6543`, or host `db.<ref>.supabase.co`.
3. Run `npm run db:preflight -- --production` and record the exit code. Add `--approve-backfill` only after a person has accepted the `ProgramCourse` insert.
4. Keep the host line, the database name, every `pending`, `FAILED`, and `production-only` line, and the final `READY`, `OK`, or `BLOCKED` line. Discard the URL.

Stop the release if the exit code is not 0, any row is `FAILED`, any row is `production-only, UNKNOWN`, or the pending names are not exactly:

1. `20261004000000_skylent_additions`
2. `20261004180000_backfill_program_course_links`
3. `20261009000000_policy_acceptance`
4. `20261011000000_employer_membership_and_shared_applications`
5. `20261017120000_practice_workspaces`
6. `20261024120000_quiz_grading_events`
7. `20261024140000_password_reset_and_degrees`
8. `20261025180000_elixir_ledger_and_admin_audit`

The four history rows that should appear as `production-only, expected`, and must not be deleted or resolved, are `20260906190000_lesson_materials`, `20260907100000_lesson_material_upload_status`, `20260907120000_curriculum_node_notes_body`, and `20260907140000_assignment_attachment_upload_status`.

After a later approved migrate, the same command with `--expect-none` must exit 0 and print `OK: database schema matches this release.`

### Hostinger startup command

Repository evidence is not the live setting. `package.json` `"start"` is `node server.js`. `server.js` runs `prisma migrate deploy` and exits without starting the API if migrate fails. `node server/dist/index.js` does not migrate. `railway.json` is Railway, not Hostinger.

What proves the live command is a screenshot of the Node.js application that serves `https://skylent.live`, with every environment value covered. Record only:

- The startup command or entry file, character for character.
- The selected Node.js version. This repository expects Node.js 22 or newer.
- The deployed git commit, branch, or upload time, whichever the panel shows.

The panel is hPanel → the Node.js app for `skylent.live`. Do the same if a separate app exists for `api.skylent.live`. At 23:14 IST that hostname was not serving the Node health JSON.

If the command is `npm start` or `node server.js`, the next restart applies migrations. The process that answered at 23:14 IST was already running with 8 pending migrations, so that boot did not finish `prisma migrate deploy`. That does not identify the command configured for the next start.

### Skylent AI configuration, without the key

`GET /api/v1/admin/ai` is limited to a signed-in super admin. The JSON from `readAiDiagnostics()` is only:

- `configured`: true only when a provider can actually be built. A key with an invalid base URL is false, reason `invalid_base_url`.
- `provider`: the lowercase `SKYLENT_AI_PROVIDER`, or `unset`
- `keyPresent`: true when `SKYLENT_AI_API_KEY` is non-empty
- `reason`: `ready`, `grounded_preview`, `provider_off`, `grounded_blocked`, `missing_key`, or `invalid_base_url`
- `lastFailure`: a code and time for this process, or null

The key, base URL, and model are not in that response. An anonymous call is 401, which was observed. It does not say whether a key is set.

A super admin, in a browser already signed in on `https://skylent.live`, opens the admin dashboard’s Skylent AI section or requests `GET /api/v1/admin/ai` with the existing session. Record those four fields. Do not copy any value that looks like a key. In hPanel, with the value covered, also record whether `SKYLENT_AI_API_KEY` is non-empty, the provider string, and that `SKYLENT_AI_BASE_URL` is an `https` URL. The model name is not a secret. Do not set `SKYLENT_AI_ALLOW_GROUNDED`.

How to read the result:

- `provider` `off` or `none`: not configured, even if a key is present.
- `provider` `lesson-grounded` without `SKYLENT_AI_ALLOW_GROUNDED=1` in production: `reason` `grounded_blocked`. Leave that flag unset.
- `provider` `lesson-grounded` with the flag set: `reason` `grounded_preview`. That is the test provider, not a vendor model.
- Any other provider: `configured` is true only for `reason` `ready`. `missing_key` and `invalid_base_url` are not ready. Confirm the base URL is `https` in the panel without copying it.
- The public site chat at `POST /api/v1/reva/chat` requires a key even when the lesson assistant is on `lesson-grounded`. A working programme finder does not mean the lesson model is configured.

### CI coverage for Elixir

PR #208 added `npm run test:elixir` to the release gate, with `API_BASE` on port 3099, and asserts the Elixir migration folder exists. That run is on the pull request for `fc10eea`’s follow-up, not a production check. The workflow still does not run on a push to `main`, so a merge commit has no Actions run unless a pull request triggered it. `scripts/test-smoke-decision.ts` checks the public smoke rules without calling production. `npm run smoke:public` is the live probe and fails closed when health is not fully ready.

## Production prerequisites

Still required before any production use:

1. Do not restart Hostinger and do not migrate until the read-only preflight above has been recorded, the startup command is known, and a person has approved the `ProgramCourse` backfill. The owner deferred backup investigation. A restorable backup is still required before the migrate itself.
2. Apply `20261025180000_elixir_ledger_and_admin_audit` only after that preflight lists it as pending and the operator approves the set.
3. Confirm the Hostinger start command from the hPanel screenshot described above. `npm start` and `node server.js` run migrations.
4. Verify Skylent AI with `GET /api/v1/admin/ai` as a super admin. Record `configured`, `provider`, and `keyPresent` only. Do not paste the key. Do not set `SKYLENT_AI_ALLOW_GROUNDED` in production.
5. Create the first super admin with the existing bootstrap script. Do not promote a normal learner by hand in the database.
6. Leave learning-reward amounts at 0 until someone chooses them.
7. Do not start A/B tests.

## Rollback

Redeploy the previous application build. That does not remove Elixir tables, reward rows, or audit rows. Lesson progress recorded before or after this release remains. If the new migration must be undone, restore the database backup taken before it. Do not delete ledger rows and do not run `prisma migrate resolve`.
