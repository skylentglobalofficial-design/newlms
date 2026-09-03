This is the FINAL implementation direction.

IMPORTANT:

DO NOT stop improving the website design.

The current visual direction, typography, colours, glass treatment, animations and overall premium aesthetic are APPROVED.

Continue polishing the design where necessary.

However, now fix the biggest UX problem:

## REDUCE REPETITION + CREATE PROPER PAGE-BASED EXPERIENCES

Right now the LMS / learning journey / ecosystem concepts are appearing multiple times across the homepage.

For example:

* LMS is being shown around 3 times
* Learning Path is being shown around 3 times
* Similar product previews repeat across different sections

This makes the homepage unnecessarily long and reduces the impact of the actual product.

Do NOT remove these concepts.

Instead, give each concept ONE strong purpose.

---

# HOMEPAGE = STORY + PREVIEW

The homepage should introduce Skylent and create curiosity.

It should NOT contain the complete content of every Skylent product.

Think:

**Homepage = Preview**
**Dedicated page = Full Experience**

---

# 1. HERO

Keep the current hero design and polish it.

Hero LMS visual should remain.

But it is only a cinematic product preview.

Buttons:

Explore Learning → `/education`

Partner With Skylent → `/institutions`

Do not add another full LMS section immediately after the hero.

---

# 2. ECOSYSTEM SWITCHER

Keep:

STUDENT | INSTITUTION | INDUSTRY

This section should explain the three sides of Skylent.

Do NOT repeat the complete learning journey here.

### STUDENT

Discover
Learn
Build
Career

CTA:

Explore Student Experience → `/education`

### INSTITUTION

Programs
LMS
Faculty
Analytics
Outcomes

CTA:

Explore Institutional Platform → `/institutions`

### INDUSTRY

Skills
Projects
Talent
Hiring

CTA:

Explore Industry Ecosystem → `/career`

Keep this section conceptual and visual.

---

# 3. ONE LEARNING JOURNEY — ONLY ONE FULL LEARNING JOURNEY

The homepage should have ONLY ONE detailed learning journey.

Use:

Discover
→ Choose
→ Learn
→ Practice
→ Build
→ Assess
→ Certify
→ Career

Make it interactive.

Clicking each stage changes ONE preview panel.

Do not repeat this same journey anywhere else on the homepage.

This becomes the signature Skylent interaction.

---

# 4. LMS — ONLY ONE MAJOR LMS PREVIEW ON HOMEPAGE

The LMS should NOT appear as three different large sections.

Keep the best LMS presentation only once.

Use:

## THIS IS WHERE LEARNING HAPPENS.

Show:

Video
Notes
Quiz
Project
Assessment

with the module sidebar and progress.

This is the main LMS showcase.

CTA:

**Explore Skylent OS → `/os`**

The `/os` page will contain the deeper product experience.

Do NOT repeat the full LMS UI later on the homepage.

The Hero can still have a small LMS visual because it is a product teaser, but it should not be another complete LMS section.

---

# 5. PROGRAMS

Programs should focus on PROGRAMS, not LMS.

Show:

Data Science & AI
Data Analytics
Generative AI
Full Stack Development
Product Management

Each program should show:

Duration
Projects
Short description
Certification / outcome

Buttons:

**Preview**
**Explore Program**

Preview:

Open a compact modal/side panel.

Explore:

Navigate to:

`/programs/:slug`

The program detail page can contain the deeper learning experience.

Do NOT repeat the entire LMS interface on every program card.

---

# 6. PROGRAM CATEGORIES

Keep:

01 — DEGREE & CERTIFICATION
02 — CAREER ACCELERATOR
03 — SKYLENT LABS

This section should explain WHAT Skylent offers.

Do not repeat the learning journey here.

Each category should have:

Short explanation
Visual
CTA

For example:

Degree & Certification → `/education`

Career Accelerator → `/career`

Skylent Labs → `/labs`

---

# 7. CAREER

Career should focus specifically on:

## LEARN → BUILD → GET HIRED

Use the career pipeline:

Learning
→ Projects
→ Portfolio
→ Resume
→ Mock Interview
→ Interview
→ Job

This is NOT another learning journey.

It is specifically the career transformation.

At the end:

Glass offer-letter preview.

CTA:

**Explore Career → `/career`**

---

# 8. JOB BOARD

Job Board should be its own product experience.

Homepage:

Show only 2–3 representative jobs.

CTA:

**Explore Skylent Jobs → `/career#jobs`**

Clicking a job:

Open glass drawer.

Apply Now:

Open 5-step application demo:

Profile
→ Resume
→ Screening
→ Interview
→ Result

Make all steps interactive.

Do not create a second job-board section elsewhere on the homepage.

---

# 9. PARTNER ECOSYSTEM

Keep the interactive SVG ecosystem.

This section should explain:

University
→ Skylent
→ Faculty
→ Students
→ Industry
→ Career

Do NOT repeat the Student Learning Journey here.

Its purpose is:

## HOW SKYLENT CONNECTS THE ECOSYSTEM

Clicking:

University → `/universities`
Institution → `/institutions`
Industry → `/career`

Keep the visual interaction.

---

# 10. SUCCESS STORIES

Keep success stories focused ONLY on outcomes.

Do not show another learning journey here.

Show:

BEFORE
→ SKYLENT
→ NOW

Clearly label demo/sample stories until real verified data is provided.

CTA:

**View Success Stories → `/stories`**

