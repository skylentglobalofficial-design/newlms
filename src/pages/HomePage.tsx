/**
 * HomePage — the public homepage.
 *
 * Clean, calm, scannable flow:
 * Hero → Programmes (Clean 3x2 Grid) → How Learning Works → Optional 60s Sample → Career OS → Degrees → Weekend Workshops → Skylent AI → Closing.
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
  ZeroLoginInteractiveTryout,
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
        <HomeProgrammes
          programmes={catalog.data ?? []}
          loading={catalogue === "loading"}
          confirmed={catalogue === "confirmed"}
          onRetry={() => void catalog.reload()}
        />
        <InsideProgramme />
        <ZeroLoginInteractiveTryout />
        <HomeCareer />
        <HomeDegrees />
        <HomeElixirFlywheel />
        <HomeAi />
        <HomeClosing />
      </div>
    </PageShell>
  )
}
