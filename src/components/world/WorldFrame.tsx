import { PageShell } from '../shared'
import { WORLD_THEME, type WorldId } from '../../skylent-worlds'

export type ProductWorld = WorldId | 'home' | 'catalogue'

export default function WorldFrame({
  world,
  children,
}: {
  world: ProductWorld
  children: React.ReactNode
}) {
  const auroraTheme = world === 'home' || world === 'catalogue' ? undefined : WORLD_THEME[world]
  return (
    <PageShell aurora={false} auroraTheme={auroraTheme}>
      <div className="product-shell" data-world={world}>
        {children}
      </div>
    </PageShell>
  )
}
