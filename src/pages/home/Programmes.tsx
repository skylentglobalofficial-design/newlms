/**
 * Featured programmes. The only source is GET /catalog/programs (useLivePrograms in HomePage):
 * loading shows skeletons, an empty or failed response shows one honest message with a retry,
 * and no sample programmes are ever substituted.
 */
import { Action, SectionIndex, SpecSheet, TruthChip } from "@/components/skylent/primitives"
import { NorthwindArtefact, TileArtefact, isIllustrative } from "./artefacts"
import { countWord, type HomeProgramme } from "./programme-model"

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
function TileAction({ programme }: { programme: HomeProgramme }) {
  if (programme.enrollable) {
    return (
      <Action to={`/programmes/${programme.slug}`} kind="quiet">
        View programme<span className="hm-sr">: {programme.title}</span>
      </Action>
    )
  }
  return <p className="hm-tile__closed">Enrolment not open</p>
}

/** The first programme, with its artefact at full size. */
function FeaturedProgramme({ programme }: { programme: HomeProgramme }) {
  const northwind = programme.artefact === "northwind"
  return (
    <article className="hm-feature">
      <div className="hm-feature__mat">
        {northwind ? (
          <>
            <div className="hm-feature__plate">
              <NorthwindArtefact />
            </div>
            <div className="hm-feature__caption">
              <span>FIG. 02 · Northwind Lab, revenue by category</span>
              <span>Fictional retail extract</span>
            </div>
          </>
        ) : (
          <TileArtefact programme={programme} />
        )}
      </div>
      <div className="hm-feature__body">
        <div className="hm-feature__top">
          <span className="sky-label">{programme.kindLabel}</span>
          <Chips programme={programme} />
        </div>
        <h3 className="hm-feature__title">{programme.title}</h3>
        {programme.description ? <p className="hm-feature__text">{programme.description}</p> : null}
        <SpecSheet
          className="hm-feature__spec"
          rows={[
            { label: "Modules", value: programme.modules > 0 ? String(programme.modules) : "" },
            { label: "Format", value: programme.deliveryMode },
            { label: "Level", value: programme.level },
            { label: "Opens", value: programme.opens.length ? `${programme.opens.join(", ")} course` : "" },
          ]}
        />
        <div className="hm-feature__action">
          <TileAction programme={programme} />
        </div>
      </div>
    </article>
  )
}

function ProgrammeTile({ programme }: { programme: HomeProgramme }) {
  return (
    <article className="hm-tile">
      <div className="hm-tile__mat">
        <TileArtefact programme={programme} />
      </div>
      <div className="hm-tile__body">
        <Chips programme={programme} />
        <h3 className="hm-tile__title">{programme.title}</h3>
        {programme.description ? <p className="hm-tile__text">{programme.description}</p> : null}
        {programme.facts.length > 0 ? <p className="hm-tile__facts">{programme.facts.join(" · ")}</p> : null}
        <div className="hm-tile__action">
          <TileAction programme={programme} />
        </div>
      </div>
    </article>
  )
}

function LoadingProgrammes() {
  return (
    <div aria-busy="true" aria-label="Loading programmes">
      <div className="hm-feature hm-feature--loading" aria-hidden="true">
        <div className="hm-feature__mat" />
        <div className="hm-feature__body">
          <span className="sky-skeleton hm-skel hm-skel--label" />
          <span className="sky-skeleton hm-skel hm-skel--title" />
          <span className="sky-skeleton hm-skel" />
          <span className="sky-skeleton hm-skel hm-skel--short" />
        </div>
      </div>
      <div className="hm-tiles" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="hm-tile">
            <div className="hm-tile__mat" />
            <div className="hm-tile__body">
              <span className="sky-skeleton hm-skel hm-skel--label" />
              <span className="sky-skeleton hm-skel hm-skel--title" />
              <span className="sky-skeleton hm-skel" />
            </div>
          </div>
        ))}
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

function heading(programmes: HomeProgramme[], settled: boolean): string {
  if (!settled) return "Programmes."
  const open = programmes.filter((p) => p.enrollable).length
  if (open === 0) return "Programmes in the catalogue."
  return open === 1 ? "One programme is open today." : `${countWord(open)} programmes are open today.`
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
  const [featured, ...rest] = programmes
  return (
    <section id="programmes" className="sky-container hm-section" aria-labelledby="hm-programmes-title">
      <div className="hm-head hm-head--row">
        <div className="hm-head__main hm-head__main--wide">
          <SectionIndex n="03" label="Programmes" />
          <h2 id="hm-programmes-title" className="hm-h2">{heading(programmes, loaded)}</h2>
        </div>
        <Action to="/programmes" kind="quiet">All programmes</Action>
      </div>

      <div className="hm-programmes">
        {isLoading ? <LoadingProgrammes /> : null}
        {!isLoading && isUnavailable ? <UnavailableProgrammes retry={retry} /> : null}
        {loaded ? (
          <>
            <FeaturedProgramme programme={featured} />
            {rest.length > 0 ? (
              <div className="hm-tiles">
                {rest.slice(0, 3).map((programme) => (
                  <ProgrammeTile key={programme.slug} programme={programme} />
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  )
}
