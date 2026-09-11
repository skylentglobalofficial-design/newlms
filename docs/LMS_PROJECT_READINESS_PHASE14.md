# Phase 14 — LMS Project Readiness Audit

**Branch:** `cursor/lms-content-delivery-cdeb`  
**Audit base:** Phase 13 closed checkpoint `a274290` (`fix(release): harden production start and artifact replace`)  
**Mode:** Audit + selection only (no curriculum authoring, no implementation)  
**Date:** 2026-09-11

---

## 1. Scope

This audit evaluates the six remaining **title-only** LMS assignment nodes to determine which ONE is the strongest candidate for the next real end-to-end project after:

- `data-analytics` / `m5` / `l13` — **Project 1: Sales Analysis** (complete first-party project)

**In scope:** repository evidence for instructional content, datasets/starters, rubrics, submission definitions, and fit with the existing AssignmentBrief + artifact architecture.

**Out of scope:** implementing a new project; authoring curriculum; changing l13; LMS architecture refactors; Skills / public marketing / CareerOS / recruiter / OS product work.

---

## 2. Current Baseline

### Phase 13 release verdict (reference)

Phase 13 closed as **READY WITH DEPLOYMENT REQUIREMENTS** (local filesystem artifact storage needs a persistent/shared volume). Release hardening commit: `a274290`.

### Current l13 status

| Item | Status |
|------|--------|
| Curriculum node | `data-analytics` / `m5` / `l13` — `Project 1: Sales Analysis` |
| First-party brief | `content/lms/data-analytics/l13/brief.json` |
| Dataset contract + validation | `skylent_aether_home_goods_sales_v1.xlsx` + `dataset-validation.json` |
| Seed wiring | `seedAssignmentBriefSalesAnalysis()` in `prisma/seed.ts` (only AssignmentBrief seeder) |
| Runtime | Assignment GET includes brief; dataset download; artifact upload/download; written + stored-binary completion; unlocks `l14` |
| UI | Lazy `ProjectExperience` when `assignmentState.brief` is present (`LessonContent.tsx`) |

l13 is the **only** LMS node with an authored AssignmentBrief in this repository.

### Remaining six candidates

| # | Course slug | Module | Lesson | Catalog title |
|---|-------------|--------|--------|---------------|
| 1 | `data-analytics` | `m2` | `l6` | Excel Assignment |
| 2 | `data-analytics` | `m4` | `l12` | Dashboard Project |
| 3 | `data-analytics` | `m5` | `l14` | Project 2: HR Dashboard |
| 4 | `python-programming` | `m2` | `l6` | Data Project |
| 5 | `generative-ai` | `m2` | `l6` | AI App Project |
| 6 | `full-stack-web` | `m2` | `l6` | React Project |

Source of titles/structure: `src/data.ts` (curriculum catalog used by Prisma seed).  
Automated contract that all six remain brief-less: `scripts/test-lms.ts` section 23.

---

## 3. Evidence Rules

| Classification | Meaning |
|----------------|---------|
| **FIRST-PARTY** | Instructional material explicitly authored for that LMS curriculum node (brief, rubric, dataset contract, submission rules wired to the node). |
| **MARKETING** | Programme/course outcomes, `projectsDetail` cards, sales copy, portfolio claims. |
| **DEMO** | Catalog shells, placeholder UX, title-only ASSIGNMENT nodes, generic text submit path. |
| **UNRELATED** | Degree labs, certificate blurbs, CareerOS/OS demos, other programmes’ project cards that are not this LMS node’s brief. |
| **MISSING** | No repository artifact of that kind for the node. |

**Not accepted as a project brief:** marketing descriptions, programme outcomes, project cards, CareerOS demos, OS dashboards, generic activity blurbs, fabricated submissions, unrelated labs, quiz banks, screenshots alone, or titles without instructions.

Matrix cells: **PRESENT** / **PARTIAL** / **MISSING**.

---

## 4. Candidate Audit

Shared baseline for all six (unless noted):

- Curriculum ASSIGNMENT node exists in `src/data.ts` and is seeded as a `CurriculumNode`.
- Generic assignment API/UI works without a brief (`LessonContent.tsx` deferral: “This curriculum node uses the existing assignment submission path so you can continue the course. A dedicated project brief is not authored for this node yet.” + text `AssessmentSurface`).
- Platform supports assignment progress / attachments / unlock for ASSIGNMENT nodes.
- `content/lms/` contains **only** `data-analytics/l13/` — no other brief directories.
- Only `seedAssignmentBriefSalesAnalysis()` creates an `AssignmentBrief`.
- `scripts/test-lms.ts` asserts `brief === null` for each of these nodes.

