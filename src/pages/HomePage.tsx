import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import {
  CourseProductVisual,
  ProductFrame,
} from "../components/product/ProductLanguage"
import SkylentOsShowcase from "../components/home/SkylentOsShowcase"
import SkylentHeroLearningModel from "../components/home/SkylentHeroLearningModel"
import SkylentHomeGoals from "../components/home/SkylentHomeGoals"
import SkylentHomeCatalogue from "../components/home/SkylentHomeCatalogue"
import SkylentHomeEvidence from "../components/home/SkylentHomeEvidence"
import { FLAGSHIP_COURSE_SLUG, PRODUCT_MANAGEMENT_SLUG } from "../lib/authored-courses"
import { authoredWorkspace } from "../lib/home-workspace"
import { ACADEMIC_LINES, CAREER_OS_IA, EXAMS_NAV, MATURITY_LABEL } from "../lib/product-architecture"
import { programmeDiscoveryCards } from "../lib/programme-discovery"
import "./HomePage.css"

const SKILL_LINKS = [
  { label: "Artificial Intelligence", to: "/skills?intent=ai" },
  { label: "Data Analytics", to: "/courses/data-analytics" },
  { label: "Python", to: "/courses/python-programming" },
  { label: "SQL", to: "/courses/data-analytics" },
  { label: "Product Management", to: "/courses/product-management" },
  { label: "Web Development", to: "/courses/full-stack-web" },
  { label: "Marketing", to: "/courses?q=Marketing" },
  { label: "Design", to: "/courses?q=Design" },
  { label: "Communication", to: "/skills" },
  { label: "Business", to: "/workshops/ai-for-business" },
] as const

function HomeHero() {
  return <SkylentHeroLearningModel />
}

function HomeGoals() {
  return <SkylentHomeGoals />
}

function HomeFeatured() {
  return <SkylentHomeCatalogue />
}

function HomeEvidence() {
  return <SkylentHomeEvidence />
}

