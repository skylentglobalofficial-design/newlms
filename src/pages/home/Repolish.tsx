/**
 * Homepage sections for the repolish (prefix hx-, styles in HomeRepolish.css).
 *
 * Order: hero (navy: statement and actions, student photograph, the three parts and a learning-journey
 * card) → how learning works (five connected stages with product previews) → programmes (catalogue
 * cards with each programme's working material) → degrees (two doors: UG and PG) → after you enrol
 * (Learn.tsx, a guided walkthrough) → Career OS walkthrough → Skylent AI → institutions → closing.
 *
 * Facts come from the authored course data, the catalogue (or its published list) and lib/degrees.
 * Nothing here states a learner count, outcome, partner or placement. Previews are drawn from the
 * authored Data Analytics programme and are labelled as product previews, not account data.
 */
import { Link } from "react-router-dom"
import { ArrowRight } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import { SkylentBot } from "@/components/skylent/SiteAssistant"
import { openSkylentAi } from "@/components/skylent/ai-events"
import { HARBOR, NORTHWIND, authoredProgrammeContent, rupees, type AuthoredProgrammeContent } from "@/components/programme/programme-content"
import { programmeTruth } from "@/components/programme/programme-truth"
import { programmeDiscoveryFor } from "@/lib/programme-discovery"
import type { CatalogProgramSummary } from "@/lib/catalog-api"
import { deliveryModeLabel, listDegrees } from "@/lib/degrees"
import { courseFacts } from "./course-facts"
import { useWalkthrough } from "./useWalkthrough"
// Background removed from hero-student.jpg (transparent WebP) so the student sits on the navy hero.
import heroStudent from "@/assets/site/hero-student-cutout.webp"
import photoCampusUg from "@/assets/site/hero-classroom.jpg"
import photoCampusPg from "@/assets/site/degree-management.jpg"
import { STATUS_NOT_CONFIRMED } from "../../components/programme/CatalogueNotice"

/* ── Hero (navy; composition after the approved reference) ───────────────
   Left: headline in two deliberate lines, lead, two actions. Centre: a large student photograph,
   cropped naturally. Right: the three parts of Skylent and a compact, neutral learning-journey card.
   Nothing here is a learner account: no progress, scores or statistics. */

const HERO_PARTS = [
  { title: "Degrees", text: "UG and PG degree pathways, online or on campus.", to: "/education" },
  { title: "Skill programmes", text: "Certification and professional programmes with practice built in.", to: "/programmes" },
  { title: "Career OS", text: "The projects you build, kept in one career profile.", to: "/career-os" },
] as const

const HERO_JOURNEY = ["Learn", "Practise", "Build", "Keep your evidence"] as const

