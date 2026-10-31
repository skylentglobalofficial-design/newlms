/** How a public programme list may describe enrolment. */
export const AVAILABILITY_UNKNOWN = "Availability could not be confirmed. Try again shortly."
export const CATALOGUE_CHECKING = "Checking which programmes are open."

export type HomeCataloguePhase = "loading" | "confirmed" | "unknown"

/** Loading wins: `useCatalogPrograms` only sets offline after the request has finished. */
export function homeCataloguePhase(loading: boolean, offline: boolean): HomeCataloguePhase {
  if (loading) return "loading"
  return offline ? "unknown" : "confirmed"
}

export function homepageProgrammeLead(loading: boolean, confirmed: boolean): string {
  if (loading) return CATALOGUE_CHECKING
  if (!confirmed) return AVAILABILITY_UNKNOWN
  return "Open programmes can be started immediately, alongside all 6 self-paced flagship courses and live SQL & case sandboxes."
}

export type PublicCatalogueState = "open" | "closed" | "unknown"

export function publicCatalogueState(confirmed: boolean, open: boolean): PublicCatalogueState {
  if (!confirmed) return "unknown"
  return open ? "open" : "closed"
}

export function publicCatalogueStatus(state: PublicCatalogueState): string {
  if (state === "open") return "Open for enrolment"
  if (state === "closed") return "Not open yet"
  return AVAILABILITY_UNKNOWN
}

export function programmesIndexIntro(confirmed: boolean, openTitles: readonly string[]): string {
  const limit = "Skylent does not award degrees or promise a job."
  if (!confirmed) return `${AVAILABILITY_UNKNOWN} ${limit}`
  if (openTitles.length === 0) return `No programme is open for enrolment. ${limit}`
  const names = openTitles.length === 1
    ? openTitles[0]
    : `${openTitles.slice(0, -1).join(", ")} and ${openTitles[openTitles.length - 1]}`
  const verb = openTitles.length === 1 ? "is" : "are"
  return `${names} ${verb} open to start with interactive labs, graded capstones, and +50 Elixir enrolment rewards.`
}
