import { Link } from "react-router-dom"
import type { ResolvedEcosystemPillar } from "../../lib/ecosystem-map"

type EcosystemMapPanelProps = {
  pillar: ResolvedEcosystemPillar
  panelId: string
  labelledBy: string
}

export default function EcosystemMapPanel({ pillar, panelId, labelledBy }: EcosystemMapPanelProps) {
  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className="pathway-explorer-panel ecosystem-map-panel"
    >
      <div key={pillar.id} className="skills-explorer-panel-inner skills-explorer-panel-fade">
        <div className="skills-explorer-panel-head">
          <p className="skylent-label skills-explorer-panel-eyebrow" style={{ color: pillar.theme.text }}>
            {pillar.sub}
          </p>
          <h2 className="skylent-display-sm skills-explorer-panel-title">{pillar.label}</h2>
          <p className="skills-explorer-panel-tagline">{pillar.tagline}</p>
          <p className="education-pathway-description">{pillar.description}</p>
        </div>

        <div className="skills-explorer-block">
          <p className="skylent-label skills-explorer-block-label">What you can do</p>
          <ul className="education-prep-list ecosystem-map-action-list">
            {pillar.whatYouCanDo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="skills-explorer-block">
          <p className="skylent-label skills-explorer-block-label">Relevant if you are</p>
          <div className="skills-explorer-chips" role="list" aria-label={`${pillar.label} audiences`}>
            {pillar.relevantFor.map((audience) => (
              <span key={audience} className="skills-explorer-chip" role="listitem">{audience}</span>
            ))}
          </div>
        </div>

        <div className="skills-explorer-cta">
          <Link to={pillar.to} className="skills-explorer-primary-link">
            Explore {pillar.label} →
          </Link>
        </div>
      </div>
    </div>
  )
}
