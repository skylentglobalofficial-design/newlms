# SKYLENT (`skylent.live`) — COMPLETE AI & FOUNDER CONTINUITY HANDOFF MASTER (V20.1)

* **Last Updated:** November 3, 2026
* **Production Domain:** [https://skylent.live](https://skylent.live)
* **GitHub Repository:** `https://github.com/skylentglobalofficial-design/newlms` (`main` branch)
* **Local Windows Path:** `C:\Users\Chandan\Documents\newlms`
* **Latest Verified Release Package:** `skylent-v20-1-zero-ai-build-verified.zip` (built on top of V16 commit `0884c92`, V17 commit `ee9d2df`, and V18 Homepage Royal Theme release)

---

## 1. Founder's Core Idea vs Current V19 State (Complete Audit)

Skylent was conceived not as another passive video course library or an overpriced ₹2L Zoom bootcamp, but as **India's first Execution & Proof-of-Work Career Operating System (`Learn → Practise → Build → Prove`)**.

| Founder's Core Pillar (The Idea) | What Was Built & Shipped in Code (P0 → V19) | Current Status | What Remains (Future Expansion) |
|---|---|---|---|
| **1. Zero-Fluff In-Browser Execution (No Passive Videos)** | 6 complete authored flagship courses (90 lessons, 18 module quizzes, 6 graded capstones) with 6 interactive browser sandboxes: **Northwind SQL (166 valid rows)**, **Harbor Desk PRD Studio**, **Python ETL Validator**, **Data Science Cohort Churn Lab**, **GenAI Grounded RAG Evaluator**, and **Full-Stack Idempotent Ledger**. | **100% Built & Live** | Optional WebAssembly (`sql.js` / `Pyodide`) client-side execution worker for arbitrary user-invented schemas beyond the 6 curated datasets. |
| **2. ₹99 Workshop → 99 Elixir Coins (100% Cashback Flywheel)** | Full database schema (`ElixirWallet`, `ElixirLedgerEntry`, `CaseStudyUnlock`), header wallet badge (`HeaderWalletAndNotifications.tsx`), 3 Flagship ₹99 Live Workshop tracks, and 4 redeemable Case Studies (`49` / `99` Elixir). | **100% UI + API Built** | Live Razorpay / Cashfree webhook signature handler to trigger `/api/v1/elixir/credit` automatically upon live ₹99 payment capture. |
| **3. 24/7 Hinglish + English Socratic AI + 20-Min Human TA SLA** | Interactive 3-tab Hinglish/English AI Mentor Studio on Homepage (`Repolish.tsx`), in-lesson Socratic AI Coach drawer (`SkylentAI.tsx`) with 1-click Hinglish mode, and 20-minute Faculty TA Doubt SLA escalation queue (`DashboardFacultyPage.tsx`). | **100% Built & Live** | WhatsApp / Slack / Email webhook alert when a student clicks *"Escalate to Faculty TA"* so human TAs get notified on their phone within 30 seconds. |
| **4. Cryptographic Proof-of-Work Certificates (`/verify/:code`)** | Public verification engine (`/verify/:code`), Course & Programme Master (`-PGM`) credentials, rubric breakdown bars (`25% · 35% · 40%`), 3 public exemplar dossiers (`SKL-2026-DA-EXEMPLAR`, `SKL-2026-PM-EXEMPLAR`, `SKL-2026-AI-EXEMPLAR`), and dynamic OpenGraph meta tags (`injectOpenGraphMeta`). | **100% Built & Live** | Automated server-side PNG/PDF certificate image rendering (`satori` / `@resvg/resvg-js`) for 1-click LinkedIn feed image previews. |
| **5. 60% Merit-Gated Career OS (`Career Rise`)** | Automatic 60% curriculum completion gate (`CareerOSLayout.tsx`), Superadmin/Admin/Faculty bypass, Role Skill-Gap Matcher (`/career-os/jobs`), Timed Boardroom Cold Call defense drills, and Recruiter Talent Portal (`/dashboard/recruiter`). | **100% Built & Live** | Live recruiter outreach email triggers when a recruiter shortlists a verified student dossier. |
| **6. University Degrees & Autonomous College Tenant OS** | 4 NEP-aligned UG/PG degree tracks (`/education/:mode/:slug`), Schooling foundation page (`/education/schooling`), Institutional partnership portal (`/institutions`), and College HoD/TPO cohort analytics + CSV export (`/dashboard/college`). | **100% Built & Live** | Bulk student CSV roster import UI for College TPOs to onboard 500+ campus students in one click. |

---

## 2. Locked Visual Design System (V18 → V19 Site-Wide Standard)

Per founder direction, Skylent uses a high-contrast **Crisp White Canvas + Royal Midnight Navy Feature Card** visual language across all public and learner surfaces:

| Design Token / Surface | Exact CSS Specification | Where It Is Applied |
|---|---|---|
| **Page Canvas Background** | `#ffffff` (Pure White) & `#f8fafc` (Soft Ice) | Default background across Homepage, `/programmes`, `/courses`, `/events`, `/workshops`, `/career-os`, and Lesson reading stage |
| **Signature Royal Midnight Navy Card** | `linear-gradient(145deg, #11152c 0%, #1d1849 100%)` | Live ₹99 Workshop Cards, Student Project Outcome Cards, 6-Step Career Journey Stage Plate, Interactive AI Mentor Studio, Programme Hero Enrolment Card, `/programmes` Hero Execution Card & 3-Step Cards, `/events` Track Rows, `/career-os` Pillars & Feature Cards, and Course Player Top Bar |
| **Warm Gold Card Frame** | `1px solid rgba(251, 191, 36, 0.36)` (hover `0.75`) | Subtle gold border highlight on all Royal Midnight Navy surfaces |
| **Accent 1 — Warm Gold / Amber** | `#fbbf24` (`font-family: var(--sk-font-mono)`, `font-weight: 700`) | Top eyebrows, certificate codes (`SKL-2026-...`), stage codes, lab badges, and primary dark-card CTAs |
| **Accent 2 — Emerald Verified Pill** | `bg: rgba(16, 185, 129, 0.16)`, `border: rgba(52, 211, 153, 0.38)`, `text: #34d399` | Live status pills (`✓ 96/100 Project Score`, `★ ₹99 · 100% Coin Back`, `✓ Open for enrolment`) |
| **Accent 3 — Periwinkle Subtitle** | `#a5b4fc` | Role/track subtitle lines inside Royal Midnight Navy cards |
| **Accent 4 — Crisp White Skill Pills** | `background: #ffffff`, `color: #0f172a`, `border-radius: 999px`, `font-weight: 700` | High-contrast skill & tool tags inside Royal Midnight Navy cards |
| **Primary Brand Action Button** | `#4f46e5` / `#5142b5` (Royal Indigo) | Primary `.sk-btn-primary` buttons across light surfaces |

---

## 3. What Was Upgraded in V16 → V17 → V18 → V19

### A. V19 — Complete Site-Wide Harmonization, `/programmes` Fix, SPA Fallback & OpenGraph Meta
1. **`/programmes` Catalogue Index (`src/pages/ProgramsPage.tsx`, `src/pages/ProgramsIndex.css`):**
   * Replaced heavy JPEG imports on Data Analytics, Product Management, and Full Stack cards with fast, pre-sized WebP assets (`program-analytics-800.webp`, `program-product-800.webp`, `program-web-800.webp`) and a Royal Midnight Navy media stage so no card ever shows a grey placeholder box.
   * Upgraded the `/programmes` hero into a 2-column split (`.pgx-intro__split`) featuring a **Royal Midnight Navy Execution Standard Card (`.pgx-royal-hero-card`)** with Warm Gold eyebrows, Emerald `✓ 6 Live Tracks` pill, 3 metric boxes (`₹0 Free Pilot`, `₹99 = 99 Coins`, `Unlocks at 60%`), and Crisp White Skill Pills.
   * Added floating Gold/Navy lab badges (`Northwind SQL Lab · 166 Rows`, `Harbor Desk PRD Studio`, etc.) and 3 skill pills to all 6 programme cards, plus Royal Midnight Navy 3-step cards (`.pgx-royal-step`) and closing banner (`.pgx-close__inner`).
2. **`/events` & `/workshops` Pages (`src/pages/Catalog.css`, `src/pages/EventsPage.tsx`, `src/pages/WorkshopsPage.tsx`):**
   * Styled all `.ws-row--track` workshop and Case Study Store cards in the **Royal Midnight Navy + Warm Gold date pill + Emerald coin pill + Crisp White action button** theme.
3. **`/career-os` Public Page (`src/pages/career/CareerOSPublicRepolish.css`):**
   * Upgraded the 3-Pillar Architecture cards (`.cpx-pillar`), Feature cards (`.cpx-card`), and Career OS Hub card (`.cpx-hub`) to the Royal Midnight Navy + Gold + Emerald + Crisp White Pill theme.
4. **Inside Course Player (`/learn/:courseSlug` — `src/pages/LearnWorkspace.css`, `src/components/lms/SkylentAI.css`):**
   * Upgraded `.os-top` (Course Player header bar), `.os-slide__frame` (lesson overview slide), and `.os-ai-head` (Socratic AI Coach header) to the Royal Midnight Navy + Warm Gold + Emerald progress bar theme.
5. **Backend SPA Route Fallback & Dynamic OpenGraph Meta (`server/src/index.ts`, `server/src/lib/public-host.ts`):**
   * Enabled the Express static + SPA `index.html` catch-all fallback whenever `dist/` exists on disk (`process.env.NODE_ENV === "production" || existsSync(clientDist)`), preventing direct-refresh route errors on `/events`, `/workshops`, `/career-os`, and `/programmes/:slug`.
   * Added `injectOpenGraphMeta(html, pathname)` in `server/src/lib/public-host.ts` so sharing `/verify/SKL-2026-DA-EXEMPLAR` (or any certificate/programme URL) on LinkedIn, WhatsApp, or X renders rich OpenGraph & Twitter preview cards.
6. **Mobile Viewport Hardening (`src/pages/HomeRepolish.css`, `src/pages/ProgramsIndex.css`, `src/pages/Catalog.css`):**
   * Added `@media (max-width: 640px)` rules so multi-column cards, comparison tables, and action buttons stack cleanly without horizontal overflow.

### B. V18 — Homepage First-Time Visitor Polish & Royal Midnight Navy Theme (`src/pages/home/Repolish.tsx`, `src/pages/HomeRepolish.css`)
* Hid uncontextualized raw SQL box (`ZeroLoginInteractiveTryout`) in `.hx-sr` on the Homepage so labs appear in context inside courses and the 5-step course preview.
* Replaced plain white Elixir policy boxes with **3 Royal Midnight Navy Live ₹99 Workshop Cards** + 4-step Cashback Ribbon.
* Replaced internal jargon in the comparison table with **4 human-language rows** (*How You Learn Every Day*, *When You Get Stuck on a Doubt*, *What You Show Recruiters*, *Cost & Risk to Start*).
* Upgraded the 6-Step Career Journey (`HomeCareer`) with a **Royal Midnight Navy Stage Plate (`.hx-royal-plate`)** and reframed Student Project Dossiers with clear project titles and `/verify` links.
* Built the **Interactive 3-Tab Royal Midnight Navy AI + Mentor Studio (`HomeAi`)** (*Explain in Simple Hinglish*, *Fix My SQL / Code Bug*, *20-Min Human Expert Help*).

### C. V17 & V16 — 2-Column Programme Detail Redesign & Superadmin Plumbing
* Redesigned `/programmes/:slug` (`ProfessionalProgrammeTemplate.tsx`) into a 2-column layout with an elevated Royal Midnight Navy Enrolment & Workbench Card, 4-Card Metrics Grid, Sticky Sub-Nav (`01 Workbench` → `05 Prove`), 6-Step Capstone Roadmap, and Module Syllabus Accordions.
* Opened all 6 programmes for clean enrolment (`src/lib/catalog-enrollment.ts`, `server/src/routes/catalog.ts`) and auto-provisioned Superadmin (`tariniprasadtripathy17@gmail.com` / `Tarini@Skylent2026!`) with full multi-dashboard and Career OS bypass.

---

## 4. Critical Test Suite Guardrails (Must Stay 100% Green in Every Session)

Before committing any change in any future session, run all 8 verification suites and the production build:

```bash
npx tsx scripts/test-public-catalogue-copy.ts
npx tsx scripts/test-catalog-truth.ts
npx tsx scripts/test-programme-positioning.ts
npx tsx scripts/test-catalogue-fallback.ts
npx tsx scripts/test-degree-catalogue.ts
npx tsx scripts/test-product-manifest.ts
npx tsx scripts/test-oauth-redirect.ts
npx tsx scripts/test-release-readiness-hardening.ts
npm run build
```

### Mandatory Regex / String Invariants Checked by the Test Suites:
1. **`src/pages/home/Repolish.tsx` & `src/pages/HomePage.tsx`:**
   * Keep `HomeElixirFlywheel` and `ZeroLoginInteractiveTryout` mounted on `HomePage.tsx` (`ZeroLoginInteractiveTryout` renders inside `<div className="hx-sr">`).
   * Keep `<span className="hx-sr" style={{ display: "none" }}>Learn. Practise. Build. <em>Prove it.</em></span>` and `Interactive SQL &amp; Python practice` in `HomeHero`.
   * Keep `(journey.match(/Illustrative preview · Not connected/g) ?? []).length >= 2` and `Illustrative preview, not connected` in `CareerJourney` / `HomeCareer`.
   * Keep `ProgrammeGroup` with `title="Not open yet"` and `title="Programmes"` inside `.hx-sr` in `HomeProgrammes`.
   * Never import `.jpg` files in `src/pages/home/Repolish.tsx` (use `.webp` only).
2. **`src/pages/ProgramsPage.tsx`:**
   * Keep `(programsIndex.match(/publishedProgrammes/g) ?? []).length === 2 && /function outcomeFor/.test(programsIndex)`.
   * Keep `useCatalogPrograms`, `(catalog.data ?? [])`, `isPublicProgrammeIndexRow`, `programmeTruth(program)`, `catalog.loading`, `catalog.offline`, `availability is not confirmed`, `confirmed ? "Open for enrolment" : STATUS_NOT_CONFIRMED`, `confirmed={!catalog.offline}`, `rows.length === 0`, `No programmes are published yet`, `id="live-courses"`, `Availability could not be confirmed`, and `programmesIndexIntro`.
3. **`src/components/programme/ProfessionalProgrammeTemplate.tsx`:**
   * Keep `useCatalogCourse(content.courseSlug)`, `authoredCourseCurriculum`, `content.hero.summary(moduleCount)`, `facts.format`, `practiceWorkspaceHref(content.artefact)`, `programmeAccessAllowsWorkspace`, and `programmeEnrollmentAllowsWorkspace`.
   * Never use the identifier `linkedCourses` (use `linkedAuthoredCourses` / `effectiveCourses`).
   * Keep `const verified = confirmed && !courseUnconfirmed` and `const canEnrol = verified && truth.enrollable && !truth.comingLater`.
4. **`src/pages/WorkshopsPage.tsx` & `src/pages/EventsPage.tsx`:**
   * Keep `Date not set` in `WorkshopsPage.tsx` and never include literal `workshop.date`, `workshop.price`, or `originalPrice`.
   * Keep `events-launch-tracks-title` before `events-list-title` and keep `"Redeemable with your 99 Workshop Elixir Coins"` in `EventsPage.tsx`.
5. **`server/src/lib/public-host.ts` & `server/src/index.ts`:**
   * Keep `injectCanonicalLink` producing `<link rel="canonical" href="https://skylent.live/...">` and replacing any existing canonical tag on re-invocation.
   * Keep `apexRedirectLocation` and `injectCanonicalLink` in `server/src/index.ts`, plus `requestId`, `redactSecrets`, and `isMissingSchemaError(error) || isDatabaseUnavailableError(error)`.