---

# 11. INSTITUTIONS

Homepage should give only a strong preview.

Show:

Programs
LMS
Faculty
Analytics
Student Outcomes

CTA:

**Explore For Institutions → `/institutions`**

The actual institutional experience belongs on the dedicated page.

---

# 12. ABOUT

Keep the editorial manifesto.

Do not put product UI here.

Do not repeat LMS.

Do not repeat learning journey.

This is the human/brand side of Skylent.

CTA:

**About Skylent → `/about`**

---

# 13. DEDICATED PAGES

Every important concept must have somewhere deeper to go.

Create proper working routes:

`/education`
`/career`
`/os`
`/institutions`
`/universities`
`/labs`
`/stories`
`/about`

Program pages:

`/programs/data-science-ai`
`/programs/data-analytics`
etc.

Job pages:

`/jobs/:id`

All navigation and CTAs should actually route to these pages.

No dead buttons.

No fake links.

No unnecessary `href="#"`.

---

# 14. PAGE PURPOSE

Each page must have ONE clear purpose.

### `/education`

Programs + learning options + certification.

### `/career`

Career Accelerator + jobs + interview + application experience.

### `/os`

Full Skylent technology/product showcase:
Student
Faculty
Admin
Analytics
LMS

### `/institutions`

How universities/institutions work with Skylent.

### `/universities`

Degree programs + university partnerships.

### `/labs`

Workshops
Bootcamps
Masterclasses.

### `/stories`

Student transformation stories.

### `/about`

Mission + philosophy + Skylent story.

---

# 15. IMPORTANT — DON'T MAKE PAGES FEEL LIKE DUPLICATES

If a user clicks from homepage to `/os`, they should feel:

“I am now entering the actual Skylent product world.”

If they click `/career`:

“I am now entering the Skylent career ecosystem.”

If they click `/institutions`:

“I am now seeing how Skylent works for institutions.”

Each page must add DEPTH, not repeat the homepage.

---

# 16. INTERACTION RULE

Every major interactive element should actually work.

Examples:

Tabs → change content.

Journey steps → change preview.

Program Preview → opens modal.

Program Explore → opens program page.

Job → opens drawer.

Apply → opens application flow.

Application steps → navigate.

Ecosystem tabs → change content.

Partner nodes → show contextual information.

Navigation → routes correctly.

Mobile menu → opens/closes correctly.

Back buttons → work.

CTAs → have meaningful destinations.

---

# 17. DESIGN RULE

Again:

DO NOT STOP DESIGN POLISH.

Continue improving:

* spacing
* typography
* glass depth
* shadows
* transitions
* responsive behaviour
* hover states
* micro-interactions
* visual hierarchy
* image treatment
* section transitions

But do not introduce random new visual concepts.

The existing Skylent visual language is approved.

The goal now is:

**REFINE + CONNECT + FUNCTIONALISE**

not redesign.

---

# 18. GLASS

Keep glass as a product/technology language.

Use it for:

Hero LMS
LMS UI
Job drawer
Application modal
Offer letter
OS dashboard
Navigation
Interactive ecosystem UI

Do not make editorial sections glass-heavy.

---

# 19. MOBILE

Make sure the complete website works at approximately 375px.

On mobile:

* Hamburger navigation
* Learning journey becomes vertical
* LMS preview becomes compact/swipeable
* Job drawer becomes bottom sheet/full-screen panel
* Partner ecosystem becomes simplified vertical flow
* Tables become cards
* No horizontal overflow
* No broken animations

---

# 20. CONTENT DENSITY

This is important.

The website should NOT feel like:

Heading
↓
Paragraph
↓
6 cards
↓
Heading
↓
6 cards
↓
Dashboard
↓
Another dashboard
↓
Another learning path

Use visual breathing room.

Every section should have a clear reason to exist.

If two sections communicate the same idea, combine them.

---

# 21. FINAL HOMEPAGE STRUCTURE

Use approximately this hierarchy:

1. Hero
2. What Skylent Is / Ecosystem Switcher
3. One Learning Journey — interactive
4. Programs
5. This Is Where Learning Happens — ONE major LMS preview
6. Program Architecture — Degree / Career Accelerator / Labs
7. Career Transformation + Offer Letter
8. Skylent Jobs preview
9. Partner Ecosystem
10. Success Stories
11. Institutional Preview
12. About / Manifesto
13. Final CTA
14. Footer

Do not add another full LMS or another full learning-path section after these.

---

# 22. FINAL QUALITY CHECK

Before finishing, inspect the complete website and specifically look for:

* repeated LMS UI
* repeated learning journey
* repeated program information
* repeated career pipeline
* redundant cards
* dead buttons
* fake links
* inconsistent navigation
* mobile overflow
* unnecessary animations
* excessive glass
* excessive orange
* excessive copy

Remove or consolidate anything redundant.

But do NOT remove useful functionality merely to make the page shorter.

The final experience should feel:

**DEEP, NOT REPETITIVE.**

**INTERACTIVE, NOT OVERLOADED.**

**FUTURISTIC, NOT GIMMICKY.**

**PREMIUM, NOT GENERIC.**

**SKYLENT, NOT ANOTHER EDTECH TEMPLATE.**

Once this website phase is complete and all routes/interactions are working, stop adding major website concepts.

The next phase will be the actual **Skylent LMS product**.

For now, make this website the polished, functional, interactive front door to that LMS and the complete Skylent ecosystem.
