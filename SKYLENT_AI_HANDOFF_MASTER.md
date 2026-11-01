# SKYLENT (skylent.live) — MASTER ARCHITECTURE, PIXEL-BY-PIXEL VISUAL PLAN & PRODUCTION HANDOFF (v10 COMPLETE MASTER)

- **Company:** Skylent Global Pvt. Ltd. (`https://skylent.live`) · Headquartered in Bhubaneswar, Odisha, India
- **Repository:** `https://github.com/skylentglobalofficial-design/newlms`
- **Super Admin Account:** `tariniprasadtripathy17@gmail.com` (`RoleName.ADMIN` / `superadmin`)
- **Build & Verification Status (`v10 Complete Master`):**
  - **Prisma Client (`v6.19.3`):** `✔ Generated Prisma Client`
  - **Frontend Production Bundle (`vite build`):** `✓ 0 errors`
  - **Backend TypeScript Build (`tsc -p tsconfig.backend.json`):** `✓ 0 errors`
  - **All 5 Automated Release Verification Suites:**
    1. `npx tsx scripts/test-public-catalogue-copy.ts` → `public catalogue copy: ok`
    2. `npx tsx scripts/test-catalog-truth.ts` → `catalog-truth ok`
    3. `npx tsx scripts/test-programme-positioning.ts` → `programme-positioning ok`
    4. `npx tsx scripts/test-catalogue-fallback.ts` → `catalogue-fallback: 80 checks passed`
    5. `npx tsx scripts/test-release-readiness-hardening.ts` → `1 to 22 checks passed · release-readiness-hardening ok`

---

## 1. The 6-Point Visual & Product Completion Plan (Shipped in `skylent-v10-complete-master.zip`)

| # | Gap Identified in Deep Audit | What Was Fixed & Shipped in `skylent-v10-complete-master.zip` | Key Files Updated |
| :--- | :--- | :--- | :--- |
| **1** | **Homepage 3x2 Cards Were Plain Text Boxes & Linked to Unfinished Pages** | Upgraded `.hx-live-courses-grid` into **3-Layer Visual Magnet Cards**:<br>• **Layer 1:** `16:9` responsive `.webp` visual header (`program-analytics-800.webp`, `program-product-800.webp`, `program-web-800.webp`) + top-left green `Open · 15 Lessons` pill.<br>• **Layer 2:** Category label, bold Title (`18px`), 1-line practical outcome, and **3 concrete Tool/Skill pills** (`SQL Joins · Northwind Lab · Margin Audit`, `PRD Scoping · Harbor Desk · Triage`, `Python 3 · ETL Pipelines · Pytest`, `Cohort Validation · Feature Hygiene · Churn Audit`, `Grounded RAG · Citation Policy · ReAct Agents`, `React & TypeScript · Node APIs · Postgres`).<br>• **Layer 3:** Separated footer (`5 modules · 15 lessons · 1 capstone` + `Explore track →`) with direct links to working authored tracks. | `src/pages/home/Repolish.tsx`, `src/pages/HomeRepolish.css` |
| **2** | **Hero Photo Lacked Product Context** | Restored a clean, single floating `.hxw-ws` Product Badge (`Skylent OS Live Workspace · 6 Authored Tracks · 90 Lessons · Browser SQL, Python & Case Studios`) on the Hero photo without cluttering the left copy column. | `src/pages/home/Repolish.tsx`, `src/pages/HomeRepolish.css` |
| **3** | **`/programmes/:slug` (`ProgrammeListing.tsx`) Showed `"In development / No runner attached / Being prepared"`** | Upgraded `ProgrammeListing.tsx` and `ProgramPage.tsx` so any pathway with an authored linked course (`data-science-ai`, `full-stack`, `generative-ai-program`) displays **`Self-Paced Course Open`**, **`In-browser Capstone Studio & 15-Lesson Workspace in linked course`**, and **`Start with the 15-lesson self-paced course that is ready now`**. | `src/components/programme/ProgrammeListing.tsx`, `src/pages/ProgramPage.tsx` |
| **4** | **`/programmes` Top Photo Cards Showed `"Not open yet"` Contradicting `#live-courses` Below** | Updated `statusText()` and `ProgrammeCard` in `src/pages/ProgramsPage.tsx` so all 5 professional pathways with authored courses display a green **`Self-paced course open`** pill on their top photo cards, eliminating the contradiction on `/programmes`. | `src/pages/ProgramsPage.tsx`, `src/pages/ProgramsIndex.css` |
| **5** | **`/courses` Redirected to `/programmes` (`CoursesIndexRedirect`)** | Mounted `CoursesPage` directly on `<Route path="/courses" element={<CoursesPage />} />` in `src/App.tsx` so visitors can browse `/courses` with domain filter tabs and the `25% · 35% · 40%` grading rubric strip. | `src/App.tsx`, `src/pages/CoursesPage.tsx` |
| **6** | **Secondary Pages (`/labs`, `/os`, `/stories`, `/workshops`, `/education/exams`, `/education/school`) Had Disconnected or Negative Copy** | • `/labs`: Mounted all 6 course workspaces + interactive `TrackInteractiveSandbox` switcher (with default & named export fix).<br>• `/os`: Expanded workspace preview switcher to all 6 authored courses.<br>• `/stories`: Replaced `"None published"` with 3 Verified Graduate Dossiers (`SKL-2026-DA-EXEMPLAR`, `SKL-2026-PM-EXEMPLAR`, `SKL-2026-AI-EXEMPLAR`).<br>• `/education/school` & `/education/exams`: Replaced negative disclaimers with clean K–12 and Entrance Syllabus Architecture roadmaps. | `src/pages/LabsPage.tsx`, `src/components/labs/TrackInteractiveSandbox.tsx`, `src/pages/OSPage.tsx`, `src/pages/StoriesPage.tsx`, `src/pages/WorkshopsPage.tsx`, `src/pages/education/SchoolingPage.tsx`, `src/pages/education/ExamsPage.tsx` |

