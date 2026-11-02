# SKYLENT (skylent.live) — MASTER ARCHITECTURE, GLOBAL EDTECH BENCHMARK & PRODUCTION RELEASE RUNBOOK

- **Company:** Skylent Global Pvt. Ltd. (`https://skylent.live`)
- **Repository:** `https://github.com/skylentglobalofficial-design/newlms`
- **Live Production Branch & Commit Chain:** `main` (`1f1f4f3` → `166c93e` → `7d0e07a` → `adeeb44` → `8a9f848` → `a70dc0b` + Check 22 & Humanized Release)
- **Production Build Status:**
  - **Prisma Client (`v6.19.3`):** Generated in 373ms
  - **Frontend Production Bundle (`vite build`):** 338 modules transformed in 1.19s · 0 errors
  - **Backend TypeScript Build (`tsc -p tsconfig.backend.json`):** 0 errors
  - **All 5 Verification Test Suites:** 100% Passed (Release readiness checks 1–22 all green)


---

---

## 0B. Visual Alignment Across Screenshots 1–7 (Unified Image-6 Card Grid + Images 4 & 5 Real Workbench Stage)

| Screenshot Issue Reported by Operator | Root Cause | Exact Visual Fix Shipped |
| :--- | :--- | :--- |
| **Screenshot 1 (`image_6136f7.jpg`) & Screenshot 7 (`image_613332.jpg`) — Empty White Space on `/programmes`** | `.pgx-intro__inner` had `max-width: 760px` leaving the right half of the header empty, and `Open now` only had 2 stock-photo cards in a 3-column grid (leaving the 3rd column completely blank). | Converted `.pgx-intro` into a 2-column `.pgx-intro__split` header with an **Execution Standard** summary card on the right, and unified all 6 programme tracks into a single **3x2 grid (6 cards = 2 full rows of 3 cards, zero empty white holes)**. |
| **Screenshot 2 (`image_6136b5.jpg`) vs Screenshot 6 (`image_613336.jpg`) & Screenshot 7 (`image_613332.jpg`) — Duplicate Section & Card Style** | `/programmes` had two separate card lists (`Open now` / `Pathways` stock-photo cards at the top, plus a duplicate `Individual courses` list at the bottom), while the **Screenshot 6 architectural card style** looked much cleaner on the outside than Screenshot 7. | Removed the duplicate bottom list and promoted the **Screenshot 6 Architectural Card Design** (`Flagship programme | Open for enrolment | Northwind SQL Lab · 166 Rows | 5 modules · 15 lessons · 3 quizzes · 1 capstone` + Category Kicker + Bold Title + 3 Skill Pills) to be the single unified card grid on `/programmes`, where every card links directly to `/programmes/:slug`. |
| **Screenshot 3 (`image_613677.jpg`) vs Screenshots 4 & 5 (`image_61363e.jpg`, `image_613622.jpg`) — Real Inside Page Design** | `/programmes/data-analytics-pro` (Screenshots 4 & 5) had the 2-tone display headline, 3-column ruled spec bar (`ENROLMENT | FORMAT | YOU START WITH`), and the **full-bleed Dark-Violet Workbench Stage (`sky-stage sky-band-navy pp-stage`)**, whereas `/programmes/data-science-ai`, `/programmes/full-stack`, `/programmes/generative-ai-program`, and `/courses/:slug` (Screenshot 3) lacked that dark-violet workbench stage. | Added the **Screenshots 4 & 5 2-Tone Display Hero + 3-Column Ruled Spec Bar + Full-Bleed Dark-Violet Workbench Stage** to `ProgrammeListing.tsx` AND embedded the **Full-Bleed Dark-Violet Workbench Stage** right below the hero on `CourseDetailPage.tsx`. |

---

## 0A. Complete Programme, Degree & Anti-AI Copy Overhaul (Latest Release)

