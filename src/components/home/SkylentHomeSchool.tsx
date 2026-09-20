import { Link } from "react-router-dom"
import { MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeSchool.css"

const EDUCATION_HREF = "/education"
const SCHOOLING_HREF = "/education/schooling"

const STAGES = [
  {
    id: "foundation",
    index: "00",
    title: "Foundation",
    range: "The start of the pathway",
    copy: "A base for later grade-and-subject learning.",
    kind: "foundation" as const,
  },
  {
    id: "primary",
    index: "01",
    title: "Primary",
    range: "Grade 1–5",
    copy: "Early grade-and-subject work.",
    kind: "primary" as const,
  },
  {
    id: "middle",
    index: "02",
    title: "Middle",
    range: "Grade 6–8",
    copy: "Broader subjects, still foundational.",
    kind: "middle" as const,
  },
  {
    id: "secondary",
    index: "03",
    title: "Secondary",
    range: "Grade 9–10",
    copy: "Core subjects before senior years.",
    kind: "secondary" as const,
  },
  {
    id: "senior",
    index: "04",
    title: "Senior",
    range: "Grade 11–12",
    copy: "The last schooling band on this map.",
    kind: "senior" as const,
  },
] as const

const SUBJECTS = ["Mathematics", "Science", "Language", "Socials", "IT"] as const

function StageGlyph({ kind }: { kind: (typeof STAGES)[number]["kind"] }) {
  if (kind === "foundation") {
    return (
      <svg className="hp-sch-glyph" viewBox="0 0 88 72" aria-hidden="true">
        <rect className="is-ground" x="8" y="56" width="72" height="8" />
        <rect className="is-fill" x="24" y="40" width="40" height="16" />
        <rect className="is-stroke" x="24" y="40" width="40" height="16" />
      </svg>
    )
  }
  if (kind === "primary") {
    return (
      <svg className="hp-sch-glyph" viewBox="0 0 88 72" aria-hidden="true">
        <rect className="is-ground" x="8" y="58" width="72" height="8" />
        <rect className="is-fill" x="22" y="30" width="44" height="28" />
        <rect className="is-stroke" x="22" y="30" width="44" height="28" />
        <rect className="is-window" x="30" y="38" width="8" height="8" />
        <rect className="is-window" x="50" y="38" width="8" height="8" />
      </svg>
    )
  }
  if (kind === "middle") {
    return (
      <svg className="hp-sch-glyph" viewBox="0 0 88 72" aria-hidden="true">
        <rect className="is-ground" x="6" y="60" width="76" height="8" />
        <rect className="is-fill" x="18" y="36" width="52" height="24" />
        <rect className="is-stroke" x="18" y="36" width="52" height="24" />
        <rect className="is-fill" x="24" y="20" width="40" height="16" />
        <rect className="is-stroke" x="24" y="20" width="40" height="16" />
        <rect className="is-window" x="28" y="42" width="7" height="7" />
        <rect className="is-window" x="40" y="42" width="7" height="7" />
        <rect className="is-window" x="52" y="42" width="7" height="7" />
      </svg>
    )
  }
  if (kind === "secondary") {
    return (
      <svg className="hp-sch-glyph" viewBox="0 0 88 72" aria-hidden="true">
        <rect className="is-ground" x="4" y="62" width="80" height="8" />
        <rect className="is-fill" x="14" y="38" width="60" height="24" />
        <rect className="is-stroke" x="14" y="38" width="60" height="24" />
        <rect className="is-fill" x="20" y="24" width="48" height="14" />
        <rect className="is-stroke" x="20" y="24" width="48" height="14" />
        <rect className="is-fill" x="28" y="12" width="32" height="12" />
        <rect className="is-stroke" x="28" y="12" width="32" height="12" />
        <rect className="is-window" x="22" y="44" width="7" height="7" />
        <rect className="is-window" x="34" y="44" width="7" height="7" />
        <rect className="is-window" x="46" y="44" width="7" height="7" />
        <rect className="is-window" x="58" y="44" width="7" height="7" />
      </svg>
    )
  }
  return (
    <svg className="hp-sch-glyph" viewBox="0 0 88 72" aria-hidden="true">
      <rect className="is-ground" x="2" y="64" width="84" height="6" />
      <rect className="is-fill" x="10" y="40" width="68" height="24" />
      <rect className="is-stroke" x="10" y="40" width="68" height="24" />
      <rect className="is-fill" x="16" y="26" width="56" height="14" />
      <rect className="is-stroke" x="16" y="26" width="56" height="14" />
      <rect className="is-fill" x="24" y="14" width="40" height="12" />
      <rect className="is-stroke" x="24" y="14" width="40" height="12" />
      <path className="is-stroke" d="M36 14l8-8 8 8" />
      <rect className="is-window" x="18" y="46" width="7" height="7" />
      <rect className="is-window" x="30" y="46" width="7" height="7" />
      <rect className="is-window" x="51" y="46" width="7" height="7" />
      <rect className="is-window" x="63" y="46" width="7" height="7" />
    </svg>
  )
}

export default function SkylentHomeSchool() {
  return (
    <section className="hp-ch hp-school" aria-labelledby="home-school-heading">
      <div className="hp-rail hp-school-stage">
        <header className="hp-school-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            12 School
          </p>
          <h2 id="home-school-heading" className="hp-ch-title">
            Foundations first.
          </h2>
          <p className="hp-ch-lead">
            A grade-and-subject pathway designed to build strong foundations for future learning. There is no live
            schooling catalogue to browse or buy yet.
          </p>
          <p className="hp-school-soon">{MATURITY_LABEL.coming_soon}</p>
          <Link className="hp-school-cta" to={EDUCATION_HREF}>
            Explore education
            <span aria-hidden="true"> →</span>
          </Link>
        </header>

        <div className="hp-sch-map" aria-label="Intended schooling foundation map">
          <ol className="hp-sch-steps">
            {STAGES.map((stage) => (
              <li key={stage.id}>
                <Link className="hp-sch-step" to={SCHOOLING_HREF}>
                  <span className="hp-sch-idx">{stage.index}</span>
                  <StageGlyph kind={stage.kind} />
                  <h3>{stage.title}</h3>
                  <p className="hp-sch-range">{stage.range}</p>
                  <p>{stage.copy}</p>
                </Link>
              </li>
            ))}
          </ol>
          <p className="hp-sch-subjects">
            <span>Subject nodes · direction only</span>
            {SUBJECTS.map((subject) => (
              <b key={subject}>{subject}</b>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}
