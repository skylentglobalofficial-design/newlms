import type { GatewayIntent, GatewayIntentId } from './gateway-intents'

type GatewayStageProps = {
  intent: GatewayIntent
}

function StageScene({ id, accent }: { id: GatewayIntentId; accent: string }) {
  const stroke = accent
  const soft = `${accent}33`
  const mid = `${accent}66`

  return (
    <svg viewBox="0 0 360 260" className="gateway-stage-svg" aria-hidden="true">
      <rect width="360" height="260" fill="#faf8f4" rx="0" />

      {id === 'skills' && (
        <g>
          <rect x="28" y="48" width="88" height="164" rx="8" fill="#fff" stroke="rgba(8,9,9,.08)" />
          <text x="44" y="74" fill={stroke} fontSize="9" fontFamily="var(--font-mono)" letterSpacing=".08em">SKILL</text>
          <rect x="44" y="88" width="56" height="6" rx="2" fill={soft} />
          <rect x="44" y="102" width="48" height="6" rx="2" fill={soft} />
          <rect x="44" y="116" width="52" height="6" rx="2" fill={soft} />

          <path d="M128 130 H152" stroke={mid} strokeWidth="1.5" />
          <polygon points="152,126 158,130 152,134" fill={mid} />

          <rect x="164" y="72" width="152" height="116" rx="8" fill="#fff" stroke={stroke} strokeWidth="1.2" />
          <text x="180" y="98" fill={stroke} fontSize="9" fontFamily="var(--font-mono)" letterSpacing=".08em">PROJECT</text>
          <rect x="180" y="110" width="120" height="56" rx="4" fill="#f6f4ee" stroke="rgba(8,9,9,.06)" />
          <rect x="188" y="122" width="72" height="5" rx="2" fill={soft} />
          <rect x="188" y="134" width="56" height="5" rx="2" fill={soft} />
          <rect x="188" y="146" width="64" height="5" rx="2" fill={soft} />

          <path d="M128 186 H152" stroke={mid} strokeWidth="1.5" />
          <polygon points="152,182 158,186 152,190" fill={mid} />

          <rect x="164" y="168" width="152" height="44" rx="8" fill={soft} stroke={stroke} strokeWidth="1" />
          <text x="180" y="194" fill={stroke} fontSize="9" fontFamily="var(--font-mono)" letterSpacing=".08em">PROOF</text>
        </g>
      )}

      {id === 'exams' && (
        <g>
          <rect x="28" y="56" width="304" height="56" rx="8" fill="#fff" stroke="rgba(8,9,9,.08)" />
          <text x="44" y="82" fill="#080909" fontSize="12" fontWeight="600" fontFamily="var(--font-body)">Where do you need more practice?</text>
          <rect x="44" y="92" width="120" height="6" rx="2" fill="rgba(8,9,9,.08)" />

          <rect x="28" y="132" width="140" height="80" rx="8" fill="#fff" stroke={stroke} strokeWidth="1" />
          <text x="44" y="156" fill={stroke} fontSize="9" fontFamily="var(--font-mono)" letterSpacing=".08em">FOCUS AREA</text>
          <rect x="44" y="168" width="88" height="8" rx="2" fill={soft} />
          <rect x="44" y="184" width="72" height="8" rx="2" fill={mid} />
          <text x="44" y="202" fill="#6d7772" fontSize="9" fontFamily="var(--font-body)">Needs attention</text>

          <path d="M180 172 H204" stroke={mid} strokeWidth="1.5" />
          <polygon points="204,168 210,172 204,176" fill={mid} />

          <rect x="216" y="132" width="116" height="80" rx="8" fill={soft} stroke={stroke} strokeWidth="1" />
          <text x="232" y="156" fill={stroke} fontSize="9" fontFamily="var(--font-mono)" letterSpacing=".08em">PRACTICE SET</text>
          <rect x="232" y="168" width="84" height="28" rx="4" fill="#fff" stroke="rgba(8,9,9,.08)" />
          <text x="244" y="186" fill="#5f6866" fontSize="9" fontFamily="var(--font-body)">Targeted drills</text>
        </g>
      )}

      {id === 'schooling' && (
        <g>
          <circle cx="180" cy="118" r="54" fill="none" stroke={stroke} strokeWidth="1.2" opacity=".35" />
          <circle cx="180" cy="118" r="10" fill={stroke} opacity=".45" />
          <line x1="180" y1="64" x2="180" y2="172" stroke={stroke} strokeWidth="1" opacity=".2" />
          <line x1="126" y1="118" x2="234" y2="118" stroke={stroke} strokeWidth="1" opacity=".2" />

          <rect x="36" y="44" width="104" height="52" rx="8" fill="#fff" stroke={stroke} strokeWidth="1" />
          <text x="52" y="68" fill={stroke} fontSize="9" fontFamily="var(--font-mono)" letterSpacing=".08em">QUESTION</text>
          <text x="52" y="84" fill="#5f6866" fontSize="10" fontFamily="var(--font-body)">What happens if…?</text>

          <rect x="220" y="168" width="104" height="52" rx="8" fill="#fff" stroke="rgba(8,9,9,.1)" />
          <text x="236" y="192" fill={stroke} fontSize="9" fontFamily="var(--font-mono)" letterSpacing=".08em">OBSERVATION</text>
          <path d="M248 208 Q272 188 296 204" fill="none" stroke={stroke} strokeWidth="1.8" />
        </g>
      )}

      {id === 'university' && (
        <g>
          {[
            { x: 28, label: 'Core study', active: false },
            { x: 132, label: 'Application', active: false },
            { x: 236, label: 'Project', active: true },
          ].map(col => (
            <g key={col.label}>
              <rect
                x={col.x}
                y="52"
                width="96"
                height="168"
                rx="8"
                fill={col.active ? soft : '#fff'}
                stroke={col.active ? stroke : 'rgba(8,9,9,.08)'}
                strokeWidth={col.active ? 1.2 : 1}
              />
              <text x={col.x + 12} y="76" fill={stroke} fontSize="9" fontFamily="var(--font-mono)" letterSpacing=".06em">
                {col.label.toUpperCase()}
              </text>
              {[0, 1, 2, 3].map(i => (
                <rect
                  key={i}
                  x={col.x + 12}
                  y={90 + i * 28}
                  width="72"
                  height="8"
                  rx="2"
                  fill={col.active ? mid : soft}
                  opacity={col.active ? 0.5 + i * 0.1 : 0.35}
                />
              ))}
            </g>
          ))}
        </g>
      )}

      {id === 'career' && (
        <g>
          <rect x="28" y="48" width="120" height="164" rx="8" fill="#fff" stroke="rgba(8,9,9,.08)" />
          <circle cx="68" cy="84" r="16" fill={soft} />
          <rect x="92" y="76" width="40" height="6" rx="2" fill="rgba(8,9,9,.12)" />
          <rect x="92" y="88" width="32" height="5" rx="2" fill="rgba(8,9,9,.08)" />
          {['Work samples', 'Skills shown', 'Projects'].map((row, i) => (
            <g key={row}>
              <rect x="40" y={108 + i * 32} width="96" height="22" rx="4" fill={soft} opacity={0.5 + i * 0.15} />
              <text x="48" y="123" fill="#5f6866" fontSize="9" fontFamily="var(--font-body)">{row}</text>
            </g>
          ))}

          <path d="M160 130 H184" stroke={mid} strokeWidth="1.5" />
          <polygon points="184,126 190,130 184,134" fill={mid} />

          <rect x="196" y="72" width="136" height="140" rx="8" fill="#fff" stroke={stroke} strokeWidth="1.2" />
          <text x="212" y="98" fill={stroke} fontSize="9" fontFamily="var(--font-mono)" letterSpacing=".08em">PROFILE</text>
          <rect x="212" y="110" width="104" height="40" rx="4" fill="#f6f4ee" />
          <text x="212" y="168" fill={stroke} fontSize="9" fontFamily="var(--font-mono)" letterSpacing=".08em">NEXT STEP</text>
          <rect x="212" y="180" width="72" height="20" rx="4" fill={soft} stroke={stroke} strokeWidth="1" />
        </g>
      )}
    </svg>
  )
}

export default function GatewayStage({ intent }: GatewayStageProps) {
  return (
    <div
      className="gateway-stage"
      style={{ '--stage-accent': intent.accent } as React.CSSProperties}
    >
      <div className="gateway-stage-frame">
        <p className="gateway-stage-question">{intent.question}</p>

        <div className="gateway-stage-canvas" key={intent.id}>
          <StageScene id={intent.id} accent={intent.accent} />
        </div>

        <ol className="gateway-stage-steps" aria-label={`${intent.label} learning flow`}>
          {intent.steps.map((step, index) => (
            <li key={step}>
              <span className="gateway-stage-step-index" aria-hidden="true">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <p className="gateway-stage-promise">{intent.promise}</p>
      </div>
    </div>
  )
}
