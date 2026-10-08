/**
 * The system statement with its three entry points (Learn · Study · Grow) as a ruled rail,
 * then the seven public stages as one path on navy.
 */
import { Link } from "react-router-dom"
import { ArrowRight, PUBLIC_JOURNEY, SectionIndex, TruthChip, type JourneyStage, type TruthState } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import { truthOf } from "@/lib/truth"

/* ── What Skylent is ───────────────────────────────────────────────────────── */

const ENTRIES: { key: string; word: string; what: string; text: string; to: string; action: string; chip?: TruthState }[] = [
  {
    key: "A",
    word: "Learn",
    what: "Skill programmes",
    text: "Each programme is built around one dataset or case you get to know properly.",
    to: "/programmes",
    action: "Explore programmes",
  },
  {
    key: "B",
    word: "Study",
    what: "Degrees",
    text: "Degree pathways, online or on campus. Listings are samples until institutions are confirmed.",
    to: "/education",
    action: "Explore degrees",
    chip: truthOf("degrees"),
  },
  {
    key: "C",
    word: "Grow",
    what: "Career OS",
    text: "A career profile today, with project evidence being built on top of it.",
    to: "/career-os",
    action: "See Career OS",
  },
]

export function System() {
  return (
    <section className="hm-system" aria-labelledby="hm-system-title">
      <div className="sky-container">
        <Reveal className="hm-system__head" stagger>
          <SectionIndex n="01" label="What Skylent is" />
          <h2 id="hm-system-title" className="sky-display sky-display--lg hm-system__title">
            Education, skills, practice, evidence and career, <em>built as one system.</em>
          </h2>
        </Reveal>
        <Reveal className="hm-system__body" stagger=".hm-system__lead, .hm-rail > li" delay={120}>
          <p className="hm-system__lead">
            Most learning stops at the lesson. Skylent carries it on: what you study becomes practice, practice becomes a finished piece of work, and the work stays on a record you can show.
          </p>
          <ul className="hm-rail" aria-label="Three ways in">
            {ENTRIES.map((entry) => (
              <li key={entry.key}>
                <Link to={entry.to} className="hm-rail__row">
                  <span className="hm-rail__key">{entry.key}</span>
                  <span className="hm-rail__word">{entry.word}</span>
                  <span className="hm-rail__text">
                    <span className="hm-rail__what">
                      {entry.what}
                      {entry.chip ? <TruthChip state={entry.chip} /> : null}
                    </span>
                    <span className="hm-rail__desc">{entry.text}</span>
                  </span>
                  <span className="hm-rail__go">
                    {entry.action}
                    <ArrowRight />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

/* ── One path, seven stages ────────────────────────────────────────────────── */

const STAGE_COPY: Record<JourneyStage, { does: string; handledBy: string }> = {
  Discover: { does: "Work out what you want to be able to do.", handledBy: "Find My Path" },
  Choose: { does: "Pick a programme or a degree route that fits.", handledBy: "Programmes and degrees" },
  Learn: { does: "Work through notes and checks, one lesson at a time.", handledBy: "Learning player" },
  Practice: { does: "Run your own queries on a fictional sales extract.", handledBy: "Northwind Lab" },
  Build: { does: "Turn the practice into one finished piece of work.", handledBy: "Projects" },
  Prove: { does: "Keep that work as evidence someone can check.", handledBy: "Evidence in Career OS" },
  Grow: { does: "Carry your profile and evidence into what you do next.", handledBy: "Career OS" },
}

export function Journey({ current = "Discover" }: { current?: JourneyStage }) {
  const evidenceInDevelopment = truthOf("projectsAndEvidence") === "development"
  return (
    <section id="journey" className="hm-journey sky-stage sky-band-navy" aria-labelledby="hm-journey-title">
      <div className="sky-container">
        <Reveal className="hm-journey__head" stagger>
          <div data-reveal-group>
            <SectionIndex n="02" label="The journey" />
            <h2 id="hm-journey-title" className="sky-display sky-display--lg">
              One path, <em>seven stages.</em>
            </h2>
          </div>
          <p className="hm-journey__aside">
            Each stage is handled by a named part of Skylent. The marker under the navigation shows which stage a page belongs to.
          </p>
        </Reveal>

        <Reveal className="hm-path-signal" stagger=".hm-stage" axis="x" step={70} delay={160}>
          <ol className="hm-stages">
            {PUBLIC_JOURNEY.map((stage, i) => (
              <li key={stage} className="hm-stage" aria-current={stage === current ? "step" : undefined}>
                <span className="hm-stage__node" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="hm-stage__name">{stage}</h3>
                <p className="hm-stage__does">{STAGE_COPY[stage].does}</p>
                <p className="hm-stage__by">
                  <span className="hm-sr">Handled by </span>
                  {STAGE_COPY[stage].handledBy}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
        <p className="hm-journey__note">
          Northwind Lab belongs to the Data Analytics programme.{evidenceInDevelopment ? " Evidence in Career OS is in development." : ""}
        </p>
      </div>
    </section>
  )
}
