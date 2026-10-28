# Skylent master final report

28 October 2026, 8:13 PM IST.

This report covers the local implementation pass on branch `cursor/master-stabilisation-cd19`. It does not approve production.

## Section A — Executive summary

The application was not rewritten. The live homepage route is still `HomePage`. Career OS is now locked unless a row exists in `CareerOsAccess`. Career Rise enrols only after a checked 60% module completion and an explicit request. My Courses expands programme enrolments into courses. Platform admin can author curriculum and is not Super Admin.

| Count | Phases | Status |
| --- | --- | --- |
| 4 | 0, 9, 10, 14 | `VERIFIED` for the work those phases asked to prove |
| 10 | 2, 3, 4, 5, 6, 7, 8, 11, 12, 13 | `PARTIALLY COMPLETE` |
| 1 | 1 | `BLOCKED` |

Major improvements: Career OS default lock, Career Rise threshold, curriculum API, My Courses course rows, safer Super Admin bootstrap, local demo provisioning.

Critical risks: the live health check still shows eight pending migrations and HTTP 503. Deploying this branch would also apply the new migration and the unapproved programme-course backfill, because startup runs `prisma migrate deploy`. There is no verified backup.

Production decision: `NO-GO`. `NOT READY FOR APPROVAL`.

## Section B — Phase-by-phase results

The tracker at `docs/SKYLENT_MASTER_IMPLEMENTATION_TRACKER.md` is the detailed register. Short form:

| Phase | Outcome | Verified | Remaining |
| --- | --- | --- | --- |
| 0 Audit | Repository and role map recorded | Code inspection | None for the audit |
| 1 Production safety | No production write | Live health GET only | Entry file, pooler URL, backup, backfill approval |
| 2 Accounts | Bootstrap and local demos | Disposable admin and two demo logins | `CEO@skylent.in` was not created |
| 3 Authorization | Platform admin and faculty scope | Authoring and lock tests | College role does not exist |
| 4 Course builder | Draft, module, lecture, publish API | `test:curriculum-authoring` PASS | Browser pass and file upload |
| 5 Homepage | Live homepage kept; stage links added | Headless DOM | Click-through and responsive pass |
| 6 Programmes and degrees | Sample labelling already present | Inspection | No new subject content was invented |
| 7 My Courses | Rows follow real courses | `test:my-courses` PASS | Signed-in browser check |
| 8 Progress | Existing `completedAt` model kept | Used by Career Rise test | Sign-out and resume not re-run |
| 9 Career Rise | 60% rule and explicit enrol | `test:career-rise` PASS | Dashboard click |
| 10 Career OS | Locked by default | `test:career-os-lock` PASS | No unlock policy exists |
| 11 Demos | Local accounts labelled demo | Student and admin API login | College dashboard, browser pass |
| 12 Routing | New curriculum and password routes | Homepage and Career OS DOM | Full nav pass |
| 13 Tests | Build and the scripts below | See Section A tests | Rest of `package.json` scripts not run |
| 14 Report | This file | Written from the commands above | Does not approve release |

## Section C — Account and credential status

Real Super Admin identity: `CEO@skylent.in`.

Provisioning is implemented in `npm run bootstrap:superadmin`. The account was not created. Login was not verified. First-login password change is implemented for a new bootstrap account and was checked on a disposable local user that was then deleted. It was not checked for `CEO@skylent.in`.

The script refuses a non-local database unless `SUPERADMIN_ALLOW_PRODUCTION=yes`. It refuses to change the roles of an existing non-admin unless `SUPERADMIN_ALLOW_ELEVATION=yes`. It does not print the password. Put `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD` (at least 12 characters, only when creating), and optional `SUPERADMIN_NAME` in the environment of the operator shell. Do not commit them.

Demo accounts, local database only:

| Account | Email | Role | Checked |
| --- | --- | --- | --- |
| Demo Admin | `demo-admin@skylent.invalid` | Platform admin, not Super Admin | Login and user-admin refusal, API |
| Demo Organisation | `demo-organisation@skylent.invalid` | Organisation admin of `demo-organisation` | Created, login not checked |
| Demo Student | `demo-student@skylent.invalid` | Student | Login checked. Career OS locked. No enrolments. |
| Demo College | `demo-college@skylent.invalid` | No role | Created. College product does not exist. |
| Demo Teacher | `demo-teacher@skylent.invalid` | Faculty on draft `demo-teaching-course` | Created, login not checked |

`npm run provision:demo` rewrites a local credential file and does not print the password. The file from this pass was deleted. These are not real learners or partners. Do not create them in production.

