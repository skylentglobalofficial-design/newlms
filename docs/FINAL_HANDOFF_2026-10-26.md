# Skylent final handoff — 26 October 2026

Time of this document: 21:46 IST (Asia/Calcutta, UTC+5:30).

This is a local QA and handoff note. It is not a production release approval.

## A. Executive summary

**Production decision: NO-GO.**

The local application at commit `1d84bdc` passed TypeScript, the production build, and the core learner test scripts. Browser checks on the local site covered enrolment, lesson unlock, quiz fail and pass, assignment submit, graded resubmission, the Northwind SQL lab, the Harbor Desk case, Career OS, and public certificate verification.

`https://skylent.live/api/v1/health` is still HTTP 503 with eight pending migrations, AI not configured, and `release: unknown`. A restorable backup and the Hostinger start command are still unverified. A restart may apply migrations. Do not deploy or restart production from this handoff.

## B. Repository state

| Item | Value |
|---|---|
| Branch | `cursor/phase-2-core-learning-cd19` |
| HEAD at the start of this QA | `1d84bdc5f2d2f5bfab5620829bf7b88f19b3e8f8` |
| `origin/main` | `d38424e7ee7c2982438ac31e1329582f0e3f6e4b` — merge of PR #211, 26 Oct 2026, 21:00 IST |
| Tree of HEAD vs that merge | Empty diff. HEAD is contained in `main`. |
| Working tree before this document | Clean |
| PR #211 | Merged. Release-gate run [40349802943](https://github.com/skylentglobalofficial-design/newlms/actions/runs/40349802943) succeeded on the pull-request head `1d84bdc`. No Actions run was found for the merge commit `d38424e`. Supabase Preview was skipped. |
| This QA | No application code was changed, and nothing was pushed, merged, or deployed. This file is the documentation commit. |

`https://skylent.in` is a separate Next.js site. Its source is not this repository. It is not changed here.

## C. Test evidence

Local database: `127.0.0.1` database `skylent_agent_tmp`. Not production. Local API `http://127.0.0.1:3000` health was 200, `migrations: ok`, `ai: not_configured`. Vite was on port 5174.

### Automated checks, 26 Oct 2026, 21:21–21:23 IST

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npx tsc -p tsconfig.backend.json --noEmit` | PASS |
| `npm run build` | PASS |
| `test:assignment-flow` | PASS |
| `scripts/test-degree-catalogue.ts` | PASS |
| `test:password-reset` | PASS |
| `test:password-reset-http` | PASS |
| `test:ai-policy` | PASS |
| `test:da-content` | PASS |
| `test:pm-content` | PASS |
| `test:migration-history` | PASS |
| `test:production-env` | PASS |
| `test:catalog-parity` | PASS |
| `test:certificate-verify` | PASS |
| `test:storage` | PASS |
| `test:auth` | PASS |
| `test:consent` | PASS |
| `test:enrollment-access` | PASS |
| `test:lms` | PASS. Covers assignment submit, draft-after-submit, draft-after-grade, and graded resubmit clearing the grade. |
| `test:quiz-guard` | PASS |
| `test:quiz-limits` | PASS |
| `test:labs` | PASS |
| `test:labs-sql` | PASS |
| `test:labs-visual` | PASS |
| `test:projects` | PASS |
| `test:second-flagship` | PASS |
| `test:career` | PASS |
| `test:career-evidence` | PASS |
| `test:employer` | PASS |
| `test:events` | PASS |
| `test:degrees-auth` | PASS |
| `test:migration-replay` | PASS. Created and dropped its own local database. |
| `scripts/qa-learner-journey.ts` | 45/46. The AI step returned HTTP 503 `Skylent AI isn't available yet.` All other steps passed, including quiz lock, Northwind lab, project, Career OS, and certificate issue plus verify (`SKL-2026-DA-0A63E800`). |

`test:ai:live` was not run. It needs a real model key.

### Browser checks, local Vite, about 21:24–21:46 IST

Desktop 1280px unless noted. No application code was changed to make these pass.

