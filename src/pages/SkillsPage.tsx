import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, ButtonLink, Note, Tag, EmptyState } from '../design/primitives'
import { getSurfaceAccent } from '../design/accent'
import { S, TY } from '../design/tokens'
import { getSkillDomains } from '../lib/skills-domains'

const accent = getSurfaceAccent('professional')

export default function SkillsPage() {
  const domains = getSkillDomains()
  const withCatalog = domains.filter(domain => domain.hasCatalog)
  const withoutCatalog = domains.filter(domain => !domain.hasCatalog)

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Learn"
          title="Build skills you can show."
          lead="Professional programmes, short courses and webinars grouped by domain. Empty domains stay empty. Virtual labs sit beside the courses that actually use them."
          actions={
            <>
              <ButtonLink to="/programs">Browse programmes</ButtonLink>
              <ButtonLink to="/labs" variant="secondary">Virtual labs</ButtonLink>
            </>
          }
        />

        <div style={{ paddingBottom: 72 }}>
          {withCatalog.map(domain => (
            <section key={domain.id} style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 14 }}>
                <div>
                  <h2 style={{ ...TY.h2, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{domain.label}</h2>
                  <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '6px 0 0' }}>{domain.tagline}</p>
                </div>
                <Link to={domain.cta.href} style={{ ...TY.bodySm, color: accent.text, fontWeight: 600, textDecoration: 'none' }}>
                  {domain.cta.label} →
                </Link>
              </div>
              <div className="sk-grid sk-grid-3">
                {domain.catalogItems.map(item => (
                  <Link key={`${item.kind}-${item.slug}`} to={item.href} style={{ textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
                    <Card interactive padding={18} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <Tag>{item.typeLabel}</Tag>
                        {item.status && <span style={{ ...TY.meta, color: S.inkMuted }}>{item.status}</span>}
                      </div>
                      <div style={{ ...TY.body, color: S.ink, fontWeight: 600 }}>{item.title}</div>
                      <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: 1 }}>{item.description}</p>
                      <span style={{ ...TY.meta, color: S.inkMuted }}>
                        {[item.duration, item.level, item.format].filter(Boolean).join(' · ')}
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {withoutCatalog.length > 0 && (
            <section>
              <h2 style={{ ...TY.h3, color: S.ink, margin: '0 0 12px', fontFamily: 'var(--font-display)' }}>
                No catalogue yet
              </h2>
              <Note>
                These domains are named so the map is complete. They have no programme, course or webinar behind them.
              </Note>
              <div className="sk-grid sk-grid-3" style={{ marginTop: 16 }}>
                {withoutCatalog.map(domain => (
                  <Card key={domain.id} padding={18} tone="muted">
                    <div style={{ ...TY.body, color: S.ink, fontWeight: 600 }}>{domain.label}</div>
                    <p style={{ ...TY.bodySm, color: S.inkMuted, margin: '6px 0 0' }}>{domain.tagline}</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {withCatalog.length === 0 && (
            <EmptyState title="No skills catalogue" body="Nothing has been published against a skills domain yet." />
          )}
        </div>
      </Rail>
    </ProductShell>
  )
}
