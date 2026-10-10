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
import "./ProfessionalProgrammeTemplate.css"
import { openSkylentAi } from "../skylent/ai-events"
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

export default function ProgrammeListing({ program, truth, cta, honesty, afterEnrol, onEnrol, confirmed = true }: Props) {
  const thumb = programmeThumbInfo(program.slug)
  const canEnrol = confirmed && truth.enrollable && !truth.comingLater
  const firstLinked = truth.linked[0]

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
              {confirmed ? <TruthChip state={truth.state} /> : <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />}
            </p>
            <h1 id="pp-title" className="sky-display sky-display--lg pp-h1">
              {program.name}
            </h1>
            {program.desc ? <p className="pp-lede">{program.desc}</p> : null}
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
                  View {firstLinked.title}
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
                    : truth.enrolment
                    ? canEnrol || truth.comingLater
                      ? truth.enrolment
                      : "Not open yet"
                    : "To be announced",
                },
                { label: "Format", value: program.format },
                { label: "Level", value: program.level },
                { label: "Length", value: program.duration },
                {
                  label: "Modules",
                  value:
                    program.moduleCount > 0
                      ? truth.linked.length > 0
                        ? `${plural(program.moduleCount, "module")} in the linked course ${truth.linked.length === 1 ? "outline" : "outlines"}`
                        : plural(program.moduleCount, "module")
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
                            {confirmed ? <TruthChip state={item.authored ? "live" : "development"} /> : <TruthChip state="development" label={STATUS_NOT_CONFIRMED} />}
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
              <button type="button" className="sk-btn sk-btn-secondary" onClick={() => openSkylentAi("finder")}>
                Ask Skylent AI
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
