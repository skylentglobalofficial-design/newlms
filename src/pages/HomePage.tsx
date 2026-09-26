import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import HomeHeroVisual from "../components/home/HomeHeroVisual"
import SkylentHomeGoals from "../components/home/SkylentHomeGoals"
import SkylentHomeEvidence from "../components/home/SkylentHomeEvidence"
import SkylentHomeCatalogue from "../components/home/SkylentHomeCatalogue"
import SkylentHomeCareerOS from "../components/home/SkylentHomeCareerOS"
import SkylentHomeEducation from "../components/home/SkylentHomeEducation"
import SkylentHomeOSArchitecture from "../components/home/SkylentHomeOSArchitecture"
import SkylentHomeFinal from "../components/home/SkylentHomeFinal"
import "./HomePage.css"
import "../components/home/SkylentHomeChapters.css"

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        <section className="home-hero" aria-labelledby="home-hero-title">
          <div className="home-wrap home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-eyebrow">Learn with purpose</p>
              <h1 id="home-hero-title">Build what matters next.</h1>
              <p className="home-hero-lead">
                Structured learning, applied practice and real projects — designed to help you move from understanding something to actually doing it.
              </p>
              <ul className="home-hero-points">
                <li>
                  <span className="home-point-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </span>
                  <span>
                    <strong>Career-focused learning</strong>
                    Work on real-world projects.
                  </span>
                </li>
                <li>
                  <span className="home-point-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-3"/></svg>
                  </span>
                  <span>
                    <strong>Placement support</strong>
                    Get job-ready with guided preparation.
                  </span>
                </li>
                <li>
                  <span className="home-point-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a3 3 0 0 1 0 5.75"/></svg>
                  </span>
                  <span>
                    <strong>A growing community</strong>
                    Learn and collaborate with peers.
                  </span>
                </li>
              </ul>
              <div className="home-cta-row">
                <Link className="home-cta home-cta-primary" to="/programs">
                  Explore programmes <span aria-hidden="true">→</span>
                </Link>
                <Link className="home-cta home-cta-secondary" to="/courses">
                  Explore courses <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <HomeHeroVisual />
          </div>
          <div className="home-logo-row">
            <p>Learn skills used by teams at</p>
            <ul>
              <li>Google</li>
              <li>Microsoft</li>
              <li>Amazon</li>
              <li>Meta</li>
              <li>Adobe</li>
              <li>Flipkart</li>
              <li>Infosys</li>
            </ul>
          </div>
        </section>

        <SkylentHomeGoals />
        <SkylentHomeEvidence />
        <SkylentHomeCatalogue />
        <SkylentHomeCareerOS />
        <SkylentHomeEducation />
        <SkylentHomeOSArchitecture />
        <SkylentHomeFinal />
      </div>
    </PageShell>
  )
}
