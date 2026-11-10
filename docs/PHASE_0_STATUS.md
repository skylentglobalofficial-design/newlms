# Phase 0 status

Date: 26 October 2026, 19:14 IST (Asia/Calcutta, UTC+5:30).

This is a status report only. No application code was changed. No migration was run. Production data was not touched.

Labels:

- **GREEN:** implemented, and automated tests for it passed on a throwaway or local database. This is not proof that production works.
- **AMBER:** partly complete, or the code is in place but a real gap remains.
- **RED:** known blocker.
- **UNVERIFIED:** cannot be confirmed from the repository or from the public checks below.

## Repository

The working tree was clean before this file was added.

`origin/main` is `79d348c388fd64cd232d2a25baad429207f1709c`.

That commit is the merge of PR #209, “Fail closed on migration readiness and AI diagnostics.” GitHub records `mergedAt` `2026-10-26T10:53:55Z` (16:23 IST). The merge commit’s parent is `2471713fdf264855c70efcc8e7a9ba0e65cbee05`. The file tree of `main` matches that parent. PR #209 is merged.

The release-gate workflow does not run on a push to `main`, so the merge commit itself has no Actions run. The pull-request run for `2471713` succeeded: [release-gate 40307793123](https://github.com/skylentglobalofficial-design/newlms/actions/runs/40307793123), finished 16:02 IST. That run used a throwaway database. It included Elixir tests and `test:migration-history`. A green gate is not a production check.

## What production showed today

Public read-only GET at 19:14 IST (`Date: Mon, 26 Oct 2026 13:44:09 GMT`). No login. No database connection.

| Check | Result |
|---|---|
| `GET https://skylent.live/api/v1/health` | HTTP 503. `db` ok. `migrations` pending. `pendingMigrations` 8. `failedMigrations` 0. `ai` `not_configured`. `release` `unknown`. Hostinger headers. |
| `GET https://skylent.live/` | HTTP 200. Script `/assets/index-B36pxOTI.js`. |
| `GET /api/v1/elixir` | HTTP 503. Elixir is not available until the database update is applied. |
| `GET /api/v1/admin/ai` | HTTP 401 Unauthorized. |

The health body now includes `ai` and `release`. Those fields were added in PR #209 and were absent from the public health body on 25 October 2026. So the live process is serving code that contains that change. `release` is `unknown`, which this code returns when `SKYLENT_RELEASE_SHA` is missing or not a git SHA. The exact deployed commit is still **UNVERIFIED**. The homepage hash is not in git, so it also does not name a commit.

The count of 8 pending migrations matches the number of migration folders dated October 2026 in this repository. The health response does not list their names. Treating that count as those eight names is a hypothesis, not a verified production history.

`npm start` is `node server.js`, and `server.js` runs `prisma migrate deploy` before the API listens. Whether Hostinger uses that command is **UNVERIFIED**. A restart with that command would apply migrations.

## Product areas

### Login and signup — AMBER

Implemented: email signup and login, sessions, CSRF, consent on signup, Google sign-in when configured, and a password-reset API. Signup always creates a student. A student cannot promote themselves. Tests: `test:auth`, `test:consent`, `test:roles`, `test:security-middleware`, `test:oauth-redirect`. Those passed in the PR #209 gate on a throwaway database.

Missing or limited: the password-reset request still returns a generic success when mail is not configured. No reset-password page was found under `src/`. Google sign-in stays unavailable until Google client settings exist. Whether those are set in production is **UNVERIFIED**.

Needs testing: a real signup and login on `https://skylent.live`, and a password reset with mail actually configured. Not done in this phase.

### Courses and enrolment — AMBER

Implemented: public catalogue, programme and course pages, enrolment that requires the current terms version, and no automatic enrolment on signup. Tests include `test:lms`, `test:enrollment-access`, and the learner journey.

Missing or limited: `20261004180000_backfill_program_course_links` inserts course links for existing programmes. If that migration is still pending, some programme enrolments may not open the linked courses. That is a code fact. Whether it is pending in production is **UNVERIFIED**.

Needs testing: enrol on the live site as a test account and open the course. Not done here.

### Lessons and learning progress — AMBER

Implemented: lesson outline, lock until the previous lesson is complete, and progress saved on the server. The learner journey checks that a completed lesson stays complete after reload.

Missing: nothing structural found in this pass. Live progress for a real learner was not opened.

Needs testing: one lesson completion on production, then a reload. Not done here.

### Quizzes and assignments — AMBER

Implemented: quiz submit with attempt limits, wrong answers do not unlock the next lesson, and assignment text submit. `test:quiz-guard` and `test:lms` cover this on a throwaway database.

Missing or limited: grading columns and the `graded` status come from `20261024120000_quiz_grading_events`. The current server avoids selecting those columns when they are absent. Assignment files are metadata only. Cloud file storage is not implemented (`docs/PRODUCTION.md`).

Needs testing: a live quiz attempt. Not done here. Whether the grading migration is applied is **UNVERIFIED**.

### Certificates — AMBER

Implemented: issue after the course is complete, public verify, and a 503 JSON response when the certificate table is missing or the database cannot be reached. `test:certificate-verify` passed in the gate.

Missing: production verify of a real code was not run. If `20261004000000_skylent_additions` is still pending, issuing will fail closed. That migration’s presence in production history is **UNVERIFIED**.

### Career OS and job applications — AMBER

Implemented: profile, education, experience, skills, projects, applications, and employer job ownership. Sharing an application with an employer is explicit. Tests: `test:career`, `test:career-evidence`, `test:employer`.

Missing or limited: the employer share column comes from `20261011000000_employer_membership_and_shared_applications`. The server returns 503 for sharing when that column is absent. Whether production has it is **UNVERIFIED**.

Needs testing: one learner application on production. Not done here.

### Practical workspaces — AMBER

Implemented: practice workspace tables, learner and admin routes, and a 503 when those tables are missing. Tests include practice platform, practice admin, labs, and labs SQL.

Missing: the tables are created by `20261017120000_practice_workspaces`. Live workspace calls were not made. Production state is **UNVERIFIED**.

### AI features — AMBER

Implemented: a public programme finder that does not need a model, and a lesson assistant that checks enrolment and lesson locks. Missing configuration returns HTTP 503 `not_configured`. Admin `GET /api/v1/admin/ai` reports provider readiness without the API key. Production refuses `lesson-grounded` unless an explicit flag is set, and that case is labelled a preview. Tests: `test:ai`, `test:ai-policy`, and the learner journey when the preview provider is on.

Production fact from today: health says `ai` is `not_configured`. An anonymous admin call is 401, so it does not reveal a key. Whether a key exists in Hostinger but is unused is **UNVERIFIED**. The public health line is enough to say the running process does not consider a provider ready.

### Elixir credits — RED for production use

Implemented: an integer ledger, the rule that ₹100 of attested net value earns 10 Elixir, disabled learning-reward rules at amount 0, idempotent payments, and refunds that do not drive the balance negative. Students cannot call admin routes. `test:elixir` is in the release gate and passed there.

Production fact from today: `GET /api/v1/elixir` is HTTP 503 because the Elixir tables are not available. The migration `20261025180000_elixir_ledger_and_admin_audit` is in `main` and has not taken effect on the database this process is using. Balances, purchases, and refunds cannot be used in production until that migration is applied by an authorized person. This phase did not apply it.

### Degrees and institutions — AMBER

Implemented: a degrees API and public education pages. The public pages can still show static samples. The API returns 503 when the degree tables are missing. Tests include `test:degrees-auth`.

Missing: the degree tables come from `20261024140000_password_reset_and_degrees`. Live degree API behavior was not rechecked in this phase. **UNVERIFIED** on production.

### Email and file uploads — RED for production mail and cloud files

Implemented: Mailgun and SendGrid send paths, used by password reset when fully configured. Assignment attachment rows store metadata, not file bytes.

Missing: cloud storage is not implemented. Production mail settings were not read. Do not paste keys. Whether mail works in production is **UNVERIFIED**. The code and docs say reset requests still look successful when mail is not configured.

### Mobile experience — UNVERIFIED

The product is a responsive website, not a native app. Some layouts have been adjusted for small screens in earlier work. This phase did not exercise a phone-sized browser on the live site or run a mobile test suite. Do not treat that as a pass or a fail.

### Production deployment — RED

Implemented in the repo: health that fails when migrations are pending or unreadable, a read-only preflight, a public smoke command, and startup that migrates only when the process is `server.js`.

Known from today’s public check: the site is up on Hostinger, the database answers, eight migrations are pending, none are marked failed, Elixir tables are absent, and AI is not configured. The Hostinger startup command, Node.js version, and deployed git SHA were not visible. `release` is `unknown`.

A backup was deferred by the owner and was not rechecked. It is still required before anyone applies migrations. This phase did not look for a backup.

## What this phase did not do

- Did not change application code.
- Did not run `prisma migrate`, `npm start`, or `node server.js`.
- Did not connect to the production database.
- Did not read or print secrets.
- Did not install packages.
- Did not re-run the release-gate suite. The gate result cited above is the GitHub run on the merged pull request, which used a throwaway database.

## Later note

On 26 October 2026, after this report, `/reset-password` was added so the existing reset email has a page. The sentence above that no reset page was found was true when this report was written. Mail delivery is still not confirmed.

## Stop line

Phase 1 should not start by migrating or restarting production. The next product work can proceed in the repository. Production use of Elixir, and any restart that might apply migrations, stays blocked until a person records the real Hostinger start command, runs the read-only preflight, and approves the migration set, including the programme-course backfill.
