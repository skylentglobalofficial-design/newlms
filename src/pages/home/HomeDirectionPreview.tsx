/**
 * Isolated visual preview for a white-and-purple homepage direction.
 * Not mounted on "/" and not used by the live homepage.
 */
import { Link } from "react-router-dom"
import heroStudent720 from "@/assets/site/home/hero-student-720.webp"
import heroStudent1024 from "@/assets/site/home/hero-student-1024.webp"
import photoAnalytics from "@/assets/site/home/program-analytics-800.webp"
import photoProduct from "@/assets/site/home/program-product-800.webp"
import photoScience from "@/assets/site/home/program-web-800.webp"
import "./HomeDirectionPreview.css"

const JOURNEY = [
  { n: "01", title: "Programme", text: "Start with a programme that is open." },
  { n: "02", title: "Lesson", text: "Read the lesson in front of you." },
  { n: "03", title: "Practice", text: "Try the work the lesson asks for." },
  { n: "04", title: "Project", text: "Keep a case or a lab result." },
  { n: "05", title: "Evidence", text: "Record what you can show." },
] as const

const PROGRAMMES = [
  {
    title: "Data Analytics",
    status: "Open for enrolment",
    open: true,
    text: "SQL practice on Northwind, a fictional sales extract. Finishing it does not promise a job.",
    to: "/programmes/data-analytics-pro",
    image: photoAnalytics,
    alt: "Illustrative analytics charts.",
  },
  {
    title: "Product Management",
    status: "Open for enrolment",
    open: true,
    text: "Harbor Desk is a written case workspace, not a SQL lab.",
    to: "/programmes/product-management",
    image: photoProduct,
    alt: "Illustrative product working session.",
  },
  {
    title: "Data Science",
    status: "Not open yet",
    open: false,
    text: "A listed direction. Machine learning teaching is not in the pathway yet.",
    to: "/programmes/data-science-ai",
    image: photoScience,
    alt: "Illustrative code on a screen.",
  },
] as const

export default function HomeDirectionPreview() {
  return (
    <div className="hpv">
      <p className="hpv-banner">Preview only. This is not the live homepage.</p>
      <header className="hpv-nav">
        <div className="hpv-wrap hpv-nav__bar">
          <Link className="hpv-mark" to="/preview/homepage">Skylent</Link>
          <nav className="hpv-nav__links" aria-label="Preview">
            <Link to="/programmes">Programmes</Link>
            <Link to="/education">Education</Link>
            <Link to="/career-os">Career OS</Link>
            <Link to="/about">About</Link>
          </nav>
          <div className="hpv-nav__actions">
            <Link className="hpv-nav__signin" to="/login">Sign in</Link>
            <Link className="hpv-btn hpv-btn--solid" to="/signup">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hpv-hero" aria-labelledby="hpv-title">
          <div className="hpv-wrap hpv-hero__grid">
            <div>
              <h1 id="hpv-title">Your education is just <em>the beginning.</em></h1>
              <p className="hpv-lead">Learn something useful. Put it to work. Build a record of what you can do.</p>
              <p className="hpv-today">Two programmes are open to start: Data Analytics, with SQL practice on a fictional sales extract, and Product Management, with a written case. Other listings are not open yet.</p>
              <div className="hpv-hero__actions">
                <Link className="hpv-btn hpv-btn--solid" to="/programmes">Explore Skylent</Link>
                <Link className="hpv-btn hpv-btn--ghost" to="/path">Find My Path</Link>
              </div>
              <p className="hpv-limit">Skylent does not award degrees, and finishing a programme does not promise a job.</p>
            </div>
            <div className="hpv-hero__visual">
              <img
                src={heroStudent1024}
                srcSet={`${heroStudent720} 720w, ${heroStudent1024} 1024w`}
                sizes="(max-width: 860px) 92vw, 46vw"
                width={1024}
                height={1280}
                alt="A student holding a laptop and notebook."
              />
            </div>
          </div>
        </section>

        <section className="hpv-journey" aria-labelledby="hpv-journey">
          <div className="hpv-wrap">
            <p className="hpv-kicker">How learning works</p>
            <h2 id="hpv-journey">Programme, then lesson, practice, project, and evidence.</h2>
            <p className="hpv-note">Example from the Data Analytics course. Not your account.</p>
            <ol className="hpv-steps">
              {JOURNEY.map((step) => (
                <li key={step.n}>
                  <span>{step.n}</span>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="hpv-programmes" aria-labelledby="hpv-programmes">
          <div className="hpv-wrap">
            <div className="hpv-section-head">
              <div>
                <p className="hpv-kicker">Programmes</p>
                <h2 id="hpv-programmes">Find your next area of focus.</h2>
              </div>
              <Link className="hpv-textlink" to="/programmes">All programmes</Link>
            </div>
            <ul className="hpv-cards">
              {PROGRAMMES.map((programme) => (
                <li key={programme.title}>
                  <Link to={programme.to} className={programme.open ? "is-open" : undefined}>
                    <img src={programme.image} alt={programme.alt} width={800} height={530} />
                    <span className="hpv-cards__body">
                      <span className={programme.open ? "hpv-status is-open" : "hpv-status"}>{programme.status}</span>
                      <strong>{programme.title}</strong>
                      <p>{programme.text}</p>
                      <span className="hpv-textlink">{programme.open ? "View programme" : "See what is listed"}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="hpv-feature" aria-labelledby="hpv-career">
          <div className="hpv-wrap hpv-feature__grid">
            <div>
              <p className="hpv-kicker hpv-kicker--light">Career OS</p>
              <h2 id="hpv-career">One profile for what you learn and keep.</h2>
              <p>Skill programmes can feed learning into Career OS after you enrol. A degree pathway is not connected, and nothing here is your account.</p>
              <p>No roles are published, and Career OS does not apply for you.</p>
              <Link className="hpv-btn hpv-btn--light" to="/career-os">How Career OS works</Link>
            </div>
            <ol className="hpv-feature__steps">
              <li><span>01</span> Enrol in a programme that is open.</li>
              <li><span>02</span> Lessons from that programme can appear after you enrol.</li>
              <li><span>03</span> You write the profile. It is not filled in for you.</li>
            </ol>
          </div>
        </section>

        <section className="hpv-close" aria-labelledby="hpv-close">
          <div className="hpv-wrap hpv-close__row">
            <div>
              <h2 id="hpv-close">See what is open to start.</h2>
              <p>Programmes that are open can be started. Listings that are not open can be read.</p>
            </div>
            <Link className="hpv-btn hpv-btn--light" to="/programmes">Explore Skylent</Link>
          </div>
        </section>
      </main>

      <footer className="hpv-foot">
        <div className="hpv-wrap hpv-foot__grid">
          <div>
            <p className="hpv-mark">Skylent</p>
            <p>Programmes you can start, and a place to keep the work you do.</p>
          </div>
          <nav aria-label="Preview footer">
            <Link to="/programmes">Programmes</Link>
            <Link to="/education">Degrees</Link>
            <Link to="/career-os">Career OS</Link>
            <Link to="/path">Find My Path</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
        <div className="hpv-wrap hpv-foot__meta">
          <p>Preview direction. The live homepage is unchanged.</p>
          <p><Link to="/">Back to the live homepage</Link></p>
        </div>
      </footer>
    </div>
  )
}
