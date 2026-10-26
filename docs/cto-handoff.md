# Skylent — CTO Technical Handoff

**Handoff Date:** 2026-10-24
**Branch:** `cursor/product-completion-f670`
**PR:** #203
**Previous main tip (historical):** `2714f5e2a7c7e387511d136b4741ad04efe91ac2`

Statuses: **GREEN** / **AMBER** / **RED** / **UNVERIFIED**.

---

## Executive Summary

Skylent is an EdTech platform with LMS, Career OS, Labs, Events, and a degrees backend API.

**Production status:** **UNVERIFIED** in this document. Historical notes about HTTP 503 / pending migrations must be reconfirmed by an authorized operator via health + `db:preflight`. This release tree ships **8** additive migrations after September (through `20261025180000_elixir_ledger_and_admin_audit`); that is a tree expectation, not a live production count.

---

## A. What Exists and Has Been Verified Locally

| Feature | Status | Evidence |
|---------|--------|----------|
| Authentication (email/password) | GREEN | `auth.ts`, session cookies, CSRF |
| Enrolment / LMS / quizzes / grading | GREEN | LMS + faculty routes; quiz/grading unit tests |
| Certificates | GREEN | Issue / list / verify |
| Career OS | GREEN | Profiles, jobs, applications (job **data** in production UNVERIFIED) |
| Labs / projects | GREEN | Labs + learner projects |
| Events | GREEN | API + frontend pages |
| Degrees backend | GREEN | Models, public + admin routes, `test:degrees-auth` |
| Degrees frontend | AMBER | Still static `src/data/education.ts` |
| Password reset | AMBER | Secure token flow + `test:password-reset`; email credentials required |
| File storage | AMBER→RED for prod | `local` only (dev); S3/GCS/Azure not implemented |
| Google OAuth / AI | AMBER | Code present; credentials required |

---

## B. Implemented in Recent PR Work

| Area | Files |
|------|-------|
| Password reset | `server/src/lib/password-reset.ts`, `email.ts`, auth routes |
| Degrees API | `server/src/routes/degrees.ts`, `degrees-public.ts`, schema + migration |
| Storage abstraction | `server/src/lib/storage.ts` (honest: local-only) |
| Regression tests | `test:password-reset`, `test:degrees-auth`, `test:storage` |
| Docs | This file, requirements matrix, first-48, audit, PRODUCTION |

---

## C. Remaining Gaps

| Gap | Status | Notes |
|-----|--------|-------|
| Password reset email delivery | AMBER | Mailgun/SendGrid vars |
| Degrees frontend API wiring | AMBER | Static samples remain |
| Institution content | AMBER | Empty by design — no fictitious seed |
| Production object storage | RED | No implemented cloud provider |
| Email verification | RED | Not built |
| Production migration application | UNVERIFIED | Operator runbook in PRODUCTION.md §8a |

---

## D. External Services

| Feature | Required config | Status |
|---------|-----------------|--------|
| Google OAuth | `GOOGLE_CLIENT_*` | AMBER |
| Skylent AI | `SKYLENT_AI_API_KEY` | AMBER |
| Password reset email | `EMAIL_PROVIDER` (mailgun\|sendgrid), `EMAIL_FROM`, keys | AMBER |
| File bytes | Production provider **missing** | RED |
| Video | Mux playback IDs only | AMBER |

---

## E. Database / Schema

### Release-tree October migrations (7)

1. `20261004000000_skylent_additions`
2. `20261004180000_backfill_program_course_links`
3. `20261009000000_policy_acceptance`
4. `20261011000000_employer_membership_and_shared_applications`
5. `20261017120000_practice_workspaces`
6. `20261024120000_quiz_grading_events`
7. `20261024140000_password_reset_and_degrees` — PasswordResetToken, Institution, Degree

All additive. Production-only lesson-material migrations (4) stay out of the tree — see PRODUCTION.md.

### Risk

| Risk | Mitigation |
|------|------------|
| Schema behind release | `npm run db:preflight` |
| Data loss | No DROP/DELETE in pending migrations |
| Wrong DB URL | Confirm DATABASE_URL and DIRECT_URL before deploy |

---

## F. Security Notes (password reset)

- Tokens hashed (SHA-256); plaintext only for email composition
- Generic response for known and unknown emails
- Per-IP rate limit (5/15m) on request/verify/complete; per-user token create limit (3/15m)
- Atomic `updateMany` claim prevents concurrent reuse
- Sessions deleted on successful reset
- Failed email send does not change response or log the token
- SES/SMTP env alone does **not** mark email as configured

---

## G. Feature Status Matrix

| Feature | Status |
|---------|--------|
| Authentication | GREEN |
| Enrolment / LMS / Quizzes / Assignments | GREEN |
| Certificates | GREEN |
| Career Profile / Jobs API | GREEN |
| Events | GREEN |
| Degrees backend | GREEN |
| Degrees frontend | AMBER |
| Password reset | AMBER |
| File upload (production) | RED |
| AI / Google OAuth | AMBER |
| Production health / migrations | UNVERIFIED |

---

## H. Exact Next Action for Repository Owner

1. Authorize an operator to run **PRODUCTION.md §8a** (backup → URL confirmation → read-only preflight → approval → migrate → verify).
2. After migrations are healthy, decide whether to configure Mailgun/SendGrid for password reset.
3. Wire `/education` to `GET /api/v1/degrees` only when real institution data exists — keep static samples until then.

Do not merge, force-push, or deploy from this handoff alone.
