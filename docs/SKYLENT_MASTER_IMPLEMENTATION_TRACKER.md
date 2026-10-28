# Skylent master implementation tracker

Updated: 28 October 2026, 8:41 PM IST.

This file is the progress register for the master stabilisation pass. Statuses mean what they say. A local test is not production verification.

## Deployment readiness recheck — 28 October 2026, 8:20 PM IST

- Recommendation: `NO-GO`. Rechecked at 8:41 PM IST: live health is still HTTP 503, 8 pending, 0 failed. No production query, migration, or deploy.
- Production health, read at 8:20 PM IST: `GET https://skylent.live/api/v1/health` returned HTTP 503. Body: `status: error`, `db: ok`, `migrations: pending`, `pendingMigrations: 8`, `failedMigrations: 0`, `ai: not_configured`, `release: unknown`. Headers: `platform: hostinger`, `panel: hpanel`, `server: hcdn`.
- Same minute: Elixir HTTP 503, degrees HTTP 503, events HTTP 503, each with the existing unavailable sentence.
- No production database query was run. This workspace's database target is local class, database `skylent_agent_tmp`, port 5432. `npm run db:preflight:backfill -- --production` exited 1 with `DECISION BLOCKED` and did not connect as production.
- The eight pending names were not returned by production. Production hides them when `NODE_ENV=production` (`server/src/routes/health.ts`). The count of 8 matches the eight `202610*` migration folders that existed before `20261028143000_career_rise_os_lock_and_authoring`. That newer migration is on this branch and is not what the live process is counting, because this branch has not been deployed and `release` is `unknown`. This is an inference from the live count and the repository history, not a reading of `_prisma_migrations`.
- The process serving that JSON did not apply those eight migrations on boot. `server.js` runs `prisma migrate deploy` and exits if it fails, so a successful boot of `server.js` would not still report eight pending and zero failed. Hostinger's documented entry file for Express is a path such as `server.js` relative to the repo root (docs.hostinger.com/node.js/build-settings, page updated 23 September 2026). An empty entry file is a static site, which would not return this JSON. The hPanel value itself was not opened.
- Local read-only backfill preflight on `skylent_agent_tmp`: all six pairs already linked, so `pairsThatWouldInsert` was 0. Those enrolment counts are local test rows, not production learners.
- Backup evidence: still missing. No Supabase backup timestamp and no `pg_restore --list` output are in this workspace.

Live read-only check at 8:13 PM IST on 28 October 2026: `GET https://skylent.live/api/v1/health` returned HTTP 503, `db: ok`, `migrations: pending`, `pendingMigrations: 8`, `failedMigrations: 0`, `ai: not_configured`. `GET /api/v1/elixir/account` returned HTTP 503 with the existing unavailable sentence. No production write, migration, restart, or deployment was performed.

## Phase 0 — Repository audit and safety baseline

- Status: `VERIFIED`
- Relevant files inspected: `package.json`, `prisma/schema.prisma`, `server/src/index.ts`, `server/src/lib/auth.ts`, `server/src/lib/roles.ts`, `server/src/routes/lms.ts`, `server/src/routes/career/index.ts`, `server/src/routes/faculty.ts`, `server/src/routes/admin.ts`, `src/App.tsx`, `src/pages/home/Repolish.tsx`, `src/pages/DashboardStudentPage.tsx`, `docs/ENGINEERING_HANDOFF_2026-10-28.md`.
- Files changed: this tracker.
- Database changes: none in this phase.
- Implementation completed: audit only.
- What already works: Express API under `/api/v1`, Prisma/Postgres, session auth, roles `ADMIN` (API `superadmin`), `FACULTY`, `STUDENT`, `RECRUITER`, `ORGANISATION_ADMIN`, enrolment, lesson progress, assignments, catalogue, degree pages that label sample listings, and the live homepage direction in `HomePage` / `Repolish`.
- UI or partial: course creation was not available through the application. Faculty had no course assignment, so teaching scope was empty. My Courses rendered one row per enrolment. Career OS was open to every signed-in user. Career Rise did not exist. There is no college role.
- Tests available: `npm run test:*` scripts in `package.json`, plus `npm run build` and `npm run typecheck`.
- Safe locally: additive schema, local tests, local provisioning.
- Requires approval: production migration, Hostinger restart, backfill, production account creation.
- Known risks: `server.js` runs `prisma migrate deploy` before the app starts. Shipping this branch to the live host would apply the new migration and the eight previously pending migrations.
- Unresolved blockers: production entry file, pooler URL, backup, and backfill approval remain with an operator.
- Next action: do not deploy.
- Safe to proceed from: yes, for local work.

