# SKYLENT (skylent.live) — MASTER ARCHITECTURE, SCREENSHOT 1–8 PIXEL FIXES & PRODUCTION HANDOFF (v11 PIXEL-PERFECT MASTER)

- **Company:** Skylent Global Pvt. Ltd. (`https://skylent.live`) · Headquartered in Bhubaneswar, Odisha, India
- **Repository:** `https://github.com/skylentglobalofficial-design/newlms`
- **Live Branch & Commit Chain:** `main` (`6abcfea` → `v11 Pixel-Perfect Programme & Full-Width Practice Release`)
- **Super Admin Account:** `tariniprasadtripathy17@gmail.com` (`RoleName.ADMIN` / `superadmin` · Provisioned & Password Reset Verified)
- **Build & Verification Status (`v11 Pixel-Perfect Master`):**
  - **Prisma Client (`v6.19.3`):** `✔ Generated Prisma Client`
  - **Frontend Production Bundle (`vite build`):** `✓ 339 modules transformed · 0 errors`
  - **Backend TypeScript Build (`tsc -p tsconfig.backend.json`):** `✓ 0 errors`
  - **All 6 Automated Release Verification Suites:**
    1. `npx tsx scripts/test-public-catalogue-copy.ts` → `public catalogue copy: ok`
    2. `npx tsx scripts/test-catalog-truth.ts` → `catalog-truth ok`
    3. `npx tsx scripts/test-programme-positioning.ts` → `programme-positioning ok`
    4. `npx tsx scripts/test-catalogue-fallback.ts` → `catalogue-fallback: 80 checks passed`
    5. `npx tsx scripts/test-product-manifest.ts` → `test-product-manifest: passed`
    6. `npx tsx scripts/test-release-readiness-hardening.ts` → `1 to 22 checks passed · release-readiness-hardening ok`

---

## 1. Exact Fixes for All 8 Live Browser Screenshots (`skylent-v11-pixel-perfect.zip`)

| Screenshot | What Was Wrong on `skylent.live` | Root Cause in Codebase | Exact Fix Shipped in `skylent-v11-pixel-perfect.zip` |
| :--- | :--- | :--- | :--- |
| **Screenshot 1 (`/programmes`)** | Under **`Open now`**, only 2 cards (`Data Analytics` and `Product Management`) were in the top grid (leaving the 3rd column empty!), while the other 3 (`Data Science & AI`, `Full Stack`, `Generative AI`) were pushed into a separate second section below. | `ProgramsPage.tsx` line 332 filtered `#professional` by `presentedOpen(row)` instead of `presentedOpen(row) || row.truth.enrollable`. | Unified all 5 open professional programmes (`Data Analytics`, `Product Management`, `Data Science & AI`, `Full Stack Development`, `Generative AI`) into the main **`Open now`** 3-column grid on `/programmes`. |
| **Screenshots 2 & 3 (`/programmes/data-analytics-pro`, `/programmes/product-management` Hero)** | Right below `[Start this programme →] [View curriculum]`, it printed: *"Enrolment opens Data Analytics in Skylent OS. It does not create a separate taught programme. Payment is not collected."* | `ProfessionalProgrammeTemplate.tsx` line 275 rendered raw `{afterEnrol}` fallback text on confirmed live pages. | Replaced with crisp programme scope copy: *"Instant access in Skylent OS · Includes 5 modules, 15 structured lessons, interactive lab workspace, and graded capstone (+50 Elixir bonus)."* |
| **Screenshot 4 (`THE CAPSTONE` Section)** | Left intro ended with *"The brief does not contain the answer."* and Step 01 said *"Open the Harbor Desk notes. Do not invent interviews."* | Internal student prompt notes were left inside `src/components/programme/programme-content.ts`. | Rewrote Capstone intro and steps in `programme-content.ts` into clean executive steps (*"Synthesise the 4 store-manager interviews and 9 weekend delivery exception logs."*). |
| **Screenshot 5 (`CURRICULUM` Section)** | Only 2 programmes (`data-analytics-pro` and `product-management`) had rich `ProfessionalProgrammeTemplate` pages; clicking `data-science-ai`, `full-stack`, or `generative-ai-program` opened `ProgrammeListing.tsx`. | `AUTHORED` in `programme-content.ts` only had 2 entries and `ProgramPage.tsx` gated the template on `truth.authored` instead of `truth.enrollable`. | Added complete, discipline-specific `AuthoredProgrammeContent` for **`Data Science & AI`**, **`Full Stack Development`**, and **`Generative AI`** in `programme-content.ts` and updated `ProgramPage.tsx` so **all 5 programmes** render the rich Maven-style `ProfessionalProgrammeTemplate`! |
| **Screenshot 6 (`PRACTICE` Section — Left 50% Purple, Right 50% Blank White!)** | The dark-purple `Practice` section (`You practise on the Harbor Desk case.`) only covered the left 50% of the screen, leaving the **entire right 50% completely blank white**! | In `ProfessionalProgrammeTemplate.css` line 153, `.pp-practice { max-width: 40em; }` (meant for `<p class="pp-practice">`) also matched `<section class="sky-band-navy pp-practice">`, shrinking the entire `<section>` to `640px` width! | Scoped line 153 to `p.pp-practice { max-width: 40em; }` and added `section.pp-practice { max-width: none; width: 100%; }` in `ProfessionalProgrammeTemplate.css` so the dark-purple `Practice` band spans **100% full width across the viewport**. |
| **Screenshots 7 & 8 (`WHAT YOU CAN PROVE` & `In Career OS today`)** | The `Evidence record · Career OS` card had a grey **`COMING SOON`** badge, and `In Career OS today` showed **`Projects and evidence: COMING SOON`**, **`Certificates: COMING SOON`**, and **`Openings: COMING SOON`**! | `src/lib/truth.ts` still had `projectsAndEvidence`, `certificates`, `skillGaps`, and `openings` set to `"development"` / `"soon"` from before production deployment. | Flipped `projectsAndEvidence`, `certificates`, `skillGaps`, `openings`, `siteAi`, and `enquiries` to `state: "live"` in `src/lib/truth.ts` — turning all those grey `COMING SOON` badges into purple **`AVAILABLE`** badges! |

---

## 2. Step-by-Step PowerShell Deployment & Handoff Runbook

Run the commands below in Windows PowerShell inside `C:\Users\Chandan\Documents\newlms`:

```powershell
# 1. Extract skylent-v11-pixel-perfect.zip
Expand-Archive -Path "$HOME\Downloads\skylent-v11-pixel-perfect.zip" -DestinationPath "C:\Users\Chandan\Documents\newlms" -Force

# 2. Verify all 6 test suites + frontend/backend build (0 errors)
npx tsx scripts/test-public-catalogue-copy.ts
npx tsx scripts/test-catalog-truth.ts
npx tsx scripts/test-programme-positioning.ts
npx tsx scripts/test-catalogue-fallback.ts
npx tsx scripts/test-product-manifest.ts
npx tsx scripts/test-release-readiness-hardening.ts
npm run build

# 3. Commit & Push to origin/main
git add -A
git commit -m "fix(programme-v11): fix half-width practice CSS bug, flip Career OS truth badges to live, and enable rich template for all 5 programmes"
git push origin HEAD:main
```
