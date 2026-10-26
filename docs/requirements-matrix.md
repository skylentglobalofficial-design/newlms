# Skylent — Requirements Matrix

**Last Updated:** 2026-10-24
**Branch:** `cursor/product-completion-f670`
**PR:** #203
**Source:** Codebase inspection and local regression tests on this branch

---

## Status Legend

| Status | Meaning |
|--------|---------|
| GREEN | Implemented with appropriate test evidence on this branch |
| AMBER | Implementation exists; external configuration or operator action remains |
| RED | Broken, unsafe, or missing a required capability that was claimed |
| UNVERIFIED | Not confirmed with current authorized evidence (especially production) |

---

## Feature Requirements

### Authentication and Identity

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Email/password signup | GREEN | `server/src/routes/auth.ts`, `test:auth` | Full validation |
| Email/password login | GREEN | `server/src/routes/auth.ts` | Session-based |
| Logout | GREEN | `server/src/routes/auth.ts` | Clears session |
| CSRF protection | GREEN | `server/src/lib/auth.ts` | Double-submit cookie |
| Google OAuth | AMBER | `server/src/lib/google-oauth.ts` | Needs credentials |
| Password reset (backend) | AMBER | `password-reset.ts`, `email.ts`, `test:password-reset` | Tokens/rate limits GREEN; email delivery needs Mailgun/SendGrid credentials |
| Password reset page | GREEN in code | `/reset-password`, `ResetPasswordPage.tsx` | The email link lands here. Mail delivery is still AMBER until a provider is configured. |
| Email verification | RED | — | Not implemented |

### LMS and Learning

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Explicit enrolment | GREEN | `server/src/routes/lms.ts` | POST to enrol, no auto-enrol |
| Course workspace | GREEN | `server/src/routes/lms.ts` | Full curriculum access |
| Sequential unlock | GREEN | `server/src/lib/lms.ts` | Prerequisites enforced |
| Quiz server-side scoring | GREEN | `server/src/lib/quiz-attempts.ts` | Answers never exposed |
| Quiz rate limiting | GREEN | `quiz-attempts.ts` | 5 attempts/15 min |
| Quiz explanations | GREEN | `QuizQuestion.explanation` | After passing |
| Quiz attempt limits | GREEN | `CurriculumNode.maxAttempts` | Configurable |
| Quiz passing score | GREEN | `CurriculumNode.passingScore` | Configurable |
| Assignment submission | GREEN | `server/src/routes/lms.ts` | Text + attachment metadata |
| Assignment grading | GREEN | `server/src/routes/faculty.ts` | Grade, feedback |
| Certificates | GREEN | `server/src/routes/skylent/certificates.ts` | Issue, list, verify |
| Lesson progress | GREEN | `LessonProgress` model | Completion tracking |

### Events and Webinars

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Event model + API | GREEN | `server/src/routes/events.ts`, `test:events` | Registration, capacity |
| Frontend pages | GREEN | `EventsPage.tsx`, `EventDetailPage.tsx` | Full UI |
| Live video/conferencing | RED | — | Not implemented |
| Attendance tracking | RED | — | Not implemented |

### Career OS

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Career profile | GREEN | `server/src/routes/career/profile.ts` | Full CRUD |
| Job listings / applications | GREEN | career routes | Filter, apply, save |
| Sample job data in production | UNVERIFIED | `prisma/seed-career.ts` | Seed script exists; production population not verified |

### Education and Degrees

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Degree/Institution models | GREEN | `prisma/schema.prisma`, migration `20261024140000` | Normalized |
| Degrees backend API | GREEN | `server/src/routes/degrees.ts`, `test:degrees-auth` | Public + admin; unpublished forced hidden |
| Frontend degrees catalogue | AMBER | `src/lib/degrees.ts`, `src/hooks/useDegreeCatalogue.ts` | Sample listings stay. `GET /api/v1/degrees` adds or replaces a row only when a published degree is returned. An empty or unavailable API leaves the samples. |
| Real institution content | AMBER | Empty DB by design | No fictitious seed; populate via admin API when confirmed |

### File Uploads

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Attachment metadata | AMBER | `AssignmentAttachment` | Metadata only |
| Storage abstraction | AMBER | `server/src/lib/storage.ts`, `test:storage` | Only `local` implemented (dev); refused in production. S3/GCS/Azure **not** implemented |
| Production object storage | RED | — | No production-ready provider implemented |

### Role-Based Access Control

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Role definitions / guards | GREEN | `requireRoles()`, faculty/admin routes | Backend enforcement |
| Degrees admin mutations | GREEN | `requireRoles("superadmin")` + CSRF | `test:degrees-auth` |

---

## Migration Inventory (this release tree)

Seven additive October migrations ship in `prisma/migrations` after the September baseline:

1. `20261004000000_skylent_additions`
2. `20261004180000_backfill_program_course_links`
3. `20261009000000_policy_acceptance`
4. `20261011000000_employer_membership_and_shared_applications`
5. `20261017120000_practice_workspaces`
6. `20261024120000_quiz_grading_events`
7. `20261024140000_password_reset_and_degrees`

This count is the **release tree expectation**, not evidence of current production state. Production application status is **UNVERIFIED** without an authorized read-only preflight against production.

Four production-only migrations (lesson materials) remain expected outside this tree — see `docs/PRODUCTION.md`.

---

## Local Test Results (this verification pass)

| Test | Command | Result |
|------|---------|--------|
| Migration history | `npm run test:migration-history` | Recorded in delivery report |
| Password reset security | `npm run test:password-reset` | Recorded in delivery report |
| Degrees authorization | `npm run test:degrees-auth` | Recorded in delivery report |
| Storage validation | `npm run test:storage` | Recorded in delivery report |
| Frontend TypeScript | `npx tsc --noEmit` | Recorded in delivery report |
| Backend TypeScript | `npm run backend:typecheck` | Recorded in delivery report |
| Production build | `npm run build` | Recorded in delivery report |

CI `release-gate` on PR #203 is separate evidence — do not equate a local pass with CI.

---

## Production Status

**UNVERIFIED.** Do not claim health, pending migration counts, or incident resolution without a current authorized probe. See `docs/PRODUCTION.md` section 8a for the operator sequence.
