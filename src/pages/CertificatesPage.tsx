import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, ButtonLink, Note } from '../design/primitives'
import { S, TY } from '../design/tokens'

const FACTS = [
  {
    title: 'What it represents',
    body: 'A Skylent completion certificate records that you finished the required lessons and assessments for a specific course or programme on this platform.',
  },
  {
    title: 'How it is issued',
    body: 'Eligibility is computed from your learning progress. Download and public verification are not built yet — the dashboard will say when you are eligible.',
  },
  {
    title: 'What it is not',
    body: 'It is not an accredited qualification, a university certificate, a professional licence, or evidence that an employer hired you.',
  },
]

export default function CertificatesPage() {
  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Certificates"
          title="Completion, not accreditation."
          lead="If you finish the required work, Skylent can record that completion. That is the whole claim."
          actions={<ButtonLink to="/dashboard/student" variant="secondary">Learner dashboard</ButtonLink>}
        />

        <Note>
          No certificate has been issued from this product surface yet. There is nothing to verify at a public URL.
        </Note>

        <div className="sk-grid sk-grid-3" style={{ marginTop: 28, paddingBottom: 72 }}>
          {FACTS.map(fact => (
            <Card key={fact.title} padding={22}>
              <h2 style={{ ...TY.h3, fontFamily: 'var(--font-display)', margin: 0 }}>{fact.title}</h2>
              <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '10px 0 0' }}>{fact.body}</p>
            </Card>
          ))}
        </div>
      </Rail>
    </ProductShell>
  )
}
