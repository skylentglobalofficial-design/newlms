# Skylent Global — Complete C-Suite Category-Leader Master Blueprint (CEO • CPO • CTO • CMO • CAO • CCRO • CFO)

**Company:** Skylent Global Pvt. Ltd. (`https://skylent.live`)  
**Repository & Release Branch:** `skylentglobalofficial-design/newlms` (`release/skylent-readiness-2026-10-30`)  
**Core Product & Business Flywheel:**  
`₹99 Live Workshop → 99 Elixir Coins (100% Coin Cashback) → Unlock Interactive Case Studies → Solve in SQL / PM / Code Labs → Build Verified Proof-of-Work Dossier → Enrol in Flagship Programmes & Unlock Career OS`

## 1. CEO (Chief Executive Officer) Charter — Category Vision, Competitive Moat & Zero-to-One Strategy

### 1.1 The Market Gap Skylent Owns
Every education and EdTech institution today forces students and colleges into a broken compromise:
- **Academic Giants ([Harvard Business School Online](https://www.quora.com/Which-is-the-best-online-courses-where-I-could-get-a-certificate-in-Business-analytics), [IIT Madras BS / IIT Kanpur E&ICT / IIM Calcutta](https://collegedunia.com/courses/data-science), [NPTEL](https://crescent.education/dr-g-kannan-ece/))** command high academic trust and case-method rigor, but rely on passive video/PDF portals, slow curriculum cycles, and zero integrated browser labs or direct recruiter work-evidence pipelines.
- **High-Ticket Bootcamps ([Scaler Academy](https://www.quora.com/What-is-your-review-about-Scaler-Data-Science-and-Machine-Learning-Course), [AlmaBetter](https://logicmojo.com/affordable-scaler-academy-alternatives/), [Masai / Newton School](https://blog.securis.in/fund-coding-bootcamp-india/))** offer structured practice and placement cells (`AlmaX`), but charge `₹2,00,000–₹4,00,000` (or 17% × 36-month ISAs) and still hand recruiters static PDF resumes.
- **Mass Coding Platforms ([Coding Ninjas](https://www.quora.com/Does-Coding-Ninjas-really-have-a-100-placement-guarantee), [Crio.do](https://blog.securis.in/fund-coding-bootcamp-india/), [Coursera](https://collegedunia.com/courses/data-science))** offer `₹40,000–₹1,50,000` courses and fast TA doubt support, but suffer from rampant assignment copy-pasting that devalues completion certificates.

### 1.2 CEO Strategic Decision: How Skylent Wins from Day 0
1. **Zero-Friction Entry (`₹99 Workshop = 99 Elixir Coins`):** Instead of spending `₹25,000+` in cold sales CAC to convince a skeptical learner to buy a high-ticket course, Skylent acquires learners through high-energy **₹99 Live Workshops** where the learner gets **100% (99 Elixir Coins) back** in their Skylent Wallet immediately upon registration (`server/src/lib/elixir.ts`, `server/src/routes/events.ts`).
2. **Product-Led Conversion via Case Studies:** Learners spend those **99 Elixir Coins** inside Skylent's **Case Study Store** (`GET /api/v1/elixir/resources`) to unlock real interactive business and data cases (*Northwind SQL Margin Leakage — 49 Elixir*, *Harbor Desk PM Triage Spec — 49 Elixir*, *Enterprise B2B SaaS Churn Teardown — 99 Elixir*).
3. **Proof-of-Work Over Hype:** Every SQL query executed, case memo written, and faculty-graded assignment is stored in a single relational chain (`Course` → `CurriculumNode` → `LabWork` / `LearnerProject` → `CareerProject` → `SkylentCertificate`), turning Skylent into India's most trusted **Skill-Evidence Operating System**.

### 1.3 Head-to-Head Competitive Matrix

| Dimension | Harvard Online (CORe) & IIM Exec Ed | IIT Online Degrees (IITM BS / NPTEL) | Scaler Academy (`₹3.5L–₹4L`) | AlmaBetter (`₹2L–₹3L` / AlmaX) | Coding Ninjas (`₹40K–₹1L`) | Skylent (`skylent.live` Live Architecture) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Day-0 Acquisition Hook** | High-fee application (`$2.5K–$50K`) ([Review](https://www.quora.com/Which-is-the-best-online-courses-where-I-could-get-a-certificate-in-Business-analytics)) | Qualifier exam (`₹20K–₹2.6L`) ([Benchmark](https://collegedunia.com/courses/data-science)) | Free masterclass → `₹3.5L` sales call ([Benchmark](https://blog.securis.in/fund-coding-bootcamp-india/)) | Free masterclass → `₹2L+` ISA ([Benchmark](https://blog.securis.in/fund-coding-bootcamp-india/)) | Discounted batch upsell ([Review](https://www.quora.com/Does-Coding-Ninjas-really-have-a-100-placement-guarantee)) | **₹99 Workshop → 99 Elixir Coins (100% Coin Back) → Instant Case Study Unlock** (`server/src/lib/elixir.ts`) |
| **Core Learning & Case Pedagogy** | Protagonist case dilemmas & cold calls | Video lectures + weekly MCQs | Live classes + daily homework ([Review](https://www.quora.com/What-is-your-review-about-Scaler-Data-Science-and-Machine-Learning-Course)) | Cohort classes + capstones | Recorded + live coding batches | **Harvard-Style `BoardroomColdCallCard` + Sequential Unlock + Lesson-Bound SQL/Case Labs** (`ProductLanguage.tsx`) |
| **Academic Integrity & AI Tutor** | Honor code + peer review | Proctored exam centers ([NPTEL](https://crescent.education/dr-g-kannan-ece/)) | Contest plagiarism checks | Competency tests | High assignment copy-paste risk ([Review](https://www.quora.com/Does-Coding-Ninjas-really-have-a-100-placement-guarantee)) | **Server-Enforced Socratic AI Guard (`skylent-ai/policy.ts`) + Context Debug/Rubric Prompts (`SkylentAI.tsx`)** |
| **Career & Placement Engine** | Alumni directory | Degree placement cell | 8 mock interviews + referrals ([Review](https://www.quora.com/What-is-your-review-about-Scaler-Data-Science-and-Machine-Learning-Course)) | `AlmaX` competency gate ([Comparison](https://logicmojo.com/affordable-scaler-academy-alternatives/)) | Placement cell + Hirist ([Review](https://www.quora.com/Does-Coding-Ninjas-really-have-a-100-placement-guarantee)) | **`Career Rise` (`>= 60%` module gate) + `computeJobSkillMatch` Radar + Verified Project-to-Career Evidence** |
| **College B2B Multi-Tenancy** | Enterprise seats | SWAYAM chapters ([NPTEL](https://crescent.education/dr-g-kannan-ece/)) | Scaler Neovarsity | B2C focused | Campus chapters | **Isolated `College` Tenant Dashboard with `computeCollegeCohortSummary` (`server/src/routes/college.ts`)** |

## 2. CMO / CGO (Chief Marketing & Growth Officer) Charter — The Zero-to-One Viral Acquisition Funnel

### 2.1 Why "₹99 Workshop = 99 Elixir Coins" Wins When Starting from Zero
- **Eliminates Buyer Hesitation:** At `₹99`, a college student or early-career professional experiences zero financial risk, especially when `/events` and `/events/:slug` explicitly guarantee **`+99 Elixir Coins (100% Coin Cashback)`**.
- **Immediate Sunk-Value Activation:** Once a learner has **99 Elixir Coins** sitting in their `ElixirWalletPanel` (`/dashboard/student`), behavioral economics (endowment effect) drives them to spend those coins in the **Case Study Store** rather than letting them sit idle.
- **Built-In Two-Step Purchase Psychology (`49 + 49 = 98 Elixir` or `99 Elixir`):**
  - *Option A:* Spend `49 Elixir` on **Northwind Margin & Discount Leakage Case Study** (`data-analytics`) + `49 Elixir` on **Harbor Desk Weekend Exception Queue PRD Case** (`product-management`) = `98 Elixir` spent (`1 Elixir` remaining).
  - *Option B:* Spend `99 Elixir` on the flagship **Enterprise B2B SaaS Onboarding & Churn Case Study** (`product-management`).
  - *Option C:* Spend `39 Elixir` on **E-Commerce SQL Cohort & Retention Playbook** (`60 Elixir` remaining — motivating the learner to complete lessons/quizzes to earn `+5` to `+25` more Elixir or attend a second workshop!).

### 2.2 Campus & Community Growth Loops
- **College Workshop Chapters:** Partner with college coding/analytics clubs to host a weekend ₹99 Skylent Case Challenge; every participating student gets 99 Elixir Coins, unlocks a Skylent Case Study, and generates a shareable Skylent Proof-of-Work link.
- **Honest Public Funnel Controls:** Homepage (`HomePage.tsx`), Degrees (`EducationPage.tsx`), and Events (`EventsPage.tsx`) all include instant `"Try again"` retry controls and honest availability badges so paid traffic never hits a dead end.

## 3. CPO (Chief Product Officer) Charter — End-to-End Product Architecture & User Journeys

### 3.1 The 6-Stage Product Loop Implemented in `newlms`
1. **Stage 1 — Discover & Register (`/`, `/programmes`, `/courses`, `/events`):**
   - Visitors inspect real curriculum modules, transparent availability, and upcoming workshops showing `+99 Elixir Coins (100% Coin Back)`.
2. **Stage 2 — Authenticate Frictionlessly (`/login`, `/reset-password`):**
   - `LoginPage.tsx` pre-checks `GET /api/v1/auth/google/status` so unconfigured Google OAuth is cleanly disabled with guidance to sign in via email, while browser navigations to `/api/v1/auth/google` redirect cleanly to `/login?error=oauth_not_configured`.
3. **Stage 3 — Redeem Elixir Coins in the Case Study Store (`src/components/learner/ElixirWallet.tsx`):**
   - Learners view their Elixir balance, inspect the 4 pre-loaded Case Studies & Playbooks (`STARTER_ELIXIR_CASE_STUDIES`), unlock them in one click (`POST /api/v1/elixir/resources/:slug/purchase`), and click **`"Open case →"`** (`/learn/:courseSlug/:lessonKey`).
4. **Stage 4 — Engage in Harvard Cold-Calls & Socratic AI (`/learn/:slug/:lessonId`):**
   - Above the lesson text, `LessonContextPanel` renders the interactive **`BoardroomColdCallCard`** (`src/components/product/ProductLanguage.tsx`), challenging the learner to commit to a business/analytical decision before reading the solution.
   - Inside `SkylentAI.tsx`, context-aware Socratic quick buttons (**`"Debug my SQL logic"`** for Data Analytics, **`"Check rubric criteria"`** for Assignments) provide instant coaching without leaking assessment answers.
5. **Stage 5 — Practise, Save Locally & Submit Work (`ProjectsPage.tsx`, `PracticeWorkspacePanel.tsx`, `LearnPage.tsx`):**
   - Every keystroke across Project reflections (`finding / whyItMatters / recommendation`), Practice workspaces, and Course Assignments is persisted to browser `sessionStorage` (`src/lib/draft-storage.ts`) with race-condition-safe server reconciliation (`reconcileProjectReflectionDraft`, `reconcilePracticeTextDraft`, `reconcileAssignmentDraft`).
6. **Stage 6 — Verify Credentials & Unlock Career OS (`/verify/:code`, `/career-os`):**
   - Completing all course lessons issues a verifiable `SKL-YYYY-...` credential (`issuer: "Skylent Global Pvt. Ltd."`, `credentialStandard: "Skylent Verified Skill & Completion Record v1"`).
   - Completing `>= 60%` of taught modules unlocks **`Career Rise`**, and completed projects convert into **`Career OS`** evidence matched against open jobs via `computeJobSkillMatch`.

## 4. CAO (Chief Academic Officer) Charter — Pedagogy, Assessment Rigor & Merit Schedule

### 4.1 Academic Integrity & Grading Standards
- **Sequential Mastery:** Lessons unlock strictly in order (`assertLessonUnlocked`); opening a lesson records `lastAccessedNodeId` without falsely marking `completedAt`.
- **Attempt-Capped Server-Scored Quizzes:** Quiz answers are never sent to the browser before submission; attempts are capped by `CurriculumNode.maxAttempts`, and detailed explanations (`QuizQuestion.explanation`) unlock only after passing.
- **Assigned Faculty Rubric Grading:** Written assignments (`AssignmentProgress`) support `"draft"`, `"submitted"`, and `"graded"` states (`grade`, `feedback`, `gradedById`, `gradedAt`). Both `"submitted"` and `"graded"` states preserve lesson completion (`server/src/lib/lms.ts`, `server/src/routes/lms.ts`) so faculty grading never regresses student progress.

### 4.2 Verified Academic Elixir Merit Schedule (`VERIFIED_ACADEMIC_ELIXIR_SCHEDULE`)

| Activity Code | Academic / Workshop Milestone | Elixir Awarded | Verification & Anti-Gaming Rule |
| :--- | :--- | :--- | :--- |
| `workshop_99_cashback` | ₹99 Live Workshop / Webinar Registration | **99 Elixir** | Idempotent 1:1 cashback (`workshop-cashback:userId:eventId`) |
| `lesson_complete` | Verified Lesson Completion | **5 Elixir** | Awarded once per unlocked lesson (`learn:userId:lesson_complete:nodeId`) |
| `quiz_score` | Module Quiz High Score (`>= 80%`) | **10 Elixir** | Server-scored quiz attempt meeting `quizScorePercent >= 80` |
| `assignment_complete` | Written Case / Assignment Submission | **15 Elixir** | Verified submission of course assignment |
| `case_study_complete` | Elixir Case Study Completion | **25 Elixir** | Completion of a lesson linked to a published `case_study` resource |

## 5. CTO & CISO (Chief Technology & Security Officer) Charter — Architecture, Resilience & Release Engineering

### 5.1 Production Hardening Completed Across All 66 Modified Files
- **100% Route & Schema Resilience (`server/src/routes/**`):** All **27** backend route modules (**199** route handlers) wrap async operations in `try / catch` and map `isMissingSchemaError(error) || isDatabaseUnavailableError(error)` to structured HTTP `503` JSON (`code: "unavailable"`).
- **Liveness vs. Readiness Separation (`server/src/routes/health.ts`):**
  - `GET /api/v1/health/live` returns `200 { status: "ok", live: true, version, uptimeSeconds }` without touching Postgres.
  - `GET /api/v1/health/ready` and `GET /api/v1/health` verify Postgres reachability and all 19 Prisma migrations (`8` September + `11` October 2026).
- **Fail-Safe Session Security (`server/src/lib/auth.ts`):** `resolveSession` requests `mustChangePassword: true` by default when `readSchemaCapabilities()` fails transiently so forced password resets cannot be bypassed on the October schema, retries once without `mustChangePassword` on `P2022` (September schema), and fails closed (`null`) if a non-DB capability error occurs without `mustChangePassword` present.
- **Correlation IDs & Secret Redaction (`server/src/lib/env.ts`, `server/src/lib/security-middleware.ts`):** Every response carries an `X-Request-Id` header, and `redactSecrets()` strips database passwords, API keys, and session secrets before any error log is written.

## 6. CCRO (Chief Career & B2B Revenue Officer) Charter — Employer Pipeline & College OS

### 6.1 Career OS & Automated Skill-Gap Job Matching (`server/src/routes/career/jobs.ts`)
- Every open job returned by `GET /api/v1/career/jobs` and `GET /api/v1/career/jobs/:idOrSlug` for an authenticated learner automatically computes `skillMatch: computeJobSkillMatch(job.skills, learnerSkills)` by combining the learner's `CareerProfile.skills` and verified `CareerProject.skills`:
  - `matchScore`: `0–100%` match percentage
  - `matchedSkills`: verified skills the learner already has
  - `missingSkills`: exact skill gaps to close next in Skylent courses

### 6.2 Multi-Tenant College & University OS (`server/src/routes/college.ts`)
- `GET /api/v1/college/dashboard` enforces strict tenant isolation (`COLLEGE_ADMIN` sees only their college's members and enrolments) and computes `cohortSummary: computeCollegeCohortSummary(totalMembers, enrolments)`:
  - `totalMembers`, `totalEnrolments`, `activeEnrolments`, `completedEnrolments`, and `completionRatePercent`.

## 7. CFO & COO (Chief Financial & Operating Officer) Charter — Unit Economics & Ledger Controls

### 7.1 Real-Time Executive Unit Economics (`server/src/routes/admin-platform.ts`)
- `GET /api/v1/admin/reports` (restricted to `superadmin`) now computes `unitEconomics: computeExecutiveUnitEconomics(...)`:
  - **`activationRatePercent`:** `enrolments / users` conversion efficiency.
  - **`elixirRedemptionRatePercent`:** `elixirSpent / elixirIssued` (measures how effectively Workshop & Merit Elixir coins convert into Case Study unlocks).
  - **`netUnredeemedElixirLiability`:** `max(0, issued - spent - unrecovered)` so finance always knows the exact outstanding coin balance across the platform.
- **Clawback-Safe Refund Accounting (`server/src/lib/elixir.ts`):** `refundVerifiedPayment` automatically reverses unspent Elixir and records any already-spent portion as `unrecovered` without ever driving a learner's wallet balance negative.