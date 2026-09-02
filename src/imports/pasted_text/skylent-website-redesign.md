FINAL PRODUCT PASS — DO NOT REDESIGN. FIX THE ACTUAL EXPERIENCE.

We are almost out of Figma credits. Treat the current Skylent website as the approved visual direction.

DO NOT create new sections.
DO NOT add more marketing copy.
DO NOT add more LMS previews.
DO NOT add more glass cards just for visual effect.
DO NOT redesign the brand.

The current homepage has become too cluttered and the site still feels slow. Login/authentication is also not properly exposed as a real website entry point.

Your job in this pass is to simplify, connect and optimize the existing product.

==================================================
1. HOMEPAGE — REDUCE, DON'T ADD
==================================================

The homepage currently tries to explain too much.

It should NOT look like a complete LMS inside the homepage.

Homepage purpose:

1. What is Skylent?
2. Why is it different?
3. How does the ecosystem work?
4. What can a student/institution/career seeker actually do?
5. Where can I go next?

Keep only the strongest sections.

Recommended homepage structure:

NAV
↓
HERO
↓
ECOSYSTEM / VALUE PROPOSITION
↓
ONE learning journey
↓
ONE strong product/LMS preview
↓
Programs / Courses / Workshops
↓
Career OS
↓
Success Stories
↓
Partner / Institution ecosystem
↓
About/brand statement
↓
FINAL CTA
↓
FOOTER

IMPORTANT:

There must be ONLY ONE major LMS preview on the homepage.

There must be ONLY ONE major learning journey visualization.

There must be ONLY ONE Career OS preview.

Do not repeat the same concept in multiple sections.

If two sections communicate the same thing, REMOVE/MERGE one.

The homepage should create curiosity.

Dedicated pages should provide depth.

==================================================
2. HERO — FIX THE CURRENT BREAKING BEHAVIOUR
==================================================

This is a critical bug.

When the browser becomes narrow, the hero currently breaks / becomes visually dead.

Fix the hero responsively.

Test:

1440
1280
1024
900
768
600
540
430
390
375

Desktop:

Left:
headline
supporting statement
primary CTA
secondary CTA

Right:
premium Skylent product visual / ecosystem visual

Tablet:
Recompose the hero rather than simply shrinking desktop.

Mobile:

Stack vertically.

Headline must wrap naturally.

Product visual must resize/reposition.

No clipping.

No horizontal overflow.

No fixed desktop canvas.

No negative positioning that pushes content outside viewport.

No fixed hero height that causes content to disappear.

No huge visual occupying the entire mobile viewport.

Use CSS responsive layout rather than JS viewport hacks wherever possible.

If necessary, hide secondary decorative elements on mobile.

The hero must still look premium at 375px.

==================================================
3. NAVIGATION — LOGIN MUST BE REAL
==================================================

The public website currently does not make authentication feel like a real product.

Add a clearly visible:

SIGN IN

and:

GET STARTED / EXPLORE LEARNING

CTA.

Desktop navigation:

Logo
Education
Career
Institutions
Universities
About
Blog

Right:

Sign In
Explore Learning

Mobile:

Logo
Menu
Sign In

The Sign In button MUST route to:

/login

Do not make login a hidden dashboard feature.

==================================================
4. REAL LOGIN EXPERIENCE
==================================================

Create a proper:

/login

screen.

It should feel like entering Skylent OS, not a generic SaaS login.

Use the existing Skylent visual system.

Login:

Email
Password
Remember me
Forgot password
Sign In

Also provide demo access:

Student
Faculty
Organisation
Recruiter
Super Admin

These are demo accounts for the prototype.

After login:

Student → /dashboard/student
Faculty → /dashboard/faculty
Organisation → /dashboard/organisation
Recruiter → /dashboard/recruiter
Super Admin → /dashboard/admin

Logout must work.

Session must persist during navigation.

Protected dashboard routes must redirect unauthenticated users to /login.

==================================================
5. WEBSITE → PRODUCT TRANSITION
==================================================

The public website and Skylent OS should feel like two layers of the same ecosystem.

PUBLIC WEBSITE:

Warm / editorial / premium / glass accents.

SKYLENT OS:

Dark / focused / product-oriented / glass interface.

Do not make every homepage section dark.

Do not make every card glass.

The transition should feel deliberate:

Website
→ Sign In
→ Skylent OS

==================================================
6. STUDENT DASHBOARD
==================================================

