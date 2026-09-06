import { Link } from "react-router-dom"
import { GlassSurface } from "../foundation"
import type { ResolvedSkillDomain, SkillCatalogItem } from "../../lib/skills-domains"

function CatalogMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="skills-catalog-meta-item">
      <dt className="skills-catalog-meta-label">{label}</dt>
      <dd className="skills-catalog-meta-value">{value}</dd>
    </div>
  )
}

function CatalogCard({ item }: { item: SkillCatalogItem }) {
  const meta: Array<{ label: string; value: string }> = []
  if (item.level) meta.push({ label: "Level", value: item.level })
  if (item.duration) meta.push({ label: "Duration", value: item.duration })
  if (item.format) meta.push({ label: "Format", value: item.format })
  if (item.certificate) meta.push({ label: "Certificate", value: item.certificate })
  if (item.projects != null) meta.push({ label: "Projects", value: String(item.projects) })
  if (item.status && item.kind !== "workshop") meta.push({ label: "Availability", value: item.status })

  return (
    <article className="skills-catalog-card">
      <Link to={item.href} className="skills-catalog-card-link">
        <div className="skills-catalog-card-header">
          <span className="skills-catalog-card-type">{item.typeLabel}</span>
          {item.status && (
            <span className={`skills-catalog-card-status${item.kind === "workshop" ? " is-workshop" : ""}`}>
              {item.status}
            </span>
          )}
        </div>
        <h3 className="skills-catalog-card-title">{item.title}</h3>
        <p className="skills-catalog-card-desc">{item.description}</p>
        {meta.length > 0 && (
          <dl className="skills-catalog-meta-grid">
            {meta.map((entry) => (
              <CatalogMeta key={`${item.slug}-${entry.label}`} label={entry.label} value={entry.value} />
            ))}
          </dl>
        )}
        <span className="skills-catalog-card-action" aria-hidden>View details →</span>
      </Link>
    </article>
  )
}

type SkillsDomainPanelProps = {
  domain: ResolvedSkillDomain
  panelId: string
  labelledBy: string
}

export default function SkillsDomainPanel({ domain, panelId, labelledBy }: SkillsDomainPanelProps) {
  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className="skills-explorer-panel"
    >
      <div key={domain.id} className="skills-explorer-panel-inner skills-explorer-panel-fade">
        <div className="skills-explorer-panel-head">
          <p className="skylent-label skills-explorer-panel-eyebrow">Skill domain</p>
          <h2 className="skylent-display-sm skills-explorer-panel-title">{domain.label}</h2>
          <p className="skills-explorer-panel-tagline">{domain.tagline}</p>
        </div>

        {!domain.hasCatalog ? (
          <GlassSurface level={2} padding="24px" className="skills-explorer-empty">
            <p className="skills-explorer-empty-title">Programs coming soon</p>
            <p className="skills-explorer-empty-copy">
              {domain.label} learning paths are not in the catalog yet. Browse available programs and courses, or explore another skill domain.
            </p>
            <div className="skills-explorer-empty-actions">
              <Link to="/programs" className="skills-explorer-secondary-link">
                Browse programs
              </Link>
            </div>
          </GlassSurface>
        ) : (
          <>
            <div className="skills-explorer-block">
              <div className="skills-explorer-block-head">
                <p className="skylent-label skills-explorer-block-label">
                  Programs & courses
                </p>
                <span className="skills-explorer-item-count">
                  {domain.catalogItems.length} {domain.catalogItems.length === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="skills-catalog-list">
                {domain.catalogItems.map((item) => (
                  <CatalogCard key={`${item.kind}-${item.slug}`} item={item} />
                ))}
              </div>
            </div>

            {domain.learnTopics.length > 0 && (
              <div className="skills-explorer-block">
                <p className="skylent-label skills-explorer-block-label">Learn</p>
                <div className="skills-explorer-chips" role="list" aria-label={`${domain.label} learning areas`}>
                  {domain.learnTopics.map((topic) => (
                    <span key={topic} className="skills-explorer-chip" role="listitem">{topic}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="skills-explorer-cta">
              <Link to={domain.cta.href} className="skills-explorer-primary-link">
                {domain.cta.label} →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
