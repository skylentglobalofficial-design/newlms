# Career OS Entitlement: Evidence and Rollout

## Current evidence

- `UserEnrollment` can record a course or programme enrollment and an active, completed, or withdrawn status. It has no cohort, batch, eligibility-rule version, or Career OS entitlement relation.
- The programme catalogue has `programType` and `enrollmentStatus`, but no cohort configuration or approved eligibility rules.
- Career OS routes are mounted under `/career`. Their personal-data handlers require authentication and scope records to the authenticated user; there is no shared Career OS entitlement middleware.
- `CareerProfile` is not evidence that someone participated: `GET /career/profile` calls `getOrCreateProfile`, so any signed-in caller can create an empty profile merely by viewing it. Other Career OS rows prove use of that feature, but do not establish an authorized Professional Program or cohort decision.
- `PolicyAcceptance` records a policy version and server timestamp for signup, Google signup, enrollment, and enquiries. It does not record a distinct Career OS access decision or access-specific terms acceptance.
- Career profiles, projects, applications, interview rounds, and support requests are attached to users and must remain available if access is expired or revoked. Revocation must change access state, not delete learner data.
- The Prisma schema and server/client source contain no rewards, points, wallet, ledger, XP, achievement, or streak subsystem. `docs/CURSOR-HANDOFF.md` also records streaks, XP, and leaderboards as missing. Do not create a rewards subsystem as part of entitlement work.

## Participation classification blocker

The current application can identify existing Career OS records and programme enrollments if run against a database, but it cannot establish which people were legitimately granted Career OS access under historical business rules. An empty or auto-created profile is insufficient evidence; activity in another feature is not proof of an entitlement. No production data has been queried, and no verified disposable participant snapshot is available in this workspace. Therefore this repository does not currently support a safe automated legacy-participant backfill.

Do not add an active access gate, infer a cohort, invent cohort dates, apply a universal progress threshold, or silently grant/revoke entitlements based on unrelated activity.

## Model direction

Before enforcement, define configurable programme/cohort eligibility records with an explicit rule version and decision inputs. A learner entitlement should retain its source enrollment and cohort/configuration references, grant time, optional expiry, current state, and the rule version used. Administrative grant, revoke, reinstate, and expiry decisions should be append-only audit events with actor, timestamp, reason, and relevant configuration reference. Missing or inactive configuration must block new grants with a clear reason; it must not erase existing learner data.

Record explicit Career OS terms acceptance with the accepted policy version and server timestamp, linked to the entitlement/decision. Existing generic signup or enrollment acceptance must not be represented as acceptance of new access-specific terms unless the accepted text actually covered them.

## Non-lockout rollout

1. Agree the Professional Program, cohort, and eligibility rules as configuration; keep dates, thresholds, and other criteria configurable rather than hard-coded.
2. Add schema and APIs additively. Initially run eligibility evaluation in shadow mode: report proposed decisions without denying requests, mutating learner records, or creating guessed legacy grants.
3. Classify existing participants from an approved, reviewable source. Record exceptions and administrative decisions explicitly. Keep existing Career OS behavior available until this review is complete; do not use profile existence as the allow-list.
4. Exercise migration, policy acceptance, entitlement lifecycle, authorization, and preservation of learner records against the disposable PostgreSQL service in `.github/workflows/release-gate.yml`.
5. Enable server-side checks only after the legacy classification is reconciled and approved. Enforce on every protected `/career/*` API, not only the React route. Missing configuration must deny new access safely and explain the next step; it must not delete or cascade-delete Career OS data.
6. Monitor denied requests and audit events through a reversible rollout switch. Expiry and revocation remove access, never the profile, evidence, applications, or other learner-owned records.

## CI coverage and next safe step

The release-gate workflow creates a PostgreSQL 16 service, applies migrations, seeds QA content, starts the API, and runs `test:career`, `test:career-evidence`, `test:consent`, and LMS integration suites against that service. The Career OS linked-job status API regression is part of `test:career`; database-independent dashboard navigation and job-status policy checks run in the no-database checks. This workflow can validate a future entitlement migration and API tests without production access when run by GitHub Actions.

Until an approved legacy participant source and eligibility configuration are available, limit implementation to schema-independent checks and additive preparation. Do not migrate or gate production participants in this state.