---

### data-analytics / m2 / l6 — Excel Assignment

- **Current title:** Excel Assignment  
- **Readiness:** **NOT READY**

**Evidence found**

| Evidence | Classification | Location |
|----------|-----------------|----------|
| Catalog lesson `{ id: 'l6', title: 'Excel Assignment', type: 'assignment' }` | DEMO | `src/data.ts` (m2 Microsoft Excel) |
| Course outcomes mention Excel models / portfolio projects | MARKETING | `src/data.ts` course `data-analytics` |
| Professional programme Excel module + “Financial Analytics Model” card | MARKETING / UNRELATED | `src/data.ts` `data-analytics-pro` `projectsDetail` |
| l13 brief prerequisite path mentions “Excel Assignment” as sequence title only | UNRELATED (to an l6 brief) | `content/lms/data-analytics/l13/brief.json` → `prerequisites.sourceDerivedPath` |
| Test: `l6 must remain title-only (no brief)` | FIRST-PARTY (regression contract) | `scripts/test-lms.ts` |
| AssignmentBrief / dataset / rubric / project submission spec for l6 | MISSING | — |

**Evidence matrix**

| Item | Status |
|------|--------|
| 1. Objective / learning outcomes | MISSING (node-specific) |
| 2. Scenario / context | MISSING |
| 3. Problem statement | MISSING |
| 4. Learner task | MISSING |
| 5. Required deliverable | MISSING |
| 6. Constraints | MISSING |
| 7. Milestones / workflow | MISSING |
| 8. Evaluation rubric | MISSING |
| 9. Submission expectations | PARTIAL (generic text assignment only) |
| 10. Prerequisites / dependency | PARTIAL (implied by module order only) |
| 11. Required tools | PARTIAL (module title implies Excel) |
| 12. Dataset / starter files | MISSING |
| 13. Completion criteria | PARTIAL (generic assignment submit / unlock) |
| 14. Existing first-party UI/data/API support | PARTIAL (generic path; no `ProjectExperience` brief) |
| 15. Evidence locations | `src/data.ts`, `scripts/test-lms.ts`, deferral UX in `LessonContent.tsx` |
| 16. Classification | DEMO + MARKETING + MISSING |

**Missing authoring/product decisions:** objective, scenario, dataset, Excel deliverable shape, rubric, word/artifact rules, honesty constraints.

**Dataset/starter:** MISSING  

**Submission/assessment:** generic text submit only; no project rubric  

**Architecture fit:** Compatible with l13 model if authored as AssignmentBrief + optional dataset + written ± artifact.  

**Risks:** Easy to confuse marketing Excel projects with LMS l6; no instructional source of truth.

---

### data-analytics / m4 / l12 — Dashboard Project

- **Current title:** Dashboard Project  
- **Readiness:** **NOT READY**

**Evidence found**

| Evidence | Classification | Location |
|----------|-----------------|----------|
| Catalog `{ id: 'l12', title: 'Dashboard Project', type: 'assignment' }` | DEMO | `src/data.ts` (m4 Power BI) |
| “Sales Performance Dashboard” / similar programme cards | MARKETING / UNRELATED | `src/data.ts` programme `projectsDetail` entries |
| l13 prerequisite path mentions “Dashboard Project” | UNRELATED (title reference only) | `content/lms/data-analytics/l13/brief.json` |
| Test: `l12 must remain title-only (no brief)` | FIRST-PARTY (contract) | `scripts/test-lms.ts` |
| Node-specific brief / dataset / rubric | MISSING | — |

**Evidence matrix**

| Item | Status |
|------|--------|
| 1–8. Objective through rubric | MISSING |
| 9. Submission expectations | PARTIAL (generic) |
| 10. Prerequisites | PARTIAL (module sequence) |
| 11. Required tools | PARTIAL (Power BI module context) |
| 12. Dataset / starter | MISSING |
| 13. Completion criteria | PARTIAL (generic) |
| 14. Platform support | PARTIAL (generic assignment) |
| 15–16. Locations / class | DEMO + MARKETING + MISSING |

**Missing authoring/product decisions:** dashboard scenario, required visuals, PBIX vs PDF rules, dataset, rubric, overlap vs l13 Sales Analysis.

**Architecture fit:** Fits AssignmentBrief + artifact (likely `.pbix`/`.pdf`) pattern.  

**Risks:** High collision with l13 (also dashboard-capable sales analysis); need a clearly different learning objective.

---

### data-analytics / m5 / l14 — Project 2: HR Dashboard

- **Current title:** Project 2: HR Dashboard  
- **Readiness:** **NOT READY** (strongest *authoring* target among equals)

