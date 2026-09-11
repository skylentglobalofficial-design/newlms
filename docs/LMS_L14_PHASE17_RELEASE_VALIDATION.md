# Phase 17 — L14 Release Validation

**Target:** `data-analytics` / `m5` / `l14` — Project 2: HR Dashboard
**Implementation commit validated:** `a7124726d827b24ff4d858ed0e3e62d4bebdfdb7`
**Branch:** `cursor/lms-hr-dashboard-implement-cdeb`
**Validation date:** 2026-09-11
**Mode:** Release gate only — no product feature work; no P0/P1 fixes required

---

## 1. Verdict

**READY WITH DEPLOYMENT REQUIREMENTS**

The L14 HR Dashboard project is functionally complete and passed production build, migration, dataset, API, security, browser, responsive, and L13-regression validation in this environment. Remaining requirements are deployment/runtime configuration (artifact volume, migrate, seed, HTTPS cookies), not application blockers.

---

## 2. Build / Runtime

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run build` | PASS | Vite + backend `tsc` succeeded; `ProjectExperience--ty20CNC.js` emitted as separate chunk (~13.5 KB) |
| Production start | PASS | `NODE_ENV=production` process on `PORT=3020` serving `server/dist/index.js` |
| `npm start` forces production | PASS | `package.json` → `"start": "NODE_ENV=production node server/dist/index.js"` |
| `GET /` | PASS | 200 SPA shell (`#root`) |
| `GET /skills` | PASS | 200 SPA shell |
| `GET /learn/data-analytics/l13` | PASS | 200 SPA shell |
| `GET /learn/data-analytics/l14` | PASS | 200 SPA shell |
| Health | PASS | `GET /api/v1/health` → `{"status":"ok"}` |

No development-only behavior was observed on the production build (static SPA hosted only when `NODE_ENV=production`).

---

## 3. Environment / Deployment

Verified against Phase 13 expectations:

| Item | Status | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Required | Present in validation env |
| `DIRECT_URL` | Required | Present; used for migrate |
| `NODE_ENV=production` | Required | Forced by `npm start` / set on validation process |
| Seeded database | Required for catalog + briefs | Seed creates L13 + L14 AssignmentBriefs |
| `LMS_ARTIFACT_STORAGE_DIR` | Required for artifacts | Validated with `/tmp/skylent-phase17-artifacts` (mode 0750 root) |
| `PORT` | Optional | Validated on 3020 |
| `LMS_ARTIFACT_MAX_BYTES` | Optional | Default 25 MiB observed |
| `COOKIE_SECURE` | Optional | Validation used `false` for HTTP; **must not** force false on HTTPS production |
| `FRONTEND_URL` | Optional / recommended | Set for production cookie/redirect correctness |
| Multi-instance | Not safe without shared storage | Local FS provider is single-instance or shared-volume only |

Artifacts are **not** served via `express.static`; only authenticated attachment download routes read opaque storage keys.

---

## 4. Database / Migration

Isolated database: `skylent_phase17_val`

| Check | Result |
| --- | --- |
| `npx prisma migrate deploy` | PASS — 7 migrations applied, none destructive introduced by L14 |
| AssignmentBrief L13 | PASS — present |
| AssignmentBrief L14 | PASS — present, count = 1 (no duplicates) |
| Title-only peers without briefs | PASS — `l6`, `l12` (and other courses’ project nodes) `hasBrief: false` |
| Curriculum relationships | PASS — `m5/l13` + `m5/l14` seeded correctly |

No `migrate reset` / destructive commands were run against a production database.

---

## 5. Dataset Validation

| Field | Value |
| --- | --- |
| Dataset ID | `skylent_virelia_shared_services_hr_v1` |
| File | `content/lms/data-analytics/l14/skylent_virelia_shared_services_hr_v1.xlsx` |
| Sheets | `dim_department`, `dim_location`, `dim_employee`, `fact_hr_events` |
| Counts | 6 / 5 / 500 / 646 |
| Contract ranges | 5–8 / 4–6 / 420–580 / 520–780 |
| Generator | `node scripts/lms/generate-virelia-hr-dataset.mjs` |
| `dataset-validation.json` | `passed: true` |
| PK/FK/date/status integrity | 0 violations |
| PII policy | No real names/emails/phones/IDs; no protected-class fields |
| Brief ID match | PASS |
| Supports R1–R7 | PASS (active headcount 354; window hires 130; window exits 133; uneven dept/exit mix) |