| Flow | Result |
|---|---|
| Home, programmes, Data Analytics course | PASS. No page errors. Overflow 0 at 1280 and 390. |
| `/education` | PASS. Sample listings. “Skylent does not award degrees.” |
| `/events` | PASS. “No events are scheduled.” |
| Login and `/reset-password` | PASS at 1280 and 390. |
| Sign up and land on the learner dashboard | PASS |
| Enrol in Data Analytics from “Start this course” | PASS. Opened `/learn/data-analytics/l1`. |
| Complete lessons 1, 2, 4, and 5 | PASS. Each “Complete and continue” or “Continue” moved to the next lesson. |
| Quiz, wrong answers | PASS. “Not all answers were correct.” |
| Quiz, correct answers | PASS. Page showed “Assessment passed” and “3 of 15 complete”. Lesson 4 then opened. |
| Assignment submit on lesson 6 | PASS. “Submission recorded.” |
| Graded resubmit | PASS. After a local grade of 80 was written on that row, the page showed the grade and “Revise and resubmit”. Submit revision did not send a draft. The grade left the page. |
| Northwind SQL | PASS. Example “Revenue by category” returned 4 rows (Electronics, Apparel, Home, Grocery). Overflow 0 at 390. |
| Product Management | PASS. Dashboard showed the enrolment at 0 of 15. Harbor Desk opened as “NOT STARTED”, 0 of 6 tasks. Overflow 0 at 390. |
| Career OS, profile, jobs, applications | PASS for load and overflow 0, including jobs at 390. Jobs correctly say no roles are published. Applications say nothing is there yet. |
| Certificates | Public verify of `SKL-2026-DA-0A63E800` showed “Valid certificate”, course Data Analytics, issue date 26 October 2026. The dashboard for the browser learner, at 6 of 15 lessons, said no certificate yet. The Claim button was not shown, which matches an incomplete course. The page also shows a “coming soon” chip because `src/lib/truth.ts` keeps certificates in `development` until a production check. |

## D. Feature status

| Journey | Status | Evidence |
|---|---|---|
| Programme selection and enrolment | PASS | Browser enrol into Data Analytics and Product Management. `test:lms`, `test:enrollment-access`. |
| Lesson completion and sequential unlock | PASS | Browser completed lessons 1, 2, 4, and 5. A wrong quiz stayed on the check. After a correct quiz, lesson 4 opened. `qa-learner-journey.ts` recorded a failed attempt with lesson 4 still locked, and a passed quiz that unlocked it. |
| Quiz pass/fail and attempt limits | PASS | Browser fail and pass. `test:quiz-guard`, `test:quiz-limits`. |
| Assignment submission | PASS | Browser submit on lesson 6. `test:lms`. |
| Assignment grading | PASS | `test:lms` and a local grade row shown in the UI. Not graded through the faculty UI in this session. |
| Graded resubmission and grade reset | PASS | Browser resubmit. `test:lms` step 13c. |
| Data Analytics SQL workspace | PASS | Browser query result. `test:labs-sql`, `test:labs-visual`. |
| Product Management case workspace | PASS | Harbor Desk page opened, not started. `test:second-flagship`. |
| Career OS profile, jobs, applications | PASS | Pages loaded. No published jobs, so apply and share were not exercised. `test:career`, `test:employer`. |
| Certificate eligibility | PASS | Incomplete course shows no claim. |
| Certificate issuance | PASS in the API journey only | `qa-learner-journey.ts` issued a certificate. The browser Claim button was not available at 6/15. |
| Public certificate verification | PASS | Browser `/verify/SKL-2026-DA-0A63E800`. |
| Degree catalogue | PASS for samples | Browser `/education`. `test:degree-catalogue`. Live `GET /api/v1/degrees` is 503, so published degrees were not shown. |
| Password reset UI and token API | PASS | Browser form and `test:password-reset-http`. |
| Password reset email | BLOCKED | Local and live config: email is not configured. |
| Skylent AI | BLOCKED | Local and live health: `ai: not_configured`. Journey step HTTP 503. |
| Google sign-in completion | BLOCKED locally | `GOOGLE_CLIENT_ID` unset locally. Live `GET /api/v1/auth/google` returned 302 to Google at 21:15 IST. The callback was not completed. |
| Events on production | BLOCKED | Live events API 503. Local page correctly showed no events. |
| Elixir on production | BLOCKED | Live elixir API 503. Local dashboard showed balance 0. |

## E. Production status

Read-only HTTP only. No production database connection.

**26 Oct 2026, 21:46 IST.** `GET https://skylent.live/api/v1/health` HTTP 503:

`status: error`, `db: ok`, `migrations: pending`, `pendingMigrations: 8`, `failedMigrations: 0`, `ai: not_configured`, `release: unknown`.

