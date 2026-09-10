import { Link } from 'react-router-dom'

const FLOW = [
  { label: 'Programme', copy: 'What you deliver' },
  { label: 'Faculty', copy: 'Who guides the work' },
  { label: 'Learners', copy: 'Who is progressing' },
  { label: 'Projects', copy: 'What gets produced' },
  { label: 'Progress', copy: 'What needs attention' },
]

export default function InstitutionsDoorway() {
  return (
    <section className="home-institutions-door" aria-labelledby="home-institutions-door-heading">
      <div className="home-institutions-door-inner">
        <div className="home-institutions-door-copy">
          <div className="home-section-label"><span />For institutions</div>
          <h2 id="home-institutions-door-heading">
            Run learning as an<br />
            <em>operation.</em>
          </h2>
          <p>
            Skylent OS connects programme delivery to faculty work, learner progress, and project
            review — using what the platform already supports.
          </p>
          <div className="home-institutions-door-actions">
            <Link className="home-primary-button" to="/institutions">
              Institutions overview <span aria-hidden="true">↗</span>
            </Link>
            <Link className="home-secondary-button" to="/os">
              Explore Skylent OS
            </Link>
          </div>
        </div>

        <div className="home-institutions-door-panel" aria-label="Institutional flow">
          <div className="home-institutions-door-rail">
            <span>Operational path</span>
            <span>No fabricated metrics</span>
          </div>
          <ol>
            {FLOW.map(item => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.copy}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
