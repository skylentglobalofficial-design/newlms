# Phase 1 preflight

Date: 26 October 2026, 19:20 IST (Asia/Calcutta, UTC+5:30).

This phase only reads the repository. It does not connect to the production database, run a migration, start `server.js`, or restart Hostinger. Production is not ready.

The eight migration names below are the October folders in this repository. A public health check in Phase 0 reported `pendingMigrations: 8` and `failedMigrations: 0`. That count matches these folders. It does not prove those are the names in production. Treat the list as a hypothesis until `npm run db:preflight -- --production` is run by an authorized person.

## How the preflight works

`npm run db:preflight` runs `tsx scripts/check-migration-history.ts`.

1. It loads `.env` only for variables that are not already set. An exported `DIRECT_URL` wins. If that variable is empty, it uses `DATABASE_URL`.
2. It classifies the target. With `--production`, it exits `1` and prints `DECISION: BLOCKED` **before opening a connection** unless the URL is the Supabase session pooler on port **5432** (`*.pooler.supabase.com`). Local hosts, port `6543`, and `db.<ref>.supabase.co` are refused.
3. On an accepted target it opens one transaction, runs `SET TRANSACTION READ ONLY`, and reads `_prisma_migrations` plus the names of existing tables and enum types. It does not insert, update, delete, or resolve history.
4. It prints the host, the database name, the target class, the port, and each applied, pending, failed, rolled-back, and production-only migration name. It does not print the user or password. Errors replace the URL and the password text.
5. It compares pending SQL with objects that already exist. A pending migration that would create a table or enum that is already there is blocked. `DROP`, `DELETE`, `UPDATE`, and column drops are blocked. An `INSERT` is not blocked by that scanner.
6. If `20261004180000_backfill_program_course_links` is pending, it prints a `REVIEW` line. With `--production`, that review is a blocker until the same command also includes `--approve-backfill`.
7. It ends with `DECISION: PASS` (exit `0`) or `DECISION: BLOCKED` (exit `1`). Exit `2` means it could not check. `PASS` means there is no mechanical blocker. It is not permission to migrate, and it is not approval of the programme-course insert.

`npm run db:preflight -- --expect-none` is the same read. It passes only when nothing is pending. Use it after a migration, not before.

This phase did not run the command. This environment must not be pointed at production for it. An operator runs it from commit `79d348c388fd64cd232d2a25baad429207f1709c` (current `main`) in a trusted shell:

```sh
# Set DIRECT_URL in the shell from the host secret store.
# Session pooler, port 5432. Do not paste the URL into chat.
npm run db:preflight -- --production
```

Add `--approve-backfill` only after the checkpoint below is signed. Keep the printed host, database name, migration lines, and exit code. Discard the URL.

`npx prisma migrate status` is also read-only, but it is the wrong signal here. Four production-only history rows are not in this repository, so Prisma exits with an error even when those rows are expected. The preflight reports them as `production-only, expected` and does not try to delete or resolve them:

- `20260906190000_lesson_materials`
- `20260907100000_lesson_material_upload_status`
- `20260907120000_curriculum_node_notes_body`
- `20260907140000_assignment_attachment_upload_status`

## The eight migrations, in plain English

None of these files has a down migration. A code rollback does not undo them. Recovery is a database restore from a backup taken before they run. Backup investigation was deferred. It is still required before anyone applies these.

### 1. `20261004000000_skylent_additions`

Creates empty tables for certificates (`SkylentCertificate`) and public enquiries (`SkylentEnquiry`), plus indexes. It does not copy old certificate flags and does not change enrolments. New certificate issue and verify stay unavailable until this exists.

### 2. `20261004180000_backfill_program_course_links`

**This is the one that can change what an existing student can open.**

It inserts missing rows into `ProgramCourse`. It does not delete or edit existing links, progress, or enrolments. It adds a link only when both slugs exist and that pair is not already there:

