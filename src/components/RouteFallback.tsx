import { C } from '../tokens'

export default function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: C.slate,
        fontSize: 14,
        fontFamily: 'var(--font-body)',
      }}
    >
      Loading…
    </div>
  )
}