The student dashboard must feel like a real learning product.

Top:

Good morning, [Name]

Next Action:

"Continue SQL — Module 03"

Primary CTA:

Continue Learning

Then:

My Learning
Upcoming Class
Progress
Assignments
Certificates
Career Readiness

Navigation:

Overview
My Learning
Courses
Assignments
Projects
Assessments
Certificates
Career OS
Messages
Profile

Do not fill the dashboard with meaningless statistics.

Every important card should have a next action.

==================================================
7. LMS — ONLY ONE DEEP PRODUCT EXPERIENCE
==================================================

The homepage preview should lead into the real LMS.

Course:

/learn/:courseSlug

Lesson:

/learn/:courseSlug/:lessonId

Course player:

LEFT:
Modules / lessons

CENTER:
Content

RIGHT:
Progress / next action

Actual learning sequence:

VIDEO
↓
PPT / NOTES
↓
QUIZ
↓
ASSIGNMENT
↓
PROJECT
↓
NEXT LESSON
↓
NEXT MODULE
↓
FINAL ASSESSMENT
↓
CERTIFICATE

Implement actual frontend state.

Video completion unlocks next step.

Quiz submission produces score.

Passing quiz unlocks next content.

Assignment can be submitted.

Project can be marked submitted.

Completing module unlocks next module.

Final assessment unlocks certificate.

Certificate remains locked until completion.

This is a DEMO product, so use realistic dummy data.

Do not pretend these are real student results.

==================================================
8. COURSES / PROGRAMS / WORKSHOPS
==================================================

Keep these as separate products.

Courses:
Skill-focused learning.

Programs:
Longer structured learning journeys.

Workshops:
Short practical experiences.

Routes:

/courses
/programs
/workshops

Each has its own listing page.

Each has detail pages.

Course:
Enroll Now

Program:
Enroll Now

Workshop:
Register Now

Do NOT place full LMS functionality inside these marketing/detail pages.

==================================================
9. ENROLLMENT
==================================================

Correct flow:

Course / Program
→ Enroll Now
→ authentication check
→ details
→ plan
→ payment
→ success
→ dashboard

If already authenticated:

SKIP LOGIN.

If not authenticated:

GO TO LOGIN
then return to enrollment.

Demo payment only.

Show:

UPI
Card
Net Banking

Generate demo order ID.

Enrollment must never create a job application.

==================================================
10. CAREER OS — NOT JUST JOBS
==================================================

Career OS should be presented as:

LEARN
→ BUILD
→ PROVE
→ PREPARE
→ APPLY
→ INTERVIEW
→ OUTCOME

Modules:

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

Jobs are ONE part of Career OS.

The student should be able to prepare before applying.

==================================================
11. JOB APPLICATION
==================================================

Keep job applications completely separate from enrollment.

Job:

View
→ Apply

Application flow:

Profile
→ Resume
→ Screening
→ Interview
→ Result

Application tracker:

Applied
Screening
Shortlisted
Interview
Selected / Not Selected

Use demo data.

Do not claim real jobs, real companies, placements or outcomes.

==================================================
12. FACULTY / ORGANISATION / RECRUITER / ADMIN
==================================================

Keep role-specific dashboards.

FACULTY:

Courses
Students
Classes
Assignments
Assessments
Attendance
Analytics

ORGANISATION:

Programs
Cohorts
Students
Faculty
Analytics
Reports

RECRUITER:

Jobs
Talent
Applications
Interviews
Offers

ADMIN:

Users
Courses
Programs
Workshops
Organisations
Enrollments
Payments
Certificates
Reports
Audit Logs

Every major dashboard item should open a functional demo view.

Do not create four visually identical dashboards with different labels.

==================================================
13. PERFORMANCE — CRITICAL
==================================================

The website currently feels slow.

Fix this before anything decorative.

Remove:

setInterval-based animation
continuous scroll-triggered React state updates
unnecessary large backdrop-filter regions
unnecessary blur layers
always-mounted heavy product previews
large images loaded immediately when below the fold

Use:

IntersectionObserver
requestAnimationFrame where required
CSS transform
opacity
will-change only where justified
lazy loading
content-visibility where appropriate
CSS animations instead of React state when possible

Do NOT continuously update React state during scrolling.

The blur-to-sharp section reveal can stay, but it must be lightweight:

opacity
transform
small blur

No huge blur radius.

No animation delay that makes the site feel slow.

