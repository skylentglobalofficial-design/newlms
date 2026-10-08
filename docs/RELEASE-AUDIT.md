# Release audit (base 459997f, branch ws/release-audit)

Scope: frontend clients in `src/lib/*-api.ts`, `http.ts`, `skylent-api.ts`, `SiteAssistant.tsx`, `src/hooks/*`, checked against `server/src/routes/**`. No visual or copy changes. No schema changes.

Legend: **OK** means the path, method, CSRF, body, response fields and status handling all match. **FIXED** means it is fixed in this commit. **NOT FIXED** means a mismatch remains (the reason is given).

## 1. Contract

| Client call | Server route (middleware) | Result |
|---|---|---|
| `GET /auth/csrf` (ensureCsrfToken) | auth.ts (none) returns `{csrfToken}` and keeps an existing cookie | OK |
| `GET /auth/me` (401 means signed out, returns null) | requireAuth returns `{user,roles,role}` | OK |
| `POST /auth/login` `{email,password}` + X-CSRF-Token | rate limit, requireCsrf, zod; 400 `details`, 401, 429 JSON | **FIXED**: a 401 for a wrong password showed "Sign in to continue."; a 400 showed "Validation failed". It now shows the server's message or the first field error |
| `POST /auth/signup` `{displayName,email,password}` | rate limit, requireCsrf; 201, 400, 409, 429 | **FIXED** (400 now shows the first field error); 409 and 429 were already passed through |
| `POST /auth/logout` `{}` | requireCsrf; `{ok}` | OK. The client clears its state even if the call fails |
| `PATCH /auth/me` `{displayName}` | requireAuth, requireCsrf | OK (400 now shows the field error; 401 still says "Sign in to continue.") |
| `GET /lms/dashboard`, `/lms/enrollments` | requireAuth, scoped to the user | OK |
| `GET /lms/courses/:slug/access` | public plus attachAuth; 404 for an unknown course | OK. The hook maps 401 to `login_required` and other errors to `unavailable` |
| `GET /lms/courses/:slug`, `/programs/:slug` | requireAuth; 403 if not enrolled | OK |
| `POST /lms/enrollments` `{courseSlug}`/`{programSlug}` | requireAuth, requireCsrf; 200, 201, 400, 404 | OK |
| `GET /lms/courses/:slug/lessons/:key/media`, `/quiz`, `/assignment`, `/certificate` | requireAuth, enrolment and unlock check | OK. The quiz response has no correct answers |
| `POST …/lessons/:key/progress` `{action}` | requireAuth, requireCsrf; 400 if a quiz is not passed or an assignment is not submitted | OK. LearnPage only advances after the call succeeds |
| `POST …/quiz/attempts` `{answers[]}` | requireAuth, requireCsrf; 201, 400 (count or range), 429 (`retryAfterSeconds`) | OK. The error is rethrown, so answers are kept and nothing is graded on the client |
| `POST …/assignment` `{action,responseText}` | requireAuth, requireCsrf; 400 if empty | OK |
| `GET /lms/ai/status` | requireAuth returns `{available}` | OK |
| `POST /lms/ai/ask` `{courseSlug,lessonSlug,mode,question,messages}` | requireAuth, requireCsrf, rate limit; 400, 403, 404, 429, 502, 503; `policy`/`refused` | OK. The panel trusts only `refused`; 503 shows "unavailable" and 401 asks the learner to sign in again |
| Labs: `GET /labs/data-analytics/northwind[?lesson]`, `POST …/run`, `POST …/sql/run`, `POST …/work`, `GET …/work`, `GET …/work/:id` | requireAuth (plus requireCsrf and a JSON 429 on POST); scoped by userId | OK |
| Projects: `GET/POST /lms/projects`, `GET /:id`, `POST /:id/tasks/:key/complete`, `POST /:id/evidence`, `POST /:id/save` | requireAuth, requireCsrf on writes; ownership through `loadOwnedProject`; the evidence lab work is fetched by userId | OK |
| Certificates: `POST /certificates/issue` `{courseSlug}` | requireAuth, requireCsrf; 200 (existing), 201, 400 (name), 403 (not eligible), 404 | OK. The server's sentence is shown |
| `GET /certificates/mine` (now with `revoked`) | requireAuth | OK. Revoked certificates are not counted and are labelled "Revoked" |
| `GET /certificates/verify/:code` | public, JSON 429; 400 if malformed, 404 `{valid:false}` | OK |
| `POST /enquiries` | public, rate limited (10 per 15 minutes); 201 `{data:{id}}`, 400 | OK. The 429 is **NOT FIXED** on the server: the limiter has no handler, so it returns text/plain. The client already shows its generic "failed" state, so the user sees no false success or raw text |
| `POST /reva/chat` (SiteAssistant `askWithStatus`) | public, rate limited; 200, 400, 429 (text/plain), 502 | OK. The status is checked before the body is parsed. The client also handles a 503 that the server never sends (with no key the server returns a fallback answer); this is harmless |
| Career OS profile (`GET/PATCH /career/profile`, `/completeness`, education, experience, skills, projects, links and resumes CRUD) | requireAuth, requireCsrf on writes; `assertOwned*` on every `:id` | OK. POST education and resumes return `{data,profile}` and the client reads `profile`; 409 messages (duplicate skill, linked project) are passed through |
| Career jobs / saved-jobs / applications / events / interviews / questions / practice / support | requireAuth (jobs and questions are public), requireCsrf on writes, ownership checks | OK |
| Career evidence: `GET /career/projects`, `/:id`, `/by-learner-project/:id`, `POST /from-learner-project`, `DELETE /:id` | requireAuth, requireCsrf on writes, ownership checked through the profile | OK |
| Catalog: `GET /catalog/courses`, `/programs`, `/courses/:slug`, `/programs/:slug` | public | OK |
| Faculty / organisation dashboards | requireAuth plus requireRoles | OK |

