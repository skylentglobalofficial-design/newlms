# Skylent repolish — requirement map and open items (October 2026)

Branch `skylent/repolish`, built on `skylent/product-truth` (0271e2a). Sources reviewed: the user's
screenshot-by-screenshot note, HANDOFF.md (pasted in the request), the master implementation command,
and screenshots 2503–2572 from `Screenshot (2498).zip` (the first four images, 2498–2502, ignored as instructed).

## Requirement → where it was handled

| Requirement (source) | Route / files | Status |
|---|---|---|
| Remove Discover/Choose/…/Grow strip (note, img 1, 4, footer) | `components/shared.tsx` (footer, shell locator removed), `pages/home/*` (Journey removed) | Done |
| Hero clear, smaller; DA + learner photo one scroll down, with a reason (img 1–2) | `pages/home/Repolish.tsx` HomeHero + InsideProgramme ("How learning works") | Done |
| No numbering / FIG captions (img 3, 6) | `SectionIndex`, `Plate`, `Photo` in primitives/DegreeParts; captions removed from home, programme, degree, Career OS pages | Done |
| "What Skylent is" off the homepage → About (img 4) | `pages/AboutPage.tsx` | Done |
| Remove extra text such as "Northwind Lab belongs… Evidence is in development" (img 5) | Home rewritten; truth chips relabelled to plain words | Done |
| Student home on navy instead of cream, no FIG (img 6) | `pages/home/Learn.tsx`, `HomeRepolish.css` | Done |
| Programmes not loading (img 7, batch 2 img 4) | `hooks/useCatalog.ts` + `lib/catalogue-fallback.ts`; `pages/ProgramsPage.tsx` | Done in the frontend; production cause still to confirm (below) |
| Programmes presented like big brands: certification / professional, labs integrated | `pages/ProgramsPage.tsx`, nav | Done |
| Online / offline shown clearly with photos and redirects (img 8) | `pages/EducationPage.tsx`, home Degrees | Done (generic photos, never captioned as a specific campus) |
| Labs: more than one tool/domain, less text (img 10–11) | home Labs section: SQL lab + product case workbench | Done with the two labs that exist |
| Career OS shown as a journey / video-like visual, not DA everywhere (img 12–13) | `CareerJourney` walkthrough (home + `/career-os`), `pages/career/CareerOSPublicPage.tsx` | Done |
| Skylent AI: show how it helps, small cute robot/dot, contextual "not sure?" popup, path asked in chat, form if not satisfied, sad emoji (img 14, note) | `components/skylent/SiteAssistant.tsx` (+ `ai-events.ts`), home Skylent AI section | Done; see AI note below |
| Find My Path out of hero and nav | nav, home, programmes, degree pages | Done (`/path` route kept for old links) |
| Privacy policy and terms; terms on every enrolment (batch 2 img 3) | `pages/LegalPage.tsx` (`/terms`, `/privacy`), `components/legal/TermsConsent.tsx` in sign-up (email + Google), enrolment modal, learner enrol button, contact, degree enquiry, AI enquiry | Done (client-enforced; see consent note) |
| Less nav; Education dropdown = degrees only; schooling later (batch 2 img 6–7) | `PUBLIC_NAV` in `components/shared.tsx` | Done |
| Education = UG and PG, each online and offline; no DA/PM; no schooling; "path" not everywhere (batch 2 img 8–10, notes) | `pages/EducationPage.tsx` | Done |
| Course format like big brands (curriculum, brochure…) | Degree detail pages keep curriculum/eligibility/enquiry sections; brochure not added | Partial (no brochure file exists) |
| Search: popular / most viewed (batch 3 img 8) | `SEARCH_INDEX` in shared.tsx: grouped "Open now", Programmes, Degrees, Explore | Done without popularity (no view data exists) |
| Colour: deep navy / aurora, black + white, Inter (batch 3 img 7, handoff) | tokens in `skylent-site.css`, `design-system.css`, `tokens.ts`, `index.css`; hx-/pgx-/edx- stylesheets | Done |
| Institutions part was hidden in About (batch 3) | Nav link + homepage band + rewritten `/institutions` | Done |
| LMS: black left, white right, black video/PPT area (batch 3 img 7, last note) | `LearnWorkspace.css` dark outline rail, `components/lms/LessonSlide.tsx` black lesson panel; mobile shows it first | Done (written lessons show a slide from authored metadata; real videos keep their player) |

## Notes and decisions

- **/programmes root cause.** The frontend code path is correct (same component, same endpoint). On skylent.live the
  catalogue request fails ("request failed" on /programmes, empty on the homepage), so the API call to
  `https://api.skylent.live/api/v1/catalog/programs` is not succeeding in production. This environment cannot reach that
  host, so the server-side cause is not confirmed. Likely candidates to check on the Hostinger API: the API process is down
  or returning 5xx; `prisma migrate deploy` not run (the route calls `ensureProgramCourseLinks()` and includes the
  programme–course link table, which fails if the migration is missing); CORS not allowing `https://skylent.live`.
  The page now shows the published programme list (the same records `prisma/seed.ts` writes) when the request fails,
  with a quiet note that enrolment needs a moment. Enrolment itself still requires the API.
- **Skylent AI.** The guided finder is fixed rules over the real catalogue, not generated text. Free-text questions go to
  the existing `POST /reva/chat`; if the server has no AI key (503) or fails, the panel says so and offers the enquiry form.
  The invitation appears once per session after 25 s and a 40 % scroll on discovery pages; it never claims to detect
  confusion.
- **Consent.** The checkbox blocks submission in the browser. The backend has no consent field, so acceptance is not
  recorded server-side. To store it, add e.g. `termsAcceptedAt` to `User`/`Enrollment`/`SkylentEnquiry` and send it.
- **Legal text** describes the product's real behaviour (accounts, progress, Career OS records, enquiries, two essential
  cookies). It must be reviewed by the Skylent owner and legal counsel before launch.
- **Degrees.** There is no postgraduate on-campus listing in `src/data/education.ts`; that tile says listings appear when
  admissions open and links to "Register your interest". No institution, fee or date is invented.
- **Fonts.** Inter is added to the Google Fonts import; headings and body use Inter, code keeps DM Mono.

## Not done / needs data

- Brochure downloads (no brochure files exist).
- Real campus photographs (generic photos are used, never named as a campus).
- A produced product video (the Career OS walkthrough is an animated schematic built from UI shapes; it shows
  no learner data).
- Popular / most viewed ranking (no view data).
- Server-side consent storage; production catalogue fix (above).
