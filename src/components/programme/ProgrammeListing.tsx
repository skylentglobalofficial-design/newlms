/**
 * Listing state for a programme with no authored material of its own.
 *
 * It prints what the catalogue API returned, says plainly what is and is not
 * taught, and offers the enrol action only when the backend can honour it (the
 * same decision ProgramPage has always made). It never shows another
 * programme's artefact: the figure, when there is one, is marked ILLUSTRATIVE.
 *
 * Layout: display title with the catalogue record as a ruled sheet beside it,
 * then one navy stage that holds the figure and the next step.
 */
import { Link } from "react-router-dom"
import type { CatalogProgramDetail } from "../../lib/catalog-api"
import { ArrowRight, SpecSheet, TruthChip } from "../skylent/primitives"
import { Reveal } from "../skylent/Reveal"
import { ProgrammeThumb, programmeThumbInfo } from "./ProgrammeArtefacts"
import { plural, type ProgrammeTruth } from "./programme-truth"
import { effectiveProgrammePublicFacts } from "../../lib/public-catalogue-copy"
import { practiceNoteForProgramme } from "../../lib/practice-environments"
import "./ProfessionalProgrammeTemplate.css"
import { STATUS_NOT_CONFIRMED } from "./CatalogueNotice"

type Props = {
  program: CatalogProgramDetail
  truth: ProgrammeTruth
  cta: string
  honesty: string
  afterEnrol: string
  onEnrol: () => void
  confirmed?: boolean
}

function listingDescription(program: CatalogProgramDetail, truth: ProgrammeTruth): string | null {
  if (program.slug === "data-science-ai" && !truth.authored) {
    return "Listed as a data science direction. Machine learning teaching is not in the pathway yet."
  }
  return program.desc || null
}

