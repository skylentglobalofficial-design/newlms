SKYLENT GLOBAL — FINAL MASTER PRODUCT + WEBSITE REDESIGN COMMAND

You are working on the existing Skylent.live codebase.

IMPORTANT:
This is NOT a request to create another generic AI-generated landing page.

You are redesigning and structuring Skylent as a serious, scalable Education + Skills + Career technology company.

Use the existing repository, existing routes, existing authentication, enrollment flows, LMS functionality and business logic as the source of truth.

DO NOT unnecessarily rewrite backend logic or break existing functionality.

==================================================
1. CORE SKYLENT PRODUCT MODEL
==================================================

Skylent is an ecosystem:

SKYLENT OS
│
├── EDUCATION
│   ├── Schooling
│   ├── Undergraduate
│   ├── Postgraduate
│   └── Competitive / Entrance Exams
│       ├── JEE
│       ├── NEET
│       ├── CAT
│       └── Other Exams
│
├── SKILLS
│   ├── Webinars
│   ├── Certificate Programs
│   ├── Professional Programs
│   └── Job Assistance
│
├── CAREER OS
│   ├── Interview Preparation
│   └── Job Board
│
└── INSTITUTION OS
    ├── Schools
    ├── Colleges
    ├── Universities
    ├── Skill / Training Institutions
    ├── Assessment / Exam Partners
    └── Academic / Industry Partners

This hierarchy must influence BOTH:
1. frontend UX/content architecture
2. backend/data/product architecture

Do not treat everything as a generic "course".

==================================================
2. CRITICAL SEGMENT LOGIC
==================================================

Schooling, UG, PG and Competitive Exams are fundamentally different products.

DO NOT simply change the title, color or image.

Each must have different:
- user intent
- information architecture
- curriculum structure
- learning experience
- assessment model
- dashboard requirements
- enrollment/batch logic
- institution use cases
- content presentation
- progression logic

SCHOOLING:

Audience:
Students + parents + schools + teachers.

Experience:
- age/grade appropriate
- friendly but premium
- subjects
- chapters
- activities
- assignments
- assessments
- academic progress
- teacher interaction
- parent visibility
- academic year
- class/section

Curriculum model:

Grade → Subject → Chapter → Lesson → Activity → Assessment

The visual language should feel engaging and trustworthy for children and parents.

Do NOT make Schooling look like a corporate MBA platform.

UNDERGRADUATE:

Audience:
College/university students.

Experience:
- degree/program
- semester
- subjects
- projects
- practical learning
- skills
- internships
- industry exposure
- placement readiness
- certificates
- career progression

Curriculum:

Degree → Semester → Subject → Module → Lesson → Assignment/Project

The visual language should be modern, ambitious, academic and career-oriented.

POSTGRADUATE:

Audience:
Advanced learners/professionals.

Experience:
- specialization
- advanced curriculum
- case studies
- research/application
- projects
- professional outcomes
- advanced career progression
- industry exposure

Curriculum:

Program → Term → Specialization → Module → Case/Project → Assessment

The visual language should be more mature, professional and sophisticated.

COMPETITIVE / ENTRANCE EXAMS:

Support:
JEE
NEET
CAT
and future exams.

Do NOT design exam preparation like a normal degree program.

Core experience:

Exam → Subject/Section → Topic → Concept → Practice → Test/Mock → Analytics → Performance

Must support concepts such as:
- batches
- schedules
- subjects
- topics
- practice
- question banks
- mock tests
- attempts
- scores
- performance analytics
- exam pattern
- faculty
- doubt support
- rank/performance where applicable

JEE/NEET can be subject-oriented.

CAT and other exams can be section-oriented.

The backend should be extensible enough to support additional exams later without rewriting the entire system.

==================================================
3. PUBLIC WEBSITE INFORMATION ARCHITECTURE
==================================================

Homepage should NOT attempt to explain every feature.

Primary flow:

NAVIGATION
↓
HERO
↓
WHAT ARE YOU LOOKING TO DO?
↓
CREATIVE TRANSITION INTO SKYLENT OS
↓
FEATURED PROGRAMS / LEARNING EXPERIENCES
↓
EDUCATION
↓
SKILLS
↓
CAREER OS
↓
INSTITUTIONS
↓
STORIES / PROOF
↓
FINAL CTA

Navigation:

Education
Skills
Career OS
For Institutions

Secondary:
Explore Programs
Login

About and Stories can exist in secondary navigation/footer.

==================================================
4. HERO
==================================================

Keep the current strong hero direction if it is already working.

Improve it with:
- real human photography
- premium editorial composition
- strong typography
- restrained motion
- clear CTA hierarchy

Primary positioning:

"From education to employability."

The hero should immediately communicate that Skylent connects learning, skills and career.

Avoid:
- random AI-generated 3D objects
- excessive glowing nodes
- abstract tech grids
- fake dashboards
- decorative visual noise

==================================================
5. "WHAT ARE YOU LOOKING TO DO?"
==================================================

