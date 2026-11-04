# SKYLENT (`skylent.live`) — COMPLETE AI & FOUNDER CONTINUITY HANDOFF MASTER (V33 — Complete 6-Role Dashboard Polish, Canonical Royal Purple #5142B5 + Crisp White #FFFFFF System & Remaining Gap Audit)

* **Last Updated:** November 5, 2026

* **Production Domain:** <https://skylent.live>

* **GitHub Repository:** `https://github.com/skylentglobalofficial-design/newlms` (`main` branch, latest commit `e51704f`)

* **Local Windows Path:** `C:\Users\Chandan\Documents\newlms`

* **Latest Verified Release Package:** `skylent-v33-complete-dashboard-and-lms-polish-master.zip` (All 9 Automated Test Suites Green + Vite/Backend Production Build Verified)

## 1. Canonical Brand Color OS (Locked Across All Public & Signed-In Surfaces)

Skylent operates on a single, unified **Light-First + Royal Purple (`#5142B5`) + Soft Lavender (`#F6F4FF`) + Crisp White (`#FFFFFF`)** institutional design system (`0` stray `#fbbf24` yellow or `#4f46e5` Tailwind indigo clashes across `src/`):

| Surface / Token Role | Canonical CSS Token / Value | Where Applied | 
| ----- | ----- | ----- | 
| **Page Canvas & Reading Surfaces** | Crisp White `#FFFFFF` + Soft Lavender-White `#F7F6FC` (`--site-paper`, `--site-soft`) | Homepage, `/programmes`, `/courses`, `/events`, `/workshops`, `/career-os`, `/education`, all 6 Role Dashboards, and Lesson reading stage | 
| **Primary Brand Action (Buttons, Links, Active States)** | **Skylent Brand Violet `#5142B5`** (Hover `#43349F`, Soft Tint `#EAE6FF`, Border `#DDD7FF`) | All `.sk-btn-primary`, active tabs, badges, and interactive links | 
| **Workbench & Institutional Headers** | **Rich Skylent Royal Purple `linear-gradient(135deg, #3B2D96 0%, #5142B5 100%)`** + **Soft Lavender Card Surface (`#F6F4FF -> #FFFFFF` with `4px solid #5142B5` top bar)** | Hero Enrolment Card, Live ₹99 Workshop Cards, Student Project Dossiers, 6-Step Career Journey Stage Plate, Interactive AI Studio, Course Player Top Bar, and Role Dashboard Headers | 
| **High-Contrast Header CTAs** | **Crisp White `#FFFFFF` background with Bold `#5142B5` Royal Purple text** | Primary CTAs inside Royal Purple hero banners (`Continue learning →`, `Open Course Builder →`, `Export Cohort CSV`, `Review submissions`) | 
| **Verified / Live Status Pills** | **Emerald `#34D399` / `#0E6A44`** (`#DCFCE7` / `#E7F6EF` on light, `rgba(16, 185, 129, 0.16)` on dark) | `✓ Open for enrolment`, `✓ 96/100 Rubric Score`, `₹99 · 100% Coin Back` | 

## 2. What Is 100% Built, Tested & Live on `main` (Up to Commit `e51704f` / V33)

1. **6 Flagship Authored Courses & 6 In-Browser Execution Sandboxes (90 Lessons Total):**

   * `data-analytics` (Northwind SQL Lab — 166 valid rows), `product-management` (Harbor Desk PRD Studio), `python-programming` (Python ETL & Pytest Validator), `data-science-ai` (10 Modules / 30 Lessons Dual SQL + Python Track & Churn Cohort Lab), `generative-ai` (Grounded RAG & Citation Evaluator), and `full-stack-web` (Idempotent PostgreSQL Ledger Sandbox).

