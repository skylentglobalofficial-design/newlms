# `data-analytics` lesson lifecycle (canonical demo course)

Course slug: **`data-analytics`**  
Curriculum source: `src/data.ts` → seeded to Prisma on `npm run db:seed`

## Module 1 — Foundations of Data

| Lesson | Type | Content source | Prerequisite | Completion rule | Learner UI | Backend API | Persistence |
|--------|------|----------------|--------------|-----------------|------------|-------------|-------------|
| `l1` | video | `CurriculumNode.muxPlaybackId` from `MUX_DEMO_PLAYBACK_ID` at seed | None (first lesson) | Manual “Mark as watched” → `POST .../progress { action: "complete" }` | `LessonVideoPlayer` (Mux or unavailable preview) | `GET .../media`, `POST .../progress` | `LessonProgress.completedAt` |
| `l2` | notes | `CurriculumNode.notesBody` (seeded in `seedDemoLessonNotes`) | `l1` complete | View + mark complete (notes lesson) | `LessonContent` notes panel | `GET /lms/courses/:slug` workspace | `LessonProgress` |
| `l3` | quiz | `QuizQuestion` rows (seeded from `QUIZ_BANK.l3`) | `l2` complete | Submit answers; **all correct** to pass → `POST .../quiz/attempts` | `AssessmentSurface` MCQ | `GET .../quiz`, `POST .../attempts` | `QuizAttempt.passed` |

## Module 2 — Microsoft Excel

| Lesson | Type | Content source | Prerequisite | Completion rule | Notes |
|--------|------|----------------|--------------|-----------------|-------|
| `l4` | video | No Mux ID seeded | `l3` quiz passed | Mark watched / complete | Unavailable preview unless Mux configured per-lesson |
| `l5` | video | No Mux ID seeded | `l4` | Same | Same |
| `l6` | assignment | Assignment prompt in UI | `l5` | Text and/or R2 attachment → `POST .../assignment { action: "submit" }` | Attachments need R2; 503 when not configured |

## Module 3 — SQL for Analysis

| Lesson | Type | Content source | Prerequisite | Completion rule | Notes |
|--------|------|----------------|--------------|-----------------|-------|
| `l7` | video | No Mux ID seeded | `l6` submitted | Mark watched | Unavailable preview |
| `l8` | notes | Seeded `notesBody` + optional `LessonMaterial` | `l7` | Notes + materials panel | Material download requires R2 object + `READY` status |
| `l9` | quiz | `QUIZ_BANK.l9` | `l8` | Pass all questions | Same as `l3` |

## Module 4 — Power BI

| Lesson | Type | Prerequisite | Notes |
|--------|------|--------------|-------|
| `l10` | video | `l9` | No demo Mux seed |
| `l11` | notes | `l10` | No seeded notes in demo seed (empty until faculty edits) |
| `l12` | assignment | `l11` | Standard assignment flow |

## Module 5 — Capstone Projects

| Lesson | Type | Prerequisite | Notes |
|--------|------|--------------|-------|
| `l13`–`l14` | assignment | Sequential | Standard assignment flow |
| `l15` | quiz | `l14` | `QUIZ_BANK.l15`; final assessment |

## Certificate

- **Eligibility:** All lessons complete (progress, quiz pass, or assignment submitted per type).
- **API:** `GET /lms/courses/data-analytics/certificate`, `GET .../certificate/download`
- **UI:** LearnPage banner + student dashboard `CertificatePanel` (both support download when eligible)

## Faculty demo scope

- Demo mentor (`mentor@demo.skylent.dev`) and superadmin can manage notes/materials and review submissions for **`data-analytics` only** (`DEMO_TEACHING_COURSE_SLUG`).
- Faculty notes edited on non-notes lesson types are stored but **not shown to learners** on video lessons (by design in `lms.ts` — only `notes`-type nodes expose `notesBody`).

## Honest unavailable states

- **Video:** `provider: "unavailable"` — preview frame, not a broken `mux-player`.
- **R2 uploads:** HTTP 503 + user-visible error on assignment attachment create.
- **Materials:** “Unavailable (storage pending)” when object not verified in storage.

Do not add fabricated Mux IDs or fake download URLs to satisfy tests.
