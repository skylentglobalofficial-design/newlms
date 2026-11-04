# Skylent (skylent.live) — Master Category-King Product Blueprint: The "Simulated Company & Verifiable Work-Experience Engine"

## 1. The Core Problem: Why 99% of EdTech Websites in 2026 Feel Replaceable

In 2026, traditional EdTech platforms—whether high-ticket bootcamps like [Scaler Academy](https://www.scaler.com/academy/), [AlmaBetter](https://www.almabetter.com/), [Newton School](https://www.newtonschool.co/), and [upGrad](https://www.upgrad.com/), or self-paced libraries like [Coursera](https://www.coursera.org/resources/category/skill-assessments) and [DataCamp](https://www.datacamp.com/interactive-learning)—face three structural crises that cosmetic UI tweaks cannot solve:

1. **Lectures and Notes Are Now Free Commodities:** No student wants to pay ₹50,000–₹2,50,000 just to watch recorded videos or read static notes on SQL, Python, Product Management, or AI when LLMs and YouTube explain syntax for free in 5 seconds.

2. **Static Certificates and GitHub Portfolios Are Dead for Hiring:** Hiring managers and technical recruiters no longer trust course completion PDFs or GitHub repositories because any candidate can generate a polished full-stack or ML project using AI coding assistants in 10 minutes without understanding a single trade-off.

3. **The "Day-1 Job Shock" & Tier-2/3 Communication Wall:** A student who scores 100% on clean, toy coding exercises freezes on Day 1 of a real job when handed a messy 10-table database with duplicate rows, broken webhooks, and an urgent Slack message from a VP asking for a 5-bullet root-cause decision memo in crisp English.

## 2. The Master Product Idea: Skylent Is NOT a "Course Website"—It Is India's First "Simulated Company & Verifiable Work-Experience Engine"

To build an untouchable product that no competitor can copy and no student, college dean, or recruiter can ignore, Skylent locks in a single, category-defining product thesis:

> **Don't enroll in a passive course. Join the Skylent Simulated Enterprise Workspace—solve real production incidents, defend your trade-offs in Boardroom Cold Calls, get Red-Line reviewed by human faculty in <20 minutes, and graduate with a Cryptographic Execution Flight Recorder that unlocks direct 15-minute job auditions.**

| Dimension | Traditional EdTech ([Scaler](https://www.scaler.com/academy/), [AlmaBetter](https://www.almabetter.com/), [Coursera](https://www.coursera.org/)) | Skylent Category-King Product (`skylent.live`) | 
| ----- | ----- | ----- | 
| **Core Identity** | Online Classroom / Video & Quiz Library | **Simulated Tech & Product Company (`Work-Experience OS`)** | 
| **What the Learner Joins** | "Module 1, Lesson 1" | **4-Sprint Simulated Job Rotation** inside clean-room enterprise divisions (`Northwind Commerce`, `Harbor Desk SaaS`, `FinGrid UPI Switch`, `BazaarKart Logistics`, `PulseAI`) | 
| **How Practice Works** | Clean, pre-sanitized toy tables & fill-in-the-blank syntax | **Friday 4 PM Production Incident Simulator** (messy data, returned-order revenue leaks, schema drift, latency bottlenecks) | 
| **How AI Cheating Is Stopped** | Honor code or multiple-choice quizzes | **Mandatory 3-Question Boardroom Cold Call + Socratic Stress-Test** (must defend *"What breaks if traffic 5x's or NULLs spike?"* before unlocking submission) | 
| **How Feedback Works** | Automated pass/fail or delayed ticket | **20-Minute SLA Human Faculty "Red-Line Diff Review"** (Version 1 Draft -> Faculty Inline Critique -> Version 2 Shipped Artifact) | 
| **What the Recruiter Sees** | Static PDF Certificate + Resume | **Execution Flight Recorder (`/verify/:code`)** built on [1EdTech Open Badges 3.0](https://www.1edtech.org/standards/open-badges) showing sandbox iterations, V1->V2 Red-Line Diff, and a **15-Minute Job Micro-Audition Score** | 
| **What the College Dean Gets** | Generic vendor MOU | **Turnkey [NEP 2020 Academic Bank of Credits (ABC)](https://www.abc.gov.in/) & NAAC Skill-Credit Ledger** mapping every 15-lesson track to 2–4 verifiable academic credits | 

## 3. The 5 Interlocking Product Engines (Zero Half-Measures, End-to-End Architecture)

### Engine 1: The "Simulated Company Sprint" (Inside `/programmes/:slug`, `/courses/:slug`, and `/learn/:courseSlug`)

Instead of presenting lessons as dry academic chapters, every Skylent track operates as a **4-Sprint Junior-to-Senior Role Simulation**:

1. **Sprint 01 — System Onboarding & Data/Product Audit (Lessons 1–4):**

   * The learner receives an **Executive Briefing Ticket** (e.g., *"Northwind's Q3 board deck overstates net revenue by 14% because returned orders and discount tiers were aggregated naively. Audit the 166-row transaction table and isolate the exact leakage"*).

   * **First 3 Lessons + Live Browser Sandbox are ₹0 Free Pilot** so every learner experiences a real company sprint before paying a rupee.

2. **Sprint 02 — Chaos & Edge-Case Incident Resolution (Lessons 5–8):**

   * The sandbox injects realistic production anomalies: duplicate transaction IDs, NULL customer segments, skewed distribution outliers, or conflicting stakeholder feature requests in `Harbor Desk`.

   * The learner writes the SQL query, Python script, prompt evaluation pipeline, or PRD triage matrix directly in the browser (`NorthwindLabPage.tsx` / `TrackInteractiveSandbox.tsx`) and passes **12 deterministic automated assertions**.

3. **Sprint 03 — The Dual-Register Socratic Coach & Boardroom Cold Call (Lessons 9–12):**

   * **Think in Simple Hinglish, Ship in Boardroom English:** Whenever a learner is stuck on a complex concept, 1-click **Hinglish First-Principles Intuition** (`SkylentAI.tsx`) explains the mental model in natural Hinglish without leaking the answer.

   * Once the code/query works, the learner faces the **Boardroom Cold Call**: a timed, role-specific executive challenge (*"Your VP of Finance asks why you excluded pending returns from Q3 gross margin. Defend your metric choice in 3 sentences"*), graded on **Quantification, Trade-Off Clarity, and Executive English**.

4. **Sprint 04 — The 20-Minute Faculty Red-Line Review & Capstone Sign-Off (Lessons 13–15):**

   * The learner submits their **Version 1 (V1) Executive Capstone Memo + Code Pack**.

   * Within the **20-Minute Faculty TA SLA**, an instructor reviews the work against a 4-dimension rubric and returns a **Red-Line Diff Critique**.

   * The learner ships **Version 2 (V2)** addressing the critique. Both V1 and V2 are permanently recorded in the learner's cryptographic dossier to prove **coachability and real human iteration**.

### Engine 2: The "Execution Flight Recorder & Red-Line Diff Dossier" (`/verify/:code` — Built on [1EdTech Open Badges 3.0](https://www.1edtech.org/standards/open-badges) & [W3C Verifiable Credentials](https://www.pok.tech/en/digital-credentials/open-badge-3-0))

Why do recruiters ignore conventional EdTech certificates? Because a certificate only says *"Completed Course"*—it hides **how** the work was done. Skylent transforms `/verify/:code` (`VerifyPage.tsx`) into an **Engineering & Product Flight Recorder**:

| Flight Recorder Panel on `/verify/:code` | What It Proves to a Technical Recruiter or Hiring Manager | Why AI Copy-Pasters Cannot Fake It | 
| ----- | ----- | ----- | 
| **1. Sandbox Execution Telemetry** | Displays verified metrics: `34 Sandbox Runs · 12/12 Edge-Case Assertions Passed · 14-Day Active Proof-of-Work Streak`. | Tracks progressive debugging across real browser lab sessions rather than a single pasted file upload. | 
| **2. V1 -> V2 Faculty Red-Line Diff** | Side-by-side view of the learner's initial submission (`V1`), the Faculty Reviewer's specific critique, and the learner's refined final artifact (`V2`). | Proves how the candidate responds to senior engineering/product code review in a real team environment. | 
| **3. Boardroom Cold Call Defense Log** | Displays the exact executive trade-off prompt the learner faced and their verified response score (`88/100 · Above 84% of Cohort`). | Proves the candidate understands *why* their solution works under changing business constraints. | 
| **4. Open Badges 3.0 / W3C VC JSON-LD Payload** | 1-click expandable cryptographic credential inspector (`@context: https://www.w3.org/ns/credentials/v2`, issuer DID, SHA-256 evidence digest). | Machine-verifiable by enterprise HRIS, LinkedIn, and background-verification systems. | 

### Engine 3: The "15-Minute Reverse Job Audition" (`/career-os/jobs` & `/dashboard/recruiter`)

Instead of competing with Naukri or LinkedIn as a passive job board where 500 students spam PDF resumes, **Skylent Career OS replaces the PDF resume with a 15-Minute Role Micro-Audition**:

1. **Deterministic Skill-Gap Match (`computeJobSkillMatch`):** Every published role shows the learner their exact match score (`e.g., 86% Skill Match · 6/7 Verified Skills Proven in Labs`) and which specific Skylent module unlocks the missing 14%.

2. **15-Minute Work-Sample Micro-Audition:** To apply for a partner role (`Data Analyst`, `ML Engineer`, `Associate PM`, `Full-Stack Engineer`), the candidate completes a **15-minute role-specific micro-simulation** bound to that job (e.g., *Debug a 12-line retention SQL query* or *Prioritize 3 hotfix tickets under a 2-engineer sprint cap*).

3. **Recruiter Shortlist Terminal (`/dashboard/recruiter`):** Hiring partners log in and see candidates ranked by **`Verified Skill Match % + Micro-Audition Score + Flight Recorder Dossier Link`**—cutting recruiter screening time from 3 weeks to 15 minutes.

### Engine 4: The "Turnkey NEP 2020 / Academic Bank of Credits (ABC) & NAAC Ledger" (`/dashboard/college`, `/institutions`, `/universities`)

Under the Government of India's [National Education Policy (NEP) 2020 Academic Bank of Credits (ABC)](https://www.abc.gov.in/) and [APAAR ID framework](https://www.pib.gov.in/FactsheetDetails.aspx?Id=150693&reg=3&lang=1), autonomous colleges and universities must integrate practical, credit-bearing industry skill labs and maintain auditable outcome records for NAAC/NBA accreditation:

1. **NCrF Credit Equivalency Mapping:** Every 15-lesson Skylent course + graded capstone maps cleanly to **2 to 4 NCrF-aligned Skill Credits** (45–60 notional hours of guided instruction, browser lab execution, and rubric assessment).

2. **1-Click Dean & TPO Command Center (`/dashboard/college`):** College principals, HODs, and TPOs see real-time cohort telemetry (`Active Students`, `Lab Assertions Passed`, `20-Min Doubt SLA Compliance`, `Verified Capstones Minted`, `Career OS Placement Shortlists`) and export a **NAAC / ABC Audit-Ready CSV & Dossier Pack** in one click.

### Engine 5: The "₹99 -> 99 Elixir Coin Zero-CAC Flywheel" (`/events`, `/workshops`, `ElixirWallet.tsx`)

High customer acquisition cost (CAC) destroys traditional Indian EdTech unit economics. Skylent's **Elixir Flywheel** turns marketing into a self-liquidating product trial:

1. **Weekend ₹99 Live Incident Workshop:** A student pays ₹99 to attend a 3-hour weekend live sprint (e.g., *Fix a Live E-Commerce Revenue Dashboard in SQL*) and immediately receives **99 Elixir Coins (100% value credited back)** in their Skylent Wallet.

2. **Earn Elixir Through Execution Streaks:** Completing daily lessons, passing Boardroom Cold Calls on the first attempt, and maintaining a **14-Day Proof-of-Work Streak** mints bonus Elixir Coins (`+25 to +100 Elixir`).

3. **Redeem Elixir in the Case Study Store & Full Programme Scholarships:** Learners spend Elixir Coins to unlock premium Clean-Room Industry Case Packs or apply accumulated Elixir toward their Full Programme Certificate Track.

## 4. How Every Page on `skylent.live` Connects Into This Single Cohesive Story (Visual & UX Architecture)

| Page / Route | Its Exact Role in the "Simulated Company & Work-Experience" Architecture | Visual & UX Standard (Royal Midnight Navy + Crisp White System) | 
| ----- | ----- | ----- | 
| **1. Homepage (`/`)** | **Fold 1–2:** Clear Direction & Trust (`Learn. Practise. Build. Prove it.`) + Visual Stage Preview (no intimidating code clutter in Fold 1–2). **Fold 3–5:** 4-Sprint Simulated Company Journey + 6 Flagship Career Programmes + Institutional NEP 2020 Credit Ribbon. | Crisp White Canvas (`#ffffff`) + Royal Midnight Navy Hero Cards (`#11152c -> #1d1849`) + Warm Gold (`#fbbf24`) + Emerald (`#34d399`). | 
| **2. Programmes (`/programmes/:slug`)** | Shows the **4-Sprint Simulated Job Rotation**, Capstone Deliverable Studio, **Faculty Reviewer & 20-Min SLA Standard**, **Sample Red-Line Critique Diff**, and **Transparent Track Comparison (`₹0 Free Pilot` vs. `Full Certificate Track`)**. | 2-Column Asymmetric Layout with Sticky Right Enrolment Card + Sticky Subnav + Floating Mobile/Scroll CTA. | 
| **3. Courses (`/courses/:slug`)** | Shows the 15-lesson Sprint Outline with **Lesson-Level Time & Lab Tags** (`25m`, `⚡ Browser Lab`, `🛡️ Cold Call Check`, `📝 Graded Capstone`) and a **2-Column Sticky Course Workspace Card**. | Unified with `/programmes/:slug` in the Royal Midnight Navy + Warm Gold 2-column system. | 
| **4. Stories (`/stories`)** | Replaces generic text quotes with **Verified Learner Proof-of-Work Dossiers** (`SKL-2026-DA-00142`, `SKL-2026-PM-00089`, `SKL-2026-PY-00214`) showing real SQL/PRD excerpts, V1->V2 faculty red-line diffs, and 1-click `/verify` links. | Upgraded from legacy beige paper (`pe-page`) into Crisp White + Royal Midnight Navy Dossier Cards. | 
| **5. Universities & Institutions (`/universities`, `/institutions`)** | Pitches the **Turnkey NEP 2020 / Academic Bank of Credits (ABC) & NAAC Skill-Credit Engine** to Vice-Chancellors, Deans, and Autonomous Colleges. | Unified in the Royal Midnight Navy + Warm Gold institutional theme with NCrF credit mapping tables. | 
| **6. Certificate Verifier (`/verify/:code`)** | Renders the **Visual Cryptographic Diploma** + **Execution Flight Recorder (Sandbox Telemetry, V1->V2 Faculty Red-Line Diff, Boardroom Cold Call Defense, and Open Badges 3.0 JSON-LD Inspector)**. | High-contrast Royal Midnight Navy & Gold Credential Seal + Interactive Telemetry Inspector. | 
| **7. All 6 Signed-In Dashboards (`/dashboard/student`, `college`, `faculty`, `recruiter`, `org`, `admin`)** | Seamless multi-role operating system accessible via the **`★ SUPERADMIN · SWITCH VIEW`** sidebar: Student Sprint Workspace, Faculty 20-Min SLA Grading Queue, College NEP 2020 / ABC Command Center, Recruiter Micro-Audition Terminal, Org L&D, and Admin C-Suite Telemetry. | Every single dashboard topped with a signature **Royal Midnight Navy + Warm Gold Command Hero** and real-time KPI cards. | 

## 5. Intellectual Property & 100% Copyright-Safe Guarantee

1. **100% Original Clean-Room Enterprise Simulations:** All datasets, SQL schemas, product backlogs, and incident briefs (`Northwind Traders`, `Harbor Desk`, `BazaarKart Logistics`, `FinGrid UPI Switch`) are synthetically generated by Skylent's own codebase. Zero third-party dataset scraping, zero Harvard Business School PDF copying, and zero unauthorized corporate trademark usage.

2. **Protected Under the Idea–Expression Dichotomy ([Indian Copyright Act, 1957, Section 13](https://pdfs.semanticscholar.org/ad08/102d4a06696166f20b72b6149f721a3401b8.pdf)):** Functional mechanics (simulated sprints, red-line diffs, execution telemetry, skill-match scoring, and coin flywheels) are uncopyrightable methods of operation, while Skylent's specific code, visual trade dress (`Royal Midnight Navy + Warm Gold`), and authored content are 100% original intellectual property of **Skylent Global Pvt. Ltd.**

3. **Aligned With Royalty-Free Global & Government Standards:** Credential metadata follows [1EdTech Open Badges 3.0](https://www.1edtech.org/standards/open-badges) and [W3C Verifiable Credentials](https://www.pok.tech/en/digital-credentials/open-badge-3-0), and university credit mapping aligns with the Government of India's [Academic Bank of Credits (ABC) / NCrF framework](https://www.abc.gov.in/).

---

## 6. Critical Founder Recheck & Stress-Test of Every Pillar (Where It Could Fail & How We Bulletproofed It)

Before switching the entire platform to the `Work-Trial OS` positioning, each of the 5 pillars was stress-tested against real Indian operational constraints (solo/lean founder bandwidth, night-time student activity, non-coder anxiety, and recruiter attention spans):

| Pillar | Operational Risk Discovered During Recheck | How V23 Bulletproofs the Product (Zero-Failure Architecture) |
| :--- | :--- | :--- |
| **1. Simulated Company Sprints** | **Beginner Shock Risk:** If Lesson 1 drops a fresher straight into a complex broken production database, non-coders and Tier-2/3 beginners may feel intimidated and quit. | **Graduated 3-Stage Ramp:** Lessons 1–3 (`₹0 Free Pilot`) run in **"Guided Co-Pilot Onboarding Mode"** (starter query/template is pre-filled; learner changes 1 filter to win their first `+10 Elixir`). Full **"Friday 4 PM Chaos Incident Mode"** activates in Module 2 & 3 once confidence is locked. |
| **2. 20-Minute Faculty Red-Line SLA** | **2:00 AM IST Bottleneck:** Students often study at 1:30 AM. If a learner submits V1 at 2:00 AM and waits 7 hours for a human TA, the `"<20-Minute SLA"` promise feels broken. | **2-Tier Hybrid Red-Line Engine:** **Tier 1 (Instant `<15 sec` Pre-Flight Rubric Audit):** Automated deterministic checks + Socratic coach immediately highlight missing edge cases on V1 (`returned = 'no'`, unquantified PRD metric). **Tier 2 (`<20m Live TA Window, 9 AM – 11 PM IST`):** Human Faculty Reviewer signs off on the V1 → V2 Red-Line Diff. |
| **3. Execution Flight Recorder (`/verify/:code`)** | **Recruiter 8-Second Scan Limit:** HR screeners spend 6–8 seconds on a certificate link; if `/verify` looks like a dense wall of logs, non-technical HR will miss the point. | **2-Layer Visual Hierarchy on `/verify`:** **Top Layer (For HR in 5 Seconds):** Visual Cryptographic Diploma + 3 high-contrast Gold/Emerald cards (`01 Sandbox Telemetry`, `02 V1 → V2 Red-Line Diff`, `03 Cold Call Defense`). **Bottom Layer (For Tech Leads):** Deep artifact metrics and W3C / Open Badges 3.0 proof. |
| **4. 15-Minute Reverse Job Auditions (`/career-os`)** | **Recruiter Setup Friction:** Busy startup founders and HR managers will not manually author a custom 15-minute test just to post a job on a new platform. | **Zero-Setup Auto-Bound Role Auditions:** When a recruiter posts a role (`Data Analyst`, `ML Engineer`, `Associate PM`, `Full-Stack`), Skylent automatically binds the matching **Pre-Built 15-Minute Skylent Work-Sample Check** based on the role's skill tags. |
| **5. NEP 2020 / ABC College Credit Ledger (`/dashboard/college`)** | **Autonomous vs. Affiliated College Bureaucracy:** Autonomous colleges can approve 2–4 skill credits immediately, whereas state-university-affiliated colleges cannot alter university credit transcripts mid-semester. | **Dual Institutional Mode:** **Mode A (Autonomous Colleges & Universities):** 2–4 NCrF / ABC Credit Equivalency Ledger. **Mode B (Affiliated Engineering & Degree Colleges):** Turnkey **NAAC Criterion-1 / Criterion-5 Value-Added Lab & Placement Readiness Audit Pack** (zero university senate delay!). |

---

## 7. Screen-by-Screen Visual Presentation Spec ("How the Entire Website Looks in V23")

Every single public page and all 6 signed-in role dashboards now share **one unified visual architecture**:

1. **Public Homepage (`/`):**
   - **Fold 1 (Hero):** Crisp White Canvas + Left-side High-Contrast Headline (`Learn. Practise. Build. Prove it.`) + Right-side Interactive `HeroStagePreview` card (no intimidating raw code editor in Fold 1–2).
   - **Fold 2–4:** 4-Stage Learning Pipeline + Royal Midnight Navy Persona Cards + Interactive 4-Tab Workspace Preview (`Course Lesson` -> `Browser Lab` -> `Graded Project` -> `Verified Certificate`).
   - **Fold 5–7:** 6 Flagship Career Programmes (Royal Midnight Navy top banners + Pure White skill pills) + University NEP 2020 Pathways + ₹99 Workshop (`100% Elixir Coin Back`) Flywheel.
2. **Flagship Programme Pages (`/programmes/:slug`):**
   - **Top Band:** 2-Column Asymmetric Layout with Sticky Right **Royal Midnight Navy Enrolment Card (`₹0 Free Pilot`)** + 4-Cell Metric Bar (`Duration`, `15 Lessons`, `Browser Lab`, `Verified Dossier`).
   - **Sticky Subnav:** `Overview` · `Capstone` · `Curriculum` · `Practice Lab` · `Verification` · `Career OS`.
   - **NEW V22/V23 Authority Band (`#pp-review-standard`):** Royal Midnight Navy **Simulated Company Sprint & 20-Min Faculty Red-Line Review Standard** (`Step 1: ₹0 Free Pilot` -> `Step 2: V1 → V2 Red-Line Faculty SLA` -> `Step 3: Career OS & Elixir Offset`).
3. **Self-Paced Course Pages (`/courses/:slug`):**
   - **Top Band:** 2-Column Layout with right-side **Royal Midnight Navy Course Workspace Card** (`Status`, `Level`, `15 Lessons`, `Quizzes & Capstone`) + Royal Midnight Navy Interactive Sandbox Launch Banner + 15-Lesson Outline.
4. **Stories (`/stories`) & Universities (`/universities`):**
   - **Upgraded from legacy beige paper to Crisp White + Royal Midnight Navy:** `/stories` showcases **3 Clickable Execution Flight Recorder Dossiers (`SKL-2026-DA-00142`, `SKL-2026-PM-00089`, `SKL-2026-PY-00214`)**, and `/universities` showcases the **NEP 2020 / ABC 2–4 Skill-Credit & NAAC Audit Matrix**.
5. **Public Certificate Verifier (`/verify` & `/verify/:code`):**
   - **Top:** Cryptographic Diploma Preview (`SKYLENT GLOBAL PVT. LTD.`).
   - **Middle (NEW V22/V23):** Royal Midnight Navy **Execution Flight Recorder (`01 Sandbox Telemetry`, `02 V1 → V2 Red-Line Diff`, `03 Cold Call Defense` · Open Badges 3.0 & W3C VC Ready)**.
   - **Bottom:** Clickable Public Exemplar Proof-of-Work Gallery with 1-click LinkedIn verification share.
6. **All 6 Signed-In Dashboards (`/dashboard/student`, `faculty`, `college`, `recruiter`, `org`, `admin`):**
   - Controlled via the left-sidebar **`★ SUPERADMIN · SWITCH VIEW`** 6-pill switcher.
   - **Every single dashboard** now opens with a signature **Royal Midnight Navy + Warm Gold + Emerald Command Hero**:
     - `Student`: `Continue Learning` Hero + 14-Day Proof-of-Work Activity Grid + Collapsible Elixir Case Store + Live Socratic AI Coach.
     - `Faculty TA`: `20-Min Doubt SLA & V1 → V2 Red-Line Grading Command Center`.
     - `College`: `NEP 2020 · Academic Bank of Credits (ABC) & NAAC Cohort Command Center` + 1-click CSV Export.
     - `Recruiter`: `Recruiter Talent Terminal · 15-Min Role Micro-Auditions & Flight Recorder Verifier`.
     - `Org L&D`: `Organisation & Enterprise L&D Command Center`.
     - `Admin OS`: `Superadmin C-Suite Command OS · CEO / CFO / CCRO / CAO Telemetry`.