## Section D — LMS functionality

| Area | Status |
| --- | --- |
| Course builder API | Works locally for draft create, module position, lecture parent, reload, and publish. Tested. |
| Course builder UI | Page exists at `/dashboard/curriculum`. Not clicked in a browser. |
| Module order | Tested through the API. |
| Lectures | Tested. Assigned teachers can add a non-quiz lecture. They cannot create courses or delete modules. |
| Supporting files and covers | Endpoint stores bytes only through the storage service. Not run in this pass. Unconfigured storage returns 503 and saves nothing. |
| Quizzes | An admin can create a quiz lecture with questions. Not covered by the authoring test. |
| Assignments | Existing submission flow was not re-run. Faculty grading is now limited to assigned courses. |
| Assessments | Existing quiz limits were not re-run. |
| Live lessons | Not implemented. A reference URL can be stored. The API says live streaming is false. |
| My Courses | API and row logic tested for zero, one, two, and many. Dashboard render not browser-tested. |
| Dashboard | Still the learner home. Career Rise card calls the new API. |
| Resume | Course row opens `/learn/:slug`. The player already uses last-accessed lesson. Leave-and-return was not re-run. |
| Progress | `completedAt` still means complete. Opening a lesson does not. |
| Enrolment | New builder courses can be enrolled only after publish. Older courses still use the authored-slug allowlist. |

## Section E — Career Rise and Career OS

Eligibility uses taught modules. Empty modules are ignored. A module is complete only when every lesson node in it has `completedAt`. The percentage is `floor(completedModules * 100 / totalModules)`. The learner is eligible at or above 60%, including exactly 60%, and not at 59%. The API tests covered 0%, 59 of 100 modules, 60 of 10, and 70 of 10. A started lesson did not increase the percentage. A direct enrol call below the threshold returned 403. The second enrol call did not create a second row. Another user received 403 for the workspace.

Enrolment is explicit. Nothing auto-enrols Career Rise.

Career OS remains locked. The lock test covered student, faculty, organisation admin, platform admin, Super Admin, and the demo student. No `CareerOsAccess` row was created for them. Anonymous profile access is 401. There is no automatic Career OS enrolment.

The Career Rise workspace does not claim coaching, placements, or mentorship. Those fields are null.

## Section F — Production status

Checked again at 8:20 PM IST on 28 October 2026. No production database query was performed.

`GET https://skylent.live/api/v1/health` returned HTTP 503:

```json
{"status":"error","db":"ok","migrations":"pending","pendingMigrations":8,"failedMigrations":0,"ai":"not_configured","release":"unknown"}
```

Headers included `platform: hostinger`, `panel: hpanel`, and `server: hcdn`. Elixir, degrees, and events each returned HTTP 503 with their existing unavailable sentences.

The eight names are not in that response. Production omits them when `NODE_ENV` is production. The count matches these repository migrations, in apply order, which are the `202610*` folders other than the Career Rise migration added on this branch:

| Order | Migration | Effect verified from the SQL file |
| --- | --- | --- |
| 1 | `20261004000000_skylent_additions` | Creates `SkylentCertificate` and `SkylentEnquiry`. No data rewrite. |
| 2 | `20261004180000_backfill_program_course_links` | Inserts missing `ProgramCourse` rows for six slug pairs. See the backfill section below. |
| 3 | `20261009000000_policy_acceptance` | Creates `PolicyAcceptance`. Account creation and new enrolment depend on it. |
| 4 | `20261011000000_employer_membership_and_shared_applications` | Creates `EmployerMembership`. Adds `JobApplication.sharedWithEmployer`, default false. |
| 5 | `20261017120000_practice_workspaces` | Creates the practice workspace tables and status enum. |
| 6 | `20261024120000_quiz_grading_events` | Adds quiz explanation, attempt limits, assignment grade fields, the `graded` status value, and event tables. |
| 7 | `20261024140000_password_reset_and_degrees` | Creates password-reset tokens, `Institution`, and `Degree`. No sample rows are inserted. |
| 8 | `20261025180000_elixir_ledger_and_admin_audit` | Creates the Elixir, payment, learning-resource, and audit tables. Inserts five reward rules with amount 0 and `enabled = false`. |

None of those eight files runs `DROP`, `DELETE`, or `UPDATE` as an executed statement. `ON DELETE` appears only inside foreign keys, and `DROP` appears only in comments. `ALTER TYPE ... ADD VALUE 'graded'` cannot be undone by a down migration. The Elixir file says rollback is a backup restore.

