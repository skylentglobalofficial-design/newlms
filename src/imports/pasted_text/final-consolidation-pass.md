FINAL CONSOLIDATION PASS — USE THE REMAINING CREDITS EFFICIENTLY

We have very limited remaining credits (~296).

This is the FINAL implementation pass.

DO NOT redesign the website.
DO NOT create a new visual concept.
DO NOT add unnecessary sections.
DO NOT rewrite working components.
DO NOT spend credits experimenting with alternative designs.

Treat the current Skylent website as the approved design.

Your job is to consolidate, fix, optimize and complete the existing product — including the new SKYLENT LABS layer.

==================================================
1. PRIORITY ORDER
==================================================

Work in exactly this order:

P0 — Fix broken / incomplete functionality
P1 — Fix responsive/mobile issues
P2 — Fix performance/scroll lag
P3 — Complete authentication + dashboards + LMS flows
P4 — Integrate Skylent Labs from the supplied lab resources
P5 — Final route/build/typecheck audit

If something already works, KEEP IT.

==================================================
2. HOMEPAGE — KEEP IT CLEAN
==================================================

The current homepage has already been reduced.

DO NOT add more sections.

Final structure should remain approximately:

NAV
HERO
VALUE / ECOSYSTEM
LEARNING JOURNEY
ONE LMS PRODUCT PREVIEW
COURSES / PROGRAMS / WORKSHOPS
CAREER OS
SKYLENT LABS TEASER
SUCCESS STORIES
PARTNER / INSTITUTION ECOSYSTEM
ABOUT
FINAL CTA
FOOTER

Important:

Only ONE major LMS preview.

Only ONE learning journey.

Only ONE Career OS preview.

Only ONE Labs teaser.

Do not repeat LMS, learning path, job board or program architecture multiple times.

The homepage should sell the ecosystem, not contain the entire ecosystem.

==================================================
3. HERO — MUST WORK PERFECTLY
==================================================

Fix the current mobile hero.

Test:

375px
390px
430px
540px
768px
1024px
1280px
1440px

Desktop:
Keep current premium product composition.

Tablet:
Recompose/scale it.

Mobile:
Stack content properly and show a simplified contained product visual.

Never:

horizontal overflow
clipped cards
negative off-screen elements
broken 3D transforms
fixed desktop widths
dead/empty hero area

Do not simply hide the entire hero product visual.

Make it intentionally responsive.

==================================================
4. NAV + AUTHENTICATION
==================================================

Public navbar must clearly show:

Sign In
Explore Learning

Sign In → /login

Mobile hamburger must contain:

Education
Courses
Programs
Workshops
Labs
Career
Institutions
Universities
About
Blog
Contact
Sign In

No dead links.

==================================================
5. LOGIN
==================================================

/login must be a proper Skylent OS entry screen.

Demo roles:

Student
Faculty
Organisation
Recruiter
Super Admin

Login → correct dashboard.

Student → /dashboard/student
Faculty → /dashboard/faculty
Organisation → /dashboard/organisation
Recruiter → /dashboard/recruiter
Super Admin → /dashboard/admin

Unauthenticated protected routes → /login.

Logout clears the demo session.

Keep localStorage/demo auth.

DO NOT implement real backend authentication in this pass.

==================================================
6. STUDENT DASHBOARD
==================================================

Keep the existing dashboard but make it action-first.

Navigation:

Overview
My Learning
Courses
Labs
Assignments
Projects
Assessments
Certificates
Career OS
Messages
Profile

Show a meaningful Next Action.

Example:

Continue Course
Complete Quiz
Submit Assignment
Continue Lab

Do not add meaningless dashboard statistics.

==================================================
7. LMS — FUNCTIONAL FLOW
==================================================

Keep the existing LMS visual design.

Routes:

/learn/:courseSlug
/learn/:courseSlug/:lessonId

Deep linking MUST work.

If URL contains lessonId, that lesson opens.

Sidebar click updates URL.

Refresh preserves the lesson.

Learning sequence:

VIDEO
→ PPT / NOTES
→ QUIZ
→ ASSIGNMENT
→ LAB
→ PROJECT
→ NEXT MODULE
→ FINAL ASSESSMENT
→ CERTIFICATE

Functional demo state:

Video completion
Quiz score
Assignment submission
Lab completion
Project completion
Assessment
Certificate unlock

Use local/demo state.

Do not build backend infrastructure.

==================================================
8. COURSES / PROGRAMS / WORKSHOPS
==================================================

Keep them separate.

Courses:

/courses
/courses/:slug

Programs:

/programs
/programs/:slug

Workshops:

/workshops
/workshops/:slug

Courses = skill learning.

Programs = structured long-term learning.

