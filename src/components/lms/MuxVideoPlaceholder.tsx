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
          background: C.soft,
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
        <div style={{ position: 'absolute', top: 12, left: 12, fontSize: 9, fontFamily: 'var(--font-mono)', color: C.muted, letterSpacing: '0.06em' }}>
          VIDEO
        </div>
        <div style={{ position: 'relative', textAlign: 'center', padding: 24, maxWidth: 420 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: C.cobaltTint, border: `1px solid ${C.cobalt}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', cursor: watched ? 'default' : 'pointer',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={C.cobalt}><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div style={{ color: C.ink, fontSize: 13, fontWeight: 500, marginTop: 14, lineHeight: 1.4 }}>{title}</div>
          {duration && (
            <div style={{ color: C.slate, fontSize: 12, marginTop: 8, fontFamily: 'var(--font-mono)' }}>{duration}</div>
          )}
          <div style={{ color: C.muted, fontSize: 10, marginTop: 10, fontFamily: 'var(--font-mono)' }}>
            Video isn’t available yet
          </div>
        </div>
        {watched && (
          <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#FFFFFF', background: C.navy, border: `1px solid ${C.navy}`, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 6 }}>
            Watched
          </div>
        )}
      </div>
      {!watched && onMarkWatched && (
        <button
          type="button"
          onClick={onMarkWatched}
          style={{
            background: C.cobalt, border: 'none', color: C.white,
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
