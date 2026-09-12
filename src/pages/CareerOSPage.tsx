import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, ButtonLink, Note, MetaRow, SectionHeading } from '../design/primitives'
import { getSurfaceAccent } from '../design/accent'
import { S, TY } from '../design/tokens'
import { useAuth } from '../context/AuthContext'
import { programs } from '../data'

const accent = getSurfaceAccent('career')

const PATH = [
  { label: 'Learn', body: 'A professional programme or course with published lessons.' },
  { label: 'Practice', body: 'Quizzes, assignments and virtual labs where they exist.' },
  { label: 'Build', body: 'Projects you actually submit in the platform.' },
  { label: 'Prove', body: 'A Skylent completion record — not a university qualification.' },
  { label: 'Career evidence', body: 'Your Career OS profile. Coursework does not appear here automatically.' },
]

const PARTS = [
  {
    title: 'Profile',
    body: 'Headline, skills, education, experience and links. Completeness is measured against fields you have filled in.',
    to: '/career-os/app/profile',
  },
  {
    title: 'Job board',
    body: 'Roles posted by verified employers. Today the board is empty because no employer has published one.',
    to: '/career-os/app/jobs',
  },
  {
    title: 'Applications',
    body: 'Applications you send are tracked with their real status. Nothing is invented to look busy.',
    to: '/career-os/app/applications',
  },
  {
    title: 'Interview practice',
    body: 'Structured question sets in the workspace. This is practice, not a live interview with a coach.',
    to: '/career-os/app/interviews',
  },
]

export default function CareerOSPage() {
  const { user } = useAuth()
  const professional = programs.filter(program => program.programType === 'PROFESSIONAL')
  const loginState = { returnTo: '/career-os/app' }

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Career OS"
          title="A career workspace — not a placement promise."
          lead="Profile, the job board, the applications you send, and structured interview practice. Skylent does not place you in a job."
          actions={
            <>
              {user ? (
                <ButtonLink to="/career-os/app" themeId="career">Open Career OS</ButtonLink>
              ) : (
                <ButtonLink to="/login" state={loginState} themeId="career">Sign in to open Career OS</ButtonLink>
              )}
              <ButtonLink to="/programs?type=PROFESSIONAL" variant="secondary">Professional programmes</ButtonLink>
            </>
          }
        />

        <div style={{ paddingBottom: 72 }}>
          <Note tone="caution">
            No verified employer has posted a role yet. The workspace shows what you put into it — not sample
            companies, salaries or success stories.
          </Note>

          <ol className="sk-career-path">
            {PATH.map((step, index) => (
              <li key={step.label}>
                <div style={{ ...TY.meta, color: accent.text, fontWeight: 600 }}>{String(index + 1).padStart(2, '0')}</div>
                <div style={{ ...TY.h3, fontFamily: 'var(--font-display)', margin: '6px 0 0' }}>{step.label}</div>
                <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: '8px 0 0' }}>{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="sk-grid sk-grid-2" style={{ marginTop: 36 }}>
            {PARTS.map(part => (
              <Card key={part.title} padding={22} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h2 style={{ ...TY.h3, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{part.title}</h2>
                <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: 1 }}>{part.body}</p>
                <Link
                  to={user ? part.to : '/login'}
                  state={user ? undefined : { returnTo: part.to }}
                  style={{ ...TY.bodySm, color: accent.text, fontWeight: 600, textDecoration: 'none' }}
                >
                  {user ? `Open ${part.title.toLowerCase()} →` : 'Sign in to open →'}
                </Link>
              </Card>
            ))}
          </div>

          <div style={{ marginTop: 44 }}>
            <SectionHeading
              title="Opens with professional programmes"
              lead="Career OS is the workspace after a professional programme — not a substitute for one."
            />
            {professional.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px' }}>
                {professional.map(program => (
                  <Link
                    key={program.slug}
                    to={`/programs/${program.slug}`}
                    style={{ ...TY.body, color: accent.text, fontWeight: 600, textDecoration: 'none' }}
                  >
                    {program.name} →
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ ...TY.bodySm, color: S.inkMuted }}>No professional programmes are in the catalogue.</p>
            )}
            <div style={{ marginTop: 18 }}>
              <MetaRow items={['Profile', 'Job board', 'Applications', 'Interview practice', 'Support']} />
            </div>
          </div>
        </div>
      </Rail>
    </ProductShell>
  )
}
