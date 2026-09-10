import { Link } from 'react-router-dom'

const ARTIFACTS = [
  {
    kind: 'Project',
    title: 'Retention analysis notebook',
    body: 'Query, interpretation, and one recommended experiment.',
    meta: 'Representative Skills output',
  },
  {
    kind: 'Assessment',
    title: 'Practice set · reviewed',
    body: 'Attempts with specific feedback — not a completion tick.',
    meta: 'Representative exam / practice output',
  },
  {
    kind: 'Evidence',
    title: 'Work ready to attach',
    body: 'Something a profile, faculty review, or next step can use.',
    meta: 'Representative CareerOS input',
  },
]

export default function LearnersMake() {
  return (
    <section className="home-make" aria-labelledby="home-make-heading">
      <div className="home-make-inner">
        <header className="home-make-copy">
          <div className="home-section-label"><span />What learners make</div>
          <h2 id="home-make-heading">
            The point is the <em>work.</em>
          </h2>
          <p>
            Projects, assessed practice, and evidence — shown here as representative product shapes,
            not claims about results.
          </p>
        </header>

        <div className="home-make-grid">
          {ARTIFACTS.map(item => (
            <article key={item.title} className="home-make-card">
              <span>{item.kind}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <em>{item.meta}</em>
            </article>
          ))}
        </div>

        <p className="home-make-note">
          Examples illustrate product structure. They are not learner statistics or placement claims.
        </p>
        <Link className="home-secondary-button" to="/skills">
          See Skills paths <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  )
}
