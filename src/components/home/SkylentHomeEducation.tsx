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
    <svg className="hp-edu-glyph" viewBox="0 0 140 108" aria-hidden="true">
      <rect className="is-ground" x="18" y="86" width="104" height="8" rx="1" />
      <path className="is-stroke" d="M28 86h84" />
      <polygon className="is-fill" points="40,44 70,22 100,44" />
      <polygon className="is-stroke" points="40,44 70,22 100,44" />
      <rect className="is-fill" x="44" y="44" width="52" height="42" />
      <rect className="is-stroke" x="44" y="44" width="52" height="42" />
      <rect className="is-window" x="52" y="54" width="10" height="10" />
      <rect className="is-window" x="78" y="54" width="10" height="10" />
      <rect className="is-door" x="64" y="70" width="12" height="16" />
    </svg>
  )
}

function UndergradGlyph() {
  return (
    <svg className="hp-edu-glyph" viewBox="0 0 140 108" aria-hidden="true">
      <rect className="is-ground" x="10" y="88" width="120" height="8" rx="1" />
      <path className="is-stroke" d="M16 88h108" />
      <rect className="is-fill" x="28" y="34" width="84" height="54" />
      <rect className="is-stroke" x="28" y="34" width="84" height="54" />
      <path className="is-fill" d="M28 34h84l-8-12H36z" />
      <path className="is-stroke" d="M28 34h84l-8-12H36z" />
      <rect className="is-window" x="38" y="42" width="12" height="10" />
      <rect className="is-window" x="64" y="42" width="12" height="10" />
      <rect className="is-window" x="90" y="42" width="12" height="10" />
      <rect className="is-window" x="38" y="58" width="12" height="10" />
      <rect className="is-window" x="90" y="58" width="12" height="10" />
      <rect className="is-column" x="58" y="56" width="5" height="32" />
      <rect className="is-column" x="68" y="56" width="5" height="32" />
      <rect className="is-column" x="78" y="56" width="5" height="32" />
      <path className="is-stroke" d="M52 88l8-8h20l8 8" />
    </svg>
  )
}

function PostgradGlyph() {
  return (
    <svg className="hp-edu-glyph" viewBox="0 0 140 108" aria-hidden="true">
      <rect className="is-ground" x="6" y="90" width="128" height="8" rx="1" />
      <path className="is-stroke" d="M10 90h120" />
      <rect className="is-fill" x="14" y="52" width="28" height="38" />
      <rect className="is-stroke" x="14" y="52" width="28" height="38" />
      <rect className="is-fill" x="98" y="52" width="28" height="38" />
      <rect className="is-stroke" x="98" y="52" width="28" height="38" />
      <rect className="is-window" x="20" y="60" width="7" height="8" />
      <rect className="is-window" x="29" y="60" width="7" height="8" />
      <rect className="is-window" x="20" y="72" width="7" height="8" />
      <rect className="is-window" x="29" y="72" width="7" height="8" />
      <rect className="is-window" x="104" y="60" width="7" height="8" />
      <rect className="is-window" x="113" y="60" width="7" height="8" />
      <rect className="is-window" x="104" y="72" width="7" height="8" />
      <rect className="is-window" x="113" y="72" width="7" height="8" />
      <rect className="is-fill" x="42" y="36" width="56" height="54" />
      <rect className="is-stroke" x="42" y="36" width="56" height="54" />
      <path className="is-fill" d="M42 36h56L70 16z" />
      <path className="is-stroke" d="M42 36h56L70 16z" />
      <ellipse className="is-fill" cx="70" cy="22" rx="14" ry="8" />
      <ellipse className="is-stroke" cx="70" cy="22" rx="14" ry="8" />
      <rect className="is-column" x="50" y="50" width="5" height="40" />
      <rect className="is-column" x="62" y="50" width="5" height="40" />
      <rect className="is-column" x="74" y="50" width="5" height="40" />
      <rect className="is-column" x="86" y="50" width="5" height="40" />
      <path className="is-stroke" d="M48 90l10-10h24l10 10" />
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
      <path d="M3 2.6h8.1A1.7 1.7 0 0 1 12.8 4.3v9.1H4.2A1.2 1.2 0 0 1 3 12.2V2.6z" />
      <path d="M3 12.3h9.8" />
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
