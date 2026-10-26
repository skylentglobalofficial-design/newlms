# Skylent — CTO First 48 Hours Guide

**Date:** 2026-10-24
**Branch:** `cursor/product-completion-f670`
**PR:** #203

Statuses used below: **GREEN** / **AMBER** / **RED** / **UNVERIFIED**.

---

## Hour 0-2: Production (UNVERIFIED until you run these)

Do not treat repository migration counts as production truth. Confirm with authorized access only.

### Check Production Health

```bash
curl -s https://skylent.live/api/v1/health | jq
```

Record the actual HTTP status and JSON. Until you do, production remains **UNVERIFIED**.

### If Health Returns 503 (Pending Migrations)

Follow `docs/PRODUCTION.md` section **8a** in full:

1. Verified backup and recovery path
2. Confirm `DATABASE_URL` and `DIRECT_URL` target the same intended database
3. Read-only `npm run db:preflight -- --production` from a shell where `DIRECT_URL` is already the session pooler on port 5432. Expect the eight post-September migrations pending (if production matches the historical baseline used in replay tests) **or** stop and reconcile if the report differs. `PASS` still requires a separate yes for the `ProgramCourse` backfill (`--approve-backfill`).
4. Explicit operator approval
5. Authorized operator runs `npx prisma migrate deploy` (or restart via `server.js` if that is the documented start command)
6. Post-migration preflight (`--expect-none`), health check, and smoke tests

Never use `db push`, reset, destructive seed, or `migrate resolve` against production from this guide.

---

## Hour 2-4: Verify Core Features

### Authentication — GREEN (password reset email AMBER)
- [ ] Sign up / sign in / sign out
- [ ] CSRF token present
- [ ] Password reset API exists (`POST /api/v1/auth/password-reset/request`) — emails require `EMAIL_PROVIDER` + credentials (Mailgun or SendGrid only)

### Enrolment / LMS — GREEN
- [ ] Browse `/courses`, enrol, complete a lesson/quiz/assignment

### Career OS — GREEN (job data population UNVERIFIED in production)
- [ ] `/career-os` profile and jobs UI

### Events — GREEN
- [ ] `/events` listing and registration

### Degrees — AMBER (backend GREEN, frontend still static)
- [ ] Backend: `GET /api/v1/degrees` and `GET /api/v1/degrees/setup-status`
- [ ] Frontend `/education` still reads `src/data/education.ts` sample listings — **not** the new API
- [ ] Do not invent institution data; create via admin API only when real partners are confirmed

---

## Hour 4-8: Optional Seeding (non-production first)

```bash
# Career OS demo data (non-production / approved environment only)
npm run db:seed:career
```

Do **not** seed fictitious degrees or institutions.

---

## Hour 8-24: Review Code Changes on This Branch

| Feature | Status | Notes |
|---------|--------|-------|
| Quiz explanations / limits | GREEN | Migration `20261024120000` |
| Assignment grading | GREEN | Faculty routes |
| Events/Webinars | GREEN | API + frontend |
| Password reset | AMBER | Backend + security tests; email credentials required |
| Degrees API | GREEN | Public catalogue hides non-PUBLISHED; admin = superadmin |
| Degrees frontend | AMBER | Still static |
| File storage | AMBER / RED | Abstraction + local-only; no production object store |

### New API Endpoints (password reset + degrees)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/password-reset/request` | Public + rate limit | Generic response always |
| POST | `/auth/password-reset/verify` | Public + rate limit | Validate token |
| POST | `/auth/password-reset/complete` | Public + rate limit | Reset password; invalidate sessions |
| GET | `/auth/password-reset/config` | Public | Email configured? |
| GET | `/degrees` | Public | Published degrees only |
| GET | `/degrees/:slug` | Public | Published only (404 otherwise) |
| GET | `/degrees/disciplines` | Public | Published disciplines |
| GET | `/degrees/institutions` | Public | Institutions |
| GET | `/degrees/setup-status` | Public | Empty-state helper |
| GET | `/degrees/admin/all` | superadmin | All statuses |
| POST/PATCH/DELETE | `/degrees/admin…` | superadmin + CSRF | Mutations |

### Schema additions (`20261024140000_password_reset_and_degrees`)

- `PasswordResetToken`
- `Institution`, `Degree`
- Enums: `DegreeDeliveryMode`, `DegreeLevel`, `DegreeStatus`

---

## Hour 24-48: Local Verification Commands

```bash
npx tsc --noEmit && npm run backend:typecheck
npm run test:production-env
npm run test:migration-history
npm run test:password-reset
npm run test:degrees-auth
npm run test:storage
npm run test:events
npm run test:quiz-limits
npm run build
```

Migration replay (`npm run test:migration-replay`) requires local Postgres and proves deploy against a **simulated** production history — not live production.

### External Credentials Still Needed

| Service | Variables | Status |
|---------|-----------|--------|
| Password reset email | `EMAIL_PROVIDER=mailgun\|sendgrid`, `EMAIL_FROM`, provider keys | AMBER |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | AMBER |
| Skylent AI | `SKYLENT_AI_API_KEY` | AMBER |
| Object storage | Production provider **not implemented** | RED |

---

## Quick Reference

- Branch: `cursor/product-completion-f670`
- PR: #203
- Release-tree pending October migrations: **7** (including `20261024140000_password_reset_and_degrees`)
- Production incident / health: **UNVERIFIED** until operator confirms
