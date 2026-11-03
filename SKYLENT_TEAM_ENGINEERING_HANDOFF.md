# SKYLENT (`skylent.live`) — ENGINEERING, DEVOPS, QA & OPERATIONS TEAM HANDOFF RUNBOOK (V19)

* **Release Version:** `V19` (`skylent-v19-complete-handoff-master.zip`)
* **Date:** November 3, 2026
* **Production URL:** [https://skylent.live](https://skylent.live)
* **GitHub Repository:** `https://github.com/skylentglobalofficial-design/newlms` (`main` branch)

---

## 1. Executive Summary for the Team: What Skylent Is & Why We Win

**Skylent** is an execution-first Career Operating System (`Learn → Practise → Build → Prove`). Unlike passive video libraries ([Coursera](https://www.coursera.org/), Udemy) or ₹2,00,000 live-Zoom bootcamps ([Scaler](https://www.scaler.com/scaler-academy-detailed-curriculum), [AlmaBetter](https://aarts.in/portfolio/almabetter)), Skylent puts learners directly inside a browser-based SQL, Python, Product PRD, or GenAI RAG sandbox from Day 1, backs them with a **24/7 Hinglish + English Socratic AI Coach** and a **20-minute Human Faculty TA SLA**, and graduates them with a **cryptographically verifiable Proof-of-Work Dossier (`/verify/:code`)**.

### Visual & Logical Competitor Benchmark (Where We Take Over vs What the Team Must Maintain)

| Dimension | Competitor Standard ([Scaler](https://www.scaler.com/scaler-academy-detailed-curriculum), [AlmaBetter](https://aarts.in/portfolio/almabetter), [Reforge](https://www.reforge.com/), [DataCamp](https://www.datacamp.com/)) | Skylent V19 Advantage (`skylent.live`) | Team Operational Responsibility |
|---|---|---|---|
| **Visual Identity & Readability** | Dark-mode developer clutter (Scaler) or generic blue/white SaaS templates (AlmaBetter). | **Crisp White Canvas (`#ffffff`) + Royal Midnight Navy Cards (`#11152c → #1d1849`) + Warm Gold (`#fbbf24`) + Emerald Status Pills (`#34d399`) + Crisp White Skill Tags.** | Never introduce unstyled grey boxes or off-brand colours. Use `.hx-royal-card`, `.pgx-royal-hero-card`, and `.ws-row--track` tokens for all feature surfaces. |
| **Customer Acquisition & Entry Friction** | ₹1.5L–₹2.5L upfront tuition or high-interest NBFC/EMI loans before trying the product. | **₹0 Free Pilot Courses + ₹99 Live Weekend Workshops with 100% Coin Back (`99 Elixir Coins`).** | Wire live Razorpay/Cashfree webhook to `/api/v1/elixir` so every ₹99 workshop buyer automatically receives 99 Elixir Coins in their wallet. |
| **Pedagogy & Daily Learning** | Passive recorded videos (<10% completion) or 3-hour Zoom lectures. | **In-Browser Execution Sandboxes from Lesson 1:** Northwind SQL (166 valid rows), Harbor Desk PRD, Python ETL, Cohort Churn, Grounded RAG, Full-Stack Ledger. | Keep sandbox API latency under 200ms and ensure local draft auto-save (`src/lib/draft-storage.ts`) never drops learner work. |
| **Doubt Resolution** | Dead discussion forums or 24–48 hour ticket queues. | **Built-in Socratic AI (English + 1-click Hinglish mode) + 20-Minute Human Faculty TA SLA.** | Connect Slack/WhatsApp webhook notifications to `/api/v1/faculty/doubts` so on-duty Faculty TAs answer escalated doubts within the 20-minute SLA. |
| **Recruiter Trust & Credentials** | Forged or generic PDF completion certificates with zero proof of actual skill. | **Public Proof-of-Work Dossiers (`/verify/:code`)** showing the exact SQL query, PRD spec, rubric score (`96/100`), and SHA-256 verification status. | Ensure Faculty TAs grade capstone submissions against the 3-part rubric (`25% Validation · 35% Technical · 40% Commercial`) before issuing certificates. |

---

## 2. What Is Already 100% Built in V19 vs What the Team Needs to Wire & Build Next

### A. Already 100% Built & Verified in Code (Do Not Rebuild)
1. **All Public Marketing & Discovery Pages (V19 Royal Theme):**
   * **Homepage (`/`)**: Hero, 6 Career Track Cards, Live ₹99 Weekend Workshops Showcase, 4-Row First-Visitor Comparison Table, 5-Stage Interactive Course Preview, University Pathways, 6-Step Beginner-to-Job-Ready Career Journey, Real Student Project Dossiers (`SKL-2026-DA-EXEMPLAR`, `SKL-2026-PM-EXEMPLAR`, `SKL-2026-AI-EXEMPLAR`), and Interactive 3-Tab Hinglish/English AI Mentor Studio.
   * **Programmes Catalogue (`/programmes`) & Detail Pages (`/programmes/:slug`)**: 2-column hero with Royal Midnight Navy Execution Card, fast WebP imagery, 3×2 track grid with lab badges and skill tags, 4-card metrics grid, sticky subnav, 6-step capstone roadmap, and full module syllabus accordions.
   * **Courses (`/courses`, `/courses/:slug`), Events (`/events`), Workshops (`/workshops`), Degrees (`/education`, `/education/:mode/:slug`, `/education/schooling`), Institutions (`/institutions`), Career OS Public (`/career-os`), 90-Second Diagnostic (`/path`), and Certificate Verifier (`/verify`, `/verify/:code`)**.
2. **All 6 Authored Courses & In-Browser Sandboxes (90 Lessons Total):**
   * `data-analytics`, `product-management`, `python-programming`, `data-science-ai`, `generative-ai`, and `full-stack-web` — complete with readings, module quizzes, graded assignments, and interactive browser labs.
3. **All 6 Role-Based Dashboards & Superadmin Auto-Provisioning:**
   * Student (`/dashboard/student`), Faculty (`/dashboard/faculty`), College (`/dashboard/college`), Recruiter (`/dashboard/recruiter`), Organisation (`/dashboard/organisation`), and Admin/C-Suite (`/dashboard/admin`, `/dashboard/curriculum`).
   * **Superadmin Account:** `tariniprasadtripathy17@gmail.com` / `Tarini@Skylent2026!` is automatically provisioned on server boot (`server/src/index.ts`) with full access across all dashboards and automatic bypass of the 60% Career OS gate.
4. **Backend Hardening & Resilience:**
   * All 27 Express route modules in `server/src/routes/` have top-level imports, `try/catch` blocks, `503` missing-schema/DB-unavailable fallback guards (`isMissingSchemaError`, `isDatabaseUnavailableError`), secret redaction (`redactSecrets`), dual health probes (`/api/v1/health/live` and `/api/v1/health/ready`), SPA `index.html` catch-all routing, and dynamic OpenGraph meta tag injection (`injectOpenGraphMeta`).

---

### B. What the Engineering & Operations Team Needs to Wire & Build Next (Prioritized Backlog)

#### Sprint 1 (Immediate — Production Wiring & Payment Flywheel)
1. **Live Payment Gateway Integration for ₹99 Workshops (`server/src/routes/events.ts` & `server/src/routes/elixir.ts`):**
   * **Current State:** Event registration and Elixir wallet credit endpoints are built and tested, but payment capture is currently simulated/free-pilot.
   * **Team Task:** Integrate Razorpay or Cashfree Checkout on `/events/:slug` for ₹99 workshop bookings. Add a verified webhook endpoint (`POST /api/v1/events/webhook/payment`) that verifies the HMAC signature, marks the event registration as `PAID`, and atomically credits `+99 Elixir Coins` to the learner's `ElixirWallet`.
2. **Production AI API Key & Hinglish Prompt Telemetry (`server/src/lib/skylent-ai/service.ts`):**
   * **Current State:** Socratic AI Coach (`SkylentAI.tsx`) and Reva site assistant (`/api/v1/reva`) have full deterministic fallbacks when `SKYLENT_AI_API_KEY` is unset.
   * **Team Task:** Set `SKYLENT_AI_PROVIDER=openai-compatible` and `SKYLENT_AI_API_KEY` in production environment variables, and monitor token usage per lesson in the Admin dashboard.
3. **Real-Time Faculty TA Alerting for the 20-Minute Doubt SLA (`server/src/routes/faculty.ts`):**
   * **Current State:** Learners can escalate doubts from inside any lesson to the Faculty Doubt SLA Queue (`DashboardFacultyPage.tsx`), which tracks the 20-minute countdown timer.
   * **Team Task:** Add a Slack / WhatsApp / Email outgoing webhook inside `POST /api/v1/lms/doubts` so on-duty Faculty TAs receive an instant mobile alert with a direct link to `/dashboard/faculty` whenever a student submits a doubt.

#### Sprint 2 (Week 2 — Transactional Emails, Certificate Image Generation & Campus Onboarding)
4. **Transactional Email & OTP Delivery (`server/src/routes/auth.ts`):**
   * **Team Task:** Connect Resend / AWS SES / SendGrid for password reset emails, workshop calendar invites (`.ics` attachment), and capstone grading notifications.
5. **Dynamic Certificate OG Image Generation (`server/src/routes/skylent/certificates.ts`):**
   * **Current State:** `injectOpenGraphMeta` in `server/src/lib/public-host.ts` injects dynamic `og:title` and `og:description` for `/verify/:code`.
   * **Team Task:** Add an endpoint `GET /api/v1/certificates/:code/og-image.png` using `satori` or `@resvg/resvg-js` to render a visual certificate card PNG (with student name, rubric score, and QR code) and point `og:image` to it.
6. **College Bulk Student CSV Import (`src/pages/DashboardCollegePage.tsx`, `server/src/routes/college.ts`):**
   * **Current State:** College TPOs can view cohort progress and export CSV reports.
   * **Team Task:** Add a bulk CSV upload modal on `/dashboard/college` so partner universities can onboard 100–1,000 students into a cohort in one click.

---

## 3. Day-1 Deployment & Verification Runbook

### Step 1: Extract V19 & Run All Automated Verification Suites
From `C:\Users\Chandan\Documents\newlms` (or your Linux/macOS checkout):

```powershell
cd "C:\Users\Chandan\Documents\newlms"
$LatestV19 = Get-ChildItem "$HOME\Downloads\skylent-v19-complete-handoff-master*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $LatestV19) { throw "skylent-v19-complete-handoff-master.zip not found in Downloads!" }
Write-Host "Extracting: $($LatestV19.FullName)" -ForegroundColor Cyan
Expand-Archive -Path $LatestV19.FullName -DestinationPath "C:\Users\Chandan\Documents\newlms" -Force

# Run all 8 mandatory verification test suites
npx tsx scripts/test-public-catalogue-copy.ts
npx tsx scripts/test-catalog-truth.ts
npx tsx scripts/test-programme-positioning.ts
npx tsx scripts/test-catalogue-fallback.ts
npx tsx scripts/test-degree-catalogue.ts
npx tsx scripts/test-product-manifest.ts
npx tsx scripts/test-oauth-redirect.ts
npx tsx scripts/test-release-readiness-hardening.ts

# Run full production build (Prisma + Vite Frontend + TypeScript Backend)
npm run build

# Commit and push to main
git status -s
git add -A
git commit -m "feat(v19-complete-handoff): unify programmes, events, workshops, career-os, and course player in royal midnight navy theme, add SPA fallback and OG meta tags"
git push origin main
```

### Step 2: Production Environment Variables Checklist (`.env`)

| Variable | Required in Prod? | Purpose |
|---|---|---|
| `NODE_ENV` | `production` | Enables trust proxy, secure cookies, and static asset caching |
| `DATABASE_URL` | **Yes** | Supabase PostgreSQL Session Pooler URL (`?pgbouncer=true&connection_limit=3&pool_timeout=20`) |
| `DIRECT_URL` | **Yes** | Direct PostgreSQL connection string for `npx prisma migrate deploy` |
| `SESSION_SECRET` | **Yes** | 32+ character cryptographic secret for session signing |
| `FRONTEND_URL` | **Yes** | `https://skylent.live` |
| `SUPERADMIN_EMAIL` | Optional | Defaults to `tariniprasadtripathy17@gmail.com` |
| `SUPERADMIN_PASSWORD` | Optional | Defaults to `Tarini@Skylent2026!` (override in production `.env`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Recommended | Enables 1-click Google Sign-In on `/login` and `/signup` |
| `SKYLENT_AI_PROVIDER` / `SKYLENT_AI_API_KEY` | Recommended | `openai-compatible` + API key for live Socratic AI & Reva assistant |
| `STORAGE_PROVIDER` / `STORAGE_BUCKET` / `R2_*` | Recommended | `r2` + Cloudflare R2 credentials for assignment & artifact uploads |

---

## 4. Role & Dashboard Access Matrix for QA Testing

| Role | Default Route After Login | Key Capabilities to Verify in QA |
|---|---|---|
| **Superadmin** (`tariniprasadtripathy17@gmail.com`) | `/dashboard/admin` | Full access to all 6 dashboards, C-Suite Unit Economics (CEO/CFO/CCRO/CAO), Curriculum Builder, and unblocked Career OS access. |
| **Student** | `/dashboard/student` | Enrol in any of the 6 courses, earn `+50 Elixir`, view 14-day execution streak heatmap, run browser SQL/Python/PRD labs, escalate doubts (20-min SLA), claim `-PGM` certificate, and unlock Career OS at 60% completion. |
| **Faculty TA** | `/dashboard/faculty` | View live 20-minute Doubt SLA queue, answer learner doubts, grade submitted assignments & capstones against rubrics. |
| **College Partner (HoD / TPO)** | `/dashboard/college` | Track campus cohort completion, Elixir balances, and download NEP-aligned CSV progress reports. |
| **Recruiter** | `/dashboard/recruiter` | Browse verified student Proof-of-Work dossiers, inspect SQL/PRD artifacts, and post/manage job roles. |
| **Organisation (L&D)** | `/dashboard/organisation` | Manage enterprise team seats, track employee skill progression, and review capstone completions. |
