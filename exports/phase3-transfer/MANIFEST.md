# Phase 3 Public Shell — Transfer Manifest

**Comparison baseline:** git commit `2968881` (`feat: establish Skylent design system`)  
**Target Windows repo:** branch `restore-before-10am` at same commit  
**Composer workspace HEAD:** `0a19838` (includes unrelated export branch work; Phase 3 lives in **working tree** vs `2968881`)  
**Protected backup:** `backup/restore-before-10am-2026-09-22` — do not modify  

**Package location:** `/tmp/phase3-transfer/patches/`  
**No source files in this repo were modified to produce this audit.**

---

## A. Exact Phase 3 file manifest (apply on `2968881`)

| Priority | Path | Blocks | Apply as |
|----------|------|--------|----------|
| 1 | `src/lib/product-architecture.ts` | 3.2, 3.4 | Full patch `product-architecture.patch` |
| 2 | `src/components/shared.tsx` | 3.2–3.6 | Full patch `shared.patch` |
| 3 | `src/styles/layout.css` | 3.3 | Hunk patch `layout-public-main.patch` (+8 lines `.skylent-public-main`) |
| 4 | `src/pages/NotFoundPage.tsx` | 3.3 | New file `NotFoundPage.patch` |
| 5 | `src/App.tsx` | 3.3 | **Partial** `App-phase3-only.patch` (404 + imports; no lab route changes) |
| 6 | `src/components/foundation.tsx` | 3.3 | Full patch `foundation.patch` (comments only) |
| 7 | `src/pages/education/AcademicPageShell.tsx` | 3.3 | Full patch `AcademicPageShell.patch` |
| 8 | `src/index.css` | 3.3, 3.6 | **Partial** `index-phase3-only.patch` |
| 9 | `src/skylent-public.css` | 3.3 | Full patch `skylent-public.patch` (+1 comment) |
| 10 | `src/pages/EducationPage.tsx` | 3.3 | Full patch `EducationPage.patch` |
| 11 | `src/pages/BlogPage.tsx` | 3.3 | Full patch `BlogPage.patch` |
| 12 | `src/pages/BlogPostPage.tsx` | 3.3 | Full patch `BlogPostPage.patch` |
| 13 | `src/pages/ContactPage.tsx` | 3.3 | Full patch `ContactPage.patch` |
| 14 | `src/skylent-launch-audit.css` | 3.6 | Delete `delete-skylent-launch-audit.patch` |

**Phase 2 at `2968881` preserved:** `src/styles/design-system.css`, `typography.css`, `components.css`, `HomePage.tsx/css`, `tokens.ts` — **not** in this package.

---

## B. Mixed files — hunk-level only (do NOT apply full `git diff` from Composer)

| File | Why mixed | Phase 3 instruction |
|------|-----------|---------------------|
| `src/App.tsx` | Lab routes, `/exams` redirect, lazy lab pages | Use **`App-phase3-only.patch`** only |
| `src/index.css` | `:root` token block removal, login grid media query | Use **`index-phase3-only.patch`** only — **exclude** `:root` deletion and `@media login-page-grid` from Composer diff |

---

## C. New files

- `src/pages/NotFoundPage.tsx` — canonical 404 via `PageShell`

---

## D. Deleted files

- `src/skylent-launch-audit.css` — present at `2968881`, **never imported** in `src/main.tsx`; safe to delete (Block 3.6)

---

## E. Baseline used

- **Git object:** `2968881` on `restore-before-10am` / design-system commit  
- **Method:** `git diff 2968881 -- <path>` and `git diff 2968881:src/styles/layout.css src/styles/layout.css` for untracked `layout.css` delta  

---

## F. Ambiguous — manual review on Windows

