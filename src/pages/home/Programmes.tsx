/**
 * Programmes. The only source is GET /catalog/programs (useLivePrograms in HomePage):
 * loading shows skeletons, an empty or failed response shows one honest message with a retry,
 * and no sample programmes are ever substituted.
 *
 * Presentation: a rail of the programmes the catalogue returned, and one navy panel that
 * shows the selected programme with its artefact at full size.
 */
import { useState } from "react"
import { Link } from "react-router-dom"
import { Action, ArrowRight, SectionIndex, SpecSheet, TruthChip } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import { NorthwindArtefact, TileArtefact, isIllustrative } from "./artefacts"
import { countWord, type HomeProgramme } from "./programme-model"

const RAIL_LIMIT = 6

function Chips({ programme }: { programme: HomeProgramme }) {
  const illustrative = isIllustrative(programme.artefact)
  if (!programme.chip && !illustrative) return null
  return (
    <span className="hm-chips">
      {programme.chip ? <TruthChip state={programme.chip.state} label={programme.chip.label} /> : null}
      {illustrative ? <TruthChip state="illustrative" /> : null}
    </span>
  )
}

/** Enrolable programmes link to their page; the rest say plainly that enrolment is not open. */
function PanelAction({ programme }: { programme: HomeProgramme }) {
  if (programme.enrollable) {
    return (
      <Link to={`/programmes/${programme.slug}`} className="sk-btn sk-btn-primary">
        View programme<span className="hm-sr">: {programme.title}</span>
        <ArrowRight />
      </Link>
    )
  }
  return <p className="hm-prog__closed">Enrolment not open</p>
}

function tabState(programme: HomeProgramme): string {
  if (programme.enrollable) return "Open"
  if (programme.chip?.label) return programme.chip.label
  if (programme.chip?.state === "soon") return "Coming soon"
  if (programme.chip?.state === "development") return "In development"
  return "Listed"
}

function artefactCaption(programme: HomeProgramme): [string, string] {
  switch (programme.artefact) {
    case "northwind":
      return ["Northwind Lab, revenue by category", "Fictional retail extract"]
    case "harbor-desk":
      return ["Problem statement, lesson 7", "Harbor Desk case"]
    case "markup":
      return ["Markup and its preview", "Illustrative"]
    case "workflow":
      return ["A retrieval workflow", "Illustrative"]
    default:
      return ["Catalogue listing", "As returned by the catalogue"]
  }
}

function ProgrammePanel({ programme }: { programme: HomeProgramme }) {
  const [caption, note] = artefactCaption(programme)
  return (
    <article className="hm-prog__panel sky-on-navy" aria-labelledby={`hm-prog-${programme.slug}`}>
      <div className="hm-prog__body">
        <div className="hm-prog__top">
          <span className="sky-label">{programme.kindLabel}</span>
          <Chips programme={programme} />
        </div>
        <h3 id={`hm-prog-${programme.slug}`} className="hm-prog__title">{programme.title}</h3>
        {programme.description ? <p className="hm-prog__text">{programme.description}</p> : null}
        <SpecSheet
          className="hm-prog__spec"
          rows={[
            { label: "Modules", value: programme.modules > 0 ? String(programme.modules) : "" },
            { label: "Format", value: programme.deliveryMode },
            { label: "Level", value: programme.level },
            { label: "Opens", value: programme.opens.length ? `${programme.opens.join(", ")} course` : "" },
          ]}
        />
        <div className="hm-prog__action">
          <PanelAction programme={programme} />
        </div>
      </div>
      <figure className="hm-prog__figure hm-light">
        <div className="hm-prog__art">
          {programme.artefact === "northwind" ? (
            <div className="hm-card hm-card--flush">
              <NorthwindArtefact />
            </div>
          ) : (
            <TileArtefact programme={programme} />
          )}
        </div>
        <figcaption className="hm-prog__caption">
          <span>{caption}</span>
          <span>{note}</span>
        </figcaption>
      </figure>
    </article>
  )
}

