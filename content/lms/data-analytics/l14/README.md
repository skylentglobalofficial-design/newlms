# L14 — Project 2: HR Dashboard (Phase 15 authoring package)

**Status:** Phase 16 implementation — AssignmentBrief seeded, synthetic dataset attached, ProjectExperience reuse
**Course / module / lesson:** `data-analytics` / `m5` / `l14`
**Dataset binary:** `skylent_virelia_shared_services_hr_v1.xlsx` (generated; see `dataset-validation.json`)

## What this package is

| Artifact | Path | Role |
| --- | --- | --- |
| Assignment brief | `content/lms/data-analytics/l14/brief.json` | Complete AssignmentBrief-compatible curriculum specification |
| This README | `content/lms/data-analytics/l14/README.md` | Authoring evidence, decisions, and implementation notes |

Phase 15 deliverable only. Phase 16 (implementation) is responsible for dataset generation/attachment, seed wiring, and LMS product enablement after review.

---

## Source / evidence basis

### FIRST-PARTY (used)

| Evidence | Location | How used |
| --- | --- | --- |
| Lesson title + type + sequence | `src/data.ts` — Data Analytics `m5` Capstone: `l13` Sales Analysis → `l14` Project 2: HR Dashboard → `l15` Final Assessment | Establishes title, domain (HR), and position after L13 |
| Tools sequence titles | `src/data.ts` modules m1–m4 (Foundations, Excel, SQL, Power BI) | Conservative prerequisites |
| Completed project architecture | `content/lms/data-analytics/l13/brief.json` + seed/API artifact model | Structural compatibility for AssignmentBrief content shape, deliverables, submission/completion pattern |
| AssignmentBrief storage model | `prisma` `AssignmentBrief`, `server/src/lib/assignment-brief.ts`, `ProjectExperience` | Confirms content is opaque JSON; extra authoring fields are safe for Phase 15 |
| Phase 14 readiness audit | Prior audit concluding no ready candidate; L14 selected for authoring | Confirms this package is **authoring**, not recovery of an existing brief |

### MARKETING (not converted into requirements)

| Evidence | Why not treated as curriculum truth |
| --- | --- |
| Course `longDesc` / `outcomes` in `src/data.ts` (“real datasets”, portfolio-ready projects) | Promotional catalogue language; L14 uses **synthetic** curriculum data and does not inherit placement/portfolio claims as graded requirements |
| Programme cards elsewhere in product surfaces | Marketing, not lesson scripts |

### DEMO (not converted into requirements)

| Evidence | Why excluded |
| --- | --- |
| CareerOS / OS / recruiter demo surfaces | Different product surfaces; not L14 curriculum |
| Any sample dashboards unrelated to this lesson | Demo, not first-party L14 instruction |

### UNRELATED

| Evidence | Note |
| --- | --- |
| L13 Sales Analysis domain metrics (revenue, SKUs, regions-as-sales) | Reference architecture only; L14 is a distinct HR/people-analytics case |
| Other courses’ project titles (Python / GenAI / Full-stack) | Different programmes |

### MISSING (authored as NEW content)

No first-party L14 brief, rubric, dataset, or lesson script existed in the repository before Phase 15. The following are **NEW Skylent curriculum content**:

- Fictional case (Virelia Shared Services)
- Business / analytical problem framing
- Learning objectives
- Dataset contract (tables, grain, keys, fields, integrity)
- Required analyses R1–R7 and dashboard requirements D1–D7
- Deliverables, constraints, milestones, rubric, submission/completion rules beyond the shared L13 *pattern*

---

## Fictional scenario

**Virelia Shared Services** is a fictional mid-size shared-services company with multi-department, multi-location workforce data.

- Not a real employer, client, or Skylent partner
- Not a live engagement or placement case
- Employees are synthetic IDs only — no real PII

The People Analytics lead (role-play) asks for a workforce dashboard covering **2023-01-01 → 2024-12-31** (as-of **2024-12-31**) to support discussion of composition, movement, exits, and tenure — and to nominate **two areas for further investigation**.

---

## Dataset contract summary

| Item | Specification |
| --- | --- |
| Identifier | `skylent_virelia_shared_services_hr_v1` |
| Intended file | `skylent_virelia_shared_services_hr_v1.xlsx` |
| Format | Multi-sheet Excel (relational) |
| Binary in Phase 16 | **Authored** (`dataset.status = BINARY_ATTACHED`) |
| Tables | `dim_department`, `dim_location`, `dim_employee`, `fact_hr_events` |
| Approx. scale | ~5–8 departments, ~4–6 locations, ~420–580 employees, ~520–780 events |
| Honesty | Synthetic / fictional curriculum data only |
| PII | Synthetic employee IDs; no real names/emails/phones/IDs; no protected-class profiling fields |

Full column-level contract, metric definitions, null expectations, and integrity checks live in `brief.json` → `dataset`.

