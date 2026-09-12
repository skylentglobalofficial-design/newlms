import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, ButtonLink, Note } from '../design/primitives'
import { S, TY } from '../design/tokens'

const LAYERS = [
  {
    title: 'Learner LMS',
    body: 'Courses, lessons, quizzes and assignments for a signed-in learner. Progress is the work they have actually completed.',
    to: '/login?returnTo=%2Fdashboard%2Fstudent',
    cta: 'Sign in to open',
  },
  {
    title: 'Faculty workspace',
    body: 'The teaching view of those same courses. It does not invent a class that has not been assigned.',
    to: '/login?returnTo=%2Fdashboard%2Ffaculty',
    cta: 'Sign in to open',
  },
  {
    title: 'Organisation workspace',
    body: 'Programmes, learners, faculty and progress for a partner institution. Layout is a preview until the organisation is live.',
    to: '/login?returnTo=%2Fdashboard%2Forganisation',
    cta: 'Sign in to open',
  },
  {
    title: 'Career OS',
    body: 'Profile, job board, applications and interview practice — a workspace, not a placement desk.',
    to: '/career-os',
    cta: 'How it works',
  },
]

export default function OSPage() {
  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Skylent OS"
          title="The operating layer."
          lead="Signed-in workspaces for learners, faculty, institutions and career workflows. This page does not preview them with invented student counts or sample organisations. Live classes are not available yet."
          actions={<ButtonLink to="/login" variant="secondary">Sign in</ButtonLink>}
        />

        <div style={{ paddingBottom: 72 }}>
          <Note>
            Opening a workspace asks you to sign in. You will only see the data that belongs to that account.
          </Note>

          <div className="sk-grid sk-grid-2" style={{ marginTop: 28 }}>
            {LAYERS.map(layer => (
              <Card key={layer.title} padding={22} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h2 style={{ ...TY.h3, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{layer.title}</h2>
                <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: 1 }}>{layer.body}</p>
                <ButtonLink to={layer.to} variant="quiet" size="sm">{layer.cta} →</ButtonLink>
              </Card>
            ))}
          </div>
        </div>
      </Rail>
    </ProductShell>
  )
}
