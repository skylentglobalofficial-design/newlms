import { Link } from 'react-router-dom'

type World = {
  id: string
  index: string
  label: string
  purpose: string
  cta: string
  to: string
  tone: 'skills' | 'exams' | 'schooling' | 'university' | 'career'
}

const WORLDS: World[] = [
  {
    id: 'skills',
    index: '01',
    label: 'Skills',
    purpose: 'Build something you can use — then show it.',
    cta: 'Enter Skills',
    to: '/skills',
    tone: 'skills',
  },
  {
    id: 'exams',
    index: '02',
    label: 'Exams',
    purpose: 'Find the weak spot. Practice until it holds.',
    cta: 'Enter exam prep',
    to: '/education#competitive-exams',
    tone: 'exams',
  },
  {
    id: 'schooling',
    index: '03',
    label: 'Schooling',
    purpose: 'Explore a concept until it becomes clear.',
    cta: 'Enter schooling',
    to: '/education#schooling',
    tone: 'schooling',
  },
  {
    id: 'university',
    index: '04',
    label: 'University',
    purpose: 'Apply knowledge through coursework and projects.',
    cta: 'Enter university',
    to: '/education#undergraduate',
    tone: 'university',
  },
  {
    id: 'career',
    index: '05',
    label: 'Career',
    purpose: 'Turn evidence into a next professional step.',
    cta: 'Enter CareerOS',
    to: '/career-os',
    tone: 'career',
  },
]

function WorldArtifact({ tone }: { tone: World['tone'] }) {
  if (tone === 'skills') {
    return (
      <div className="gw-world-art gw-world-art--skills" aria-hidden="true">
        <span>Workspace</span>
        <code>SELECT region, quiet_days</code>
        <em>Draft analysis open</em>
      </div>
    )
  }
  if (tone === 'exams') {
    return (
      <div className="gw-world-art gw-world-art--exams" aria-hidden="true">
        <span>Practice item</span>
        <strong>Which constraint fails first under load?</strong>
        <em>Diagnose → attempt → review</em>
      </div>
    )
  }
  if (tone === 'schooling') {
    return (
      <div className="gw-world-art gw-world-art--schooling" aria-hidden="true">
        <span>Concept</span>
        <strong>Why does the path bend?</strong>
        <em>Observe → change → explain</em>
      </div>
    )
  }
  if (tone === 'university') {
    return (
      <div className="gw-world-art gw-world-art--university" aria-hidden="true">
        <span>Project brief</span>
        <strong>Week 6 · Methods lab</strong>
        <em>Apply · document · defend</em>
      </div>
    )
  }
  return (
    <div className="gw-world-art gw-world-art--career" aria-hidden="true">
      <span>Evidence</span>
      <strong>Profile · projects · next action</strong>
      <em>Ready when the work is</em>
    </div>
  )
}

export default function ExperienceWorlds() {
  return (
    <section className="home-worlds" aria-labelledby="home-worlds-heading">
      <div className="home-worlds-inner">
        <header className="home-worlds-copy">
          <div className="home-section-label"><span />Experience worlds</div>
          <h2 id="home-worlds-heading">
            Different doors.<br />
            Same <em>platform.</em>
          </h2>
          <p>
            Each experience has its own rhythm. Pick the one that matches what you need next.
          </p>
        </header>

        <div className="home-worlds-list">
          {WORLDS.map(world => (
            <article key={world.id} className={`home-world home-world--${world.tone}`}>
              <div className="home-world-meta">
                <span aria-hidden="true">{world.index}</span>
                <h3>{world.label}</h3>
                <p>{world.purpose}</p>
                <Link to={world.to} className="home-world-cta">
                  {world.cta} <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <WorldArtifact tone={world.tone} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
