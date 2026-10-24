# Skylent — Architecture and Data Model

## System Overview

Skylent is a full-stack EdTech platform built with:

- **Frontend:** React 19 + Vite 8 + Tailwind CSS v4
- **Backend:** Express 5 + TypeScript
- **Database:** PostgreSQL 16 via Prisma ORM 6.19
- **Hosting:** Hostinger hPanel (Node.js app)
- **Database Hosting:** Supabase (PostgreSQL)

## Application Structure

```
/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route-level page components
│   ├── context/            # React context providers (Auth)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API clients, utilities
│   ├── data/               # Static data (degrees, etc.)
│   └── content/            # Course content (quizzes, etc.)
│
├── server/src/             # Express backend
│   ├── routes/             # API route handlers
│   │   ├── auth.ts         # Authentication
│   │   ├── catalog.ts      # Public catalogue
│   │   ├── lms.ts          # Learning management
│   │   ├── career/         # Career OS routes
│   │   ├── skylent/        # Enquiries, certificates
│   │   └── admin*.ts       # Admin routes
│   └── lib/                # Business logic
│       ├── auth.ts         # Session management
│       ├── lms.ts          # LMS business logic
│       ├── career/         # Career OS logic
│       └── skylent-*       # AI, Labs, Projects
│
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Migration history
│   └── seed.ts             # Course/programme seed
│
└── scripts/                # Test and utility scripts
```

## Data Model

### Core Entities

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Program   │────▶│ ProgramCourse │◀────│     Course      │
│ (pathway)   │     │   (join)      │     │ (standalone)    │
└─────────────┘     └───────────────┘     └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │CurriculumModule │
                                          │  (week/unit)    │
                                          └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ CurriculumNode  │
                                          │(lesson/quiz/etc)│
                                          └─────────────────┘
```

### User and Enrolment

```
┌──────────┐     ┌───────────┐     ┌────────────────┐
│   User   │────▶│  UserRole │◀────│      Role      │
│          │     │  (join)   │     │(STUDENT,ADMIN) │
└──────────┘     └───────────┘     └────────────────┘
     │
     ▼
┌──────────────┐
│UserEnrollment│───────▶ Course or Program
│              │
└──────────────┘
     │
     ├──▶ LessonProgress (per node)
     ├──▶ QuizAttempt (per quiz)
     └──▶ AssignmentProgress (per assignment)
```

### Career OS

```
┌──────────┐     ┌───────────────┐
│   User   │────▶│ CareerProfile │
└──────────┘     └───────────────┘
                        │
     ┌──────────────────┼──────────────────┐
     ▼                  ▼                  ▼
┌───────────┐    ┌────────────┐    ┌────────────┐
│ Education │    │ Experience │    │   Skills   │
└───────────┘    └────────────┘    └────────────┘

┌──────────┐     ┌─────────┐     ┌──────────────┐
│ Employer │────▶│   Job   │◀────│JobApplication│
└──────────┘     └─────────┘     └──────────────┘
                                        │
                                        ▼
                                ┌────────────────┐
                                │ InterviewRound │
                                └────────────────┘
```

## API Structure

All API routes are mounted at `/api/v1/`.

### Authentication (`/auth/*`)
- `GET /csrf` — Get CSRF token (sets cookie)
- `POST /signup` — Create account
- `POST /login` — Sign in
- `POST /logout` — Sign out
- `GET /me` — Current user
- `GET /google` — Start Google OAuth
- `GET /google/callback` — OAuth callback

### Catalogue (`/catalog/*`)
- `GET /programs` — List programmes
- `GET /programs/:slug` — Programme detail
- `GET /courses` — List courses
- `GET /courses/:slug` — Course detail

### LMS (`/lms/*`)
- `GET /dashboard` — Learner dashboard
- `GET /enrollments` — List enrolments
- `POST /enrollments` — Enrol in course/programme
- `GET /courses/:slug` — Course workspace
- `GET /courses/:slug/lessons/:key/quiz` — Quiz questions
- `POST /courses/:slug/lessons/:key/quiz/attempts` — Submit quiz
- `POST /courses/:slug/lessons/:key/assignment` — Submit assignment
- `POST /courses/:slug/lessons/:key/progress` — Update progress

### Career OS (`/career/*`)
- `GET /profile` — Career profile
- `PATCH /profile` — Update profile
- `GET /profile/completeness` — Profile completeness
- `GET /jobs` — Job listings
- `POST /saved-jobs` — Save a job
- `POST /applications` — Apply to job

### Certificates (`/certificates/*`)
- `POST /issue` — Issue certificate
- `GET /mine` — My certificates
- `GET /verify/:code` — Public verification

## Authentication Flow

1. Client calls `GET /auth/csrf` to get CSRF token
2. Token set in `csrf` cookie and returned in JSON
3. All mutations send `X-CSRF-Token` header matching cookie
4. Session stored in `sid` cookie (httpOnly, 30 days)
5. Session validated via `requireAuth` middleware

## Role-Based Access

| Route Pattern | Required Role |
|---------------|---------------|
| `/lms/*` | STUDENT (any authenticated) |
| `/career/*` | STUDENT |
| `/labs/*` | STUDENT |
| `/dashboard/admin` | ADMIN |
| `/dashboard/faculty` | FACULTY |
| `/admin/*` API | ADMIN |
| `/catalog/*` | Public |

## Database Migrations

Migrations are in `prisma/migrations/`. Key migrations:

| Migration | Content |
|-----------|---------|
| `20260905120000_init` | Core tables |
| `20260906*` | LMS, Career, Labs |
| `20261004000000_skylent_additions` | Certificates, Enquiries |
| `20261009000000_policy_acceptance` | Terms consent |
| `20261011000000_employer_membership` | Employer members |
| `20261017120000_practice_workspaces` | Practice workspaces |

**Production note:** 4 lesson-material migrations exist in production but not in the tree. They are safe to leave (Prisma ignores them).

## Environment Variables

See `.env.example` for full list. Critical variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection (pooled) |
| `DIRECT_URL` | Postgres connection (direct, for migrations) |
| `SESSION_SECRET` | Session cookie signing (32+ chars) |
| `FRONTEND_URL` | Public origin for OAuth redirects |
| `GOOGLE_CLIENT_ID` | Google OAuth (optional) |
| `SKYLENT_AI_API_KEY` | AI assistant (optional) |

## Build and Deploy

```bash
# Install
npm ci

# Build
npm run build   # Vite + TypeScript backend

# Start (with migrations)
npm start       # node server.js

# Start (without migrations)
node server/dist/index.js
```

The `server.js` shim runs `prisma migrate deploy` before starting the API.
