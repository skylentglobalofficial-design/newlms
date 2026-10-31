# SKYLENT (skylent.live) — MASTER AI-TO-AI HANDOFF & PRODUCTION RELEASE RUNBOOK (100% GREEN BUILD & SITE-WIDE EDITORIAL POLISH)

- **Company:** Skylent Global Pvt. Ltd. (`https://skylent.live`)
- **Repository:** `https://github.com/skylentglobalofficial-design/newlms`
- **Live Production Branch & Commit Chain:** `main` (`1f1f4f3` → `166c93e` → `7d0e07a` → `f2b12ba` → `adeeb44` → `8a9f848` + `TrackInteractiveSandbox` export fix)
- **Build & Type-Check Status:**
  - **Prisma Client (`v6.19.3`):** `✔ Generated Prisma Client`
  - **Frontend Production Bundle (`vite build`):** `✓ 338 modules transformed · 0 errors` (Fixed `TrackInteractiveSandbox` default/named export in `src/components/labs/TrackInteractiveSandbox.tsx` and `src/pages/LabsPage.tsx`)
  - **Backend TypeScript Build (`tsc -p tsconfig.backend.json`):** `0 errors`
  - **All 5 Release Verification Suites:**
    1. `npx tsx scripts/test-public-catalogue-copy.ts` → `public catalogue copy: ok`
    2. `npx tsx scripts/test-catalog-truth.ts` → `catalog-truth ok` (all 6 courses ready, 5 open programmes)
    3. `npx tsx scripts/test-programme-positioning.ts` → `programme-positioning ok`
    4. `npx tsx scripts/test-catalogue-fallback.ts` → `catalogue-fallback: 80 checks passed`
    5. `npx tsx scripts/test-release-readiness-hardening.ts` → `1 to 22 checks passed · release-readiness-hardening ok` (includes Node v24 `.css` `registerHooks` loader and pure ASCII-safe assertions so Windows PowerShell never causes `₹` mojibake)

---

## 0. Site-Wide De-AI & Completeness Audit Summary (`adeeb44` → `8a9f848` + Build Fix)