Earlier the same evening, 21:15 IST: homepage HTTP 200, asset `/assets/index-DKWZQJol.js`. That bundle references `ResetPasswordPage`, `LearnPage`, and `useDegreeCatalogue`. `LearnPage` contains “Revise and resubmit”. `LoginPage` contains “Forgot password”. Catalogue programmes HTTP 200 with 8 rows. Elixir, events, and degrees HTTP 503 unavailable. Admin AI HTTP 401. Password-reset config HTTP 200 with `emailConfigured: false`. Google start HTTP 302 to `accounts.google.com`. `www.skylent.live` HTTP 301 to `https://skylent.live`.

`release: unknown` means `SKYLENT_RELEASE_SHA` is missing or not a git SHA (`server/src/routes/health.ts`). The asset hash is not in git. The frontend looks like it was built from the PR #211 tree. That is not proof the API process is commit `1d84bdc` or merge `d38424e`.

`https://skylent.in` HTTP 200 is a different Next.js site. Its HTML includes “500+ students placed”. That phrase is not in the `skylent.live` bundle checked tonight.

Local passes are not production verification.

## F. Deployment blockers

1. Eight pending production migrations. Health does not name them. The repo has eight October folders, including `20261004180000_backfill_program_course_links` and `20261025180000_elixir_ledger_and_admin_audit`. The count match is not a verified name list.
2. Programme-course backfill needs explicit `--approve-backfill` on `db:preflight --production` (`docs/PRODUCTION.md`). That approval was not found.
3. Hostinger start command is unknown. `npm start` is `node server.js`, which runs `prisma migrate deploy` before listen.
4. A restorable backup is unverified.
5. Password-reset email needs Mailgun or SendGrid. Live config says it is not configured.
6. Skylent AI needs a provider and key. Live health says not configured. Do not set `SKYLENT_AI_ALLOW_GROUNDED` in production.
7. `skylent.in` “500+ students placed” is a separate site. Do not edit it from this repo.

## G. Changes made

No application code was changed.

This documentation commit adds only:

- `docs/FINAL_HANDOFF_2026-10-26.md` — this handoff.

## H. Remaining risks and next actions

| Severity | Next action | Verify |
|---|---|---|
| Critical | Do not restart Hostinger. Record the start command and confirm a restorable backup. | Written operator note. No migrate yet. |
| Critical | Authorised person runs read-only `npm run db:preflight -- --production` and compares pending names to `prisma/migrations/202610*`. | Output lists names. Stop if they differ. Do not pass `--approve-backfill` until the backfill is accepted. |
| High | After a deliberate migrate, re-check health for `migrations: ok` and a real `release` SHA. | `GET /api/v1/health` 200. Elixir, events, and degrees no longer 503 solely for missing tables. |
| High | Configure password-reset mail, then send one reset to a test mailbox. | `emailConfigured: true` and a link that opens `/reset-password`. |
| Medium | Decide whether `skylent.in` should keep “500+ students placed”. | That site’s own source, not this repo. |
| Low | Faculty grading UI was not clicked. Learner resubmit was. | A faculty account grades one local submission, then the learner revises. |
| Low | Flip `certificates` in `src/lib/truth.ts` from `development` to `live` only after production issue and verify. | Live verify of a real code. Do not flip it on the basis of this local check. |

## I. Safe deployment prerequisites

Do not run these as part of this session.

1. Backup that has been restored once, or an owner-signed statement that a restore point exists.
2. Hostinger start command, Node version, and deployed commit written down.
3. `DATABASE_URL` and `DIRECT_URL` are the session pooler on port 5432, not the IPv6-only direct host (`docs/PRODUCTION.md`).
4. Read-only `db:preflight --production` matches the eight expected October migrations, zero failed, and the four production-only lesson-material rows are recognised and not “resolved”.
5. Written approval before `--approve-backfill`.
6. Deploy the build that matches the commit you intend. Set `SKYLENT_RELEASE_SHA` to that commit.
7. If start is not `server.js`, run `prisma migrate deploy` on purpose before restart. If start is `server.js`, know that restart migrates.
8. Afterward, health is 200 with `migrations: ok`. Smoke the catalogue, one signup, one lesson, and certificate verify. Do not treat `ai: not_configured` as a failed health check. Do not enable grounded preview in production.

## J. Handoff summary

`main` contains PR #211 (`1d84bdc` / merge `d38424e`). Local QA on 26 Oct 2026 passed build, types, LMS, quizzes, labs, assignments, Career OS, and certificates, with AI and reset mail blocked because they are not configured. The live API is healthy at the database and blocked on eight unnamed pending migrations. Do not restart production until backup, start command, and preflight names are confirmed. The next useful work is that operator check, not more feature code.