## Phase 1 — Production and database safety

- Status: `BLOCKED`
- Relevant files inspected: `server.js`, `server/src/routes/health.ts`, `server/src/lib/migration-guard.ts`, `server/src/lib/database-target.ts`, `scripts/check-migration-history.ts`, `scripts/preflight-program-course-backfill.ts`, `docs/ENGINEERING_HANDOFF_2026-10-28.md`, migration SQL through `20261028143000`, Hostinger build-settings documentation.
- Files changed: `scripts/test-migration-history.ts` so the new migration is part of the local history check. `prisma/migrations/20261028143000_career_rise_os_lock_and_authoring/migration.sql`.
- Database changes: applied only to the local database `skylent_agent_tmp` on `127.0.0.1`. `npx prisma migrate deploy` reported 17 local migrations applied, including the new one. Production was not migrated.
- Startup: `npm start` is `node server.js`, which runs `prisma migrate deploy` and then imports `server/dist/index.js`. Running `node server/dist/index.js` directly does not migrate. Hostinger's real entry file was not readable from this environment.
- Production target: code accepts only a Supabase session pooler on port 5432. This workspace's `DATABASE_URL` is local. `db:preflight --production` against it is a refusal, not a production reading.
- October migrations already in the repo remain additive except `20261004180000_backfill_program_course_links`, which inserts six programme-course links and has no clean undo. That backfill is still not approved and was not executed against production.
- The new migration adds `PLATFORM_ADMIN`, draft-course columns (existing rows stay `PUBLISHED` and `authoredInApp = false`), `mustChangePassword` default false, Career OS access, Career Rise enrolment, faculty assignment, and lesson materials. It inserts no access rows and no Career Rise rows.
- Backup: not verified. No restore was attempted.
- Tests executed: `npm run test:migration-history` — PASS (`migration-history ok`). Live health GET at 8:20 PM IST — HTTP 503, 8 pending, 0 failed. `npm run db:preflight:backfill` — PASS as a local read. `npm run db:preflight:backfill -- --production` — BLOCKED on the local target, exit 1.
- Manual verification required: Hostinger entry file, read-only migration table, backup evidence, written backfill decision.
- Production verification required: all of the above, on the real pooler, before any deploy.
- Known risks: deploying this branch applies every pending migration, including the backfill, because `migrate deploy` cannot skip it.
- Unresolved blockers: no verified Hostinger entry file, no production pooler URL in this workspace, no backup evidence, no backfill approval.
- Next action: an operator with Hostinger and Supabase access completes the four checks in `docs/ENGINEERING_HANDOFF_2026-10-28.md` section 13. Do not pass `--approve-backfill`.
- Safe to proceed from: yes for local product work. No for production.

## Phase 2 — Authentication, Super Admin, and account security

- Status: `PARTIALLY COMPLETE`
- Relevant files inspected: `scripts/bootstrap-superadmin.ts`, `server/src/lib/auth.ts`, `server/src/routes/auth.ts`, `prisma/schema.prisma` `User` and `RoleName`.
- Files changed: `scripts/bootstrap-superadmin.ts`, `scripts/provision-demo-accounts.ts`, `server/src/routes/auth.ts`, `server/src/lib/auth.ts`, `src/pages/ChangePasswordPage.tsx`, `src/context/AuthContext.tsx`.
- Database changes: local only. A disposable superadmin was created, checked, and deleted. Five local demo accounts were created by `provision:demo` during `npm run test:career-os-lock`.
- Implementation completed:
  - Super Admin remains `RoleName.ADMIN` / API `superadmin`. A lesser platform admin is `RoleName.PLATFORM_ADMIN` / API `admin`.
  - Bootstrap reads `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` from the environment. It refuses a non-local database unless `SUPERADMIN_ALLOW_PRODUCTION=yes`. It refuses to elevate an existing non-admin unless `SUPERADMIN_ALLOW_ELEVATION=yes`. An existing admin is left unchanged, including the password. A new account is created with `mustChangePassword: true` and an audit row. The password is not printed.
  - `POST /api/v1/auth/change-password` clears the flag. Other authenticated APIs return `PASSWORD_CHANGE_REQUIRED` until it is cleared.
  - Demo provisioning is local-only, idempotent, and does not create Career OS or Career Rise rows.
