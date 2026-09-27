import { PATH_STAGES } from "../../lib/path/constants"
import { PATH_V2_JOURNEY_NODES } from "./pathV2Copy"

type PathJourneyVisualProps = {
  step: number
}

export default function PathJourneyVisual({ step }: PathJourneyVisualProps) {
  const total = PATH_STAGES.length

  return (
    <div className="path-v2-journey" aria-hidden="true">
      <p className="path-v2-journey__title">Your emerging path</p>
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
  )
}
