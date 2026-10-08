/**
 * Homepage hero: the statement, centred and oversized; then one composition of a learner
 * photograph (context), the learning player (the dominant object) and a lab result (the work).
 * Under it, a short ledger of what is real today, read from the live catalogue.
 */
import heroLearner from "@/assets/site/program-library.jpg"
import { Action, AiMark, TruthChip, type TruthState } from "@/components/skylent/primitives"
import { NORTHWIND_PREVIEW } from "@/lib/northwind-preview"
import { truthOf } from "@/lib/truth"
import { formatInr } from "./artefacts"
import { courseFacts, PLATE_LESSON_ID } from "./course-facts"
import { nameList, type HomeProgramme } from "./programme-model"

/* ── Learning player replica ───────────────────────────────────────────────── */

/** The clauses lesson 7 opens with (src/content/data-analytics/lesson-text/l7.md). */
const LESSON_7_CLAUSES = [
  ["FROM", "which table"],
  ["WHERE", "which rows survive"],
  ["GROUP BY", "how to bucket remaining rows"],
  ["HAVING", "which groups survive"],
  ["SELECT", "which columns to return"],
  ["ORDER BY", "sort the result"],
] as const

function PlayerPlate() {
  const facts = courseFacts()
  if (!facts) return null
  return (
    <div
      className="hm-plate hm-player"
      role="img"
      aria-label={`The Skylent learning player open on ${facts.title}, lesson ${facts.lessonNumber}: ${facts.current.title}. ${facts.done} of ${facts.total} lessons complete.`}
    >
      <div className="hm-player__head">
        <div className="hm-player__where">
          <span className="hm-player__course">{facts.title}</span>
          <span className="hm-player__module">
            Module {facts.currentModuleNumber} of {facts.stats.modules} · {facts.currentModule.title}
          </span>
        </div>
        <div className="hm-player__progress">
          <span className="hm-player__count">
            {facts.done} of {facts.total} complete · {facts.percent}%
          </span>
          <span className="hm-player__track">
            <span className="hm-player__fill" style={{ width: `${facts.percent}%` }} />
          </span>
        </div>
      </div>
      <div className="hm-player__cols">
        <div className="hm-player__rail">
          {facts.modules.map((module) => (
            <div key={module.id} className={`hm-player__mod hm-player__mod--${module.state}`}>
              <div className="hm-player__modhead">
                <span className="hm-player__n">{module.label}</span>
                <span className="hm-player__modtitle">{module.title}</span>
                <span className="hm-player__modstate">
                  {module.state === "complete" ? "Done" : `${module.done}/${module.lessons.length}`}
                </span>
              </div>
              {module.state === "current" ? (
                <div className="hm-player__lessons">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className={lesson.id === PLATE_LESSON_ID ? "hm-player__lesson hm-player__lesson--on" : "hm-player__lesson"}>
                      <span className="hm-player__n">{lesson.label}</span>
                      <span>{lesson.title}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="hm-player__body">
          <div className="hm-art-label">
            Lesson {facts.lessonNumber} · {facts.current.kind} · {facts.current.duration}
          </div>
          <div className="hm-player__title">{facts.current.title}</div>
          <p className="hm-player__line">
            SQL is a language for asking a table questions. Core clauses, in the order the engine thinks:
          </p>
          <div className="hm-player__clauses">
            {LESSON_7_CLAUSES.map(([clause, meaning], i) => (
              <div key={clause} className="hm-player__clause">
                <span className="hm-player__step">{i + 1}</span>
                <span className="hm-player__kw">{clause}</span>
                <span className="hm-player__meaning">{meaning}</span>
              </div>
            ))}
          </div>
          <div className="hm-player__foot">
            <AiMark className="hm-player__ai" />
            <span className="hm-player__next">Complete and continue</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** The lab result that lesson's query produces: the work, beside the person and the system. */
function ResultCard() {
  const { categories, netRevenue, netRevenueLabel, validRows, rows } = NORTHWIND_PREVIEW
  const top = categories[0]
  const share = Math.round((top.value / netRevenue) * 100)
  return (
    <div
      className="hm-plate hm-result"
      role="img"
      aria-label={`Northwind Lab result. ${top.name} leads with ${formatInr(top.value)}, ${share}% of ${netRevenueLabel} valid net revenue, from ${validRows} of ${rows} valid rows.`}
    >
      <div className="hm-art-label">Northwind Lab · result</div>
      <div className="hm-result__figure">{formatInr(top.value)}</div>
      <div className="hm-result__what">
        {top.name}, {share}% of {netRevenueLabel} valid net revenue
      </div>
      <div className="hm-result__bars">
        {categories.map((c, i) => (
          <span key={c.name} className={i === 0 ? "sky-bar sky-bar--on" : "sky-bar"} style={{ width: `${((c.value / top.value) * 100).toFixed(1)}%` }} />
        ))}
      </div>
      <div className="hm-result__meta">
        {validRows} of {rows} rows valid
      </div>
    </div>
  )
}

/* ── What is real today ────────────────────────────────────────────────────── */

type LedgerRow = { state: TruthState; text: string }

function ledgerRows(programmes: HomeProgramme[]): LedgerRow[] {
  const rows: LedgerRow[] = []
  const live = programmes.filter((p) => p.chip?.state === "live").map((p) => p.title)
  const building = programmes.filter((p) => p.chip?.state === "development").map((p) => p.title)
  if (live.length) rows.push({ state: "live", text: nameList(live, 3) })
  if (building.length) rows.push({ state: "development", text: nameList(building) })
  return rows
}

function Ledger({ programmes, isLoading }: { programmes: HomeProgramme[]; isLoading: boolean }) {
  const rows = ledgerRows(programmes)
  return (
    <dl className="hm-ledger" aria-label="What is available today">
      {isLoading ? (
        <>
          <div className="hm-ledger__row" aria-hidden="true">
            <dt><span className="sky-skeleton hm-ledger__skel-chip" /></dt>
            <dd><span className="sky-skeleton hm-ledger__skel-line" /></dd>
          </div>
          <div className="hm-ledger__row" aria-hidden="true">
            <dt><span className="sky-skeleton hm-ledger__skel-chip" /></dt>
            <dd><span className="sky-skeleton hm-ledger__skel-line" /></dd>
          </div>
        </>
      ) : (
        rows.map((row) => (
          <div key={row.state} className="hm-ledger__row">
            <dt><TruthChip state={row.state} /></dt>
            <dd>{row.text}</dd>
          </div>
        ))
      )}
      <div className="hm-ledger__row">
        <dt><TruthChip state={truthOf("degrees")} /></dt>
        <dd>Degree pathways, online and on campus</dd>
      </div>
    </dl>
  )
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */

export function Hero({ programmes, isLoading }: { programmes: HomeProgramme[]; isLoading: boolean }) {
  // Entrance order on load (HomePage.v2.css, .hm-enter): eyebrow, headline line by line, support,
  // actions, then the player settles, the photograph fades in and the lab result arrives last.
  // The keyframes only exist under prefers-reduced-motion: no-preference, so without them
  // everything is simply there.
  return (
    <section className="hm-hero" aria-labelledby="hm-hero-title">
      <div className="sky-container">
        <div className="hm-hero__statement">
          <p className="sky-label hm-hero__eyebrow hm-enter">Skill programmes · Degrees · Career OS</p>
          <h1 id="hm-hero-title" className="sky-display hm-hero__title">
            <span className="hm-hero__line hm-enter">Education built for</span>{" "}
            <em className="hm-hero__line hm-enter">what comes next.</em>
          </h1>
          <p className="hm-hero__lead hm-enter">
            Learn a skill or study for a degree. Build work as you go, keep it as evidence, and connect what you learn to what comes next.
          </p>
          <div className="hm-hero__cta hm-enter">
            <div className="hm-hero__actions">
              <Action to="/programmes">Explore programmes</Action>
              <Action to="/education" kind="secondary">Explore degrees</Action>
            </div>
            <p className="hm-hero__quiet">
              <span>Not sure where to start?</span>
              <Action to="/path" kind="quiet">Find my path</Action>
            </p>
          </div>
        </div>

        <figure className="hm-hero__stage">
          <div className="hm-hero__player hm-enter hm-enter--plate">
            <PlayerPlate />
          </div>
          <div className="hm-hero__photo">
            <img className="hm-enter hm-enter--fade" src={heroLearner} alt="A learner working at a laptop at a library table." width={1000} height={666} />
            <div className="hm-hero__result hm-enter hm-enter--card">
              <ResultCard />
            </div>
          </div>
          <figcaption className="hm-hero__caption">
            <span>FIG. 01 · Learning player, lesson 7, with its lab result</span>
            <span>Stand-in photograph</span>
          </figcaption>
        </figure>

        <Ledger programmes={programmes} isLoading={isLoading} />
      </div>
    </section>
  )
}
