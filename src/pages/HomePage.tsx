import { PageShell } from "../components/shared"
import PublicHome from "../components/public-home/PublicHome"

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <PublicHome />
    </PageShell>
  )
}
