FINAL MASTER PRODUCT + UX + FUNCTIONALITY PASS

Do NOT redesign the Skylent visual identity from scratch.

The current visual direction is good and should continue to be polished:
- editorial-tech
- premium glass product UI
- Fraunces + DM Sans
- Skylent orange / deep ink / warm white / sand
- cinematic transitions
- premium spacing
- futuristic through interaction, not gimmicks

However, the current website is still more like a visual prototype than a complete education ecosystem.

Now make it logically complete, properly functional and product-like.

Do not add random sections.
Do not repeat existing concepts.
Do not remove the premium visual language.

The goal is:

A visitor should be able to understand Skylent,
explore Courses / Programs / Workshops,
see exactly how learning works,
understand the Career OS,
contact Skylent,
enrol in a program,
see a payment/enrolment flow,
and enter realistic demo dashboards for Student / Faculty / Organisation / Super Admin.

The actual production LMS backend will be built separately after this website.
For this phase, use realistic dummy data and fully functional frontend flows.

==================================================
1. FIX THE INFORMATION ARCHITECTURE
==================================================

The current homepage repeats LMS and Learning Journey concepts too many times.

Do NOT remove the concepts.

Give every concept ONE clear purpose.

Homepage:
- Brand
- Ecosystem
- Learning journey
- Courses / Programs preview
- Workshops preview
- LMS preview
- Career OS preview
- Success stories
- Institutions
- About / Blog
- Contact
- Final CTA

Dedicated pages:
- /education
- /courses
- /programs
- /workshops
- /career
- /career-os
- /os
- /institutions
- /universities
- /stories
- /blog
- /about
- /contact

Program/course detail pages:
- /courses/:slug
- /programs/:slug
- /workshops/:slug

Do not make the homepage a giant version of every page.

==================================================
2. NAVIGATION
==================================================

Make the navigation genuinely useful.

Use:

Education
  → Courses
  → Programs
  → Workshops

Career
  → Career OS
  → Jobs
  → Interview Preparation
  → Resume & Portfolio

Skylent OS
  → LMS
  → Student
  → Faculty
  → Organisation
  → Admin

For Institutions
  → Institutional LMS
  → Faculty
  → Analytics
  → Partnership

Universities

Success Stories

Blog

About

Contact

Primary CTAs:
Explore Learning
Partner With Us

Every item must actually route somewhere.

No dead links.
No fake buttons.
No unnecessary anchor-only navigation.

==================================================
3. COURSES, PROGRAMS AND WORKSHOPS MUST BE SEPARATE
==================================================

This is currently missing.

Create three clearly different experiences.

COURSES:
Shorter / focused learning experiences.

Examples:
Data Analytics
Python
Power BI
Generative AI
Product Management
etc.

PROGRAMS:
Longer structured career / certification journeys.

Examples:
Data Science & AI
Full Stack Development
Data Analytics with Gen AI
etc.

WORKSHOPS:
Short practical experiences.

Examples:
AI for Business
Prompt Engineering
Resume Building
Interview Masterclass
Power BI Workshop
etc.

On /courses:

Add:
Search
Category filter
Level
Duration
Mode
Price

Course cards should have:
Title
Duration
Mode
Level
Projects / lessons
Rating/demo data
Price
Original price if applicable
Discount if applicable
Enroll Now

On /programs:

Show:
Program duration
Learning format
Projects
Certification
Career support
Pricing
Upcoming batch

On /workshops:

Show:
Workshop duration
Date / batch
Instructor
Format
Price
Register Now

Do NOT mix Courses, Programs and Workshops into one generic card grid.

==================================================
4. COURSE DETAIL EXPERIENCE
==================================================

Every course must open its own page.

Example:

/courses/data-analytics

Page structure:

Hero
Course overview
What you will learn
Curriculum
Modules
Projects
Instructor
Learning format
Certification
Who this is for
FAQ
Pricing
Enroll Now

Make the curriculum expandable.

