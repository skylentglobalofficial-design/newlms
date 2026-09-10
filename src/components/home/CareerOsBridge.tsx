import { Link } from 'react-router-dom'

const BRIDGE = [
  { step: '01', label: 'Learning', copy: 'Capability from lessons and practice' },
  { step: '02', label: 'Work', copy: 'Projects and assessed output' },
  { step: '03', label: 'Evidence', copy: 'Artifacts you can show' },
  { step: '04', label: 'Opportunity', copy: 'Profile, jobs, and next actions' },
]

export default function CareerOsBridge() {
  return (
    <section className="home-career-bridge" aria-labelledby="home-career-bridge-heading">
      <div className="home-career-bridge-inner">
        <header>
          <div className="home-section-label"><span />CareerOS</div>
          <h2 id="home-career-bridge-heading">
            Learning continues into<br />
            <em>career action.</em>
          </h2>
          <p>
            CareerOS is where evidence meets the next step — profile, applications, interviews, and
            support — without inventing outcomes.
          </p>
          <Link className="home-light-button" to="/career-os">
            Open CareerOS <span aria-hidden="true">↗</span>
          </Link>
        </header>

        <ol className="home-career-bridge-flow" aria-label="Learning to opportunity">
          {BRIDGE.map(item => (
            <li key={item.step}>
              <span>{item.step}</span>
              <strong>{item.label}</strong>
              <small>{item.copy}</small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
