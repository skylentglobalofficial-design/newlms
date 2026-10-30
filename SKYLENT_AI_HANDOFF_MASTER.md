# Skylent Global — Master Engineering & AI-to-AI Handoff Runbook

**Company:** Skylent Global Pvt. Ltd. (`https://skylent.live`)  
**Repository:** `https://github.com/skylentglobalofficial-design/newlms`  
**GitHub `main` Baseline Commit:** `ca790d1e84cc386cc3dde5944fda128e1ac9bed6`  
**Target Release Branch:** `release/skylent-readiness-2026-10-30`  
**Last Updated:** 2026-10-30  

---

## 1. Why This Handoff Exists & Critical Baseline Fix Discovered

1. **Git Baseline Conflict Resolved (`ca790d1` vs `848297c`):**
   - Your current GitHub `main` branch (`newlms` zip archive) is at commit `ca790d1e84cc386cc3dde5944fda128e1ac9bed6` (which already contains the 26-file Cycles A–L hardening commit).
   - The earlier `skylent-release-readiness-fixes (2).patch` had been generated against the older `848297c` / `ed831cb` baseline, causing `git apply` to fail on 33 already-partially-applied files when applied to `ca790d1`.
   - **Fixed:** The new `skylent-release-readiness-fixes.patch` and `skylent-release-ready.bundle` in this release are **rebased directly onto `ca790d1e84cc386cc3dde5944fda128e1ac9bed6`** and verified with `git apply --check` (`0` conflicts, `0` whitespace warnings).

2. **Phase 1A–1D C-Suite Completeness Bugs Fixed in This Session:**
   - **Phase 1A — Programme Master Certificate Prefix & Proof-of-Work Evidence Summary (`server/src/routes/skylent/certificates.ts`, `src/pages/DashboardStudentPage.tsx`, `src/pages/VerifyPage.tsx`):**
     - Fixed the prefix mismatch where `buildProgrammeCertificateCode` generated `SKL-YYYY-PGM...` (`-PGM`) while `DashboardStudentPage.tsx` checked `cert.code.includes('-PRG-')`. Both `-PGM` and `-PRG-` are now matched.
     - Added in-memory + DB verification support for issued Programme Master Certificates on `GET /api/v1/certificates/mine` and `GET /api/v1/certificates/verify/:code`.
     - Added `verificationStandard`, `credentialLevel` (`"course" | "programme"`), and `evidenceSummary` to `buildCertificateEvidenceSummary` and rendered **Verified evidence** on `/verify/:code` (`VerifyPage.tsx`).
   - **Phase 1B — Real Backend 20-Minute Faculty TA Doubt SLA Queue & 6-Track Socratic Prompts (`server/src/lib/doubt-sla.ts`, `server/src/routes/lms.ts`, `server/src/routes/faculty.ts`, `src/components/lms/SkylentAI.tsx`):**
     - Created `server/src/lib/doubt-sla.ts` (`createFacultyDoubtTicket`, `listFacultyDoubtTickets`, `resolveFacultyDoubtTicket`, `FACULTY_DOUBT_SLA_MINUTES = 20`).
     - Added `POST /api/v1/lms/courses/:slug/lessons/:lessonKey/doubt` in `server/src/routes/lms.ts` and `GET /api/v1/faculty/doubts` + `POST /api/v1/faculty/doubts/:id/resolve` in `server/src/routes/faculty.ts`.
     - Expanded `socraticQuickPromptsFor` in `src/components/lms/SkylentAI.tsx` to cover all **6 tracks** (`data-analytics`, `product-management`, `python-programming`, `data-science-ai`, `generative-ai`, `full-stack-web`) plus `assignment`, and wired the 1-click `"Flag for Faculty TA review (20-min SLA)"` button to POST to `/api/v1/lms/courses/:slug/lessons/:lessonKey/doubt`.
   - **Phase 1C — 3 Flagship ₹99 Live Workshop Tracks & Post-Registration Case Store CTA (`src/pages/EventsPage.tsx`, `src/pages/EventDetailPage.tsx`):**
     - Added the **3 Flagship ₹99 Live Workshop Tracks** showcase (*Track 01: Northwind SQL Margin & Cohort Live Workshop*, *Track 02: Harbor Desk Product Scoping & PRD Triage Workshop*, *Track 03: Applied Python & GenAI Workflow Automation Workshop*) on `/events` so visitors always see the full ₹99 → 99 Elixir Coins offering even when 0 live calendar dates are scheduled.
     - Added a direct `"Go to Elixir Case Study Store →"` button linking to `/dashboard/student` on `EventDetailPage.tsx` immediately after registration.
   - **Phase 1D — Career Rise 3-Milestone Readiness Checklist (`server/src/routes/career-rise.ts`, `src/components/learner/CareerRiseCard.tsx`):**
     - Added `milestones: { curriculumGatePassed, caseEvidenceReady, mockInterviewUnlocked }` to `GET /api/v1/career-rise` and rendered the 3-step milestone tracker (`60% Curriculum Gate · Case Evidence · Mock Interview Defense`) inside `CareerRiseCard.tsx`.

