# Signed-in learner surfaces: truth audit

Scope: student home (`/dashboard/student`), learning player (`/learn/:slug/:lessonId`), Northwind Lab
(`/os/labs/data-analytics/northwind`), learner project (`/os/projects/:courseSlug/:projectType`) and the
lesson Skylent AI panel. Audited on branch `ws/dashboard-truth` (from `main` at `5288b85`) by reading
the client (`src/lib/*-api.ts`), the routes (`server/src/routes/*`) and the Prisma models, then
rendering every route against harness fixtures, with the API down, and as an empty learner.

Status key:

- **CONNECTED**: the element shows real data from a working endpoint, end to end.
- **PARTIAL**: the endpoint is real, but part of what the element shows is not backed (or the UI used it wrongly before this pass).
- **UI-ONLY**: static copy or a link; no data is implied.
- **MISSING**: no backend exists; the UI must show a truthful state instead.

"Fixed" says what changed in this pass.

## Student home

| Element | Client → route → model | Status | Notes / fixed |
|---|---|---|---|
| Session / auth guard | `RoleRouteGuard` + `useAuth` → `GET /auth/me` → `User`, `UserRole` | CONNECTED | Expired session during load now shows "Your session has ended" with Sign in, not a generic error. |
| Primary workspace (resume card) | `fetchLmsDashboard` → `GET /lms/dashboard` → `UserEnrollment`, `CurriculumNode`, `LessonProgress` (`loadLearnerDashboard`) | CONNECTED | Resume lesson, module, next lesson and `completedCount/totalLessons/progressPct` all come from `workspace.resume` / `workspace.progress`. |
| Programme progress on the resume card | same response, `workspace.program.progress` (`ProgramCourse`) | CONNECTED (was unused) | Fixed: "Part of <programme> · x of y courses complete" shown when the server returns a programme. |
| My learning: enrolment list | `fetchLmsEnrollments` → `GET /lms/enrollments` → `UserEnrollment` + `Course` / `Program` | CONNECTED | Error state now has a Try again action. |
| My learning: per-enrolment progress | primary row from `/lms/dashboard`; other rows `fetchCourseWorkspace` → `GET /lms/courses/:slug`, programme rows `fetchProgramWorkspace` → `GET /lms/programs/:slug` | CONNECTED (was PARTIAL) | Before: only the primary course had progress, others showed "Enrolled <date>". Fixed: each row reads its own workspace; loading and failed rows say so. |
| My learning: Open / Resume link | resume lesson from the same responses | CONNECTED (was PARTIAL) | Before: always `/learn/:slug`. Now opens the server's resume lesson; label is "Resume" only when progress is between 0 and 100%. |
| Needs attention | `workspace.lessonStates` (started, not complete, quiz/assignment) | CONNECTED | Unchanged. |
| Current project | `listLearnerProjects` → `GET /lms/projects` → `LearnerProject`, `LearnerProjectTask` | CONNECTED | Error state now has Try again. Fallback "Not started" row is static product copy from `course-product.ts` (UI-ONLY, no data implied). |
| Practice lab link | `courseProductProfile(slug).lab` | UI-ONLY | Link only; the lab itself is CONNECTED (below). |
| Certificates: mine | `fetchMyCertificates` → `GET /certificates/mine` → `SkylentCertificate` | CONNECTED (was PARTIAL) | Server sent no `id` and no `revoked`; the UI keyed rows on `cert.id` and could offer "Verify" for a revoked certificate. Fixed client keys on `code`; backend adds `revoked` (see Backend change). |
| Certificates: claim / issue | `issueCertificate` → `POST /certificates/issue` (server checks `certificateEligible`) | CONNECTED (was PARTIAL) | Bug fixed: after a claim the list filter `item.id !== issued.id` (both `undefined`) wiped every other certificate from view. Claim errors show the server's own sentence (403 "Complete every lesson first.", 400 name missing) and never transport text. |
| Certificate truth chip | `truthOf('certificates')` = development | UI-ONLY | Correct: not production-verified. |
| Evidence link / Career connection card | links to `/career-os/projects`, `/career-os` | UI-ONLY | Copy states that learners add work to Career OS themselves; true per `POST /career/projects/from-learner-project`. |
| Skylent AI card | `fetchSkylentAiStatus` → `GET /lms/ai/status` → `isAiConfigured()` | CONNECTED (was UI-ONLY) | Before: always showed "Live". Now Live only when the server says available; "Not available" chip and copy when not configured; neutral copy when the check fails. |
| Path state (Find My Path) | `src/lib/path/storage.ts` (browser only) | MISSING | No server model. Nothing on the home implies saved path state. |
| Empty learner | `/lms/dashboard` → `{ data: null }` | CONNECTED | "Start with a programme" next step, no invented rows. |
| Error (API down) | — | CONNECTED | Fixed sentence, Try again; no backend text. |