- Tests executed:
  - Production-shaped URL with `SUPERADMIN_EMAIL=CEO@skylent.in`: refused before a write. Exit 1. Account not created.
  - Local disposable admin: created with role `ADMIN`, `mustChangePassword: true`, audit action `auth.superadmin.created`, then deleted.
  - Second run on that account before deletion: `already_present`.
  - Existing student `existing-learner@skylent.invalid`: elevation refused. Role stayed `STUDENT`. User then deleted.
  - `npm run test:career-os-lock`: PASS, including demo student login and demo admin login as `admin`, not `superadmin`.
- Actual test results: PASS for the cases above. The real `CEO@skylent.in` account was not created. The password was not present in this workspace or conversation, and it was not invented.
- Manual verification required: run bootstrap on the intended database only after the operator supplies the password in the environment and the production gate in Phase 1 is approved.
- Production verification required: none performed.
- Known risks: `SUPERADMIN_ALLOW_ELEVATION=yes` replaces other roles with admin. Do not set it for an account whose identity has not been checked.
- Unresolved blockers: real Super Admin password must be supplied out of band. First login of `CEO@skylent.in` is not verified because the account was not created.
- Next action: operator runs `npm run bootstrap:superadmin` with env vars on an approved database, then changes the password at first login.
- Safe to proceed from: yes.

### Demo accounts (local database only)

| Role | Email | Application role | Login checked |
| --- | --- | --- | --- |
| Demo Admin | `demo-admin@skylent.invalid` | `admin` (`PLATFORM_ADMIN`) | Yes. Cannot list `/admin/users`. |
| Demo Organisation | `demo-organisation@skylent.invalid` | `organisation` | Not signed in during this pass. Membership is the local org `demo-organisation`. |
| Demo Student | `demo-student@skylent.invalid` | `student` | Yes. Career OS locked. |
| Demo College | `demo-college@skylent.invalid` | none | Not signed in. No college role exists. |
| Demo Teacher | `demo-teacher@skylent.invalid` | `faculty` | Not signed in. Assigned to draft course `demo-teaching-course`. |

Passwords are not recorded here. `npm run provision:demo` writes them to `DEMO_CREDENTIALS_FILE` or `/tmp/skylent-demo-credentials.txt` and does not print them. That file was removed after the lock test. These accounts are test data, not real learners or partners.

## Phase 3 — Role-based authorization

- Status: `PARTIALLY COMPLETE`
- Role map used, without a duplicate college role: Super Admin = `ADMIN`; Admin = `PLATFORM_ADMIN`; Organisation = `ORGANISATION_ADMIN`; Teacher = `FACULTY`; Student = `STUDENT`. College is not a role.
- Files changed: `server/src/lib/auth.ts`, `server/src/routes/admin.ts`, `server/src/routes/faculty.ts`, `server/src/routes/admin-curriculum.ts`, `src/lib/auth-routing.ts`, `src/role-themes.ts`.
- Implementation completed:
  - Platform admin can call curriculum routes and cannot call `/api/v1/admin/users`.
  - Faculty submission list, read, and grade are limited to `FacultyCourseAssignment`. Super Admin is not limited by that table.
  - Faculty `POST /faculty/courses` and module delete return 403.
  - An assigned teacher can add a lecture on an assigned course. An unassigned teacher cannot.
  - Students cannot create courses.
