# Skylent Global — Public Website Redesign Plan

## Context

Skylent.live is an existing, fully-functional React 19 + Vite 8 + Tailwind v4 platform (education → skills → career, branded **Skylent OS**). It has an 11-section homepage, ~15 public marketing pages, 5 dashboards, an LMS, and a localStorage-backed auth + enrollment system. The current public site reads as a competent but generic EdTech template: sections look visually similar, the information architecture doesn't clearly express the three pillars (Education / Skills / Career OS), and the "Career OS unlocks after a Professional Program" journey is not communicated.

This plan is a **major visual + UX + IA transformation of the public-facing site only**, preserving all backend, auth, enrollment, dashboard, and LMS logic. It is a plan document — **no code changes** until the user says `BUILD`.

**Confirmed decision (user):** Add new hub pages (`/education`, `/skills`) and keep the existing catalog routes (`/courses`, `/programs`, `/workshops`, `/career-os`) as functional sub-listings, with legacy routes redirected. This is the lowest-risk path for the enrollment/auth flow.

---

## Guiding principles

- **Preserve functional integrity.** Do not touch `AuthContext`, `EnrollmentModal`, `ApplyModal`, `JobDrawer`, the enrollment step logic, dashboards, or LMS. Redesign only presentation and IA.
- **Editorial, not template.** Restrained neutrals + deep ink, orange as a *scarce* accent, large Fraunces display type, generous whitespace, strong section-to-section contrast.
- **Reuse before rebuild.** The project already has a token object (`C`), scroll-reveal hooks (`useFadeIn`, `useInView`, `useCountUp`, `FadeIn`), and a glass-token system in `index.css` that is defined but unused. The redesign will **wire the existing `--glass-*` tokens** and **introduce a small shared component layer** instead of the current copy-pasted inline styles.
- **No new heavy dependencies.** Keep animation hand-rolled with the existing IntersectionObserver hooks. Do not add framer-motion/GSAP for decorative effects.

---

## 1. Information Architecture

New top-level public IA (per brief), replacing the current fragmented set (`/education`, `/career`, `/os`, `/institutions`, `/universities`, `/labs`, `/courses`, `/programs`, `/workshops`, `/career-os`, `/stories`, `/blog`, `/about`, `/contact`):

```
HOME (/)
EDUCATION (/education)          → Schooling · Undergraduate · Postgraduate
SKILLS (/skills)               → Webinars · Certificate Programs · Professional Programs · Job Assistance
CAREER OS (/career-os)         → Interview Preparation · Job Board
FOR INSTITUTIONS (/institutions)
STORIES (/stories)  ·  BLOG (/blog)
ABOUT (/about)
CONTACT (/contact)
```

**Route mapping (preserves all functionality):**

| New IA node | Route | Backing implementation |
|---|---|---|
| Education hub | `/education` | Redesign existing `EducationPage.tsx` as the pillar hub |
| Skills hub | `/skills` | **New** `SkillsPage.tsx` hub linking the four skill types |
| — Webinars | `/workshops` | Existing `WorkshopsPage` (relabeled "Webinars" in nav copy) |
| — Certificate + Professional Programs | `/programs` | Existing `ProgramsPage` (filter/tab by Certificate vs Professional) |
| — Job Assistance | `/skills#job-assistance` or section | Content section on Skills hub |
| Career OS | `/career-os` | Redesign existing `CareerOSPage.tsx` |
| Job Board | `/career-os` (Jobs tab) | Existing tab; `/jobs` already redirects here |
| Institutions | `/institutions` | Redesign existing `InstitutionsPage.tsx` |
| Stories / Blog / About / Contact | existing routes | Redesign in place |

