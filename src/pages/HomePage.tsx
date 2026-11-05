/**
 * HomePage — the public homepage (Fast 60-FPS Student Conversion Funnel v37).
 *
 * 1. Hero (Clear Promise + Royal Purple Strip)
 * 2. Programmes (6 Career Tracks with Live Fee & Duration)
 * 3. Zero-Login 60-Second SQL & Cold Call Tryout (Instant Proof Before Paywall)
 * 4. ₹99 Live Workshops = 99 Elixir Coins (100% Cashback + Competitor Comparison)
 * 5. Inside the Workspace (Interactive 5-Stage LMS Replica)
 * 6. Career OS & Verified Exemplars (6-Step Journey + 3 Sample Dossiers)
 * 7. Skylent AI & 20-Min Human TA SLA (Hinglish & English Socratic Coach)
 * 8. University Degrees & Institutional Fieldwork Architecture (B2B & Degree Tracks)
 * 9. Closing CTA
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
        <HomeProgrammes
          programmes={catalog.data ?? []}
          loading={catalogue === "loading"}
          confirmed={catalogue === "confirmed"}
          onRetry={() => void catalog.reload()}
        />
        <ZeroLoginInteractiveTryout />
        <HomeElixirFlywheel />
        <InsideProgramme />
        <HomeCareer />
        <HomeAi />
        <HomeDegrees />
        <HomeInstitutionalArchitecture />
        <HomeClosing />
      </div>
    </PageShell>
  )
}
