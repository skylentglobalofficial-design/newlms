# LMS verification

**Failure screens caused by the unavailable API are not valid LMS visual-pass evidence.**

## Why the API was unavailable

The API on port 3000 did not start. `server/src/lib/prisma.ts` throws `DATABASE_URL is required for the API runtime`. This environment has no `.env` and no `DATABASE_URL`. A start attempt did not open port 3000. Nothing was seeded and the database was not changed.

The Vite process used for the capture had `VITE_DEMO_MODE=true`. The demo picker sets client role state for Learner, Faculty, Institution, and Admin. It does not create an API session. Workspace, catalogue, quiz, lab, and project calls to `/api/v1` returned **502 Bad Gateway**.

## Screens that actually rendered

These routes opened in the browser and showed a real shell. The shell is what was captured. It is not a pass.

| Route | Who | What rendered |
| --- | --- | --- |
| `/dashboard/student` | Demo Learner | “Learning workspace unavailable” and “Unable to load this workspace. Try again.” Also captured at 390 and 768. |
| `/dashboard/faculty` | Demo Faculty | “Teaching scope” and “No programmes or courses are assigned to your account yet.” Also captured at 390 and 768. |
| `/dashboard/organisation` | Demo Institution | Heading “Demo Institution”. Also captured at 390 and 768. |
| `/dashboard/admin` | Demo Admin | “Platform overview” and “Platform metrics appear here only when backed by connected admin APIs.” Also captured at 390 and 768. |
| `/learn/data-analytics` | Demo Learner | “Course unavailable” / “This course could not be opened.” |
| `/learn/data-analytics/l1` | Demo Learner | Same course-unavailable shell. Not a lesson player. |
| `/learn/data-analytics/l3` | Demo Learner | Same course-unavailable shell. Not a quiz. |
| `/learn/product-management` | Demo Learner | Same course-unavailable shell. |
| `/learn/python-programming` | Demo Learner | Same course-unavailable shell. |
| `/os/labs/data-analytics/northwind` | Demo Learner | “This lab could not load.” |
| `/os/projects/data-analytics/northwind-commercial-review` | Demo Learner | “This project could not load.” |
| `/os/projects/product-management/harbor-desk-case` | Demo Learner | “This project could not load.” |
| `/career-os` while the learner demo was active | Demo Learner | “Unable to load this workspace. Try again.” Header showed Demo Learner. |
| `/courses` and `/labs` while the learner demo was active | Demo Learner | The public pages still rendered. |
| `/programs/data-science-ai` while the learner demo was active | Demo Learner | “This programme could not be loaded”. |
| `/dashboard/student` and `/learn/data-analytics` from a faculty session | Demo Faculty | Stayed on `/dashboard/faculty`. |
| `/dashboard/recruiter` from an admin session | Demo Admin | Stayed on `/dashboard/admin`. |
| Logged-out `/dashboard/student`, `/dashboard/faculty`, `/dashboard/organisation`, `/dashboard/recruiter`, `/dashboard/admin`, `/learn/data-analytics`, `/os/labs/data-analytics/northwind`, `/os/projects/data-analytics/northwind-commercial-review` | Signed out | Redirected to `/login`, “Welcome back.” |

Representative copies of the learner, faculty, institution, and admin dashboards, and of the lesson route, are in `selected/`. They document the rendered shell only.

## Screens blocked by port 3000 and the missing DATABASE_URL

These were not rendered. They were not verified.

- Programme page content (every `/programs/:slug` detail request failed).
- Course page content (every `/courses/:slug` detail request failed).
- Learner workspace: enrolled curriculum, resume, and progress.
- Lesson player for any lesson, including notes, video, and navigation.
- Quiz questions, options, and attempt UI. `/learn/data-analytics/l3` did not show a quiz.
- Assignment submit UI.
- Locked lesson, locked quiz, and locked assignment.
- Live progress.
- Completion and certificate.
- Northwind lab workspace.
- Northwind and Harbor Desk project workspaces.
- Recruiter workspace. There is no recruiter in the demo picker, and the route was not opened as a recruiter.
- Any LMS screen that depends on an authenticated API session.

Do not treat the “unavailable”, “could not be loaded”, or “could not load” images as a visual pass for those screens.
