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

Production decision: `NOT READY FOR APPROVAL`.

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

Checked: yes, read-only, at 8:13 PM IST on 28 October 2026.

`https://skylent.live/api/v1/health` returned HTTP 503. The JSON said the database connection was ok, 8 migrations pending, 0 failed, and AI not configured. Elixir returned HTTP 503 with the existing unavailable sentence. Response headers identified Hostinger (`platform: hostinger`, `server: hcdn`).

The eight pending names were not listed, because production hides them. They are the October migrations already documented in the engineering handoff, not the new Career Rise migration. This branch has not been deployed, so production is not running it.

Backup: not verified.

Hostinger entry file: not visible from this environment. `package.json` `start` is `node server.js`, which migrates. That is not proof of the hPanel entry file.

Production changes made by this pass: none.

## Section G — Known issues and blockers

| Blocker | Impact | Needed from | Next action | Role |
| --- | --- | --- | --- | --- |
| Hostinger entry file unknown | Cannot prove whether boot migrates | A person who can open hPanel without restarting | Copy the entry file, Node version, and build command | Operator |
| Production pooler URL not in this workspace | Cannot read `_prisma_migrations` | The session-pooler URL in a trusted shell | `npm run db:preflight -- --production`, share only host, port, database, and the decision | Operator |
| Backup not verified | A failed migration has no proven restore | Supabase backup timestamp or `pg_restore --list` | Record who would restore it | Operator |
| Programme-course backfill not approved | `migrate deploy` would insert the six links, including Data Science & AI to Data Analytics | Written approval after the read-only pair query in the handoff | Keep `--approve-backfill` unset | Product owner |
| `CEO@skylent.in` password not available here | Super Admin was not created or signed in | Password via environment, not chat or git | Run bootstrap on an approved database | Product owner |
| No college role or membership | College dashboard cannot be honest | A product decision and a schema for a college tenant | Do not invent the role | Product owner |
| Object storage not configured for a tested upload | Covers and PDFs are not verified | `STORAGE_*` for an implemented provider | Local provider is the only implemented one, and it is refused in production | Operator |
| Career OS unlock policy not specified | The product stays locked, which is intended | A separate written policy | Do not grant access from signup or completion | Product owner |

## Section H — Deployment and recovery

Environment names, not values: `DATABASE_URL`, `DIRECT_URL`, `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_NAME`, `SUPERADMIN_ALLOW_PRODUCTION`, `SUPERADMIN_ALLOW_ELEVATION`, `DEMO_ACCOUNTS_PASSWORD`, `DEMO_CREDENTIALS_FILE`, `STORAGE_PROVIDER`, `STORAGE_BUCKET`, `STORAGE_LOCAL_PATH`, `COOKIE_SECURE`.

Still needed: Hostinger entry file, production pooler URL, backup, backfill decision, and the Super Admin password out of band.

Migration sequence if a later approved deploy uses `server.js`: Prisma applies every unfinished migration in folder order. That includes the eight previously pending migrations and `20261028143000_career_rise_os_lock_and_authoring`. The backfill cannot be skipped by `migrate deploy`.

Rollback: there is no down migration. Recovery is a restore of a backup taken before the deploy. That backup was not verified here.

Do not restart or redeploy Hostinger from this report.

## Section I — Final readiness decision

`NOT READY FOR APPROVAL`

The local build and the tests named above passed. Production is still returning HTTP 503 with eight pending migrations. Backup, the Hostinger entry file, the pooler read, and the backfill decision are not done. The real Super Admin account was not created.
