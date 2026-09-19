# Skylent Product + Experience Foundation V1

**Status:** Phase 0/1 — definition lock (documentation only)  
**Repository baseline:** `main` (audited March 2026)  
**Audience:** Product, design, engineering — all future implementation phases  
**Rule:** This document describes what exists, what is partial, and what is future. It does not claim capabilities that are not in the codebase.

---

## Document map

1. [Executive summary](#1-executive-summary)
2. [Repository audit](#2-repository-audit)
3. [Product positioning](#3-product-positioning)
4. [North star](#4-north-star)
5. [User hierarchy](#5-user-hierarchy)
6. [Product ecosystem](#6-product-ecosystem)
7. [Vertical experience map](#7-vertical-experience-map)
8. [Homepage purpose](#8-homepage-purpose)
9. [Design foundation](#9-design-foundation)
10. [Visual medium framework](#10-visual-medium-framework)
11. [Interaction principles](#11-interaction-principles)
12. [Learning engine](#12-learning-engine)
13. [Evidence model](#13-evidence-model)
14. [Information architecture](#14-information-architecture)
15. [Page-building methodology](#15-page-building-methodology)
16. [Product principles](#16-product-principles)
17. [Phase roadmap](#17-phase-roadmap)
18. [Skills as first vertical](#18-skills-as-first-vertical)
19. [Competitive differentiation](#19-competitive-differentiation)
20. [Not-now list](#20-not-now-list)
21. [Open questions](#21-open-questions)

---

## 1. Executive summary

Skylent is **one platform** with **one account, one backend, one database, one LMS core, and one CareerOS workspace** — but **multiple vertical experiences** that must not look or behave identically.

**What exists today (fact):**

- A production-shaped **public marketing + catalog** surface (education, skills, programs, courses, workshops, institutions, labs, content pages).
- A **real authentication system** (email/password, Google OAuth, multi-role sessions, CSRF).
- A **database-backed LMS** for enrolled students: curriculum nodes, lesson progress, quizzes, assignments, certificates.
- A **database-backed CareerOS** for authenticated users: profile, jobs, applications, interviews, practice, support.
- **Partial** operational dashboards for faculty, organisation, recruiter, and admin.
- A **shared light visual system** (canvas `#F6F4EE`, ink/slate typography, restrained orange accent, glass surfaces, domain aurora themes, `ProductVisual` mocks).
- A **hybrid data layer**: rich static content in `src/data.ts` overlaid with live catalog/LMS/Career APIs where implemented.

**What does not exist yet (fact):**

- A unified **evidence layer** product surface connecting LMS outputs to recruiter evaluation.
- **Payments**, **batch/cohort** operations, **faculty↔course assignment** in schema.
- **Recruiter** or **admin** backends consumed by their dashboards.
- Full **catalog migration** off static `data.ts`.
- Vertical-specific experience differentiation beyond marketing copy and accent colors.

**Strategic direction (recommendation):**

Finish **one complete end-to-end vertical** before multiplying pages. **Skills** (professional/certificate programs → enrollment → LMS → project/assessment → CareerOS profile) is the best candidate because the spine already exists.

**Positioning (recommendation):**

> **Skylent helps learners move from structured learning to demonstrable capability — and connects that capability to career action on the same platform.**

Not a course marketplace. Not an AI wrapper. Not a brochure site with a login button.

---

## 2. Repository audit

### 2.1 Frontend architecture

| Layer | Technology | Location | Status |
|-------|------------|----------|--------|
| Runtime | React 19 + Vite 8 | `src/main.tsx`, `vite.config.ts` | **EXISTING** |
| Routing | React Router 7 | `src/App.tsx` | **EXISTING** |
| Styling | Tailwind CSS v4 + inline tokens | `src/index.css`, `src/tokens.ts` | **EXISTING** |
| State | React context | `src/context/AuthContext.tsx`, `src/demo/DemoStateContext.tsx` | **EXISTING** |
| API clients | Fetch wrappers | `src/lib/*-api.ts` | **EXISTING** (admin client missing) |
| Static catalog content | Monolithic TS | `src/data.ts` (~2,400 lines) | **EXISTING** (marked for replacement) |
| Design system | Primitives + foundation | `src/components/ui.tsx`, `foundation.tsx`, `shared.tsx` | **EXISTING** |
| Product visuals | Deterministic UI mocks | `src/components/product/ProductVisuals.tsx` | **EXISTING** |
| LMS UI | Learn + dashboard components | `src/pages/LearnPage.tsx`, `src/components/lms/*` | **EXISTING** |
| CareerOS UI | Nested layout + workspaces | `src/pages/career/*`, `src/components/career/*` | **EXISTING** |

**Note:** Route lazy-loading exists on some branches (`cursor/perf-minimal-product-cdeb`) but **not on `main`** at audit time — eager imports in `src/App.tsx`.

### 2.2 Backend architecture

| Layer | Technology | Location | Status |
|-------|------------|----------|--------|
| Server | Express (Node) | `server/src/index.ts` | **EXISTING** |
| ORM | Prisma | `prisma/schema.prisma` | **EXISTING** |
| Auth | Session cookies + bcrypt + Google OAuth | `server/src/lib/auth.ts`, `routes/auth.ts` | **EXISTING** |
| Static prod serving | `dist/` from Express | `server/src/index.ts` | **EXISTING** |

**API mount points:**

| Prefix | Router | Status |
|--------|--------|--------|
| `/api/v1/health` | `routes/health.ts` | **EXISTING** |
| `/api/v1/catalog` | `routes/catalog.ts` | **EXISTING** (read-only) |
| `/api/v1/auth` | `routes/auth.ts` | **EXISTING** |
| `/api/v1/lms` | `routes/lms.ts` | **EXISTING** |
| `/api/v1/faculty` | `routes/faculty.ts` | **PARTIAL** |
| `/api/v1/organisation` | `routes/organisation.ts` | **PARTIAL** |
| `/api/v1/career` | `routes/career/*` | **EXISTING** |
| `/api/v1/admin` | `routes/admin.ts` | **EXISTING** (no frontend consumer) |

### 2.3 Database / domain models (summary)

**Identity & access:** `User`, `Role`, `UserRole`, `Session`, `UserIdentity`, `Organisation`, `OrganisationMembership`

**Catalog & learning:** `Program`, `Course`, `PricingTier`, `ProgramCourse`, `CurriculumModule`, `CurriculumNode` (VIDEO, NOTES, QUIZ, ASSIGNMENT, TOPIC), `UserEnrollment`, `LessonProgress`, `QuizAttempt`, `AssignmentProgress`, `AssignmentAttachment`

**Career:** `CareerProfile`, `CareerEducation`, `CareerExperience`, `CareerSkill`, `CareerProject`, `CareerLink`, `CareerResumeVersion`, `Job`, `Employer`, `SavedJob`, `JobApplication`, `ApplicationEvent`, `InterviewRound`, `InterviewPractice`, `InterviewQuestion`, `CareerSupportRequest`, `CareerSupportTask`

**Gaps (fact):** No faculty↔course assignment model. No batch/cohort entity. No payment/subscription tables. No first-class `Evidence` entity.

### 2.4 Route tree (current)

```
Public
  /, /education, /skills, /programs, /programs/:slug
  /courses, /courses/:slug, /workshops, /workshops/:slug
  /institutions, /universities, /labs, /labs/:labId, /labs/:labId/:experimentId
  /stories, /about, /blog, /blog/:slug, /contact, /login, /signup, /os

Authenticated — CareerOS (/career-os/*)
  overview, profile, jobs, applications, interviews, support (+ detail routes)

Role-guarded dashboards
  /dashboard/student | faculty | organisation | recruiter | admin

LMS learn (student)
  /learn/:slug, /learn/:slug/:lessonId

Redirects: /career → /career-os, /jobs → /career-os

Unwired legacy: CareerOSPage.tsx, CareerPage.tsx (not in App.tsx)
```

### 2.5 Auth & roles

| DB role | API/UI role | Default dashboard |
|---------|-------------|-------------------|
| STUDENT | student | `/dashboard/student` |
| FACULTY | faculty | `/dashboard/faculty` |
| ORGANISATION_ADMIN | organisation | `/dashboard/organisation` |
| RECRUITER | recruiter | `/dashboard/recruiter` |
| ADMIN | superadmin | `/dashboard/admin` |

Guards: `RoleRouteGuard`, `useRequireRole`, `CareerOSLayout` (auth only). Demo login gated by `VITE_DEMO_MODE` compile-time flag.

### 2.6 LMS capabilities

| Capability | Status |
|------------|--------|
| Program/course enrollment | **EXISTING** |
| Sequential lesson unlock | **EXISTING** |
| Video (Mux playback ID) | **PARTIAL** (placeholder when unavailable) |
| Notes lessons | **EXISTING** |
| Quizzes + attempts | **EXISTING** |
| Assignments + attachments metadata | **EXISTING** |
| Progress + resume | **EXISTING** |
| Certificate eligibility | **EXISTING** |
| Faculty review scoped to assigned courses | **FUTURE** |
| Payment before enroll | **FUTURE** |

### 2.7 Catalog

- **API:** Public read for programs/courses (`/api/v1/catalog/*`).
- **UI:** `ProgramsPage`, `CoursesPage`, detail pages use `src/data.ts` for marketing copy/curriculum; API overlays pricing, enrollment status, lesson counts where wired (`useCatalog`, `catalog-api.ts`).
- **Enrollment:** `EnrollmentModal` → `fulfillCatalogEnrollment` → `POST /lms/enrollments` → navigate to `/learn/:slug`.

### 2.8 CareerOS

| Area | Status |
|------|--------|
| Profile CRUD (education, experience, skills, projects, links, resumes) | **EXISTING** |
| Job board + saved jobs + applications | **EXISTING** |
| Interview rounds + practice | **EXISTING** |
| Support requests | **EXISTING** |
| Recruiter view of candidate evidence | **FUTURE** |
| Verified institutional credentials | **FUTURE** |

### 2.9 Role dashboards (honesty snapshot)

| Dashboard | Data source | Status |
|-----------|-------------|--------|
| Student | `/lms/dashboard` + static program copy | **EXISTING** / marketing **PARTIAL** |
| Faculty | `/faculty/dashboard` + demo constants when unscoped | **PARTIAL** |
| Organisation | `/organisation/dashboard`; batches stubbed | **PARTIAL** |
| Recruiter | `DemoStateContext` localStorage | **PLACEHOLDER** |
| Admin | UI shell; "API not connected" | **PARTIAL** |

### 2.10 Shared UI & visual system

| Asset | Path | Purpose |
|-------|------|---------|
| Color/spacing tokens | `src/tokens.ts` | JS inline styles (sync with CSS) |
| Global CSS + theme | `src/index.css` | Tailwind v4, glass vars, homepage classes |
| Domain accents | `src/aurora-themes.ts` | Per-vertical aurora colors |
| Role accents | `src/role-themes.ts` | Dashboard/LMS tab theming |
| Primitives | `src/components/ui.tsx` | Section, Button, Card, CTABand, etc. |
| Foundation | `src/components/foundation.tsx` | Aurora, GlassSurface, MediaImage, PublicCanvas |
| Shell | `src/components/shared.tsx` | Nav, Footer, EnrollmentModal, PageShell |
| Product mocks | `src/components/product/ProductVisuals.tsx` | `skylent:<id>` deterministic visuals |
| Media | `src/media.ts` | Photo refs + ProductVisual parsing |

**Design direction in repo briefs:** Calm, premium, information-first, editorial layouts; quality bar references Coursera/upGrad/Scaler/Unacademy professionalism without copying layouts (`src/imports/pasted_text/skylent-visual-realism-pass.md`). Explicit anti-patterns: imitate Coursera/Udemy/PW Skills/Coding Ninjas (`skylent-design-system.md`).

### 2.11 Labs

- Routes: `/labs`, `/labs/:labId`, `/labs/:labId/:experimentId`
- Data: `labSubjects[]` in `src/data.ts`
- Progress: `DemoStateContext` (localStorage) — **not** LMS-persisted
- Status: **EXISTING** as demo learning environment; **not** integrated with enrollment or evidence

### 2.12 Competitor research in repository

**FACT:** No formal competitor research folder. Incidental references in design briefs (`src/imports/pasted_text/`). Competitive analysis in Section 19 draws on brief mentions + general market knowledge — labeled accordingly.

---

## 3. Product positioning

### Options evaluated

| # | Positioning | Uniqueness | Clarity | Student appeal | Cross-vertical scale | Learn→opportunity |
|---|-------------|------------|---------|----------------|----------------------|-------------------|
| A | **Structured learning that becomes demonstrable capability** | High | High | High | High | Strong |
| B | **India-first exam + skills + career operating system** | Medium | Medium | High (exams) | Medium | Medium |
| C | **Institution-grade LMS with a public discovery layer** | Low | High (B2B) | Low | Medium | Weak |
| D | **Interactive learning playground (Brilliant-style)** | Medium | Medium | Medium | Low | Weak |
| E | **Professional upskilling marketplace** | Low | High | Medium | Low | Weak (commodity) |

### Recommendation: **Option A**

**Skylent is where structured learning turns into demonstrable capability — on one account, from schooling through career.**

Supporting proof points already in product:

- Homepage intents include "Build a project" → "Turn learning into evidence" (`HomePage.tsx`).
- Skills path: Learn → Practice → Build → Prove → Move Forward (`SkillsPage.tsx`).
- LMS assignments + CareerOS `CareerProject` + certificates (partial chain).
- Institutions/Faculty/Recruiter roles imply ecosystem, not just consumption.

**Avoid as primary line:** "AI-powered learning platform", "future of education", "personalized learning ecosystem" — none are defensible differentiators in this codebase today.

---

## 4. North star

### Product north star

**Help every learner produce verifiable proof of capability, not just completion.**

### Learner promise

**You will know what to do next, practice with feedback, build something real, and show it.**

### Platform promise

**One identity, one learning record, one career workspace — regardless of vertical.**

### Long-term differentiator

**Evidence-linked learning:** Skylent connects curriculum activity (assessments, projects, labs) to a portable profile recruiters and institutions can evaluate — without treating courses as the product.

### Platform model evaluation: LEARN → PRACTICE → BUILD → PROVE → MOVE

| Stage | Fits current product? | Evidence |
|-------|----------------------|----------|
| LEARN | **Yes** | Curriculum nodes, lessons, programs |
| PRACTICE | **Yes** | Quizzes, labs (demo), interview practice |
| BUILD | **Partial** | Assignments, CareerProjects; not unified project layer |
| PROVE | **Partial** | Certificates, assignment submission; no evidence object |
| MOVE | **Partial** | CareerOS jobs/applications; weak link from LMS outputs |

**Verdict:** The loop is **directionally correct** and already narrated on Skills + homepage. It is **not yet a single product mechanic** — stages exist in separate subsystems. Future phases should unify under one learner-visible progression without forcing identical UX per vertical.

---

## 5. User hierarchy

### Primary vs secondary (by surface)

| Surface | Primary user | Secondary |
|---------|--------------|-----------|
| Homepage | Prospective learner (undecided intent) | Parents, institution evaluators |
| Education / Exams | School + exam aspirants | Parents |
| Skills / Programs | Career builders, professionals | — |
| LMS / Learn | Enrolled student | Faculty (review) |
| CareerOS | Job-seeking learner | — |
| Institutions page | Institution decision-maker | — |
| Faculty dashboard | Instructor | — |
| Organisation dashboard | Academic admin | — |
| Recruiter dashboard | Hiring manager | — |
| Admin | Platform operator | — |

### Iteration priority (recommendation)

1. **Student / learner** — revenue and proof loop depend on enrollment → learn → evidence → career.
2. **Faculty** — needed for quality and assessment credibility.
3. **Institution** — distribution and B2B scale.
4. **Recruiter** — value unlock after evidence exists.
5. **Admin** — operations; can lag if honest empty states remain.

### Role wants & outputs

| Role | Wants | Produces | Consumes |
|------|-------|----------|----------|
| Student | Clear path, progress, proof, opportunity | Assignments, quiz scores, projects, profile | Curriculum, feedback, jobs |
| Faculty | Teach, assess, intervene | Reviews, grades, guidance | Roster, submissions |
| Institution | Run programs, measure outcomes | Cohorts, reports | Enrollment, faculty activity |
| Recruiter | Evaluate capability | Hires, interview decisions | Evidence, profiles |
| Admin | Operate platform | Users, roles, orgs | System health, policies |

**Rule:** Not every page serves every role. Homepage serves **intent discovery**, not faculty operations.

---

## 6. Product ecosystem

### Learner funnel (intended)

```
Homepage
  ↓ intent / vertical gateway
Vertical experience (Education | Skills | Exams | …)
  ↓ discovery
Program or course catalog
  ↓ decision
Program/course detail
  ↓ enroll (auth required)
Student dashboard
  ↓ continue
LMS (/learn)
  ↓ activities
Practice · Quiz · Assignment · Project
  ↓ outputs
Evidence (future unified layer)
  ↓
CareerOS profile · applications · interviews
```

### Operational funnel (intended)

```
Institution / Faculty onboarding (future)
  ↓
Program delivery + learner management
  ↓
Assessment & evidence verification
  ↓
Recruiter discovery (future)
  ↓
Hire
```

### Existence matrix

| Stage | Status |
|-------|--------|
| Homepage gateway | **EXISTING** (intent + domain grid + journey strip) |
| Vertical landing pages | **EXISTING** (variable depth) |
| Catalog browse/filter | **EXISTING** |
| Live pricing/enrollment status | **PARTIAL** (API overlay) |
| Enrollment + auth | **EXISTING** |
| Student dashboard | **EXISTING** |
| LMS delivery | **EXISTING** |
| Assessments | **EXISTING** |
| Unified evidence | **FUTURE** |
| CareerOS | **EXISTING** (weak LMS→profile link) |
| Faculty operations | **PARTIAL** |
| Institution analytics | **PARTIAL** |
| Recruiter marketplace | **FUTURE** |
| Payments | **FUTURE** |

---

## 7. Vertical experience map

**Rule:** ONE BRAND · MULTIPLE EXPERIENCES. Shared tokens; different rhythm, density, interaction, and hero logic.

| VERTICAL | USER | JOB | PRIMARY QUESTION | PRIMARY ACTION | CORE LOOP | OUTPUT | VISUAL PERSONALITY | INTERACTION STYLE | MUST NOT COPY |
|----------|------|-----|------------------|----------------|-----------|--------|-------------------|-------------------|---------------|
| **Schooling** | Student, parent | Build foundations | "What should my child learn next?" | Explore stage → program | Curiosity → Explore → Understand → Create | Subject mastery | Warm, structured, calm | Guided paths, simple progression | Skills card marketplace |
| **Competitive Exams** | Exam aspirant | Improve rank | "Where am I weak?" | Start diagnostic / program | Diagnose → Practice → Improve → Perform | Score improvement, mock performance | Focused, disciplined, metric-aware | Drill, timed practice, analytics | Generic course tiles |
| **Skills** | Professional learner | Job-ready capability | "What can I actually do?" | Pick skill → enroll | Learn → Practice → Build → Prove | Portfolio, certificate | Practical, workspace-like | Project previews, tool UIs | University brochure tone |
| **Undergraduate** | Degree student | Apply knowledge | "How does this connect to my degree?" | View program → enroll | Learn → Apply → Build → Demonstrate | Projects, credits narrative | Academic, cohort-oriented | Modules, outcomes map | Bootcamp urgency |
| **Postgraduate** | PG / specialist | Deep expertise | "Can I defend this work?" | Explore specialization | Research → Apply → Create → Defend | Thesis-grade deliverables | Scholarly, case-heavy | Cases, rubrics, defense prep | Undergrad pacing |
| **CareerOS** | Job seeker | Land role | "What should I do next in my search?" | Update profile / apply | Evidence → Profile → Opportunity | Applications, interviews | Operational, calm dashboard | Pipelines, status, tasks | Marketing gradients |
| **Institutions** | Academic leader | Run programs | "Can Skylent run our delivery?" | Contact / explore partnership | Deliver → Manage → Measure | Enrollment, progress reports | Credible, operational | Program maps, role clarity | Consumer hype |
| **Faculty** | Instructor | Teach & assess | "Who needs help?" | Open cohort / submissions | Teach → Guide → Review → Assess | Feedback, grades | Tool-like, low decoration | Queues, review surfaces | Student marketing hero |
| **Recruiter** | Hiring manager | Hire capability | "Can this person do the work?" | Review evidence (future) | Discover → Evaluate → Interview → Hire | Shortlist, hire | Neutral, evidence-first | Comparison, structured eval | Fake candidate walls |
| **Admin** | Operator | Govern platform | "What needs attention?" | Manage users/orgs | Operate → Monitor → Govern | Audit, provisioning | Sparse, data-dense | Tables, actions | Product marketing |

---

## 8. Homepage purpose

### What the homepage IS

- An **intent router** for undecided visitors.
- A **credibility frame** for the platform (editorial, calm, product-forward).
- A **gateway** to verticals — not their full explanation.

### What the homepage IS NOT

- A giant course catalog
- A generic EdTech brochure
- Any role's dashboard
- A physics demo site (orbit hero is illustrative, not the brand)
- A showcase of every vertical in full depth
- A recruiter or institution operations surface

### Homepage user

**Primary:** Prospective learner with unclear intent (student, professional, parent browsing).  
**Secondary:** Institution evaluator skimming credibility.

### Time-based experience

| Window | Goal |
|--------|------|
| **First 5 seconds** | Understand: "Skylent helps me learn and do something with it" + see one credible product moment |
| **First 30 seconds** | Self-identify via intent ("Understand / Build skill / Exam / Project") or domain (NEET, JEE, Analytics…) |

### CTAs

| Priority | CTA | Destination |
|----------|-----|-------------|
| **Primary** | Continue learning path / Explore programs | `/programs` or intent-specific vertical |
| **Secondary** | Sign in | `/login` |
| Tertiary | Institutions | `/institutions` |

(Current homepage: hero CTA "Continue →", domain grid links, journey strip — **EXISTING**.)

### Above the fold (recommendation)

- One clear headline + subhead (learner outcome, not technology)
- One **hero interaction** with product job (see below)
- Primary CTA + light sign-in entry
- **Not:** full catalog, pricing tables, faculty tools, fake metrics

### Below the fold (recommendation)

- Intent selector ("What are you looking for?")
- Domain discovery (exam/skill anchors)
- One featured program path (proof of depth)
- Learning engine concept (how Skylent works — not all verticals)
- Institutions + career mention (secondary)
- Stories / proof (real only)
- Final CTA

### Hero interaction — product job only (do not design here)

**Job:** In the first screen, prove Skylent is a **learning product** (not a landing page template) by letting the visitor **do one meaningful micro-learning action** that mirrors the north star loop.

**Requirements:**

- Consequence: user action → system feedback → understanding
- Domain-agnostic pattern (adjust variable → observe outcome → read explanation)
- Must not require login
- Must not dominate the page (support router, not replace it)
- Should be replaceable per campaign/vertical without rewriting the whole homepage

**Current implementation (fact):** `HeroInformationVisual` — orbit simulation with velocity control (`HomePage.tsx`). Aligns with job; domain-specific campaigns may swap this visual later.

---

## 9. Design foundation

### Shared across Skylent (ONE BRAND)

| Dimension | Principle | Current implementation |
|-----------|-----------|------------------------|
| **Typography** | Editorial hierarchy; display for headlines, sans for body, mono for labels/metadata | `skylent-display-*`, DM Sans, `tokens.ts` `type` scale |
| **Spacing** | Generous section rhythm; clamp-based responsive gutters | `T.section`, `T.gutter` |
| **Colour** | Warm canvas, ink text, slate secondary, orange as scarce action accent | `C.canvas`, `C.ink`, `C.orange` |
| **Surfaces** | Light glass levels; `#FFFDFC` cards on canvas | `GlassSurface`, CSS glass vars |
| **Borders** | Light, low-contrast (`T.lineLight`); radius 8px controls, 16px cards | `T.rControl`, `T.rCard` |
| **Navigation** | Global mega-menu for public; role dashboards use `AuthDashboardShell` | `shared.tsx` Nav |
| **Buttons** | Primary = accent fill; secondary = outline; one primary per section | `ui.tsx` Button |
| **Forms** | Clear labels, honest errors, mobile-first touch targets | Login, contact, CareerOS forms |
| **Accessibility** | Semantic headings, dialog labels, focusable controls | Partial — audit per phase |
| **Responsive** | Mobile nav hamburger; grid collapse at breakpoints | `globalCSS` in `shared.tsx` |
| **Motion** | Subtle fade; transition not decoration | `FadeIn`, brief aurora |
| **Density** | Information-first; minimal pills/badges | Direction in briefs; uneven in catalog pages |

### NOT shared rigidly (MULTIPLE EXPERIENCES)

| Dimension | Varies by |
|-----------|-----------|
| Hero composition | Vertical |
| Visual metaphors | Domain (exam vs skills vs schooling) |
| Interaction model | Exams = drills; Skills = workspaces; PG = cases |
| Page rhythm | Marketing vs dashboard vs LMS |
| Content density | Catalog vs learn vs CareerOS pipeline |
| CTA treatment | Enroll vs practice vs apply vs contact |
| Illustration vs photo vs product UI | See Section 10 |

---

## 10. Visual medium framework

**Rule:** Medium follows purpose. No bans; no mandates.

| Medium | Use when | Examples in repo | Avoid |
|--------|----------|------------------|-------|
| **Photography** | Human credibility, place, cohort reality | `PHOTO.*` in `media.ts`, education pages | Stock filler without context |
| **Information graphics** | Comparisons, flows, exam structures | Homepage domain SVGs, exam sections | Decoration without labels |
| **Diagrams** | Systems, pipelines, architecture | `ProductVisual` ecosystem flows | Over-abstract network graphs |
| **Product UI** | Prove the product exists | `ProductVisual`, hero orbit workspace, LMS previews | Fake dashboards with fabricated metrics |
| **Typography-only** | Principles, policies, dense copy | About, legal tone sections | Long unbroken walls |
| **Illustration** | Conceptual or youthful schooling | Domain scenes on homepage | Replacing real product proof |

### Decision framework

1. What must the user **understand** in 3 seconds?
2. Is truth best shown through **product**, **data**, or **human context**?
3. If we remove the visual, is any information lost?
4. If yes to #3 → use the visual. If no → cut it.

---

## 11. Interaction principles

**Interactive** at Skylent means: user action → system response → learner can make a better decision or progress.

### Reject

- Hover-only decoration
- Animation without state change
- Floating elements without function
- Interaction without consequence
- Gamification badges without learning meaning

### Reusable patterns (principles — apply per vertical)

| Pattern | Purpose |
|---------|---------|
| **Choose → reveal** | Intent routing, exam subject pickers |
| **Attempt → feedback** | Quizzes, orbit hero, lab experiments |
| **Adjust → observe** | Simulations, parameter labs |
| **Compare → decide** | Program tiers, career options |
| **Build → output** | Assignments, projects |
| **Submit → review** | Faculty assessment, application stages |
| **Progress → next challenge** | LMS unlock, exam topic completion |
| **Diagnose → prescribe** | Exam prep (future adaptive paths) |
| **Save → resume** | LMS progress, CareerOS drafts |

---

## 12. Learning engine

### Shared infrastructure (all verticals)

| Primitive | Backend | UI | Status |
|-----------|---------|-----|--------|
| Program / Course | Prisma | Catalog pages | **EXISTING** |
| Curriculum tree | `CurriculumModule` → `CurriculumNode` | `CurriculumRail`, `LearnPage` | **EXISTING** |
| Enrollment | `UserEnrollment` | EnrollmentModal | **EXISTING** |
| Lesson progress | `LessonProgress` | Learn workspace | **EXISTING** |
| Quiz | `QuizAttempt` | `AssessmentSurface` | **EXISTING** |
| Assignment | `AssignmentProgress` | `AssessmentSurface` | **EXISTING** |
| Certificate | `CertificateStatus` | LMS API | **EXISTING** |
| Labs (demo) | — | `labs/*` + DemoState | **PARTIAL** |

### Vertical mapping (UX differs; engine shared)

| Vertical | Engine emphasis | UX difference |
|----------|-----------------|---------------|
| Schooling | NOTES, VIDEO, light QUIZ | Slower pace, parental clarity |
| Exams | QUIZ, timed practice, analytics | Drill-heavy, weak-topic focus |
| Skills | ASSIGNMENT, project nodes | Workspace previews, portfolio |
| UG | Mixed modules + projects | Cohort + credit narrative |
| PG | ASSIGNMENT, case TOPIC nodes | Defense, rubric, depth |

**Do not** force identical lesson chrome across verticals. **Do** reuse progress, assessment, and enrollment primitives.

---

## 13. Evidence model

### Definition (target)

**Evidence** = a durable, reviewable record that a learner demonstrated a specific capability through platform activity.

### Candidate components today

| Component | Status | Location |
|-----------|--------|----------|
| Assignment submission | **EXISTING** | LMS `AssignmentProgress` |
| Quiz attempt / score | **EXISTING** | `QuizAttempt` |
| Certificate | **EXISTING** | LMS certificate endpoints |
| Career profile project | **EXISTING** | `CareerProject` (manual CRUD) |
| Lab experiment completion | **PARTIAL** | DemoState only |
| Unified Evidence entity | **FUTURE** | — |
| Faculty verification flag | **FUTURE** | — |
| Recruiter view | **FUTURE** | — |

### Proposed model (future — not implemented)

```
EvidenceItem {
  source: assignment | quiz | project | lab | external
  capabilityTags[]
  artifactRefs[]
  verifiedBy: self | faculty | system
  visibility: private | network | public
}
```

### CareerOS connection (future)

LMS completion → suggest EvidenceItem → learner approves → appears on CareerOS profile → recruiter filters by capability.

**Today:** Learner must manually add `CareerProject` entries. No automated bridge.

---

## 14. Information architecture

### Global public navigation (current)

`Education · Skills · Career OS · For Institutions` (+ Programs/Courses via mega-menu items)

**Recommendation:** Keep top-level lean. Route heavy discovery through homepage + vertical hubs, not mega-menu explosion.

### Navigation by context

| Context | Nav model | Primary destinations |
|---------|-----------|---------------------|
| **Public** | Mega-menu + footer | Verticals, programs, login |
| **Learner (enrolled)** | Student dashboard + learn sidebar | Continue, curriculum, career link |
| **LMS** | `CurriculumRail` | Lessons within course |
| **CareerOS** | `CareerOSShell` tabs | Profile, jobs, applications, interviews, support |
| **Faculty** | `AuthDashboardShell` | Cohorts, submissions (when scoped) |
| **Institution** | `AuthDashboardShell` | Programs, enrollments, reports |
| **Recruiter** | `AuthDashboardShell` | Pipeline (future) |
| **Admin** | `AuthDashboardShell` | Users, orgs, roles |

**Anti-bloat rule:** If a link does not serve the primary job of that context, remove it from that nav.

---

## 15. Page-building methodology

### Page template

```
PAGE
→ PURPOSE (why exists)
→ USER (primary)
→ PRIMARY JOB (one sentence)
→ PRIMARY ACTION (one button)
→ CONTENT HIERARCHY (headline → support → proof)
→ INTERACTION (if any — must have consequence)
→ PROOF (real data, product, or honest empty)
→ NEXT STEP (single clear path)
```

### Scroll-by-scroll method

Plan each page as stacked **scroll bands**, each with:

1. One heading
2. One supporting explanation
3. One primary action (or deliberate rest)
4. One proof element (product UI, data, or honest gap)

**No band should exist only because a competitor has it.**

---

## 16. Product principles

1. **Real data over decoration** — show product state or say it is not available.
2. **Product over brochure** — prefer UI previews to abstract marketing copy.
3. **One primary action per section** — reduce competing CTAs.
4. **Every interaction has a purpose** — consequence or cut it.
5. **Vertical experiences must differ** — shared brand, not shared templates.
6. **Do not fabricate social proof** — no fake ratings, learner counts, or hiring outcomes.
7. **Do not fabricate operational metrics** — dashboards show API data or empty states.
8. **Do not design around buzzwords** — ship capability, not labels.
9. **Mobile and desktop are peers** — test both before ship.
10. **Preserve logic when changing presentation** — enrollment, auth, LMS rules stay intact.
11. **Clarity over novelty** — information hierarchy beats visual surprise.
12. **Not every section is interactive** — stillness is valid.
13. **Visuals must communicate** — if removable without loss, remove.
14. **One platform, one identity** — no separate codebases per vertical.
15. **Finish one loop before multiplying pages** — end-to-end proof before breadth.

---

## 17. Phase roadmap

| Phase | Focus | Outcome |
|-------|-------|---------|
| **0** | Foundation definition | This document (**current**) |
| **1** | Homepage gateway lock | Intent router + hero job + honest CTAs |
| **2** | One complete vertical (Skills) | E2E: discover → enroll → learn → prove → CareerOS |
| **3** | Learning engine UX | Vertical-specific learn chrome on shared LMS |
| **4** | Evidence layer | Unified evidence objects + profile bridge |
| **5** | CareerOS connection | LMS outputs → profile; application proof |
| **6** | Additional verticals | Exams, schooling, UG/PG experiences |
| **7** | Faculty + Institution | Scoped operations, batches, review queues |
| **8** | Recruiter | Evidence-based discovery (post-evidence) |
| **9** | Admin | Wire UI to `/api/v1/admin` |
| **10** | Production scale | Payments, monetization, performance, compliance |

**Recommended order rationale:** Skills E2E proves the north star before exam vertical complexity or B2B institution sales cycles.

---

## 18. Skills as first vertical

### Why Skills first

| Criterion | Assessment |
|-----------|------------|
| Existing routes | `/skills`, `/programs`, `/courses`, `/learn`, `/career-os` |
| API coverage | Catalog + LMS + Career **EXISTING** |
| Narrative alignment | Skills page already states Learn→Prove→Career |
| Business clarity | Professional/certificate programs map to revenue |
| Risk | Lower than schooling (content regulation) or recruiter (no evidence yet) |

### E2E map

| Step | Status | Gap |
|------|--------|-----|
| Skills landing | **EXISTING** | Needs experience lock, not redesign sprawl |
| Skill discovery | **EXISTING** | Programs/courses filters |
| Programme detail | **EXISTING** | Static/API hybrid |
| Enrollment | **EXISTING** | No payment |
| Student dashboard | **EXISTING** | Reduce static marketing leakage |
| LMS | **EXISTING** | Mux placeholder gaps |
| Practice | **EXISTING** | Quizzes |
| Project | **PARTIAL** | Assignments exist; portfolio bridge weak |
| Evidence | **FUTURE** | No unified object |
| CareerOS | **EXISTING** | Manual profile; no auto-import |

### Implementation focus for Phase 2 (future — not this phase)

1. Skills vertical IA lock (one path, one tone).
2. Honest enroll → learn → complete flow without fabricated metrics.
3. Assignment completion → CareerOS project suggestion (minimal bridge).
4. Remove demo leakage on student surfaces.

---

## 19. Competitive differentiation

**Labeling:** FACT = verifiable; INFERENCE = reasoned; RECOMMENDATION = strategic choice.

### Landscape (INFERENCE from briefs + market)

| Player | Strength | Crowded? |
|--------|----------|----------|
| Coursera / Udemy | Catalog scale, brand | **Very crowded** |
| DataCamp / Codecademy | Interactive skill paths | Crowded for coding/data |
| Brilliant | Interactive STEM intuition | Niche, high polish bar |
| Mimo | Mobile micro-learning | Crowded |
| Labster | Lab simulations | Niche (science labs) |
| Unacademy / PhysicsWallah | Exam prep, live classes | Crowded in India exams |
| upGrad / Simplilearn / Scaler | Career outcomes marketing | Crowded in India upskilling |

### Gaps (INFERENCE)

- **Catalog platforms** rarely connect learning artifacts to hiring evidence on the same account.
- **Exam platforms** rarely connect to career product without bolt-on placement cells.
- **LMS vendors** rarely own consumer discovery + career in one UX.

### Skylent territory (RECOMMENDATION)

**Integrated learn-to-evidence-to-opportunity on one platform** — with India-relevant exam and institution paths as verticals, not as separate products.

### Do not copy (FACT — from `skylent-design-system.md`)

Coursera, Udemy, PW Skills, Coding Ninjas, Harvard layouts/branding. Adopt **product principles** only: clarity, progression, credible metadata, professional density.

---

## 20. Not-now list

| Item | Reason |
|------|--------|
| Giant course marketplace | Commodity; contradicts evidence positioning |
| Complex gamification (XP, leaderboards) | No engine; distracts from proof |
| Fake recruiter marketplace | Recruiter dashboard is demo-only |
| Unsupported analytics dashboards | Org/faculty lack batch model |
| AI tutor as headline feature | Not in core product; buzzword risk |
| Multiple codebases per vertical | Violates platform model |
| Payment gateway | No commercial model locked |
| Advanced recruiter matching | No evidence layer |
| Full catalog CMS migration | Large effort; defer until one vertical E2E |
| Fabricated ratings/reviews on catalog | `data.ts` contains rating fields — **do not surface** until real |
| Workshop live registration | Marked not live — keep honest |
| Admin UI without API wiring | Current honest empty state preferred over fake data |

---

## 21. Open questions

| # | Question | Owner | Blocks |
|---|----------|-------|--------|
| 1 | Is Skills the agreed first E2E vertical? | Product | Phase 2 |
| 2 | What is the minimum viable Evidence object? | Product + Eng | Phase 4 |
| 3 | When do payments enter scope? | Business | Monetization |
| 4 | Faculty assignment model — program or course scoped? | Product + Eng | Faculty dashboard |
| 5 | Batch/cohort entity — org-specific or global? | Product | Institution dashboard |
| 6 | Catalog: migrate `data.ts` to DB or hybrid long-term? | Eng | Content ops |
| 7 | Labs: integrate with LMS or remain demo? | Product | Science vertical |
| 8 | Homepage hero: one global interaction or vertical campaigns? | Design | Phase 1 |
| 9 | Recruiter: standalone product or institution feature? | Product | Phase 8 |
| 10 | Performance: merge lazy-route branch before next visual phase? | Eng | Infra |

---

## Appendix A — Key file reference

| Area | Files |
|------|-------|
| Routes | `src/App.tsx` |
| Auth | `src/context/AuthContext.tsx`, `server/src/routes/auth.ts` |
| LMS | `server/src/routes/lms.ts`, `src/lib/lms-api.ts`, `src/pages/LearnPage.tsx` |
| Catalog | `server/src/routes/catalog.ts`, `src/lib/catalog-api.ts`, `src/data.ts` |
| Career | `server/src/routes/career/`, `src/lib/career-api.ts` |
| Schema | `prisma/schema.prisma` |
| Tokens | `src/tokens.ts`, `src/index.css` |
| Design briefs | `src/imports/pasted_text/*.md` |

---

## Appendix B — Capability summary

| Capability | Status |
|------------|--------|
| Public marketing site | **EXISTING** |
| Auth (email, Google, roles) | **EXISTING** |
| Catalog API | **EXISTING** |
| LMS enroll + learn + assess | **EXISTING** |
| CareerOS workspace | **EXISTING** |
| Faculty scoped teaching | **PARTIAL** |
| Institution operations | **PARTIAL** |
| Recruiter hiring | **PLACEHOLDER** |
| Admin operations UI | **PARTIAL** |
| Evidence layer | **FUTURE** |
| Payments | **FUTURE** |
| Unified vertical UX | **FUTURE** |

---

*End of Skylent Product + Experience Foundation V1*
