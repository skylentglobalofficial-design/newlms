import { Link } from "react-router-dom"
import { ACADEMIC_LINES, MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeEducation.css"

const CHAIN = ["Learning", "Work", "Evidence", "Identity"] as const
const EDUCATION_HREF = "/education"

const LEVELS = [
  {
    id: "schooling",
    index: "01",
    title: "School",
    copy: "Foundations and basics for future learners.",
    themes: ["Foundations", "Academic skills", "Digital skills"],
    kind: "school" as const,
  },
  {
    id: "undergraduate",
    index: "02",
    title: "Undergraduate",
    copy: "Build academic depth with industry-relevant learning.",
    themes: ["Domain learning", "Practical learning", "Projects"],
    kind: "undergrad" as const,
  },
  {
    id: "postgraduate",
    index: "03",
    title: "Postgraduate",
    copy: "Specialise, research and advance your career.",
    themes: ["Advanced learning", "Research", "Specialisation"],
    kind: "postgrad" as const,
  },
] as const

function routeFor(id: string) {
  return ACADEMIC_LINES.find((line) => line.id === id)?.to ?? EDUCATION_HREF
}

function SchoolGlyph() {
  return (
    <svg className="hp-edu-glyph" viewBox="0 0 168 118" aria-hidden="true">
      <polygon className="is-ground" points="18,94 84,108 150,94 84,80" />
      <polygon className="is-top" points="84,36 118,52 84,68 50,52" />
      <polygon className="is-left" points="50,52 84,68 84,96 50,80" />
      <polygon className="is-right" points="84,68 118,52 118,80 84,96" />
      <polygon className="is-stroke" points="84,36 118,52 84,68 50,52" />
      <polygon className="is-stroke" points="50,52 84,68 84,96 50,80" />
      <polygon className="is-stroke" points="84,68 118,52 118,80 84,96" />
      <path className="is-window" d="M92 64l8-4v7l-8 4z" />
      <path className="is-window" d="M104 58l8-4v7l-8 4z" />
      <path className="is-door" d="M96 82l10-5v16l-10 5z" />
    </svg>
  )
}

function UndergradGlyph() {
  return (
    <svg className="hp-edu-glyph" viewBox="0 0 168 118" aria-hidden="true">
      <polygon className="is-ground" points="10,94 84,110 158,94 84,78" />
      <polygon className="is-top" points="84,22 132,44 84,66 36,44" />
      <polygon className="is-left" points="36,44 84,66 84,100 36,78" />
      <polygon className="is-right" points="84,66 132,44 132,78 84,100" />
      <polygon className="is-stroke" points="84,22 132,44 84,66 36,44" />
      <polygon className="is-stroke" points="36,44 84,66 84,100 36,78" />
      <polygon className="is-stroke" points="84,66 132,44 132,78 84,100" />
      <path className="is-stroke" d="M48 50l36 16" />
      <path className="is-window" d="M48 52l8 4v7l-8-4z" />
      <path className="is-window" d="M62 58l8 4v7l-8-4z" />
      <path className="is-window" d="M94 58l8-4v7l-8 4z" />
      <path className="is-window" d="M108 52l8-4v7l-8 4z" />
      <path className="is-window" d="M122 46l8-4v7l-8 4z" />
      <path className="is-column" d="M96 70v22" />
      <path className="is-column" d="M106 65v22" />
      <path className="is-column" d="M116 60v22" />
      <path className="is-stroke" d="M84 100l18-8 18 0 12-6" />
    </svg>
  )
}

function PostgradGlyph() {
  return (
    <svg className="hp-edu-glyph" viewBox="0 0 168 118" aria-hidden="true">
      <polygon className="is-ground" points="6,96 84,112 162,96 84,80" />
      <polygon className="is-left" points="22,58 46,70 46,94 22,82" />
      <polygon className="is-right" points="46,70 70,58 70,82 46,94" />
      <polygon className="is-top" points="46,46 70,58 46,70 22,58" />
      <polygon className="is-left" points="98,58 122,70 122,94 98,82" />
      <polygon className="is-right" points="122,70 146,58 146,82 122,94" />
      <polygon className="is-top" points="122,46 146,58 122,70 98,58" />
      <polygon className="is-stroke" points="22,58 46,70 46,94 22,82" />
      <polygon className="is-stroke" points="46,70 70,58 70,82 46,94" />
      <polygon className="is-stroke" points="46,46 70,58 46,70 22,58" />
      <polygon className="is-stroke" points="98,58 122,70 122,94 98,82" />
      <polygon className="is-stroke" points="122,70 146,58 146,82 122,94" />
      <polygon className="is-stroke" points="122,46 146,58 122,70 98,58" />
      <polygon className="is-left" points="58,40 84,54 84,98 58,84" />
      <polygon className="is-right" points="84,54 110,40 110,84 84,98" />
      <polygon className="is-top" points="84,16 110,40 84,54 58,40" />
      <polygon className="is-stroke" points="58,40 84,54 84,98 58,84" />
      <polygon className="is-stroke" points="84,54 110,40 110,84 84,98" />
      <polygon className="is-stroke" points="84,16 110,40 84,54 58,40" />
      <ellipse className="is-dome" cx="84" cy="18" rx="14" ry="7" />
      <path className="is-stroke" d="M84 11v-6" />
      <path className="is-window" d="M30 68l7 3v6l-7-3z" />
      <path className="is-window" d="M40 73l7 3v6l-7-3z" />
      <path className="is-window" d="M126 64l7-3v6l-7 3z" />
      <path className="is-window" d="M136 59l7-3v6l-7 3z" />
      <path className="is-column" d="M90 62v28" />
      <path className="is-column" d="M98 58v28" />
      <path className="is-column" d="M106 54v28" />
      <path className="is-stroke" d="M84 98l14-7h16l14-7" />
    </svg>
  )
}

function LevelGlyph({ kind }: { kind: (typeof LEVELS)[number]["kind"] }) {
  if (kind === "school") return <SchoolGlyph />
  if (kind === "undergrad") return <UndergradGlyph />
  return <PostgradGlyph />
}

function IconBook() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3.4c-1.6-.9-3.4-.9-5 0v9.1c1.6-.8 3.4-.8 5 .1" />
      <path d="M8 3.4c1.6-.9 3.4-.9 5 0v9.1c-1.6-.8-3.4-.8-5 .1" />
      <path d="M8 3.6v9" />
    </svg>
  )
}