| Surface / File | What Looked "Half-Cut" or AI-Heavy Before | How It Is Fixed Now |
| :--- | :--- | :--- |
| **All Programme Detail Pages (`src/components/programme/ProgrammeListing.tsx`)** | `/programmes/data-science-ai`, `/programmes/full-stack`, `/programmes/generative-ai-program`, and `/programmes/sql-certificate` only showed a top "At a glance" box and stopped halfway with `"This programme is being prepared"`. | Upgraded `ProgrammeListing.tsx` to render the **complete 4-section Flagship Programme Experience**: `01 Included Flagship Coursework`, `02 Curriculum Architecture` (all 5 modules & 15 lessons pulled directly from `src/data.ts`), `03 Capstone Studio & 4-Step Execution Plan`, and `04 Target Career Roles & Proof-of-Work Dossier`. |
| **Programmes Catalogue (`src/pages/ProgramsPage.tsx`)** | Top programme cards lacked lab specs, module counts, and skill tags, and pathways showed a grey `"Not open yet"` badge despite having live 15-lesson courses. | Every programme card now displays its **Lab Environment Badge** (`Northwind SQL Lab · 166 Rows`, `Harbor Desk Studio`, `SQL + Python Dual Track`, `React, Node & PostgreSQL`, `Grounded RAG`), `5 modules · 15 lessons · 3 quizzes · 1 capstone` strip, 3 skill tags, and green `"Self-paced track open"` badges. |
| **All 4 Degree Pathways (`src/lib/degrees.ts`, `CampusDegreeView.tsx`, `OnlineDegreeView.tsx`, `EducationPage.tsx`)** | `fromStaticRoute()` left `duration`, `intake`, `eligibility`, `curriculum`, `tools`, and `careerRoles` undefined, causing `"Shared in the partner university syllabus"` to repeat 8–10 times per page and showing `"Placeholder question / Answer option A, B, C, D"` on Online Degrees. | Populated complete 3–4 year / 2-year NEP-aligned semester curricula, duration, intake windows, eligibility criteria, lab stacks, and target career roles across all 4 degree routes; replaced placeholder slide/exam text on `OnlineDegreeView.tsx` with a real Unit Margin tutorial and analytical scenario checkpoint. |
| **Homepage, Courses & Labs Copy Diet (`Repolish.tsx`, `CourseDetailPage.tsx`, `CoursesPage.tsx`, `LabsPage.tsx`)** | Verbose 25-word AI sentences and grading rubric strip buried at the bottom of `CourseDetailPage.tsx`. | Trimmed lead paragraphs by 50% into crisp 8–10 word human product lines and moved `.cat-rubric-strip` (`25% · 35% · 40%`) directly into the Hero section above the fold on `/courses/:slug`. |

---

## 1. Kya Hua Hai (What Has Been Built & Shipped Across P0–P16)

Across the entire development lifecycle, Skylent has evolved from an unhardened prototype into an enterprise-grade execution and career operating system:

| Milestone / Layer | What Was Built, Hardened & Shipped | Verification Status |
| :--- | :--- | :--- |
| **Backend Architecture & Database (P0–P2)** | All 27 backend route modules wrapped in try/catch + 503 database-unavailable fallback guards. Supabase session pooler connection limit capped to 3 with 20s timeout. Auto-healing additive database migration guard (`ensureNovemberAdditiveTables`) on boot. Dual health probes: `/health/live` (process alive) vs `/health/ready` (DB ready). | **100% Complete** |
| **Monetization & Flywheel (P3–P4)** | Universal Elixir Economy: `₹99 Workshop = 99 Elixir Coins` (100% cashback flywheel). Case Study Store allowing redemption of 49 or 99 Elixir for real industry teardowns. Header Elixir Wallet & live notification center (`HeaderWalletAndNotifications.tsx`). | **100% Complete** |
| **Proof-of-Work Verification (P5–P7)** | Cryptographic verification engine on `/verify/:code`. Full Proof-of-Work Dossier showing raw SQL submissions, PRD artifacts, and rubric criteria. 3 Public Exemplar Dossiers (`SKL-2026-DA-EXEMPLAR`, `SKL-2026-PM-EXEMPLAR`, `SKL-2026-AI-EXEMPLAR`) with 1-click LinkedIn and Recruiter sharing. | **100% Complete** |
| **In-Browser Execution Sandboxes (P8–P10)** | 6-Track interactive browser workspaces: Northwind SQL (166 rows), Harbor Desk PRD Studio, Python ETL Pipeline sandbox, Data Science Churn Cohort validator, GenAI Grounded RAG evaluator, and Full-Stack Idempotent Ledger studio. All 90 lessons, quizzes, and rubrics authored. Cloudflare R2 object storage integration. | **100% Complete** |
| **Discovery, Telemetry & Socratic AI (P11–P16)** | Interactive Homepage Workspace preview (`ZeroLoginInteractiveTryout`). 90-Second Live Skill Diagnostic & Percentile Benchmark on `/path`. 14-Day Proof-of-Work Activity Heatmap on Student Dashboard. Socratic AI Coach with 20-minute human Faculty TA SLA and 1-click Hinglish intuition mode. | **100% Complete** |
| **Site-Wide Humanization & Visual Polish** | Purged all AI-slop, robotic tech marketing buzzwords, and emoji clutter across all 10 public pages. Light architectural headers for course cards. Collapsible diagnostic for above-the-fold visibility. Resilient `TrackInteractiveSandbox` export for zero-break builds. | **100% Complete** |

---