Dataset was **not** modified merely to pass tests; deterministic generator output matches authored contract.

**Git LFS note:** `*.xlsx` is LFS-tracked. Deploy/CI must `git lfs pull` or regenerate via the script before serving datasets.

---

## 6. LMS API E2E

Command: `API_BASE=http://127.0.0.1:3020/api/v1 npm run test:lms`

**Result: PASS** (steps 1–24, including L13 regression and L14 suite)

Covered:

- Anonymous / unenrolled / locked denials for assignment, dataset, artifact
- L13 completion → L14 unlock
- L14 brief retrieval (title, R1–R7, learning objectives, dashboard requirements, Virelia)
- Dataset download (substantial xlsx, ZIP signature)
- Invalid extension / executable signature / oversize / CSRF / IDOR denials
- Written-only and artifact-only submit rejected
- Valid upload + submit → L14 complete → L15 unlock
- Title-only peers remain `brief === null`

---

## 7. Browser E2E

Fresh learner session (not reused). Production SPA on `http://127.0.0.1:3020`.

| Flow step | Result |
| --- | --- |
| Fresh signup + enroll (API prep) + L13 complete | PASS |
| Open L14 project view | PASS |
| HR-specific content (Virelia, R1–R7, LO, dashboard reqs) | PASS |
| Dataset download control present | PASS |
| Written analysis entry | PASS |
| Invalid extension UX | PASS |
| Valid artifact upload + submit | PASS |
| Completion recorded | PASS |
| L15 unlock | PASS |
| No pageerrors | PASS |
| No Sales / CAT / JEE / NEET / fake progress / fake score | PASS |

Screenshots (outside repo): `/opt/cursor/artifacts/phase17/`

Negative UX:

- Submit disabled without stored artifact — PASS
- Invalid extension surfaced — PASS
- No fake completion — PASS

---

## 8. Responsive Matrix

Explicit L14 checks (overflow + readable hierarchy + usable completed/form state):

| Breakpoint | Overflow | Readable | Usable |
| --- | --- | --- | --- |
| 375 | PASS | PASS | PASS |
| 390 | PASS | PASS | PASS |
| 430 | PASS | PASS | PASS |
| 768 | PASS | PASS | PASS |
| 1024 | PASS | PASS | PASS |
| 1440 | PASS | PASS | PASS |

Phase 16 gap (only 390/1440) is closed.

---

## 9. Accessibility

| Check | Result | Notes |
| --- | --- | --- |
| Written analysis label | PASS | Label associated with textarea |
| File input present | PASS | |
| Keyboard focus moves | PASS | Tab reaches controls |
| Focus indication | PASS (best-effort) | UA/focus-visible dependent; no keyboard trap observed |
| Reduced motion | PASS | Context launched with `reducedMotion: "reduce"`; page stable |
| WCAG certification | Not claimed | |

---

## 10. Security

| Control | Result |
| --- | --- |
| Auth / enrollment / unlock gates | PASS |
| Dataset not public | PASS |
| Artifact download owner-only | PASS |
| IDOR denied | PASS |
| CSRF required on upload | PASS |
| Extension + magic-byte validation | PASS |
| Size limit | PASS |
| Path traversal on attachment id | PASS |
| Storage key not returned in API metadata | PASS (`formatAttachmentApiRecord` omits `storageKey`) |
| Absolute FS path not exposed | PASS |
| Artifacts not under public static root | PASS |
| No new auth bypass in L14 seed/UI | PASS |

L13 security controls remain intact (full L13 suite still green).

---

## 11. Content Integrity

| Check | Result |
| --- | --- |
| Brief title / Virelia case | PASS |
| Learning objectives / learner task / R1–R7 | PASS |
| Milestones / constraints / deliverables / rubric | PASS |
| Written + artifact completion criteria | PASS |
| HR-specific (no Sales Analysis required-analysis language) | PASS |
| No CAT/JEE/NEET | PASS |
| No placement guarantees / employer claims as product promises | PASS |
| No fake scoring / fake progress | PASS |

Rendered ProjectExperience uses authored brief JSON as source of truth (plus additive LO/dashboard sections).

---

## 12. Performance Regression

