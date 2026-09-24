# Visual observations

Captured 24 September 2026 from the running app at `http://127.0.0.1:5174`. Each source image is one full scroll-height screenshot. Product source was not changed for the capture. The API process on port 3000 was not running, so catalogue and LMS requests through `/api/v1` returned 502. Those screens are the app’s real failure states.

Demo workspaces were opened with `VITE_DEMO_MODE=true` on the Vite process only. The picker offers Learner, Faculty, Institution, and Admin. There is no recruiter identity in that picker.

No fixes are proposed here.

## 1. Actual visual issues

No captured page had `scrollWidth` greater than the viewport, so none showed a page-level horizontal scrollbar.

DOM boxes that extended past the viewport edge:

- `responsive/390/institutions.png`: a `button` extended past the edge.
- `responsive/390/universities.png`: an `a` extended past the edge.
- `responsive/390/about.png`: an `a` extended past the edge.
- `responsive/390/os.png`: an `li` and a `span` extended past the edge.
- `responsive/768/os.png`: an `li` extended past the edge.

The home page at 390px, after Open menu, starts with the text “MENU Close Search Learn…”. That is the open mobile menu on the full-height home image (`states/390/home-menu-open.png`, 390×12656).

No theme, dark, or light control was present. Every screenshot is the app’s single visual theme. A dark theme was not tested.

Public and several LMS navigations logged `502 (Bad Gateway)` for API calls. A few lab requests were aborted (`/api/v1/labs/data-analytics/northwind` and `/api/v1/auth/csrf`). Those match the API being down. They are recorded under API/backend unavailable, not as a layout defect.

Marketing and index pages that do not depend on that API rendered their own headings: home, education paths, skills, programmes index, courses index, workshops and workshop details, stories, about, blog and posts, contact, labs index, universities, institutions, and Skylent OS.

Exam routes `/exams/neet`, `/exams/iit-jam`, `/exams/gate`, `/exams/ssc`, and `/exams/upsc` render the exam name on a short page.

`/not-a-real-route` shows “Page not found”.

Empty sign-in submit shows “Enter your email address.” `/signup` shows “Create your account.” The login page includes the local demo buttons Learner, Faculty, Institution, and Admin.

## 2. Content repetition

Unknown Career OS detail URLs render the same short shell as the matching list page (same heading, 954px at 1440):

- `/career-os/projects/not-in-catalog` matches Projects.
- `/career-os/applications/not-in-catalog` matches Applications.
- `/career-os/interviews/not-in-catalog` matches Interviews.
- `/career-os/support/not-in-catalog` matches Support.

Logged-out Career OS list pages render short shells: Profile, Projects, Opportunities, Applications, Interviews, Support.

Every programme detail slug (`/programs/data-science-ai`, `data-analytics-pro`, `full-stack`, `generative-ai-program`, `product-management`, `jee-advanced-prep`, `cat-prep`, `sql-certificate`) shows the same 900px shell: “This programme could not be loaded”. Every course detail slug shows “This course could not be loaded” and “The catalogue request failed. This is not a missing course.” That repetition is the shared API failure shell. Programme and course copy never loaded, so this is not a finding that the real programme or course pages duplicate each other.

Logged-out visits to the student, faculty, organisation, recruiter, and admin dashboards, plus `/learn/data-analytics`, the Northwind lab, and the Northwind project, all finish on `/login` with “Welcome back.”

`/learn/data-analytics`, `/learn/data-analytics/l1`, `/learn/data-analytics/l3`, `/learn/product-management`, and `/learn/python-programming` each show the same “Course unavailable” shell. That is one failure state repeated because the workspace never loaded.

## 3. Responsive issues

At 390px, institutions, universities, and about each had a control past the viewport edge. At 390px and 768px, `/os` had a list item past the edge. The other measured pages did not.

Main public pages exist as full-height images at 390, 768, 1280, and 1440. Role dashboards exist at 390, 768, and 1440. Those dashboard images are failure or empty shells. They are not verified LMS layouts. See `LMS_VERIFICATION.md`.

Copies of the 390px institutions, universities, and about shots, and of `/os` at 390 and 768, are in `selected/` because those are the pages where a box crossed the viewport.

## 4. API/backend unavailable states

Port 3000 was down. The browser logged `502 (Bad Gateway)` on `/api/v1` calls. A few lab calls aborted (`/api/v1/labs/data-analytics/northwind`, `/api/v1/auth/csrf`).

Resulting shells:

- Programme detail: “This programme could not be loaded”.
- Course detail: “This course could not be loaded”. “The catalogue request failed. This is not a missing course.”
- Learner dashboard: “Learning workspace unavailable” / “Unable to load this workspace. Try again.”
- `/learn/data-analytics`, `/learn/data-analytics/l1`, `/learn/data-analytics/l3`, `/learn/product-management`, `/learn/python-programming`: “Course unavailable” / “This course could not be opened.”
- Northwind lab: “This lab could not load.”
- Northwind and Harbor Desk projects: “This project could not load.”
- Signed-in `/career-os`: “Unable to load this workspace. Try again.” The header still showed Demo Learner.
- Signed-in `/courses` and `/labs` still rendered their public pages.
- Signed-in `/programs/data-science-ai` shows “This programme could not be loaded”.

Index pages that do not need that API still rendered, as listed in section 1.

## 5. Unavailable and unverified states

| State | What was on screen | Status |
| --- | --- | --- |
| Signed out | Public pages and `/login` | Captured |
| Learner demo | Dashboard and learn routes open, then the API failure shell | Rendered shell only. Not a valid LMS pass |
| Faculty demo | “Teaching scope” and that no programmes or courses are assigned. Opening a student route returns to the faculty dashboard | Rendered shell only. Data not verified |
| Institution demo | Heading “Demo Institution” | Rendered shell only. Live institution data not verified |
| Admin demo | “Platform overview”, with copy that metrics appear only when admin APIs are connected | Rendered shell only. Not a populated admin console |
| Recruiter | Logged-out `/dashboard/recruiter` goes to sign-in. An admin who opens it returns to `/dashboard/admin` | Workspace not opened |
| Quiz | `/learn/data-analytics/l3` is the “Course unavailable” shell | Quiz UI not captured |
| Assignment | No assignment surface appeared | Not captured |
| Locked lesson, locked quiz, locked assignment | Not shown | Not captured |
| Progress | Not shown | Not captured |
| Completion or certificate | Not shown | Not captured |
| Empty sign-in | “Enter your email address.” | Captured |
| Signup | “Create your account.” | Captured |
| Unknown URL | “Page not found” | Captured |
| Dark theme | No control | Not tested |

A faculty session that opens `/dashboard/student` or `/learn/data-analytics` stays on `/dashboard/faculty`. An admin session that opens `/dashboard/recruiter` stays on `/dashboard/admin`.

These failure screens are not evidence that the LMS layout, lesson player, quiz, assignment, locks, or progress passed visual QA. The reason is in `LMS_VERIFICATION.md`.