**Evidence found**

| Evidence | Classification | Location |
|----------|-----------------|----------|
| Catalog `{ id: 'l14', title: 'Project 2: HR Dashboard', type: 'assignment' }` under Capstone | DEMO | `src/data.ts` (m5) |
| Unlock after l13 completion (product sequence) | FIRST-PARTY (runtime/product behavior, not instructional content) | LMS unlock + `scripts/test-lms.ts` asserts l14 unlocks and `brief === null` |
| “HR Analytics Dashboard” style blurbs on certificate/other surfaces | MARKETING / UNRELATED | e.g. SQL certificate `projectsDetail` in `src/data.ts` |
| Node-specific brief / HR dataset / rubric / submission spec | MISSING | no `content/lms/data-analytics/l14/` |

**Evidence matrix**

| Item | Status |
|------|--------|
| 1–8. Objective through rubric | MISSING |
| 9. Submission expectations | PARTIAL (generic) |
| 10. Prerequisites | PARTIAL (explicitly after l13 unlock; “Project 2” naming) |
| 11. Required tools | PARTIAL (capstone; likely Excel/Power BI by course context — not specified) |
| 12. Dataset / starter | MISSING |
| 13. Completion criteria | PARTIAL (generic; unlocks later quiz l15 only after submit) |
| 14. Platform support | PARTIAL (generic; ProjectExperience gated on brief) |
| 15–16. Locations / class | DEMO + FIRST-PARTY sequence contract + MISSING content |

**Missing authoring/product decisions:** HR scenario, tables/grain, required analyses, dashboard deliverable rules, rubric distinct from l13, synthetic data honesty, whether written analysis is required.

**Architecture fit:** **Best sequential fit** — same course, already unlocked by l13, same AssignmentBrief + dataset + artifact path.  

**Risks:** Zero instructional content today; must not copy SQL-certificate HR blurbs as if they were LMS briefs.

---

### python-programming / m2 / l6 — Data Project

- **Current title:** Data Project  
- **Course title:** Python for Data Science  
- **Readiness:** **NOT READY**

**Evidence found**

| Evidence | Classification | Location |
|----------|-----------------|----------|
| Catalog assignment under `m2` “Data with pandas” | DEMO | `src/data.ts` |
| Outcomes: “Build 2 data analysis projects” | MARKETING | `src/data.ts` |
| Test asserts title-only brief | FIRST-PARTY (contract) | `scripts/test-lms.ts` |
| Brief / notebook starter / dataset / rubric | MISSING | no `content/lms/python-programming/` |

**Evidence matrix:** 1–8 MISSING; 9/13/14 PARTIAL (generic); 11 PARTIAL (pandas module); 12 MISSING.

**Architecture fit:** Possible, but may prefer notebook/code artifacts beyond current allowlist (`.xlsx/.xls/.pbix/.pdf/.sql`) — product decision required.  

**Risks:** Higher authoring + possible validation/allowlist extension; no first-party brief.

---

### generative-ai / m2 / l6 — AI App Project

- **Current title:** AI App Project  
- **Readiness:** **NOT READY**

**Evidence found**

| Evidence | Classification | Location |
|----------|-----------------|----------|
| Catalog assignment under “Building with AI” | DEMO | `src/data.ts` |
| Outcomes / programme `projectsDetail` (Q&A bot, writing assistant, etc.) | MARKETING / UNRELATED | `src/data.ts` |
| Title-only test contract | FIRST-PARTY | `scripts/test-lms.ts` |
| App brief / starter repo / eval rubric | MISSING | — |

**Evidence matrix:** instructional items MISSING; generic submission PARTIAL.

**Architecture fit:** Weak without decisions on code upload, prompts, eval harness vs current binary artifact model.  

**Risks:** Highest architectural stretch; marketing project cards are not LMS briefs.

---

### full-stack-web / m2 / l6 — React Project

- **Current title:** React Project  
- **Readiness:** **NOT READY**

**Evidence found**

| Evidence | Classification | Location |
|----------|-----------------|----------|
| Catalog assignment under React module | DEMO | `src/data.ts` |
| Full-stack programme cards (e-commerce, task app) | MARKETING / UNRELATED | `src/data.ts` |
| Degree “React & Frontend” lab experiments (objectives/tasks) | UNRELATED | labs catalog in `src/data.ts` (not this LMS node) |
| Title-only test contract | FIRST-PARTY | `scripts/test-lms.ts` |
| LMS React brief / starter / rubric | MISSING | — |

**Evidence matrix:** instructional items MISSING; labs are UNRELATED and must not be treated as this node’s brief.

