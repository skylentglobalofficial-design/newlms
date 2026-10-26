# Phase 2: core learning

Date: 26 October 2026, evening IST (Asia/Calcutta, UTC+5:30).

This phase inspected the learning flows on `main` at `bcbc2416503495115e69873bbb5e9eff05918147` and fixed one confirmed assignment bug. It did not connect to the production database, run migrations, or restart Hostinger. A passing local test is not proof that the live site is fixed.

Phase 0 is on `main`. Phase 1 preflight is still incomplete: the Hostinger startup command and a restorable backup are unverified. That does not block this code review. It still blocks any production restart.

## Status

| Area | Label | Why |
|---|---|---|
| Registration, login, logout, session | GREEN in code and local tests | Server session, CSRF, and consent are enforced. Not exercised on the live site in this phase. |
| Catalogue and course detail | GREEN in code | Public catalogue returns titles and outline, not lesson bodies or quiz answers. Live catalogue was not re-fetched in this phase. |
| Enrolment and access control | GREEN in code and the LMS test | Unenrolled and locked requests are rejected on the server. |
| Lesson navigation and content | GREEN in code and the LMS test | Later lessons stay locked until the previous one is complete. |
| Lesson completion and progress | GREEN in code and the LMS test | Progress is stored on the enrolment and is still there after another read. |
| Quizzes | GREEN in code and the LMS test | The server scores answers. A correct set passed. The separate quiz-guard suite was not re-run in this phase. |
| Assignments | GREEN after the fixes below | A late draft no longer reopens a submitted or graded assignment. A learner may submit again after a grade, and that resubmit clears the current grade. Covered by the LMS test. |
| Student dashboard | AMBER | The page loads enrolments from the API and has small-screen CSS. A phone-sized pass was not done. |
| Production of these flows | UNVERIFIED | No live learner session was used. |

## What was inspected

Frontend, API, and Prisma models for:

- `server/src/routes/auth.ts` and `src/context/AuthContext.tsx` for signup, login, logout, and session restore.
- `server/src/routes/catalog.ts` for the public course outline.
- `server/src/routes/lms.ts` and `server/src/lib/lms.ts` for enrolment, locks, progress, quizzes, and assignments.
- `server/src/lib/quiz-attempts.ts` for scoring. One point per correct option index. The pass mark is the question count unless a passing score column is set.
- `src/pages/LearnPage.tsx`, `src/components/lms/LessonContent.tsx`, and `src/components/lms/AssessmentSurface.tsx` for how drafts and submits are sent.
- `src/pages/DashboardStudentPage.tsx` and the small-screen rules in `StudentHome.css` and `LearnWorkspace.css`.
- Existing tests in `scripts/test-lms.ts`, `scripts/test-quiz-guard.ts`, `scripts/test-auth.ts`, and `scripts/test-consent.ts`.

Facts from that reading:

- Restricted lesson, quiz, and assignment routes use `requireAuth` and a server enrolment check. Hiding a button is not the only control.
- Logout calls the server and clears the client session. A demo login exists only when `VITE_DEMO_MODE` is true, and it throws otherwise.
- Quiz answers are stored on `QuizAttempt` for that user and enrolment. The pass flag is what unlocks the next lesson.
- Assignment rows are stored with the signed-in user's id and that enrolment. A learner cannot submit into someone else's enrolment because the enrolment is resolved from the session.
- Programme-course links are not rewritten by lesson or quiz saves. The October backfill that can add links is a separate migration and was not run.

## Confirmed bug and fix

A draft save uses `action: "start"`. Submit uses `action: "submit"`. The editor waits 700ms and then sends the draft. If that request reaches the server after submit, the old update set the status back to `in_progress`. Marking the lesson complete then fails because completion requires status `submitted`.

Reading the status and then saving it were two separate steps. A submit and a draft could both read “in progress” and the draft’s save could land last.

The handler now takes the same Postgres transaction lock already used for quiz attempts (`pg_advisory_xact_lock` on the enrolment and lesson). The second request waits until the first commits, then reads the status that request stored. A `start` that sees `submitted` or `graded` does not write. A new `submit` replaces the response text. Attachments and lesson progress for that request are written in the same transaction.

