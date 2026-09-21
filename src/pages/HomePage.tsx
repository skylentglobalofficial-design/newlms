import { PageShell } from "../components/shared"
import SkylentHeroLearningModel from "../components/home/SkylentHeroLearningModel"
import SkylentHomeGoals from "../components/home/SkylentHomeGoals"
import SkylentHomeCatalogue from "../components/home/SkylentHomeCatalogue"
import SkylentHomeEvidence from "../components/home/SkylentHomeEvidence"
import SkylentHomeCareerOS from "../components/home/SkylentHomeCareerOS"
import SkylentHomeIdentity from "../components/home/SkylentHomeIdentity"
import SkylentHomeProgrammeDepth from "../components/home/SkylentHomeProgrammeDepth"
import SkylentHomePath from "../components/home/SkylentHomePath"
import SkylentHomeProjects from "../components/home/SkylentHomeProjects"
import SkylentHomeLabs from "../components/home/SkylentHomeLabs"
import SkylentHomeEducation from "../components/home/SkylentHomeEducation"
import SkylentHomeSchool from "../components/home/SkylentHomeSchool"
import SkylentHomeUniversity from "../components/home/SkylentHomeUniversity"
import SkylentHomeExams from "../components/home/SkylentHomeExams"
import SkylentHomeWorkshops from "../components/home/SkylentHomeWorkshops"
import SkylentHomeOSArchitecture from "../components/home/SkylentHomeOSArchitecture"
import SkylentHomeJourney from "../components/home/SkylentHomeJourney"
import SkylentHomeUniverse from "../components/home/SkylentHomeUniverse"
import SkylentHomeStart from "../components/home/SkylentHomeStart"
import SkylentHomeFinal from "../components/home/SkylentHomeFinal"
import "./HomePage.css"
import "../components/home/SkylentHomeChapters.css"

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        <SkylentHeroLearningModel />
        <SkylentHomeGoals />
        <SkylentHomeCatalogue />
        <SkylentHomeEvidence />
        <SkylentHomeCareerOS />
        <SkylentHomeIdentity />
        <SkylentHomeProgrammeDepth />
        <SkylentHomePath />
        <SkylentHomeProjects />
        <SkylentHomeLabs />
        <SkylentHomeEducation />
        <SkylentHomeSchool />
        <SkylentHomeUniversity />
        <SkylentHomeExams />
        <SkylentHomeWorkshops />
        <SkylentHomeOSArchitecture />
        <SkylentHomeJourney />
        <SkylentHomeUniverse />
        <SkylentHomeStart />
        <SkylentHomeFinal />
      </div>
    </PageShell>
  )
}