## Learning player

| Element | Client → route → model | Status | Notes / fixed |
|---|---|---|---|
| Access / not enrolled / sign-in | `fetchCourseAccess` → `GET /lms/courses/:slug/access` | CONNECTED | Enrol error now never shows transport text. |
| Course outline + lock state | `GET /lms/courses/:slug` → `lessonStates` (`assertLessonUnlocked`) | CONNECTED | Unchanged. |
| Course progress (top bar) | same response, `workspace.progress` | CONNECTED (was PARTIAL) | Before: recomputed in the browser. Now the server's numbers. |
| Lesson progress (access / complete) | `markLessonAccess` / `markLessonComplete` → `POST /lms/courses/:slug/lessons/:key/progress` → `LessonProgress` | CONNECTED | Failure message sanitised. |
| Quiz questions | `fetchQuizQuestions` → `GET …/quiz` → `QuizQuestion` (no answers sent) | CONNECTED (was PARTIAL) | Before: a failed request showed "No questions are available", and a passed check whose questions failed to load showed that instead of "passed". Fixed: passed state first; failed load is an error with Try again. |
| Quiz attempt | `submitQuizAttempt` → `POST …/quiz/attempts` → `QuizAttempt` | CONNECTED (was PARTIAL) | Before: a network failure was shown as "Not all answers were correct". Fixed: failure keeps answers ungraded and says so. |
| Assignment submit | `updateAssignment` → `POST …/assignment` → `AssignmentSubmission` | CONNECTED (was PARTIAL) | Before: "Submission recorded" appeared even when the request failed. Fixed: shown only after the server confirms. "Open Career OS Projects" link pointed at `/career-os/profile`; now `/career-os/projects`. |
| Video | `fetchLessonMedia` → `GET …/media` (Mux or `unavailable`) | CONNECTED; provider MISSING when unavailable | Before: a play button and "Mark as watched" on a video that does not exist. Fixed: IN DEVELOPMENT chip, no play control, "Mark lesson complete" with "records progress only". Mux path gains its missing completion button. Loading shows a skeleton. |
| Lab / project chips | `courseProductProfile` | UI-ONLY | Links. |

## Skylent AI in the lesson

| Element | Client → route → server lib | Status | Notes / fixed |
|---|---|---|---|
| Availability | `GET /lms/ai/status` → `isAiConfigured()` | CONNECTED | Not configured: "Skylent AI isn't switched on yet" + no provider configured. Request failure is now a separate "could not be reached" state (before it claimed "not available"). Ask 503 `not_configured` also switches to the unavailable state. |
| Modes | `POST /lms/ai/ask` `mode`: ask / explain / example / quiz / practice | CONNECTED | Unchanged; exactly the server's enum. |
| Context in use | `buildLessonAiContext` (`skylent-ai/authored.ts`) | CONNECTED (was PARTIAL) | Before: always "Lesson text". The server loads lesson text, concepts and case facts only for `data-analytics` and `product-management`; other courses get titles only. Chips now say "Lesson text · Key concepts · <case>" or "Lesson title only", mark Northwind results "withheld" while an assessment is open (`redactPrivilegedAssessmentContext`), and state progress, projects and career are not connected. |
| Academic policy (`policyMode`) | `deriveAcademicPolicy` (server-only, not returned) | PARTIAL | The server does not return the policy. The panel mirrors the same rule from lesson state; the integrity notice now appears only while the check/assignment is open (before: also after passing). |
| Refusal (`refused`) | `academicIntegrityRefusal` / leak guard; returned as `answer` text, no flag | PARTIAL | No `refused` flag in the response. The panel recognises the server's fixed refusal openings and labels them "Held back while this assessment is open" in a calm style. |
| Answer, Context (`basedOn`), Related | `/lms/ai/ask` response | CONNECTED | Unchanged. |

