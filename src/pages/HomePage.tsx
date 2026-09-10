import { lazy, Suspense } from 'react'
import { PageShell } from '../components/shared'
import SkylentGatewayHero from '../components/home/SkylentGatewayHero'

const LearningEngineStory = lazy(() => import('../components/home/LearningEngineStory'))
const ExperienceWorlds = lazy(() => import('../components/home/ExperienceWorlds'))
const ProductPracticeSurface = lazy(() => import('../components/home/ProductPracticeSurface'))
const LearnersMake = lazy(() => import('../components/home/LearnersMake'))
const CareerOsBridge = lazy(() => import('../components/home/CareerOsBridge'))
const InstitutionsDoorway = lazy(() => import('../components/home/InstitutionsDoorway'))
const FinalGatewayCta = lazy(() => import('../components/home/FinalGatewayCta'))

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <main className="home-redesign">
        <SkylentGatewayHero />
        <Suspense fallback={null}>
          <LearningEngineStory />
          <ExperienceWorlds />
          <ProductPracticeSurface />
          <LearnersMake />
          <CareerOsBridge />
          <InstitutionsDoorway />
          <FinalGatewayCta />
        </Suspense>
      </main>
    </PageShell>
  )
}