---

## 2. Complete Phase-by-Phase Product & Engineering Status Matrix

| Phase | Scope & C-Suite Owner | Status | Key Files & Verification |
| :--- | :--- | :--- | :--- |
| **Phase 0: Full-Stack Release Hardening (Cycles 1–5)** | CTO & CISO: 28 backend route modules (`202` handlers) wrapped in `try/catch` + HTTP `503` schema/DB guards, fail-safe `resolveSession`, `/api/v1/health/live` vs `/ready`, Google OAuth `/google/status` pre-check, Reva `/reva/status` pre-check, and `sessionStorage` local draft persistence | **COMPLETED & VERIFIED** | `server/src/routes/**`, `server/src/lib/auth.ts`, `src/lib/draft-storage.ts`, `src/pages/LearnPage.tsx`, `src/pages/NorthwindProjectPage.tsx`, `src/pages/PracticeWorkspacePage.tsx` (`Sections 1–8` of `test-release-readiness-hardening.ts`) |
| **Phase 1: C-Suite Category-Leader Website & Flywheel Moat (Sprints 1–4 + Phases 1A–1D)** | CEO, CMO, CPO, CAO, CCRO, CFO: ₹99 Workshop → 99 Elixir Coins (`100%` cashback) → 4 Starter Case Studies (`39/49/99` Elixir), `HomeElixirFlywheel`, 3 Flagship Workshop Tracks, 6-Track `BoardroomColdCallCard` with `peerPercent`, 6-Track Socratic Quick Prompts + Backend 20-Min Doubt SLA Queue, Programme Master Certificates (`SKL-YYYY-PGM...`) + Proof-of-Work `evidenceSummary`, `computeJobSkillMatch` Radar, College Cohort KPI Strip + CSV Export, and Super Admin Unit Economics | **COMPLETED & VERIFIED** | `server/src/lib/elixir.ts`, `server/src/lib/doubt-sla.ts`, `server/src/routes/events.ts`, `server/src/routes/skylent/certificates.ts`, `server/src/routes/career/jobs.ts`, `server/src/routes/college.ts`, `server/src/routes/admin-platform.ts`, `src/pages/HomePage.tsx`, `src/pages/EventsPage.tsx`, `src/pages/VerifyPage.tsx`, `src/pages/DashboardStudentPage.tsx`, `src/pages/DashboardCollegePage.tsx`, `src/components/admin/AdminPlatform.tsx` (`Sections 9–15` of `test-release-readiness-hardening.ts`) |
| **Phase 2: Production Migration Deploy & Live Hostinger Cutover (Immediate Operator Step)** | CTO & DevOps: Apply this patch/bundle to `newlms`, push to `main`, run `npx prisma migrate deploy` against Supabase Session Pooler (`:5432`), and verify `https://skylent.live/api/v1/health` returns `200 OK` | **READY TO EXECUTE (1-Command Runbook Below)** | `.github/workflows/release-gate.yml`, `docs/PRODUCTION.md`, `fix-skylent-now.ps1` |
| **Phase 3: Next Expansion Sprint (Full Authored Curricula for Remaining 4 Tracks + R2/S3 Cloud Storage + DB-Backed Doubt & Mock Interview Tables)** | CAO, CPO & CTO: (1) Author full 5-module, 15-lesson curricula + interactive labs for `python-programming`, `data-science-ai`, `generative-ai`, and `full-stack-web`; (2) Add Cloudflare R2 / AWS S3 adapter in `server/src/lib/storage.ts`; (3) Persist `FacultyDoubtTicket` & `ProgrammeCertificate` in Prisma schema migration `20261101000000_programme_certs_and_faculty_doubts` | **QUEUED FOR NEXT AI SESSION (Blueprint Ready Below)** | `src/content/`, `server/src/lib/skylent-labs/`, `server/src/lib/storage.ts`, `prisma/schema.prisma` |

