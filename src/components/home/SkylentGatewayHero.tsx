import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'

export type GatewayIntentId = 'skills' | 'exams' | 'schooling' | 'university' | 'career'

type GatewayIntent = {
  id: GatewayIntentId
  label: string
  detail: string
  cta: string
  to: string
  accent: string
  visualLabel: string
  visualHint: string
}

export const GATEWAY_INTENTS: GatewayIntent[] = [
  {
    id: 'skills',
    label: 'Build skills',
    detail: 'Learn by doing — projects, practice, and proof you can use in real work.',
    cta: 'Explore Skills',
    to: '/skills',
    accent: '#6D58D9',
    visualLabel: 'Skills workspace',
    visualHint: 'practice → build → ship',
  },
  {
    id: 'exams',
    label: 'Prepare for exams',
    detail: 'Diagnose gaps, practice with intent, and track readiness before the day matters.',
    cta: 'Explore Exams',
    to: '/exams',
    accent: '#3478D4',
    visualLabel: 'Exam readiness',
    visualHint: 'diagnose → practice → improve',
  },
  {
    id: 'schooling',
    label: 'Schooling',
    detail: 'Curiosity-led learning for class 1–12 — concepts, experiments, and steady progress.',
    cta: 'Explore Junior',
    to: '/junior',
    accent: '#168C83',
    visualLabel: 'Junior learning',
    visualHint: 'explore → try → understand',
  },
  {
    id: 'university',
    label: 'University',
    detail: 'Structured undergraduate and postgraduate paths with coursework, projects, and application.',
    cta: 'Explore Degrees',
    to: '/degrees',
    accent: '#B87918',
    visualLabel: 'Degree pathway',
    visualHint: 'curriculum → project → credential',
  },
  {
    id: 'career',
    label: 'Career',
    detail: 'Turn learning into evidence — profile, proof, and a clearer path to opportunity.',
    cta: 'Explore CareerOS',
    to: '/career-os',
    accent: '#2E73C8',
    visualLabel: 'Career evidence',
    visualHint: 'proof → discover → move',
  },
]

