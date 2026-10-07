/**
 * The lower half of the homepage: Career OS (navy stage with one large plate), Skylent AI,
 * Find My Path and the closing statement. Availability is read from src/lib/truth.ts,
 * never hard-coded, and nothing here shows a score, a match, a salary or an opening.
 */
import type { ReactNode } from "react"
import { Action, AI_NAME, AiMark, PUBLIC_JOURNEY, SectionIndex, TruthChip, type TruthState } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import { NORTHWIND_PREVIEW } from "@/lib/northwind-preview"
import { truthOf, type Capability } from "@/lib/truth"
import { courseFacts } from "./course-facts"

/* ── Career OS ─────────────────────────────────────────────────────────────── */

type CareerCell = { label: string; value?: ReactNode; chip?: TruthState; note: string }

export function CareerOs() {
  const facts = courseFacts()
  const cells: CareerCell[] = [
    { label: "Your skills", value: "SQL · Spreadsheets · Dashboards", note: "Entered by you. Not assessed by Skylent." },
    {
      label: "Projects",
      value: facts?.capstoneTitle ?? "No project yet",
      note: facts ? `From your ${facts.title} work.` : "Projects come from the programme you enrol in.",
    },
    { label: "Evidence", chip: truthOf("projectsAndEvidence"), note: "Learner work on fictional cases, linked to the project behind it." },
    { label: "Certificates", chip: truthOf("certificates"), note: "Issued once every lesson is complete, with a code anyone can check." },
    // No capability in truth.ts yet: Career OS itself states that role-to-skill matching does not exist.
    { label: "Skill gaps", chip: "development", note: "Skylent does not match a role to required skills yet." },
    { label: "Openings", chip: truthOf("openings"), note: "No openings are published yet." },
  ]
  return (
    <section id="career-os" className="hm-cos sky-stage sky-band-navy" aria-labelledby="hm-career-title">
      <div className="sky-container">
        <Reveal className="hm-cos__head">
          <SectionIndex n="07" label="Grow · Career OS" />
          <h2 id="hm-career-title" className="sky-display sky-display--lg hm-split">
            Turn learning into <em>evidence you can use.</em>
          </h2>
          <p className="hm-cos__lead">
            A certificate, project evidence and an employment outcome are three different things. Career OS keeps them apart and shows which parts exist today.
          </p>
          <Action to="/career-os" kind="secondary">See Career OS</Action>
        </Reveal>

        <figure className="hm-cos__figure">
          <Reveal variant="plate" delay={80}>
            <div
              className="sky-stage__plate hm-light hm-cosplate"
              role="img"
              aria-label="Career OS overview for an illustrative learner. Target role, entered by the learner: Data analyst. Skills are self-entered and not assessed. Evidence, certificates and skill gaps are in development. Openings are coming soon. No readiness score, job match or salary is shown."
            >
              <div className="hm-cosplate__bar">
                <span className="hm-cosplate__brand">Career OS</span>
                <span className="hm-cosplate__nav">
                  <span className="hm-cosplate__nav--on">Overview</span>
                  <span>Profile</span>
                  <span>Projects</span>
                </span>
                <TruthChip state="illustrative" label="Illustrative record" />
              </div>
              <div className="hm-cosplate__top">
                <div className="hm-cosplate__role">
                  <div className="hm-art-label">Target role</div>
                  <div className="hm-cosplate__roletitle">Data analyst</div>
                  <div className="hm-cosplate__by">entered by you · edit</div>
                  <p className="hm-cosplate__note">Free text from your career profile. Skylent does not match a role to required skills yet.</p>
                </div>
                <div className="hm-cosplate__next">
                  <div className="hm-art-label">Next step</div>
                  <div className="hm-cosplate__nexttitle">
                    {facts ? `Continue lesson ${facts.lessonNumber} · ${facts.current.title}` : "Choose a programme"}
                  </div>
                  <div className="hm-cosplate__nextnote">
                    {facts ? `${facts.title} · ${facts.done} of ${facts.total} lessons complete` : "Lessons, practice and a project come from the programme you enrol in."}
                  </div>
                  <span className="hm-cosplate__btn">Continue learning</span>
                </div>
              </div>
              <div className="hm-cosplate__cells">
                {cells.map((cell, i) => (
                  <div key={cell.label} className="hm-cosplate__cell">
                    <div className="hm-art-label">
                      <span className={cell.chip ? "hm-cosplate__n" : "hm-cosplate__n hm-cosplate__n--on"}>{String(i + 1).padStart(2, "0")}</span>
                      {cell.label}
                    </div>
                    <div className="hm-cosplate__value">{cell.chip ? <TruthChip state={cell.chip} /> : cell.value}</div>
                    <div className="hm-cosplate__cellnote">{cell.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <figcaption className="sky-stage__caption">
            <span>FIG. 07 · Career OS overview</span>
            <span>Illustrative record · no readiness score, job match or salary</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/* ── Skylent AI ────────────────────────────────────────────────────────────── */

const AI_SCOPES: { capability: Capability; where: string; what: string }[] = [
  { capability: "lessonAi", where: "inside lessons", what: "help inside lessons" },
  { capability: "siteAi", where: "across the site", what: "a site-wide assistant" },
  { capability: "careerAi", where: "with your career context", what: "career context" },
]

function listOf(items: string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** One sentence per truth state, built from the config: where the assistant works today and what is not ready. */
function aiAvailabilityNote(): string {
  const scopesIn = (state: TruthState) => AI_SCOPES.filter((scope) => truthOf(scope.capability) === state)
  const pending = (state: TruthState, ending: string) => {
    const scopes = scopesIn(state)
    if (scopes.length === 0) return ""
    return `${capitalise(listOf(scopes.map((scope) => scope.what)))} ${scopes.length === 1 ? "is" : "are"} ${ending}.`
  }
  const live = scopesIn("live")
  return [
    live.length ? `Available ${listOf(live.map((scope) => scope.where))}.` : "",
    pending("development", "in development"),
    pending("soon", "coming soon"),
  ]
    .filter(Boolean)
    .join(" ")
}

const AI_MOVES = [
  ["Explain", "The idea in the lesson, in plainer words."],
  ["Practice", "A question on the same clause, to try yourself."],
  ["Apply", "An example worked on the lesson's own dataset."],
  ["Next step", "What to open once this lesson makes sense."],
] as const

export function SkylentAi() {
  const { validRows, rows } = NORTHWIND_PREVIEW
  const facts = courseFacts()
  const context = facts
    ? [facts.title, `Module ${facts.currentModuleNumber}`, `Lesson ${facts.lessonNumber}`]
    : ["Data Analytics", "Module 3", "Lesson 7"]
  const lessonTitle = facts?.current.title ?? "SQL SELECT, WHERE, and aggregates"
  const nextLesson = facts ? facts.currentModule.lessons[facts.currentModule.lessons.findIndex((l) => l.id === facts.current.id) + 1] : undefined
  return (
    <section id="skylent-ai" className="hm-ai" aria-labelledby="hm-ai-title">
      <div className="sky-container hm-ai__grid">
        <Reveal className="hm-ai__copy">
          <SectionIndex n="08" label={AI_NAME} />
          <h2 id="hm-ai-title" className="sky-display sky-display--md">
            Help that knows <em>which lesson you are on.</em>
          </h2>
          <p className="hm-lead">
            {AI_NAME} answers from the text of the lesson you have open, and tells you which part of it the answer is based on.
          </p>
          <ol className="hm-ai__moves">
            {AI_MOVES.map(([name, what], i) => (
              <li key={name}>
                <span className="hm-ai__moven">{String(i + 1).padStart(2, "0")}</span>
                <span className="hm-ai__movename">{name}</span>
                <span className="hm-ai__movewhat">{what}</span>
              </li>
            ))}
          </ol>
          <p className="hm-ai__note">{aiAvailabilityNote()}</p>
        </Reveal>

        <figure className="hm-ai__figure">
          <Reveal variant="plate" delay={80}>
            <div
              className="hm-plate hm-aipanel"
              role="img"
              aria-label={`${AI_NAME} panel in the lesson player. Context in use: ${context.join(", ")}, ${lessonTitle}. A learner asks why WHERE comes before SELECT. The panel gives an answer, the part of the lesson it is based on, a recommendation and an action.`}
            >
              <div className="hm-aipanel__head">
                <div className="hm-aipanel__brand">
                  <AiMark />
                  <span className="hm-aipanel__scope">In this lesson</span>
                </div>
                <div className="hm-aipanel__ctxlabel">Context in use</div>
                <div className="hm-aipanel__ctx">
                  {context.map((part) => (
                    <span key={part}>{part}</span>
                  ))}
                </div>
                <div className="hm-aipanel__lesson">{lessonTitle}</div>
              </div>
              <div className="hm-aipanel__body">
                <div className="hm-aipanel__asked">
                  <div className="hm-art-label">You asked</div>
                  <p>Why does WHERE come before SELECT?</p>
                </div>
                <div className="hm-aipanel__flow">
                  <div className="hm-aipanel__step">
                    <div className="hm-art-label">Answer</div>
                    <p className="hm-aipanel__answer">
                      WHERE decides which rows survive before SELECT returns anything. On this extract, {validRows} of {rows} rows pass.
                    </p>
                  </div>
                  <div className="hm-aipanel__step">
                    <div className="hm-art-label">Reason</div>
                    <p>Based on lesson 7, Explain: the engine reads FROM, then WHERE, then GROUP BY, and SELECT only after that.</p>
                  </div>
                  <div className="hm-aipanel__step">
                    <div className="hm-art-label">Recommendation</div>
                    <p>
                      Try one query with the filter and one without, and compare the row counts
                      {nextLesson ? `. Then open ${nextLesson.label.replace("L", "lesson ")}, ${nextLesson.title}.` : "."}
                    </p>
                  </div>
                </div>
                <div className="hm-aipanel__actions">
                  <span className="hm-aipanel__action hm-aipanel__action--on">Practice question</span>
                  <span className="hm-aipanel__action">Explain simpler</span>
                  <span className="hm-aipanel__action">Give an example</span>
                  <span className="hm-aipanel__action">Quiz me</span>
                </div>
              </div>
            </div>
          </Reveal>
          <figcaption className="hm-caption">
            <span>FIG. 08 · {AI_NAME} in the lesson player</span>
            <span>Illustrative exchange</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/* ── Find My Path ──────────────────────────────────────────────────────────── */

/** Find My Path asks seven short stages of its own (src/pages/path/pathV2Copy.ts). */
const PATH_STAGES = [1, 2, 3, 4, 5, 6, 7]
const PATH_PHASES = ["Foundation", "Skills", "Practice", "Build", "Proof", "Opportunity"]

export function FindMyPath() {
  return (
    <section id="find-my-path" className="hm-path sky-band-proof" aria-labelledby="hm-path-title">
      <div className="sky-container">
        <Reveal className="hm-path__lead">
          <div className="hm-path__main">
            <div className="hm-path__index">
              <SectionIndex n="09" label="Find my path" />
              <TruthChip state={truthOf("findMyPath")} />
              <span className="hm-rulechip">Rule-based, not AI</span>
            </div>
            <h2 id="hm-path-title" className="sky-display sky-display--md">
              Not sure <em>where to start?</em>
            </h2>
          </div>
          <div className="hm-path__aside">
            <p>Seven short stages about where you are and where you want to go. The same answers always give the same path.</p>
            <Action to="/path">Find my path</Action>
          </div>
        </Reveal>

        <Reveal as="ol" className="hm-diag" delay={80} aria-label="How Find My Path works">
          <li className="hm-diag__cell">
            <span className="hm-diag__k">01 · Question</span>
            <span className="hm-diag__t">Where you are</span>
            <span className="hm-diag__opts" aria-hidden="true">
              <i className="hm-diag__opt hm-diag__opt--on" />
              <i className="hm-diag__opt" />
              <i className="hm-diag__opt" />
            </span>
          </li>
          <li className="hm-diag__cell">
            <span className="hm-diag__k">02 · Progress</span>
            <span className="hm-diag__t">Stage 1 of 7</span>
            <span className="hm-diag__segs" aria-hidden="true">
              {PATH_STAGES.map((n) => (
                <i key={n} className={n === 1 ? "hm-diag__seg hm-diag__seg--on" : "hm-diag__seg"} />
              ))}
            </span>
          </li>
          <li className="hm-diag__cell">
            <span className="hm-diag__k">03 · Signal</span>
            <span className="hm-diag__t">Fixed rules sort your answers</span>
            <span className="hm-diag__d">Nothing is generated, scored or predicted.</span>
          </li>
          <li className="hm-diag__cell">
            <span className="hm-diag__k">04 · Result</span>
            <span className="hm-diag__t">A six-phase path</span>
            <span className="hm-diag__phases">{PATH_PHASES.join(" · ")}</span>
          </li>
          <li className="hm-diag__cell hm-diag__cell--end">
            <span className="hm-diag__k">05 · Path</span>
            <span className="hm-diag__t">One next action</span>
            <span className="hm-diag__d">A programme, a degree route or Career OS.</span>
          </li>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Closing statement ─────────────────────────────────────────────────────── */

export function Closing() {
  return (
    <section className="hm-close sky-stage sky-band-navy" aria-labelledby="hm-close-title">
      <div className="sky-container hm-close__inner">
        <Reveal>
          <p className="sky-label hm-close__label">Next step · Choose</p>
          <h2 id="hm-close-title" className="sky-display hm-close__title hm-split">
            Pick where to start. <em>Keep what you build.</em>
          </h2>
          <div className="hm-close__actions">
            <Action to="/programmes">Explore programmes</Action>
            <Action to="/education" kind="secondary">Explore degrees</Action>
          </div>
          <p className="hm-close__quiet">
            <span>Or answer a few questions first.</span>
            <Action to="/path" kind="quiet">Find my path</Action>
          </p>
        </Reveal>
        <ol className="hm-close__stages" aria-label="The seven stages">
          {PUBLIC_JOURNEY.map((stage, i) => (
            <li key={stage}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {stage}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