Keep this concept.

But simplify it.

Do not dump every Skylent feature here.

Use a small number of high-level intents such as:

Learn
Build Skills
Prepare
Build Your Career

The interaction can then route users into the appropriate Skylent ecosystem.

==================================================
6. SKYLENT OS TRANSITION
==================================================

Do NOT immediately repeat:

"One ecosystem, every stage, every journey."

Instead create a creative visual transition showing progression:

EDUCATION
      ↓
   learning
      ↓
SKILLS
      ↓
   capability
      ↓
CAREER OS
      ↓
   opportunity

Make this feel like one continuous editorial journey.

Do NOT use:
- glowing square networks
- excessive lines
- AI-style node diagrams
- random geometric grids

Use typography, photography, subtle movement, spacing, lighting and composition.

==================================================
7. EDUCATION
==================================================

Education should clearly show FOUR distinct pathways:

Schooling
Undergraduate
Postgraduate
Competitive Exams

Do not display them as boring "Pillar 1 / Pillar 2 / Pillar 3" cards.

Create a visually connected but clearly differentiated experience.

SCHOOLING:
Engaging, human, parent-trust oriented.

UG:
Modern academic + career-oriented.

PG:
Advanced/professional.

EXAMS:
Performance-oriented and utility-first.

For competitive exams, show examples such as:
JEE
NEET
CAT
Other Exams

Do not fabricate course counts, success rates, ranks, student counts or outcomes.

==================================================
8. SKILLS
==================================================

Four clearly different product types:

WEBINARS

Should visually communicate an event:
- speaker
- date
- time/duration
- live/recorded status
- topic
- registration CTA

CERTIFICATE PROGRAMS

Should feel like structured academic/professional learning:
- duration
- level
- curriculum
- credential
- mode
- projects where applicable

PROFESSIONAL PROGRAMS

Premium conversion-oriented experience:
- strong program hero
- outcomes
- curriculum
- tools/technologies
- projects
- faculty/experts
- career support
- cohort/start date
- duration
- certification
- enrollment

JOB ASSISTANCE

This is NOT another course.

Present it as career support:
- interview preparation
- resume/profile support
- opportunities
- applications
- career guidance
- progression

Remove decorative lines/squares and unnecessary visual complexity.

==================================================
9. PROGRAM DETAIL PAGE
==================================================

Every real program should eventually follow a consistent information architecture.

Hero:
- institution/partner if applicable
- program name
- program type
- level
- mode
- duration
- cohort/start date
- certification
- CTA

Then:

Why this program
↓
Who it's for
↓
Curriculum
↓
Projects / practical learning
↓
Tools / technologies
↓
Learning experience
↓
Faculty / experts
↓
Career support where applicable
↓
Community / activities where applicable
↓
Testimonials only when real
↓
FAQs
↓
Apply / Enroll

Do not fabricate:
- university partners
- placement percentages
- salary numbers
- testimonials
- faculty credentials
- learner counts

==================================================
10. CAREER OS
==================================================

Career OS is a PRODUCT.

Do not design it like a normal marketing page.

It should eventually feel like a real career platform/dashboard.

Core concepts:

Career Readiness
Resume
LinkedIn/GitHub profile
Interview Preparation
Job Recommendations
Applications
Interview tracking
Skill gaps
Recommended actions
Job Board

Professional Programs can unlock Career OS where applicable.

Example flow:

Professional Program
↓
Enrollment
↓
Access Granted
↓
Career OS
↓
Career Readiness
↓
Skills / Profile
↓
Interview Preparation
↓
Jobs
↓
Applications
↓
Outcome

==================================================
11. INSTITUTIONS
==================================================

"For Institutions" must NOT be a generic partnership page.

Create different use cases for:

SCHOOLS
- learning
- assessments
- teacher tools
- student progress
- parent visibility

COLLEGES
- academic programs
- LMS
- skills
- projects
- placement readiness

UNIVERSITIES
- multi-program management
- departments
- curriculum
- assessments
- student lifecycle
- career outcomes

SKILL / TRAINING INSTITUTIONS
- programs
- batches
- learning
- assessments
- certification
- career support

ASSESSMENT / EXAM PARTNERS
- test delivery
- question banks
- attempts
- analytics
- performance

ACADEMIC / INDUSTRY PARTNERS
- industry projects
- expert sessions
- curriculum collaboration
- employability

This page should feel B2B SaaS / enterprise-grade.

==================================================
12. LMS
==================================================

Do not force the marketing website design into the LMS.

LMS should be functional/product-first.

Suggested structure:

Sidebar:
Overview
My Learning
Calendar
Assignments
Assessments
Live Classes
Resources
Community
Certificates
Career OS
Help

Dashboard:
- greeting
- continue learning
- enrolled programs
- progress
- upcoming classes
- assignments
- assessments
- certificates
- Career OS access

Course player:
Video/content area
+
Course outline
+
Modules
+
Lessons
+
Resources
+
Assignments
+
Discussion
+
Previous/Next

