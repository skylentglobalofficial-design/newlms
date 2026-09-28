import type { PathStageId } from "../../lib/path/constants"
import { PATH_STAGES } from "../../lib/path/constants"
import {
  PATH_V2_CONCEPT_INDEX,
  PATH_V2_JOURNEY_NODES,
  PATH_V2_SPECIMEN,
  PATH_V2_STAGE_HEADLINE,
} from "./pathV2Copy"

type PathJourneyVisualProps = {
  step: number
  stageId: PathStageId
}

function conceptActive(stageId: PathStageId, stages: PathStageId[]): boolean {
  return stages.includes(stageId)
}

export default function PathJourneyVisual({ step, stageId }: PathJourneyVisualProps) {
  const total = PATH_STAGES.length
  const headline = PATH_V2_STAGE_HEADLINE[stageId]
  const questionPreview = headline.lines.join(" ")

  return (
    <div className="path-v2-specimen" aria-hidden="true">
      <style>{`
        .path-v2-specimen {
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 70px rgba(21, 23, 26, 0.07);
          background:
            linear-gradient(135deg, rgba(245, 242, 233, 0.55), rgba(255, 255, 255, 0) 42%),
            #fff;
        }

        .path-v2-specimen::before {
          content: "PATH / 01—07";
          position: absolute;
          top: 72px;
          right: -4px;
          writing-mode: vertical-rl;
          font: 700 8px/1 var(--path-mono);
          letter-spacing: 0.18em;
          color: rgba(21, 23, 26, 0.18);
          pointer-events: none;
        }

        .path-v2-specimen__meta {
          min-height: 44px;
          padding-inline: 18px;
          background: rgba(255, 253, 248, 0.82);
        }

        .path-v2-specimen__body {
          position: relative;
          padding: 32px 34px 28px;
        }

        .path-v2-specimen__body::before {
          content: "";
          position: absolute;
          left: 0;
          top: 32px;
          width: 2px;
          height: 54px;
          background: var(--path-mark);
        }

        .path-v2-specimen__prompt {
          letter-spacing: 0.02em;
        }

        .path-v2-specimen__quote {
          max-width: 12ch;
          font-size: clamp(1.35rem, 2.5vw, 1.7rem);
          line-height: 1.14;
        }

        .path-v2-index {
          margin-top: 30px;
          padding-top: 22px;
        }

        .path-v2-index li {
          min-height: 34px;
          padding: 10px 0;
        }

        .path-v2-index__rule {
          transition: width 180ms ease, background 180ms ease;
        }

        .path-v2-index li.is-active .path-v2-index__rule {
          box-shadow: 12px 0 0 -0.5px var(--path-mark);
        }

        .path-v2-specimen__live {
          margin-top: 26px;
          padding-top: 20px;
        }

        .path-v2-specimen__live-question {
          max-width: 19ch;
          font-size: 20px;
        }

        .path-v2-specimen__footer {
          margin-top: 28px;
        }

        .path-v2-journey {
          position: relative;
          padding: 18px 18px 20px;
        }

        .path-v2-journey__list {
          grid-template-columns: repeat(8, minmax(0, 1fr));
          gap: 0;
        }

        .path-v2-journey__node {
          gap: 7px;
          padding: 5px 0;
        }

        .path-v2-journey__node:not(:last-child)::after {
          display: block;
          content: "";
          position: absolute;
          left: 10px;
          right: -2px;
          top: 8px;
          height: 1px;
          background: #d9d4c9;
          z-index: 0;
        }

        .path-v2-journey__dot,
        .path-v2-journey__label {
          position: relative;
          z-index: 1;
        }

        .path-v2-journey__node.is-done:not(:last-child)::after {
          background: var(--path-ink);
        }

        .path-v2-journey__node.is-current .path-v2-journey__dot {
          box-shadow: 0 0 0 4px rgba(243, 111, 33, 0.1);
        }

        .path-v2-journey__label {
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .path-v2-specimen__body { padding: 28px 26px 24px; }
          .path-v2-journey__list { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        @media (max-width: 640px) {
          .path-v2-specimen::before { display: none; }
          .path-v2-specimen__body { padding: 24px 22px; }
          .path-v2-journey__list { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .path-v2-journey__label { white-space: normal; }
        }
      `}</style>

      <div className="path-v2-specimen__meta">
        <span>Path diagnostic</span>
        <span>7 stages</span>
      </div>

      <div className="path-v2-specimen__body">
        <p className="path-v2-specimen__prompt">{PATH_V2_SPECIMEN.prompt}</p>
        <p className="path-v2-specimen__quote">&ldquo;{PATH_V2_SPECIMEN.quote}&rdquo;</p>

        <nav className="path-v2-index" aria-hidden="true">
          <ol>
            {PATH_V2_CONCEPT_INDEX.map((row) => (
              <li
                key={row.id}
                className={conceptActive(stageId, row.stages) ? "is-active" : ""}
              >
                <span className="path-v2-index__label">{row.label}</span>
                <span className="path-v2-index__rule" />
              </li>
            ))}
          </ol>
        </nav>

        <div className="path-v2-specimen__live">
          <span className="path-v2-specimen__live-label">Now asking</span>
          <p className="path-v2-specimen__live-question">{questionPreview}</p>
        </div>

        <div className="path-v2-specimen__footer">
          <strong>{PATH_V2_SPECIMEN.footerTitle}</strong>
          <span>{PATH_V2_SPECIMEN.footerNote}</span>
        </div>
      </div>

      <div className="path-v2-journey">
        <p className="path-v2-journey__title">Sequence</p>
        <ol className="path-v2-journey__list">
          {PATH_V2_JOURNEY_NODES.map((label, index) => {
            const stageIndex = index - 1
            const isStart = index === 0
            const isFuture = !isStart && stageIndex > step
            const isCurrent = !isStart && stageIndex === step
            const isDone = !isStart && stageIndex < step
            const isGoal = index === PATH_V2_JOURNEY_NODES.length - 1 && step >= total - 1

            return (
              <li
                key={label}
                className={[
                  "path-v2-journey__node",
                  isStart ? "is-start" : "",
                  isDone ? "is-done" : "",
                  isCurrent ? "is-current" : "",
                  isFuture ? "is-future" : "",
                  isGoal ? "is-goal" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="path-v2-journey__dot" />
                <span className="path-v2-journey__label">{label}</span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}