2. **All 82 Public, Learner, Career OS & Role-Based Dashboard Routes:**

   * **Public Discovery (V31–V32 Polished):** Homepage (`/`), Programmes (`/programmes`, `/programmes/:slug` with 3-Tier Pricing + Online/Offline Toggle + Floating Bottom Dock), Courses (`/courses`, `/courses/:slug`), Events (`/events`, `/events/:slug`), Workshops (`/workshops`, `/workshops/:slug`), Degrees (`/education`, `/education/:mode/:slug`, `/education/schooling`, `/education/exams`), Institutions (`/institutions`, `/universities`), 90-Second Skill Diagnostic (`/path`), Skills (`/skills`), Stories (`/stories`), Certificate Verifier (`/verify`, `/verify/:code`), About (`/about`), and Contact (`/contact`).

   * **Signed-In Workspaces & 6 Role Dashboards (V33 Polished):**

     * **Universal Desktop Top Bar (`AuthDashboardShell.tsx` & `LearnPage.tsx`):** `<HeaderWalletAndNotifications variant="dashboard" />` is mounted across all 6 role dashboards, Career OS, and the Inside-LMS Lesson Player (`/learn/:slug`).

     * **Student (`/dashboard/student`):** High-contrast white-on-purple `Continue learning →` CTA, 14-day execution streak bar, above-the-fold 2-column workspace grid, and Soft Lavender + Crisp White `L1 → L5 Progression` & `Skylent AI` cards.

     * **Superadmin C-Suite (`/dashboard/admin` & `AdminPlatform.tsx`):** Structured 2-column command center with Crisp White + `4px solid #5142B5` cards for C-Suite Unit Economics, Real-Time Telemetry, Learning Reward Rules, Users & Roles, Organisations, Employers, Enquiries, Practice Studios, Lesson Media, Payments, Wallet Adjustments, Case Store Publishing, and Security Audit Log.

     * **Faculty TA (`/dashboard/faculty`):** 20-Min Doubt SLA Queue, 5-Dimension Rubric standard, and pending submission grading queue in Crisp White + `#5142B5` cards.

     * **College HoD/TPO (`/dashboard/college`):** NEP 2020 / NAAC Cohort KPI strip + 1-Click CSV export (`/api/v1/college/dashboard/export.csv`).

     * **Recruiter (`/dashboard/recruiter`):** Verified Candidate Proof-of-Work Verifier + Actionable Employer Linker guide.

     * **Organisation L&D (`/dashboard/organisation`):** L1–L5 Competency Pipeline & 60-Hour Notional Workload breakdown.

## 3. Complete Remaining Gap Audit: Kaha, Kya, Aur Kyu Bacha Hai (Before Final Production Launch)

### Bucket A — Code & UI Polish Gaps (Jo Codebase Mein Abhi Bhi Bache Hain)

