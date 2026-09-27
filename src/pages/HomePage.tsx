import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import SkylentHomeGoals from "../components/home/SkylentHomeGoals"
import SkylentHomeEvidence from "../components/home/SkylentHomeEvidence"
import SkylentHomeCareerOS from "../components/home/SkylentHomeCareerOS"
import SkylentHomeEducation from "../components/home/SkylentHomeEducation"
import SkylentHomeOSArchitecture from "../components/home/SkylentHomeOSArchitecture"
import SkylentHomeFinal from "../components/home/SkylentHomeFinal"
import "./HomePage.css"
import "./HomePathHero.css"
import "../components/home/SkylentHomeChapters.css"

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        <section className="home-hero home-path-hero" aria-labelledby="home-hero-title">
          <div className="home-wrap home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-eyebrow">SKYLENT · YOUR PATH</p>
              <h1 id="home-hero-title">Don't start with a course.<br />Start with your direction.</h1>
              <p className="home-hero-lead">
                Skylent helps you understand where you are, where you want to go, what is missing, and what to do next — across learning, practice, evidence and opportunity.
              </p>
              <div className="home-cta-row">
                <Link className="home-cta home-cta-primary" to="/path">
                  Start your path <span aria-hidden="true">→</span>
                </Link>
                <Link className="home-cta home-cta-secondary" to="/career-os">
                  Explore Career OS <span aria-hidden="true">→</span>
                </Link>
              </div>
              <p className="home-path-note">You are not choosing a course yet. You are choosing what you want to become capable of.</p>
            </div>
            <div className="home-path-map" aria-label="Skylent path model">
              <div className="home-path-map-head"><span>SKYLENT PATH</span><span>01 → 06</span></div>
              <div className="home-path-map-line">
                {["Where you are", "Where you want to go", "What is missing", "Learn + practise", "Build + prove", "Next opportunity"].map((item, index) => (
                  <div className="home-path-node" key={item}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <SkylentHomeGoals />
        <SkylentHomeEvidence />
        <SkylentHomeCareerOS />
        <SkylentHomeEducation />
        <SkylentHomeOSArchitecture />
        <SkylentHomeFinal />
      </div>
    </PageShell>
  )
}