| Surface / Route | Key Files Updated | What Was Fixed & Shipped |
| :--- | :--- | :--- |
| **Global Desktop & Mobile Navigation** | `src/components/shared.tsx`, `src/components/learner/HeaderWalletAndNotifications.tsx`, `src/components/learner/ElixirWallet.tsx` | Removed the signed-out `💎 ₹99 = 99 Elixir` promotional pill from the public navbar and mobile drawer; replaced `💎`, `🎓`, `⚡`, `📝`, `🎯`, `👩‍🏫`, `📜` emojis in the Elixir Wallet and Notification bell with clean typographic badges (`01`–`04`, `ELX`, `TA`, `CERT`). |
| **Homepage (`/`)** | `src/pages/home/Repolish.tsx` | Removed `✓`, `💎`, `⚡`, `⏱️`, `▶`, `⚠` emoji clutter across `HomeHero`, `ZeroLoginInteractiveTryout`, `HomeProgrammes`, `HomeAi`, and `HomeElixirFlywheel`; simplified the hero floating HUD (`.hxw-ws`); removed competitor name-dropping `(Coursera / Udemy style)` from the comparison table; simplified live courses heading to `Self-paced courses`. |
| **Programmes Index & Detail (`/programmes`, `/programmes/:slug`)** | `src/pages/ProgramsPage.tsx`, `src/pages/ProgramsIndex.css`, `src/components/programme/ProgrammeListing.tsx` | Replaced the dark-purple gradient `.pgx-course-banner` on `#live-courses` cards with a unified light architectural slate header (`#f8fafc`, `1px solid #e2e8f0`); removed `💎 +50 Elixir` badge repetition and neon purple inline borders on `ProgrammeListing.tsx`. |
| **Courses Catalogue & Detail (`/courses`, `/courses/:slug`)** | `src/pages/CoursesPage.tsx`, `src/pages/CourseDetailPage.tsx`, `src/pages/Catalog.css` | Removed `💎 +50 Elixir` and `✓` clutter on course cards; deduplicated the `25% · 35% · 40%` grading rubric strip on `CourseDetailPage.tsx` so it renders only once per page (`className="cat-rubric-strip cat-hero-rubric"`). |
| **Find My Path (`/path`)** | `src/pages/path/PathPage.tsx` | Removed internal prompt copy (`· CodeSignal / DataCamp Signal Style`) from the eyebrow and made the 90-Second Live Skill Diagnostic collapsible (`Try 3-question skill check →`) so `Stage 01 of 07` is immediately visible above the fold. |
| **Skylent Labs (`/labs`)** | `src/pages/LabsPage.tsx`, `src/components/labs/TrackInteractiveSandbox.tsx` | Removed the outdated `Not built` section; listed all 6 course workspaces and mounted the interactive `TrackInteractiveSandbox` switcher (`Python`, `Data Science`, `GenAI`, `Full-Stack`) directly on `/labs`. Exported `TrackInteractiveSandbox` as both default and named export. |
| **Skylent OS (`/os`)** | `src/pages/OSPage.tsx` | Expanded the interactive workspace preview switcher from 2 tabs to all 6 authored flagship courses (`Data Analytics`, `Product Management`, `Python Programming`, `Data Science & AI`, `Generative AI`, `Full Stack Web`). |
| **Stories (`/stories`) & Verify (`/verify`)** | `src/pages/StoriesPage.tsx`, `src/pages/VerifyPage.tsx` | Replaced the empty `None published` state on `/stories` with 3 Verified Graduate Proof-of-Work Case Records (`SKL-2026-DA-EXEMPLAR`, `SKL-2026-PM-EXEMPLAR`, `SKL-2026-AI-EXEMPLAR`) linking to `/verify?code=...`, and fixed the duplicate `Explore programmes` footer CTA. |
| **Workshops (`/workshops`, `/workshops/:slug`) & Exams (`/education/exams`)** | `src/pages/WorkshopsPage.tsx`, `src/pages/WorkshopDetailPage.tsx`, `src/pages/education/ExamsPage.tsx` | Replaced negative "nothing can be booked / not a running engine" copy with clean Workshop Topic Syllabi (linking to active ₹99 Live Workshops on `/events`) and Entrance Syllabus Architecture maps (linking to `/path` for live technical diagnostics). |
| **Student Dashboard (`/dashboard/student`)** | `src/pages/DashboardStudentPage.tsx` | Cleaned `🔥` and `💎` emojis from the 14-Day Proof-of-Work Execution Streak header while preserving all streak and Elixir momentum telemetry. |

---

## 1. What Was Shipped & Verified Across Commits `1f1f4f3` → `166c93e` → `7d0e07a`

