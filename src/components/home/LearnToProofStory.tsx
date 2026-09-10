import { useCallback, useState } from 'react'

type StoryStageId = 'learn' | 'practice' | 'build' | 'prove' | 'move'

type StoryStage = {
  id: StoryStageId
  label: string
  index: string
  caption: string
  left: { kicker: string; title: string; body: string }
  center: { kicker: string; title: string; body: string; detail?: string }
  right: { kicker: string; title: string; body: string }
}

const STAGES: StoryStage[] = [
  {
    id: 'learn',
    label: 'Learn',
    index: '01',
    caption: 'A concept lands. Not as a finished answer — as something to try.',
    left: {
      kicker: 'Concept',
      title: 'Traffic can rise while return rate falls.',
      body: 'More visitors is not the same as more people coming back.',
    },
    center: {
      kicker: 'First look',
      title: 'What changed after the first visit?',
      body: 'Separate acquisition from retention before you change pricing or ads.',
    },
    right: {
      kicker: 'Not yet',
      title: 'No output yet',
      body: 'Understanding comes before the artifact.',
    },
  },
  {
    id: 'practice',
    label: 'Practice',
    index: '02',
    caption: 'You attempt the idea. Feedback tells you what to inspect next.',
    left: {
      kicker: 'Concept',
      title: 'Traffic can rise while return rate falls.',
      body: 'More visitors is not the same as more people coming back.',
    },
    center: {
      kicker: 'Attempt',
      title: 'What would you investigate first?',
      body: 'Acquisition · Retention · Pricing · Conversion',
      detail: 'Stronger first move: Retention — people arrived, but fewer returned.',
    },
    right: {
      kicker: 'Signal',
      title: 'Gap spotted',
      body: 'The lesson becomes a diagnostic habit.',
    },
  },
  {
    id: 'build',
    label: 'Build',
    index: '03',
    caption: 'You apply the concept to a real task — messy data, real judgment.',
    left: {
      kicker: 'Concept held',
      title: 'Retention is the first cut.',
      body: 'Now turn that into work you can show.',
    },
    center: {
      kicker: 'Task',
      title: 'Find where customers go quiet',
      body: 'Segment by region. Write the query. Interpret the pattern.',
      detail: 'Working notebook open · analysis in progress',
    },
    right: {
      kicker: 'Draft',
      title: 'Emerging output',
      body: 'A query, a short read, one recommended action.',
    },
  },
  {
    id: 'prove',
    label: 'Prove',
    index: '04',
    caption: 'The work becomes evidence — not a completion badge.',
    left: {
      kicker: 'Source',
      title: 'Retention concept, applied',
      body: 'Lesson → attempt → real analysis.',
    },
    center: {
      kicker: 'Evidence',
      title: 'Churn analysis notebook',
      body: 'Segmented quiet customers and proposed one retention experiment.',
      detail: 'Analysis · interpretation · recommendation',
    },
    right: {
      kicker: 'Ready',
      title: 'Proof attached',
      body: 'Something you can show, not just something you finished.',
    },
  },
  {
    id: 'move',
    label: 'Move',
    index: '05',
    caption: 'Evidence opens the next step — profile, practice path, or opportunity.',
    left: {
      kicker: 'Capability',
      title: 'You can diagnose retention gaps.',
      body: 'Learning became a usable skill.',
    },
    center: {
      kicker: 'Next',
      title: 'Put the proof where it can work',
      body: 'Attach the notebook. Continue practice. Take the next role step when ready.',
    },
    right: {
      kicker: 'Direction',
      title: 'Learning that moves',
      body: 'The platform stays with you past the lesson.',
    },
  },
]

export default function LearnToProofStory() {
  const [stageId, setStageId] = useState<StoryStageId>('learn')
  const stage = STAGES.find(s => s.id === stageId) ?? STAGES[0]

  const onKeyDown = useCallback((event: React.KeyboardEvent, id: StoryStageId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setStageId(id)
    }
  }, [])

  return (
    <section className="home-proof-story" aria-labelledby="proof-story-heading">
      <div className="home-proof-story-inner">
        <header className="home-proof-story-copy">
          <div className="home-section-label"><span />How Skylent works</div>
          <h2 id="proof-story-heading">
            Learning doesn&apos;t end<br />
            with the <em>lesson.</em>
          </h2>
          <p>
            Understand it. Use it. Build with it. Show what you can do — then take the next step.
          </p>
        </header>

        <div
          className="home-proof-story-stages"
          role="tablist"
          aria-label="Learning progression"
        >
          {STAGES.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`proof-stage-${item.id}`}
              aria-selected={stageId === item.id}
              aria-controls="proof-story-panel"
              className={stageId === item.id ? 'is-active' : ''}
              onClick={() => setStageId(item.id)}
              onKeyDown={e => onKeyDown(e, item.id)}
            >
              <span aria-hidden="true">{item.index}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div
          id="proof-story-panel"
          role="tabpanel"
          aria-labelledby={`proof-stage-${stageId}`}
          className={`home-proof-story-stage home-proof-story-stage--${stage.id}`}
          key={stage.id}
        >
          <p className="home-proof-story-caption">{stage.caption}</p>

          <div className="home-proof-story-composition" aria-hidden="false">
            <article className={`home-proof-pane home-proof-pane--left ${stageId === 'learn' || stageId === 'practice' ? 'is-focus' : ''}`}>
              <span>{stage.left.kicker}</span>
              <h3>{stage.left.title}</h3>
              <p>{stage.left.body}</p>
            </article>

            <article className={`home-proof-pane home-proof-pane--center ${stageId === 'practice' || stageId === 'build' || stageId === 'prove' ? 'is-focus' : ''}`}>
              <span>{stage.center.kicker}</span>
              <h3>{stage.center.title}</h3>
              <p>{stage.center.body}</p>
              {stage.center.detail && <p className="home-proof-pane-detail">{stage.center.detail}</p>}
            </article>

            <article className={`home-proof-pane home-proof-pane--right ${stageId === 'prove' || stageId === 'move' ? 'is-focus' : ''}`}>
              <span>{stage.right.kicker}</span>
              <h3>{stage.right.title}</h3>
              <p>{stage.right.body}</p>
            </article>
          </div>

          <ol className="home-proof-story-loop" aria-label="Skylent learning loop">
            {STAGES.map(item => (
              <li key={item.id} className={stageId === item.id ? 'is-current' : ''}>
                {item.label}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
