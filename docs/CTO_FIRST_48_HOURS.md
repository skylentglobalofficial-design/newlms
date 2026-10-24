# Skylent — CTO First 48 Hours Guide

**Date:** 2026-10-24
**Branch:** `cursor/product-completion-f670`
**PR:** #203

---

## Hour 0-2: Verify Production Status

### Check Production Health

```bash
curl -s https://skylent.live/api/v1/health | jq
```

**Expected:** Either HTTP 200 with `migrations: "ok"` or HTTP 503 with `migrations: "pending"`.

### If Health Returns 503 (Pending Migrations)

1. **Verify Supabase backup exists**
   - Open Supabase Dashboard → Project → Database → Backups
   - Note the latest backup timestamp

2. **Check what migrations are pending**
   ```bash
   # From local machine with production DATABASE_URL
   npm run db:preflight
   ```
   - Expected: 6 pending migrations (October + October 24)
   - Expected: 4 production-only migrations (lesson materials)
   - Expected: 0 failed migrations

3. **Apply migrations with approval**
   ```bash
   # Only after confirming backup exists
   npx prisma migrate deploy
   ```

4. **Verify health**
   ```bash
   curl -s https://skylent.live/api/v1/health | jq
   ```
   Expected: HTTP 200, `status: "ok"`

---

## Hour 2-4: Verify Core Features

### Authentication
- [ ] Sign up with email/password
- [ ] Sign in with existing account
- [ ] Sign out and session cleared
- [ ] CSRF token present in responses

### Enrolment
- [ ] Browse courses at `/courses`
- [ ] View course detail
- [ ] Enrol in Data Analytics course
- [ ] Verify enrolment appears in dashboard

### LMS
- [ ] Access enrolled course lessons
- [ ] Complete a video lesson
- [ ] Complete a quiz (check explanations appear after passing)
- [ ] Submit an assignment
- [ ] Verify progress is saved

### Career OS
- [ ] Access Career OS at `/career-os`
- [ ] View/edit career profile
- [ ] Browse job listings (if seeded)
- [ ] Save a job

### Events (NEW)
- [ ] View events at `/events` (frontend page)
- [ ] View event detail at `/events/:slug`
- [ ] Register for an event (requires login)
- [ ] As admin, create an event via API POST `/api/v1/events`

---

## Hour 4-8: Seed Production Data (Optional)

### Seed Career OS Demo Data

If the jobs table is empty:

```bash
# Connect to production and run seed
DATABASE_URL=<production-url> npm run db:seed:career
```

This creates:
- 3 sample employers
- 5 job listings
- All marked as sample/demo data

### Seed Events Demo Data

Create sample events via API or direct SQL:

```sql
INSERT INTO "Event" (id, slug, title, description, "eventType", status, "hostName", "startTime", "endTime", timezone, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'intro-to-data-analytics', 'Introduction to Data Analytics', 'Learn the fundamentals of data analytics in this live webinar.', 'WEBINAR', 'PUBLISHED', 'Skylent Team', '2026-11-01 10:00:00+00', '2026-11-01 11:00:00+00', 'Asia/Kolkata', NOW(), NOW());
```

---

## Hour 8-24: Review Code Changes

### New Features in This Release

| Feature | Status | Files |
|---------|--------|-------|
| Quiz explanations | Complete | `QuizQuestion.explanation` field |
| Quiz attempt limits | Complete | `CurriculumNode.maxAttempts` field |
| Assignment grading | Complete | `AssignmentProgress.grade/feedback` fields |
| Events/Webinars | Complete | `server/src/routes/events.ts` |

### New API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/events` | Public | List published events |
| GET | `/events/:slug` | Public | Event detail |
| POST | `/events/:slug/register` | User | Register for event |
| POST | `/events/:slug/cancel` | User | Cancel registration |
| GET | `/events/my/registrations` | User | My registrations |
| POST | `/events` | Admin | Create event |
| PATCH | `/events/:slug` | Admin | Update event |
| POST | `/events/:slug/publish` | Admin | Publish event |
| GET | `/faculty/submissions` | Faculty | List submissions |
| GET | `/faculty/submissions/:id` | Faculty | Submission detail |
| POST | `/faculty/submissions/:id/grade` | Faculty | Grade submission |

### Schema Changes

```sql
-- Quiz enhancements
ALTER TABLE "QuizQuestion" ADD COLUMN "explanation" TEXT;
ALTER TABLE "CurriculumNode" ADD COLUMN "maxAttempts" INTEGER;
ALTER TABLE "CurriculumNode" ADD COLUMN "passingScore" INTEGER;

-- Assignment grading
ALTER TABLE "AssignmentProgress" ADD COLUMN "grade" INTEGER;
ALTER TABLE "AssignmentProgress" ADD COLUMN "feedback" TEXT;
ALTER TABLE "AssignmentProgress" ADD COLUMN "gradedById" UUID;
ALTER TABLE "AssignmentProgress" ADD COLUMN "gradedAt" TIMESTAMP(3);

-- Events system
CREATE TABLE "Event" (...)
CREATE TABLE "EventRegistration" (...)
```

---

## Hour 24-48: Verification and Next Steps

### Run Full Test Suite

```bash
# TypeScript checks
npx tsc --noEmit && npm run backend:typecheck

# Unit tests (no DB required)
npm run test:production-env
npm run test:migration-history
npm run test:enrollment-access
npm run test:events
npm run test:quiz-limits

# Build
npm run build
```

### Configure Optional Services

| Service | Required For | Environment Variable |
|---------|--------------|---------------------|
| Google OAuth | Social login | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Skylent AI | Lesson assistant | `SKYLENT_AI_API_KEY` |

### Known Gaps (Not Yet Implemented)

| Feature | Status | Reason |
|---------|--------|--------|
| Password reset | Not implemented | Requires email service |
| Email verification | Not implemented | Requires email service |
| File uploads | Metadata only | Requires storage configuration |
| Degrees backend | UI-only | No institution data confirmed |

---

## Emergency Contacts

- Repository: `skylentglobalofficial-design/newlms`
- Production: `https://skylent.live`
- Documentation: `/workspace/docs/*.md`

---

## Quick Reference

### Branch Status
- Branch: `cursor/product-completion-f670`
- PR: #203 (Open, CI pending)
- Base: `main` at `2714f5e2`
- Total pending migrations: 6

### Test Commands
```bash
npm run test:production-env   # Environment safety
npm run test:migration-history # Migration integrity
npm run test:events           # Events schema
npm run test:quiz-limits      # Quiz logic
npm run build                 # Full production build
```

### CI Gate
The `release-gate` workflow verifies:
- TypeScript compilation (frontend + backend)
- Production build
- Migration integrity
- Unit tests

All checks must pass before merge.