### Resubmit after a grade

A learner may submit again after an assignment is graded. The new submit sets status back to `submitted`, replaces `responseText`, and sets a new `submittedAt`. When the locked row is `graded` and the grading columns exist, that same update sets `grade`, `feedback`, `gradedById`, and `gradedAt` to null. A draft does not do this.

There is no assignment grading-history table. Faculty grading (`POST /api/v1/faculty/submissions/:id/grade`) writes those four columns on the current `AssignmentProgress` row and does not append a history record. Admin audit is not written for a grade. Clearing the current columns is the reset. It does not delete a historical record, because none is stored. No history table was added.

The nulls are included only when `assignmentGrading` is true, so a database that has not applied `20261024120000_quiz_grading_events` is not asked to write columns it does not have. The capability read stays outside the transaction. The advisory lock, the early return for drafts, and the rest of the transaction are unchanged.

The lesson workspace still shows "Submission recorded" once the lesson is complete, so this rule is the server save. The page does not yet offer a second submit button.

`scripts/test-lms.ts` checks the stored row, not only the HTTP body:

- A `start` after submit leaves status `submitted` and keeps the submitted text.
- Five rounds of one submit racing six drafts each end with status `submitted` and the submit text.
- A `start` after `graded` leaves status `graded`, keeps the graded text, and keeps grade 80, the feedback, the grader id, and the grading time.
- A `submit` after that grade stores status `submitted`, the new text, a new submission time, and null grade, feedback, grader id, and grading time.

No other core-learning defect was clear enough to change.

Questions that were not guessed:

- Whether production mail is configured for password reset. The API can return success when mail is not set. No reset page was found in `src/`.
- Whether a phone layout of the dashboard is acceptable. CSS breakpoints exist. They were not opened in a phone viewport.

## Tests

Run against the local API on port 3000 and the local database. Not production.

| Command | Result |
|---|---|
| `npx tsc -p tsconfig.backend.json --noEmit` | Pass, 26 October 2026, 19:59 IST. Exit 0. |
| `npx tsx scripts/test-lms.ts` | Pass, 26 October 2026, 19:59 IST, against the local API on port 3000 after it reloaded this change. Exit 0. "All LMS integration checks passed." Step 13b covered the late draft, five racing rounds, and a draft after a grade (status, text, grade 80, feedback, grader, and grading time stayed). Step 13c resubmitted that graded row and the stored grade, feedback, grader id, and grading time were null. |

Not re-run in this phase: `test:auth`, `test:consent`, `test:quiz-guard`, and the learner journey. They passed on the throwaway database in the PR #209 gate. They were not needed to prove this assignment change, and they were not pointed at production.

During the earlier lock change, the first `test:lms` attempt failed because the shell still had `API_BASE` pointed at port 3011, which was down. That was an environment mistake, not a product failure. The retry with that variable unset passed. This resubmit run used port 3000 with `API_BASE` unset.

## Remaining blockers

- Hostinger startup command and a restorable backup are still unverified. Do not restart production.
- The exact deployed commit is still unknown.
- Live signup, enrol, lesson, quiz, and assignment flows were not clicked on `https://skylent.live`.
- Dashboard mobile usability was not checked on a device.

## Files and risk

- `server/src/routes/lms.ts` — decide and save the assignment inside the quiz-attempt Postgres lock so a draft cannot overwrite a submit. A submit of a graded row clears the current grade fields in that same update.
- `scripts/test-lms.ts` — stored-row checks for a late draft, a submit racing several drafts, a draft after a grade, and a resubmit that clears the grade.
- `docs/PHASE_2_CORE_LEARNING.md` — this report.

Risk: a learner can no longer use "start" to reopen a submitted or graded assignment. A new `submit` after a grade replaces the text and clears the current grade, feedback, grader, and grading time. The previous grade is not archived. The lock is held only for that save. The lesson page still does not show a resubmit control after the lesson is complete.