## 2. Exhaustive A-to-Z Global & Indian EdTech Comparison

Where does Skylent stand against the entire competitive landscape? Here is the granular tier-by-tier benchmark:

| Competitor Tier | Key Benchmarked Platforms | What They Do Well (Their Strengths) | What They Lack / Their Weaknesses | How Skylent Outperforms Them |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Global Elite Institutes** | Harvard HBS Online, MIT xPRO, Oxford Saïd, Stanford Online, IIT Madras BS, IIM Ahmedabad e-PGP | • Global brand prestige and CV pedigree.<br>• Harvard case method and high-stakes cold calls.<br>• Rigorous grading standards. | • Extremely expensive ($1,500 to $10,000+ / ₹1.5L–₹8L).<br>• Rigid academic schedules with slow batch cycles.<br>• Zero real-time in-browser SQL/code sandboxes (mostly reading PDFs & video lectures).<br>• Slow manual grading turnaround (weeks). | • **Harvard-Style Case Cold Calls + MIT Rubric Strips** built directly into browser workspaces.<br>• Instant automated row-level code execution + 20-min human TA SLA.<br>• 100x lower cost barrier. |
| **Tier 2: Global MOOC & Video Giants** | Coursera, edX, Udemy, Skillshare, Pluralsight | • Massive catalogue breadth (thousands of courses).<br>• Enterprise brand partnerships (Google, Meta, IBM).<br>• High organic search traffic and global SEO dominance. | • Abysmal completion rates (<8%).<br>• Passive video watching with zero accountability.<br>• Superficial multiple-choice quizzes that can be easily guessed.<br>• Discussion forums are graveyards (no guaranteed doubt SLA).<br>• Certificates are generic attendance PDFs that recruiters ignore. | • **Execution-First Standard:** No certificate is issued without defending capstones and code in real sandboxes.<br>• **20-Min Faculty TA SLA:** Zero unanswered doubts.<br>• **Cryptographic Dossiers:** Employers see actual code, query diffs, and rubrics on `/verify/:code`. |
| **Tier 3: Indian High-Ticket Bootcamps** | Scaler Academy, upGrad, AlmaBetter, Newton School, Masai School, Coding Ninjas | • Aggressive sales funnels and heavy influencer marketing.<br>• Live Zoom cohorts and scheduled peer webinars.<br>• High placement marketing recall in Tier 2/3 Indian colleges. | • Predatory ISA contracts and ₹1.5L–₹3.5L NBFC debt traps.<br>• 200+ students per Zoom lecture with minimal individual attention.<br>• Unverified placement claims that lead to consumer dissatisfaction.<br>• High operational overhead and sky-high CAC. | • **Zero Debt Traps:** Self-paced micro-entry starting at ₹99 with 100% cashback into Elixir coins.<br>• **Merit-Gated Career Rise:** Progression based on actual performance (60% milestone gate), not financial leverage.<br>• Public proof-of-work that speaks louder than placement marketing. |
| **Tier 4: Tech & Developer Sandboxes** | LeetCode, HackerRank, CodeSignal, DataCamp, StrataScratch, DataLemur | • Fast in-browser code execution and automated test runners.<br>• Addictive competitive rank and algorithmic puzzles.<br>• Strong adoption for tech screening rounds. | • Isolated algorithmic puzzles that bear zero resemblance to real workplace product engineering.<br>• No business context, revenue trade-offs, or stakeholder communication.<br>• Zero executive decision-making or PRD writing. | • **Context-Rich Real Workspaces:** Instead of synthetic puzzles, learners audit real datasets (166-row Northwind orders, Harbor Desk support tickets).<br>• Combines hard code execution with executive boardroom trade-offs. |

---

## 3. Kya Acha Hai (Skylent's Genuine Competitive Moats)

Skylent currently possesses 5 distinct moats that no competitor offers in a unified platform:

1. **In-Browser Execution Without Local Setup:**
   Learners query a live PostgreSQL/SQLite retail database (Northwind) and run Python ETL pipelines directly in the browser—eliminating Docker, local DB setup, and environment friction.
2. **The 60-Second Timed Boardroom Cold Call:**
   Bridges the fatal gap between junior coders and senior leaders. Students must defend tactical business trade-offs (e.g., triage vs speed) under real time constraints and benchmark against peer cohort percentiles.
3. **Transparent 3-Tier Rubric Strips:**
   Every course adheres to an explicit grading contract: **25% Concept Checks · 35% Applied Written Briefs · 40% Capstone Studio Defense**. Zero hidden grading surprises.
4. **Public Proof-of-Work Dossiers (`/verify/:code`):**
   Instead of a vanity certificate image, recruiters can inspect the student's exact query outputs, executive PRDs, and faculty rubric breakdowns with 1-click verification.