**Expired session (401 in the middle of a session).** There is no global 401 handler: `AuthContext` keeps the cached user. Every learner surface maps "Sign in to continue." to a sign-in-again state instead of a false one: the dashboard shows "Your session has ended" with a Sign in link, the Career OS overview shows "Sign in again", LearnPage shows `login_required`, the lab and project pages use `isSignInError`, and the lesson AI shows "Your session has ended. Sign in again to ask." `/login` does not redirect away for a cached user (it only does so on `?oauth=success`), so signing in again works.

## 2. Security

| Check | Finding |
|---|---|
| Secrets in `src/`, `public/`, `dist-rel/assets/*.js` (`sk-`, `AKIA`, `postgres(ql)://`, `mongodb`, `BEGIN PRIVATE`, `SESSION_SECRET=`, `apiKey`) | None found. The tracked env files are `.env.example` (placeholders only) and `.env.production` (`VITE_DEMO_MODE=false` only) |
| Client answer keys | `src/content/{data-analytics,product-management}/quizzes.ts` contain `correctIndex`. They are imported only by `src/content/course-quiz-lookups.ts`, which nothing imports, and by `scripts/*`. There are 0 `correctIndex` matches in the built bundle. Risk: if anyone imports `course-quiz-lookups.ts` from client code, the keys ship. Not changed |
| `AssessmentSurface` `q.correct` | Used only for client-graded banks where `correct` is supplied. The server quiz path (`usesServerGrading`) never reveals answers, and `GET …/quiz` sends only `id`, `q` and `options` |
| Authorization | Every learner-data route uses `requireAuth` and scopes by `req.auth.user.id`. Every `:id` route checks ownership (`assertOwned*`, `loadOwnedProject`, `requireLabAccess`, the enrolment lookup). No route trusts a userId or enrollmentId sent by the client. Admin routes use `requireAuth` plus `requireRoles("superadmin")` |
| CSRF | Every POST, PUT, PATCH and DELETE route has `requireCsrf` except the public `POST /enquiries` (no session, JSON only) and `POST /reva/chat` (read-only, response blocked by CORS) |
| Cookies | `sid` is httpOnly; `csrf` is readable by the client (double-submit). Both are SameSite=Lax and Secure in production (`NODE_ENV=production` or `COOKIE_SECURE`). skylent.live and api.skylent.live are the same site, so Lax cookies are sent with credentialed fetches |
| CORS | The allow-list is `CORS_ALLOWED_ORIGINS`, otherwise `FRONTEND_URL`; apex and www are added automatically. Localhost is allowed only outside production, with credentials. Production refuses to start without `DATABASE_URL`, `SESSION_SECRET` (32 characters or more) and `FRONTEND_URL` |
| Minor (not fixed) | A learner can set `status` on their own career support request (`PATCH /career/support/:id`). It is limited to their own record, so it is not a security issue but a product decision. The `/lms/courses/:slug/access` 500 response includes `detail` only outside production |

## 3. Truth states

`truth.ts` was not changed. It has 38 consumer call sites (`truthOf` / `TRUTH`) plus `product-manifest.ts` (`statusOf`, which `test-product-manifest` checks: 129 checks pass).

| Literal | Verdict |
|---|---|
| `TruthChip state="live"` in ProfessionalProgrammeTemplate, CourseDetailPage, CoursesPage, ProgrammeListing | Each is conditional on a real enrolment or authored state (the `lessons` capability is live). OK |
| `programme-model.ts` and `Hero.tsx` `state: "live"` | Only for catalogue rows the server reports as open. OK |
| `PublicHome.tsx` `status: "Live"` for "Verifiable certificates" (truth.ts says `development`) | **Not user-facing**: `PublicHome.tsx` is imported nowhere and is absent from the build. Left as it is; delete it or wire it to `truthOf` if it is ever revived |
| "Live" in degree schedules (OnlineDegreeView, DegreeParts) | Means a live *session format*, not a capability state. OK |

## 4. Reva and fake-data scan

| Search | Result |
|---|---|
| `Reva` in `src`, `public` | One hit: `primitives.tsx` `displayAiText()`, which *replaces* "Reva" with "Skylent AI". There is no user-facing Reva. The legacy `/api/v1/reva/chat` route is kept |
| lorem / John / dummy / mock / placeholder in user-facing strings | None are fake. "Priya" appears only in the fictional Harbor Desk PM case material (and in the unused `SkylentHomeCatalogue.tsx`). "Placeholder days and counts" is an honest label on sample degree listings. "mock tests" is programme syllabus text |
| Hard-coded learner stats, percentages, counts | None. The About and Stories pages explicitly state that no counts or placement rates are published |

## Verification

- `tscheck.sh ../wt-rel rel` gives `6 errors` (the known baseline).
- `build.mjs` gives `warnings 0`. The bundle contains 0 `correctIndex`.
- `final-flows`: fx 26/0 failing, down 21/0 failing, si 8/0 failing.
- `test-product-manifest`: 129 checks pass. `test-ai-policy` passes.
- Login fix: a harness check with mocked fetch shows the HEAD build giving "Sign in to continue." for a 401 and "Validation failed" for a 400. The fixed build gives "Invalid email or password" and "Enter a valid email address", while 403 CSRF, 409, 429, the expired `PATCH /me` 401 and the 200 cases are unchanged. A browser render of `/login` with a mocked 401 shows "Invalid email or password" in the existing error box.
