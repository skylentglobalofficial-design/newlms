/**
 * HomePage — the public homepage.
 *
 * Hero → How learning works → Programmes → Degrees → Skylent AI → Closing.
 * Navigation and footer come from PageShell. Career OS and institutions stay on their own pages.
 */
import { PageShell } from "@/components/shared"
import { useCatalogPrograms } from "@/hooks/useCatalog"
import {
  HomeAi,
  HomeClosing,
  HomeDegrees,
  HomeHero,
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
        <HomeAi />
        <HomeClosing />
      </div>
    </PageShell>
  )
}
