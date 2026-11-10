# Skylent Platform (`newlms`)

Full-stack EdTech learning, browser lab, and career placement platform for **Skylent** (`https://skylent.live`).

---

## 1. Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router v7
- **Backend:** Node.js (`>= 22`), Express 5, TypeScript, Zod validation
- **Database:** PostgreSQL 16 with Prisma ORM (`v6.19`)
- **In-Browser Labs:** SQLite WebAssembly (`sql.js`), AST SQL validation (`node-sql-parser`), Python sandbox runtime, and Case Studio
- **Payments & Auth:** PayU India Checkout, Session Cookie + Native Bearer Token Auth, Google OAuth 2.0
- **Mobile App:** Capacitor Android shell (`live.skylent.app`) with OTA version sync and role-based `FLAG_SECURE` DRM

---

## 2. Repository Structure

```text
.
├── README.md                   # Repository setup & architecture overview
├── package.json                # NPM scripts & dependencies
├── vite.config.ts              # Frontend Vite bundler configuration
├── tsconfig.json               # Frontend TypeScript configuration
├── tsconfig.backend.json       # Backend TypeScript configuration
├── server.js                   # Production Node.js entry wrapper
│
├── src/                        # React 19 Frontend Application
│   ├── assets/                 # Static WebP/JPG media & brand icons
│   ├── components/             # Reusable UI & domain components
│   │   ├── admin/              # Superadmin & Admin console panels
│   │   ├── career/             # Career OS (Jobs, Applications, Mock Interviews, Profile)
│   │   ├── home/               # Public homepage sections
│   │   ├── labs/               # Interactive SQL, Python & Case Studio workbenches
│   │   ├── learner/            # Student header wallet, notifications, progress & nav
│   │   ├── legal/              # Terms consent & privacy components
│   │   ├── lms/                # Course player, video/notes surface, quiz, assignment & lesson tutor
│   │   ├── product/            # Course cards, curriculum drawers & context panels
│   │   ├── programme/          # Flagship programme templates & syllabus breakdowns
│   │   ├── routing/            # Protected route & role-redirect guards
│   │   └── skylent/            # App shell controller, header/footer & primitives
│   ├── content/                # Authored course curriculum, markdown lessons (`l1.md`–`l15.md`), quizzes & rubrics
│   ├── context/                # React AuthContext provider
│   ├── data/                   # Degree & academic catalogue definitions
│   ├── hooks/                  # Custom hooks (useLms, useCatalog, useJobBoard, etc.)
│   ├── lib/                    # Typed API clients, route helpers & domain utilities
│   ├── pages/                  # Route-level page views (Public, LMS, Career OS & 6 Role Dashboards)
│   └── styles/                 # Design tokens, typography & layout CSS
│
├── server/                     # Express 5 Backend API
│   └── src/
│       ├── index.ts            # Express app entry point & static bundle server
│       ├── routes/             # REST API endpoints (/api/v1/*)
│       └── lib/                # Business logic (auth, lms, career, elixir, skylent-ai, payu)
│
├── prisma/                     # Database Schema, Migrations & Seed Scripts
│   ├── schema.prisma           # Canonical PostgreSQL schema
│   ├── migrations/             # Ordered SQL migrations
│   ├── seed.ts                 # Core catalogue & course seed
│   └── seed-career.ts          # Career OS jobs & employer seed
│
├── public/                     # Static public assets, PWA manifest & case datasets
├── playstore-assets/           # Official Android launcher icons (`mipmap-*`)
├── scripts/                    # Build, DB preflight, provisioning & automated test suites
│   └── README.md               # Guide to utility & test scripts
└── docs/                       # Engineering Documentation
    ├── README.md               # Documentation index
    ├── ENGINEERING_HANDOFF.md  # Codebase walkthrough & module guide
    ├── MOBILE_APK_AND_DRM.md   # Android APK build, OTA sync & role-based FLAG_SECURE DRM
    ├── PRODUCTION.md           # Production deployment, env vars & migration runbook
    ├── architecture-and-data-model.md
    └── roles-and-permissions.md
```

---

## 3. Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Set `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, and `FRONTEND_URL` inside `.env`.

3. **Run database migrations & seed initial data:**
   ```bash
   npm run prisma:generate
   npm run db:migrate
   npm run db:seed
   npm run db:seed:career
   ```

4. **Start Frontend (`:5174`) + Backend (`:3000`) concurrently:**
   ```bash
   npm run dev:all
   ```

---

## 4. Build, Verification & Android APK Commands

```bash
# Full production build (Prisma Client + Vite Frontend + Backend TypeScript)
npm run build

# Core integration & release hardening suites
npm run test:release-readiness-hardening
npm run test:lms
npm run test:roles
npm run test:college-isolation
npm run test:employer
```

**Build Signed Android APK & Play Store `.aab` (Windows PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-playstore-apk.ps1
```

---

## 5. Documentation

- **[Documentation Index (`docs/README.md`)](./docs/README.md)**
- **[Engineering Handoff Guide (`docs/ENGINEERING_HANDOFF.md`)](./docs/ENGINEERING_HANDOFF.md)**
- **[System Architecture & Data Model (`docs/architecture-and-data-model.md`)](./docs/architecture-and-data-model.md)**
- **[Roles & Permissions Matrix (`docs/roles-and-permissions.md`)](./docs/roles-and-permissions.md)**
- **[Mobile APK & Anti-Piracy DRM (`docs/MOBILE_APK_AND_DRM.md`)](./docs/MOBILE_APK_AND_DRM.md)**
- **[Production Deployment Runbook (`docs/PRODUCTION.md`)](./docs/PRODUCTION.md)**
- **[Scripts Reference (`scripts/README.md`)](./scripts/README.md)**
