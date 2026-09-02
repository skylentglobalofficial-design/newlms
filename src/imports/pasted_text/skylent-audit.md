SKYLENT — PRODUCT ARCHITECTURE & UX CONSISTENCY AUDIT

The previous master redesign has now been implemented.

DO NOT redesign the website blindly.
DO NOT change the visual identity just for the sake of making it "more premium".
DO NOT rewrite working backend/auth/enrollment functionality.

Your job now is to audit the CURRENT implementation against the Skylent product model and identify/fix structural inconsistencies.

==================================================
1. SOURCE OF TRUTH
==================================================

Skylent has four major product ecosystems:

EDUCATION
- Schooling
- Undergraduate
- Postgraduate
- Competitive / Entrance Exams
  - JEE
  - NEET
  - CAT
  - Other Exams

SKILLS
- Webinars
- Certificate Programs
- Professional Programs
- Job Assistance

CAREER OS
- Interview Preparation
- Job Board
- Career Readiness

INSTITUTION OS
- Schools
- Colleges
- Universities
- Skill / Training Institutions
- Assessment / Exam Partners
- Academic / Industry Partners

The most important architectural principle:

SCHOOLING ≠ UG ≠ PG ≠ EXAM PREP.

They may share infrastructure, but their:
- learner
- institution
- curriculum
- assessment
- cohort/batch
- progression
- dashboard
- enrollment
- outcomes

must be logically distinguishable.

==================================================
2. INSPECT BEFORE CHANGING
==================================================

Inspect the existing:

- frontend routes
- components
- data structures
- program/course models
- enrollment flow
- LMS
- dashboards
- backend APIs
- Prisma/schema/database models
- authentication
- existing redirects

Understand what already exists.

Do not duplicate systems that already work.

Do not introduce unnecessary abstractions.

==================================================
3. AUDIT THE EDUCATION ARCHITECTURE
==================================================

Verify that the current implementation correctly distinguishes:

SCHOOLING

Grade → Subject → Chapter → Lesson → Activity → Assessment

UNDERGRADUATE

Degree → Semester → Subject → Module → Lesson → Assignment/Project

POSTGRADUATE

Program → Term → Specialisation → Module → Case/Project → Assessment

EXAM PREP

Exam → Subject/Section → Topic → Practice → Mock → Analytics

Check both UI and underlying data assumptions.

If the frontend says something is segment-specific but the data model treats everything as the same generic course, identify the problem.

==================================================
4. PROGRAM MODEL
==================================================

Create or refine a reusable program architecture that can support:

- School program
- UG program
- PG program
- Exam preparation program
- Webinar
- Certificate program
- Professional program

Every program should be capable of having common metadata:

- title
- description
- program type
- level
- mode
- duration
- start date
- cohort/batch
- institution/partner
- faculty
- curriculum
- eligibility
- pricing
- enrollment status
- certification
- career support where applicable

Then allow segment-specific metadata.

Do NOT force all fields onto every product.

==================================================
5. EXAM PREPARATION MODEL
==================================================

Make sure the architecture can support:

JEE
NEET
CAT
Other future exams

without requiring a rewrite.

Exam-specific properties may include:

- exam name
- exam pattern
- sections
- subjects
- topics
- question bank
- mock tests
- attempts
- scoring
- performance analytics
- batch
- faculty
- schedule

JEE and NEET may use subject-based structures.

CAT may use section-based structures.

The system must be extensible.

==================================================
6. ENROLLMENT LOGIC
==================================================

Audit this flow:

User
↓
Program
↓
Offering
↓
Cohort / Batch
↓
Enrollment
↓
Entitlement
↓
LMS / Product Access

Different products may have different enrollment requirements.

Examples:

Schooling:
Student + Parent + School/Class

UG:
Student + Degree/Program + Semester/Cohort

PG:
Learner + Program + Specialisation/Cohort

