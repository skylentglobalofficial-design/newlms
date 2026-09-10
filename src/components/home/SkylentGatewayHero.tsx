import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import GatewayStage from './GatewayStage'
import { GATEWAY_INTENTS, type GatewayIntentId } from './gateway-intents'

export default function SkylentGatewayHero() {
  const [intentId, setIntentId] = useState<GatewayIntentId>('skills')
  const intent = GATEWAY_INTENTS.find(item => item.id === intentId) ?? GATEWAY_INTENTS[0]

  const onIntentKeyDown = useCallback((event: React.KeyboardEvent, id: GatewayIntentId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIntentId(id)
    }
  }, [])

  return (
    <section className="home-hero-new skylent-gateway-hero" aria-labelledby="skylent-gateway-headline">
      <div className="skylent-gateway-hero-inner">
        <div className="skylent-gateway-copy">
          <div className="home-section-label"><span />Skylent</div>

          <h1 id="skylent-gateway-headline" className="skylent-gateway-headline">
            Start with where<br />
            you&apos;re <em>going.</em>
          </h1>

          <p className="skylent-gateway-lede">
            One platform. Different experiences for skills, exams, school, university, and career.
          </p>

          <div
            className="skylent-gateway-intents"
            role="tablist"
            aria-label="Choose your learning experience"
          >
            {GATEWAY_INTENTS.map(item => {
              const selected = intentId === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`gateway-intent-${item.id}`}
                  aria-selected={selected}
                  aria-controls="gateway-experience-panel"
                  className={selected ? 'is-active' : ''}
                  style={{ '--intent-accent': item.accent } as React.CSSProperties}
                  onClick={() => setIntentId(item.id)}
                  onKeyDown={e => onIntentKeyDown(e, item.id)}
                >
                  <span className="skylent-gateway-intent-index" aria-hidden="true">{item.index}</span>
                  <span className="skylent-gateway-intent-label">{item.label}</span>
                  <span className="skylent-gateway-intent-arrow" aria-hidden="true">→</span>
                </button>
              )
            })}
          </div>

          <div className="skylent-gateway-actions">
            <Link className="home-primary-button" to={intent.to}>
              {intent.cta} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div
          id="gateway-experience-panel"
          role="tabpanel"
          aria-labelledby={`gateway-intent-${intentId}`}
          className="skylent-gateway-panel"
        >
          <GatewayStage intent={intent} />
        </div>
      </div>
    </section>
  )
}
