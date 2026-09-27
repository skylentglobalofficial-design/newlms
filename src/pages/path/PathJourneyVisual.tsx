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
