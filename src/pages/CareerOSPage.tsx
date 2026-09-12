import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, ButtonLink, Note } from '../design/primitives'
import { useAuth } from '../context/AuthContext'
import { programs } from '../data'
import '../design/career.css'

const PARTS = [
  {
    title: 'Profile',
    body: 'Headline, skills, education, experience and links. Completeness is measured against fields you have filled in.',
    to: '/career-os/app/profile',
    today: 'You write this. Nothing is pre-filled from a demo résumé.',
  },
  {
    title: 'Opportunities',
    body: 'Roles posted by verified employers. Today the board is empty because no employer has published one.',
    to: '/career-os/app/jobs',
    today: 'Empty. Skylent does not invent companies to look busy.',
  },
  {
    title: 'Applications',
    body: 'Applications you send are tracked with their real status.',
    to: '/career-os/app/applications',
    today: 'Only applications you actually send appear here.',
  },
  {
    title: 'Practice',
    body: 'Structured question sets in the workspace. This is practice, not a live interview with a coach.',
    to: '/career-os/app/interviews',
    today: 'Question sets only. No coach session is booked from here.',
  },
]

export default function CareerOSPage() {
  const { user } = useAuth()
  const professional = programs.filter(program => program.programType === 'PROFESSIONAL')
  const loginState = { returnTo: '/career-os/app' }

  return (
    <ProductShell className="sk-career">
      <Rail>
        <PageHeader
          eyebrow="Career OS"
          title="A workspace for the professional journey."
          lead="Profile, opportunities, applications and interview practice. Skylent does not place you in a job and does not promise salary outcomes."
          actions={
            <>
              {user ? (
                <ButtonLink to="/career-os/app">Open Career OS</ButtonLink>
              ) : (
                <ButtonLink to="/login" state={loginState}>Sign in to open Career OS</ButtonLink>
              )}
              <ButtonLink to="/programs?type=PROFESSIONAL" variant="secondary">Professional programmes</ButtonLink>
            </>
          }
        />

        <div className="sk-career-body">
          <Note tone="caution">
            No verified employer has posted a role yet. LMS completion does not yet become Career OS evidence
            automatically.
          </Note>

          <div className="sk-career-desk">
            <p className="sk-career-desk-kicker">Inside the workspace</p>
            <ul className="sk-career-desk-list">
              {PARTS.map(part => (
                <li key={part.title}>
                  <div>
                    <h2>{part.title}</h2>
                    <p>{part.body}</p>
                    <p className="sk-career-today">{part.today}</p>
                  </div>
                  <Link
                    to={user ? part.to : '/login'}
                    state={user ? undefined : { returnTo: part.to }}
                  >
                    {user ? `Open ${part.title.toLowerCase()}` : 'Sign in to open'}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <section className="sk-career-progs">
            <h2>Opens after professional programmes</h2>
            <p>Career OS is the workspace after a professional programme — not a substitute for one.</p>
            {professional.length > 0 ? (
              <ul>
                {professional.map(program => (
                  <li key={program.slug}>
                    <Link to={`/programs/${program.slug}`}>{program.name}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No professional programmes are in the catalogue.</p>
            )}
          </section>
        </div>
      </Rail>
    </ProductShell>
  )
}