Workshops = short practical learning.

Each should have:

Overview
Curriculum
Outcome
Preview
Enroll/Register

Do not embed the full LMS into these pages.

==================================================
9. ENROLLMENT + DEMO PAYMENT
==================================================

Correct flow:

Explore
→ Enroll Now
→ Login if required
→ Details
→ Plan
→ Demo Payment
→ Success
→ Dashboard

If already authenticated:

skip login.

Demo payment UI only.

Do NOT connect real payment APIs.

Enrollment must never create a job application.

==================================================
10. CAREER OS
==================================================

Career OS is NOT just a job board.

Keep:

LEARN
→ BUILD
→ PROVE
→ PREPARE
→ APPLY
→ INTERVIEW
→ OUTCOME

Include:

Resume
Portfolio
Skills
Aptitude
Technical Interview
HR Interview
Mock Interview
Jobs
Applications
Interviews
Offers

Jobs are one part of Career OS.

==================================================
11. JOB APPLICATION
==================================================

Keep application flow separate from enrollment.

Job:

View
→ Apply
→ Profile
→ Resume
→ Screening
→ Interview
→ Result

Tracker:

Applied
Screening
Shortlisted
Interview
Selected / Not Selected

Use clearly marked demo data.

==================================================
12. SKYLENT LABS — INTEGRATE INTO THE EXISTING PRODUCT
==================================================

IMPORTANT:

The supplied ZIP laboratory resources are part of this project.

Use their actual contents as the source for the Labs catalogue.

Resources include laboratory material for:

Data Centric AI
BCA Full Stack Development
BBA
MBA
M.Com
M.Com Fintech
MCA
JG
GU
SSU Semester 3
SSU Semester 5

Inspect the supplied resources and organize their actual:

Programs
Semesters
Subjects
Labs
Experiments
Objectives
Instructions
Tasks
Expected outcomes

Do not invent laboratory names when actual source content exists.

==================================================
13. LABS PRODUCT
==================================================

Create:

/labs

Labs should be a real Skylent product, not just a marketing section.

Catalogue:

Program
Semester
Subject
Lab
Experiment count
Progress
Launch

Filters:

Program
Semester
Subject

Search.

==================================================
14. LAB DETAIL
==================================================

/labs/:labId

Show:

Lab
Program
Semester
Subject
Description
Experiment count
Progress

Then list the actual experiments.

Each experiment:

Number
Title
Objective
Status
Start / Continue

==================================================
15. EXPERIMENT WORKSPACE
==================================================

/labs/:labId/:experimentId

Create a functional demo workspace.

Structure:

LEFT:
Experiment navigation

CENTER:
Experiment / workspace

RIGHT:
Instructions + progress + submission

Flow:

Start
→ Instructions
→ Workspace
→ Submit
→ Evaluation
→ Complete

Status:

Not Started
In Progress
Submitted
Under Review
Completed

Workspace should adapt to the lab type:

Coding:
code/editor-style interface

Data/AI:
notebook/data-analysis style

Business:
case/task workspace

Simulation:
simulation/workspace style

If actual execution is unavailable, create a realistic demo interaction and clearly keep it as demo functionality.

==================================================
16. LAB + LMS CONNECTION
==================================================

Labs must integrate directly into the LMS.

Course:

Video
→ Notes
→ Quiz
→ Assignment
→ Lab
→ Project
→ Assessment
→ Certificate

"Launch Lab" should open the appropriate lab/experiment.

After completion:

return to LMS
→ update progress.

==================================================
17. LAB + LEARNING PROOF
==================================================

Completed labs should create evidence:

Experiment completed
Skill demonstrated
Score
Project/practical evidence

Show this in:

Student Learning Proof
Career OS / Portfolio

Do not fabricate employment results.

==================================================
18. FACULTY LABS
==================================================

Faculty dashboard:

Labs
Submissions
Evaluation

Flow:

Lab
→ Experiment
→ Student submission
→ Review

Actions:

Approve
Request Revision
Add Feedback
Score

Use demo state.

==================================================
19. ORGANISATION LAB ANALYTICS
==================================================

Organisation dashboard:

Lab Analytics

Show:

Completion
Average Score
Pending Evaluation
At-Risk Learners
Program Performance

Metrics must be clickable and meaningful.

==================================================
20. ADMIN LAB MANAGEMENT
==================================================

Super Admin:

Labs
Subjects
Experiments
Programs
Submissions
Evaluations

Use centralized demo data.

Do not duplicate datasets.

==================================================
21. LABS ON HOMEPAGE
==================================================

Do NOT add a large laboratory catalogue to homepage.

Use ONE concise teaser:

SKYLENT LABS

"Turn learning into practice."

Show one strong product preview.

