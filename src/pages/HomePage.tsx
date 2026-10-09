/**
 * HomePage — the public homepage (repolish).
 *
 * Section order:
 *   Hero (navy: statement and three ways in) → How learning works (the learner photo, the lesson
 *   player and its lab result, one scroll down) → Programmes → Degrees (UG / PG, online / campus) →
 *   Student home (navy) → Labs and projects → Career OS walkthrough (navy) → Skylent AI →
 *   Institutions → Closing (navy).
 * Navigation, footer and the Skylent AI launcher come from PageShell. The seven-stage strip,
 * the "What Skylent is" block and the Find My Path block are retired; path discovery happens in
 * Skylent AI.
 *
 * Data: programmes from GET /catalog/programs (or the published list when the API cannot be
 * reached, see useCatalogPrograms); course facts from the authored Data Analytics course;
 * degrees from src/data/education.ts.
 *
 * Styles: HomePage.v2.css (hm- plates reused) and HomeRepolish.css (hx- sections).
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
  HomeLabs,
  HomeProgrammes,
  InsideProgramme,
} from "./home/Repolish"
import "./HomePage.v2.css"
import "./HomeRepolish.css"

export default function HomePage() {
  const catalog = useCatalogPrograms()
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page">
        <HomeHero />
        <InsideProgramme />
        <HomeProgrammes programmes={catalog.data ?? []} loading={catalog.loading} confirmed={!catalog.offline} />
        <HomeDegrees />
        <Learn />
        <HomeLabs />
        <CareerJourney />
        <HomeAi />
        <HomeInstitutions />
        <HomeClosing />
      </div>
    </PageShell>
  )
}
