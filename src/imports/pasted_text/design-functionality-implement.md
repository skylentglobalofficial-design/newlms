MASTER DESIGN + FUNCTIONALITY IMPLEMENTATION PASS

IMPORTANT: Do not redesign or alter the existing visual identity. Focus on adding the missing functionality and structure described above with minimal UI changes.

Implement all HIGH-priority fixes:

1. Add proper **authentication**: build /login and /signup pages with role selector (Student, Faculty, Organisation, Recruiter, Admin). Store currentUser in state and route based on role to /dashboard/[role]. Make Logout clear state.

2. Create dedicated pages & routes: /courses, /programs, /workshops, /career, /career-os, /jobs, /institutions, /universities, /stories, /blog, /about, /contact. Update nav menus to point here (no dummy links).

3. **Course/Program/Workshop listing**: each page lists items from a data model (title, category, etc.) with filters/search. Cards link to detail pages.

4. **Course detail pages** (/courses/:slug etc): show full syllabus, instructor, pricing, and an “Enroll Now” CTA. Enroll now triggers checkout.

5. **Enrollment/Checkout flow**: 
   - Enroll Now → if not logged in, redirect to /login.
   - After login, collect any missing student details, let user confirm plan/price.
   - Simulate payment: show UPI/Card form, then on submit show success page with Order ID. 
   - Do not trigger any job application or other flow here. 
   - Button: “Go to Student Dashboard”.

6. **Student Dashboard** (/dashboard/student): show “Continue Learning” list (in-progress courses), progress bars, upcoming tasks (quizzes/assignments), certificates earned, and “Career OS” entry point.

7. **Course player** (/learn/:courseId/:lessonId): 
   - Left sidebar: modules & lessons; mark completed ones with check.
   - Main content area: tabs for Video, Notes/PPT, Quiz, Assignment, (later Project, Assessment).
   - Video: embed video player.
   - Notes: show slides or text.
   - Quiz: present questions, record answers, show score on submit.
   - Assignment: show brief, provide file upload (simulate), mark submission.
   - After last lesson of a module, unlock “Next Module”.
   - After all modules, show “Final Assessment” tab.
   - On passing final assessment, unlock “Certificate” tab.

8. **Certificate Page**: show student name, course, date, Credential ID, plus earned skills and evidence (e.g. “3 Projects completed, 5 quizzes passed, Final Score 90%”).

9. **Career OS** (/career-os or /dashboard/student → Career): 
   - Career Dashboard: show Resume score, Interview readiness, Skill profile, Next action.
   - Resume Builder: provide form or link to AI resume template.
   - Portfolio: list student’s projects/submissions.
   - Mock Interview: interactive Q&A (static demo).
   - Jobs: list sample jobs with filters; each job Detail with Apply button.
   - Application Tracker: list applied jobs and status (Applied → Screening → Interview → Result).
   - Ensure *course enrollment does NOT auto-apply to jobs*; only jobs apply here.

10. **Faculty Dashboard** (/dashboard/faculty): list courses taught; for each, provide Student list with progress bars, assignments pending, etc. Add “Review” buttons to grade submissions (simulate marking).

11. **Organisation Dashboard** (/dashboard/organisation): list programs and cohorts; show stats (total learners, completion rate, average score) and alerts (e.g. “18 assignments overdue”). Each alert links to relevant data.

12. **Admin Dashboard** (/dashboard/admin): list Users, Organisations, Courses, Enrollments, Payments, Certificates, Analytics. Show count cards and links to detail lists.

13. **Recruiter Dashboard** (/dashboard/recruiter): list Talent (filter by skill, qualification), and Jobs posted. For each candidate, show skills and projects (preview); allow marking interview stage and offers.

14. **Global Search**: add a search bar in header (placeholder “Search courses, programs, jobs…”). On input, filter the relevant listing page (courses/programs/jobs) or show a search results page (bonus). 

15. **Contact Form** (/contact): make it functional. On submit, capture the enquiry (simulate storing in state) and show a success message with a reference ID (e.g. SKY-0001).

16. **Blog & About**: ensure “Blog” page lists articles with categories, and /blog/:slug shows full article. Rename existing “About us” content as needed. Keep About page company-focused, not an article.

17. **Data Model**: centralize demo data in code (courses, lessons, users, jobs, etc.). Use this data for all content rendering. No hard-coded repeated UIs.

18. **Performance & Responsiveness**: optimize animations (use CSS transition on scroll reveals, use IntersectionObserver). Reduce heavy blur (limit backdrop-filter usage). Test all breakpoints (1440,1280,1024,768,375px) and fix layout shifts (make sidebar collapsible on mobile, stack cards).

19. **Accessibility & Microinteractions**: add small feedback (button hover, active states), but **no flashy animations**. Ensure no horizontal scroll or console errors remain.

After implementing these, test these flows:

- **Flow 1 (Student)**: Home → /courses → choose course → enroll → login → checkout success → /dashboard/student → /learn/course → complete Video→Quiz→Assignment→Project→Assessment→Certificate. 
- **Flow 2 (Career)**: /dashboard/student → Career OS → build resume → mock interview → browse jobs → apply → track application status.
- **Flow 3 (Faculty)**: login as faculty → /dashboard/faculty → open a course → review pending assignments.
- **Flow 4 (Organisation)**: login as org → /dashboard/organisation → view cohort analytics.
- **Flow 5 (Admin)**: login as admin → /dashboard/admin → check users, courses, enrollments.
- **Flow 6 (Recruiter)**: login as recruiter → /dashboard/recruiter → post/view jobs → review candidate profile.
- **Flow 7 (Workshop)**: Home → /workshops → pick workshop → register → payment → confirmation.
- **Flow 8 (Contact)**: Home → Contact → submit form → show Ref ID.

Once all flows work (all navigable, correct state, no missing buttons), **STOP**. Do not add new features beyond these.

```text
**High-Priority Implementation Command Summary**: 
- Add routes/pages for all sections (Courses, Career OS, etc.) 
- Implement login with role-based redirect and logout.
- Build student/faculty/org/admin/recruiter dashboards.
- Implement the full LMS content flow and certificate.
- Create enrollment/payment UX (demo).
- Build Career OS modules (resume, jobs, applications).
- Centralize demo data, connect UI to it.
- Optimize performance (lazy-load, CSS animations, reduce blur).