**Legacy routes kept as redirects** (no dead links): `/courses` → keep as course catalog but surface under Skills; `/os`, `/universities`, `/labs`, `/career` → redirect to their nearest new home (`/os`→`/career-os` product section or `/education`; `/universities`,`/labs`→`/institutions`; `/career`→`/career-os`). All `:slug` detail routes (`/programs/:slug`, `/courses/:slug`, `/workshops/:slug`, `/blog/:slug`) are **untouched** so enrollment deep-links keep working.

---

## 2. Homepage structure

The current homepage has 11 near-uniform dark sections. Redesign into a tighter narrative (PROBLEM → WHY → OS → EDUCATION → SKILLS → CAREER OS → OUTCOME → CTA) with deliberate light/dark alternation. **Recommended section order** (details in final section).

---

## 3. Navigation & dropdown structure

Rebuild `Nav` in `shared.tsx`. Desktop bar: **Logo · Education · Skills · Career OS · Institutions · Stories · About** on the left/center; **Search · Sign In · Primary CTA ("Explore Skylent OS")** on the right.

- **Dropdowns** for Education (Schooling/UG/PG), Skills (Webinars/Certificate/Professional/Job Assistance), Career OS (Interview Prep/Job Board). Institutions/Stories/About are direct links.
- Replace the current 4-group mega-menu data (`megaMenu`) with 3 pillar dropdowns matching the new IA; each dropdown item = label + one-line descriptor + route.
- **Sticky with scroll response:** transparent over hero → on scroll compact height + glass background using the existing `--glass-01-*` tokens (currently faked inline).
- **Global search preserved** — keep `handleSearch` → `/courses?q=`, restyled.
- **Auth-aware CTAs preserved** — keep the logged-in avatar chip + role badge + Dashboard link + Sign Out, and `dashRoute()`. Only restyle.
- **Mobile:** a purpose-built full-screen overlay panel (not a shrunk desktop menu) — large tap targets, accordion pillar sections, search field, Sign In + CTA pinned at bottom.

---

## 4. Education page (`/education`)

Redesign `EducationPage.tsx`. Positioning: *"Build the foundation. Shape the future."* Editorial hero (warm/light), then three pathway blocks — **Schooling · Undergraduate · Postgraduate** — each with concise positioning, description, a restrained visual, and a CTA. Clean hierarchy, uncrowded. Links back to Skills as the next step.

## 5. Skills page (`/skills`) — NEW

New `SkillsPage.tsx` hub. Positioning: Skills as the bridge from education to employability, with a **Learn → Build Skills → Career Ready** progression. Four offerings — **Webinars, Certificate Programs, Professional Programs, Job Assistance** — with **Professional Programs given the strongest visual weight** (largest card / feature block) because it unlocks Career OS. Each links to its backing catalog route. Include an explicit "Professional Program → Career OS Access" callout.

## 6. Career OS page (`/career-os`)

Redesign `CareerOSPage.tsx` to feel like a **product**, not a course page. Positioning: *"Your career, operating system."* Dark, dashboard-style aesthetic using the wired glass tokens. Communicate the unlock journey visually: **Professional Program → Access Granted → Career OS → Interview Preparation + Job Board**. Product-style UI mockups for Interview Prep and Job Board (reuse the existing tab structure + `ProgressRing`, restyled). Preserve all existing tabs/logic.

## 7. For Institutions page (`/institutions`)

Redesign `InstitutionsPage.tsx` (fold in the useful parts of `/universities`, `/labs`). Position Skylent as an industry + education technology partner for universities/colleges/schools. Value blocks: industry-aligned learning, skills development, professional programs, career readiness, Career OS, placement prep, technology-enabled learning. Strong CTA: **"Partner With Skylent"** (→ `/contact`). Design sections so real logos/metrics can be inserted later (no fabricated stats).

## 8. About / Stories / Contact

- **About** (`AboutPage.tsx`): editorial mission/story; company-building-infrastructure tone. No invented numbers.
- **Stories** (`StoriesPage.tsx`): keep as testimonial/alumni surface but design with placeholder slots so only *real* stories appear; nothing fabricated.
- **Contact** (`ContactPage.tsx`): restyle the existing form + info columns; wire the "Partner With Skylent" intent (subject/segment field). Preserve form behavior.

