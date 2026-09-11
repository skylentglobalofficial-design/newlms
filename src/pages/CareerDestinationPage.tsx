import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import WorldFrame from '../components/world/WorldFrame'
import WorldScene from '../components/world/WorldScenes'

const ACTIONS = [
  { label: 'Jobs', href: '/career-os/jobs', detail: 'Search and apply inside CareerOS — live listings are not invented on this page.' },
  { label: 'Interviews', href: '/career-os/interviews', detail: 'Prepare and track interviews you actually have.' },
  { label: 'Evidence', href: '/skills', detail: 'Projects and programmes that produce proof you can show.' },
  { label: 'Profile', href: '/career-os/profile', detail: 'Keep a working profile before you send applications.' },
  { label: 'Applications', href: '/career-os/applications', detail: 'Follow work you have applied to — not a decorative pipeline.' },
  { label: 'CareerOS', href: '/career-os', detail: 'The authenticated career workspace. Sign in if you are not already.' },
]

const ROLE_TYPES = [
  { role: 'Data analyst', proof: 'SQL, dashboards, a dataset you can explain' },
  { role: 'Software developer', proof: 'Shipped project, readable logs, working repo' },
  { role: 'Product analyst', proof: 'Metrics, a case, a recommendation' },
]

export default function CareerDestinationPage() {
  const { user } = useAuth()
  const osHref = user ? '/career-os' : '/login?returnTo=%2Fcareer-os'

  return (
    <WorldFrame world="career">
      <header className="world-hero">
        <div className="world-rail world-split">
          <div>
            <p className="world-kicker">Career</p>
            <h1 className="world-title">What can I do next?</h1>
            <p className="world-lede">
              A public action hub: jobs, interviews, evidence, profile, applications, tools. CareerOS stays behind sign-in. This page is not a login wall.
            </p>
            <div className="world-actions">
              <Link className="world-btn" to={osHref}>{user ? 'Open CareerOS' : 'Sign in to CareerOS'}</Link>
              <Link className="world-btn-ghost" to="/skills">Build evidence first</Link>
            </div>
          </div>
          <WorldScene world="career" />
        </div>
      </header>

      <section className="world-section" id="next">
        <div className="world-rail">
          <p className="world-kicker">Next actions</p>
          <div className="world-card-list">
            {ACTIONS.map((action) => (
              <Link key={action.label} className="world-card" to={action.label === 'CareerOS' ? osHref : (action.href.startsWith('/career-os') && !user ? osHref : action.href)}>
                <b>{action.label}</b>
                <p>{action.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="world-section" id="jobs">
        <div className="world-rail world-split">
          <div>
            <p className="world-kicker">Roles people prepare for</p>
            <h2 className="world-title" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }}>No invented employers here.</h2>
            <p className="world-lede">
              These are role types, not live partner jobs. Applications and listings belong in CareerOS when you have access.
            </p>
            <ul className="world-card-list" style={{ marginTop: 20 }}>
              {ROLE_TYPES.map((item) => (
                <li key={item.role} className="world-card">
                  <b>{item.role}</b>
                  <p>{item.proof}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="world-panel" style={{ padding: 20 }}>
            <p className="world-kicker">Tools</p>
            <p className="world-note">Interview practice, applications, and profile editing stay in CareerOS so this public page cannot fake a hiring market.</p>
            <div className="world-actions">
              <Link className="world-btn" to={osHref}>Continue in CareerOS</Link>
            </div>
          </div>
        </div>
      </section>
    </WorldFrame>
  )
}
