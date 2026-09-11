# Phase 18 — L14 UX/UI + Product Quality Review

**Target:** `data-analytics` / `m5` / `l14` — Project 2: HR Dashboard  
**Reference:** `data-analytics` / `m5` / `l13` — Project 1: Sales Analysis  
**Branch:** `cursor/lms-hr-dashboard-ux-cdeb`  
**Review date:** 2026-09-11  
**Mode:** Product UX/UI quality review after Phase 17 functional release gate

---

## Executive assessment

**Verdict: UX READY**

L14 already worked as an assignment. After this pass it also reads as a deliberate Skylent LMS project page: scenario-first hierarchy, curriculum-faithful copy without Phase 15 authoring leftovers, scannable dashboard requirements, clearer dataset/submit affordances, and no L13 regressions.

No P0 issues. Pre-fix P1 clarity/content problems were fixed. Remaining notes are optional P3 preferences, not learner-flow blockers.

---

## Before → After

| Area | Before | After |
| --- | --- | --- |
| Attachment note | Learner-facing “Phase 15 package does not implement…” leftover | Clean completion/upload wording only |
| First viewport IA | Objective/learning copy competed with case identity | Scenario → Business problem lead; objective follows |
| Currency line | “Currency: INR” shown on HR project | Shown only when `netRevenueFormula` exists (L13 keeps INR; L14 hides it) |
| Dataset CTA | Long filename as button label | “Download dataset” + filename shown as text |
| Dashboard requirements | Dense ~one-line dump per view | Structured Question / Metric / Form / Interpretation rows |
| Submit disabled state | Disabled without nearby explanation | Explicit hint + `aria-describedby` when no stored artifact |
| Workflow placement | Milestones less prominent in flow | Dedicated **Workflow** section (Inspect → Prepare → Analyse → Build → Communicate) before Dataset |

---

## Findings by severity

### Critical UX issues (P0)

None.

### Important UX issues (P1) — fixed

1. **Learner-facing Phase 15 authoring leftover** in `attachmentNote` undermined credibility and implied the product was unfinished for an implemented lesson.  
2. **Scenario buried below Objective/LOs** made “what is this project?” harder to answer in the first viewport.

### Important / polish (P2) — fixed when low-risk

1. Irrelevant **Currency: INR** on HR compensation-optional project.  
2. Dataset download CTA used the full filename.  
3. Dashboard requirements were hard to scan.  
4. Disabled submit lacked an adjacent explanation.

### Minor polish (P3) — not implemented

1. Page length remains high because R1–R7 + dashboard + rubric are curriculum-required.  
2. Learn chrome already titles the lesson; the brief card repeats the title (existing LMS pattern).  
3. Submission notes stack above the primary submit control (clear, but long).  
4. No sticky submit CTA (would add visual weight without fixing clarity).

---

## Visual hierarchy

| Region | Assessment |
| --- | --- |
| Header / identity | Title and PROJECT 2 kicker clear; course context subordinate in chrome |
| Hero / introduction | Fictional framing callout visible without dominating; Scenario first |
| Learning objectives | Present as outcomes after Objective — not marketing copy |
| Requirements | R1–R7 scannable; Optional extensions separated |
| Workflow | Inspect → Prepare → Analyse → Build → Communicate readable as process |
| Dataset | Name, disclaimer, window, Download dataset CTA obvious |
| Deliverables / submission | Written analysis and artifact upload clearly separated |
| Rubric | Guidance table retained; mobile stacks cells with labels |
| Completion | Existing calm “Submission recorded” state unchanged (no gamification) |

---

## Information architecture

Observed section order after fix:

1. Project identity  
2. Scenario / problem  
3. Objective + learning objectives  
4. Task / required analysis / dashboard / optional  
5. Workflow  
6. Dataset  
7. Constraints  
8. Deliverables  
9. Rubric  
10. Submission requirements  
11. Your submission  

This matches the preferred conceptual sequence with Constraints kept adjacent to Dataset (evidence-based: constraints govern how the dataset may be used).

---

## Content integrity

| Check | Result |
| --- | --- |
| Matches authored `brief.json` | Pass (seeded; UI renders brief fields) |
| No Phase 15 leftover in learner UI | Pass |
| No Sales Analysis / Aether leak on L14 | Pass (browser text scan) |
| No CAT/JEE/NEET language | Pass |
| No placement / employer / client claims | Pass — fictional framing + synthetic disclaimer present |
| R1–R7 unchanged | Pass (presentation only) |
| Completion / unlock logic unchanged | Pass (`test:lms` L13→L14 suite) |

---

## Interaction UX

| Interaction | State communication |
| --- | --- |
| Dataset download | Idle → Preparing download… → file save / error |
| File choose | Validates type/size immediately with nearby error |
| Artifact upload | Idle → Uploading… → uploaded confirmation / error |
| Written analysis | Live word count + must-include note |
| Submit | Disabled until stored artifact; hint explains why; Submitting… while in flight |
| Completion | Distinct submitted panel; no fake score |

