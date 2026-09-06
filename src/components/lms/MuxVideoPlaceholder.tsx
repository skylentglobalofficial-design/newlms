import { C, T } from '../../tokens'

/** Deterministic video surface — swap inner slot for Mux player without layout changes. */
export default function MuxVideoPlaceholder({
  title,
  duration,
  watched,
  accent,
  onMarkWatched,
}: {
  title: string
  duration?: string
  watched: boolean
  accent: { primary: string; subtle: string; border: string; text: string }
  onMarkWatched?: () => void
}) {
  return (
    <div>
      <div
        className="lms-media-frame"
        data-mux-ready="true"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: T.rCard,
          aspectRatio: '16/9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${T.lineDark}`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 30% 20%, ${accent.subtle} 0%, transparent 70%)` }} />
        <div style={{ position: 'absolute', top: 12, left: 12, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.06em' }}>
          MUX · READY
        </div>
        <div style={{ position: 'relative', textAlign: 'center', padding: 24, maxWidth: 420 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: accent.subtle, border: `2px solid ${accent.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', cursor: watched ? 'default' : 'pointer',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={accent.primary}><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div style={{ color: C.white, fontSize: 13, fontWeight: 500, marginTop: 14, lineHeight: 1.4 }}>{title}</div>
          {duration && (
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 8, fontFamily: 'var(--font-mono)' }}>{duration}</div>
          )}
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 10, fontFamily: 'var(--font-mono)' }}>
            Video player placeholder · no external stream
          </div>
        </div>
        {watched && (
          <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '4px 10px', borderRadius: T.rPill }}>
            Watched
          </div>
        )}
      </div>
      {!watched && onMarkWatched && (
        <button
          type="button"
          onClick={onMarkWatched}
          style={{
            background: accent.primary, border: 'none', color: C.black,
            padding: '12px 24px', borderRadius: T.rControl, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}
        >
          Mark as watched →
        </button>
      )}
    </div>
  )
}