export default function ProgrammeListing({ program, truth, cta, honesty, afterEnrol, onEnrol, confirmed = true }: Props) {
  const thumb = programmeThumbInfo(program.slug)
  const canEnrol = confirmed && truth.enrollable && truth.authored && !truth.comingLater
  const firstLinked = truth.linked[0]
  const facts = effectiveProgrammePublicFacts(program)
  const description = listingDescription({ ...program, desc: facts.desc }, truth)

  return (
    <div className="pp-page pp-page--listing">
      <section className="sky-container pp-hero" aria-labelledby="pp-title">
        <nav className="sky-label pp-crumb" aria-label="Breadcrumb">
          <Link to="/programmes">Programmes</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{program.name}</span>
        </nav>
        <div className="pp-hero__grid pp-hero__grid--listing">
          <div className="pp-hero__main">
            <p className="pp-chips">
              {confirmed ? (
                <TruthChip
                  state={truth.state}
                  label={truth.state === "live" ? "Open" : truth.state === "soon" ? "Coming soon" : "In development"}
                />
              ) : (
                <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />
              )}
            </p>
            <h1 id="pp-title" className="sky-display sky-display--lg pp-h1">
              {program.name}
            </h1>
            {description ? <p className="pp-lede">{description}</p> : null}
            <p className="pp-note pp-note--rule">{honesty}</p>
            <div className="pp-actions">
              {canEnrol ? (
                <button type="button" className="sk-btn sk-btn-primary" onClick={onEnrol}>
                  {cta}
                  <ArrowRight />
                </button>
              ) : null}
              {firstLinked ? (
                <Link className="sk-btn sk-btn-secondary" to={firstLinked.to}>
                  View {firstLinked.title === program.name ? `${firstLinked.title} course` : firstLinked.title}
                </Link>
              ) : (
                <Link className="sk-btn sk-btn-secondary" to="/programmes">
                  All programmes
                </Link>
              )}
            </div>
            {canEnrol ? <p className="pp-note">{afterEnrol}</p> : null}
          </div>
          <div className="pp-hero__record">
            <p className="sky-label">At a glance</p>
            <SpecSheet
              className="pp-hero__spec"
              rows={[
                {
                  label: "Enrolment",
                  value: !confirmed
                    ? STATUS_NOT_CONFIRMED
                    : canEnrol
                      ? "Open"
                      : truth.comingLater
                        ? "Coming soon"
                        : truth.state === "development"
                          ? "In development"
                          : "Not open yet",
                },
                { label: "Format", value: facts.format },
                { label: "Practice", value: practiceNoteForProgramme(program.slug) },
                { label: "Level", value: program.level },
                { label: "Length", value: program.duration },
                {
                  label: "Modules",
                  value:
                    facts.taughtModuleCount > 0
                      ? truth.linked.length > 0
                        ? `${plural(facts.taughtModuleCount, "module")} in the linked course ${truth.linked.length === 1 ? "outline" : "outlines"}`
                        : plural(facts.taughtModuleCount, "module")
                      : null,
                },
                {
                  label: truth.linked.length === 1 ? "Linked course" : "Linked courses",
                  value:
                    truth.linked.length > 0 ? (
                      <span className="pp-linked">
                        {truth.linked.map((item) => (
                          <span key={item.slug}>
                            <Link to={item.to}>{item.title}</Link>
                            {confirmed ? (
                              <TruthChip state={item.authored ? "live" : "development"} label={item.authored ? "Ready to start" : "In development"} />
                            ) : (
                              <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />
                            )}
                          </span>
                        ))}
                      </span>
                    ) : (
                      "Being prepared"
                    ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {truth.linked.some((item) => item.authored) ? (
        <section className="sky-container" style={{ paddingBlock: "24px 40px" }} aria-label="Linked live courses ready to start">
          <div style={{ padding: "24px", borderRadius: 16, border: "1px solid #DDD7FF", background: "#FAF9FF" }}>
            <p className="sky-label" style={{ color: "#5142B5" }}>Live in Skylent OS · +50 Elixir Enrolment Bonus</p>
            <h2 style={{ margin: "6px 0 8px", fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 750, color: "#171717" }}>
              Start the linked self-paced course{truth.linked.length > 1 ? "s" : ""} today
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: 15, color: "#3c425c", maxWidth: "52em" }}>
              Every linked course below is 100% authored and open for immediate self-paced enrolment with 5 modules, 15 written lessons, 60 concept checks, 15 applied briefs, Boardroom Cold Calls, and Socratic AI + 20-Min Faculty TA support.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {truth.linked.filter((item) => item.authored).map((item) => (
                <Link
                  key={item.slug}
                  to={item.to}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "18px 20px",
                    borderRadius: 14,
                    background: "#ffffff",
                    border: "1px solid #DDD7FF",
                    color: "#171717",
                    textDecoration: "none",
                    boxShadow: "0 12px 28px -18px rgba(81, 66, 181, 0.2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0E6A44", background: "#E7F6EF", padding: "2px 10px", borderRadius: 999 }}>
                      Open now · 15 Lessons
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#5142B5" }}>💎 +50 Elixir</span>
                  </div>
                  <strong style={{ fontSize: 18, fontWeight: 750 }}>{item.title}</strong>
                  <span style={{ fontSize: 13.5, color: "#555B7D" }}>
                    5 modules · 60 concept checks · 15 written briefs · Cryptographic Certificate
                  </span>
                  <span style={{ marginTop: "auto", paddingTop: 6, fontSize: 14, fontWeight: 700, color: "#5142B5", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    Open {item.title} course <ArrowRight />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="sky-stage sky-band-navy pp-next pp-next--listing" aria-labelledby="pp-next-title">
        <div className={`sky-container pp-listing-stage${thumb.hasArtefact ? "" : " pp-listing-stage--plain"}`}>
          {thumb.hasArtefact ? (
            <Reveal as="figure" variant="plate" className="pp-listing-stage__figure">
              <div className="sky-stage__plate pp-listing-stage__plate">
                <ProgrammeThumb program={program} />
              </div>
              <figcaption className="sky-stage__caption">
                <span>{thumb.caption}</span>
              </figcaption>
            </Reveal>
          ) : null}
          <Reveal className="pp-listing-stage__copy">
            <p className="sky-label">Next step</p>
            <h2 id="pp-next-title" className="sky-display sky-display--md pp-next__title">
              {!confirmed
                ? `${STATUS_NOT_CONFIRMED}. Enrolment is paused until the catalogue can be checked.`
                : truth.comingLater
                ? "Enrolment is not open on this programme yet."
                : canEnrol
                  ? "Start with the course that is ready now."
                  : "This programme is being prepared."}
            </h2>
            <div className="pp-actions">
              {canEnrol ? (
                <button type="button" className="sk-btn sk-btn-primary" onClick={onEnrol}>
                  {cta}
                  <ArrowRight />
                </button>
              ) : (
                <Link className="sk-btn sk-btn-primary" to="/programmes">
                  See all programmes
                  <ArrowRight />
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
