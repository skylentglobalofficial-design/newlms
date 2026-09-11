import { PageShell } from '../shared'
import { WORLD_THEME, type WorldId } from '../../skylent-worlds'

export default function WorldFrame({
  world,
  children,
}: {
  world: WorldId
  children: React.ReactNode
}) {
  return (
    <PageShell aurora={false} auroraTheme={WORLD_THEME[world]}>
      <div className={`world-page world-page--${world}`}>{children}</div>
    </PageShell>
  )
}
