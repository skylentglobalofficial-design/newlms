import { Link } from 'react-router-dom'
import { PageShell } from '../components/shared'
import WorldScene from '../components/world/WorldScenes'
import { WORLD_DOORS } from '../skylent-worlds'

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="home-worlds">
        <header className="home-worlds-hero">
          <div className="world-rail">
            <p className="world-kicker">Skylent</p>
            <h1 className="home-worlds-title">What are you here for?</h1>
            <p className="home-worlds-lede">
              One platform. Six different working experiences — pick the one that matches your job to be done.
            </p>
          </div>
        </header>

        <div className="world-rail">
          <nav className="home-world-grid" aria-label="Skylent destinations">
            {WORLD_DOORS.map((door) => (
              <Link key={door.id} to={door.href} className="home-world-door" data-world={door.id}>
                <WorldScene world={door.id} compact />
                <div>
                  <h2>{door.label}</h2>
                  <p>{door.question}</p>
                </div>
                <span className="world-status">{door.promise}</span>
              </Link>
            ))}
          </nav>
          <p className="home-worlds-note">
            Same account, catalogue, LMS, and backend. The interface changes because a class 8 student, a JEE aspirant, and an institution admin are not doing the same work.
          </p>
        </div>
      </div>
    </PageShell>
  )
}
