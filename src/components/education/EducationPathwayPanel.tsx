import { Link } from "react-router-dom"
import { GlassSurface } from "../foundation"
import { FlowStrip } from "../ui"
import type { EducationCatalogItem, ResolvedEducationPathway } from "../../lib/education-pathways"

function CatalogMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="skills-catalog-meta-item">
      <dt className="skills-catalog-meta-label">{label}</dt>
      <dd className="skills-catalog-meta-value">{value}</dd>
    </div>
  )
}

function CatalogCard({ item }: { item: EducationCatalogItem }) {
  const meta: Array<{ label: string; value: string }> = []
  if (item.level) meta.push({ label: "Level", value: item.level })
  if (item.duration) meta.push({ label: "Duration", value: item.duration })
  if (item.format) meta.push({ label: "Format", value: item.format })
  if (item.certificate) meta.push({ label: "Certificate", value: item.certificate })
  if (item.outcome) meta.push({ label: "Outcome", value: item.outcome })
  if (item.status) meta.push({ label: "Availability", value: item.status })

  return (
    <article className="skills-catalog-card">
      <Link to={item.href} className="skills-catalog-card-link">
        <div className="skills-catalog-card-header">
          <span className="skills-catalog-card-type">{item.typeLabel}</span>
          {item.examName && <span className="skills-catalog-card-status">{item.examName}</span>}
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
        {item.examPattern && (
          <p className="education-catalog-pattern">{item.examPattern}</p>
        )}
        {item.examSections.length > 0 && (
          <div className="skills-explorer-chips education-catalog-sections" role="list" aria-label={`${item.title} sections`}>
            {item.examSections.map((section) => (
              <span key={section} className="skills-explorer-chip" role="listitem">{section}</span>
            ))}
          </div>
        )}
        <span className="skills-catalog-card-action" aria-hidden>View program →</span>
      </Link>
    </article>
  )
}

type EducationPathwayPanelProps = {
  pathway: ResolvedEducationPathway
  panelId: string
  labelledBy: string
}

export default function EducationPathwayPanel({ pathway, panelId, labelledBy }: EducationPathwayPanelProps) {
  const emptyTitle =
    pathway.id === "competitive-exams" ? "Exam programs coming soon" : "Programs coming soon"

  const emptyCopy =
    pathway.id === "schooling"
      ? "Schooling programs are not in the public catalog yet. Partner with Skylent for curriculum-aligned delivery, or register interest for upcoming offerings."
      : pathway.id === "undergraduate" || pathway.id === "postgraduate"
        ? `${pathway.label} programs are not in the public catalog yet. Register interest to hear when degree-aligned offerings launch — no institutions or partnerships are listed until they are confirmed.`
        : "Exam preparation programs will appear here as they are published. Browse available programs or explore another pathway."

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className="pathway-explorer-panel"
    >
      <div key={pathway.id} className="skills-explorer-panel-inner skills-explorer-panel-fade">
        <div className="skills-explorer-panel-head">
          <p className="skylent-label skills-explorer-panel-eyebrow">{pathway.sub}</p>
          <h2 className="skylent-display-sm skills-explorer-panel-title">{pathway.label}</h2>
          <p className="skills-explorer-panel-tagline">{pathway.tagline}</p>
          <p className="education-pathway-description">{pathway.description}</p>
        </div>

        <div className="education-pathway-meta-grid">
          <div>
            <p className="skylent-label skills-explorer-block-label">Formats</p>
            <p className="education-pathway-meta-value">{pathway.formats.join(" · ")}</p>
          </div>
          <div>
            <p className="skylent-label skills-explorer-block-label">Levels</p>
            <p className="education-pathway-meta-value">{pathway.levels.join(" · ")}</p>
          </div>
        </div>

        <div className="skills-explorer-block">
          <p className="skylent-label skills-explorer-block-label">Preparation structure</p>
          <FlowStrip tone="dark" steps={pathway.preparationWorkflow.map((step) => ({ label: step }))} />
        </div>

        {!pathway.hasCatalog ? (
          <GlassSurface level={2} padding="24px" className="skills-explorer-empty">
            <p className="skills-explorer-empty-title">{emptyTitle}</p>
            <p className="skills-explorer-empty-copy">{emptyCopy}</p>
            <div className="skills-explorer-empty-actions">
              <Link to={pathway.cta.href} className="skills-explorer-primary-link">
                {pathway.cta.label} →
              </Link>
              {pathway.id !== "competitive-exams" && (
                <Link to="/programs" className="skills-explorer-secondary-link">
                  Browse programs
                </Link>
              )}
            </div>
          </GlassSurface>
        ) : (
          <>
            {pathway.examNames.length > 0 && (
              <div className="skills-explorer-block">
                <p className="skylent-label skills-explorer-block-label">Exams in catalog</p>
                <div className="skills-explorer-chips" role="list" aria-label={`${pathway.label} exams`}>
                  {pathway.examNames.map((exam) => (
                    <span key={exam} className="skills-explorer-chip" role="listitem">{exam}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="skills-explorer-block">
              <div className="skills-explorer-block-head">
                <p className="skylent-label skills-explorer-block-label">Programs</p>
                <span className="skills-explorer-item-count">
                  {pathway.catalogItems.length} {pathway.catalogItems.length === 1 ? "program" : "programs"}
                </span>
              </div>
              <div className="skills-catalog-list">
                {pathway.catalogItems.map((item) => (
                  <CatalogCard key={item.slug} item={item} />
                ))}
              </div>
            </div>

            {pathway.preparationTopics.length > 0 && (
              <div className="skills-explorer-block">
                <p className="skylent-label skills-explorer-block-label">Topics covered</p>
                <div className="skills-explorer-chips" role="list" aria-label={`${pathway.label} topics`}>
                  {pathway.preparationTopics.map((topic) => (
                    <span key={topic} className="skills-explorer-chip" role="listitem">{topic}</span>
                  ))}
                </div>
              </div>
            )}

            {pathway.catalogItems.some((item) => item.preparationSteps.length > 0) && (
              <div className="skills-explorer-block">
                <p className="skylent-label skills-explorer-block-label">Learning experience</p>
                <ul className="education-prep-list">
                  {pathway.catalogItems.flatMap((item) =>
                    item.preparationSteps.map((step) => (
                      <li key={`${item.slug}-${step}`}>{step}</li>
                    )),
                  )}
                </ul>
              </div>
            )}

            <div className="skills-explorer-cta">
              <Link to={pathway.cta.href} className="skills-explorer-primary-link">
                {pathway.cta.label} →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
