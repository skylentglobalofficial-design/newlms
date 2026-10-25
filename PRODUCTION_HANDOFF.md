# Skylent LMS production handoff

Executive status: **BLOCKED**

The October release is not safe to migrate or restart. The release-candidate commit is identified and its CI gate passed on a throwaway database. Production migration history, a restorable backup, and the Hostinger startup command were not verified. A Hostinger restart that uses `npm start` or `node server.js` runs `prisma migrate deploy`.

This document is evidence and a plan. It does not approve a migration.

Prepared 25 October 2026, 21:22 IST (Asia/Calcutta, UTC+5:30), from read-only checks. Production was contacted only with public HTTPS GET requests. No production schema or data was changed.

## 1. Release candidate

| Item | Evidence |
|---|---|
| Repository | `skylentglobalofficial-design/newlms` |
| Expected commit | `31d6667c836d520f2cfd0bd7cf91e9c7d5659afc` |
| Commit on the candidate branch | Same SHA. Subject: `fix: return JSON 503 when the enrolment policy probe cannot reach the database`. Author time `2026-10-25 06:41:50 +0000` (12:11 IST). |
| Working tree at inspection | Clean. `PRODUCTION_HANDOFF.md` was absent. |
| Pull request | [#204](https://github.com/skylentglobalofficial-design/newlms/pull/204), title “Fix learning reads while production migrations are pending”. State **MERGED**. `mergedAt` `2026-10-25T06:47:42Z` (12:17 IST). Merge commit `970a5861dded5fc5b24874f5c0c73c28a76790d1`. Base `main`. Head branch `cursor/production-schema-compat-cd19`. |
| `origin/main` at fetch | `970a5861dded5fc5b24874f5c0c73c28a76790d1`. The expected SHA is an ancestor of that commit. |
| CI for the exact SHA | [release-gate run 40170015838](https://github.com/skylentglobalofficial-design/newlms/actions/runs/40170015838). Job `gate` **success**. Created `2026-10-25T06:41:56Z` (12:11 IST). Updated `2026-10-25T06:44:25Z` (12:14 IST). Every listed step concluded success, including typecheck, production build, QA `prisma migrate deploy`, `test:migration-history`, `test:migration-replay`, and the API suites. |
| What CI is | `.github/workflows/release-gate.yml` uses a throwaway Postgres service. A green gate is not a production migration and not a Hostinger deploy. |

GitHub access worked. The pull request was not merged by this investigation; it was already merged. No application code, migration, or hosting file was edited.

This handoff commit is documentation. It must not be used as a reason to restart Hostinger.

## 2. Database preflight

Status: **BLOCKED**. `npm run db:preflight` was not run.

### What the command does

`package.json` maps `db:preflight` to `tsx scripts/check-migration-history.ts`.

The script:

1. Imports `dotenv/config` before it reads the environment. That loads a local `.env` when `DIRECT_URL` and `DATABASE_URL` are unset. The import does not pass `override: true`, so a variable already set in the shell wins over `.env`.
2. Selects `process.env.DIRECT_URL` after trim, and uses `DATABASE_URL` only when that value is empty.
3. Opens one transaction, runs `SET TRANSACTION READ ONLY`, then selects `_prisma_migrations` (`migration_name`, `finished_at`, `rolled_back_at`) and current-schema tables and enum types.
4. Prints host and database name. The error path replaces the URL text with `<DATABASE_URL>`. It does not print the user or password on the success path.
5. Exits `0` for `READY` or `OK`, `1` for `BLOCKED`, `2` when it cannot check.

`READY` means the script found no failed rows, no unknown history rows, and no create-collision or statement its `destructiveStatements()` helper flags. That helper flags `DROP`, `TRUNCATE`, `DELETE FROM`, `UPDATE`, `ALTER TABLE ... DROP`, and `ALTER TYPE ... RENAME`. It does not flag `INSERT`. A `READY` line is not approval of `20261004180000_backfill_program_course_links`.

The script does not check that the port is 5432, that the host is a Supabase session pooler, or that the database is the production project. The operator must do that from the printed host and database name before treating the exit code as meaningful.

### Why it was not run here

Both the process environment and the workspace `.env` were classified without printing URLs:

| Source | `DIRECT_URL` | `DATABASE_URL` |
|---|---|---|
| Process environment | Present, parses, local host, port 5432, not a Supabase pooler, not `db.<ref>.supabase.co`, username is not `postgres.<ref>` | Same classification |
| Workspace `.env` | Same, database name `skylent_agent_tmp` | Same, database name `skylent_agent_tmp` |

`DATABASE_URL_UNPOOLED` is unset. Those targets are a local agent database. Running preflight here would report that database. It would not identify production.

### What a valid production preflight must show

An authorized operator, on a trusted machine, from commit `31d6667c836d520f2cfd0bd7cf91e9c7d5659afc` or merge commit `970a5861dded5fc5b24874f5c0c73c28a76790d1`:

1. Export the production session-pooler URL into `DIRECT_URL` in that shell so it overrides any `.env`.
2. Confirm, before the command, that the URL they exported uses port **5432** on `*.pooler.supabase.com`, database name matching the intended project, user `postgres.<ref>`. Reject port **6543** (transaction pooler), host `db.<ref>.supabase.co` (IPv6-only direct host), and any local host.
3. Run `npm run db:preflight`.
4. Keep the printed host, database name, every migration line, the final status, and the exit code. Do not keep the URL.

Expected names, until that output exists, are only a repository expectation:

Pending in this tree, if production history matches the documented baseline:

1. `20261004000000_skylent_additions`
2. `20261004180000_backfill_program_course_links`
3. `20261009000000_policy_acceptance`
4. `20261011000000_employer_membership_and_shared_applications`
5. `20261017120000_practice_workspaces`
6. `20261024120000_quiz_grading_events`
7. `20261024140000_password_reset_and_degrees`

History rows whose directories are absent from `prisma/migrations`, listed in `KNOWN_PRODUCTION_ONLY_MIGRATIONS` and `docs/PRODUCTION.md`:

- `20260906190000_lesson_materials`
- `20260907100000_lesson_material_upload_status`
- `20260907120000_curriculum_node_notes_body`
- `20260907140000_assignment_attachment_upload_status`

SQL for those four is under `scripts/fixtures/production-only-migrations/` for tests. That fixture is not production history. Do not delete, edit, or `migrate resolve` those rows.

Stop the release if the printed host or database name is unexpected, any pending name differs, any row is `FAILED`, any row is `production-only, UNKNOWN`, the script prints `BLOCKED`, or the exit code is not 0.

Public health on `https://skylent.live` reported `pendingMigrations: 7` and `failedMigrations: 0` (section 4). In this source, production mode omits the names. The count is the deployed build’s own `prisma/migrations` set compared with `_prisma_migrations`. A count of 7 does not prove the seven names above.

## 3. Backup and restore

Status: **BLOCKED**. No restorable backup was verified.

Checked:

- No custom-format dump or `pg_restore --list` output is in this workspace.
- This environment has no Supabase dashboard session. No backup id, timestamp, project, or restore owner was read.
- `docs/PRODUCTION.md` section 8a requires a Supabase backup newer than the last schema change, or a `pg_dump -Fc` taken through the session pooler and listed with `pg_restore --list`, plus a person who can restore it. The document states the requirement. It is not evidence that a backup exists.
- `docs/PRODUCTION.md` section 6 records an 8 October 2026 observation that a pooler login was rejected and that `db.<ref>.supabase.co` was IPv6-only. That paragraph is historical. It was not re-tested, and it is not a backup.

Remediation before any migration or migrating restart:

1. In the Supabase project that the Hostinger app actually uses, open Database → Backups. Record the backup id and time, and confirm it belongs to that project and is newer than the last applied schema change.
2. Name the person who can restore it onto that same database and host, and record the restore procedure they will use.
3. If the dashboard backup cannot be shown to be restorable, an authorized operator takes `pg_dump -Fc` through the session pooler on port 5432, stores it outside the git repository, and runs `pg_restore --list` against that file. Do not overwrite or delete an existing backup. Do not send the dump or the connection string.

Until one of those artifacts exists, do not run `prisma migrate deploy` and do not restart Hostinger.

## 4. Hostinger startup command and deployed commit

Status: **unknown startup command**. Deployed commit is **not identified**. Live HTTP behavior was observed.

### Repository configuration is not the live setting

| Source | What it says | What it does not prove |
|---|---|---|
| `package.json` `"start"` | `node server.js` | That Hostinger uses `npm start` |
| `server.js` | `spawnSync` of `prisma migrate deploy`, then `import("./server/dist/index.js")`. Non-zero migrate status exits and the API does not start. If `DIRECT_URL` is empty it copies `DATABASE_URL` into `DIRECT_URL`. | That this file is the Hostinger entry |
| `node server/dist/index.js` | Starts the API without a migrate step. The SPA is mounted only when `NODE_ENV=production`. | That Hostinger uses this command |
| `engines.node` | `>=22` | The Node version selected in hPanel |
| `railway.json`, `scripts/railway-start.sh`, `scripts/railway-predeploy.sh` | Railway pre-deploy and start both run `prisma migrate deploy` | Hostinger. The live response header says Hostinger |

Commands in this repository that execute `prisma migrate deploy`:

- `npm start`
- `node server.js`
- `npm run db:migrate`
- `sh scripts/railway-start.sh`
- `sh scripts/railway-predeploy.sh`
- The release-gate step that starts `node server.js` against the QA database

`NODE_ENV=production node server/dist/index.js` does not call migrate. `server/src/lib/env.ts` `assertProductionEnv` refuses to boot in production when `DATABASE_URL`, `SESSION_SECRET` (at least 32 characters), or `FRONTEND_URL` is missing. It warns, without printing the value, when `DIRECT_URL` or `DATABASE_URL` uses `db.<ref>.supabase.co`.

### Live read-only HTTP, 25 October 2026, 21:19 IST

`GET https://skylent.live/api/v1/health` — HTTP 503, `content-type: application/json`, 94 bytes:

```json
{"status":"error","db":"ok","migrations":"pending","pendingMigrations":7,"failedMigrations":0}
```

Response headers included `platform: hostinger` and `panel: hpanel`. The body has no migration names. In `server/src/routes/health.ts`, names are added only when `NODE_ENV` is not `production`. This response matches a production-mode process whose shipped migration folders are not all applied. `db: ok` means `SELECT 1` succeeded. It does not name the database.

`GET https://api.skylent.live/api/v1/health` — HTTP 503, `content-type: text/html`, Hostinger page “The server is temporarily busy”. Same `platform: hostinger` and `panel: hpanel` headers. That hostname did not serve the Node health JSON. The application that answered is `https://skylent.live`.

Further public GETs on `https://skylent.live` in the same window:

| Request | Result |
|---|---|
| `GET /` | 200 HTML. Title `Skylent — Learn. Practise. Build.` Script `/assets/index-BcResfFX.js`. `dist/` is not in git, so this hash was not matched to a commit. |
| `GET /api/v1/catalog/programs` | 200. Eight public programme slugs: `cat-prep`, `data-analytics-pro`, `data-science-ai`, `full-stack`, `generative-ai-program`, `jee-advanced-prep`, `product-management`, `sql-certificate`. |
| `GET /api/v1/events` | 503 JSON `Events are not available yet.` `code: unavailable` |
| `GET /api/v1/degrees` and `GET /api/v1/degrees/setup-status` | 503 JSON `Degree programmes are not available yet.` `code: unavailable` |
| `GET /api/v1/practice` | 503 JSON `Practice workspaces are not available yet.` `code: unavailable` |
| `GET /api/v1/certificates/verify/NOT-A-REAL-CODE` | 400 `Invalid certificate ID` (fails the format check before lookup) |
| `GET /api/v1/certificates/verify/SKL-2026-NONE-TEST1` | 503 JSON `Certificate check is unavailable right now. Try again later.` `code: unavailable` |
| `GET /api/v1/lms/dashboard` | 401 `Unauthorized` |
| `GET /api/v1/auth/password-reset/config` | 200 `emailConfigured: false` |
| `GET /api/v1/auth/password-reset/request` | 404 `Not found` (the route is POST; no POST was sent) |

The events, degrees, practice, and certificate sentences are the fail-closed bodies in this source (`server/src/routes/events.ts`, `server/src/lib/schema-capabilities.ts`, `server/src/routes/practice.ts`, `server/src/routes/skylent/certificates.ts`). The practice sentence was introduced in `b15b980e568539aa79ba49c78677f06bde0b1d13` (25 October 2026, 11:25 IST). The events sentence was introduced in `bc3bdf45b7a1ad98e2daaf3448754240b1e80cf1` (25 October 2026, 00:24 IST). The live API returns those bodies, so the running server includes that fail-closed behavior.

That does not identify the deployed SHA. The enrolment probe fix that is unique to `31d6667` was not exercised, because doing so would post an enrolment. No deploy log, git SHA header, or hPanel field was available.

The health count staying at 7 with the API still serving means this boot did not finish a successful `prisma migrate deploy`. It does not tell us which command the next restart will use. If hPanel starts `npm start` or `node server.js`, the next restart is a production migration.

### What a human must read in hPanel

Open the Node.js application that serves `skylent.live`. Capture a screenshot with every environment value covered. Record only:

- The startup command or entry file, character for character.
- The selected Node.js version.
- The deployed git commit, branch, or upload time, whichever the panel shows.
- Whether a separate app exists for `api.skylent.live`, and its startup command. At 21:19 IST that hostname returned Hostinger’s HTML 503.

Do not send passwords, database URLs, `SESSION_SECRET`, API keys, OTPs, or session cookies. From the panel, the operator may confirm that `DATABASE_URL` and `DIRECT_URL` are both set and then compare only host and port with the preflight output: session pooler port 5432 for `DIRECT_URL`.

## 5. Migration risk

No migration was executed. There are **no** `down.sql` files under `prisma/migrations`. Rolling back application code leaves the schema where the last successful migration stopped.

`destructiveStatements()` returns no lines for any of the seven files. That is a scanner result. The ProgramCourse file is still a data write.

### `20261004000000_skylent_additions`

Creates `SkylentCertificate` and `SkylentEnquiry`, primary keys, and indexes (`SkylentCertificate_code_key`, `SkylentCertificate_code_idx`, `SkylentCertificate_userId_courseId_key`, `SkylentEnquiry_status_createdAt_idx`). No foreign keys. No backfill from existing enrolment certificate fields. New tables start empty. Reversible only by dropping those tables, which is not shipped. Live certificate verify of a well-formed sentinel code already returns the unavailable JSON, which matches a missing certificate table or a failed probe while `db` is ok.

### `20261004180000_backfill_program_course_links`

**Explicit human go/no-go required.**

Inserts into existing `ProgramCourse` where the pair is absent. It does not update or delete existing rows. Links, by programme slug to course slug:

| Programme slug | Course slug | sort order |
|---|---|---|
| `data-analytics-pro` | `data-analytics` | 0 |
| `data-science-ai` | `data-analytics` | 0 |
| `data-science-ai` | `python-programming` | 1 |
| `full-stack` | `full-stack-web` | 0 |
| `generative-ai-program` | `generative-ai` | 0 |
| `product-management` | `product-management` | 0 |

Rows are inserted only when both slugs exist. Existing programme enrolments can gain access to those courses. Code rollback does not remove the inserted rows. The preflight scanner will not block this file.

Preconditions: backup verified; preflight shows this name pending and no unexpected `ProgramCourse` collision the operator cares about; a named person accepts the wider course access. After apply, compare `ProgramCourse` counts for those slugs with the pre-migration count. Do not enrol a learner to test this.

### `20261009000000_policy_acceptance`

Creates `PolicyAcceptance` with indexes on `(userId, context)` and `enquiryId`. Foreign keys to `User` and `SkylentEnquiry` (`ON DELETE CASCADE`). Depends on `SkylentEnquiry` from the first October migration. A comment says undo is `DROP TABLE`. No down migration. Signup and new enrolment in this release refuse with 503 when this table is absent. Existing rows in other tables are unchanged.

### `20261011000000_employer_membership_and_shared_applications`

Creates `EmployerMembership` with unique `(userId, employerId)`, an employer index, and foreign keys to `User` and `Employer`. Adds `JobApplication.sharedWithEmployer BOOLEAN NOT NULL DEFAULT false`. Existing applications become not shared. No application rows are deleted. Undo is not shipped. Employer share routes in this release return 503 when the column is absent. That route was not called on production because it requires an authenticated employer session.

### `20261017120000_practice_workspaces`

Creates enum `PracticeWorkspaceStatus` (`not_configured`, `needs_review`, `pending_infrastructure`, `ready`, `published`) and tables `PracticeWorkspace`, `PracticeWorkspaceRevision`, `PracticeWorkspaceResponse`, with the indexes and foreign keys in the SQL file. No backfill. Enum values are not dropped by an application rollback. The capability probe in this source requires `id` on all three tables. Live `GET /api/v1/practice` returns the unavailable JSON.

### `20261024120000_quiz_grading_events`

Adds nullable columns, so existing quiz and assignment rows stay in place and are not rewritten:

- `QuizQuestion.explanation`
- `CurriculumNode.maxAttempts`, `CurriculumNode.passingScore`
- `AssignmentProgress.grade`, `feedback`, `gradedById`, `gradedAt`

`ALTER TYPE "AssignmentStatus" ADD VALUE 'graded'`. Adding an enum value is not reversed by redeploying an older build.

Creates enums `EventType`, `EventStatus`, `EventRegistrationStatus` and tables `Event` and `EventRegistration`, plus indexes including `AssignmentProgress_nodeId_status_idx`. Foreign keys from `EventRegistration` to `Event` and `User`. No event backfill. Live event list returns the unavailable JSON, which matches `Event.id` being absent from the capability probe.

This is the migration whose columns made learner dashboard reads fail on builds that selected them before the column existed. The compatible server selects those columns only when the probe sees them. Shipping an older server after this migration is applied is safe for these new columns. Shipping an older server before this migration, one that selects the columns unconditionally, brings those errors back.

Null `maxAttempts` means no per-quiz cap in application code. Null `passingScore` means the pass mark is the question count. Confirm that product behavior after apply.

### `20261024140000_password_reset_and_degrees`

Creates `PasswordResetToken` (unique `tokenHash`, indexes, foreign key to `User`). Creates enums `DegreeDeliveryMode`, `DegreeLevel`, `DegreeStatus`, and tables `Institution` and `Degree` with the indexes and optional institution foreign key in the file. No backfill. Degree rows would be empty. The public education pages in this release can still show static sample copy; an empty `Degree` table is not a claim that degrees are open. Enum values have no down migration.

`POST /api/v1/auth/password-reset/request` returns the generic success body on unexpected errors, including a missing table, except for its own rate-limit error. A successful-looking response before this migration is not proof that a token was stored. Live `GET /api/v1/auth/password-reset/config` reported `emailConfigured: false`, so reset mail is not configured on the running process. Do not POST a reset for a real learner as a test.

## 6. Deployment and live verification plan

Stages E through H were not performed.

### Stage A — Prerequisites and approval

- Confirm the build to deploy is merge commit `970a5861dded5fc5b24874f5c0c73c28a76790d1` (contains `31d6667c836d520f2cfd0bd7cf91e9c7d5659afc`) or a later commit that a human has reviewed. Record the SHA from hPanel after deploy.
- Confirm hPanel Node.js version is 22 or newer (`engines.node` is `>=22`).
- Named approver, backup evidence, and preflight output are attached to the change record.
- Freeze restarts until Stage D is accepted.

### Stage B — Backup and restore

Complete section 3. Stop if the backup time, project identity, or restore owner is missing.

### Stage C — Production preflight

Run the procedure in section 2. The human reviewer reads every pending and production-only name. Stop unless the seven October names, the four expected production-only names, zero failed rows, and zero unknown rows are what the command printed, and the host is the intended session pooler.

### Stage D — ProgramCourse decision

A named person writes go or no-go for `20261004180000_backfill_program_course_links`, using the slug table in section 5. No-go means do not run `migrate deploy`. There is no supported way to apply the other six files and skip this one without changing migration history, and changing history is not approved.

### Stage E — Migration (authorized operator only)

Not done.

If the verified Hostinger command is `npm start` or `node server.js`, the restart itself is the migration. Take the backup first. Watch the application log for `prisma migrate deploy` success or the host-only failure line.

If the verified command is `node server/dist/index.js` (or `NODE_ENV=production node server/dist/index.js`), run `npx prisma migrate deploy` with the production `DIRECT_URL` on port 5432 **before** restarting that process.

Do not run `prisma migrate reset`, `prisma migrate resolve`, `prisma db push`, or hand-written history edits.

If deploy fails, stop. Leave the failed `_prisma_migrations` row in place. Follow section 7. Do not start the API again with `server.js` until the database is recovered or a human has a written plan that does not include `migrate resolve`.

### Stage F — Schema matches the release

`GET https://skylent.live/api/v1/health` returns 200 `{"status":"ok","db":"ok","migrations":"ok"}`.

Then `npm run db:preflight -- --expect-none` against the same identified host. Exit 0 and the line `OK: database schema matches this release.` Any remaining pending name is a stop.

### Stage G — Deploy the verified build

Restart only through the Hostinger Node.js control for `skylent.live`, using the command recorded in Stage A. Confirm the running commit. Confirm `https://api.skylent.live` separately if that hostname is supposed to serve the API; at 21:19 IST it did not.

### Stage H — Smoke tests

Use an operator-owned account the operator already controls. Do not open a learner’s dashboard, certificate, or application. Do not create enrolments, shared applications, events, degrees, or password-reset tokens unless the operator has agreed that specific row is a test record they will keep.

Record URL, time in IST, HTTP status, and a short response summary. Redact cookies and tokens.

| Check | How | Expected after Stage F | Evidence |
|---|---|---|---|
| Homepage | `GET /` | 200 HTML, title present, asset loads | Status and asset path |
| Health | `GET /api/v1/health` | 200, `db` ok, `migrations` ok | Response body |
| Login and session | Operator account login, then a second API call | 200 session and an authenticated request; logout clears it | Status only, no cookie value |
| Student dashboard | `GET /api/v1/lms/dashboard` as that operator | 200 with `data: null` when they have no enrolment, or their own rows when they do. 401 when logged out | Status and whether `data` is null |
| Programme catalogue | `GET /api/v1/catalog/programs` | 200 and the eight public slugs still present | Slug list |
| Programme course access | Operator compares their own programme enrolment, if they have one, with the Stage D slug table | No unexpected extra course for an account that should not have gained one | Operator note, no other user’s record |
| Lesson and quiz | Operator opens one of their own lessons | Page and quiz load; a failed quiz does not require a new attempt record if they stop before submit | Status codes |
| Certificate verify | `GET /api/v1/certificates/verify/SKL-2026-NONE-TEST1` | 404 `data.valid: false` for this sentinel. 503 is a failed check | Status and `valid` |
| Employer sharing | Do not call with a learner’s application | Route stays unused in this smoke test unless an operator-owned application exists | Explicit skip, or status on the operator’s own row |
| Degrees | `GET /api/v1/degrees/setup-status` | 200 and an honest empty or real list. 503 unavailable means the migration is not in effect | Status and `isEmpty` if present |
| Practice | `GET /api/v1/practice/workspaces/<operator course>` while logged in | 200 for a real workspace, or a clear 404. 503 unavailable means the tables are not in effect | Status |
| Password reset | `GET /api/v1/auth/password-reset/config` only | Record `emailConfigured`. Do not POST `/password-reset/request` for a real user while mail is false or unconfirmed | Config body |
| Logs | Hostinger application log and, if available, Supabase database log for the deploy window | No migrate failure, no `P3009`, no spike of `P2021`/`P2022` | Redacted log excerpt |

Current baseline, before Stage E, is the table in section 4. Do not treat today’s 503s as a failed deploy of a migration that has not been run.

## 7. Rollback and recovery

Application rollback and database recovery are different operations.

**Application.** Redeploy the previous Hostinger build through hPanel. `dist/` is not in git; the previous build artifact or previous git deployment is the rollback unit. Redeploying code does not drop tables, remove enum values, or delete `ProgramCourse` rows.

If the October migrations are **not** applied, keep the current fail-closed server. A rollback to a build that selects `maxAttempts`, `passingScore`, assignment grade columns, or `Event` without a capability check will make those reads fail again while the columns are absent.

If the October migrations **are** applied, an older application build can keep running against the new tables. It will ignore columns it does not know. It will not undo them.

**Database.** Restore the backup identified in Stage B onto the same database and host. Do that when a migration fails or when the ProgramCourse backfill is rejected after it has been applied. Confirm the restored host and database name with the read-only preflight before serving traffic.

When a migration fails:

- Stop. Do not restart `npm start` or `node server.js`.
- Do not run `prisma migrate resolve`.
- Do not delete or edit `_prisma_migrations`.
- Do not run `prisma migrate reset` or `prisma db push`.
- Restore the verified backup, or leave the database untouched until the named restore owner has a written plan.
- A failed row is the record of the failure. Removing it hides a partial apply.

`docs/PRODUCTION.md` also says catalog seed must not be re-run on a live database. Seed deletes and recreates catalogue rows and cascades learner progress. This plan does not include a seed.

## 8. Human actions, in order

1. Do not restart the Hostinger app, and do not run `npm start`, `node server.js`, or `prisma migrate deploy`, until items 2–5 are recorded.
2. In hPanel, open the Node.js app for `https://skylent.live`. Screenshot the startup command, Node.js version, and deployed commit or upload time, with environment values covered. Do the same for `api.skylent.live` if a separate app exists. That hostname returned Hostinger HTML 503 at 21:19 IST on 25 October 2026.
3. Produce backup evidence for that same database: Supabase backup id and time, plus the person and procedure who can restore it; or `pg_dump -Fc` through the session pooler and `pg_restore --list`. Do not send the file or the URL.
4. From a trusted shell with production `DIRECT_URL` exported (session pooler, port 5432, overriding any local `.env`), on commit `970a5861dded5fc5b24874f5c0c73c28a76790d1`, run `npm run db:preflight`. Return host, database name, the migration lines, the final status, and the exit code. Stop unless the seven October names are pending, the four production-only names are the only extra history, and nothing is failed or unknown.
5. A named person writes go or no-go for the `ProgramCourse` insert in section 5.
6. Only then may an authorized operator run Stage E, then Stage F, then Stage G if the build is not already the approved SHA, then Stage H.

## 9. Evidence log

Times below are IST (Asia/Calcutta, UTC+5:30) unless the source timestamp is quoted.

| When | Command or request | Exit or HTTP | Result used |
|---|---|---|---|
| 25 Oct 2026, 21:18 IST (`2026-10-25T15:48:36Z`) | `git rev-parse HEAD`, `git status`, `git log -1`, file presence | 0 | HEAD `31d6667c836d520f2cfd0bd7cf91e9c7d5659afc` on `cursor/production-schema-compat-cd19`. Clean tree. Handoff file absent. |
| Same window | Node classification of `DIRECT_URL` and `DATABASE_URL` in the process and in `.env` | 0 | Both local, port 5432, database `skylent_agent_tmp` in `.env`. Not a pooler. |
| Same window | `gh pr view 204` | 0 | MERGED `2026-10-25T06:47:42Z`, merge `970a5861dded5fc5b24874f5c0c73c28a76790d1`, head `31d6667c836d520f2cfd0bd7cf91e9c7d5659afc`. |
| Same window | `gh run view 40170015838` | 0 | `gate` success. All steps success. QA database, not production. |
| Same window | `git fetch origin main` and ancestry check | 0 | `origin/main` is the merge commit. Expected SHA is an ancestor. |
| 25 Oct 2026, 21:19 IST (`Date: Sun, 25 Oct 2026 15:49:20 GMT`) | `curl` `https://skylent.live/api/v1/health` and `https://api.skylent.live/api/v1/health` | curl 0; HTTP 503 and 503 | JSON pending 7 / failed 0 / db ok on `skylent.live`. HTML “temporarily busy” on `api.skylent.live`. Headers `platform: hostinger`, `panel: hpanel`. |
| Minutes later | Public GETs listed in section 4 | HTTP statuses in that table | Fail-closed 503s, catalogue 200, dashboard 401, reset config `emailConfigured: false`. |
| Same window | `destructiveStatements()` over the seven SQL files; `find` for `down.sql` | 0 | Zero destructive lines from the scanner. The backfill file matches `INSERT`. Zero down files. |
| Not run | `npm run db:preflight` | — | Would have used the local database. |
| Not run | `npm start`, `node server.js`, `node server/dist/index.js`, `prisma migrate deploy`, `prisma migrate reset`, `prisma migrate resolve`, `prisma db push` | — | Would migrate or boot the app. |
| Not run | Supabase or hPanel login | — | No authorized integration in this environment. |

Files read for this report include `server.js`, `package.json`, `scripts/check-migration-history.ts`, `server/src/lib/migration-history.ts`, `server/src/lib/migration-guard.ts`, `server/src/routes/health.ts`, `server/src/lib/env.ts`, `server/src/index.ts`, `railway.json`, `docs/PRODUCTION.md`, and the seven `prisma/migrations/202610*/migration.sql` files.

## 10. Release decision

**Do not proceed.**

Production schema and data were not modified. The release stays blocked until a human completes the backup, the identified preflight, the Hostinger startup record, and the ProgramCourse decision.
