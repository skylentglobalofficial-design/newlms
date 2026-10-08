/**
 * The lower half of the homepage: Career OS (navy stage with one large plate), Skylent AI,
 * Find My Path and the closing statement. Career OS and Skylent AI are drawn from
 * src/lib/product-manifest.ts (states from src/lib/truth.ts), never hard-coded, and nothing
 * here shows a score, a match, a salary, an opening or a written AI answer.
 */
import { Action, AI_NAME, AiMark, PUBLIC_JOURNEY, SectionIndex, TruthChip } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import CareerOSSpecimen from "@/components/product/CareerOSSpecimen"
import { LESSON_AI, SKYLENT_AI_FEATURES, aiFeature, type ProductStatus } from "@/lib/product-manifest"
import { truthOf } from "@/lib/truth"

/* ── Career OS ─────────────────────────────────────────────────────────────── */

/** The plate is the shared specimen: names, order and states come from src/lib/product-manifest.ts. */
export function CareerOs() {
  return (
    <section id="career-os" className="hm-cos sky-stage sky-band-navy" aria-labelledby="hm-career-title">
      <div className="sky-container">
        <Reveal className="hm-cos__head" stagger>
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
          <Reveal variant="plate" delay={140}>
            <div className="sky-stage__plate hm-light hm-cosplate">
              <CareerOSSpecimen />
            </div>
          </Reveal>
          <figcaption className="sky-stage__caption">
            <span>FIG. 07 · Career OS overview</span>
            <span>Example labels · no readiness score, job match or salary</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/* ── Skylent AI ────────────────────────────────────────────────────────────── */

const STATE_WORDS: Record<ProductStatus, string> = {
  live: "available",
  development: "in development",
  soon: "coming soon",
  sample: "a sample",
}

/**
 * What the lesson assistant actually is, read from the manifest (which mirrors the server):
 * the context it receives, its modes, the shape of an answer, what it refuses during an open
 * assessment, and where it does not work yet. No question or answer is written here.
 */
export function SkylentAi() {
  const lesson = aiFeature("lesson-assistant")
  const elsewhere = SKYLENT_AI_FEATURES.filter((item) => item.id !== lesson.id)
  return (
    <section id="skylent-ai" className="hm-ai" aria-labelledby="hm-ai-title">
      <div className="sky-container hm-ai__grid">
        <Reveal className="hm-ai__copy" stagger=":scope > :not(ol), .hm-ai__moves > li" step={70}>
          <SectionIndex n="08" label={AI_NAME} />
          <h2 id="hm-ai-title" className="sky-display sky-display--md">
            Help that knows <em>which lesson you are on.</em>
          </h2>
          <p className="hm-lead">
            {AI_NAME} answers from the lesson you have open and names the lesson its answer is based on. It does not see your progress, projects or career profile.
          </p>
          <ol className="hm-ai__moves" aria-label={`${AI_NAME} modes in a lesson`}>
            {LESSON_AI.modes.map((mode, i) => (
              <li key={mode.id}>
                <span className="hm-ai__moven">{String(i + 1).padStart(2, "0")}</span>
                <span className="hm-ai__movename">{mode.label}</span>
                <span className="hm-ai__movewhat">{mode.detail}</span>
              </li>
            ))}
          </ol>
          <p className="hm-ai__note">
            {lesson.label}: {STATE_WORDS[lesson.status]}.{" "}
            {elsewhere.map((item) => `${item.label}: ${STATE_WORDS[item.status]}.`).join(" ")}
          </p>
        </Reveal>

        <figure className="hm-ai__figure">
          <Reveal variant="plate" delay={280}>
            <div className="hm-plate hm-aipanel">
              <div className="hm-aipanel__head sky-on-navy">
                <div className="hm-aipanel__brand">
                  <span className="hm-aipanel__where">
                    <AiMark />
                    <span className="hm-aipanel__scope">{lesson.label}</span>
                  </span>
                  <TruthChip state={lesson.status} />
                </div>
                <div className="hm-aipanel__ctxlabel">Context it receives</div>
                <ul className="hm-aipanel__ctx">
                  {LESSON_AI.receives.map((item) => (
                    <li key={item.label}>{item.label}</li>
                  ))}
                </ul>
                <ul className="hm-aipanel__ctx hm-aipanel__ctx--off" aria-label="Context it does not receive">
                  {LESSON_AI.notReceived.map((item) => (
                    <li key={item}>{item} · not connected</li>
                  ))}
                </ul>
              </div>
              <div className="hm-aipanel__body">
                <div className="hm-art-label">How an answer is laid out</div>
                <div className="hm-aipanel__flow">
                  {LESSON_AI.answerShape.map((part) => (
                    <div key={part.label} className="hm-aipanel__step">
                      <div className="hm-art-label">{part.label}</div>
                      <p>{part.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="hm-aipanel__rules">
                  <div className="hm-art-label">What it will not do · enforced on the server</div>
                  <ul>
                    {LESSON_AI.integrity.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <ul className="hm-aipanel__scopes" aria-label={`Where ${AI_NAME} works`}>
                  {SKYLENT_AI_FEATURES.map((item) => (
                    <li key={item.id}>
                      <span>{item.label}</span>
                      <TruthChip state={item.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
          <figcaption className="hm-caption">
            <span>FIG. 08 · {AI_NAME} in the lesson player</span>
            <span>What it receives and how it answers · no example answer is shown</span>
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
        <Reveal className="hm-path__lead" stagger>
          <div className="hm-path__main" data-reveal-group>
            <div className="hm-path__index">
              <SectionIndex n="09" label="Find my path" />
              <TruthChip state={truthOf("findMyPath")} />
              <span className="hm-rulechip">Rule-based, not AI</span>
            </div>
            <h2 id="hm-path-title" className="sky-display sky-display--md">
              Not sure <em>where to start?</em>
            </h2>
          </div>
          <div className="hm-path__aside" data-reveal-group>
            <p>Seven short stages about where you are and where you want to go. The same answers always give the same path.</p>
            <Action to="/path">Find my path</Action>
          </div>
        </Reveal>

        <Reveal as="ol" className="hm-diag" stagger axis="x" step={110} delay={220} aria-label="How Find My Path works">
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
        <Reveal stagger step={110}>
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
