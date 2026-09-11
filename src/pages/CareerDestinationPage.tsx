import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import WorldFrame from '../components/world/WorldFrame'
import {
  ActionPanel,
  ContentRail,
  ContextHeader,
  ProductLayout,
  ProductTable,
  SectionHeader,
  WorkspaceBlock,
} from '../components/product-ui'

const ACTIONS = [
  { id: 'jobs', label: 'Find a job', href: '/career-os/jobs', detail: 'Search and apply inside CareerOS. Live listings are not invented on this page.' },
  { id: 'interview', label: 'Prepare for an interview', href: '/career-os/interviews', detail: 'Track interviews you actually have. Practice stays in CareerOS.' },
  { id: 'evidence', label: 'Build evidence', href: '/skills', detail: 'Programmes and projects that produce work you can show.' },
  { id: 'careeros', label: 'Open CareerOS', href: '/career-os', detail: 'Authenticated workspace for jobs, applications, interviews, and profile.' },
  { id: 'tools', label: 'Explore tools', href: '/career-os/profile', detail: 'Profile, applications, and interview tools live behind sign-in.' },
]

const ROLE_TYPES = [
  { role: 'Data analyst', proof: 'SQL, dashboards, a dataset you can explain' },
  { role: 'Software developer', proof: 'Shipped project, readable logs, working repo' },
  { role: 'Product analyst', proof: 'Metrics, a case, a recommendation' },
]

export default function CareerDestinationPage() {
  const { user } = useAuth()
  const osHref = user ? '/career-os' : '/login?returnTo=%2Fcareer-os'

  function resolveHref(href: string, id: string) {
    if (id === 'evidence') return href
    if (id === 'careeros') return osHref
    return user ? href : osHref
  }

  const sidebar = (
    <ActionPanel title="CareerOS">
      <p className="panel-note" style={{ marginTop: 0 }}>
        {user ? 'Continue in the authenticated workspace.' : 'This page is public. CareerOS asks you to sign in.'}
      </p>
      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        <Link className="product-btn" to={osHref}>{user ? 'Open CareerOS' : 'Sign in to CareerOS'}</Link>
        <Link className="product-btn-ghost" to="/skills">Build evidence first</Link>
      </div>
    </ActionPanel>
  )

  return (
    <WorldFrame world="career">
      <ContentRail>
        <ContextHeader
          world="career"
          eyebrow="Career"
          title="What do you want to do next?"
          description="Find a job, prepare for an interview, build evidence, or open CareerOS. This is not a course catalogue and it is not an exam workspace."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Career' }]}
        />

        <ProductLayout sidebar={sidebar} variant="pdp">
          <div>
            <SectionHeader title="Next actions" description="Pick the job to be done. CareerOS stays behind sign-in; this page does not fake a hiring market." />
            <ProductTable
              headers={['Action', 'What happens', 'Go']}
              rows={ACTIONS.map((action) => [
                <strong key={`${action.id}-l`}>{action.label}</strong>,
                action.detail,
                <Link key={`${action.id}-c`} className="product-btn-ghost" to={resolveHref(action.href, action.id)}>Open</Link>,
              ])}
            />

            <div className="workspace-grid" style={{ marginTop: 28 }}>
              <WorkspaceBlock title="Jobs">
                <p>Listings belong in CareerOS. This public page does not invent employers, salaries, or openings.</p>
              </WorkspaceBlock>
              <WorkspaceBlock title="Interviews">
                <p>Prepare for interviews you have. Tools open after sign-in.</p>
              </WorkspaceBlock>
              <WorkspaceBlock title="Evidence">
                <p>Projects and programmes that produce proof live in Learn. Bring that work into CareerOS when you apply.</p>
                <p><Link to="/skills">Open Learn</Link></p>
              </WorkspaceBlock>
              <WorkspaceBlock title="Role types people prepare for">
                <ul>
                  {ROLE_TYPES.map((item) => (
                    <li key={item.role}><strong>{item.role}</strong> — {item.proof}</li>
                  ))}
                </ul>
              </WorkspaceBlock>
            </div>
          </div>
        </ProductLayout>
      </ContentRail>
    </WorldFrame>
  )
}
