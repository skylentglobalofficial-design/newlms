import { useCallback, useEffect, useId, useRef, useState } from 'react'

type StageId = 'learn' | 'practice' | 'build' | 'prove' | 'move'

type Stage = {
  id: StageId
  label: string
  index: string
  caption: string
  concept: {
    label: string
    title: string
    body: string
  }
  work: {
    label: string
    title: string
    lines: string[]
    note?: string
  }
  output: {
    label: string
    title: string
    body: string
    meta?: string
  }
  focus: 'concept' | 'work' | 'output'
}

const STAGES: Stage[] = [
  {
    id: 'learn',
    label: 'Learn',
    index: '01',
    caption: 'A concept arrives. Not as a finished answer — as something you will use.',
    concept: {
      label: 'Concept',
      title: 'Customer retention',
      body: 'Traffic can rise while return rate falls. More visitors is not the same as more people coming back.',
    },
    work: {
      label: 'Lesson surface',
      title: 'What changed after the first visit?',
      lines: [
        'Separate acquisition from retention.',
        'Ask what happens after day one — not only how people arrive.',
        'Hold the question before changing price or ads.',
      ],
      note: 'Representative lesson · Data & Analytics',
    },
    output: {
      label: 'Output',
      title: 'Nothing to show yet',
      body: 'Understanding comes before the artifact.',
    },
    focus: 'concept',
  },
  {
    id: 'practice',
    label: 'Practice',
    index: '02',
    caption: 'You try the idea. The platform asks for a first move — and gives feedback.',
    concept: {
      label: 'Held concept',
      title: 'Customer retention',
      body: 'Traffic up ≠ loyalty up. Retention is the first cut.',
    },
    work: {
      label: 'Attempt',
      title: 'What would you investigate first?',
      lines: [
        'Acquisition — more people arriving',
        'Retention — fewer people returning',
        'Pricing — willingness to pay',
        'Conversion — checkout friction',
      ],
      note: 'Stronger first move: Retention — people arrived, but fewer returned.',
    },
    output: {
      label: 'Signal',
      title: 'Gap spotted',
      body: 'The lesson becomes a diagnostic habit.',
    },
    focus: 'work',
  },
  {
    id: 'build',
    label: 'Build',
    index: '03',
    caption: 'You apply the concept to a real task — messy activity data, real judgment.',
    concept: {
      label: 'Applied concept',
      title: 'Find where customers go quiet',
      body: 'Segment by region. Write the query. Interpret the pattern.',
    },
    work: {
      label: 'Working analysis',
      title: 'Customer activity notebook',
      lines: [
        'SELECT region, days_since_visit',
        'FROM customer_activity',
        'WHERE days_since_visit > 14',
        'ORDER BY days_since_visit DESC;',
      ],
      note: 'West region quiet after day 14 · draft reading in progress',
    },
    output: {
      label: 'Draft',
      title: 'Emerging output',
      body: 'A query, a short read, one recommended action.',
      meta: 'In progress',
    },
    focus: 'work',
  },
  {
    id: 'prove',
    label: 'Prove',
    index: '04',
    caption: 'The work becomes evidence — not a completion badge.',
    concept: {
      label: 'Source',
      title: 'Retention concept, applied',
      body: 'Lesson → attempt → analysis → recommendation.',
    },
    work: {
      label: 'Evidence',
      title: 'Churn analysis · West region',
      lines: [
        'Quiet customers concentrate after day 14.',
        'West region drops first.',
        'Proposed experiment: day-10 check-in for at-risk accounts.',
      ],
      note: 'Analysis · interpretation · recommendation',
    },
    output: {
      label: 'Proof',
      title: 'Recommendation memo',
      body: 'Something you can show — not just something you finished.',
      meta: 'Ready to attach',
    },
    focus: 'output',
  },
  {
    id: 'move',
    label: 'Move',
    index: '05',
    caption: 'Evidence opens the next step — keep practicing, or put the proof where it can work.',
    concept: {
      label: 'Capability',
      title: 'You can diagnose retention gaps',
      body: 'Learning became a usable skill — not a finished module.',
    },
    work: {
      label: 'Next',
      title: 'Put the proof where it can work',
      lines: [
        'Attach the notebook to your profile.',
        'Continue practice on adjacent cases.',
        'Take the next role step when ready.',
      ],
      note: 'Representative path · not a placement claim',
    },
    output: {
      label: 'Direction',
      title: 'Learning that moves',
      body: 'The platform stays with you past the lesson.',
      meta: 'Ready',
    },
    focus: 'output',
  },
]

