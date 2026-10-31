# Skylent Website Development Master Plan (Tonight's Website Deadline)

**Target Website:** `https://skylent.live` (`skylentglobalofficial-design/newlms`)

**Objective:** Implement every category-defining Skylent differentiator directly on the **Website (Public Pages + Learner/College/Career Portals)** first — before social media or sales campaigns begin — so any visitor, student, college dean, or recruiter landing on `skylent.live` experiences the complete Skylent operating system.

## 1. Website Architecture Overview: What Makes `skylent.live` Better Than Every Other EdTech Website

| Website Surface | Route(s) | Primary Target Files | Differentiator vs. Harvard / IIT-IIM / Scaler / AlmaBetter / Coding Ninjas | 
| ----- | ----- | ----- | ----- | 
| **1. Public Homepage** | `/` | `src/pages/HomePage.tsx`, `src/pages/home/Repolish.tsx` | Adds the **₹99 Workshop → 99 Elixir Coins (100% Coin Back) → Case Study Store** acquisition section alongside live SQL (`Northwind`) and PM (`Harbor Desk`) interactive workspace walkthroughs and instant catalogue retry. | 
| **2. Live Workshops & Webinars Hub** | `/events`, `/events/:slug` | `src/pages/EventsPage.tsx`, `src/pages/EventDetailPage.tsx`, `server/src/routes/events.ts` | Shows **+99 Elixir Coins (100% Coin Cashback)** on every session, credits 99 Elixir Coins on registration, and displays the **3 Launch Workshop Tracks + Redeemable Case Study Preview** even when no live date is booked yet. | 
| **3. Student Dashboard & Elixir Case Study Store** | `/dashboard/student` | `src/pages/DashboardStudentPage.tsx`, `src/components/learner/ElixirWallet.tsx`, `server/src/lib/elixir.ts` | Replaces dead "empty dashboard" states with the **Elixir Coins & Case Study Store** (`49`, `49`, `99`, `39` Elixir cases), the **5-Milestone Academic Merit Schedule (`+5` to `+99` Elixir)**, and 1-click **`"Open case →"`** workspace launch. | 
| **4. Lesson & Case Workspace** | `/learn/:slug/:lessonId`, `/projects/:slug` | `src/pages/LearnPage.tsx`, `src/components/product/ProductLanguage.tsx`, `src/components/lms/SkylentAI.tsx`, `src/lib/draft-storage.ts` | Combines **Harvard/IIM-style `BoardroomColdCallCard` decision checkpoints**, **Coding Ninjas-style Socratic Debug & Rubric quick prompts**, server-enforced anti-cheat AI (`policy.ts`), and `sessionStorage` local draft persistence. | 
| **5. Public Credential & Proof-of-Work Verification** | `/verify`, `/verify/:code` | `src/pages/VerifyPage.tsx`, `server/src/routes/skylent/certificates.ts` | Displays official **Credential Issuer (`Skylent Global Pvt. Ltd.`)** and **Verification Standard (`Skylent Verified Skill & Completion Record v1`)** alongside learner name, course, and issue date. | 
| **6. Career OS & Skill-Gap Job Radar** | `/career-os`, `/career/jobs` | `src/pages/career/`, `server/src/routes/career/jobs.ts`, `server/src/lib/career/serializers.ts` | Computes real-time **`skillMatch` (`matchScore%`, `matchedSkills`, `missingSkills`)** from the learner's verified profile and completed projects, gated by the **60% Career Rise module completion threshold**. | 
| **7. Institutional / College B2B Dashboard & Degrees** | `/education`, `/dashboard/college` | `src/pages/EducationPage.tsx`, `src/pages/DashboardCollegePage.tsx`, `server/src/routes/college.ts` | Provides live `/api/v1/degrees` retry control on `/education` and renders a **College Cohort KPI Strip (`Total Members`, `Active Enrolments`, `Completed`, `Completion Rate %`)** on `/dashboard/college`. | 
| **8. Frictionless Auth & Site Assistant** | `/login`, Global Assistant | `src/pages/LoginPage.tsx`, `src/components/skylent/SiteAssistant.tsx`, `server/src/routes/auth.ts` | Pre-checks Google OAuth (`/api/v1/auth/google/status`) and Reva AI (`/api/v1/reva/status`) on mount so visitors never hit raw 503 errors or dead-end chat boxes. | 

## 2. The 5 Website Build Sprints for Tonight's Deadline (Execution Sequence)

### Sprint 1 — Public Homepage (`/`) & Workshop-to-Coin Flywheel Showcase

