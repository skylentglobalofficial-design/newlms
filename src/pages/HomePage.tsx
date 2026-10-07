/**
 * HomePage — the public homepage, ported from the approved Skylent v2 design.
 *
 * Section order (frozen):
 *   Hero → Learn · Study · Grow → One path, seven stages → Featured programmes →
 *   Degrees → Career OS → Skylent AI → Find My Path → closing band
 * Navigation, the journey locator and the footer come from PageShell.
 *
 * Data: programmes are read once from GET /catalog/programs (useLivePrograms) and shared
 * by the hero ledger and the programmes section. Degrees are the sample routes in
 * src/data/education.ts. Capability states come from src/lib/truth.ts.
 *
 * Styles: src/pages/HomePage.v2.css (prefix hm-, scoped under .hm-page) on top of the
 * shared sky- primitives in src/skylent-site.css.
 */
import { useMemo } from "react"
import { PageShell } from "@/components/shared"
import { useLivePrograms } from "@/hooks/useLivePrograms"
import { Degrees } from "./home/Degrees"
import { Hero } from "./home/Hero"
import { Journey, Offer } from "./home/Journey"
import { Programmes } from "./home/Programmes"
import { CareerOs, Closing, FindMyPath, SkylentAi } from "./home/Proof"
import { orderForHome } from "./home/programme-model"
import "./HomePage.v2.css"

export default function HomePage() {
  const { programs, isLoading, isUnavailable, retry } = useLivePrograms()
  const programmes = useMemo(() => orderForHome(programs), [programs])

  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page">
        <Hero programmes={programmes} isLoading={isLoading} />
        <Offer />
        <Journey />
        <Programmes programmes={programmes} isLoading={isLoading} isUnavailable={isUnavailable} retry={retry} />
        <Degrees />
        <CareerOs />
        <SkylentAi />
        <FindMyPath />
        <Closing />
      </div>
    </PageShell>
  )
}