`20261028143000_career_rise_os_lock_and_authoring` is a ninth migration on this branch. The live count of 8 means the running build is not this branch. Deploying this branch would add that ninth migration after the eight.

Backup: not verified. No backup timestamp, scope, or `pg_restore --list` output is in this workspace.

Hostinger entry file: the panel was not opened. Hostinger's build-settings page, updated 23 September 2026, says an Express entry file is a `.js` path relative to the repo root, and an empty entry file serves a static site. The live health body is JSON, so the entry file is not empty. `server.js` migrates and then listens, and it exits when migrate fails. A process that is serving JSON with eight pending migrations and zero failed rows did not complete `prisma migrate deploy` on this boot. That is consistent with the running entry file being `server/dist/index.js`, which does not migrate. It is not a copy of the hPanel field.

Production changes made by this pass: none.

## Section G — Known issues and blockers

| Blocker | Impact | Needed from | Next action | Role |
| --- | --- | --- | --- | --- |
| Hostinger entry file not read from hPanel | The live JSON health response is inconsistent with a successful `server.js` boot, but the panel value is still unread | A person who can open hPanel without restarting | Copy the entry file exactly. Do not restart to discover it | Operator |
| Production pooler URL not in this workspace | Cannot read `_prisma_migrations` | The session-pooler URL in a trusted shell | `npm run db:preflight -- --production`, share only host, port, database, and the decision | Operator |
| Backup not verified | A failed migration has no proven restore | Supabase backup timestamp or `pg_restore --list` | Record who would restore it | Operator |
| Programme-course backfill not approved | `migrate deploy` would insert any missing pair, and a programme enrolment then opens every linked course | Written approval after `npm run db:preflight:backfill -- --production` | Keep `--approve-backfill` unset. This report is not approval | Product owner |
| `CEO@skylent.in` password not available here | Super Admin was not created or signed in | Password via environment, not chat or git | Run bootstrap on an approved database | Product owner |
| No college role or membership | College dashboard cannot be honest | A product decision and a schema for a college tenant | Do not invent the role | Product owner |
| Object storage not configured for a tested upload | Covers and PDFs are not verified | `STORAGE_*` for an implemented provider | Local provider is the only implemented one, and it is refused in production | Operator |
| Career OS unlock policy not specified | The product stays locked, which is intended | A separate written policy | Do not grant access from signup or completion | Product owner |

## Backfill risk — not approved

The backfill is one `INSERT ... SELECT` into `ProgramCourse`. It joins `Program` and `Course` on slug and skips a pair that already has that programme and course (`WHERE NOT EXISTS`). A missing programme or course drops that pair. It does not change an existing link's `sortOrder`, and it does not delete rows.

The six pairs are Data Analytics Pro → Data Analytics, Data Science & AI → Data Analytics, Data Science & AI → Python, Full Stack → Full Stack Web, Generative AI → Generative AI, and Product Management → Product Management.

`resolveCourseEnrollment` treats an active or completed programme enrolment as access to every course linked from that programme. Linking Data Science & AI to Data Analytics would let those learners open the Data Analytics course without a separate course enrolment. The same is true for the other new links. That is an access change, not a schema drop.

The statement is one transaction. If it is interrupted before commit, Postgres keeps no new rows and Prisma leaves the migration unfinished (`finished_at` null, which health reports as failed). A later `migrate deploy` runs it again. If it has already committed, Prisma will not run it again. Running the SQL by hand a second time inserts nothing for pairs that exist. It is idempotent for existing links. New rows use random ids, so they cannot later be distinguished from links created another way. Undo is a backup restore.

`npm run db:preflight:backfill` runs only `SELECT` inside `SET TRANSACTION READ ONLY`. It refuses a non-local database unless `--production` is passed, and `--production` refuses anything that is not the session pooler. On 28 October 2026 it was run against local `skylent_agent_tmp` only. All six links were already present there, so nothing would be inserted. The local enrolment counts on that database are test data. They are not production learner counts. The production query was not run.

Post-migration check, after an approved deploy and not before: run the same preflight against the session pooler and expect `pairsThatWouldInsert: 0` for every pair whose programme and course both exist. Then confirm health is HTTP 200 with `migrations: ok`, and that Elixir, degrees, and events are no longer HTTP 503 because of a missing table.

This report does not approve the backfill.

## Section H — Deployment and recovery