| \# | Kaha (File / Route) | Kya Bacha Hai (Exact Gap) | Kyu Bacha Hai (Root Cause) | Recommended Fix (V34) | 
| ----- | ----- | ----- | ----- | ----- | 
| **A1** | **`/dashboard/curriculum`** (`src/pages/CourseBuilderPage.tsx`, lines 113–212) | Superadmin dashboard (`/dashboard/admin`) ke hero button `"Open Course Builder →"` par click karne se jo page khulta hai, woh abhi bhi raw unstyled `<form>`, `<input>`, `<select>`, aur `<ol>` render karta hai (zero cards, zero Royal Purple header, zero CSS layout). | V33 mein 6 main role dashboards (`DashboardAdminPage`, `AdminPlatform`, etc.) redesign hue, par separate route `/dashboard/curriculum` छूट gaya tha. | `CourseBuilderPage.tsx` ko Royal Purple header + 2-column Crisp White + `4px solid #5142B5` cards (Left: Course & Module Tree, Right: Create Course / Add Module / Add Lecture forms) mein upgrade karna. | 
| **A2** | **`/workshops`, `/workshops/:slug`, `/labs`, `/blog`** (`src/pages/WorkshopsPage.tsx`, `WorkshopDetailPage.tsx`, `LabsPage.tsx`, `BlogPage.tsx`) | `WorkshopsPage.tsx` (line 27) aur `LabsPage.tsx` (line 45) abhi bhi legacy subnav wrappers (`LearnPillarSubnav`, `PracticePillarSubnav`, `CapabilityRail`) aur plain `.cat-hero` use kar rahe hain, jabki `/programmes`, `/events`, aur `/skills` V32 mein Royal Purple + Soft Lavender card hubs ban chuke hain. | V32 mein main navbar ke primary pages update hue the; `/workshops`, `/labs`, aur `/blog` secondary routes hone ke karan purane `.cat-hero` layout par reh gaye. | `WorkshopsPage.tsx`, `WorkshopDetailPage.tsx`, `LabsPage.tsx`, aur `BlogPage.tsx` se legacy subnav strips hata kar unhein unified Royal Purple + Soft Lavender + Crisp White card system par laana. | 
| **A3** | **`/courses/:slug`** (`src/pages/CourseDetailPage.tsx`) | `/programmes/:slug` par V32 mein 3-Tier Pricing Plans (`Basic / Premium / Pro`), \`Online | Offline` switcher, aur Floating Bottom Navigation Dock (`ProgrammePricingAndDock.tsx`) lag gaya hai, lekin standalone `/courses/:slug\` par abhi bhi sirf basic syllabus list hai. | `ProgrammePricingAndDock` sirf `ProfessionalProgrammeTemplate.tsx` aur `ProgrammeListing.tsx` mein mount hua tha. | 
| **A4** | **20-Min Faculty Doubt SLA Storage** (`server/src/lib/doubt-sla.ts`, line 19) | `const doubtStore = new Map<string, FacultyDoubtTicket>()` — Student doubts aur Faculty TA resolutions abhi server RAM (`Map`) mein save hote hain. Server restart/redeploy hone par doubt history clear ho jaati hai. | September/October DB schema compatibility (`SKYLENT_SEPTEMBER_COMPAT`) ko bina naya Prisma table add kiye pass karane ke liye in-memory store banaya gaya tha. | Optional disk-backed JSON snapshot ya Prisma table fallback add karna taaki server restart par bhi doubt tickets persist rahein (bina test suite break kiye). | 

### Bucket B — Production Environment & Live Third-Party Keys (`skylent.live` Server `.env` Gaps)

Yeh chizein code mein 100% built aur guarded hain, lekin production server (Railway / Render / Hostinger `.env`) mein live keys daalne par hi activate hongi:

| \# | Feature / Flow | Backend File | Abhi Production Par Kya Hota Hai | Kyu (Technical Reason) | Kaise Activate Hoga (`.env` Keys) | 
| ----- | ----- | ----- | ----- | ----- | ----- | 
| **B1** | **Skylent AI (Lesson Tutor) & Floating Reva Assistant** | `server/src/routes/skylent/reva.ts` | Production (`NODE_ENV=production`) mein bina API key ke AI *"Skylent AI isn't available yet / Leave an enquiry"* dikhata hai. | `test-release-readiness-hardening.ts` (Check #6) enforce karta hai ki production mein deterministic stub (`lesson-grounded`) ko live LLM na dikhaya jaye jab tak real API key na ho. | Production `.env` mein `SKYLENT_AI_PROVIDER=openai-compatible`, `SKYLENT_AI_API_KEY=<your-key>`, `SKYLENT_AI_BASE_URL=https://api.openai.com/v1` (ya Groq/Gemini endpoint), aur `SKYLENT_AI_MODEL=gpt-4o-mini` set karein. | 
| **B2** | **1-Click Google Sign-In (`/login`)** | `server/src/lib/google-oauth.ts` | `/login` page par `"Continue with Google"` button disabled/unavailable dikhta hai. | `GET /api/v1/auth/google/status` checks `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`. Bina keys ke 503/redirect guard lagta hai ताकि user broken OAuth screen par na jaye. | Google Cloud Console mein `https://skylent.live/api/v1/auth/google/callback` register karke `.env` mein `GOOGLE_CLIENT_ID` aur `GOOGLE_CLIENT_SECRET` daalein. | 
| **B3** | **Password Reset & Transactional Emails** | `server/src/lib/email.ts` | `/reset-password` request karne par email send nahi hota agar `mailgun` ya `sendgrid` configured nahi hai. | `server/src/lib/email.ts` (line 26) mein `mailgun` aur `sendgrid` implemented hain (`ses` aur `smtp` stubbed hain). | `.env` mein `EMAIL_PROVIDER=sendgrid`, `SENDGRID_API_KEY=<key>`, aur `EMAIL_FROM=noreply@skylent.live` set karein. | 
| **B4** | **Student Assignment / Resume File Uploads (Cloudflare R2)** | `server/src/lib/storage.ts` | Local disk storage production mein ephemeral hota hai; cloud persistence ke liye R2 provider ready hai. | `server/src/lib/storage.ts` mein AWS SigV4 Cloudflare R2 upload/download/signed-URL 100% coded hai, bas env keys chahiye. | `.env` mein `STORAGE_PROVIDER=r2`, `STORAGE_BUCKET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` set karein. | 
| **B5** | **Live UPI / Card Checkout (Razorpay / Cashfree)** | `server/src/routes/events.ts` & `admin-platform.ts` | Abhi ₹99 Workshop registration 1-click free/instant hai (+99 Elixir Coins) aur course payments `/dashboard/admin` mein `"Record Verified Payment"` se manual/offline record hote hain. | Codebase mein Razorpay/Cashfree SDK webhook abhi wired nahi hai taaki zero-login / ₹0 pilot friction na aaye. | Jab paid checkout chalu karna ho, Razorpay Order API + Webhook (`/api/v1/payments/razorpay/webhook`) wire karna. | 