| Programme | Course | Order |
|---|---|---|
| `data-analytics-pro` | `data-analytics` | 0 |
| `data-science-ai` | `data-analytics` | 0 |
| `data-science-ai` | `python-programming` | 1 |
| `full-stack` | `full-stack-web` | 0 |
| `generative-ai-program` | `generative-ai` | 0 |
| `product-management` | `product-management` | 0 |

A student already enrolled in one of those programmes can gain access to the newly linked course. Rolling back the application does not remove the inserted rows.

The same pairs are also written by the running application. `ensureProgramCourseLinks()` in `server/src/lib/program-course-links.ts` upserts them when the public catalogue is loaded (`server/src/routes/catalog.ts`) and when a programme is loaded (`server/src/lib/lms.ts`). So this migration is not the only way those links appear. If the catalogue has already run, the migration’s `WHERE NOT EXISTS` clause inserts nothing for pairs that are already stored. The access change happens the first time the link is inserted, whether that was the app or this migration.

### 3. `20261009000000_policy_acceptance`

Creates an empty `PolicyAcceptance` table with links to users and enquiries. It depends on `SkylentEnquiry` from migration 1. It does not change existing users or enrolments. Signup and new enrolment in this release refuse to proceed when this table is missing.

### 4. `20261011000000_employer_membership_and_shared_applications`

Creates `EmployerMembership`. Adds `JobApplication.sharedWithEmployer`, default `false`, so existing applications stay private. It does not delete applications and does not change course enrolments.

### 5. `20261017120000_practice_workspaces`

Creates the practice-workspace enum and three empty tables (`PracticeWorkspace`, `PracticeWorkspaceRevision`, `PracticeWorkspaceResponse`) with indexes and foreign keys. It does not change existing lesson rows. Practice routes return “not available” until these tables exist. Enum values are not removed by a code rollback.

### 6. `20261024120000_quiz_grading_events`

Adds optional columns: quiz explanation, per-quiz attempt limit and pass mark, and assignment grade, feedback, grader, and graded time. Existing quiz and assignment rows stay as they are. It adds the enum value `graded` to assignment status. That value is not practical to remove later. It also creates empty event and event-registration tables. It does not rewrite enrolments. The current server reads the new quiz and grade columns only when they exist, so an older database does not have to be migrated before the current code can serve lessons.

### 7. `20261024140000_password_reset_and_degrees`

Creates empty tables for password-reset tokens, institutions, and degrees, plus degree enums. It does not backfill degrees and does not change enrolments. Public education pages can still show static samples. Password-reset requests still return a generic success when this table, or outbound mail, is missing.

### 8. `20261025180000_elixir_ledger_and_admin_audit`

Creates the Elixir balance, ledger, reward rules, attested payments, learning resources, entitlements, and admin audit log. Balances cannot be negative. It inserts five reward rules that are disabled and set to 0. It does not change existing user, course, or enrolment rows. Today’s public check, recorded in Phase 0, got HTTP 503 from `GET /api/v1/elixir` saying the tables are not available. That is evidence this migration has not taken effect on the database that process uses. It is not a list of the other seven names.

## Enrolments and programme links

| Migration | Effect on existing enrolments or programme-course links |
|---|---|
| `20261004000000_skylent_additions` | None. New empty tables. |
| `20261004180000_backfill_program_course_links` | Can add course access for students already enrolled in the six programmes above. |
| `20261009000000_policy_acceptance` | None on existing rows. New enrolments need this table. |
| `20261011000000_employer_membership_and_shared_applications` | None on course enrolments. Existing job applications stay unshared. |
| `20261017120000_practice_workspaces` | None on enrolments. |
| `20261024120000_quiz_grading_events` | None on enrolments. New optional columns and an enum value. |
| `20261024140000_password_reset_and_degrees` | None on enrolments. |
| `20261025180000_elixir_ledger_and_admin_audit` | None on enrolments. New empty ledger. Disabled reward rules. |

## Commands that apply database changes

These run `prisma migrate deploy`. Do not run them against production in this phase.

