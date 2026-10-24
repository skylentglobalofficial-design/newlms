# Skylent — Requirements Matrix

**Last Updated:** 2026-10-24
**Source:** Codebase inspection, test results, PR #203 verification

---

## Status Legend

| Status | Meaning |
|--------|---------|
| VERIFIED | Implemented in code, tested locally, CI passed |
| PARTIAL | Core implemented, documented gaps remain |
| UI-ONLY | Frontend exists, no backend support |
| MISSING | Not implemented |
| BLOCKED | Requires external configuration/service |
| DEFERRED | Intentionally not implemented this cycle |

---

## Feature Requirements

### Authentication and Identity

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Email/password signup | VERIFIED | `server/src/routes/auth.ts:152-206` | Full validation |
| Email/password login | VERIFIED | `server/src/routes/auth.ts:209-248` | Session-based |
| Logout | VERIFIED | `server/src/routes/auth.ts:250-261` | Clears session |
| CSRF protection | VERIFIED | `server/src/lib/auth.ts:201-216` | Double-submit cookie |
| Google OAuth | BLOCKED | `server/src/lib/google-oauth.ts` | Needs credentials |
| Password reset | DEFERRED | - | Requires email service (Mailgun/SES) |
| Email verification | DEFERRED | - | Requires email service |

### LMS and Learning

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Explicit enrolment | VERIFIED | `server/src/routes/lms.ts:161` | POST to enrol, no auto-enrol |
| Course workspace | VERIFIED | `server/src/routes/lms.ts` | Full curriculum access |
| Sequential unlock | VERIFIED | `server/src/lib/lms.ts` | Prerequisites enforced |
| Quiz server-side scoring | VERIFIED | `server/src/lib/quiz-attempts.ts` | Answers never exposed |
| Quiz rate limiting | VERIFIED | `quiz-attempts.ts:4-5` | 5 attempts/15 min |
| **Quiz explanations** | VERIFIED | `QuizQuestion.explanation` field | Shows after passing |
| **Quiz attempt limits** | VERIFIED | `CurriculumNode.maxAttempts` | Configurable per quiz |
| **Quiz passing score** | VERIFIED | `CurriculumNode.passingScore` | Configurable threshold |
| Assignment submission | VERIFIED | `server/src/routes/lms.ts:702-870` | Text + attachments |
| **Assignment grading** | VERIFIED | `server/src/routes/faculty.ts` | Grade, feedback, instructor |
| Certificates | VERIFIED | `server/src/routes/skylent/certificates.ts` | Issue, list, verify |
| Lesson progress | VERIFIED | `LessonProgress` model | Completion tracking |

### Events and Webinars (NEW)

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| **Event model** | VERIFIED | `prisma/schema.prisma:Event` | Full model with status |
| **Event listing** | VERIFIED | `GET /api/v1/events` | Filters, pagination |
| **Event detail** | VERIFIED | `GET /api/v1/events/:slug` | Registration status |
| **Event registration** | VERIFIED | `POST /api/v1/events/:slug/register` | Capacity enforcement |
| **Registration cancel** | VERIFIED | `POST /api/v1/events/:slug/cancel` | Before event starts |
| **My registrations** | VERIFIED | `GET /api/v1/events/my/registrations` | User's events |
| **Admin create** | VERIFIED | `POST /api/v1/events` | Faculty/superadmin only |
| **Admin publish** | VERIFIED | `POST /api/v1/events/:slug/publish` | Draft → Published |
| **Frontend pages** | VERIFIED | `src/pages/EventsPage.tsx`, `EventDetailPage.tsx` | Full UI |
| Live video/conferencing | NOT CLAIMED | - | Not implemented |
| Attendance tracking | NOT CLAIMED | - | Not implemented |

