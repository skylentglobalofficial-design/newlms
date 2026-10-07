/**
 * The lower half of the homepage: Career OS (warm proof band), Skylent AI, Find My Path
 * and the closing navy band. Availability is read from src/lib/truth.ts, never hard-coded.
 */
import { Action, AI_NAME, AiMark, SectionIndex, TruthChip, type TruthState } from "@/components/skylent/primitives"
import { NORTHWIND_PREVIEW } from "@/lib/northwind-preview"
import { truthOf, type Capability } from "@/lib/truth"

/* ── Career OS ─────────────────────────────────────────────────────────────── */

const CAREER_PARTS: { capability: Capability; name: string; detail: string }[] = [
  { capability: "careerProfile", name: "Career profile", detail: "Education, experience, the skills you enter yourself, and links." },
  { capability: "projectsAndEvidence", name: "Projects and evidence", detail: "Projects from your programme work, linked with the evidence behind them." },
  { capability: "certificates", name: "Certificates", detail: "Issued for a course once every lesson is complete, with a code anyone can check." },
  { capability: "openings", name: "Openings", detail: "No openings are published yet." },
]

export function CareerOs() {
  return (
    <section id="career-os" className="sky-band-proof hm-band" aria-labelledby="hm-career-title">
      <div className="sky-container hm-band__inner hm-career">
        <div className="hm-career__copy">
          <SectionIndex n="05" label="Career OS" />
          <h2 id="hm-career-title" className="hm-h2">A record of what you can prove.</h2>
          <p className="hm-lead">
            A certificate, project evidence and an employment outcome are three different things. Career OS keeps them apart and shows which parts exist today.
          </p>
          <Action to="/career-os" kind="quiet">See Career OS</Action>
        </div>

        <div className="hm-status">
          <div className="sky-label hm-status__head">
            <span>Career OS · what exists today</span>
            <span>{CAREER_PARTS.length} parts</span>
          </div>
          <dl className="hm-status__rows">
            {CAREER_PARTS.map((part) => (
              <div key={part.capability} className="hm-status__row">
                <dt>
                  <span className="hm-status__name">{part.name}</span>
                  <span className="hm-status__detail">{part.detail}</span>
                </dt>
                <dd>
                  <TruthChip state={truthOf(part.capability)} />
                </dd>
              </div>
            ))}
          </dl>
          <p className="hm-status__foot">Evidence is learner work on fictional cases. It is not a certificate and not employer-validated.</p>
        </div>
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

export function SkylentAi() {
  const { validRows, rows } = NORTHWIND_PREVIEW
  return (
    <section id="skylent-ai" className="sky-container hm-section" aria-labelledby="hm-ai-title">
      <div className="hm-ai">
        <div className="hm-ai__copy">
          <SectionIndex n="06" label={AI_NAME} />
          <h2 id="hm-ai-title" className="hm-h2">Help that knows which lesson you are on.</h2>
          <p className="hm-lead">
            {AI_NAME} answers from the text of the lesson you have open, and tells you which part of it the answer is based on.
          </p>
          <p className="hm-ai__note">{aiAvailabilityNote()}</p>
        </div>

        <figure className="sky-figure hm-ai__figure">
          <div
            className="sky-plate"
            role="img"
            aria-label={`${AI_NAME} panel in the lesson player. Context in use: lesson 7, SQL SELECT, WHERE, and aggregates. A learner asks why WHERE comes before SELECT; the answer is based on lesson 7.`}
          >
            <div className="sky-plate__inner hm-ai__panel">
              <div className="sky-ai-head hm-ai__head">
                <AiMark />
                <div className="sky-label hm-ai__context-label">Context in use</div>
                <div className="hm-ai__context">Lesson 7 · SQL SELECT, WHERE, and aggregates</div>
              </div>
              <div className="hm-ai__body">
                <div className="sky-label">You asked</div>
                <p className="hm-ai__question">Why does WHERE come before SELECT?</p>
                <div className="sky-ai-block">
                  <div className="sky-label hm-ai__answer-label">
                    <span className="hm-ai__dot" aria-hidden="true" />
                    Answer
                  </div>
                  <p className="hm-ai__answer">
                    WHERE decides which rows survive before SELECT returns anything. On this extract, {validRows} of {rows} rows pass.
                  </p>
                </div>
                <div className="hm-ai__based">
                  <span className="sky-label">Based on</span>
                  <span>Lesson 7, Explain</span>
                </div>
              </div>
            </div>
          </div>
          <figcaption className="sky-caption">
            <span>FIG. 05 · {AI_NAME} in the lesson player</span>
            <span>Illustrative exchange</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/* ── Find My Path ──────────────────────────────────────────────────────────── */

const PATH_STEPS = ["Answer a few questions", "Get a path", "Start with a programme"]

export function FindMyPath() {
  return (
    <section id="find-my-path" className="sky-container hm-section" aria-labelledby="hm-path-title">
      <div className="hm-path">
        <div className="hm-path__lead">
          <div className="hm-path__index">
            <SectionIndex n="07" label="Find my path" />
            <TruthChip state={truthOf("findMyPath")} />
          </div>
          <h2 id="hm-path-title" className="hm-path__title">Not sure where to start?</h2>
        </div>
        <ol className="hm-path__steps">
          {PATH_STEPS.map((step, i) => (
            <li key={step}>
              <span className="hm-path__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="hm-path__step">{step}</span>
            </li>
          ))}
        </ol>
        <Action to="/path" kind="quiet">Find my path</Action>
      </div>
    </section>
  )
}

/* ── Closing band ──────────────────────────────────────────────────────────── */

export function Closing() {
  return (
    <section className="sky-band-navy hm-band hm-band--close" aria-labelledby="hm-close-title">
      <div className="sky-container hm-band__inner hm-close">
        <div className="hm-close__copy">
          <p className="sky-label">Next step · Choose</p>
          <h2 id="hm-close-title" className="hm-h2">Pick a programme, or answer a few questions first.</h2>
        </div>
        <div className="hm-close__actions">
          <Action to="/programmes">Explore programmes</Action>
          <Action to="/path" kind="secondary">Find my path</Action>
        </div>
      </div>
    </section>
  )
}
