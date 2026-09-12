import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, StatusPill, ButtonLink, Note } from '../design/primitives'
import { resolveAcademicStages, type ResolvedStream } from '../lib/academic-streams'
import { S, TY } from '../design/tokens'

function Stream({ stream }: { stream: ResolvedStream }) {
  return (
    <article className="sk-degree-row">
      <div>
        <div style={{ ...TY.h2, fontFamily: 'var(--font-display)', margin: 0 }}>{stream.abbr}</div>
        <div style={{ ...TY.meta, color: S.inkMuted }}>{stream.name}</div>
      </div>
      <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0 }}>{stream.audience}</p>
      <div className="sk-degree-row-status">
        <StatusPill availability={stream.availability} size="sm" />
        <Link to={stream.href} style={{ ...TY.bodySm, fontWeight: 600, color: S.ink, textDecoration: 'none' }}>
          {stream.availability.ctaLabel} →
        </Link>
      </div>
    </article>
  )
}

export default function DegreesPage() {
  const stages = resolveAcademicStages().filter(stage => stage.id === 'undergraduate' || stage.id === 'postgraduate')

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Degrees"
          title="Undergraduate and postgraduate pathways."
          lead="These are academic categories, not Skylent-awarded degrees. Nothing in either stage is open to enrol."
          actions={<ButtonLink to="/education" variant="secondary">Full education map</ButtonLink>}
        />

        <Note tone="caution">
          Skylent is not a university and does not award B.Tech, BCA, MBA or MCA qualifications.
        </Note>

        <div style={{ padding: '12px 0 72px' }}>
          {stages.map(stage => (
            <section key={stage.id} id={stage.id} style={{ marginTop: 36 }}>
              <h2 style={{ ...TY.h2, fontFamily: 'var(--font-display)', margin: '0 0 6px' }}>{stage.label}</h2>
              <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '0 0 8px' }}>{stage.intro}</p>
              {stage.streams.map(stream => (
                <Stream key={stream.id} stream={stream} />
              ))}
            </section>
          ))}
        </div>
      </Rail>
    </ProductShell>
  )
}