* **Goal:** Make a first-time visitor understand Skylent's **Learn → Practise → Build Evidence** loop AND the **₹99 Workshop → 99 Elixir Coins → Case Study Store** entry path in under 30 seconds.

* **Exact Website Changes:**

  1. Add the **`HomeElixirFlywheel`** section on `src/pages/home/Repolish.tsx` and render it in `src/pages/HomePage.tsx` showing:

     * **Step 01:** Attend a focused Workshop/Webinar (`/events`) and receive **100% Elixir Coin Cashback (99 Elixir Coins)**.

     * **Step 02:** Spend Elixir Coins in the **Case Study Store** (`Northwind SQL Discount Leakage — 49 Elixir`, `Harbor Desk Weekend Triage — 49 Elixir`, `Enterprise SaaS Churn Teardown — 99 Elixir`).

     * **Step 03:** Complete the practical work inside Skylent's workspace and keep verifiable evidence for **Career OS**.

  2. Keep all truth-guardrails intact (no fabricated placement numbers or fake university partner logos) so all public catalogue copy tests pass 100%.

### Sprint 2 — Live Events & Workshop Funnel Page (`/events` & `/events/:slug`)

* **Goal:** Turn `/events` from a bare list into a high-converting **Workshop & Case-Coin Hub** even when the database has `0` scheduled dates on Day 0.

* **Exact Website Changes:**

  1. On `src/pages/EventsPage.tsx`, add the **"How Workshop Elixir Coins Work (₹99 → 99 Elixir Coins → Unlock Case Studies)"** visual explainer cards and show the **4 Redeemable Case Studies (`49`, `49`, `99`, `39` Elixir)** that learners can unlock in their Student Dashboard.

  2. On `src/pages/EventDetailPage.tsx`, show the `+99 Elixir Coins (100% Coin Back)` badge and, after registration, display a direct **"Go to Elixir Case Study Store →"** CTA linking to `/dashboard/student`.

### Sprint 3 — Student Dashboard (`/dashboard/student`) & Elixir Wallet Merit Schedule UI

* **Goal:** Make the authenticated Student Dashboard feel like a category-leading learning & coin economy hub.

* **Exact Website Changes:**

  1. In `src/components/learner/ElixirWallet.tsx`, display:

     * Current Elixir balance + status badge,

     * The **4 Unlockable Case Studies & Playbooks** with summaries, prices (`39 / 49 / 99 Elixir`), 1-click unlock, and **`"Open case →"`** workspace launch button,

     * Collapsible/inline **"How to Earn Elixir Coins (Verified Merit Schedule)"** table showing `+99 Elixir` (Workshop registration), `+5 Elixir` (Lesson completion), `+10 Elixir` (Quiz `>= 80%`), `+15 Elixir` (Assignment submission), and `+25 Elixir` (Case study completion).

### Sprint 4 — Public Certificate Verification (`/verify`), College Dashboard (`/dashboard/college`) & Career OS Skill-Match UI

* **Goal:** Surface our new backend C-Suite and Proof-of-Work fields directly in the frontend UI.

* **Exact Website Changes:**

  1. **`src/pages/VerifyPage.tsx`:** Display `Issuer: Skylent Global Pvt. Ltd.` and `Standard: Skylent Verified Skill & Completion Record v1` in the verified certificate specification table.

  2. **`src/pages/DashboardCollegePage.tsx`:** Render the `cohortSummary` KPI cards (`Total Members`, `Active Enrolments`, `Completed Enrolments`, `Completion Rate %`) at the top of the College Admin dashboard.

  3. **Career OS Job Cards (`src/pages/career/`):** Render the `skillMatch` badge (`matchScore% skill match`, matched skills, and missing skills) when returned by `/api/v1/career/jobs`.

### Sprint 5 — Full Website Regression Verification & Final Release Bundle

* **Goal:** Ensure 0 regressions across all public copy guards (`test-public-catalogue-copy.ts`), catalogue parity checks, and all 11 sections of `test-release-readiness-hardening.ts`.

* **Exact Deliverables:**

  1. Run AST/Babel compilation across all `.ts` and `.tsx` files (`0` errors) and recompile `server/dist`.

  2. Run `test-public-catalogue-copy.ts`, `test-catalogue-fallback.ts`, `test-certificate-verify.ts`, and `test-release-readiness-hardening.ts`.

  3. Package the complete website + backend changes into `skylent-release-readiness-fixes.patch` and `skylent-release-ready-bundle.zip`.