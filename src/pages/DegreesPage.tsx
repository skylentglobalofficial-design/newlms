import { Link } from 'react-router-dom'
import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, StatusPill, ButtonLink, Note } from '../design/primitives'
import { resolveAcademicStages, type ResolvedStream } from '../lib/academic-streams'
import '../design/education.css'

const STRUCTURE = {
  undergraduate: 'Degree → Year → Semester → Subject → Module',
  postgraduate: 'Programme → Term → Specialisation → Case → Project',
} as const

function Stream({ stream }: { stream: ResolvedStream }) {
  return (
    <article className="sk-degree-row">
      <div className="sk-edu-row-id">
        <strong>{stream.abbr}</strong>
        <span>{stream.name}</span>
      </div>
      <p>{stream.audience}</p>
      <div className="sk-degree-row-status">
        <StatusPill availability={stream.availability} size="sm" />
        <Link to={stream.href}>
          {stream.availability.ctaLabel} →
        </Link>
      </div>
    </article>
  )
}

export default function DegreesPage() {
  const stages = resolveAcademicStages().filter(stage => stage.id === 'undergraduate' || stage.id === 'postgraduate')

  return (
    <ProductShell className="sk-edu">
      <Rail>
        <PageHeader
          eyebrow="Degrees"
          title="Undergraduate and postgraduate are different jobs."
          lead="These are academic categories, not Skylent-awarded degrees. Nothing in either stage is open to enrol."
          actions={<ButtonLink to="/education" variant="secondary">Full education map</ButtonLink>}
        />

        <Note tone="caution">
          Skylent is not a university and does not award B.Tech, BCA, MBA or MCA qualifications.
        </Note>

        <div className="sk-degrees-stack">
          {stages.map(stage => (
            <section key={stage.id} id={stage.id} className={`sk-degree-stage is-${stage.id}`}>
              <p className="sk-degree-kicker">
                {stage.id === 'postgraduate' ? 'Specialisation · cases · projects' : 'Degree pathway'}
              </p>
              <h2>{stage.label}</h2>
              <p className="sk-edu-structure">
                {stage.id === 'postgraduate' ? STRUCTURE.postgraduate : STRUCTURE.undergraduate}
              </p>
              <p>{stage.intro}</p>
              {stage.streams.map(stream => (
                <Stream key={stream.id} stream={stream} />
              ))}
            </section>
          ))}
        </div>
      </Rail>
    </ProductShell>
  )
}