export default function LearningEngineStory() {
  const baseId = useId()
  const [stageId, setStageId] = useState<StageId>('learn')
  const [movedByKeyboard, setMovedByKeyboard] = useState(false)
  const tabRefs = useRef<Partial<Record<StageId, HTMLButtonElement | null>>>({})
  const stageIndex = STAGES.findIndex(s => s.id === stageId)
  const stage = STAGES[stageIndex] ?? STAGES[0]

  useEffect(() => {
    if (!movedByKeyboard) return
    tabRefs.current[stageId]?.focus()
    setMovedByKeyboard(false)
  }, [stageId, movedByKeyboard])

  const selectStage = useCallback((id: StageId, fromKeyboard = false) => {
    if (fromKeyboard) setMovedByKeyboard(true)
    setStageId(id)
  }, [])

  const selectByOffset = useCallback((offset: number) => {
    const next = (stageIndex + offset + STAGES.length) % STAGES.length
    selectStage(STAGES[next].id, true)
  }, [stageIndex, selectStage])

  const onTablistKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      selectByOffset(1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      selectByOffset(-1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      selectStage(STAGES[0].id, true)
    } else if (event.key === 'End') {
      event.preventDefault()
      selectStage(STAGES[STAGES.length - 1].id, true)
    }
  }, [selectByOffset, selectStage])

  return (
    <section className="home-engine-story" aria-labelledby={`${baseId}-heading`}>
      <div className="home-engine-story-inner">
        <header className="home-engine-story-copy">
          <div className="home-section-label"><span />How learning works here</div>
          <h2 id={`${baseId}-heading`}>
            Learning doesn&apos;t end<br />
            with the <em>lesson.</em>
          </h2>
          <p>
            Understand the idea. Try it. Build with it. Leave with something you can show.
          </p>
        </header>

        <div
          className="home-engine-story-stages"
          role="tablist"
          aria-label="Learning progression"
          onKeyDown={onTablistKeyDown}
        >
          {STAGES.map(item => {
            const selected = stageId === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${item.id}`}
                ref={el => { tabRefs.current[item.id] = el }}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                className={selected ? 'is-active' : ''}
                onClick={() => selectStage(item.id)}
              >
                <span aria-hidden="true">{item.index}</span>
                {item.label}
              </button>
            )
          })}
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${stage.id}`}
          className={`home-engine-story-panel home-engine-story-panel--${stage.id} home-engine-story-panel--focus-${stage.focus}`}
          key={stage.id}
        >
          <p className="home-engine-story-caption">{stage.caption}</p>

          <div className="home-engine-object" aria-label="Representative learning object">
            <div className="home-engine-object-rail" aria-hidden="true">
              <span>Data · Analytics</span>
              <span>Customer retention</span>
              <span>Example thread</span>
            </div>

            <div className="home-engine-object-body">
              <article
                className={`home-engine-zone home-engine-zone--concept ${stage.focus === 'concept' ? 'is-focus' : ''}`}
              >
                <span>{stage.concept.label}</span>
                <h3>{stage.concept.title}</h3>
                <p>{stage.concept.body}</p>
              </article>

              <article
                className={`home-engine-zone home-engine-zone--work ${stage.focus === 'work' ? 'is-focus' : ''}`}
              >
                <span>{stage.work.label}</span>
                <h3>{stage.work.title}</h3>
                <ul className={stage.id === 'build' ? 'home-engine-code' : undefined}>
                  {stage.work.lines.map(line => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {stage.work.note && <p className="home-engine-zone-note">{stage.work.note}</p>}
              </article>

              <article
                className={`home-engine-zone home-engine-zone--output ${stage.focus === 'output' ? 'is-focus' : ''}`}
              >
                <span>{stage.output.label}</span>
                <h3>{stage.output.title}</h3>
                <p>{stage.output.body}</p>
                {stage.output.meta && (
                  <p className="home-engine-zone-meta">{stage.output.meta}</p>
                )}
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
