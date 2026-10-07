/**
 * Learn · Study · Grow, then the seven public stages as a path rail.
 */
import { Action, PUBLIC_JOURNEY, SectionIndex, TruthChip, type JourneyStage } from "@/components/skylent/primitives"
import { truthOf } from "@/lib/truth"

/* ── Learn · Study · Grow ──────────────────────────────────────────────────── */

export function Offer() {
  return (
    <section className="sky-container" aria-label="What Skylent offers">
      <div className="hm-offer">
        <div className="hm-offer__col">
          <div className="sky-label hm-offer__head">
            <span><b>A</b> / Skill programmes</span>
          </div>
          <h2 className="hm-offer__title">Learn</h2>
          <p className="hm-offer__text">Skill programmes, each built around one dataset or case you get to know properly.</p>
          <Action to="/programmes" kind="quiet">Explore programmes</Action>
        </div>
        <div className="hm-offer__col">
          <div className="sky-label hm-offer__head">
            <span><b>B</b> / Degrees</span>
            <TruthChip state={truthOf("degrees")} />
          </div>
          <h2 className="hm-offer__title">Study</h2>
          <p className="hm-offer__text">Degree pathways, online or on campus. Listings are samples until institutions are confirmed.</p>
          <Action to="/education" kind="quiet">Explore degrees</Action>
        </div>
        <div className="hm-offer__col">
          <div className="sky-label hm-offer__head">
            <span><b>C</b> / Career OS</span>
          </div>
          <h2 className="hm-offer__title">Grow</h2>
          <p className="hm-offer__text">A career profile today, with project evidence being built on top of it.</p>
          <Action to="/career-os" kind="quiet">See Career OS</Action>
        </div>
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
    <section id="journey" className="hm-journey sky-band-navy" aria-labelledby="hm-journey-title">
      <div className="sky-container">
      <div className="hm-head hm-head--split">
        <div className="hm-head__main">
          <SectionIndex n="02" label="The journey" />
          <h2 id="hm-journey-title" className="hm-h2">One path, seven stages.</h2>
        </div>
        <p className="hm-head__aside">
          Each stage is handled by a named part of Skylent. The marker under the navigation shows which stage a page belongs to.
        </p>
      </div>

      <ol className="hm-stages">
        {PUBLIC_JOURNEY.map((stage, i) => (
          <li key={stage} className="hm-stage" aria-current={stage === current ? "step" : undefined}>
            <div className="hm-stage__rail" aria-hidden="true">
              <span className={stage === current ? "sky-step__node sky-step__node--on" : "sky-step__node"}>{String(i + 1).padStart(2, "0")}</span>
              {i < PUBLIC_JOURNEY.length - 1 ? <span className="hm-stage__line" /> : null}
            </div>
            <h3 className="hm-stage__name">{stage}</h3>
            <p className="hm-stage__does">{STAGE_COPY[stage].does}</p>
            <div className="hm-stage__by">{STAGE_COPY[stage].handledBy}</div>
          </li>
        ))}
      </ol>
      <p className="hm-note">
        Northwind Lab belongs to the Data Analytics programme.{evidenceInDevelopment ? " Evidence in Career OS is in development." : ""}
      </p>
      </div>
    </section>
  )
}
