import { PageShell } from '../components/shared'
import SkylentGatewayHero from '../components/home/SkylentGatewayHero'
import LearningEngineStory from '../components/home/LearningEngineStory'
import ExperienceWorlds from '../components/home/ExperienceWorlds'
import ProductPracticeSurface from '../components/home/ProductPracticeSurface'
import LearnersMake from '../components/home/LearnersMake'
import CareerOsBridge from '../components/home/CareerOsBridge'
import InstitutionsDoorway from '../components/home/InstitutionsDoorway'
import FinalGatewayCta from '../components/home/FinalGatewayCta'

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <main className="home-redesign">
        <SkylentGatewayHero />
        <LearningEngineStory />
        <ExperienceWorlds />
        <ProductPracticeSurface />
        <LearnersMake />
        <CareerOsBridge />
        <InstitutionsDoorway />
        <FinalGatewayCta />
      </main>
    </PageShell>
  )
}
