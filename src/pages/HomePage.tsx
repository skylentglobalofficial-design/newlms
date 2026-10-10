/**
 * HomePage — the public homepage.
 *
 * Section order and surfaces (alternating on purpose):
 *   Hero (navy) → How learning works (white: five stages with product previews) → Programmes (soft:
 *   catalogue cards with each programme's working material) → Degrees (white: UG and PG doors) →
 *   After you enrol (soft: nine-step walkthrough, Learn.tsx) → Career OS walkthrough (navy) →
 *   Skylent AI (white) → Institutions (soft) → Closing (navy).
 * Navigation, footer and the Skylent AI launcher come from PageShell. Institutions is not in the top
 * bar; it is reached from the footer, the search and the partner section here.
 *
 * Data: programmes from GET /catalog/programs (or the published list when the API cannot be
 * reached, see useCatalogPrograms); course facts from the authored Data Analytics course;
 * degrees from lib/degrees (the published sample routes).
 *
 * Styles: HomePage.v2.css (shared hm- plates) and HomeRepolish.css (hx- sections).
 */
import { PageShell } from "@/components/shared"
import { useCatalogPrograms } from "@/hooks/useCatalog"
import { Learn } from "./home/Learn"
import {
  CareerJourney,
  HomeAi,
  HomeClosing,
  HomeDegrees,
  HomeHero,
  HomeInstitutions,
  HomeProgrammes,
  InsideProgramme,
} from "./home/Repolish"
import "./HomePage.v2.css"
import "./HomeRepolish.css"

export default function HomePage() {
  const catalog = useCatalogPrograms()
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page hx-page--home">
        <HomeHero />
        <InsideProgramme />
        <HomeProgrammes programmes={catalog.data ?? []} loading={catalog.loading} confirmed={!catalog.offline} />
        <HomeDegrees />
        <Learn />
        <CareerJourney />
        <HomeAi />
        <HomeInstitutions />
        <HomeClosing />
      </div>
    </PageShell>
  )
}