function LoadingProgrammes() {
  return (
    <div className="hm-prog" aria-busy="true" aria-label="Loading programmes">
      <div className="hm-prog__rail" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="hm-prog__tab hm-prog__tab--skel">
            <span className="sky-skeleton hm-skel hm-skel--title" />
            <span className="sky-skeleton hm-skel hm-skel--label" />
          </div>
        ))}
      </div>
      <div className="hm-prog__panel hm-prog__panel--loading sky-on-navy" aria-hidden="true">
        <div className="hm-prog__body">
          <span className="hm-skel hm-skel--label" />
          <span className="hm-skel hm-skel--title" />
          <span className="hm-skel" />
          <span className="hm-skel hm-skel--short" />
        </div>
        <div className="hm-prog__figure" />
      </div>
    </div>
  )
}

/** useLivePrograms reports an empty response and a failed one the same way, so the message covers both. */
function UnavailableProgrammes({ retry }: { retry: () => void }) {
  return (
    <div className="hm-unavailable" role="status">
      <div>
        <p className="hm-unavailable__title">Programmes could not be loaded.</p>
        <p className="hm-unavailable__text">The catalogue did not return any programmes, so none are shown here. Try again in a moment.</p>
      </div>
      <button type="button" className="sk-btn sk-btn-secondary" onClick={retry}>
        Try again
      </button>
    </div>
  )
}

function heading(programmes: HomeProgramme[], settled: boolean): [string, string] {
  if (!settled) return ["Programmes", ""]
  const open = programmes.filter((p) => p.enrollable).length
  if (open === 0) return ["Programmes", "in the catalogue."]
  return open === 1 ? ["One programme", "is open today."] : [`${countWord(open)} programmes`, "are open today."]
}

function LoadedProgrammes({ programmes }: { programmes: HomeProgramme[] }) {
  const shown = programmes.slice(0, RAIL_LIMIT)
  const [selectedSlug, setSelectedSlug] = useState(shown[0].slug)
  const selected = shown.find((p) => p.slug === selectedSlug) ?? shown[0]
  return (
    <div className="hm-prog">
      <ul className="hm-prog__rail" aria-label="Programmes in the catalogue">
        {shown.map((programme, i) => (
          <li key={programme.slug}>
            <button
              type="button"
              className="hm-prog__tab"
              aria-pressed={programme.slug === selected.slug}
              onClick={() => setSelectedSlug(programme.slug)}
            >
              <span className="hm-prog__tabn">{String(i + 1).padStart(2, "0")}</span>
              <span className="hm-prog__tabtitle">{programme.title}</span>
              <span className="hm-prog__tabstate">
                {tabState(programme)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <ProgrammePanel key={selected.slug} programme={selected} />
    </div>
  )
}

export function Programmes({
  programmes,
  isLoading,
  isUnavailable,
  retry,
}: {
  programmes: HomeProgramme[]
  isLoading: boolean
  isUnavailable: boolean
  retry: () => void
}) {
  const loaded = !isLoading && !isUnavailable && programmes.length > 0
  const [lead, rest] = heading(programmes, loaded)
  return (
    <section id="programmes" className="hm-programmes" aria-labelledby="hm-programmes-title">
      <div className="sky-container">
        <Reveal className="hm-head">
          <div className="hm-head__main">
            <SectionIndex n="04" label="Programmes" />
            <h2 id="hm-programmes-title" className="sky-display sky-display--md">
              {rest ? (
                <>
                  <em>{lead}</em> {rest}
                </>
              ) : (
                `${lead}.`
              )}
            </h2>
          </div>
          <Action to="/programmes" kind="quiet">All programmes</Action>
        </Reveal>

        <Reveal className="hm-programmes__body" variant="plate" delay={60}>
          {isLoading ? <LoadingProgrammes /> : null}
          {!isLoading && isUnavailable ? <UnavailableProgrammes retry={retry} /> : null}
          {loaded ? <LoadedProgrammes programmes={programmes} /> : null}
        </Reveal>
      </div>
    </section>
  )
}
