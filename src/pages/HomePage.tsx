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
