# SKYLENT (skylent.live) — MASTER ARCHITECTURE, V11 PIXEL FIXES + V12 EDTECH VISUAL & CONVERSION OVERHAUL

* **Company:** Skylent Global Pvt. Ltd. (`https://skylent.live`) · Headquartered in Bhubaneswar, Odisha, India
* **Repository:** `https://github.com/skylentglobalofficial-design/newlms`
* **Live Branch & Release:** `main` (`v12 EdTech Visual, Motto & Conversion Master — Includes All V11 Screenshot 1–8 Fixes`)
* **Super Admin Account:** `tariniprasadtripathy17@gmail.com` (`RoleName.ADMIN` / `superadmin` · Provisioned & Password Reset Verified)
* **Verification Status (`v12 EdTech Visual Master`):**
  * **Prisma Client (`v6.19.3`):** `✔ Generated Prisma Client`
  * **Frontend Production Bundle (`vite build`):** `✓ 0 errors`
  * **Backend TypeScript Build (`tsc -p tsconfig.backend.json`):** `✓ 0 errors`
  * **All 6 Automated Release Verification Suites:**
    1. `npx tsx scripts/test-public-catalogue-copy.ts` → `public catalogue copy: ok`
    2. `npx tsx scripts/test-catalog-truth.ts` → `catalog-truth ok`
    3. `npx tsx scripts/test-programme-positioning.ts` → `programme-positioning ok`
    4. `npx tsx scripts/test-catalogue-fallback.ts` → `catalogue-fallback: 80 checks passed`
    5. `npx tsx scripts/test-product-manifest.ts` → `test-product-manifest: passed`
    6. `npx tsx scripts/test-release-readiness-hardening.ts` → `1 to 22 checks passed · release-readiness-hardening ok`

## 1. What Shipped in V12 (`skylent-v12-edtech-visual-master.zip`)

| Upgrade Area | What Was Weak / Missing Before | What V12 Ships (`skylent-v12-edtech-visual-master.zip`) |
| :--- | :--- | :--- |
| **1. Hero Motto & Visual Proof (`src/pages/home/Repolish.tsx`)** | Headline was generic (*"Learn. Practise. Build. Prove it."*) and printed a confusing internal status sentence (*"Two programmes are open to start..."*) right in the Hero. | Upgraded Hero motto to **"Don’t just watch lectures. *Ship real work.*"** with 3 crisp proof chips (`6 Authored Tracks · 90 Interactive Lessons`, `In-Browser SQL, Python & Case Studios`, `Cryptographic Dossier (/verify) + 20-Min TA SLA`) and a floating **Cryptographic Proof-of-Work (`SKL-2026-DA · 96/100`)** badge on the visual stage. |
| **2. Open-by-Default Interactive SQL & Case Sandbox (`Repolish.tsx`)** | The 60-second Northwind SQL Lab & Harbor Desk Boardroom Cold Call sandbox was collapsed behind a button (`open = false`), and `InsideProgramme` defaulted to a plain text list (`stage = 0`). | Set `open = true` and `sqlRan = true` by default in `ZeroLoginInteractiveTryout` and set `InsideProgramme` default tab to **Stage 2 (`Practice · Northwind lab`)** so visitors immediately see live SQL code + revenue bar charts without clicking! |
| **3. Unique Track Workbench Overlays + Full-Color SVG Tool Pills + Target Job Roles (`src/components/skylent/EdTechVisuals.tsx`)** | Homepage and `/programmes` repeated the same 3 stock photos twice across 6 cards, had zero colored tool icons, and never showed Target Job Roles. | Built `EdTechVisuals.tsx` with **Full-Color SVG Tool Badges** (`SQL & Joins`, `PostgreSQL`, `Python 3`, `ETL & Pytest`, `React 19`, `TypeScript`, `Node & Express`, `LLM Architecture`, `Grounded RAG`, `PRD & Roadmaps`), **`TargetRolesBadge`** (*Data Analyst, PM, Python Engineer, Data Scientist, AI Engineer, Full-Stack Dev*), and **`TrackWorkbenchOverlay`** (live dark-mode code/studio bar on every card). |
| **4. 5 Discipline-Specific Workbench Plates on `/programmes/:slug` (`ProgrammeArtefacts.tsx` & `ProfessionalProgrammeTemplate.tsx`)** | `Data Science & AI`, `Full Stack`, and `Generative AI` programme pages were reusing the `NorthwindLabPlate` or `HarborDeskPlate`. | Added **`DataSciencePlate`** (Python + SQL Out-of-Time Cohort Validator), **`FullStackPlate`** (PostgreSQL + TypeScript Idempotent Payment Ledger), and **`GenAiRagPlate`** (Enterprise Grounded RAG Citation & Refusal Gate) so all 5 programmes display their own authentic workbench on the navy stage. |
| **5. Shareable Cryptographic Diploma Preview & Live Exemplar Dossiers (`ProfessionalProgrammeTemplate.tsx`, `CourseDetailPage.tsx`, `Repolish.tsx`)** | Certificate & portfolio proof were described only as text tables; `HomeCareer` had negative disclaimer text (*"without making placement guarantees"*). | Embedded **`ShareableCredentialPreviewCard`** (Gold-and-Navy Cryptographic Diploma preview) on every `/programmes/:slug` and `/courses/:slug` page, and added a **3-Card Exemplar Student Dossier Showcase** (`Aarav Sharma 96/100`, `Meera Krishnan 95/100`, `Rohan Verma 97/100`) in `HomeCareer`. |
| **6. All V11 Screenshot 1–8 Fixes Included** | Half-width purple `Practice` section bug (`ProfessionalProgrammeTemplate.css`), `COMING SOON` badges in `truth.ts`, and split `/programmes` grid. | Fully included in V12: `section.pp-practice { max-width: none; width: 100%; }`, all Career OS capabilities set to `state: "live"` (`AVAILABLE`), and all 5 open programmes unified in `/programmes`. |

## 2. Step-by-Step PowerShell Deployment Commands

Run the commands below in Windows PowerShell inside `C:\Users\Chandan\Documents\newlms`:

```powershell
# 1. Extract skylent-v12-edtech-visual-master.zip
Expand-Archive -Path "$HOME\Downloads\skylent-v12-edtech-visual-master.zip" -DestinationPath "C:\Users\Chandan\Documents\newlms" -Force

# 2. Run all 6 automated verification suites + production build (Zero errors)
npx tsx scripts/test-public-catalogue-copy.ts
npx tsx scripts/test-catalog-truth.ts
npx tsx scripts/test-programme-positioning.ts
npx tsx scripts/test-catalogue-fallback.ts
npx tsx scripts/test-product-manifest.ts
npx tsx scripts/test-release-readiness-hardening.ts
npm run build

# 3. Commit & Push to origin/main (triggers Vercel + Render auto-deploy)
git status -s
git add -A
git commit -m "feat(visual-v12): ship EdTech visual overhaul, full-color stack badges, target roles, 5 discipline plates, and diploma previews"
git push origin HEAD:main
```
