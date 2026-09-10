import { useId, useState } from 'react'

type Mode = 'question' | 'attempt' | 'feedback'

const MODES: { id: Mode; label: string; index: string }[] = [
  { id: 'question', label: 'Question', index: '01' },
  { id: 'attempt', label: 'Attempt', index: '02' },
  { id: 'feedback', label: 'Feedback', index: '03' },
]

export default function ProductPracticeSurface() {
  const baseId = useId()
  const [mode, setMode] = useState<Mode>('question')
  const [choice, setChoice] = useState<string | null>(null)

  const options = [
    { id: 'acq', label: 'Acquisition', note: 'More people arriving' },
    { id: 'ret', label: 'Retention', note: 'Fewer people returning' },
    { id: 'price', label: 'Pricing', note: 'Willingness to pay' },
  ]

  return (
    <section className="home-practice-surface" aria-labelledby={`${baseId}-heading`}>
      <div className="home-practice-inner">
        <header className="home-practice-copy">
          <div className="home-section-label"><span />Inside a lesson</div>
          <h2 id={`${baseId}-heading`}>
            Ask. Try.<br />
            Get <em>specific</em> feedback.
          </h2>
          <p>
            One representative practice surface — not a brochure diagram.
          </p>
        </header>

        <div className="home-practice-modes" role="tablist" aria-label="Practice stages">
          {MODES.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={mode === item.id}
              aria-controls={`${baseId}-panel`}
              className={mode === item.id ? 'is-active' : ''}
              onClick={() => setMode(item.id)}
            >
              <span aria-hidden="true">{item.index}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${mode}`}
          className={`home-practice-panel home-practice-panel--${mode}`}
        >
          <div className="home-practice-rail" aria-hidden="true">
            <span>Data · Analytics</span>
            <span>Representative practice</span>
          </div>

          {mode === 'question' && (
            <div className="home-practice-body">
              <span className="home-practice-kicker">Question</span>
              <h3>Traffic rose. Return visits fell. What do you inspect first?</h3>
              <p>Separate the signal before you change price or ads.</p>
              <button type="button" className="home-practice-next" onClick={() => setMode('attempt')}>
                Attempt this <span aria-hidden="true">→</span>
              </button>
            </div>
          )}

          {mode === 'attempt' && (
            <div className="home-practice-body">
              <span className="home-practice-kicker">Your attempt</span>
              <h3>Choose the first cut</h3>
              <div className="home-practice-options" role="group" aria-label="First investigation">
                {options.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={choice === opt.id ? 'is-selected' : ''}
                    aria-pressed={choice === opt.id}
                    onClick={() => setChoice(opt.id)}
                  >
                    <strong>{opt.label}</strong>
                    <span>{opt.note}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="home-practice-next"
                disabled={!choice}
                onClick={() => setMode('feedback')}
              >
                See feedback <span aria-hidden="true">→</span>
              </button>
            </div>
          )}

          {mode === 'feedback' && (
            <div className="home-practice-body">
              <span className="home-practice-kicker">Feedback</span>
              <h3>
                {choice === 'ret'
                  ? 'Strong first move — retention is the gap.'
                  : choice
                    ? 'Useful signal, but retention explains the drop better.'
                    : 'Pick an attempt to receive feedback.'}
              </h3>
              <p>
                People arrived. Fewer returned. The next step is to analyse where activity goes quiet —
                then turn that into an output you can show.
              </p>
              <p className="home-practice-honest">Representative example · not a scored result</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
