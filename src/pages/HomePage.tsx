import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import "./HomePageV2.css"

const pathStages = [
  ["01", "Understand", "Your education, experience, interests, constraints and starting point."],
  ["02", "Diagnose", "The gap between where you are and the direction you want to pursue."],
  ["03", "Build", "Only the learning, practice and projects that your path actually requires."],
  ["04", "Prove", "Evidence that you can show to universities, employers, collaborators or customers."],
  ["05", "Move", "The next opportunity: programme, internship, job, research, venture or a new direction."],
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
              <p className="sv2-kicker">SKYLENT · THE PATH LAYER</p>
              <h1>Don't start with a course.<br /><em>Start with your direction.</em></h1>
              <p className="sv2-lead">
                Skylent is being built to understand a person first — then connect education, skills, practice, evidence and opportunity around the path they actually want to take.
              </p>
              <div className="sv2-actions">
                <Link className="sv2-primary" to="/path">Find my path <span>→</span></Link>
                <Link className="sv2-secondary" to="/career-os">See Career OS <span>→</span></Link>
              </div>
              <p className="sv2-note">No course purchase is required to begin. The first product is understanding what you need next.</p>
            </div>

            <div className="sv2-diagnostic">
              <div className="sv2-diagnostic-top"><span>PATH DIAGNOSTIC</span><span>01 / 05</span></div>
              <div className="sv2-diagnostic-body">
                <p>What are you trying to change?</p>
                <h2>“I know I want to work in technology, but I don't know what I should do next.”</h2>
                <div className="sv2-chips">
                  <span>My education</span><span>My skills</span><span>My experience</span><span>My constraints</span>
                </div>
                <div className="sv2-diagnostic-footer"><b>Skylent Path</b><span>Build a direction before buying a course.</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sv2-section sv2-problem">
          <div className="sv2-container sv2-two-col">
            <div>
              <p className="sv2-kicker">THE PROBLEM</p>
              <h2>Education keeps selling the next thing. A person needs to know what comes next.</h2>
            </div>
            <div className="sv2-copy">
              <p>A student can find thousands of courses, degrees, certifications, coaching programmes and job listings. The hard part is knowing which combination is relevant to <strong>their</strong> situation.</p>
              <p>Skylent should sit above that catalogue. The platform should decide what is relevant first, then use courses, degrees, labs, exams, projects and opportunities as building blocks.</p>
            </div>
          </div>
        </section>

        <section className="sv2-section">
          <div className="sv2-container">
            <div className="sv2-section-head">
              <div><p className="sv2-kicker">THE CORE LOOP</p><h2>One path. Many ways to move.</h2></div>
              <p>Paths are not locked to one profession, one institution or one course provider.</p>
            </div>
            <div className="sv2-path-grid">
              {pathStages.map(([number, title, text]) => (
                <article key={number} className="sv2-path-card"><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="sv2-section sv2-ai">
          <div className="sv2-container sv2-ai-grid">
            <div>
              <p className="sv2-kicker">SKYLENT AI</p>
              <h2>AI should not just answer questions. It should understand the state of the person asking them.</h2>
              <p className="sv2-lead-small">The long-term product is a living learner model: education, skills, projects, evidence, goals and constraints continuously inform the next recommendation.</p>
              <Link className="sv2-text-link" to="/path">Start with the current path experience →</Link>
            </div>
            <div className="sv2-ai-panel">
              <div className="sv2-ai-line"><span>Current state</span><b>College · B.Tech · Year 2</b></div>
              <div className="sv2-ai-line"><span>Target</span><b>Data / product pathway</b></div>
              <div className="sv2-ai-line"><span>Detected gaps</span><b>Evidence · communication · applied practice</b></div>
              <div className="sv2-ai-line"><span>Next 90 days</span><b>Learn → practise → build → prove</b></div>
              <div className="sv2-ai-confidence">Illustrative product model · recommendations will be evidence-based as the system matures.</div>
            </div>
          </div>
        </section>

        <section className="sv2-section">
          <div className="sv2-container">
            <div className="sv2-section-head">
              <div><p className="sv2-kicker">NOT A COURSE CATALOGUE</p><h2>Courses become components of a path.</h2></div>
              <p>Skylent can recommend first-party programmes, partner education, open resources or real-world practice depending on what the learner actually needs.</p>
            </div>
            <div className="sv2-example-grid">
              {examples.map((example, index) => <div key={example} className="sv2-example"><span>0{index + 1}</span><strong>{example}</strong><em>path</em></div>)}
            </div>
          </div>
        </section>

        <section className="sv2-section sv2-proof">
          <div className="sv2-container sv2-two-col">
            <div><p className="sv2-kicker">THE OUTPUT</p><h2>Learning is not the final product. Capability that can be verified is.</h2></div>
            <div className="sv2-proof-stack">
              <div><span>LEARN</span><b>Knowledge and foundations</b></div>
              <div><span>PRACTICE</span><b>Deliberate application</b></div>
              <div><span>BUILD</span><b>Projects and real work</b></div>
              <div><span>PROVE</span><b>Evidence, portfolio and assessments</b></div>
            </div>
          </div>
        </section>

        <section className="sv2-section sv2-career">
          <div className="sv2-container sv2-career-grid">
            <div><p className="sv2-kicker">CAREER OS</p><h2>The path should continue after the classroom.</h2><p className="sv2-lead-small">Profile → evidence → opportunities → applications → interviews → next move. Career OS is the layer that turns a learner record into an ongoing professional system.</p></div>
            <Link className="sv2-career-card" to="/career-os"><span>OPEN CAREER OS</span><strong>Your evidence should travel with you.</strong><b>Explore →</b></Link>
          </div>
        </section>

        <section className="sv2-section sv2-institution">
          <div className="sv2-container sv2-two-col">
            <div><p className="sv2-kicker">THE NETWORK</p><h2>Skylent does not need to teach everything itself.</h2></div>
            <div className="sv2-copy"><p>Universities, colleges, companies, faculty, recruiters, labs and public institutions can become part of the path without changing the learner's starting point.</p><p>The platform remains the system that understands the learner and coordinates the journey.</p><Link className="sv2-text-link" to="/institutions">Explore institutions →</Link></div>
          </div>
        </section>

        <section className="sv2-final">
          <div className="sv2-container">
            <p className="sv2-kicker">SKYLENT</p>
            <h2>Where do you want to rise next?</h2>
            <p>Start with a direction. We'll build the path from there.</p>
            <Link className="sv2-primary" to="/path">Start your path <span>→</span></Link>
          </div>
        </section>
      </main>
    </PageShell>
  )
}