| File | Composer diff vs `2968881` | Recommendation |
|------|---------------------------|----------------|
| `src/pages/AboutPage.tsx` | Massive rewrite (Phase 2/editorial), not Phase 3 shell | **Do not transfer.** Re-apply nav-offset pattern only if hero uses `T.navH +` with `PageShell` on target |
| `src/pages/StoriesPage.tsx` | Same | **Do not transfer** |
| `src/pages/InstitutionsPage.tsx` | Uses `PublicEditorialShell` at baseline; full rewrite in Composer | **Do not transfer** |
| `src/pages/UniversitiesPage.tsx` | Large unrelated diff | **Do not transfer** (no isolated nav-offset hunk vs baseline) |
| `src/pages/WorkshopsPage.tsx` | Large unrelated diff | **Do not transfer** |
| `src/pages/WorkshopDetailPage.tsx` | Large unrelated diff | **Do not transfer** |
| `src/pages/LabsPage.tsx` | Phase 1 labs marketing rewrite | **Do not transfer** (baseline uses `cat-hero` without double `navH`) |
| `src/pages/CareerOSPage.tsx` | Orphan page; not in `App.tsx` routes | **Leave in place**; not Phase 3 |
| `src/pages/CareerPage.tsx` | Not routed | **Leave in place** |
| `src/styles/layout.css` (full tree) | At `2968881` file exists; Composer adds **only** `.skylent-public-main` | Apply **`layout-public-main.patch`** only — do not delete/restage entire file |

---

## G. Recommended patch application order

1. `product-architecture.patch`  
2. `layout-public-main.patch`  
3. `index-phase3-only.patch`  
4. `shared.patch`  
5. `foundation.patch`  
6. `skylent-public.patch`  
7. `AcademicPageShell.patch`  
8. Hero offset patches: `EducationPage`, `BlogPage`, `BlogPostPage`, `ContactPage`  
9. `NotFoundPage.patch`  
10. `App-phase3-only.patch`  
11. `delete-skylent-launch-audit.patch`  

Then: `pnpm run typecheck` && `pnpm run build`

---

## H. Transfer package contents

```
/tmp/phase3-transfer/
  MANIFEST.md
  patches/
    product-architecture.patch
    shared.patch
    layout-public-main.patch
    index-phase3-only.patch
    foundation.patch
    skylent-public.patch
    AcademicPageShell.patch
    EducationPage.patch
    BlogPage.patch
    BlogPostPage.patch
    ContactPage.patch
    NotFoundPage.patch
    App-phase3-only.patch
    delete-skylent-launch-audit.patch
```

**Apply from repo root:**  
`git apply --check /tmp/phase3-transfer/patches/<name>.patch` then `git apply`

---

## Phase 3 vs Phase 2 verification

- No patches modify `src/styles/design-system.css`, `typography.css`, `components.css`, `HomePage.tsx`, `HomePage.css`, or `tokens.ts`.  
- `shared.tsx` changes nav/footer/shell/`globalCSS` only — does not replace Phase 2 token files.  
- `index-phase3-only.patch` intentionally **does not** remove the duplicate `:root` block (that is a separate Composer/Phase 2 consolidation, not Phase 3).

---

## Composer working tree — EXCLUDE from Phase 3 commit

These differ from `2968881` but are **not** Phase 3 public shell:

- `pnpm-lock.yaml`, `scripts/test-*.ts`, `server/**`, `src/lib/catalog-maturity.ts`, `src/lib/lms-api.ts`
- `src/pages/CourseDetailPage.tsx`, `CoursesPage.tsx`, `ProgramsPage.tsx`, `ProgramPage.tsx`, `LearnPage.tsx`
- `src/pages/HomePage.tsx`, `HomePage.css`, `src/components/ui.tsx`, `section-ui.tsx`, `tokens.ts`
- `src/pages/ExperimentPage.tsx`, `LabDetailPage.tsx`, `CareerOSPage.tsx` (2-line)
- Full `git diff 2968881 -- src/App.tsx` (includes lab routing — use partial patch only)
