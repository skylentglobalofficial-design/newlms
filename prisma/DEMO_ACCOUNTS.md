# Development demo accounts

Skylent seeds five development-only accounts so each product surface can be inspected from a realistic role perspective. All seeded content is **demo data** — not real placements, partners, or outcomes.

## Seed the database

```bash
npm run db:seed
```

This runs `prisma/seed.ts`, which:

1. Seeds catalog programs and courses from `src/data.ts`
2. Seeds quiz banks and program-course links
3. Creates demo users and role-specific workspace data (when allowed)

### Environment variables

| Variable | Purpose |
|----------|---------|
| `DEMO_USER_PASSWORD` | Password for all demo accounts (default: `DemoSkylent2026!`) |
| `SEED_DEMO_USERS` | Set to `true` to seed demo users in production |
| `NODE_ENV=production` | Demo users are **skipped** unless `SEED_DEMO_USERS=true` |

Do not commit real production credentials. Override the demo password only in local `.env`.

## Demo accounts

| Role | Email | Dashboard |
|------|-------|-----------|
| Learner | `learner@demo.skylent.dev` | `/dashboard/student` |
| Mentor / Educator | `mentor@demo.skylent.dev` | `/dashboard/faculty` |
| Institution | `institution@demo.skylent.dev` | `/dashboard/organisation` |
| Recruiter | `recruiter@demo.skylent.dev` | `/dashboard/recruiter` |
| Admin | `admin@demo.skylent.dev` | `/dashboard/admin` |

Sign in at `/login` with the shared demo password.

## What each account includes

### Learner (`learner@demo.skylent.dev`)

- Course enrollment: **Data Analytics**
- Program enrollment: **Data Science & AI**
- Lesson progress on the first five lessons (three completed)
- Quiz attempt on **Foundations Quiz** (passed)
- Submitted assignment: **Excel Assignment**
- Career OS profile with education, experience, skills, projects, and LinkedIn link
- Saved job + application in **screening** for **Junior Data Analyst**
- Demo interview round and career support request
- Interview practice entry on a seeded SQL question

### Mentor (`mentor@demo.skylent.dev`)

- Faculty role with access to the mentor dashboard
- Can review seeded learner assignment submissions (demo faculty accounts load teaching data for development inspection)
- Cohort/batch analytics remain unavailable until a batch model exists in the schema

### Institution (`institution@demo.skylent.dev`)

- Organisation admin for **Skylent Demo College**
- Organisation membership includes the demo learner, so the institution dashboard shows member enrollments, programs, and courses
- Batch/cohort analytics remain unavailable until modeled in the schema

### Recruiter (`recruiter@demo.skylent.dev`)

- Recruiter role for the recruiter workspace UI
- The recruiter dashboard still uses labeled sample UI data for candidate pools; backend recruiter APIs are not yet wired
- Seeded jobs and learner applications exist in the database for Career OS flows

### Admin (`admin@demo.skylent.dev`)

- Platform admin role
- Superadmin access to faculty review data (submitted assignments from the demo learner)
- Admin dashboard overview sections use illustrative sample UI data where admin APIs are not yet implemented

## Re-running the seed

The seed is idempotent for demo users and workspace data. Safe to run again during development:

```bash
npm run db:seed
```

## Security notes

- Demo accounts are intended for **development and staging** only.
- Production deployments skip demo user creation unless `SEED_DEMO_USERS=true`.
- Authentication security (CSRF, sessions, password hashing) is unchanged.
- The demo password must not be used for real user accounts.