---

## Failure UX

Existing ProjectExperience behaviors retained and covered by LMS tests:

- Missing written analysis  
- Missing stored artifact  
- Invalid / oversized file  
- Upload / submit API failures surface message text near the form  
- Unauthorized / locked states enforced by API (403/401)

No stack traces, filesystem paths, or internal IDs introduced in UX copy.

---

## Accessibility

| Check | Result |
| --- | --- |
| Heading hierarchy | `h2` project title; section `h3`s |
| Labels | Textarea + file input labeled |
| Disabled submit | Explained via `#…-submit-hint` + `aria-describedby` |
| Focus | Download/submit/upload `:focus-visible` outlines present |
| Rubric | Table semantics; mobile labeled cells |
| Reduced motion | Existing `@media (prefers-reduced-motion: reduce)` preserved |
| Contrast / line length | Within existing LMS workspace tokens |

Not claiming WCAG certification.

---

## Responsive matrix

Browser-audited on Vite preview (`:8443`) with API (`:3000`), enrolled learner, L14 unlocked.

| Width | Overflow | First-viewport sections | Phase 15 leftover | Currency INR | Download dataset | Submit hint |
| --- | --- | --- | --- | --- | --- | --- |
| 375 | No | Scenario | No | No | Yes | Yes |
| 390 | No | Scenario | No | No | Yes | Yes |
| 430 | No | Scenario | No | No | Yes | Yes |
| 768 | No | Scenario, Business problem | No | No | Yes | Yes |
| 1024 | No | Scenario, Business problem | No | No | Yes | Yes |
| 1440 | No | Scenario, Business problem | No | No | Yes | Yes |

Artifacts: `/opt/cursor/artifacts/phase18-ux/l14-{375,390,430,768,1024,1440}.png` plus first-viewport / submission crops.

---

## Performance impact

| Check | Result |
| --- | --- |
| `ProjectExperience` lazy chunk | Intact — `ProjectExperience-BfihWTLD.js` ~14.65 KB / gzip ~3.94 KB |
| New dependencies | None |
| Heavy assets / blur / backdrop-filter | None added |
| Homepage bundle | Unchanged pattern (route-scoped project UI) |

---

## L13 regression

| Check | Result |
| --- | --- |
| `npm run test:lms` L13 cases | Pass |
| Browser L13 title | Project 1: Sales Analysis |
| L13 Currency INR | Still shown (sales formula present) |
| L13 Download dataset | Present |
| Shared component changes | Additive / conditional; L13 curriculum meaning unchanged |

L13 was not redesigned for aesthetics.

---

## AI-looking / generic UI findings

Inspected for excessive cards, gradients, fake metrics, emoji, glassmorphism, decorative widgets: **not present** in L14 project surface beyond existing LMS workspace chrome.

No decorative elements were added.

---

## Strengths (pre-existing, preserved)

- Honest fictional-case framing  
- Synthetic dataset disclaimer  
- Clear written analysis + stored-binary artifact completion rule  
- Shared project component with L13 (consistent interaction model)  
- Rubric presented as guidance, not auto-scoring  

---

## Recommended fixes

Implemented in this phase (P0/P1 + justified P2 only):

1. Clean `attachmentNote` in `content/lms/data-analytics/l14/brief.json`  
2. Reorder ProjectExperience sections scenario-first  
3. Structure dashboard requirement rows  
4. Gate currency display on sales formula presence  
5. Shorten download CTA label  
6. Explain disabled submit  
7. Light CSS for dashboard list + upload focus  

No further mandatory UX work for release readiness from a product-quality standpoint.

---

## Files changed

- `docs/LMS_L14_PHASE18_UX_REVIEW.md` (this report)  
- `content/lms/data-analytics/l14/brief.json`  
- `src/components/lms/ProjectExperience.tsx`  
- `src/styles/lms-workspace.css`

Not committed: rematerialized L13 xlsx, local QA helper scripts, screenshot artifacts.

---

## Tests

| Command | Result |
| --- | --- |
| `npm run test:lms` | Pass (incl. L13 + L14) |
| `npm run typecheck` | Pass |
| `npm run backend:typecheck` | Pass |
| `npm run build` | Pass |
| Browser responsive matrix | Pass at 375 / 390 / 430 / 768 / 1024 / 1440 |
| Browser L13 smoke | Pass |

Full browser submit→L15 unlock was not re-driven in this UX pass; API/integration coverage in `test:lms` remains the regression gate for completion/unlock.

---

## Final recommendation

**UX READY**

Ship the UX polish with Phase 17’s deployment requirements still applying at the infrastructure layer (artifact volume, migrate, seed, cookie/HTTPS, shared storage for multi-instance). No remaining learner-facing UX blockers for L14 product quality.
