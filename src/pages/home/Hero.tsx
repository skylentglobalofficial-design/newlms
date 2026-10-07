/**
 * Homepage hero: the statement on the left, a learner photograph with the learning player
 * overlapping it on the right, and a short ledger of what is real today.
 */
import heroStudent from "@/assets/site/hero-student.jpg"
import { Action, TruthChip, type TruthState } from "@/components/skylent/primitives"
import { AUTHORED_COURSE_SLUG, courseBySlug } from "@/lib/catalog-maturity"
import { truthOf } from "@/lib/truth"
import { nameList, type HomeProgramme } from "./programme-model"

/* ── Learning player replica ───────────────────────────────────────────────── */

const PLAYER_LESSON_ID = "l7"

/** The three clauses lesson 7 opens with (src/content/data-analytics/lesson-text/l7.md). */
const LESSON_7_CLAUSES = [
  ["FROM", "which table"],
  ["WHERE", "which rows survive"],
  ["GROUP BY", "how to bucket remaining rows"],
] as const

/** Lesson titles, module and counts are read from the authored Data Analytics course. */
function playerPreview() {
  const course = courseBySlug(AUTHORED_COURSE_SLUG)
  if (!course) return null
  const moduleIndex = course.modules.findIndex((module) => module.lessons.some((lesson) => lesson.id === PLAYER_LESSON_ID))
  if (moduleIndex < 0) return null
  const all = course.modules.flatMap((module) => module.lessons)
  const position = all.findIndex((lesson) => lesson.id === PLAYER_LESSON_ID)
  const current = all[position]
  const done = position
  return {
    courseTitle: course.title,
    moduleLabel: `M${moduleIndex + 1} · ${course.modules[moduleIndex].title}`,
    lessons: course.modules[moduleIndex].lessons.map((lesson) => ({
      id: lesson.id,
      label: `L${all.indexOf(lesson) + 1}`,
      title: lesson.title,
    })),
    lessonNumber: position + 1,
    lessonKind: current.type === "notes" ? "Notes" : current.type === "quiz" ? "Check" : "Assignment",
    duration: current.duration,
    done,
    total: all.length,
    percent: Math.round((done / all.length) * 100),
  }
}

function PlayerPlate() {
  const preview = playerPreview()
  if (!preview) return null
  return (
    <div
      className="sky-plate hm-hero__plate"
      role="img"
      aria-label={`The Skylent learning player open on ${preview.courseTitle}, lesson ${preview.lessonNumber}: ${preview.lessons.find((l) => l.id === PLAYER_LESSON_ID)?.title}.`}
    >
      <div className="sky-plate__inner hm-player">
        <div className="hm-player__head">
          <div className="hm-player__where">
            <div className="hm-player__module">{preview.moduleLabel}</div>
            <div className="hm-player__course">{preview.courseTitle}</div>
          </div>
          <div className="hm-player__progress">
            <div className="hm-player__count">
              {preview.done} of {preview.total} · {preview.percent}%
            </div>
            <div className="hm-player__track">
              <div className="hm-player__fill" style={{ width: `${preview.percent}%` }} />
            </div>
          </div>
        </div>
        <ul className="hm-player__lessons">
          {preview.lessons.map((lesson) => (
            <li key={lesson.id} className={lesson.id === PLAYER_LESSON_ID ? "hm-player__lesson hm-player__lesson--on" : "hm-player__lesson"}>
              <span className="hm-player__n">{lesson.label}</span>
              {lesson.title}
            </li>
          ))}
        </ul>
        <div className="hm-player__body">
          <div className="hm-art-label">
            Lesson {preview.lessonNumber} · {preview.lessonKind} · {preview.duration}
          </div>
          <p className="hm-player__line">SQL is a language for asking a table questions.</p>
          <ol className="hm-player__clauses">
            {LESSON_7_CLAUSES.map(([clause, meaning], i) => (
              <li key={clause}>
                <span className="hm-player__step">{i + 1}</span>
                <span className="hm-player__kw">{clause}</span>
                <span className="hm-player__meaning">{meaning}</span>
              </li>
            ))}
          </ol>
        </div>
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
  return (
    <section className="sky-container hm-hero" aria-labelledby="hm-hero-title">
      <div className="hm-hero__grid">
        <div className="hm-hero__copy">
          <p className="sky-label">Skill programmes · Degrees · Career OS</p>
          <h1 id="hm-hero-title" className="hm-h1">Education built for what comes next.</h1>
          <p className="hm-hero__lead">
            Learn a skill or study for a degree. Build work as you go, keep it as evidence, and connect what you learn to what comes next.
          </p>
          <div className="hm-hero__actions">
            <Action to="/programmes">Explore programmes</Action>
            <Action to="/education" kind="secondary">Explore degrees</Action>
          </div>
          <p className="hm-hero__quiet">
            <span>Not sure where to start?</span>
            <Action to="/path" kind="quiet">Find my path</Action>
          </p>
          <Ledger programmes={programmes} isLoading={isLoading} />
        </div>

        <figure className="hm-hero__figure">
          <div className="hm-hero__photo">
            <img
              src={heroStudent}
              alt="A learner standing in a study room, holding a laptop and a notebook."
              width={1024}
              height={1280}
            />
          </div>
          <div className="hm-hero__below">
            <PlayerPlate />
            <figcaption className="hm-hero__caption">
              <div>FIG. 01 · Learning player, lesson 7</div>
              <div>Stand-in photograph</div>
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  )
}
