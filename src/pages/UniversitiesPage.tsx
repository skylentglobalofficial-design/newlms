import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, ButtonLink, Note } from '../design/primitives'
import { S, TY } from '../design/tokens'

const STAGES = [
  { label: 'Schooling', to: '/education#schooling', body: 'Primary through senior secondary. No grade-band coursework is published yet.' },
  { label: 'Undergraduate', to: '/education#undergraduate', body: 'B.Tech and BCA are named as streams. Neither has a programme behind it.' },
  { label: 'Postgraduate', to: '/education#postgraduate', body: 'MBA and MCA are named as streams. Neither has a programme behind it.' },
  { label: 'Entrance exams', to: '/education#competitive-exams', body: 'JEE Advanced and CAT have programmes in the catalogue. They are not open to study yet.' },
]

export default function UniversitiesPage() {
  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Universities"
          title="Skylent is not a university."
          lead="It does not award degrees and it is not accredited by any university or examination board. Academic study on the platform is organised on the education page. Institutional partnership is a separate conversation."
          actions={
            <>
              <ButtonLink to="/education">Education</ButtonLink>
              <ButtonLink to="/institutions" variant="secondary">For institutions</ButtonLink>
            </>
          }
        />

        <div style={{ paddingBottom: 72 }}>
          <Note tone="caution">
            Invented degree titles — B.Sc. Data Science, PG Diploma in AI, MBA Tech — are not listed here, because
            Skylent does not offer them.
          </Note>

          <div className="sk-grid sk-grid-2" style={{ marginTop: 28 }}>
            {STAGES.map(stage => (
              <Card key={stage.label} padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h2 style={{ ...TY.h3, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{stage.label}</h2>
                <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: 1 }}>{stage.body}</p>
                <ButtonLink to={stage.to} variant="quiet" size="sm">{stage.label} →</ButtonLink>
              </Card>
            ))}
          </div>
        </div>
      </Rail>
    </ProductShell>
  )
}