- Tests executed: `npm run test:curriculum-authoring` PASS. `npm run test:career-os-lock` PASS. `npm run test:auth` PASS after the local API was restarted to clear a signup rate limit.
- Actual test results: PASS for those scripts. Not every historical admin route was called again.
- Manual verification required: organisation and college boundaries in a browser.
- Production verification required: none.
- Known risks: a user with `ADMIN` is still the full Super Admin. Do not give that role to the demo admin.
- Unresolved blockers: no college tenancy model, so college boundaries cannot be enforced.
- Next action: do not add a college role until a college record and membership exist.
- Safe to proceed from: yes.

## Phase 4 — Course builder and curriculum authoring

- Status: `PARTIALLY COMPLETE`
- Files changed: `server/src/routes/admin-curriculum.ts`, `src/pages/CourseBuilderPage.tsx`, `src/App.tsx` route `/dashboard/curriculum`.
- Database changes: local courses created and deleted by the authoring test. Draft courses use `publicationStatus = DRAFT` and `authoredInApp = true`. Existing catalogue rows stay published and outside the new allow path.
- Implementation completed: authorised admin or Super Admin can create a draft course, add a module at a position, reorder by sending the full module list, add a lecture to a chosen module, attach a file when storage is configured, set a cover image the same way, and publish only when at least one module and one lecture exist. Public catalogue hides drafts. Deleting a module with lectures requires `confirm`. Deleting one with learner progress also requires `confirmDestroyProgress`.
- Tests executed: `npm run test:curriculum-authoring` PASS (create, position, lecture parent, reload, student refusal, teacher boundaries, publish, public catalogue).
- Actual test results: PASS. File upload was not executed. Storage returns 503 when it is not configured and does not store a browser path.
- Manual verification required: click through `/dashboard/curriculum` while signed in as the platform admin. Upload a cover and a PDF where `STORAGE_PROVIDER=local` and `STORAGE_BUCKET` are set.
- Production verification required: none. Live streaming, automatic grading, and hosted video were not added.
- Known risks: publishing a builder course makes it enrolable because `authoredInApp` is true. It does not invent ratings; rating and review count are stored as 0.
- Unresolved blockers: object storage other than local is still unimplemented.
- Next action: configure storage before treating uploads as available.
- Safe to proceed from: yes.

## Phase 5 — Homepage and product truth

- Status: `PARTIALLY COMPLETE`
- Files changed: `src/pages/home/Repolish.tsx`, `src/pages/career/CareerOSPublicPage.tsx`, `src/lib/truth.ts`. `src/App.tsx` still serves `/` from `HomePage`. `/preview/homepage` remains a separate route and was not made the homepage.
- Implementation completed: How learning works still plays the five stages. Each stage now has its own link: programme `/programmes/data-analytics-pro`, lesson `/courses/data-analytics`, practice `/os/practice/data-analytics`, project `/os/projects/data-analytics/northwind`, evidence `/verify`. Homepage and public Career OS copy no longer say that enrolment opens Career OS.
- Tests executed: headless Chrome dump of `http://127.0.0.1:5174/` showed How learning works and all five links, and did not show the preview-only homepage. `http://127.0.0.1:5174/career-os` showed Career OS locked.
- Actual test results: PASS for those DOM checks. Responsive layout was not rechecked. The project link was not followed in the browser.
- Manual verification required: follow each stage link while signed in and signed out.
- Production verification required: the live homepage was not changed.
- Known risks: the stage panel is still an example from Data Analytics, labelled as not the visitor's account.
- Unresolved blockers: none for local copy. Do not promote `/preview/homepage`.
- Next action: keep `/` on `HomePage`.
- Safe to proceed from: yes.

## Phase 6 — Programme and degree pages

- Status: `PARTIALLY COMPLETE`
- Files inspected: `src/pages/education/DegreeParts.tsx`, `CampusDegreeView.tsx`, `OnlineDegreeView.tsx`, programme templates. Sample degrees already say they are sample listings and that Skylent does not award them.
- Files changed: no new programme or degree content was invented. Pre-existing uncommitted catalogue presentation files remain in the working tree.
- Database changes: none for this phase.
- Implementation completed: none beyond leaving the honest sample labelling in place.
- Tests executed: not a dedicated programme-content test in this pass.
- Actual test results: `NOT RUN` for a new subject-page suite.
- Manual verification required: open each public programme and degree route and confirm empty or sample states.
- Production verification required: live catalogue was not re-fetched in this pass.
- Known risks: Northwind remains the Data Analytics project example only.
- Unresolved blockers: no approved Digital Marketing curriculum exists to publish.
- Next action: add subject pages only from configured records.
- Safe to proceed from: yes.