function GatewayExperienceVisual({ intent }: { intent: GatewayIntent }) {
  const { id, accent, visualLabel, visualHint } = intent

  return (
    <div
      className={`skylent-gateway-visual skylent-gateway-visual--${id}`}
      style={{ '--gateway-accent': accent } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="skylent-gateway-visual-head">
        <span className="skylent-gateway-visual-kicker">{visualLabel}</span>
        <span className="skylent-gateway-visual-hint">{visualHint}</span>
      </div>

      <div className="skylent-gateway-visual-body">
        {id === 'skills' && (
          <svg viewBox="0 0 400 240" className="skylent-gateway-svg">
            <rect width="400" height="240" fill="#f5f3fa" />
            <rect x="24" y="24" width="352" height="28" rx="4" fill="#fff" stroke={accent} strokeWidth="1" opacity=".9" />
            <rect x="24" y="64" width="108" height="152" rx="6" fill="#fff" stroke="rgba(8,9,9,.1)" />
            {[0, 1, 2, 3, 4].map(i => (
              <rect key={i} x="36" y={78 + i * 24} width="72" height="8" rx="2" fill={accent} opacity={0.12 + i * 0.06} />
            ))}
            <rect x="148" y="64" width="228" height="96" rx="6" fill="#171b1f" />
            <text x="164" y="92" fill="#9fd0ff" fontSize="11" fontFamily="var(--font-mono)">def build_pipeline():</text>
            <text x="176" y="112" fill="#dce6f2" fontSize="10" fontFamily="var(--font-mono)">  return validate(data)</text>
            <text x="176" y="130" fill="#dce6f2" fontSize="10" fontFamily="var(--font-mono)">         .transform()</text>
            <rect x="148" y="172" width="108" height="44" rx="6" fill={accent} opacity=".14" stroke={accent} strokeWidth="1" />
            <rect x="268" y="172" width="108" height="44" rx="6" fill="#fff" stroke="rgba(8,9,9,.12)" />
            <text x="164" y="198" fill={accent} fontSize="9" fontFamily="var(--font-mono)">PROJECT</text>
            <text x="284" y="198" fill="#6d7772" fontSize="9" fontFamily="var(--font-mono)">REVIEW</text>
          </svg>
        )}

        {id === 'exams' && (
          <svg viewBox="0 0 400 240" className="skylent-gateway-svg">
            <rect width="400" height="240" fill="#f2f6fb" />
            <text x="24" y="36" fill={accent} fontSize="10" fontFamily="var(--font-mono)">DIAGNOSTIC · Q12</text>
            <text x="24" y="68" fill="#080909" fontSize="14" fontWeight="600" fontFamily="var(--font-body)">Which concept needs the most work?</text>
            {['Mechanics', 'Calculus', 'Optics', 'Thermodynamics'].map((topic, i) => (
              <g key={topic}>
                <rect x="24" y={88 + i * 28} width="220" height="20" rx="4" fill="#fff" stroke="rgba(8,9,9,.1)" />
                <text x="36" y="102" fill="#5f6866" fontSize="10" fontFamily="var(--font-body)">{topic}</text>
                <rect x="268" y={88 + i * 28} width={40 + i * 18} height="20" rx="4" fill={accent} opacity={0.18 + i * 0.08} />
              </g>
            ))}
            <rect x="268" y="24" width="108" height="52" rx="6" fill="#fff" stroke={accent} strokeWidth="1" />
            <text x="284" y="46" fill="#6d7772" fontSize="9" fontFamily="var(--font-mono)">READINESS</text>
            <text x="284" y="66" fill={accent} fontSize="22" fontWeight="600" fontFamily="var(--font-body)">72%</text>
          </svg>
        )}

        {id === 'schooling' && (
          <svg viewBox="0 0 400 240" className="skylent-gateway-svg">
            <rect width="400" height="240" fill="#f0f6f3" />
            <circle cx="200" cy="108" r="52" fill="none" stroke={accent} strokeWidth="1.5" opacity=".35" />
            <circle cx="200" cy="108" r="8" fill={accent} opacity=".5" />
            <path d="M200 56 L200 160 M148 108 L252 108" stroke={accent} strokeWidth="1" opacity=".25" />
            <rect x="28" y="28" width="96" height="56" rx="6" fill="#fff" stroke={accent} strokeWidth="1" />
            <text x="40" y="50" fill={accent} fontSize="9" fontFamily="var(--font-mono)">HYPOTHESIS</text>
            <text x="40" y="68" fill="#5f6866" fontSize="10" fontFamily="var(--font-body)">What changes if…?</text>
            <rect x="276" y="148" width="100" height="68" rx="6" fill="#fff" stroke="rgba(8,9,9,.1)" />
            <path d="M296 196 Q320 160 352 188" fill="none" stroke={accent} strokeWidth="2" />
            {[296, 320, 344].map((x, i) => (
              <circle key={x} cx={x} cy={188 - i * 14} r="4" fill={accent} opacity={0.4 + i * 0.2} />
            ))}
            <text x="24" y="210" fill="#6d7772" fontSize="9" fontFamily="var(--font-mono)">observe → question → test</text>
          </svg>
        )}

        {id === 'university' && (
          <svg viewBox="0 0 400 240" className="skylent-gateway-svg">
            <rect width="400" height="240" fill="#fbf7ef" />
            <text x="24" y="32" fill={accent} fontSize="10" fontFamily="var(--font-mono)">DEGREE MAP · SEM 4</text>
            {[
              { x: 24, label: 'Core', w: 88 },
              { x: 124, label: 'Elective', w: 88 },
              { x: 224, label: 'Project', w: 88 },
              { x: 324, label: 'Thesis', w: 52 },
            ].map((col, i) => (
              <g key={col.label}>
                <rect x={col.x} y="48" width={col.w} height="28" rx="4" fill="#fff" stroke={accent} strokeWidth="1" opacity={0.9 - i * 0.05} />
                <text x={col.x + 10} y="66" fill={accent} fontSize="9" fontFamily="var(--font-mono)">{col.label}</text>
                <rect x={col.x} y="88" width={col.w} height="112" rx="6" fill={i === 2 ? accent : '#fff'} opacity={i === 2 ? 0.12 : 1} stroke="rgba(8,9,9,.1)" />
                {[0, 1, 2, 3].map(j => (
                  <rect key={j} x={col.x + 10} y={102 + j * 22} width={col.w - 20} height="10" rx="2" fill={accent} opacity={0.1 + j * 0.05} />
                ))}
              </g>
            ))}
            <text x="24" y="220" fill="#6d7772" fontSize="9" fontFamily="var(--font-mono)">module → application → credential</text>
          </svg>
        )}

        {id === 'career' && (
          <svg viewBox="0 0 400 240" className="skylent-gateway-svg">
            <rect width="400" height="240" fill="#f0f5fa" />
            <rect x="24" y="24" width="132" height="192" rx="8" fill="#fff" stroke="rgba(8,9,9,.1)" />
            <circle cx="56" cy="56" r="18" fill={accent} opacity=".2" />
            <rect x="84" y="48" width="56" height="8" rx="2" fill="#080909" opacity=".8" />
            <rect x="84" y="64" width="44" height="6" rx="2" fill="#8a928f" />
            {['Project proof', 'Skills map', 'Applications'].map((row, i) => (
              <g key={row}>
                <rect x="36" y={92 + i * 36} width="108" height="24" rx="4" fill={accent} opacity={0.08 + i * 0.04} />
                <text x="44" y="108" fill="#5f6866" fontSize="9" fontFamily="var(--font-body)">{row}</text>
              </g>
            ))}
            <rect x="176" y="24" width="200" height="88" rx="8" fill="#fff" stroke={accent} strokeWidth="1" />
            <text x="192" y="48" fill={accent} fontSize="9" fontFamily="var(--font-mono)">OPPORTUNITY</text>
            <text x="192" y="72" fill="#080909" fontSize="13" fontWeight="600" fontFamily="var(--font-body)">Product Analyst</text>
            <text x="192" y="92" fill="#6d7772" fontSize="10" fontFamily="var(--font-body)">Evidence attached · 3 proofs</text>
            <rect x="176" y="128" width="200" height="88" rx="8" fill="#171b1f" />
            <text x="192" y="154" fill="#9fd0ff" fontSize="9" fontFamily="var(--font-mono)">PIPELINE</text>
            {['Discover', 'Apply', 'Prepare'].map((step, i) => (
              <g key={step}>
                <circle cx={210 + i * 56} cy="182" r="10" fill={accent} opacity={0.35 + i * 0.2} />
                <text x={210 + i * 56} y="206" textAnchor="middle" fill="#dce6f2" fontSize="8" fontFamily="var(--font-mono)">{step}</text>
                {i < 2 && <line x1={222 + i * 56} y1="182" x2={244 + i * 56} y2="182" stroke={accent} strokeWidth="1.5" opacity=".5" />}
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}

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
            Learning, built around<br />
            where you&apos;re <em>going.</em>
          </h1>

          <p className="skylent-gateway-tagline">One platform. Different ways to learn.</p>

          <p className="skylent-gateway-detail" key={intent.id}>
            {intent.detail}
          </p>

          <div
            className="skylent-gateway-intents"
            role="tablist"
            aria-label="Choose your learning path"
          >
            {GATEWAY_INTENTS.map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`gateway-intent-${item.id}`}
                aria-selected={intentId === item.id}
                aria-controls="gateway-experience-panel"
                className={intentId === item.id ? 'is-active' : ''}
                style={{ '--intent-accent': item.accent } as React.CSSProperties}
                onClick={() => setIntentId(item.id)}
                onKeyDown={e => onIntentKeyDown(e, item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="skylent-gateway-actions">
            <Link className="home-primary-button" to={intent.to}>
              {intent.cta} <span aria-hidden="true">↗</span>
            </Link>
            <a className="home-secondary-button" href="#interests">Browse all paths</a>
          </div>
        </div>

        <div
          id="gateway-experience-panel"
          role="tabpanel"
          aria-labelledby={`gateway-intent-${intentId}`}
          className="skylent-gateway-panel"
          key={intent.id}
        >
          <GatewayExperienceVisual intent={intent} />
        </div>
      </div>
    </section>
  )
}
