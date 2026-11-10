# Skylent Global Website — Implementation Plan

## Context

The user has provided a detailed brand brief for **Skylent Global**, an education ecosystem company. The current `src/App.tsx` is a blank dot-grid placeholder. The task is to replace it with a full premium multi-section website matching the brief's 19 sections, using Skylent's exact colour system and editorial visual language.

---

## Aesthetic Stance

**Commitment:** Editorial-tech — the tension between old-world print editorial (confident serif headlines) and clean product UI (modern sans). NOT SaaS-blue, NOT neon EdTech, NOT generic course cards.

**Fonts (Google Fonts — Vite @import in src/index.css):**
- **Fraunces** — variable serif display for big editorial headlines ("Education should not end when the class ends", hero, manifesto). Rare in EdTech, extremely ownable.
- **DM Sans** — clean, legible companion for body copy, nav, UI labels, buttons.
- **DM Mono** — sparingly for data: stats, percentages, course progress numbers.

**Colour rhythm (from brief):**
- Dark sections (#0B0D0F): Technology / LMS / Product
- Warm White sections (#F8F6F2): Education / Students / Storytelling
- Orange (#F36B21): Action moments, CTAs, progress bars, brand punctuation only — intentional and scarce.
- Sand (#EEE9E1): card surfaces on warm-white ground
- Slate (#667078): secondary text, captions, metadata

---

## Files to Modify

| File | Change |
|------|--------|
| `src/index.css` | Add Google Fonts @imports (Fraunces, DM Sans, DM Mono) before `@import 'tailwindcss'`; add CSS custom properties for Skylent tokens |
| `src/App.tsx` | Replace with full Skylent website — all sections |

No new files needed (keep it in one component file with internal section components for this scope).

---

## Sections to Build

### 1. Navigation
- Sticky, translucent on scroll (dark bg)
- Links: Education · Career · Skylent OS · For Institutions · Universities · Success Stories · About
- CTAs: "Partner With Us" (outlined) + "Explore Learning" (orange filled)

### 2. Hero
- Dark ground (#0B0D0F)
- Headline: **"WHERE LEARNING BECOMES CAREER."** (stronger, more ownable than the brief's default)
- Sub: "Skylent builds technology-powered learning ecosystems that connect students, institutions and industry."
- CTAs: Explore Learning + Partner With Skylent
- Mock LMS interface as hero visual — layered card stack showing: student dashboard, video lesson, progress bar, certificate — positioned right side, subtle glow, slight 3D perspective tilt via CSS transform

### 3. "One Ecosystem" Journey
- Warm white ground
- Section label: ONE ECOSYSTEM. EVERY STAGE OF LEARNING.
- 8-step journey: Discover → Choose → Learn → Practice → Build → Assess → Certify → Career
- Rendered as a horizontal scrolling track with a progress line; active step highlighted in orange; each step has a small icon and 1-line description
- Interactive: clicking a step shows a small contextual UI preview panel

### 4. Student Experience ("See Learning Through a Student's Eyes")
- Dark ground
- Full mock student dashboard: "Good morning, Arjun" header; Continue Learning card (Data Science & AI, 72% progress bar in orange); Today's Live Class; Learning Streak; Certificate Progress; AI Learning Assistant
- Tabs: Dashboard / Course / Assessment / Project — switching shows different mock UI states

### 5. Course Experience ("Don't just choose a program. Experience it first.")
- Warm white ground
- Program cards for: Data Science & AI · Data Analytics · Generative AI · Full Stack Development · Product Management
- Each card: duration, modules, projects count, certification badge
- "Preview" button opens an inline mock: Video → Module → Notes → Quiz → Project steps

### 6. Program Architecture
- Sand ground
- Three product categories displayed editorially (not equal cards):
  - **01 — DEGREE & CERTIFICATION** — academic advancement
  - **02 — CAREER ACCELERATOR** — portfolio + placement
  - **03 — SKYLENT LABS** — workshops, bootcamps, masterclasses
- Large numbering in slate, strong typographic hierarchy

### 7. Career Experience ("Learn Skills. Build Proof. Become Career Ready.")
- Dark ground
- Horizontal pipeline: Learning → Projects → Portfolio → Resume → Mock Interview → Interview → Job
- Each stage has an icon and brief description; orange connector line between stages

### 8. Job Board ("Skylent Jobs")
- Warm white ground
- Functioning search + filter UI (React state): Location, Experience, Skills, Work Mode filters
- 4–5 realistic Indian market job listings (Junior Data Analyst, ML Engineer, etc.) with company, salary in LPA, skills tags, Apply Now button
- Below: hiring pipeline steps: Discover → Apply → Screening → Interview → Selection

### 9. Success Stories ("Real People. Real Transformation.")
- Dark ground
- 3 story cards — Ananya, Rohan, Priya — each with: Before state / Skylent Solution / Outcome (role + company)
- Editorial layout: large name in Fraunces, structured data in DM Mono

### 10. Partner Ecosystem ("Built Together. Built for Impact.")
- Warm white ground
- Equation visual: Universities + Skylent + Industry + Technology = Student Outcomes
- Flow diagram: University → Program → Skylent LMS → Faculty → Students → Projects → Industry → Career
- Partner logo placeholder row (grid of neutral placeholder boxes with "Partner" label — brief says no fabricated logos)

### 11. Institutional Experience ("Your Institution. A Modern Learning Ecosystem.")
- Dark ground
- Feature grid: LMS · Curriculum support · Analytics · Certification · Career ecosystem
- Mock admin/faculty dashboard panel
- CTA: Partner With Skylent

### 12. About / Manifesto ("Education Should Not End When The Class Ends.")
- Warm white ground
- Full-width Fraunces display typography, cinematic layout
- Manifesto paragraphs: "The world of work is changing faster..."
- Minimal, lots of whitespace, typographic-only section

### 13. Final CTA
- Orange ground (#F36B21) — one of the few full orange moments
- "THE NEXT GENERATION OF LEARNING IS ALREADY HERE."
- "Build it with Skylent."
- Two buttons: Explore Learning (dark) + Partner With Skylent (outlined white)

### 14. Footer
- Deep ink ground
- Logo, nav links grouped by category, social links, copyright

---

## Implementation Notes

- All sections use CSS custom properties for colour tokens defined in `src/index.css`
- Scroll-based effects: use `IntersectionObserver` via `useEffect` for fade-in reveals
- Interactive elements (tabs, journey steps, job filters) use `useState`
- Mock LMS UI built from pure JSX/CSS — no external UI library needed
- Unsplash photos for student/campus imagery via `images.unsplash.com` URLs
- 8px spacing grid — use Tailwind spacing consistently
- Responsive: single breakpoint at ~1024px; hero stacks, grids collapse

---

## Verification

After implementation, check:
1. All sections render without console errors
2. Navigation links scroll to correct sections
3. Interactive elements (tabs, journey, job filters) respond correctly
4. Orange is scarce and intentional — not overwhelming
5. Typography hierarchy is clear: Fraunces for display, DM Sans for body
6. Mobile layout is usable at ~375px width