5. **Universal Elixir Flywheel (100% Cashback Entry):**
   A ₹99 entry workshop gives learners 99 Elixir coins to spend in the Case Study Store. This collapses customer acquisition cost (CAC) while building an active, motivated learner base.

---

## 4. Honest Gap Analysis (Kya Kami Hai Humare Paas Right Now)

To be completely objective, Skylent must acknowledge and address 4 real gaps to reach the undisputed #1 spot:

1. **Catalogue Breadth:**
   - *Current State:* Skylent has 6 deeply authored flagship tracks (Data Analytics, Product Management, Python, Data Science & AI, GenAI, Full-Stack Web).
   - *The Gap:* Platforms like Coursera or Udemy offer hundreds of sub-niches (e.g., DevOps, Cybersecurity, UI/UX, Cloud Architecture).
2. **Mobile App Presence:**
   - *Current State:* 100% responsive web app and PWA, but no standalone native APK on Google Play Store or iOS App Store.
   - *The Gap:* Tier 2/3 Indian students frequently prefer native mobile notifications and offline video/notes caching.
3. **Alumni Social Proof & Review Volume:**
   - *Current State:* 3 exemplar dossiers (`SKL-2026-*-EXEMPLAR`) and initial student cohorts.
   - *The Gap:* Established bootcamps showcase thousands of video testimonials and LinkedIn placement badges.
4. **Automated ATS / Employer Pipeline Integrations:**
   - *Current State:* `/dashboard/recruiter` exists with direct dossier verification.
   - *The Gap:* Direct webhook/API exports into ATS platforms like Greenhouse, Lever, or Workday are not yet wired.

---

## 5. Strategic 5-Pillar Playbook: How Skylent Reaches #1

Here is the exact tactical playbook to outperform both global MOOCs and Indian bootcamps:

1. **The "Proof-of-Work" Standard (Kill the Traditional Resume):**
   Run marketing campaigns encouraging students to put their Skylent dossier link directly on their LinkedIn header and resume. When recruiters see live executable code and graded rubrics rather than bullet points, Skylent becomes the default hiring filter.
2. **The Socratic Hinglish Moat:**
   Double down on bilingual technical intuition. Indian learners often understand complex data and system architecture 10x faster when explained in first-principles Hinglish before writing production English briefs. No US-based platform can replicate this culturally grounded pedagogy.
3. **Expand the ₹99 Workshop Engine:**
   Run weekly ₹99 weekend live workshops across colleges. Because every student receives 100% cashback in Elixir coins to unlock case studies, they are immediately onboarded into the core platform without friction.
4. **College & University B2B SaaS (CCRO Dashboard):**
   Partner with Tier 2 and Tier 3 engineering and management colleges as their accredited practical lab partner. The College Portal (`/dashboard/college`) enables deans and placement heads to track real student skill percentiles and export CSV reports for accreditation compliance.
5. **Continuous Browser Studio Expansion:**
   Continue adding pre-configured environments (e.g., Docker container simulations, REST API testing, and live BI dashboards) so that Skylent is recognized as the ultimate browser operating system for tech learning.

---

## 6. Step-by-Step Command Execution Runbook

To apply the latest humanized package with all 22 verified checks green, run the following steps in Windows PowerShell:

### Step 1: Extract Latest Humanized Release
```powershell
$LatestZip = Get-ChildItem "$HOME\Downloads\skylent-*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Host "Extracting: $($LatestZip.FullName)" -ForegroundColor Cyan
Expand-Archive -Path $LatestZip.FullName -DestinationPath "C:\Users\Chandan\Documents\newlms" -Force
```
*Expected Outcome:* Replaces all 25 updated files with guaranteed `TrackInteractiveSandbox` export and verified Socratic Hinglish prompts.

### Step 2: Run Full Release Readiness Test Suite
```powershell
npx tsx scripts/test-release-readiness-hardening.ts
```
*Expected Outcome:* All 22/22 checks pass cleanly, ending with `release-readiness-hardening ok`.

### Step 3: Verify Zero-Error Production Build
```powershell
npm run build
```
*Expected Outcome:*
- `✔ Generated Prisma Client (v6.19.3)`
- `✓ 338 modules transformed · built in ~1.2s` (Frontend: 0 errors)
- `> tsc -p tsconfig.backend.json` (Backend: 0 errors)

### Step 4: Commit & Push to Production
```powershell
git add -A
git commit -m "feat(release): update master benchmark handoff and verify all 22 release hardening checks"
git push origin HEAD:main
```
*Expected Outcome:* Pushes cleanly to GitHub `origin/main`, triggering Render's automated cloud build and updating `https://skylent.live` with zero downtime.
