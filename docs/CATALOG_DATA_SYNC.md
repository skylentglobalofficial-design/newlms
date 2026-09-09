# Catalog data consistency (core learning funnel)

Skylent currently has **three layers** for catalog and LMS data. This document defines what must stay aligned for the path:

**`/courses` → `/courses/:slug` → enroll → `/learn/:slug`**

## Layers

| Layer | Location | Used by |
|-------|----------|---------|
| 1. Marketing catalog | `src/data.ts` | Public pages: `/courses`, `/programs`, `/workshops`, marketing copy |
| 2. Catalog API | `GET /api/v1/catalog/courses/:slug`, `.../programs/:slug` | **Not consumed by the frontend today** |
| 3. LMS database | Prisma (`Course`, `CurriculumModule`, `CurriculumNode`, enrollments) | Learn workspace, progress, assessments, certificates |

## Synchronization today

- `npm run db:seed` imports `courses` and `programs` from `src/data.ts` and upserts Prisma records.
- `seedCourse()` **deletes and recreates** curriculum modules per course on each seed — manual DB curriculum edits are overwritten.
- Program → course LMS enrollment links are defined in **`src/lib/program-lms-enrollment.ts`** and applied by `seedProgramCourses()` in `prisma/seed.ts`.

## Must stay in sync for core funnel

1. **Course slug** in `src/data.ts` `courses[]` ↔ `Course.slug` in DB (seed).
2. **Lesson `id` keys** in `data.ts` course modules ↔ `CurriculumNode.sourceId` (unlock/progress URLs use these keys).
3. **Program LMS links** in `program-lms-enrollment.ts` ↔ `ProgramCourse` rows (seed).
4. **Program `enrollmentStatus`** in `data.ts` — only programs with LMS links should show a working enroll CTA when status is `open`. Programs without links should use `waitlist` / `coming_soon` or rely on `isProgramLmsEnrollable()`.

## Canonical demo course

`data-analytics` is the reference course for end-to-end LMS behaviour. See `docs/DATA_ANALYTICS_LESSONS.md`.

## Intentionally not unified in this phase

- Full catalog API adoption by the frontend (no rewrite in Phase 12A).
- Workshop / blog / jobs content (marketing-only in `data.ts`).
- Recruiter / admin / institution fixture dashboards.

## Minimal safe change pattern

When adding a new **open** program that should enroll into the LMS:

1. Ensure a target `Course` exists in `src/data.ts` `courses[]`.
2. Add a row to `PROGRAM_LMS_COURSE_LINKS` in `src/lib/program-lms-enrollment.ts`.
3. Run `npm run db:seed`.
4. Verify with `npm run test:lms` (tests 14, 14b).

When a program is **not** LMS-ready, set `enrollmentStatus` to `waitlist` or `coming_soon` in `data.ts` — do not show a working enroll button.