CTA:

Explore Labs →

/labs

Nothing more.

==================================================
22. GLASS DESIGN
==================================================

Preserve the existing glass design.

Do NOT increase glass usage.

Glass should be used selectively:

Navigation
Product panels
LMS
Labs workspace
Modals
Important floating UI

Avoid glass on every card.

Avoid huge backdrop-filter surfaces.

Keep the current Skylent visual identity.

==================================================
23. SCROLL + PERFORMANCE
==================================================

Current website has refresh/scroll lag.

Fix it.

Remove unnecessary:

setInterval animations
continuous scroll React state updates
heavy blur
large always-mounted previews
unnecessary rerenders

Use:

CSS transforms
opacity
IntersectionObserver
requestAnimationFrame only where necessary
lazy loading
content-driven sizing

Section reveal:

small blur
opacity
translate

Fast and subtle.

No long animation delays.

The website should feel immediate.

==================================================
24. RESPONSIVE
==================================================

Audit:

375
390
430
540
768
1024
1280
1440

Check:

Navigation
Hero
Cards
LMS
Labs
Dashboards
Career OS
Forms
Modals
Tables

No horizontal overflow.

No clipped UI.

No dead spaces.

==================================================
25. SEARCH
==================================================

Global search should search:

Courses
Programs
Workshops
Labs
Blog

Search must actually filter results.

==================================================
26. CONTACT
==================================================

/contact

Functional demo form:

Name
Email
Phone
Type
Interest
Message

Submit:

Success state
Reference ID

==================================================
27. ROUTE AUDIT
==================================================

Verify:

/
 /courses
 /courses/:slug
 /programs
 /programs/:slug
 /workshops
 /workshops/:slug
 /labs
 /labs/:labId
 /labs/:labId/:experimentId
 /career-os
 /jobs
 /jobs/:id
 /institutions
 /universities
 /stories
 /blog
 /blog/:slug
 /about
 /contact
 /login

Protected:

/dashboard/student
/dashboard/faculty
/dashboard/organisation
/dashboard/recruiter
/dashboard/admin

LMS:

/learn/:courseSlug
/learn/:courseSlug/:lessonId

No broken imports.

No obsolete route references.

No dead links.

==================================================
28. DATA ARCHITECTURE
==================================================

Centralize demo data for:

courses
programs
workshops
labs
subjects
experiments
lessons
quizzes
assignments
projects
students
faculty
organisations
jobs
applications
certificates
skills
submissions
evaluations
payments

Do not hardcode duplicate data in every component.

Architecture should be replaceable later with:

Supabase
Auth
Database
Storage
Payments
Lab execution engines
AI services

==================================================
29. FINAL QA
==================================================

Run:

build
typecheck

Then manually verify:

Homepage → Login → Student Dashboard

Student → Course → Lesson → Quiz → Assignment → Lab → Project → Assessment → Certificate

Student → Labs → Experiment → Submit → Complete → Learning Proof

Faculty → Labs → Submission → Review

Organisation → Lab Analytics

Admin → Lab Management

Career OS → Resume → Mock Interview → Jobs → Application

Course → Enroll → Login → Demo Payment → Dashboard

Contact → Submit → Confirmation

Search → Results

Mobile → Navigation → Login → Dashboard → LMS → Labs

==================================================
30. CREDIT DISCIPLINE — EXTREMELY IMPORTANT
==================================================

Only ~296 credits remain.

Therefore:

DO NOT rebuild components unnecessarily.
DO NOT regenerate working UI.
DO NOT experiment with multiple layouts.
DO NOT add new animations.
DO NOT add new sections.
DO NOT refactor unrelated code.
DO NOT replace working components just for cleaner code.

Reuse existing:

components
styles
routes
data
glass system
animations
dashboard layouts
LMS components

Modify only what is required.

If a requested feature already exists, connect/fix it rather than rebuilding it.

Priority is FUNCTIONALITY > RESPONSIVENESS > PERFORMANCE > LAB INTEGRATION > DECORATION.

==================================================
FINAL OUTCOME
==================================================

The final Skylent ecosystem should clearly communicate:

PUBLIC WEBSITE
→ DISCOVER

SKYLENT OS
→ LEARN

SKYLENT LABS
→ PRACTICE

LEARNING PROOF
→ PROVE

CAREER OS
→ PREPARE + APPLY + INTERVIEW

OUTCOME
→ CAREER

The website should feel like ONE connected product ecosystem, not a collection of unrelated pages.

STOP after this pass.

Do not propose another redesign.

Do not add another section.

Do not spend remaining credits on visual experimentation.

At the end report only:

1. What was fixed
2. What Labs were integrated
3. Build/typecheck status
4. Any remaining blocker