Environment names, not values: `DATABASE_URL`, `DIRECT_URL`, `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_NAME`, `SUPERADMIN_ALLOW_PRODUCTION`, `SUPERADMIN_ALLOW_ELEVATION`, `DEMO_ACCOUNTS_PASSWORD`, `DEMO_CREDENTIALS_FILE`, `STORAGE_PROVIDER`, `STORAGE_BUCKET`, `STORAGE_LOCAL_PATH`, `COOKIE_SECURE`.

Still needed: Hostinger entry file, production pooler URL, backup, backfill decision, and the Super Admin password out of band.

Migration sequence if a later approved deploy uses `server.js`: Prisma applies every unfinished migration in folder order. That includes the eight previously pending migrations and `20261028143000_career_rise_os_lock_and_authoring`. The backfill cannot be skipped by `migrate deploy`.

Rollback: there is no down migration. Recovery is a restore of a backup taken before the deploy. That backup was not verified here.

Do not restart or redeploy Hostinger from this report.

## Deployment sequence — do not start it

`NO-GO` until every gate below is true.

1. An operator copies the Hostinger entry file, Node version, build script, and output directory from hPanel without restarting. Record whether it is `server.js` or `server/dist/index.js`.
2. A restorable backup is taken after the last production write and before any migration. Evidence is a Supabase backup timestamp and scope, or `pg_dump -Fc` through the session pooler followed by `pg_restore --list`. Name the person who would restore it. No restore is performed as a drill against production.
3. In a trusted shell, with the session-pooler URL only in that shell, run `npm run db:preflight -- --production` and `npm run db:preflight:backfill -- --production`. Keep host, port, database name, pending names, and the pair counts. Stop if the target is not the session pooler on port 5432.
4. The product owner writes approval for the six backfill pairs after reading those counts, especially how many Data Science & AI learners would gain Data Analytics. This report is not that approval.
5. Only then may an operator deploy. If the entry file is `server.js`, the boot itself runs `prisma migrate deploy` in folder order: the eight migrations above, then `20261028143000_career_rise_os_lock_and_authoring` if this branch is what was deployed. If the entry file does not migrate, the operator runs `prisma migrate deploy` once, deliberately, against the reviewed target. Do not use `migrate resolve` on the four production-only lesson-material migrations.
6. Afterward: health HTTP 200, `migrations: ok`, `failedMigrations` absent or 0, backfill preflight shows no remaining insert for pairs whose slugs exist, and Elixir, degrees, and events no longer 503 for a missing table. Signup and new enrolment should no longer 503 for missing policy storage.
7. Rollback: if migrate stops with a failed row, or health stays 503, or learners gain a course the approval did not accept, restore the backup taken in step 2. Do not mark a failed migration as finished. There is no down migration for the Elixir ledger, the `graded` enum value, or the backfill.

## Local verification added on 28 October 2026

| Command | Result |
| --- | --- |
| `npm run test:resume-upload-quiz` against a local API with `STORAGE_PROVIDER=local` | PASS. Quiz question persisted, a bad answer index returned 400, cover and PDF bytes were stored, sign-out returned 401, and the next login resumed the opened lesson. Opening the lesson left `completedAt` null. |
| `npm run test:storage` | PASS |
| `npm run test:security-middleware` | PASS |
| `npm run test:production-env` | PASS |
| `npm run test:password-reset` | PASS |
| `npm run test:enrollment-access` | PASS |
| `npm run test:quiz-limits` | PASS |
| `npm run test:assignment-flow` | PASS |
| `npm run test:degrees-auth` | PASS |
| `npm run test:events` | PASS |
| `npm run test:quiz-guard` | PASS after a local API restart. An earlier attempt returned HTTP 429 from the local auth limiter. |
| `npm run test:roles` | PASS after the catalog assertion was updated for the separate platform-admin role and the local API was restarted. Earlier attempts returned HTTP 429. |
| Headless Chrome, signed out, `http://127.0.0.1:5174/dashboard/curriculum` | Rendered the sign-in page. The course builder was not shown. |
| Signed-in browser pass of the builder, My Courses, and Career Rise button | NOT RUN |
| `test:lms`, `test:ai`, `test:elixir`, `test:labs`, `test:projects`, `test:migration-replay`, `test:integration`, `test:catalog-parity`, `test:employer`, `test:password-reset-http` | NOT RUN |

Career OS lock and Career Rise eligibility were not changed in this recheck.

## Section I — Final readiness decision

`NO-GO`

`NOT READY FOR APPROVAL`

Production health is HTTP 503 with eight pending migrations and zero failed. The backup is not verified. The backfill has no written approval. The Hostinger entry file has not been read from hPanel. No production migration or deployment was performed.