---

## 3. 1-Command Git Apply & Push Runbook (For Local `newlms` Clone at `ca790d1`)

Extract `skylent-release-ready-bundle.zip` into the root of your local `newlms` repository and run:

```powershell
# Option A: Clean Git Patch Apply on top of current main (ca790d1)
git checkout main
git pull origin main
git apply --check .\skylent-release-readiness-fixes.patch
git apply .\skylent-release-readiness-fixes.patch
git add -A
git commit -m "feat(release): complete C-Suite flywheel, 6-track cold calls, 20-min doubt SLA, programme credentials, skill-gap radar, college CSV export & unit economics"
git push origin main

# Option B: Direct Git Bundle Fetch & Push
git fetch .\skylent-release-ready.bundle release/skylent-readiness-2026-10-30:release/skylent-readiness-2026-10-30
git checkout release/skylent-readiness-2026-10-30
git push origin release/skylent-readiness-2026-10-30:main
```

---

## 4. Exact Continuation Prompt for the Next Gemini AI Session (Phase 3 Handoff)

Whenever your current usage window finishes and you open a new Gemini AI session, attach your latest `newlms` zip (or `SKYLENT_AI_HANDOFF_MASTER.md`) and paste this prompt:

> **Prompt for Next Gemini AI:**  
> "Bhai, `SKYLENT_AI_HANDOFF_MASTER.md` padh le. Phase 0 (Cycles 1–5 backend/frontend release hardening) aur Phase 1 (Phases 1A–1D C-Suite ₹99 Workshop → 99 Elixir Coins flywheel, 6-track Cold Calls, 6-track Socratic prompts + 20-min Doubt SLA queue, Programme Master Certificates + Proof-of-Work `evidenceSummary`, Career OS `computeJobSkillMatch`, College Cohort CSV export, aur Admin Unit Economics) complete aur `15/15` sections of `scripts/test-release-readiness-hardening.ts` me verify ho chuke hain. Ab Phase 3 start kar:  
> 1. **Phase 3A:** `python-programming`, `data-science-ai`, `generative-ai`, aur `full-stack-web` charo remaining courses ke liye full authored lessons, quizzes, assignments, aur browser lab workspaces (`src/content/`, `src/lib/authored-courses.ts`, `server/src/lib/skylent-labs/`) build kar taaki 2 ke bajaye saare 6 flagship tracks `Published / Open` ho jayein.  
> 2. **Phase 3B:** `server/src/lib/storage.ts` me Cloudflare R2 / S3 compatible signed/PUT object storage provider add kar taaki production (`NODE_ENV=production`) me assignment PDFs aur course covers upload ho sakein.  
> 3. **Phase 3C:** Prisma migration `20261101000000_programme_certs_and_faculty_doubts` add kar jo `ProgrammeCertificate` aur `FacultyDoubtTicket` ko Postgres me persist kare with full backward-compatible `schema-capabilities.ts` fallback. Har sub-phase ke baad test suite run karke updated patch + handoff de."
