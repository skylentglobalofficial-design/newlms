import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { ACADEMIC_LINES } from "../lib/product-architecture"
import "./HomePage.css"

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="hp-label">
      <span />
      {children}
    </div>
  )
}

const journeyStages = [
  {
    id: "schooling",
    title: ACADEMIC_LINES[0].label,
    line: "School years, with families able to follow along.",
    to: ACADEMIC_LINES[0].to,
    live: false,
  },
  {
    id: "undergraduate",
    title: ACADEMIC_LINES[1].label,
    line: "A first university degree, taken one stage at a time.",
    to: ACADEMIC_LINES[1].to,
    live: false,
  },
  {
    id: "postgraduate",
    title: ACADEMIC_LINES[2].label,
    line: "Further study after a first degree.",
    to: ACADEMIC_LINES[2].to,
    live: false,
  },
  {
    id: "exams",
    title: "Examinations",
    line: "Preparation for papers such as JEE, NEET, and CAT.",
    to: ACADEMIC_LINES[3].to,
    live: false,
  },
  {
    id: "skills",
    title: "Skills",
    line: "Programmes and courses you can start now.",
    to: "/skills",
    live: true,
  },
  {
    id: "opportunity",
    title: "Opportunity",
    line: "What you might do next with what you have learned.",
    to: "/career-os",
    live: true,
  },
] as const

const startPoints = [
  { label: "Schooling", prompt: "I am in school", to: "/education/schooling", live: false },
  { label: "Undergraduate", prompt: "I am doing a first degree", to: "/education/undergraduate", live: false },
  { label: "Postgraduate", prompt: "I am studying after a degree", to: "/education/postgraduate", live: false },
  { label: "Examination", prompt: "I am preparing for an exam", to: "/education/exams", live: false },
  { label: "Skills", prompt: "I want to build a skill", to: "/skills", live: true },
] as const

const progressSteps = [
  { n: "01", title: "Learn", copy: "Lessons and practice in enrolled courses." },
  { n: "02", title: "Build", copy: "Projects and artefacts you keep." },
  { n: "03", title: "Probe", copy: "Quizzes and assignments that check understanding." },
  { n: "04", title: "Move", copy: "Career OS records what you completed." },
] as const

const outcomes = [
  { title: "Career", copy: "Take learned work toward roles when they are published.", to: "/career-os" },
  { title: "Further study", copy: "Continue into the next academic stage when it opens.", to: "/education/undergraduate" },
  { title: "Building something", copy: "Turn study into something you can show.", to: "/programs" },
  { title: "Community", copy: "Join workshops and stories when they are published.", to: "/stories" },
] as const

function JourneyConnectors() {
  return (
    <svg className="hp-u-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path
        className="hp-u-line"
        d="M 16.7 16.7 H 50 H 83.3 V 50 H 50 H 16.7 V 83.3"
        fill="none"
        stroke="rgba(21,23,26,0.2)"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
      <path
        className="hp-u-travel"
        d="M 16.7 16.7 H 50 H 83.3 V 50 H 50 H 16.7 V 83.3"
        fill="none"
        stroke="#4F46E5"
        strokeWidth="0.7"
        strokeDasharray="4 18"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function HeroJourneyVisual() {
  return (
    <figure className="hp-hero-visual">
      <ol className="hp-u hp-u-hero" aria-label="From schooling to opportunity">
        <JourneyConnectors />
        <li className="hp-u-schooling"><span>Schooling</span></li>
        <li className="hp-u-undergraduate"><span>Undergraduate</span></li>
        <li className="hp-u-postgraduate"><span>Postgraduate</span></li>
        <li className="hp-u-exams"><span>Examinations</span></li>
        <li className="hp-u-skills"><span>Skills</span></li>
        <li className="hp-u-opportunity"><span>Opportunity</span></li>
      </ol>
    </figure>
  )
}

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="home-p1">
        <section className="hp-hero">
          <div className="hp-rail hp-hero-grid">
            <div className="hp-hero-copy">
              <SectionLabel>Education · Skills · Opportunity</SectionLabel>
              <h1>One connected journey.</h1>
              <p>
                Start from school, university, an exam, or a skill. Then keep going. These are stages of one path, not separate departments.
              </p>
              <div className="hp-actions">
                <Link className="hp-btn hp-btn-primary" to="/skills">
                  Start with skills
                </Link>
                <a className="hp-btn hp-btn-ghost" href="#journey">
                  See the path
                </a>
              </div>
              <p className="hp-hero-note">
                Skills programmes and courses are live. School, university, and exam paths are coming soon.
              </p>
            </div>
            <HeroJourneyVisual />
          </div>
        </section>

        <section id="journey" className="hp-band">
          <div className="hp-rail">
            <SectionLabel>One connected journey</SectionLabel>
            <h2 className="hp-h2">A path, not a catalogue of silos.</h2>
            <ol className="hp-u hp-u-detail">
              <JourneyConnectors />
              {journeyStages.map((stage) => (
                <li key={stage.id} className={`hp-u-${stage.id}`}>
                  <Link to={stage.to} className="hp-u-card">
                    <span className="hp-u-stop">
                      <strong>{stage.title}</strong>
                      <em className={stage.live ? "is-live" : "is-soon"}>{stage.live ? "Live" : "Coming soon"}</em>
                    </span>
                    <span className="hp-u-note">{stage.line}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="start" className="hp-section">
          <div className="hp-rail">
            <SectionLabel>Start where you are</SectionLabel>
            <h2 className="hp-h2">Where do I start?</h2>
            <p className="hp-lead">Choose the stage that matches you now.</p>
            <nav className="hp-start" aria-label="Starting points">
              {startPoints.map((point, index) => (
                <Link
                  key={point.label}
                  to={point.to}
                  className={`hp-start-item${point.live ? " is-open" : ""}`}
                >
                  <span className="hp-start-n">{String(index + 1).padStart(2, "0")}</span>
                  <span className="hp-start-copy">
                    <strong>{point.label}</strong>
                    <span>{point.prompt}</span>
                  </span>
                  <em className={point.live ? "is-live" : "is-soon"}>{point.live ? "Open now" : "Coming soon"}</em>
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <section className="hp-section hp-section-alt">
          <div className="hp-rail">
            <SectionLabel>Progress with purpose</SectionLabel>
            <h2 className="hp-h2">Learn → Build → Probe → Move</h2>
            <div className="hp-progress" aria-label="How progress works on Skylent">
              <div className="hp-progress-rail" aria-hidden="true">
                <i />
              </div>
              <ol className="hp-progress-steps">
                {progressSteps.map((step) => (
                  <li key={step.title}>
                    <span>{step.n}</span>
                    <strong>{step.title}</strong>
                    <p>{step.copy}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="hp-section hp-outcomes-section">
          <div className="hp-rail">
            <SectionLabel>What learning can lead to</SectionLabel>
            <h2 className="hp-h2">I learned something. What now?</h2>
            <ul className="hp-outcomes">
              {outcomes.map((item) => (
                <li key={item.title}>
                  <Link to={item.to}>
                    <strong>{item.title}</strong>
                    <span>{item.copy}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="hp-fine">Skylent does not promise jobs or placements.</p>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
