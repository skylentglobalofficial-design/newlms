import { Link } from "react-router-dom"
import { GlassSurface } from "../foundation"
import { FlowStrip } from "../ui"
import { ProductVisual } from "../product/ProductVisuals"
import {
  INSTITUTION_CAPABILITY_STATUS_LABELS,
  type InstitutionCapabilityDef,
  type ResolvedInstitutionType,
} from "../../lib/institution-types"

function CapabilityCard({ capability }: { capability: InstitutionCapabilityDef }) {
  const statusLabel = INSTITUTION_CAPABILITY_STATUS_LABELS[capability.status]
  return (
    <article className={`institution-capability-card is-${capability.status}`}>
      <div className="institution-capability-card-head">
        <h3 className="institution-capability-card-title">{capability.label}</h3>
        <span className={`institution-capability-status is-${capability.status}`}>{statusLabel}</span>
      </div>
      <p className="institution-capability-card-desc">{capability.description}</p>
    </article>
  )
}

type InstitutionTypePanelProps = {
  institution: ResolvedInstitutionType
  panelId: string
  labelledBy: string
}

export default function InstitutionTypePanel({
  institution,
  panelId,
  labelledBy,
}: InstitutionTypePanelProps) {
  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className="pathway-explorer-panel institution-type-panel"
    >
      <div key={institution.id} className="skills-explorer-panel-inner skills-explorer-panel-fade">
        <div className="skills-explorer-panel-head">
          <p className="skylent-label skills-explorer-panel-eyebrow">{institution.sub}</p>
          <h2 className="skylent-display-sm skills-explorer-panel-title">{institution.label}</h2>
          <p className="skills-explorer-panel-tagline">{institution.tagline}</p>
          <p className="education-pathway-description">
            <strong className="institution-problem-label">Challenge. </strong>
            {institution.problem}
          </p>
          <p className="education-pathway-description">{institution.value}</p>
        </div>

        <div className="institution-workflow-visual" aria-hidden>
          <ProductVisual id="institution-pipeline" themeId="institution" style={{ minHeight: 200 }} />
          <p className="career-workflow-preview-footnote">Institution OS workflow preview — not a live deployment.</p>
        </div>

        <div className="skills-explorer-block">
          <p className="skylent-label skills-explorer-block-label">Institutional workflow</p>
          <FlowStrip tone="dark" steps={institution.workflow.map((step) => ({ label: step }))} />
        </div>

        {institution.availableCapabilities.length > 0 && (
          <div className="skills-explorer-block">
            <div className="skills-explorer-block-head">
              <p className="skylent-label skills-explorer-block-label">Available on Skylent OS</p>
              <span className="skills-explorer-item-count">
                {institution.availableCapabilities.length} capabilities
              </span>
            </div>
            <div className="institution-capability-list">
              {institution.availableCapabilities.map((capability) => (
                <CapabilityCard key={capability.id} capability={capability} />
              ))}
            </div>
          </div>
        )}

        {institution.programItems.length > 0 && (
          <div className="skills-explorer-block">
            <div className="skills-explorer-block-head">
              <p className="skylent-label skills-explorer-block-label">Deployable programs</p>
              <span className="skills-explorer-item-count">
                {institution.programItems.length} in catalog
              </span>
            </div>
            <div className="skills-catalog-list">
              {institution.programItems.map((item) => (
                <article key={item.slug} className="skills-catalog-card">
                  <Link to={item.href} className="skills-catalog-card-link">
                    <div className="skills-catalog-card-header">
                      <span className="skills-catalog-card-type">{item.typeLabel}</span>
                    </div>
                    <h3 className="skills-catalog-card-title">{item.title}</h3>
                    <dl className="skills-catalog-meta-grid">
                      {item.duration && (
                        <div className="skills-catalog-meta-item">
                          <dt className="skills-catalog-meta-label">Duration</dt>
                          <dd className="skills-catalog-meta-value">{item.duration}</dd>
                        </div>
                      )}
                      {item.format && (
                        <div className="skills-catalog-meta-item">
                          <dt className="skills-catalog-meta-label">Format</dt>
                          <dd className="skills-catalog-meta-value">{item.format}</dd>
                        </div>
                      )}
                    </dl>
                    <span className="skills-catalog-card-action" aria-hidden>View program →</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}

        {(institution.inquiryCapabilities.length > 0 || institution.conceptCapabilities.length > 0) && (
          <div className="skills-explorer-block">
            <p className="skylent-label skills-explorer-block-label">Partnership & co-design areas</p>
            <div className="institution-capability-list">
              {[...institution.inquiryCapabilities, ...institution.conceptCapabilities].map((capability) => (
                <CapabilityCard key={capability.id} capability={capability} />
              ))}
            </div>
          </div>
        )}

        {institution.programItems.length === 0 && institution.availableCapabilities.length === 0 && (
          <GlassSurface level={2} padding="24px" className="skills-explorer-empty">
            <p className="skills-explorer-empty-title">Partnership-led delivery</p>
            <p className="skills-explorer-empty-copy">
              {institution.label} capabilities are shaped through institutional partnership and co-design — not self-serve catalog deployment yet.
            </p>
          </GlassSurface>
        )}

        <div className="skills-explorer-cta">
          <Link to={institution.cta.href} className="skills-explorer-primary-link">
            {institution.cta.label} →
          </Link>
          <Link to="/os" className="skills-explorer-secondary-link">
            View Skylent OS
          </Link>
        </div>
      </div>
    </div>
  )
}
