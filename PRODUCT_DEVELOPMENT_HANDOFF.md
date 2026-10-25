# Product development handoff

Date: 25 October 2026, about 22:00 IST (Asia/Calcutta, UTC+5:30).

This work is not a production deployment. Production release remains **BLOCKED**. Do not restart Hostinger. Do not run `npm start` or `node server.js` against production. Do not run production migrations.

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

## Production prerequisites

Still required before any production use:

1. Do not deploy this branch until a human has a restorable backup, a read-only production preflight, the Hostinger start command, and a written decision on the `ProgramCourse` backfill. See `PRODUCTION_HANDOFF.md` on PR #205.
2. Apply `20261025180000_elixir_ledger_and_admin_audit` only after that preflight includes this new name and the operator approves it.
3. Confirm the Hostinger start command. `npm start` runs migrations.
4. Set `SKYLENT_AI_PROVIDER` and `SKYLENT_AI_API_KEY` on the server if lesson AI should call a model. Do not paste the key into chat. Do not set `SKYLENT_AI_ALLOW_GROUNDED` in production.
5. Create the first super admin with the existing bootstrap script. Do not promote a normal learner by hand in the database.
6. Leave learning-reward amounts at 0 until someone chooses them.
7. Do not start A/B tests.

## Rollback

Redeploy the previous application build. That does not remove Elixir tables, reward rows, or audit rows. Lesson progress recorded before or after this release remains. If the new migration must be undone, restore the database backup taken before it. Do not delete ledger rows and do not run `prisma migrate resolve`.