### Bucket C — Business & Truth-in-Catalogue Operations (Jo Compliance Tests Ke Karan Intentionally Honest Rakhe Gaye Hain)

1. **Live Workshop Dates (`Date not set` / `Schedule to be announced`):**

   * **Kyu:** `scripts/test-catalog-truth.ts` kisi bhi hardcoded fake urgency timer (`Next Batch`, `seats remaining`, `50% OFF`, `Live Classes`) ko strictly block karta hai.

   * **Solution:** Superadmin API (`POST /api/v1/events`) ya DB seed ke through har hafte real Saturday/Sunday workshop dates create karein.

2. **Public Exemplar Dossiers (`SAMPLE BENCHMARK DOSSIER · ILLUSTRATIVE PREVIEW` on `/stories` & `/verify`):**

   * **Kyu:** `SKYLENT_INSTITUTIONAL_CHARTER_V1.md` aur `scripts/test-public-catalogue-copy.ts` ke tahat bina real student consent ke fake alumni placement claims dikhana mana hai.

   * **Solution:** Pehle ₹99 Bhubaneswar/Odisha workshop ke 5–10 students ke real graded Northwind SQL / Harbor Desk PRD capstones issue karke unke asli `SKL-2026-...` verification codes `/stories` par showcase karein.

## 4. Mandatory 9-Suite Verification Checklist (Always Run Before Every Push)

```
npx tsx scripts/test-public-catalogue-copy.ts
npx tsx scripts/test-catalog-truth.ts
npx tsx scripts/test-programme-positioning.ts
npx tsx scripts/test-catalogue-fallback.ts
npx tsx scripts/test-degree-catalogue.ts
npx tsx scripts/test-product-manifest.ts
npx tsx scripts/test-oauth-redirect.ts
npx tsx scripts/test-dashboard-navigation.ts
npx tsx scripts/test-release-readiness-hardening.ts
npm run build

```


---

## 5. V34 Complete Multi-Tab Dashboard Architecture & End-to-End Course / Module / Lecture Authoring Studio (`skylent-v34-multi-tab-dashboards-and-course-studio.zip`)