## Phase 7 — My Courses and course enrolments

- Status: `PARTIALLY COMPLETE`
- Cause found: `GET /api/v1/lms/enrollments` already returned every enrolment and, for a programme, `courses[]`. The dashboard rendered one row per enrolment, titled with the programme name.
- Files changed: `src/lib/my-courses.ts`, `src/pages/DashboardStudentPage.tsx`.
- Implementation completed: the list expands each enrolment to its courses and does not repeat the same course slug.
- Tests executed: `npm run test:my-courses` PASS. Zero rows, one course, a programme with two courses, and three distinct courses. The API returned two course enrolments and a programme row whose `courses.length` was 2.
- Actual test results: PASS. The signed-in dashboard was not opened in a browser.
- Manual verification required: sign in as a learner with more than one course and confirm the rows.
- Production verification required: none.
- Known risks: a programme enrolment and a direct enrolment in the same course collapse to one row by slug.
- Unresolved blockers: none local.
- Next action: browser check with the demo student after that account is given real enrolments. The demo student currently has none.
- Safe to proceed from: yes.

## Phase 8 — Learner dashboard and learning progress

- Status: `PARTIALLY COMPLETE`
- Files inspected: `LessonProgress`, `UserEnrollment.lastAccessedNodeId`, `server/src/lib/lms.ts`.
- Files changed: dashboard course rows link to `/learn/:slug`. Opening a lesson still does not set `completedAt`. That existing rule is what Career Rise uses.
- Implementation completed: no new progress table. Completion remains `completedAt` on the lesson, or the existing quiz/assignment completion rules inside the learner workspace.
- Tests executed: Career Rise proved that a `LessonProgress` row without `completedAt` does not count. A full leave-and-return browser session was `NOT RUN`.
- Actual test results: progress-count rule PASS inside `npm run test:career-rise`. Resume-after-relogin `NOT RUN`.
- Manual verification required: complete a lesson, sign out, sign in, and confirm the same lesson.
- Production verification required: none.
- Known risks: the dashboard no longer loads a second workspace request per row. Resume opens the course player, which already reads `lastAccessedNodeId`.
- Unresolved blockers: none that stop local use.
- Next action: one manual resume check.
- Safe to proceed from: yes.

## Phase 9 — Career Rise

- Status: `VERIFIED` for the eligibility rule and API. The dashboard card was not clicked in a browser.
- Calculation: a module counts only when it has at least one curriculum node. It is complete only when every node has `LessonProgress.completedAt` for that learner. `percent = floor(completedModules * 100 / totalModules)`. Eligible when `completedModules * 100 >= totalModules * 60`. Opening a lesson does not complete it. Reaching 60% does not enrol the learner. `POST /api/v1/career-rise/enrolments` checks again. A second post returns the same row with `duplicate: true`. Another learner gets 403 on the workspace. The workspace reports coaching, placements, and mentorship as not provided.
- Files changed: `server/src/lib/career-rise.ts`, `server/src/routes/career-rise.ts`, `src/components/learner/CareerRiseCard.tsx`, migration above.
- Tests executed: `npm run test:career-rise` PASS (0%, 59 of 100, 60 of 10, 70 of 10, started-but-not-complete, duplicate, outsider).
- Actual test results: PASS.
- Manual verification required: click Enrol on the learner dashboard.
- Production verification required: do not apply the migration to production until Phase 1 is approved.
- Known risks: programme scope uses linked course modules, which is the taught curriculum.
- Unresolved blockers: none for the rule itself.
- Next action: none until an operator wants the migration in production.
- Safe to proceed from: yes.

## Phase 10 — Career OS lock

