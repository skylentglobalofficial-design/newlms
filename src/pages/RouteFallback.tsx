import { Suspense, lazy, type ComponentType } from 'react'

export default function RouteFallback() {
  return (
    <div
      className="sk-surface"
      style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)',
        color: '#767E8E',
        fontSize: 14,
      }}
    >
      Loading…
    </div>
  )
}

export function withLazyPage(factory: () => Promise<{ default: ComponentType }>) {
  const Page = lazy(factory)
  return function LazyPage() {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Page />
      </Suspense>
    )
  }
}
