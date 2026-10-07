/**
 * Listing state for a programme with no authored material of its own.
 *
 * It prints what the catalogue API returned, says plainly what is and is not
 * taught, and offers the enrol action only when the backend can honour it (the
 * same decision ProgramPage has always made). It never shows another
 * programme's artefact: the figure, when there is one, is marked ILLUSTRATIVE.
 */
import { Link } from "react-router-dom"
import type { CatalogProgramDetail } from "../../lib/catalog-api"
import { ArrowRight, Plate, SpecSheet, TruthChip } from "../skylent/primitives"
import { ProgrammeThumb, programmeThumbInfo } from "./ProgrammeArtefacts"
import { plural, type ProgrammeTruth } from "./programme-truth"
import "./ProfessionalProgrammeTemplate.css"

type Props = {
  program: CatalogProgramDetail
  truth: ProgrammeTruth
  cta: string
  honesty: string
  afterEnrol: string
  onEnrol: () => void
}

export default function ProgrammeListing({ program, truth, cta, honesty, afterEnrol, onEnrol }: Props) {
  const thumb = programmeThumbInfo(program.slug)
  const canEnrol = truth.enrollable && !truth.comingLater
  const firstLinked = truth.linked[0]

  return (
    <div className="pp-page pp-page--listing">
      <section className="sky-container pp-hero" aria-labelledby="pp-title">
        <div className="pp-hero__copy">
          <nav className="sky-label pp-crumb" aria-label="Breadcrumb">
            <Link to="/programmes">Programmes</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{program.name}</span>
          </nav>
          <p className="pp-chips">
            <TruthChip state={truth.state} />
          </p>
          <h1 id="pp-title" className="pp-h1">
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
          <SpecSheet
            className="pp-hero__spec"
            rows={[
              {
                label: "Enrolment",
                value: truth.enrolment
                  ? canEnrol || truth.comingLater
                    ? truth.enrolment
                    : `${truth.enrolment} in the catalogue. No authored course to enrol into yet.`
                  : "Not stated in the catalogue",
              },
              { label: "Format", value: program.format },
              { label: "Level", value: program.level },
              { label: "Listed length", value: program.duration },
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
                          <TruthChip state={item.authored ? "live" : "development"} />
                        </span>
                      ))}
                    </span>
                  ) : (
                    "None yet"
                  ),
              },
            ]}
          />
        </div>

        {thumb.hasArtefact ? (
          <Plate
            className="pp-hero__plate pp-hero__plate--thumb"
            fig="FIG. 01"
            caption={thumb.caption}
            note={thumb.illustrative ? "Illustrative. Not course material." : undefined}
          >
            <ProgrammeThumb program={program} />
          </Plate>
        ) : null}
      </section>

      <section className="sky-band-navy pp-next" aria-labelledby="pp-next-title">
        <div className="sky-container pp-next__inner">
          <div className="pp-next__copy">
            <p className="sky-label">Next step</p>
            <h2 id="pp-next-title" className="pp-h2">
              {truth.comingLater
                ? "Enrolment is not open on this programme yet."
                : canEnrol
                  ? "The linked course is ready. The full programme is not taught yet."
                  : "This programme is listed, not yet taught."}
            </h2>
          </div>
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
            <Link className="sk-btn sk-btn-secondary" to="/path">
              Find my path
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
