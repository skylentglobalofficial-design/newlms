# Skylent competitor comparison and identity report

26 October 2026, evening IST (Asia/Calcutta, UTC+5:30).

Inspection and recommendation only. No application code, configuration, database, or deployment was changed. This file was not committed.

Three kinds of statement are marked below.

- **Verified here:** read from this repository, from local QA already recorded in `docs/FINAL_HANDOFF_2026-10-26.md`, or from a page fetched for this report.
- **Competitor claim:** wording or figures published by that company. Not independently audited by Skylent.
- **Recommendation:** a proposed change, not a fact about the current product.

## 1. Executive summary

Skylent’s locked line, **Learn. Practise. Build. Prove it.**, matches the product that actually runs better than the homepage does.

What runs, and was checked locally, is a small connected path: two enrolable courses (Data Analytics and Product Management), lessons that unlock in order, quizzes, an assignment that can be graded and revised, a Northwind SQL lab, a Harbor Desk case, a private Career OS, and a certificate that can be checked in public. Jobs are an empty list on purpose. Degrees are samples. Skylent does not award degrees and does not claim placements.

Competitors in this set sell scale, brand names, or a job at the end. Coursera sells university and company credentials. upGrad and Scaler publish placement and salary figures and say those figures are not a guarantee. Internshala is an internship marketplace plus short courses. Physics Wallah’s skills sites sell job-focused batches. Unacademy sells exam preparation with live classes.

Skylent should not copy those outcome numbers. The honest difference is a learner can see the work: a query result, a case, a submission, and later a certificate, inside one account. The homepage does not say that in the first screen. It says programmes, projects, and career opportunities together, while Career OS correctly says no roles are published.

**Production remains NO-GO** for the reasons in the QA handoff. That is separate from this product recommendation.

## 2. Current state, from inspected evidence

Repository HEAD when this report was written: `22144ca10eec1266d34d2df4ac8037332848b121` on `cursor/phase-2-core-learning-cd19`. That commit is the local QA handoff. It had not been pushed. Application code is still `1d84bdc`, which is the tree merged to `main` as `d38424e`.

### Implemented and checked locally

Recorded in `docs/FINAL_HANDOFF_2026-10-26.md` from the 26 October local QA. Not re-run for this report.

- Enrolment into Data Analytics and Product Management.
- Lesson completion and the next lesson staying locked until the previous one is done.
- Quiz fail (“Not all answers were correct”) and quiz pass (“Assessment passed”).
- Assignment submit, then a graded resubmit that clears the grade and does not save a draft.
- Northwind SQL: the example “Revenue by category” returned four rows.
- Harbor Desk case page opened, status not started, 0 of 6 tasks.
- Career OS profile, jobs, and applications load. Jobs say no roles are published.
- Certificate issue in the API learner journey, and a public verify page that showed a valid Data Analytics certificate.

### Implemented, with a limit the product already states

From `src/lib/truth.ts` and the pages that read it.

| Area | What the code says |
|---|---|
| Lessons | `live`. Enrolment and lesson progress exist. |
| Career profile and next step | `live`. Next step is resume point plus profile completeness, not a score. |
| Find My Path | `live`. Rule-based in the browser, not a model. |
| Lesson AI | `live` only when a key is configured. Local and public health: not configured. |
| Certificates | Endpoints exist. Public label stays `development` until a production check. The verify page still returned a valid record locally, under a “coming soon” chip. |
| Projects and evidence | Learner projects exist. Evidence is “not released as a finished product.” |
| Skill gaps and readiness | Not calculated. No required-skill catalogue. |
| Job openings | Models exist. “No openings are published.” |
| Site assistant and career AI | Endpoints or notes exist. Not treated as live career advice. |
| Degrees | `sample`. “No degree data in the backend” in that file. A later change can merge a published API row, but the live degrees API returned 503 on 26 Oct 2026 because migrations are pending. |

### Placeholder or sample

- Degree doors on the homepage: “Planned · not open for applications.” Education page: “Skylent does not award degrees.”
- Many programme cards: “This programme is not open yet” (`src/lib/programme-catalogue.ts`).
- Workshops: “coming soon”, registration not open (`src/pages/WorkshopsPage.tsx`).
- Exams: “coming soon” (`src/pages/education/ExamsPage.tsx`).
- Hero photographs are stock-style learner images with the line “Learners, builders and professionals.” They are not a counted community (`src/pages/home/Repolish.tsx`).

### Missing, on purpose or not built

- A placement process, hiring-partner list, or salary claim. Course FAQ copy in `src/data.ts` says Career OS is “not a placement guarantee.”
- Published jobs, so apply and “share with employer” were not exercised.
- Email verification. Cloud file storage. Live class video.
- `skylent.in` is not this app. On 26 Oct 2026 its HTML was a Next.js page titled “Skylent Global” and included “500+ students placed.” That sentence was not in the `skylent.live` bundle checked the same evening.