Example:

Module 01
Foundations

Module 02
Excel

Module 03
SQL

Module 04
Power BI

Module 05
Projects

Clicking a module expands lessons.

Do not show the full LMS dashboard here.

This is a sales/learning-information page.

==================================================
5. PROGRAM DETAIL EXPERIENCE
==================================================

Program pages should feel more premium and comprehensive.

Show:

Program overview
Duration
Learning model
Curriculum
Projects
Mentorship
Live classes
Certification
Career support
Interview preparation
Pricing plans
FAQ

Use a pricing comparison similar in logic to modern education platforms.

For example:

BASIC
Recorded learning
Certification

PRO
Recorded + Live
Projects
Mentorship
Certification

CAREER
Everything in Pro
Interview preparation
Resume/profile support
Career assistance

Use actual Skylent pricing only if already provided.
Otherwise use clearly marked demo pricing.

Do NOT make fake placement guarantees.

==================================================
6. PRICING + ENROLLMENT FLOW
==================================================

This is important.

Every paid course/program/workshop must have:

Enroll Now

Click:

1. Select plan
2. Login / Create account
3. Student details
4. Order summary
5. Payment method
6. Payment success
7. Enrolment confirmation

For the prototype, payment can be simulated.

Create a realistic payment UI with:
UPI
Card
Net Banking
EMI / other option if applicable

Do NOT claim that payment is actually processed.

After successful DEMO payment:

Show:

Enrollment Successful
Program added to your learning dashboard.

CTA:

Go to Student Dashboard

This must actually navigate to the demo dashboard.

Use realistic order ID / transaction ID generated in frontend.

==================================================
7. LMS — MAKE IT PROPER
==================================================

This is one of the most important fixes.

The current LMS preview is too shallow.

We need to demonstrate the ACTUAL LEARNING FLOW.

Create a realistic demo LMS.

Student opens a course.

Example:

Data Analytics with Gen AI

Sidebar:

MODULE 01
Introduction

✓ Lesson 01
✓ Lesson 02
→ Lesson 03

MODULE 02
Excel

MODULE 03
SQL

MODULE 04
Power BI

MODULE 05
Projects

MODULE 06
Assessment

The main lesson area must support:

VIDEO
PPT / NOTES
QUIZ
ASSIGNMENT

The flow should be:

Course
↓
Video Lesson
↓
PPT / Notes
↓
Quiz
↓
Assignment
↓
Submit
↓
Next Lesson
↓
Next Module
↓
Final Assessment
↓
Certificate

Implement this as actual frontend state.

Example:

Click Video
→ video state active

Click Notes
→ notes/PPT viewer

Click Quiz
→ quiz interface

Submit Quiz
→ score appears

Click Assignment
→ assignment submission interface

Submit Assignment
→ marked as submitted

Click Next
→ next lesson

Complete final module
→ assessment unlocks

Pass final assessment
→ certificate becomes available

Certificate button
→ opens certificate preview.

This should feel like a real LMS.

Do not merely show static cards representing these features.

==================================================
8. LMS ROLE SYSTEM
==================================================

Create realistic demo role switching.

Roles:

STUDENT
FACULTY / TEACHER
ORGANISATION
SUPER ADMIN

Provide a demo login selector.

Example:

Demo Student
Demo Faculty
Demo Organisation
Super Admin

No real authentication backend is required yet.

But each role should open a different dashboard.

--------------------------------
STUDENT DASHBOARD
--------------------------------

Show:

My Courses
Continue Learning
Progress
Upcoming Live Class
Assignments
Quizzes
Certificates
Career Readiness
Notifications

Student can open a course.

--------------------------------
FACULTY DASHBOARD
--------------------------------

Show:

My Courses
Classes
Students
Assignments
Quizzes
Attendance
Content
Announcements

Faculty can open a course and see dummy student progress.

--------------------------------
ORGANISATION DASHBOARD
--------------------------------

Show:

