# Skylent Phase 1 — Path-first architecture

## Product decision

Skylent is not positioned as a catalogue of courses first. The core public product is a **path**: understand where a learner is, understand where they want to go, identify gaps, then connect those gaps to learning, practice, evidence, and Career OS.

Courses, Professional Programmes, Degrees, Exams, Labs, and Career OS remain product families underneath that path.

## Existing code to preserve

- `server/` — do not modify in Phase 1.
- Prisma/database schema — do not modify in Phase 1.
- Existing API contracts — do not modify in Phase 1.
- Authentication and role guards — preserve.
- Existing LMS enrolment/progress/learning workspace — preserve.
- Existing Professional Programme template — preserve; Product Management is a content instance, not the Skylent identity.
- Existing public editorial pages — preserve unless explicitly redesigned in a later phase.

## Existing code to reposition

| Existing area | Phase 1 role | Action |
|---|---|---|
| `src/App.tsx` | Routing shell | Add `/path`; preserve existing routes and redirects. |
| `src/pages/HomePage.tsx` | Product entry point | Reframe around Path, not course catalogue. |
| `src/components/home/*` | Existing visual/content modules | Keep available; migrate/recompose gradually instead of deleting. |
| `src/lib/product-architecture.ts` | Public IA | Keep as source for existing product families; add Path as the top-level discovery concept. |
| `src/pages/ProgramPage.tsx` | Professional Programme detail | Keep reusable and content-driven. |
| `src/pages/ProgramsPage.tsx` | Programme catalogue | Keep as downstream destination from a learner path. |
| `src/pages/CoursesPage.tsx` | Course catalogue | Keep as downstream learning inventory. |
| `src/pages/CareerOS*` | Evidence/opportunity layer | Keep; do not turn Career OS into a marketing promise. |
| `/dashboard/*`, `/learn/*`, `/os/*` | Authenticated workspace | Preserve existing product behaviour. |

## New information architecture

```text
Skylent
│
├── Path                         ← primary product discovery
│   ├── You are here
│   ├── You want to go here
│   ├── Your gaps
│   ├── Recommended learning
│   ├── Practice
│   ├── Build
│   ├── Prove
│   └── Next opportunity
│
├── Learn
│   ├── Courses
│   ├── Professional Programmes
│   ├── Workshops
│   └── Skills
│
├── Education
│   ├── Schooling
│   ├── Undergraduate
│   ├── Postgraduate
│   └── Competitive Exams
│
├── Practice
│   └── Labs / projects
│
├── Career OS
│   ├── Profile
│   ├── Evidence
│   ├── Opportunities
│   └── Applications / interviews
│
└── Skylent AI                  ← future intelligence layer
    ├── Intake
    ├── Gap analysis
    ├── Path generation
    ├── Progress adaptation
    └── Opportunity matching
```

## Phase 1 user flow

```text
Home
  ↓
Start your path
  ↓
Tell Skylent where you are
  ↓
Tell Skylent where you want to go
  ↓
Capture academic + current capability context
  ↓
Show a transparent starter path
  ↓
Recommend the relevant Skylent learning / practice / evidence layer
  ↓
Create or continue the authenticated workspace later
```

Phase 1 must **not** claim that the recommendation is an AI career guarantee. The current implementation is a product/UX foundation until a real assessment and recommendation engine is connected.

## Product-family hierarchy

### Courses
Short, focused skill units.

### Professional Programmes
Longer, career-focused pathways. Product Management is the first implementation of the reusable template.

### Degrees
Academic education. Existing degree architecture remains separate.

### Exams
Diagnostic → mastery → practice → mocks. Existing exam routes remain separate.

### Career OS
Profile, evidence, projects, opportunities, applications, interviews, and support.

## Long-term architecture

The long-term moat should come from the learner's longitudinal data and evidence graph, not from a single course catalogue:

```text
Learner identity
    ↓
Academic history + interests + capabilities
    ↓
Goals
    ↓
Skills / competency graph
    ↓
Learning activity
    ↓
Projects / assessments
    ↓
Evidence
    ↓
Career opportunities
    ↓
Outcomes
    ↓
Next path recommendation
```

That model allows Skylent to change its course inventory, partners, AI models, and delivery formats without changing the core product promise.

## Phase 1 implementation boundary

### Build now
- Path-first homepage.
- `/path` guided discovery experience.
- Honest starter recommendation UI.
- Reusable content structure for future AI recommendations.
- Documentation of the product architecture.

### Do later
- Real assessment engine.
- Learner profile persistence in backend.
- Competency graph.
- AI recommendation service.
- Adaptive plans based on progress.
- Opportunity matching based on evidence.
- Institution and employer integrations.

### Never make the identity
- A single course.
- Product Management.
- A generic LMS.
- A placement guarantee.
- An AI chatbot wrapper.

## Safety for the codebase

Do not delete `HomePage.tsx`, `ProgramPage.tsx`, or existing LMS files merely to change positioning. Phase 1 is an additive/recompositional frontend change. Backend and database remain untouched.
