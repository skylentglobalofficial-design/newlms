# Skylent Engineering Handoff Guide

This guide provides engineers with a concise map of the Skylent monorepo, core product subsystems, and verification workflows.

---

## 1. Codebase Map

| Path | Responsibility |
| :--- | :--- |
| `src/App.tsx` | Main React Router v7 configuration, lazy route splitting, and role redirects. |
| `src/pages/` | Page-level views: Public catalogue (`HomePage.tsx`, `ProgramsPage.tsx`), LMS (`LearnPage.tsx`), Labs (`LabsPage.tsx`, `NorthwindLabPage.tsx`), and the 6 Role Dashboards (`DashboardStudentPage.tsx`, `DashboardFacultyPage.tsx`, `DashboardAdminPage.tsx`, `DashboardCollegePage.tsx`, `DashboardRecruiterPage.tsx`, `DashboardOrgPage.tsx`). |
| `src/components/lms/` | Course player (`LessonContent.tsx`), role-aware anti-piracy watermark, video player, quizzes (`AssessmentSurface.tsx`), assignments (`AssignmentResponse.tsx`), and the lesson tutor (`SkylentAI.tsx`). |
| `src/components/learner/` | Student navigation (`learner-nav.tsx`), header notification bell & student-only Elixir pill (`HeaderWalletAndNotifications.tsx`), and `ElixirWallet.tsx`. |
| `src/components/skylent/` | `NativeAppShellController.tsx` (OTA auto-update polling, Android back-button guard, and `SkylentNativeBridge.setScreenshotProtection`), public navbar (`shared.tsx`), and primitives. |
| `src/content/` | Authored markdown lessons (`l1.md`–`l15.md`), quizzes, and assignment briefs across all 6 career tracks. |
| `server/src/index.ts` | Express 5 API server entry point, security middleware, and SPA static file serving. |
| `server/src/routes/` | Modular API routers (`/api/v1/auth`, `/api/v1/lms`, `/api/v1/catalog`, `/api/v1/elixir`, `/api/v1/faculty`, `/api/v1/admin`, `/api/v1/college`, `/api/v1/career`, `/api/v1/payments`, `/api/v1/health`). |
| `prisma/schema.prisma` | Single source of truth for all PostgreSQL tables and enums. |

---

## 2. Key Architectural Invariants

1. **Elixir Visibility Rule:**
   - The personal Elixir Coin chip in the header (`HeaderWalletAndNotifications.tsx`) and `<ElixirWalletPanel />` on the Student Dashboard render **strictly for `user.role === "student"`**.
   - Admin (`admin` / `superadmin`) manages platform-wide Elixir rules and manual grants exclusively inside `/dashboard/admin` → `Payments & Pricing`.
2. **Role-Based Screenshot & DRM Policy:**
   - Students and logged-out users have Android hardware `FLAG_SECURE` enabled (`setScreenshotProtection(true)`), dynamic video watermarks, and copy/print locks.
   - Admin and Superadmin accounts automatically call `SkylentNativeBridge.setScreenshotProtection(false)` and set `html[data-admin-screenshot-allowed="true"]` so they can capture screenshots and print freely.
3. **Dynamic Build Stamp for OTA Auto-Update:**
   - `server/src/routes/health.ts` computes `DEPLOYED_BUILD_ID` dynamically from the SHA-1 hash of `dist/index.html` + Git commit SHA on every build.
   - `NativeAppShellController.tsx` polls `/api/v1/health/app-config` and prompts users to reload whenever a new deployment goes live.

---

## 3. Pre-Release Verification Suite

```bash
npm run build
npx tsx scripts/test-release-readiness-hardening.ts
npx tsx scripts/test-college-isolation.ts
npx tsx scripts/test-employer-jobs.ts
npx tsx scripts/test-role-provisioning.ts
npx tsx scripts/test-lms.ts
```