---

## 9. Visual design system

Introduce a **shared component layer** (`src/components/ui.tsx`) to replace copy-pasted inline styles, built on the existing `C` token object and the `--glass-*` / `@theme` tokens:

- `Button` (variants: primary/secondary/ghost/dark), `Card`, `Badge`/`Eyebrow`, `SectionHeader`, `Pillar Card`, `ProductMock` wrapper, `Stat`, `Tabs`, `FeatureBlock`.
- Consistent scale: radius (8 controls / 14–18 cards), spacing rhythm, border (`rgba(255,255,255,0.08–0.12)` on dark; `rgba(11,13,15,0.08)` on light), shadow tiers.
- **Wire the unused `--glass-01/02/03` tokens** into Nav / cards / product surfaces instead of inline rgba.
- **Section contrast:** deliberately alternate warm-white editorial, sand, and deep ink surfaces so no two adjacent sections look identical.

## 10. Typography

Keep the existing, already-wired Google fonts (no font skill needed): **Fraunces** (display), **DM Sans** (body), **DM Mono** (data/eyebrows). Sharpen usage:
- Headlines: Fraunces, large `clamp()`, tight `letter-spacing: -0.025em`, confident weights.
- Body: DM Sans, calm, readable, generous line-height.
- Eyebrows/labels/stats: DM Mono, uppercase, wide tracking.
Establish a documented type scale in `ui.tsx` / `index.css`.

## 11. Color system

Keep brand tokens: ink `#0B0D0F`, orange `#F36B21`, warmWhite `#F8F6F2`, sand `#EEE9E1`, slate `#667078`. **Orange becomes a scarce accent** (CTAs, single highlight per section), not a flood. Add restrained neutral steps for surfaces/borders. Subtle gradients only on hero/product surfaces. No neon, no random blobs.

## 12. Components to redesign

Buttons, cards, nav, dropdowns, section headers, CTAs, forms, footer, badges, tabs, product mockups, feature blocks — all centralized in `ui.tsx`. Footer redesigned to match new IA columns (Education / Skills / Career OS / Company) while keeping existing link targets valid.

## 13. Animations & interactions

Reuse existing hooks — **no new library**. Apply intentionally: scroll reveal (`FadeIn`), count-up on stats (`useCountUp`), card hover lift, button micro-interactions, subtle hero parallax, nav scroll transition, product-UI micro-animations. Respect the existing `prefers-reduced-motion` block. Nothing flashy/template-y.

## 14. Responsive / mobile

Genuine recomposition, not shrinking: mobile-first stacking, purpose-built mobile nav overlay, fluid `clamp()` type, tappable targets ≥44px, capped card heights, no horizontal overflow, performant (transform/opacity only) animations. Verify at desktop / tablet / mobile widths.

## 15. Conversion strategy

Clear primary path: **Explore Skylent OS** (hero + nav) and **Partner With Us / Partner With Skylent** (secondary). Each pillar page ends with a next-step CTA that advances the Education→Skills→Career OS journey. Career OS page drives toward Professional Program enrollment (the unlock). All CTAs route into existing, working enrollment/contact flows — no new backend.

## 16. Preserving existing functionality

- **Untouched:** `AuthContext`, `EnrollmentModal`, `ApplyModal`, `JobDrawer`, enrollment step logic (incl. auth-aware Account-step skipping, GST, demo payment, orderId/txnId, `navigate('/dashboard/student')`), all dashboards, LMS (`LearnPage`), `/…/:slug` detail routes.
- **Routing:** new hubs added; legacy routes redirected (no dead links); search + auth CTAs behavior kept.
- **Styling:** brand tokens and font wiring preserved; new work adds a component layer + wires existing glass tokens, does **not** add an unlayered CSS reset.