| Command | What it does |
|---|---|
| `npm start` | `node server.js` |
| `node server.js` | Migrates, then starts the API. If migrate fails, the API does not start. |
| `npm run db:migrate` | `prisma migrate deploy` only. |
| `sh scripts/railway-start.sh` | Railway, not Hostinger. Migrates, then `node server/dist/index.js`. |
| `sh scripts/railway-predeploy.sh` | Railway pre-deploy. Migrates. |

`node server/dist/index.js` starts the API and does not migrate. The site is served only when `NODE_ENV=production`.

The repository does not prove which of these Hostinger uses. The process that answered the Phase 0 health check was already running with migrations pending, so that boot did not finish a successful migrate. The command configured for the **next** start is still unknown. If it is `npm start` or `node server.js`, the next restart applies every pending migration, including the programme-course insert.

## Still needed before a production update

Do not paste passwords, database URLs, or API keys.

1. **Hostinger startup command.** Screenshot of the Node.js app for `https://skylent.live` with environment values covered. Record the startup command exactly, the Node.js version, and the deployed commit or upload time. Repeat for `api.skylent.live` if it is a separate app. Phase 0 found that hostname serving Hostinger’s HTML 503, not the Node health JSON.
2. **Deployed version.** Health `release` was `unknown` at 19:14 IST because `SKYLENT_RELEASE_SHA` is not a git SHA on that process. The asset `/assets/index-B36pxOTI.js` is not in git. The health body includes `ai` and `release`, which this repository added in PR #209, so the live process includes that code. That is not the same as proving commit `79d348c`.
3. **Named migration list.** Output of `npm run db:preflight -- --production` from a trusted shell. Stop if the pending names differ from the eight above, if any row is failed, or if any production-only row is unknown.
4. **Recovery.** The owner deferred backup investigation. It is still required before migrate. This phase did not search for a backup. Someone must name the backup, its time, and the person who can restore it onto the same database. There is no down migration to use instead.
5. **Written approval** for the programme-course backfill, using the checkpoint below.

## Checklist

Stop at the first failed line. Do not restart Hostinger until the checkpoint is signed and the preflight is `PASS`.

1. Confirm the build to ship is `79d348c388fd64cd232d2a25baad429207f1709c` or a later commit a person has reviewed.
2. Record the Hostinger startup command, Node version, and deployed commit from the screenshot. If the command is `npm start` or `node server.js`, the restart itself is the migration.
3. Record a restorable backup of that same database and who can restore it.
4. From a trusted shell, with `DIRECT_URL` already set to the session pooler on port 5432, run `npm run db:preflight -- --production`. Do not add `--approve-backfill` yet.
5. Read every pending and production-only name. Stop unless the eight names above are the pending set, the four lesson-material rows are the only extra history, nothing is failed, and the exit code is `1` only because of the backfill review.
6. **Approval checkpoint.** A named person writes yes or no to inserting the `ProgramCourse` links in the table above, knowing that existing programme enrolments can gain those courses and that the catalogue code may already have inserted some of them. No means do not migrate. Yes means re-run `npm run db:preflight -- --production --approve-backfill` and require `DECISION: PASS`.
7. Only then may an authorized person apply migrations, using the recorded Hostinger command if it migrates, or `npx prisma migrate deploy` with the session pooler **before** a start command that does not migrate.
8. If migrate fails, stop. Leave the failed history row. Do not run `prisma migrate resolve`. Restore the backup or leave the database unchanged until the restore owner has a written plan.
9. After success, `GET /api/v1/health` must be HTTP 200 with `migrations` `ok`. Then `npm run db:preflight -- --expect-none` must print `DECISION: PASS`. `release` should be the deployed SHA once `SKYLENT_RELEASE_SHA` is set. `ai: not_configured` can remain until a key is configured. It does not mean the schema update failed.

## Safest next action

Do not restart the service. In hPanel, record the Node.js startup command for `https://skylent.live` with every environment value covered. That single fact decides whether the next restart would apply these eight migrations.