Programs
Students
Faculty
Cohorts
Analytics
Completion
Certificates
Reports

Organisation can switch between cohorts.

--------------------------------
SUPER ADMIN
--------------------------------

Show:

Users
Organisations
Courses
Programs
Workshops
Faculty
Students
Payments
Enrollments
Certificates
Analytics
Reports

Use realistic dummy data.

This is a DEMO ADMIN environment.

Do not imply that these are real production records.

==================================================
9. CAREER OS — NOT JUST A JOB BOARD
==================================================

This is a major correction.

Career OS is NOT:

"Here are some jobs."

Career OS should be:

LEARN
→ BUILD
→ PREPARE
→ APPLY
→ INTERVIEW
→ GET HIRED

Include:

Career Readiness Dashboard
Resume Builder
LinkedIn/Profile Builder
Portfolio
Interview Preparation
Mock Interviews
Aptitude Practice
Technical Interview Practice
HR Interview Practice
Communication / Soft Skills
Job Matching
Job Board
Application Tracker
Interview Tracker
Offer Tracker

Create a beautiful Career OS dashboard.

Example:

Career Readiness
72%

Resume
85%

Portfolio
70%

Interview
62%

Profile
90%

Then:

Recommended next action:
"Complete 2 mock interviews"

This makes Career OS an actual product.

==================================================
10. JOB APPLICATION FLOW — MAKE IT LOGICAL
==================================================

IMPORTANT:

The application flow should ONLY exist when the user is actually applying for a job.

Do NOT trigger job applications when someone enrols in a course.

Separate these flows:

COURSE ENROLLMENT
→ Payment
→ Enrollment
→ Student Dashboard

JOB APPLICATION
→ Apply
→ Profile
→ Resume
→ Screening
→ Interview
→ Result

If a student enrols in a Career Program, that does NOT automatically mean they applied for a job.

Inside Career OS:

Job
→ Apply Now

Then:

Step 1
Profile

Step 2
Resume

Step 3
Screening

Step 4
Interview

Step 5
Result

After applying:

Application Tracker:

Applied
→ Screening
→ Shortlisted
→ Interview
→ Selected / Not Selected

Use dummy jobs and dummy companies only as DEMO content.

Clearly mark demo data where appropriate.

==================================================
11. CAREER PREPARATION
==================================================

Add dedicated Career OS modules:

Interview Prep
Resume
Portfolio
Mock Interview
Aptitude
Technical Assessment
HR Interview
Communication

For example:

Interview Prep:

Technical Round
HR Round
Managerial Round

Mock Interview:

Start Mock Interview

Show sample questions.

Resume:

Build Resume
ATS Score
Download

Portfolio:

Projects
Skills
Achievements

These should be interactive demo components.

==================================================
12. CONTACT US
==================================================

Create a proper /contact page.

Do NOT just display an email address.

Form:

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

I want to:
Explore Courses
Join a Program
Attend a Workshop
Partner With Skylent
Institutional LMS
Career Support
General Enquiry

Message

Submit Enquiry

After submission:

Show a proper success state:

"Thanks. Your enquiry has been received."

Generate a dummy enquiry reference number.

For the prototype, store submission in frontend/local state.

Do not pretend an email was actually sent unless backend is connected.

Also show:

Email
Phone
Office / location if already available
Social links

==================================================
13. ABOUT + BLOG — FIX NAMING
==================================================

The current section that looks like a blog should NOT be called About Us.

Rename that navigation/content to:

BLOG

Create:

/blog

Blog cards:
Technology
Career
Education
AI
Industry

Each opens:

/blog/:slug

Keep the editorial visual style.

Then create a completely separate:

/about

About should be based on the real Skylent brand/company story.

Use:
Who we are
What Skylent is building
Why we exist
Mission
Vision
Education + technology philosophy
Ecosystem
Team / leadership if actual data is available

Do not invent founders, companies, achievements or statistics.

The About page should feel like a company page, not another product page.

