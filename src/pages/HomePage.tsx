import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import "./HomePageV2.css"

const pathStages = [
  ["01", "Understand", "Where you are today — education, work, interests and constraints."],
  ["02", "Diagnose", "The gap between your starting point and the direction you want."],
  ["03", "Learn", "Only the concepts and coursework your path actually requires."],
  ["04", "Practice", "Deliberate application — not passive video consumption."],
  ["05", "Build", "Projects and real work that match your target direction."],
  ["06", "Prove", "Evidence, portfolios and assessments others can evaluate."],
  ["07", "Opportunity", "Programmes, roles, exams or experiments — chosen from proof."],
]

const examples = [
  "Product management",
  "Data & AI",
  "Engineering",
  "Research",
  "Design",
  "Business",
  "Competitive exams",
  "Something I haven't figured out yet",
]

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <main className="skylent-home-v2">
        <section className="sv2-hero">
          <div className="sv2-container sv2-hero-grid">
            <div>
              <p className="sv2-kicker">SKYLENT · EDUCATION + CAREER PATH SYSTEM</p>
              <h1>
                You don't always need another course.
                <br />
                <em>Start with your path.</em>
              </h1>
              <p className="sv2-lead">
                Skylent is a long-term system for understanding where you are, where you want to go, what is missing, and what you should do next — then connecting learning, practice, evidence and opportunity around that path.
              </p>
              <p className="sv2-lead" style={{ marginTop: 18, fontSize: 16 }}>
                First understand your position. Diagnose the gap. Only then learn, practise, build, prove, and move toward the next opportunity.
              </p>
              <div className="sv2-actions">
                <Link className="sv2-primary" to="/path">
                  Start Your Path <span>→</span>
                </Link>
                <Link className="sv2-secondary" to="/programmes">
                  Explore programmes <span>→</span>
                </Link>
              </div>
              <p className="sv2-note">No enrolment required. The path diagnostic runs in your browser and saves locally.</p>
            </div>

            <div className="sv2-diagnostic">
              <div className="sv2-diagnostic-top">
                <span>PATH DIAGNOSTIC</span>
                <span>7 STAGES</span>
              </div>
              <div className="sv2-diagnostic-body">
                <p>What should you do next?</p>
                <h2>"I could take another course — but I still don't know if it's the right move."</h2>
                <div className="sv2-chips">
                  <span>Where I am</span>
                  <span>Where I'm going</span>
                  <span>What's missing</span>
                  <span>Next action</span>
                </div>
                <div className="sv2-diagnostic-footer">
                  <b>Skylent Path</b>
                  <span>Diagnose before you buy.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sv2-section sv2-problem">
          <div className="sv2-container sv2-two-col">
            <div>
              <p className="sv2-kicker">THE PROBLEM</p>
              <h2>Catalogues sell the next thing. People need to know what comes next.</h2>
            </div>
            <div className="sv2-copy">
              <p>
                Courses, degrees, certifications and job boards are easy to find. The hard part is knowing which combination fits <strong>your</strong> situation — and in what order.
              </p>
              <p>
                Skylent sits above the catalogue: understand, diagnose, then use programmes, labs, exams and Career OS as building blocks on a path you can explain.
              </p>
            </div>
          </div>
        </section>

        <section className="sv2-section">
          <div className="sv2-container">
            <div className="sv2-section-head">
              <div>
                <p className="sv2-kicker">THE PATH LOOP</p>
                <h2>Understand → Diagnose → Learn → Practice → Build → Prove → Opportunity</h2>
              </div>
              <p>One coherent path. Programmes and courses are components — not the starting point.</p>
            </div>
            <div className="sv2-path-grid">
              {pathStages.map(([number, title, text]) => (
                <article key={number} className="sv2-path-card">
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sv2-section sv2-ai">
          <div className="sv2-container sv2-ai-grid">
            <div>
              <p className="sv2-kicker">HONEST RECOMMENDATIONS</p>
              <h2>Your path should be built from your state — not from a chatbot persona.</h2>
              <p className="sv2-lead-small">
                Today, Skylent Path uses a transparent, deterministic roadmap from your answers. Later, the same interface can call a real recommendation service — still grounded in evidence, never fake placement promises.
              </p>
              <Link className="sv2-text-link" to="/path">
                Run the path diagnostic →
              </Link>
            </div>
            <div className="sv2-ai-panel">
              <div className="sv2-ai-line">
                <span>Current position</span>
                <b>College · exploring data & product</b>
              </div>
              <div className="sv2-ai-line">
                <span>Target</span>
                <b>Credible portfolio toward a first role</b>
              </div>
              <div className="sv2-ai-line">
                <span>Missing</span>
                <b>Applied practice · visible evidence</b>
              </div>
              <div className="sv2-ai-line">
                <span>Next action</span>
                <b>One bounded project, saved as proof</b>
              </div>
              <div className="sv2-ai-confidence">Illustrative · your result comes from your answers, stored locally as skylent-path-v1.</div>
            </div>
          </div>
        </section>

        <section className="sv2-section">
          <div className="sv2-container">
            <div className="sv2-section-head">
              <div>
                <p className="sv2-kicker">NOT A MARKETPLACE</p>
                <h2>Programmes support the path — they don't replace it.</h2>
              </div>
              <p>When structured learning is the right block, Skylent programmes are one execution option among labs, open resources and real-world practice.</p>
            </div>
            <div className="sv2-example-grid">
              {examples.map((example, index) => (
                <div key={example} className="sv2-example">
                  <span>0{index + 1}</span>
                  <strong>{example}</strong>
                  <em>path</em>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sv2-section sv2-proof">
          <div className="sv2-container sv2-two-col">
            <div>
              <p className="sv2-kicker">THE OUTPUT</p>
              <h2>Learning is not the final product. Capability you can show is.</h2>
            </div>
            <div className="sv2-proof-stack">
              <div>
                <span>LEARN</span>
                <b>Only what the gap requires</b>
              </div>
              <div>
                <span>PRACTICE</span>
                <b>Deliberate application</b>
              </div>
              <div>
                <span>BUILD</span>
                <b>Projects and real work</b>
              </div>
              <div>
                <span>PROVE</span>
                <b>Evidence and assessments</b>
              </div>
            </div>
          </div>
        </section>

        <section className="sv2-section sv2-career">
          <div className="sv2-container sv2-career-grid">
            <div>
              <p className="sv2-kicker">CAREER OS</p>
              <h2>The path continues after the classroom.</h2>
              <p className="sv2-lead-small">
                Profile → evidence → opportunities → applications → interviews. Career OS carries proof forward — it does not guarantee jobs.
              </p>
            </div>
            <Link className="sv2-career-card" to="/career-os">
              <span>OPEN CAREER OS</span>
              <strong>Your evidence should travel with you.</strong>
              <b>Explore →</b>
            </Link>
          </div>
        </section>

        <section className="sv2-section sv2-institution">
          <div className="sv2-container sv2-two-col">
            <div>
              <p className="sv2-kicker">THE NETWORK</p>
              <h2>Skylent does not need to teach everything itself.</h2>
            </div>
            <div className="sv2-copy">
              <p>Universities, colleges, companies, faculty, recruiters, labs and public institutions can join the path without changing where the learner starts.</p>
              <p>The platform remains the system that understands the learner and coordinates the journey.</p>
              <Link className="sv2-text-link" to="/institutions">
                Explore institutions →
              </Link>
            </div>
          </div>
        </section>

        <section className="sv2-final">
          <div className="sv2-container">
            <p className="sv2-kicker">SKYLENT</p>
            <h2>Where do you want to rise next?</h2>
            <p>Understand first. Then learn, build, and prove on purpose.</p>
            <Link className="sv2-primary" to="/path">
              Start Your Path <span>→</span>
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
