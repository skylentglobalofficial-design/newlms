# Skylent Scripts Reference (`scripts/`)

This directory contains database preflight utilities, account provisioning tools, the Android APK builder, and automated integration test suites.

---

## 1. Build, Database & Provisioning Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `build-playstore-apk.ps1` | `powershell -ExecutionPolicy Bypass -File .\scripts\build-playstore-apk.ps1` | Builds `dist/`, syncs Capacitor Android (`v10.4.0`), and compiles signed `.apk` + `.aab` bundles. |
| `bootstrap-superadmin.ts` | `npm run bootstrap:superadmin` | Creates or updates the primary Superadmin account in PostgreSQL. |
| `provision-demo-accounts.ts` | `npm run provision:demo` | Provisions verified test accounts across all 6 roles (`student`, `faculty`, `admin`, `college`, `recruiter`, `organisation`). |
| `check-migration-history.ts` | `npm run db:preflight` | Verifies Prisma migration state against the connected PostgreSQL database. |
| `preflight-program-course-backfill.ts` | `npm run db:preflight:backfill` | Ensures canonical programme-to-course links are synced in the database. |
| `sync-payu-to-db.ts` | `npx tsx scripts/sync-payu-to-db.ts` | Syncs PayU merchant configuration from environment variables into runtime settings. |
| `sync-smtp-to-db.ts` | `npx tsx scripts/sync-smtp-to-db.ts` | Syncs SMTP email credentials into runtime settings. |

---

## 2. Primary Integration & Release Test Suites

All integration tests automatically boot an embedded test API server if port `3000` is not already running:

| Script | Command | Coverage |
| :--- | :--- | :--- |
| `test-release-readiness-hardening.ts` | `npm run test:release-readiness-hardening` | 22-phase release gate covering RBAC, LMS, Elixir, Career OS, security headers, and UI contracts. |
| `test-lms.ts` | `npm run test:lms` | Course enrollment, lesson progression, quizzes, assignments, and certificate issuance. |
| `test-role-provisioning.ts` | `npm run test:roles` | 6-role authentication, role isolation, and dashboard access guards. |
| `test-college-isolation.ts` | `npm run test:college-isolation` | Multi-tenant college cohort isolation and analytics privacy. |
| `test-employer-jobs.ts` | `npm run test:employer` | Recruiter onboarding, job creation, and candidate application workflows. |
| `test-skylent-ai.ts` | `npm run test:ai` | Grounded in-lesson tutor responses, guardrails, and refusal checks. |
| `test-elixir.ts` | `npm run test:elixir` | Elixir coin ledger idempotency, reward caps, and scholarship redemptions. |