==================================================
14. SUCCESS STORIES
==================================================

Keep the current visual style.

But do not fabricate real placement claims.

For demo content, clearly label:

DEMO STORY

Once real stories are available, the same component should accept real data.

Story structure:

Challenge
What Skylent provided
Learning journey
Career support
Outcome

Do not make unsupported salary/company claims.

==================================================
15. INSTITUTIONAL EXPERIENCE
==================================================

Institution page should show:

University / Institution
↓
Programs
↓
LMS
↓
Faculty
↓
Students
↓
Analytics
↓
Certification
↓
Career

Show demo organisation dashboard.

Institution CTA:

Request Partnership

→ /contact

Pre-fill the contact form intent as:

Partner With Skylent

==================================================
16. WORKSHOPS
==================================================

This must have its own page.

Create workshop listing.

Example:

AI for Business
Prompt Engineering
Career Readiness
Resume Masterclass
Interview Masterclass

Each workshop has:

Duration
Date
Mode
Instructor
Seats / availability if demo
Price
Register Now

Register flow:

Select workshop
→ student details
→ payment demo
→ registration confirmation

Do NOT mix workshops with long-term courses.

==================================================
17. REFRESH / PERFORMANCE FIX
==================================================

The current site feels laggy during scrolling.

Fix performance aggressively without changing the design.

Problems to solve:

- slow scrolling
- delayed section rendering
- lag when switching tabs
- heavy blur
- unnecessary re-renders
- animations running when invisible
- slow route transitions
- blank/delayed preview states

Use:

IntersectionObserver
CSS transform + opacity
requestAnimationFrame only when required
lazy loading
code splitting where appropriate
memoized components where useful
local state instead of unnecessary global state

Do NOT use setInterval for scroll-driven animation.

Do NOT update React state continuously on every scroll event.

Do NOT keep hidden dashboards animating.

Stop animations when offscreen.

Reduce expensive backdrop-filter usage on huge containers but preserve the visual appearance.

Lazy-load below-the-fold images and heavy preview components.

Do not sacrifice the current premium visual quality.

==================================================
18. SCROLL REVEAL SYSTEM
==================================================

The current design has a nice effect where content appears with a slight blur and becomes sharp as you scroll.

Make this a CONSISTENT design system.

Every major section should enter naturally:

Initial:
opacity 0
translateY(...)
blur(...)

On entering viewport:

opacity 1
translateY(0)
blur(0)

Use IntersectionObserver.

Do NOT make every tiny card individually animate.

Animate:
section heading
main visual
major content group

Use stagger only where it improves the experience.

Keep animation fast and premium.

No excessive cinematic delays.

Respect:

prefers-reduced-motion

Mobile should use lighter animation.

==================================================
19. PAGE TRANSITIONS
==================================================

When navigating to a dedicated page:

Use a subtle transition.

Do not make page navigation feel slow.

No fake loading screens.

If content is ready, show it immediately.

==================================================
20. SEARCH / FILTERS
==================================================

Where relevant:

Courses:
search + category + level + duration

Programs:
category + mode

Workshops:
category + date + mode

Jobs:
location + experience + work mode + skill

All filters should actually work against the dummy data.

==================================================
21. DEMO DATA ARCHITECTURE
==================================================

Do not hard-code every UI component independently.

Create centralized demo data structures for:

courses
programs
workshops
modules
lessons
students
faculty
organisations
jobs
applications
certificates
blog posts
success stories
payments

Then render the UI from this data.

This will make it possible to replace demo data with Supabase/API later.

==================================================
22. PAYMENT / ENROLLMENT
==================================================

Use the pricing logic of modern education platforms as inspiration:

- clear plan comparison
- original vs current price where applicable
- monthly/EMI option where applicable
- clear benefits per plan
- strong Enroll Now CTA
- order summary
- checkout
- confirmation