---

## Existing sections/components — disposition

**Kept (behavior) / Redesigned (visuals):**
- `Nav`, `Footer` (shared.tsx) — redesigned to new IA, logic kept.
- `EducationPage`, `CareerOSPage`, `InstitutionsPage`, `AboutPage`, `StoriesPage`, `ContactPage`, `BlogPage` — redesigned in place.
- `ProgramsPage`, `CoursesPage`, `WorkshopsPage` + all `:slug` detail pages — kept as functional catalogs, restyled to new system, surfaced under Skills.
- `EnrollmentModal`, `ApplyModal`, `JobDrawer`, `ProgressRing`, `FadeIn`, hooks — kept.

**Reorganized:**
- Homepage sections (App.tsx `Hero`…`FinalCTA`) reordered/merged into the new narrative.
- Mega-menu data restructured to 3 pillar dropdowns.
- `/os`, `/universities`, `/labs`, `/career` content folded into `/career-os` / `/institutions` and their routes redirected.

**Removed (as standalone destinations; content absorbed):**
- Standalone `/os` gateway, `/universities`, `/labs` as top-level nav items (routes redirect, files may remain until BUILD cleanup).
- Redundant/near-duplicate homepage sections (e.g. overlapping `PartnerEcosystem` / `InstitutionalPreview`) consolidated.

**Newly created:**
- `SkillsPage.tsx` (Skills hub).
- `src/components/ui.tsx` (shared component + token layer).
- Redesigned homepage **Skylent OS** signature section (three interactive pillar cards).

---

## Recommended page hierarchy

```
/                    Home
/education           Education hub  (Schooling · Undergraduate · Postgraduate)
/skills              Skills hub     (Webinars · Certificate · Professional · Job Assistance)
  /workshops         Webinars catalog        (existing, restyled)
  /programs          Programs catalog        (existing, restyled; Certificate/Professional)
  /courses           Course catalog          (existing, restyled)
  /*/:slug           Detail + enrollment     (untouched)
/career-os           Career OS product       (Interview Prep · Job Board)
/institutions        For Institutions
/stories  /blog      Stories / Blog (+ /blog/:slug)
/about  /contact     About / Contact
/login  /signup      Auth (untouched)
/dashboard/*  /learn/*   Product (untouched)
Legacy redirects: /os, /universities, /labs, /career, /jobs → nearest new home
```

## Recommended homepage section order

1. **Hero** — "From Education to Employability." CTAs: *Explore Skylent OS* / *Partner With Us*; cinematic abstract ecosystem/product visual (no stock robots).
2. **The Problem / Why Skylent** — short editorial statement (fragmented education→career gap).
3. **Skylent OS — signature section** — "One ecosystem. Every stage of the journey." Three interactive pillar cards (Education / Skills / Career OS), each linking to its page.
4. **Education** — foundation preview → `/education`.
5. **Skills** — bridge to employability, Professional Programs emphasized → `/skills`.
6. **Career OS** — product showcase + unlock journey (Professional Program → Career OS) → `/career-os`.
7. **Outcome / Journey strip** — Professional Program → Access → Interview Prep + Job Board → Opportunities.
8. **For Institutions** — partnership preview → `/institutions`.
9. **Stories / Trust** — real-data-ready slots (no fabricated numbers).
10. **Final CTA** — Explore Skylent OS / Partner With Us.
11. **Footer** — redesigned, new IA columns.

---

## Verification (at BUILD time)

- `pnpm build` / typecheck clean; dev server hot-reloads.
- Manually walk every new/changed route; confirm no dead links and legacy redirects land correctly.
- Confirm enrollment flow end-to-end (logged-out and logged-in) from a `:slug` page → modal → success → dashboard, unchanged.
- Confirm global search and auth-aware nav CTAs still work.
- Check desktop / tablet / mobile for overflow, tap targets, reduced-motion.
```