**Architecture fit:** Repo/zip deliverables likely need allowlist/product changes.  

**Risks:** Confusing degree labs with LMS course projects; large authoring surface.

---

## 5. Comparison Table

| Candidate | Readiness | First-party evidence | Dataset/starter | Rubric | Submission | Architecture fit | Authoring risk |
|-----------|-----------|----------------------|-----------------|--------|------------|------------------|----------------|
| DA m2/l6 Excel Assignment | NOT READY | Title + sequence mention only | MISSING | MISSING | Generic text | Good | High (invent all content) |
| DA m4/l12 Dashboard Project | NOT READY | Title + sequence mention only | MISSING | MISSING | Generic text | Good | High (overlap with l13) |
| DA m5/l14 Project 2: HR Dashboard | NOT READY | Title + unlock-after-l13 contract | MISSING | MISSING | Generic text | **Best sequential fit** | High content; **lowest product-placement ambiguity** |
| Python m2/l6 Data Project | NOT READY | Title only | MISSING | MISSING | Generic text | Medium (artifact types) | Very high |
| GenAI m2/l6 AI App Project | NOT READY | Title only | MISSING | MISSING | Generic text | Weak without new contracts | Very high |
| Full-stack m2/l6 React Project | NOT READY | Title only | MISSING | MISSING | Generic text | Weak without new contracts | Very high |

---

## 6. Recommended Next Project

### Selection

**Recommended next authoring target:**  
`data-analytics` / `m5` / `l14` — **Project 2: HR Dashboard**

### Verdict on readiness

**NO READY CANDIDATE — AUTHORING REQUIRED**

No candidate has first-party instructional content sufficient for Phase 15 *implementation* without inventing curriculum. All six are title-only shells under an explicit test contract.

### Why l14 (as authoring target only)

Selected solely as the **strongest partial product/sequence signal**, not as ready content:

1. **Placement:** Already the next ASSIGNMENT after the only complete project (l13); unlock is implemented and tested.  
2. **Naming:** Explicitly “Project 2”, mirroring l13’s “Project 1” pattern.  
3. **Architecture reuse:** Same course and the same AssignmentBrief → dataset → written analysis → artifact upload → completion → unlock path with **no cross-course variables**.  
4. **Differentiation:** HR domain vs Sales reduces copying l13 while still validating a second analytics/dashboard-style brief.  
5. **Avoided:** Choosing GenAI/React/Python next would maximize architecture unknowns *and* still require inventing all curriculum from scratch.

**Not selected despite titles:** Excel Assignment, Dashboard Project, Data Project, AI App Project, React Project — equal content emptiness; weaker sequential/product fit or higher artifact-model ambiguity.

---

## 7. Architecture Implications

For an authored **l14 HR Dashboard** brief:

- The existing l13 architecture is **conceptually sufficient** (Course → Module → ASSIGNMENT → AssignmentBrief → dataset → written response → artifact upload → submit → unlock).
- **No Phase 14 code changes** are required or recommended.
- Phase 15 authoring would need new first-party files (e.g. `content/lms/data-analytics/l14/brief.json` + dataset) and seed wiring analogous to l13 — **conceptual only here**.
- Possible later product decisions (not implement now): dashboard-specific allowlist emphasis (`.pbix`/`.pdf`), rubric distinct from sales analysis, whether SQL optional path is retained.

Cross-course projects (Python / GenAI / React) would more likely force artifact-type and evaluation extensions; that is another reason they are poorer *next* targets given zero content.

---

## 8. L13 Regression Check

Phase 14 produced **documentation only**. Confirmed intent and working-tree discipline:

| Check | Result |
|-------|--------|
| `data-analytics/m5/l13` brief | Untouched |
| l13 dataset / validation | Untouched |
| Artifact upload/download / completion / l14 unlock code | Untouched |
| Assignment API / security controls | Untouched |
| Production deploy config | Untouched |
| Migrations / package dependencies | Untouched |

Unrelated untracked scripts under `scripts/` (release helpers from prior sessions) were **not** added to this commit.

---

## 9. Phase 14 Verdict

**NO READY CANDIDATE — AUTHORING REQUIRED**

- **Do not start Phase 15 implementation** against any of the six nodes.  
- **Next phase should be curriculum authoring** for `data-analytics` / `m5` / `l14` (Project 2: HR Dashboard), using l13 only as an architectural and honesty template — not by copying sales content into HR.

### Blocker before Phase 15 implementation

Author a complete first-party AssignmentBrief (and dataset/starter + rubric + submission/completion rules) for the selected node. Until that exists in-repo, implementation would require inventing curriculum, which Phase 14 forbids.