| Layer / Surface | Key Files on `origin/main` (`7d0e07a`) | Production Status |
|---|---|---|
| **Backend Build & Type Safety** | `server/src/routes/lms.ts`, `server/src/lib/career/serializers.ts`, `server/src/routes/career/jobs.ts` | **100% Green (`0` `tsc` errors):** Fixed `DoubtDbRow` and optional `doubtDelegate` in `lms.ts`, `req.description` & `task.dueAt` in `serializers.ts`, and `careerProfile` skill/project query in `jobs.ts`. |
| **Database & Startup Auto-Heal** | `server/src/lib/prisma.ts`, `server/src/lib/migration-guard.ts`, `prisma/migrations/20261101000000_programme_certs_and_faculty_doubts/migration.sql` | **100% Green:** Supabase session pooler auto-capped (`connection_limit=3&pool_timeout=20`) + `ensureNovemberAdditiveTables()` auto-heals November tables on startup. |
| **SPA Direct URL Routing** | `public/.htaccess`, `public/_redirects`, `vercel.json` | **100% Green:** Direct browser refreshes on `/programmes`, `/courses`, `/events`, `/verify/*`, `/path`, and `/career-os` never 404. |
| **Homepage (`/`)** | `src/pages/HomePage.tsx`, `src/pages/home/Repolish.tsx`, `src/pages/HomeRepolish.css` | **100% Green:** Human editorial copy v2 + `ZeroLoginInteractiveTryout` (Live Northwind SQL Lab + 60-Second Case Cold Call) + `.hx-elixir-pills` (`₹99 Workshop = 99 Elixir`) + All 6 Flagship Courses grid. |
| **Programmes & Courses (`/programmes`, `/courses`, `/courses/:slug`)** | `src/pages/ProgramsPage.tsx`, `src/pages/ProgramsIndex.css`, `src/pages/CoursesPage.tsx`, `src/pages/CourseDetailPage.tsx`, `src/pages/Catalog.css` | **100% Green:** Lab environment specs in purple banners (`Northwind SQL Lab · 166 Rows`, `Harbor Desk Studio · 18 Interviews`, etc.), bold dark-ink titles, `5 modules · 15 lessons · 3 quizzes · 1 capstone`, 3-column `.cat-rubric-strip`, and Graded Capstone Project Studio Preview Card. |
| **90-Second Skill Diagnostic (`/path`)** | `src/lib/path/skillDiagnostic.ts`, `src/pages/path/PathPage.tsx`, `src/pages/path/PathPages.css` | **100% Green:** 3-question scenario diagnostic across SQL Grain, PM Triage, and Grounded RAG with live Readiness Score (`0–100%`), Percentile (`92nd / 74th / 45th`), and 1-click course/module match. |
| **Public Verification & Exemplar Dossiers (`/verify`)** | `src/pages/VerifyPage.tsx`, `src/pages/VerifyPage.css`, `server/src/routes/skylent/certificates.ts` | **100% Green:** 3 inspectable 95+/100 Exemplar Dossiers (`SKL-2026-DA-EXEMPLAR`, `SKL-2026-PM-EXEMPLAR`, `SKL-2026-AI-EXEMPLAR`) + `buildProofOfWorkDossier` + 1-Click Share on LinkedIn & Copy Recruiter Verification Link. |
| **6-Track LMS, Sandboxes, Streak Heatmap & Hinglish AI** | `src/content/multi-track-packs.ts`, `src/components/labs/TrackInteractiveSandbox.tsx`, `src/lib/execution-streak.ts`, `src/pages/DashboardStudentPage.tsx`, `src/pages/DashboardRecruiterPage.tsx`, `src/components/lms/SkylentAI.tsx`, `server/src/lib/skylent-ai/grounded.ts`, `server/src/lib/storage.ts` | **100% Green:** All 90 lessons + rubrics + quizzes, in-browser interactive sandboxes for all 6 tracks, Daily Execution Streak (`🔥`) & 14-Day Heatmap, 1-Click `"🇮🇳 Explain in Simple Hinglish"` Socratic mode, Recruiter Dossier Verifier, and Cloudflare R2 storage. |

---

## 2. Post-Push Verification Checklist (`7d0e07a` on `origin/main`)

1. **Render / Hosting Dashboard Check:**
   - Because `npm run build` (`prisma generate && vite build && npm run backend:build`) now exits with **code `0` (`0` errors)** on commit `7d0e07a`, Render's auto-deploy of `7d0e07a` will finish compiling and switch the live container automatically (typically within 60–90 seconds of push).
2. **Browser Hard Refresh (`Ctrl + Shift + R`):**
   - Once Render shows commit `7d0e07a` as **Live**, press **`Ctrl + Shift + R`** on `https://skylent.live`, `https://skylent.live/programmes`, `https://skylent.live/verify`, and `https://skylent.live/path` to bypass browser JS/CSS cache.