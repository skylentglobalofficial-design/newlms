import { Link } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import WorldScene from '../components/world/WorldScenes'
import { PG_STUDIO, UG_STUDIO, programsByType } from '../skylent-worlds'

export default function DegreesPage() {
  const ug = programsByType('UNDERGRADUATE')
  const pg = programsByType('POSTGRADUATE')

  return (
    <WorldFrame world="university">
      <header className="world-hero">
        <div className="world-rail world-split">
          <div>
            <p className="world-kicker">University</p>
            <h1 className="world-title">Undergraduate and postgraduate are <em>different</em> studios.</h1>
            <p className="world-lede">
              Degrees, departments, curriculum, labs, and research — not a recycled skills hero. Programmes appear only when they exist in the catalogue.
            </p>
            <div className="world-actions">
              <a className="world-btn" href="#undergraduate">Undergraduate</a>
              <a className="world-btn-ghost" href="#postgraduate">Postgraduate</a>
            </div>
          </div>
          <WorldScene world="university" />
        </div>
      </header>

      <section className="world-section" id="undergraduate">
        <div className="world-rail">
          <p className="world-kicker">{UG_STUDIO.label}</p>
          <h2 className="world-title" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }}>A first degree is a curriculum you can follow.</h2>
          <ul className="world-flow">
            {UG_STUDIO.model.map((item) => <li key={item}>{item}</li>)}
          </ul>
          {ug.length ? (
            <div className="world-card-list" style={{ marginTop: 24 }}>
              {ug.map((program) => (
                <Link key={program.slug} className="world-card" to={`/programs/${program.slug}`}>
                  <b>{program.name}</b>
                  <p>{program.desc}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="world-empty">
              No undergraduate programmes are published in the catalogue yet. This studio stays visible so University has a place to live — it does not invent departments, faculty, or campuses.
            </p>
          )}
        </div>
      </section>

      <section className="world-section" id="postgraduate">
        <div className="world-rail">
          <p className="world-kicker">{PG_STUDIO.label}</p>
          <h2 className="world-title" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }}>A later degree is specialisation and research.</h2>
          <ul className="world-flow">
            {PG_STUDIO.model.map((item) => <li key={item}>{item}</li>)}
          </ul>
          {pg.length ? (
            <div className="world-card-list" style={{ marginTop: 24 }}>
              {pg.map((program) => (
                <Link key={program.slug} className="world-card" to={`/programs/${program.slug}`}>
                  <b>{program.name}</b>
                  <p>{program.desc}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="world-empty">
              No postgraduate programmes are published yet. Dissertation, faculty, and industry pathways will appear with real inventory — not placeholder degrees.
            </p>
          )}
          <div className="world-actions">
            <Link className="world-btn-ghost" to="/programs?type=UNDERGRADUATE">Undergraduate filter</Link>
            <Link className="world-btn-ghost" to="/programs?type=POSTGRADUATE">Postgraduate filter</Link>
            <Link className="world-btn-ghost" to="/skills">Professional skills live in Learn</Link>
          </div>
        </div>
      </section>
    </WorldFrame>
  )
}
