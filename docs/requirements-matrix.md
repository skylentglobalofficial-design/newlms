# Skylent — Requirements Matrix

**Generated:** 2026-10-24
**Source:** Previous audit (`docs/product-completion-audit.md`), conversation history, codebase inspection

---

## Requirements Status Legend

| Status | Meaning |
|--------|---------|
| COMPLETE | Fully implemented with tests |
| PARTIAL | Core implemented, documented gaps remain |
| MISSING | Not implemented |
| BLOCKED | Requires external configuration/service |
| UNVERIFIABLE | Original requirement not recoverable |

---

## Feature Requirements

### Authentication and Identity

| Requirement | Original Behavior | Current Implementation | Status | Evidence | Action |
|-------------|-------------------|------------------------|--------|----------|--------|
| Email/password signup | Create account with validation | Full implementation | COMPLETE | `server/src/routes/auth.ts:152-206` | None |
| Email/password login | Authenticate with credentials | Full implementation | COMPLETE | `server/src/routes/auth.ts:209-248` | None |
| Logout | Clear session | Full implementation | COMPLETE | `server/src/routes/auth.ts:250-261` | None |
| CSRF protection | Double-submit cookie | Full implementation | COMPLETE | `server/src/lib/auth.ts:201-216` | None |
| Google OAuth | Social login | Implemented, needs config | BLOCKED | `server/src/lib/google-oauth.ts` | Configure credentials |
| Password reset | Email-based reset flow | Not implemented | MISSING | - | Implement (P2) |
| Email verification | Verify email ownership | Not implemented | MISSING | - | Defer (requires email service) |

### LMS and Learning

| Requirement | Original Behavior | Current Implementation | Status | Evidence | Action |
|-------------|-------------------|------------------------|--------|----------|--------|
| Explicit enrolment | POST to enrol, no auto-enrol | Full implementation | COMPLETE | `server/src/routes/lms.ts:161` | None |
| Course workspace | Lesson access, progress | Full implementation | COMPLETE | `server/src/routes/lms.ts` | None |
| Sequential unlock | Lessons unlock in order | Full implementation | COMPLETE | `server/src/lib/lms.ts` | None |
| Quiz server-side scoring | Score without exposing answers | Full implementation | COMPLETE | `server/src/lib/quiz-attempts.ts` | None |
| Quiz rate limiting | Prevent brute-force | 5 attempts/15 min window | COMPLETE | `quiz-attempts.ts:4-5` | None |
| **Quiz explanations** | Show explanation after attempt | No explanation field | MISSING | `QuizQuestion` schema | **Implement** |
| **Quiz attempt limits** | Configurable max attempts | Rolling window only | PARTIAL | - | **Add maxAttempts** |
| Assignment submission | Text + metadata | Full implementation | COMPLETE | `server/src/routes/lms.ts:702-870` | None |
| **Assignment grading** | Instructor grade + feedback | No grading fields | MISSING | `AssignmentProgress` schema | **Implement** |
| Certificates | Issue, list, verify | Full implementation | COMPLETE | `server/src/routes/skylent/certificates.ts` | None |

### Career OS

| Requirement | Original Behavior | Current Implementation | Status | Evidence | Action |
|-------------|-------------------|------------------------|--------|----------|--------|
| Career profile | Education, experience, skills | Full implementation | COMPLETE | `server/src/routes/career/profile.ts` | None |
| Job listings | Browse, filter, search | Full implementation | COMPLETE | `server/src/routes/career/jobs.ts` | None |
| Job applications | Apply, track status | Full implementation | COMPLETE | `server/src/routes/career/applications.ts` | None |
| Saved jobs | Save/unsave jobs | Full implementation | COMPLETE | `server/src/routes/career/saved-jobs.ts` | None |
| Sample job data | Demo data for testing | Seed script exists | COMPLETE | `prisma/seed-career.ts` | Run seed |
| Employer dashboard | Employer job management | Routes exist | PARTIAL | `server/src/routes/career/employer-jobs.ts` | Verify |

### Events and Webinars

| Requirement | Original Behavior | Current Implementation | Status | Evidence | Action |
|-------------|-------------------|------------------------|--------|----------|--------|
| **Event model** | Create/edit events | No model | MISSING | - | **Implement** |
| **Event registration** | Register/cancel | Not implemented | MISSING | - | **Implement** |
| **Event listing** | View upcoming events | Not implemented | MISSING | - | **Implement** |

### Education and Degrees

| Requirement | Original Behavior | Current Implementation | Status | Evidence | Action |
|-------------|-------------------|------------------------|--------|----------|--------|
| Degree listing | Backend-backed catalogue | Static data only | PARTIAL | `src/lib/degrees.ts` | Defer (no institution data) |
| Degree detail | Full degree info | UI with "sample" labels | PARTIAL | `src/pages/education/DegreeDetailPage.tsx` | Defer |

### File Uploads

| Requirement | Original Behavior | Current Implementation | Status | Evidence | Action |
|-------------|-------------------|------------------------|--------|----------|--------|
| Assignment attachments | Upload files | Metadata only | BLOCKED | `AssignmentAttachment` schema | Configure storage |

---

## Implementation Priority

### P1 — Implement Now (This PR)
1. Quiz explanations (schema + API + frontend)
2. Quiz configurable attempt limits (schema + enforcement)
3. Assignment grading workflow (schema + instructor API)
4. Events/Webinars system (new feature)

### P2 — Defer or Document
1. Password reset (requires email service configuration)
2. Degrees backend (requires institution confirmation)
3. File uploads (requires storage configuration)

### Not Changing
- Navigation behavior (verified as designed)
- Existing working features
- Production configuration (separate operator task)

---

## Verification Method

Each implemented feature will:
1. Have Prisma schema changes with migration
2. Have API routes with authorization
3. Have tests for positive and negative cases
4. Pass TypeScript checks
5. Pass CI build