## Northwind Lab

| Element | Client → route → model | Status | Notes / fixed |
|---|---|---|---|
| Lab workspace, dataset, schema, sample rows | `fetchNorthwindLab` → `GET /labs/data-analytics/northwind` (server reads the CSV) | CONNECTED | Fictional dataset labelled. |
| Quick analysis / SQL run | `runNorthwindLab` / `runNorthwindSql` → `POST …/run`, `…/sql/run` | CONNECTED | SQL engine messages kept; transport failures get a plain sentence. |
| Saved work list / open / save | `GET/POST …/work`, `GET …/work/:id` → `LabWork` | CONNECTED (was PARTIAL) | Before: one failed list request hid the whole lab. Now the list loads separately with its own loading / error / empty states. |
| Errors / sign-in | — | CONNECTED | Error state gains Try again; 401 shows a Sign in state. |

## Learner project

| Element | Client → route → model | Status | Notes / fixed |
|---|---|---|---|
| Project workspace (tasks, brief, reflection) | `ensureLearnerProject` → `POST /lms/projects` → `LearnerProject` | CONNECTED | Before: raw "Failed to fetch CSRF token" shown when the API was down. Now a sanitised sentence with Try again. |
| Task complete / attach evidence / save | `POST /lms/projects/:id/tasks/:key/complete`, `…/evidence`, `…/save` | CONNECTED | Messages sanitised. |
| Evidence card | `task.evidence` from the same response (`LabWork`) | CONNECTED | Unchanged. |
| Career OS link | `fetchCareerLinkForLearnerProject` → `GET /career/projects/by-learner-project/:id`; `addLearnerProjectToCareer` → `POST /career/projects/from-learner-project` | CONNECTED (was PARTIAL) | Before: a failed link check looked like "not added" and could offer to add again. Now "Checking Career OS…" and an explicit "could not be checked" state. |

## Counts

| Status | Count (rows above) |
|---|---|
| CONNECTED (13 of them were PARTIAL, UI-ONLY or unused before this pass) | 33 |
| PARTIAL | 2 (AI policy mode, AI refusal flag: server does not return them) |
| UI-ONLY | 4 (links and product copy; none imply learner data) |
| MISSING | 2 (Find My Path state on the server; a published video where media is `unavailable`, inside the Video row) |

Fabricated data search (`lorem`, `John`, `Demo`, `mock`, `sample`, `placeholder`, hard-coded
percentages, sample arrays) across all in-scope files found no invented learner records. The fake
signals that did exist were behavioural: a play button for a missing video, "Submission recorded"
after a failed request, "Not all answers were correct" after a failed request, "No questions" for a
failed load, an always-"Live" AI chip and an always-"Lesson text" AI context. All are fixed.

## Backend change

`server/src/routes/skylent/certificates.ts`, `GET /certificates/mine` only: each row now also carries
`revoked: boolean` (already a column on `SkylentCertificate`). Additive, no schema change, no
migration, no seed; `issuedView` and the public verify response are unchanged. Reason: without it the
learner's home offered "Verify" for a revoked certificate, which the public check then rejects.

## Not changed (recommendation)

`POST /lms/ai/ask` could return `policy` and `refused` (from `completeLessonAsk`'s `provider === "policy"`)
so the client need not mirror the rule or recognise refusal sentences. It was left alone because the
endpoint works and the brief limits backend edits to broken endpoints.