But curriculum structure must change depending on product type.

==================================================
13. BACKEND / DATA LOGIC
==================================================

Before introducing new backend structures, inspect the existing schema and APIs.

Preserve existing functionality.

Where architecture needs extension, use a common core with segment-aware models.

Core concepts should support:

Institution
Institution Type
Program
Program Type
Offering
Cohort
Batch
Curriculum
Learner
Enrollment
Entitlement
Assessment
Attempt
Progress
Certificate
Outcome

The system should be capable of distinguishing:

SCHOOL
UNDERGRADUATE
POSTGRADUATE
EXAM_PREP
WEBINAR
CERTIFICATE
PROFESSIONAL

Exam-specific metadata should support:

exam
examPattern
subjects/sections
topics
tests
attempts
scores
analytics

Do not create unnecessary duplicate systems.

Use reusable abstractions where appropriate, while allowing each segment to have its own rules.

==================================================
14. VISUAL SYSTEM
==================================================

The entire brand must feel like ONE company.

Use:
- dark premium foundation where appropriate
- white/off-white typography
- one controlled primary accent system
- subtle supporting gradients
- strategic glass surfaces
- real photography
- editorial layouts
- strong typography
- generous spacing
- restrained motion

Do NOT use 50 different colors.

Different ecosystems can have subtle atmospheric differences through:
- lighting
- gradient intensity
- imagery
- composition
- motion

But they must still look unmistakably like Skylent.

Glass UI should be strategic.

Do NOT make every card glass.

Use solid editorial sections + photography + glass overlays where useful.

==================================================
15. REMOVE AI-GENERATED VISUAL CLICHÉS
==================================================

Remove or reduce:
- random glowing squares
- floating cubes
- excessive aurora
- fake graphs
- fake metrics
- random node networks
- decorative lines everywhere
- excessive gradients
- meaningless 3D objects
- generic AI startup aesthetics

AI can exist as a capability inside Skylent.

AI should NOT be the visual identity of Skylent.

==================================================
16. STORIES
==================================================

Stories should feel like a professional editorial/newsroom system.

Not:
"Blog card 1 / Blog card 2 / Blog card 3."

Use:
- featured story
- article/editorial hierarchy
- real imagery
- category
- date
- author where available
- meaningful typography

Only use real content.

==================================================
17. ABOUT
==================================================

About should feel like a serious company profile.

Explain:

Why Skylent exists
What Skylent is building
Skylent OS
Education
Skills
Career
Institutions
Vision
Mission
What we are building
Long-term direction

Do not make About look like a generic blog.

==================================================
18. RESPONSIVE DESIGN
==================================================

Everything must work properly on:

Desktop
Tablet
Mobile

Do not simply shrink desktop components.

Mobile must have intentional:
- typography
- spacing
- navigation
- cards
- CTA placement
- image cropping
- scrolling behavior

==================================================
19. CONTENT RULE
==================================================

Never invent factual business information.

If actual data does not exist:
- use neutral placeholders
- label sample/demo content
- create data-ready components

Do not invent:
student counts
placements
salaries
partners
ratings
testimonials
faculty
certifications
success percentages

==================================================
20. EXISTING FUNCTIONALITY
==================================================

Before changing architecture, inspect the existing project.

Preserve:
- authentication
- AuthContext
- enrollment
- ApplyModal
- EnrollmentModal
- JobDrawer
- dashboards
- LMS
- enrollment deep-links
- existing APIs
- existing database functionality

Do not break existing routes.

Maintain compatibility with existing:
 /courses
 /programs
 /workshops
 /career-os
 /career
 /jobs
 /jobs/:id
 /os

Use redirects where already implemented.

==================================================
21. IMPLEMENTATION STRATEGY
==================================================

Do NOT blindly redesign everything in one giant visual rewrite.

First inspect the current implementation.

Then make the architecture and UI consistent with this master direction.

Priority:

1. Information architecture
2. Segment/product logic
3. Navigation
4. Homepage
5. Education
6. Skills
7. Career OS
8. Institutions
9. Program detail pages
10. LMS
11. Backend/data alignment where required

Reuse existing components where they are good.

Refactor only where necessary.

Do not create unnecessary technical complexity.

==================================================
22. FINAL QUALITY BAR
==================================================

The finished product should feel like:

A serious Indian/global education technology company.

It should have the product depth of modern platforms such as major EdTech, university-learning and professional-learning companies, but it must NOT copy any competitor's branding or layout.

Benchmark for:
- clarity
- information architecture
- program depth
- learner journeys
- institutional workflows
- dashboards
- conversion UX
- credibility

But create Skylent's own identity.

FINAL TEST:

Ask yourself:

"Would this website look credible if Skylent were presented tomorrow to a university, school, coaching institute, enterprise partner, student and parent?"

If not, improve it.

Do not ask me repeated clarification questions about the above requirements.

Use this command as the source of truth for the Skylent redesign.