function HomeUniverse() {
  return (
    <section className="hp-section hp-universe" aria-labelledby="home-universe-heading">
      <div className="hp-rail">
        <header className="hp-head">
          <p className="hp-kicker">The Skylent universe</p>
          <h2 id="home-universe-heading">Find your next direction.</h2>
        </header>
        <ul className="hp-universe-list">
          <li>
            <Link className="hp-universe-row" to="/programs">
              <span>Career</span>
              <b>Build skills for modern work.</b>
              <em>Live</em>
            </Link>
          </li>
          <li>
            <Link className="hp-universe-row" to="/education">
              <span>Education</span>
              <b>Schooling / Undergraduate / Postgraduate</b>
              <em>{MATURITY_LABEL.coming_soon}</em>
            </Link>
          </li>
          <li>
            <Link className="hp-universe-row" to="/education/exams">
              <span>Exams</span>
              <b>JEE / NEET / CAT / GATE / IIT JAM / UPSC / SSC</b>
              <em>{MATURITY_LABEL.coming_soon}</em>
            </Link>
          </li>
          <li>
            <Link className="hp-universe-row" to="/workshops">
              <span>Workshops</span>
              <b>Focused learning around specific skills and problems.</b>
              <em>{MATURITY_LABEL.coming_soon}</em>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}

function HomeLoop() {
  const analytics = authoredWorkspace(FLAGSHIP_COURSE_SLUG)
  const product = authoredWorkspace(PRODUCT_MANAGEMENT_SLUG)
  const stages = [
    {
      id: "learn",
      title: "Learn",
      copy: "Written lessons in Skylent OS. Self-paced. No video stream and no live classroom.",
      detail: analytics?.lessonTitle ?? "Open a lesson",
    },
    {
      id: "practise",
      title: "Practise",
      copy: "Short checks after a block of lessons, then applied assignments on the course material.",
      detail: analytics?.practiceTitle ?? "Checks and assignments",
    },
    {
      id: "build",
      title: "Build",
      copy: "A named capstone produced against the course material — not a worked example.",
      detail: [analytics?.workTitle, product?.workTitle].filter(Boolean).join(" · "),
    },
    {
      id: "evidence",
      title: "Evidence",
      copy: "Keep the work sample. Carry it into Career OS yourself. Nothing is invented here.",
      detail: "Profile · projects · opportunities",
    },
  ] as const

  return (
    <section className="hp-section hp-loop" aria-labelledby="home-loop-heading">
      <div className="hp-rail">
        <header className="hp-head">
          <p className="hp-kicker">How Skylent works</p>
          <h2 id="home-loop-heading">Learning is only the beginning.</h2>
        </header>
        <ol className="hp-loop-line">
          {stages.map((stage, index) => (
            <li key={stage.id}>
              <p className="hp-loop-index">{String(index + 1).padStart(2, "0")}</p>
              <h3>{stage.title}</h3>
              <p>{stage.copy}</p>
              <strong>{stage.detail}</strong>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function HomeOS() {
  return (
    <section className="hp-section hp-os" aria-labelledby="home-os-heading">
      <div className="hp-rail">
        <header className="hp-head">
          <p className="hp-kicker">The workspace</p>
          <h2 id="home-os-heading">Meet Skylent OS.</h2>
          <p className="hp-lead">The workspace where learning turns into work.</p>
        </header>
        <div className="hp-os-stage">
          <SkylentOsShowcase wide />
        </div>
        <p className="hp-fine hp-os-honesty">
          This is the Data Analytics workspace as it exists today. Product Management is the other authored course. Other catalogue listings open an outline.
        </p>
      </div>
    </section>
  )
}

function HomeWork() {
  const programmes = programmeDiscoveryCards()

  return (
    <section className="hp-section hp-work" aria-labelledby="home-work-heading">
      <div className="hp-rail">
        <header className="hp-head">
          <p className="hp-kicker">Work you produce</p>
          <h2 id="home-work-heading">Don't just finish a course.</h2>
          <p className="hp-display">Make something.</p>
        </header>
        <ul className="hp-work-pair">
          {programmes.map((programme) => (
            <li key={programme.slug}>
              <article className="hp-work-card">
                <p className="hp-kicker">{programme.courseTitle}</p>
                <h3>{programme.capstone ?? programme.title}</h3>
                <p>{programme.decisionLine}</p>
                <div className="hp-work-stage">
                  <CourseProductVisual visual={programme.visual} compact />
                </div>
                <p className="hp-fine">
                  Against <code>{programme.material}</code>
                </p>
                <Link className="hp-text-link" to={programme.href}>View this programme →</Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function HomeProgrammes() {
  const programmes = programmeDiscoveryCards()

  return (
    <section className="hp-section hp-progs" aria-labelledby="home-progs-heading">
      <div className="hp-rail">
        <header className="hp-head hp-head-row">
          <div>
            <p className="hp-kicker">Professional learning</p>
            <h2 id="home-progs-heading">Professional programmes.</h2>
            <p className="hp-lead">Structured learning for skills you can actually use.</p>
          </div>
          <Link className="hp-text-link" to="/programs">All programmes →</Link>
        </header>
        <ul className="hp-progs-list">
          {programmes.map((programme) => (
            <li key={programme.slug}>
              <article className="hp-prog">
                <div className="hp-prog-copy">
                  <p className="hp-discover-type">Programme · {programme.enrollOpen ? "enrolment open" : "listing"}</p>
                  <h3>{programme.title}</h3>
                  <p>{programme.decisionLine}</p>
                  <p className="hp-discover-meta">
                    {programme.level}
                    {" · "}
                    {programme.format}
                    {" · "}
                    {programme.taughtModules} taught modules · {programme.taughtLessons} lessons
                  </p>
                  {programme.capstone ? (
                    <p className="hp-prog-work">
                      You produce <strong>{programme.capstone}</strong>
                    </p>
                  ) : null}
                  <p className="hp-fine">{programme.honesty}</p>
                  <Link className="hp-btn hp-btn-primary" to={programme.href}>View programme →</Link>
                </div>
                <div className="hp-prog-visual">
                  <CourseProductVisual visual={programme.visual} compact />
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function HomeEducation() {
  return (
    <section className="hp-section hp-edu" aria-labelledby="home-edu-heading">
      <div className="hp-rail">
        <header className="hp-head">
          <p className="hp-kicker">Education and exams</p>
          <h2 id="home-edu-heading">Whatever you're preparing for, start here.</h2>
        </header>
        <div className="hp-edu-grid">
          <article className="hp-edu-col">
            <h3>Education</h3>
            <p className="hp-fine">{MATURITY_LABEL.coming_soon}</p>
            <ul>
              {ACADEMIC_LINES.filter((line) => line.id !== "exams").map((line) => (
                <li key={line.id}>
                  <Link to={line.to}>{line.label}</Link>
                </li>
              ))}
            </ul>
          </article>
          <article className="hp-edu-col is-wide">
            <h3>Competitive exams</h3>
            <p className="hp-fine">{MATURITY_LABEL.coming_soon}</p>
            <ul className="hp-edu-exams">
              {EXAMS_NAV.items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </article>
          <article className="hp-edu-col">
            <h3>Workshops</h3>
            <p className="hp-fine">{MATURITY_LABEL.coming_soon}</p>
            <p>Short focused sessions on a single skill. Planned subjects are listed; registration is not open.</p>
            <Link className="hp-text-link" to="/workshops">See workshops →</Link>
          </article>
        </div>
      </div>
    </section>
  )
}

function HomeCareer() {
  return (
    <section className="hp-section hp-career" aria-labelledby="home-career-heading">
      <div className="hp-rail hp-career-split">
        <div>
          <p className="hp-kicker">Career OS</p>
          <h2 id="home-career-heading">What you build stays with you.</h2>
          <p className="hp-lead">
            Learning produces an artefact. You keep it. Career OS is the workspace for that evidence — not a
            placement service, and not a job board until roles are published.
          </p>
          <Link className="hp-btn hp-btn-primary" to="/career-os">Open Career OS →</Link>
        </div>
        <ProductFrame title="Career OS" meta="Live workspace">
          <ol className="hp-career-ia">
            {CAREER_OS_IA.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>
                  <strong>{item.label}</strong>
                  <span>{item.label === "Opportunities" ? "Empty until partners publish roles" : item.sub}</span>
                </Link>
              </li>
            ))}
          </ol>
        </ProductFrame>
      </div>
    </section>
  )
}

function HomeSkills() {
  return (
    <section className="hp-section hp-skills" aria-labelledby="home-skills-heading">
      <div className="hp-rail">
        <header className="hp-head hp-head-row">
          <div>
            <p className="hp-kicker">Browse</p>
            <h2 id="home-skills-heading">Explore by skill.</h2>
          </div>
          <Link className="hp-text-link" to="/skills">All skills →</Link>
        </header>
        <ul className="hp-skill-type">
          {SKILL_LINKS.map((item) => (
            <li key={item.label}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function HomeClose() {
  return (
    <section className="hp-close" aria-labelledby="home-close-heading">
      <div className="hp-rail">
        <h2 id="home-close-heading">
          Learn something.
          <br />
          Build something.
          <br />
          Become someone who can show it.
        </h2>
        <Link className="hp-btn hp-btn-primary hp-btn-lg" to="/programs">Explore Skylent →</Link>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        <HomeHero />
        <HomeGoals />
        <HomeFeatured />
        <HomeEvidence />
        <HomeUniverse />
        <HomeLoop />
        <HomeOS />
        <HomeWork />
        <HomeProgrammes />
        <HomeEducation />
        <HomeCareer />
        <HomeSkills />
        <HomeClose />
      </div>
    </PageShell>
  )
}
