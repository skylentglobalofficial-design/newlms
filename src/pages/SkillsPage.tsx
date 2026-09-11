import { Link } from 'react-router-dom'
import WorldFrame from '../components/world/WorldFrame'
import WorldScene from '../components/world/WorldScenes'
import { ProductVisual } from '../components/product/ProductVisuals'
import { programs, workshops } from '../data'
import { PG_STUDIO, UG_STUDIO, programsByType } from '../skylent-worlds'

const PROFESSIONAL = programs.filter((p) => p.programType === 'PROFESSIONAL')
const CERTIFICATES = programs.filter((p) => p.programType === 'CERTIFICATE')

export default function SkillsPage() {
  const featured = PROFESSIONAL.find((p) => p.slug === 'data-science-ai') ?? PROFESSIONAL[0]
  const rest = PROFESSIONAL.filter((p) => p.slug !== featured?.slug)
  const cert = CERTIFICATES[0]
  const ugCount = programsByType('UNDERGRADUATE').length
  const pgCount = programsByType('POSTGRADUATE').length

  return (
    <WorldFrame world="learn">
      <header className="world-hero">
        <div className="world-rail world-split">
          <div>
            <p className="world-kicker">Learn</p>
            <h1 className="world-title">Build skills you can show.</h1>
            <p className="world-lede">
              Professional programmes, certificates, short courses, webinars, projects, and practice. The work is learn → practice → build → prove → move — not a slogan wall.
            </p>
            <ul className="world-flow" aria-label="Skills loop">
              <li>Learn</li>
              <li>Practice</li>
              <li>Build</li>
              <li>Prove</li>
              <li>Move</li>
            </ul>
            <div className="world-actions">
              <a className="world-btn" href="#professional">Professional programmes</a>
              <Link className="world-btn-ghost" to="/programs?type=PROFESSIONAL">Catalogue</Link>
            </div>
          </div>
          <div style={{ minHeight: 280 }}>
            <ProductVisual id="skills-workspace" themeId="professional" style={{ height: '100%', minHeight: 280 }} />
          </div>
        </div>
      </header>

      <section className="world-section" id="professional">
        <div className="world-rail">
          <p className="world-kicker">Professional programmes</p>
          <h2 className="world-title" style={{ fontSize: 'clamp(26px, 3vw, 36px)', maxWidth: '18ch' }}>Long enough to produce evidence.</h2>
          <div className="world-card-list" style={{ marginTop: 22 }}>
            {featured && (
              <Link className="world-card" to={`/programs/${featured.slug}`}>
                <span className="world-status">Featured</span>
                <b>{featured.name}</b>
                <p>{featured.desc}</p>
                <span className="world-meta">{featured.duration} · {featured.projects} projects · {featured.format}</span>
              </Link>
            )}
            {rest.map((program) => (
              <Link key={program.slug} className="world-card" to={`/programs/${program.slug}`}>
                <b>{program.name}</b>
                <p>{program.desc}</p>
                <span className="world-meta">{program.duration} · {program.level}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="world-section" id="certificate">
        <div className="world-rail world-split">
          <div>
            <p className="world-kicker">Certificates</p>
            <h2 className="world-title" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }}>A credential you can finish.</h2>
            {cert ? (
              <>
                <p className="world-lede">{cert.name}. {cert.desc}</p>
                <div className="world-actions">
                  <Link className="world-btn" to={`/programs/${cert.slug}`}>Open {cert.name}</Link>
                </div>
              </>
            ) : (
              <p className="world-empty">No certificate programmes are published yet.</p>
            )}
          </div>
          <WorldScene world="learn" />
        </div>
      </section>

      <section className="world-section" id="webinars">
        <div className="world-rail">
          <p className="world-kicker">Webinars</p>
          <p className="world-lede">Sessions in the catalogue. Dates are as published — this is not a fake events calendar.</p>
          <div className="world-card-list" style={{ marginTop: 20 }}>
            {workshops.slice(0, 4).map((workshop) => (
              <Link key={workshop.slug} className="world-card" to={`/workshops/${workshop.slug}`}>
                <b>{workshop.title}</b>
                <p>{workshop.desc}</p>
                <span className="world-meta">{workshop.date} · {workshop.duration} · {workshop.mode}</span>
              </Link>
            ))}
          </div>
          <div className="world-actions">
            <Link className="world-btn-ghost" to="/workshops">All webinars</Link>
          </div>
        </div>
      </section>

      <section className="world-section" id="practice">
        <div className="world-rail world-split">
          <div className="world-panel" style={{ padding: 20 }}>
            <p className="world-kicker">Practice & tools</p>
            <p className="world-note">Projects live inside programmes. Labs are for experiments. CareerOS is where proof becomes applications — after you have something to show.</p>
            <div className="world-actions">
              <Link className="world-btn-ghost" to="/labs">Labs</Link>
              <Link className="world-btn-ghost" to="/career">Career hub</Link>
            </div>
          </div>
          <div className="world-panel" style={{ padding: 20 }}>
            <p className="world-kicker">Not this world</p>
            <p className="world-note">
              Undergraduate ({ugCount} published) and postgraduate ({pgCount} published) belong in University. {UG_STUDIO.label} and {PG_STUDIO.label} are not professional certificates with new labels.
            </p>
            <Link className="world-btn-ghost" to="/degrees">Open University</Link>
          </div>
        </div>
      </section>
    </WorldFrame>
  )
}
