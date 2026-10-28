# Skylent limited-release readiness

Date: 28 October 2026 (Asia/Calcutta)

Scope: local frontend only. This is not a full product sign-off and not a production test.

The notes below come from the completed public audit and the signed-in learner audit on this working tree. No browser flow and no automated check was run again for this document.

## 1. User journeys verified locally

Verified means the journey was completed in the local browser through the normal interface.

| Journey | What was done | Result |
| --- | --- | --- |
| Public browsing | Home, programmes, an open programme, a programme that is not open, degrees, one online sample, one campus sample, public Career OS, jobs, Find My Path, the empty path result, about, contact, and institutions | Pages rendered with a heading. No horizontal page scroll at 1440px and 390px. |
| Search | Menu search with no suggestion; `/courses?q=python` | Lands on `/programmes` and keeps `q`. An unknown term shows no matching programme. |
| Navigation | Mobile menu; signed-out visits to the student dashboard, faculty dashboard, admin dashboard, a lesson, and the Northwind lab URL | Menu opens and closes with Escape. Those signed-out visits land on `/login`. |
| Signup and empty dashboard | New student created with the signup form | Dashboard says no lessons are open. |
| Programme enrolment | Data Analytics and Product Management, terms accepted in the enrolment dialog | Each opens lesson 1. No payment step. |
| Lesson completion | Data Analytics lessons 1 and 2, using **Complete and continue** | Lesson 3, Foundations check, unlocks. Lesson 7 stays locked. |
| Assessment | Foundations check submitted from the quiz form | Lesson status **Completed** after refresh. Course progress **3 of 15**. Dashboard resumes at lesson 4. |
| Career OS profile | Headline saved, page refreshed, headline cleared, page refreshed again | The saved headline remained. The cleared profile again showed the empty headline prompt. |
| Harbor Desk | Opened from the Product Management lesson link. Three written fields saved. **Mark complete** used on the open task. | Saved text remained after refresh. Read-the-case and the three written sections showed complete. **Choose one bet** stayed open. |
| Northwind Lab | Opened at its URL after Data Analytics enrolment. One example query run. | The lab loaded `northwind_sales.csv`. The screen showed one result row and 166 valid rows. That figure was not recomputed from the file. |
| Skylent AI, unavailable | Lesson panel on Data Analytics lesson 1, and the public site question box | Both say help is not switched on. The lesson and the questionnaire still work. |

The earlier student sessions from the audit could not be resumed. Passwords were not stored, and those browser sessions were gone. The signed-in journeys above used new students created through signup.

## 2. What is genuinely open

Open for enrolment in the local catalogue UI:

- Data Analytics (`data-analytics-pro`), with the Data Analytics course
- Product Management (`product-management`), with the Product Management course

Public pages that are real destinations, with the limits in the next section:

- `/` homepage
- `/programmes` and `/programmes/:slug`
- `/education` and the sample degree pages
- `/career-os` and its public area pages
- `/path` and `/path/result`
- `/login`, `/signup`, `/reset-password`
- `/about`, `/contact`, `/institutions`, `/terms`, `/privacy`, `/verify`
- `/courses/:slug` for published course outlines
- `/skills`, `/labs`, `/os`, `/universities`, `/workshops`, `/events`, `/stories`, `/blog`, `/education/exams`, `/education/school`

Signed-in pages reached with a new student:

- `/dashboard/student`
- `/learn/data-analytics` and `/learn/product-management`
- `/career-os` profile, projects, applications, opportunities, interviews, and support
- `/os/labs/data-analytics/northwind`
- `/os/projects/product-management/harbor-desk-case`

## 3. Unavailable, planned, or not verified

Unavailable or planned in the interface:

- Other professional programmes and the SQL certificate are not open for enrolment.
- Degree pages are samples. Applications are not open. Skylent does not award those degrees.
- Workshops, schooling, and exam prep are planned. They cannot be booked or sat.
- Events had no published sessions. Nothing on that page could be booked.
- Career OS does not publish jobs and does not fill a profile, projects, or applications.
- Skylent AI does not answer until a provider is configured.