### Homepage versus the locked line

The document title is “Skylent — Learn. Practise. Build.” (`src/App.tsx`).

The first screen (`src/pages/home/Repolish.tsx`) is:

- Eyebrow: Skills · Education · Career · AI
- Heading: Learn skills. Explore education. Build real experience. Find what comes next.
- Lead: programmes, courses, real projects and **career opportunities**.
- Actions: Explore Skylent (`/programmes`), Find My Path (`/path`).

“Prove it” is not in that heading. “Career opportunities” is ahead of the jobs page, which says none are published (`CareerOSJobsPage`, confirmed in the browser).

## 3. Competitor comparison

Figures below are **competitor claims** from pages fetched on 26 October 2026. They are not Skylent measurements and were not audited.

| | What they put first | Learning and practice | Proof they advertise | What Skylent should not copy |
|---|---|---|---|---|
| **Coursera** ([coursera.org](https://www.coursera.org/), [about](https://www.coursera.org/about)) | Courses, certificates, and degrees. “Learn AI from the companies building it.” Partners named on the page (Google, IBM, Stanford, and others). | Large catalogue, Career Academy by role, hands-on projects in the about text. | They publish a learner-reported “positive career outcome” figure on the homepage, with a footnote. Degrees are from universities, not from Coursera itself. | Partner logos, outcome percentages, and “we award a degree.” Skylent’s own design note says do not imitate Coursera (`src/imports/pasted_text/skylent-design-system.md`). |
| **upGrad** ([upgrad.com](https://www.upgrad.com/), [placement support](https://www.upgrad.com/placement-support/)) | Job-ready skills, then a four-step path: learn, practise, recognition, outcomes. | Case studies and experts are claimed as counts on the homepage. | Placement page lists salary, transitions, hiring partners, and a hike figure, with a disclaimer that past performance is not a guarantee. | Those counts and “land your dream role.” Skylent has no such dataset. |
| **Scaler** ([placement outcomes](https://www.scaler.com/topics/scaler-placement-outcomes/)) | Software and data upskilling tied to salary after the programme. | Not re-read as a classroom product in this pass. The pages reviewed are outcome reports. | They describe an independently assessed placement report (B2K Analytics) and still say they do not guarantee a job. | Salary multiples and placement rate. Even their own FAQ says outcomes vary. |
| **Physics Wallah skills** ([PW Skills](https://www.pw.live/pwskills), [PW Earners](https://www.pw.live/earners)) | Job-focused or income-focused courses, live plus recorded, mentors, projects, certificates. | Batches, assignments, portfolio language. | Placement assistance is described as depending on the plan. | “Job-focused” as a promise, batch theatre, and income language. The Skylent design note also says do not imitate PW Skills. |
| **Internshala** ([internshala.com](https://internshala.com/), [trainings](https://trainings.internshala.com/)) | Internships and jobs first. Trainings are a second product: short courses, projects, certificates, placement assistance. | Practical projects and mock interviews are claimed on the trainings site. | The marketplace is the proof: listings a student can open. Trainings also publish learner counts. | A jobs board Skylent does not have. Do not imply Internshala-style openings. |
| **Unacademy** ([unacademy.com](https://unacademy.com/)) | “Crack your goal” for exams: UPSC, JEE, NEET, bank exams, and others. | Daily live classes, practice, mocks, notes. | Scale claims (learners, educators, lessons) on the homepage. | Exam-crack positioning. Skylent’s exam pages are marked coming soon. |

### Where Skylent falls short, with evidence

1. **First screen is a category, not a product.** Four lines and two buttons (`Repolish.tsx`). A visitor cannot see the Northwind table or the Harbor Desk case without leaving the hero.
2. **“Career opportunities” is early.** The jobs surface is intentionally empty.
3. **Catalogue mixes open and not-open programmes.** The programmes page says both exist (`/programmes` browser check). Competitors put one sharp offer above the fold.
4. **No employer proof.** There is no published role, no hiring-partner wall, and no audited outcome report. That is honest. It also means the career half of the journey is a record, not a market.
5. **Degrees and `skylent.in` can be read as a bigger institution than the LMS is.** Sample degrees are labelled. The other domain’s “500+ students placed” is not labelled as someone else’s site.

### What Skylent can differentiate on

Only what the local product already does:

- One account from a lesson to a check, a lab or case, an assignment, and a certificate number another person can open.
- Work that is specific: Northwind sales extract, Harbor Desk case, not a generic “capstone.”
- Refusal to invent jobs, degrees, or placement rates. The jobs page says “we do not invent openings.”

That is a product difference only if the website shows the work. It is not a claim that learners get hired.

## 4. Website and product gaps

| Problem | Evidence | Proposed solution | Expected outcome | Priority | Kind |
|---|---|---|---|---|---|
| Hero promises “career opportunities” before any role exists | `Repolish.tsx` lead; jobs page empty state; `truth.ts` `openings: soon` | Replace that phrase with the two things a learner can do today: enrol in Data Analytics or Product Management, and keep the work in Career OS. | First screen matches the product. | P0 | Website |
| “Prove it” is the strategy line and not the heading | `App.tsx` title versus hero `h1` | Use **Learn. Practise. Build. Prove it.** as the `h1`. Put one real artifact under it (a Northwind result or a Harbor Desk task), marked as course material, not a learner outcome. | A visitor sees the journey and the proof object in one glance. | P0 | Website |
| Open programmes are not the first catalogue act | Programmes page leads with search across open and not-open listings | First block: two enrolable courses, with “Start this course.” Second block: “Not open yet,” visually quieter. | Fewer people try to enrol in a listing that cannot start. | P0 | Website |
| Evidence is described as a chain the backend does not finish | Design note “every learning action creates evidence”; `truth.ts` says evidence is not a finished product; skill gaps are `development` | Public copy: you keep a profile, projects, and a certificate. Do not say a skill score or employer match. | Career OS expectations match the empty and live states. | P1 | Website |
| Certificate chip says coming soon on a page that can show a valid record | Browser verify page; `truth.ts` certificates `development` | Keep the chip until production verify is done. Add one sentence: the check below is the record Skylent holds; the chip means it is not yet a production-certified service. | Less contradiction without calling certificates “live.” | P1 | Website |
| `skylent.in` and `skylent.live` tell different stories | 26 Oct 2026 fetches: Next.js versus this Vite app; “500+ students placed” only on `.in` | Founder decides the relationship. Until then, `skylent.live` should not link to `.in` as if it were the same proof. | One public claim set. | P1 | Business |
| Faculty grading is not part of the public story | Grading exists for faculty; learner resubmit was tested; no mentor marketplace | Do not advertise mentors, live doubt classes, or “graded by industry” until a named person grades in production. | No borrowed upGrad/PW mentor claim. | P1 | Product |
| Jobs, apply, and employer share cannot be demonstrated | Jobs empty by design | Leave the empty state. Do not add sample jobs. Measure interest with the contact form, not a fake board. | Trust stays intact. | P2 | Product |
| Degrees compete visually with real courses | Homepage degree doors sit near programmes | Keep them labelled planned. Do not give them equal weight to Data Analytics in the first screen. | The enrolable product stays primary. | P2 | Website |

## 5. Identity and positioning

The locked line is supported by the LMS that was tested. It is not yet supported by jobs, degrees, or a finished evidence graph.

**What is Skylent?**  
A place to learn a written course, practise on a named case or dataset, submit work, and keep a certificate and a career profile. It is not a university and not a placement agency.

**Who is it for?**  
Someone who can study Data Analytics or Product Management without a live classroom. Colleges and employers are later readers of that work, not the current customer.

**What problem does it solve?**  
Courses elsewhere often end in a video and a badge. Skylent’s tested path ends in something you can open again: a lab result, a case, an assignment, a certificate ID.

**Why choose it over the alternatives?**  
Not because of a placement rate. Because the work is specific and the limits are written down. Choose Coursera or a university degree for an accredited credential. Choose Internshala for an internship listing. Choose Scaler or upGrad if you are buying their placement support and accept their disclaimers. Choose Skylent to do the Data Analytics or Product Management path that is actually open.

**Colleges and employers**  
Not a live marketplace. A college could later point students at a course. An employer could later see work a learner chooses to share. Neither exists as a published integration. Do not say they do.

**Strongest existing proof**  
The local path from enrol to lesson, quiz, SQL result, Harbor Desk, assignment, and a verify URL. That is product proof, not outcome proof.

**Claims that are not supported**  
Placement counts, salaries, hiring partners, “500+ students placed,” job guarantees, accredited degrees, live batches, and “career opportunities” as open roles.

**First 10 seconds**  
Skylent. Learn. Practise. Build. Prove it.  
Two courses you can start: Data Analytics (Northwind) and Product Management (Harbor Desk).  
No degree. No placement promise. Jobs appear only when a real role is published.

## 6. Homepage messaging and section order

Recommendation, P0, website.

1. Identity line and the two start buttons.
2. One real artifact: Northwind result or Harbor Desk task list, captioned as course material.
3. The path in six words already chosen: Education, Learning, Practice, Build, Evidence, Career. Mark Evidence and Career with the same honesty as the product: profile and projects yes, openings not yet.
4. How a lesson, check, and assignment actually behave (one short example, not a feature grid).
5. Programmes that are open, then programmes that are not.
6. Degrees, visually secondary, still “not open.”
7. Footer: certificate check, contact, terms. No outcome counters.

Remove or rewrite the hero lead’s “career opportunities” until `openings` in `truth.ts` is no longer `soon`.

## 7. Programme pages, practice, evidence, Career OS

| Surface | Recommendation | Priority | Kind |
|---|---|---|---|
| Programme page | Above the outline, one line: open or not open, and what “open” means (lessons in Skylent OS, no payment in this pilot — already said in enrolment copy). | P0 | Website |
| Data Analytics | Show the SQL lab and the assignment as the practice, with the same “not a job claim” line the FAQ already uses. | P1 | Website |
| Product Management | Harbor Desk is the practice. Say there is no SQL and no revenue lab on that programme. The project page already says that. | P1 | Website |
| Career OS | Keep the empty jobs state. Profile and projects are the career product today. Do not add a readiness percentage. | P1 | Product boundary |
| Evidence | Do not ship a public “skill passport” until `projectsAndEvidence` is more than a profile plus a certificate. | P2 | Product |

## 8. Trust and credibility

What is already credible: labelled samples, “not a placement guarantee,” empty jobs, “Skylent does not award degrees,” certificate text that says it is not an employment outcome.

What weakens trust:

- Hero “career opportunities” beside an empty job list.
- Certificate “coming soon” chip on a verify page that also shows a valid record. Explain it. Do not delete the chip to look more finished.
- `skylent.in` placement sentence, if a visitor treats both domains as one company.
- Hero avatar row. It reads as social proof without a number. Either caption the photos as illustrations or remove the cluster. Priority P1, website.

## 9. Roadmap

### 30 days

All of this is copy and information order, using pages that already exist.

1. P0. Rewrite the hero to the locked line plus two real courses and an explicit non-claim.
2. P0. Split the programmes index into open and not open.
3. P1. Point Data Analytics and Product Management pages at the lab and the case in the first screen of each page.
4. P1. One sentence on the certificate verify page about the development chip.
5. P1. Founder decision on `skylent.in` wording. No edit in this repo until that source is identified.

### 90 days

Only if the 30-day copy is live and someone has used the two courses.

1. P1. Faculty grades one real assignment in a non-production or a deliberately migrated production, and the learner resubmits. Then, and only then, a public line that a person can grade work. Not “industry mentors.”
2. P2. If a real employer role exists, publish that one role. Do not seed examples.
3. P2. Degrees stay samples until `GET /api/v1/degrees` returns a published institution. Production returned 503 on 26 Oct 2026.
4. Measurement task, P1. Count, from Skylent’s own database, enrols, lesson completions, lab saves, assignment submits, and certificates issued. Publish nothing until the numbers are real and the founder agrees to show them.

Production migration is not on this roadmap. It stays blocked by the QA handoff.

## 10. Metrics

These are definitions, not results. No baseline was calculated in this report.

| Metric | What it measures | Priority | Kind |
|---|---|---|---|
| Enrols in `data-analytics` and `product-management` per week | Whether the clearer catalogue is used | P0 | Measurement |
| Share of enrols that complete lesson 1 within 7 days | Whether the workspace starts | P0 | Measurement |
| Share that pass the first quiz | Whether checks are usable | P1 | Measurement |
| Lab saves and assignment submits per enrol | Whether practice happens | P1 | Measurement |
| Certificates issued, and verify page hits | Whether “prove it” is used | P1 | Measurement |
| Contact-form messages that ask for a job or a degree | Demand Skylent cannot yet meet | P2 | Measurement |

Do not add placement rate, salary, or NPS. There is no instrument for them.

## 11. Decisions for the founder

1. Is the public line **Learn. Practise. Build. Prove it.** even though the current hero is longer? Recommendation: yes.
2. May the homepage name only Data Analytics and Product Management as startable? Recommendation: yes.
3. What is `skylent.in` allowed to say, given `skylent.live` refuses placement claims?
4. When, if ever, may a placement or salary number appear? Recommendation: not until a written, dated count exists. Not in the 90-day window.
5. Should certificates stay visually “in development” after a local verify? Recommendation: yes, until production verify.
6. Are colleges a later distribution channel or a current homepage audience? Recommendation: later. The tested user is an individual learner.

## How to read this

Verified product behaviour is section 2 and the QA handoff. Competitor sentences are their pages, cited above, and are not Skylent results. Sections 4 through 11 are recommendations.
