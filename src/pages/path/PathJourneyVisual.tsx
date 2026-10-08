import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { TruthChip } from "../../components/skylent/primitives"
import { PATH_STAGES } from "../../lib/path/constants"
import { truthOf } from "../../lib/truth"
import { PATH_V2_CLOSING_LINKS, PATH_V2_STAGE_HEADLINE, PATH_V2_TRUTH_LINE } from "./pathV2Copy"

/** Truth chip plus the one-line statement of what this tool is and is not. */
export function PathTruthNote() {
  return (
    <p className="path-truth">
      <TruthChip state={truthOf("findMyPath")} />
      <span>{PATH_V2_TRUTH_LINE}</span>
    </p>
  )
}

const STATE_WORD = { done: "done", current: "current stage", ahead: "not started" } as const

/** Seven numbered nodes: done, current, ahead. Scrolls inside its own container on narrow screens. */
export function PathProgress({ step }: { step: number }) {
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = scroller.current
    const current = box?.querySelector<HTMLElement>('[aria-current="step"]')
    if (!box || !current) return
    // Move only the strip, never the page.
    // Keep the previous stage in view for context.
    box.scrollLeft = Math.max(0, current.offsetLeft - current.offsetWidth)
  }, [step])

  return (
    <nav className="path-v2-progress" aria-label="Diagnosis journey">
      <div className="path-v2-progress__scroll" ref={scroller}>
        <ol className="path-v2-progress__list">
          {PATH_STAGES.map((row, index) => {
            const state = index === step ? "current" : index < step ? "done" : "ahead"
            return (
              <li
                key={row.id}
                className={`path-v2-progress__item is-${state}`}
                aria-current={state === "current" ? "step" : undefined}
              >
                <span className="path-v2-progress__node" aria-hidden="true">
                  {String(row.number).padStart(2, "0")}
                </span>
                <span className="path-v2-progress__label">
                  <span className="path-sr">Stage {row.number}: </span>
                  {PATH_V2_STAGE_HEADLINE[row.id].short}
                  <span className="path-sr"> ({STATE_WORD[state]})</span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

export type PathSummaryRow = { n: number; label: string; value: string; note?: string }

/** Built only from stages the learner has confirmed. An unanswered stage is not shown. */
export function PathSummary({ rows, total }: { rows: PathSummaryRow[]; total: number }) {
  return (
    <section className="path-v2-summary" aria-labelledby="path-summary-title">
      <p className="sky-label">
        Your answers · {rows.length} of {total} stages
      </p>
      <h2 id="path-summary-title" className="path-v2-summary__title">
        What you have told us so far
      </h2>
      {rows.length ? (
        <dl className="path-v2-summary__list">
          {rows.map((row) => (
            <div key={row.n} className="path-v2-summary__row cine-in">
              <dt>
                <b>{String(row.n).padStart(2, "0")}</b> {row.label}
              </dt>
              <dd>{row.value}</dd>
              {row.note ? <dd className="path-v2-summary__note">{row.note}</dd> : null}
            </div>
          ))}
        </dl>
      ) : (
        <p className="path-v2-summary__empty">
          Nothing yet. Each stage is listed here once you continue past it.
        </p>
      )}
      <p className="path-v2-summary__foot">Saved in this browser. Use Back to change an answer.</p>
    </section>
  )
}

/** The site's navy closing band, with links to real routes only. */
export function PathClosingBand({ title }: { title: string }) {
  return (
    <section className="sky-band-navy path-close" aria-labelledby="path-close-title">
      <div className="sky-container path-close__inner">
        <div className="path-close__copy">
          <p className="sky-label">Next step</p>
          <h2 id="path-close-title" className="path-close__title">
            {title}
          </h2>
        </div>
        <div className="path-close__actions">
          {PATH_V2_CLOSING_LINKS.map((link) => (
            <Link key={link.to} className="sk-btn sk-btn-secondary" to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
