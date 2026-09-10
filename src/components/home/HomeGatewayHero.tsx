import { useCallback, useEffect, useMemo, useState } from 'react'

type DomainId = 'data-ai' | 'physics' | 'biology' | 'business' | 'coding' | 'design'

type Choice = { id: string; label: string }

type Challenge = {
  id: string
  question: string
  choices: Choice[]
  correctId: string
  correctLabel: string
  incorrectHint: string
  explanation: string
}

type DomainConfig = {
  id: DomainId
  label: string
  kicker: string
  accent: string
  challenges: Challenge[]
}

const DOMAINS: DomainConfig[] = [
  {
    id: 'data-ai',
    label: 'Data & AI',
    kicker: 'Product metrics',
    accent: '#6D58D9',
    challenges: [
      {
        id: 'data-retention',
        question: 'A product has 40% more visitors but 18% fewer returning users. What would you investigate first?',
        choices: [
          { id: 'acquisition', label: 'Acquisition' },
          { id: 'retention', label: 'Retention' },
          { id: 'pricing', label: 'Pricing' },
          { id: 'conversion', label: 'Conversion' },
        ],
        correctId: 'retention',
        correctLabel: 'Retention',
        incorrectHint: 'Traffic grew, but fewer people came back — that points to the experience after the first visit.',
        explanation: 'Rising traffic with falling return rate usually means the first visit works, but repeat value or trust is weak. You would segment by cohort and inspect onboarding, core action completion, and churn reasons.',
      },
      {
        id: 'data-model',
        question: 'A model scores 94% accuracy on training data but 61% on new users. What is the most likely issue?',
        choices: [
          { id: 'overfit', label: 'Overfitting' },
          { id: 'underfit', label: 'Underfitting' },
          { id: 'latency', label: 'Latency' },
          { id: 'ui', label: 'UI colour' },
        ],
        correctId: 'overfit',
        correctLabel: 'Overfitting',
        incorrectHint: 'Strong on training, weak on new data is a classic generalisation gap.',
        explanation: 'The model memorised patterns that do not transfer. You would review feature leakage, holdout design, and regularisation before shipping.',
      },
    ],
  },
  {
    id: 'physics',
    label: 'Physics',
    kicker: 'Mechanics',
    accent: '#3478D4',
    challenges: [
      {
        id: 'physics-friction',
        question: 'You increase friction on a block sliding down a ramp. What happens to its acceleration?',
        choices: [
          { id: 'increase', label: 'Increases' },
          { id: 'decrease', label: 'Decreases' },
          { id: 'same', label: 'Stays the same' },
          { id: 'reverse', label: 'Reverses direction' },
        ],
        correctId: 'decrease',
        correctLabel: 'Decreases',
        incorrectHint: 'Friction opposes motion along the ramp.',
        explanation: 'More friction means a larger force opposing the component of gravity along the slope, so net acceleration drops unless the angle changes.',
      },
      {
        id: 'physics-orbit',
        question: 'A satellite loses speed in a circular orbit. What happens to its orbital radius?',
        choices: [
          { id: 'closer', label: 'Moves closer to Earth' },
          { id: 'farther', label: 'Moves farther away' },
          { id: 'same', label: 'Stays the same' },
          { id: 'stop', label: 'Orbit stops instantly' },
        ],
        correctId: 'closer',
        correctLabel: 'Moves closer to Earth',
        incorrectHint: 'Lower energy orbits sit closer to the central body.',
        explanation: 'Losing speed reduces orbital energy, so the satellite moves to a lower orbit until forces balance again.',
      },
    ],
  },
  {
    id: 'biology',
    label: 'Biology',
    kicker: 'Clinical reasoning',
    accent: '#168C83',
    challenges: [
      {
        id: 'bio-fatigue',
        question: 'A patient reports fatigue and pale skin. Which system would you investigate first?',
        choices: [
          { id: 'respiratory', label: 'Respiratory' },
          { id: 'cardiovascular', label: 'Cardiovascular' },
          { id: 'digestive', label: 'Digestive' },
          { id: 'muscle', label: 'Musculoskeletal' },
        ],
        correctId: 'cardiovascular',
        correctLabel: 'Cardiovascular',
        incorrectHint: 'Pale skin and fatigue often connect to oxygen delivery and blood composition.',
        explanation: 'You would start with hemoglobin, circulation, and cardiac output before chasing less likely systems.',
      },
      {
        id: 'bio-infection',
        question: 'Fever, sore throat, and swollen lymph nodes appear together. What is the most useful next step?',
        choices: [
          { id: 'history', label: 'Targeted history & exam' },
          { id: 'antibiotics', label: 'Antibiotics immediately' },
          { id: 'imaging', label: 'Full-body imaging' },
          { id: 'ignore', label: 'Wait two weeks' },
        ],
        correctId: 'history',
        correctLabel: 'Targeted history & exam',
        incorrectHint: 'Pattern recognition still needs focused evidence gathering.',
        explanation: 'A structured history narrows viral vs bacterial causes before tests or treatment.',
      },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    kicker: 'Operations',
    accent: '#B87918',
    challenges: [
      {
        id: 'biz-cost',
        question: 'Unit costs rose 12% but revenue held flat. What should you examine first?',
        choices: [
          { id: 'pricing', label: 'Pricing power' },
          { id: 'variable', label: 'Variable costs' },
          { id: 'brand', label: 'Brand awareness' },
          { id: 'office', label: 'Office layout' },
        ],
        correctId: 'variable',
        correctLabel: 'Variable costs',
        incorrectHint: 'Margins compress when per-unit cost rises without revenue movement.',
        explanation: 'Break down cost drivers by unit — materials, fulfilment, support — before changing price or strategy.',
      },
      {
        id: 'biz-launch',
        question: 'Two product launches are possible. Demand is high for A; margin is higher for B. What do you clarify first?',
        choices: [
          { id: 'capacity', label: 'Capacity & cash constraints' },
          { id: 'logo', label: 'Logo refresh' },
          { id: 'social', label: 'Social post schedule' },
          { id: 'both', label: 'Launch both immediately' },
        ],
        correctId: 'capacity',
        correctLabel: 'Capacity & cash constraints',
        incorrectHint: 'Trade-offs only make sense once operational limits are known.',
        explanation: 'Demand and margin matter after you know what you can deliver without breaking quality or runway.',
      },
    ],
  },
  {
    id: 'coding',
    label: 'Coding',
    kicker: 'Debugging',
    accent: '#2E73C8',
    challenges: [
      {
        id: 'code-api',
        question: 'An API returns 200 but the UI shows empty data. What do you check first?',
        choices: [
          { id: 'payload', label: 'Response payload' },
          { id: 'css', label: 'CSS layout' },
          { id: 'indexes', label: 'Database indexes' },
          { id: 'cdn', label: 'CDN cache only' },
        ],
        correctId: 'payload',
        correctLabel: 'Response payload',
        incorrectHint: 'A success status does not guarantee the shape the UI expects.',
        explanation: 'Inspect the JSON, field names, and empty arrays before optimising infrastructure.',
      },
      {
        id: 'code-bug',
        question: 'A function works in tests but fails in production with null input. What is the best fix?',
        choices: [
          { id: 'guard', label: 'Add input guard + test case' },
          { id: 'ignore', label: 'Ignore null in production' },
          { id: 'rewrite', label: 'Rewrite the whole module' },
          { id: 'disable', label: 'Disable the feature' },
        ],
        correctId: 'guard',
        correctLabel: 'Add input guard + test case',
        incorrectHint: 'Production edge cases need explicit handling, not hope.',
        explanation: 'Validate inputs at the boundary and add a regression test for the null path.',
      },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    kicker: 'Product UX',
    accent: '#B45A86',
    challenges: [
      {
        id: 'design-form',
        question: 'Users complete a form but abandon at the last step. What do you inspect first?',
        choices: [
          { id: 'fields', label: 'Fields on the final step' },
          { id: 'colour', label: 'Header colour' },
          { id: 'font', label: 'Font size' },
          { id: 'logo', label: 'Logo placement' },
        ],
        correctId: 'fields',
        correctLabel: 'Fields on the final step',
        incorrectHint: 'Drop-off at a step usually means friction or uncertainty there.',
        explanation: 'Review required inputs, error messages, and perceived effort on the step where users stop.',
      },
      {
        id: 'design-nav',
        question: 'Users cannot find settings after a redesign. What is the most useful first check?',
        choices: [
          { id: 'tasks', label: 'Top user tasks & labels' },
          { id: 'animation', label: 'Animation speed' },
          { id: 'shadow', label: 'Card shadow depth' },
          { id: 'stock', label: 'Stock photography' },
        ],
        correctId: 'tasks',
        correctLabel: 'Top user tasks & labels',
        incorrectHint: 'Findability problems usually start with naming and hierarchy.',
        explanation: 'Map the tasks people actually run, then compare labels and placement to those paths.',
      },
    ],
  },
]

const DEFAULT_DOMAIN: DomainId = 'data-ai'

function pickChallenge(domain: DomainConfig, excludeId?: string) {
  const pool = excludeId
    ? domain.challenges.filter(c => c.id !== excludeId)
    : domain.challenges
  if (pool.length === 0) return domain.challenges[0]
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function HomeGatewayHero() {
  const [domainId, setDomainId] = useState<DomainId>(DEFAULT_DOMAIN)
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  const domain = useMemo(
    () => DOMAINS.find(d => d.id === domainId) ?? DOMAINS[0],
    [domainId],
  )

  const challenge = domain.challenges[challengeIndex % domain.challenges.length]
  const challengeNumber = (challengeIndex % domain.challenges.length) + 1

  const resetRound = useCallback(() => {
    setSelectedId(null)
    setChecked(false)
  }, [])

  const selectDomain = useCallback((id: DomainId) => {
    setDomainId(id)
    setChallengeIndex(0)
    resetRound()
  }, [resetRound])

  const tryAnother = useCallback(() => {
    const next = pickChallenge(domain, challenge.id)
    const idx = domain.challenges.findIndex(c => c.id === next.id)
    setChallengeIndex(idx >= 0 ? idx : 0)
    resetRound()
  }, [domain, challenge.id, resetRound])

  const checkAnswer = useCallback(() => {
    if (selectedId) setChecked(true)
  }, [selectedId])

  const isCorrect = checked && selectedId === challenge.correctId

  useEffect(() => {
    resetRound()
  }, [challenge.id, resetRound])

  const onChoiceKeyDown = (event: React.KeyboardEvent, choiceId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!checked) setSelectedId(choiceId)
    }
  }

  return (
    <div className="home-gateway" id="hero-challenge">
      <div
        className="home-gateway-surface"
        style={{ '--gateway-accent': domain.accent } as React.CSSProperties}
      >
        <div className="home-gateway-chrome" aria-hidden="true">
          <span className="home-gateway-chrome-accent" />
          <span className="home-gateway-chrome-label">Live challenge</span>
          <span className="home-gateway-chrome-divider" />
          <span className="home-gateway-chrome-topic">{domain.label} · {domain.kicker}</span>
        </div>

        <div
          className="home-gateway-domains"
          role="tablist"
          aria-label="Challenge domain"
        >
          {DOMAINS.map(d => (
            <button
              key={d.id}
              type="button"
              role="tab"
              id={`gateway-tab-${d.id}`}
              aria-selected={domainId === d.id}
              aria-controls="gateway-challenge-panel"
              className={domainId === d.id ? 'is-active' : ''}
              onClick={() => selectDomain(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div
          key={`${domainId}-${challenge.id}`}
          id="gateway-challenge-panel"
          role="tabpanel"
          aria-labelledby={`gateway-tab-${domainId}`}
          className="home-gateway-challenge"
        >
          <div className="home-gateway-challenge-meta">
            <span className="home-gateway-kicker">{domain.kicker}</span>
            <span className="home-gateway-progress" aria-label={`Challenge ${challengeNumber} of ${domain.challenges.length}`}>
              {String(challengeNumber).padStart(2, '0')} / {String(domain.challenges.length).padStart(2, '0')}
            </span>
          </div>

          <h2 className="home-gateway-question">{challenge.question}</h2>

          <div
            className="home-gateway-choices"
            role="radiogroup"
            aria-label="Answer choices"
          >
            {challenge.choices.map((choice, index) => {
              const selected = selectedId === choice.id
              const showResult = checked && selected
              const isChoiceCorrect = choice.id === challenge.correctId
              let stateClass = ''
              if (showResult) stateClass = isChoiceCorrect ? 'is-correct' : 'is-incorrect'
              else if (selected && !checked) stateClass = 'is-selected'

              return (
                <button
                  key={choice.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={checked}
                  className={`home-gateway-choice ${stateClass}`}
                  onClick={() => !checked && setSelectedId(choice.id)}
                  onKeyDown={e => onChoiceKeyDown(e, choice.id)}
                >
                  <span className="home-gateway-choice-index" aria-hidden="true">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="home-gateway-choice-label">{choice.label}</span>
                  <span className="home-gateway-choice-marker" aria-hidden="true" />
                </button>
              )
            })}
          </div>

          <div className="home-gateway-actions">
            <button
              type="button"
              className="home-gateway-check"
              disabled={!selectedId || checked}
              onClick={checkAnswer}
            >
              Check answer
            </button>
            {checked && (
              <button
                type="button"
                className="home-gateway-again"
                onClick={tryAnother}
              >
                Try another
              </button>
            )}
          </div>

          <div
            className={`home-gateway-feedback${checked ? ' is-visible' : ''}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {checked && (
              <>
                <p className={`home-gateway-verdict ${isCorrect ? 'is-correct' : 'is-incorrect'}`}>
                  {isCorrect
                    ? `Correct — ${challenge.correctLabel}.`
                    : `Not quite — the stronger first move is ${challenge.correctLabel}.`}
                </p>
                <p className="home-gateway-explain">
                  {isCorrect ? challenge.explanation : `${challenge.incorrectHint} ${challenge.explanation}`}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