| Check | Result | Observation |
| --- | --- | --- |
| Homepage eager ProjectExperience | PASS | `HomePage` / `index` bundles do not contain `ProjectExperience` or `virelia` |
| L14 lazy scoped | PASS | `LessonContent` `lazy(() => import('./ProjectExperience'))`; separate chunk ~13.5 KB |
| Dataset not in homepage JS | PASS | |
| Public payload regression | PASS | No L14 curriculum strings in public SPA HTML shells |
| Duplicate global shell | Not introduced | |
| High-refresh claims | Not made | |

---

## 13. L13 Regression

| Check | Result |
| --- | --- |
| L13 API suite in `test:lms` | PASS |
| L13 files not modified by Phase 17 | PASS (local rematerialization of LFS xlsx for validation only; not committed) |
| L13 → L14 unlock | PASS |

---

## 14. Test Matrix

| Area | Result | Evidence | Notes |
| --- | --- | --- | --- |
| Production build | PASS | `npm run build` | |
| Production start | PASS | PORT 3020 health + SPA | |
| Migration | PASS | isolated DB migrate deploy | |
| Dataset validation | PASS | generator `passed: true` | |
| AssignmentBrief | PASS | L13+L14 only | |
| L14 API | PASS | test:lms step 23 | |
| Artifact upload | PASS | test:lms + storage script | |
| Artifact download | PASS | byte compare | |
| IDOR | PASS | 403 other learner | |
| CSRF | PASS | missing token rejected | |
| File validation | PASS | ext/signature/size | |
| Completion | PASS | written + stored binary | |
| L13 → L14 unlock | PASS | | |
| L14 → L15 unlock | PASS | | |
| Browser desktop 1440 | PASS | Playwright | |
| Browser mobile 390 | PASS | Playwright | |
| 375 | PASS | Playwright | |
| 390 | PASS | Playwright | |
| 430 | PASS | Playwright | |
| 768 | PASS | Playwright | |
| 1024 | PASS | Playwright | |
| 1440 | PASS | Playwright | |
| Accessibility | PASS | labels/keyboard/reduced-motion | Not WCAG cert |
| Public route smoke | PASS | listed routes 200, no L14 leak | |
| Performance regression | PASS | lazy chunk / no homepage embed | |
| Security | PASS | see §10 | |
| Git/diff audit | PASS | report-only commit intended | |

---

## 15. Fixes Applied

**None.** No P0/P1 blockers found. No application code changes in Phase 17.

---

## 16. Known Limitations

1. Local filesystem artifact storage is **not** multi-instance safe without a shared volume (or future object storage).
2. Curriculum `.xlsx` assets are Git LFS — deploy/CI must pull LFS objects or regenerate.
3. Faculty review, auto-scoring, CareerOS evidence, recruiter integration, and object storage remain **out of scope** (not blockers).
4. Remaining title-only assignment nodes (`l6`, `l12`, other courses) intentionally lack briefs.
5. Accessibility checked functionally; not a formal WCAG audit.
6. Unrelated dirty/untracked local files observed during validation (not part of release): rematerialized L13 xlsx working tree; untracked `scripts/final-az-qa.mjs`, `scripts/release-browser-e2e.mjs`, `scripts/release-smoke.mjs`, `scripts/seed-release-browser-user.ts`.

---

## 17. Deployment Requirements

1. **Persistent/shared volume** for `LMS_ARTIFACT_STORAGE_DIR` (single instance + volume, or shared filesystem across instances).
2. **`npx prisma migrate deploy`** on the target database.
3. **Database seed** (or equivalent) so L13/L14 AssignmentBriefs and catalog exist.
4. Set **`FRONTEND_URL`** appropriately for the deployed origin.
5. **HTTPS production must not force `COOKIE_SECURE=false`**.
6. **Multi-instance requires shared artifact storage** (or a future object-storage provider). Do not claim multi-instance safety on local disk alone.
7. Ensure curriculum dataset binaries are present (`git lfs pull` or run generate scripts).

---

## 18. Final Release Decision

**READY WITH DEPLOYMENT REQUIREMENTS**

Ship L14 subject to the deployment requirements above. The learner flow (brief → dataset → analysis → artifact → submit → unlock) is validated end-to-end, L13 remains green, and no P0/P1 application defects were found during this release gate.
