import { Link } from "react-router-dom"
import { MATURITY_LABEL } from "../../lib/product-architecture"
import "./SkylentHomeUniversity.css"

const TIERS = [
  {
    id: "undergraduate",
    index: "01",
    title: "Undergraduate",
    copy: "A future layer for academic depth, applied learning and projects.",
    themes: ["Academic depth", "Applied learning", "Projects"],
    to: "/education/undergraduate",
    kind: "ug" as const,
  },
  {
    id: "postgraduate",
    index: "02",
    title: "Postgraduate",
    copy: "A later layer for specialisation and research — not a live programme list.",
    themes: ["Research", "Specialisation"],
    to: "/education/postgraduate",
    kind: "pg" as const,
  },
  {
    id: "specialisation",
    index: "03",
    title: "Specialisation / Research",
    copy: "Positioning for deeper study after postgraduate work. Not an award Skylent makes today.",
    themes: ["Specialisation", "Research"],
    to: "/education/postgraduate",
    kind: "spec" as const,
  },
] as const

function UgGlyph() {
  return (
    <svg className="hp-uni-glyph" viewBox="0 0 168 118" aria-hidden="true">
      <polygon className="is-ground" points="10,96 84,112 158,96 84,80" />
      <polygon className="is-top" points="84,28 132,50 84,72 36,50" />
      <polygon className="is-left" points="36,50 84,72 84,102 36,80" />
      <polygon className="is-right" points="84,72 132,50 132,80 84,102" />
      <polygon className="is-stroke" points="84,28 132,50 84,72 36,50" />
      <polygon className="is-stroke" points="36,50 84,72 84,102 36,80" />
      <polygon className="is-stroke" points="84,72 132,50 132,80 84,102" />
      <path className="is-window" d="M50 62l8 4v7l-8-4z" />
      <path className="is-window" d="M64 68l8 4v7l-8-4z" />
      <path className="is-window" d="M96 64l8-4v7l-8 4z" />
      <path className="is-window" d="M110 58l8-4v7l-8 4z" />
      <path className="is-stroke" d="M84 102l16-8 16 0 12-6" />
    </svg>
  )
}

function PgGlyph() {
  return (
    <svg className="hp-uni-glyph" viewBox="0 0 168 118" aria-hidden="true">
      <polygon className="is-ground" points="8,98 84,114 160,98 84,82" />
      <polygon className="is-left" points="28,52 56,66 56,96 28,82" />
      <polygon className="is-right" points="56,66 84,52 84,82 56,96" />
      <polygon className="is-top" points="56,38 84,52 56,66 28,52" />
      <polygon className="is-left" points="84,52 112,66 112,96 84,82" />
      <polygon className="is-right" points="112,66 140,52 140,82 112,96" />
      <polygon className="is-top" points="112,38 140,52 112,66 84,52" />
      <polygon className="is-stroke" points="28,52 56,66 56,96 28,82" />
      <polygon className="is-stroke" points="56,66 84,52 84,82 56,96" />
      <polygon className="is-stroke" points="56,38 84,52 56,66 28,52" />
      <polygon className="is-stroke" points="84,52 112,66 112,96 84,82" />
      <polygon className="is-stroke" points="112,66 140,52 140,82 112,96" />
      <polygon className="is-stroke" points="112,38 140,52 112,66 84,52" />
      <ellipse className="is-dome" cx="84" cy="36" rx="12" ry="6" />
      <path className="is-window" d="M38 70l7 3v6l-7-3z" />
      <path className="is-window" d="M118 64l7-3v6l-7 3z" />
    </svg>
  )
}

function SpecGlyph() {
  return (
    <svg className="hp-uni-glyph" viewBox="0 0 168 118" aria-hidden="true">
      <polygon className="is-ground" points="4,100 84,116 164,100 84,84" />
      <polygon className="is-left" points="16,62 38,74 38,96 16,84" />
      <polygon className="is-right" points="38,74 60,62 60,84 38,96" />
      <polygon className="is-top" points="38,50 60,62 38,74 16,62" />
      <polygon className="is-left" points="108,62 130,74 130,96 108,84" />
      <polygon className="is-right" points="130,74 152,62 152,84 130,96" />
      <polygon className="is-top" points="130,50 152,62 130,74 108,62" />
      <polygon className="is-left" points="58,36 84,50 84,100 58,86" />
      <polygon className="is-right" points="84,50 110,36 110,86 84,100" />
      <polygon className="is-top" points="84,12 110,36 84,50 58,36" />
      <polygon className="is-stroke" points="16,62 38,74 38,96 16,84" />
      <polygon className="is-stroke" points="38,74 60,62 60,84 38,96" />
      <polygon className="is-stroke" points="38,50 60,62 38,74 16,62" />
      <polygon className="is-stroke" points="108,62 130,74 130,96 108,84" />
      <polygon className="is-stroke" points="130,74 152,62 152,84 130,96" />
      <polygon className="is-stroke" points="130,50 152,62 130,74 108,62" />
      <polygon className="is-stroke" points="58,36 84,50 84,100 58,86" />
      <polygon className="is-stroke" points="84,50 110,36 110,86 84,100" />
      <polygon className="is-stroke" points="84,12 110,36 84,50 58,36" />
      <ellipse className="is-dome" cx="84" cy="14" rx="14" ry="7" />
      <path className="is-column" d="M90 58v32" />
      <path className="is-column" d="M98 54v32" />
      <path className="is-column" d="M106 50v32" />
    </svg>
  )
}

function TierGlyph({ kind }: { kind: (typeof TIERS)[number]["kind"] }) {
  if (kind === "ug") return <UgGlyph />
  if (kind === "pg") return <PgGlyph />
  return <SpecGlyph />
}

export default function SkylentHomeUniversity() {
  return (
    <section className="hp-ch hp-uni" aria-labelledby="home-university-heading">
      <div className="hp-rail hp-uni-stage">
        <header className="hp-uni-copy">
          <p className="hp-ch-kicker">
            <i aria-hidden="true" />
            13 University
          </p>
          <h2 id="home-university-heading" className="hp-ch-title">
            Go deeper. Build what comes next.
          </h2>
          <p className="hp-ch-lead">
            A future academic layer for undergraduate and postgraduate learning, built around depth, practice and
            specialisation.
          </p>
          <p className="hp-uni-soon">{MATURITY_LABEL.coming_soon}</p>
        </header>

        <ol className="hp-uni-rise" aria-label="Academic progression">
          {TIERS.map((tier) => (
            <li key={tier.id}>
              <Link className="hp-uni-tier" to={tier.to}>
                <TierGlyph kind={tier.kind} />
                <div className="hp-uni-tier-copy">
                  <div className="hp-uni-tier-top">
                    <span className="hp-uni-idx">{tier.index}</span>
                    <h3>{tier.title}</h3>
                    <span className="hp-uni-soon-inline">{MATURITY_LABEL.coming_soon}</span>
                  </div>
                  <p>{tier.copy}</p>
                  <ul>
                    {tier.themes.map((theme) => (
                      <li key={theme}>{theme}</li>
                    ))}
                  </ul>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