export default function SkylentHomeEducation() {
  return (
    <section className="hp-ch hp-edu" aria-labelledby="home-education-heading">
      <div className="hp-rail hp-edu-stage">
        <header className="hp-edu-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            11 Education
          </p>
          <h2 id="home-education-heading" className="hp-ch-title">
            Learn beyond a single course.
          </h2>
          <p className="hp-ch-lead">
            A broader academic ecosystem — from foundational learning to degrees and specialisation.
          </p>
          <Link className="hp-edu-cta" to={EDUCATION_HREF}>
            Explore education
            <span aria-hidden="true"> →</span>
          </Link>
          <ol className="hp-edu-chain" aria-label="Chapter relationship">
            {CHAIN.map((step) => (
              <li key={step}>{step}</li>
            ))}
            <li className="is-here">Education</li>
          </ol>
        </header>

        <article className="hp-edu-board" aria-labelledby="home-education-board-title">
          <header className="hp-edu-board-head">
            <div>
              <p className="hp-edu-board-kicker">The Skylent education ecosystem</p>
              <h3 id="home-education-board-title">A connected path for lifelong learners.</h3>
            </div>
            <p className="hp-edu-board-aside">Specified academic lines. Not a live catalogue.</p>
          </header>

          <ol className="hp-edu-levels">
            {LEVELS.map((level) => (
              <li key={level.id}>
                <Link className="hp-edu-level" to={routeFor(level.id)}>
                  <span className="hp-edu-idx">{level.index}</span>
                  <LevelGlyph kind={level.kind} />
                  <div className="hp-edu-level-copy">
                    <div className="hp-edu-level-top">
                      <h4>{level.title}</h4>
                      <span className="hp-edu-soon">{MATURITY_LABEL.coming_soon}</span>
                    </div>
                    <p>{level.copy}</p>
                    <ul>
                      {level.themes.map((theme) => (
                        <li key={theme}>{theme}</li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </li>
            ))}
          </ol>

          <div className="hp-edu-close">
            <p className="hp-edu-close-kicker">
              <IconBook />
              One ecosystem. Many possibilities.
            </p>
            <p className="hp-edu-close-copy">
              Courses, degrees, projects and career support — designed to grow with you. Degrees describe the
              long-term direction, not an award Skylent makes today.
            </p>
            <Link className="hp-ch-link" to={EDUCATION_HREF}>
              Explore education →
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}