PW Skills uses differentiated plans with features such as recorded/live learning, certification, assignments, interview preparation and job assistance; Coding Ninjas similarly packages learning, projects, mock interviews, profile building and placement assistance. Use that PRODUCT LOGIC as inspiration, but create Skylent's own structure and branding. :contentReference[oaicite:1]{index=1}

AlmaBetter also separates courses/program types and connects them with career/interview/job ecosystems and counselling; use the same principle of clear product architecture, not their visual design. :contentReference[oaicite:2]{index=2}

Do NOT copy any competitor's UI, text, branding or claims.

==================================================
23. RESPONSIVE
==================================================

Test at:

1440px
1280px
1024px
768px
375px

Fix:

horizontal overflow
broken modals
drawer sizing
navigation
tables
dashboard layouts
LMS sidebar
career dashboard
pricing cards

On mobile:

LMS sidebar becomes collapsible.
Job drawer becomes full-screen sheet.
Pricing cards stack.
Dashboards become scrollable cards.
Partner map becomes a vertical flow.

==================================================
24. VISUAL RULE
==================================================

Continue improving the existing design.

Do NOT flatten it.

Keep:
glass
depth
orange accent
editorial typography
dark/light contrast
micro-interactions
scroll reveals
premium spacing

But remove:
unnecessary cards
repeated LMS interfaces
repeated learning paths
emoji icons
generic SaaS gradients
excessive glow
excessive blur

The site should feel like:

A REAL EDUCATION TECHNOLOGY ECOSYSTEM.

Not a landing-page template.

==================================================
25. FINAL HOMEPAGE STRUCTURE
==================================================

Keep the homepage focused:

1. Hero
2. Ecosystem: Student / Institution / Industry
3. One Learning Journey
4. Courses / Programs / Workshops preview
5. One strong LMS preview
6. Career OS preview
7. Partner ecosystem
8. Success stories
9. Institutional preview
10. Blog preview
11. Contact CTA
12. About / brand statement
13. Final CTA
14. Footer

Do not add another LMS section.
Do not add another learning journey.
Do not add another generic feature grid.

==================================================
26. FINAL ACCEPTANCE TEST
==================================================

Before finishing, test the website as if you are a real student.

FLOW A:

Homepage
→ Courses
→ Course detail
→ Pricing
→ Enroll Now
→ Student details
→ Demo payment
→ Success
→ Student Dashboard
→ Open course
→ Video
→ Notes/PPT
→ Quiz
→ Assignment
→ Next lesson
→ Next module
→ Final assessment
→ Certificate

FLOW B:

Homepage
→ Career
→ Career OS
→ Resume
→ Interview Prep
→ Mock Interview
→ Jobs
→ Select job
→ Apply
→ Profile
→ Resume
→ Screening
→ Interview
→ Application Tracker

FLOW C:

Homepage
→ Workshops
→ Workshop detail
→ Register Now
→ Payment
→ Confirmation

FLOW D:

Homepage
→ Institutions
→ Institutional preview
→ Request Partnership
→ Contact form
→ Submit
→ Enquiry confirmation

FLOW E:

Homepage
→ Skylent OS
→ Demo Login
→ Student / Faculty / Organisation / Super Admin
→ Each role opens the correct dashboard

FLOW F:

Homepage
→ Blog
→ Article
→ Back to Blog

FLOW G:

Homepage
→ About
→ Company story

Every flow must work.

No dead ends.

No fake interactions.

No accidental job application during course enrollment.

No duplicated LMS sections.

No duplicated learning journeys.

No console errors.

No obvious lag.

No broken mobile layout.

==================================================
FINAL INSTRUCTION

Do not stop at making the page LOOK functional.

Make the interactions actually work using frontend state and centralized demo data.

Do not build the real backend yet.

Build the frontend architecture so the demo data can later be replaced by Supabase/API without rebuilding the UI.

Do not redesign Skylent.

Do not remove the premium visual direction.

Continue visual polish where necessary.

This is the final WEBSITE productization pass.

After this, the next phase is the actual Skylent LMS.