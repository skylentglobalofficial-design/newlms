/**
 * HomePage — the public homepage.
 *
 * Hero → How learning works → Programmes → Degrees → Career OS → Skylent AI → Closing.
 * Navigation and footer come from PageShell. Career OS and institutions stay on their own pages.
 */
import { PageShell } from "@/components/shared"
import { homeCataloguePhase } from "@/lib/catalogue-availability"
import { useCatalogPrograms } from "@/hooks/useCatalog"
import {
  HomeAi,
  HomeCareer,
  HomeClosing,
  HomeDegrees,
  HomeElixirFlywheel,
  confirmedOpenTitles,
  HomeHero,
  HomeProgrammes,
  InsideProgramme,
} from "./home/Repolish"
import "./HomePage.v2.css"
import "./HomeRepolish.css"

export default function HomePage() {
  const catalog = useCatalogPrograms()
  const catalogue = homeCataloguePhase(catalog.loading, catalog.offline)
  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page hx-page--home">
        <HomeHero
          catalogue={catalogue}
          openTitles={catalogue === "confirmed" ? confirmedOpenTitles(catalog.data ?? []) : []}
        />
        <InsideProgramme />
        <HomeProgrammes
          programmes={catalog.data ?? []}
          loading={catalogue === "loading"}
          confirmed={catalogue === "confirmed"}
          onRetry={() => void catalog.reload()}
        />
        <HomeElixirFlywheel />
        <HomeDegrees />
        <HomeCareer />
        <HomeAi />
        <HomeClosing />
      </div>
    </PageShell>
  )
}