Exam Prep:
Aspirant + Exam + Batch

Professional Program:
Learner + Program + Cohort → Career OS entitlement

Do not implement unnecessary complexity now, but make the architecture capable of supporting this.

==================================================
7. LMS LOGIC
==================================================

Do not make one generic LMS experience for every learner.

The LMS should adapt based on product type.

Schooling:
- subjects
- chapters
- activities
- assignments
- assessments
- progress
- parent/teacher visibility

UG:
- semesters
- subjects
- modules
- assignments
- projects
- attendance where applicable
- assessments
- skills

PG:
- terms
- specialization
- advanced modules
- cases/projects
- assessments

Exam Prep:
- subjects/sections
- topics
- practice
- tests
- mocks
- performance
- analytics

Use shared LMS infrastructure where possible, but render the appropriate experience.

==================================================
8. INSTITUTION LOGIC
==================================================

Audit the institution architecture.

Different institution types should have different capabilities:

SCHOOL
→ students, teachers, classes, parents, academics, assessments

COLLEGE
→ departments, programs, faculty, students, skills, placements

UNIVERSITY
→ multiple institutions/departments/programs, academic lifecycle, assessments, outcomes

SKILL/TRAINING INSTITUTE
→ programs, batches, trainers, learners, certification, career support

ASSESSMENT/EXAM PARTNER
→ question banks, tests, attempts, scoring, analytics

ACADEMIC/INDUSTRY PARTNER
→ projects, experts, curriculum collaboration, employability

Do not make these merely six differently named marketing cards.

The architecture should be capable of supporting different workflows.

==================================================
9. CAREER OS ENTITLEMENT
==================================================

Verify that Career OS is treated as a product entitlement rather than simply another page.

Potential logic:

Professional Program
↓
Enrollment
↓
Eligibility / entitlement
↓
Career OS Access

Career OS should support:

- career readiness
- profile
- resume
- skills
- interview preparation
- job recommendations
- applications
- interview tracking
- skill gaps
- recommended actions

Do not break the current job/application functionality.

==================================================
10. HOMEPAGE AUDIT
==================================================

The current homepage should remain focused.

Check that it does NOT:

- explain every feature
- repeat the same ecosystem message
- contain excessive data
- use fake metrics
- use unnecessary decorative graphics

The intent section should remain:

Learn
Build Skills
Prepare
Build Your Career

Prepare should correctly lead toward competitive exam preparation.

==================================================
11. DESIGN CONSISTENCY AUDIT
==================================================

Keep the current visual direction.

Only fix inconsistencies.

Maintain:

- one Skylent brand system
- controlled colors
- premium dark foundation where appropriate
- real photography
- strategic glass
- editorial typography
- restrained gradients
- subtle motion

Remove only if still present:

- random glowing squares
- meaningless lines
- floating cubes
- excessive aurora
- fake graphs
- fake statistics
- generic AI visuals

Do NOT replace the entire design.

==================================================
12. CONTENT CREDIBILITY
==================================================

Search the codebase for fabricated-looking:

- student numbers
- placement percentages
- salary claims
- ratings
- testimonials
- university logos
- partner names
- faculty credentials
- success statistics

If factual data cannot be verified from existing project data, convert it to:
- real data binding
- neutral placeholder
- clearly labelled sample/demo content

Never invent business credibility.

==================================================
13. OUTPUT / IMPLEMENTATION
==================================================

After auditing:

1. Identify the highest-impact structural problems.
2. Fix only the problems that materially improve product correctness.
3. Preserve working functionality.
4. Avoid unnecessary visual redesign.
5. Avoid unnecessary backend rewrites.
6. Keep the implementation scalable.

At the end, provide a concise report:

A. What was already correct
B. What was wrong
C. What you changed
D. What still needs backend work
E. What should be built next

IMPORTANT:

Do not ask me to explain these requirements again.

Treat this command and the existing Skylent codebase as the source of truth.