Phase 16 generated the production curriculum workbook and `dataset-validation.json`. Re-run `node scripts/lms/generate-virelia-hr-dataset.mjs` to regenerate.

---

## Authoring decisions

1. **HR-specific, not renamed L13** — Workforce composition, movement, exits, and tenure replace sales revenue/region/category analyses. Shared structure (brief shape, Excel/Power BI paths, written analysis, artifact completion) is intentional architecture reuse, not content cloning.
2. **Multi-table relational design** — Mirrors L13’s prepare-and-join learning while fitting HR grain (dimensions + hire/exit events).
3. **No individual scoring / hiring ML / surveillance** — Explicitly out of scope in constraints, incomplete conditions, and rubric honesty criterion.
4. **Observation ≠ interpretation ≠ hypothesis** — Embedded in business problem, R7, written must-includes, and rubric.
5. **Optional SQL only** — Justified by m3 SQL in the course sequence; same optional posture as L13.
6. **Compensation as optional band only** — `salary_band` may exist for optional exploration; not required for R1–R7.
7. **Five milestones** — Inspect → Prepare → Analyse → Build → Communicate (Build split out because this is explicitly a dashboard project).
8. **Eight rubric criteria** — Includes dashboard usefulness and metric correctness as assessable, non-aesthetic criteria.
9. **Extra JSON fields** (`learningObjectives`, `dashboardRequirements`, `crossCheckMap`, expanded `dataset`) — Stored as part of AssignmentBrief `content` JSON when seeded later; current UI may not render every field until implementation chooses to. Schema/DB not changed in this phase.

---

## Required analysis R1–R7 (summary)

| ID | Focus |
| --- | --- |
| R1 | Active workforce size as of as-of date |
| R2 | Composition by department |
| R3 | Composition by job level |
| R4 | Movement over time (headcount and/or hire vs exit) |
| R5 | Exit concentration |
| R6 | Tenure distribution |
| R7 | Two evidence-backed findings + further investigation (no causation required) |

Internal consistency map: `brief.json` → `crossCheckMap`.

---

## Deliverables (summary)

**Mandatory**

1. Analytical artifact — Excel **or** Power BI (`.pbix`), with **PDF export** accepted if `.pbix` cannot be submitted
2. Written analysis — 400–800 words with required elements

**Optional**

3. SQL verification of one aggregate

Naming: `DA_l14_HRDashboard_<LearnerNameOrId>.<ext>`
Completion (conceptual, L13-compatible): written analysis **and** stored artifact binary.

---

## Rubric summary

MEETS / PARTIAL / DOES NOT MEET for:

1. Data preparation / model integrity
2. Metric correctness
3. Analytical coverage
4. Dashboard usefulness
5. Reasoning / evidence
6. Interpretation honesty
7. Communication
8. Reproducibility

---

## Unresolved product decisions (remaining after Phase 16)

1. **Attrition formula** — intentionally learner-defined when used; product may later publish a preferred teaching formula without changing the educational intent.
2. **Transfer/promotion events** — omitted from v1 contract for scope control; may be a future dataset version if needed.
3. **LFS / binary storage policy** for curriculum workbooks in CI (ensure `git lfs pull` or regenerate scripts before `test:lms`).
4. **Faculty review tooling** — still out of scope; rubric is guidance only.


---

## Future implementation notes

- Do **not** modify L13 files when implementing L14.
- Do **not** change AssignmentBrief Prisma schema for this content.
- Reuse existing artifact allowlist/validation and completion rules conceptually (`projectSubmissionRequirements` keys off `submissionExpectations.completeWhen` + `deliverables.analyticalArtifact.required`).
- After binary generation, set `dataset.status` appropriately and ensure `datasetRelativePath` points under `content/lms/data-analytics/l14/`.
- Keep honesty strings in seed `datasetDisclaimer`.
- No CareerOS evidence auto-generation, recruiter hooks, or auto-scoring in the first implementation.

---

## Quality gate (Phase 15 self-check)

- [x] Genuinely HR / people-analytics focused
- [x] Not a renamed Sales Analysis project
- [x] Teachable, assessable requirements
- [x] Dataset grain and relationships unambiguous (contract-level)
- [x] Metrics calculable from proposed fields
- [x] Dashboard views supported by proposed fields
- [x] Written analysis has clear purpose
- [x] Rubric maps to deliverables
- [x] Completion maps to submission requirements
- [x] No real company/client/employer claim
- [x] No real PII required
- [x] No placement/hiring guarantee
- [x] No required causal conclusion
- [x] No ML/forecasting requirement
- [x] L13 left untouched
- [x] No LMS/API/UI/migration/implementation changes in this phase

---

## Explicit non-claims

- L14 is **not** implemented in the LMS.
- L14 is **not** production-ready.
- The HR dataset **binary does not exist** yet — only the contract was authored.
