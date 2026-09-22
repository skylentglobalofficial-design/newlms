import { PageShell } from "../components/shared"
import SkylentHeroLearningModel from "../components/home/SkylentHeroLearningModel"
import SkylentHomeGoals from "../components/home/SkylentHomeGoals"
import SkylentHomeEvidence from "../components/home/SkylentHomeEvidence"
import SkylentHomeCatalogue from "../components/home/SkylentHomeCatalogue"
import SkylentHomeCareerOS from "../components/home/SkylentHomeCareerOS"
import SkylentHomeEducation from "../components/home/SkylentHomeEducation"
import SkylentHomeOSArchitecture from "../components/home/SkylentHomeOSArchitecture"
import SkylentHomeFinal from "../components/home/SkylentHomeFinal"
import "./HomePage.css"
import "../components/home/SkylentHomeChapters.css"

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        {/* 01 — What Skylent is */}
        <SkylentHeroLearningModel />

        {/* 02 — Start with a goal */}
        <SkylentHomeGoals />

        {/* 03 — How Skylent works */}
        <SkylentHomeEvidence />

        {/* 04 — Learning ecosystem */}
        <SkylentHomeCatalogue />

        {/* 05 — Career OS */}
        <SkylentHomeCareerOS />

        {/* 06 — Education */}
        <SkylentHomeEducation />

        {/* 07 — The Skylent OS */}
        <SkylentHomeOSArchitecture />

        {/* 08 — Final CTA */}
        <SkylentHomeFinal />
      </div>
    </PageShell>
  )
}