Target smooth scrolling.

==================================================
14. GLASS EFFECT
==================================================

Preserve the existing Skylent glass identity.

But glass must create hierarchy.

Use glass for:

Navigation
Floating controls
Important product panels
LMS UI
Modals
Selected cards

Do NOT use glass on every card.

Avoid huge backdrop-filter surfaces.

The site should feel:

Futuristic
Premium
Editorial
Technical
Intelligent

NOT:

Generic SaaS
Generic blue EdTech
Neon cyberpunk
Glassmorphism everywhere

==================================================
15. SCROLL EXPERIENCE
==================================================

Every major section should have the existing premium reveal:

slightly blurred
slightly translated
then sharp

But make it fast.

No section should wait several seconds before appearing.

Use IntersectionObserver.

Animate only when entering the viewport.

Do not repeatedly trigger animations on every scroll.

==================================================
16. MOBILE NAVIGATION
==================================================

At mobile widths:

Show hamburger.

Open a full-screen or high-quality glass menu.

Menu must contain:

Education
Courses
Programs
Workshops
Career
Institutions
Universities
About
Blog
Contact

Sign In

Explore Learning

Every item must actually navigate.

No dead links.

==================================================
17. GLOBAL SEARCH
==================================================

Keep the existing search functionality but improve it.

Search:

Courses
Programs
Workshops
Blog

Example:

/courses?q=data

Results should actually filter.

Do not show a search box that only changes the URL.

==================================================
18. CONTACT
==================================================

/contact

Functional demo form:

Name
Email
Phone
I am a:
Student
Parent
Institution
University
Industry
Other

Interested in:
Courses
Programs
Workshops
Career
LMS
Partnership
Other

Message

Submit.

After submission:

Show confirmation and enquiry reference ID.

==================================================
19. ABOUT / BLOG
==================================================

Keep:

/about

as the actual Skylent company story.

Keep:

/blog

as editorial content.

Do not make About look like a blog.

Do not create additional editorial sections just for filler.

==================================================
20. ROUTE AUDIT
==================================================

Verify every important route:

/
 /courses
 /courses/:slug
 /programs
 /programs/:slug
 /workshops
 /workshops/:slug
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

No broken routes.

No obsolete route references.

No Vite import errors.

==================================================
21. FINAL HOMEPAGE RULE
==================================================

If a section can be removed without reducing understanding of Skylent, REMOVE IT.

The homepage should feel like a premium technology company introducing a new education ecosystem.

Not like:

"Here are 19 things we offer."

Less content.

More confidence.

Strong typography.

Strong product visual.

Strong transitions.

Strong whitespace.

==================================================
22. FINAL TEST
==================================================

Before finishing, test:

375px
390px
430px
768px
1024px
1440px

Then test:

Homepage
→ Sign In
→ Login
→ Student Dashboard
→ Course
→ Lesson
→ Video
→ Notes
→ Quiz
→ Assignment
→ Project
→ Assessment
→ Certificate

Then:

Student
→ Career OS
→ Resume
→ Mock Interview
→ Jobs
→ Apply
→ Application Tracker

Then:

Homepage
→ Course
→ Enroll
→ Login
→ Payment
→ Dashboard

Then:

Faculty login
→ Faculty Dashboard

Organisation login
→ Organisation Dashboard

Recruiter login
→ Recruiter Dashboard

Admin login
→ Admin Dashboard

Contact form
→ Success

Search
→ Results

Mobile navigation
→ Every route

==================================================
FINAL INSTRUCTION
==================================================

This is the FINAL IMPLEMENTATION PASS.

Do not add new concepts.

Do not add new sections.

Do not rewrite the brand.

Do not make the homepage longer.

Do not add more LMS previews.

Do not spend credits on decorative experimentation.

Prioritize in this exact order:

1. Fix broken mobile hero
2. Simplify homepage
3. Make Sign In visible and functional
4. Make authentication work
5. Make dashboards reachable and role-specific
6. Make LMS progression functional
7. Make enrollment/payment functional as a demo
8. Make Career OS functional
9. Fix performance / scroll lag
10. Fix all responsive layouts
11. Verify every route
12. Run build/typecheck and fix ALL errors

If something already works, KEEP IT.

Only modify what is necessary.

After implementation, do not give me a marketing-style summary.

Report only:
- what was actually fixed
- what could not be fixed
- whether build passes
- whether the listed flows were tested