1. **True Left-Sidebar & Top-Bar Multi-Tab Switching Across All 6 Role Dashboards (`Admin OS`, `Faculty TA`, `Student`, `College`, `Recruiter`, `Org L&D`):**
   * **Superadmin Command OS (`/dashboard/admin` & `AdminPlatform.tsx`):** Left sidebar and top tab bar switch cleanly across 11 dedicated views: `1. Overview & KPIs` (with 6 Quick-Launch Module Cards), `2. Course & Lecture Studio` (embedded full authoring studio), `3. Users & Roles`, `4. Colleges & Orgs`, `5. Employers & Hiring`, `6. Inbound Enquiries`, `7. Practice Sandboxes`, `8. Lesson Video (Mux)`, `9. Payments & Elixir`, `10. System & Audit Log`, and `11. All Modules (Stacked)`.
   * **Faculty TA & Instructor Dashboard (`/dashboard/faculty`):** Switches across 7 dedicated views: `Overview & SLA`, `Assigned Courses`, `Add Lectures & PDFs` (interactive Faculty Lecture & Study Material Authoring Studio), `V1→V2 Grading Studio` (inline student submission viewer + 0–100 score & Red-Line feedback grader), `20-Min Doubt Queue`, `Learner Cohort`, and `Rubric & Settings`.
   * **Student Learning Dashboard (`/dashboard/student` & `StudentHome.css`):** Switches across 5 dedicated views (`1. Full Workspace (Overview)`, `2. My Active Courses`, `3. Capstone & Browser Labs`, `4. Certificates & Flight Recorder`, `5. Elixir Wallet & Case Store`) synced with `LEARNER_NAV`.
   * **College HoD/TPO (`/dashboard/college`), Recruiter (`/dashboard/recruiter`), & Organisation L&D (`/dashboard/organisation`):** All upgraded with multi-tab switching (`Overview`, `Cohort/Jobs/Programs`, `Roster/Applications/Batches`, `Compliance/Verify/Settings`).
2. **End-to-End Course, Module, Lecture, Quiz, PDF Material & Faculty Assignment Studio (`CourseBuilderPage.tsx` + `admin-curriculum.ts` + `faculty.ts`):**
   * **Step 01 · Admin Creates Course (`POST /api/v1/admin/curriculum/courses`):** Creates a `DRAFT` course with Title, auto-generated Slug, Category, Level, Duration, Mode, Price (₹), Outcomes, Target Audience, and optional Course Cover Image (`POST /courses/:courseId/cover`).
   * **Step 02 · Structure & Reorder Modules (`POST /courses/:courseId/modules`, `POST /modules/order`):** Add modules with title, objective description, and position; reorder modules (`↑` / `↓`) or delete modules with 1 click.
   * **Step 03 · Author Multi-Modal Lectures (`POST /modules/:moduleId/lectures` & `POST /lectures/:lectureId/materials`):** Supports all 6 Skylent node types: `NOTES` (Reading + Hinglish AI Notes), `VIDEO` (Video URL / Mux Playback ID + summary), `LAB` (Browser SQL/Python/RAG/Ledger Sandbox), `ASSIGNMENT` (Graded Case Brief routed to Faculty V1→V2 Review), `PROJECT` (Capstone Studio), and `QUIZ` (Interactive Multi-Question Quiz Builder with options, correct answer radio, explanations, passing score %, and max attempts) + 1-click PDF/PPTX/Markdown attachment upload!
   * **Step 04 · Assign Faculty TA & Publish Live (`POST /courses/:courseId/faculty`, `POST /courses/:courseId/publish`):** Assign Faculty accounts to specific courses so they can co-author lectures/materials and grade student submissions in `/dashboard/faculty`, then 1-click Publish directly to `/courses/:slug` and `/learn/:slug`!
3. **Persistent 20-Minute Faculty Doubt SLA Store (`server/src/lib/doubt-sla.ts`):**
   * Added automatic JSON snapshot persistence (`.cache/doubt-sla-tickets.json` when `NODE_ENV !== "test"`) so student lesson doubts and Faculty TA resolutions survive server restarts.