Not verified end to end:

- Lessons 4 through 15, quizzes after Foundations check, assignments, and the capstone
- Certificate claim and a real verification page
- A live AI answer, including an open quiz
- Clicking Career OS **Try again** after a failed load
- Saving the Harbor Desk task **Choose one bet**
- Creating an application
- Password-reset mail and Google sign-in
- Faculty, organisation, recruiter, and admin screens after sign-in
- Contact or degree enquiry submission
- Catalogue or degree pages while their list requests fail
- The live site

## 4. Northwind Lab access

This behavior was observed and was not changed.

- On Data Analytics lesson 7, while that lesson is **Locked**, the lesson page does not show **Open Northwind Lab**.
- After the learner is enrolled in Data Analytics, opening `/os/labs/data-analytics/northwind` directly still loads the lab.
- The lab identifies the file as fictional `northwind_sales.csv`. One example query returned a visible result. The displayed valid-row count was not checked independently.

## 5. Confirmed defects and verification gaps

Confirmed defects from the audit were corrected in the working tree before this document. They are not open defects:

- Unmatched menu search no longer drops the query on the way to programmes.
- The events page no longer invites registration when no sessions are published.
- The workshops page no longer calls the catalogue a live course.
- The online degree sample no longer clips the line that says the sample files are not assigned.
- Education and Career OS menus no longer describe sample degrees or job outcomes as current.

No further confirmed frontend defect came out of the signed-in checks.

Verification gaps, not reproduced failures:

- Certificate issuance
- Live AI responses
- Career OS retry after a failed request
- Job applications
- The rest of the Data Analytics course
- Production

## 6. Automated checks

These commands were run during the public audit and passed. They were not run again during the signed-in verification or during this readiness review. No application source file was changed for this document.

- `npx tsc --noEmit`
- `npx tsx scripts/test-programme-positioning.ts`
- `npx tsx scripts/test-degree-catalogue.ts`
- `npx tsx scripts/test-public-catalogue-copy.ts`
- `npx tsx scripts/test-catalog-truth.ts`
- `npx tsx scripts/test-dashboard-navigation.ts`
- `npx vite build` (exit code 0)

## 7. Production smoke test

Run this on the release environment after deploy. Stop if a step contradicts the limitation list.

1. Open `/` and `/programmes`. Confirm only Data Analytics and Product Management can be started.
2. Open one programme that is not open and confirm it does not offer enrolment.
3. Open `/education` and one sample degree. Confirm applications are not open.
4. Open `/career-os/jobs` while signed out. Confirm no invented roles.
5. Search from the menu for a term with no suggestion. Confirm `/programmes` keeps the query.
6. Sign up a new student. Confirm the dashboard shows no lessons.
7. Enrol in Data Analytics. Complete lessons 1 and 2. Submit Foundations check. Confirm the dashboard resume moves forward and the lesson stays completed after refresh.
8. Enrol in Product Management. Open Harbor Desk from the lesson, save one written field, refresh, and confirm the text remains.
9. Open the Northwind Lab from its lesson only after that lesson is unlocked. Separately note whether the direct lab URL opens earlier.
10. Open lesson help and the public site question box. Confirm each says it is off when no provider is configured.
11. Open `/events` and `/workshops`. Confirm they do not offer a booking.
12. Do not expect a certificate, a live AI answer, or a job application unless those prerequisites below are met.

## 8. Prerequisites for the remaining checks

| Check | Prerequisite |
| --- | --- |
| Certificate issuance and verification | One learner completes every lesson in a course. The dashboard then shows **Claim certificate**. Open the returned code at `/verify/:code`. |
| Live AI responses | A provider and key are configured for the server. Repeat lesson help on an open lesson, then repeat it during an open quiz. |
| Career OS retry | A safe way to make one existing Career OS request fail without changing the API. Then click **Try again** on that block. |
| Job applications | At least one role is published in Opportunities. Apply through that screen and confirm the application appears only for that learner. |

## 9. Production

The live production environment was not tested. These results are from the local app only.