export function HomeHero() {
  return (
    <section className="hxw-hero" aria-labelledby="hx-hero-title">
      <div className="hxw-hero__bg" aria-hidden="true" />
      <div className="sky-container hxw-hero__grid">
        <div className="hxw-hero__copy">
          <p className="hxw-eyebrow hx-rise">Degrees · Skill programmes · Career OS</p>
          <h1 id="hx-hero-title" className="hxw-hero__title hx-rise">
            <span>Education built for</span> <em>what comes next.</em>
          </h1>
          <p className="hxw-hero__lead hx-rise">
            Study for a degree or learn a job skill, practise on realistic work, and keep everything you build in one career profile.
          </p>
          <div className="hxw-hero__actions hx-rise">
            <Link className="sk-btn sk-btn-primary hx-btn" to="/programmes">
              Explore programmes
              <ArrowRight />
            </Link>
            <Link className="sk-btn sk-btn-secondary hx-btn" to="/education">
              Explore degrees
            </Link>
          </div>
        </div>
        <div className="hxw-hero__photo hx-rise">
          <img src={heroStudent} alt="A smiling student holding a laptop and notebook." width={903} height={1203} decoding="async" fetchPriority="high" />
        </div>
        <div className="hxw-hero__side hx-rise">
          <ul className="hxw-parts" aria-label="What Skylent brings together">
            {HERO_PARTS.map((part) => (
              <li key={part.title}>
                <Link to={part.to} className="hxw-part">
                  <span className="hxw-part__title">
                    {part.title}
                    <ArrowRight />
                  </span>
                  <span className="hxw-part__text">{part.text}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="hxw-journey" role="group" aria-label="How learning works on Skylent">
            <p className="hxw-journey__label">How learning works</p>
            <ol className="hxw-journey__steps">
              {HERO_JOURNEY.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Shared walkthrough controls ──────────────────────────────────────── */

export function WalkControls({
  active,
  count,
  title,
  playing,
  onPrev,
  onNext,
  onToggle,
  tone = "light",
}: {
  active: number
  count: number
  title: string
  playing: boolean
  onPrev: () => void
  onNext: () => void
  onToggle: () => void
  tone?: "light" | "dark"
}) {
  return (
    <div className={`hx-walk hx-walk--${tone}`}>
      <button type="button" className="hx-walk__btn" onClick={onPrev} aria-label="Previous step">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <span className="hx-walk__count" aria-live="polite">
        <span className="hx-walk__n">{active + 1}</span> / {count} · {title}
      </span>
      <button type="button" className="hx-walk__btn" onClick={onNext} aria-label="Next step">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button type="button" className="hx-walk__btn hx-walk__btn--play" onClick={onToggle} aria-label={playing ? "Pause walkthrough" : "Play walkthrough"} aria-pressed={!playing}>
        {playing ? (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        ) : (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor" /></svg>
        )}
      </button>
    </div>
  )
}

/* ── How learning works ───────────────────────────────────────────────────
   Five connected stages, each with a small preview drawn from the authored Data Analytics
   programme (titles, counts and lab figures come from the course data). Everything is visible
   at once: hover only adds emphasis. */

const DA_SLUG = "data-analytics-pro"

export function InsideProgramme() {
  const facts = courseFacts()
  const content = authoredProgrammeContent(DA_SLUG)
  const topCategories = NORTHWIND.categories.slice(0, 3)
  const stages = [
    {
      title: "Programme",
      text: "Choose a certification or professional programme, or a degree pathway.",
      preview: facts ? (
        <span className="hx-mini hx-mini--prog">
          <span className="hx-mini__label">Professional programme</span>
          <span className="hx-mini__title">{facts.title}</span>
          <span className="hx-mini__meta">
            {facts.stats.modules} modules · {facts.stats.lessons} lessons
          </span>
          <span className="hx-mini__btn">Start this programme</span>
        </span>
      ) : null,
    },
    {
      title: "Lessons",
      text: "Short written lessons with checks, one step at a time.",
      preview: facts ? (
        <span className="hx-mini">
          <span className="hx-mini__label">
            Module {facts.currentModuleNumber} · Lesson {facts.lessonNumber}
          </span>
          <span className="hx-mini__title hx-mini__title--sm">{facts.current.title}</span>
          <span className="hx-mini__track"><span style={{ width: `${facts.percent}%` }} /></span>
          <span className="hx-mini__meta">
            {facts.done} of {facts.total} lessons complete
          </span>
        </span>
      ) : null,
    },
    {
      title: "Integrated practice",
      text: "A lab on a realistic dataset or case, opened from the lesson.",
      preview: (
        <span className="hx-mini hx-mini--code">
          <span className="hx-mini__label">Northwind Lab · sales extract</span>
          <span className="hx-mini__sql">Net revenue by category, valid rows</span>
          {topCategories.map((row) => (
            <span key={row.name} className="hx-mini__row">
              <span>{row.name}</span>
              <span>{rupees(row.value)}</span>
            </span>
          ))}
        </span>
      ),
    },
    {
      title: "Project",
      text: "Finish with a capstone you can explain and defend.",
      preview: facts ? (
        <span className="hx-mini">
          <span className="hx-mini__label">Capstone · Module {facts.capstoneModuleNumber}</span>
          <span className="hx-mini__title hx-mini__title--sm">{content?.capstoneTitle ?? facts.capstoneTitle}</span>
          {["Read the brief", "Build the analysis", "Write the recommendation"].map((task, i) => (
            <span key={task} className="hx-mini__task">
              <span className={i === 0 ? "hx-mini__tick is-on" : "hx-mini__tick"} aria-hidden="true" />
              {task}
            </span>
          ))}
        </span>
      ) : null,
    },
    {
      title: "Career OS evidence",
      text: "The finished work is kept in your career profile.",
      preview: content ? (
        <span className="hx-mini">
          <span className="hx-mini__label">Evidence record</span>
          <span className="hx-mini__title hx-mini__title--sm">{content.evidence.record.title}</span>
          <span className="hx-mini__chips">
            {content.evidence.record.skills.slice(0, 3).map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </span>
        </span>
      ) : null,
    },
  ]

  return (
    <section className="hx-inside" aria-labelledby="hx-inside-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">How learning works</p>
            <h2 id="hx-inside-title" className="hx-h2">
              Every lesson leads to <em>work you can show.</em>
            </h2>
          </div>
          <p className="hx-head__aside">Practice is part of every programme, not a separate product. What you build stays with you.</p>
        </Reveal>
        <ol className="hx-path" aria-label="From programme to Career OS evidence">
          {stages.map((stage, i) => (
            <li key={stage.title} className="hx-path__stage">
              <span className="hx-path__marker" aria-hidden="true">{i + 1}</span>
              <span className="hx-path__title">{stage.title}</span>
              <span className="hx-path__text">{stage.text}</span>
              {stage.preview ? <span className="hx-path__preview" aria-hidden="true">{stage.preview}</span> : null}
            </li>
          ))}
        </ol>
        <p className="hx-path__note">
          Previews use the Data Analytics programme. They show the product, not a learner&apos;s account.{" "}
          <Link to={`/programmes/${DA_SLUG}`}>See the programme</Link>
        </p>
      </div>
    </section>
  )
}

/* ── Programmes ───────────────────────────────────────────────────────── */

type HomeRow = { program: CatalogProgramSummary; title: string; line: string; open: boolean; kind: "Professional" | "Certification" }

function homeRows(programmes: CatalogProgramSummary[]): HomeRow[] {
  return programmes.flatMap((program) => {
    const type = program.programType.toUpperCase()
    const kind = type === "CERTIFICATE" ? "Certification" : type === "PROFESSIONAL" || !type ? "Professional" : null
    if (!kind) return []
    const truth = programmeTruth(program)
    const open = truth.state === "live"
    const content = open ? authoredProgrammeContent(program.slug) : null
    const discovery = open ? programmeDiscoveryFor(program.slug) : null
    return [{ program, kind, open, title: discovery?.courseTitle || program.name, line: content?.cardLine ?? "" }]
  })
}

/** The working material of each authored programme, shown at the top of its card. */
function ProgrammeArtefact({ artefact }: { artefact: AuthoredProgrammeContent["artefact"] }) {
  if (artefact === "northwind") {
    const max = NORTHWIND.categories[0].value
    return (
      <span className="hx-art" aria-hidden="true">
        <span className="hx-art__file">Northwind Retail · sales extract</span>
        <span className="hx-art__bars">
          {NORTHWIND.categories.map((row) => (
            <span key={row.name} className="hx-art__bar">
              <span className="hx-art__name">{row.name}</span>
              <span className="hx-art__fill"><span style={{ width: `${Math.round((row.value / max) * 100)}%` }} /></span>
            </span>
          ))}
        </span>
        <span className="hx-art__foot">
          {NORTHWIND.rows} order lines · {NORTHWIND.window}
        </span>
      </span>
    )
  }
  return (
    <span className="hx-art" aria-hidden="true">
      <span className="hx-art__file">Harbor Retail · operations case</span>
      <span className="hx-art__rows">
        {[
          ["Company", HARBOR.company],
          ["Stores", String(HARBOR.stores)],
          ["Interviews", String(HARBOR.interviews)],
          ["Constraint", HARBOR.constraint],
        ].map(([k, v]) => (
          <span key={k} className="hx-art__kv">
            <span>{k}</span>
            <b>{v}</b>
          </span>
        ))}
      </span>
      <span className="hx-art__foot">Fictional retail operations case</span>
    </span>
  )
}

export function HomeProgrammes({ programmes, loading, confirmed }: { programmes: CatalogProgramSummary[]; loading: boolean; confirmed: boolean }) {
  const rows = homeRows(programmes)
  const open = rows.filter((row) => row.open)
  const later = rows.filter((row) => !row.open)
  return (
    <section id="programmes" className="hx-programmes" aria-labelledby="hx-programmes-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">Programmes</p>
            <h2 id="hx-programmes-title" className="hx-h2">
              Learn a job skill, <em>step by step.</em>
            </h2>
          </div>
          <Link className="hx-more" to="/programmes">
            All programmes
            <ArrowRight />
          </Link>
        </Reveal>
        {loading ? (
          <div className="hx-prog-grid" aria-busy="true" aria-label="Loading programmes">
            {[0, 1].map((i) => (
              <div key={i} className="hx-prog hx-prog--skel" aria-hidden="true">
                <span className="sky-skeleton" style={{ width: 120 }} />
                <span className="sky-skeleton" style={{ width: "70%", height: 22 }} />
                <span className="sky-skeleton" style={{ width: "90%" }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {confirmed ? null : (
              <p className="hx-prog-note" role="status">
                <strong>{STATUS_NOT_CONFIRMED}.</strong> The catalogue could not be checked just now, so enrolment status is not shown.{" "}
                <Link to="/programmes">See programmes</Link>
              </p>
            )}
            <ul className="hx-prog-grid">
              {open.map((row) => {
                const content = authoredProgrammeContent(row.program.slug)
                const facts = [
                  row.program.moduleCount > 0 ? `${row.program.moduleCount} ${row.program.moduleCount === 1 ? "module" : "modules"}` : null,
                  row.program.format || null,
                  row.program.level || null,
                ].filter(Boolean) as string[]
                return (
                  <li key={row.program.slug}>
                    <Link to={`/programmes/${row.program.slug}`} className="hx-prog">
                      {content ? <ProgrammeArtefact artefact={content.artefact} /> : null}
                      <span className="hx-prog__body">
                        <span className="hx-prog__top">
                          <span className="hx-prog__kind">{row.kind} programme</span>
                          {/* "Open" is only claimed when the catalogue answered; otherwise one notice above the list says so. */}
                          {confirmed ? <span className="hx-pill hx-pill--open">Open for enrolment</span> : null}
                        </span>
                        <span className="hx-prog__title">{row.title}</span>
                        {row.line ? <span className="hx-prog__line">{row.line}</span> : null}
                        {content?.capstoneTitle ? (
                          <span className="hx-prog__practice">
                            <span className="hx-prog__k">You build</span>
                            {content.capstoneTitle}
                          </span>
                        ) : null}
                        {facts.length ? (
                          <span className="hx-prog__facts">
                            {facts.map((fact) => (
                              <span key={fact}>{fact}</span>
                            ))}
                          </span>
                        ) : null}
                        <span className="hx-prog__go">
                          View programme
                          <ArrowRight />
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
            {later.length ? (
              <div className="hx-later">
                <p className="hx-later__label">Opening soon</p>
                <ul className="hx-later__list">
                  {later.map((row) => (
                    <li key={row.program.slug}>
                      <Link to={`/programmes/${row.program.slug}`}>
                        <span>{row.title}</span>
                        <span className="hx-later__kind">{row.kind}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

/* ── Degrees: two primary doors, UG and PG ─────────────────────────────────
   Areas and delivery modes come from lib/degrees (the published sample routes). Modes are details
   inside each door, not doors of their own. */

const DEGREE_DOORS = [
  { level: "UNDERGRADUATE", name: "Undergraduate", short: "UG", param: "ug", text: "Your first degree after school, studied over several years.", img: photoCampusUg, alt: "Students at long benches in a lecture hall." },
  { level: "POSTGRADUATE", name: "Postgraduate", short: "PG", param: "pg", text: "Specialise after a first degree, alongside work or full time.", img: photoCampusPg, alt: "Two students studying together outdoors on a campus lawn." },
] as const

export function HomeDegrees() {
  const degrees = listDegrees()
  return (
    <section id="degrees" className="hx-degrees" aria-labelledby="hx-degrees-title">
      <div className="sky-container">
        <Reveal className="hx-head" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow hx-eyebrow--dark">Degrees</p>
            <h2 id="hx-degrees-title" className="hx-h2">
              Undergraduate or <em>postgraduate.</em>
            </h2>
          </div>
          <p className="hx-head__aside">These are planned degree areas. No institution is confirmed yet, so you can register interest but not apply.</p>
        </Reveal>
        <ul className="hx-doors">
          {DEGREE_DOORS.map((door) => {
            const items = degrees.filter((degree) => degree.level === door.level)
            const areas = [...new Set(items.map((degree) => degree.discipline))]
            const modes = [...new Set(items.map((degree) => deliveryModeLabel(degree.deliveryMode)))]
            return (
              <li key={door.short}>
                <Link to={`/education?level=${door.param}`} className="hx-door">
                  <span className="hx-door__media">
                    <img src={door.img} alt={door.alt} loading="lazy" decoding="async" />
                    <span className="hx-door__tag">Planned · not open for applications</span>
                  </span>
                  <span className="hx-door__body">
                    <span className="hx-door__title">
                      {door.name} <span>({door.short})</span>
                    </span>
                    <span className="hx-door__text">{door.text}</span>
                    <span className="hx-door__rows">
                      {areas.length ? (
                        <span className="hx-door__row">
                          <span className="hx-door__k">Planned areas</span>
                          <span>{areas.join(", ")}</span>
                        </span>
                      ) : null}
                      {modes.length ? (
                        <span className="hx-door__row">
                          <span className="hx-door__k">Study</span>
                          <span className="hx-door__modes">
                            {modes.map((mode) => (
                              <span key={mode}>{mode}</span>
                            ))}
                          </span>
                        </span>
                      ) : null}
                    </span>
                    <span className="hx-door__go">
                      Explore {door.name.toLowerCase()} degrees
                      <ArrowRight />
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ── Career OS walkthrough ────────────────────────────────────────────── */

const JOURNEY = [
  { key: "enrol", title: "Enrol", text: "Your Career OS profile starts with your first programme." },
  { key: "learn", title: "Learn", text: "Your lesson in progress and programme progress, in one place." },
  { key: "build", title: "Build projects", text: "Labs and a capstone turn practice into work." },
  { key: "evidence", title: "Collect evidence", text: "Finished work is kept with what it shows." },
  { key: "profile", title: "Develop your profile", text: "Target role, skills, education and projects together." },
  { key: "prepare", title: "Prepare for opportunities", text: "Track the roles you apply to and practise interviews." },
] as const

type JourneyKey = (typeof JOURNEY)[number]["key"]

function JourneyScreen({ step }: { step: JourneyKey }) {
  const content = authoredProgrammeContent(DA_SLUG)
  const record = content?.evidence.record
  const facts = courseFacts()
  switch (step) {
    case "enrol":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Career profile · new</p>
          <div className="hx-screen__card">
            <span className="hx-screen__row"><b>Programmes</b><span className="hx-screen__tag">1 enrolled</span></span>
            <span className="hx-screen__item">
              <span className="hx-screen__k">Data Analytics</span>
              <span>Professional programme</span>
            </span>
            <span className="hx-screen__hint">Your profile has a visibility setting that you control.</span>
          </div>
        </div>
      )
    case "learn":
      return facts ? (
        <div className="hx-screen">
          <p className="hx-screen__label">Career OS overview</p>
          <div className="hx-screen__card">
            <span className="hx-screen__row"><b>Lesson in progress</b><span className="hx-screen__tag">{facts.title}</span></span>
            <span className="hx-screen__item">
              Lesson {facts.lessonNumber} · {facts.current.title}
            </span>
            <span className="hx-track"><span style={{ width: `${facts.percent}%` }} /></span>
            <span className="hx-screen__dim">
              {facts.done} of {facts.total} lessons complete
            </span>
          </div>
        </div>
      ) : null
    case "build":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Capstone project</p>
          <div className="hx-screen__card">
            <span className="hx-screen__row"><b>{content?.capstoneTitle ?? "Capstone"}</b><span className="hx-screen__tag">In progress</span></span>
            {["Read the brief", "Explore the data", "Build the analysis", "Write the recommendation"].map((task, i) => (
              <span key={task} className="hx-screen__task">
                <span className={i < 2 ? "hx-tick hx-tick--on" : "hx-tick"} aria-hidden="true" />
                {task}
              </span>
            ))}
          </div>
        </div>
      )
    case "evidence":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Evidence record</p>
          <div className="hx-screen__card">
            <span className="hx-screen__row"><b>{record?.title ?? "Capstone"}</b></span>
            <span className="hx-screen__dim">{record?.context}</span>
            <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">What it shows</span><span>{record?.workShown.split(", ").slice(0, 3).join(", ")}</span></span>
            <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Reflection</span><span>{record?.reflection}</span></span>
          </div>
        </div>
      )
    case "profile":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Career profile</p>
          <div className="hx-screen__card">
            <span className="hx-screen__item"><span className="hx-avatar" aria-hidden="true" /><span className="hx-screen__grow"><b>Your name</b><br /><span className="hx-screen__dim">Target role: data analyst</span></span></span>
            <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Skills you add</span>
              <span className="hx-chips">
                {(record?.skills ?? []).map((chip) => (
                  <span key={chip} className="hx-chip">{chip}</span>
                ))}
              </span>
            </span>
            <span className="hx-screen__item hx-screen__item--rule"><span className="hx-screen__k">Projects</span><span>{record?.title} · added from a finished project</span></span>
          </div>
        </div>
      )
    case "prepare":
      return (
        <div className="hx-screen">
          <p className="hx-screen__label">Applications you track</p>
          <div className="hx-screen__cols">
            {[
              ["Saved", "A role you saved"],
              ["Applied", "An application you sent"],
              ["Interview", "Practice questions for it"],
            ].map(([col, card]) => (
              <div key={col} className="hx-screen__col">
                <span className="hx-screen__k">{col}</span>
                <span className="hx-screen__mini">{card}</span>
              </div>
            ))}
          </div>
          <p className="hx-screen__hint">You add the roles. Career OS keeps them organised; it does not apply for you or promise an outcome.</p>
        </div>
      )
  }
}

export function CareerJourney({ eyebrow = "Career OS", showLink = true }: { eyebrow?: string; showLink?: boolean } = {}) {
  const walk = useWalkthrough<HTMLElement>(JOURNEY.length, 2000)
  const active = walk.active
  const step = JOURNEY[active]
  return (
    <section ref={walk.rootRef} id="career-os" className="hx-journey" aria-labelledby="hx-journey-title">
      <div className="sky-container">
        <Reveal className="hx-head hx-head--dark" stagger>
          <div data-reveal-group>
            <p className="hx-eyebrow">{eyebrow}</p>
            <h2 id="hx-journey-title" className="hx-h2 hx-h2--light">
              From your first lesson <em>to your first application.</em>
            </h2>
          </div>
          <p className="hx-head__aside">The projects and evidence from your programmes feed one Career OS profile. It stays with you after you enrol and keeps growing as you learn.</p>
        </Reveal>
        <div className="hx-journey__grid" {...walk.regionProps}>
          <ol className="hx-steps" aria-label="How Career OS organises your work">
            {JOURNEY.map((item, i) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={i === active ? "hx-step is-on" : i < active ? "hx-step is-done" : "hx-step"}
                  aria-current={i === active ? "step" : undefined}
                  onClick={() => walk.go(i)}
                >
                  <span className="hx-step__dot" aria-hidden="true" />
                  <span className="hx-step__title">{item.title}</span>
                  <span className="hx-step__text">{item.text}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="hx-journey__stage">
            <div className="hx-window">
              <div className="hx-window__bar" aria-hidden="true">
                <span />
                <span />
                <span />
                <em>Career OS</em>
              </div>
              <div className="hx-window__body" key={step.key}>
                <p className="hx-sr">Step {active + 1} of {JOURNEY.length}: {step.title}. {step.text}</p>
                <JourneyScreen step={step.key} />
              </div>
              <div className="hx-window__progress" aria-hidden="true">
                {JOURNEY.map((item, i) => (
                  <span key={item.key} className={i <= active ? "is-on" : undefined} />
                ))}
              </div>
            </div>
            <div className="hx-journey__actions">
              <WalkControls active={active} count={JOURNEY.length} title={step.title} playing={walk.playing} onPrev={walk.prev} onNext={walk.next} onToggle={walk.toggle} tone="dark" />
              {showLink ? (
                <Link className="sk-btn sk-btn-primary" to="/career-os">
                  How Career OS works
                  <ArrowRight />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Skylent AI ───────────────────────────────────────────────────────────
   The existing Skylent AI mark, given its own tile, and the finder's real first question. */

const AI_HELPS = [
  { title: "Finds a starting point", text: "A few questions, then programmes or degrees from the Skylent catalogue." },
  { title: "Explains inside lessons", text: "Ask about the lesson you have open, in plain language." },
  { title: "Keeps assessments fair", text: "It will not give answers to an open quiz or write an open assignment for you." },
] as const

const AI_FIRST_OPTIONS = ["Learn a job skill", "Study for a degree", "I'm not sure yet"] as const

export function HomeAi() {
  return (
    <section id="skylent-ai" className="hx-ai hx-ai--id" aria-labelledby="hx-ai-title">
      <div className="sky-container hx-ai__layout">
        <div className="hx-ai__intro">
          <div className="hx-ai__id">
            <span className="hx-ai__avatar" aria-hidden="true">
              <SkylentBot size={52} />
            </span>
            <span>
              <span className="hx-ai__name">Skylent AI</span>
              <span className="hx-ai__role">Your guide on Skylent</span>
            </span>
          </div>
          <h2 id="hx-ai-title" className="hx-h2 hx-h2--sm">
            Not sure where to start? <em>Ask.</em>
          </h2>
          <ul className="hx-ai__helps">
            {AI_HELPS.map((help) => (
              <li key={help.title}>
                <span className="hx-ai__help-title">{help.title}</span>
                <span className="hx-ai__help-text">{help.text}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="sk-btn sk-btn-primary" onClick={() => openSkylentAi("finder")}>
            Ask Skylent AI
            <ArrowRight />
          </button>
        </div>
        <div className="hx-ai__chat" aria-hidden="true">
          <div className="hx-ai__chatbar">
            <SkylentBot size={26} />
            <span>Skylent AI</span>
          </div>
          <div className="hx-chat">
            <div className="hx-chat__row">
              <SkylentBot size={26} />
              <p className="hx-chat__bubble">Hi. What are you looking for?</p>
            </div>
            <div className="hx-chat__options">
              {AI_FIRST_OPTIONS.map((option) => (
                <span key={option}>{option}</span>
              ))}
            </div>
          </div>
          <p className="hx-ai__chatnote">The first question the assistant asks.</p>
        </div>
      </div>
    </section>
  )
}

/* ── Institutions and closing ─────────────────────────────────────────── */

const INSTITUTION_POINTS = [
  { title: "Practical programmes", text: "Certification and professional programmes your learners take alongside their studies." },
  { title: "A structured learner experience", text: "Lessons, checks, assignments and progress for every enrolled learner." },
  { title: "Evidence learners keep", text: "Each learner keeps a profile of skills, projects and certificates in Career OS." },
] as const

export function HomeInstitutions() {
  return (
    <section className="hx-inst" aria-labelledby="hx-inst-title">
      <div className="sky-container hx-inst__grid">
        <div className="hx-inst__copy">
          <p className="hx-eyebrow hx-eyebrow--dark">For institutions</p>
          <h2 id="hx-inst-title" className="hx-h2 hx-h2--sm">
            Add practical programmes <em>beside your own teaching.</em>
          </h2>
          <p className="hx-inst__text">For colleges, universities and training partners. We map your learners, curriculum and goals together first.</p>
          <Link className="sk-btn sk-btn-secondary" to="/institutions">
            Partner with Skylent
            <ArrowRight />
          </Link>
        </div>
        <ul className="hx-inst__points">
          {INSTITUTION_POINTS.map((point, i) => (
            <li key={point.title}>
              <span className="hx-inst__num" aria-hidden="true">0{i + 1}</span>
              <span className="hx-inst__title">{point.title}</span>
              <span className="hx-inst__ptext">{point.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function HomeClosing() {
  return (
    <section className="hx-close hx-close--final" aria-labelledby="hx-close-title">
      <div className="hx-close__glow" aria-hidden="true" />
      <div className="sky-container hx-close__layout">
        <div>
          <p className="hx-eyebrow">Start with one programme</p>
          <h2 id="hx-close-title" className="hx-close__title">
            Start learning. <em>Keep what you build.</em>
          </h2>
          <p className="hx-close__lead">Lessons, practice and a project in one programme, and the finished work stays in your Career OS profile.</p>
        </div>
        <div className="hx-close__actions">
          <Link className="sk-btn sk-btn-primary hx-btn" to="/signup">
            Create your account
            <ArrowRight />
          </Link>
          <Link className="hx-close__link" to="/programmes">
            Browse programmes
          </Link>
        </div>
      </div>
    </section>
  )
}