- Status: `VERIFIED`
- Rule: `CareerOsAccess` is required. Signup, demo provisioning, course completion, Career Rise, and Super Admin do not create that row. Learner Career OS routes return 403 `CAREER_OS_LOCKED`. `GET /api/v1/career/access` reports the lock. Public job listing and employer routes stay on their existing auth. There is no product endpoint that grants the entitlement.
- Files changed: `server/src/lib/career-os-access.ts`, `server/src/routes/career/index.ts`, `src/pages/career/CareerOSLayout.tsx`, `src/pages/NorthwindProjectPage.tsx`, and the career tests that now grant access only inside the test.
- Tests executed: `npm run test:career-os-lock` PASS. `npm run test:career` PASS after an explicit test grant. `npm run test:data-isolation` PASS, including a 403 before the grant.
- Actual test results: PASS.
- Manual verification required: signed-in visit to `/career-os` shows the locked page. Public page was checked headless.
- Production verification required: the lock is not on the live server until this branch is deployed, and it must not be deployed under the Phase 1 block.
- Known risks: existing tests that need Career OS behaviour call `grantCareerOsForTest`. That helper is not mounted as an HTTP route.
- Unresolved blockers: a future unlock policy has not been specified. Do not add one silently.
- Next action: leave the table empty.
- Safe to proceed from: yes.

## Phase 11 — Role-specific dashboards and demo verification

- Status: `PARTIALLY COMPLETE`
- Tests executed: demo student and demo admin API login inside `npm run test:career-os-lock` PASS. Teacher lecture boundary inside `npm run test:curriculum-authoring` PASS.
- Actual test results: PASS for those API checks. Organisation, college, and teacher dashboards were not opened in a browser. College has no role and no dashboard.
- Manual verification required: sign in to each demo account on the local app.
- Production verification required: do not copy demo accounts to production.
- Known risks: demo records live in the local database named by `DATABASE_URL`.
- Unresolved blockers: college workflows.
- Next action: cleanup is deleting the local users and the draft `demo-teaching-course` if they are no longer needed. They are labelled demo.
- Safe to proceed from: yes.

## Phase 12 — Routing, navigation, and design consistency

- Status: `PARTIALLY COMPLETE`
- Files changed: `src/App.tsx` adds `/dashboard/curriculum` and `/account/password`. Logo and `/` were not pointed at the preview homepage.
- Tests executed: headless homepage and Career OS DOM checks above. Browser back/forward, mobile, and every admin route were `NOT RUN`.
- Actual test results: PASS for the two pages that were rendered. The rest `NOT RUN`.
- Manual verification required: a pass across desktop and mobile for nav, login, dashboards, and the course player.
- Production verification required: none.
- Known risks: none beyond the unapproved preview route remaining available at `/preview/homepage`.
- Unresolved blockers: none that require a redesign.
- Next action: do not restyle the public site.
- Safe to proceed from: yes.

## Phase 13 — Testing, security review, and regression

- Status: `PARTIALLY COMPLETE`
- Build: `npm run build` PASS (Vite client build and `tsc -p tsconfig.backend.json`).
- Typecheck: `npx tsc --noEmit` PASS. Backend `tsc` PASS.
- Commands and results:
  - `npm run test:migration-history` — PASS
  - `npm run test:my-courses` — PASS
  - `npm run test:career-os-lock` — PASS
  - `npm run test:curriculum-authoring` — PASS
  - `npm run test:career-rise` — PASS
  - `npm run test:auth` — FAIL once with HTTP 429 from the local signup limiter, then PASS after the local API process was restarted
  - `npm run test:data-isolation` — PASS
  - `npm run test:career` — PASS
  - Live `GET https://skylent.live/api/v1/health` — HTTP 503, 8 pending, 0 failed
  - Headless Chrome homepage and `/career-os` — PASS for the checks named in Phases 5 and 10
  - Full `test:lms`, `test:assignment-flow`, `test:elixir`, `test:degrees-auth`, `test:enrollment-access`, and the rest of `package.json` — `NOT RUN` in this pass
- Production was not used as a test database.
- Safe to proceed from: yes, to the report. Not to production.

## Phase 14 — Final audit and handoff

- Status: `VERIFIED` as a report of what was actually run. The release decision is `NOT READY FOR APPROVAL`.
- Files changed: `docs/SKYLENT_MASTER_FINAL_REPORT.md` and this tracker.
- Next action: operator approval for production. Do not deploy from this report.
- Safe to proceed from: no production action.
