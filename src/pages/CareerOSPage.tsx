import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, ButtonLink, Note, MetaRow, SectionHeading } from '../design/primitives'
import { getSurfaceAccent } from '../design/accent'
import { S, TY } from '../design/tokens'
import { useAuth } from '../context/AuthContext'
import { programs } from '../data'

const accent = getSurfaceAccent('career')

const PARTS = [
  {
    title: 'Profile',
    body: 'A structured professional identity: headline, skills, education, experience and links. Completeness is measured against fields you have actually filled in.',
    to: '/career-os/app/profile',
  },
  {
    title: 'Job board',
    body: 'Roles posted by verified employers. You can open a role and apply from the workspace. Today the board is empty because no employer has published one.',
    to: '/career-os/app/jobs',
  },
  {
    title: 'Applications',
    body: 'Applications you send are tracked with their real status. Nothing is invented to make the tracker look busy.',
    to: '/career-os/app/applications',
  },
  {
    title: 'Interview practice',
    body: 'Structured question sets you work through in the workspace. This is practice, not a live interview with a coach.',
    to: '/career-os/app/interviews',
  },
]

export default function CareerOSPage() {
  const { user } = useAuth()
  const professional = programs.filter(program => program.programType === 'PROFESSIONAL')
  const workspaceTo = user ? '/career-os/app' : '/login'

  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="Career OS"
          title="A career workspace — not a placement promise."
          lead="Profile, the job board, the applications you send, and structured interview practice. It opens as a signed-in workspace. Skylent does not place you in a job."
          actions={
            <>
              <ButtonLink to={workspaceTo} themeId="career">
                {user ? 'Open Career OS' : 'Sign in to open Career OS'}
              </ButtonLink>
              <ButtonLink to="/programs?type=PROFESSIONAL" variant="secondary">Professional programmes</ButtonLink>
            </>
          }
        />

        <div style={{ paddingBottom: 72 }}>
          <Note tone="caution">
            No verified employer has posted a role yet. The board, application tracker and interview practice are built;
            they show what you put into them, not sample companies or salaries.
          </Note>

          <div className="sk-grid sk-grid-2" style={{ marginTop: 28 }}>
            {PARTS.map(part => (
              <Card key={part.title} padding={22} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h2 style={{ ...TY.h3, color: S.ink, margin: 0, fontFamily: 'var(--font-display)' }}>{part.title}</h2>
                <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: 1 }}>{part.body}</p>
                <Link to={user ? part.to : '/login'} style={{ ...TY.bodySm, color: accent.text, fontWeight: 600, textDecoration: 'none' }}>
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