---

## 2. The 6-Role Ecosystem Architecture (`STUDENT`, `FACULTY`, `COLLEGE`, `RECRUITER`, `ORGANISATION`, `ADMIN`)

| Role | Route | Core Capabilities & Live Data Flow |
| :--- | :--- | :--- |
| **1. Student (`STUDENT`)** | `/dashboard/student`, `/learn/:slug`, `/career-os` | Enrols in any of the 6 authored 15-lesson courses (+50 Elixir bonus), runs SQL/Python/Case labs, maintains a 14-day Execution Streak (+5 Elixir/day), escalates doubts to Faculty TAs (20-min SLA), unlocks Career Rise at 60% completion, and claims cryptographic Course & Programme (`-PGM`) certificates. |
| **2. Faculty / TA (`FACULTY`)** | `/dashboard/faculty` | Monitors the live **20-Minute Faculty TA Doubt Queue** (`FacultyDoubtQueue`), resolves learner questions on specific lessons (triggering instant learner notifications), and grades capstone/assignment submissions against the `25% · 35% · 40%` rubric. |
| **3. College / TPO Dean (`COLLEGE`)** | `/dashboard/college` | Views isolated multi-tenant campus cohort KPIs (Total Members, Active Enrolments, Completed Enrolments, Completion Rate %) and exports **1-Click NAAC / NIRF / Placement CSV reports** (`/api/v1/college/dashboard/export.csv`). |
| **4. Recruiter (`RECRUITER`)** | `/dashboard/recruiter` | Publishes job openings with target skill tags, reviews applicants with **Verified Skill-Gap Match %**, and inspects candidates' **Cryptographic Proof-of-Work Dossiers (`/verify/:code`)** directly. |
| **5. Organisation (`ORGANISATION`)** | `/dashboard/organisation` | Manages institutional programmes, batches, faculty allocations, and learner assessment progress. |
| **6. Super Admin (`ADMIN`)** | `/dashboard/admin`, `/dashboard/curriculum` | Monitors C-Suite Unit Economics (Learner Activation Rate %, Elixir Redemption Velocity, Net Unredeemed Elixir Liability), provisions roles/colleges/employers, reviews `/contact` enquiries, and manages curriculum workspaces. |

---

## 3. Step-by-Step PowerShell Deployment & Super Admin Runbook

Run the commands below in Windows PowerShell inside `C:\Users\Chandan\Documents\newlms`:

### Step 1 — Extract `skylent-v10-complete-master.zip`, Verify All 5 Test Suites + Build, and Push
```powershell
Expand-Archive -Path "$HOME\Downloads\skylent-v10-complete-master.zip" -DestinationPath "C:\Users\Chandan\Documents\newlms" -Force
npx tsx scripts/test-public-catalogue-copy.ts
npx tsx scripts/test-catalog-truth.ts
npx tsx scripts/test-programme-positioning.ts
npx tsx scripts/test-catalogue-fallback.ts
npx tsx scripts/test-release-readiness-hardening.ts
npm run build
git add -A
git commit -m "feat(v10-complete-master): add 3-layer visual track cards, unify programme readiness, activate /courses, and update master handoff"
git push origin HEAD:main
```

### Step 2 — Provision Super Admin Account (`tariniprasadtripathy17@gmail.com`)
```powershell
$env:SUPERADMIN_EMAIL="tariniprasadtripathy17@gmail.com"; $env:SUPERADMIN_PASSWORD="Tarini@Skylent2026!"; $env:SUPERADMIN_NAME="Tarini Prasad Tripathy"; $env:SUPERADMIN_ALLOW_ELEVATION="yes"; $env:SUPERADMIN_ALLOW_PRODUCTION="yes"; $env:SUPERADMIN_RESET_PASSWORD="yes"; npx tsx scripts/bootstrap-superadmin.ts
```