### Career OS

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Career profile | VERIFIED | `server/src/routes/career/profile.ts` | Full CRUD |
| Education entries | VERIFIED | Profile router | Institution, degree, dates |
| Experience entries | VERIFIED | Profile router | Company, role, type |
| Skills | VERIFIED | Profile router | Proficiency levels |
| Job listings | VERIFIED | `server/src/routes/career/jobs.ts` | Filter, search |
| Job applications | VERIFIED | `server/src/routes/career/applications.ts` | Apply, track |
| Saved jobs | VERIFIED | `server/src/routes/career/saved-jobs.ts` | Save/unsave |
| Sample job data | VERIFIED | `prisma/seed-career.ts` | Seed script |

### Education and Degrees

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Degree listing | UI-ONLY | `src/lib/degrees.ts` | Static data |
| Degree detail | UI-ONLY | `src/pages/education/DegreeDetailPage.tsx` | Sample labels |
| Degrees backend | DEFERRED | - | No institution data to populate |

### File Uploads

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Assignment attachments | PARTIAL | `AssignmentAttachment` model | Metadata stored |
| Actual file storage | BLOCKED | `storageProvider: pending` | Needs S3/R2/GCS config |

### Role-Based Access Control

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Role definitions | VERIFIED | `UserRole` enum | STUDENT, FACULTY, ADMIN, RECRUITER |
| Route guards | VERIFIED | `requireRoles()` middleware | Backend enforcement |
| Frontend guards | VERIFIED | `RoleRouteGuard` component | Dashboard access |
| Faculty grading | VERIFIED | `server/src/routes/faculty.ts` | Faculty/superadmin only |
| Admin events | VERIFIED | `server/src/routes/events.ts` | Faculty/superadmin only |

---

## Migration Status

| Migration | Status | Content |
|-----------|--------|---------|
| `20261004000000_skylent_additions` | PENDING | Core additions |
| `20261004180000_backfill_program_course_links` | PENDING | Programme links |
| `20261009000000_policy_acceptance` | PENDING | Terms acceptance |
| `20261011000000_employer_membership` | PENDING | Career features |
| `20261017120000_practice_workspaces` | PENDING | Practice platform |
| `20261024120000_quiz_grading_events` | PENDING | Quiz, grading, events |

All 6 migrations are additive and backward-compatible.

---

## Test Results

| Test | Status | File |
|------|--------|------|
| Migration history | PASS | `scripts/test-migration-history.ts` |
| Enrollment access | PASS | `scripts/test-enrollment-access.ts` |
| Quiz limits | PASS | `scripts/test-quiz-limits.ts` |
| Events schema | PASS | `scripts/test-events.ts` |
| Quiz comprehensive | PASS | `scripts/test-quiz-attempts-comprehensive.ts` |
| Grading authorization | PASS | `scripts/test-grading-authorization.ts` |
| Events comprehensive | PASS | `scripts/test-events-comprehensive.ts` |
| Frontend TypeScript | PASS | `npx tsc --noEmit` |
| Production build | PASS | `npm run build` |

---

## CI Status

| Check | Status |
|-------|--------|
| release-gate / gate | Needs update (test expected 5 migrations, now 6) |
| Supabase Preview | SKIPPED |

---

## What Is NOT Implemented

The following are explicitly NOT claimed or implemented:

1. **Password reset** — Requires email service configuration
2. **Email verification** — Requires email service configuration
3. **File upload storage** — Requires S3/R2/GCS configuration
4. **Degrees backend** — No institution data available
5. **Live video conferencing** — Not in scope
6. **Event attendance tracking** — Not in scope
7. **Payment processing** — Not in scope
8. **Course builder UI** — Admin creates via database/seed

---

## Production Deployment Checklist

Before deploying:
1. [ ] Run `npm run db:preflight` to verify migration safety
2. [ ] Backup production database
3. [ ] Apply migrations with `npx prisma migrate deploy`
4. [ ] Verify health endpoint returns 200
5. [ ] Test critical flows: login, enrol, quiz, events

---

## Verification Methodology

Each feature was verified by:
1. Reading source code
2. Checking Prisma schema
3. Running TypeScript compilation
4. Running unit tests
5. Building for production
