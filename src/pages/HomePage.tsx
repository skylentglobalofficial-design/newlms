/**
 * HomePage — the public homepage (Clean Simple v9).
 *
 * Hero → Programmes (Clean 3x2 Grid) → Collapsed 60s SQL Sample → Simple 3-Step Workshops → Inside the Workspace → Degrees → Career OS → Skylent AI → Closing.
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
  HomeInstitutionalArchitecture,
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
        <HomeInstitutionalArchitecture />
        <HomeProgrammes
          programmes={catalog.data ?? []}
          loading={catalogue === "loading"}
          confirmed={catalogue === "confirmed"}
          onRetry={() => void catalog.reload()}
        />
        <ZeroLoginInteractiveTryout />
        <HomeElixirFlywheel />
        <InsideProgramme />
        <HomeDegrees />
        <HomeCareer />
        <HomeAi />
        <HomeClosing />
      </div>
    </PageShell>
  )
}
